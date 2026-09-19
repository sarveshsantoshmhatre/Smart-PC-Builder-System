const MAX_QUESTION_CHARS = 3200;
const MAX_CONTEXT_CHARS = 14000;
const MAX_HISTORY_ITEMS = 6;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;

const requestBuckets = new Map();
let freeModelPromise = null;

const OPEN_MODEL_HINTS = /qwen|llama|mistral|deepseek|gemma|phi|hermes/i;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
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

router.get("/health", async () => {
  return {
    ok: true,
    service: "Smart PC Builder AI",
    inference: "cloud"
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
        "X-Content-Type-Options": "nosniff"
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
