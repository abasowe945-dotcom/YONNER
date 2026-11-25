  // ================= 6.1: честный рейтинг, сезоны, серия дней, задания, реакции, первооткрыватели, итоги недели =================
  // Очки считаются в браузере из того, что уже загружено (записи, читалка, стена, реакции) — в базе ничего не хранится,
  // кроме таблицы реакций. Импорт коллекции — одно действие, старьё «давно» без правок — без очков.
  const V6W = {add: 1, rate: 2, fin: 3, edit: 1, read: 1, readFin: 3, post: 2, comment: 1, rx: 1, imp: 3, task: 5};
  const V6_START = "2026-11";
  const V6_MNOM = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const V6_MGEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const v6Day = v => v ? String(v).slice(0, 10) : "";
  const v6Mon = d => d.slice(0, 7);
  const v6MonName = m => V6_MNOM[+m.slice(5) - 1] + " " + m.slice(0, 4);
  const v6WeekStart = (day = today()) => { const d = parseD(day), k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return localDate(d); };
  let V6RX = null, V6RX_OFF = false, v6RxLoading = null, v6TopTab = "season", v6ActCache = null;

  // ---- реакции на записи друзей (таблица item_reactions)
  const V6RK = [["base", "база"], ["want", "тоже хочу"], ["cringe", "кринж"], ["skull", "помянем"]];
  async function v6LoadRx(force){
    if (!SB || !ME || V6RX_OFF) return;
    if (V6RX && !force) return; if (v6RxLoading) return v6RxLoading;
    v6RxLoading = (async () => {
      const r = await fetchAll(() => SB.from("item_reactions").select("*"), ["owner", "item_id", "user_id", "kind"]);
      if (r.error){ if (/item_reactions|does not exist|schema cache/i.test(r.error.message || "")) V6RX_OFF = true; else logErr("загрузка реакций", r.error); V6RX = []; }
      else V6RX = r.data || [];
      v6RxLoading = null; v6ActCache = null; render();
    })();
    return v6RxLoading;
  }
  function v6Rx(owner, itemId){
    if (V6RX_OFF || !ME) return "";
    if (!V6RX){ v6LoadRx(); return ""; }
    const rows = V6RX.filter(x => x.owner === owner && x.item_id === itemId), mine = owner === ME.id;
    if (mine && !rows.length) return "";
    return `<span class="v6-rx">${V6RK.map(([k, l]) => { const n = rows.filter(x => x.kind === k).length, on = rows.some(x => x.kind === k && x.user_id === ME.id);
      if (mine && !n) return ""; return mine ? `<span class="v6-rxb ro" title="${esc(rows.filter(x => x.kind === k).map(x => frNick(x.user_id)).join(", "))}">${l}<b>${n}</b></span>`
        : `<button type="button" class="v6-rxb" data-v6rx="${esc(owner + "|" + itemId + "|" + k)}" aria-pressed="${on}">${l}${n ? `<b>${n}</b>` : ""}</button>`; }).join("")}</span>`;
  }
  document.addEventListener("click", async e => {
    const b = e.target.closest && e.target.closest("[data-v6rx]"); if (!b || !ME) return;
    e.preventDefault(); e.stopPropagation();
    const [owner, item_id, kind] = b.dataset.v6rx.split("|"), on = b.getAttribute("aria-pressed") === "true";
    b.disabled = true;
    const q = on ? SB.from("item_reactions").delete().match({owner, item_id, kind, user_id: ME.id}) : SB.from("item_reactions").insert({owner, item_id, kind});
    const {error} = await q;
    if (error){ logErr("реакция на запись", error); toast("Не сохранилось: " + error.message); b.disabled = false; return; }
    if (on) V6RX = V6RX.filter(x => !(x.owner === owner && x.item_id === item_id && x.kind === kind && x.user_id === ME.id));
    else { V6RX.push({owner, item_id, kind, user_id: ME.id, created_at: now()}); if (typeof SND !== "undefined" && SND.on && SND.pop) SND.pop(); }
    v6ActCache = null; render();
  }, true);

  // ---- все действия человека с очками
  function v6Acts(uid){
    if (!FR) return [];
    const ck = [FR.at, WALL ? WALL.at : 0, V6RX ? V6RX.length : -1, typeof EV !== "undefined" && EV ? EV.posts.length : -1, typeof TLC !== "undefined" && TLC ? TLC.length : -1, typeof SL !== "undefined" && SL ? SL.comments.length + "/" + SL.pvotes.length : -1, (FR.tierlists || []).length].join("|");
    if (!v6ActCache || v6ActCache.k !== ck) v6ActCache = {k: ck, m: new Map()};
    if (v6ActCache.m.has(uid)) return v6ActCache.m.get(uid);
    const out = [], imps = new Set(), td = today();
    for (const it of FR.items){
      if (it.uid !== uid) continue;
      const cd = v6Day(it.createdAt || it._upd), ud = v6Day(it._upd || it.updatedAt), fd = it.noDate ? "" : v6Day(it.finishedAt);
      if (String(it.via || "").startsWith("import")){
        const k = cd + "|" + it.via; if (cd && !imps.has(k)){ imps.add(k); out.push({d: cd, p: V6W.imp, k: "imp"}); }
        if (ud && ud > cd) out.push({d: ud, p: V6W.edit, k: "edit"});
        continue;
      }
      if (cd && !it.noDate) out.push({d: cd, p: V6W.add + (typeof it.rating === "number" ? V6W.rate : 0), k: "add", it, rated: typeof it.rating === "number"});
      if (fd && fd >= cd) out.push({d: fd, p: V6W.fin, k: "fin", it});
      if (ud && ud > cd && ud !== fd) out.push({d: ud, p: V6W.edit + (typeof it.rating === "number" ? 1 : 0), k: "edit", it, rated: typeof it.rating === "number"});
    }
    for (const r of FR.reads || []){
      if (r.uid !== uid) continue;
      const cd = v6Day(r.createdAt || r._upd), ud = v6Day(r._upd || r.updatedAt);
      if (String(r.via || "").startsWith("import")){ const k = cd + "|" + r.via; if (cd && !imps.has(k)){ imps.add(k); out.push({d: cd, p: V6W.imp, k: "imp"}); } continue; }
      if (cd) out.push({d: cd, p: V6W.read, k: "read"});
      if (ud && ud > cd) out.push({d: ud, p: r.status === "done" ? V6W.readFin : V6W.edit, k: r.status === "done" ? "readfin" : "readedit"});
    }
    if (WALL){ WALL.posts.forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: V6W.post, k: "post"}); });
      WALL.comments.forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: V6W.comment, k: "comment", src: "wall"}); }); }
    // 7.13: комментарием считается любой — на стене, в мероприятии, под тир-листом, в СЛОПе
    if (typeof EV !== "undefined" && EV) EV.posts.forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: V6W.comment, k: "comment", src: "event"}); });
    if (typeof TLC !== "undefined" && TLC) TLC.forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: V6W.comment, k: "comment", src: "tl"}); });
    if (typeof SL !== "undefined" && SL){ SL.comments.forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: V6W.comment, k: "comment", src: "slop"}); });
      SL.pvotes.forEach(x => { if (x.user_id === uid && x.created_at) out.push({d: v6Day(x.created_at), p: 0, k: "vote"}); }); }
    (FR.tierlists || []).forEach(x => { if (x.user_id === uid) out.push({d: v6Day(x.updated_at || x.created_at), p: 0, k: "tl"}); });
    if (V6RX){ V6RX.forEach(x => { if (x.owner === uid && x.user_id !== uid) out.push({d: v6Day(x.created_at), p: V6W.rx, k: "rxgot"}); if (x.user_id === uid) out.push({d: v6Day(x.created_at), p: 0, k: "rxgive"}); }); }
    const res = out.filter(a => a.d && a.d <= td);
    v6ActCache.m.set(uid, res); return res;
  }
  // ---- задания недели
  const V6T = [
    {id: "rate", t: "Оцени 3 записи", n: 3, f: (a) => a.filter(x => (x.k === "add" || x.k === "edit") && x.rated).length},
    {id: "add", t: "Добавь 3 новые игры, фильма или книги", n: 3, f: (a) => a.filter(x => x.k === "add" || x.k === "read").length},
    {id: "fin", t: "Пройди или досмотри что-нибудь", n: 1, f: (a) => a.filter(x => x.k === "fin" || x.k === "readfin").length},
    {id: "post", t: "Напиши пост на стене", n: 1, f: (a) => a.filter(x => x.k === "post").length},
    {id: "rx", t: "Отреагируй на 3 записи друзей", n: 3, f: (a) => a.filter(x => x.k === "rxgive").length},
    {id: "days", t: "Будь активен 4 дня из 7", n: 4, f: (a) => new Set(a.map(x => x.d)).size},
    {id: "com", t: "Оставь 3 комментария (стена, мероприятия, тир-листы, СЛОП)", n: 3, f: (a) => a.filter(x => x.k === "comment").length},
    {id: "evp", t: "Напиши на стене мероприятия", n: 1, f: (a) => a.filter(x => x.k === "comment" && x.src === "event").length},
    {id: "upd", t: "Обнови 3 записи: статус, оценку или дату", n: 3, f: (a) => a.filter(x => (x.k === "edit" && x.it) || x.k === "readedit" || x.k === "readfin").length},
    {id: "vote", t: "Проголосуй в опросе СЛОПа", n: 1, f: (a) => a.filter(x => x.k === "vote").length},
    {id: "tl", t: "Создай или поправь тир-лист", n: 1, f: (a) => a.filter(x => x.k === "tl").length},
  ];
  function v6Tasks(uid, ws = v6WeekStart()){
    const we = addDays(ws, 6); let h = 0; for (const c of ws) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const pool = V6T.filter(t => (t.id !== "rx" || !V6RX_OFF) && (t.id !== "vote" || (typeof SL !== "undefined" && SL && SL.polls.length))), pick = [];
    for (let i = 0; pick.length < 3 && i < 40; i++){ const t = pool[(h + i) % pool.length]; if (!pick.includes(t)) pick.push(t); }
    const acts = v6Acts(uid).filter(a => a.d >= ws && a.d <= we);
    return pick.map(t => { const v = Math.min(t.n, t.f(acts)); return {...t, v, done: v >= t.n}; });
  }
  // ---- очки за месяц (сезон)
  function v6Score(uid, mon){
    let s = v6Acts(uid).filter(a => v6Mon(a.d) === mon).reduce((x, a) => x + a.p, 0);
    // закрытые задания недель, чьё воскресенье в этом месяце (текущая неделя — в текущий месяц)
    const td = today(); let ws = v6WeekStart(mon + "-01"); if (ws < V6_START + "-01") ws = v6WeekStart(V6_START + "-01");
    for (; ws <= td && v6Mon(ws) <= mon; ws = addDays(ws, 7)){
      const sun = addDays(ws, 6), m = sun > td ? v6Mon(td) : v6Mon(sun); if (m !== mon) continue;
      s += v6Tasks(uid, ws).filter(t => t.done).length * V6W.task;
    }
    return s;
  }
  function v6Board(mon){ return FR ? FR.profiles.map(p => ({p: ME && p.user_id === ME.id ? {...p, ...myProf()} : p, n: v6Score(p.user_id, mon)})).sort((a, b) => b.n - a.n) : []; }
  function v6Hall(){ const res = [], cur = v6Mon(today()); for (let m = V6_START; m < cur; m = v6Mon(addDays(m + "-28", 7))){ const b = v6Board(m).filter(x => x.n > 0); if (b.length) res.push({m, top: b.slice(0, 3)}); } return res.reverse(); }
  const v6Cups = uid => v6Hall().filter(h => h.top[0].p.user_id === uid).map(h => h.m);
  // ---- серия дней подряд
  function v6Streak(uid){
    const days = new Set(v6Acts(uid).map(a => a.d)); let d = today(); if (!days.has(d)) d = addDays(d, -1);
    let n = 0; while (days.has(d)){ n++; d = addDays(d, -1); } return n;
  }
  // ---- первооткрыватели: кто первым на сайте добавил игру или фильм (импорт и «давно» не считаются)
  let v6FirstCache = null;
  function v6Firsts(){
    if (!FR) return new Map(); if (v6FirstCache && v6FirstCache.at === FR.at) return v6FirstCache.m;
    const best = new Map();
    FR.items.forEach(it => { if (String(it.via || "").startsWith("import") || it.noDate || !it.createdAt) return; const k = (isGame(it) ? "g:" : "k:") + normT(it.title); if (!k.slice(2)) return; const c = best.get(k); if (!c || it.createdAt < c.createdAt) best.set(k, it); });
    const m = new Map(); best.forEach(it => m.set(it.uid + "/" + it.id, true)); v6FirstCache = {at: FR.at, m}; return m;
  }
  const v6IsFirst = (uid, id) => v6Firsts().has(uid + "/" + id);
  const v6FirstN = uid => { let n = 0; v6Firsts().forEach((_, k) => { if (k.startsWith(uid + "/")) n++; }); return n; };
  const FIRE_I = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.4 2.2-3.2C17.6 10.6 19 13 19 15.5A7 7 0 0 1 5 15.5c0-4.6 4.3-7.4 7-13.5Z"/></svg>';
  const CUP_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4h-4z"/></svg>';
  const FLAG_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
  // метки в шапке профиля: серия, кубки, первооткрыватель
  function v6Tags(uid){
    if (!FR) return "";
    const s = v6Streak(uid), cups = v6Cups(uid), f = v6FirstN(uid);
    return `${s >= 2 ? `<span class="v6-tag fire" title="Дней подряд с активностью">${FIRE_I}${s} ${plural(s, "день", "дня", "дней")} подряд</span>` : ""}${cups.map(m => `<span class="v6-tag cup" title="Победитель сезона">${CUP_I}Чемпион: ${v6MonName(m)}</span>`).join("")}${f ? `<span class="v6-tag flag" title="Первым на сайте добавил столько игр и фильмов">${FLAG_I}Первооткрыватель · ${f}</span>` : ""}`;
  }
  // ---- рейтинг: сезон, коллекционер, зал славы
  function v6Top(n){
    if (!FR) return `<p class="pf-mute">Загружаю…</p>`;
    if (!WALL && typeof loadWall === "function") loadWall(); if (!V6RX && !V6RX_OFF) v6LoadRx();
    const mon = v6Mon(today()), left = Math.round((parseD(addDays(mon + "-28", 7).slice(0, 7) + "-01") - parseD(today())) / 864e5);
    const tabs = `<div class="v6-tt" role="tablist">${[["season", "Сезон"], ["coll", "Коллекция"], ["hall", "Зал славы"]].map(([k, l]) => `<button type="button" role="tab" data-v6top="${k}" aria-selected="${v6TopTab === k}">${l}</button>`).join("")}</div>`;
    const last = uid => { let m = ""; FR.items.forEach(i => { if (i.uid === uid && (i._upd || "") > m) m = i._upd || ""; }); return m; };
    const row = (p, i, val, sub) => { const me = ME && p.user_id === ME.id, ts = last(p.user_id), mins = ts ? (Date.now() - Date.parse(ts)) / 6e4 : 1e9, st = v6Streak(p.user_id);
      return `<li><button class="pf-tr${me ? " me" : ""}" ${me ? 'data-go="home"' : `data-user="${esc(p.user_id)}"`}><span class="n r${i + 1}">${i + 1}</span><span class="pf-av">${avaHTML(p)}${mins < 30 ? '<i class="on" title="обновлял только что"></i>' : mins < 1440 ? '<i class="rc" title="обновлял сегодня"></i>' : ""}</span><span class="t"><b>${esc(p.nick)}${me ? " <em>ты</em>" : ""}${st >= 2 ? `<span class="v6-st" title="${st} дней подряд">${FIRE_I}${st}</span>` : ""}</b><small>${sub}</small></span><span class="v6-pts">${val}</span></button></li>`; };
    let body;
    if (v6TopTab === "coll"){
      const t = FR.profiles.map(p => ({p: ME && p.user_id === ME.id ? {...p, ...myProf()} : p, n: FR.items.filter(i => i.uid === p.user_id && inLib(i)).length + (FR.reads || []).filter(r => r.uid === p.user_id).length})).sort((a, b) => b.n - a.n).slice(0, n);
      body = `<ol class="pf-top v6">${t.map((x, i) => row(x.p, i, x.n, "на полках всего")).join("")}</ol><p class="v6-note">Сколько всего на полках, вместе с импортом.</p>`;
    } else if (v6TopTab === "hall"){
      const h = v6Hall();
      body = h.length ? h.map(x => `<div class="v6-hall"><b>${CUP_I}${esc(v6MonName(x.m))}</b>${x.top.map((y, i) => `<span class="r${i + 1}">${i + 1}. ${esc(y.p.nick)} · ${y.n}</span>`).join("")}</div>`).join("") : `<p class="v6-note">Первый сезон ещё идёт. Чемпион ${V6_MGEN[+mon.slice(5) - 1]} попадёт сюда первого числа.</p>`;
    } else {
      const t = v6Board(mon).slice(0, n);
      body = `<ol class="pf-top v6">${t.map((x, i) => row(x.p, i, x.n, x.n ? plural(x.n, "очко", "очка", "очков") : "пока без очков")).join("")}</ol><p class="v6-note">Сезон: ${esc(v6MonName(mon))}, до конца ${left} ${plural(left, "день", "дня", "дней")}. Очки за свежие дела: добавил +1, оценка +2, прошёл или досмотрел +3, пост +2, реакция на твою запись +1, задание недели +5. Импорт коллекции — +3 один раз.</p>`;
    }
    return tabs + body;
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-v6top]"); if (!b) return; v6TopTab = b.dataset.v6top; render(); });

  // ---- карточки на главной: задания, напоминалки, реакции на мои записи
  function v6TasksCard(){
    if (!FR || !ME) return "";
    const t = v6Tasks(ME.id), done = t.filter(x => x.done).length, ws = v6WeekStart(), we = addDays(ws, 6), st = v6Streak(ME.id);
    const left = Math.round((parseD(we) - parseD(today())) / 864e5) + 1;
    return `<div class="pf-card v6-tasks"><h3>${ICON.target || ""}Задания недели<small>${done}/3</small></h3>
      ${t.map(x => `<div class="v6-tk${x.done ? " ok" : ""}"><span class="ck">${x.done ? "✓" : ""}</span><span class="tx">${esc(x.t)}<small>${x.v} из ${x.n} · +${V6W.task} очков</small></span><span class="bar"><i style="width:${x.v / x.n * 100}%"></i></span></div>`).join("")}
      <div class="v6-tk-f"><span class="v6-st big">${FIRE_I}${st}</span><span>${st ? `${st} ${plural(st, "день", "дня", "дней")} подряд` : "Серия не начата"} · новые задания через ${left} ${plural(left, "день", "дня", "дней")}</span></div></div>`;
  }
  let v6NagHide = null;
  function v6NagCard(){
    if (!ME) return "";
    if (v6NagHide === null) v6NagHide = lsGet("nexus_v6nag") === today();
    if (v6NagHide) return "";
    const unr = MYITEMS.filter(i => inLib(i) && !i.noDate && typeof i.rating !== "number" && ((isGame(i) && ["done", "dropped", "youtube"].includes(gStatus(i.status))) || (!isGame(i) && ["done", "played"].includes(i.status))));
    const stale = MYITEMS.filter(i => isGame(i) && staleDays(i));
    if (!unr.length && !stale.length) return "";
    return `<div class="pf-card v6-nag"><h3>${ICON.clock || ""}Напоминалки<button type="button" class="v6-x" data-v6nag="1" aria-label="Скрыть до завтра" title="Скрыть до завтра">${ICON.x}</button></h3>
      ${unr.length ? `<button type="button" class="v6-ng" data-v6rate="1"><b>${unr.length}</b><span>${plural(unr.length, "запись", "записи", "записей")} без оценки — оцени за минуту, это +${V6W.edit + 1} за каждую</span></button>` : ""}
      ${stale.length ? `<button type="button" class="v6-ng" data-id="${esc(stale[0].id)}"><b>${stale.length}</b><span>${plural(stale.length, "игра застряла", "игры застряли", "игр застряли")} в «В процессе». Играешь в «${esc(stale[0].title)}» или пора в дроп?</span></button>` : ""}</div>`;
  }
  document.addEventListener("click", e => {
    const h = e.target.closest && e.target.closest("[data-v6nag]"); if (h){ lsSet("nexus_v6nag", today()); v6NagHide = true; render(); return; }
    const r = e.target.closest && e.target.closest("[data-v6rate]"); if (!r) return;
    const unr = MYITEMS.filter(i => inLib(i) && !i.noDate && typeof i.rating !== "number" && ((isGame(i) && ["done", "dropped", "youtube"].includes(gStatus(i.status))) || (!isGame(i) && ["done", "played"].includes(i.status))));
    const s = openSheet(`<h3>Без оценки</h3><p class="sub">${unr.length} ${plural(unr.length, "запись", "записи", "записей")}. Открой и поставь оценку.</p><div class="v6-list">${unr.map(it => `<button class="v6-lr" data-id="${esc(it.id)}"><span class="th">${posterHTML(it, {tgt: false, rate: false, badge: false})}</span><span class="t"><b>${esc(it.title)}</b><small>${isGame(it) ? "игра" : esc((KTYPES[it.type] || "кино").toLowerCase())}</small></span><span class="d"></span><span class="sc none">—</span></button>`).join("")}</div>`, {wide: true});
    s.el.addEventListener("click", x => { if (x.target.closest("[data-id]")) s.close(); }, true);
  });
  function v6RxCard(){
    if (!ME || V6RX_OFF) return ""; if (!V6RX){ v6LoadRx(); return ""; }
    const got = V6RX.filter(x => x.owner === ME.id && x.user_id !== ME.id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 6);
    if (!got.length) return "";
    const L = Object.fromEntries(V6RK);
    return `<div class="pf-card v6-rxc"><h3>${ICON.people}Реакции на твои записи</h3>${got.map(x => { const it = MYITEMS.find(i => i.id === x.item_id); return `<button type="button" class="v6-rxr" ${it ? `data-id="${esc(it.id)}"` : ""}>${avaHTML(profOf(x.user_id), "sm")}<span><b>${esc(frNick(x.user_id))}</b> — «${esc(L[x.kind] || x.kind)}» на <b>${esc(it ? it.title : "запись")}</b><small>${esc(agoTs(x.created_at))}</small></span></button>`; }).join("")}</div>`;
  }
  // ---- итоги недели (в «Активности»)
  function v6WeekCard(){
    if (!FR) return "";
    const ws0 = v6WeekStart(), ws = addDays(ws0, -7), we = addDays(ws, 6);
    const st = FR.profiles.map(p => { const a = v6Acts(p.user_id).filter(x => x.d >= ws && x.d <= we);
      const its = FR.items.filter(i => i.uid === p.user_id), inW = d => d && v6Day(d) >= ws && v6Day(d) <= we;
      return {p, pts: a.reduce((s, x) => s + x.p, 0), games: its.filter(i => isGame(i) && gStatus(i.status) === "done" && inW(i.finishedAt)).length, kino: its.filter(i => !isGame(i) && ["done", "played"].includes(i.status) && inW(i.finishedAt || i.date)).length, drops: its.filter(i => gStatus(i.status) === "dropped" && inW(i.finishedAt)).length,
        rated: its.filter(i => typeof i.rating === "number" && inW(i._upd)), days: new Set(a.map(x => x.d)).size}; });
    const best = (k, min = 1) => { const t = [...st].sort((a, b) => b[k] - a[k])[0]; return t && t[k] >= min ? t : null; };
    const mvp = best("pts"), g = best("games"), k = best("kino"), d = best("drops"), act = best("days", 3);
    const allR = st.flatMap(x => x.rated.map(i => ({x, i}))), hi = allR.filter(r => r.i.rating >= 10)[0], lo = allR.sort((a, b) => a.i.rating - b.i.rating)[0];
    const D = s => { const x = parseD(s); return `${x.getDate()} ${V6_MGEN[x.getMonth()]}`; };
    const lines = [mvp && mvp.pts ? `<b>MVP недели</b> — ${esc(mvp.p.nick)}: ${mvp.pts} ${plural(mvp.pts, "очко", "очка", "очков")}` : "", g ? `<b>Больше всех прошёл</b> — ${esc(g.p.nick)}: ${g.games} ${plural(g.games, "игра", "игры", "игр")}` : "", k ? `<b>Главный киноман</b> — ${esc(k.p.nick)}: ${k.kino} ${plural(k.kino, "фильм", "фильма", "фильмов")} и сериалов` : "",
      d ? `<b>Рука не дрогнула</b> — ${esc(d.p.nick)} дропнул ${d.drops} ${plural(d.drops, "игру", "игры", "игр")}` : "", act ? `<b>Живёт на сайте</b> — ${esc(act.p.nick)}: активен ${act.days} ${plural(act.days, "день", "дня", "дней")} из 7` : "",
      hi ? `<b>Щедрость недели</b> — ${esc(hi.x.p.nick)} поставил 10 «${esc(hi.i.title)}»` : "", lo && lo.i.rating <= 4 ? `<b>Самый злой критик</b> — ${esc(lo.x.p.nick)}: «${esc(lo.i.title)}» получил ${num1(lo.i.rating)}` : ""].filter(Boolean);
    return `<div class="fb-card v6-week"><h3>${CUP_I}Итоги недели<small>${D(ws)} — ${D(we)}</small></h3>${lines.length ? `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>` : `<p class="a-sub" style="margin:0;font-size:13px">Неделя прошла тихо. Подозрительно тихо.</p>`}</div>`;
  }
