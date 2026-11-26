  // ================= 7.30: конструктор профиля — блоки, раскладки, шапка, фон, трек дня, счётчики =================
  // Всё хранится в profiles.cosm: grid — раскладка и блоки, track — трек дня, cnt — счётчики, bgx — фон профиля.
  // Пока grid не задан, профиль выглядит как раньше («Лаунчер»).
  const LY_NAME = {games: "Игры", kino: "Кино и сериалы", books: "Книги, манга, комиксы", tl: "Тир-листы", sc: "Витрины", ev: "Ближайшие мероприятия", tasks: "Задания недели", nag: "Напоминалки", rx: "Реакции на мои записи", top: "Рейтинг", feed: "Лента друзей", cmp: "Совпадение вкусов", track: "Трек дня", cnt: "Счётчики", lvl: "Уровень", lst: "Цифры профиля"};
  const LY_ONLY_ME = {ev: 1, tasks: 1, nag: 1, rx: 1}, LY_ONLY_THEM = {cmp: 1};
  const LY_LAYS = [["launcher", "Лаунчер", "полки слева, колонка справа"], ["journal", "Журнал", "огромная шапка, блоки парами"], ["wall", "Стена", "полки во всю ширину, крупно"], ["lbx", "Летербокс", "колонка с инфой слева"], ["min", "Минимал", "одна колонка по центру"], ["comic", "Комикс", "панели с наклоном и обводкой"], ["steam", "Steam", "тёмный минимал: узкая колонка, цифры справа"]];
  const LY_SIDE = ["ev", "tasks", "nag", "rx", "top", "feed", "cmp"];
  const lyB = (k, w, z) => ({k, w, z});
  const LY_PRESET = {
    launcher: () => ({lay: "launcher", hd: {}, b: [...["games", "kino", "books", "tl", "sc"].map(k => lyB(k, 4, "m")), ...LY_SIDE.map(k => lyB(k, 1, "s"))]}),
    journal: () => ({lay: "journal", hd: {a: "center", s: "xl"}, b: [lyB("ev", 2, "m"), lyB("tasks", 2, "m"), lyB("games", 4, "m"), lyB("kino", 2, "m"), lyB("books", 2, "m"), lyB("top", 2, "m"), lyB("feed", 2, "m"), lyB("cmp", 2, "m"), lyB("tl", 4, "m"), lyB("sc", 4, "m")]}),
    wall: () => ({lay: "wall", hd: {s: "s"}, b: [lyB("games", 4, "m"), lyB("kino", 4, "m"), lyB("books", 4, "m"), lyB("ev", 1, "m"), lyB("tasks", 1, "m"), lyB("top", 1, "m"), lyB("feed", 1, "m"), lyB("cmp", 1, "m"), lyB("tl", 4, "m"), lyB("sc", 4, "m")]}),
    lbx: () => ({lay: "lbx", hd: {s: "s"}, b: [lyB("games", 4, "m"), lyB("kino", 4, "m"), lyB("books", 4, "m"), lyB("tl", 4, "m"), lyB("sc", 4, "m"), lyB("cmp", 1, "s"), lyB("ev", 1, "s"), lyB("tasks", 1, "s"), lyB("top", 1, "s"), lyB("feed", 1, "s")]}),
    min: () => ({lay: "min", hd: {a: "center"}, b: ["ev", "games", "kino", "books", "cmp", "top", "tl", "sc"].map(k => lyB(k, 4, "m"))}),
    steam: () => ({lay: "steam", hd: {s: "s"}, b: [lyB("games", 4, "m"), lyB("kino", 4, "m"), lyB("books", 4, "m"), lyB("tl", 4, "m"), lyB("sc", 4, "m"), lyB("lvl", 1, "s"), lyB("lst", 1, "s"), lyB("ev", 1, "s"), lyB("cmp", 1, "s"), lyB("top", 1, "s"), lyB("feed", 1, "s")]}),
    comic: () => ({lay: "comic", hd: {a: "right"}, b: [lyB("games", 4, "m"), lyB("ev", 2, "m"), lyB("top", 2, "m"), lyB("kino", 2, "m"), lyB("books", 2, "m"), lyB("tasks", 2, "m"), lyB("feed", 2, "m"), lyB("cmp", 2, "m"), lyB("tl", 4, "m"), lyB("sc", 4, "m")]}),
  };
  let LY_ED = null; // черновик в режиме правки: {grid, track, cnt, bgx, files}
  const lyEditing = mine => !!(LY_ED && mine && ME);
  const lyCos = p => { const own = ME && p && (!p.user_id || p.user_id === ME.id); return LY_ED && own ? LY_ED : (typeof csCosm === "function" ? csCosm(p) : (p && p.cosm) || {}); };
  function lyNorm(g){
    if (!g || typeof g !== "object" || !Array.isArray(g.b)) return null;
    const seen = new Set(), b = g.b.filter(x => x && LY_NAME[x.k] && !seen.has(x.k) && seen.add(x.k)).map(x => ({k: x.k, w: [1, 2, 3, 4].includes(+x.w) ? +x.w : 4, z: x.z === "s" ? "s" : "m"}));
    const hd = g.hd && typeof g.hd === "object" ? g.hd : {};
    return {lay: LY_LAYS.some(l => l[0] === g.lay) ? g.lay : "custom", b, hd: {a: ["left", "center", "right", "over"].includes(hd.a) ? hd.a : "left", n: hd.n === "v" ? "v" : "h", s: ["s", "m", "l", "xl"].includes(hd.s) ? hd.s : "m", mini: !!hd.mini}};
  }
  const lyCfg = p => lyNorm(lyCos(p).grid);
  // ---- шапка
  function lyHeadCls(p){ const c = lyCfg(p); if (!c) return ""; const h = c.hd; return ` hd-a-${h.a} hd-n-${h.n} hd-s-${h.s}${h.mini ? " hd-mini" : ""}`; }
  // ---- блоки
  const lyUrl = u => { try { const x = new URL(String(u || "").trim()); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch(_){ return ""; } };
  function lyTrackHTML(p, mine, ed){
    const t = lyCos(p).track || {}, u = lyUrl(t.u);
    if (!t.t && !u) return mine ? `<div class="pf-card ly-track ly-empty"><h3>🎧 Трек дня</h3><p class="pf-mute">Что сейчас в ушах? Вставь ссылку на Spotify, Яндекс Музыку или YouTube.</p><button type="button" class="pf-eb" data-lytrack="1">${ICON.plus}Поставить трек</button></div>` : "";
    let emb = "";
    const sp = /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)/.exec(u || ""), ym = /music\.yandex\.[a-z]+\/album\/(\d+)\/track\/(\d+)/.exec(u || "");
    if (sp) emb = `<iframe class="ly-emb" loading="lazy" src="https://open.spotify.com/embed/${sp[1]}/${sp[2]}" allow="encrypted-media; clipboard-write" title="Плеер"></iframe>`;
    else if (ym) emb = `<iframe class="ly-emb" loading="lazy" src="https://music.yandex.ru/iframe/#track/${ym[2]}/${ym[1]}" title="Плеер"></iframe>`;
    const src = sp ? "Spotify" : ym ? "Яндекс Музыка" : /youtu/.test(u || "") ? "YouTube" : u ? "ссылка" : "";
    return `<div class="pf-card ly-track"><h3>🎧 Трек дня${mine ? `<button type="button" class="v6-x" data-lytrack="1" title="Изменить" aria-label="Изменить трек">${ICON.edit}</button>` : ""}</h3>
      <div class="ly-tr"><span class="cv"><i></i><i></i><i></i><i></i><i></i></span><span class="t"><b>${esc(t.t || "Без названия")}</b><small>${esc(t.a || "")}</small></span>${u ? `<a class="pf-btn" href="${esc(u)}" target="_blank" rel="noopener">▶ ${esc(src)}</a>` : ""}</div>${emb}</div>`;
  }
  const lyDays = d => Math.round((parseD(today()) - parseD(d)) / 864e5);
  function lyCntHTML(p, mine){
    const list = (Array.isArray(lyCos(p).cnt) ? lyCos(p).cnt : []).filter(x => x && x.l).slice(0, 8);
    if (!list.length) return mine ? `<div class="pf-card ly-cnt ly-empty"><h3>${ICON.clock || ""}Счётчики</h3><p class="pf-mute">«Дней без дропа», «часов в Arena Breakout», «до отпуска» — что угодно.</p><button type="button" class="pf-eb" data-lycnt="1">${ICON.plus}Добавить счётчик</button></div>` : "";
    return `<div class="pf-card ly-cnt"><h3>${ICON.clock || ""}Счётчики${mine ? `<button type="button" class="v6-x" data-lycnt="1" title="Изменить" aria-label="Изменить счётчики">${ICON.edit}</button>` : ""}</h3><div class="ly-cg">${list.map(x => {
      let n = x.v, sub = "";
      if (x.m === "since" && /^\d{4}-\d{2}-\d{2}$/.test(x.d || "")){ n = Math.max(0, lyDays(x.d)); sub = plural(n, "день", "дня", "дней"); }
      else if (x.m === "until" && /^\d{4}-\d{2}-\d{2}$/.test(x.d || "")){ n = Math.max(0, -lyDays(x.d)); sub = n ? plural(n, "день", "дня", "дней") + " осталось" : "сегодня!"; }
      return `<div class="ly-c"><b>${esc(String(n ?? "—"))}</b><small>${esc(sub)}</small><span>${esc(x.l)}</span></div>`; }).join("")}</div></div>`;
  }
  // 7.33: блоки «как в Steam» — уровень в кружке и список цифр профиля ссылками
  function lyLvlHTML(p, mine){
    const uid = mine ? ME.id : p.user_id; if (!uid || typeof csLevel !== "function") return "";
    const L = csLevel(uid), tags = typeof v6Tags === "function" ? v6Tags(uid) : "";
    return `<div class="pf-card ly-lvl"><div class="lv"><span>Уровень</span><b style="--p:${Math.round(L.pct)}">${L.lv}</b></div><small>${L.xp} опыта · до следующего ${L.next - L.xp}</small>${tags ? `<div class="tg">${tags}</div>` : ""}</div>`;
  }
  function lyLstHTML(p, mine){
    const uid = mine ? ME.id : p.user_id; if (!uid) return "";
    const its = mine ? MYITEMS : frItems(uid), rds = mine ? (READS || []) : frReads(uid), g = its.filter(isGame), k = its.filter(i => !isGame(i));
    const tl = FR ? (FR.tierlists || []).filter(t => t.user_id === uid).length : 0;
    const ev = typeof EV !== "undefined" && EV ? EV.members.filter(m => m.user_id === uid && m.status === "going").length : 0;
    const pl = typeof PL !== "undefined" && PL ? new Set(PL.vm.filter(m => m.user_id === uid).map(m => { const v = PL.visits.find(x => x.id === m.visit_id); return v && v.place_id; }).filter(Boolean)).size : 0;
    const fv = r => mine ? "#" + r : `#fv:${esc(uid)}:${r}`;
    const rows = [["Игры", g.filter(inLib).length, fv("games")], ["Пройдено", g.filter(i => inLib(i) && gStatus(i.status) === "done").length, fv("games")], ["Фильмы и сериалы", k.filter(inLib).length, fv("kino")], ["Книги и манга", rds.length, mine ? "#read" : ""], ["Тир-листы", tl, ""], ["Мероприятия", ev, "#events"], ["Заведения", pl, "#places"]];
    return `<div class="pf-card ly-lst">${rows.map(([l, n, h]) => h ? `<a href="${h}"><span>${l}</span><b>${n}</b></a>` : `<div><span>${l}</span><b>${n}</b></div>`).join("")}</div>`;
  }
  function lyCols(p, mine, parts, legacy){
    const ed = lyEditing(mine); let c = lyCfg(p);
    if (!c && !ed) return {html: legacy, cls: ""};
    if (!c) c = lyNorm(LY_PRESET.launcher());
    const body = k => k === "track" ? lyTrackHTML(p, mine, ed) : k === "cnt" ? lyCntHTML(p, mine) : k === "lvl" ? lyLvlHTML(p, mine) : k === "lst" ? lyLstHTML(p, mine) : parts[k] || "";
    const tools = (x, i) => ed ? `<div class="ly-tb"><span class="ly-h" data-lydrag="${x.k}" title="Тащи, чтобы переставить">${ICON.drag}</span><b>${esc(LY_NAME[x.k])}</b>
      ${x.z === "m" ? `<span class="ly-ws">${[1, 2, 3, 4].map(w => `<button type="button" data-lyw="${x.k}:${w}" aria-pressed="${x.w === w}" title="Ширина ${w}/4">${w}</button>`).join("")}</span>` : ""}
      <button type="button" class="ly-z" data-stbb="${x.k}" title="Свой фон за этим блоком">фон</button><button type="button" class="ly-z" data-lyz="${x.k}" title="${x.z === "m" ? "Убрать в колонку сбоку" : "Вернуть в основную часть"}">${x.z === "m" ? "в колонку" : "в основу"}</button><button type="button" class="ly-x" data-lyhide="${x.k}" title="Убрать блок" aria-label="Убрать блок">${ICON.x}</button></div>` : "";
    const blk = (x, i) => { let h = body(x.k);
      if (!h){ if (!ed) return ""; h = `<div class="ly-ph">${LY_ONLY_ME[x.k] ? "Этот блок видишь только ты — друзьям он не покажется" : LY_ONLY_THEM[x.k] ? "Появится, когда к тебе зайдёт друг: ваше совпадение вкусов" : "Пока пусто"}</div>`; }
      return `<div class="ly-b${x.z === "m" ? " w" + x.w : ""}" data-lyk="${x.k}">${tools(x, i)}${h}</div>`; };
    const main = c.b.filter(x => x.z === "m"), side = c.b.filter(x => x.z === "s");
    const sideH = side.map(blk).join(""), mainH = main.map(blk).join("");
    const html = `<div class="ly${sideH || ed && side.length ? " has-side" : ""}${ed ? " ly-edit" : ""}">${mine ? `<button type="button" class="v6-work" id="workHome" data-worksheet="1" hidden></button>` : ""}<div class="ly-main" data-lyzone="m">${mainH}${ed ? `<button type="button" class="ly-add" data-lyadd="1">${ICON.plus}Добавить блок</button>` : ""}</div>${sideH || ed ? `<aside class="ly-side" data-lyzone="s">${sideH}${ed && !side.length ? `<div class="ly-ph sm">Колонка сбоку пуста — перекинь сюда блок кнопкой «в колонку»</div>` : ""}</aside>` : ""}</div>`;
    return {html, cls: ` ly-on lay-${c.lay}`};
  }
  // ---- фон: градиент, узор, видео или гифка, слои параллакса
  const LY_PAT = [["", "Без узора"], ["grid", "Клетка"], ["dots", "Точки"], ["stripes", "Полосы"], ["check", "Шахматы"], ["noise", "Шум"], ["waves", "Волны"], ["stars", "Звёзды"]];
  const lyCol = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : "";
  function lyGrad(x){ const a = lyCol(x.c1) || "#1a1a2e", b = lyCol(x.c2) || "#6a1b9a", c = lyCol(x.c3), ang = Math.round(+x.ang || 135), st = c ? `${a},${b},${c}` : `${a},${b}`;
    return x.gt === "radial" ? `radial-gradient(circle at 50% 30%,${st})` : x.gt === "conic" ? `conic-gradient(from ${ang}deg at 50% 50%,${st},${a})` : `linear-gradient(${ang}deg,${st})`; }
  const lyMedia = id => id ? (String(id).startsWith("blob:") ? id : publicUrl(id)) : "";
  function lyBg(p){
    const x = lyCos(p).bgx; if (!x || typeof x !== "object") return "";
    const layers = (Array.isArray(x.ly) ? x.ly : []).filter(l => l && l.img).slice(0, 3), m = x.media;
    if (!x.grad && !m && !x.pat && !layers.length) return "";
    const dim = Math.max(0, Math.min(90, +x.dim || 0)) / 100, pop = Math.max(5, Math.min(100, +x.pop || 35)) / 100, ps = Math.max(8, Math.min(120, +x.ps || 28));
    const isV = m && /\.(mp4|webm|mov)$/i.test(String(m.id || "")) || (m && m.v);
    return `<div class="lyx" aria-hidden="true">${x.grad ? `<i class="lyx-g" style="background:${lyGrad(x)}"></i>` : ""}
      ${m && m.id ? (isV ? `<video class="lyx-m" src="${esc(lyMedia(m.id))}" autoplay muted loop playsinline preload="metadata"></video>` : `<i class="lyx-m" style="background-image:url('${esc(lyMedia(m.id))}');${m.blur ? `filter:blur(${+m.blur}px);inset:-${+m.blur * 2}px;` : ""}"></i>`) : ""}
      ${x.pat ? `<i class="lyx-p pat-${esc(x.pat)}" style="opacity:${pop};--ps:${ps}px;--pc:${lyCol(x.pc) || "#ffffff"}"></i>` : ""}
      ${layers.map((l, i) => `<img class="lyx-l" alt="" src="${esc(lyMedia(l.img))}" data-dp="${Math.max(-1, Math.min(1, +l.d || (i + 1) * .25))}" style="--ly:${Math.max(-40, Math.min(140, +l.y || 0))}%;--lx:${Math.max(-40, Math.min(140, +l.x || 50))}%;--lw:${Math.max(10, Math.min(160, +l.w || 60))}%;${l.o != null ? `opacity:${Math.max(.05, Math.min(1, +l.o))};` : ""}" draggable="false">`).join("")}
      ${dim ? `<i class="lyx-d" style="opacity:${dim}"></i>` : ""}</div>`;
  }
  // параллакс: слои едут с разной скоростью при прокрутке; на слабых телефонах и при «меньше движения» — стоят
  let lyPx = 0;
  const lyParallax = () => { lyPx = 0; const y = scrollY; document.querySelectorAll(".lyx-l").forEach(el => { el.style.transform = `translate3d(0,${(-y * (+el.dataset.dp || 0) * .5).toFixed(1)}px,0)`; }); };
  window.addEventListener("scroll", () => { if (lyPx || !document.querySelector(".lyx-l")) return; if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; lyPx = requestAnimationFrame(lyParallax); }, {passive: true});
  function lyAfter(p, mine){
    if (typeof stAfter === "function") stAfter(p, mine);
    if (document.querySelector(".lyx-l")) lyParallax();
    document.body.classList.toggle("has-lyx", !!document.querySelector(".lyx"));
    document.body.classList.toggle("ly-editing", lyEditing(mine));
    const v = document.querySelector(".lyx video"); if (v && v.paused){ const r = v.play(); if (r && r.catch) r.catch(() => { /* ожидаемо: браузер не дал автозапуск */ }); }
  }
  // ---- нижняя панель режима правки
  function lyBar(mine){
    if (!lyEditing(mine)) return "";
    const c = lyNorm(LY_ED.grid) || lyNorm(LY_PRESET.launcher());
    return `<div class="ly-bar" role="toolbar" aria-label="Конструктор профиля"><div class="ly-bar-in">
      <div class="ly-lays">${LY_LAYS.map(([k, l, d]) => `<button type="button" data-lylay="${k}" aria-pressed="${c.lay === k}" title="${esc(d)}">${esc(l)}</button>`).join("")}${c.lay === "custom" ? `<button type="button" aria-pressed="true" disabled>Своя</button>` : ""}<span class="sp"></span><button type="button" class="pf-btn" data-lyno="1">Отмена</button><button type="button" class="pf-btn ly-ok" data-lyok="1">Готово</button></div>
      <div class="ly-bacts"><button type="button" class="pf-btn" data-lyhd="1">Шапка</button><button type="button" class="pf-btn" data-stnk="1">Ник</button><button type="button" class="pf-btn" data-lybg="1">Фон</button><button type="button" class="pf-btn" data-stpal="1">Палитра</button><button type="button" class="pf-btn" data-stadd="1">Стикер</button><button type="button" class="pf-btn" data-stsnd="1">${ICON.sound || ""}Звук</button><button type="button" class="pf-btn" data-lyadd="1">${ICON.plus}Блок</button><button type="button" class="pf-btn" data-stgal="1">Темы друзей</button><button type="button" class="pf-btn" data-stsave="1">Сохранить как тему</button><button type="button" class="pf-btn" data-lyreset="1" title="Вернуть профиль как был">Сбросить</button></div></div></div>`;
  }
  const lyJ = o => JSON.parse(JSON.stringify(o == null ? null : o));
  function lyStart(quiet){
    if (!ME) return; if (route !== "home" && !quiet){ go("home"); setTimeout(lyStart, 400); return; }
    const c = (MEP && MEP.cosm) || {};
    LY_ED = {grid: lyNorm(c.grid) || lyNorm(LY_PRESET.launcher()), track: lyJ(c.track) || null, cnt: lyJ(c.cnt) || [], bgx: lyJ(c.bgx) || null, files: {},
      pal: lyJ(c.pal) || null, nk: lyJ(c.nk) || {}, stk: lyJ(c.stk) || [], bb: lyJ(c.bb) || {}, snd: lyJ(c.snd) || null};
    if (quiet) return;
    toast("Конструктор: тащи блоки за ручку, меняй ширину, раскладку, шапку и фон. В конце — «Готово»"); render();
  }
  const lyDraw = () => { const y = scrollY; render(); scrollTo(0, y); };
  const lyGrid = () => LY_ED.grid || (LY_ED.grid = lyNorm(LY_PRESET.launcher()));
  const lyMark = () => { lyGrid().lay = "custom"; };
  async function lySave(){
    const b = document.querySelector("[data-lyok]"); if (b){ b.disabled = true; b.textContent = "Сохраняю…"; }
    try {
      const up = async (f, max) => { if (f.size > max){ throw {code: "too_large"}; } return (await assets.upload(f, {type: f.type})).id; };
      const bgx = LY_ED.bgx ? lyJ(LY_ED.bgx) : null;
      if (bgx && bgx.media && LY_ED.files.media){ bgx.media.id = await up(LY_ED.files.media, 3.4 * 1024 * 1024); bgx.media.v = /^video\//.test(LY_ED.files.media.type) || undefined; }
      if (bgx && Array.isArray(bgx.ly)) for (const l of bgx.ly){ const f = LY_ED.files["ly" + l.key]; if (f) l.img = await up(f, 3.4 * 1024 * 1024); delete l.key; }
      if (bgx && bgx.media && String(bgx.media.id || "").startsWith("blob:")) delete bgx.media;
      if (bgx && Array.isArray(bgx.ly)) bgx.ly = bgx.ly.filter(l => l.img && !String(l.img).startsWith("blob:"));
      // 7.31: стикеры, фон блоков и звук — тоже файлы
      const stk = lyJ(LY_ED.stk || []); for (const x of stk){ if (x.fk){ const f = LY_ED.files[x.fk]; if (f) x.img = await up(f, 1.5 * 1024 * 1024); delete x.fk; } }
      const bb = lyJ(LY_ED.bb || {}); for (const k of Object.keys(bb)){ const x = bb[k]; if (x && x.fk){ const f = LY_ED.files[x.fk]; if (f) x.img = await up(f, 3.4 * 1024 * 1024); delete x.fk; } if (x && String(x.img || "").startsWith("blob:")) delete x.img; if (!x || !(x.img || x.grad)) delete bb[k]; }
      let snd = LY_ED.snd ? lyJ(LY_ED.snd) : null; if (snd && LY_ED.files.snd){ snd.id = await up(LY_ED.files.snd, 3.4 * 1024 * 1024); } if (snd && String(snd.id || "").startsWith("blob:")) snd = null;
      const stkOk = stk.filter(x => x.e || (x.img && !String(x.img).startsWith("blob:")));
      const cosm = {...((MEP && MEP.cosm) || {}), ...(LY_ED.cs || {}), grid: LY_ED.grid, track: LY_ED.track || undefined, cnt: (LY_ED.cnt || []).length ? LY_ED.cnt : undefined, bgx: bgx || undefined,
        pal: LY_ED.pal || undefined, nk: LY_ED.nk && Object.keys(LY_ED.nk).some(k => LY_ED.nk[k] != null) ? LY_ED.nk : undefined, stk: stkOk.length ? stkOk : undefined, bb: Object.keys(bb).length ? bb : undefined, snd: snd || undefined};
      if (LY_ED.saveAs){ const look = stLook(cosm), sv = Array.isArray(cosm.saved) ? cosm.saved.slice() : []; sv.unshift({id: "t" + Date.now().toString(36), name: LY_ED.saveAs, look, at: today()}); cosm.saved = sv.slice(0, 8); }
      if (await saveProf({cosm})){ const sa = LY_ED.saveAs; LY_ED = null; CS_PREV = null; stSel = null; toast(sa ? `Профиль сохранён, тема «${sa}» в галерее` : "Профиль сохранён"); SND.click(); render(); return; }
    } catch(err){ toast(err && err.code === "too_large" ? "Файл тяжелее 3,4 МБ — сожми его, иначе он не откроется у друзей без VPN" : "Не сохранилось"); if (!(err && err.code)) logErr("конструктор: сохранение", err); }
    if (b){ b.disabled = false; b.textContent = "Готово"; }
  }
  // ---- клики в режиме правки
  document.addEventListener("click", e => {
    const t = e.target.closest && e.target.closest("[data-lyedit],[data-lyw],[data-lyz],[data-lyhide],[data-lyadd],[data-lylay],[data-lyhd],[data-lybg],[data-lyreset],[data-lyno],[data-lyok],[data-lytrack],[data-lycnt]"); if (!t || !ME) return;
    const d = t.dataset;
    if (d.lyedit){ e.preventDefault(); lyStart(); return; }
    if (d.lytrack){ e.preventDefault(); lyTrackSheet(); return; }
    if (d.lycnt){ e.preventDefault(); lyCntSheet(); return; }
    if (!LY_ED) return; e.preventDefault();
    const g = lyGrid();
    if (d.lyw){ const [k, w] = d.lyw.split(":"), x = g.b.find(b => b.k === k); if (x){ x.w = +w; lyMark(); lyDraw(); } return; }
    if (d.lyz){ const x = g.b.find(b => b.k === d.lyz); if (x){ x.z = x.z === "m" ? "s" : "m"; if (x.z === "m") x.w = 4; lyMark(); lyDraw(); } return; }
    if (d.lyhide){ g.b = g.b.filter(b => b.k !== d.lyhide); lyMark(); lyDraw(); return; }
    if (d.lylay && (d.lylay === "steam" || (LY_ED.cs && LY_ED.cs.theme === "valve"))){ LY_ED.cs = {...(LY_ED.cs || {}), theme: d.lylay === "steam" ? "valve" : ((MEP && MEP.cosm && MEP.cosm.theme !== "valve" && MEP.cosm.theme) || "base")}; CS_PREV = {...((MEP && MEP.cosm) || {}), ...LY_ED.cs}; }
    if (d.lylay){ const keepHd = g.hd; LY_ED.grid = lyNorm(LY_PRESET[d.lylay]()); if (d.lylay === "launcher") LY_ED.grid.hd = keepHd && Object.keys(keepHd).length ? keepHd : LY_ED.grid.hd; lyDraw(); return; }
    if (d.lyadd){ lyAddSheet(); return; }
    if (d.lyhd){ lyHeadSheet(); return; }
    if (d.lybg){ lyBgSheet(); return; }
    if (d.lyreset){ if (!confirm("Вернуть профиль к изначальному виду? Сбросятся раскладка, шапка, фон, фон блоков, палитра, ник и стикеры. Трек, счётчики и звук останутся. Шрифты и тема сбрасываются в «Оформлении».")) return;
      LY_ED.grid = lyNorm(LY_PRESET.launcher()); LY_ED.reset = true; LY_ED.bgx = null; LY_ED.pal = null; LY_ED.nk = {}; LY_ED.stk = []; LY_ED.bb = {}; if (typeof stSel !== "undefined") stSel = null; lyDraw(); toast("Сброшено — «Готово», чтобы сохранить"); return; }
    if (d.lyno){ LY_ED = null; CS_PREV = null; stSel = null; document.querySelectorAll(".stk-tb").forEach(x => x.remove()); document.body.classList.remove("ly-editing"); render(); return; }
    if (d.lyok){ if (LY_ED.reset && LY_ED.grid && LY_ED.grid.lay === "launcher") LY_ED.grid = null; lySave(); return; }
  }, true);
  // ---- перетаскивание блоков за ручку (мышь и палец)
  let lyDrag = null;
  document.addEventListener("pointerdown", e => {
    const h = e.target.closest && e.target.closest("[data-lydrag]"); if (!h || !LY_ED) return;
    e.preventDefault(); const el = h.closest(".ly-b"); if (!el) return;
    const r = el.getBoundingClientRect(), gh = el.cloneNode(true); gh.classList.add("ly-ghost"); Object.assign(gh.style, {width: r.width + "px", height: Math.min(r.height, 260) + "px", left: r.left + "px", top: r.top + "px"}); document.body.appendChild(gh);
    el.classList.add("ly-dragging"); lyDrag = {el, gh, dx: e.clientX - r.left, dy: e.clientY - r.top};
    try { h.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: указатель уже отпущен */ }
  });
  document.addEventListener("pointermove", e => {
    if (!lyDrag) return; const {el, gh} = lyDrag;
    gh.style.left = (e.clientX - lyDrag.dx) + "px"; gh.style.top = (e.clientY - lyDrag.dy) + "px";
    gh.style.display = "none"; const under = document.elementFromPoint(e.clientX, e.clientY); gh.style.display = "";
    const tgt = under && under.closest(".ly-b"), zone = under && under.closest("[data-lyzone]");
    if (tgt && tgt !== el && tgt.parentElement){ const r = tgt.getBoundingClientRect(), after = tgt.parentElement.classList.contains("ly-side") || r.width > r.height * 2 ? e.clientY > r.top + r.height / 2 : e.clientX > r.left + r.width / 2;
      tgt.parentElement.insertBefore(el, after ? tgt.nextSibling : tgt); }
    else if (zone && !zone.contains(el) && !tgt){ const add = zone.querySelector(".ly-add,.ly-ph.sm"); zone.insertBefore(el, add || null); }
    if (e.clientY < 70) scrollBy(0, -12); else if (e.clientY > innerHeight - 110) scrollBy(0, 12);
  });
  const lyDrop = () => {
    if (!lyDrag) return; const {el, gh} = lyDrag; lyDrag = null; gh.remove(); el.classList.remove("ly-dragging");
    const g = lyGrid(), by = new Map(g.b.map(b => [b.k, b])), out = [];
    document.querySelectorAll("[data-lyzone]").forEach(z => z.querySelectorAll(":scope > .ly-b").forEach(b => { const x = by.get(b.dataset.lyk); if (x){ x.z = z.dataset.lyzone; if (x.z === "m" && !x.w) x.w = 4; out.push(x); by.delete(x.k); } }));
    by.forEach(x => out.push(x)); g.b = out; lyMark(); lyDraw();
  };
  document.addEventListener("pointerup", lyDrop); document.addEventListener("pointercancel", lyDrop);
  // ---- окна
  function lyAddSheet(){
    const g = lyGrid(), have = new Set(g.b.map(b => b.k)), free = Object.keys(LY_NAME).filter(k => !have.has(k));
    const s = openSheet(`<h3>Добавить блок</h3><p class="sub">Блок встанет в конец основной части — потом перетащи куда нужно.</p>
      ${free.length ? `<div class="ly-addl">${free.map(k => `<button type="button" data-lyput="${k}"><b>${esc(LY_NAME[k])}</b><small>${k === "track" ? "что сейчас в ушах, с плеером" : k === "cnt" ? "свои цифры: дни, часы, что угодно" : LY_ONLY_ME[k] ? "видишь только ты" : LY_ONLY_THEM[k] ? "видят друзья у тебя в профиле" : "полка или карточка сайта"}</small></button>`).join("")}</div>` : `<p class="a-sub">Все блоки уже на месте.</p>`}`);
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-lyput]"); if (!b) return; const k = b.dataset.lyput; g.b.push(lyB(k, ["track", "cnt"].includes(k) ? 2 : 4, "m")); lyMark(); s.close(); lyDraw();
      if (k === "track" && !(LY_ED.track && (LY_ED.track.u || LY_ED.track.t))) setTimeout(lyTrackSheet, 200); else if (k === "cnt" && !(LY_ED.cnt || []).length) setTimeout(lyCntSheet, 200); });
  }
  function lyHeadSheet(){
    const g = lyGrid(), h = g.hd;
    const seg = (k, opts) => `<div class="cs-tabs ly-seg">${opts.map(([v, l]) => `<button type="button" data-lyhv="${k}:${v}" aria-pressed="${h[k] === v}">${l}</button>`).join("")}</div>`;
    const s = openSheet(`<h3>Шапка профиля</h3><p class="sub">Видно сразу — профиль за окном меняется на глазах.</p><div id="lyHdB"></div>`);
    const draw = () => { s.el.querySelector("#lyHdB").innerHTML = `<div class="cs-lbl">Аватарка</div>${seg("a", [["left", "Слева"], ["center", "По центру"], ["right", "Справа"], ["over", "Над ником"]])}
      <div class="cs-lbl">Ник</div>${seg("n", [["h", "Горизонтально"], ["v", "Вертикально вдоль края"]])}
      <div class="cs-lbl">Высота шапки</div>${seg("s", [["s", "Низкая"], ["m", "Обычная"], ["l", "Высокая"], ["xl", "На весь экран"]])}
      <label class="cs-sw" style="margin-top:12px"><input type="checkbox" data-lyhmini="1" ${h.mini ? "checked" : ""}><span><b>Компактная полоска</b><small>вместо большой шапки — тонкая строка с аватаркой и ником</small></span></label>`; };
    draw();
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-lyhv]"); if (!b) return; const [k, v] = b.dataset.lyhv.split(":"); h[k] = v; lyMark(); draw(); lyDraw(); });
    s.el.addEventListener("change", e => { if (e.target.dataset.lyhmini){ h.mini = e.target.checked; lyMark(); lyDraw(); } });
  }
  function lyTrackSheet(){
    const t = LY_ED ? (LY_ED.track || {}) : {...(((MEP && MEP.cosm) || {}).track || {})};
    const s = openSheet(`<h3>Трек дня</h3><p class="sub">Ссылка на Spotify или Яндекс Музыку — появится плеер прямо в профиле. YouTube и остальное — кнопкой «слушать».</p>
      <label class="f">Ссылка<input class="in" id="lyTU" placeholder="https://open.spotify.com/track/…" value="${esc(t.u || "")}"></label>
      <label class="f">Название<input class="in" id="lyTT" maxlength="80" value="${esc(t.t || "")}"></label>
      <label class="f">Исполнитель<input class="in" id="lyTA" maxlength="80" value="${esc(t.a || "")}"></label>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="lyTOk">Готово</button>${t.u || t.t ? `<button class="ib red" id="lyTRm">Убрать трек</button>` : ""}<button class="ib" id="lyTNo">Отмена</button></div>`);
    const q = x => s.el.querySelector(x);
    const put = async v => { if (LY_ED){ LY_ED.track = v; s.close(); lyDraw(); return; }
      const cosm = {...((MEP && MEP.cosm) || {}), track: v || undefined}; if (await saveProf({cosm})){ s.close(); toast(v ? "Трек поставлен" : "Трек убран"); render(); } };
    q("#lyTOk").onclick = () => { const u = q("#lyTU").value.trim(), tt = q("#lyTT").value.trim(), a = q("#lyTA").value.trim();
      if (u && !lyUrl(u)){ toast("Ссылка какая-то не такая"); return; } if (!u && !tt){ toast("Вставь ссылку или напиши название"); return; }
      put({u: lyUrl(u) || "", t: tt.slice(0, 80), a: a.slice(0, 80)}); };
    if (q("#lyTRm")) q("#lyTRm").onclick = () => put(null);
    q("#lyTNo").onclick = () => s.close();
  }
  function lyCntSheet(){
    let list = lyJ(LY_ED ? LY_ED.cnt || [] : (((MEP && MEP.cosm) || {}).cnt || [])) || [];
    const s = openSheet(`<h3>Счётчики</h3><p class="sub">До восьми штук. Число пишешь сам или считаем дни от даты либо до даты.</p><div id="lyCL"></div>
      <div class="acts"><button class="ib" id="lyCAdd">${ICON.plus}Ещё счётчик</button></div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="lyCOk">Готово</button><button class="ib" id="lyCNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const draw = () => { q("#lyCL").innerHTML = list.map((x, i) => `<div class="ly-cr" data-i="${i}"><input class="in" data-f="l" maxlength="40" placeholder="Подпись: дней без дропа" value="${esc(x.l || "")}">
      <select class="in" data-f="m"><option value="num"${!x.m || x.m === "num" ? " selected" : ""}>Число</option><option value="since"${x.m === "since" ? " selected" : ""}>Дней с даты</option><option value="until"${x.m === "until" ? " selected" : ""}>Дней до даты</option></select>
      ${x.m === "since" || x.m === "until" ? `<input class="in" type="date" data-f="d" value="${esc(x.d || "")}">` : `<input class="in" data-f="v" maxlength="12" placeholder="128" value="${esc(x.v ?? "")}">`}
      <button type="button" class="ib red" data-rm="${i}" aria-label="Убрать">${ICON.x}</button></div>`).join("") || `<p class="a-sub">Пока пусто.</p>`; q("#lyCAdd").hidden = list.length >= 8; };
    s.el.addEventListener("input", e => { const r = e.target.closest(".ly-cr"); if (!r) return; const x = list[+r.dataset.i], f = e.target.dataset.f; x[f] = e.target.value; if (f === "m") draw(); });
    s.el.addEventListener("change", e => { if (e.target.dataset.f === "m") draw(); });
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b){ list.splice(+b.dataset.rm, 1); draw(); } });
    q("#lyCAdd").onclick = () => { list.push({l: "", m: "num", v: ""}); draw(); };
    q("#lyCNo").onclick = () => s.close();
    q("#lyCOk").onclick = async () => { const out = list.filter(x => (x.l || "").trim()).map(x => ({l: x.l.trim().slice(0, 40), m: x.m || "num", ...(x.m === "since" || x.m === "until" ? {d: x.d || ""} : {v: String(x.v ?? "").slice(0, 12)})}));
      if (LY_ED){ LY_ED.cnt = out; s.close(); lyDraw(); return; }
      const cosm = {...((MEP && MEP.cosm) || {}), cnt: out.length ? out : undefined}; if (await saveProf({cosm})){ s.close(); toast("Счётчики сохранены"); render(); } };
    if (!list.length) list.push({l: "", m: "num", v: ""});
    draw();
  }
  function lyBgSheet(){
    const x = LY_ED.bgx = LY_ED.bgx || {}; x.ly = Array.isArray(x.ly) ? x.ly : [];
    const s = openSheet(`<h3>Фон профиля</h3><p class="sub">Слои складываются: градиент снизу, поверх видео или гифка, сверху узор и картинки параллакса. Всё видно сразу. Файлы — до 3,4 МБ, иначе у друзей без VPN не откроются.</p><div id="lyBgB"></div>`, {wide: true});
    const q = y => s.el.querySelector(y), live = () => { clearTimeout(live.t); live.t = setTimeout(lyDraw, 60); };
    const rng = (k, l, a, b, st, v, u) => `<label class="cs-rg"><span>${l}</span><input type="range" min="${a}" max="${b}" step="${st}" data-lybr="${k}" value="${v}"><em>${v}${u}</em></label>`;
    const draw = () => { const g = !!x.grad, m = x.media;
      q("#lyBgB").innerHTML = `<div class="ly-bgs"><div class="cs-sr"><b>Градиент</b><div class="cs-acs"><label class="cs-sw sm"><input type="checkbox" data-lybg2="grad" ${g ? "checked" : ""}><span>вкл</span></label>
          <input type="color" data-lybc="c1" value="${lyCol(x.c1) || "#1a1a2e"}"><input type="color" data-lybc="c2" value="${lyCol(x.c2) || "#6a1b9a"}"><input type="color" data-lybc="c3" value="${lyCol(x.c3) || "#000000"}" title="третий цвет">${x.c3 ? `<button type="button" class="ib" data-lyb3="1">без третьего</button>` : ""}</div>
          <div class="cs-tabs ly-seg">${[["linear", "Линейный"], ["radial", "Круглый"], ["conic", "Веер"]].map(([k, l]) => `<button type="button" data-lybt="${k}" aria-pressed="${(x.gt || "linear") === k}">${l}</button>`).join("")}</div>${rng("ang", "Угол", 0, 360, 5, x.ang ?? 135, "°")}</div>
        <div class="cs-sr"><b>Видео или гифка</b><small>MP4, WebM или GIF; играет без звука по кругу</small><div class="cs-acs"><button type="button" class="ib" data-lybm="1">${m ? "Другой файл" : "Выбрать файл"}</button>${m ? `<button type="button" class="ib red" data-lybmx="1">Убрать</button>` : ""}</div>${m && !m.v && !/\.(mp4|webm|mov)$/i.test(m.id || "") ? rng("blur", "Размытие", 0, 20, 1, m.blur || 0, "px") : ""}</div>
        <div class="cs-sr"><b>Узор</b><div class="cs-tabs ly-seg ly-pats">${LY_PAT.map(([k, l]) => `<button type="button" data-lybp="${k}" aria-pressed="${(x.pat || "") === k}">${l}</button>`).join("")}</div>${x.pat ? `<div class="cs-acs"><input type="color" data-lybc="pc" value="${lyCol(x.pc) || "#ffffff"}" title="цвет узора"></div>${rng("pop", "Заметность", 5, 100, 5, x.pop ?? 35, "%")}${rng("ps", "Размер", 8, 120, 2, x.ps ?? 28, "px")}` : ""}</div>
        <div class="cs-sr"><b>Параллакс</b><small>до трёх картинок (лучше PNG без фона), которые едут с разной скоростью при прокрутке</small>
          ${x.ly.map((l, i) => `<div class="ly-lr"><b>Слой ${i + 1}</b>${rng("ly" + i + ".d", "Скорость", -1, 1, .05, l.d ?? (i + 1) * .25, "")}${rng("ly" + i + ".x", "По горизонтали", -40, 140, 1, l.x ?? 50, "%")}${rng("ly" + i + ".y", "По вертикали", -40, 140, 1, l.y ?? 0, "%")}${rng("ly" + i + ".w", "Ширина", 10, 160, 1, l.w ?? 60, "%")}<button type="button" class="ib red" data-lybl="${i}">Убрать слой</button></div>`).join("")}
          ${x.ly.length < 3 ? `<div class="cs-acs"><button type="button" class="ib" data-lyba="1">${ICON.plus}Слой</button></div>` : ""}</div>
        <div class="cs-sr">${rng("dim", "Затемнение поверх всего", 0, 90, 5, x.dim ?? 0, "%")}</div>
        <div class="acts"><button type="button" class="ib red" data-lybclr="1">Убрать весь фон</button><button type="button" class="ib blue" data-lybok="1">Готово</button></div></div>`; };
    const pick = (acc, cb) => { const i = document.createElement("input"); i.type = "file"; i.accept = acc; i.onchange = () => i.files[0] && cb(i.files[0]); i.click(); };
    s.el.addEventListener("input", e => { const el = e.target, d = el.dataset;
      if (d.lybc){ x[d.lybc] = el.value; if (d.lybc !== "pc") x.grad = true; live(); return; }
      if (d.lybr){ const v = +el.value, em = el.nextElementSibling; if (em) em.textContent = el.value + (em.textContent.replace(/^[-\d.]+/, "") || "");
        const mm = /^ly(\d)\.(\w)$/.exec(d.lybr); if (mm){ x.ly[+mm[1]][mm[2]] = v; } else if (d.lybr === "blur"){ if (x.media) x.media.blur = v; } else x[d.lybr] = v; live(); } });
    s.el.addEventListener("change", e => { if (e.target.dataset.lybg2){ x.grad = e.target.checked; live(); } });
    s.el.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
      if (d.lybt){ x.gt = d.lybt; x.grad = true; draw(); live(); }
      else if (d.lyb3){ delete x.c3; draw(); live(); }
      else if (d.lybp != null){ x.pat = d.lybp; draw(); live(); }
      else if (d.lybm) pick("video/mp4,video/webm,image/gif,image/webp,image/*", f => { if (f.size > 3.4 * 1024 * 1024){ toast("Файл тяжелее 3,4 МБ — сожми, иначе у друзей без VPN не откроется"); return; } LY_ED.files.media = f; x.media = {id: URL.createObjectURL(f), v: /^video\//.test(f.type) || undefined}; draw(); live(); });
      else if (d.lybmx){ delete x.media; delete LY_ED.files.media; draw(); live(); }
      else if (d.lyba) pick("image/*", f => { if (f.size > 3.4 * 1024 * 1024){ toast("Картинка тяжелее 3,4 МБ — сожми её"); return; } const key = Date.now(); LY_ED.files["ly" + key] = f; x.ly.push({img: URL.createObjectURL(f), key, d: (x.ly.length + 1) * .25, x: 50, y: x.ly.length * 30, w: 60}); draw(); live(); });
      else if (d.lybl){ x.ly.splice(+d.lybl, 1); draw(); live(); }
      else if (d.lybclr){ LY_ED.bgx = null; s.close(); lyDraw(); }
      else if (d.lybok) s.close(); });
    draw();
  }
  window.addEventListener("hashchange", () => { if (!["home", "user"].includes(route)) document.body.classList.remove("has-lyx"); if (LY_ED && route !== "home"){ LY_ED = null; document.body.classList.remove("ly-editing"); } });
