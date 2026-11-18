  // ================= запуск =================
  readHash(); render();
  (async () => {
    if (!CFG.SUPABASE_URL || /ВСТАВЬ|YOUR/i.test(CFG.SUPABASE_URL) || !window.supabase){
      $("sMain").innerHTML = `<div class="s-empty" style="margin-top:20px"><b>Сайт ещё не подключён к базе</b>Открой файл config.js и вставь адрес и ключ проекта Supabase, как написано в инструкции.</div>`;
      return;
    }
    const recoveryLink = /type=recovery/.test(location.hash);
    SB = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}});
    SB.auth.onAuthStateChange(ev => { if (ev === "PASSWORD_RECOVERY") setTimeout(() => passwordSheet(true), 600); });
    bootWD = setTimeout(netFail, 12000);
    if (recoveryLink) setTimeout(() => { if (/access_token|type=recovery/.test(location.hash)) history.replaceState(null, "", location.pathname + "#games"); }, 1500);
    const {data: {session}} = await SB.auth.getSession();
    if (session) start(session.user); else { netOk(); if (pendingTl) guestTier(pendingTl); else authScreen(); }
  })();
