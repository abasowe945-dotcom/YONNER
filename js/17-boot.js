  // ================= догрузка раздела, если зашли в него раньше фоновой загрузки =================
  window.addEventListener("hashchange", () => { if (!SB || !ME) return;
    const r = route, all = r === "people";
    if ((all || r === "home" || r === "user") && !WALL) loadWall();
    if ((all || r === "home" || r === "user" || r === "vacation") && !VAC) loadVac();
    if ((all || r === "slop") && !SL) loadSlop();
    if ((all || r === "places") && !PL) loadPlaces();
  });

  // ================= service worker и «вышла новая версия» =================
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost"))
    navigator.serviceWorker.register("sw.js").catch(e => { if (!/Security|not supported|denied/i.test(String(e && (e.name + e.message)))) logErr("service worker", e); });
  // приложение на телефоне может висеть открытым днями — при возвращении проверяем, не вышла ли новая версия
  let verBar = null, verAt = 0;
  async function checkNewVer(){
    if (verBar || NEXUS_VER === "?" || Date.now() - verAt < 5 * 60e3 || !navigator.onLine) return; verAt = Date.now();
    try {
      const html = await (await fetch("index.html", {cache: "no-store"})).text(), m = /js\/01-core\.js\?v=([^"&]+)/.exec(html);
      if (!m || m[1] === NEXUS_VER) return;
      verBar = document.createElement("button"); verBar.type = "button"; verBar.className = "ver-bar";
      verBar.style.cssText = "position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99999;padding:11px 18px;border:0;border-radius:999px;background:#0a84ff;color:#fff;font:600 14px Manrope,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.45);cursor:pointer";
      verBar.textContent = "Вышла новая версия NEXUS — обновить"; verBar.onclick = () => location.reload();
      document.body.appendChild(verBar);
    } catch(_){ /* ожидаемо: нет сети — проверим в следующий раз */ }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkNewVer(); });
  setInterval(checkNewVer, 30 * 60e3);

  // ================= запуск =================
  readHash(); render();
  (async () => {
    if (!CFG.SUPABASE_URL || /ВСТАВЬ|YOUR/i.test(CFG.SUPABASE_URL) || !window.supabase){
      $("sMain").innerHTML = `<div class="s-empty" style="margin-top:20px"><b>Сайт ещё не подключён к базе</b>Открой файл config.js и вставь адрес и ключ проекта Supabase, как написано в инструкции.</div>`;
      return;
    }
    const recoveryLink = /type=recovery/.test(location.hash);
    SB = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}, ...(PROXY ? {global: {fetch: pxFetch}} : {})});
    SB.auth.onAuthStateChange(ev => { if (ev === "PASSWORD_RECOVERY") setTimeout(() => passwordSheet(true), 600); });
    bootWD = setTimeout(netFail, 12000);
    if (recoveryLink) setTimeout(() => { if (/access_token|type=recovery/.test(location.hash)) history.replaceState(null, "", location.pathname + "#games"); }, 1500);
    const {data: {session}} = await SB.auth.getSession();
    if (session) start(session.user); else { netOk(); if (pendingTl) guestTier(pendingTl); else authScreen(); }
  })();
