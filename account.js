(function(){
  "use strict";

  const get = (id) => document.getElementById(id);
  const accountBtn = get("accountBtn");
  const saveBtn = get("saveBuildBtn");
  if (!accountBtn) return;

  let supabaseClient = null;
  let user = null;
  let accountMenu = null;
  let authDialog = null;
  let authMode = "signin";
  const ACCESS_KEY = "spb_access_mode";

  function toast(message){
    if (typeof window.showToast === "function") window.showToast(message);
  }

  function builder(){
    return window.__SMART_PC_BUILDER__ || {};
  }

  function authConfigState(){
    const cfg = window.SMART_PC_AUTH || {};
    if (!window.supabase || typeof window.supabase.createClient !== "function"){
      return { ready:false, message:"Supabase client library did not load. Check your internet connection or CDN access." };
    }
    if (!cfg.url || String(cfg.url).includes("YOUR-PROJECT-REF")){
      return { ready:false, message:"Supabase project URL is missing from supabase-config.js." };
    }
    if (!cfg.anonKey || String(cfg.anonKey).includes("YOUR-SUPABASE-ANON-KEY")){
      return { ready:false, message:"Supabase publishable key is missing from supabase-config.js." };
    }
    try {
      const parsed = new URL(String(cfg.url));
      if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co")) {
        return { ready:false, message:"Supabase project URL in supabase-config.js is invalid." };
      }
    } catch (_error) {
      return { ready:false, message:"Supabase project URL in supabase-config.js is invalid." };
    }
    return { ready:true, message:"" };
  }

  function authConfigReady(){
    return authConfigState().ready;
  }

  function getClient(){
    if (!authConfigReady()) return null;
    if (!supabaseClient){
      const cfg = window.SMART_PC_AUTH;
      supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return supabaseClient;
  }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
  }

  function displayName(u){
    const meta = u && u.user_metadata ? u.user_metadata : {};
    return String(meta.full_name || meta.name || meta.user_name || meta.preferred_username || u?.email || "Account user");
  }

  function displayEmail(u){
    return String(u?.email || "");
  }

  function avatarUrl(u){
    const meta = u && u.user_metadata ? u.user_metadata : {};
    return String(meta.avatar_url || meta.picture || "");
  }

  function redirectUrl(){
    return window.location.origin + window.location.pathname;
  }

  function ensureAuthDialog(){
    if (authDialog) return authDialog;

    authDialog = document.createElement("dialog");
    authDialog.className = "auth-dialog";
    authDialog.innerHTML =
      '<div class="auth-card">' +
        '<button class="auth-close" type="button" data-auth-action="close">Close</button>' +
        '<div class="auth-brand">' +
          '<span class="brand-mark">SPB</span>' +
          '<div><strong>Smart PC Builder account</strong><small>Choose any sign-in method. No Puter account is required.</small></div>' +
        '</div>' +
        '<div class="auth-tabs">' +
          '<button type="button" data-auth-tab="signin" class="active">Sign in</button>' +
          '<button type="button" data-auth-tab="signup">Create account</button>' +
        '</div>' +
        '<div class="auth-socials">' +
          '<button class="auth-provider google" type="button" data-provider="google">Continue with Google</button>' +
          '<button class="auth-provider microsoft" type="button" data-provider="azure">Continue with Microsoft</button>' +
          '<button class="auth-provider github" type="button" data-provider="github">Continue with GitHub</button>' +
        '</div>' +
        '<div class="auth-divider"><span>or use email</span></div>' +
        '<form id="emailAuthForm" class="auth-form">' +
          '<label for="authEmail">Email</label>' +
          '<input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com">' +
          '<label for="authPassword">Password</label>' +
          '<input id="authPassword" type="password" minlength="8" autocomplete="current-password" required placeholder="At least 8 characters">' +
          '<button class="primary-btn full" id="emailAuthBtn" type="submit">Sign in with email</button>' +
          '<button class="auth-link" id="forgotPasswordBtn" type="button">Forgot password?</button>' +
        '</form>' +
        '<p class="auth-message" id="authMessage" role="status"></p>' +
        '<button class="auth-guest" type="button" data-auth-action="guest">Continue as guest</button>' +
      '</div>';

    document.body.appendChild(authDialog);

    authDialog.querySelectorAll("[data-auth-tab]").forEach(button => {
      button.addEventListener("click", () => {
        authMode = button.dataset.authTab;
        authDialog.querySelectorAll("[data-auth-tab]").forEach(x => x.classList.toggle("active", x === button));
        updateAuthMode();
      });
    });

    authDialog.querySelectorAll("[data-provider]").forEach(button => {
      button.addEventListener("click", () => signInWithProvider(button.dataset.provider));
    });

    get("emailAuthForm").addEventListener("submit", event => {
      event.preventDefault();
      submitEmailAuth();
    });

    get("forgotPasswordBtn").addEventListener("click", sendPasswordReset);

    authDialog.addEventListener("click", event => {
      const action = event.target.closest?.("[data-auth-action]");
      if (action?.dataset.authAction === "close") closeAuthDialog();
      if (action?.dataset.authAction === "guest") continueAsGuest();
    });

    authDialog.addEventListener("cancel", closeAuthDialog);
    return authDialog;
  }

  function setAuthMessage(message, kind){
    const node = get("authMessage");
    if (!node) return;
    node.className = "auth-message " + (kind || "");
    node.textContent = message || "";
  }

  function setAuthBusy(busy){
    const dialog = ensureAuthDialog();
    dialog.querySelectorAll("button,input").forEach(el => { el.disabled = Boolean(busy); });
  }

  function updateAuthMode(){
    const submit = get("emailAuthBtn");
    const forgot = get("forgotPasswordBtn");
    const password = get("authPassword");
    if (!submit) return;
    submit.textContent = authMode === "signin" ? "Sign in with email" : "Create account";
    forgot.hidden = authMode !== "signin";
    password.autocomplete = authMode === "signin" ? "current-password" : "new-password";
    setAuthMessage("");
  }

  function continueAsGuest(){
    try { localStorage.setItem(ACCESS_KEY, "guest"); } catch (_error) {}
    user = null;
    renderAccountButton();
    closeAuthDialog();
    updateProtectedFeatures();
    toast("Continuing as guest. Sign in anytime to unlock account features.");
  }

  const PROTECTED_FEATURES = Object.freeze([
    ["saveBuildBtn", "Saved builds"],
    ["shareBtn", "Shareable builds"],
    ["exportJsonBtn", "Build JSON export"],
    ["printBtn", "PDF export"],
    ["alternativesBtn", "Alternative build comparison"],
    ["openAlternativesBtn", "Alternative build comparison"],
    ["aiAskBtn", "AI Assistant"],
    ["aiQuestion", "AI Assistant"]
  ]);

  function updateProtectedFeatures(){
    const locked = !user;
    PROTECTED_FEATURES.forEach(([id, label]) => {
      const node = get(id);
      if (!node) return;
      node.classList.toggle("feature-locked", locked);
      node.setAttribute("data-protected-feature", label);
      if (locked){
        node.setAttribute("aria-disabled", "true");
        node.title = "Sign in to unlock " + label;
      }else{
        node.removeAttribute("aria-disabled");
        if (id === "saveBuildBtn") node.title = "Save build to your account";
      }
    });
  }

  function protectGuestFeature(event){
    if (user) return;
    const target = event.target?.closest?.("[data-protected-feature]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    openAuthDialog("signin");
    setAuthMessage("Sign in to unlock " + target.dataset.protectedFeature + ".", "error");
  }

  function openAuthDialog(mode){
    ensureAuthDialog();
    authMode = mode || "signin";
    authDialog.querySelectorAll("[data-auth-tab]").forEach(x => x.classList.toggle("active", x.dataset.authTab === authMode));
    updateAuthMode();
    if (typeof authDialog.showModal === "function") authDialog.showModal();
    else authDialog.setAttribute("open","");
  }

  function closeAuthDialog(){
    if (!authDialog) return;
    if (typeof authDialog.close === "function" && authDialog.open) authDialog.close();
    else authDialog.removeAttribute("open");
  }

  async function signInWithProvider(provider){
    const supa = getClient();
    if (!supa){
      setAuthMessage(authConfigState().message || "Account login is not configured yet.","error");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("Opening " + (provider === "azure" ? "Microsoft" : provider === "github" ? "GitHub" : "Google") + " sign-in…");

    try{
      const { error } = await supa.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl(),
          ...(provider === "azure" ? { scopes: "email" } : {})
        }
      });
      if (error) throw error;
    }catch(error){
      console.error("OAuth sign-in failed:", error);
      setAuthMessage(error?.message || "Could not start sign-in.","error");
      setAuthBusy(false);
    }
  }

  async function submitEmailAuth(){
    const supa = getClient();
    if (!supa){
      setAuthMessage(authConfigState().message || "Account login is not configured yet.","error");
      return;
    }

    const email = String(get("authEmail")?.value || "").trim();
    const password = String(get("authPassword")?.value || "");
    if (!email || !password) return;

    setAuthBusy(true);
    setAuthMessage(authMode === "signin" ? "Signing you in…" : "Creating your account…");

    try{
      if (authMode === "signin"){
        const { data, error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        user = data?.user || null;
        try { localStorage.setItem(ACCESS_KEY, "authenticated"); } catch (_error) {}
        renderAccountButton();
        closeAuthDialog();
        toast("Signed in successfully.");
      }else{
        const { data, error } = await supa.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl() }
        });
        if (error) throw error;

        if (data?.session){
          user = data?.user || data.session.user || null;
          try { localStorage.setItem(ACCESS_KEY, "authenticated"); } catch (_error) {}
          renderAccountButton();
          closeAuthDialog();
          toast("Account created.");
        }else{
          setAuthMessage("Account created. Check your email to confirm the address, then sign in.","success");
        }
      }
    }catch(error){
      console.error("Email auth failed:", error);
      setAuthMessage(error?.message || "Authentication failed.","error");
    }finally{
      setAuthBusy(false);
    }
  }

  async function sendPasswordReset(){
    const supa = getClient();
    if (!supa){
      setAuthMessage(authConfigState().message || "Account login is not configured yet.","error");
      return;
    }

    const email = String(get("authEmail")?.value || "").trim();
    if (!email){
      setAuthMessage("Enter your email first.","error");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("Sending password reset email…");
    try{
      const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
      if (error) throw error;
      setAuthMessage("Password reset instructions have been sent if the address is registered.","success");
    }catch(error){
      setAuthMessage(error?.message || "Could not send the reset email.","error");
    }finally{
      setAuthBusy(false);
    }
  }

  function ensureMenu(){
    if (accountMenu) return accountMenu;
    accountMenu = document.createElement("div");
    accountMenu.className = "account-menu";
    accountMenu.hidden = true;
    document.body.appendChild(accountMenu);
    return accountMenu;
  }

  function positionMenu(){
    if (!accountMenu || accountMenu.hidden) return;
    const rect = accountBtn.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    accountMenu.style.left = Math.max(12, left) + "px";
    accountMenu.style.top = Math.min(window.innerHeight - accountMenu.offsetHeight - 12, rect.bottom + 10) + "px";
  }

  function closeMenu(){
    if (accountMenu) accountMenu.hidden = true;
  }

  function openMenu(){
    ensureMenu();
    accountMenu.hidden = false;
    renderMenu().finally(positionMenu);
  }

  function renderAccountButton(){
    accountBtn.classList.toggle("signed-in", Boolean(user));
    accountBtn.textContent = "";

    if (!user){
      let guest = false;
      try { guest = localStorage.getItem(ACCESS_KEY) === "guest"; } catch (_error) {}
      accountBtn.textContent = guest ? "Guest" : "Sign in";
      accountBtn.title = guest ? "Guest mode — sign in to unlock account features" : "Sign in or create an account";
      updateProtectedFeatures();
      return;
    }

    accountBtn.textContent = "Account";
    updateProtectedFeatures();

    const avatar = avatarUrl(user);
    if (avatar){
      const image = document.createElement("img");
      image.className = "account-avatar";
      image.alt = "";
      image.src = avatar;
      accountBtn.appendChild(image);
    }

    const label = document.createElement("span");
    label.className = "account-label";
    label.textContent = displayName(user);
    accountBtn.appendChild(label);
    accountBtn.title = "Account: " + displayName(user);
  }

  async function loadSavedBuilds(){
    const supa = getClient();
    if (!supa || !user) return [];
    const { data, error } = await supa
      .from("saved_builds")
      .select("id,title,budget,total,score,build,created_at")
      .order("created_at",{ascending:false})
      .limit(20);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function saveBuild(){
    const build = builder().build;
    if (!build){
      toast("Generate a build before saving it.");
      return;
    }

    if (!user){
      openAuthDialog("signin");
      return;
    }

    const supa = getClient();
    if (!supa){
      toast("Account service is not configured yet.");
      return;
    }

    saveBtn.disabled = true;
    try{
      const { error } = await supa.from("saved_builds").insert({
        user_id: user.id,
        title: build.workload + " · " + build.resolution,
        budget: Number(build.budget) || 0,
        total: Number(build.total) || 0,
        score: Number(build.score) || 0,
        build: JSON.parse(JSON.stringify(build))
      });
      if (error) throw error;
      toast("Build saved to your account.");
      if (accountMenu && !accountMenu.hidden) await renderMenu();
    }catch(error){
      console.error("Saved build write failed:",error);
      toast(error?.message || "Could not save the build.");
    }finally{
      saveBtn.disabled = false;
    }
  }

  async function deleteBuild(id){
    const supa = getClient();
    if (!supa || !user) return;
    try{
      const { error } = await supa.from("saved_builds").delete().eq("id",id);
      if (error) throw error;
      await renderMenu();
      toast("Saved build deleted.");
    }catch(error){
      console.error(error);
      toast(error?.message || "Could not delete the saved build.");
    }
  }

  function applySavedBuild(item){
    const build = item?.build;
    const api = builder();
    if (!build || !api.state || !api.generateBuild){
      toast("Builder is not ready yet.");
      return;
    }

    const byId = (type,id) => (api.catalog?.[type] || []).find(x => x.id === id);
    const workloadMap = {gaming:"gaming",creator:"creator",productivity:"productivity","ai / ml":"ai"};
    const wk = workloadMap[String(build.workload || "").toLowerCase()] || "gaming";

    api.state.useCase = wk;
    api.state.optimization = ["balanced","performance","upgrade"].includes(build.optimization) ? build.optimization : "balanced";
    api.state.headroom = build.headroomPreference !== false;
    api.state.manual = {
      cpuId: byId("cpu",build.cpu?.id)?.id || null,
      gpuId: byId("gpu",build.gpu?.id)?.id || null,
      ramId: byId("ram",build.ram?.id)?.id || null,
      storageId: byId("storage",build.storage?.id)?.id || null
    };

    const setValue = (id,value) => {
      const el = get(id);
      if (el && value != null) el.value = String(value);
    };

    setValue("budget",build.budget);
    setValue("budgetRange",build.budget);
    setValue("resolution",build.resolution);
    setValue("optimizationMode",api.state.optimization);
    setValue("ramTarget",build.ram?.gb);
    setValue("storageTarget",build.storage?.tb);

    const cpuVendor = get("cpuPreference");
    const gpuVendor = get("gpuPreference");
    if (cpuVendor) cpuVendor.value = build.cpu?.brand || "any";
    if (gpuVendor) gpuVendor.value = build.gpu?.brand || "any";

    const headroom = get("headroomToggle");
    if (headroom) headroom.checked = api.state.headroom;

    document.querySelectorAll(".choice").forEach(btn => {
      btn.classList.toggle("active",btn.dataset.use === wk);
    });

    api.generateBuild();
    closeMenu();
    get("builder")?.scrollIntoView({behavior:"smooth"});
    toast("Saved build loaded.");
  }

  async function renderMenu(){
    ensureMenu();

    if (!user){
      accountMenu.innerHTML =
        '<div class="account-profile"><div><strong>Smart PC Builder account</strong><small>Save builds and access them across visits.</small></div></div>' +
        '<div class="account-actions">' +
          '<button class="account-action primary" data-account-action="signin" type="button">Sign in</button>' +
          '<button class="account-action" data-account-action="signup" type="button">Create account</button>' +
        '</div>' +
        '<p class="account-login-note">Choose Google, Microsoft, GitHub, or email/password. Puter is not used for website authentication.</p>';
      return;
    }

    let builds = [];
    let dbError = "";
    try{
      builds = await loadSavedBuilds();
    }catch(error){
      console.error("Saved builds unavailable:",error);
      dbError = "Run supabase-schema.sql in your Supabase project to enable saved builds.";
    }

    const avatar = avatarUrl(user);
    accountMenu.innerHTML =
      '<div class="account-profile">' +
        (avatar ? '<img alt="" src="' + escapeHtml(avatar) + '">' : '<div class="account-avatar" aria-hidden="true"></div>') +
        '<div><strong>' + escapeHtml(displayName(user)) + '</strong><small>' + escapeHtml(displayEmail(user)) + '</small></div>' +
      '</div>' +
      '<div class="account-actions">' +
        '<button class="account-action" data-account-action="save" type="button">Save current build</button>' +
        '<button class="account-action" data-account-action="signout" type="button">Sign out</button>' +
      '</div>' +
      (dbError
        ? '<p class="account-login-note">' + escapeHtml(dbError) + '</p>'
        : '<div style="margin-top:14px;"><span class="section-kicker" style="font-size:10px;">SAVED BUILDS · ' + builds.length + '</span></div>' +
          '<div class="saved-builds">' +
            (builds.length
              ? builds.map(item =>
                  '<article class="saved-build">' +
                    '<strong>' + escapeHtml(item.title || "Saved build") + '</strong>' +
                    '<small>' + escapeHtml(formatDate(item.created_at)) + ' · ₹' + Number(item.total || 0).toLocaleString("en-IN") + ' · ' + escapeHtml(String(item.score || 0)) + '/100</small>' +
                    '<div class="saved-build-actions">' +
                      '<button type="button" data-load-id="' + escapeHtml(item.id) + '">Load</button>' +
                      '<button type="button" data-delete-id="' + escapeHtml(item.id) + '">Delete</button>' +
                    '</div>' +
                  '</article>'
                ).join("")
              : '<div class="account-empty">No saved builds yet. Generate one and choose “Save build”.</div>') +
          '</div>'
      );

    accountMenu.querySelectorAll("[data-load-id]").forEach(button => {
      button.addEventListener("click", async () => {
        try{
          const items = await loadSavedBuilds();
          const item = items.find(x => String(x.id) === String(button.dataset.loadId));
          if (item) applySavedBuild(item);
        }catch(_){
          toast("Could not load saved builds.");
        }
      });
    });

    accountMenu.querySelectorAll("[data-delete-id]").forEach(button => {
      button.addEventListener("click",() => deleteBuild(button.dataset.deleteId));
    });
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

  async function refreshAuth(){
    const supa = getClient();
    if (!supa){
      user = null;
      renderAccountButton();
      if (accountMenu && !accountMenu.hidden) await renderMenu();
      return;
    }

    try{
      const { data, error } = await supa.auth.getSession();
      if (error) throw error;
      user = data?.session?.user || null;
    }catch(error){
      console.error("Authentication check failed:",error);
      user = null;
    }

    renderAccountButton();
    if (accountMenu && !accountMenu.hidden) await renderMenu();
  }

  async function signOut(){
    const supa = getClient();
    if (!supa) return;
    const { error } = await supa.auth.signOut();
    if (error) console.error("Sign-out failed:",error);
    user = null;
    closeMenu();
    renderAccountButton();
    toast(error ? "Signed out locally." : "Signed out.");
  }

  document.addEventListener("pointerdown", protectGuestFeature, true);
  document.addEventListener("click", protectGuestFeature, true);
  document.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") protectGuestFeature(event);
  }, true);

  accountBtn.addEventListener("click",() => {
    if (!authConfigReady()){
      openAuthDialog("signin");
      setAuthMessage("Add your Supabase project URL and public anon/publishable key to supabase-config.js.","error");
      return;
    }
    if (user){
      if (accountMenu && !accountMenu.hidden) closeMenu();
      else openMenu();
    }else{
      openAuthDialog("signin");
    }
  });

  if (saveBtn) saveBtn.addEventListener("click",saveBuild);

  document.addEventListener("click",event => {
    const action = event.target.closest?.("[data-account-action]");
    if (!action) return;
    const type = action.dataset.accountAction;
    if (type === "signin") openAuthDialog("signin");
    if (type === "signup") openAuthDialog("signup");
    if (type === "save") saveBuild();
    if (type === "signout") signOut();
  });

  document.addEventListener("click",event => {
    if (!accountMenu || accountMenu.hidden) return;
    if (accountMenu.contains(event.target) || accountBtn.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize",positionMenu);
  window.addEventListener("scroll",positionMenu,true);

  const supa = getClient();
  if (supa){
    supa.auth.onAuthStateChange((_event,session) => {
      user = session?.user || null;
      if (user) { try { localStorage.setItem(ACCESS_KEY, "authenticated"); } catch (_error) {} }
      renderAccountButton();
      updateProtectedFeatures();
      if (accountMenu && !accountMenu.hidden) renderMenu();
    });
    refreshAuth().then(() => {
      let mode = "";
      try { mode = localStorage.getItem(ACCESS_KEY) || ""; } catch (_error) {}
      if (!user && mode !== "guest") openAuthDialog("signin");
    }).catch(error => console.error("Account boot failed:",error));
  }else{
    renderAccountButton();
    updateProtectedFeatures();
    let mode = "";
    try { mode = localStorage.getItem(ACCESS_KEY) || ""; } catch (_error) {}
    if (mode !== "guest") openAuthDialog("signin");
  }

  window.__SPB_ACCOUNT__ = {
    refresh: refreshAuth,
    signIn: () => openAuthDialog("signin"),
    signUp: () => openAuthDialog("signup"),
    signOut,
    saveBuild,
    getUser: () => user,
    configured: authConfigReady
  };
})();