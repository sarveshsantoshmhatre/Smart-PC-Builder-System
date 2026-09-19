
const root=document.getElementById("pcViewer");
const status=document.getElementById("viewerStatus");
const loading=document.getElementById("viewerLoading");
const focusSelect=document.getElementById("focusPart");
const autoRotateBtn=document.getElementById("autoRotateBtn");
const explodeBtn=document.getElementById("explodeBtn");
const cutawayBtn=document.getElementById("cutawayBtn");
const resetViewBtn=document.getElementById("resetViewBtn");

let renderer,scene,camera,controls,buildGroup,caseGroup,componentGroups={};
const drag={active:false,x:0,y:0,rx:0,ry:0};
let autoRotate=false,exploded=false,cutaway=true,focused="overview";

const homePosition=new THREE.Vector3(5.8,4.1,6.6);
const homeTarget=new THREE.Vector3(0,2.1,0);

function mat(color,metalness,roughness,opacity,transparent){
  return new THREE.MeshStandardMaterial({
    color:color,
    metalness:metalness===undefined?.25:metalness,
    roughness:roughness===undefined?.45:roughness,
    opacity:opacity===undefined?1:opacity,
    transparent:Boolean(transparent)
  });
}
function box(w,h,d,material,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x||0,y||0,z||0);
  return m;
}
function cylinder(radius,height,material,segments){
  return new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments||32),material);
}
function disposeGroup(group){
  while(group.children.length){
    const child=group.children.pop();
    child.traverse(function(obj){
      if(obj.geometry)obj.geometry.dispose();
      if(obj.material){
        if(Array.isArray(obj.material))obj.material.forEach(function(m){m.dispose();});
        else obj.material.dispose();
      }
    });
  }
}

function init(){
  if(typeof THREE==="undefined"){status.textContent="3D engine failed to load";loading.textContent="3D engine could not load. Check your internet connection and refresh.";return;}
  scene=new THREE.Scene();

  camera=new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.copy(homePosition);

  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  root.prepend(renderer.domElement);

  controls={target:homeTarget.clone(),distance:8.6};
  renderer.domElement.addEventListener("pointerdown",function(e){drag.active=true;drag.x=e.clientX;drag.y=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener("pointermove",function(e){
    if(!drag.active)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    drag.x=e.clientX;drag.y=e.clientY;
    buildGroup.rotation.y+=dx*.008;
    drag.ry=Math.max(-.9,Math.min(.9,drag.ry+dy*.006));
  });
  renderer.domElement.addEventListener("pointerup",function(e){drag.active=false;renderer.domElement.releasePointerCapture(e.pointerId);});
  renderer.domElement.addEventListener("pointerleave",function(){drag.active=false;});
  renderer.domElement.addEventListener("wheel",function(e){
    e.preventDefault();
    controls.distance=Math.max(4,Math.min(13,controls.distance+e.deltaY*.006));
    camera.position.z=controls.distance;
  },{passive:false});
  controls.target.copy(homeTarget);

  scene.add(new THREE.HemisphereLight(0xb8c9ff,0x101623,2.0));

  const key=new THREE.DirectionalLight(0xffffff,3.1);
  key.position.set(5,8,6);
  scene.add(key);

  const rim=new THREE.DirectionalLight(0x6ee8ff,1.6);
  rim.position.set(-6,4,-5);
  scene.add(rim);

  const fill=new THREE.PointLight(0x8e6fff,28,9,2);
  fill.position.set(3,3,1);
  scene.add(fill);

  const floor=new THREE.Mesh(
    new THREE.CircleGeometry(5.2,64),
    new THREE.MeshStandardMaterial({color:0x08101a,metalness:.08,roughness:1,transparent:true,opacity:.76})
  );
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.05;
  scene.add(floor);

  buildGroup=new THREE.Group();
  scene.add(buildGroup);

  new ResizeObserver(resize).observe(root);
  root.addEventListener("dblclick",pickByScreen);
  window.addEventListener("spb-build-updated",function(event){renderBuild(event.detail);});

  animate();
  resize();

  if(typeof THREE==="undefined"){status.textContent="3D engine failed to load";loading.textContent="3D engine could not load. Check your internet connection and refresh.";return;}

  const initial=window.__SMART_PC_BUILDER__&&window.__SMART_PC_BUILDER__.build;
  if(initial)renderBuild(initial);
}

function buildCase(){
  caseGroup=new THREE.Group();

  const shell=mat(cutaway?0x7182a2:0x2e4058,.55,.3,cutaway?.16:.58,true);
  const edges=mat(0x7c8ca6,.62,.25,cutaway?.32:.8,true);

  caseGroup.add(box(3.55,.20,4.15,shell,0,.10,0));
  caseGroup.add(box(.22,4.45,4.15,edges,-1.78,2.32,0));
  caseGroup.add(box(.22,4.45,4.15,edges,1.78,2.32,0));
  caseGroup.add(box(3.55,4.45,.22,edges,0,2.32,-2.05));
  caseGroup.add(box(3.55,.18,4.15,edges,0,4.56,0));

  buildGroup.add(caseGroup);
}

function buildInterior(build){
  const boardMat=mat(0x5f55d6,.42,.42);
  const computeMat=mat(0x4fc8e8,.34,.34);
  const memoryMat=mat(0xf0bd62,.24,.3);
  const coolingMat=mat(0x43d4b2,.30,.25);
  const darkMat=mat(0x1b2638,.62,.34);
  const metalMat=mat(0x8896aa,.72,.28);

  const board=new THREE.Group();
  board.name="Motherboard";
  board.add(box(2.85,.12,3.30,boardMat,0,1.63,.08));
  for(let i=0;i<4;i++)board.add(box(.085,.10,2.46,memoryMat,-.78+i*.42,1.88,.13));
  board.add(box(.98,.18,.94,darkMat,0,2.10,.20));
  board.add(box(.48,.08,2.10,metalMat,-.78,1.69,.70));
  buildGroup.add(board);
  componentGroups.motherboard=board;

  const cpu=new THREE.Group();
  cpu.name="CPU";
  cpu.add(box(.72,.15,.72,computeMat,0,2.30,.27));
  buildGroup.add(cpu);
  componentGroups.cpu=cpu;

  const cooler=new THREE.Group();
  cooler.name="Cooler";
  const fan=cylinder(.60,.22,coolingMat,40);
  fan.rotation.x=Math.PI/2;
  cooler.add(fan);
  for(let i=0;i<6;i++){
    const fin=box(.06,.05,.98,metalMat,-.25+i*.10,2.47,.27);
    cooler.add(fin);
  }
  buildGroup.add(cooler);
  componentGroups.cooler=cooler;

  const ram=new THREE.Group();
  ram.name="RAM";
  for(let i=0;i<4;i++)ram.add(box(.10,.56,.38,memoryMat,-.77+i*.28,2.35,.18));
  buildGroup.add(ram);
  componentGroups.ram=ram;

  const gpu=new THREE.Group();
  gpu.name="GPU";
  const card=box(2.48,.46,.98,computeMat,.18,1.63,1.06);
  gpu.add(card);
  for(const x of [-.55,.18,.90]){
    const gFan=cylinder(.23,.08,darkMat,30);
    gFan.rotation.x=Math.PI/2;
    gFan.position.set(x,1.63,.56);
    gpu.add(gFan);
  }
  gpu.add(box(2.05,.08,.05,metalMat,.18,1.87,1.56));
  buildGroup.add(gpu);
  componentGroups.gpu=gpu;

  const storage=new THREE.Group();
  storage.name="Storage";
  storage.add(box(.78,.08,.38,memoryMat,1.02,2.03,-.47));
  buildGroup.add(storage);
  componentGroups.storage=storage;

  const psu=new THREE.Group();
  psu.name="PSU";
  psu.add(box(2.48,1.10,1.58,darkMat,0,.75,-1.05));
  buildGroup.add(psu);
  componentGroups.psu=psu;

  const fans=new THREE.Group();
  fans.name="Case fans";
  for(const y of [.9,2.1,3.3]){
    const caseFan=cylinder(.43,.10,coolingMat,32);
    caseFan.rotation.z=Math.PI/2;
    caseFan.position.set(-1.58,y,1.18);
    fans.add(caseFan);
  }
  buildGroup.add(fans);
  componentGroups.fans=fans;

  applySubtleScale(build);
}

function applySubtleScale(build){
  if(!build)return;
  const gpuScale=Math.max(.92,Math.min(1.18,(build.gpu.length||210)/260));
  if(componentGroups.gpu)componentGroups.gpu.scale.x=gpuScale;
  const ramCount=build.ram.gb>=64?4:3;
  if(componentGroups.ram)componentGroups.ram.children.forEach(function(child,index){child.visible=index<ramCount;});
  if(componentGroups.cooler)componentGroups.cooler.scale.setScalar(build.cooler.id==="aio"?1.12:1);
}

function populateFocus(){
  const options=[
    ["overview","Whole system"],
    ["cpu","CPU"],
    ["gpu","GPU"],
    ["motherboard","Motherboard"],
    ["ram","RAM"],
    ["storage","Storage"],
    ["psu","PSU"],
    ["cooler","Cooler"],
    ["fans","Case fans"]
  ];
  focusSelect.innerHTML=options.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join("");
  focusSelect.value=focused;
}

function updateTransforms(){
  const offsets={
    cpu:[0,0,0],gpu:[0,0,0],motherboard:[0,0,0],ram:[0,0,0],
    storage:[0,0,0],psu:[0,0,0],cooler:[0,0,0],fans:[0,0,0]
  };
  if(exploded){
    offsets.cpu=[0,.65,0];
    offsets.cooler=[0,1.15,0];
    offsets.ram=[0,.46,.36];
    offsets.gpu=[.88,0,.9];
    offsets.storage=[.82,.35,0];
    offsets.psu=[0,-.32,-.85];
    offsets.motherboard=[-.55,0,0];
    offsets.fans=[-.85,0,.80];
  }
  Object.keys(componentGroups).forEach(function(key){
    componentGroups[key].position.set(offsets[key][0],offsets[key][1],offsets[key][2]);
  });
}

function rebuild(build){
  if(!buildGroup)return;

  disposeGroup(buildGroup);
  componentGroups={};

  buildCase();
  buildInterior(build);
  populateFocus();
  updateTransforms();

  const label=root.querySelector(".viewer-floating-label");
  if(label)label.remove();
  const floating=document.createElement("div");
  floating.className="viewer-floating-label";
  floating.textContent=build.cpu.name+" · "+build.gpu.name;
  root.appendChild(floating);

  loading.classList.add("hidden");
  status.textContent=build.workload+" · "+build.resolution+" · interactive";
}

function focusComponent(key){
  focused=key;
  focusSelect.value=key;

  if(key==="overview"){
    camera.position.copy(homePosition);
    controls.target.copy(homeTarget);
    return;
  }

  const group=componentGroups[key];
  if(!group)return;

  const bounds=new THREE.Box3().setFromObject(group);
  const center=bounds.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  camera.position.copy(center.clone().add(new THREE.Vector3(3.5,2.6,4.2)));
}

function applyView(view){
  if(view==="front"){
    camera.position.set(0,3.35,7.0);
    controls.target.set(0,2.0,0);
  }else if(view==="side"){
    camera.position.set(7.0,3.35,0);
    controls.target.set(0,2.0,0);
  }else if(view==="top"){
    camera.position.set(0,8.0,.15);
    controls.target.set(0,1.8,0);
  }else{
    camera.position.copy(homePosition);
    controls.target.copy(homeTarget);
  }
  focused="overview";
  focusSelect.value="overview";
}

function pickByScreen(event){
  const rect=renderer.domElement.getBoundingClientRect();
  const pointer=new THREE.Vector2(
    ((event.clientX-rect.left)/rect.width)*2-1,
    -(((event.clientY-rect.top)/rect.height)*2-1)
  );
  const raycaster=new THREE.Raycaster();
  raycaster.setFromCamera(pointer,camera);

  const hits=raycaster.intersectObjects(Object.values(componentGroups),true);
  if(!hits.length){
    focusComponent("overview");
    return;
  }

  let target=hits[0].object;
  while(target.parent&&target.parent!==buildGroup)target=target.parent;
  const entry=Object.entries(componentGroups).find(function(pair){return pair[1]===target;});
  focusComponent(entry?entry[0]:"overview");
}

function toggleButton(button,active){button.classList.toggle("active",active);}

function resize(){
  if(!renderer)return;
  const width=Math.max(1,root.clientWidth);
  const height=Math.max(1,root.clientHeight);
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
}

function animate(){
  requestAnimationFrame(animate);
  if(autoRotate&&buildGroup)buildGroup.rotation.y+=.0034;
  camera.lookAt(controls.target);
  renderer.render(scene,camera);
}

autoRotateBtn.addEventListener("click",function(){
  autoRotate=!autoRotate;
  toggleButton(autoRotateBtn,autoRotate);
});

explodeBtn.addEventListener("click",function(){
  exploded=!exploded;
  toggleButton(explodeBtn,exploded);
  updateTransforms();
});

cutawayBtn.addEventListener("click",function(){
  cutaway=!cutaway;
  toggleButton(cutawayBtn,cutaway);
  const build=window.__SMART_PC_BUILDER__&&window.__SMART_PC_BUILDER__.build;
  if(build)rebuild(build);
});

resetViewBtn.addEventListener("click",function(){
  focused="overview";
  exploded=false;
  autoRotate=false;
  toggleButton(autoRotateBtn,false);
  toggleButton(explodeBtn,false);
  focusComponent("overview");
  updateTransforms();
});

focusSelect.addEventListener("change",function(){focusComponent(focusSelect.value);});

document.querySelectorAll(".viewer-tool").forEach(function(button){
  button.addEventListener("click",function(){
    document.querySelectorAll(".viewer-tool").forEach(function(x){x.classList.remove("active");});
    button.classList.add("active");
    applyView(button.dataset.view);
  });
});

init();

window.__SPB_3D__={focus:focusComponent,rebuild:rebuild};
