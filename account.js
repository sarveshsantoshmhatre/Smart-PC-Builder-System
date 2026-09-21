(function(){
  "use strict";

  const get = (id) => document.getElementById(id);
  const puterReady = () => window.puter && puter.auth && puter.kv;

  const accountBtn = get("accountBtn");
  const saveBtn = get("saveBuildBtn");
  if (!accountBtn) return;

  let user = null;
  let menu = null;
  let outsideHandlerBound = false;

  function builder(){
    return window.__SMART_PC_BUILDER__ || {};
  }

  function toast(message){
    if (typeof window.showToast === "function") window.showToast(message);
  }

  function displayName(profile){
    return String(
      profile?.username ||
      profile?.name ||
      profile?.email ||
      "Puter user"
    );
  }

  function displayEmail(profile){
    return String(profile?.email || profile?.username || "");
  }

  function avatarFor(profile){
    return String(
      profile?.profile?.picture ||
      profile?.picture ||
      profile?.avatar ||
      ""
    );
  }

  function formatDate(value){
    try{
      return new Date(value).toLocaleString("en-IN",{
        day:"2-digit",month:"short",year:"numeric",
        hour:"2-digit",minute:"2-digit"
      });
    }catch(_){
      return "";
    }
  }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function ensureMenu(){
    if(menu) return menu;
    menu=document.createElement("div");
    menu.className="account-menu";
    menu.hidden=true;
    document.body.appendChild(menu);
    return menu;
  }

  function positionMenu(){
    if(!menu || menu.hidden) return;
    const rect=accountBtn.getBoundingClientRect();
    const width=Math.min(340,window.innerWidth-24);
    const left=Math.min(
      Math.max(12,rect.right-width),
      window.innerWidth-width-12
    );
    const top=Math.min(
      window.innerHeight-12-menu.offsetHeight,
      rect.bottom+10
    );
    menu.style.left=Math.max(12,left)+"px";
    menu.style.top=Math.max(12,top)+"px";
  }

  function closeMenu(){
    if(menu) menu.hidden=true;
  }

  function openMenu(){
    ensureMenu();
    menu.hidden=false;
    positionMenu();
    renderMenu();
  }

  function renderAccountButton(){
    accountBtn.classList.toggle("signed-in",!!user);

    if(!user){
      accountBtn.textContent="Sign in";
      return;
    }

    const name=displayName(user);
    const image=avatarFor(user);
    accountBtn.innerHTML=
      (image ? '<img class="account-avatar" alt="" src="'+escapeHtml(image)+'">' : "")+
      '<span class="account-label">'+escapeHtml(name)+'</span>';
    accountBtn.title="Account: "+name;
  }

  async function loadSavedBuilds(){
    if(!puterReady() || !user) return [];
    try{
      const value=await puter.kv.get("spb:saved-builds");
      return Array.isArray(value)?value:[];
    }catch(error){
      console.error("Saved build load failed:",error);
      return [];
    }
  }

  async function saveBuild(){
    const build=builder().build;
    if(!build){
      toast("Generate a build before saving it.");
      return;
    }

    if(!puterReady()){
      toast("Account service is still loading. Try again.");
      return;
    }

    if(!user){
      try{
        await puter.auth.signIn();
        await refreshAuth();
      }catch(error){
        toast("Sign-in cancelled.");
        return;
      }
      if(!user) return;
    }

    saveBtn.disabled=true;
    const snapshot={
      id: (crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random()),
      createdAt:new Date().toISOString(),
      title: build.workload+" · "+build.resolution,
      budget:build.budget,
      total:build.total,
      score:build.score,
      build:JSON.parse(JSON.stringify(build))
    };

    try{
      const current=await loadSavedBuilds();
      current.unshift(snapshot);
      await puter.kv.set("spb:saved-builds",current.slice(0,20));
      toast("Build saved to your account.");
      renderMenu();
    }catch(error){
      console.error("Saved build write failed:",error);
      toast("Could not save the build. Check account permissions.");
    }finally{
      saveBtn.disabled=false;
    }
  }

  async function deleteBuild(id){
    if(!user) return;
    const current=await loadSavedBuilds();
    const next=current.filter(item=>item.id!==id);
    try{
      await puter.kv.set("spb:saved-builds",next);
      renderMenu();
      toast("Saved build deleted.");
    }catch(error){
      console.error(error);
      toast("Could not delete the saved build.");
    }
  }

  function applySavedBuild(item){
    const build=item?.build;
    if(!build) return;

    const api=builder();
    if(!api.state || !api.generateBuild){
      toast("Builder is not ready yet.");
      return;
    }

    const byId=(type,id)=>(api.catalog?.[type]||[]).find(x=>x.id===id);
    const workloadKey=Object.keys(api.catalog||{}).length
      ? String(build.workload||"").toLowerCase()
      : "";

    const workloadMap={
      gaming:"gaming",
      creator:"creator",
      productivity:"productivity",
      "ai / ml":"ai"
    };

    const wk=workloadMap[workloadKey] || "gaming";
    api.state.useCase=wk;
    api.state.optimization=String(build.optimization||"balanced");
    api.state.headroom=build.headroomPreference!==false;
    api.state.manual={
      cpuId:byId("cpu",build.cpu?.id)?.id||null,
      gpuId:byId("gpu",build.gpu?.id)?.id||null,
      ramId:byId("ram",build.ram?.id)?.id||null,
      storageId:byId("storage",build.storage?.id)?.id||null
    };

    const setValue=(id,value)=>{
      const el=get(id);
      if(el && value!=null) el.value=String(value);
    };

    setValue("budget",build.budget);
    setValue("budgetRange",build.budget);
    setValue("resolution",build.resolution);
    setValue("optimizationMode",api.state.optimization);
    setValue("ramTarget",build.ram?.gb);
    setValue("storageTarget",build.storage?.tb);

    document.querySelectorAll(".choice").forEach(btn=>{
      btn.classList.toggle("active",btn.dataset.use===wk);
    });

    api.generateBuild();
    closeMenu();
    get("builder")?.scrollIntoView({behavior:"smooth"});
    toast("Saved build loaded.");
  }

  async function renderMenu(){
    if(!menu) return;

    if(!user){
      menu.innerHTML=
        '<div class="account-profile">'+
          '<div>'+
            '<strong>Smart PC Builder account</strong>'+
            '<small>Sign in to save and manage your builds across visits.</small>'+
          '</div>'+
        '</div>'+
        '<div class="account-actions">'+
          '<button class="account-action primary" data-account-action="signin" type="button">Sign in with Puter</button>'+
        '</div>'+
        '<p class="account-login-note" style="margin-top:10px;">Your saved builds are stored in your own Puter app data rather than this website\'s public JavaScript.</p>';
      return;
    }

    const builds=await loadSavedBuilds();
    const image=avatarFor(user);

    menu.innerHTML=
      '<div class="account-profile">'+
        (image?'<img alt="" src="'+escapeHtml(image)+'">':'<div class="account-avatar" aria-hidden="true"></div>')+
        '<div><strong>'+escapeHtml(displayName(user))+'</strong><small>'+escapeHtml(displayEmail(user))+'</small></div>'+
      '</div>'+
      '<div class="account-actions">'+
        '<button class="account-action" data-account-action="save" type="button">Save current build</button>'+
        '<button class="account-action" data-account-action="refresh" type="button">Refresh saved builds</button>'+
        '<button class="account-action" data-account-action="signout" type="button">Sign out</button>'+
      '</div>'+
      '<div style="margin-top:14px;"><span class="section-kicker" style="font-size:10px;">SAVED BUILDS · '+builds.length+'</span></div>'+
      '<div class="saved-builds">'+
        (builds.length
          ? builds.map(item=>
            '<article class="saved-build">'+
              '<strong>'+escapeHtml(item.title||"Saved build")+'</strong>'+
              '<small>'+escapeHtml(formatDate(item.createdAt))+' · '+escapeHtml("₹"+Number(item.total||0).toLocaleString("en-IN"))+' · '+escapeHtml(String(item.score||0))+'/100</small>'+
              '<div class="saved-build-actions">'+
                '<button type="button" data-load-id="'+escapeHtml(item.id)+'">Load</button>'+
                '<button type="button" data-delete-id="'+escapeHtml(item.id)+'">Delete</button>'+
              '</div>'+
            '</article>'
          ).join("")
          : '<div class="account-empty">No saved builds yet. Generate a build and use “Save build”.</div>')+
      '</div>';

    menu.querySelectorAll("[data-load-id]").forEach(button=>{
      button.addEventListener("click",async()=>{
        const items=await loadSavedBuilds();
        const item=items.find(x=>x.id===button.dataset.loadId);
        if(item) applySavedBuild(item);
      });
    });

    menu.querySelectorAll("[data-delete-id]").forEach(button=>{
      button.addEventListener("click",()=>deleteBuild(button.dataset.deleteId));
    });
  }

  async function refreshAuth(){
    if(!puterReady()) return;

    try{
      const signedIn=puter.auth.isSignedIn();
      if(!signedIn){
        user=null;
      }else{
        user=await puter.auth.getUser();
      }
    }catch(error){
      console.error("Authentication status check failed:",error);
      user=null;
    }

    renderAccountButton();
    if(menu && !menu.hidden) renderMenu();
  }

  async function signIn(){
    if(!puterReady()){
      toast("Account service is still loading. Try again.");
      return;
    }
    try{
      await puter.auth.signIn();
      await refreshAuth();
      if(user){
        toast("Signed in as "+displayName(user)+".");
        openMenu();
      }
    }catch(error){
      console.error("Sign-in failed:",error);
      const code=String(error?.error||"");
      toast(code==="popup_blocked" ? "Allow the sign-in popup and try again." : "Sign-in was cancelled or failed.");
    }
  }

  async function signOut(){
    if(!puterReady()) return;
    try{
      await puter.auth.signOut();
    }catch(error){
      console.error("Sign-out failed:",error);
    }
    user=null;
    closeMenu();
    renderAccountButton();
    toast("Signed out.");
  }

  accountBtn.addEventListener("click",()=>{
    if(!puterReady()){
      toast("Account service is still loading. Try again.");
      return;
    }
    if(menu && !menu.hidden){
      closeMenu();
    }else{
      openMenu();
    }
  });

  if(saveBtn) saveBtn.addEventListener("click",saveBuild);

  document.addEventListener("click",event=>{
    if(!menu || menu.hidden) return;
    if(menu.contains(event.target) || accountBtn.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize",positionMenu);
  window.addEventListener("scroll",positionMenu,true);

  document.addEventListener("click",event=>{
    const action=event.target.closest?.("[data-account-action]");
    if(!action) return;
    const type=action.dataset.accountAction;
    if(type==="signin") signIn();
    if(type==="save") saveBuild();
    if(type==="refresh") renderMenu();
    if(type==="signout") signOut();
  });

  window.addEventListener("spb-build-updated",()=>{
    if(saveBtn) saveBtn.disabled=!user;
  });

  async function boot(){
    let attempts=0;
    while(!puterReady() && attempts<80){
      await new Promise(resolve=>setTimeout(resolve,100));
      attempts++;
    }

    if(!puterReady()){
      accountBtn.textContent="Account unavailable";
      if(saveBtn) saveBtn.disabled=true;
      return;
    }

    await refreshAuth();
    if(saveBtn) saveBtn.disabled=!user;
  }

  boot().catch(error=>console.error("Account system boot failed:",error));

  window.__SPB_ACCOUNT__={
    refresh:refreshAuth,
    signIn,
    signOut,
    saveBuild,
    getUser:()=>user
  };
})();