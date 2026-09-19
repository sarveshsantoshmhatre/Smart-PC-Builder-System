const CATALOG = {
  cpu: [
    { id:"i3-12100", name:"Intel Core i3-12100", brand:"intel", socket:"LGA1700", ramType:"DDR4", cores:4, score:42, value:92, power:60, price:9000 },
    { id:"r5-5600", name:"AMD Ryzen 5 5600", brand:"amd", socket:"AM4", ramType:"DDR4", cores:6, score:52, value:94, power:65, price:10500 },
    { id:"r5-7600", name:"AMD Ryzen 5 7600", brand:"amd", socket:"AM5", ramType:"DDR5", cores:6, score:70, value:91, power:65, price:18500 },
    { id:"i5-14400f", name:"Intel Core i5-14400F", brand:"intel", socket:"LGA1700", ramType:"DDR5", cores:10, score:75, value:88, power:65, price:20000 },
    { id:"r7-9700x", name:"AMD Ryzen 7 9700X", brand:"amd", socket:"AM5", ramType:"DDR5", cores:8, score:88, value:85, power:65, price:34000 },
    { id:"i5-14600kf", name:"Intel Core i5-14600KF", brand:"intel", socket:"LGA1700", ramType:"DDR5", cores:14, score:90, value:82, power:125, price:28000 },
    { id:"r7-7800x3d", name:"AMD Ryzen 7 7800X3D", brand:"amd", socket:"AM5", ramType:"DDR5", cores:8, score:98, value:84, power:120, price:38000 },
    { id:"i7-14700k", name:"Intel Core i7-14700K", brand:"intel", socket:"LGA1700", ramType:"DDR5", cores:20, score:100, value:80, power:253, price:41000 }
  ],
  gpu: [
    { id:"igpu", name:"Integrated graphics", vram:0, score:20, ai:15, length:0, power:0, price:0 },
    { id:"rx-6500-xt", name:"AMD Radeon RX 6500 XT", vram:4, score:35, ai:18, length:190, power:107, price:13000 },
    { id:"rtx-3050", name:"NVIDIA GeForce RTX 3050", vram:8, score:42, ai:40, length:242, power:130, price:18000 },
    { id:"rx-7600", name:"AMD Radeon RX 7600", vram:8, score:58, ai:28, length:204, power:165, price:26000 },
    { id:"rtx-4060", name:"NVIDIA GeForce RTX 4060", vram:8, score:61, ai:58, length:242, power:115, price:29000 },
    { id:"rtx-4060-ti", name:"NVIDIA GeForce RTX 4060 Ti", vram:8, score:72, ai:71, length:242, power:160, price:40000 },
    { id:"rx-7800-xt", name:"AMD Radeon RX 7800 XT", vram:16, score:83, ai:52, length:302, power:263, price:52000 },
    { id:"rtx-4070-super", name:"NVIDIA GeForce RTX 4070 Super", vram:12, score:86, ai:79, length:304, power:220, price:60000 },
    { id:"rtx-4070-ti-super", name:"NVIDIA GeForce RTX 4070 Ti Super", vram:16, score:93, ai:88, length:305, power:285, price:82000 },
    { id:"rtx-4080-super", name:"NVIDIA GeForce RTX 4080 Super", vram:16, score:100, ai:96, length:320, power:320, price:105000 }
  ],
  motherboard: [
    { id:"h610-ddr4", name:"H610M DDR4 motherboard", socket:"LGA1700", ramType:"DDR4", price:7000, quality:55 },
    { id:"b550", name:"B550M Wi-Fi motherboard", socket:"AM4", ramType:"DDR4", price:9500, quality:68 },
    { id:"b760-ddr5", name:"B760M DDR5 motherboard", socket:"LGA1700", ramType:"DDR5", price:15000, quality:80 },
    { id:"b650", name:"B650M Wi-Fi motherboard", socket:"AM5", ramType:"DDR5", price:16000, quality:84 },
    { id:"b650e", name:"B650E Wi-Fi motherboard", socket:"AM5", ramType:"DDR5", price:23000, quality:91 },
    { id:"z790", name:"Z790 DDR5 motherboard", socket:"LGA1700", ramType:"DDR5", price:27000, quality:94 }
  ],
  ram: [
    { id:"16-ddr4", name:"16 GB DDR4 3200", gb:16, type:"DDR4", price:3500, score:55 },
    { id:"32-ddr4", name:"32 GB DDR4 3200", gb:32, type:"DDR4", price:6500, score:68 },
    { id:"16-ddr5", name:"16 GB DDR5 5600", gb:16, type:"DDR5", price:4500, score:65 },
    { id:"32-ddr5", name:"32 GB DDR5 6000", gb:32, type:"DDR5", price:8500, score:82 },
    { id:"64-ddr5", name:"64 GB DDR5 6000", gb:64, type:"DDR5", price:17000, score:95 }
  ],
  storage: [
    { id:"500", name:"500 GB NVMe SSD", tb:.5, price:3500, score:55 },
    { id:"1", name:"1 TB Gen4 NVMe SSD", tb:1, price:6000, score:75 },
    { id:"2", name:"2 TB Gen4 NVMe SSD", tb:2, price:10500, score:88 },
    { id:"4", name:"4 TB Gen4 NVMe SSD", tb:4, price:21000, score:96 }
  ],
  psu: [
    { id:"450", name:"450 W 80+ Bronze PSU", watts:450, price:3500 },
    { id:"550", name:"550 W 80+ Bronze PSU", watts:550, price:4500 },
    { id:"650", name:"650 W 80+ Gold PSU", watts:650, price:6500 },
    { id:"750", name:"750 W 80+ Gold PSU", watts:750, price:8500 },
    { id:"850", name:"850 W 80+ Gold PSU", watts:850, price:11000 },
    { id:"1000", name:"1000 W 80+ Gold PSU", watts:1000, price:15000 }
  ],
  cooler: [
    { id:"stock", name:"Stock / boxed cooler", maxPower:75, price:0 },
    { id:"air", name:"Performance tower air cooler", maxPower:180, price:3500 },
    { id:"aio", name:"240 mm liquid cooler", maxPower:300, price:7000 }
  ],
  case: [
    { id:"compact", name:"Compact airflow mATX case", gpuClearance:280, price:3500 },
    { id:"airflow", name:"High-airflow ATX case", gpuClearance:330, price:6000 },
    { id:"premium", name:"Premium airflow ATX case", gpuClearance:390, price:9000 }
  ]
};

const WORKLOADS = {
  gaming: { label:"Gaming", cpuWeight:.38, gpuWeight:.62, ai:false, preferredRam:16 },
  creator: { label:"Creator", cpuWeight:.48, gpuWeight:.52, ai:false, preferredRam:32 },
  productivity: { label:"Productivity", cpuWeight:.70, gpuWeight:.30, ai:false, preferredRam:16 },
  ai: { label:"AI / ML", cpuWeight:.38, gpuWeight:.62, ai:true, preferredRam:32 }
};

const state = {
  useCase: "gaming",
  build: null
};

const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function budgetValue() {
  return Math.max(35000, Math.min(500000, Number($("budget").value) || 100000));
}

function selectedRamNeed() {
  return Number($("ramTarget").value);
}

function selectedStorageNeed() {
  return Number($("storageTarget").value);
}

function useCase() {
  return WORKLOADS[state.useCase];
}

function chooseRam(cpu, budget) {
  const need = selectedRamNeed();
  const matches = CATALOG.ram.filter(r => r.type === cpu.ramType && r.gb >= need).sort((a,b) => a.price-b.price);
  return matches[0] || CATALOG.ram.find(r => r.type === cpu.ramType);
}

function chooseStorage() {
  const need = selectedStorageNeed();
  return CATALOG.storage.filter(s => s.tb >= need).sort((a,b) => a.price-b.price)[0] || CATALOG.storage[1];
}

function chooseMotherboard(cpu) {
  const boards = CATALOG.motherboard.filter(m => m.socket === cpu.socket && m.ramType === cpu.ramType);
  return boards.sort((a,b) => a.price-b.price)[0];
}

function requiredPsu(cpu, gpu) {
  return Math.max(350, Math.ceil((cpu.power + gpu.power + 160) / 50) * 50);
}

function choosePsu(watts) {
  return CATALOG.psu.find(p => p.watts >= watts) || CATALOG.psu[CATALOG.psu.length - 1];
}

function chooseCooler(cpu) {
  if (cpu.power <= 75) return CATALOG.cooler[0];
  if (cpu.power <= 180) return CATALOG.cooler[1];
  return CATALOG.cooler[2];
}

function chooseCase(gpu) {
  if (gpu.length <= 280) return CATALOG.case[0];
  if (gpu.length <= 330) return CATALOG.case[1];
  return CATALOG.case[2];
}

function supportCost(cpu, gpu) {
  const ram = chooseRam(cpu, budgetValue());
  const storage = chooseStorage();
  const motherboard = chooseMotherboard(cpu);
  const psu = choosePsu(requiredPsu(cpu,gpu));
  const cooler = chooseCooler(cpu);
  const selectedCase = chooseCase(gpu);
  return { ram, storage, motherboard, psu, cooler, case:selectedCase,
    total: [ram,storage,motherboard,psu,cooler,selectedCase].reduce((sum,x)=>sum+x.price,0) };
}

function cpuSuitability(cpu, workload) {
  const brand = $("cpuPreference").value;
  if (brand !== "any" && cpu.brand !== brand) return -1000;
  let score = cpu.score;
  if (workload.label === "Gaming" && cpu.id === "r7-7800x3d") score += 12;
  if (workload.label === "Creator" && cpu.cores >= 12) score += 10;
  if (workload.label === "Productivity" && cpu.value >= 90) score += 9;
  if (workload.label === "AI / ML" && cpu.cores >= 8) score += 8;
  return score * workload.cpuWeight + cpu.value * .08;
}

function gpuSuitability(gpu, workload) {
  let score = gpu.score;
  if (workload.ai) score += gpu.ai * .30;
  if (state.useCase === "gaming") {
    const res = $("resolution").value;
    if (res === "1080p") score += Math.max(0, 82 - gpu.score) * .10;
    if (res === "1440p") score += gpu.score * .08;
    if (res === "4k") score += gpu.score * .18;
  }
  if (state.useCase === "productivity") score = score * .42;
  return score * workload.gpuWeight + (gpu.price === 0 ? 5 : (gpu.score / Math.max(gpu.price,1))*10000);
}

function scorePair(cpu, gpu, budget, workload) {
  const support = supportCost(cpu, gpu);
  const subtotal = cpu.price + gpu.price + support.total;
  if (subtotal > budget) return -Infinity;
  const headroom = Math.max(0, budget - subtotal);
  const spendEfficiency = (cpuSuitability(cpu, workload) + gpuSuitability(gpu, workload)) / Math.max(1, subtotal) * 12000;
  const utilization = Math.min(1, subtotal / Math.max(1,budget));
  const budgetUseBonus = utilization * 15;
  const headroomBonus = headroom > budget*.18 ? 3 : 0;
  return cpuSuitability(cpu,workload) + gpuSuitability(gpu,workload) + spendEfficiency * .45 + budgetUseBonus + headroomBonus;
}

function fallbackBuild(budget) {
  const candidates = [];
  for (const cpu of CATALOG.cpu) {
    for (const gpu of CATALOG.gpu) {
      const support = supportCost(cpu,gpu);
      const total = cpu.price + gpu.price + support.total;
      candidates.push({cpu,gpu,support,total});
    }
  }
  const sorted = candidates.filter(x => x.total <= budget).sort((a,b)=>b.total-a.total);
  if (sorted.length) return sorted[0];
  return candidates.sort((a,b)=>a.total-b.total)[0];
}

function generateBuild() {
  const budget = budgetValue();
  const workload = useCase();
  let best = null;

  for (const cpu of CATALOG.cpu) {
    for (const gpu of CATALOG.gpu) {
      const score = scorePair(cpu,gpu,budget,workload);
      if (!best || score > best.modelScore) {
        const support = supportCost(cpu,gpu);
        best = { cpu, gpu, ...support, total:cpu.price + gpu.price + support.total, modelScore:score };
      }
    }
  }

  if (!best || !Number.isFinite(best.modelScore)) {
    best = fallbackBuild(budget);
  }

  const maxRamForBudget = best.ram;
  const build = {
    ...best,
    budget,
    workload: workload.label,
    resolution: $("resolution").value,
    ram: maxRamForBudget,
    storage: best.storage
  };

  build.estimatedPower = Math.ceil((build.cpu.power + build.gpu.power + 85) / 10) * 10;
  build.score = Math.max(52, Math.min(98, Math.round(
    46 + build.cpu.score * .20 + build.gpu.score * .35 + build.ram.score * .08 + build.motherboard.quality * .06 +
    Math.min(10, Math.max(0, (build.budget - build.total) / build.budget * 18))
  )));
  build.overBudget = build.total > build.budget;

  state.build = build;
  localStorage.setItem("spb:lastBuild", JSON.stringify(build));
  renderBuild(build);
}

function componentCard(type, item, percent) {
  const meta = [];
  if (type === "CPU") meta.push(item.cores + " cores", item.socket);
  if (type === "GPU") meta.push((item.vram ? item.vram + " GB VRAM" : "Integrated"), item.power + " W");
  if (type === "Motherboard") meta.push(item.socket, item.ramType);
  if (type === "RAM") meta.push(item.gb + " GB", item.type);
  if (type === "Storage") meta.push(item.tb + " TB", "NVMe");
  if (type === "PSU") meta.push(item.watts + " W", "80+");
  if (type === "Cooler") meta.push(item.price === 0 ? "Included" : "Up to " + item.maxPower + " W");
  if (type === "Case") meta.push(item.gpuClearance + " mm GPU", "Airflow");

  return `
    <article class="component">
      <div class="component-head"><span class="component-type">${type}</span><span class="component-price">${money(item.price)}</span></div>
      <h4>${item.name}</h4>
      <div class="component-meta">${meta.map(x => "<span>"+x+"</span>").join("")}</div>
      <div class="component-bar"><span style="width:${Math.max(12,Math.min(100,percent))}%"></span></div>
    </article>`;
}

function validation(build) {
  const checks = [];
  const push = (ok,text) => checks.push({ok,text});
  push(build.cpu.socket === build.motherboard.socket, `CPU socket ${build.cpu.socket} matches the motherboard.`);
  push(build.cpu.ramType === build.motherboard.ramType && build.ram.type === build.motherboard.ramType, `${build.ram.type} memory matches the CPU platform and motherboard.`);
  push(build.gpu.length === 0 || build.gpu.length <= build.case.gpuClearance, `GPU clearance is ${build.case.gpuClearance} mm; selected GPU is ${build.gpu.length || "integrated"}.`);
  push(build.psu.watts >= requiredPsu(build.cpu,build.gpu), `PSU provides ${build.psu.watts} W for an estimated system requirement of ${requiredPsu(build.cpu,build.gpu)} W.`);
  push(build.cooler.maxPower >= build.cpu.power, `Cooling capacity covers the CPU's ${build.cpu.power} W power class.`);
  push(build.storage.tb >= selectedStorageNeed(), `Storage target of ${selectedStorageNeed()} TB is covered.`);
  push(build.ram.gb >= selectedRamNeed(), `Memory target of ${selectedRamNeed()} GB is covered.`);
  return checks;
}

function renderBuild(build) {
  $("resultTitle").textContent = `Your ${build.resolution} ${build.workload.toLowerCase()} build`;
  $("heroScore").textContent = build.score;
  $("buildScore").textContent = build.score;
  $("totalCost").textContent = money(build.total);
  const pct = Math.min(100, build.total / build.budget * 100);
  $("budgetFill").style.width = pct + "%";
  $("budgetMeta").textContent = build.overBudget
    ? `${money(build.total - build.budget)} over target — lower the budget or reduce requirements`
    : `${money(build.budget - build.total)} headroom remaining`;

  $("compatBadge").innerHTML = `<span></span> Compatibility checked`;

  const items = [
    ["CPU", build.cpu, build.cpu.score],
    ["GPU", build.gpu, build.gpu.score],
    ["Motherboard", build.motherboard, build.motherboard.quality],
    ["RAM", build.ram, build.ram.score],
    ["Storage", build.storage, build.storage.score],
    ["PSU", build.psu, Math.min(100, build.psu.watts/10)],
    ["Cooler", build.cooler, 80],
    ["Case", build.case, 82]
  ];
  $("components").innerHTML = items.map(x => componentCard(x[0],x[1],x[2])).join("");

  const checks = validation(build);
  $("validationCount").textContent = checks.length + " checks";
  $("validationList").innerHTML = checks.map(c => `
    <div class="validation-row ${c.ok ? "ok" : "warn"}">
      <span class="validation-icon">${c.ok ? "✓" : "!"}</span>
      <p>${c.text}</p>
    </div>`).join("");

  const gpuShare = build.total ? Math.round((build.gpu.price / build.total) * 100) : 0;
  $("whyBuild").textContent = build.gpu.price
    ? `The optimizer puts ${gpuShare}% of spend into graphics for ${build.workload.toLowerCase()}, while keeping the platform balanced around your ${build.cpu.name}.`
    : `The optimizer prioritizes a responsive CPU platform and keeps the build affordable without forcing a discrete GPU.`;
  const headroom = Math.max(0, build.psu.watts - build.estimatedPower);
  $("powerNote").textContent = `${build.estimatedPower} W estimated draw with ${headroom} W PSU capacity above the estimate.`;
  $("savedText").textContent = `${build.workload} · ${build.resolution} · ${money(build.total)} · score ${build.score}/100`;
}

function syncBudget(source) {
  const value = budgetValue();
  $("budget").value = value;
  $("budgetRange").value = value;
  if (source) generateBuild();
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function copyBuild() {
  if (!state.build) return;
  const b = state.build;
  const text = [
    "Smart PC Builder recommendation",
    `Workload: ${b.workload}`,
    `Display: ${b.resolution}`,
    "",
    `CPU: ${b.cpu.name} — ${money(b.cpu.price)}`,
    `GPU: ${b.gpu.name} — ${money(b.gpu.price)}`,
    `Motherboard: ${b.motherboard.name} — ${money(b.motherboard.price)}`,
    `RAM: ${b.ram.name} — ${money(b.ram.price)}`,
    `Storage: ${b.storage.name} — ${money(b.storage.price)}`,
    `PSU: ${b.psu.name} — ${money(b.psu.price)}`,
    `Cooler: ${b.cooler.name} — ${money(b.cooler.price)}`,
    `Case: ${b.case.name} — ${money(b.case.price)}`,
    "",
    `Estimated total: ${money(b.total)}`,
    `Optimization score: ${b.score}/100`
  ].join("\n");

  navigator.clipboard?.writeText(text).then(() => showToast("Build copied to clipboard."), () => showToast("Clipboard access is unavailable in this browser."));
}

$("budget").addEventListener("input", () => syncBudget(false));
$("budget").addEventListener("change", () => syncBudget(true));
$("budgetRange").addEventListener("input", () => {
  $("budget").value = $("budgetRange").value;
  generateBuild();
});
$("buildBtn").addEventListener("click", generateBuild);

document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".choice").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    state.useCase = btn.dataset.use;
    generateBuild();
  });
});

["resolution","cpuPreference","ramTarget","storageTarget"].forEach(id => {
  $(id).addEventListener("change", generateBuild);
});

$("resetBtn").addEventListener("click", () => {
  $("budget").value = 100000;
  $("budgetRange").value = 100000;
  $("resolution").value = "1440p";
  $("cpuPreference").value = "any";
  $("ramTarget").value = "32";
  $("storageTarget").value = "1";
  state.useCase = "gaming";
  document.querySelectorAll(".choice").forEach(x => x.classList.toggle("active", x.dataset.use === "gaming"));
  generateBuild();
  showToast("Builder reset to the default profile.");
});

$("printBtn").addEventListener("click", () => window.print());

$("loadSavedBtn").addEventListener("click", () => {
  const raw = localStorage.getItem("spb:lastBuild");
  if (!raw) return showToast("No saved build found in this browser.");
  try {
    const b = JSON.parse(raw);
    state.build = b;
    $("budget").value = b.budget;
    $("budgetRange").value = b.budget;
    $("resolution").value = b.resolution;
    state.useCase = Object.entries(WORKLOADS).find(([,v])=>v.label===b.workload)?.[0] || "gaming";
    document.querySelectorAll(".choice").forEach(x => x.classList.toggle("active", x.dataset.use === state.useCase));
    renderBuild(b);
    showToast("Saved build loaded.");
  } catch {
    showToast("Saved build data is invalid.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.activeElement?.tagName === "INPUT") generateBuild();
});

generateBuild();


