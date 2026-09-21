
const CATALOG = {
  cpu: [
    {id:"i3-12100",name:"Intel Core i3-12100",brand:"intel",socket:"LGA1700",ramType:"DDR4",cores:4,score:42,value:92,power:60,price:9000},
    {id:"r5-5600",name:"AMD Ryzen 5 5600",brand:"amd",socket:"AM4",ramType:"DDR4",cores:6,score:52,value:94,power:65,price:10500},
    {id:"r5-7600",name:"AMD Ryzen 5 7600",brand:"amd",socket:"AM5",ramType:"DDR5",cores:6,score:70,value:91,power:65,price:18500},
    {id:"i5-14400f",name:"Intel Core i5-14400F",brand:"intel",socket:"LGA1700",ramType:"DDR5",cores:10,score:75,value:88,power:65,price:20000},
    {id:"r7-9700x",name:"AMD Ryzen 7 9700X",brand:"amd",socket:"AM5",ramType:"DDR5",cores:8,score:88,value:85,power:65,price:34000},
    {id:"i5-14600kf",name:"Intel Core i5-14600KF",brand:"intel",socket:"LGA1700",ramType:"DDR5",cores:14,score:90,value:82,power:125,price:28000},
    {id:"r7-7800x3d",name:"AMD Ryzen 7 7800X3D",brand:"amd",socket:"AM5",ramType:"DDR5",cores:8,score:98,value:84,power:120,price:38000},
    {id:"i7-14700k",name:"Intel Core i7-14700K",brand:"intel",socket:"LGA1700",ramType:"DDR5",cores:20,score:100,value:80,power:253,price:41000}
  ],
  gpu: [
    {id:"igpu",name:"Integrated graphics",brand:"integrated",vram:0,score:20,ai:15,length:0,power:0,price:0},
    {id:"rx-6500-xt",name:"AMD Radeon RX 6500 XT",brand:"amd",vram:4,score:35,ai:18,length:190,power:107,price:13000},
    {id:"rtx-3050",name:"NVIDIA GeForce RTX 3050",brand:"nvidia",vram:8,score:42,ai:40,length:242,power:130,price:18000},
    {id:"rx-7600",name:"AMD Radeon RX 7600",brand:"amd",vram:8,score:58,ai:28,length:204,power:165,price:26000},
    {id:"rtx-4060",name:"NVIDIA GeForce RTX 4060",brand:"nvidia",vram:8,score:61,ai:58,length:242,power:115,price:29000},
    {id:"rtx-4060-ti",name:"NVIDIA GeForce RTX 4060 Ti",brand:"nvidia",vram:8,score:72,ai:71,length:242,power:160,price:40000},
    {id:"rx-7800-xt",name:"AMD Radeon RX 7800 XT",brand:"amd",vram:16,score:83,ai:52,length:302,power:263,price:52000},
    {id:"rtx-4070-super",name:"NVIDIA GeForce RTX 4070 Super",brand:"nvidia",vram:12,score:86,ai:79,length:304,power:220,price:60000},
    {id:"rtx-4070-ti-super",name:"NVIDIA GeForce RTX 4070 Ti Super",brand:"nvidia",vram:16,score:93,ai:88,length:305,power:285,price:82000},
    {id:"rtx-4080-super",name:"NVIDIA GeForce RTX 4080 Super",brand:"nvidia",vram:16,score:100,ai:96,length:320,power:320,price:105000}
  ],
  motherboard: [
    {id:"h610-ddr4",name:"H610M DDR4 motherboard",socket:"LGA1700",ramType:"DDR4",price:7000,quality:55,tier:"entry"},
    {id:"b550",name:"B550M Wi-Fi motherboard",socket:"AM4",ramType:"DDR4",price:9500,quality:68,tier:"mainstream"},
    {id:"b760-ddr5",name:"B760M DDR5 motherboard",socket:"LGA1700",ramType:"DDR5",price:15000,quality:80,tier:"mainstream"},
    {id:"b650",name:"B650M Wi-Fi motherboard",socket:"AM5",ramType:"DDR5",price:16000,quality:84,tier:"mainstream"},
    {id:"b650e",name:"B650E Wi-Fi motherboard",socket:"AM5",ramType:"DDR5",price:23000,quality:91,tier:"upper"},
    {id:"z790",name:"Z790 DDR5 motherboard",socket:"LGA1700",ramType:"DDR5",price:27000,quality:94,tier:"upper"}
  ],
  ram: [
    {id:"16-ddr4",name:"16 GB DDR4 3200",gb:16,type:"DDR4",price:3500,score:55},
    {id:"32-ddr4",name:"32 GB DDR4 3200",gb:32,type:"DDR4",price:6500,score:68},
    {id:"16-ddr5",name:"16 GB DDR5 5600",gb:16,type:"DDR5",price:4500,score:65},
    {id:"32-ddr5",name:"32 GB DDR5 6000",gb:32,type:"DDR5",price:8500,score:82},
    {id:"64-ddr5",name:"64 GB DDR5 6000",gb:64,type:"DDR5",price:17000,score:95}
  ],
  storage: [
    {id:"500",name:"500 GB NVMe SSD",tb:.5,price:3500,score:55},
    {id:"1",name:"1 TB Gen4 NVMe SSD",tb:1,price:6000,score:75},
    {id:"2",name:"2 TB Gen4 NVMe SSD",tb:2,price:10500,score:88},
    {id:"4",name:"4 TB Gen4 NVMe SSD",tb:4,price:21000,score:96}
  ],
  psu: [
    {id:"450",name:"450 W 80+ Bronze PSU",watts:450,price:3500},
    {id:"550",name:"550 W 80+ Bronze PSU",watts:550,price:4500},
    {id:"650",name:"650 W 80+ Gold PSU",watts:650,price:6500},
    {id:"750",name:"750 W 80+ Gold PSU",watts:750,price:8500},
    {id:"850",name:"850 W 80+ Gold PSU",watts:850,price:11000},
    {id:"1000",name:"1000 W 80+ Gold PSU",watts:1000,price:15000}
  ],
  cooler: [
    {id:"stock",name:"Stock / boxed cooler",maxPower:75,price:0},
    {id:"air",name:"Performance tower air cooler",maxPower:180,price:3500},
    {id:"aio",name:"240 mm liquid cooler",maxPower:300,price:7000}
  ],
  case: [
    {id:"compact",name:"Compact airflow mATX case",gpuClearance:280,price:3500},
    {id:"airflow",name:"High-airflow ATX case",gpuClearance:330,price:6000},
    {id:"premium",name:"Premium airflow ATX case",gpuClearance:390,price:9000}
  ]
};

const WORKLOADS = {
  gaming:{label:"Gaming",cpuWeight:.38,gpuWeight:.62,ai:false,preferredRam:16},
  creator:{label:"Creator",cpuWeight:.48,gpuWeight:.52,ai:false,preferredRam:32},
  productivity:{label:"Productivity",cpuWeight:.70,gpuWeight:.30,ai:false,preferredRam:16},
  ai:{label:"AI / ML",cpuWeight:.38,gpuWeight:.62,ai:true,preferredRam:32}
};

const state = {useCase:"gaming",build:null,optimization:"balanced",headroom:true,manual:{cpuId:null,gpuId:null,ramId:null,storageId:null}};
const $ = function(id){return document.getElementById(id);};
const money = function(n){return "₹" + Math.round(Number(n)||0).toLocaleString("en-IN");};

function budgetValue(){
  return Math.max(35000,Math.min(500000,Number($("budget").value)||100000));
}
function selectedRamNeed(){return Number($("ramTarget").value);}
function selectedStorageNeed(){return Number($("storageTarget").value);}
function useCase(){return WORKLOADS[state.useCase];}

function chooseRam(cpu){
  var manualId=state.manual&&state.manual.ramId;
  var manual=manualId&&CATALOG.ram.find(function(r){return r.id===manualId&&r.type===cpu.ramType&&r.gb>=selectedRamNeed();});
  if(manual)return manual;
  var matches=CATALOG.ram.filter(function(r){return r.type===cpu.ramType&&r.gb>=selectedRamNeed();}).sort(function(a,b){return a.price-b.price;});
  return matches[0]||CATALOG.ram.find(function(r){return r.type===cpu.ramType;})||CATALOG.ram[1];
}
function chooseStorage(){
  var manualId=state.manual&&state.manual.storageId;
  var manual=manualId&&CATALOG.storage.find(function(s){return s.id===manualId&&s.tb>=selectedStorageNeed();});
  if(manual)return manual;
  return CATALOG.storage.filter(function(s){return s.tb>=selectedStorageNeed();}).sort(function(a,b){return a.price-b.price;})[0]||CATALOG.storage[1];
}
function chooseMotherboard(cpu){
  return CATALOG.motherboard.filter(function(m){return m.socket===cpu.socket&&m.ramType===cpu.ramType;}).sort(function(a,b){return a.price-b.price;})[0];
}
function requiredPsu(cpu,gpu){
  var extra=state.headroom?180:130;
  return Math.max(350,Math.ceil((cpu.power+gpu.power+extra)/50)*50);
}
function choosePsu(watts){return CATALOG.psu.find(function(p){return p.watts>=watts;})||CATALOG.psu[CATALOG.psu.length-1];}
function chooseCooler(cpu){return cpu.power<=75?CATALOG.cooler[0]:(cpu.power<=180?CATALOG.cooler[1]:CATALOG.cooler[2]);}
function chooseCase(gpu){return gpu.length<=280?CATALOG.case[0]:(gpu.length<=330?CATALOG.case[1]:CATALOG.case[2]);}

function supportCost(cpu,gpu){
  var ram=chooseRam(cpu),storage=chooseStorage(),motherboard=chooseMotherboard(cpu);
  var psu=choosePsu(requiredPsu(cpu,gpu)),cooler=chooseCooler(cpu),selectedCase=chooseCase(gpu);
  return {ram:ram,storage:storage,motherboard:motherboard,psu:psu,cooler:cooler,case:selectedCase,total:[ram,storage,motherboard,psu,cooler,selectedCase].reduce(function(sum,x){return sum+x.price;},0)};
}
function cpuSuitability(cpu,workload){
  var pref=$("cpuPreference").value;
  if(pref!=="any"&&cpu.brand!==pref) return -1000;
  var score=cpu.score;
  if(workload.label==="Gaming"&&cpu.id==="r7-7800x3d") score+=12;
  if(workload.label==="Creator"&&cpu.cores>=12) score+=10;
  if(workload.label==="Productivity"&&cpu.value>=90) score+=9;
  if(workload.label==="AI / ML"&&cpu.cores>=8) score+=8;
  if(state.optimization==="performance") score+=cpu.score*.12;
  if(state.optimization==="upgrade"&&cpu.socket==="AM5") score+=10;
  return score*workload.cpuWeight+cpu.value*.08;
}
function gpuSuitability(gpu,workload){
  var pref=$("gpuPreference").value;
  if(pref!=="any"&&gpu.brand!==pref) return -1000;
  var score=gpu.score;
  if(workload.ai) score+=gpu.ai*.30;
  var res=$("resolution").value;
  if(state.useCase==="gaming"){
    if(res==="1080p") score+=Math.max(0,82-gpu.score)*.10;
    if(res==="1440p") score+=gpu.score*.08;
    if(res==="4k") score+=gpu.score*.18;
  }
  if(state.useCase==="productivity") score*=.42;
  if(state.optimization==="performance") score+=gpu.score*.16;
  if(state.optimization==="upgrade") score+=gpu.vram*.7;
  return score*workload.gpuWeight+(gpu.price===0?5:(gpu.score/Math.max(gpu.price,1))*10000);
}
function scorePair(cpu,gpu,budget,workload){
  var support=supportCost(cpu,gpu),subtotal=cpu.price+gpu.price+support.total;
  if(subtotal>budget) return -Infinity;
  var headroom=Math.max(0,budget-subtotal);
  var efficiency=(cpuSuitability(cpu,workload)+gpuSuitability(gpu,workload))/Math.max(subtotal,1)*12000;
  var use=Math.min(1,subtotal/Math.max(budget,1));
  var reserve=headroom>budget*.15?(state.optimization==="upgrade"?9:3):0;
  return cpuSuitability(cpu,workload)+gpuSuitability(gpu,workload)+efficiency*.45+use*15+reserve;
}
function fallbackBuild(budget){
  var candidates=[];
  CATALOG.cpu.forEach(function(cpu){CATALOG.gpu.forEach(function(gpu){
    var support=supportCost(cpu,gpu);
    candidates.push({cpu:cpu,gpu:gpu,support:support,total:cpu.price+gpu.price+support.total});
  });});
  var sorted=candidates.filter(function(x){return x.total<=budget;}).sort(function(a,b){return b.total-a.total;});
  return sorted[0]||candidates.sort(function(a,b){return a.total-b.total;})[0];
}

function generateBuild(){
  var budget=budgetValue(),workload=useCase(),best=null;
  var cpuPool=(state.manual&&state.manual.cpuId)?CATALOG.cpu.filter(function(x){return x.id===state.manual.cpuId;}):CATALOG.cpu;
  var gpuPool=(state.manual&&state.manual.gpuId)?CATALOG.gpu.filter(function(x){return x.id===state.manual.gpuId;}):CATALOG.gpu;
  (cpuPool.length?cpuPool:CATALOG.cpu).forEach(function(cpu){(gpuPool.length?gpuPool:CATALOG.gpu).forEach(function(gpu){
    var score=scorePair(cpu,gpu,budget,workload);
    if(!best||score>best.modelScore){
      var support=supportCost(cpu,gpu);
      best={cpu:cpu,gpu:gpu,ram:support.ram,storage:support.storage,motherboard:support.motherboard,psu:support.psu,cooler:support.cooler,case:support.case,total:cpu.price+gpu.price+support.total,modelScore:score};
    }
  });});
  if(!best||!Number.isFinite(best.modelScore)){
    var hasManual=state.manual && Object.values(state.manual).some(Boolean);
    if(hasManual){
      var forcedCpu=(state.manual.cpuId&&CATALOG.cpu.find(function(x){return x.id===state.manual.cpuId;}))||cpuPool[0]||CATALOG.cpu[0];
      var forcedGpu=(state.manual.gpuId&&CATALOG.gpu.find(function(x){return x.id===state.manual.gpuId;}))||gpuPool[0]||CATALOG.gpu[0];
      var forcedSupport=supportCost(forcedCpu,forcedGpu);
      best={cpu:forcedCpu,gpu:forcedGpu,ram:forcedSupport.ram,storage:forcedSupport.storage,motherboard:forcedSupport.motherboard,psu:forcedSupport.psu,cooler:forcedSupport.cooler,case:forcedSupport.case,total:forcedCpu.price+forcedGpu.price+forcedSupport.total,modelScore:-Infinity};
    } else {
      best=fallbackBuild(budget);
      if(best && !best.ram){
        var fallbackSupport=supportCost(best.cpu,best.gpu);
        best=Object.assign(best,fallbackSupport);
      }
    }
  }

  var build=Object.assign({},best,{
    budget:budget,
    workload:workload.label,
    resolution:$("resolution").value,
    optimization:state.optimization,
    headroomPreference:state.headroom
  });
  build.estimatedPower=Math.ceil((build.cpu.power+build.gpu.power+85)/10)*10;
  build.score=Math.max(52,Math.min(98,Math.round(46+build.cpu.score*.20+build.gpu.score*.35+build.ram.score*.08+build.motherboard.quality*.06+Math.min(10,Math.max(0,(build.budget-build.total)/build.budget*18)))));
  build.overBudget=build.total>build.budget;
  state.build=build;
  window.__SMART_PC_BUILDER__={catalog:CATALOG,state:state,build:build,generateBuild:generateBuild,buildForMode:buildForMode,validation:validation,requiredPsu:requiredPsu};
  window.dispatchEvent(new CustomEvent("spb-build-updated",{detail:build}));
  localStorage.setItem("spb:lastBuild",JSON.stringify(build));
  renderBuild(build);
  renderAlternatives();
  updateUrl(build);
}

function componentCard(type,item,percent){
  var meta=[];
  if(type==="CPU") meta.push(item.cores+" cores",item.socket);
  if(type==="GPU") meta.push(item.vram?item.vram+" GB VRAM":"Integrated",item.power+" W");
  if(type==="Motherboard") meta.push(item.socket,item.ramType);
  if(type==="RAM") meta.push(item.gb+" GB",item.type);
  if(type==="Storage") meta.push(item.tb+" TB","NVMe");
  if(type==="PSU") meta.push(item.watts+" W","80+");
  if(type==="Cooler") meta.push(item.price===0?"Included":"Up to "+item.maxPower+" W");
  if(type==="Case") meta.push(item.gpuClearance+" mm GPU","Airflow");
  return '<article class="component"><div class="component-head"><span class="component-type">'+type+'</span><span class="component-price">'+money(item.price)+'</span></div><h4>'+item.name+'</h4><div class="component-meta">'+meta.map(function(x){return "<span>"+x+"</span>";}).join("")+'</div><div class="component-bar"><span style="width:'+Math.max(12,Math.min(100,percent))+'%"></span></div></article>';
}

function validation(build){
  var checks=[],push=function(ok,text){checks.push({ok:ok,text:text});};
  push(build.cpu.socket===build.motherboard.socket,"CPU socket "+build.cpu.socket+" matches the motherboard.");
  push(build.cpu.ramType===build.motherboard.ramType&&build.ram.type===build.motherboard.ramType,build.ram.type+" memory matches the platform and motherboard.");
  push(build.gpu.length===0||build.gpu.length<=build.case.gpuClearance,"GPU clearance is "+build.case.gpuClearance+" mm; selected GPU is "+(build.gpu.length||"integrated")+".");
  push(build.psu.watts>=requiredPsu(build.cpu,build.gpu),"PSU provides "+build.psu.watts+" W for an estimated requirement of "+requiredPsu(build.cpu,build.gpu)+" W.");
  push(build.cooler.maxPower>=build.cpu.power,"Cooling capacity covers the CPU's "+build.cpu.power+" W power class.");
  push(build.storage.tb>=selectedStorageNeed(),"Storage target of "+selectedStorageNeed()+" TB is covered.");
  push(build.ram.gb>=selectedRamNeed(),"Memory target of "+selectedRamNeed()+" GB is covered.");
  return checks;
}
function workloadFit(build){
  var score=Math.round(Math.min(99,58+build.cpu.score*.15+build.gpu.score*.25+build.ram.score*.10+(useCase().ai?build.gpu.ai*.14:build.gpu.score*.05)));
  return {score:score,items:[["CPU balance",Math.min(99,Math.round(build.cpu.score*.95))],["GPU fit",Math.min(99,Math.round(build.gpu.score*.96))],["Memory",Math.min(99,Math.round(build.ram.score*.98))],["Storage",Math.min(99,Math.round(build.storage.score*.96))]]};
}
function allocation(build){
  return [["CPU",build.cpu.price],["GPU",build.gpu.price],["Motherboard",build.motherboard.price],["RAM",build.ram.price],["Storage",build.storage.price],["PSU",build.psu.price],["Cooler",build.cooler.price],["Case",build.case.price]]
    .sort(function(a,b){return b[1]-a[1];}).map(function(item){return {name:item[0],value:item[1],pct:build.total?Math.round(item[1]/build.total*100):0};});
}
function upgradePlan(build){
  var plan=[];
  if(build.ram.gb<64) plan.push(["01","Memory","Move to 64 GB when VMs, large datasets, heavy timelines or local models start paging.","Useful for creator, AI and development workloads."]);
  if(build.gpu.vram&&build.gpu.vram<16) plan.push(["02","GPU","Consider a higher-VRAM GPU when you move to larger AI models or higher-resolution workloads.","Recheck case clearance and PSU requirements."]);
  if(build.storage.tb<2) plan.push(["03","Storage","Add a second NVMe or move to 2 TB+ when projects, datasets or games begin filling the drive.","Keep OS and active projects on fast storage."]);
  if(plan.length<3) plan.push(["03","Platform","Upgrade the next measured bottleneck rather than changing healthy components early.","Use the workload fit and validation report as the trigger."]);
  return plan.slice(0,3);
}
function balance(build){
  var gap=Math.abs(build.cpu.score-build.gpu.score);
  return {label:gap<18?"Balanced":gap<30?"Slightly uneven":"Tuned toward one component",items:[
    ["CPU ↔ GPU",gap<18?"Balanced":build.cpu.score>build.gpu.score?"CPU-heavy":"GPU-heavy"],
    ["Memory",build.ram.gb>=useCase().preferredRam?"On target":"Upgrade suggested"],
    ["Power",build.psu.watts>=requiredPsu(build.cpu,build.gpu)?"Headroom available":"Tight"],
    ["Cooling",build.cooler.maxPower>=build.cpu.power?"Adequate":"Needs attention"]
  ]};
}
function renderBuild(build){
  var checks=validation(build),fit=workloadFit(build),alloc=allocation(build),ups=upgradePlan(build),bal=balance(build);
  var headroom=Math.max(0,build.budget-build.total),util=Math.min(100,Math.round(build.total/build.budget*100)),gpuShare=build.total?Math.round(build.gpu.price/build.total*100):0;
  $("budgetFormatted").textContent=money(build.budget);
  $("resultTitle").textContent="Your "+build.resolution+" "+build.workload.toLowerCase()+" build";
  $("resultSubtitle").textContent=build.optimization==="performance"?"Performance-first allocation with extra weight on compute.":build.optimization==="upgrade"?"Upgrade-friendly allocation with extra platform and headroom bias.":"Balanced allocation for value and compatibility.";
  $("heroScore").textContent=build.score;$("heroTotal").textContent=money(build.total);$("heroHeadroom").textContent=money(headroom);$("heroGpuShare").textContent=gpuShare+"%";
  $("buildScore").textContent=build.score;$("totalCost").textContent=money(build.total);$("powerDraw").textContent=build.estimatedPower+" W";
  $("budgetMeta").textContent=build.overBudget?money(build.total-build.budget)+" over target":money(headroom)+" left";
  $("powerNote").textContent=build.psu.watts+" W PSU · "+Math.max(0,build.psu.watts-build.estimatedPower)+" W above estimate";
  $("budgetUtilization").textContent=util+"%";$("budgetFill").style.width=util+"%";$("budgetLeft").textContent=build.overBudget?money(build.total-build.budget)+" over target":money(headroom)+" headroom";
  $("compatBadge").innerHTML="<i></i> "+checks.filter(function(c){return c.ok;}).length+" / "+checks.length+" checks passed";
  $("components").innerHTML=[["CPU",build.cpu,build.cpu.score],["GPU",build.gpu,build.gpu.score],["Motherboard",build.motherboard,build.motherboard.quality],["RAM",build.ram,build.ram.score],["Storage",build.storage,build.storage.score],["PSU",build.psu,Math.min(100,build.psu.watts/10)],["Cooler",build.cooler,80],["Case",build.case,82]].map(function(x){return componentCard(x[0],x[1],x[2]);}).join("");
  $("whyBuildTitle").textContent=gpuShare+"% of spend goes to graphics";
  $("whyBuild").textContent=build.gpu.price?"The optimizer keeps the "+build.workload.toLowerCase()+" workload GPU-led while preserving a compatible "+build.cpu.socket+" platform, memory target and PSU envelope.":"The optimizer avoids forcing a discrete GPU and preserves CPU/platform value.";
  $("tradeoffTitle").textContent=build.gpu.vram&&build.gpu.vram<16?"VRAM is the limiting factor":"Budget headroom is the trade-off";
  $("tradeoff").textContent=build.workload==="AI / ML"&&build.gpu.vram<16?"Larger local models may need more VRAM; this catalog build is better suited to smaller workloads.":"You have "+money(headroom)+" unallocated headroom for peripherals, price movement or a future upgrade.";
  $("nextActionTitle").textContent="Review the analysis";
  $("nextAction").textContent="Review the cost allocation, workload fit, compatibility checks, and upgrade roadmap.";
  $("validationCount").textContent=checks.length+" checks";
  $("validationList").innerHTML=checks.map(function(c){
    return '<div class="validation-row '+(c.ok?"ok":"warn")+'"><span class="validation-icon">'+(c.ok?"✓":"!")+'</span><p>'+c.text+"</p></div>";
  }).join("");
  $("allocationTotal").textContent=money(build.total);
  $("allocationList").innerHTML=alloc.map(function(a){
    return '<div class="allocation-row"><span>'+a.name+'</span><div class="allocation-bar"><span style="width:'+Math.max(6,a.pct)+'%"></span></div><strong>'+money(a.value)+"</strong></div>";
  }).join("");
  $("fitTitle").textContent=build.workload+" profile";
  $("fitScore").textContent=fit.score+"%";
  $("fitFill").style.width=fit.score+"%";
  $("fitItems").innerHTML=fit.items.map(function(x){
    return '<div class="fit-item"><span>'+x[0]+'</span><strong>'+x[1]+"%</strong></div>";
  }).join("");
  $("upgradeList").innerHTML=ups.map(function(x){
    return '<div class="upgrade-row"><span class="upgrade-index">'+x[0]+'</span><div><strong>'+x[1]+"</strong><p>"+x[2]+" "+x[3]+"</p></div></div>";
  }).join("");
  $("balanceLabel").textContent=bal.label;
  $("balanceList").innerHTML=bal.items.map(function(x){
    return '<div class="balance-row"><div><strong>'+x[0]+"</strong><p>System-level balance signal.</p></div><span class=\"balance-chip\">"+x[1]+"</span></div>";
  }).join("");
  $("snapshotList").innerHTML=[["CPU",build.cpu.name],["GPU",build.gpu.name],["RAM",build.ram.name],["Storage",build.storage.name],["Motherboard",build.motherboard.name],["PSU",build.psu.name],["Estimated draw",build.estimatedPower+" W"]].map(function(x){
    return '<div class="snapshot-row"><span>'+x[0]+"</span><strong>"+x[1]+"</strong></div>";
  }).join("");
}

function scoreAlternative(cpu,gpu,budget,mode){
  var support=supportCost(cpu,gpu),total=cpu.price+gpu.price+support.total;
  if(total>budget)return -Infinity;
  var workload=useCase(),score;
  if(mode==="gpu") score=gpu.score*1.15+gpuSuitability(gpu,workload)*.55+cpuSuitability(cpu,workload)*.35;
  else if(mode==="cpu") score=cpu.score*1.15+cpuSuitability(cpu,workload)*.75+gpuSuitability(gpu,workload)*.35;
  else score=cpuSuitability(cpu,workload)+gpuSuitability(gpu,workload)+support.motherboard.quality*.12;
  return score+Math.min(10,total/budget*10);
}
function buildForMode(mode){
  var budget=budgetValue(),best=null;
  CATALOG.cpu.forEach(function(cpu){CATALOG.gpu.forEach(function(gpu){
    if($("cpuPreference").value!=="any"&&cpu.brand!==$("cpuPreference").value)return;
    if($("gpuPreference").value!=="any"&&gpu.brand!==$("gpuPreference").value)return;
    var score=scoreAlternative(cpu,gpu,budget,mode);
    if(!best||score>best.score){var support=supportCost(cpu,gpu);best={cpu:cpu,gpu:gpu,ram:support.ram,total:cpu.price+gpu.price+support.total,score:score};}
  });});
  return best||fallbackBuild(budget);
}
function alternativeCard(title,desc,build,badge,mode){
  var cls=badge==="Current recommendation"?" recommended":"";
  return '<article class="alt-card'+cls+'">'+
    '<div class="alt-top"><div><span class="section-kicker">'+badge+'</span><h3>'+title+'</h3></div><span class="alt-price">'+money(build.total)+'</span></div>'+
    '<p class="alt-desc">'+desc+'</p>'+
    '<div class="alt-list">'+
      '<span><span>CPU</span><strong>'+build.cpu.name+'</strong></span>'+
      '<span><span>GPU</span><strong>'+build.gpu.name+'</strong></span>'+
      '<span><span>RAM</span><strong>'+build.ram.name+'</strong></span>'+
      '<span><span>Score</span><strong>'+Math.round(build.score||0)+'/100</strong></span>'+
    '</div>'+
    '<div class="alt-actions"><button class="ghost-btn full alt-apply" data-mode="'+mode+'">Use this allocation</button></div>'+
  '</article>';
}

function renderAlternatives(){
  var balanced=buildForMode("balanced"),gpu=buildForMode("gpu"),cpu=buildForMode("cpu");
  $("alternativeGrid").innerHTML=[
    alternativeCard("Balanced","Keeps CPU, GPU, platform and budget allocation even.",balanced,"Current recommendation","balanced"),
    alternativeCard("GPU-first","Moves more of the same budget toward graphics and display performance.",gpu,"GPU-first","gpu"),
    alternativeCard("CPU-first","Shifts more of the same budget toward CPU-heavy creator, dev and compute work.",cpu,"CPU-first","cpu")
  ].join("");
  document.querySelectorAll(".alt-apply").forEach(function(btn){btn.addEventListener("click",function(){
    var m=btn.dataset.mode;
    state.optimization=m==="balanced"?"balanced":(m==="gpu"?"performance":"upgrade");
    $("optimizationMode").value=state.optimization;
    generateBuild();
    showToast(btn.closest(".alt-card").querySelector("h3").textContent+" allocation applied.");
    document.getElementById("builder").scrollIntoView({behavior:"smooth"});
  });});
}
function buildShareUrl(build){
  var p=new URLSearchParams({budget:String(build.budget),workload:state.useCase,resolution:build.resolution,cpu:$("cpuPreference").value,gpu:$("gpuPreference").value,ram:$("ramTarget").value,storage:$("storageTarget").value,optimize:state.optimization,headroom:state.headroom?"1":"0"});
  if(state.manual&&state.manual.cpuId)p.set("mcpu",state.manual.cpuId);
  if(state.manual&&state.manual.gpuId)p.set("mgpu",state.manual.gpuId);
  if(state.manual&&state.manual.ramId)p.set("mram",state.manual.ramId);
  if(state.manual&&state.manual.storageId)p.set("mstorage",state.manual.storageId);
  return location.origin+location.pathname+"?"+p.toString();
}
function updateUrl(build){try{history.replaceState(null,"",buildShareUrl(build));}catch(e){}}
function copyBuild(){
  if(!state.build)return;
  var b=state.build,text=["Smart PC Builder recommendation","Workload: "+b.workload,"Display: "+b.resolution,"Budget: "+money(b.budget),"","CPU: "+b.cpu.name+" — "+money(b.cpu.price),"GPU: "+b.gpu.name+" — "+money(b.gpu.price),"Motherboard: "+b.motherboard.name+" — "+money(b.motherboard.price),"RAM: "+b.ram.name+" — "+money(b.ram.price),"Storage: "+b.storage.name+" — "+money(b.storage.price),"PSU: "+b.psu.name+" — "+money(b.psu.price),"Cooler: "+b.cooler.name+" — "+money(b.cooler.price),"Case: "+b.case.name+" — "+money(b.case.price),"","Estimated total: "+money(b.total),"Score: "+b.score+"/100"].join("\n");
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){showToast("Build copied.");}).catch(function(){showToast("Clipboard access is unavailable.");});else showToast(text);
}
function shareBuild(){
  if(!state.build)return;
  var url=buildShareUrl(state.build);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(function(){showToast("Share link copied.");}).catch(function(){showToast(url);});else showToast(url);
}
function exportJson(){
  if(!state.build)return;
  var blob=new Blob([JSON.stringify(state.build,null,2)],{type:"application/json"});
  var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="smart-pc-build.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("Build JSON exported.");
}
function showToast(message){
  var toast=$("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){toast.classList.remove("show");},2400);
}
function loadFromUrl(){
  var p=new URLSearchParams(location.search);
  if(!p.size)return;
  var b=Number(p.get("budget"));if(Number.isFinite(b))$("budget").value=Math.max(35000,Math.min(500000,b));
  var w=p.get("workload");if(WORKLOADS[w]){state.useCase=w;document.querySelectorAll(".choice").forEach(function(x){x.classList.toggle("active",x.dataset.use===w);});}
  if(["1080p","1440p","4k"].includes(p.get("resolution")))$("resolution").value=p.get("resolution");
  if(["any","amd","intel"].includes(p.get("cpu"))) $("cpuPreference").value=p.get("cpu");
  if(["any","nvidia","amd","integrated"].includes(p.get("gpu"))) $("gpuPreference").value=p.get("gpu");
  if(["16","32","64"].includes(p.get("ram"))) $("ramTarget").value=p.get("ram");
  if(["1","2","4"].includes(p.get("storage"))) $("storageTarget").value=p.get("storage");
  if(["balanced","performance","upgrade"].includes(p.get("optimize"))){state.optimization=p.get("optimize");$("optimizationMode").value=state.optimization;}
  state.headroom=p.get("headroom")!=="0";$("headroomToggle").checked=state.headroom;
  state.manual={cpuId:p.get("mcpu")||null,gpuId:p.get("mgpu")||null,ramId:p.get("mram")||null,storageId:p.get("mstorage")||null};
}
function reset(){
  $("budget").value=100000;$("budgetRange").value=100000;$("resolution").value="1440p";$("cpuPreference").value="any";$("gpuPreference").value="any";$("ramTarget").value="32";$("storageTarget").value="1";$("optimizationMode").value="balanced";$("headroomToggle").checked=true;
  state.useCase="gaming";state.optimization="balanced";state.headroom=true;state.manual={cpuId:null,gpuId:null,ramId:null,storageId:null};
  document.querySelectorAll(".choice").forEach(function(x){x.classList.toggle("active",x.dataset.use==="gaming");});
  generateBuild();showToast("Builder reset.");
}

$("budget").addEventListener("input",function(){var value=budgetValue();$("budgetRange").value=value;$("budgetFormatted").textContent=money(value);});
$("budget").addEventListener("change",generateBuild);
$("budgetRange").addEventListener("input",function(){$("budget").value=$("budgetRange").value;generateBuild();});
document.querySelectorAll(".preset-row button").forEach(function(btn){btn.addEventListener("click",function(){$("budget").value=btn.dataset.budget;$("budgetRange").value=btn.dataset.budget;generateBuild();});});
document.querySelectorAll(".choice").forEach(function(btn){btn.addEventListener("click",function(){document.querySelectorAll(".choice").forEach(function(x){x.classList.remove("active");});btn.classList.add("active");state.useCase=btn.dataset.use;generateBuild();});});
["resolution","cpuPreference","gpuPreference","ramTarget","storageTarget"].forEach(function(id){$(id).addEventListener("change",generateBuild);});
$("optimizationMode").addEventListener("change",function(){state.optimization=$("optimizationMode").value;generateBuild();});
$("headroomToggle").addEventListener("change",function(){state.headroom=$("headroomToggle").checked;generateBuild();});
$("buildBtn").addEventListener("click",generateBuild);$("resetBtn").addEventListener("click",reset);$("copyBtn").addEventListener("click",copyBuild);$("shareBtn").addEventListener("click",shareBuild);$("printBtn").addEventListener("click",function(){window.print();});$("exportJsonBtn").addEventListener("click",exportJson);
$("randomBuildBtn").addEventListener("click",function(){
  var budgets=[60000,80000,100000,120000,150000,180000,220000];$("budget").value=budgets[Math.floor(Math.random()*budgets.length)];$("budgetRange").value=$("budget").value;
  var uses=Object.keys(WORKLOADS);state.useCase=uses[Math.floor(Math.random()*uses.length)];document.querySelectorAll(".choice").forEach(function(x){x.classList.toggle("active",x.dataset.use===state.useCase);});generateBuild();document.getElementById("builder").scrollIntoView({behavior:"smooth"});
});
$("alternativesBtn").addEventListener("click",function(){document.getElementById("alternatives").scrollIntoView({behavior:"smooth"});});
$("openAlternativesBtn").addEventListener("click",function(){
  var dialog=$("compareDialog"),builds=[
    ["Balanced","Keeps the platform even.",buildForMode("balanced"),"balanced"],
    ["GPU-first","Pushes more budget into graphics.",buildForMode("gpu"),"gpu-first"],
    ["CPU-first","Pushes more budget into CPU-heavy work.",buildForMode("cpu"),"cpu-first"]
  ];
  $("compareGrid").innerHTML=builds.map(function(item){
    return '<article class="compare-card"><span class="section-kicker">'+item[0]+'</span><h4>'+item[0]+' configuration</h4><div class="compare-price">'+money(item[2].total)+'</div><p>'+item[1]+'</p><div class="compare-parts"><span>CPU <strong>'+item[2].cpu.name+'</strong></span><span>GPU <strong>'+item[2].gpu.name+'</strong></span><span>RAM <strong>'+item[2].ram.name+'</strong></span></div><button class="primary-btn full compare-use" data-mode="'+item[3]+'">Apply configuration</button></article>';
  }).join("");
  $("compareGrid").querySelectorAll(".compare-use").forEach(function(btn){
    btn.addEventListener("click",function(){
      state.optimization=btn.dataset.mode==="gpu-first"?"performance":btn.dataset.mode==="cpu-first"?"upgrade":"balanced";
      $("optimizationMode").value=state.optimization;
      generateBuild();
      dialog.close();
      showToast("Alternative configuration applied.");
    });
  });
  dialog.showModal();
});

$("closeCompareBtn").addEventListener("click",function(){$("compareDialog").close();});

loadFromUrl();$("budgetRange").value=$("budget").value;$("headroomToggle").checked=state.headroom;generateBuild();
