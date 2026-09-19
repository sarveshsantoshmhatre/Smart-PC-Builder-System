const get = (id) => document.getElementById(id);
const WORKER_URL = String(window.SMART_PC_PUTER?.workerUrl || "").replace(/\/$/, "");

let cloudReady = false;
let aiHistory = [];

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
  roleLabel.textContent = role === "user" ? "YOU" : "CLOUD AI";

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
  const history = aiHistory.slice(-6)
    .map(item => `${item.role === "user" ? "User" : "Assistant"}: ${item.text}`)
    .join("\n");

  return `You are the AI recommendation assistant for Smart PC Builder.

The website has already generated a deterministic PC build. Treat the supplied builder context as the authoritative source for the selected parts, prices, compatibility results, and requirements.

Rules:
- Explain component trade-offs clearly for a B.Tech/student audience.
- Respect the stated INR budget.
- Do not claim current retailer prices or availability.
- Do not invent compatibility facts.
- For AI/ML workloads, consider GPU VRAM, CUDA/ROCm/software ecosystem, RAM, storage, and CPU balance.
- For TensorFlow or PyTorch local work, explain that framework support depends on the GPU/software stack.
- Distinguish the website's illustrative catalog price from real market pricing.
- Give practical upgrade advice.
- Never expose internal server credentials, implementation secrets, or hidden configuration.
- Use concise headings or bullets when useful.
- Keep the answer under 250 words unless the user asks for more detail.
- Do not output HTML.

BUILDER CONTEXT:
${builderContext()}

RECENT CHAT:
${history || "(none)"}

USER QUESTION:
${question}`;
}

async function checkCloudAI() {
  if (!WORKER_URL) {
    cloudReady = false;
    setStatus("Worker URL missing");
    return false;
  }

  try {
    const response = await fetch(`${WORKER_URL}/health`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    cloudReady = true;
    setStatus("Cloud AI online", true);
        return true;
  } catch (error) {
    cloudReady = false;
    setStatus("Worker not reachable");
        setStatus("Cloud AI unavailable");
    return false;
  }
}

async function askCloudAI(question) {
  const q = String(question || "").trim();
  if (!q) return;

  if (!cloudReady && !(await checkCloudAI())) return;

  appendChat("user", q);
  aiHistory.push({ role: "user", text: q });

  const answerNode = appendChat("assistant", "");
  answerNode.textContent = "Thinking in the cloud…";

  const button = get("aiAskBtn");
  button.disabled = true;
  button.querySelector("span").textContent = "Thinking…";

  try {
    const response = await fetch(`${WORKER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q,
        context: builderContext(),
        history: aiHistory.slice(-6)
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `HTTP ${response.status}`);
    }

    if (!response.body) {
      answerNode.textContent = await response.text();
    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let output = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
        answerNode.textContent = output;
        get("chatLog").scrollTop = get("chatLog").scrollHeight;
      }

      output += decoder.decode();
      answerNode.textContent = output.trim() || "The AI returned an empty response.";
    }

    aiHistory.push({ role: "assistant", text: answerNode.textContent });
  } catch (error) {
    answerNode.textContent = `Cloud AI request failed: ${error?.message || "unknown error"}`;
    cloudReady = false;
    setStatus("Cloud AI error");
  } finally {
    button.disabled = false;
    button.querySelector("span").textContent = "Ask cloud AI";
  }
}

get("aiForm").addEventListener("submit", event => {
  event.preventDefault();
  const value = get("aiQuestion").value;
  get("aiQuestion").value = "";
  askCloudAI(value);
});

get("aiQuestion").addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    const value = get("aiQuestion").value;
    get("aiQuestion").value = "";
    askCloudAI(value);
  }
});


window.addEventListener("spb-build-updated", () => {
  aiHistory = [];
});

window.__CLOUD_AI__ = {
  check: checkCloudAI,
  ask: askCloudAI,
  workerUrl: WORKER_URL
};

checkCloudAI().catch(() => {});
