import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const root = document.getElementById("pcViewer");
const status = document.getElementById("viewerStatusBadge");
const loading = document.getElementById("viewerLoading");
const focusSelect = document.getElementById("focusPart");
const autoRotateBtn = document.getElementById("autoRotateBtn");
const explodeBtn = document.getElementById("explodeBtn");
const cutawayBtn = document.getElementById("cutawayBtn");
const resetViewBtn = document.getElementById("resetViewBtn");

let renderer = null;
let scene = null;
let camera = null;
let buildGroup = null;
let caseGroup = null;
let componentGroups = {};
let autoRotate = false;
let exploded = false;
let cutaway = true;
let focused = "overview";
let ready = false;

const target = new THREE.Vector3(0, 2.1, 0);
const homePosition = new THREE.Vector3(6.2, 4.2, 7.0);
const drag = { active: false, x: 0, y: 0, yaw: 0.72, pitch: 0.28 };
const controls = { distance: 9.2, minDistance: 5.4, maxDistance: 16 };

function mat(color, metalness = 0.25, roughness = 0.45, opacity = 1, transparent = false) {
  return new THREE.MeshStandardMaterial({
    color, metalness, roughness, opacity, transparent,
    depthWrite: !transparent
  });
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius, height, material, segments = 32) {
  return new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
}

function disposeObject(object) {
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
      else node.material.dispose();
    }
  });
}

function disposeChildren(group) {
  while (group.children.length) {
    const child = group.children.pop();
    disposeObject(child);
  }
}

function initScene() {
  if (!root) return;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", { antialias: true }) ||
             canvas.getContext("webgl", { antialias: true });

  if (!gl) {
    loading.textContent = "3D graphics are unavailable in this browser.";
    loading.classList.remove("hidden");
    if (status) status.textContent = "WebGL unavailable";
    return;
  }

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x070b14, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);
  renderer.domElement.className = "pc-3d-canvas";
  renderer.domElement.setAttribute("aria-label", "Interactive 3D PC build");

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070b14, 12, 24);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.copy(homePosition);

  scene.add(new THREE.HemisphereLight(0xcbd7ff, 0x101522, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(5, 8, 7);
  scene.add(key);
  const fill = new THREE.PointLight(0x7d5cff, 10, 18, 2);
  fill.position.set(-4, 4, 3);
  scene.add(fill);

  buildGroup = new THREE.Group();
  scene.add(buildGroup);

  addFloor();
  bindPointerControls();
  resize();

  const initial = window.__SMART_PC_BUILDER__ && window.__SMART_PC_BUILDER__.build;
  if (initial) renderBuild(initial);

  ready = true;
  animate();
}

function addFloor() {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 64),
    mat(0x111827, 0.15, 0.78)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.name = "Studio floor";
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4.25, 4.30, 64),
    mat(0x6d5cff, 0.3, 0.35, 0.32, true)
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.005;
  scene.add(ring);
}

function buildCase() {
  caseGroup = new THREE.Group();

  const shell = mat(0x7182a2, 0.55, 0.30, cutaway ? 0.13 : 0.54, true);
  const edges = mat(0x8d9ab0, 0.62, 0.25, cutaway ? 0.30 : 0.72, true);
  const dark = mat(0x172235, 0.65, 0.32);

  caseGroup.add(box(3.55, 0.20, 4.15, shell, 0, 0.10, 0));
  caseGroup.add(box(0.22, 4.45, 4.15, edges, -1.78, 2.32, 0));
  caseGroup.add(box(0.22, 4.45, 4.15, edges, 1.78, 2.32, 0));
  caseGroup.add(box(3.55, 4.45, 0.22, edges, 0, 2.32, -2.05));
  caseGroup.add(box(3.55, 0.18, 4.15, edges, 0, 4.56, 0));

  const front = box(3.20, 3.65, 0.06, dark, 0, 2.30, 2.05);
  front.material = mat(0x0e1624, 0.45, 0.38, cutaway ? 0.08 : 0.34, true);
  caseGroup.add(front);

  buildGroup.add(caseGroup);
}

function buildInterior(build) {
  const boardMat = mat(0x5f55d6, 0.42, 0.42);
  const computeMat = mat(0x4fc8e8, 0.34, 0.34);
  const memoryMat = mat(0xf0bd62, 0.24, 0.30);
  const coolingMat = mat(0x43d4b2, 0.30, 0.25);
  const darkMat = mat(0x1b2638, 0.62, 0.34);
  const metalMat = mat(0x8896aa, 0.72, 0.28);

  const board = new THREE.Group();
  board.name = "Motherboard";
  board.add(box(2.85, 0.12, 3.30, boardMat, 0, 1.63, 0.08));
  board.add(box(0.95, 0.16, 0.92, darkMat, 0, 2.05, 0.22));
  board.add(box(0.42, 0.07, 2.15, metalMat, -0.80, 1.69, 0.70));
  buildGroup.add(board);
  componentGroups.motherboard = board;

  const cpu = new THREE.Group();
  cpu.name = "CPU";
  cpu.add(box(0.72, 0.15, 0.72, computeMat, 0, 2.30, 0.27));
  buildGroup.add(cpu);
  componentGroups.cpu = cpu;

  const cooler = new THREE.Group();
  cooler.name = "Cooler";
  const fan = cylinder(0.60, 0.22, coolingMat, 40);
  fan.rotation.x = Math.PI / 2;
  cooler.add(fan);
  for (let i = 0; i < 6; i++) {
    cooler.add(box(0.06, 0.05, 0.98, metalMat, -0.25 + i * 0.10, 2.47, 0.27));
  }
  buildGroup.add(cooler);
  componentGroups.cooler = cooler;

  const ram = new THREE.Group();
  ram.name = "RAM";
  for (let i = 0; i < 4; i++) {
    ram.add(box(0.10, 0.56, 0.38, memoryMat, -0.77 + i * 0.28, 2.35, 0.18));
  }
  buildGroup.add(ram);
  componentGroups.ram = ram;

  const gpu = new THREE.Group();
  gpu.name = "GPU";
  gpu.add(box(2.48, 0.46, 0.98, computeMat, 0.18, 1.63, 1.06));
  for (const x of [-0.55, 0.18, 0.90]) {
    const gFan = cylinder(0.23, 0.08, darkMat, 30);
    gFan.rotation.x = Math.PI / 2;
    gFan.position.set(x, 1.63, 1.57);
    gpu.add(gFan);
  }
  gpu.add(box(2.05, 0.08, 0.05, metalMat, 0.18, 1.87, 1.56));
  buildGroup.add(gpu);
  componentGroups.gpu = gpu;

  const storage = new THREE.Group();
  storage.name = "Storage";
  storage.add(box(0.78, 0.08, 0.38, memoryMat, 1.02, 2.03, -0.47));
  buildGroup.add(storage);
  componentGroups.storage = storage;

  const psu = new THREE.Group();
  psu.name = "PSU";
  psu.add(box(2.48, 1.10, 1.58, darkMat, 0, 0.75, -1.05));
  buildGroup.add(psu);
  componentGroups.psu = psu;

  const fans = new THREE.Group();
  fans.name = "Case fans";
  for (const y of [0.9, 2.1, 3.3]) {
    const caseFan = cylinder(0.43, 0.10, coolingMat, 32);
    caseFan.rotation.z = Math.PI / 2;
    caseFan.position.set(-1.58, y, 1.18);
    fans.add(caseFan);
  }
  buildGroup.add(fans);
  componentGroups.fans = fans;

  const ramGb = Number(build.ram && build.ram.gb) || 32;
  ram.children.forEach((child, index) => { child.visible = ramGb >= 64 || index < 2; });
  if (componentGroups.gpu) {
    const length = Number(build.gpu && build.gpu.length) || 220;
    const scale = Math.max(0.92, Math.min(1.16, length / 260));
    componentGroups.gpu.scale.x = scale;
  }
  if (componentGroups.cooler && build.cooler && build.cooler.id === "aio") {
    componentGroups.cooler.scale.setScalar(1.12);
  }
}

function populateFocus() {
  const options = [
    ["overview", "Whole system"], ["cpu", "CPU"], ["gpu", "GPU"],
    ["motherboard", "Motherboard"], ["ram", "RAM"], ["storage", "Storage"],
    ["psu", "PSU"], ["cooler", "Cooler"], ["fans", "Case fans"]
  ];
  focusSelect.innerHTML = options.map(([value, label]) =>
    '<option value="' + value + '">' + label + "</option>"
  ).join("");
  focusSelect.value = focused;
}

function updateTransforms() {
  const offsets = {
    cpu: [0, 0, 0], gpu: [0, 0, 0], motherboard: [0, 0, 0],
    ram: [0, 0, 0], storage: [0, 0, 0], psu: [0, 0, 0],
    cooler: [0, 0, 0], fans: [0, 0, 0]
  };
  if (exploded) {
    offsets.cpu = [0, 0.65, 0];
    offsets.cooler = [0, 1.15, 0];
    offsets.ram = [0, 0.46, 0.36];
    offsets.gpu = [0.88, 0, 0.90];
    offsets.storage = [0.82, 0.35, 0];
    offsets.psu = [0, -0.32, -0.85];
    offsets.motherboard = [-0.55, 0, 0];
    offsets.fans = [-0.85, 0, 0.80];
  }
  Object.keys(componentGroups).forEach((key) => {
    const o = offsets[key];
    componentGroups[key].position.set(o[0], o[1], o[2]);
  });
}

function rebuild(build) {
  if (!ready || !buildGroup) return;

  disposeChildren(buildGroup);
  componentGroups = {};
  buildCase();
  buildInterior(build);
  populateFocus();
  updateTransforms();

  const oldLabel = root.querySelector(".viewer-floating-label");
  if (oldLabel) oldLabel.remove();

  const label = document.createElement("div");
  label.className = "viewer-floating-label";
  label.textContent = (build.cpu && build.cpu.name ? build.cpu.name : "CPU") +
    " · " + (build.gpu && build.gpu.name ? build.gpu.name : "GPU");
  root.appendChild(label);

  loading.classList.add("hidden");
  if (status) status.textContent = (build.workload || "Build") + " · "
    (build.resolution || "1440p") + " · interactive";
}

function renderBuild(build) {
  rebuild(build);
}

function setCamera(position, lookTarget = target) {
  camera.position.copy(position);
  target.copy(lookTarget);
}

function focusComponent(key) {
  focused = key;
  focusSelect.value = key;

  if (key === "overview") {
    setCamera(homePosition, new THREE.Vector3(0, 2.1, 0));
    return;
  }

  const group = componentGroups[key];
  if (!group) return;

  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  const direction = new THREE.Vector3(3.8, 2.7, 4.6).normalize();
  setCamera(center.clone().add(direction.multiplyScalar(4.2)), center);
}

function applyView(view) {
  if (view === "front") {
    setCamera(new THREE.Vector3(0, 3.2, 7.5), new THREE.Vector3(0, 2.0, 0));
  } else if (view === "side") {
    setCamera(new THREE.Vector3(7.5, 3.2, 0), new THREE.Vector3(0, 2.0, 0));
  } else if (view === "top") {
    setCamera(new THREE.Vector3(0, 8.4, 0.15), new THREE.Vector3(0, 1.8, 0));
  } else {
    setCamera(homePosition, new THREE.Vector3(0, 2.1, 0));
  }
  focused = "overview";
  focusSelect.value = "overview";
}

function toggleButton(button, active) {
  if (button) button.classList.toggle("active", active);
}

function bindPointerControls() {
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (event) => {
    drag.active = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag.active) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.yaw -= dx * 0.008;
    drag.pitch = Math.max(-1.15, Math.min(1.15, drag.pitch - dy * 0.006));
  });

  const stop = (event) => {
    drag.active = false;
    if (event.pointerId !== undefined) {
      try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
    }
    canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("dblclick", pickByScreen);

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    controls.distance = Math.max(
      controls.minDistance,
      Math.min(controls.maxDistance, controls.distance * (1 + event.deltaY * 0.001))
    );
  }, { passive: false });

  canvas.style.cursor = "grab";
}

function pickByScreen(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(Object.values(componentGroups), true);
  if (!hits.length) {
    focusComponent("overview");
    return;
  }

  let node = hits[0].object;
  while (node.parent && node.parent !== buildGroup) node = node.parent;
  const entry = Object.entries(componentGroups).find(([, group]) => group === node);
  focusComponent(entry ? entry[0] : "overview");
}

function resize() {
  if (!renderer || !camera) return;
  const width = Math.max(1, root.clientWidth);
  const height = Math.max(1, root.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function updateCameraFromDrag() {
  const horizontal = Math.cos(drag.pitch) * controls.distance;
  camera.position.set(
    target.x + Math.sin(drag.yaw) * horizontal,
    target.y + Math.sin(drag.pitch) * controls.distance,
    target.z + Math.cos(drag.yaw) * horizontal
  );
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer) return;

  if (autoRotate) drag.yaw += 0.0035;
  updateCameraFromDrag();
  camera.lookAt(target);
  renderer.render(scene, camera);
}

autoRotateBtn.addEventListener("click", () => {
  autoRotate = !autoRotate;
  toggleButton(autoRotateBtn, autoRotate);
});

explodeBtn.addEventListener("click", () => {
  exploded = !exploded;
  toggleButton(explodeBtn, exploded);
  updateTransforms();
});

cutawayBtn.addEventListener("click", () => {
  cutaway = !cutaway;
  toggleButton(cutawayBtn, cutaway);
  const build = window.__SMART_PC_BUILDER__ && window.__SMART_PC_BUILDER__.build;
  if (build) rebuild(build);
});

resetViewBtn.addEventListener("click", () => {
  exploded = false;
  autoRotate = false;
  focused = "overview";
  drag.yaw = 0.72;
  drag.pitch = 0.28;
  controls.distance = 9.2;
  toggleButton(autoRotateBtn, false);
  toggleButton(explodeBtn, false);
  focusComponent("overview");
  updateTransforms();
});

focusSelect.addEventListener("change", () => focusComponent(focusSelect.value));

document.querySelectorAll(".viewer-tool").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".viewer-tool").forEach((x) => x.classList.remove("active"));
    button.classList.add("active");
    applyView(button.dataset.view);
  });
});

window.addEventListener("resize", resize);
if ("ResizeObserver" in window) new ResizeObserver(resize).observe(root);

window.addEventListener("spb-build-updated", (event) => {
  if (event.detail) renderBuild(event.detail);
});

try {
  initScene();
} catch (error) {
  console.error("3D viewer initialization failed:", error);
  loading.textContent = "3D viewer failed to initialize. Check the browser console.";
  loading.classList.remove("hidden");
  if (status) status.textContent = "3D error";
}

window.__SPB_3D__ = {
  focus: focusComponent,
  rebuild: rebuild
};
