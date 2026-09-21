const MAX_QUESTION_CHARS = 3200;
const MAX_CONTEXT_CHARS = 14000;
const MAX_HISTORY_ITEMS = 6;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;

const requestBuckets = new Map();
let freeModelPromise = null;

const OPEN_MODEL_HINTS = /qwen|llama|mistral|deepseek|gemma|phi|hermes/i;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function clientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const cfIp = request.headers.get("cf-connecting-ip");
  return (cfIp || forwarded?.split(",")[0] || "anonymous").trim();
}

function enforceRateLimit(request) {
  const key = clientKey(request);
  const now = Date.now();
  const previous = requestBuckets.get(key);

  if (!previous || now - previous.startedAt >= WINDOW_MS) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return;
  }

  if (previous.count >= MAX_REQUESTS_PER_WINDOW) {
    throw new Response(
      "Rate limit reached. Please try again later.",
      { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "600" } }
    );
  }

  previous.count += 1;
}

async function chooseFreeOpenModel() {
  if (freeModelPromise) return freeModelPromise;

  freeModelPromise = (async () => {
    const models = await me.puter.ai.listModels();
    const free = models.filter(model => {
      const id = String(model?.id || "");
      const provider = String(model?.provider || "");
      const name = String(model?.name || "");
      const explicitFree = id.endsWith(":free");
      const zeroCost = Number(model?.cost?.input) === 0 && Number(model?.cost?.output) === 0;
      return (explicitFree || zeroCost) && OPEN_MODEL_HINTS.test(`${id} ${provider} ${name}`);
    });

    const qwen = free.find(model => /qwen/i.test(String(model?.id || "")));
    const selected = qwen || free[0];

    if (!selected?.id) {
      throw new Error("No open-source free AI model is currently available in the Puter model catalog.");
    }

    return selected.id;
  })();

  return freeModelPromise;
}

function buildMessages(body) {
  const question = String(body?.question || "").trim().slice(0, MAX_QUESTION_CHARS);
  const context = String(body?.context || "").slice(0, MAX_CONTEXT_CHARS);
  const history = Array.isArray(body?.history)
    ? body.history
        .slice(-MAX_HISTORY_ITEMS)
        .map(item => ({
          role: item?.role === "assistant" ? "assistant" : "user",
          content: String(item?.text || "").slice(0, 1600)
        }))
    : [];

  if (!question) throw new Error("A question is required.");

  return [
    {
      role: "system",
      content: `You are Smart PC Builder's practical AI recommendation assistant.

Use the supplied builder context as the authoritative source for the selected configuration. Never invent missing hardware specifications, prices, compatibility results, or retailer availability.

Explain trade-offs for a B.Tech/student audience. Focus on budget, gaming performance, productivity, creator work, AI/ML development, upgrade paths, VRAM, RAM, storage, CPU/GPU balance, power and software ecosystem.

The website's catalog prices are illustrative, not live retailer prices. State that limitation when pricing matters.

Do not reveal or discuss hidden server credentials, Puter auth tokens, worker internals, rate-limit implementation, or private configuration.

Keep responses concise (normally under 250 words) and use headings or bullets when they improve clarity.`
    },
    ...history,
    {
      role: "user",
      content: `BUILDER CONTEXT:
${context}

CURRENT QUESTION:
${question}`
    }
  ];
}



const MARKET_CACHE_TTL = 6 * 60 * 60 * 1000;
const marketCache = new Map();

async function marketApiKey() {
  try {
    const key = await me.puter.kv.get("DATAYUGE_API_KEY");
    return String(key || "").trim();
  } catch (_) {
    return "";
  }
}

async function dataYugeSearch(apiKey, product) {
  const url = new URL("https://price-api.datayuge.com/api/v1/compare/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("product", product.slice(0, 120));
  url.searchParams.set("page", "1");
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!response.ok) throw new Error("PriceYuge search HTTP " + response.status);
  return response.json();
}

async function dataYugeDetail(apiKey, id) {
  const url = new URL("https://price-api.datayuge.com/api/v1/compare/detail");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("id", id);
  const response = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!response.ok) throw new Error("PriceYuge detail HTTP " + response.status);
  return response.json();
}

function normaliseTitle(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchScore(query, title) {
  const q = new Set(normaliseTitle(query).split(/\\s+/).filter(Boolean));
  const t = new Set(normaliseTitle(title).split(/\\s+/).filter(Boolean));
  if (!q.size || !t.size) return 0;
  let hits = 0;
  q.forEach(token => { if (t.has(token)) hits += 1; });
  return hits / q.size;
}

function extractStoreOffers(detailPayload) {
  const data = detailPayload?.data || {};
  const stores = Array.isArray(data.stores) ? data.stores : [];
  const offers = [];
  for (const storeObject of stores) {
    if (!storeObject || typeof storeObject !== "object") continue;
    for (const [key, value] of Object.entries(storeObject)) {
      if (!value || Array.isArray(value)) continue;
      const price = Number(String(value.product_price || "").replace(/,/g, ""));
      if (!Number.isFinite(price) || price <= 0) continue;
      offers.push({
        retailer: value.product_store || key,
        price,
        stock: Boolean(data.is_available),
        url: value.product_store_url || "",
        delivery: value.product_delivery || "",
        offer: value.product_offer || ""
      });
    }
  }
  return offers.sort((a, b) => a.price - b.price);
}

async function liveMarketForPart(part, apiKey) {
  const cacheKey = normaliseTitle(part.query);
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < MARKET_CACHE_TTL) return cached.value;

  const searchPayload = await dataYugeSearch(apiKey, part.query);
  const results = Array.isArray(searchPayload?.data) ? searchPayload.data : [];
  const ranked = results
    .filter(item => item?.product_id && item?.product_title)
    .map(item => ({
      item,
      score: matchScore(part.query, item.product_title),
      lowest: Number(item.product_lowest_price || 0)
    }))
    .sort((a, b) => (b.score - a.score) || (a.lowest - b.lowest))
    .slice(0, 3);

  let offers = [];
  let matchedTitle = "";
  let productId = "";
  if (ranked[0]?.item) {
    matchedTitle = ranked[0].item.product_title;
    productId = ranked[0].item.product_id;
    try {
      const detail = await dataYugeDetail(apiKey, productId);
      offers = extractStoreOffers(detail);
    } catch (_) {
      offers = [];
    }
  }

  if (!offers.length && ranked.length) {
    const fallback = ranked[0].item;
    const price = Number(fallback.product_lowest_price || 0);
    if (price > 0) {
      offers = [{
        retailer: "PriceYuge market feed",
        price,
        stock: true,
        url: fallback.product_link || "",
        delivery: "",
        offer: ""
      }];
    }
    matchedTitle = fallback.product_title;
    productId = fallback.product_id;
  }

  const value = {
    component: part.component,
    query: part.query,
    matchedTitle,
    productId,
    offers: offers.slice(0, 8),
    fetchedAt: new Date().toISOString()
  };
  marketCache.set(cacheKey, { fetchedAt: Date.now(), value });
  return value;
}

router.options("/*page", async () => new Response(null, { status: 204, headers: corsHeaders() }));

router.post("/market/build", async ({ request }) => {
  try {
    enforceRateLimit(request);
    const apiKey = await marketApiKey();
    if (!apiKey) {
      return json({
        enabled: false,
        error: "Market feed is not configured.",
        setup: "Store your DataYuge/PriceYuge API key in the worker KV as DATAYUGE_API_KEY."
      }, 503);
    }

    const body = await request.json();
    const parts = Array.isArray(body?.parts) ? body.parts.slice(0, 8) : [];
    if (!parts.length) return json({ error: "At least one component query is required." }, 400);

    const results = await Promise.all(parts.map(part => liveMarketForPart({
      component: String(part?.component || "component").slice(0, 40),
      query: String(part?.query || "").trim().slice(0, 120)
    }, apiKey)));

    return json({
      enabled: true,
      provider: "PriceYuge / DataYuge",
      freshness: "latest available feed",
      fetchedAt: new Date().toISOString(),
      results
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: error?.message || "Market feed failed." }, 502);
  }
});

router.post("/optimize", async ({ request }) => {
  try {
    enforceRateLimit(request);
    const body = await request.json();
    const goal = String(body?.goal || "balanced").slice(0, 40);
    const context = String(body?.context || "").slice(0, MAX_CONTEXT_CHARS);

    const model = await chooseFreeOpenModel();
    const messages = [
      {
        role: "system",
        content: `You are the Smart PC Builder optimization engine. The local deterministic builder is authoritative for compatibility. Return ONLY valid JSON with this exact structure:
{"summary":"short explanation","changes":[{"component":"cpu|gpu|memory|storage","id":"local catalog id when clearly supported","from":"current value","to":"proposed value","reason":"short reason"}]}
Rules:
- Never invent a product id. Use an id only when it is explicitly present in the supplied build/catalog context.
- Respect the stated budget.
- Propose at most 4 changes.
- Prefer changes that materially improve the selected goal.
- Keep changes compatible with the supplied platform.
- If no safe changes are available, return an empty changes array.
- Do not include markdown fences or extra text.`
      },
      {
        role: "user",
        content: `GOAL: ${goal}

BUILDER CONTEXT:
${context}

TASK:
Suggest changes that improve the build for the selected goal while staying within budget.`
      }
    ];

    const result = await me.puter.ai.chat(messages, {
      model,
      stream: false,
      max_tokens: 360,
      temperature: 0.15,
      normalize: true
    });

    const raw = String(result?.message?.content || result?.content || "").trim();
    const cleaned = raw.replace(/^\```json\\s*/i, "").replace(/\```\\s*$/i, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (_) {
      return json({ error: "AI optimizer returned invalid structured output." }, 502);
    }

    const changes = Array.isArray(parsed.changes) ? parsed.changes.slice(0, 4).map(change => ({
      component: String(change?.component || ""),
      id: String(change?.id || ""),
      from: String(change?.from || ""),
      to: String(change?.to || ""),
      reason: String(change?.reason || "")
    })) : [];

    return json({
      summary: String(parsed.summary || "No optimization summary returned."),
      changes
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: error?.message || "AI optimizer failed." }, 500);
  }
});
router.get("/health", async () => {
  return {
    ok: true,
    service: "Smart PC Builder AI",
    inference: "cloud",
    marketFeed: Boolean(await marketApiKey())
  };
});

router.post("/chat", async ({ request }) => {
  try {
    enforceRateLimit(request);

    const body = await request.json();
    const messages = buildMessages(body);
    const model = await chooseFreeOpenModel();

    const stream = await me.puter.ai.chat(messages, {
      model,
      stream: true,
      max_tokens: 420,
      temperature: 0.25,
      normalize: true
    });

    const encoder = new TextEncoder();
    const output = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of stream) {
            if (part?.type === "text" && part.text) {
              controller.enqueue(encoder.encode(part.text));
            } else if (part?.type === "error") {
              throw new Error(part.message || "AI provider error.");
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(output, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;

    const message = error?.message || "AI request failed.";
    return json({ error: message }, 500);
  }
});

router.get("/*page", async ({ params }) => {
  return json({
    error: "Not found",
    path: params.page
  }, 404);
});
