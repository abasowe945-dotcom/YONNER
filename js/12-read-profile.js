  // ================= 2.3: значки =================
  const MONITOR_I = '<svg viewBox="0 0 32 32" fill="none"><rect x="3" y="5" width="26" height="17" rx="3" fill="#2b2f6b" stroke="#9aa2ff" stroke-width="2"/><path d="M12 27h8M16 22v5" stroke="#9aa2ff" stroke-width="2" stroke-linecap="round"/><path d="M10.5 10.5c3.6-1.6 7.4-1.6 11 0 .9 2.6 1.1 5 .6 7.2-1.2.9-2.4 1.4-3.6 1.6l-.8-1.4c-1.6.4-3.2.4-4.8 0l-.8 1.4c-1.2-.2-2.4-.7-3.6-1.6-.5-2.2-.3-4.6 1-7.2Z" fill="#5865f2"/><circle cx="13.6" cy="14.6" r="1.3" fill="#fff"/><circle cx="18.4" cy="14.6" r="1.3" fill="#fff"/></svg>';
  const POPCORN_I = '<svg viewBox="0 0 32 32"><circle cx="10" cy="9" r="4" fill="#fff4cf"/><circle cx="16" cy="6.5" r="4.3" fill="#fffbe8"/><circle cx="22" cy="9" r="4" fill="#ffe9a3"/><circle cx="13" cy="11.5" r="3.6" fill="#ffd95a"/><circle cx="19.5" cy="11.5" r="3.6" fill="#fff4cf"/><path d="M7 13h18l-2.4 15.5a1.8 1.8 0 0 1-1.8 1.5H11.2a1.8 1.8 0 0 1-1.8-1.5Z" fill="#fff"/><path d="M10.6 13l1.3 17M16 13v17M21.4 13l-1.3 17" stroke="#e50914" stroke-width="2.6"/><path d="M7 13h18" stroke="#c40812" stroke-width="2"/></svg>';
  const HEART_I = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21Z"/></svg>';
  const BOOK_I = I('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M9 7h7M9 10.5h5"/>');
  const HOME_I = I('<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h5v-5.5h3V20h5V9.5"/>');
  const MUTE_I = I('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>');
  const WALLP_I = I('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>');
  const STAR_F = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8Z"/></svg>';
  const GRID_I = I('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>');
  const LIST_I = I('<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>');
  Object.assign(ICON, {home: HOME_I, read: BOOK_I, mute: MUTE_I, wallp: WALLP_I, drag: I('<path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" stroke-width="3.2"/>')});
  // фон для чата и ГО ПОСМОТРИМ: пленка, хлопушка, микрофон, попкорн, камера
  document.documentElement.style.setProperty("--cine", `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
    <g transform='translate(18 20) rotate(-12)'><rect width='70' height='34' rx='4'/><path d='M8 0v34M62 0v34M0 8h8M0 17h8M0 26h8M62 8h8M62 17h8M62 26h8'/><rect x='16' y='7' width='14' height='20' rx='2'/><rect x='38' y='7' width='14' height='20' rx='2'/></g>
    <g transform='translate(160 28) rotate(10)'><rect y='14' width='62' height='40' rx='4'/><path d='M0 14 8 0h54l-8 14M14 0l-8 14M30 0l-8 14M46 0l-8 14'/></g>
    <g transform='translate(40 140) rotate(-8)'><rect x='10' width='18' height='30' rx='9'/><path d='M4 22a15 15 0 0 0 30 0M19 37v12M10 49h18'/></g>
    <g transform='translate(150 150) rotate(8)'><path d='M4 20h40l-6 44H10Z'/><path d='M16 20l2 44M28 20v44M40 20l-2 44'/><circle cx='12' cy='14' r='7'/><circle cx='24' cy='9' r='7'/><circle cx='36' cy='14' r='7'/></g>
    <g transform='translate(96 92)'><rect y='10' width='44' height='30' rx='5'/><path d='m44 18 16-8v30l-16-8'/><circle cx='12' cy='5' r='5'/><circle cx='30' cy='5' r='5'/></g>
    <g transform='translate(110 208) rotate(-6)'><path d='M0 0h50v10a6 6 0 0 0 0 12v10H0V22a6 6 0 0 0 0-12Z'/><path d='M16 0v32' stroke-dasharray='3 4'/></g>
  </svg>`)}")`);

  // ================= 2.3: шапка — звук и фон раздела =================
  function syncSnd(){ const b = $("sndBtn"); if (!b) return; b.innerHTML = SND.on ? ICON.sound : ICON.mute; b.classList.toggle("off", !SND.on); b.title = SND.on ? "Выключить звуки" : "Включить звуки"; }
  $("sndBtn").onclick = () => { SND.set(!SND.on); syncSnd(); toast(SND.on ? "Звуки включены" : "Звуки выключены"); if (route === "more") renderMore(); };
  $("bgBtn").onclick = () => { if (!ME){ toast("Сначала войди"); return; } if (route === "home"){ pfBgSheet(); return; } const tab = (ROUTES[route] || ROUTES.home).tab; bgSheet(tab); };
  syncSnd();

  // ================= 2.3: главная — твой профиль =================
  const recentFirst = (a, b) => (b._upd || b.updatedAt || "").localeCompare(a._upd || a.updatedAt || "");
  function topActive(){
    if (!FR) return [];
    const since = Date.now() - 30 * 864e5, by = new Map();
    FR.profiles.forEach(p => by.set(p.user_id, {p, n: 0, lib: 0}));
    FR.items.forEach(i => { const r = by.get(i.uid); if (!r) return; if (inLib(i)) r.lib++; const t = Date.parse(i._upd || i.updatedAt || i.createdAt || 0); if (t > since) r.n++; });
    return [...by.values()].sort((a, b) => b.n - a.n || b.lib - a.lib);
  }
  function miniFeed(n){
    if (!FR || !ME) return "";
    const ev = FR.items.filter(i => i.uid !== ME.id && i._upd).sort((a, b) => b._upd.localeCompare(a._upd)).slice(0, n);
    return ev.length ? ev.map(i => `<button class="mini-f" data-fi="${esc(i.uid + "/" + i.id)}">${posterHTML(i, {rate:false, tgt:false, badge:false})}<span><b>${esc(i.title)}</b><small>${esc(frNick(i.uid))} ${verbOf(i)} · ${agoTs(i._upd)}</small></span>${avaHTML(profOf(i.uid), "xs")}</button>`).join("")
      : `<p class="a-sub" style="margin:0;font-size:13px">Пока тихо.</p>`;
  }
  function topHTML(n){
    const t = topActive().slice(0, n), mx = Math.max(1, ...t.map(x => x.n));
    return t.map(({p, n: k, lib}) => `<button class="top-r${ME && p.user_id === ME.id ? " me" : ""}" ${ME && p.user_id === ME.id ? 'data-go="home"' : `data-user="${esc(p.user_id)}"`}>${(i => `<span class="n r${i}">${i}</span>`)(t.findIndex(x => x.p === p) + 1)}${avaHTML(p)}<span class="t"><b>${esc(ME && p.user_id === ME.id ? p.nick + " (ты)" : p.nick)}</b><small>${k} ${plural(k, "действие", "действия", "действий")} за месяц · ${lib} на полке</small></span><span class="bar"><i style="width:${Math.round(k / mx * 100)}%"></i></span></button>`).join("");
  }
  // ================= 2.3: Читалка =================
  let READS = null, rLoading = null, rType = "", rTab = "reading", rSort = lsGet("nexus_rsort") || "added", rView = lsGet("nexus_rview") || "grid";
  const RSTAT = [["reading", "Читаю"], ["plan", "Буду читать"], ["done", "Прочитано"], ["paused", "Отложено"], ["dropped", "Брошено"]];
  const RTYPE = {manga: "Манга", comic: "Комикс", book: "Книга"}, RTYPE_PL = {manga: "Манга", comic: "Комиксы", book: "Книги"};
  async function loadReads(){
    if (!SB || !ME) return [];
    if (rLoading) return rLoading;
    rLoading = (async () => { const {data, error} = await fetchAll(() => SB.from("reads").select("id,data,updated_at").eq("user_id", ME.id), ["user_id", "id"]);
      READS = error ? (READS || []) : (data || []).map(r => ({...r.data, id: r.id, _upd: r.updated_at})); rLoading = null;
      if (route === "read" || route === "home") render(); return READS; })();
    return rLoading;
  }
  async function saveRead(r){
    const id = r.id || ("r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    const data = {...r, id: undefined, _upd: undefined, updatedAt: now(), createdAt: r.createdAt || now()}; delete data.id; delete data._upd;
    const {error} = await SB.from("reads").upsert({id, user_id: ME.id, data, updated_at: now()});
    if (error){ toast("Не сохранилось: " + error.message); return null; }
    const row = {...data, id, _upd: now()}; READS = [...(READS || []).filter(x => x.id !== id), row]; return row;
  }
  const rHue = t => { let h = 0; for (const c of String(t || "")) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const rCover = r => { const src = r.cover ? publicUrl(r.cover) : r.coverUrl, h = rHue(r.title);
    return `<span class="rx-cv${r.status === "dropped" ? " dr" : ""}">${r.type ? `<span class="tp">${RTYPE[r.type] || ""}</span>` : ""}${linkBadge(r)}${r.myRating != null ? `<span class="rb ${rateCls(r.myRating)}">${num1(r.myRating)}</span>` : ""}${r.status === "done" ? `<span class="ok" title="Прочитано"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>` : ""}${r.status === "reading" && r.chTotal > (r.chRead || 0) ? `<span class="new">+${r.chTotal - (r.chRead || 0)}</span>` : ""}${src ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}<span class="ph" style="--h:${h}"><b>${esc(r.title || "Без обложки")}</b>${r.year ? `<small>${esc(r.year)}</small>` : ""}</span>${r.status === "dropped" ? `<span class="rx-drp">Дроп</span>` : ""}</span>`; };
  function renderRead(){
    appleHead("Читалка", `<button class="a-link" data-radd="1">+ Добавить</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!READS){ $("aMain").innerHTML = `<p class="a-sub" style="text-align:center;margin-top:40px">Загружаю…</p>`; loadReads(); return; }
    const pool = READS.filter(r => !rType || r.type === rType), by = st => pool.filter(r => rNorm(r.status) === st);
    const fav = shelfOf("rfav", pool), done = shelfOf("rdone", pool), reading = shelfOf("rread", pool), plan = by("plan").sort(byAt("createdAt")), dropped = by("dropped").sort(byAt("updatedAt"));
    const chRead = pool.reduce((s, r) => s + (+r.chRead || 0), 0), waiting = reading.filter(r => r.chTotal > (r.chRead || 0)).reduce((s, r) => s + (r.chTotal - (r.chRead || 0)), 0);
    const mag = (r, i, pg) => `<button class="rx-mag" data-rd="${esc(r.id)}" style="--i:${i};--tilt:${(((i * 7) % 5) - 2) * 1.1}deg">${rCover(r)}${pg ? `<span class="sc-x" role="button" data-unread="${esc(r.id)}" title="Убрать из «Читаю» — останется в библиотеке">${ICON.x}</span>` : ""}${pg && r.chTotal ? `<span class="pg"><i style="width:${Math.min(100, (r.chRead || 0) / r.chTotal * 100)}%"></i></span>` : ""}</button>`;
    const addMag = (n, st, fv) => `<button class="rx-mag rx-addm" type="button" data-radd2="${st}${fv ? ":fav" : ""}" style="--i:${n}"><span class="rx-cv"><span class="ph"><b>+</b><small>${fv ? "Любимое" : "Добавить"}</small></span></span></button>`;
    const shelf = (key, label, list, hint, pg) => `<section class="rx-shelf rx3-s s-${key}"><h2 class="rx-sh">${label}<small>${list.length}</small>${reordBtn({fav: "rfav", done: "rdone", reading: "rread"}[key], list.length)}</h2>
      ${railHTML("rx-hs", list.map((r, i) => mag(r, i, pg)).join("") + addMag(list.length, key === "fav" ? "done" : key, key === "fav")).replace('class="hs-in"', 'class="hs-in rx-rack"')}
      ${list.length ? "" : `<p class="rx-hint">${hint}</p>`}<div class="rx-plank"></div></section>`;
    const fanN = Math.min(plan.length, 9);
    const crate = `<section class="rx-shelf rx3-s s-plan"><h2 class="rx-sh">В планах<small>${plan.length}</small>${plan.length > fanN ? `<button class="rx-all" type="button" data-rplan="1">все ${plan.length} ›</button>` : ""}</h2>
      <div class="crate-w"><div class="crate${plan.length ? "" : " empty"}" id="rxCrate" tabindex="0" aria-label="Коробка «В планах»: наведи, чтобы достать журналы">
        <div class="crate-back"></div>
        <div class="crate-mags">${plan.slice(0, fanN).map((r, i) => { const m = (fanN - 1) / 2, o = i - m;
          return `<button class="cm" data-rd="${esc(r.id)}" style="--i:${i};--o:${o.toFixed(2)};--r:${(o * 7 + ((i * 13) % 5 - 2)).toFixed(1)}deg;--y:${(Math.abs(o) * 9).toFixed(1)}px;--p:${(((i * 37) % 9) - 4)}deg">${rCover(r)}</button>`; }).join("")}</div>
        <div class="crate-front"><span class="crate-lb">В планах</span><small>${plan.length ? `${plan.length} ${plural(plan.length, "журнал", "журнала", "журналов")} ждут очереди` : "пусто — кидай сюда то, что прочтёшь потом"}</small><button class="crate-add" type="button" data-radd2="plan">${ICON.plus}</button></div>
      </div></div></section>`;
    $("aMain").innerHTML = `<div class="rx rx3">
      <div class="rx3-top"><h1 class="rx-h">${BOOK_I} Читалка</h1>
        <div class="rx-sub">${[["", "Всё", READS.length], ...Object.entries(RTYPE).map(([k, l]) => [k, RTYPE_PL[k] || l, READS.filter(r => r.type === k).length])].filter(([v, , n]) => !v || n || v === rType).map(([v, l, n]) => `<button data-rt="${v}" aria-pressed="${rType === v}">${l}<small>${n}</small></button>`).join("")}</div>
        <div class="rx3-stats"><span><b>${pool.length}</b>тайтлов</span><span><b>${chRead}</b>глав прочитано</span>${waiting ? `<span class="hot"><b>${waiting}</b>новых глав ждут</span>` : ""}<span><b>${done.length}</b>прочитано</span></div></div>
      ${sugStrip("read")}
      <details class="rx-imp" id="rxImp"${!READS.length || lsGet("nexus_rimp") === "1" ? " open" : ""}><summary><span>${ICON.up}</span><b>Перенести с com-x или readmanga</b><small>закладка · файл · ссылка</small></summary>
        <div class="rx-steps">
          <div class="rx-step"><span class="nm">1</span><div class="t"><b>Кнопка-закладка</b><small>Перетащи оранжевую кнопку на панель закладок браузера. Потом открой на сайте тайтл или свою коллекцию и нажми закладку — всё прилетит сюда вместе с обложками.</small></div><a class="rx-bm" id="rxBm" href="${esc(bmHref())}" title="Перетащи на панель закладок">+ в NEXUS</a></div>
          <div class="rx-step"><span class="nm">2</span><div class="t"><b>Файл выгрузки</b><small>com-x → «Моя коллекция» → «Выгрузить коллекцию».</small></div><label class="rx-btn" for="rxFile">${ICON.up}Выбрать файл</label><input type="file" id="rxFile" accept=".csv,.json,.txt,text/csv,application/json,text/plain" hidden></div>
          <div class="rx-step"><span class="nm">3</span><div class="t"><b>По ссылке</b><small>Откроется карточка со ссылкой — допишешь название и кинешь обложку.</small></div><div class="rx-in"><input id="rxUrl" inputmode="url" placeholder="https://com-x.life/…" autocomplete="off"><button class="rx-btn fill" id="rxGo">Открыть</button></div></div>
        </div></details>
      ${shelf("fav", "Любимые", fav, "Поставь сюда любимые тайтлы — они же будут на витрине в профиле.")}
      ${shelf("done", "Прочитано", done, "Дочитанное встанет сюда с зелёной галочкой.")}
      ${shelf("reading", "Читаю", reading, "То, что читаешь сейчас. Прогресс по главам — полоской снизу.", true)}
      ${crate}
      ${dropped.length ? `<section class="rx-shelf rx3-s s-drop"><h2 class="rx-sh">Брошено<small>${dropped.length}</small></h2>
        ${railHTML("rx-hs", dropped.map((r, i) => mag(r, i)).join("")).replace('class="hs-in"', 'class="hs-in rx-rack"')}<div class="rx-plank"></div></section>` : ""}
    </div>`;
    $("rxGo").onclick = () => readerFromUrl($("rxUrl").value.trim());
    $("rxUrl").addEventListener("keydown", e => { if (e.key === "Enter") readerFromUrl($("rxUrl").value.trim()); });
    $("rxFile").onchange = e => { const f = e.target.files[0]; if (f) importReads(f); };
    $("rxImp").addEventListener("toggle", e => lsSet("nexus_rimp", e.target.open ? "1" : "0"));
    $("rxBm").onclick = e => { e.preventDefault(); toast("Эту кнопку не нажимают здесь — перетащи её на панель закладок"); };
    bindDrop(document.querySelector(".rx3-top"), f => importReads(f));
    wireHScrolls(); wireCrate($("rxCrate"));
  }
  // коробка «В планах»: при наведении журналы вылетают веером, на телефоне — по тапу
  function wireCrate(el){
    if (!el) return;
    let t = 0;
    const open = on => { if (el.classList.contains("open") === on) return; el.classList.toggle("open", on); if (on) SND.paper("flip"); };
    el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse"){ clearTimeout(t); open(true); } });
    el.addEventListener("pointerleave", e => { if (e.pointerType === "mouse"){ clearTimeout(t); t = setTimeout(() => open(false), 260); } });
    el.addEventListener("click", e => { if (e.target.closest(".crate-add")) return; if (!el.classList.contains("open")){ e.preventDefault(); e.stopPropagation(); open(true); } }, true);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ if (e.target === el){ e.preventDefault(); open(!el.classList.contains("open")); } } if (e.key === "Escape") open(false); });
  }
  document.addEventListener("pointerdown", e => document.querySelectorAll(".crate.open").forEach(c => { if (!c.contains(e.target)) c.classList.remove("open"); }), {passive: true});
  function planListSheet(){
    const plan = (READS || []).filter(r => rNorm(r.status) === "plan" && (!rType || r.type === rType)).sort(byAt("createdAt"));
    const s = openSheet(`<h3>В планах<small style="color:#8e8e93;font-weight:500;margin-left:8px">${plan.length}</small></h3><div class="pk rd-all">${plan.map(r => `<button type="button" class="pk-c" data-rd="${esc(r.id)}">${rCover(r)}<span>${esc(r.title)}</span></button>`).join("")}</div>`, {wide: true});
    s.el.addEventListener("click", e => { if (e.target.closest("[data-rd]")) s.close(); });
  }
  async function readerFetch(url, action = "title"){
    const {data: d, error} = await SB.functions.invoke("reader", {body: {url, action}});
    let err = d && d.error;
    if (!d && error){ try { const j = await error.context.json(); err = j.error; } catch(_){ err = error.message; } }
    if (err || !d) throw new Error(err === "blocked" ? "сайт не пустил сервер (защита от ботов)" : err === "login" ? "страница видна только после входа на сайт" : err === "empty" ? "на странице не нашлось тайтлов" : err === "bad_host" ? "поддерживаются только com-x.life и readmanga" : err === "not_found" ? "не нашёл тайтл на странице" : (err || "нет ответа"));
    return d;
  }
  async function readerFromUrl(url){
    if (!url){ toast("Вставь ссылку"); return; }
    const isTitle = /com-?x\.life\/\d+-[^/]+\.html/i.test(url) || (/readmanga|mintmanga|seimanga/i.test(url) && /^https?:\/\/[^/]+\/[a-z0-9_]{3,80}\/?$/i.test(url));
    if (/com-?x\.life/i.test(url)){
      if (isTitle) readSheet(null, {url, source: "comx", type: "comic", _hint: 1});
      else { const d = $("rxImp"); if (d){ d.open = true; d.scrollIntoView({behavior: "smooth", block: "center"}); } toast("Коллекцию com-x забирает кнопка-закладка — она в шаге 1"); }
      return;
    }
    const btn = $("rxGo"); if (btn){ btn.disabled = true; btn.textContent = "Ищу…"; }
    try {
      if (isTitle){ const d = await readerFetch(url); readSheet(null, d); }
      else {
        const d = await readerFetch(url, "profile");
        const have = new Set((READS || []).map(r => r.url)); let n = 0;
        for (const x of d.items){ if (have.has(x.url)) continue; await saveRead({title: x.title, url: x.url, coverUrl: x.coverUrl, status: x.status || rTab, type: /com-?x/.test(url) ? "comic" : "manga", source: /com-?x/.test(url) ? "comx" : "readmanga"}); n++; }
        toast(n ? `Добавил ${n} ${plural(n, "тайтл", "тайтла", "тайтлов")}` : "Новых тайтлов не нашлось"); renderRead();
      }
    } catch(e){
      toast("Не вышло: " + e.message + (isTitle ? ". Заполни вручную" : ". Используй файл выгрузки"));
      if (isTitle) readSheet(null, {url, source: /com-?x/.test(url) ? "comx" : "readmanga", type: /com-?x/.test(url) ? "comic" : "manga"});
    }
    if (btn){ btn.disabled = false; btn.textContent = "Открыть"; }
  }
  // выгрузка com-x: CSV / JSON / TXT, поля угадываем по названиям
  const statusFrom = s => { s = String(s || "").toLowerCase(); return /не понрав|брош|drop/.test(s) ? "dropped" : /отлож|hold|pause/.test(s) ? "paused" : /буду|plan|will|later|хочу/.test(s) ? "plan" : /прочит|complet|done|finish|read(ed)?$/.test(s) && !/читаю|reading/.test(s) ? "done" : /читаю|reading|current/.test(s) ? "reading" : null; };
  function parseExport(text, name){
    const out = [];
    const pick = (o, re) => { for (const k in o) if (re.test(k)) return o[k]; return null; };
    const fromObj = (o, st0) => { if (!o || typeof o !== "object") return;
      const title = pick(o, /^(title|name|название|rus|ru_?name|name_?ru)$/i) || pick(o, /title|name|назв/i); if (!title || typeof title !== "string") return;
      const st = statusFrom(pick(o, /status|tab|list|category|катег|вкладк|статус|folder/i)) || st0 || "reading";
      const num = re => { const v = pick(o, re); const n = parseInt(v, 10); return isNaN(n) ? null : n; };
      const url = pick(o, /^(url|link|href|ссылка)$/i) || pick(o, /url|link|ссылк/i);
      out.push({title: String(title).trim(), url: url ? String(url) : null, coverUrl: pick(o, /cover|poster|image|img|обложк|постер/i) || null, status: st,
        chRead: num(/read_?ch|chapters?_?read|прочит|readed|progress|last/i), chTotal: num(/total|chapters?_?count|^chapters?$|всего|глав/i),
        publisher: pick(o, /publisher|издат/i) || null, year: num(/^year|год/i), rating: parseFloat(pick(o, /rating|рейтинг|score/i)) || null}); };
    const t = text.trim();
    if (/\.json$/i.test(name) || /^[\[{]/.test(t)){
      const j = JSON.parse(t);
      const walk = (v, st) => { if (Array.isArray(v)) v.forEach(x => typeof x === "object" ? (pick(x, /title|name|назв/i) ? fromObj(x, st) : walk(x, st)) : null);
        else if (v && typeof v === "object"){ if (pick(v, /^(title|name|название)$/i) && typeof pick(v, /^(title|name|название)$/i) === "string") fromObj(v, st); else for (const k in v) walk(v[k], statusFrom(k) || st); } };
      walk(j, null); return out;
    }
    const lines = t.split(/\r?\n/).filter(l => l.trim());
    const sep = [";", ",", "\t"].find(s => (lines[0] || "").split(s).length > 1 && /title|name|назв/i.test(lines[0]));
    if (sep){
      const split = l => { const r = []; let cur = "", q = false; for (const ch of l){ if (ch === '"'){ q = !q; continue; } if (ch === sep && !q){ r.push(cur); cur = ""; } else cur += ch; } r.push(cur); return r.map(x => x.trim()); };
      const head = split(lines[0]); lines.slice(1).forEach(l => { const v = split(l), o = {}; head.forEach((h, i) => o[h] = v[i]); fromObj(o, null); }); return out;
    }
    let st = "reading";
    lines.forEach(l => { const s = l.replace(/^[-*•\d.)\s]+/, "").trim(); const hs = s.match(/^([^:]{3,30}):?\s*(\(\d+\))?$/); const maybe = statusFrom(s);
      if (maybe && (hs || s.length < 30)){ st = maybe; return; }
      const um = s.match(/https?:\/\/\S+/), title = s.replace(/https?:\/\/\S+/, "").replace(/[—–|-]\s*$/, "").trim();
      if (title) out.push({title, url: um ? um[0] : null, status: st}); });
    return out;
  }
  async function importReads(f){
    if (!/\.(csv|json|txt)$/i.test(f.name) && !/text|json|csv/.test(f.type)){ toast("Нужен файл выгрузки: CSV, JSON или TXT"); return; }
    try {
      const list = parseExport(await f.text(), f.name);
      if (!list.length){ toast("Не нашёл тайтлов в файле"); return; }
      const have = new Set((READS || []).map(r => (r.url || r.title || "").toLowerCase())); let n = 0;
      toast(`Загружаю ${list.length}…`);
      for (const r of list){ const key = (r.url || r.title).toLowerCase(); if (have.has(key)) continue; have.add(key);
        const src = /readmanga|mintmanga/i.test(r.url || "") ? "readmanga" : "comx";
        await saveRead({...r, type: src === "readmanga" ? "manga" : "comic", source: src}); n++; }
      toast(`Готово: ${n} ${plural(n, "тайтл", "тайтла", "тайтлов")}${list.length - n ? `, ${list.length - n} уже были` : ""}`); renderRead();
    } catch(e){ toast("Файл не прочитался: " + e.message); }
  }
  // полка: тянуть мышкой, шорох при наведении
  function wireRack(el){
    let d = null, moved = false, lastSnd = 0;
    el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button) return; d = {x: e.clientX, l: el.scrollLeft}; moved = false; });
    el.addEventListener("pointermove", e => { if (!d) return; const dx = e.clientX - d.x; if (!moved && Math.abs(dx) > 5){ moved = true; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } } if (moved) el.scrollLeft = d.l - dx; });
    const up = () => { d = null; el.classList.remove("drag"); }; el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("click", e => { if (moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    el.addEventListener("pointerover", e => { const m = e.target.closest(".rx-mag"); if (!m || m.contains(e.relatedTarget) || d) return; const t = performance.now(); if (t - lastSnd > 140){ lastSnd = t; SND.paper("soft"); } });
  }
  // обложка вылетает с полки и раскрывается в карточку
  function flyOpen(from, then){
    const cv = from.querySelector(".rx-cv"); if (!cv || calmMotion){ then(); return; }
    const a = cv.getBoundingClientRect(), fly = document.createElement("div"); fly.className = "rx-fly"; fly.innerHTML = cv.outerHTML;
    Object.assign(fly.style, {left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px"}); document.body.appendChild(fly);
    from.style.visibility = "hidden"; SND.paper("flip");
    const W = Math.min(300, innerWidth * .6), H = W * a.height / a.width, sx = W / a.width, dx = innerWidth / 2 - (a.left + a.width / 2), dy = innerHeight / 2 - (a.top + a.height / 2) - 20;
    const an = fly.animate([
      {transform: "translate(0,0) rotateX(0) rotateY(0) scale(1)", offset: 0},
      {transform: `translate(${dx * .35}px,${dy * .35 - 60}px) perspective(900px) rotateX(18deg) rotateY(-28deg) scale(${1 + (sx - 1) * .45})`, offset: .45},
      {transform: `translate(${dx}px,${dy}px) perspective(900px) rotateX(0) rotateY(0) scale(${sx})`, opacity: 1, offset: .85},
      {transform: `translate(${dx}px,${dy}px) scale(${sx * 1.04})`, opacity: 0, offset: 1}], {duration: 620, easing: "cubic-bezier(.3,.8,.25,1)"});
    setTimeout(then, 380);
    an.onfinish = () => { fly.remove(); from.style.visibility = ""; };
  }
  // из ссылки com-x делаем поисковый запрос: «13800-the-superior-spider-man-returns-…-read.html» → «the superior spider man returns …»
  const slugQ = u => { try { const p = new URL(u).pathname.split("/").pop().replace(/\.html?$/, "").replace(/^\d+-/, "").replace(/-(read|online|chitat|chitat-onlajn|manga|comics?)(?=-|$)/g, ""); return p.replace(/[-_]+/g, " ").trim().slice(0, 80); } catch(_){ return ""; } };
  function readSheet(r, pre){
    const isNew = !r; r = r ? {...r} : {status: "plan", type: rType || "manga", chRead: 0, ...(pre || {})};
    r.status = rNorm(r.status);
    if (pre && pre.genres && !r.genre) r.genre = pre.genres.join(", ");
    let file = null;
    if (pre && pre.cover){ try { const bin = Uint8Array.from(atob(pre.cover), c => c.charCodeAt(0)); file = new File([bin], "cover.jpg", {type: pre.coverType || "image/jpeg"}); r.cover = null; } catch(_){ logErr("Читалка: обложка из закладки", _); } }
    if (pre && pre.coverData){ file = dataToFile(pre.coverData) || null; if (file) r.cover = null; }
    const hint = r._hint; delete r._hint; delete r.coverData;
    const coverSrc = () => file ? URL.createObjectURL(file) : r.cover ? publicUrl(r.cover) : r.coverUrl;
    const cvHTML = () => { const src = coverSrc(); return `${src ? rCover({...r, myRating: null, cover: null, coverUrl: src}) : `<span class="rx-cv rs-empty"><span class="ph"><i class="rs-up">${ICON.up}</i><b>Перетащи постер</b><small>или нажми, или Ctrl+V</small></span></span>`}
      ${src ? `<div class="rs-cvb"><button type="button" data-cv="up">Сменить</button><button type="button" data-cv="del">Убрать</button></div>` : ""}`; };
    const s = openSheet(`<div class="rs3">
      <div class="rs3-cv" id="rsCv" title="Постер: перетащи картинку, нажми или Ctrl+V">${cvHTML()}</div>
      <div class="rs3-f">
        <h3>${isNew ? "Новый тайтл" : esc(r.title)}</h3>${isNew ? impSeg("read", "Один тайтл") : ""}
        ${hint ? `<div class="rs-hint"><b>com-x не пускает роботов</b>Заполни вручную или нажми лупу — поищу по каталогам.</div>` : ""}
        <label class="f">Название<span class="rs-q"><input class="in" id="rsTi" value="${esc(r.title || "")}" placeholder="Как называется" autocomplete="off"><button type="button" class="rs-find" id="rsFind" title="Поискать обложку и данные по названию">${ICON.search}</button></span></label>
        <div class="rs-sug" id="rsSug" hidden></div>
        <div class="rs-seg" id="rsT">${Object.entries(RTYPE).map(([k, l]) => `<button type="button" data-v="${k}" aria-pressed="${r.type === k}">${l}</button>`).join("")}</div>
        <div class="rs-st" id="rsS">${[...RSTAT3, ["old", "Читал давно"]].map(([k, l]) => `<button type="button" data-v="${k}" class="st-${k === "old" ? "done st-old" : k}" aria-pressed="${k === "old" ? !!(r.noDate && r.status === "done") : r.status === k && !(k === "done" && r.noDate)}">${k === "done" ? CHECK_I : ""}${l}</button>`).join("")}</div>
        <button type="button" class="rs-fav${r.fav ? " on" : ""}" id="rsFav" aria-pressed="${!!r.fav}">${HEART_O}<span>${r.fav ? "В любимых — стоит на витрине" : "Добавить в любимые"}</span></button>
      </div></div>
      <div class="av-lb">Оценка</div>${wheelHTML("rsMy", r.myRating)}
      <label class="f" style="margin-top:12px">Описание <small style="text-transform:none;letter-spacing:0;opacity:.7">по желанию</small><textarea class="in rs-ta" id="rsDs" rows="3" placeholder="О чём, чем зацепило, кому советуешь">${esc(r.desc || "")}</textarea></label>
      <details class="rs-more"${r.chTotal || r.chRead || r.publisher || r.url ? " open" : ""}><summary>Главы, издатель, ссылка</summary>
        <div class="av-lb">Прочитано глав</div>
        <div class="rs-ch"><button type="button" id="rsM">−</button><input class="in" id="rsR" inputmode="numeric" value="${r.chRead || 0}"><button type="button" id="rsP">+</button><span>из</span><input class="in" id="rsTot" inputmode="numeric" value="${r.chTotal || ""}" placeholder="?"></div>
        <div class="ev-two"><label class="f">Издатель / автор<input class="in" id="rsPub" value="${esc(r.publisher || "")}"></label><label class="f">Год<input class="in" id="rsY" inputmode="numeric" value="${r.year || ""}"></label></div>
        <label class="f">Ссылка, где читаю<input class="in" id="rsU" value="${esc(r.url || "")}" placeholder="https://"></label>
      </details>
      <div class="acts"><button class="ib blue" id="rsOk" style="background:#f5a623;color:#1b1206">${isNew ? "Добавить" : "Сохранить"}</button>${ME ? `<button class="ib sg-rb" id="rsSug" title="Отправить этот тайтл другу — без твоего статуса">${ICON.send}Предложить другу</button>` : ""}${isNew ? "" : `<button class="ib red" id="rsDel">Удалить</button>`}<button class="ib" id="rsNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const seg = (id, key) => q(id).onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; r[key] = b.dataset.v; q(id).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); SND.tick(.5); };
    seg("#rsT", "type"); seg("#rsS", "status"); wireWheel("rsMy");
    q("#rsS").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return; if (b.dataset.v === "old"){ r.status = "done"; r.noDate = true; } else r.noDate = null; });
    q("#rsFav").onclick = () => { r.fav = !r.fav; const b = q("#rsFav"); b.classList.toggle("on", r.fav); b.setAttribute("aria-pressed", r.fav); b.querySelector("span").textContent = r.fav ? "В любимых — стоит на витрине" : "Добавить в любимые"; if (r.fav) SND.paper("soft"); };
    // поиск по каталогам — только по кнопке-лупе
    let sugQ = "", sugList = [];
    const sug = q("#rsSug"), setType = t => { if (!RTYPE[t]) return; r.type = t; q("#rsT").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === t)); };
    const runSearch = async (term, head) => { term = String(term || "").trim(); if (term.length < 2){ toast("Впиши название"); return; } sugQ = term;
      sug.hidden = false; sug.innerHTML = `<div class="rs-sl">Ищу «${esc(term)}»…</div>`;
      try { const {data} = await SB.functions.invoke("reader", {body: {action: "search", q: term}}); if (term !== sugQ) return;
        sugList = ((data && data.items) || []).filter(x => x.title).slice(0, 10);
        sug.innerHTML = sugList.length ? `${head ? `<div class="rs-sl">${esc(head)}</div>` : ""}${sugList.map((x, i) => `<button type="button" class="rs-si" data-k="${i}"><span class="cv">${x.thumb && !/missing/.test(x.thumb) ? `<img src="${esc(x.thumb)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}</span><span class="t"><b>${esc(x.title)}</b><small>${esc([x.orig && x.orig !== x.title ? x.orig : "", x.kind, x.year, x.chTotal ? x.chTotal + " гл." : "", x.publisher].filter(Boolean).join(" · "))}</small></span><span class="src">${x.src === "shiki" ? "Shikimori" : x.src === "cv" ? "Comic Vine" : "Google Книги"}</span></button>`).join("")}<button type="button" class="rs-sx" data-k="x">Скрыть</button>`
          : `<div class="rs-sl">Ничего не нашёл — заполни вручную.</div>`;
      } catch(_){ sug.innerHTML = `<div class="rs-sl">Поиск сейчас не отвечает — заполни вручную.</div>`; } };
    q("#rsFind").onclick = () => runSearch(q("#rsTi").value || slugQ(r.url));
    q("#rsTi").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); runSearch(q("#rsTi").value); } });
    sug.onclick = async e => { const b = e.target.closest("[data-k]"); if (!b) return; if (b.dataset.k === "x"){ sug.hidden = true; return; }
      const x = sugList[+b.dataset.k]; b.classList.add("busy"); b.querySelector(".src").textContent = "Загружаю…";
      try { const {data: d} = await SB.functions.invoke("reader", {body: {action: "pick", src: x.src, id: x.id}}); if (!d || d.error) throw 0;
        r.title = d.title || x.title; r.origTitle = d.origTitle || null; q("#rsTi").value = r.title;
        if (d.publisher) q("#rsPub").value = d.publisher; if (d.year) q("#rsY").value = d.year; if (d.chTotal) q("#rsTot").value = d.chTotal;
        if (d.genres && d.genres.length) r.genre = d.genres.join(", "); if (d.siteStatus) r.siteStatus = d.siteStatus; if (d.rating) r.score = d.rating; if (d.kind) r.kind = d.kind;
        if (d.desc && !q("#rsDs").value.trim()) q("#rsDs").value = d.desc.slice(0, 1200);
        setType(d.type === "manga" ? "manga" : d.type === "book" ? "book" : "comic");
        if (d.cover){ try { const bin = Uint8Array.from(atob(d.cover), c => c.charCodeAt(0)); file = new File([bin], "cover.jpg", {type: d.coverType || "image/jpeg"}); r.cover = null; } catch(_){ logErr("Читалка: обложка из закладки", _); } }
        else if (d.coverUrl && !file){ r.cover = null; r.coverUrl = d.coverUrl; }
        redraw(); sug.hidden = true; SND.paper("flip"); toast("Подтянул: " + r.title);
      } catch(_){ b.classList.remove("busy"); b.querySelector(".src").textContent = "не вышло"; } };
    if (isNew && !r.title && r.url) setTimeout(() => runSearch(slugQ(r.url), "Похоже на эти?"), 200);
    const ch = d => { const v = Math.max(0, (parseInt(q("#rsR").value, 10) || 0) + d), t = parseInt(q("#rsTot").value, 10); q("#rsR").value = t ? Math.min(t, v) : v; };
    q("#rsM").onclick = () => ch(-1); q("#rsP").onclick = () => ch(1);
    const redraw = () => { q("#rsCv").innerHTML = cvHTML(); };
    const take = f => { if (!f || !f.type.startsWith("image/")) return; file = f; redraw(); SND.paper("soft"); };
    const pick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => take(i.files[0]); i.click(); };
    q("#rsCv").onclick = e => { const b = e.target.closest("[data-cv]");
      if (b && b.dataset.cv === "del"){ file = null; r.cover = null; r.coverUrl = null; redraw(); return; }
      pick(); };
    bindDrop(q("#rsCv"), take, u => { file = null; r.cover = null; r.coverUrl = u; redraw(); }); pasteTarget = take;
    q("#rsNo").onclick = () => s.close();
    if (q("#rsSug")) q("#rsSug").onclick = () => { const t = q("#rsTi").value.trim(); if (!t){ q("#rsTi").focus(); toast("Нужно название"); return; }
      const n = id => { const v = parseFloat(String(q(id).value).replace(",", ".")); return isNaN(v) ? null : v; };
      suggestRead({...r, title: t, chTotal: n("#rsTot"), publisher: q("#rsPub").value.trim() || null, year: n("#rsY"), myRating: wheelVal("rsMy"), desc: q("#rsDs").value.trim() || null, url: q("#rsU").value.trim() || null}, file); };
    if (q("#rsDel")) q("#rsDel").onclick = async () => { if (!confirm(`Удалить «${r.title}»?`)) return; const {error} = await SB.from("reads").delete().eq("user_id", ME.id).eq("id", r.id); if (error){ toast("Не удалилось"); return; } READS = READS.filter(x => x.id !== r.id); s.close(); render(); };
    q("#rsOk").onclick = async () => {
      r.title = q("#rsTi").value.trim(); if (!r.title){ q("#rsTi").focus(); toast("Нужно название"); return; }
      const n = id => { const v = parseFloat(String(q(id).value).replace(",", ".")); return isNaN(v) ? null : v; };
      r.chRead = n("#rsR") || 0; r.chTotal = n("#rsTot"); r.publisher = q("#rsPub").value.trim() || null; r.year = n("#rsY"); r.myRating = wheelVal("rsMy"); r.url = q("#rsU").value.trim() || null;
      r.desc = q("#rsDs").value.trim() || null;
      if (r.chTotal && r.chRead >= r.chTotal && r.status === "reading") r.status = "done";
      if (r.status !== "done"){ r.noDate = null; r.doneAt = null; } else if (r.noDate) r.doneAt = null; else if (!r.doneAt) r.doneAt = today();
      if (r.fav && !r.favAt) r.favAt = now(); if (!r.fav){ r.fav = null; r.favAt = null; }
      const b = q("#rsOk"); b.disabled = true;
      try { if (file && assets) r.cover = await upload(file); } catch(e){ logErr("Читалка: обложка", e); }
      delete r.genres; delete r.coverType; delete r.coverData;
      if (await saveRead(r)){ s.close(); toast(isNew ? "Добавлено в Читалку" : "Сохранено"); if (route === "read" || route === "home") render(); else go("read"); } else b.disabled = false;
    };
  }

  // ================= 2.4: кнопка-закладка для com-x / readmanga =================
  // Работает в браузере игрока на странице сайта (он уже прошёл их проверку), собирает тайтлы и отдаёт их вкладке NEXUS.
  const BM_FN = function(N){
    var H = location.hostname, w = window.open(N + "#read", "nexus_reader");
    if (!w){ alert("NEXUS: разреши всплывающие окна для этого сайта и нажми ещё раз"); return; }
    var box = document.createElement("div");
    box.style.cssText = "position:fixed;z-index:2147483647;right:16px;bottom:16px;padding:12px 16px;border-radius:12px;background:#111;color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5);border:1px solid #f5a623";
    box.textContent = "NEXUS: собираю…"; document.body.appendChild(box);
    var txt = function(e){ return e ? (e.innerText || e.textContent || "").replace(/\s+/g, " ").trim() : ""; };
    var abs = function(u){ try { return u ? new URL(u, location.href).href : null; } catch(e){ return null; } };
    var body = document.body.innerText || "";
    var fld = function(re){ var m = body.match(re); return m ? m[1].trim() : null; };
    var comx = /com-?x/i.test(H), items = [];
    var isTitle = comx ? /^\/\d+-[^\/]+\.html$/.test(location.pathname) : (!!document.querySelector("h1") && /^\/[a-z0-9_]{3,80}\/?$/i.test(location.pathname) && /Читать/i.test(body));
    var src = function(i){ return i ? abs(i.getAttribute("data-src") || i.getAttribute("data-original") || i.currentSrc || i.src) : null; };
    if (isTitle){
      var h1 = document.querySelector("h1"), title = txt(h1), orig = null, n = h1 && h1.nextElementSibling;
      for (var k = 0; n && k < 3; k++, n = n.nextElementSibling){ var t = txt(n); if (t && t.length < 150 && /[A-Za-z]/.test(t) && !/[а-яё]/i.test(t)){ orig = t; break; } }
      var og = document.querySelector('meta[property="og:image"]'), cover = og && og.content ? abs(og.content) : null;
      if (!cover){ var best = null, ba = 0; [].forEach.call(document.images, function(i){ var r = i.getBoundingClientRect(), a = r.width * r.height, q = r.height / (r.width || 1); if (a > ba && q > 1.2 && q < 1.8 && r.width > 120){ ba = a; best = i; } }); cover = src(best); }
      var genres = [].map.call(document.querySelectorAll('a[href*="/tags/"],a[href*="genre"],a[href*="xfsearch"],a[href*="/tag/"]'), txt).filter(function(x){ return x && x.length < 30; }).slice(0, 10);
      var dm = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
      var crumbs = txt(document.querySelector('.breadcrumbs,.breadcrumb,[itemtype*="BreadcrumbList"],.speedbar'));
      var pub = fld(/Издатель(?:ство)?:?\s*\n?\s*([^\n]{2,60})/i);
      var ch = body.match(/Главы\s*\((\d{1,5})\)/i) || body.match(/Глав[ыа]?:?\s*(\d{1,5})/i), yr = fld(/Год(?: выпуска)?:?\s*\n?\s*((?:19|20)\d\d)/i);
      var manga = !comx || /манг|манхв|маньхуа/i.test(crumbs + " " + genres.join(" ")) || /shueisha|kodansha|shogakukan|kadokawa|square enix|hakusensha/i.test(pub || "");
      items.push({url: location.origin + location.pathname, title: title, origTitle: orig, coverUrl: cover, publisher: pub, year: yr ? +yr : null, chTotal: ch ? +ch[1] : null,
        siteStatus: fld(/Статус:?\s*\n?\s*([^\n]{2,40})/i), release: fld(/Тип выпуска:?\s*\n?\s*([^\n]{2,40})/i), genres: genres, desc: dm ? dm.content : null, type: manga ? "manga" : "comic", source: comx ? "comx" : "readmanga"});
    } else {
      var seen = {};
      [].forEach.call(document.querySelectorAll("a[href]"), function(a){
        var u; try { u = new URL(a.href); } catch(e){ return; }
        if (u.hostname !== H) return;
        var ok = comx ? /^\/\d+-[^\/]+\.html$/.test(u.pathname) : /^\/[a-z0-9_]{3,80}$/i.test(u.pathname) && !/^\/(list|news|forum|user|users|login|register|search|private|genre|tag|about|help|rules|top|catalog|internal)/i.test(u.pathname);
        if (!ok) return;
        var key = u.origin + u.pathname, it = seen[key] || (seen[key] = {url: key, title: "", coverUrl: null, source: comx ? "comx" : "readmanga", type: comx ? "comic" : "manga"});
        var card = a.closest("li,article,[class*=item],[class*=card],[class*=tile]") || a, im = a.querySelector("img"), t = txt(a) || (im && im.alt) || a.title || "";
        if (t && t.length < 160 && t.length > it.title.length) it.title = t.replace(/^Постер к\s*/i, "");
        if (!it.coverUrl){ var c = src(im || card.querySelector("img")); if (c && !/^data:|blank|noimage|avatar|logo/i.test(c)) it.coverUrl = c; }
        if (!it.title){ var h = card.querySelector("h3,h4,[class*=title]"); if (h) it.title = txt(h); }
      });
      items = Object.keys(seen).map(function(k){ return seen[k]; }).filter(function(x){ return x.title; });
    }
    var hint = txt(document.querySelector('.active,[aria-selected="true"],.is-active,.current')) + " " + document.title + " " + location.href;
    var shrink = function(u){ return fetch(u, {credentials: "include"}).then(function(r){ if (!r.ok) throw 0; return r.blob(); }).then(function(b){ return createImageBitmap(b); }).then(function(bm){
      var W = Math.min(360, bm.width), c = document.createElement("canvas"); c.width = W; c.height = Math.round(bm.height * W / bm.width); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .84); }).catch(function(){ return null; }); };
    var i = 0, done = 0;
    var next = function(){ if (i >= items.length) return Promise.resolve(); var it = items[i++];
      return (it.coverUrl ? shrink(it.coverUrl) : Promise.resolve(null)).then(function(d){ it.coverData = d; done++; box.textContent = "NEXUS: обложки " + done + "/" + items.length; }).then(next); };
    Promise.all([next(), next(), next(), next()]).then(function(){
      box.textContent = items.length ? "NEXUS: отправляю " + items.length + "…" : "NEXUS: тайтлов на странице не нашёл";
      var msg = {nexusReader: 1, mode: isTitle ? "title" : "list", hint: hint, items: items}, got = false, tries = 0;
      window.addEventListener("message", function(e){ if (e.source === w && e.data && e.data.nexusAck){ got = true; box.textContent = "NEXUS: готово, смотри вкладку NEXUS"; setTimeout(function(){ box.remove(); }, 3000); } });
      var t = setInterval(function(){ if (got || ++tries > 90 || w.closed){ clearInterval(t); if (!got) box.textContent = "NEXUS: вкладка не ответила. Войди в NEXUS и нажми закладку ещё раз"; return; }
        try { w.postMessage(msg, new URL(N).origin); } catch(e){ /* ожидаемо: вкладка ещё не готова, повторим */ } }, 400);
    });
  };
  const bmHref = () => "javascript:" + encodeURIComponent("(" + BM_FN.toString() + ")(" + JSON.stringify(location.origin + location.pathname) + ")");
  const RD_HOST = /(^|\.)(com-x\.life|comx\.life|readmanga\.[a-z]+|mintmanga\.[a-z]+|seimanga\.[a-z]+|selfmanga\.[a-z]+)$/i;
  const dataToFile = d => { const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(d || ""); if (!m || d.length > 2e6) return null;
    try { const bin = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0)); return new File([bin], "cover.jpg", {type: m[1]}); } catch(_){ return null; } };
  let rdInbox = null, rdLastSig = "";
  const clip = (v, n) => typeof v === "string" ? v.trim().slice(0, n) || null : null;
  const httpsUrl = v => { try { const u = new URL(String(v)); return /^https?:$/.test(u.protocol) ? u.href : null; } catch(_){ return null; } };
  window.addEventListener("message", e => {
    let host; try { host = new URL(e.origin).hostname; } catch(_){ return; }
    const d = e.data; if (!d || d.nexusReader !== 1 || !RD_HOST.test(host) || !Array.isArray(d.items)) return;
    try { e.source.postMessage({nexusAck: 1}, e.origin); } catch(_){ /* ожидаемо: вкладку закрыли */ }
    const items = d.items.slice(0, 800).map(x => x && typeof x === "object" ? {
      url: httpsUrl(x.url), title: clip(x.title, 200), origTitle: clip(x.origTitle, 200), coverUrl: httpsUrl(x.coverUrl), coverData: typeof x.coverData === "string" && x.coverData.length < 2e6 ? x.coverData : null,
      publisher: clip(x.publisher, 80), year: +x.year > 1900 && +x.year < 2100 ? +x.year : null, chTotal: +x.chTotal > 0 && +x.chTotal < 100000 ? Math.round(+x.chTotal) : null,
      siteStatus: clip(x.siteStatus, 40), release: clip(x.release, 40), genres: Array.isArray(x.genres) ? x.genres.map(g => clip(g, 30)).filter(Boolean).slice(0, 10) : [],
      desc: clip(x.desc, 2000), type: x.type === "manga" ? "manga" : "comic", source: /com-?x/i.test(host) ? "comx" : "readmanga"} : null).filter(x => x && x.title && x.url);
    const sig = d.mode + items.map(x => x.url).join("|"); if (sig === rdLastSig && rdInbox) return; rdLastSig = sig;
    rdInbox = {mode: d.mode === "title" ? "title" : "list", hint: clip(d.hint, 400) || "", items};
    handleInbox();
  });
  async function handleInbox(){
    if (!rdInbox) return;
    if (!ME){ toast("Войди в NEXUS — и тайтлы сразу добавятся"); return; }
    if (!READS) await loadReads();
    const box = rdInbox; rdInbox = null;
    if (route !== "read") go("read");
    if (!box.items.length){ toast("На той странице не нашлось тайтлов"); return; }
    if (box.mode === "title"){ const x = box.items[0], ex = (READS || []).find(r => r.url === x.url);
      const pre = {...x, genre: x.genres.join(", ")}; delete pre.genres;
      setTimeout(() => ex ? readSheet(ex, {coverData: x.coverData}) : readSheet(null, pre), 80); return; }
    setTimeout(() => importPreview(box), 80);
  }
  function importPreview(box){
    const byUrl = new Map((READS || []).map(r => [r.url, r]));
    let st = statusFrom(box.hint) || rTab, tp = box.items.some(x => x.type === "manga") && !box.items.some(x => x.type === "comic") ? "manga" : box.items[0].type;
    const withCv = box.items.filter(x => x.coverData || x.coverUrl).length, strict = withCv > box.items.length / 2;
    const rows = box.items.map((x, i) => ({...x, i, ex: byUrl.get(x.url) || null, on: !strict || !!(x.coverData || x.coverUrl)}));
    const s = openSheet(`<h3>Перенос с сайта</h3><p class="sub">Нашёл ${rows.length} ${plural(rows.length, "тайтл", "тайтла", "тайтлов")}. Уже добавленным подтяну обложки, новые положу во вкладку ниже.</p>
      <div class="av-lb" style="margin-top:12px">Во вкладку</div><div class="rs-st" id="ipS">${RSTAT.map(([k, l]) => `<button data-v="${k}" aria-pressed="${st === k}">${l}</button>`).join("")}</div>
      <div class="rs-seg" id="ipT" style="margin:10px 0 4px">${Object.entries(RTYPE).map(([k, l]) => `<button data-v="${k}" aria-pressed="${tp === k}">${l}</button>`).join("")}</div>
      <div class="ip-list">${rows.map(x => `<label class="ip-r"><input type="checkbox" data-i="${x.i}"${x.on ? " checked" : ""}><span class="cv">${x.coverData || x.coverUrl ? `<img src="${esc(x.coverData || x.coverUrl)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}</span><span class="t"><b>${esc(x.title)}</b><small>${x.ex ? (x.ex.cover || x.ex.coverUrl ? "уже есть" : "уже есть · добавлю обложку") : "новый"}</small></span></label>`).join("")}</div>
      <div class="acts"><button class="ib blue" id="ipOk" style="background:#f5a623;color:#1b1206">Перенести</button><button class="ib" id="ipNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const seg = (id, set) => q(id).onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; set(b.dataset.v); q(id).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
    seg("#ipS", v => st = v); seg("#ipT", v => tp = v);
    s.el.querySelectorAll("[data-i]").forEach(c => c.onchange = () => { rows[+c.dataset.i].on = c.checked; });
    q("#ipNo").onclick = () => s.close();
    q("#ipOk").onclick = async () => {
      const b = q("#ipOk"); b.disabled = true; let add = 0, cov = 0, k = 0; const todo = rows.filter(x => x.on);
      for (const x of todo){ k++; b.textContent = `${k} / ${todo.length}…`;
        const f = dataToFile(x.coverData); let cover = null;
        if (x.ex){ if (x.ex.cover || (x.ex.coverUrl && !f)) continue;
          if (f && assets){ try { cover = await upload(f); } catch(e){ logErr("Читалка: обложка", e); } }
          if (cover || x.coverUrl){ await saveRead({...x.ex, cover: cover || x.ex.cover || null, coverUrl: cover ? x.ex.coverUrl || null : x.coverUrl}); cov++; } continue; }
        if (f && assets){ try { cover = await upload(f); } catch(e){ logErr("Читалка: обложка", e); } }
        const row = {title: x.title, url: x.url, origTitle: x.origTitle, coverUrl: x.coverUrl, cover, status: st, type: tp, source: x.source, chRead: 0, chTotal: x.chTotal, year: x.year, publisher: x.publisher};
        if (await saveRead(row)) add++; }
      s.close(); rTab = st; renderRead();
      toast([add ? `добавил ${add}` : "", cov ? `обложки: ${cov}` : ""].filter(Boolean).join(", ") || "Ничего нового");
    };
  }

  // ================= 2.3: лайки =================
  const likesOf = id => EV && EV.likes ? EV.likes.filter(l => l.post_id === id) : [];
  async function toggleLike(id){
    const mine = likesOf(id).some(l => l.user_id === ME.id);
    const r = mine ? await SB.from("event_post_likes").delete().eq("post_id", id).eq("user_id", ME.id) : await SB.from("event_post_likes").insert({post_id: id, user_id: ME.id, created_at: now()});
    if (r.error){ toast("Не получилось"); return; }
    if (!mine) SND.click("soft");
    await loadEvents(true);
  }

  // ================= 2.3: ГО ПОСМОТРИМ =================
  const evRoute = e => (e && e.kind === "watch" ? "watch:" : "event:") + e.id;
  const modeBadge = m => m === "cinema" ? `<span class="wp-kick cinema">${POPCORN_I}Киновечер</span>` : `<span class="wp-kick online">${MONITOR_I}Онлайн</span>`;
  const filmItem = e => ({...(e.film || {}), id: "w-" + e.id, type: (e.film && e.film.type) || "movie", status: "done"});
  function watchCard(){
    if (!EV) return "";
    const inv = new Set(myInvites().map(m => m.event_id));
    const list = EV.events.filter(e => e.kind === "watch" && !evPast(e)).sort((a, b) => (a.starts_at || "9").localeCompare(b.starts_at || "9"));
    const archN = EV.events.filter(e => e.kind === "watch" && evPast(e)).length;
    return `<section class="gw-card"><div class="gw-h"><button class="gw-cal" data-wcal="1" title="Календарь просмотров"><b>ГО <span>ПОСМОТРИМ</span></b><small>${list.length ? `${list.length} ${plural(list.length, "сеанс", "сеанса", "сеансов")}` : "онлайн или киновечером"} · календарь${archN ? ` и архив (${archN})` : ""} ›</small></button><button class="gw-new" data-wnew="1">+ Позвать смотреть</button></div>
      ${list.length ? `<div class="gw-stack-w${list.length > 1 ? " multi" : ""}"><div class="gw-stack" data-stack="1" style="--n:${Math.min(list.length, 4)}">${list.map(e => { const f = filmItem(e), goN = evMem(e.id).filter(m => m.status === "going");
        return `<button class="gw-t${inv.has(e.id) ? " inv" : ""}" data-w="${esc(e.id)}">${posterHTML(f, {tgt:false, rate:false})}<span style="min-width:0"><span class="md">${e.mode === "cinema" ? POPCORN_I + "киновечер" : MONITOR_I + "онлайн"}</span><span class="gw-tl"><b>${esc(f.title || e.title)}</b><span class="gw-by" title="Предложил">${avaHTML(profOf(e.owner), "xs")}${esc(ME && e.owner === ME.id ? "ты" : profOf(e.owner).nick || "кто-то")}</span></span><small>${esc(evIn(e) || evWhen(e))}${goN.length ? ` · ${goN.length} ${plural(goN.length, "идёт", "идут", "идут")}` : ""}${inv.has(e.id) ? " · тебя зовут" : ""}</small></span></button>`; }).join("")}</div>${list.length > 1 ? `<div class="gw-nav"><button type="button" data-gws="-1" aria-label="Предыдущий">${CHEV_L}</button><span class="gw-dots">${list.map(() => "<i></i>").join("")}</span><button type="button" data-gws="1" aria-label="Следующий">${CHEV_R}</button></div>` : ""}</div>`
        : `<p class="gw-empty">Выбери фильм из своей полки или из релизов, назначь время — друзья получат приглашение.</p>`}</section>`;
  }
  function watchSheet(e){
    if (!ME || !assets) return;
    const isNew = !e; let mode = e ? e.mode || "online" : "online", src = "lib", film = e ? {...e.film} : null, file = null;
    const s0 = evStart(e), others = FR ? FR.profiles.filter(p => p.user_id !== ME.id) : [];
    const libK = MYITEMS.filter(i => !isGame(i) && !isSoon(i)).sort(recentFirst);
    const seen = new Set(), relK = [...MYITEMS, ...(FR ? FR.items : [])].filter(i => !isGame(i) && relOn(i)).filter(i => { const k = frKey(i); if (seen.has(k)) return false; seen.add(k); return true; });
    const s = openSheet(`<h3>${isNew ? "Го посмотрим" : "Изменить просмотр"}</h3><p class="sub">Как смотрим?</p>
      <div class="lever" id="wLv" data-wm="${mode}"><i class="knob"></i><button type="button" data-wm="online" aria-pressed="${mode === "online"}">${MONITOR_I}Онлайн</button><button type="button" data-wm="cinema" aria-pressed="${mode === "cinema"}">${POPCORN_I}Киновечер</button></div>
      <div class="av-lb">Что смотрим</div>
      <div class="wsrc" id="wSrc"><button data-s="lib" aria-pressed="true">Моя полка</button><button data-s="rel" aria-pressed="false">Релизы</button><button data-s="new" aria-pressed="false">Новый фильм</button></div>
      <div id="wBox"></div>
      <div class="ev-two"><label class="f">Дата<input class="in" type="date" id="wD" placeholder="Выбрать дату" value="${s0 ? localDate(s0) : today()}"></label><label class="f">Время<input class="in" type="time" id="wTm" value="${s0 ? pad(s0.getHours()) + ":" + pad(s0.getMinutes()) : "21:00"}"></label></div>
      <label class="f" id="wLinkL">Ссылка на созвон или комнату<input class="in" id="wLink" placeholder="discord.gg/… или ссылка на совместный просмотр" value="${esc(e ? e.link || "" : "")}"></label>
      <label class="f" id="wPlL">Где собираемся<input class="in" id="wPl" placeholder="У меня дома, кинотеатр…" value="${esc(e ? e.place || "" : "")}"></label>
      <label class="f">Пара слов<textarea class="in" id="wDs" placeholder="Берите пиво и пледы">${esc(e ? e.descr || "" : "")}</textarea></label>
      ${isNew && others.length ? `<div class="av-lb">Позвать</div><div class="ev-pick" id="wPk">${others.map(p => `<button type="button" data-u="${esc(p.user_id)}" aria-pressed="false">${avaHTML(p)}${esc(p.nick)}</button>`).join("")}</div>` : ""}
      <div class="acts"><button class="ib blue" id="wOk" style="background:#e50914">${isNew ? "Позвать" : "Сохранить"}</button><button class="ib" id="wNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const setMode = m => { mode = m; q("#wLv").dataset.wm = m; q("#wLv").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.wm === m)); q("#wLinkL").hidden = m !== "online"; q("#wPlL").hidden = m !== "cinema"; };
    q("#wLv").onclick = ev => { const b = ev.target.closest("button[data-wm]"); if (b){ setMode(b.dataset.wm); SND.tick(.8); } };
    setMode(mode);
    const snap = it => ({title: it.title, originalTitle: it.originalTitle || null, cover: it.cover || null, genre: it.genre || null, year: it.year || null, type: it.type || "movie", desc: it.desc || it.short || null, kpRating: it.kpRating || null, from: it.uid || ME.id});
    const grid = list => list.length ? `<div class="wpick">${list.map((it, i) => `<button type="button" data-i="${i}" aria-pressed="${!!film && film.title === it.title}">${posterHTML(it, {tgt:false, rate:false})}<span>${esc(it.title)}</span></button>`).join("")}</div>` : `<div class="wpick"><div class="none">Тут пусто.</div></div>`;
    const draw = () => {
      q("#wSrc").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.s === src));
      const list = src === "lib" ? libK : relK;
      if (src !== "new"){ q("#wBox").innerHTML = grid(list); q("#wBox").onclick = ev => { const b = ev.target.closest("[data-i]"); if (!b) return; film = snap(list[+b.dataset.i]); file = null; q("#wBox").querySelectorAll("[data-i]").forEach(x => x.setAttribute("aria-pressed", x === b)); }; return; }
      q("#wBox").innerHTML = `<div class="wnew"><div class="row"><input class="in" id="wKp" placeholder="Ссылка на Кинопоиск" inputmode="url"><button type="button" class="ib" id="wKpGo">Заполнить</button></div><input class="in" id="wTi" placeholder="Название фильма" value="${esc(film && !film.from ? film.title : "")}"><p class="sub" id="wKpS" style="margin:0"></p></div>`;
      q("#wTi").oninput = () => { film = {...(film && !film.from ? film : {}), title: q("#wTi").value.trim()}; };
      q("#wKpGo").onclick = async () => { const b = q("#wKpGo"); b.disabled = true; b.textContent = "Ищу…";
        try { const {data: d, error} = await SB.functions.invoke("kino", {body: {url: q("#wKp").value.trim()}}); if (error || !d || d.error) throw 0;
          film = {title: d.title, originalTitle: d.originalTitle || null, genre: (d.genres || []).join(", "), year: d.year || null, type: d.type || "movie", desc: d.desc || d.short || null, kpRating: d.kpRating || null};
          if (d.cover){ const bin = Uint8Array.from(atob(d.cover), c => c.charCodeAt(0)); file = new File([bin], "kp.jpg", {type: d.coverType || "image/jpeg"}); }
          q("#wTi").value = d.title; q("#wKpS").textContent = [d.year, film.genre].filter(Boolean).join(" · ") + (file ? " · постер есть" : "");
        } catch(_){ q("#wKpS").textContent = "Не вышло, впиши название вручную"; }
        b.disabled = false; b.textContent = "Заполнить"; };
    };
    q("#wSrc").onclick = ev => { const b = ev.target.closest("[data-s]"); if (b){ src = b.dataset.s; draw(); } };
    draw();
    if (q("#wPk")) q("#wPk").onclick = ev => { const b = ev.target.closest("[data-u]"); if (b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); };
    q("#wNo").onclick = () => s.close();
    q("#wOk").onclick = async () => {
      if (!film || !film.title){ toast("Выбери фильм"); return; }
      const d = q("#wD").value, starts_at = d ? new Date(`${d}T${q("#wTm").value || "21:00"}`).toISOString() : null;
      const btn = q("#wOk"); btn.disabled = true;
      try {
        if (file) film.cover = await upload(file);
        const row = {title: film.title, kind: "watch", mode, film, starts_at, descr: q("#wDs").value.trim() || null, link: mode === "online" ? q("#wLink").value.trim() || null : null, place: mode === "cinema" ? q("#wPl").value.trim() || null : null};
        let id = e && e.id;
        if (isNew){
          id = crypto.randomUUID();
          let r = await SB.from("events").insert({id, owner: ME.id, created_at: now(), photo: null, ...row}); if (r.error) throw r.error;
          r = await SB.from("event_members").insert({event_id: id, user_id: ME.id, status: "going", updated_at: now()}); if (r.error) throw r.error;
          const inv = q("#wPk") ? [...q("#wPk").querySelectorAll('[aria-pressed="true"]')].map(b => ({event_id: id, user_id: b.dataset.u, status: "invited", invited_by: ME.id, updated_at: now()})) : [];
          if (inv.length){ r = await SB.from("event_members").insert(inv); if (r.error) toast("Приглашения не ушли: " + r.error.message); }
          evNotified.add(id);
        } else { const r = await SB.from("events").update(row).eq("id", id); if (r.error) throw r.error; }
        s.close(); toast(isNew ? "Сеанс создан" : "Сохранено"); await loadEvents(true); go("watch:" + id);
      } catch(err){ toast("Не сохранилось: " + ((err && err.message) || err)); btn.disabled = false; }
    };
  }
  function renderWatch(){
    appleHead("ГО ПОСМОТРИМ", `<button class="a-link" data-go="people">‹ Активность</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty"><b>Нужно войти</b></div>`; return; }
    if (!EV){ $("aMain").innerHTML = `<p class="a-sub" style="padding:40px">Загружаю…</p>`; loadEvents(); return; }
    const e = evById(viewEv);
    if (!e){ $("aMain").innerHTML = `<div class="a-empty" style="margin:40px 16px"><b>Сеанс не найден</b>Возможно, его отменили.</div>`; return; }
    if (!FR) loadFriends();
    const act = document.activeElement, wasF = act && act.id === "vkT", sel = wasF ? act.selectionStart : null;
    const f = filmItem(e), mem = evMem(e.id), my = evMy(e.id), own = e.owner === ME.id, gs = genres(f);
    const grp = st => mem.filter(m => m.status === st);
    const ppl = (arr, cls, t) => `<div><h4 class="${cls}">${t} · ${arr.length}</h4><div class="av">${arr.length ? arr.map(m => `<span ${m.user_id !== ME.id ? `data-user="${esc(m.user_id)}"` : ""} title="${esc(m.user_id === ME.id ? "Ты" : profOf(m.user_id).nick)}">${avaHTML(profOf(m.user_id))}</span>`).join("") : `<span class="none">никого</span>`}</div></div>`;
    const posts = EV.posts.filter(p => p.event_id === e.id).sort((a, b) => a.created_at.localeCompare(b.created_at));
    const bg = f.cover ? publicUrl(f.cover) : null;
    $("aMain").innerHTML = `<div class="wp"><div class="wp-bg" style="${bg ? `--bg:url('${bg}')` : ""}"></div><div class="wp-in">
      <div class="wp-hero"><div class="wp-pcol"><div class="pwrap">${posterHTML(f, {id: "heroPoster", tgt:false, rate:false})}<div class="gfx" id="gfx"></div></div></div>
        <div class="wp-glass">${modeBadge(e.mode)}
          <h1>${esc(f.title || e.title)}</h1>
          <div class="wp-meta">${[f.year, KTYPES[f.type], gs.slice(0, 3).join(", ")].filter(Boolean).map(esc).join(" · ")}${f.kpRating ? ` · <span class="kp">КП ${num1(f.kpRating)}</span>` : ""}</div>
          <div class="wp-when"><span>${ICON.calendar}${esc(evWhen(e))}${evIn(e) ? " · " + esc(evIn(e)) : ""}</span>${e.mode === "online" && e.link ? `<a href="${esc(/^https?:/.test(e.link) ? e.link : "https://" + e.link)}" target="_blank" rel="noopener">${ICON.link || "↗"}Подключиться</a>` : ""}${e.mode === "cinema" && e.place ? `<a href="https://yandex.ru/maps/?text=${encodeURIComponent(e.place)}" target="_blank" rel="noopener">${ICON.pin}${esc(e.place)}</a>` : ""}<span>${avaHTML(profOf(e.owner), "xs")}${esc(own ? "зовёшь ты" : "зовёт " + (profOf(e.owner).nick || ""))}</span></div>
          ${e.descr ? `<div class="wp-desc">${richText(e.descr)}</div>` : f.desc ? `<div class="wp-desc" style="opacity:.75">${esc(f.desc.slice(0, 380))}${f.desc.length > 380 ? "…" : ""}</div>` : ""}
          ${my && my.status === "invited" ? `<div class="rsvp-k" style="padding:0;color:#ffb4b8">${esc(frNick(my.invited_by || e.owner))} зовёт тебя. Пойдёшь?</div>` : ""}
          <div class="rsvp"><button class="go" data-rsvp="${esc(e.id)}:going" aria-pressed="${!!my && my.status === "going"}">✓ Иду</button><button class="no" data-rsvp="${esc(e.id)}:not" aria-pressed="${!!my && my.status === "not"}">✕ Езжайте</button></div>
          <div class="evp-acts"><button class="ib" data-evinv="${esc(e.id)}">Пригласить</button><button class="ib tg" data-tgcopy="watch:${esc(e.id)}" title="Скопировать приглашение для Телеграма"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M21.6 4.3 18.4 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L5.9 13.2 1 11.7c-1-.3-1.1-1 .2-1.5L20.2 2.9c.9-.3 1.7.2 1.4 1.4Z"/></svg>Для Телеграма</button>${f.cover ? `<button class="ib" data-tgposter="${esc(e.id)}" title="Скопировать постер картинкой — вставь в Телеграм, а текст в подпись">Постер</button>` : ""}${own ? `<button class="ib" data-wedit="${esc(e.id)}">Изменить</button><button class="ib red" data-evdel="${esc(e.id)}">Отменить</button>` : ""}</div>
          <div class="wp-ppl">${ppl(grp("going"), "go", "Идут")}${ppl(grp("not"), "no", "Не идут")}${ppl(grp("invited"), "", "Позвали")}</div>
        </div></div>
      <section class="wc"><div class="wc-h">Обсуждение<small>${posts.length ? `${posts.length} ${plural(posts.length, "сообщение", "сообщения", "сообщений")}` : ""}</small></div>
        <div class="wc-list" id="wcL">${posts.length ? posts.map(p => { const lk = likesOf(p.id), mine = p.user_id === ME.id, liked = lk.some(l => l.user_id === ME.id);
          return `<div class="wc-m${mine ? " me" : ""}">${avaHTML(profOf(p.user_id))}<div class="wc-b"><span class="nk">${esc(profOf(p.user_id).nick || "")}</span>${p.body ? `<div class="tx${onlyEmo(p.body) ? " big" : ""}">${richText(p.body)}</div>` : ""}${p.image ? `<img src="${publicUrl(p.image)}" alt="" data-vkimg="${esc(p.image)}" loading="lazy">` : ""}
            <div class="ft"><span>${vkDate(p.created_at)}</span><button class="wc-like${liked ? " on" : ""}" data-like="${esc(p.id)}" title="${esc(lk.map(l => profOf(l.user_id).nick).join(", "))}">${HEART_I}${lk.length || ""}</button>${mine || own ? `<a data-vkdel="${esc(p.id)}">удалить</a>` : ""}</div></div></div>`; }).join("") : `<div class="wc-empty">Тут пусто. Напиши, кто что берёт к фильму.</div>`}</div>
        <div class="vk-form wc-form"><textarea id="vkT" maxlength="2000" placeholder="Сообщение… Ctrl+Enter — отправить"></textarea>
          <div class="vk-tools"><span class="vk-emo">${EMO.map(([k, ch, l]) => `<button type="button" data-emo="${ch}" title="${l}">${emoSpan(k)}</button>`).join("")}</span>
            <label class="vk-att" for="vkF">картинка</label><input type="file" id="vkF" accept="image/*" hidden><span class="vk-prev" id="vkP"></span>
            <button type="button" class="vk-btn" id="vkGo">Отправить</button></div></div></section>
    </div></div>`;
    wireWall(e, wasF, sel);
    const L = $("wcL"); if (L) L.scrollTop = L.scrollHeight;
    playFx(f);
  }
  // ================= 2.5: ручной порядок игр =================
  function orderSheet(kind = "games"){
    const gk = kind === "games", list = MYITEMS.filter(i => (gk ? isGame(i) : !isGame(i)) && inLib(i)).sort(byOrd);
    if (!list.length){ toast("Пока пусто"); return; }
    const s = openSheet(`<h3>${gk ? "Порядок игр" : "Порядок кино"}</h3><p class="sub">Перетаскивай обложки. В таком порядке игры стоят у тебя на главной и в твоём профиле у друзей.</p>
      <div class="og" id="og">${list.map(i => `<div class="og-c" data-oid="${esc(i.id)}">${posterHTML(i, {tgt:false, rate:false})}<span>${esc(i.title)}</span></div>`).join("")}</div>
      <div class="acts"><button class="ib blue" id="ogOk">Сохранить</button><button class="ib" id="ogRate">По оценке</button><button class="ib" id="ogNo">Отмена</button></div>`, {wide: true});
    const box = s.el.querySelector("#og"); let drag = null;
    const flip = mv => { const cs = [...box.children], r0 = new Map(cs.map(c => [c, c.getBoundingClientRect()])); mv();
      cs.forEach(c => { if (c === (drag && drag.c)) return; const a = r0.get(c), b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top; if (!dx && !dy) return;
        c.style.transition = "none"; c.style.transform = `translate(${dx}px,${dy}px)`; requestAnimationFrame(() => { c.style.transition = "transform .28s cubic-bezier(.2,.9,.3,1.1)"; c.style.transform = ""; }); }); };
    box.addEventListener("pointerdown", e => { const c = e.target.closest(".og-c"); if (!c || e.button) return; e.preventDefault(); drag = {c, x: e.clientX, y: e.clientY, on: false}; try { box.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } });
    box.addEventListener("pointermove", e => { if (!drag) return;
      if (!drag.on){ if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return; drag.on = true; drag.c.classList.add("lift"); }
      const t = document.elementFromPoint(e.clientX, e.clientY), o = t && t.closest(".og-c");
      if (!o || o === drag.c || o.parentNode !== box) return;
      const cs = [...box.children], from = cs.indexOf(drag.c), to = cs.indexOf(o);
      flip(() => box.insertBefore(drag.c, from < to ? o.nextSibling : o)); SND.tick(.5); });
    const end = () => { if (!drag) return; drag.c.classList.remove("lift"); drag = null; };
    box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
    s.el.querySelector("#ogNo").onclick = () => s.close();
    s.el.querySelector("#ogRate").onclick = () => { const cs = [...box.children], byId = new Map(list.map(i => [i.id, i]));
      flip(() => cs.sort((a, b) => (byId.get(b.dataset.oid).rating ?? -1) - (byId.get(a.dataset.oid).rating ?? -1)).forEach(c => box.appendChild(c))); };
    s.el.querySelector("#ogOk").onclick = async () => { const b = s.el.querySelector("#ogOk"); b.disabled = true; b.textContent = "Сохраняю…";
      const ids = [...box.children].map(c => c.dataset.oid); let bad = 0;
      for (let i = 0; i < ids.length; i++){ const it = items.find(x => x.id === ids[i]); if (!it || it.ord === i) continue;
        try { await db.doc("items/" + it.id).update({ord: i}); it.ord = i; } catch(_){ bad++; } }
      if (gk) gSort = "mine"; else kSort = "mine"; s.close(); toast(bad ? "Часть не сохранилась" : "Порядок сохранён"); render(); };
  }
  document.addEventListener("click", async e => {
    const el = e.target.closest && e.target.closest("[data-ordg],[data-like],[data-wnew],[data-w],[data-wedit],[data-rd],[data-radd],[data-rt],[data-rtab],[data-rv],[data-radd2],[data-rplan]"); if (!el || !ME) return;
    if (el.dataset.ordg){ orderSheet(); return; }
    if (el.dataset.like){ toggleLike(el.dataset.like); return; }
    if (el.dataset.wnew){ if (!FR) await loadFriends(); watchSheet(null); return; }
    if (el.dataset.w){ go("watch:" + el.dataset.w); return; }
    if (el.dataset.wedit){ watchSheet(evById(el.dataset.wedit)); return; }
    if (el.dataset.rd){ const r = (READS || []).find(x => x.id === el.dataset.rd); if (r){ if (el.closest(".rx")) flyOpen(el, () => readSheet(r)); else readSheet(r); } return; }
    if (el.dataset.radd){ readSheet(null); return; }
    if (el.dataset.rt != null){ rType = el.dataset.rt; renderRead(); return; }
    if (el.dataset.rtab){ rTab = el.dataset.rtab; renderRead(); return; }
    if (el.dataset.rv){ rView = el.dataset.rv; lsSet("nexus_rview", rView); renderRead(); return; }
    if (el.dataset.radd2){ const [st, fv] = el.dataset.radd2.split(":"); readShelfPick(st, !!fv); return; }
    if (el.dataset.rplan){ planListSheet(); return; }
  });

  // ================= 3.0: горизонтальные полки — тянуть мышкой, стрелки, трекпад =================
  const CHEV_L = I('<path d="M15 5l-7 7 7 7"/>'), CHEV_R = I('<path d="m9 5 7 7-7 7"/>'), HEART_O = I('<path d="M12 20.5s-7.2-4.4-9.2-8.8C1.4 8.5 3.4 4.8 6.9 4.8c2 0 3.4 1.1 5.1 3.1 1.7-2 3.1-3.1 5.1-3.1 3.5 0 5.5 3.7 4.1 6.9-2 4.4-9.2 8.8-9.2 8.8Z"/>');
  const CHECK_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const railHTML = (cls, inner) => `<div class="hs ${cls}"><button class="hs-b prev" type="button" aria-label="Листать назад">${CHEV_L}</button><div class="hs-in" data-hscroll="1">${inner}</div><button class="hs-b next" type="button" aria-label="Листать вперёд">${CHEV_R}</button></div>`;
  function wireHScroll(el){
    if (el.dataset.hscroll === "2") return; el.dataset.hscroll = "2";
    const wrap = el.closest(".hs");
    const sync = () => { if (!wrap) return; const max = el.scrollWidth - el.clientWidth - 2; wrap.classList.toggle("at-s", el.scrollLeft <= 2); wrap.classList.toggle("at-e", el.scrollLeft >= max); wrap.classList.toggle("fits", max <= 0); };
    el.addEventListener("scroll", sync, {passive: true}); requestAnimationFrame(sync); setTimeout(sync, 500);
    let d = null, moved = false, vel = 0, lx = 0, lt = 0, mom = 0;
    el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button) return; cancelAnimationFrame(mom); d = {x: e.clientX, l: el.scrollLeft}; moved = false; lx = e.clientX; lt = performance.now(); vel = 0; });
    el.addEventListener("pointermove", e => { if (!d) return; const dx = e.clientX - d.x;
      if (!moved && Math.abs(dx) > 5){ moved = true; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } }
      if (!moved) return; el.scrollLeft = d.l - dx; const t = performance.now(); vel = (e.clientX - lx) / Math.max(1, t - lt); lx = e.clientX; lt = t; });
    const up = () => { if (!d) return; d = null; el.classList.remove("drag"); if (!moved) return;
      let v = -vel * 16; const step = () => { v *= .92; el.scrollLeft += v; if (Math.abs(v) > .4) mom = requestAnimationFrame(step); }; mom = requestAnimationFrame(step); };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
    el.addEventListener("click", e => { if (moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    el.addEventListener("dragstart", e => e.preventDefault());
    if (wrap) wrap.querySelectorAll(":scope > .hs-b").forEach(b => b.onclick = () => { SND.tick(.6); el.scrollBy({left: (b.classList.contains("prev") ? -1 : 1) * Math.max(160, el.clientWidth * .8), behavior: "smooth"}); });
    if (el.classList.contains("rx-rack")){ let lastSnd = 0; el.addEventListener("pointerover", e => { const m = e.target.closest(".rx-mag"); if (!m || m.contains(e.relatedTarget) || d) return; const t = performance.now(); if (t - lastSnd > 140){ lastSnd = t; SND.paper("soft"); } }); }
  }
  const wireHScrolls = () => document.querySelectorAll('[data-hscroll="1"]').forEach(wireHScroll);
  const fmtShort = s => { if (!s) return ""; const d = parseD(String(s).slice(0, 10)); return d.toLocaleDateString("ru-RU", {day: "numeric", month: "short", ...(d.getFullYear() !== new Date().getFullYear() ? {year: "numeric"} : {})}).replace(/\s+г\.$/, "").replace(/\.$/, ""); };
  const isoDay = v => v ? String(v).slice(0, 10) : "";

  // ================= 3.0: профиль в стиле Steam — главная и профиль друга =================
  const PF_COLS = "user_id,nick,avatar,ava_animal,ava_color,birthday,created_at,pid,bg,bg_m,bg_dim"; // без новых колонок — запасной вариант, если базу ещё не обновили
  const PF_COLS_FULL = PF_COLS + ",cosm,avatar_full,ava_cfg"; // оформление профиля и большая аватарка
  let pfPend = null, PF_BG = null; // «добавить новую и сразу в любимые / сейчас играю»; фон открытого профиля
  const frReads = uid => FR && FR.reads ? FR.reads.filter(r => r.uid === uid) : [];
  const rNorm = s => s === "reading" ? "reading" : s === "done" ? "done" : s === "dropped" ? "dropped" : "plan";
  const RSTAT3 = [["plan", "В планах"], ["reading", "Читаю"], ["done", "Прочитано"], ["dropped", "Брошено"]];
  const byAt = k => (a, b) => String(b[k] || "").localeCompare(String(a[k] || ""));
  function pfLevel(n){ const lv = 1 + Math.floor(n / 5); return {lv, pct: (n % 5) / 5 * 100}; }
  function pfEvents(uid, withMe){
    if (!FR) return [];
    const ev = [];
    for (const it of FR.items){
      if ((!withMe && ME && it.uid === ME.id) || (uid && it.uid !== uid)) continue;
      const add = (d, verb) => { if (d) ev.push({it, uid: it.uid, d: isoDay(d), ts: it._upd || "", verb}); };
      if (isGame(it)){ const s = gStatus(it.status);
        if (it.status === "future") add(it.createdAt, "хочет поиграть в"); else if (it.status === "soon") add(it.createdAt, "ждёт релиз");
        else if (s === "done") add(it.finishedAt || it.date || it.createdAt, "прошёл"); else if (s === "youtube") add(it.finishedAt || it.date || it.createdAt, "посмотрел прохождение"); else if (s === "dropped") add(it.finishedAt || it.date || it.createdAt, "дропнул");
        else if (s === "endless") add(it.date || it.createdAt, "залип в"); else add(it.date || it.createdAt, "играет в");
      } else {
        if (it.status === "future") add(it.createdAt, "хочет посмотреть"); else if (it.status === "soon") add(it.createdAt, "ждёт премьеру");
        else if (it.status === "done" || it.status === "played") add(it.date || it.createdAt, "посмотрел"); else if (it.status === "dropped") add(it.updatedAt || it.createdAt, "бросил");
        else if (it.status === "paused") add(it.updatedAt || it.createdAt, "отложил"); else add(it.date || it.createdAt, "смотрит");
      }
    }
    for (const r of FR.reads || []){
      if ((!withMe && ME && r.uid === ME.id) || (uid && r.uid !== uid)) continue;
      const st = rNorm(r.status), d = isoDay(st === "plan" ? r.createdAt : r.updatedAt || r.createdAt);
      if (d) ev.push({rd: r, uid: r.uid, d, ts: r._upd || "", verb: st === "done" ? "прочитал" : st === "reading" ? "читает" : st === "dropped" ? "бросил" : "хочет прочитать"});
    }
    const td = today();
    return ev.filter(e => e.d <= td).sort((a, b) => b.d.localeCompare(a.d) || b.ts.localeCompare(a.ts));
  }
  const pfFeedRow = (e, showWho) => {
    const t = e.rd ? e.rd.title : e.it.title, r = e.it && typeof e.it.rating === "number" && /прошёл|дропнул|посмотрел|бросил/.test(e.verb) ? `<span class="r ${rateCls(e.it.rating)}">${num1(e.it.rating)}</span>` : "";
    const cov = e.rd ? `<span class="pf-fd-cv">${rCover(e.rd)}</span>` : posterHTML(e.it, {rate: false, tgt: false, badge: false});
    const attr = e.rd ? `data-frd="${esc(e.uid + "/" + e.rd.id)}"` : `data-fi="${esc(e.uid + "/" + e.it.id)}"`;
    return `<button class="pf-fd${showWho ? "" : " solo"}" ${attr}>${showWho ? avaHTML(profOf(e.uid), "sm") : ""}<span class="t">${showWho ? `<b class="nk">${esc(frNick(e.uid))}</b> ` : ""}<span class="vb">${e.verb}</span> <b>${esc(t)}</b><small>${agoTxt(e.d)} · ${e.rd ? esc((RTYPE[e.rd.type] || "книга").toLowerCase()) : isGame(e.it) ? "игра" : esc((KTYPES[e.it.type] || "кино").toLowerCase())}</small></span>${r}${cov}</button>`;
  };
  function topHTML3(n){
    if (typeof v6Top === "function") return v6Top(n);
    if (!FR) return `<p class="pf-mute">Загружаю…</p>`;
    const since = Date.now() - 30 * 864e5, by = new Map();
    FR.profiles.forEach(p => by.set(p.user_id, {p: ME && p.user_id === ME.id ? {...p, ...myProf()} : p, n: 0, lib: 0, last: ""}));
    const seen = (r, ts) => { if (ts && String(ts) > r.last) r.last = String(ts); };
    FR.items.forEach(i => { const r = by.get(i.uid); if (!r) return; if (inLib(i)) r.lib++; seen(r, i._upd); if (Date.parse(i._upd || i.updatedAt || i.createdAt || 0) > since) r.n++; });
    (FR.reads || []).forEach(x => { const r = by.get(x.uid); if (!r) return; r.lib++; seen(r, x._upd); if (Date.parse(x._upd || x.updatedAt || 0) > since) r.n++; });
    if (WALL){ WALL.posts.forEach(x => { const r = by.get(x.user_id); if (r) seen(r, x.created_at); }); WALL.comments.forEach(x => { const r = by.get(x.user_id); if (r) seen(r, x.created_at); }); }
    const t = [...by.values()].sort((a, b) => b.n - a.n || b.lib - a.lib).slice(0, n), mx = Math.max(1, ...t.map(x => x.n));
    return `<ol class="pf-top">${t.map(({p, n: k, lib, last}, i) => { const me = ME && p.user_id === ME.id, mins = last ? (Date.now() - Date.parse(last)) / 6e4 : 1e9;
      return `<li><button class="pf-tr${me ? " me" : ""}" ${me ? 'data-go="home"' : `data-user="${esc(p.user_id)}"`}><span class="n r${i + 1}">${i + 1}</span><span class="pf-av">${avaHTML(p)}${mins < 30 ? '<i class="on" title="обновлял только что"></i>' : mins < 1440 ? '<i class="rc" title="обновлял сегодня"></i>' : ""}</span><span class="t"><b>${esc(p.nick)}${me ? " <em>ты</em>" : ""}</b><small>${last ? `<span class="upd${mins < 1440 ? " fresh" : ""}">обновлял ${esc(agoTs(last))}${mins >= 1 && mins < 1440 ? " назад" : ""}</span> · ` : ""}${k} ${plural(k, "действие", "действия", "действий")} · ${lib} на полках</small><span class="bar"><i style="width:${Math.round(k / mx * 100)}%"></i></span></span><span class="lv" title="Уровень">${pfLevel(lib).lv}</span></button></li>`; }).join("")}</ol>`;
  }
  function renderProfile(uid){
    const mine = !uid || (ME && uid === ME.id); PF_BG = null;
    appleHead(mine ? "Профиль" : "", mine ? "" : `<button class="a-link" data-go="people">‹ Активность</button>`);
    const box = $("aMain");
    if (!ME){ box.innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!FR) loadFriends();
    if (mine && !READS) loadReads();
    if (!mine && !FR){ box.innerHTML = `<p class="a-sub" style="padding:40px 16px">Загружаю…</p>`; return; }
    const p0 = mine ? myProf() : FR.profiles.find(x => x.user_id === uid);
    if (!p0){ box.innerHTML = `<div class="a-empty" style="margin:40px 16px"><b>Такого человека нет</b>Может, он удалил аккаунт.</div>`; return; }
    const fp = FR && FR.profiles.find(x => x.user_id === (mine ? ME.id : uid)), p = mine ? {...(fp || {}), ...p0} : p0;
    const its = mine ? MYITEMS : frItems(uid), rds = mine ? (READS || []) : frReads(uid);
    const g = its.filter(isGame), k = its.filter(i => !isGame(i));
    const card = (it, sub, cls = "") => `<button class="pf-c${cls}" ${mine ? `data-id="${esc(it.id)}"` : `data-fi="${esc(uid + "/" + it.id)}"`}>${posterHTML(it, {tgt: false})}<span class="ti">${esc(it.title)}</span>${sub ? `<small>${sub}</small>` : ""}</button>`;
    const add = (key, label = "Добавить") => mine ? `<button class="pf-add" type="button" data-pfpick="${key}"><i>${ICON.plus}</i><span>${label}</span></button>` : "";
    const empty = (txt, key) => `<div class="pf-empty"><span>${txt}</span>${mine && key ? `<button class="pf-eb" type="button" data-pfpick="${key}">${ICON.plus}Добавить</button>` : ""}</div>`;
    const show = (title, n, body, o = {}) => `<section class="pf-box${o.cls ? " " + o.cls : ""}" data-sk="${CS_SEC_BY_T[title] || ""}"><header><h3>${title}${n != null ? `<small>${n}</small>` : ""}</h3>${o.act || ""}</header>${body}</section>`;
    const rail = (list, fn, addKey) => list.length || addKey ? railHTML("pf-rail", list.map(fn).join("") + (addKey ? add(addKey) : "")) : "";
    const stTxt = it => isFuture(it) ? "на будущее" : isSoon(it) ? (isGame(it) ? "ждёт релиз" : "ждёт премьеру") : isGame(it) ? GSTATUS[gStatus(it.status)].toLowerCase() : kLab(it).l.toLowerCase();
    // ---- игры
    const nowG = shelfOf("gnow", g), favG = shelfOf("gfav", g), doneG = shelfOf("gdone", g), ytG = shelfOf("gyt", g), dropG = shelfOf("gdrop", g);
    const R = (k, list) => mine ? reordBtn(k, list.length) : "";
    const pile = (list, fn, addKey) => list.length || addKey ? railHTML("pf-rail pf-pile", list.map(fn).join("") + (addKey ? add(addKey) : "")).replace('data-hscroll="1"', 'data-hscroll="1" data-pile="1"') : "";
    const vrail = (list, sub, addKey) => list.length || addKey ? railHTML("pf-rail pf-tv", list.map(i => tvCard(i, mine ? `data-id="${esc(i.id)}"` : `data-fi="${esc(uid + "/" + i.id)}"`, sub(i))).join("") + (addKey ? add(addKey) : "")) : "";
    const dropCard = it => `<button class="pf-c gdrop" ${mine ? `data-id="${esc(it.id)}"` : `data-fi="${esc(uid + "/" + it.id)}"`}>${posterHTML(it, {tgt: false, badge: false})}<span class="stamp">ДРОП</span><span class="ti">${esc(it.title)}</span><small>${it.finishedAt || it.date ? `брошена ${fmtShort(it.finishedAt || it.date)}` : "брошена"}</small></button>`;
    // 6.0.2: витрина как в лаунчере — топ-6 крупно, остальные значками, всё — по кнопке
    const at = it => mine ? `data-id="${esc(it.id)}"` : `data-fi="${esc(uid + "/" + it.id)}"`;
    const gDate = it => it.finishedAt || it.date || null;
    const byDate = list => [...list].sort((a, b) => (gDate(b) || "").localeCompare(gDate(a) || ""));
    const big = (it, sub, drop) => `<button class="v6-pc${drop ? " v6-drop" : ""}" ${at(it)} title="${esc(it.title)}">${posterHTML(it, {tgt: false, badge: !drop})}${drop ? `<span class="v6-stamp">ДРОП</span>` : ""}<span class="ti">${esc(it.title)}</span>${sub ? `<small>${sub}</small>` : ""}</button>`;
    const favN = Math.max(1, Math.min(6, +((p.cosm && p.cosm.favN) || 6)));
    const favBlock = (list, key) => { if (!list.length) return empty("Пока не выбрал любимые", key);
      return `<div class="v6-top">${list.slice(0, favN).map((it, i) => big(it, `<b>#${i + 1}</b>${typeof it.rating === "number" ? ` · <span class="r ${rateCls(it.rating)}">${num1(it.rating)}</span>` : ""}`)).join("")}</div>`; };
    const lastBlock = (list, txt, drop) => list.length ? `<div class="v6-top">${byDate(list).slice(0, 6).map(it => big(it, gDate(it) ? fmtShort(gDate(it)) : "без даты", drop)).join("")}</div>` : empty(txt);
    const allBtn = (k, n, l) => n > 0 ? `<button class="pf-mini v6-all-b" type="button" data-v6all="${k}${mine ? "" : ":" + esc(uid)}">${l} · ${n}</button>` : "";
    const fh = (ic, title, href, kind) => `<div class="pf-fh"><span class="ic">${ic}</span><h2>${title}</h2><span class="pf-fh-r"><button class="pf-fh-b upd" type="button" data-upd="${kind}${mine ? "" : ":" + esc(uid)}">${ICON.clock}Обновления</button><a href="${href}">вся полка ›</a></span></div>`;
    // ---- кино
    const favK = shelfOf("kfav", k), nowK = shelfOf("know", k), seenK = shelfOf("kseen", k), planK = shelfOf("kplan", k);
    // ---- книги
    const favR = shelfOf("rfav", rds), nowR = shelfOf("rnow", rds), doneR = shelfOf("rdone", rds);
    const magAttr = r => mine ? `data-rd="${esc(r.id)}"` : `data-frd="${esc(uid + "/" + r.id)}"`;
    const mag = (r, i, pg) => `<button class="rx-mag${pg ? " pg-on" : ""}" ${magAttr(r)} style="--i:${i};--tilt:${(((i * 7) % 5) - 2) * 1.1}deg">${rCover(r)}${pg && mine ? `<span class="sc-x" role="button" data-unnow="read:${esc(r.id)}" title="Убрать с полки">${ICON.x}</span>` : ""}${pg ? (r.chTotal ? `<span class="pg" title="${r.chRead || 0} из ${r.chTotal} глав"><i style="width:${Math.min(100, (r.chRead || 0) / r.chTotal * 100)}%"></i></span><span class="pg-t">${r.chRead || 0} / ${r.chTotal} гл.</span>` : `<span class="pg-t">${r.chRead ? `${r.chRead} гл.` : "читает"}</span>`) : ""}</button>`;
    const rack = (list, addKey, emptyTxt, pg) => `<div class="pf-shelf${pg ? " pg-sh" : ""}">${list.length || addKey ? railHTML("rx-hs", `${list.map((r, i) => mag(r, i, pg)).join("")}${addKey && mine ? `<button class="rx-mag rx-addm" type="button" data-pfpick="${addKey}" style="--i:${list.length}"><span class="rx-cv"><span class="ph"><b>+</b><small>Добавить</small></span></span></button>` : ""}`).replace('class="hs-in"', 'class="hs-in rx-rack"') : ""}${!list.length && !mine ? `<p class="pf-mute pf-ish">${emptyTxt}</p>` : ""}<div class="rx-plank"></div></div>`;
    // ---- шапка
    const libN = g.filter(inLib).length + k.filter(inLib).length + rds.length, L = csLevel(mine ? ME.id : uid);
    const bdN = p.birthday ? bdNext(p.birthday) : null, c = !mine && FR ? compat(uid) : {pct: null};
    const lastEv = !mine ? pfEvents(uid, true)[0] : null;
    const since = p.created_at ? new Date(p.created_at).toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"}).replace(/\s+г\.$/, "") : "";
    const stats = [[g.filter(inLib).length, plural(g.filter(inLib).length, "игра", "игры", "игр")], [doneG.length, "пройдено"], [k.filter(inLib).length, "кино"], [seenK.length, "просмотрено"], [rds.length, rds.length === 1 ? "книга" : "книг"], [doneR.length, "прочитано"]];
    const bg = p.bg ? publicUrl(p.bg) : null, dim = p.bg_dim ?? 45; PF_BG = p.bg ? {img: p.bg, m: p.bg_m || null, dim} : null;
    const feed = mine ? pfEvents(null, false).slice(0, 14) : pfEvents(uid, true).slice(0, 14);
    // 7.0: шапка «Журнал» — огромный ник, тонкая типографика, игры в процессе таблетками
    const HD = csHdr(p), lb = (n, a, b) => `${n} ${plural(n, ...a)}${b != null ? `, ${b}` : ""}`;
    const nk = p.nick || NICK, nl = [...nk].length;
    const head = `<section class="pf-head d7${HD ? " has-hb hb-" + HD.h : ""}">
        ${HD ? `<div class="d7-hb" aria-hidden="true"><i style="background-image:url('${esc(HD.url)}');background-position:${HD.x}% ${HD.y}%;${HD.blur ? `filter:blur(${HD.blur}px);inset:-${HD.blur * 2}px;` : ""}"></i></div><div class="d7-dim" style="--dim:${HD.dim / 100}"></div>` : ""}
        <div class="pf-acts">${mine ? `<button class="pf-btn v6-cs-b" type="button" data-cosm="1">${ICON.palette || ICON.edit}<span>Оформление</span></button><button class="pf-btn ic" type="button" data-pfbg="1" title="Фон профиля" aria-label="Фон профиля">${ICON.wall}</button><button class="pf-btn ic" type="button" data-profile="1" title="Редактировать профиль" aria-label="Редактировать профиль">${ICON.edit}</button>${vacHas(ME.id) ? `<button class="pf-btn ic" type="button" data-vacof="${esc(ME.id)}" title="Отпуск" aria-label="Отпуск">${VC_I.palm}</button>` : ""}`
          : `<a class="pf-btn" href="#fv:${esc(uid)}:games">${ICON.games}<span>Полка игр</span></a><a class="pf-btn" href="#fv:${esc(uid)}:kino">${ICON.kino}<span>Полка кино</span></a>${vacHas(uid) ? `<button class="pf-btn ic" type="button" data-vacof="${esc(uid)}" title="Отпуск" aria-label="Отпуск">${VC_I.palm}</button>` : ""}`}</div>
        <div class="d7-top">
          <div class="pf-ava v6s-${avaShape(p)}${csOf(p).frame ? " has-frame" : ""}">${avaBigHTML(p)}${csFrameHTML(p)}</div>
          <div class="pf-id">
            <div class="d7-k">${p.pid ? `<button class="pf-pid" type="button" data-pid="${esc(p.pid)}" title="Скопировать ID">ИГРОК № ${esc(p.pid)}</button>` : "<span>ИГРОК</span>"}<span class="pf-lvl" title="Уровень растёт за дела на сайте: 30 опыта — уровень. Сейчас ${L.xp} опыта, до следующего ${L.next - L.xp}">УРОВЕНЬ ${L.lv}<i class="d7-lb"><i style="width:${Math.round(L.pct)}%"></i></i></span>${typeof v6Tags === "function" ? v6Tags(mine ? ME.id : uid) : ""}</div>
            <h1 style="--nl:${Math.max(3, nl)}">${esc(nk)}</h1>
          </div>
        </div>
        <div class="d7-row">
          <div class="pf-stats"><span><b>${g.filter(inLib).length}</b>${lb(g.filter(inLib).length, ["игра", "игры", "игр"], doneG.length + " пройдено")}</span><span><b>${k.filter(inLib).length}</b>кино, ${seenK.length} ${mine ? "видел" : "видел(а)"}</span><span><b>${rds.length}</b>${lb(rds.length, ["книга", "книги", "книг"], doneR.length + " прочитано")}</span></div>
          <div class="pf-tags">${since ? `<span>с ${esc(since)}</span>` : ""}${bdN ? `<span>${ICON.cake}${bdLabel(p.birthday)}${bdN.days === 0 ? " — сегодня!" : bdN.days === 1 ? " — завтра" : ""}</span>` : ""}<span class="pf-on${!mine && lastEv && agoTxt(lastEv.d) === "сегодня" ? " live" : ""}">${mine ? "Это ты" : lastEv ? `был ${agoTxt(lastEv.d)}` : "пока ничего не добавил"}${c.pct != null ? ` · совпадение <b class="${pctCls(c.pct)}">${c.pct}%</b>` : ""}</span></div>
        </div>
        ${nowG.length || mine ? `<div class="d7-play"><span class="lbl">ИГРАЕТ</span><div class="d7-pl">${nowG.map(i => `<button class="d7-pill" type="button" ${mine ? `data-id="${esc(i.id)}"` : `data-fi="${esc(uid + "/" + i.id)}"`} title="${esc(stTxt(i))}${i.date ? ` · с ${fmtShort(i.date)}` : ""}"><span class="cv">${i.cover ? `<img alt="" loading="lazy" src="${esc(publicUrl(i.cover))}">` : esc((i.title || "?").slice(0, 1))}</span>${esc(i.title)}${/онлайн/i.test(stTxt(i)) ? '<i class="on"></i>' : ""}</button>`).join("")}${mine ? `<button class="d7-pill add" type="button" data-pfpick="games:now">${ICON.plus}${nowG.length ? "" : "Во что играешь?"}</button>${nowG.length > 1 ? R("gnow", nowG) : ""}` : ""}</div></div>` : ""}
      </section>`;
    const games = `<section class="pf-floor fl-g">${fh(ICON.games, "Игры", mine ? "#games" : `#fv:${esc(uid)}:games`, "games")}
        ${show("Любимые игры", favG.length || null, favBlock(favG, "games:fav"), {cls: "fav v6", act: (mine ? `<button class="pf-mini" type="button" data-pfpick="games:fav">${ICON.plus}Добавить</button><button class="pf-mini" type="button" data-favn="1" title="Сколько показывать">${favN} из ${favG.length}</button>` : "") + R("gfav", favG) + allBtn("gfav", favG.length, "Показать все")})}
        ${show("Пройденные", doneG.length || null, lastBlock(doneG, mine ? "Пройденные игры появятся здесь с датой" : "Пока ничего не прошёл"), {cls: "v6", act: allBtn("gdone", doneG.length, "Показать все")})}
        ${ytG.length ? show("Прошёл на YouTube", ytG.length, lastBlock(ytG, ""), {cls: "yt-b v6", act: allBtn("gyt", ytG.length, "Показать все")}) : ""}
        ${show("Дроп", dropG.length || null, lastBlock(dropG, mine ? "Брошенные игры встанут сюда — серые, с красным штампом" : "Ничего не бросал", true), {cls: "drop-b v6", act: allBtn("gdrop", dropG.length, "Показать все")})}
      </section>`;
    const kino = `<section class="pf-floor fl-k">${fh(ICON.kino, "Кино и сериалы", mine ? "#kino" : `#fv:${esc(uid)}:kino`, "kino")}
        ${show("Любимые фильмы и сериалы", favK.length || null, favK.length || mine ? vrail(favK, i => esc([KTYPES[i.type], i.year].filter(Boolean).join(" · ")), "kino:fav") : empty("Пока не выбрал любимые"), {cls: "fav", act: R("kfav", favK)})}
        ${show("Смотрю", nowK.length || null, nowK.length || mine ? rail(nowK, i => { const et = +i.epTotal || 0, ew = +i.epWatched || 0;
          return `<button class="pf-c" ${mine ? (isSerT(i.type) ? `data-epsh="${esc(i.id)}"` : `data-id="${esc(i.id)}"`) : `data-fi="${esc(uid + "/" + i.id)}"`}>${posterHTML(i, {tgt: false, rate: false})}${mine ? `<span class="sc-x" role="button" data-unnow="kino:${esc(i.id)}" title="Убрать с полки">${ICON.x}</span>` : ""}${et ? `<span class="pf-pb" title="${ew} из ${et} серий"><i style="width:${Math.min(100, ew / et * 100)}%"></i></span>` : ""}<span class="ti">${esc(i.title)}</span><small>${et ? `${ew} из ${et} серий` : isSerT(i.type) ? (ew ? `${ew} ${plural(ew, "серия", "серии", "серий")}` : "смотрит") : "смотрит"}</small>${mine && isSerT(i.type) ? `<span class="pf-more" role="button" data-kmore="${esc(i.id)}">Подробнее ›</span>` : ""}</button>`; }, "kino:now") : empty("Ничего не отметил"), {cls: "now-k", act: R("know", nowK)})}
        ${show("Просмотренные", seenK.length || null, seenK.length ? vrail(seenK, i => i.date ? "смотрел " + fmtShort(i.date) : "без даты") : empty(mine ? "Просмотренное появится здесь с датой просмотра" : "Пока ничего не посмотрел"), {act: R("kseen", seenK)})}
        ${show("Буду смотреть", planK.length || null, planK.length ? vrail(planK, i => esc(KTYPES[i.type] || "кино")) : empty(mine ? "Отложи что-нибудь на потом — появится здесь" : "Список пуст", mine ? "kino:future" : null), {act: R("kplan", planK)})}
      </section>`;
    const books = `<section class="pf-floor fl-r"><div class="pf-fh"><span class="ic">${BOOK_I}</span><h2>Книги, манга, комиксы</h2>${mine ? `<a href="#read">Читалка ›</a>` : ""}</div>
        ${show("Любимые тайтлы", favR.length || null, rack(favR, "read:fav", "Пока не выбрал любимые"), {cls: "shelf", act: R("rfav", favR)})}
        ${show("Сейчас читаю", nowR.length || null, rack(nowR, "read:now", "Ничего не отметил", true), {cls: "shelf", act: R("rnow", nowR)})}
        ${show("Прочитанные", doneR.length || null, rack(doneR, null, "Пока ничего не дочитал"), {cls: "shelf", act: R("rdone", doneR)})}
      </section>`;
    const side = `<aside class="pf-side">${mine ? `<div class="v6-d-only">${evNextCard()}</div>${v6TasksCard()}${v6NagCard()}${v6RxCard()}` : ""}
        <div class="pf-card"><h3>${ICON.trophy}Рейтинг<small>сезон месяца</small></h3>${topHTML3(10)}</div>
        <div class="pf-card"><h3>${ICON.people}${mine ? "Лента друзей" : "Активность"}${mine ? `<small><a href="#people">вся ›</a></small>` : ""}</h3>${FR ? (feed.length ? `<div class="pf-feed">${feed.map(e => pfFeedRow(e, mine)).join("")}</div>` : `<p class="pf-mute">Пока тихо.</p>`) : `<p class="pf-mute">Загружаю…</p>`}</div>
        ${c.pct != null ? `<div class="pf-card"><h3>${HEART_O}Совпадение вкусов<small>${c.common.length} общих</small></h3><div class="pf-cmp"><b class="${pctCls(c.pct)}">${c.pct}%</b>${[...c.common].sort((a, b) => a.d - b.d).slice(0, 4).map(x => `<div class="r"><span>${esc(x.f.title)}</span><span>${num1(x.m.rating)} / ${num1(x.f.rating)}</span></div>`).join("")}</div></div>` : ""}
      </aside>`;
    const CSA = csPfAttrs(p);
    box.innerHTML = `<div class="pf${bg ? " has-bg" : ""}${CSA.cls}" style="--ac:${esc(p.ava_color || avaBg(p))};${CSA.style}">${csCss(p)}
      ${head}
      <div class="pf-cols"><div class="pf-main">${mine ? `<button type="button" class="v6-work" id="workHome" data-worksheet="1" hidden></button><div class="v6-m-only">${evNextCard()}</div>` : ""}${csOrder(p, {games, kino, books, tl: tlFloor(mine ? ME.id : uid, mine, g, k), sc: scFloor(mine ? ME.id : uid, mine)})}</div>${side}</div></div>`;
    wireHScrolls(); csFxApply(p); csCheckNew();
  }

  // выбор любимых и «сейчас играю» из своей полки
  function pfPick(key){
    const [kind, flag] = key.split(":");
    if (kind === "kino" && flag === "future"){ openForm(null, "kino", {lock: "future"}); return; }
    const isR = kind === "read";
    const pool = isR ? [...(READS || [])].sort(byAt("updatedAt")) : MYITEMS.filter(i => kind === "games" ? isGame(i) : !isGame(i)).sort((a, b) => (b[flag] ? 1 : 0) - (a[flag] ? 1 : 0) || byAt("updatedAt")(a, b));
    const title = flag === "now" ? (kind === "games" ? "Сейчас играю" : kind === "kino" ? "Смотрю сейчас" : "Сейчас читаю") : kind === "games" ? "Любимые игры" : kind === "kino" ? "Любимые фильмы и сериалы" : "Любимые тайтлы";
    const hint = flag === "now" ? (kind === "games" ? "Отметь игры, в которые играешь сейчас. Друзья увидят их наверху твоего профиля." : kind === "kino" ? "Отметь сериалы и фильмы, которые смотришь. Прогресс по сериям — полоской под обложкой." : "Отметь, что читаешь. Если указаны главы — будет полоска прогресса.") : "Отметь любимое — оно встанет на витрину в профиле.";
    const cell = x => `<button type="button" class="pk-c" data-k="${esc(x.id)}" aria-pressed="${!!x[flag]}">${isR ? rCover(x) : posterHTML(x, {tgt: false, rate: false, badge: false})}<i class="pk-ok">${CHECK_I}</i><span>${esc(x.title)}</span></button>`;
    const s = openSheet(`<h3>${title}</h3><p class="sub">${hint}</p>
      <label class="pk-q">${ICON.search}<input class="in" id="pkQ" placeholder="Найти на полке" autocomplete="off"></label>
      <div class="pk" id="pk">${pool.length ? pool.map(cell).join("") : `<p class="sub" style="grid-column:1/-1">На полке пока пусто.</p>`}</div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="pkOk">Готово</button><button class="ib" id="pkNew">${ICON.plus}Новая запись</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    q("#pkQ").addEventListener("input", e => { const v = e.target.value.trim().toLowerCase(); s.el.querySelectorAll(".pk-c").forEach(b => b.hidden = !!v && !b.textContent.toLowerCase().includes(v)); });
    q("#pk").onclick = async e => { const b = e.target.closest(".pk-c"); if (!b || b.disabled) return;
      const x = pool.find(i => i.id === b.dataset.k); if (!x) return; const on = !x[flag]; b.disabled = true; b.setAttribute("aria-pressed", on); SND.tick(.7);
      try {
        if (isR){ const row = await saveRead({...x, [flag]: on || null, [flag + "At"]: on ? now() : null}); if (!row) throw 0; Object.assign(x, row); }
        else { await db.doc("items/" + x.id).update({[flag]: on || null, [flag + "At"]: on ? now() : null}); x[flag] = on || null; }
      } catch(_){ b.setAttribute("aria-pressed", !on); toast("Не сохранилось"); }
      b.disabled = false; };
    q("#pkOk").onclick = () => { s.close(); render(); };
    q("#pkNew").onclick = () => { s.close(); pfPend = {kind, flag, t: Date.now()};
      if (isR) readSheet(null, {status: "done", fav: true}); else openForm(null, kind === "games" ? "games" : "kino"); };
  }

  // фон профиля: видят все, кто заходит в профиль. Два кадра из одной картинки — для компа и для телефона, каждый двигается и масштабируется отдельно
  function pfBgSheet(){
    if (!assets){ toast("Сначала войди"); return; }
    const cur = myProf();
    let img = null, remove = false, dim = cur.bg_dim ?? 45, dirtyD = false, dirtyM = false;
    const V = {d: {s: 1, x: 0, y: 0}, m: {s: 1, x: 0, y: 0}};
    const s = openSheet(`<h3>Фон профиля</h3><p class="sub">Его увидят все, кто откроет твой профиль. Перетащи картинку в рамку, нажми Ctrl+V или выбери файл. Кадр для компа и для телефона настраиваются отдельно: тяни мышкой или пальцем, колёсиком или щипком — масштаб.</p>
      <div class="pfb-wrap"><div class="pfb-col"><div class="pfb-fr" id="pfbF" data-k="d" tabindex="0" aria-label="Кадр для компа"><img alt="" draggable="false"><div class="pfb-dim"></div><div class="pfb-ui"><span>${avaHTML(cur, "md")}</span><b>${esc(NICK)}</b></div><span class="pfb-hint">Нажми или перетащи картинку</span></div><small class="pfb-l">На компе</small></div>
        <div class="pfb-col"><div class="pfb-fr ph" id="pfbM" data-k="m" tabindex="0" aria-label="Кадр для телефона"><img alt="" draggable="false"><div class="pfb-dim"></div></div><small class="pfb-l">На телефоне</small></div></div>
      <div class="pfb-ctl"><label>Масштаб · комп<input type="range" data-z="d" min="1" max="3" step="0.01" value="1" class="pfb-rng"></label><label>Масштаб · телефон<input type="range" data-z="m" min="1" max="4" step="0.01" value="1" class="pfb-rng"></label><label>Затемнение<input type="range" id="pfbDm" min="0" max="85" step="5" value="${dim}" class="pfb-rng"></label></div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="pfbOk">Сохранить</button><button class="ib" id="pfbPick">Выбрать файл</button>${cur.bg ? `<button class="ib red" id="pfbDel">Убрать фон</button>` : ""}<button class="ib" id="pfbNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x), FR_ = {d: q("#pfbF"), m: q("#pfbM")}, MAX = {d: 3, m: 4};
    const geo = k => { const F = FR_[k], v = V[k], W = F.clientWidth, H = F.clientHeight, iw = img.naturalWidth, ih = img.naturalHeight, base = Math.max(W / iw, H / ih), w = iw * base * v.s, h = ih * base * v.s;
      const mx = (w - W) / 2, my = (h - H) / 2; v.x = Math.max(-mx, Math.min(mx, v.x)); v.y = Math.max(-my, Math.min(my, v.y)); return {W, H, w, h, l: (W - w) / 2 + v.x, t: (H - h) / 2 + v.y}; };
    const ov = () => `linear-gradient(180deg,rgba(11,12,16,${dim / 100}) 0,rgba(11,12,16,${Math.min(1, dim / 100 + .15)}) 55%,#0b0c10 100%)`;
    const draw = () => { const has = !!img && !remove;
      ["d", "m"].forEach(k => { const F = FR_[k], I = F.querySelector("img"); F.classList.toggle("blank", !has); I.hidden = !has; F.querySelector(".pfb-dim").style.background = ov();
        if (has){ const g = geo(k); Object.assign(I.style, {width: g.w + "px", height: g.h + "px", left: g.l + "px", top: g.t + "px"}); } q(`[data-z="${k}"]`).value = V[k].s; q(`[data-z="${k}"]`).disabled = !has; });
      q("#pfbF .pfb-hint").hidden = has; };
    const crop = (k, OW) => { const F = FR_[k], g = geo(k), r = OW / F.clientWidth, c = document.createElement("canvas"); c.width = OW; c.height = Math.round(F.clientHeight * r);
      const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(img, g.l * r, g.t * r, g.w * r, g.h * r); return c; };
    const load = (src, fresh) => { const i = new Image(); if (!fresh) i.crossOrigin = "anonymous";
      i.onload = () => { img = i; FR_.d.querySelector("img").src = src; FR_.m.querySelector("img").src = src; remove = false; V.d = {s: 1, x: 0, y: 0}; V.m = {s: 1, x: 0, y: 0}; dirtyD = dirtyM = !!fresh; requestAnimationFrame(draw); };
      i.onerror = () => { if (!fresh) toast("Старый фон не открылся — выбери картинку заново"); }; i.src = src; };
    const take = f => { if (!f || !f.type.startsWith("image/")) return; load(URL.createObjectURL(f), true); };
    const pick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => take(i.files[0]); i.click(); };
    if (cur.bg) load(publicUrl(cur.bg), false);
    const mark = k => { if (k === "d") dirtyD = true; else dirtyM = true; };
    ["d", "m"].forEach(k => { const F = FR_[k], pts = new Map(); let d0 = null;
      F.addEventListener("pointerdown", e => { if (!img || remove){ pick(); return; } F.setPointerCapture(e.pointerId); pts.set(e.pointerId, {x: e.clientX, y: e.clientY}); d0 = null; });
      F.addEventListener("pointermove", e => { if (!pts.has(e.pointerId)) return; const p0 = pts.get(e.pointerId), v = V[k];
        if (pts.size === 1){ v.x += e.clientX - p0.x; v.y += e.clientY - p0.y; }
        else { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (d0) v.s = Math.max(1, Math.min(MAX[k], v.s * d / d0)); d0 = d; }
        pts.set(e.pointerId, {x: e.clientX, y: e.clientY}); mark(k); draw(); });
      const up = e => { pts.delete(e.pointerId); d0 = null; }; F.addEventListener("pointerup", up); F.addEventListener("pointercancel", up);
      F.addEventListener("wheel", e => { if (!img) return; e.preventDefault(); V[k].s = Math.max(1, Math.min(MAX[k], V[k].s * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); mark(k); draw(); }, {passive: false});
      q(`[data-z="${k}"]`).oninput = e => { V[k].s = +e.target.value; mark(k); draw(); };
      bindDrop(F, take); });
    q("#pfbDm").oninput = e => { dim = +e.target.value; draw(); };
    q("#pfbPick").onclick = pick; pasteTarget = take;
    if (q("#pfbDel")) q("#pfbDel").onclick = () => { remove = true; img = null; draw(); };
    q("#pfbNo").onclick = () => s.close();
    addEventListener("resize", draw);
    const toBlob = c => new Promise((ok, no) => { try { c.toBlob(x => x ? ok(x) : no(new Error("canvas")), "image/jpeg", .86); } catch(err){ no(err); } });
    q("#pfbOk").onclick = async () => { const b = q("#pfbOk"); b.disabled = true; b.textContent = "Сохраняю…";
      try { const patch = {bg_dim: dim};
        if (remove){ patch.bg = null; patch.bg_m = null; }
        else if (img){
          if (dirtyD) patch.bg = (await assets.upload(await toBlob(crop("d", 1920)), {type: "image/jpeg"})).id;
          if (dirtyM || (dirtyD && !cur.bg_m)) patch.bg_m = (await assets.upload(await toBlob(crop("m", 780)), {type: "image/jpeg"})).id;
        }
        if (await saveProf(patch)){ s.close(); toast(remove ? "Фон убран" : "Фон профиля сохранён"); }
        else { b.disabled = false; b.textContent = "Сохранить"; }
      } catch(err){ toast(err && err.code ? upErr(err) : "Не получилось обрезать картинку — выбери файл заново"); b.disabled = false; b.textContent = "Сохранить"; } };
    draw();
  }
  // тайтл друга — только посмотреть
  function friendReadSheet(key){
    const [uid, id] = key.split("/"), r = frReads(uid).find(x => x.id === id); if (!r) return;
    const mineHas = (READS || []).some(x => (x.title || "").toLowerCase() === (r.title || "").toLowerCase());
    const s = openSheet(`<div class="rs-top">${rCover(r)}<div><h3 style="margin-bottom:4px">${esc(r.title)}</h3>
        <p class="sub">${esc([RTYPE[r.type], r.publisher, r.year].filter(Boolean).join(" · "))}</p>
        <p class="sub" style="margin-top:8px">${avaHTML(profOf(uid), "xs")} <b style="color:inherit">${esc(frNick(uid))}</b>: ${esc((RSTAT3.find(x => x[0] === rNorm(r.status)) || [])[1] || "")}${r.chTotal ? ` · ${r.chRead || 0} из ${r.chTotal} гл.` : ""}${r.myRating != null ? ` · оценка <b style="color:inherit">${num1(r.myRating)}</b>` : ""}</p>
        ${r.url ? `<p class="sub" style="margin-top:6px"><a href="${esc(r.url)}" target="_blank" rel="noopener" style="color:#f5a623">Где читать ↗</a></p>` : ""}</div></div>
      ${r.desc ? `<p class="sub" style="margin:14px 0 0;max-height:150px;overflow:auto;white-space:pre-line">${esc(String(r.desc).slice(0, 900))}</p>` : ""}
      <div class="acts" style="margin-top:16px">${mineHas ? `<button class="ib full" disabled>Уже есть у тебя</button>` : `<button class="ib blue full" id="frTake" style="background:#f5a623;color:#1b1206">В мои «В планах»</button>`}</div>`);
    const b = s.el.querySelector("#frTake"); if (b) b.onclick = async () => { b.disabled = true;
      const keep = {title: r.title, type: r.type, publisher: r.publisher || null, year: r.year || null, chTotal: r.chTotal || null, url: r.url || null, coverUrl: r.cover ? publicUrl(r.cover) : r.coverUrl || null, desc: r.desc || null, status: "plan", chRead: 0, via: "friend:" + frNick(uid)};
      if (await saveRead(keep)){ toast("Добавлено в Читалку"); s.close(); } else b.disabled = false; };
  }
  // 5.1: guilty pleasure — маска, за которой прячут лицо
  const GP_I = I('<path d="M3 7.5c3-1.4 6-1.4 9 0 3-1.4 6-1.4 9 0 0 5-2.2 9-5 9-1.8 0-3-1.6-4-3.2-1 1.6-2.2 3.2-4 3.2-2.8 0-5-4-5-9Z"/><path d="M6.5 10.5c.8-.6 1.8-.6 2.6 0M14.9 10.5c.8-.6 1.8-.6 2.6 0"/>');
  // кнопка «в любимые» в карточке игры или фильма
  function pfViewExtras(it){
    if (!canWrite || FV || isFuture(it) || isSoon(it)) return;
    const acts = document.querySelector("#view .pv-acts"); if (!acts || acts.querySelector(".pv-fav")) return;
    const b = document.createElement("button"); b.className = "pv-btn pv-fav" + (it.fav ? " on" : ""); b.type = "button";
    const paint = () => { b.innerHTML = `${HEART_O}${it.fav ? "В любимых" : "В любимые"}`; b.classList.toggle("on", !!it.fav); };
    b.onclick = async () => { const on = !it.fav; try { await db.doc("items/" + it.id).update({fav: on || null, favAt: on ? now() : null}); it.fav = on || null; paint(); toast(on ? "На витрине в профиле" : "Убрано из любимых"); } catch(_){ toast("Не сохранилось"); } };
    paint(); acts.appendChild(b);
    if (it.type === "anime" && inLib(it)){ const gp = document.createElement("button"); gp.className = "pv-btn pv-gp" + (it.gp ? " on" : ""); gp.type = "button"; gp.title = "Стыдно признаться, но кайфую. Друзья увидят штамп на обложке";
      const p3 = () => { gp.innerHTML = `${GP_I}${it.gp ? "Guilty pleasure ✓" : "Guilty pleasure"}`; gp.classList.toggle("on", !!it.gp); };
      gp.onclick = async () => { const on = !it.gp; try { await db.doc("items/" + it.id).update({gp: on || null, gpAt: on ? now() : null}); it.gp = on || null; p3(); SND.click(); toast(on ? "Признался. Теперь все знают" : "Штамп снят, репутация спасена"); } catch(_){ toast("Не сохранилось"); } };
      p3(); acts.appendChild(gp); }
    if (isGame(it) && inLib(it)){ const n = document.createElement("button"); n.className = "pv-btn pv-now" + (it.now ? " on" : ""); n.type = "button";
      const p2 = () => { n.innerHTML = `${ICON.pad}${it.now ? "Играю сейчас ✓" : "Играю сейчас"}`; n.classList.toggle("on", !!it.now); };
      n.onclick = async () => { const on = !it.now; try { await db.doc("items/" + it.id).update({now: on || null, nowAt: on ? now() : null}); it.now = on || null; p2(); } catch(_){ toast("Не сохранилось"); } };
      p2(); acts.appendChild(n); }
  }
  document.addEventListener("click", e => {
    const el = e.target.closest && e.target.closest("[data-pfpick],[data-pfbg],[data-pid],[data-frd]"); if (!el || !ME) return;
    if (el.dataset.pfpick){ e.preventDefault(); pfPick(el.dataset.pfpick); return; }
    if (el.dataset.pfbg){ pfBgSheet(); return; }
    if (el.dataset.frd){ friendReadSheet(el.dataset.frd); return; }
    if (el.dataset.pid){ const t = el.dataset.pid; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(`ID ${t} скопирован`), () => toast(`ID: ${t}`)); }
  });

  // ================= 3.0: ГО ПОСМОТРИМ — стопка карточек =================
  function wireStack(el){
    if (el.dataset.stack === "2") return; el.dataset.stack = "2";
    const cards = [...el.querySelectorAll(".gw-t")], n = cards.length; if (!n) return;
    let cur = 0;
    const lay = (dx = 0) => { const W = el.clientWidth || 300; cards.forEach((c, i) => { const o = (i - cur + n) % n, vis = o < 4;
      const sc = 1 - o * .07, x = o === 0 ? dx : W * (1 - sc) + o * 24 + Math.min(0, dx) * .12, rot = o === 0 ? dx / 30 : 0;
      c.style.transform = `translateX(${x}px) scale(${sc}) rotate(${rot}deg)`; c.style.zIndex = 50 - o; c.style.opacity = vis ? (o === 0 ? 1 : 1 - o * .2) : 0;
      c.style.pointerEvents = o === 0 ? "" : "none"; c.classList.toggle("front", o === 0); c.tabIndex = o === 0 ? 0 : -1; }); };
    const dots = el.parentElement.querySelector(".gw-dots");
    const sync = () => { if (dots) dots.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i === cur)); };
    const step = dir => { cur = (cur + dir + n) % n; el.classList.remove("snap"); void el.offsetWidth; el.classList.add("snap"); lay(); sync(); SND.tick(.8); };
    let d = null, moved = false;
    el.addEventListener("pointerdown", e => { if (e.button) return; d = {x: e.clientX, y: e.clientY}; moved = false; el.classList.add("hold"); });
    el.addEventListener("pointermove", e => { if (!d) return; const dx = e.clientX - d.x;
      if (!moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(e.clientY - d.y)){ moved = true; try { el.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } }
      if (moved) lay(dx); });
    const up = e => { if (!d) return; const dx = (e && e.clientX != null ? e.clientX : d.x) - d.x; d = null; el.classList.remove("hold"); if (moved && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); else lay(); };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", () => { d = null; el.classList.remove("hold"); lay(); });
    el.addEventListener("click", e => { if (moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    el.addEventListener("wheel", e => { if (Math.abs(e.deltaX) < 12 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; e.preventDefault(); if (el._wl && performance.now() - el._wl < 380) return; el._wl = performance.now(); step(e.deltaX > 0 ? 1 : -1); }, {passive: false});
    el.parentElement.querySelectorAll("[data-gws]").forEach(b => b.onclick = () => step(+b.dataset.gws));
    if (dots) dots.onclick = e => { const i = [...dots.children].indexOf(e.target); if (i >= 0 && i !== cur){ cur = i; lay(); sync(); SND.tick(.8); } };
    el.addEventListener("keydown", e => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
    lay(); sync();
  }

  ICON.chat = I('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.2A2.5 2.5 0 0 1 4 13.5Z"/>');
  // ================= 3.1: лента активности — по людям и дням =================
  let feedN = 14, actTab = lsGet("nexus_acttab") === "feed" ? "feed" : "wall";
  const RNOUN = {manga: "мангу", comic: "комикс", book: "книгу"};
  const evKind = e => e.rd ? (RTYPE[e.rd.type] || "книга").toLowerCase() : isGame(e.it) ? "игра" : (KTYPES[e.it.type] || "кино").toLowerCase();
  const evTitle = e => e.rd ? e.rd.title : e.it.title;
  // лента: каждое действие со своим временем, свежее сверху; подряд идущие действия одного друга — одной карточкой
  const evTs = x => x._upd || x.updatedAt || x.createdAt || "";
  function feedGroups(){
    const evs = [];
    for (const it of FR.items){ if (ME && it.uid === ME.id) continue; const ts = evTs(it); if (ts) evs.push({it, uid: it.uid, ts, verb: verbOf(it)}); }
    for (const r of FR.reads || []){ if (ME && r.uid === ME.id) continue; const ts = evTs(r), st = rNorm(r.status); if (ts) evs.push({rd: r, uid: r.uid, ts, verb: st === "done" ? "прочитал" : st === "reading" ? "читает" : st === "dropped" ? "бросил" : "хочет прочитать"}); }
    FR.profiles.filter(p => p.created_at && ME && p.user_id !== ME.id && Date.now() - Date.parse(p.created_at) < 60 * 864e5)
      .forEach(p => evs.push({join: true, uid: p.user_id, ts: p.created_at, verb: "присоединился к NEXUS"}));
    if (SL && ME) slEvents().filter(e => e.uid && e.uid !== ME.id && Date.now() - Date.parse(e.ts) < 30 * 864e5).slice(0, 40).forEach(e => evs.push({join: true, slop: e.id, uid: e.uid, ts: new Date(e.ts).toISOString(), verb: e.verb === "добавил игру" ? "добавил в СЛОП" : e.verb, title: e.title}));
    socEvents().forEach(e => evs.push(e));
    evs.sort((x, y) => String(y.ts).localeCompare(String(x.ts)));
    const groups = [];
    for (const e of evs){ const g = groups[groups.length - 1];
      if (g && g.uid === e.uid && (!e.join || e.slop || e.soc) && (!g.ev[0].join || g.ev[0].slop || g.ev[0].soc) && Date.parse(g.ev[g.ev.length - 1].ts) - Date.parse(e.ts) < 6 * 36e5) g.ev.push(e);
      else groups.push({uid: e.uid, ts: e.ts, d: localDate(new Date(e.ts)), ev: [e]}); }
    return groups;
  }
  const feedTime = ts => { const d = new Date(ts), t = d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"}), k = localDate(d), td = today();
    return k === td ? t : k === addDays(td, -1) ? "вчера, " + t : d.toLocaleDateString("ru-RU", {day: "numeric", month: "short"}).replace(".", "") + ", " + t; };
  const feedAgo = ts => { const m = (Date.now() - Date.parse(ts)) / 6e4; return m < 60 * 12 ? agoTs(ts) + (m >= 1 ? " назад" : "") : feedTime(ts); };
  const evRate = e => e.it && typeof e.it.rating === "number" && /прошёл|дропнул|посмотрел|бросил|залип|играет|смотрит/.test(e.verb) ? e.it.rating : e.rd && e.rd.myRating != null ? e.rd.myRating : null;
  // строки «прошёл A, B и ещё 2» — по одному глаголу на строку
  function groupLines(g, max = 3){
    const by = new Map();
    g.ev.forEach(e => { const verb = e.soc ? `${e.verb}${e.title ? ` «${e.title}»` : ""}` : e.slop ? `${e.verb} «${e.title}» (СЛОП)` : e.join ? e.verb : e.rd && e.verb === "прочитал" ? "прочитал " + (RNOUN[e.rd.type] || "книгу") : e.verb; const k = verb + "|" + (e.join ? "j" : evKind(e)); if (!by.has(k)) by.set(k, {verb, kind: e.join ? "" : evKind(e), ev: []}); by.get(k).ev.push(e); });
    const lines = [...by.values()];
    return {html: lines.slice(0, max).map(l => `<li><span class="vb">${esc(l.verb)}</span>${l.ev[0].join ? "" : ` ${l.ev.slice(0, 2).map(e => `<b>${esc(evTitle(e))}</b>`).join(", ")}${l.ev.length > 2 ? ` <em>и ещё ${l.ev.length - 2}</em>` : ""}`}</li>`).join(""), more: Math.max(0, lines.length - max)};
  }
  const FEED_SHOW = 5;
  function feedGroupHTML(g, i){
    const p = profOf(g.uid), shown = g.ev.slice(0, FEED_SHOW), rest = g.ev.length - shown.length;
    const li = e => { const r = evRate(e);
      return e.soc ? `<li class="fg-e"><time>${esc(feedTime(e.ts))}</time><button class="fg-t" data-actref="${esc(e.ref || "")}"><span class="vb">${esc(e.verb)}</span>${e.title ? ` <b>${esc(e.title)}</b>` : ""}${e.verb.includes(e.tag) ? "" : ` <em>${esc(e.tag)}</em>`}${e.q ? `<small class="fg-q">«${esc(e.q)}»</small>` : ""}</button></li>`
        : e.slop ? `<li class="fg-e"><time>${esc(feedTime(e.ts))}</time><button class="fg-t" data-slopgo="${esc(e.slop)}"><span class="vb">${esc(e.verb)}</span> <b>${esc(e.title)}</b> <em>СЛОП</em></button></li>`
        : e.join ? `<li class="fg-e"><time>${esc(feedTime(e.ts))}</time><span class="vb">${esc(e.verb)}</span></li>`
        : `<li class="fg-e"><time>${esc(feedTime(e.ts))}</time><button class="fg-t" ${e.rd ? `data-frd="${esc(e.uid + "/" + e.rd.id)}"` : `data-fi="${esc(e.uid + "/" + e.it.id)}"`}><span class="vb">${esc(e.verb)}</span> <b>${esc(evTitle(e))}</b> <em>${esc(evKind(e))}</em>${r != null ? ` <span class="fg-r ${rateCls(r)}">${num1(r)}</span>` : ""}${e.it && v6IsFirst(e.uid, e.it.id) ? `<span class="v6-first" title="Первым на сайте добавил это">первым на сайте</span>` : ""}</button>${e.it ? v6Rx(e.uid, e.it.id) : ""}</li>`; };
    return `<article class="fg"><button class="fg-a" data-user="${esc(g.uid)}">${avaHTML(p)}</button>
      <div class="fg-b"><div class="fg-h"><button class="fg-n" data-user="${esc(g.uid)}">${esc(p.nick || "кто-то")}</button><span class="fg-d">${esc(feedAgo(g.ts))}</span>${g.ev.length > 1 ? `<span class="fg-c">${g.ev.length} ${plural(g.ev.length, "действие", "действия", "действий")}</span>` : ""}</div>
        <ul class="fg-l fg-tl">${shown.map(li).join("")}</ul>
        ${rest > 0 ? `<button class="fg-all" data-fgrp="${i}">Ещё ${rest} ${plural(rest, "действие", "действия", "действий")} — показать все</button>` : ""}
      </div></article>`;
  }
  let FGROUPS = [];
  function feedGroupSheet(i){
    const g = FGROUPS[i]; if (!g) return; const p = profOf(g.uid);
    const row = e => { const r = evRate(e);
      return `<button class="fgs-r" ${e.rd ? `data-frd="${esc(e.uid + "/" + e.rd.id)}"` : `data-fi="${esc(e.uid + "/" + e.it.id)}"`}>${e.rd ? rCover(e.rd) : posterHTML(e.it, {rate: false, tgt: false})}<span class="t"><span class="vb">${esc(feedTime(e.ts))} · ${esc(e.verb)}</span><b>${esc(evTitle(e))}</b><small>${esc(evKind(e))}${e.it && genres(e.it)[0] ? " · " + esc(genres(e.it)[0].toLowerCase()) : ""}</small></span>${r != null ? `<span class="r ${rateCls(r)}">${num1(r)}</span>` : ""}</button>`; };
    const last = g.ev[g.ev.length - 1];
    const s = openSheet(`<div class="fgs-h">${avaHTML(p, "md")}<div><h3>${esc(p.nick || "")}</h3><p class="sub">${g.ev.length} ${plural(g.ev.length, "действие", "действия", "действий")} · ${esc(feedTime(last.ts))} — ${esc(feedTime(g.ts))}</p></div><button class="ib" data-user="${esc(g.uid)}">Профиль</button></div>
      <div class="fgs">${g.ev.filter(e => !e.join || e.slop || e.soc).map(e => e.soc || e.slop ? socRow(e) : row(e)).join("")}</div>`, {wide: true});
    s.el.addEventListener("click", e => { if (e.target.closest("[data-user],[data-actref],[data-slopgo]")) s.close(); });
  }
  // ================= 5.3: живая лента — комменты, лайки, встречи, заведения, книга жалоб, тир-листы =================
  // всё собирается из уже загруженных разделов; свои действия не показываем, только за последние 30 дней
  const socRow = e => `<button class="fgs-r soc" ${e.soc ? `data-actref="${esc(e.ref || "")}"` : `data-slopgo="${esc(e.slop)}"`}><span class="t"><span class="vb">${esc(feedTime(e.ts))} · ${esc(e.verb)}</span><b>${esc(e.title || "")}</b><small>${esc(e.soc ? (e.verb.includes(e.tag) ? "" : e.tag) : "СЛОП")}${e.q ? `${e.soc && e.verb.includes(e.tag) ? "" : " · "}«${esc(e.q)}»` : ""}</small></span></button>`;
  const cut = (s, n = 70) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  function socEvents(){
    if (!ME) return [];
    const out = [], since = Date.now() - 30 * 864e5;
    const add = (uid, ts, verb, title, tag, ref, q) => { if (!uid || uid === ME.id || !ts) return; const t = Date.parse(ts); if (!(t > since)) return;
      out.push({join: true, soc: true, uid, ts: new Date(t).toISOString(), verb, title: title || "", tag, ref, q: q ? cut(q) : ""}); };
    const of = (uid, mine, noun) => uid === ME.id ? mine : `${noun} ${nickOf(uid)}`;
    try {
      if (EV){ const eT = id => { const e = evById(id); return e ? (e.kind === "watch" ? (e.film && e.film.title) || e.title : e.title) : null; };
        EV.events.forEach(e => add(e.owner, e.created_at, e.kind === "watch" ? "зовёт смотреть" : "создал встречу", e.kind === "watch" ? (e.film && e.film.title) || e.title : e.title, "встречи", evRoute(e)));
        EV.members.forEach(m => { const e = evById(m.event_id); if (e && m.status === "going" && m.user_id !== e.owner) add(m.user_id, m.updated_at, "идёт на", eT(m.event_id), "встречи", evRoute(e)); });
        EV.posts.forEach(p => { const e = evById(p.event_id); if (e) add(p.user_id, p.created_at, "написал на встрече", eT(p.event_id), "встречи", evRoute(e), p.body || (p.image ? "фото" : "")); });
        (EV.likes || []).forEach(l => { const p = EV.posts.find(x => x.id === l.post_id), e = p && evById(p.event_id); if (e) add(l.user_id, l.created_at, `лайкнул ${of(p.user_id, "твой пост", "пост")} на встрече`, eT(p.event_id), "встречи", evRoute(e)); });
      }
      if (WALL){ const post = id => WALL.posts.find(p => p.id === id);
        WALL.posts.forEach(p => add(p.user_id, p.created_at, "написал на стене", "", "стена", "post:" + p.id, p.body || (p.image ? "фото" : "")));
        WALL.comments.forEach(c => { const p = post(c.post_id); add(c.user_id, c.created_at, p ? (p.user_id === c.user_id ? "прокомментировал свой пост" : `прокомментировал ${of(p.user_id, "твой пост", "пост")}`) : "прокомментировал пост", "", "стена", "comment:" + c.post_id, c.body); });
        WALL.reacts.forEach(r => { const p = post(r.post_id); if (p) add(r.user_id, r.created_at, `отреагировал на ${of(p.user_id, "твой пост", "пост")}`, "", "стена", "post:" + p.id, p.body); });
        WALL.clikes.forEach(l => { const c = WALL.comments.find(x => x.id === l.comment_id); if (c) add(l.user_id, l.created_at, `лайкнул ${of(c.user_id, "твой комментарий", "комментарий")}`, "", "стена", "comment:" + c.post_id, c.body); });
      }
      if (typeof BOOK !== "undefined" && BOOK){ const fb = id => BOOK.items.find(f => f.id === id);
        BOOK.items.forEach(f => add(f.user_id, f.created_at, "написал в книгу жалоб", "", "книга жалоб", "book:" + f.id, f.body));
        (BOOK.comments || []).forEach(c => add(c.user_id, c.created_at, "ответил в книге жалоб", "", "книга жалоб", "book:" + c.feedback_id, c.body));
        BOOK.votes.forEach(v => { const f = fb(v.feedback_id); if (f) add(v.user_id, v.created_at, v.v === 1 ? `поддержал ${of(f.user_id, "твою запись", "запись")} в книге жалоб` : `против ${of(f.user_id, "твоей записи", "записи")} в книге жалоб`, "", "книга жалоб", "book:" + f.id, f.body); });
        (BOOK.clikes || []).forEach(l => { const c = (BOOK.comments || []).find(x => x.id === l.comment_id); if (c) add(l.user_id, l.created_at, `лайкнул ${of(c.user_id, "твой ответ", "ответ")} в книге жалоб`, "", "книга жалоб", "book:" + c.feedback_id, c.body); });
      }
      if (SL){ const gT = id => { const g = slGame(id); return g ? g.title : null; };
        SL.plans.forEach(p => { const t = gT(p.game_id); if (t) add(p.user_id, p.created_at, `запланировал катку${p.day ? " на " + p.day.split("-").reverse().slice(0, 2).join(".") : ""}`, t, "СЛОП", "slopplan:" + p.id); });
        SL.pmembers.forEach(m => { const p = SL.plans.find(x => x.id === m.plan_id); if (p && m.user_id !== p.user_id) add(m.user_id, m.created_at, "идёт на катку", gT(p.game_id), "СЛОП", "slopplan:" + p.id); });
        SL.polls.forEach(p => add(p.user_id, p.created_at, "запустил голосование", "", "СЛОП", "sloppoll:" + p.id));
        SL.pvotes.forEach(v => add(v.user_id, v.created_at, "проголосовал за", gT(v.game_id), "СЛОП", "sloppoll:" + v.poll_id));
        SL.tiers.forEach(t => { const ti = gT(t.game_id), n = typeof SL_TIERS !== "undefined" && SL_TIERS[t.tier]; if (ti && n) add(t.updated_by, t.updated_at, `поставил в общий тир-лист «${n[0]}»`, ti, "СЛОП", "slopgame:" + t.game_id); });
      }
      if (FR){ const tl = id => (FR.tierlists || []).find(t => t.id === id);
        (FR.tierlists || []).forEach(t => { const r = t.reply_to && tl(t.reply_to); add(t.user_id, t.created_at, r ? `сделал свою версию ${of(r.user_id, "твоего тир-листа", "тир-листа")}` : "сделал тир-лист", t.title, "тир-листы", "tier:" + t.id); });
        (typeof TLL !== "undefined" ? TLL : []).forEach(l => { const t = tl(l.tierlist_id); if (t) add(l.user_id, l.created_at, `лайкнул ${of(t.user_id, "твой тир-лист", "тир-лист")}`, t.title, "тир-листы", "tier:" + t.id); });
        (FR.showcases || []).forEach(s => add(s.user_id, s.updated_at || s.created_at, "обновил витрину", s.title, "профиль", "user:" + s.user_id));
      }
      if (PL){ const pN = id => { const p = plById(id); return p ? p.name : null; };
        PL.places.forEach(p => add(p.user_id, p.created_at, "добавил заведение", p.name, "заведения", "place:" + p.id));
        PL.visits.forEach(v => { const n = pN(v.place_id); if (n) add(v.user_id, v.created_at, "сходил в", n, "заведения", "place:" + v.place_id); });
        PL.rates.forEach(r => { const n = pN(r.place_id); if (n) add(r.user_id, r.updated_at, "оценил", n, "заведения", "place:" + r.place_id, r.comment); });
        PL.dishes.forEach(d => { const n = pN(d.place_id); if (n) add(d.user_id, d.created_at, `добавил ${d.kind === "drink" ? "напиток" : "блюдо"} «${d.name}» в`, n, "заведения", "place:" + d.place_id); });
        PL.drates.forEach(r => { const d = PL.dishes.find(x => x.id === r.dish_id), n = d && pN(d.place_id); if (n) add(r.user_id, r.updated_at, `оценил «${d.name}» в`, n, "заведения", "place:" + d.place_id); });
        PL.wants.forEach(w => { const n = pN(w.place_id); if (n) add(w.user_id, w.created_at, "хочет сходить в", n, "заведения", "place:" + w.place_id); });
      }
    } catch(e){ logErr("лента: сбор действий", e); }
    return out;
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-actref]"); if (!b) return; e.preventDefault();
    const ref = b.dataset.actref, [k, id] = ref.split(":"); if (!id) return;
    if (k === "slopgame"){ if (route === "slop"){ if (slGame(id)) slOpenCard(id); } else { slPending = id; go("slop"); } return; }
    ntfGo({ref}); });
  function feedCard(){
    if (!FR) return `<div class="fb-card"><p class="a-sub" style="margin:0">Загружаю…</p></div>`;
    FGROUPS = feedGroups();
    const list = FGROUPS.slice(0, feedN);
    return `<div class="fb-card fb-feed2">${list.length ? list.map(feedGroupHTML).join("") : `<div class="a-empty"><b>Тихо</b>Когда друзья начнут что-то добавлять, это появится здесь.</div>`}
      ${FGROUPS.length > feedN ? `<button class="ib fg-next" data-fmore="1">Показать ещё</button>` : ""}</div>`;
  }

  // ================= 3.1: стена — посты, реакции, комменты, лайки =================
  const REACTS = [["like", "лайк"], ["lol", "смех"], ["cringe", "кринж"], ["poop", "какашка"], ["clown", "клоун"], ["party", "праздник"], ["cry", "плач"], ["salute", "GG"], ["skull", "череп"], ["fire", "огонь"]];
  const RX_ORD = Object.fromEntries(REACTS.map(([k], i) => [k, i]));
  let WALL = null, wLoading = null, wAgain = false, wDraft = {text: "", file: null};
  const cDraft = {}, wOpen = new Set(), wAll = new Set();
  async function loadWall(force){
    if (!SB || !ME) return null;
    if (WALL && !force && Date.now() - WALL.at < 20000) return WALL;
    if (wLoading){ if (force) wAgain = true; return wLoading; }
    wLoading = (async () => {
      try {
        const [p, c, r, l] = await Promise.all([SB.from("wall_posts").select("*").order("created_at", {ascending: false}).limit(120), fetchAll(() => SB.from("wall_comments").select("*").order("created_at", {ascending: true}), ["id"]), fetchAll(() => SB.from("wall_reactions").select("*"), ["post_id", "user_id", "kind"]), fetchAll(() => SB.from("wall_comment_likes").select("*"), ["comment_id", "user_id"])]);
        if (p.error) throw p.error;
        WALL = {at: Date.now(), posts: p.data || [], comments: c.error ? [] : c.data || [], reacts: r.error ? [] : r.data || [], clikes: l.error ? [] : l.data || []};
      } catch(e){ logErr("загрузка стены", e); if (!WALL) WALL = {at: Date.now(), posts: [], comments: [], reacts: [], clikes: [], failed: true}; }
      wLoading = null; if (route === "people") renderPeople();
      if (wAgain){ wAgain = false; loadWall(true); }
      return WALL;
    })();
    return wLoading;
  }


  // 6.0.2: «Показать все» — любимые сеткой, пройденные и дроп списком с датой и оценкой
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-v6all]"); if (!b) return;
    const [k, uid] = b.dataset.v6all.split(":"), mine = !uid;
    const its = mine ? MYITEMS : frItems(uid), list0 = shelfOf(k, its.filter(isGame));
    const at = it => mine ? `data-id="${esc(it.id)}"` : `data-fi="${esc(uid + "/" + it.id)}"`;
    const gDate = it => it.finishedAt || it.date || null;
    const T = {gfav: "Любимые игры", gdone: "Пройденные игры", gdrop: "Дроп", gyt: "Прошёл на YouTube"}[k] || "Игры";
    let body;
    if (k === "gfav") body = `<div class="v6-allg">${list0.map((it, i) => `<button class="v6-pc" ${at(it)}>${posterHTML(it, {tgt: false})}<span class="ti">${esc(it.title)}</span><small><b>#${i + 1}</b></small></button>`).join("")}</div>`;
    else { const list = [...list0].sort((a, b2) => (gDate(b2) || "").localeCompare(gDate(a) || "")); const dl = k === "gdrop" ? "брошена" : k === "gyt" ? "посмотрел" : "пройдена";
      body = `<div class="v6-list">${list.map(it => `<button class="v6-lr${k === "gdrop" ? " v6-drop" : ""}" ${at(it)}><span class="th">${posterHTML(it, {tgt: false, rate: false, badge: false})}</span><span class="t"><b>${esc(it.title)}</b><small>${esc(genres(it).slice(0, 3).join(", ") || "")}</small></span><span class="d"><small>${dl}</small><b>${gDate(it) ? esc(fmtDate(String(gDate(it)).slice(0, 10))) : "без даты"}</b></span><span class="sc ${typeof it.rating === "number" ? rateCls(it.rating) : "none"}">${typeof it.rating === "number" ? num1(it.rating) : "—"}</span></button>`).join("")}</div>`; }
    const s = openSheet(`<h3>${T}</h3><p class="sub">${list0.length} ${plural(list0.length, "игра", "игры", "игр")}${k === "gfav" ? " · в твоём порядке" : " · от свежих к старым"}</p>${body}`, {wide: true});
    s.el.addEventListener("click", x => { if (x.target.closest("[data-id],[data-fi]")) s.close(); }, true);
  });

  // 6.2.2: сколько любимых игр показывать на главной (1–6), остальные — под «Показать все»
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-favn]"); if (!b || !ME) return;
    const cur = Math.max(1, Math.min(6, +((MEP && MEP.cosm && MEP.cosm.favN) || 6)));
    const s = openSheet(`<h3>Любимые игры на главной</h3><p class="sub">Сколько показывать крупно. Остальные будут под кнопкой «Показать все». Порядок меняется кнопкой «Расставить».</p>
      <div class="v6-favn">${[1, 2, 3, 4, 5, 6].map(n => `<button type="button" data-n="${n}" aria-pressed="${n === cur}">${n}</button>`).join("")}</div>`);
    s.el.addEventListener("click", async x => { const n = x.target.closest("[data-n]"); if (!n) return;
      const cosm = {...((MEP && MEP.cosm) || {}), favN: +n.dataset.n};
      if (await saveProf({cosm})){ toast("Готово"); s.close(); } });
  });
