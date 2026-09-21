(function () {
  "use strict";

  const get = (id) => document.getElementById(id);
  const money = (value) => "₹" + Math.round(Number(value) || 0).toLocaleString("en-IN");
  const escapeHtml = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  let marketTimer = null;
  let marketBusy = false;

  function builder() {
    return window.__SMART_PC_BUILDER__ || {};
  }

  function createToolsSection() {
    if (get("decisionTools")) return;
    const section = document.createElement("section");
    section.className = "panel decision-tools-section";
    section.id = "decisionTools";
    section.innerHTML = `
      <div class="section-header compact-head">
        <div>
          <span class="section-kicker">08 · DECISION TOOLS</span>
          <h2>Validate, compare and plan the next move</h2>
          <p>Use live market data where available, test component changes, inspect bottlenecks, and compare alternative configurations.</p>
        </div>
        <button class="ghost-btn" id="refreshToolsBtn" type="button">Refresh tools</button>
      </div>

      <div class="tools-grid">
        <article class="tool-card market-tool" id="marketTool">
          <div class="tool-card-head">
            <div><span class="section-kicker">LIVE MARKET</span><h3>Current component pricing</h3></div>
            <span class="live-pill" id="marketStatus">Checking feed</span>
          </div>
          <div class="market-summary">
            <div><span>Live matched total</span><strong id="liveTotal">—</strong></div>
            <div><span>Coverage</span><strong id="marketCoverage">—</strong></div>
          </div>
          <div id="marketOffers" class="market-offers"></div>
          <p class="tool-note" id="marketNote">The market feed is separate from the recommendation model and includes a retrieval timestamp.</p>
        </article>

        <article class="tool-card replacement-tool">
          <div class="tool-card-head">
            <div><span class="section-kicker">COMPONENT LAB</span><h3>Replace one component</h3></div>
            <span class="tool-kicker">Validated</span>
          </div>
          <div class="tool-form">
            <label for="replaceType">Component</label>
            <select id="replaceType">
              <option value="cpu">CPU</option>
              <option value="gpu">GPU</option>
              <option value="ram">Memory</option>
              <option value="storage">Storage</option>
            </select>
            <label for="replaceTarget">Replacement</label>
            <select id="replaceTarget"></select>
          </div>
          <div class="replace-preview" id="replacePreview"></div>
          <button class="primary-btn full" id="applyReplacementBtn" type="button">Apply replacement</button>
          <button class="ghost-btn full" id="clearReplacementBtn" type="button">Clear component overrides</button>
        </article>

        <article class="tool-card performance-tool">
          <div class="tool-card-head">
            <div><span class="section-kicker">BOTTLENECK</span><h3>Workload pressure</h3></div>
            <span class="tool-kicker">Model signal</span>
          </div>
          <div id="bottleneckList" class="pressure-list"></div>
          <div class="bottleneck-copy" id="bottleneckCopy"></div>
        </article>

        <article class="tool-card upgrade-tool">
          <div class="tool-card-head">
            <div><span class="section-kicker">UPGRADE SIMULATOR</span><h3>Test a future upgrade</h3></div>
            <span class="tool-kicker">No changes until applied</span>
          </div>
          <div class="tool-form">
            <label for="upgradeType">Target</label>
            <select id="upgradeType">
              <option value="gpu">GPU</option>
              <option value="cpu">CPU</option>
              <option value="ram">Memory</option>
              <option value="storage">Storage</option>
            </select>
            <label for="upgradeTarget">Upgrade to</label>
            <select id="upgradeTarget"></select>
          </div>
          <div class="upgrade-sim" id="upgradeSim"></div>
          <button class="ghost-btn full" id="applyUpgradeBtn" type="button">Apply simulated upgrade</button>
        </article>
      </div>

      <article class="tool-card compare-tool">
        <div class="tool-card-head">
          <div><span class="section-kicker">BUILD COMPARISON</span><h3>Current build vs alternative</h3></div>
          <div class="compare-actions">
            <button class="viewer-tool active" type="button" data-compare-mode="balanced">Balanced</button>
            <button class="viewer-tool" type="button" data-compare-mode="gpu">GPU-first</button>
            <button class="viewer-tool" type="button" data-compare-mode="cpu">CPU-first</button>
          </div>
        </div>
        <div class="compare-table-wrap"><div id="buildCompare"></div></div>
      </article>

      <article class="tool-card ai-optimizer-tool">
        <div class="tool-card-head">
          <div><span class="section-kicker">AI OPTIMIZER</span><h3>Ask the cloud AI to redesign the build</h3></div>
          <span class="tool-kicker">Uses current builder context</span>
        </div>
        <div class="ai-optimize-row">
          <select id="aiOptimizationGoal" aria-label="AI optimization goal">
            <option value="balanced">Improve overall balance</option>
            <option value="gaming">Prioritize gaming</option>
            <option value="creator">Prioritize creator workloads</option>
            <option value="ai">Prioritize AI / ML</option>
            <option value="productivity">Prioritize development/productivity</option>
          </select>
          <button class="primary-btn" id="aiOptimizeBtn" type="button">Optimize with AI</button>
        </div>
        <div id="aiOptimizeResult" class="ai-optimize-result">The AI optimizer will propose changes. Your compatibility engine remains the final validator.</div>
      </article>
    </section>`;
    const alternatives = get("alternatives");
    if (alternatives) alternatives.parentNode.insertBefore(section, alternatives);
    else document.querySelector("main")?.appendChild(section);
  }

  function currentBuild() {
    return builder().build || null;
  }

  function componentOptions(type) {
    const cat = builder().catalog || {};
    return Array.isArray(cat[type]) ? cat[type] : [];
  }

  function replacementOptions(type, build) {
    const items = componentOptions(type);
    if (!items.length || !build) return [];
    if (type === "cpu") return items.filter(x => x.id !== build.cpu.id);
    if (type === "gpu") return items.filter(x => x.id !== build.gpu.id);
    if (type === "ram") return items.filter(x => x.id !== build.ram.id && x.type === build.cpu.ramType && x.gb >= Number(get("ramTarget")?.value || 1));
    if (type === "storage") return items.filter(x => x.id !== build.storage.id && x.tb >= Number(get("storageTarget")?.value || 1));
    return items;
  }

  function populateReplacementTarget() {
    const type = get("replaceType")?.value || "cpu";
    const build = currentBuild();
    const select = get("replaceTarget");
    if (!select || !build) return;
    const items = replacementOptions(type, build);
    select.innerHTML = items.length
      ? items.map(item => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${money(item.price)}</option>`).join("")
      : '<option value="">No compatible alternatives in local catalog</option>';
    renderReplacementPreview();
  }

  function renderReplacementPreview() {
    const type = get("replaceType")?.value;
    const id = get("replaceTarget")?.value;
    const build = currentBuild();
    const target = componentOptions(type || "cpu").find(item => item.id === id);
    const host = get("replacePreview");
    if (!host || !build || !target) {
      if (host) host.innerHTML = "<span>Select another option to preview the change.</span>";
      return;
    }
    const current = build[type];
    const delta = Number(target.price || 0) - Number(current.price || 0);
    let compatibility = "Ready for validation";
    if (type === "cpu") compatibility = builder().catalog.motherboard.some(m => m.socket === target.socket && m.ramType === target.ramType) ? "Platform available" : "No matching motherboard";
    if (type === "ram") compatibility = target.type === build.motherboard.ramType ? "Memory type matches" : "Memory type mismatch";
    if (type === "storage") compatibility = target.tb >= Number(get("storageTarget")?.value || 1) ? "Storage target met" : "Below requested capacity";
    if (type === "gpu") compatibility = !target.length || target.length <= build.case.gpuClearance ? "Case clearance passes" : "Case clearance warning";
    host.innerHTML = `
      <div><span>Current</span><strong>${escapeHtml(current.name)}</strong></div>
      <div><span>Change</span><strong>${delta >= 0 ? "+" : ""}${money(delta)}</strong></div>
      <div><span>Check</span><strong>${escapeHtml(compatibility)}</strong></div>`;
  }

  function applyReplacement(type, id) {
    const api = builder();
    if (!api.state || !api.catalog || !id) return;
    const target = componentOptions(type).find(item => item.id === id);
    if (!target) return;
    api.state.manual = api.state.manual || {};
    api.state.manual[type === "ram" ? "ramId" : type === "storage" ? "storageId" : type === "cpu" ? "cpuId" : "gpuId"] = id;
    api.generateBuild();
    if (typeof window.showToast === "function") window.showToast(escapeHtml(target.name) + " applied.");
  }

  function clearOverrides() {
    const api = builder();
    if (!api.state) return;
    api.state.manual = { cpuId: null, gpuId: null, ramId: null, storageId: null };
    api.generateBuild();
    if (typeof window.showToast === "function") window.showToast("Component overrides cleared.");
  }

  function renderBottleneck() {
    const build = currentBuild(), list = get("bottleneckList"), copy = get("bottleneckCopy");
    if (!build || !list || !copy) return;
    const workload = String(build.workload || "").toLowerCase();
    const cpuFit = Math.max(1, Math.min(99, Math.round(builder().catalog.cpu.find(x => x.id === build.cpu.id)?.score || build.cpu.score || 50)));
    const gpuFit = Math.max(1, Math.min(99, Math.round(builder().catalog.gpu.find(x => x.id === build.gpu.id)?.score || build.gpu.score || 50)));
    const ramFit = Math.max(1, Math.min(99, Math.round((build.ram.score || 50))));
    const storageFit = Math.max(1, Math.min(99, Math.round((build.storage.score || 50))));
    const pressure = [
      ["CPU", 100 - cpuFit, workload.includes("productivity") || workload.includes("creator") ? 1.25 : .8],
      ["GPU", 100 - gpuFit, workload.includes("gaming") || workload.includes("ai") ? 1.3 : .8],
      ["RAM", 100 - ramFit, build.ram.gb < 32 ? 1.15 : .6],
      ["Storage", 100 - storageFit, build.storage.tb < 1 ? 1.05 : .45]
    ].map(x => [x[0], Math.round(Math.min(99, x[1] * x[2]))]).sort((a,b) => b[1] - a[1]);
    list.innerHTML = pressure.map(([name,value]) => `
      <div class="pressure-row"><div><span>${name}</span><div class="pressure-bar"><i style="width:${value}%"></i></div></div><strong>${value}%</strong></div>`).join("");
    const primary = pressure[0];
    copy.innerHTML = primary[1] >= 55
      ? `<strong>${escapeHtml(primary[0])} is the main pressure signal.</strong><p>Consider an upgrade only when your target workload is actually constrained; validate the replacement before applying it.</p>`
      : `<strong>No severe bottleneck signal.</strong><p>The current configuration is reasonably balanced for the selected workload.</p>`;
  }

  function getUpgradeOptions(type) {
    const build = currentBuild();
    if (!build) return [];
    const cat = builder().catalog || {};
    if (type === "gpu") return (cat.gpu || []).filter(x => x.score > build.gpu.score && (!x.length || x.length <= build.case.gpuClearance));
    if (type === "cpu") return (cat.cpu || []).filter(x => x.score > build.cpu.score);
    if (type === "ram") return (cat.ram || []).filter(x => x.gb > build.ram.gb && x.type === build.ram.type);
    return (cat.storage || []).filter(x => x.tb > build.storage.tb);
  }

  function populateUpgradeTarget() {
    const type = get("upgradeType")?.value || "gpu";
    const select = get("upgradeTarget"), build = currentBuild();
    if (!select || !build) return;
    const items = getUpgradeOptions(type);
    select.innerHTML = items.length
      ? items.map(x => `<option value="${escapeHtml(x.id)}">${escapeHtml(x.name)} · ${money(x.price)}</option>`).join("")
      : '<option value="">No higher option available</option>';
    renderUpgradeSim();
  }

  function renderUpgradeSim() {
    const type = get("upgradeType")?.value, id = get("upgradeTarget")?.value, host = get("upgradeSim"), build = currentBuild();
    if (!host || !build) return;
    const target = componentOptions(type || "gpu").find(x => x.id === id);
    if (!target) { host.innerHTML = "<span>Choose an upgrade target.</span>"; return; }
    const current = build[type];
    const scoreDelta = Number(target.score || 0) - Number(current.score || 0);
    const powerDelta = Number(target.power || 0) - Number(current.power || 0);
    const priceDelta = Number(target.price || 0) - Number(current.price || 0);
    const sim = Object.assign({}, build, { [type]: target });
    if (type === "gpu") sim.case = (builder().catalog.case || []).find(c => c.gpuClearance >= (target.length || 0)) || build.case;
    const checks = builder().validation ? builder().validation(sim) : [];
    const failed = checks.filter(x => !x.ok);
    host.innerHTML = `
      <div class="sim-grid">
        <div><span>Performance delta</span><strong>${scoreDelta >= 0 ? "+" : ""}${scoreDelta} pts</strong></div>
        <div><span>Price delta</span><strong>${priceDelta >= 0 ? "+" : ""}${money(priceDelta)}</strong></div>
        <div><span>Power delta</span><strong>${powerDelta >= 0 ? "+" : ""}${powerDelta} W</strong></div>
        <div><span>Validation</span><strong>${failed.length ? failed.length + " warning(s)" : "Passes current checks"}</strong></div>
      </div>
      ${failed.length ? '<p class="warning-copy">' + failed.map(x => escapeHtml(x.text)).join("<br>") + "</p>" : ""}`;
  }

  function applyUpgrade() {
    const type = get("upgradeType")?.value, id = get("upgradeTarget")?.value;
    if (!id) return;
    applyReplacement(type, id);
  }

  function renderComparison() {
    const build = currentBuild(), api = builder(), host = get("buildCompare");
    if (!build || !api.buildForMode || !host) return;
    const mode = document.querySelector(".compare-actions .active")?.dataset.compareMode || "balanced";
    const candidate = api.buildForMode(mode === "gpu" ? "gpu" : mode === "cpu" ? "cpu" : "balanced");
    const rows = [
      ["CPU", build.cpu.name, candidate.cpu.name],
      ["GPU", build.gpu.name, candidate.gpu.name],
      ["RAM", build.ram.name, candidate.ram.name],
      ["Storage", build.storage.name, candidate.support ? candidate.support.storage.name : build.storage.name],
      ["Estimated cost", money(build.total), money(candidate.total)],
      ["Target workload", build.workload, build.workload],
      ["Display target", build.resolution, build.resolution]
    ];
    host.innerHTML = `
      <table class="compare-table"><thead><tr><th>Metric</th><th>Current</th><th>Alternative</th></tr></thead>
      <tbody>${rows.map(r => `<tr><th>${escapeHtml(r[0])}</th><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`).join("")}</tbody></table>`;
  }

  async function refreshMarket() {
    const build = currentBuild();
    const status = get("marketStatus"), offers = get("marketOffers"), note = get("marketNote");
    if (!build || !status || !offers || marketBusy) return;
    const worker = String(window.SMART_PC_PUTER?.workerUrl || "").replace(/\/$/, "");
    if (!worker) {
      status.textContent = "No market worker";
      note.textContent = "Add a market-data provider in the server worker to enable live pricing.";
      return;
    }
    marketBusy = true;
    status.textContent = "Refreshing";
    try {
      const parts = ["cpu","gpu","motherboard","ram","storage","psu","cooler","case"].map(type => ({
        component: type,
        query: build[type]?.name || type
      }));
      const response = await fetch(worker + "/market/build", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({parts})
      });
      if (!response.ok) throw new Error("Market feed returned HTTP " + response.status);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];
      const matched = results.filter(x => Array.isArray(x.offers) && x.offers.length);
      const liveTotal = matched.reduce((sum, item) => sum + Math.min(...item.offers.map(o => Number(o.price) || Infinity)), 0);
      get("liveTotal").textContent = Number.isFinite(liveTotal) && liveTotal ? money(liveTotal) : "—";
      get("marketCoverage").textContent = matched.length + " / " + parts.length;
      offers.innerHTML = matched.length ? matched.map(item => {
        const sorted = item.offers.slice().sort((a,b) => Number(a.price) - Number(b.price)).slice(0,3);
        return `<div class="market-offer-group"><div class="market-offer-title"><strong>${escapeHtml(item.component)}</strong><span>${sorted.length} offers</span></div>${sorted.map(o => `<a class="market-offer" href="${escapeHtml(o.url || "#")}" target="_blank" rel="noopener"><span><strong>${escapeHtml(o.retailer || "Retailer")}</strong><small>${escapeHtml(o.title || "")}</small></span><strong>${money(o.price)}</strong></a>`).join("")}</div>`;
      }).join("") : '<div class="empty-state">No live matches were returned yet.</div>';
      const fetched = data.fetchedAt ? new Date(data.fetchedAt) : new Date();
      status.textContent = data.provider || "Latest market feed";
      note.textContent = "Last checked " + fetched.toLocaleString() + ". Prices and stock can change after retrieval.";
    } catch (error) {
      status.textContent = "Unavailable";
      offers.innerHTML = '<div class="empty-state">Live pricing could not be loaded. The builder remains usable.</div>';
      note.textContent = error?.message || "Market feed unavailable.";
    } finally {
      marketBusy = false;
    }
  }

  async function optimizeWithAI() {
    const output = get("aiOptimizeResult"), button = get("aiOptimizeBtn"), build = currentBuild();
    const worker = String(window.SMART_PC_PUTER?.workerUrl || "").replace(/\/$/, "");
    if (!build || !worker || !output || !button) return;
    const goal = get("aiOptimizationGoal")?.value || "balanced";
    button.disabled = true;
    button.textContent = "Optimizing…";
    output.innerHTML = "Analyzing the current build against your selected goal…";
    try {
      const response = await fetch(worker + "/optimize", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          goal,
          question: "Suggest a better build while staying within the stated budget. Prefer changes supported by the local catalog.",
          context: JSON.stringify({build, requirements:{budget:build.budget, workload:build.workload, resolution:build.resolution}})
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "AI optimizer failed.");
      const changes = Array.isArray(data.changes) ? data.changes : [];
      output.innerHTML = `
        <strong>${escapeHtml(data.summary || "AI optimization proposal")}</strong>
        ${changes.length ? '<div class="ai-change-list">' + changes.map(change => `<div><span>${escapeHtml(change.component || "Component")}</span><strong>${escapeHtml(change.from || "Current")} → ${escapeHtml(change.to || "Proposed")}</strong><small>${escapeHtml(change.reason || "")}</small></div>`).join("") + "</div>" : "<p>No structured component changes were returned.</p>"}
        ${changes.length ? '<button class="ghost-btn" id="applyAIChangesBtn" type="button">Apply supported AI changes</button>' : ""}`;
      get("applyAIChangesBtn")?.addEventListener("click", () => applyAIChanges(changes));
    } catch (error) {
      output.innerHTML = "<strong>AI optimizer unavailable.</strong><p>" + escapeHtml(error?.message || "Try again after checking the cloud worker.") + "</p>";
    } finally {
      button.disabled = false;
      button.textContent = "Optimize with AI";
    }
  }

  function applyAIChanges(changes) {
    const api = builder();
    const manual = api.state?.manual || {};
    let applied = 0;
    changes.forEach(change => {
      const type = String(change.component || "").toLowerCase();
      const catalogType = type === "memory" ? "ram" : type === "ssd" ? "storage" : type;
      const pool = componentOptions(catalogType);
      const id = change.id || (pool.find(x => String(x.name).toLowerCase() === String(change.to || "").toLowerCase())?.id);
      if (["cpu","gpu","ram","storage"].includes(catalogType) && id) {
        manual[catalogType === "ram" ? "ramId" : catalogType === "storage" ? "storageId" : catalogType + "Id"] = id;
        applied += 1;
      }
    });
    api.state.manual = manual;
    if (applied) {
      api.generateBuild();
      if (typeof window.showToast === "function") window.showToast(applied + " supported AI change(s) applied.");
    }
  }

  function bind() {
    createToolsSection();
    get("replaceType")?.addEventListener("change", populateReplacementTarget);
    get("replaceTarget")?.addEventListener("change", renderReplacementPreview);
    get("applyReplacementBtn")?.addEventListener("click", () => applyReplacement(get("replaceType")?.value, get("replaceTarget")?.value));
    get("clearReplacementBtn")?.addEventListener("click", clearOverrides);
    get("upgradeType")?.addEventListener("change", populateUpgradeTarget);
    get("upgradeTarget")?.addEventListener("change", renderUpgradeSim);
    get("applyUpgradeBtn")?.addEventListener("click", applyUpgrade);
    document.querySelectorAll(".compare-actions [data-compare-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".compare-actions [data-compare-mode]").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        renderComparison();
      });
    });
    get("refreshToolsBtn")?.addEventListener("click", () => {
      populateReplacementTarget();
      populateUpgradeTarget();
      renderComparison();
      renderBottleneck();
      refreshMarket();
    });
    get("aiOptimizeBtn")?.addEventListener("click", optimizeWithAI);
    window.addEventListener("spb-build-updated", () => {
      clearTimeout(marketTimer);
      populateReplacementTarget();
      populateUpgradeTarget();
      renderComparison();
      renderBottleneck();
      marketTimer = setTimeout(refreshMarket, 100);
    });
    populateReplacementTarget();
    populateUpgradeTarget();
    renderComparison();
    renderBottleneck();
    marketTimer = setTimeout(refreshMarket, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  window.SmartPCEnhancements = { refreshMarket, renderBottleneck, renderComparison };
})();