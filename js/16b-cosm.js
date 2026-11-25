  // ================= 6.2: оформление профиля — темы, рамки, эффекты, порядок блоков =================
  // Всё открывается само за дела на сайте и лежит в «Оформлении»; надевает человек сам.
  // Темы и эффекты встроены в сайт, рамки и свои темы загружает админ (таблица cosmetics).
  // Оформление действует только внутри страницы профиля — ленту, полки и меню не трогает.
  const CS_THEMES = [
    {id: "base", t: "Обычная", d: "Как было", u: {t: "free"}},
    {id: "glass", t: "Матовое стекло", d: "Прозрачные карточки, фон видно сквозь всё", u: {t: "free"}},
    {id: "chrome", t: "Y2K хром", d: "Серебро, глянец, хромированный ник", u: {t: "lvl", n: 3}},
    {id: "neon", t: "Неон", d: "Светящиеся рамки, ночной город", u: {t: "lvl", n: 5}},
    {id: "vhs", t: "VHS", d: "Кассета 2003 года: полосы, сдвиг цвета", u: {t: "streak", n: 5}},
    {id: "blood", t: "Кровь", d: "Тёмно-красная, для тех, кто не жалеет", u: {t: "drops", n: 5}},
    {id: "manga", t: "Манга", d: "Бумага, тушь и растр", u: {t: "first", n: 5}},
    {id: "gold", t: "Золото чемпиона", d: "Только для победителей сезона", u: {t: "cup"}},
  ];
  const CS_FX = [
    {id: "", t: "Без эффекта", u: {t: "free"}},
    {id: "snow", t: "Снег", d: "Медленный снег на фоне", u: {t: "free"}},
    {id: "embers", t: "Искры", d: "Угли поднимаются снизу", u: {t: "lvl", n: 4}},
    {id: "rain", t: "Дождь", d: "Косой ночной дождь", u: {t: "weeks", n: 1}},
    {id: "petals", t: "Лепестки", d: "Сакура, как в аниме", u: {t: "lvl", n: 8}},
    {id: "dust", t: "Пыль в луче", d: "Пылинки висят в воздухе", u: {t: "streak", n: 3}},
    {id: "gold", t: "Золотые искры", d: "Для чемпионов", u: {t: "top3"}},
  ];
  const CS_FLOORS = [["games", "Игры"], ["kino", "Кино и сериалы"], ["books", "Книги, манга, комиксы"], ["tl", "Тир-листы"], ["sc", "Витрины"]];
  let COSM = null, COSM_OFF = false, cosmLoading = null;
  async function loadCosm(force){
    if (!SB || !ME || COSM_OFF) return; if (COSM && !force) return; if (cosmLoading) return cosmLoading;
    cosmLoading = (async () => {
      const r = await fetchAll(() => SB.from("cosmetics").select("*"), ["created_at", "id"]);
      if (r.error){ if (/cosmetics|does not exist|schema cache/i.test(r.error.message || "")) COSM_OFF = true; else logErr("загрузка оформления", r.error); COSM = []; } else COSM = r.data || [];
      cosmLoading = null; render();
    })();
    return cosmLoading;
  }
  // ---- опыт и уровень: за дела, а не за размер импорта
  const csXp = uid => typeof v6Acts === "function" ? v6Acts(uid).reduce((s, a) => s + a.p, 0) : 0;
  const csLevel = uid => { const xp = csXp(uid), lv = 1 + Math.floor(xp / 30); return {lv, xp, pct: (xp % 30) / 30 * 100, next: lv * 30}; };
  function csMaxStreak(uid){ const days = [...new Set(v6Acts(uid).map(a => a.d))].sort(); let best = 0, cur = 0, prev = ""; days.forEach(d => { cur = prev && addDays(prev, 1) === d ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }); return best; }
  function csWeeks(uid){ let n = 0, ws = v6WeekStart(V6_START + "-01"); const cur = v6WeekStart(); for (; ws <= cur; ws = addDays(ws, 7)) if (v6Tasks(uid, ws).every(t => t.done)) n++; return n; }
  const csStats = uid => { if (!FR) return null; const g = (ME && uid === ME.id ? MYITEMS : FR.items.filter(i => i.uid === uid)).filter(isGame);
    return {lvl: csLevel(uid).lv, streak: csMaxStreak(uid), drops: g.filter(i => gStatus(i.status) === "dropped").length, first: v6FirstN(uid), cup: v6Cups(uid).length, top3: v6Hall().filter(h => h.top.some(x => x.p.user_id === uid)).length, weeks: csWeeks(uid), done: g.filter(i => gStatus(i.status) === "done").length}; };
  const csAdm = uid => !!(IS_ADMIN && ME && uid === ME.id); // админу на своём профиле всё открыто
  const csOk = (u, st) => { u = u || {t: "free"}; if (u.t === "free") return true; if (!st) return false; if (u.t === "cup" || u.t === "top3") return st[u.t] >= 1; return (st[u.t] || 0) >= (u.n || 1); };
  const csNeed = u => { u = u || {}; return u.t === "lvl" ? `откроется на ${u.n} уровне` : u.t === "streak" ? `серия ${u.n} ${plural(u.n, "день", "дня", "дней")} подряд` : u.t === "drops" ? `дропни ${u.n} ${plural(u.n, "игру", "игры", "игр")}` : u.t === "first" ? `первооткрыватель ${u.n} раз` : u.t === "cup" ? "выиграй сезон" : u.t === "top3" ? "попади в тройку сезона" : u.t === "weeks" ? `закрой все задания недели ${u.n === 1 ? "один раз" : u.n + " раза"}` : u.t === "done" ? `пройди ${u.n} ${plural(u.n, "игру", "игры", "игр")}` : ""; };
  const csFrAll = () => (COSM || []).filter(c => c.kind === "frame");
  // 7.20: личные рамки — data.users: список uid, кому рамка доступна; пусто — всем
  const csFrAud = f => { const a = f && f.data && f.data.users; return Array.isArray(a) && a.length ? a : null; };
  const csFrFor = (f, uid) => { const a = csFrAud(f); return !a || a.includes(uid); };
  const csFrames = () => csFrAll().filter(f => IS_ADMIN || csFrFor(f, ME && ME.id)); // что видно в окне выбора
  const csAudHTML = sel => FR && FR.profiles.length ? `<div class="cs-aud"><b>Для кого</b><small>Никого не отмечай — рамка для всех (по условию открытия). Отметь людей — рамка станет личной, только для них и без условий.</small><div class="cs-aud-l">${FR.profiles.map(x => `<label><input type="checkbox" data-aud="${esc(x.user_id)}"${(sel || []).includes(x.user_id) ? " checked" : ""}> ${esc(x.nick || "?")}</label>`).join("")}</div></div>` : "";
  const csAudRead = root => [...root.querySelectorAll("[data-aud]:checked")].map(i => i.dataset.aud);
  const csThemesAll = () => [...CS_THEMES, ...(COSM || []).filter(c => c.kind === "theme").map(c => ({id: "db:" + c.id, t: c.title, d: (c.data && c.data.d) || "", u: c.unlock, db: c}))];
  // ================= 7.0: шапка-картинка/гифка и шрифты разделов =================
  const CS_FONTS = [["", "Как на сайте"], ["Unbounded", "Unbounded", "800"], ["Russo One", "Russo One"], ["Rubik Mono One", "Rubik Mono"], ["Press Start 2P", "Пиксельный"], ["Oswald", "Oswald", "700"], ["Montserrat Alternates", "Montserrat Alt", "800"], ["Comfortaa", "Comfortaa", "700"], ["Playfair Display", "Playfair", "800"], ["Ruslan Display", "Ruslan"], ["Lobster", "Lobster"], ["Pacifico", "Pacifico"], ["Caveat", "Caveat", "700"], ["Bad Script", "Bad Script"], ["Neucha", "Neucha"], ["JetBrains Mono", "JetBrains Mono", "700"]];
  const CS_SECS = [["nick", "Ник в шапке"], ["head", "Текст шапки"], ["fh", "Названия этажей: Игры, Кино…"], ["box", "Все заголовки разделов"], ["gfav", "Любимые игры"], ["gdone", "Пройденные"], ["gyt", "Прошёл на YouTube"], ["gdrop", "Дроп"], ["kfav", "Любимые фильмы и сериалы"], ["know", "Смотрю"], ["kseen", "Просмотренные"], ["kplan", "Буду смотреть"], ["rfav", "Любимые тайтлы"], ["rnow", "Сейчас читаю"], ["rdone", "Прочитанные"]];
  const CS_SEC_BY_T = {"Любимые игры": "gfav", "Пройденные": "gdone", "Прошёл на YouTube": "gyt", "Дроп": "gdrop", "Любимые фильмы и сериалы": "kfav", "Смотрю": "know", "Просмотренные": "kseen", "Буду смотреть": "kplan", "Любимые тайтлы": "rfav", "Сейчас читаю": "rnow", "Прочитанные": "rdone"};
  const CS_HH = [["s", "Компактная"], ["m", "Обычная"], ["l", "Высокая"], ["xl", "Огромная"]];
  let CS_PREV = null; // черновик из «Оформления»: свой профиль за окном сразу показывает изменения
  const csCosm = p => CS_PREV && ME && p && (!p.user_id || p.user_id === ME.id) ? CS_PREV : ((p && p.cosm) || {});
  const csNum = (v, a, b, d) => v !== "" && v != null && Number.isFinite(+v) ? Math.max(a, Math.min(b, +v)) : d;
  const csCol = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : "";
  const csFam = f => { const x = CS_FONTS.find(a => a[0] && a[0] === f); return x ? `"${x[0]}",${/Mono|Press/.test(x[0]) ? "monospace" : /Caveat|Script|Pacifico|Lobster|Neucha/.test(x[0]) ? "cursive" : "sans-serif"}` : ""; };
  function csFontLoad(fams){
    [...new Set(fams.filter(Boolean))].forEach(f => { const x = CS_FONTS.find(a => a[0] === f), id = "csf-" + f.replace(/\W/g, ""); if (!x || document.getElementById(id)) return;
      const l = document.createElement("link"); l.rel = "stylesheet"; l.id = id; l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, "+")}${x[2] ? ":wght@" + x[2] : ""}&display=swap`; document.head.appendChild(l); });
  }
  // картинка шапки: что надето (или черновик), с проверкой чисел
  function csHdr(p){ const h = csCosm(p).hdr; if (!h || !(h.img || h.blob)) return null;
    return {url: h.blob || publicUrl(h.img), h: ["s", "m", "l", "xl"].includes(h.h) ? h.h : "m", dim: csNum(h.dim, 0, 90, 35), x: csNum(h.x, 0, 100, 50), y: csNum(h.y, 0, 100, 50), blur: csNum(h.blur, 0, 16, 0)}; }
  // шрифты, размеры и цвета разделов — стили только внутри профиля
  function csCss(p, root){ const T = csCosm(p).txt; if (!T || typeof T !== "object") return "";
    const S = root || "#aMain .pf", H = `${S} .pf-head`;
    const sel = {nick: `${H} .pf-id h1`, head: `${H} .d7-k,${H} .d7-k *,${H} .d7-row,${H} .d7-row *,${H} .d7-play .lbl`, fh: `${S} .pf-fh h2`, box: `${S} .pf-box>header h3`};
    let css = ""; const fams = [];
    CS_SECS.forEach(([k]) => { const v = T[k]; if (!v || typeof v !== "object") return;
      const fam = csFam(v.f), col = csCol(v.c), sz = csNum(v.s, 60, 220, 100) / 100;
      if (!fam && !col && sz === 1) return; if (fam) fams.push(v.f);
      css += `${sel[k] || `${S} .pf-box[data-sk="${k}"]>header h3`}{${fam ? `font-family:${fam}!important;` : ""}${col ? `color:${col}!important;background:none!important;-webkit-text-fill-color:${col}!important;text-shadow:none!important;` : ""}${sz !== 1 ? `--ts:${sz};` : ""}}`;
      if (fam && !sel[k] || k === "box" && fam) css += `${k === "box" ? `${S} .pf-box` : `${S} .pf-box[data-sk="${k}"]`} .ti{font-family:${fam}}`;
    });
    csFontLoad(fams); return css ? `<style>${css}</style>` : ""; }

  // что человек надел — с проверкой, что это у него открыто (чужое не покажем)
  function csOf(p){
    const c = csCosm(p), st = FR ? csStats(p.user_id) : null;
    const th = csThemesAll().find(x => x.id === c.theme), fx = CS_FX.find(x => x.id === c.fx), fr = csFrAll().find(x => x.id === c.frame);
    const ok = u => csAdm(p.user_id) || csOk(u, st);
    return {theme: th && ok(th.u) ? th : null, fx: fx && fx.id && ok(fx.u) ? fx : null, frame: fr && (csFrFor(fr, p.user_id) || csAdm(p.user_id)) && ok(fr.unlock) ? fr : null, layout: Array.isArray(c.layout) ? c.layout : null, hide: Array.isArray(c.hide) ? c.hide : []};
  }
  // ---- для renderProfile: класс темы, рамка, порядок блоков
  function csPfAttrs(p){ if (!COSM && !COSM_OFF) loadCosm(); const o = csOf(p), t = o.theme;
    if (!t || t.id === "base") return {cls: "", style: ""};
    if (t.db){ const d = t.db.data || {}; return {cls: " v6t v6t-db" + (d.style ? " v6t-" + esc(d.style) : ""), style: `${d.ac ? `--ac:${esc(d.ac)};--tac:${esc(d.ac)};` : ""}${t.db.img ? `--tbg:url('${publicUrl(t.db.img)}');` : ""}`}; }
    return {cls: " v6t v6t-" + t.id, style: ""}; }
  // 7.19: масштаб и сдвиг рамки подгоняет админ при загрузке (data.s — % от аватарки, x/y — сдвиг в %)
  const csFrGeo = f => { const d = (f && f.data) || {}; return {s: csNum(d.s, 60, 300, 128), x: csNum(d.x, -40, 40, 0), y: csNum(d.y, -40, 40, 0)}; };
  const csFrPrev = f => { const g = csFrGeo(f), a = 62; return ` style="width:${Math.round(a * g.s / 100)}px;height:${Math.round(a * g.s / 100)}px;left:calc(50% + ${(a * g.x / 100).toFixed(1)}px);top:calc(50% + ${(a * g.y / 100).toFixed(1)}px)"`; };
  function csFrameHTML(p){ const f = csOf(p).frame; if (!f || !f.img) return ""; const g = csFrGeo(f);
    return `<img class="v6-frame" alt="" src="${publicUrl(f.img)}" draggable="false" style="width:${g.s}%;height:${g.s}%;left:${50 + g.x}%;top:${50 + g.y}%">`; }
  function csOrder(p, floors){ const o = csOf(p), keys = CS_FLOORS.map(x => x[0]), ord = (o.layout || keys).filter(k => keys.includes(k)); keys.forEach(k => { if (!ord.includes(k)) ord.push(k); });
    return ord.filter(k => !o.hide.includes(k)).map(k => floors[k] || "").join(""); }

  // ---- эффекты: лёгкий canvas поверх фона профиля, без лагов
  let fxRun = null;
  function csFxStop(){ if (fxRun){ cancelAnimationFrame(fxRun.raf); fxRun.cv.remove(); removeEventListener("resize", fxRun.rs); fxRun = null; } }
  function csFxApply(p){
    const o = csOf(p), mine = ME && p.user_id === ME.id, off = !o.fx || (!mine && lsGet("nexus_fx_off") === "1") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!off && fxRun && fxRun.kind === o.fx.id && fxRun.uid === p.user_id && fxRun.cv.isConnected) return;
    csFxStop(); if (off) return;
    const host = document.querySelector("#aMain .pf"); if (!host) return;
    const cv = document.createElement("canvas"); cv.className = "v6-fx"; cv.setAttribute("aria-hidden", "true"); document.body.appendChild(cv);
    const x = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1), mob = innerWidth < 700, kind = o.fx.id;
    let W, H; const rs = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }; rs(); addEventListener("resize", rs);
    const N = {snow: 70, embers: 45, rain: 90, petals: 28, dust: 55, gold: 40}[kind] * (mob ? .55 : 1) | 0, R = Math.random;
    const mk = (init) => { const q = {x: R() * W, y: init ? R() * H : (kind === "embers" || kind === "gold" ? H + 10 : -10), z: .4 + R() * .6, a: R() * 6.28, s: R()};
      if (kind === "dust") q.y = R() * H; return q; };
    const P = Array.from({length: N}, () => mk(true));
    let last = performance.now();
    const step = t => {
      const dt = Math.min(50, t - last) / 16.7; last = t;
      if (document.hidden){ fxRun.raf = requestAnimationFrame(step); return; }
      x.clearRect(0, 0, W, H);
      for (const q of P){
        q.a += .02 * dt;
        if (kind === "snow"){ q.y += (.35 + q.z * .9) * dt; q.x += Math.sin(q.a) * .3 * dt; x.globalAlpha = .35 + q.z * .5; x.fillStyle = "#fff"; x.beginPath(); x.arc(q.x, q.y, 1 + q.z * 2.2, 0, 6.28); x.fill(); }
        else if (kind === "embers" || kind === "gold"){ q.y -= (.4 + q.z * 1.1) * dt; q.x += Math.sin(q.a * 1.3) * .5 * dt; const life = Math.max(0, Math.min(1, q.y / H)); x.globalAlpha = life * (.5 + q.z * .5);
          const g = x.createRadialGradient(q.x, q.y, 0, q.x, q.y, 2 + q.z * 4); g.addColorStop(0, kind === "gold" ? "#fff6c8" : "#ffd28a"); g.addColorStop(.4, kind === "gold" ? "#ffd60a" : "#ff6a1a"); g.addColorStop(1, "rgba(255,80,0,0)"); x.fillStyle = g; x.beginPath(); x.arc(q.x, q.y, 2 + q.z * 4, 0, 6.28); x.fill(); }
        else if (kind === "rain"){ q.y += (7 + q.z * 9) * dt; q.x -= (1.5 + q.z) * dt; x.globalAlpha = .12 + q.z * .25; x.strokeStyle = "#aac8ff"; x.lineWidth = .6 + q.z * .6; x.beginPath(); x.moveTo(q.x, q.y); x.lineTo(q.x + 2.5 + q.z * 2, q.y - 10 - q.z * 12); x.stroke(); }
        else if (kind === "petals"){ q.y += (.5 + q.z * .8) * dt; q.x += (Math.sin(q.a) * .8 + .4) * dt; x.save(); x.translate(q.x, q.y); x.rotate(q.a * 2); x.scale(1, .55 + Math.sin(q.a * 3) * .35); x.globalAlpha = .55 + q.z * .35; x.fillStyle = q.s > .5 ? "#ffc1d6" : "#ffa3c2"; x.beginPath(); x.ellipse(0, 0, 4 + q.z * 4, 2.5 + q.z * 2, 0, 0, 6.28); x.fill(); x.restore(); }
        else if (kind === "dust"){ q.x += Math.sin(q.a * .7) * .15 * dt; q.y += Math.cos(q.a * .5) * .12 * dt - .05 * dt; x.globalAlpha = (.15 + q.z * .35) * (.6 + Math.sin(q.a * 2) * .4); x.fillStyle = "#ffe9c4"; x.beginPath(); x.arc(q.x, q.y, .6 + q.z * 1.4, 0, 6.28); x.fill(); }
        if (q.y > H + 20 || q.y < -20 || q.x < -30 || q.x > W + 30) Object.assign(q, mk(false), kind === "rain" ? {x: R() * (W + 200)} : kind === "dust" ? {x: R() * W, y: R() * H} : {});
      }
      x.globalAlpha = 1; fxRun.raf = requestAnimationFrame(step);
    };
    fxRun = {cv, rs, kind, uid: p.user_id, raf: requestAnimationFrame(step)};
  }
  window.addEventListener("hashchange", () => { if (!["home", "user"].includes(route)) csFxStop(); });

  // ---- окно «Оформление»
  let csTab = "theme";
  function csSheet(again){
    if (!ME) return; if (!COSM && !COSM_OFF) loadCosm();
    if ((!FR || FR.failed) && !again){ toast("Считаю твои достижения…"); loadFriends(true).then(() => csSheet(true)); return; } // пока данные не пришли, всё казалось закрытым
    const p = myProf(), st = csStats(ME.id), L = csLevel(ME.id);
    let cur = {theme: "base", fx: "", frame: "", layout: CS_FLOORS.map(x => x[0]), hide: [], ...((p && p.cosm) || {})};
    cur.txt = JSON.parse(JSON.stringify(cur.txt || {})); cur.hdr = cur.hdr ? {...cur.hdr} : null;
    let hdrFile = null, saved = false, lr = 0;
    const live = () => { CS_PREV = cur; if (lr) return; lr = requestAnimationFrame(() => { lr = 0; if (["home"].includes(route)) render(); }); };
    const s = openSheet(`<h3>Оформление профиля</h3><p class="sub">Открывается само за дела на сайте, надеваешь сам. Видно всем, кто зайдёт к тебе в профиль. Сейчас у тебя <b>${L.lv} уровень</b> (${L.xp} опыта, до следующего ${L.next - L.xp}).</p>
      <div class="cs-tabs" id="csT"></div><div id="csB"></div>
      <div class="acts" style="margin-top:16px"><button class="ib blue" id="csOk">Сохранить</button><button class="ib" id="csNo">Отмена</button><label class="cs-fxoff"><input type="checkbox" id="csFxOff" ${lsGet("nexus_fx_off") === "1" ? "checked" : ""}>Не показывать мне эффекты в чужих профилях</label></div>`, {wide: true, onClose: () => { document.body.classList.remove("cs-docked"); CS_PREV = null; if (lr) cancelAnimationFrame(lr); if (cur.hdr && cur.hdr.blob) URL.revokeObjectURL(cur.hdr.blob); if (route === "home") render(); }});
    // 7.18: на широком экране окно прижимается к правому краю, а профиль слева остаётся виден и меняется на глазах
    if (window.matchMedia("(min-width: 1000px)").matches){ s.el.closest(".sh-wrap").classList.add("cs-dock"); document.body.classList.add("cs-docked"); }
    const q = sel => s.el.querySelector(sel);
    const lock = u => !(IS_ADMIN || csOk(u, st));
    const card = (on, locked, prev, t, d, u, attr) => `<button type="button" class="cs-c${on ? " on" : ""}${locked ? " lk" : ""}" ${locked ? "disabled" : attr}>${prev}<b>${esc(t)}</b><small>${locked ? esc(csNeed(u)) + (u && st && st[u.t] != null && u.n ? ` — сейчас ${st[u.t]} из ${u.n}` : "") : esc(d || "")}</small></button>`;
    const draw = () => {
      q("#csT").innerHTML = [["theme", "Темы"], ["hdr", "Шапка"], ["txt", "Шрифты"], ["frame", "Рамки"], ["fx", "Эффекты"], ["layout", "Блоки"]].map(([k, l]) => `<button type="button" data-cst="${k}" aria-pressed="${csTab === k}">${l}</button>`).join("");
      let h = "";
      if (csTab === "theme") h = `<div class="cs-g">${csThemesAll().map(t => card(cur.theme === t.id, lock(t.u), `<span class="cs-pv v6t-pv-${t.db ? "db" : t.id}" style="${t.db && t.db.img ? `background-image:url('${publicUrl(t.db.img)}')` : ""}${t.db && t.db.data && t.db.data.ac ? `;--tac:${esc(t.db.data.ac)}` : ""}"><i></i><i></i><i></i></span>`, t.t, t.d, t.u, `data-csv="theme:${esc(t.id)}"`)).join("")}</div>${IS_ADMIN && !COSM_OFF ? `<button type="button" class="ib cs-adm" data-csadd="theme">+ Своя тема (фон и цвет)</button>` : ""}`;
      else if (csTab === "frame") h = COSM_OFF ? `<p class="a-sub">Рамки появятся после обновления базы.</p>` : `<div class="cs-g">${card(!cur.frame, false, `<span class="cs-pv fr">${avaHTML(p, "big")}</span>`, "Без рамки", "", null, `data-csv="frame:"`)}${csFrames().map(f => card(cur.frame === f.id, lock(f.unlock), `<span class="cs-pv fr">${avaHTML(p, "big")}<img alt="" src="${publicUrl(f.img)}"${csFrPrev(f)}></span>`, f.title, (f.data && f.data.d) || "", f.unlock, `data-csv="frame:${esc(f.id)}"`)).join("")}</div>${csFrames().length ? "" : `<p class="a-sub">Рамок пока нет — их рисует и загружает админ.</p>`}${IS_ADMIN ? `<button type="button" class="ib cs-adm" data-csadd="frame">+ Загрузить рамки</button>${csFrames().length ? `<div class="cs-fadj"><small>Подогнать масштаб и сдвиг:</small>${csFrames().map(f => `<button type="button" class="ib" data-csfadj="${esc(f.id)}">${esc(f.title)}${csFrAud(f) ? " · личная" : ""}</button>`).join("")}</div>` : ""}` : ""}`;
      else if (csTab === "fx") h = `<div class="cs-g">${CS_FX.map(f => card(cur.fx === f.id, lock(f.u), `<span class="cs-pv fx fx-${f.id || "none"}"></span>`, f.t, f.d, f.u, `data-csv="fx:${esc(f.id)}"`)).join("")}</div><p class="a-sub" style="margin-top:8px">Эффекты не грузят телефон: на слабых экранах частиц меньше, а при «уменьшении движения» их нет совсем.</p>`;
      else if (csTab === "hdr"){ const d = cur.hdr || {}, has = !!(d.img || d.blob), H = has ? csHdr({cosm: {hdr: d}}) : null;
        h = `<p class="a-sub">Картинка или гифка во всю шапку профиля — поверх фона профиля. GIF до 12 МБ, обычные картинки любые (сожмём сами).</p>
          <div class="cs-hp${has ? " hb-" + H.h : " blank"}" id="csHp" role="button" tabindex="0">${has ? `<i id="csHpI"></i><div class="d7-dim" id="csHpD"></div>` : `<span>Нажми, чтобы выбрать картинку или GIF</span>`}<b>${esc(p.nick || NICK)}</b></div>
          <div class="acts" style="margin:10px 0 4px"><button type="button" class="ib" data-cshp="1">${has ? "Другая картинка" : "Выбрать файл"}</button>${has ? `<button type="button" class="ib red" data-cshx="1">Убрать</button>` : ""}</div>
          ${has ? `<div class="cs-lbl">Высота</div><div class="cs-tabs cs-hh">${CS_HH.map(([k, l]) => `<button type="button" data-cshh="${k}" aria-pressed="${H.h === k}">${l}</button>`).join("")}</div>
          <div class="cs-rgs">${[["dim", "Затемнение", 0, 90, 5, H.dim, "%"], ["y", "Сдвиг вверх-вниз", 0, 100, 1, H.y, "%"], ["x", "Сдвиг влево-вправо", 0, 100, 1, H.x, "%"], ["blur", "Размытие", 0, 16, 1, H.blur, "px"]].map(([k, l, a, b, st, v, u]) => `<label class="cs-rg"><span>${l}<em data-csrv="${k}">${v}${u}</em></span><input type="range" min="${a}" max="${b}" step="${st}" value="${v}" data-csr="${k}" data-u="${u}"></label>`).join("")}</div>` : ""}`; }
      else if (csTab === "txt"){ const T = cur.txt; csFontLoad(CS_FONTS.map(f => f[0]));
        h = `<p class="a-sub">Шрифт, размер и цвет для ника и каждого раздела профиля. «Все заголовки разделов» — для всех сразу, отдельный раздел его перебивает. Ниже сразу видно, как это будет выглядеть у тебя в профиле — в твоей теме и с выбранным цветом.</p>${pvBox()}<div class="cs-ft">${CS_SECS.map(([k, l]) => { const v = T[k] || {}, s = csNum(v.s, 60, 220, 100), dirty = v.f || csCol(v.c) || s !== 100;
          return `<div class="cs-fr${k === "box" || k === "nick" ? " big" : ""}"><b>${esc(l)}</b><select data-csf="${k}" aria-label="Шрифт: ${esc(l)}">${CS_FONTS.map(([f, n]) => `<option value="${esc(f)}"${f === (v.f || "") ? " selected" : ""}${f ? ` style="font-family:${esc(csFam(f))}"` : ""}>${esc(n)}</option>`).join("")}</select><label class="cs-sz" title="Размер"><input type="range" min="60" max="${k === "nick" ? 160 : 220}" step="10" value="${s}" data-css="${k}" aria-label="Размер: ${esc(l)}"><em>${s}%</em></label><label class="cs-cl${csCol(v.c) ? "" : " def"}" title="Цвет"><input type="color" value="${csCol(v.c) || "#ffffff"}" data-csc="${k}" aria-label="Цвет: ${esc(l)}"></label><button type="button" class="cs-x" data-csx="${k}" ${dirty ? "" : "disabled"} title="Как было">×</button></div>`; }).join("")}</div>`; }
      else h = `<p class="a-sub">Порядок блоков в профиле. Стрелками двигай, ненужное прячь.</p><div class="cs-lay">${cur.layout.filter(k => CS_FLOORS.some(f => f[0] === k)).concat(CS_FLOORS.map(f => f[0]).filter(k => !cur.layout.includes(k))).map((k, i, a) => `<div class="cs-lr${cur.hide.includes(k) ? " off" : ""}"><b>${esc(CS_FLOORS.find(f => f[0] === k)[1])}</b><button type="button" data-csmv="${k}:-1" ${i ? "" : "disabled"} aria-label="Выше">↑</button><button type="button" data-csmv="${k}:1" ${i < a.length - 1 ? "" : "disabled"} aria-label="Ниже">↓</button><button type="button" data-cshd="${k}" aria-label="${cur.hide.includes(k) ? "Показать" : "Спрятать"}">${cur.hide.includes(k) ? "показать" : "спрятать"}</button></div>`).join("")}</div>`;
      q("#csB").innerHTML = h; hpPaint();
    };
    // 7.17: живой макет профиля: твоя тема, фон, шапка, аватарка и настоящие стили разделов; шрифты, размер и цвет меняются на нём сразу
    const pvBox = () => { const at = csPfAttrs(p), H = csHdr(p), nk = p.nick || NICK, g = MYITEMS.filter(i => isGame(i) && inLib(i)).map(i => i.title).filter(Boolean);
      const t = n => g[n] || ["Название игры", "Ещё одна игра", "Третья игра"][n], pb = p.bg ? `background:linear-gradient(rgba(0,0,0,${(p.bg_dim ?? 45) / 100}),rgba(0,0,0,${(p.bg_dim ?? 45) / 100})),url('${esc(publicUrl(p.bg))}') center/cover;` : "";
      const row = ks => `<div class="cs-pvr">${ks.map(x => `<span class="cs-pvc"><i></i><span class="ti">${esc(x)}</span></span>`).join("")}</div>`;
      return `<div class="cs-live" style="${pb}"><div id="csPrevCss">${csCss(p, "#csPrev")}</div><div class="pf${at.cls}" id="csPrev" style="${at.style}">
        <section class="pf-head d7${H ? " has-hb hb-" + H.h : ""}">${H ? `<div class="d7-hb" aria-hidden="true"><i style="background-image:url('${esc(H.url)}');background-position:${H.x}% ${H.y}%;${H.blur ? `filter:blur(${H.blur}px);inset:-${H.blur * 2}px;` : ""}"></i></div><div class="d7-dim" style="--dim:${H.dim / 100}"></div>` : ""}
          <div class="d7-top"><div class="pf-ava v6s-${avaShape(p)}">${avaBigHTML(p)}</div><div class="pf-id"><div class="d7-k"><span>ИГРОК</span><span class="pf-lvl">УРОВЕНЬ ${L.lv}</span></div><h1>${esc(nk)}</h1><div class="d7-row"><span>Сейчас играю: ${esc(t(0))}</span></div></div></div></section>
        <div class="pf-fh"><h2>Игры</h2></div>
        <section class="pf-box" data-sk="gfav"><header><h3>Любимые игры<small>3</small></h3></header>${row([t(0), t(1), t(2)])}</section>
        <section class="pf-box" data-sk="gdone"><header><h3>Пройденные<small>2</small></h3></header>${row([t(1), t(2)])}</section></div></div>`; };
    const pvRefresh = () => { const w = q("#csPrevCss"); if (w) w.innerHTML = csCss(p, "#csPrev"); };
    const hpPaint = () => { const I = q("#csHpI"); if (!I || !cur.hdr) return; const H = csHdr({cosm: {hdr: cur.hdr}}); if (!H) return;
      Object.assign(I.style, {backgroundImage: `url('${H.url}')`, backgroundPosition: `${H.x}% ${H.y}%`, filter: H.blur ? `blur(${H.blur}px)` : "", inset: H.blur ? `-${H.blur * 2}px` : "0"}); q("#csHpD").style.setProperty("--dim", H.dim / 100);
      q("#csHp").className = "cs-hp hb-" + H.h; };
    const hpPick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => hpTake(i.files[0]); i.click(); };
    const hpTake = async f => { if (!f || !f.type.startsWith("image/")) return;
      if (f.type === "image/gif" && f.size > 12 * 1024 * 1024){ toast("Гифка тяжелее 12 МБ — профиль будет тормозить. Сожми её"); return; }
      if (f.type !== "image/gif"){ try { const bm = await createImageBitmap(f), k = Math.min(1, 2400 / bm.width);
          if (k < 1 || f.size > 2.5 * 1024 * 1024){ const c = document.createElement("canvas"); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
            f = await new Promise((ok, no) => c.toBlob(b => b ? ok(new File([b], "hdr.jpg", {type: "image/jpeg"})) : no(new Error("canvas")), "image/jpeg", .88)); }
        } catch(err){ logErr("шапка: сжатие картинки", err); } }
      if (cur.hdr && cur.hdr.blob) URL.revokeObjectURL(cur.hdr.blob);
      hdrFile = f; cur.hdr = {h: "m", dim: 35, x: 50, y: 50, blur: 0, ...(cur.hdr || {}), blob: URL.createObjectURL(f)}; draw(); live(); };
    s.el.addEventListener("input", e => { const el = e.target;
      if (el.dataset.csr){ const k = el.dataset.csr; cur.hdr[k] = +el.value; const v = q(`[data-csrv="${k}"]`); if (v) v.textContent = el.value + el.dataset.u; hpPaint(); live(); return; }
      const k = el.dataset.csf || el.dataset.css || el.dataset.csc; if (!k) return; const v = cur.txt[k] = {...(cur.txt[k] || {})};
      if (el.dataset.csf != null) v.f = el.value || undefined;
      else if (el.dataset.css != null){ v.s = +el.value; el.nextElementSibling.textContent = el.value + "%"; }
      else { v.c = el.value; el.parentElement.classList.remove("def"); }
      const x = q(`[data-csx="${k}"]`); if (x) x.disabled = false; pvRefresh(); live(); });
    s.el.addEventListener("click", async e => {
      const t = e.target.closest("[data-cst]"); if (t){ csTab = t.dataset.cst; draw(); return; }
      const v = e.target.closest("[data-csv]"); if (v){ const [k, ...rest] = v.dataset.csv.split(":"); cur[k] = rest.join(":"); draw(); live(); return; }
      const m = e.target.closest("[data-csmv]"); if (m){ const [k, d] = m.dataset.csmv.split(":"); const a = cur.layout.filter(x => CS_FLOORS.some(f => f[0] === x)); CS_FLOORS.forEach(f => { if (!a.includes(f[0])) a.push(f[0]); }); const i = a.indexOf(k), j = i + +d; [a[i], a[j]] = [a[j], a[i]]; cur.layout = a; draw(); live(); return; }
      const hd = e.target.closest("[data-cshd]"); if (hd){ const k = hd.dataset.cshd; cur.hide = cur.hide.includes(k) ? cur.hide.filter(x => x !== k) : [...cur.hide, k]; draw(); live(); return; }
      if (e.target.closest("[data-cshp]") || e.target.closest("#csHp.blank")){ hpPick(); return; }
      if (e.target.closest("[data-cshx]")){ if (cur.hdr && cur.hdr.blob) URL.revokeObjectURL(cur.hdr.blob); cur.hdr = null; hdrFile = null; draw(); live(); return; }
      const hh = e.target.closest("[data-cshh]"); if (hh){ cur.hdr.h = hh.dataset.cshh; draw(); live(); return; }
      const cx = e.target.closest("[data-csx]"); if (cx){ delete cur.txt[cx.dataset.csx]; draw(); live(); return; }
      const fa = e.target.closest("[data-csfadj]"); if (fa){ csFrameAdjust([fa.dataset.csfadj], () => draw()); return; }
      const ad = e.target.closest("[data-csadd]"); if (ad){ csAdmin(ad.dataset.csadd, () => draw()); return; }
    });
    q("#csNo").onclick = () => s.close();
    q("#csOk").onclick = async () => { const b = q("#csOk"); b.disabled = true; lsSet("nexus_fx_off", q("#csFxOff").checked ? "1" : "0");
      try {
        if (hdrFile && cur.hdr){ b.textContent = "Загружаю шапку…"; cur.hdr.img = (await assets.upload(hdrFile, {type: hdrFile.type})).id; hdrFile = null; }
        const out = {...cur, hdr: cur.hdr ? {img: cur.hdr.img, h: cur.hdr.h, dim: cur.hdr.dim, x: cur.hdr.x, y: cur.hdr.y, blur: cur.hdr.blur} : null};
        Object.keys(out.txt || {}).forEach(k => { const v = out.txt[k]; if (!v || !(v.f || csCol(v.c) || csNum(v.s, 60, 220, 100) !== 100)) delete out.txt[k]; });
        if (await saveProf({cosm: out})){ saved = true; toast("Оформление сохранено"); s.close(); }
      } catch(err){ toast(err && err.code ? upErr(err) : "Не сохранилось"); if (!(err && err.code)) logErr("оформление: сохранение", err); }
      b.disabled = false; b.textContent = "Сохранить"; };
    draw();
  }
  // админ: загрузить рамку или свою тему
  function csAdmin(kind, done){
    const UN = [["free", "Сразу всем"], ["lvl", "Уровень"], ["streak", "Серия дней"], ["weeks", "Закрытые недели заданий"], ["first", "Первооткрыватель"], ["drops", "Дропы"], ["done", "Пройдено игр"], ["top3", "Тройка сезона"], ["cup", "Победа в сезоне"]];
    const s = openSheet(`<h3>${kind === "frame" ? "Новая рамка" : "Новая тема"}</h3><p class="sub">${kind === "frame" ? "Можно выбрать сразу несколько файлов — после загрузки каждую рамку подгонишь по аватарке." : "Фон профиля и цвет акцента. Стиль карточек — от одной из встроенных тем."}</p>
      ${kind === "frame" ? CS_FR_GUIDE : ""}
      <label class="v6-fl">Название${kind === "frame" ? " (для нескольких файлов — из имён файлов)" : ""}<input id="caT" maxlength="40"${kind === "frame" ? ` placeholder="Пусто — возьму из имени файла"` : ""}></label><label class="v6-fl">Описание<input id="caD" maxlength="80"></label>
      <label class="v6-fl">${kind === "frame" ? "Картинка рамки" : "Фон (картинка)"}<input type="file" id="caF"${kind === "frame" ? " multiple" : ""} accept="image/png,image/webp,image/apng,image/gif${kind === "theme" ? ",image/jpeg" : ""}"></label>
      ${kind === "theme" ? `<label class="v6-fl">Цвет акцента<input type="color" id="caC" value="#ff375f"></label><label class="v6-fl">Стиль карточек<select id="caS">${CS_THEMES.filter(t => t.id !== "base").map(t => `<option value="${t.id}">${esc(t.t)}</option>`).join("")}</select></label>` : ""}
      ${kind === "frame" ? csAudHTML([]) : ""}
      <label class="v6-fl">Как открывается<select id="caU">${UN.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label><label class="v6-fl">Сколько нужно (уровень, дней, раз)<input id="caN" type="number" min="1" value="3"></label>
      <div class="acts"><button class="ib blue" id="caOk">Загрузить</button><button class="ib" id="caNo">Отмена</button></div>`);
    const q = sel => s.el.querySelector(sel);
    q("#caNo").onclick = () => s.close();
    q("#caOk").onclick = async () => {
      const files = [...q("#caF").files], t0 = q("#caT").value.trim();
      if (kind === "theme"){ if (!t0){ toast("Дай название"); return; } }
      else { if (!files.length){ toast("Выбери картинки рамок"); return; } if (files.length === 1 && !t0 && !files[0].name){ toast("Дай название"); return; } }
      const b = q("#caOk"), u = q("#caU").value, aud = kind === "frame" ? csAudRead(s.el) : [], unlock = aud.length || u === "free" || u === "cup" || u === "top3" ? {t: aud.length ? "free" : u} : {t: u, n: Math.max(1, +q("#caN").value || 1)}, made = [];
      b.disabled = true; b.textContent = "Загружаю…";
      try {
        const list = kind === "theme" ? [files[0] || null] : files;
        for (let n = 0; n < list.length; n++){
          const f = list[n]; if (list.length > 1) b.textContent = `Загружаю ${n + 1} из ${list.length}…`;
          if (f && f.size > 8 * 1024 * 1024){ toast(`«${f.name}» тяжелее 8 МБ — пропускаю`); continue; }
          const img = f ? (await assets.upload(f, {type: f.type})).id : null;
          const base = f ? f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() : "";
          const title = (kind === "frame" && (list.length === 1 ? t0 : "") || base || t0 || "Рамка").slice(0, 40);
          const id = (kind === "frame" ? "fr_" : "th_") + Date.now().toString(36) + (n ? "_" + n : "");
          const row = {id, kind, title, img, data: {d: q("#caD").value.trim(), ...(aud.length ? {users: aud} : {}), ...(kind === "theme" ? {ac: q("#caC").value, style: q("#caS").value} : {})}, unlock};
          const {error} = await SB.from("cosmetics").insert(row); if (error) throw error;
          COSM = [...(COSM || []), {...row, created_at: now()}]; made.push(id);
        }
        toast(made.length > 1 ? `Добавлено рамок: ${made.length}` : "Добавлено в каталог"); s.close();
        if (kind === "frame" && made.length) csFrameAdjust(made, done); else done && done();
      } catch(err){ logErr("загрузка оформления", err); toast("Не получилось: " + (err.message || err)); b.disabled = false; b.textContent = "Загрузить"; }
    };
  }
  // подгонка рамки под аватарку: масштаб и сдвиг, по очереди для всех только что загруженных
  function csFrameAdjust(ids, done){
    const list = ids.map(id => csFrames().find(f => f.id === id)).filter(Boolean); if (!list.length){ done && done(); return; }
    let i = 0;
    const step = () => {
      if (i >= list.length){ done && done(); return; }
      const f = list[i], p = myProf(), cur = {...csFrGeo(f)}, last = i === list.length - 1; let moved = false;
      const s = openSheet(`<h3>Рамка «${esc(f.title)}»${list.length > 1 ? ` · ${i + 1} из ${list.length}` : ""}</h3><p class="sub">Подгони рамку под аватарку так, как она будет в профиле у всех.</p>
        <div class="cs-fa"><div class="pf-ava has-frame v6s-${avaShape(p)}">${avaBigHTML(p)}<img class="v6-frame" id="faImg" alt="" src="${publicUrl(f.img)}" draggable="false"></div></div>
        <div class="cs-rgs">${[["s", "Масштаб", 60, 300, 1, "%"], ["y", "Сдвиг вверх-вниз", -40, 40, 1, "%"], ["x", "Сдвиг влево-вправо", -40, 40, 1, "%"]].map(([k, l, a, b2, st, u]) => `<label class="cs-rg"><span>${l}<em data-fav="${k}">${cur[k]}${u}</em></span><input type="range" min="${a}" max="${b2}" step="${st}" value="${cur[k]}" data-far="${k}"></label>`).join("")}</div>
        ${csAudHTML(csFrAud(f))}
        <div class="acts"><button class="ib blue" id="faOk">${last ? "Сохранить" : "Сохранить и дальше"}</button><button class="ib" id="faSkip">${last ? "Закрыть" : "Пропустить"}</button><button class="ib" id="faReset">Сбросить</button><button class="ib red" id="faDel">Удалить рамку</button></div>`,
        {onClose: () => { if (!moved){ moved = true; done && done(); } }});
      const q = sel => s.el.querySelector(sel), paint = () => { const im = q("#faImg"); im.style.width = im.style.height = cur.s + "%"; im.style.left = (50 + cur.x) + "%"; im.style.top = (50 + cur.y) + "%";
        ["s", "x", "y"].forEach(k => { q(`[data-fav="${k}"]`).textContent = cur[k] + "%"; q(`[data-far="${k}"]`).value = cur[k]; }); };
      paint();
      s.el.addEventListener("input", e => { const k = e.target.dataset && e.target.dataset.far; if (!k) return; cur[k] = +e.target.value; paint(); });
      q("#faReset").onclick = () => { Object.assign(cur, {s: 128, x: 0, y: 0}); paint(); };
      const next = () => { moved = true; s.close(); i++; step(); };
      q("#faDel").onclick = async () => { if (!confirm(`Удалить рамку «${f.title}»? Она пропадёт у всех, кто её носит.`)) return;
        const {error} = await SB.from("cosmetics").delete().eq("id", f.id);
        if (error){ logErr("удаление рамки", error); toast("Не удалилось: " + error.message); return; }
        COSM = (COSM || []).filter(x => x.id !== f.id); toast("Рамка удалена"); next(); };
      q("#faSkip").onclick = () => { if (last){ s.close(); return; } next(); };
      q("#faOk").onclick = async () => { const b = q("#faOk"); b.disabled = true;
        const aud = csAudRead(s.el), data = {...(f.data || {}), s: cur.s, x: cur.x, y: cur.y}; delete data.users; if (aud.length) data.users = aud;
        const patch = aud.length ? {data, unlock: {t: "free"}} : {data}, {error} = await SB.from("cosmetics").update(patch).eq("id", f.id);
        if (error){ logErr("подгонка рамки", error); toast("Не сохранилось: " + error.message); b.disabled = false; return; }
        f.data = data; if (patch.unlock) f.unlock = patch.unlock; toast("Рамка подогнана"); if (last){ moved = true; s.close(); done && done(); } else next(); };
    };
    step();
  }
  const CS_FR_GUIDE = `<div class="cs-gd"><b>Памятка по файлам рамок</b>
    <ul><li><b>Формат:</b> PNG или WebP с прозрачностью. Анимация: WebP (лучше всего), APNG или GIF.</li>
    <li><b>Размер картинки:</b> квадрат 512×512 (можно 400–1024, но строго квадрат).</li>
    <li><b>Центр прозрачный:</b> аватарка видна сквозь рамку. По умолчанию рамка в 1,28 раза больше аватарки, потом подгонишь масштабом.</li>
    <li><b>Вес:</b> до 500 КБ для статики, до 1,5 МБ для анимации. Больше 8 МБ сайт не примет.</li>
    <li><b>Несколько файлов:</b> выбирай сразу пачкой, название берётся из имени файла.</li></ul>
    <details><summary>Гайд по анимированным рамкам</summary>
      <ul><li><b>Какой формат выбрать:</b> анимированный WebP: мягкие края, лёгкий. APNG: тоже мягкие края, но тяжелее. GIF: прозрачность только «есть/нет», края рваные, для рамок плох.</li>
      <li><b>Длина и кадры:</b> цикл 2–4 секунды, 15–24 кадра/с (до 60–90 кадров всего). Первый и последний кадр должны совпадать, иначе будет рывок в конце круга.</li>
      <li><b>Как сделать:</b> нарисуй в After Effects, Photoshop (таймлайн), Blender или Procreate и экспортируй PNG-последовательность с прозрачным фоном (кадры frame_001.png, frame_002.png…).</li>
      <li><b>Собрать в WebP:</b> онлайн на ezgif.com (раздел PNG → WebP / APNG) или командой <code>ffmpeg -framerate 24 -i frame_%03d.png -c:v libwebp -loop 0 -q:v 75 frame.webp</code></li>
      <li><b>Собрать в APNG:</b> <code>ffmpeg -framerate 24 -i frame_%03d.png -plays 0 -f apng frame.apng</code></li>
      <li><b>Не перегружай:</b> много сложных свечений и частиц раздувают вес и греют телефон. Лучше простое кольцо с одним бегущим бликом.</li>
      <li><b>Проверка:</b> после загрузки открой подгонку и посмотри на аватарке. Если тормозит, уменьши до 400×400 или убери кадры.</li></ul>
    </details></div>`;
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-cosm]"); if (b) csSheet(); });

  // ---- «Открыто новое» — один раз на каждую вещь
  let csNoticed = false;
  function csCheckNew(){
    if (csNoticed || !ME || !FR || (!COSM && !COSM_OFF)) return; csNoticed = true;
    const st = csStats(ME.id), all = [...CS_THEMES.map(t => ["th:" + t.id, t.t, t.u]), ...CS_FX.filter(f => f.id).map(f => ["fx:" + f.id, f.t, f.u]), ...csFrames().map(f => ["fr:" + f.id, f.title, f.unlock])];
    let seen; try { seen = JSON.parse(lsGet("nexus_cs_seen") || "null"); } catch(_){ seen = null; /* ожидаемо: битое значение */ }
    const open = all.filter(x => csOk(x[2], st)).map(x => x[0]);
    if (!seen){ lsSet("nexus_cs_seen", JSON.stringify(open)); return; }
    const fresh = all.filter(x => open.includes(x[0]) && !seen.includes(x[0]));
    if (fresh.length){ lsSet("nexus_cs_seen", JSON.stringify(open)); setTimeout(() => toast(`Открыто: ${fresh.map(x => x[1]).join(", ")} — надень в «Оформлении» профиля`), 1200); }
  }
