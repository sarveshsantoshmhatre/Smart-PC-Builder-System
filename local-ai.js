import { pipeline, env, TextStreamer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "onnx-community/Qwen3-0.6B-Instruct-ONNX";
let generator = null;
let loading = null;
let aiHistory = [];

const get = (id) => document.getElementById(id);

function setStatus(text, connected = false) {
  const status = get("aiStatus");
  status.classList.toggle("connected", connected);
  status.innerHTML = `<i></i> ${text}`;
}

function appendChat(role, message) {
  const log = get("chatLog");
  const item = document.createElement("div");
  item.className = "chat-message " + role;

  const roleLabel = document.createElement("span");
  roleLabel.className = "chat-role";
  roleLabel.textContent = role === "user" ? "YOU" : "LOCAL AI";

  const p = document.createElement("p");
  p.textContent = message;

  item.append(roleLabel, p);
  log.appendChild(item);
  log.scrollTop = log.scrollHeight;
  return p;
}

function builderContext() {
  const b = window.__SMART_PC_BUILDER__?.build;
  if (!b) return "No generated build is available yet.";

  return JSON.stringify({
    requirements: {
      budgetINR: b.budget,
      workload: b.workload,
      resolution: b.resolution,
      cpuPreference: document.getElementById("cpuPreference")?.value || "any",
      ramTargetGB: Number(document.getElementById("ramTarget")?.value || 32),
      storageTargetTB: Number(document.getElementById("storageTarget")?.value || 1)
    },
    build: {
      cpu: b.cpu,
      gpu: b.gpu,
      motherboard: b.motherboard,
      ram: b.ram,
      storage: b.storage,
      psu: b.psu,
      cooler: b.cooler,
      case: b.case,
      totalINR: b.total,
      score: b.score,
      estimatedSystemPowerW: b.estimatedPower
    }
  }, null, 2);
}

function promptFor(question) {
  const history = aiHistory.slice(-4)
    .map(item => `${item.role === "user" ? "User" : "Assistant"}: ${item.text}`)
    .join("\n");

  return `You are the local AI assistant for Smart PC Builder.

Use the supplied builder data as your factual context.

Rules:
- Explain PC component trade-offs clearly for a B.Tech/student audience.
- Respect the stated INR budget.
- Do not claim current retailer prices or availability.
- Do not invent compatibility facts.
- When discussing AI/ML workloads, explicitly consider GPU VRAM, software ecosystem, RAM, storage, and CPU balance.
- For TensorFlow or PyTorch local work, mention that framework support can depend on the GPU/software stack.
- Use short headings or bullets when useful.
- Do not output HTML.
- Keep the answer under 250 words unless the user asks for detail.

BUILDER CONTEXT:
${builderContext()}

RECENT CHAT:
${history || "(none)"}

USER:
${question}`;
}

function progressCallback(progress) {
  const box = get("modelProgress");
  const text = get("modelProgressText");
  const pct = get("modelProgressPct");
  const fill = get("modelProgressFill");
  box.hidden = false;

  if (progress?.status === "progress") {
    const value = Number.isFinite(progress.progress) ? Math.round(progress.progress) : 0;
    text.textContent = progress.file ? `Downloading ${progress.file.split("/").pop()}` : "Downloading model…";
    pct.textContent = value + "%";
    fill.style.width = value + "%";
  } else if (progress?.status === "initiate") {
    text.textContent = "Starting local model download…";
    pct.textContent = "0%";
    fill.style.width = "0%";
  } else if (progress?.status === "done") {
    text.textContent = "Model component ready.";
    pct.textContent = "100%";
    fill.style.width = "100%";
  } else if (progress?.status === "ready") {
    text.textContent = "Local AI ready.";
    pct.textContent = "100%";
    fill.style.width = "100%";
  } else if (progress?.status) {
    text.textContent = String(progress.status).replaceAll("_", " ");
  }
}

async function loadLocalAI() {
  if (generator) return generator;
  if (loading) return loading;

  loading = (async () => {
    get("aiLoadBtn").disabled = true;
    setStatus("Loading model…");
    get("aiLoadBtn").textContent = "Loading…";

    const hasWebGPU = Boolean(navigator.gpu);
    let options = {
      progress_callback: progressCallback,
      dtype: hasWebGPU ? "q4f16" : "q4"
    };

    if (hasWebGPU) {
      options.device = "webgpu";
      try {
        generator = await pipeline("text-generation", MODEL_ID, options);
      } catch (gpuError) {
        setStatus("Trying CPU mode…");
        generator = await pipeline("text-generation", MODEL_ID, {
          progress_callback: progressCallback,
          dtype: "q4"
        });
      }
    } else {
      generator = await pipeline("text-generation", MODEL_ID, options);
    }

    setStatus(hasWebGPU ? "Local AI ready" : "Local AI ready · CPU", true);
    get("aiLoadBtn").textContent = "AI loaded";
    get("aiQuestion").disabled = false;
    get("aiAskBtn").disabled = false;
    get("aiAskBtn").querySelector("span").textContent = "Ask local AI";
    get("modelProgressText").textContent = "Model cached and ready for local inference.";
    get("modelProgressPct").textContent = "Ready";
    get("modelProgressFill").style.width = "100%";
    return generator;
  })().catch(error => {
    generator = null;
    setStatus("Model failed to load");
    get("aiLoadBtn").disabled = false;
    get("aiLoadBtn").textContent = "Retry local AI";
    const msg = error?.message || "Could not initialize the local model.";
    appendChat("assistant", `Local AI could not start: ${msg}`);
    throw error;
  }).finally(() => {
    loading = null;
  });

  return loading;
}

async function askLocalAI(question) {
  const q = String(question || "").trim();
  if (!q) return;

  try {
    await loadLocalAI();
  } catch {
    return;
  }

  appendChat("user", q);
  aiHistory.push({ role: "user", text: q });

  const answerNode = appendChat("assistant", "");
  answerNode.textContent = "Thinking locally…";
  get("aiAskBtn").disabled = true;
  get("aiAskBtn").querySelector("span").textContent = "Thinking…";

  let output = "";
  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      output += text;
      answerNode.textContent = output;
      get("chatLog").scrollTop = get("chatLog").scrollHeight;
    }
  });

  try {
    const messages = [
      {
        role: "system",
        content: "You are a practical PC building assistant. Answer only from the supplied build context and general computer knowledge."
      },
      {
        role: "user",
        content: promptFor(q)
      }
    ];

    const result = await generator(messages, {
      max_new_tokens: 320,
      do_sample: true,
      temperature: 0.35,
      top_p: 0.85,
      streamer
    });

    const finalText = result?.[0]?.generated_text?.at(-1)?.content?.trim() || output.trim();
    answerNode.textContent = finalText || "I could not generate a response.";
    aiHistory.push({ role: "assistant", text: answerNode.textContent });
  } catch (error) {
    answerNode.textContent = `Local generation failed: ${error?.message || "unknown error"}`;
  } finally {
    get("aiAskBtn").disabled = false;
    get("aiAskBtn").querySelector("span").textContent = "Ask local AI";
  }
}

get("aiLoadBtn").addEventListener("click", () => loadLocalAI().catch(() => {}));

get("aiForm").addEventListener("submit", event => {
  event.preventDefault();
  askLocalAI(get("aiQuestion").value);
  get("aiQuestion").value = "";
});

get("aiQuestion").addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    askLocalAI(get("aiQuestion").value);
    get("aiQuestion").value = "";
  }
});

document.querySelectorAll(".ai-quick button").forEach(button => {
  button.addEventListener("click", () => askLocalAI(button.dataset.question));
});

window.addEventListener("spb-build-updated", () => {
  aiHistory = [];
});

window.__LOCAL_AI__ = { load: loadLocalAI, ask: askLocalAI, model: MODEL_ID };
