  // ================= СЛОП: кооп-игры с друзьями =================
  // Общий список: игры здесь ничьи, в личную полку не попадают. «Жду» — до выхода, «Хочу поиграть» — после.
  let SL = null, slLoading = null, slErr = false, slOpenId = null, slPending = null, slSubT = 0;
  const slS = {n: lsGet("nexus_slop_n") || "all", tab: "all", q: "", sort: lsGet("nexus_slop_sort") || "new", who: new Set(), gen: new Set(), genAll: false};
  const SLI = {
    slop: I('<path d="M12 12V7"/><circle cx="12" cy="5" r="2.4"/><rect x="3.5" y="12" width="17" height="7.5" rx="2.8"/><path d="M8 15.8h.01M16 15.8h.01"/>'),
    users: I('<circle cx="9" cy="8" r="3.4"/><path d="M2.6 20c.6-3.5 3.2-5.4 6.4-5.4s5.8 1.9 6.4 5.4"/><path d="M16 4.9a3.4 3.4 0 0 1 0 6.3M18.4 14.9c1.7.8 2.7 2.4 3 5.1"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.6"'),
    dice: I('<rect x="3" y="3" width="18" height="18" rx="4.5"/><circle cx="8.2" cy="8.2" r="1.2" fill="currentColor"/><circle cx="15.8" cy="15.8" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="15.8" cy="8.2" r="1.2" fill="currentColor"/><circle cx="8.2" cy="15.8" r="1.2" fill="currentColor"/>'),
    dl: I('<path d="M12 3v12M7 10.5l5 5 5-5M4.5 20.5h15"/>', 'stroke-width="2.4"'),
    ext: I('<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
    hand: I('<path d="M12 21s-7.5-4.6-7.5-10.4A4.4 4.4 0 0 1 12 7.8a4.4 4.4 0 0 1 7.5 2.8C19.5 16.4 12 21 12 21Z"/>'),
    check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="2.8"'),
    clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>'),
    play: I('<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.6-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8Z" fill="currentColor"/>'),
    flag: I('<path d="M5 21V4M5 4.5h11.5l-2 4 2 4H5"/>'),
    skull: I('<path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V20h10v-3.4c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/>'),
    search: I('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/>', 'stroke-width="2.4"'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.6"'),
    edit: I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    img: I('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
    chat: I('<path d="M4 5.5h16v11H9.5L5 20v-3.5H4Z"/>'),
    spark: I('<path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5l5.6-1.9Z"/>'),
    send: I('<path d="M4 12 20 4l-5.5 16-3-7Z"/>')
  };
  ICON.slop = SLI.slop;
  const SL_ST = {playing: {l: "Играем сейчас", s: "Играем", v: "играет в", ic: "play"}, done: {l: "Прошли", s: "Прошли", v: "прошёл", ic: "flag"}, dropped: {l: "Дропнули", s: "Дропнули", v: "дропнул", ic: "skull"}};
  const SL_VD = {worth: "Стоит", meh: "На любителя", skip: "Не стоит"};
  const SL_N = [["2", "двое"], ["3", "трое"], ["4", "четверо"], ["5-8", "компания"], ["8+", "толпа"], ["all", "без фильтра"]];
  const SL_NW = {"2": "На двоих", "3": "На троих", "4": "На четверых", "5-8": "На компанию 5–8", "8+": "На толпу от 8"};
  const slRM = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const slUniq = a => [...new Set(a)];
  const slHttp = u => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()) ? String(u).trim() : "";

  async function loadSlop(){
    if (!SB || !ME) return null;
    if (slLoading) return slLoading;
    slLoading = (async () => {
      try {
        const [g, m, s, c, pl, pm, tr, po, pv] = await Promise.all([
          SB.from("slop_games").select("*").order("created_at", {ascending: false}),
          SB.from("slop_marks").select("*"),
          SB.from("slop_status").select("*"),
          SB.from("slop_comments").select("*").order("created_at", {ascending: true}),
          SB.from("slop_plans").select("*"), SB.from("slop_plan_members").select("plan_id,user_id"), SB.from("slop_tiers").select("*"),
          SB.from("slop_polls").select("*").order("created_at", {ascending: false}).limit(5), SB.from("slop_poll_votes").select("poll_id,user_id,game_id").order("created_at", {ascending: false}).limit(400)]);
        if (g.error) throw g.error;
        const ok = r => r && !r.error ? r.data || [] : [];
        SL = {games: (g.data || []).map(slNorm), marks: ok(m), status: ok(s), comments: ok(c), plans: ok(pl), pmembers: ok(pm), tiers: ok(tr), polls: ok(po).map(x => ({...x, game_ids: Array.isArray(x.game_ids) ? x.game_ids : []})), pvotes: ok(pv)}; slErr = false;
      } catch(e){ slErr = true; logErr("загрузка СЛОПа", e); }
      slLoading = null; slRefresh(); return SL;
    })();
    return slLoading;
  }
  const slNorm = g => ({...g, genres: Array.isArray(g.genres) ? g.genres : [], screenshots: Array.isArray(g.screenshots) ? g.screenshots.filter(slHttp) : [], min_players: +g.min_players || 1, max_players: +g.max_players || 1});
  function subscribeSlop(){
    if (!SB || !ME) return;
    const kick = () => { clearTimeout(slSubT); slSubT = setTimeout(() => loadSlop(), 300); };
    let ch = SB.channel("nexus-slop");
    ["slop_games", "slop_marks", "slop_status", "slop_comments", "slop_plans", "slop_plan_members", "slop_tiers", "slop_polls", "slop_poll_votes"].forEach(t => { ch = ch.on("postgres_changes", {event: "*", schema: "public", table: t}, p => { kick();
      if (t === "slop_games" && p.eventType === "INSERT" && p.new && p.new.user_id !== ME.id && route !== "slop") toast(`${frNick(p.new.user_id)} добавил в СЛОП: ${p.new.title}`); }); });
    ch.subscribe();
  }
  function slRefresh(){
    if (route === "slop") renderSlop();
    else if (route === "people" && typeof actTab !== "undefined" && actTab === "feed" && !document.querySelector(".sh-wrap")) { try { render(); } catch(e){ logErr("СЛОП: перерисовка ленты", e); } }
    if (slOpenId){ if (slGame(slOpenId)) slDrawCard(true); else slCloseCard(); }
    if (SL && ME) slRefresh2();
  }

  // ---- расчёты ----
  const slGame = id => SL && SL.games.find(g => g.id === id);
  const slLiveDate = g => { const d = parseD(String(g.release_date).slice(0, 10)), p = g.release_prec;
    if (p === "month") d.setMonth(d.getMonth() + 1); else if (p === "quarter") d.setMonth(d.getMonth() + 3); else if (p === "year") d.setFullYear(d.getFullYear() + 1);
    return localDate(d); };
  const slOut = g => !g.tba && (!g.release_date || slLiveDate(g) <= today());
  const slMarks = (id, kind) => SL.marks.filter(m => m.game_id === id && m.kind === kind).map(m => m.user_id);
  const slWant = g => slUniq([...slMarks(g.id, "want"), ...slMarks(g.id, "wait")]);
  const slStats = id => SL.status.filter(s => s.game_id === id);
  const slBadge = g => { const st = slStats(g.id).map(s => s.status); return ["playing", "done", "dropped"].find(k => st.includes(k)) || null; };
  const slPl = g => (g.min_players === g.max_players ? g.max_players : `${g.min_players}–${g.max_players}`) + " " + plural(g.max_players, "игрок", "игрока", "игроков");
  const slFresh = g => !!(g.release_date && !g.tba && g.release_prec === "day" && g.release_date <= today() && today() < addDays(g.release_date, 7) && String(g.created_at).slice(0, 10) <= g.release_date);
  const slFit = g => { const n = slS.n; if (n === "all") return true; if (n === "5-8") return g.min_players <= 8 && g.max_players >= 5; if (n === "8+") return g.max_players >= 8; return g.min_players <= +n && +n <= g.max_players; };
  const slImg = g => g.cover ? (/^https?:/i.test(g.cover) ? g.cover : publicUrl(g.cover)) : slHttp(g.header);
  const slPosterIn = g => { const u = slImg(g); return u ? `<img alt="" loading="lazy" decoding="async" src="${esc(u)}" onerror="this.remove()">` : `<span class="slp-ph">${esc(g.title)}</span>`; };
  const slDateLabel = g => { if (g.tba || !g.release_date) return "скоро"; const d = parseD(g.release_date), p = g.release_prec;
    return p === "year" ? `${d.getFullYear()} год` : p === "quarter" ? `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}` : p === "month" ? `${MONTHS_NOM[d.getMonth()]} ${d.getFullYear()}` : fmtDate(g.release_date); };
  const slDateShort = g => { if (g.tba || !g.release_date) return "скоро"; const d = parseD(g.release_date), p = g.release_prec;
    return p === "day" ? d.toLocaleDateString("ru-RU", {day: "numeric", month: "short"}).replace(".", "") + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "") : slDateLabel(g); };
  const slCount = g => { if (g.tba || !g.release_date) return "дата неизвестна"; if (g.release_prec !== "day") return "выйдет: " + slDateLabel(g);
    const n = Math.round((parseD(g.release_date) - parseD(today())) / 864e5); return n <= 0 ? "выходит сегодня" : n === 1 ? "выходит завтра" : `через ${n} ${plural(n, "день", "дня", "дней")}`; };
  const slAgo = ts => { try { return feedAgo(ts); } catch(_){ return ""; } };
  const slAvs = (uids, max = 6) => uids.length ? `<span class="slp-avs">${uids.slice(0, max).map(u => avaHTML(profOf(u), "sm")).join("")}${uids.length > max ? `<em>+${uids.length - max}</em>` : ""}</span>` : "";

  const slGK = x => String(x || "").trim().toLowerCase().replace(/ё/g, "е");
  function slLib(){
    let a = SL.games.filter(g => slOut(g) && slFit(g));
    const t = slS.tab; if (t !== "all") a = a.filter(g => { const st = slStats(g.id).map(s => s.status); return t === "fresh" ? !st.length : st.includes(t); });
    const q = slS.q.trim().toLowerCase(); if (q) a = a.filter(g => g.title.toLowerCase().includes(q));
    if (slS.who.size) a = a.filter(g => { const w = slWant(g); return [...slS.who].every(u => w.includes(u)); });
    if (slS.gen.size) a = a.filter(g => { const ks = g.genres.map(slGK); return [...slS.gen].every(k => ks.includes(k)); });
    const byNew = (x, y) => String(y.created_at).localeCompare(String(x.created_at));
    if (slS.sort === "want") a.sort((x, y) => slWant(y).length - slWant(x).length || byNew(x, y));
    else if (slS.sort === "abc") a.sort((x, y) => x.title.localeCompare(y.title, "ru"));
    else a.sort(byNew);
    a = [...a.filter(g => !slDropped(g)), ...a.filter(slDropped)]; // дропнутое — в самый низ
    return a;
  }
  function slEvents(){
    if (!SL) return [];
    const ev = [], t = id => { const g = slGame(id); return g ? g.title : null; };
    SL.games.forEach(g => { ev.push({ts: g.created_at, uid: g.user_id, id: g.id, verb: "добавил игру", title: g.title});
      if (g.release_date && !g.tba && g.release_prec === "day" && g.release_date <= today() && g.release_date >= addDays(today(), -30) && String(g.created_at).slice(0, 10) < g.release_date) ev.push({ts: parseD(g.release_date).toISOString(), uid: null, id: g.id, verb: "вышла", title: g.title}); });
    SL.marks.forEach(m => { const ti = t(m.game_id); if (ti) ev.push({ts: m.created_at, uid: m.user_id, id: m.game_id, verb: m.kind === "wait" ? "ждёт" : "хочет поиграть в", title: ti}); });
    SL.status.forEach(s => { const ti = t(s.game_id); if (ti) ev.push({ts: s.updated_at, uid: s.user_id, id: s.game_id, verb: SL_ST[s.status].v, title: ti, vd: s.verdict}); });
    SL.comments.forEach(c => { const ti = t(c.game_id); if (ti) ev.push({ts: c.created_at, uid: c.user_id, id: c.game_id, verb: "написал про", title: ti}); });
    return ev.filter(e => e.ts).sort((x, y) => String(y.ts).localeCompare(String(x.ts)));
  }

  // ---- страница ----
  function renderSlop(){
    const m = $("slMain"); if (!m) return;
    if (!ME){ m.innerHTML = `<div class="slp-empty" style="margin-top:30px"><b>Нужно войти</b>СЛОП — общий список кооп-игр для своих.</div>`; delete m.dataset.built; return; }
    if (!m.dataset.built){
      m.dataset.built = "1";
      m.innerHTML = `<section class="slp-hero">
          <div><span class="slp-kick">${SLI.users} кооп с друзьями</span><h1>СЛОП</h1><p>Собрались, выбрали, сколько вас, — и видите всё, во что можно зарубиться вместе.</p></div>
          <div class="slp-hero-a"><button class="slp-btn" data-sl="cal" type="button">${SLI.cal} Календарь</button><button class="slp-btn" data-sl="tiers" type="button">${SLI.tiers} Тир-лист</button><button class="slp-btn" data-sl="roul" type="button">${SLI.dice} Не можем выбрать</button><button class="slp-btn pri" data-sl="add" type="button">${SLI.plus} Добавить игру</button></div>
          <div class="slp-n" role="group" aria-label="Сколько игроков"><span class="slp-n-l">Сколько вас?</span>${SL_N.map(([k, s]) => `<button class="slp-chip" type="button" data-sl-n="${k}" aria-pressed="false">${k === "all" ? "Все" : k === "5-8" ? "5–8" : k}<small>${s}</small></button>`).join("")}</div>
        <div class="slp-up" id="slUp"></div>
        </section>
        <section class="slp-sec"><header><h2>Календарь ожиданий</h2><span id="slWaitN"></span></header><div id="slWait"></div></section>
        <section class="slp-sec"><header><h2>Библиотека</h2><span id="slLibN"></span></header>
          <div class="slp-bar"><div class="slp-tabs" id="slTabs" role="group" aria-label="Статус"></div>
            <label class="slp-q">${SLI.search}<input id="slQ" type="search" placeholder="Найти игру" autocomplete="off" spellcheck="false" aria-label="Поиск по названию"></label>
            <select class="slp-sel" id="slSort" aria-label="Сортировка"><option value="new">Сначала новые</option><option value="want">Больше всего желающих</option><option value="abc">По алфавиту</option></select></div>
          <div class="slp-who" id="slWho"></div>
          <div class="slp-who slp-gen" id="slGen"></div>
          <div class="slp-grid" id="slGrid"></div>
        </section>
        <section class="slp-sec" id="slFeedSec"><header><h2>Что происходит</h2><span>последние события раздела</span></header><div class="slp-feed" id="slFeed"></div></section>`;
      $("slQ").value = slS.q; $("slSort").value = slS.sort;
      slWire(m);
    }
    if (!SL){
      if (slErr){ $("slWait").innerHTML = ""; $("slGrid").innerHTML = `<div class="slp-empty"><b>Не достучался до базы</b>Проверь интернет или VPN и попробуй ещё раз.<br><button class="slp-btn" data-sl="retry" type="button">Обновить</button></div>`; return; }
      $("slWait").innerHTML = `<div class="slp-wrow">${'<div class="slp-sk w"></div>'.repeat(3)}</div>`;
      $("slGrid").innerHTML = '<div><div class="slp-sk p"></div><div class="slp-sk l"></div></div>'.repeat(10);
      $("slGrid").dataset.sig = ""; loadSlop(); return;
    }
    slDraw();
    if (slPending){ const id = slPending; slPending = null; if (slGame(id)) setTimeout(() => slOpenCard(id), 60); }
  }
  function slDraw(){
    const m = $("slMain"); if (!m || !SL) return;
    m.querySelectorAll("[data-sl-n]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.slN === slS.n)));
    slDrawUp();
    // календарь ожиданий
    const waits = SL.games.filter(g => !slOut(g) && slFit(g)), dated = waits.filter(g => !g.tba && g.release_date).sort((x, y) => x.release_date.localeCompare(y.release_date)), tba = waits.filter(g => g.tba || !g.release_date);
    const allWait = SL.games.filter(g => !slOut(g)).length;
    $("slWaitN").textContent = waits.length ? `${waits.length} ${plural(waits.length, "игра", "игры", "игр")} впереди` : "";
    const sigW = JSON.stringify(waits.map(g => [g.id, g.title, g.cover, g.release_date, g.tba, g.min_players, g.max_players, slMarks(g.id, "wait"), slCount(g)])) + slS.n + (FR ? FR.profiles.length : 0);
    const we = $("slWait");
    if (we.dataset.sig !== sigW){ we.dataset.sig = sigW;
      we.innerHTML = waits.length ? (dated.length ? `<div class="slp-wrow">${dated.map(slWaitCard).join("")}</div>` : "") + (tba.length ? `<div class="slp-sub">Дата неизвестна</div><div class="slp-wrow">${tba.map(slWaitCard).join("")}</div>` : "")
        : `<div class="slp-empty">${SLI.clock}<b>${allWait ? `${SL_NW[slS.n] || "Тут"} пока ничего не ждём` : "Пока никто ничего не ждёт"}</b>Добавь игру, которая ещё не вышла, — она появится здесь с обратным отсчётом.</div>`; }
    // вкладки статусов
    const base = SL.games.filter(g => slOut(g) && slFit(g)), cnt = k => base.filter(g => { const st = slStats(g.id).map(s => s.status); return k === "all" ? true : k === "fresh" ? !st.length : st.includes(k); }).length;
    $("slTabs").innerHTML = [["all", "Все"], ["playing", "Играем сейчас"], ["done", "Прошли"], ["dropped", "Дропнули"], ["fresh", "Ещё не играли"]].map(([k, l]) => `<button class="slp-tab" type="button" data-sl-tab="${k}" aria-pressed="${slS.tab === k}">${l}<i>${cnt(k)}</i></button>`).join("");
    // кто хочет
    const fans = slUniq(SL.games.filter(slOut).flatMap(g => slWant(g))); [...slS.who].forEach(u => { if (!fans.includes(u)) slS.who.delete(u); });
    $("slWho").innerHTML = fans.length > 1 ? `<span>Кто хочет:</span>` + fans.map(u => `<button class="slp-wc" type="button" data-sl-who="${esc(u)}" aria-pressed="${slS.who.has(u)}">${avaHTML(profOf(u), "sm")}${esc(u === ME.id ? "Я" : profOf(u).nick || "?")}</button>`).join("") : "";
    // жанры: самые частые сверху, выбранные должны совпасть все
    const gm = new Map(); base.forEach(g => slUniq(g.genres.map(slGK)).forEach(k => { if (!k) return; const e = gm.get(k) || {k, l: g.genres.find(x => slGK(x) === k), n: 0}; e.n++; gm.set(k, e); }));
    [...slS.gen].forEach(k => { if (!gm.has(k)) slS.gen.delete(k); });
    const gl = [...gm.values()].sort((a, b) => b.n - a.n || a.l.localeCompare(b.l, "ru")), GMAX = 10, gshow = slS.genAll ? gl : gl.filter((e, i) => i < GMAX || slS.gen.has(e.k));
    $("slGen").innerHTML = gl.length ? `<span>Жанры:</span>` + gshow.map(e => `<button class="slp-wc" type="button" data-sl-gen="${esc(e.k)}" aria-pressed="${slS.gen.has(e.k)}">${esc(e.l)}<i>${e.n}</i></button>`).join("") + (gl.length > gshow.length ? `<button class="slp-wc more" type="button" data-sl="genall">Ещё ${gl.length - gshow.length}</button>` : slS.genAll && gl.length > GMAX ? `<button class="slp-wc more" type="button" data-sl="genall">Свернуть</button>` : "") + (slS.gen.size ? `<button class="slp-wc more" type="button" data-sl="genclr">Сбросить</button>` : "") : "";
    slDrawGrid();
    // лента раздела
    const ev = slEvents().slice(0, 12);
    $("slFeedSec").hidden = !ev.length;
    $("slFeed").innerHTML = ev.map(e => `<button class="slp-fe" type="button" data-sg="${esc(e.id)}">${e.uid ? avaHTML(profOf(e.uid), "sm") : `<i class="ic">${SLI.spark}</i>`}<span class="tx">${e.uid ? `<b>${esc(e.uid === ME.id ? "Ты" : profOf(e.uid).nick || "кто-то")}</b> ${esc(e.verb)} <b>${esc(e.title)}</b>${e.vd ? ` · ${esc(SL_VD[e.vd].toLowerCase())}` : ""}` : `<b>${esc(e.title)}</b> вышла — можно играть`}</span><time>${esc(slAgo(e.ts))}</time></button>`).join("");
  }
  const slWaitCard = (g, i) => { const ws = slMarks(g.id, "wait"), mine = ws.includes(ME.id), p = profOf(g.user_id);
    return `<article class="slp-w" data-sg="${esc(g.id)}" style="--i:${Math.min(i, 8)}" tabindex="0" role="button" aria-label="${esc(g.title)}">
      <div class="slp-w-p"><span class="slp-p">${slPosterIn(g)}</span><span class="slp-w-d">${esc(slDateShort(g))}</span></div>
      <div class="slp-w-b"><b class="t">${esc(g.title)}</b><div class="slp-cd${g.tba || !g.release_date ? " dim" : ""}">${esc(slCount(g))}</div>
        <div class="slp-m">${SLI.users}${esc(slPl(g))}</div>
        <div class="slp-by">${avaHTML(p, "xs")}<b>${esc(g.user_id === ME.id ? "Ты" : p.nick || "кто-то")}</b> ${g.user_id === ME.id ? "предложил" : "предлагает"}</div>
        <div class="slp-w-f">${ws.length ? slAvs(ws, 5) : `<span class="slp-avs none">пока никого</span>`}<button class="slp-wait${mine ? " on" : ""}" type="button" data-sl-wait="${esc(g.id)}" aria-pressed="${mine}">${mine ? SLI.check : SLI.plus} Жду</button></div>
      </div></article>`; };
  const slTile = g => { const w = slWant(g).length, b = slBadge(g), dr = slDropped(g);
    return `<button class="slp-t${dr ? " drop" : ""}" type="button" data-sg="${esc(g.id)}" aria-label="${esc(g.title)}, ${esc(slPl(g))}${dr ? ", дропнули" : ""}"><span class="slp-p">${slPosterIn(g)}${slFresh(g) ? `<i class="slp-b new">Вышла!</i>` : ""}${w ? `<i class="slp-b want" title="Хотят поиграть: ${w}">${SLI.hand}${w}</i>` : ""}${dr ? `<i class="slp-stamp">ДРОП</i>` : b ? `<i class="slp-b st ${b}">${SL_ST[b].s}</i>` : ""}</span><b>${esc(g.title)}</b><small>${SLI.users}${esc(slPl(g))}</small></button>`; };
  function slEmpty(){
    const total = SL.games.filter(slOut).length, filtered = slS.tab !== "all" || slS.q.trim() || slS.who.size || slS.gen.size;
    if (!total) return `<div class="slp-empty">${SLI.slop}<b>Библиотека пустая</b>Добавь первую кооп-игру — по ссылке из Steam это пара секунд.<br><button class="slp-btn pri" data-sl="add" type="button">${SLI.plus} Добавить игру</button></div>`;
    if (filtered) return `<div class="slp-empty">${SLI.search}<b>Ничего не нашлось</b>Под такие фильтры игр нет.<br><button class="slp-btn" data-sl="clear" type="button">Сбросить фильтры</button></div>`;
    return `<div class="slp-empty">${SLI.users}<b>${SL_NW[slS.n] || "Тут"} пока ничего нет, добавь игру</b>Или переключи число игроков выше.<br><button class="slp-btn pri" data-sl="add" type="button">${SLI.plus} Добавить игру</button></div>`;
  }
  function slDrawGrid(){
    const el = $("slGrid"); if (!el || !SL) return;
    const list = slLib(), total = SL.games.filter(slOut).length;
    $("slLibN").textContent = total ? (list.length === total ? `${total} ${plural(total, "игра", "игры", "игр")}` : `${list.length} из ${total}`) : "";
    const sig = JSON.stringify(list.map(g => [g.id, g.title, g.cover, g.header, g.min_players, g.max_players, slWant(g).length, slBadge(g), slFresh(g), slDropped(g)])) + "|" + (list.length ? "" : slS.n + slS.tab + slS.q + slS.who.size + slS.gen.size + total);
    if (el.dataset.sig === sig) return; el.dataset.sig = sig;
    const rm = slRM(), olds = new Map(), base = el.getBoundingClientRect(), keep = new Set(list.map(g => g.id)), ghosts = [];
    el.querySelectorAll(".slp-t[data-sg]").forEach(t => olds.set(t.dataset.sg, {r: t.getBoundingClientRect(), n: t}));
    if (!rm) olds.forEach((o, id) => { if (keep.has(id) || !o.r.width) return; const c = o.n.cloneNode(true); c.removeAttribute("data-sg"); c.classList.remove("tilt"); c.setAttribute("aria-hidden", "true"); c.tabIndex = -1;
      c.style.cssText = `position:absolute;left:${o.r.left - base.left}px;top:${o.r.top - base.top}px;width:${o.r.width}px;margin:0;pointer-events:none;z-index:0`; ghosts.push(c); });
    el.innerHTML = list.length ? list.map(slTile).join("") : slEmpty();
    if (rm || !el.animate) return;
    ghosts.slice(0, 40).forEach(c => { el.appendChild(c); c.animate([{opacity: 1, transform: "scale(1)"}, {opacity: 0, transform: "scale(.8)"}], {duration: 240, easing: "ease-in", fill: "forwards"}).onfinish = () => c.remove(); });
    let k = 0; const first = !olds.size;
    el.querySelectorAll(".slp-t[data-sg]").forEach(t => { const o = olds.get(t.dataset.sg), r = t.getBoundingClientRect();
      if (o){ const dx = o.r.left - r.left, dy = o.r.top - r.top; if (Math.abs(dx) > 1 || Math.abs(dy) > 1) t.animate([{transform: `translate(${dx}px,${dy}px)`}, {transform: "none"}], {duration: 460, easing: "cubic-bezier(.2,.9,.25,1)"}); }
      else t.animate([{opacity: 0, transform: "translateY(22px) scale(.92)"}, {opacity: 1, transform: "none"}], {duration: 460, delay: Math.min(k++, 16) * (first ? 42 : 26) + (first ? 0 : 120), easing: "cubic-bezier(.2,.9,.25,1)", fill: "backwards"}); });
  }
  function slWire(m){
    m.addEventListener("click", e => {
      const q = s => e.target.closest(s); let b;
      if ((b = q("[data-sl-n]"))){ slS.n = b.dataset.slN; lsSet("nexus_slop_n", slS.n); slDraw(); return; }
      if ((b = q("[data-sl-tab]"))){ slS.tab = b.dataset.slTab; slDraw(); return; }
      if ((b = q("[data-sl-who]"))){ const u = b.dataset.slWho; slS.who.has(u) ? slS.who.delete(u) : slS.who.add(u); slDraw(); return; }
      if ((b = q("[data-sl-day]"))){ slCalendar({day: b.dataset.slDay}); return; }
      if ((b = q("[data-sl-gen]"))){ const k = b.dataset.slGen; slS.gen.has(k) ? slS.gen.delete(k) : slS.gen.add(k); slDraw(); return; }
      if ((b = q("[data-sl-wait]"))){ e.stopPropagation(); slToggleWait(b.dataset.slWait, b); return; }
      if ((b = q("[data-sl]"))){ const a = b.dataset.sl;
        if (a === "add") slForm(); else if (a === "roul") slChoose(); else if (a === "cal") slCalendar(); else if (a === "tiers") slTierSheet(); else if (a === "retry"){ slErr = false; renderSlop(); }
        else if (a === "genall"){ slS.genAll = !slS.genAll; slDraw(); }
        else if (a === "genclr"){ slS.gen.clear(); slDraw(); }
        else if (a === "clear"){ slS.tab = "all"; slS.q = ""; slS.who.clear(); slS.gen.clear(); $("slQ").value = ""; slDraw(); }
        return; }
      if ((b = q("[data-sg]"))) slOpenCard(b.dataset.sg, b.querySelector(".slp-p"));
    });
    m.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("article.slp-w")){ e.preventDefault(); slOpenCard(e.target.dataset.sg, e.target.querySelector(".slp-p")); } });
    $("slQ").addEventListener("input", e => { slS.q = e.target.value; slDrawGrid(); });
    $("slSort").addEventListener("change", e => { slS.sort = e.target.value; lsSet("nexus_slop_sort", slS.sort); slDrawGrid(); });
    // лёгкий наклон постера за курсором
    const grid = $("slGrid"); let cur = null;
    const reset = () => { if (cur){ cur.classList.remove("tilt"); const p = cur.querySelector(".slp-p"); if (p){ p.style.removeProperty("--rx"); p.style.removeProperty("--ry"); } cur = null; } };
    if (window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches) {
      grid.addEventListener("pointermove", e => { if (slRM()) return; const t = e.target.closest(".slp-t[data-sg]"); if (t !== cur) reset(); if (!t) return; cur = t;
        const p = t.querySelector(".slp-p"), r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.classList.add("tilt"); p.style.setProperty("--ry", ((x - .5) * 13).toFixed(2) + "deg"); p.style.setProperty("--rx", ((.5 - y) * 11).toFixed(2) + "deg"); p.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); p.style.setProperty("--my", (y * 100).toFixed(1) + "%"); });
      grid.addEventListener("pointerleave", reset);
    }
  }

  // ---- действия ----
  const slPop = el => { if (!el || slRM()) return; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };
  async function slSetMark(id, kinds, on){
    const mine = m => m.game_id === id && m.user_id === ME.id && kinds.includes(m.kind);
    SL.marks = SL.marks.filter(m => !mine(m));
    if (on) SL.marks.push({game_id: id, user_id: ME.id, kind: kinds[0], created_at: now()});
    slRefresh();
    const r = on ? await SB.from("slop_marks").upsert({game_id: id, user_id: ME.id, kind: kinds[0]}, {onConflict: "game_id,user_id,kind", ignoreDuplicates: true})
      : await SB.from("slop_marks").delete().eq("game_id", id).eq("user_id", ME.id).in("kind", kinds);
    if (r.error){ toast("Не сохранилось, попробуй ещё раз"); loadSlop(); return false; }
    return true;
  }
  async function slToggleWait(id){
    const g = slGame(id); if (!g || !ME) return; const on = !slMarks(id, "wait").includes(ME.id);
    try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ }
    const ok = await slSetMark(id, ["wait"], on);
    slPop(document.querySelector(`[data-sl-wait="${id}"]`)); slPop(document.querySelector("#slCard .slp-want"));
    if (!ok) return;
    if (on){ const added = await slShelfAdd(g); toast(added ? `${g.title} — ждёшь, добавил в твою коллекцию «Жду»` : `${g.title} — ждёшь`); }
    else { const removed = await slShelfDrop(g); toast(removed ? `${g.title} — больше не ждёшь, убрал из твоей коллекции` : `${g.title} — больше не ждёшь`); }
  }
  async function slToggleWant(id){
    const g = slGame(id); if (!g || !ME) return; const on = !slWant(g).includes(ME.id);
    try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ }
    await slSetMark(id, on ? ["want"] : ["want", "wait"], on);
    slPop(document.querySelector("#slCard .slp-want"));
  }
  // «Жду» кладёт игру с датой в личный календарь ожиданий; без даты — только отметка в СЛОПе. В «Список желаемого» — только вручную
  async function slShelfAdd(g){
    if (!db) return false;
    const nt = normT(g.title);
    if (MYITEMS.some(it => isGame(it) && (it.slopId === g.id || (g.steam_id && String(it.steamId || "") === g.steam_id) || normT(it.title) === nt))) return false;
    const dated = !!(g.release_date && !g.tba); if (!dated) return false; // без даты ждём только в СЛОПе, в «Список желаемого» — вручную
    const body = {type: "game", title: g.title, status: "soon", createdAt: now(), updatedAt: now(), slopId: g.id};
    if (dated){ body.releaseDate = g.release_date; if (g.release_prec && g.release_prec !== "day") body.releasePrec = g.release_prec; }
    if (g.descr) body.desc = g.descr; if (g.genres.length) body.genre = g.genres.join(", "); if (g.steam_id) body.steamId = g.steam_id;
    const u = slImg(g);
    if (u && assets){ try { const r = await fetch(u); if (!r.ok) throw 0; const bl = await r.blob(); if (bl.type.startsWith("image/")) body.cover = (await assets.upload(bl, {type: bl.type})).id; } catch(e){ logErr("СЛОП: копия обложки", e); } }
    try { await db.collection("items").add(body); return true; } catch(_){ return false; }
  }
  async function slShelfDrop(g){
    if (!db) return false;
    const it = MYITEMS.find(x => x.slopId === g.id && x.status === "soon"); if (!it) return false;
    try { await db.doc("items/" + it.id).delete(); return true; } catch(_){ return false; }
  }
  async function slSetStatus(id, st){
    const cur = SL.status.find(s => s.game_id === id && s.user_id === ME.id);
    try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ }
    if (cur && cur.status === st){ SL.status = SL.status.filter(s => s !== cur); slRefresh();
      const {error} = await SB.from("slop_status").delete().eq("game_id", id).eq("user_id", ME.id); if (error){ toast("Не сохранилось"); loadSlop(); } return; }
    const row = {game_id: id, user_id: ME.id, status: st, verdict: st === "playing" ? null : (cur && cur.verdict) || null, note: st === "playing" ? null : (cur && cur.note) || null, updated_at: now()};
    SL.status = SL.status.filter(s => s !== cur).concat(row); slRefresh();
    const {error} = await SB.from("slop_status").upsert(row, {onConflict: "game_id,user_id"}); if (error){ toast("Не сохранилось"); loadSlop(); }
  }
  async function slPatchStatus(id, patch){
    const cur = SL.status.find(s => s.game_id === id && s.user_id === ME.id); if (!cur) return;
    Object.assign(cur, patch); slRefresh();
    const {error} = await SB.from("slop_status").update(patch).eq("game_id", id).eq("user_id", ME.id); if (error){ toast("Не сохранилось"); loadSlop(); }
  }

  // ---- карточка игры ----
  function slOpenCard(id, from){
    const g = slGame(id); if (!g) return;
    let ov = $("slCard");
    if (!ov){ ov = document.createElement("div"); ov.id = "slCard"; ov.className = "slp-ov"; ov.hidden = true; document.body.appendChild(ov); slWireCard(ov); }
    clearTimeout(slOpenCard.t); slOpenId = id; ov.hidden = false; ov.classList.remove("on", "still");
    ov.innerHTML = `<div class="slp-ov-bg" data-sl="close"></div><div class="slp-c" role="dialog" aria-modal="true" aria-label="${esc(g.title)}"></div>`;
    slDrawCard(); document.body.classList.add("slp-open");
    void ov.offsetWidth; ov.classList.add("on");
    setTimeout(() => { if (slOpenId === id) ov.classList.add("still"); }, 900);
    try { SND.click("tab"); } catch(_){ /* ожидаемо: звук недоступен */ }
    const pe = ov.querySelector(".slp-c-poster");
    if (from && pe && !slRM() && document.body.animate){
      const a = from.getBoundingClientRect(), b = pe.getBoundingClientRect();
      if (a.width && b.width){
        const fly = document.createElement("div"); fly.className = "slp-fly"; fly.innerHTML = slPosterIn(g);
        fly.style.cssText = `left:${b.left}px;top:${b.top}px;width:${b.width}px;height:${b.height}px`;
        document.body.appendChild(fly); pe.style.visibility = "hidden";
        const done = () => { fly.remove(); const p2 = ov.querySelector(".slp-c-poster"); if (p2) p2.style.visibility = ""; };
        const an = fly.animate([{transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})`}, {transform: "none"}], {duration: 460, easing: "cubic-bezier(.2,.9,.2,1)"});
        an.onfinish = done; an.oncancel = done;
      }
    }
    const x = ov.querySelector(".slp-c-x"); if (x) x.focus({preventScroll: true});
  }
  function slCloseCard(){
    const ov = $("slCard"); if (!ov || !slOpenId) return; slOpenId = null; slFtpEdit = null; slLibPick = null;
    ov.classList.remove("on"); document.body.classList.remove("slp-open");
    document.querySelectorAll(".slp-fly").forEach(f => f.remove());
    slOpenCard.t = setTimeout(() => { if (!slOpenId){ ov.hidden = true; ov.innerHTML = ""; } }, 300);
  }
  document.addEventListener("keydown", e => { if (e.key !== "Escape") return;
    if ($("slPoll") && !$("slPoll").hidden && !sheets.length){ e.stopImmediatePropagation(); slPollClose(); return; }
    if ($("slRl") && !$("slRl").hidden){ e.stopImmediatePropagation(); slCloseRoulette(); return; }
    if (slOpenId && !sheets.length && $("lb").hidden){ e.stopImmediatePropagation(); slCloseCard(); } }, true);
  window.addEventListener("hashchange", () => { slCloseCard(); slCloseRoulette(); slPollClose(); });
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-slopgo]"); if (!b) return; e.preventDefault(); const id = b.dataset.slopgo;
    if (route === "slop"){ if (slGame(id)) slOpenCard(id); } else { slPending = id; go("slop"); } });

  function slDrawCard(keep){
    const ov = $("slCard"), g = slGame(slOpenId); if (!ov || !g) return;
    const c = ov.querySelector(".slp-c"); if (!c) return;
    const act = document.activeElement, fid = act && c.contains(act) ? act.id : "", vals = {}; c.querySelectorAll("input[id],textarea[id]").forEach(i => vals[i.id] = i.value);
    const sy = c.scrollTop, media = keep ? c.querySelector(".slp-media") : null, hid = keep && c.querySelector(".slp-c-poster") && c.querySelector(".slp-c-poster").style.visibility === "hidden";
    const out = slOut(g), own = g.user_id === ME.id, p = profOf(g.user_id);
    const want = out ? slWant(g) : slMarks(g.id, "wait"), mineW = want.includes(ME.id);
    const sts = slStats(g.id), my = sts.find(s => s.user_id === ME.id);
    const ftp = slHttp(g.freetp_url), steam = g.steam_id ? `https://store.steampowered.com/app/${encodeURIComponent(g.steam_id)}/` : "";
    const ftpL = /freetp/i.test(ftp) ? "Скачать на FreeTP" : "Скачать";
    const dl = ftp ? `<a class="slp-dl" href="${esc(ftp)}" target="_blank" rel="noopener noreferrer">${SLI.dl}${ftpL}</a>${steam ? `<a class="slp-btn" href="${esc(steam)}" target="_blank" rel="noopener noreferrer">${SLI.ext} Steam</a>` : ""}`
      : steam ? `<a class="slp-dl steam" href="${esc(steam)}" target="_blank" rel="noopener noreferrer">${SLI.ext}${out ? "Открыть в Steam" : "Страница в Steam"}</a>`
      : `<span class="slp-nolink">Ссылку на игру пока не добавили.</span>`;
    // владелец может докинуть ссылку FreeTP одним нажатием — прямо из буфера
    const ftpAdd = !own || ftp ? "" : slFtpEdit === g.id ? `<span class="slp-ftp"><input class="slp-in" id="slFtpIn" inputmode="url" placeholder="Вставь сюда ссылку с freetp.org (Ctrl+V)" autocomplete="off"><button class="slp-btn pri" type="button" data-sl="ftpsave">Сохранить</button><button class="slp-btn" type="button" data-sl="ftpno" aria-label="Отмена">${SLI.x}</button></span>`
      : `<button class="slp-btn slp-ftpb" type="button" data-sl="ftp" title="Скопируй адрес страницы игры на freetp.org и нажми">${SLI.dl} Вставить ссылку с FreeTP</button>`;
    const bg = g.screenshots[0] || slHttp(g.header) || slImg(g);
    const tr = g.trailer && (slHttp(g.trailer.mp4) || slHttp(g.trailer.webm)) ? g.trailer : null;
    const cms = SL.comments.filter(x => x.game_id === g.id);
    const cmp = (a, b) => ["playing", "done", "dropped"].indexOf(a.status) - ["playing", "done", "dropped"].indexOf(b.status);
    c.innerHTML = `<button class="slp-c-x" type="button" data-sl="close" aria-label="Закрыть">${SLI.x}</button>
      ${bg ? `<div class="slp-c-bg" style="background-image:url('${esc(bg).replace(/'/g, "%27")}')"></div>` : ""}
      <div class="slp-c-top">
        <div class="slp-c-poster"${hid ? ' style="visibility:hidden"' : ""}><span class="slp-p">${slPosterIn(g)}</span></div>
        <div class="slp-c-h">
          <div class="slp-c-tags">${!out ? `<span class="slp-pill a">${SLI.clock}${esc(slCount(g))}</span>` : ""}${slFresh(g) ? `<span class="slp-pill a">${SLI.spark}Вышла!</span>` : ""}${slUniq(sts.map(s => s.status)).sort((a, b) => cmp({status: a}, {status: b})).map(k => `<span class="slp-pill ${k}">${SL_ST[k].s}: ${sts.filter(s => s.status === k).length}</span>`).join("")}</div>
          <h2>${esc(g.title)}</h2>
          <div class="slp-c-meta"><span>${SLI.users}${esc(slPl(g))}</span>${g.release_date || g.tba ? `<span>${SLI.clock}${out ? "вышла " : "выход: "}${esc(slDateLabel(g))}</span>` : ""}</div>
          <div class="slp-c-g">${g.genres.slice(0, 8).map(x => `<span>${esc(x)}</span>`).join("")}</div>
          <div class="slp-by">${avaHTML(p, "sm")}<b>${esc(own ? "Ты" : p.nick || "кто-то")}</b> ${own ? "добавил" : "предлагает"} · ${esc(slAgo(g.created_at))}</div>
        </div>
        <div class="slp-c-act">
          <div class="slp-c-dl">${dl}${ftpAdd}</div>
          <div class="slp-c-want"><button class="slp-want${mineW ? " on" : ""}" type="button" data-sl="${out ? "want" : "wait"}" aria-pressed="${mineW}">${mineW ? SLI.check : out ? SLI.hand : SLI.clock}${out ? "ХОЧУ ПОИГРАТЬ" : "ЖДУ"}</button>
            <div class="slp-ppl">${want.length ? want.map(u => `<span class="slp-pp">${avaHTML(profOf(u), "sm")}${esc(u === ME.id ? "Ты" : profOf(u).nick || "?")}</span>`).join("") : `<em>${out ? "Пока никто не отметился. Нажми — и остальные увидят, с кем собираться." : "Пока никто не ждёт. Нажми «Жду» — игра появится и в твоей коллекции."}</em>`}</div></div>
          ${slCardExtra(g, out)}
        </div>
      </div>
      <div class="slp-c-body">
        ${g.descr ? `<p class="slp-c-desc">${esc(g.descr)}</p>` : ""}
        ${out ? `<section class="slp-blk"><h3>${SLI.flag}Как у тебя с этой игрой</h3>
          <div class="slp-seg">${Object.entries(SL_ST).map(([k, v]) => `<button class="slp-st ${k}${my && my.status === k ? " on" : ""}" type="button" data-sl-st="${k}" aria-pressed="${!!(my && my.status === k)}">${SLI[v.ic]}${v.l}</button>`).join("")}</div>
          ${my && my.status !== "playing" ? `<div class="slp-vd"><span>Короткий вердикт — стоит ли остальным?</span><div class="slp-seg">${Object.entries(SL_VD).map(([k, l]) => `<button class="slp-st${my.verdict === k ? " on" : ""}" type="button" data-sl-vd="${k}" aria-pressed="${my.verdict === k}">${l}</button>`).join("")}</div>
            <input class="slp-in" id="slNote" maxlength="140" placeholder="Комментарий в одну строку (необязательно)" value="${esc(my.note || "")}"></div>` : ""}
          ${sts.length ? `<div class="slp-who-l">${[...sts].sort(cmp).map(s => `<div class="slp-wr">${avaHTML(profOf(s.user_id), "sm")}<b>${esc(s.user_id === ME.id ? "Ты" : profOf(s.user_id).nick || "?")}</b><span class="slp-pill ${s.status}">${SL_ST[s.status].s}</span>${s.verdict ? `<span class="slp-pill ${s.verdict}">${SL_VD[s.verdict]}</span>` : ""}${s.note ? `<q>${esc(s.note)}</q>` : ""}</div>`).join("")}</div>` : ""}
        </section>` : ""}
        ${out ? slCardTier(g) : ""}
        ${tr || g.screenshots.length ? `<section class="slp-blk"><h3>${SLI.img}${tr ? "Трейлер и скриншоты" : "Скриншоты"}</h3><div class="slp-media">${tr ? `<div class="vid"><video controls preload="none" playsinline ${slHttp(tr.thumb) ? `poster="${esc(tr.thumb)}"` : ""}>${slHttp(tr.webm) ? `<source src="${esc(tr.webm)}" type="video/webm">` : ""}${slHttp(tr.mp4) ? `<source src="${esc(tr.mp4)}" type="video/mp4">` : ""}</video></div>` : ""}${g.screenshots.slice(0, 10).map((u, i) => `<button type="button" data-sl-shot="${i}" aria-label="Скриншот ${i + 1}"><img alt="" loading="lazy" src="${esc(u)}" onerror="this.parentNode.remove()"></button>`).join("")}</div></section>` : ""}
        <section class="slp-blk"><h3>${SLI.chat}Обсуждение${cms.length ? ` · ${cms.length}` : ""}</h3>
          ${cms.length ? `<ul class="slp-cm">${cms.map(x => `<li>${avaHTML(profOf(x.user_id), "sm")}<div class="bx"><b>${esc(x.user_id === ME.id ? "Ты" : profOf(x.user_id).nick || "?")}</b><time>${esc(slAgo(x.created_at))}</time><p>${esc(x.body)}</p></div>${x.user_id === ME.id || own ? `<button class="del" type="button" data-sl-cdel="${esc(x.id)}" aria-label="Удалить комментарий">${SLI.x}</button>` : "<span></span>"}</li>`).join("")}</ul>` : ""}
          <div class="slp-cf"><input class="slp-in" id="slCIn" maxlength="1000" placeholder="Кто сегодня в 9? Нужен ли VPN?" autocomplete="off"><button class="slp-btn" type="button" data-sl="csend" aria-label="Отправить">${SLI.send}</button></div>
        </section>
        ${own ? `<div class="slp-c-own"><button class="slp-btn sm" type="button" data-sl="edit">${SLI.edit} Изменить</button><button class="slp-btn sm red" type="button" data-sl="del">Удалить игру</button></div>` : ""}
      </div>`;
    if (keep){
      const m2 = c.querySelector(".slp-media"); if (media && m2 && media.innerHTML.replace(/\s+/g, "").length === m2.innerHTML.replace(/\s+/g, "").length) m2.replaceWith(media);
      Object.entries(vals).forEach(([id, v]) => { const i = c.querySelector("#" + id); if (i && id !== "slNote") i.value = v; else if (i && fid === "slNote") i.value = v; });
      c.scrollTop = sy; if (fid){ const f = c.querySelector("#" + fid); if (f){ f.focus({preventScroll: true}); try { f.setSelectionRange(f.value.length, f.value.length); } catch(_){ /* ожидаемо: поле без курсора */ } } }
    }
  }
  function slWireCard(ov){
    ov.addEventListener("click", async e => {
      const q = s => e.target.closest(s), id = slOpenId; let b; if (!id) return;
      if ((b = q("[data-sl-st]"))) return slSetStatus(id, b.dataset.slSt);
      if ((b = q("[data-sl-vd]"))){ const cur = SL.status.find(s => s.game_id === id && s.user_id === ME.id); return slPatchStatus(id, {verdict: cur && cur.verdict === b.dataset.slVd ? null : b.dataset.slVd}); }
      if ((b = q("[data-sl-shot]"))) return slLightbox(slGame(id).screenshots.slice(0, 10), +b.dataset.slShot);
      if ((b = q("[data-sl-cdel]"))){ const cid = b.dataset.slCdel; SL.comments = SL.comments.filter(x => x.id !== cid); slRefresh();
        const {error} = await SB.from("slop_comments").delete().eq("id", cid); if (error){ toast("Не удалилось"); loadSlop(); } return; }
      if ((b = q("[data-sl-tier]"))){ const ti = +b.dataset.slTier, cur = slTier(id); return slSetTier(id, cur && cur.tier === ti ? null : ti); }
      if ((b = q("[data-sl-lib]"))) return slToLib(id, b.dataset.slLib);
      if (!(b = q("[data-sl]"))) return; const a = b.dataset.sl;
      if (a === "close") slCloseCard();
      else if (a === "plan") slCalendar({gameId: id, form: true});
      else if (a === "tolib"){ slLibPick = slLibPick === id ? null : id; slDrawCard(true); }
      else if (a === "tiers") slTierSheet();
      else if (a === "want") slToggleWant(id);
      else if (a === "wait") slToggleWait(id);
      else if (a === "csend") slSendComment();
      else if (a === "ftp") slFtpPaste(id);
      else if (a === "ftpsave"){ const i = $("slFtpIn"); slFtpSave(id, i ? i.value : ""); }
      else if (a === "ftpno"){ slFtpEdit = null; slDrawCard(true); }
      else if (a === "edit") slForm(slGame(id));
      else if (a === "del"){ if (b.dataset.sure){ b.disabled = true; const g = slGame(id); const {error} = await SB.from("slop_games").delete().eq("id", id);
          if (error){ toast("Не удалилось"); b.disabled = false; return; } SL.games = SL.games.filter(x => x.id !== id); slCloseCard(); slRefresh(); toast(`${g ? g.title : "Игра"} — удалено из СЛОПа`); }
        else { b.dataset.sure = "1"; b.textContent = "Точно удалить? Нажми ещё раз"; setTimeout(() => { if (b.isConnected){ delete b.dataset.sure; b.textContent = "Удалить игру"; } }, 4000); } }
    });
    ov.addEventListener("keydown", e => { if (e.key !== "Enter" || !e.target.id) return;
      if (e.target.id === "slFtpIn"){ e.preventDefault(); slFtpSave(slOpenId, e.target.value); return; }
      if (e.target.id === "slCIn"){ e.preventDefault(); slSendComment(); } else if (e.target.id === "slNote"){ e.preventDefault(); e.target.blur(); } });
    ov.addEventListener("focusout", e => { if (e.target.id !== "slNote" || !slOpenId) return; const v = e.target.value.trim().slice(0, 140) || null, cur = SL.status.find(s => s.game_id === slOpenId && s.user_id === ME.id);
      if (cur && (cur.note || null) !== v) slPatchStatus(slOpenId, {note: v}); });
  }
  let slFtpEdit = null;
  const slFtpUrl = t => { t = String(t || "").trim(); const m = t.match(/https?:\/\/[^\s"'<>]+/i); return slHttp(m ? m[0] : /^[\w.-]+\.[a-z]{2,}\/\S*$/i.test(t) ? "https://" + t : ""); };
  const slFtpAsk = (id, val) => { slFtpEdit = id; slDrawCard(true); const i = $("slFtpIn"); if (i){ if (val) i.value = val; i.focus({preventScroll: true}); } };
  async function slFtpPaste(id){
    let t = null; try { t = await navigator.clipboard.readText(); } catch(_){ t = null; }
    if (slOpenId !== id) return;
    if (t === null){ slFtpAsk(id); toast("Браузер не дал прочитать буфер — вставь ссылку в поле (Ctrl+V)"); return; }
    const u = slFtpUrl(t);
    if (!u){ slFtpAsk(id); toast("В буфере нет ссылки — скопируй адрес страницы игры на freetp.org"); return; }
    if (!/freetp/i.test(u)){ slFtpAsk(id, u); toast("Это не похоже на FreeTP — проверь ссылку и нажми «Сохранить»"); return; }
    slFtpSave(id, u);
  }
  async function slFtpSave(id, raw){
    const g = slGame(id), u = slFtpUrl(raw); if (!g) return;
    if (!u || u.length > 500){ toast("Это не ссылка — нужен адрес страницы игры целиком"); const i = $("slFtpIn"); if (i) i.focus(); return; }
    const {error} = await SB.from("slop_games").update({freetp_url: u, updated_at: now()}).eq("id", id);
    if (error){ toast("Не сохранилось, попробуй ещё раз"); return; }
    g.freetp_url = u; slFtpEdit = null; slRefresh(); try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ } toast(`Ссылка FreeTP добавлена — ${g.title}`);
  }
  async function slSendComment(){
    const i = $("slCIn"), id = slOpenId; if (!i || !id) return; const body = i.value.trim().slice(0, 1000); if (!body) return;
    i.value = ""; const tmp = {id: "tmp-" + Date.now(), game_id: id, user_id: ME.id, body, created_at: now()};
    SL.comments.push(tmp); slRefresh();
    const {data, error} = await SB.from("slop_comments").insert({game_id: id, user_id: ME.id, body}).select().single();
    if (error){ SL.comments = SL.comments.filter(x => x !== tmp); slRefresh(); toast("Не отправилось"); const j = $("slCIn"); if (j) j.value = body; return; }
    Object.assign(tmp, data); slRefresh();
    const c = document.querySelector("#slCard .slp-c"), f = $("slCIn"); if (f) f.focus({preventScroll: true}); if (c) c.scrollTo({top: c.scrollHeight, behavior: slRM() ? "auto" : "smooth"});
  }
  function slLightbox(urls, i){
    if (!urls.length) return; let k = i; const el = $("lb"); el.hidden = false;
    const draw = () => { el.innerHTML = `<button class="lb-x" id="lbX" aria-label="Закрыть">${ICON.x}</button><img alt="" src="${esc(urls[k])}">${urls.length > 1 ? `<button class="lb-a l" id="lbL" aria-label="Назад">‹</button><button class="lb-a r" id="lbR" aria-label="Вперёд">›</button>` : ""}<div class="lb-b"><span>${k + 1} / ${urls.length}</span></div>`;
      $("lbX").onclick = close; if ($("lbL")) $("lbL").onclick = () => step(-1); if ($("lbR")) $("lbR").onclick = () => step(1); };
    const step = d => { k = (k + d + urls.length) % urls.length; draw(); };
    const key = e => { if (e.key === "Escape"){ e.stopImmediatePropagation(); close(); } else if (e.key === "ArrowLeft" && urls.length > 1) step(-1); else if (e.key === "ArrowRight" && urls.length > 1) step(1); };
    const close = () => { el.hidden = true; el.innerHTML = ""; el.onclick = null; window.removeEventListener("keydown", key, true); };
    el.onclick = e => { if (e.target === el) close(); };
    window.addEventListener("keydown", key, true); draw();
  }

  // ---- добавление и правка ----
  function slForm(g){
    if (!ME || !SB) return;
    const isNew = !g, st = {userFile: null, steamFile: null, cover: g ? g.cover : null, header: g ? g.header : null, shots: g ? g.screenshots : [], trailer: g ? g.trailer : null, steamId: g ? g.steam_id : null, dupOk: false, busy: false, urls: []};
    const relText = g && g.release_date && !g.tba ? (g.release_prec === "day" ? parseD(g.release_date).toLocaleDateString("ru-RU") : slDateLabel(g)) : "";
    const s = openSheet(`<div class="sh-grab"></div><h3>${isNew ? "Добавить в СЛОП" : "Изменить игру"}</h3>
      <p class="sub">${isNew ? "Игра появится в общем списке. В твою личную библиотеку она не попадёт." : "Правки увидят все."}</p>
      <div class="slp-f">
        <div class="slp-f-l"><div class="slp-drop" id="slfDrop" tabindex="0" role="button" aria-label="Постер: перетащи картинку или нажми"><canvas id="slfCv" width="400" height="600" hidden aria-label="Постер: тяни, чтобы подвинуть"></canvas><div>${SLI.img}Перетащи постер сюда,<br>вставь из буфера<br>или нажми</div></div>
          <div class="slp-adj-w"><div class="slp-adj" id="slfAdj" hidden><label><span>Размер</span><input type="range" id="slfZoom" min="0.3" max="3" step="0.01" value="1" aria-label="Размер постера"></label>
              <div class="slp-adj-b"><button class="ib" id="slfFit" type="button" title="Показать картинку целиком">Целиком</button><button class="ib" id="slfFill" type="button" title="Заполнить весь постер">Заполнить</button></div><small>Тяни постер мышкой, колесо — размер</small></div>
            <button class="ib slp-drop-x" id="slfOwn" type="button">Свой постер</button><button class="ib slp-drop-x" id="slfDropX" type="button" hidden>Убрать свой постер</button><input type="file" id="slfFile" accept="image/*" hidden></div></div>
        <div>
          ${isNew && MYITEMS.some(it => isGame(it) && it.title) ? `<button class="slp-pickb" id="slfPick" type="button">${SLI.img}Взять из моей коллекции или из ожидаемых</button><div class="slp-or">или добавить по ссылке</div>` : ""}
          <label class="f"><span><i>1</i><b>Ссылка на Steam</b> — подтянет название, постер, дату, жанры и скриншоты</span>
            <span class="slp-f-row"><input class="in" id="slfUrl" inputmode="url" placeholder="https://store.steampowered.com/app/…" autocomplete="off" value="${g && g.steam_id ? `https://store.steampowered.com/app/${esc(g.steam_id)}/` : ""}"><button class="ib" id="slfGo" type="button">Подтянуть</button></span></label>
          <div class="slp-f-msg" id="slfMsg"></div>
          <label class="f"><span><b>Название</b></span><input class="in" id="slfTitle" maxlength="200" placeholder="Если игры нет в Steam — впиши сам" value="${esc(g ? g.title : "")}"></label>
          <div class="f" style="display:grid;gap:6px;font-size:13px;color:#8e8e93;margin-bottom:12px"><span><i>2</i><b>Сколько игроков</b> — в Steam этого нет, впиши сам</span>
            <span class="row2"><input class="in" id="slfMin" type="number" inputmode="numeric" min="1" max="100" placeholder="от (по умолчанию 1)" aria-label="От скольки игроков" value="${g ? g.min_players : ""}"><input class="in" id="slfMax" type="number" inputmode="numeric" min="1" max="100" placeholder="до скольки *" aria-label="До скольки игроков" value="${g ? g.max_players : ""}"></span></div>
          <label class="f"><span><i>3</i><b>Ссылка на freetp.org</b> — необязательно</span><input class="in" id="slfFtp" inputmode="url" placeholder="https://freetp.org/…" autocomplete="off" value="${esc(g ? g.freetp_url || "" : "")}"></label>
          <details class="slp-f-more" id="slfMore"${g ? " open" : ""}><summary>Дата выхода, жанры, описание</summary>
            <label class="f">Дата выхода<input class="in" id="slfRel" placeholder="12.03.2027 · март 2027 · Q2 2027 · 2027" autocomplete="off" value="${esc(relText)}"></label>
            <label class="slp-chk"><input type="checkbox" id="slfTba"${g && g.tba ? " checked" : ""}> Ещё не вышла, точной даты нет («скоро»)</label>
            <label class="f">Жанры через запятую<input class="in" id="slfGen" placeholder="Кооп, Хоррор, Выживание" value="${esc(g ? g.genres.join(", ") : "")}"></label>
            <label class="f">Описание<textarea class="in" id="slfDesc" maxlength="4000" placeholder="Пара слов, про что игра">${esc(g ? g.descr || "" : "")}</textarea></label>
          </details>
          <div id="slfDup"></div>
          <div class="slp-f-act"><button class="ib blue" id="slfSave" type="button">${isNew ? "Добавить" : "Сохранить"}</button></div>
        </div>
      </div>`, {wide: true, onClose: () => st.urls.forEach(u => URL.revokeObjectURL(u))});
    s.el.classList.add("slp-sheet");
    const q = sel => s.el.querySelector(sel), msg = (t, cls) => { const m = q("#slfMsg"); m.textContent = t || ""; m.className = "slp-f-msg" + (cls ? " " + cls : ""); };
    // постер: предпросмотр на холсте — можно двигать мышкой и менять масштаб, при сохранении запекается в 2:3
    const cv = q("#slfCv"), pos = st.pos = {s: 1, x: 0, y: 0}; let fitS = 1, srcKey = "";
    const paint = () => { if (!st.img) return; const r = slPaint(cv, st.img, pos); pos.x = r.x; pos.y = r.y; q("#slfZoom").value = String(pos.s); };
    const prev = () => { const f = st.userFile || st.steamFile; let u = "", key = "";
      if (f){ key = "f:" + f.name + f.size + f.lastModified; if (key !== srcKey){ u = URL.createObjectURL(f); st.urls.push(u); } } else if (st.cover){ u = /^https?:/i.test(st.cover) ? st.cover : publicUrl(st.cover); key = u; } else if (slHttp(st.header)){ u = st.header; key = u; }
      const d = q("#slfDrop"); d.classList.toggle("has", !!key); q("#slfDropX").hidden = !st.userFile; q("#slfAdj").hidden = !key || !st.img;
      if (key === srcKey) return; srcKey = key; st.img = null; q("#slfAdj").hidden = true; cv.hidden = true; d.querySelectorAll("img").forEach(i => i.remove());
      if (!key) return;
      const im = new Image(); im.crossOrigin = "anonymous";
      im.onload = () => { if (srcKey !== key) return; st.img = im; st.fresh = !!f || !st.cover;
        const W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight; fitS = Math.min(W / iw, H / ih) / Math.max(W / iw, H / ih);
        // широкую картинку (шапку из Steam) по умолчанию показываем целиком, а не обрезаем по бокам
        pos.s = st.fresh && iw / ih > 0.85 ? fitS : 1; pos.x = pos.y = 0;
        q("#slfZoom").min = String(Math.min(.3, fitS).toFixed(2)); cv.hidden = false; q("#slfAdj").hidden = false; paint(); };
      im.onerror = () => { if (srcKey !== key) return; const pl = document.createElement("img"); pl.alt = ""; pl.src = u; d.appendChild(pl); };
      im.src = u; };
    const setFile = f => { if (!f || !f.type.startsWith("image/")){ toast("Нужна картинка"); return; } if (f.size > 20 * 1024 * 1024){ toast("Картинка слишком большая"); return; } st.userFile = f; prev(); };
    bindDrop(q("#slfDrop"), setFile); pasteTarget = setFile;
    q("#slfDrop").onclick = () => { if (!st.img) q("#slfFile").click(); };
    q("#slfDrop").onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); q("#slfFile").click(); } };
    q("#slfFile").onchange = e => { setFile(e.target.files[0]); e.target.value = ""; };
    q("#slfOwn").onclick = () => q("#slfFile").click();
    q("#slfDropX").onclick = () => { st.userFile = null; prev(); };
    q("#slfZoom").oninput = e => { pos.s = +e.target.value; paint(); };
    q("#slfFit").onclick = () => { pos.s = fitS; pos.x = pos.y = 0; paint(); };
    q("#slfFill").onclick = () => { pos.s = 1; pos.x = pos.y = 0; paint(); };
    let drag = null;
    cv.addEventListener("pointerdown", e => { if (!st.img || e.button) return; e.preventDefault(); drag = {x: e.clientX, y: e.clientY, px: pos.x, py: pos.y}; cv.setPointerCapture(e.pointerId); cv.classList.add("grab"); });
    cv.addEventListener("pointermove", e => { if (!drag) return; const r = cv.getBoundingClientRect(); pos.x = drag.px + (e.clientX - drag.x) / r.width; pos.y = drag.py + (e.clientY - drag.y) / r.height; paint(); });
    const dragEnd = () => { drag = null; cv.classList.remove("grab"); }; cv.addEventListener("pointerup", dragEnd); cv.addEventListener("pointercancel", dragEnd);
    cv.addEventListener("wheel", e => { if (!st.img) return; e.preventDefault(); pos.s = Math.min(3, Math.max(+q("#slfZoom").min, pos.s * (e.deltaY < 0 ? 1.06 : 1 / 1.06))); paint(); }, {passive: false});
    prev();
    const appId = raw => { const m = String(raw || "").match(/store\.steampowered\.com\/app\/(\d+)/i) || String(raw || "").trim().match(/^(\d{2,10})$/); return m ? m[1] : null; };
    const fill = async () => {
      const id = appId(q("#slfUrl").value);
      if (!id){ msg("Это не похоже на ссылку на игру в Steam. Можно заполнить всё вручную.", "bad"); q("#slfMore").open = true; return; }
      const btn = q("#slfGo"); btn.disabled = true; btn.textContent = "Ищу…"; msg("Спрашиваю Steam…");
      try {
        const {data: d, error} = await SB.functions.invoke("steam", {body: {appid: id}});
        if (error || !d || d.error) throw new Error((d && d.error) || "Steam не ответил");
        st.steamId = id; const got = [];
        if (d.name){ q("#slfTitle").value = d.name; got.push("название"); }
        if (d.short){ q("#slfDesc").value = d.short; got.push("описание"); }
        const gs = slUniq([...(d.genres || []), ...(d.tags || []).slice(0, 5)].map(x => String(x).trim()).filter(Boolean)).slice(0, 8);
        if (gs.length){ q("#slfGen").value = gs.join(", "); got.push("жанры"); }
        const rd = d.release && d.release.date, iso = rd ? toISO(rd) : null;
        if (iso){ q("#slfRel").value = iso.prec === "day" ? parseD(iso.d).toLocaleDateString("ru-RU") : rd; q("#slfTba").checked = false; got.push("дату выхода"); }
        else if (d.coming_soon){ q("#slfRel").value = ""; q("#slfTba").checked = true; got.push("«скоро»"); }
        if (d.cover){ const bin = Uint8Array.from(atob(d.cover), ch => ch.charCodeAt(0)); st.steamFile = new File([bin], "steam-cover.jpg", {type: d.coverType || "image/jpeg"}); got.push("постер"); } else st.steamFile = null;
        st.header = slHttp(d.header) || null; if (!d.cover && st.header) got.push("обложку");
        st.shots = (d.screenshots || []).filter(slHttp).slice(0, 10); if (st.shots.length) got.push("скриншоты");
        const mv = (d.movies || []).find(x => slHttp(x.mp4) || slHttp(x.webm)); st.trailer = mv ? {thumb: slHttp(mv.thumb) || null, mp4: slHttp(mv.mp4) || null, webm: slHttp(mv.webm) || null} : null; if (st.trailer) got.push("трейлер");
        prev();
        const coop = (d.categories || []).some(x => /кооп|co-?op|multi|нескольк|сетев/i.test(x));
        msg(`Подтянул: ${got.join(", ")}. ${coop ? "Осталось вписать, на сколько игроков." : "Steam не говорит, что это кооп, — проверь и впиши число игроков."}`, "ok");
        if (!q("#slfMax").value) q("#slfMax").focus();
      } catch(e){ msg(`Steam не отдал данные (${e.message || e}). Заполни вручную — поля ниже.`, "bad"); q("#slfMore").open = true; q("#slfTitle").focus(); }
      btn.disabled = false; btn.textContent = "Подтянуть";
    };
    q("#slfGo").onclick = fill;
    if (q("#slfPick")) q("#slfPick").onclick = () => slPicker(it => {
      q("#slfTitle").value = it.title || ""; st.dupOk = false; q("#slfDup").innerHTML = "";
      st.userFile = st.steamFile = null; st.cover = it.cover || null; st.header = null; st.shots = []; st.trailer = null; st.steamId = it.steamId ? String(it.steamId) : null;
      q("#slfUrl").value = st.steamId ? `https://store.steampowered.com/app/${st.steamId}/` : "";
      q("#slfDesc").value = it.desc || ""; q("#slfGen").value = String(it.genre || "").split(/[,;]+/).map(x => x.trim()).filter(Boolean).slice(0, 8).join(", ");
      const rel = it.releaseDate ? {d: it.releaseDate, prec: relPrec(it)} : it.release ? toISO(it.release) : null;
      q("#slfRel").value = rel ? (rel.prec === "day" ? parseD(rel.d).toLocaleDateString("ru-RU") : relLabel({releaseDate: rel.d, releasePrec: rel.prec})) : "";
      q("#slfTba").checked = !rel && isSoon(it); if (!rel && isSoon(it)) q("#slfMore").open = true;
      prev(); msg(`Взял «${it.title}» из ${isSoon(it) ? "твоих ожидаемых" : "твоей коллекции"}. Осталось вписать, на сколько игроков.`, "ok"); q("#slfMax").focus();
      // скриншоты из Steam — тихо, в фоне
      if (st.steamId){ const sid = st.steamId; SB.functions.invoke("steam", {body: {appid: sid}}).then(({data: d}) => { if (!d || d.error || st.steamId !== sid) return;
        st.shots = (d.screenshots || []).filter(slHttp).slice(0, 10); st.header = slHttp(d.header) || null; if (!q("#slfDesc").value && d.short) q("#slfDesc").value = d.short; }).catch(() => {}); }
    });
    q("#slfUrl").addEventListener("paste", () => setTimeout(() => { if (appId(q("#slfUrl").value)) fill(); }, 30));
    q("#slfUrl").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); fill(); } });
    s.el.addEventListener("input", () => { if (q("#slfMsg").classList.contains("bad")) msg(""); });
    ["#slfTitle", "#slfUrl"].forEach(k => q(k).addEventListener("input", () => { st.dupOk = false; q("#slfDup").innerHTML = ""; q("#slfSave").textContent = isNew ? "Добавить" : "Сохранить"; }));
    q("#slfSave").onclick = async () => {
      if (st.busy) return;
      const title = q("#slfTitle").value.trim().slice(0, 200);
      if (!title){ msg("Нужно название игры.", "bad"); q("#slfTitle").focus(); return; }
      const max = parseInt(q("#slfMax").value, 10), minRaw = q("#slfMin").value.trim(), min = minRaw ? parseInt(minRaw, 10) : 1;
      if (!(max >= 1 && max <= 100)){ msg("Впиши, до скольки игроков (от 1 до 100).", "bad"); q("#slfMax").focus(); return; }
      if (!(min >= 1 && min <= max)){ msg("«От» должно быть не меньше 1 и не больше «до».", "bad"); q("#slfMin").focus(); return; }
      const ftpRaw = q("#slfFtp").value.trim(), ftp = ftpRaw ? slHttp(/^https?:\/\//i.test(ftpRaw) ? ftpRaw : "https://" + ftpRaw) : "";
      if (ftpRaw && (!ftp || ftp.length > 500)){ msg("Ссылка на FreeTP выглядит странно — скопируй адрес страницы игры целиком.", "bad"); q("#slfFtp").focus(); return; }
      const urlId = appId(q("#slfUrl").value), steamId = urlId || (q("#slfUrl").value.trim() ? null : null);
      if (q("#slfUrl").value.trim() && !urlId){ msg("Ссылка на Steam не распознана. Очисти поле или вставь адрес страницы игры.", "bad"); q("#slfUrl").focus(); return; }
      const tba = q("#slfTba").checked, relRaw = q("#slfRel").value.trim(); let rel = null;
      if (!tba && relRaw){ rel = toISO(relRaw); if (!rel){ msg("Не понял дату. Примеры: 12.03.2027, март 2027, Q2 2027, 2027.", "bad"); q("#slfMore").open = true; q("#slfRel").focus(); return; } }
      // дубликаты: тот же Steam ID или похожее название
      if (!st.dupOk){ const nt = normT(title), dup = SL && SL.games.find(x => (!g || x.id !== g.id) && ((steamId && x.steam_id === steamId) || normT(x.title) === nt || (nt.length > 5 && (normT(x.title).includes(nt) || (normT(x.title).length > 5 && nt.includes(normT(x.title)))))));
        if (dup){ st.dupOk = true; q("#slfDup").innerHTML = `<div class="slp-dup">Похоже, такая игра уже есть: <b>${esc(dup.title)}</b> (${esc(slPl(dup))}, добавил ${esc(dup.user_id === ME.id ? "ты" : profOf(dup.user_id).nick || "кто-то")}). Если это другая игра — нажми кнопку ещё раз.</div>`; q("#slfSave").textContent = isNew ? "Всё равно добавить" : "Всё равно сохранить"; return; } }
      st.busy = true; const btn = q("#slfSave"); btn.disabled = true; btn.textContent = "Сохраняю…";
      try {
        let cover = st.cover; const f = st.userFile || st.steamFile, moved = st.img && st.pos && (Math.abs(st.pos.s - 1) > .004 || Math.abs(st.pos.x) > .002 || Math.abs(st.pos.y) > .002);
        let baked = null;
        if (moved){ try { const c2 = document.createElement("canvas"); c2.width = 600; c2.height = 900; slPaint(c2, st.img, {...st.pos}); baked = await new Promise(ok => c2.toBlob(ok, "image/jpeg", .9)); } catch(_){ baked = null; } }
        if (baked) cover = (await assets.upload(baked, {type: "image/jpeg"})).id;
        else if (f) cover = await upload(f);
        const row = {title, steam_id: steamId, freetp_url: ftp || null, cover: cover || null, header: slHttp(st.header) || null, descr: q("#slfDesc").value.trim().slice(0, 4000) || null,
          genres: slUniq(q("#slfGen").value.split(/[,;]+/).map(x => x.trim()).filter(Boolean)).slice(0, 12), screenshots: st.shots || [], trailer: st.trailer || null,
          min_players: min, max_players: max, release_date: rel ? rel.d : null, release_prec: rel ? rel.prec : "day", tba, updated_at: now()};
        let saved;
        if (isNew){ const r = await SB.from("slop_games").insert({...row, user_id: ME.id}).select().single(); if (r.error) throw r.error; saved = slNorm(r.data); if (SL) SL.games.unshift(saved); }
        else { const r = await SB.from("slop_games").update(row).eq("id", g.id).select().single(); if (r.error) throw r.error; saved = slNorm(r.data); if (SL) SL.games = SL.games.map(x => x.id === g.id ? saved : x); }
        s.close(); slRefresh();
        toast(isNew ? (slOut(saved) ? `${saved.title} — в библиотеке СЛОПа` : `${saved.title} — в календаре ожиданий`) : "Сохранено");
        if (isNew && route === "slop"){ const el = slOut(saved) ? document.querySelector(`.slp-t[data-sg="${saved.id}"]`) : document.querySelector(`.slp-w[data-sg="${saved.id}"]`); if (el) el.scrollIntoView({block: "center", behavior: slRM() ? "auto" : "smooth"}); }
      } catch(e){ st.busy = false; btn.disabled = false; btn.textContent = isNew ? "Добавить" : "Сохранить"; msg(e && e.code === "too_large" ? "Постер слишком тяжёлый — нужен до 20 МБ." : "Не сохранилось. Проверь интернет и попробуй ещё раз.", "bad"); }
    };
    setTimeout(() => { const u = q("#slfUrl"); if (u && isNew) u.focus(); }, 320);
  }

  // рисует постер в рамку 2:3: масштаб 1 — заполнить, меньше — картинка целиком на размытой подложке
  function slPaint(cv, im, pos){
    const W = cv.width, H = cv.height, c = cv.getContext("2d"), iw = im.naturalWidth, ih = im.naturalHeight, cov = Math.max(W / iw, H / ih), k = cov * pos.s, w = iw * k, h = ih * k;
    c.fillStyle = "#12141a"; c.fillRect(0, 0, W, H);
    if (w < W - .5 || h < H - .5){ c.save(); try { c.filter = `blur(${Math.round(W / 20)}px) brightness(.5) saturate(1.25)`; } catch(_){ /* ожидаемо: старый Safari без фильтров */ } const m = 1.2; c.drawImage(im, (W - iw * cov * m) / 2, (H - ih * cov * m) / 2, iw * cov * m, ih * cov * m); c.restore(); }
    const cl = (v, span, size) => size >= span ? Math.min(0, Math.max(span - size, v)) : Math.min(span - size, Math.max(0, v));
    const x = cl((W - w) / 2 + pos.x * W, W, w), y = cl((H - h) / 2 + pos.y * H, H, h);
    c.imageSmoothingQuality = "high"; c.drawImage(im, x, y, w, h);
    return {x: (x - (W - w) / 2) / W, y: (y - (H - h) / 2) / H};
  }

  // ---- выбор игры из своей полки: по названию или по обложке ----
  function slPicker(apply){
    const games = MYITEMS.filter(it => isGame(it) && it.title), n = {lib: games.filter(it => !isSoon(it)).length, soon: games.filter(isSoon).length};
    let tab = n.lib ? "lib" : "soon", list = [];
    const s = openSheet(`<div class="sh-grab"></div><h3>Из моей коллекции</h3><p class="sub">Найди по названию или просто ткни в обложку — поля заполнятся сами.</p>
      <div class="slp-pk-bar"><div class="slp-tabs" id="slpkT"></div><label class="slp-q">${SLI.search}<input id="slpkQ" type="search" placeholder="Название игры" autocomplete="off" spellcheck="false" aria-label="Поиск по названию"></label></div>
      <div class="slp-pk" id="slpkG"></div>`, {wide: true});
    s.el.classList.add("slp-sheet");
    const q = x => s.el.querySelector(x);
    const inSlop = it => { const nt = normT(it.title); return !!(SL && SL.games.some(g => (it.steamId && g.steam_id === String(it.steamId)) || normT(g.title) === nt)); };
    const draw = () => {
      q("#slpkT").innerHTML = [["lib", "Коллекция"], ["soon", "Жду"]].map(([k, l]) => `<button class="slp-tab" type="button" data-pkt="${k}" aria-pressed="${tab === k}">${l}<i>${n[k]}</i></button>`).join("");
      const v = normT(q("#slpkQ").value).trim();
      list = games.filter(it => tab === "soon" ? isSoon(it) : !isSoon(it)).filter(it => !v || [it.title, it.originalTitle].some(t => t && normT(t).includes(v))).sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""))).slice(0, 300);
      q("#slpkG").innerHTML = list.length ? list.map((it, i) => { const dup = inSlop(it);
        return `<button class="slp-pk-i" type="button" data-pk="${i}" ${dup ? "disabled" : ""} title="${esc(it.title)}"><span class="slp-p">${it.cover ? `<img alt="" loading="lazy" decoding="async" src="${esc(publicUrl(it.cover))}" style="${posStyle(it.coverPos)}" onerror="this.remove()">` : `<span class="slp-ph">${esc(it.title)}</span>`}</span><b>${esc(it.title)}</b><small>${dup ? "уже в СЛОПе" : isSoon(it) ? (it.releaseDate ? esc(relLabel(it)) : "скоро") : esc(genres(it).slice(0, 2).join(", "))}</small></button>`; }).join("")
        : `<div class="slp-empty" style="grid-column:1/-1"><b>${v ? "Ничего не нашлось" : tab === "soon" ? "Ты пока ничего не ждёшь" : "В коллекции пока пусто"}</b>${v ? "Попробуй другое название или вторую вкладку." : "Добавь игру по ссылке из Steam."}</div>`;
    };
    q("#slpkQ").addEventListener("input", draw);
    q("#slpkQ").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); const b = q(".slp-pk-i:not([disabled])"); if (b) b.click(); } });
    s.el.addEventListener("click", e => { const t = e.target.closest("[data-pkt]"), b = e.target.closest("[data-pk]");
      if (t){ tab = t.dataset.pkt; draw(); return; }
      if (b && !b.disabled){ const it = list[+b.dataset.pk]; if (!it) return; try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ } s.close(); apply(it); } });
    draw(); setTimeout(() => q("#slpkQ").focus(), 320);
  }

  // ================= СЛОП 4.7: планы на игру, общий тир-лист, голосование, «в мою библиотеку» =================
  const SL_TIERS = [["Имба", "#ff5f57"], ["Пойдёт", "#ff9f0a"], ["Еле прошли", "#ffd60a"], ["Кал", "#b08a5a"], ["Дропнули", "#8e8e93"]];
  SLI.cal = I('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>');
  SLI.tiers = I('<path d="M4 6h16M4 12h11M4 18h6"/>', 'stroke-width="2.6"');
  SLI.vote = I('<path d="M4 20h16M7 20v-7M12 20V5M17 20v-10"/>', 'stroke-width="2.6"');
  let slCal = null, slTl = null, slLibPick = null, slPollId = null, slPollTm = 0;
  const slPollSeen = new Set();
  const slTier = id => SL.tiers.find(t => t.game_id === id);
  const slDropped = g => { const t = slTier(g.id); return t ? t.tier === 4 : slBadge(g) === "dropped"; };
  const slGoing = pid => SL.pmembers.filter(m => m.plan_id === pid).map(m => m.user_id);
  const slDayL = d => parseD(d).toLocaleDateString("ru-RU", {weekday: "short", day: "numeric", month: "short"}).replace(/\./g, "");
  const slEveryone = () => FR ? FR.profiles.map(p => p.user_id) : [];
  const slInMyLib = g => { const nt = normT(g.title); return MYITEMS.some(it => isGame(it) && ((g.steam_id && String(it.steamId || "") === g.steam_id) || normT(it.title) === nt)); };
  function slRefresh2(){
    if (slCal) slCalDraw(); if (slTl) slTlDraw(); if (slPollId) slPollDraw();
    const ap = SL && SL.polls.find(p => Date.parse(p.ends_at) > Date.now());
    if (ap && !slPollSeen.has(ap.id)){ slPollSeen.add(ap.id);
      if (ap.user_id === ME.id || route === "slop") slPollShow(ap.id); else toast(`${frNick(ap.user_id)} запустил голосование в СЛОПе — минута на выбор`); }
  }
  function slNtf(k, id){
    const run = () => { if (!SL){ loadSlop().then(() => { if (SL) run(); }); return; }
      if (k === "slopplan"){ const p = SL.plans.find(x => x.id === id); slCalendar(p ? {day: p.day} : {}); }
      else { const p = SL.polls.find(x => x.id === id); if (p){ slPollSeen.add(p.id); slPollShow(p.id); } else toast("Это голосование уже закончилось"); } };
    if (route !== "slop"){ go("slop"); setTimeout(run, 400); } else run();
  }

  // ---- ближайшие катки на странице ----
  function slDrawUp(){
    const el = $("slUp"); if (!el || !SL) return; const td = today();
    const up = SL.plans.filter(p => p.day >= td && slGame(p.game_id)).sort((a, b) => (a.day + (a.at_time || "99")).localeCompare(b.day + (b.at_time || "99"))).slice(0, 4);
    el.innerHTML = up.length ? `<span class="slp-n-l">Ближайшие катки:</span>` + up.map(p => { const g = slGame(p.game_id), n = slGoing(p.id).length, u = slImg(g);
      return `<button class="slp-upc" type="button" data-sl-day="${esc(p.day)}">${u ? `<img alt="" src="${esc(u)}" loading="lazy">` : ""}<span><b>${esc(g.title)}</b><small>${esc(p.day === td ? "сегодня" : p.day === addDays(td, 1) ? "завтра" : slDayL(p.day))}${p.at_time ? " · " + esc(p.at_time) : ""} · идут: ${n}</small></span></button>`; }).join("") : "";
  }

  // ---- мини-календарь каток ----
  function slCalendar(o = {}){
    if (!SL || !ME) return; const day = o.day || today();
    if (slCal){ Object.assign(slCal, {day, ym: day.slice(0, 7), form: !!o.form, gameId: o.gameId || slCal.gameId, fresh: !!o.gameId}); slCalDraw(); return; }
    const s = openSheet(`<div class="sh-grab"></div><div id="slCalB"></div>`, {onClose: () => { slCal = null; }});
    s.el.classList.add("slp-sheet", "slcal-sheet");
    slCal = {s, day, ym: day.slice(0, 7), form: !!o.form, gameId: o.gameId || null};
    s.el.addEventListener("click", slCalClick);
    slCalDraw();
  }
  function slCalDraw(){
    const c = slCal; if (!c || !SL) return; const box = c.s.el.querySelector("#slCalB"); if (!box) return;
    const keep = {}; box.querySelectorAll("select[id],input[id]").forEach(i => { keep[i.id] = i.value; });
    const [y, m] = c.ym.split("-").map(Number), lead = (new Date(y, m - 1, 1).getDay() + 6) % 7, dim = new Date(y, m, 0).getDate(), td = today();
    const by = {}; SL.plans.forEach(p => { if (slGame(p.game_id)) (by[p.day] = by[p.day] || []).push(p); });
    Object.values(by).forEach(a => a.sort((x, z) => String(x.at_time || "99").localeCompare(String(z.at_time || "99"))));
    let cells = '<span class="slcal-d off"></span>'.repeat(lead);
    for (let d = 1; d <= dim; d++){ const k = `${y}-${pad(m)}-${pad(d)}`, ps = by[k] || [], g = ps[0] && slGame(ps[0].game_id), u = g && slImg(g);
      cells += `<button type="button" class="slcal-d${k === td ? " today" : ""}${k === c.day ? " sel" : ""}${ps.length ? " has" : ""}${k < td ? " past" : ""}" data-cd="${k}" aria-label="${d}${ps.length ? ", запланировано игр: " + ps.length : ""}" title="${ps.map(p => slGame(p.game_id).title).join(", ").replace(/"/g, "&quot;")}">${u ? `<img alt="" src="${esc(u)}" loading="lazy">` : ""}<b>${d}</b>${ps.length > 1 ? `<em>+${ps.length - 1}</em>` : ""}</button>`; }
    const dps = by[c.day] || [];
    const plan = p => { const g = slGame(p.game_id), gg = slGoing(p.id), me = gg.includes(ME.id), own = p.user_id === ME.id;
      return `<article class="slcal-p"><button type="button" class="slcal-pp" data-cgo="${esc(g.id)}" title="Открыть карточку игры"><span class="slp-p">${slPosterIn(g)}</span></button><div class="slcal-pb"><b>${esc(g.title)}</b><small>${p.at_time ? esc(p.at_time) + " · " : ""}${esc(slPl(g))} · зовёт ${esc(own ? "ты" : profOf(p.user_id).nick || "кто-то")}</small>${p.note ? `<q>${esc(p.note)}</q>` : ""}
        <div class="slcal-go">${gg.length ? gg.map(u => `<span class="slp-pp">${avaHTML(profOf(u), "sm")}${esc(u === ME.id ? "Ты" : profOf(u).nick || "?")}</span>`).join("") : `<em>Пока никто не отметился</em>`}</div>
        <div class="slcal-pa"><button type="button" class="slp-wait${me ? " on" : ""}" data-cjoin="${esc(p.id)}" aria-pressed="${me}">${me ? SLI.check : SLI.plus} Я буду</button>${own ? `<button type="button" class="slp-btn sm red" data-cdel="${esc(p.id)}">Отменить катку</button>` : ""}</div></div></article>`; };
    const games = [...SL.games].sort((a, b) => (slOut(b) - slOut(a)) || a.title.localeCompare(b.title, "ru"));
    const form = `<div class="slcal-f"><label class="f">Во что играем<select class="in" id="slcG">${games.map(g => `<option value="${esc(g.id)}"${g.id === c.gameId ? " selected" : ""}>${esc(g.title)}${slOut(g) ? "" : " (ещё не вышла)"}</option>`).join("")}</select></label>
      <div class="row2"><label class="f">Во сколько<input class="in" type="time" id="slcT"></label><label class="f">Заметка<input class="in" id="slcN" maxlength="200" placeholder="Сбор в дискорде" autocomplete="off"></label></div>
      <div class="slp-f-act"><button type="button" class="ib blue" data-csave="1">Запланировать и позвать всех</button><button type="button" class="ib" data-cno="1">Отмена</button></div></div>`;
    box.innerHTML = `<div class="slcal-h"><button type="button" class="slp-btn sm" data-cm="-1" aria-label="Предыдущий месяц">‹</button><h3>${MONTHS_NOM[m - 1]} ${y}</h3><button type="button" class="slp-btn sm" data-cm="1" aria-label="Следующий месяц">›</button></div>
      <div class="slcal-w">${["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map(x => `<span>${x}</span>`).join("")}</div><div class="slcal-g">${cells}</div>
      <div class="slcal-day"><h4>${parseD(c.day).toLocaleDateString("ru-RU", {day: "numeric", month: "long", weekday: "long"})}</h4>
        ${dps.length ? dps.map(plan).join("") : `<p class="sub" style="margin:0 0 12px">На этот день ничего не запланировано.</p>`}
        ${c.day < td ? "" : !games.length ? `<p class="sub" style="margin:0">Сначала добавь в СЛОП хотя бы одну игру.</p>` : c.form ? form : `<button type="button" class="slp-btn pri" data-cnew="1" style="width:100%">${SLI.plus} Запланировать игру на этот день</button>`}</div>`;
    Object.entries(keep).forEach(([id, v]) => { const i = box.querySelector("#" + id); if (i && v && !(id === "slcG" && c.fresh)) i.value = v; }); c.fresh = false;
  }
  async function slCalClick(e){
    const c = slCal; if (!c) return; const q = s => e.target.closest(s); let b;
    if ((b = q("[data-cm]"))){ const [y, m] = c.ym.split("-").map(Number), d = new Date(y, m - 1 + +b.dataset.cm, 1); c.ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; slCalDraw(); return; }
    if ((b = q("[data-cd]"))){ c.day = b.dataset.cd; c.form = false; slCalDraw(); return; }
    if (q("[data-cnew]")){ c.form = true; slCalDraw(); return; }
    if (q("[data-cno]")){ c.form = false; slCalDraw(); return; }
    if ((b = q("[data-cgo]"))){ const id = b.dataset.cgo; c.s.close(); if (route === "slop") setTimeout(() => slOpenCard(id), 120); else { slPending = id; go("slop"); } return; }
    if ((b = q("[data-cjoin]"))){ const pid = b.dataset.cjoin, on = !slGoing(pid).includes(ME.id);
      SL.pmembers = SL.pmembers.filter(m => !(m.plan_id === pid && m.user_id === ME.id)); if (on) SL.pmembers.push({plan_id: pid, user_id: ME.id});
      try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ } slRefresh(); slPop(c.s.el.querySelector(`[data-cjoin="${pid}"]`));
      const r = on ? await SB.from("slop_plan_members").upsert({plan_id: pid, user_id: ME.id}, {onConflict: "plan_id,user_id", ignoreDuplicates: true}) : await SB.from("slop_plan_members").delete().eq("plan_id", pid).eq("user_id", ME.id);
      if (r.error){ toast("Не сохранилось"); loadSlop(); } return; }
    if ((b = q("[data-cdel]"))){ const pid = b.dataset.cdel; if (!b.dataset.sure){ b.dataset.sure = "1"; b.textContent = "Точно? Нажми ещё раз"; return; }
      SL.plans = SL.plans.filter(p => p.id !== pid); slRefresh(); const {error} = await SB.from("slop_plans").delete().eq("id", pid); if (error){ toast("Не удалилось"); loadSlop(); } else toast("Катка отменена"); return; }
    if ((b = q("[data-csave]"))){ const box = c.s.el, gid = box.querySelector("#slcG").value, g = slGame(gid); if (!g) return;
      const tm = box.querySelector("#slcT").value || null, note = box.querySelector("#slcN").value.trim().slice(0, 200) || null, day = c.day;
      b.disabled = true; b.textContent = "Сохраняю…";
      const {data, error} = await SB.from("slop_plans").insert({game_id: gid, user_id: ME.id, day, at_time: tm && /^\d{2}:\d{2}/.test(tm) ? tm.slice(0, 5) : null, note}).select().single();
      if (error || !data){ toast("Не сохранилось, попробуй ещё раз"); b.disabled = false; b.textContent = "Запланировать и позвать всех"; return; }
      SL.plans.push(data); SL.pmembers.push({plan_id: data.id, user_id: ME.id});
      SB.from("slop_plan_members").upsert({plan_id: data.id, user_id: ME.id}, {onConflict: "plan_id,user_id", ignoreDuplicates: true}).then(() => {});
      notify(slEveryone(), "slop_plan", "slopplan:" + data.id, `${g.title} — ${slDayL(day)}${data.at_time ? ", " + data.at_time : ""}`);
      c.form = false; c.gameId = null; slRefresh(); toast("Запланировано — всем ушло уведомление"); }
  }

  // ---- общий тир-лист пройденного: один на всех ----
  async function slSetTier(id, tier, pos){
    const cur = slTier(id); SL.tiers = SL.tiers.filter(t => t.game_id !== id);
    if (tier != null){ if (pos == null){ const a = SL.tiers.filter(t => t.tier === tier).map(t => t.pos); pos = a.length ? Math.max(...a) + 1 : 0; }
      SL.tiers.push({game_id: id, tier, pos, updated_by: ME.id, updated_at: now()}); }
    else if (!cur) return;
    slRefresh();
    const r = tier == null ? await SB.from("slop_tiers").delete().eq("game_id", id) : await SB.from("slop_tiers").upsert({game_id: id, tier, pos, updated_by: ME.id, updated_at: now()}, {onConflict: "game_id"});
    if (r.error){ toast("Тир не сохранился"); loadSlop(); }
  }
  function slTierSheet(){
    if (!SL || !ME || slTl) return;
    const s = openSheet(`<div class="sh-grab"></div><h3>Тир-лист пройденного</h3><p class="sub">Один на всех. Перетаскивай постеры между тирами — двигать может любой.</p><div class="sltl" id="slTlB"></div>`, {wide: true, onClose: () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); if (slTl && slTl.dr && slTl.dr.g) slTl.dr.g.remove(); slTl = null; }});
    s.el.classList.add("slp-sheet", "sltl-sheet"); slTl = {s, dr: null};
    s.el.addEventListener("pointerdown", e => { const it = e.target.closest(".sltl-i"); if (!it || e.button) return; e.preventDefault(); slTl.dr = {it, x: e.clientX, y: e.clientY, on: false, g: null}; });
    const mv = e => { const d = slTl && slTl.dr; if (!d) return;
      if (!d.on){ if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return; d.on = true; d.g = d.it.cloneNode(true); d.g.classList.add("ghost"); document.body.appendChild(d.g); d.it.classList.add("lift"); }
      d.g.style.left = e.clientX + "px"; d.g.style.top = e.clientY + "px";
      s.el.querySelectorAll(".sltl-z.over").forEach(z => z.classList.remove("over")); const el = document.elementFromPoint(e.clientX, e.clientY), z = el && el.closest && el.closest(".sltl-z"); if (z) z.classList.add("over"); };
    const up = e => { const d = slTl && slTl.dr; if (!d) return; slTl.dr = null; s.el.querySelectorAll(".sltl-z.over").forEach(z => z.classList.remove("over"));
      if (!d.on) return; d.g.remove(); d.it.classList.remove("lift");
      const el = document.elementFromPoint(e.clientX, e.clientY), z = el && el.closest && el.closest(".sltl-z"); if (!z){ slTlDraw(); return; }
      const id = d.it.dataset.tg; if (z.dataset.tz === "pool"){ slSetTier(id, null); try { SND.tick(.7); } catch(_){ /* ожидаемо: звук недоступен */ } return; }
      const tier = +z.dataset.tz, dest = SL.tiers.filter(t => t.tier === tier && t.game_id !== id && slGame(t.game_id)).sort((a, b) => a.pos - b.pos);
      const before = el.closest(".sltl-i"), bi = before && before.dataset.tg !== id ? dest.findIndex(t => t.game_id === before.dataset.tg) : -1;
      const i = bi >= 0 ? bi : dest.length, pv = dest[i - 1], nx = dest[i], pos = !pv && !nx ? 0 : !pv ? nx.pos - 1 : !nx ? pv.pos + 1 : (pv.pos + nx.pos) / 2;
      try { SND.tick(.7); } catch(_){ /* ожидаемо: звук недоступен */ } slSetTier(id, tier, pos); };
    addEventListener("pointermove", mv); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    slTlDraw();
  }
  function slTlDraw(){
    if (!slTl || slTl.dr || !SL) return; const b = slTl.s.el.querySelector("#slTlB"); if (!b) return;
    const it = g => `<span class="sltl-i" data-tg="${esc(g.id)}" title="${esc(g.title)}"><span class="slp-p">${slPosterIn(g)}</span></span>`;
    const tiered = SL.tiers.filter(t => slGame(t.game_id)), pool = SL.games.filter(g => slOut(g) && !slTier(g.id) && slStats(g.id).some(s => s.status !== "playing"));
    const last = [...tiered].sort((a, c) => String(c.updated_at).localeCompare(String(a.updated_at)))[0];
    b.innerHTML = SL_TIERS.map(([n, c], i) => `<div class="sltl-r"><div class="sltl-l" style="--c:${c}"><b>${i + 1}</b><span>${n}</span></div><div class="sltl-z" data-tz="${i}">${tiered.filter(t => t.tier === i).sort((a, c2) => a.pos - c2.pos).map(t => it(slGame(t.game_id))).join("")}</div></div>`).join("")
      + `<div class="sltl-pool"><div class="sltl-ph"><b>Ещё не оценили</b><small>сюда попадают игры, которые кто-то прошёл или дропнул</small></div><div class="sltl-z" data-tz="pool">${pool.length ? pool.map(it).join("") : `<em>${tiered.length ? "Всё пройденное уже расставлено." : "Пока пусто: отметь в карточке игры «Прошли» или «Дропнули» — и она появится здесь."}</em>`}</div></div>`
      + (last ? `<p class="sub sltl-last">Последним двигал ${esc(last.updated_by === ME.id ? "ты" : profOf(last.updated_by).nick || "кто-то")} · ${esc(slAgo(last.updated_at))}</p>` : "");
  }

  // ---- блок в карточке: запланировать, в мою библиотеку, тир ----
  function slCardExtra(g, out){
    const mine = slInMyLib(g), td = today(), nx = SL.plans.filter(p => p.game_id === g.id && p.day >= td).sort((a, b) => a.day.localeCompare(b.day))[0];
    return `<div class="slp-c-more"><button class="slp-btn sm" type="button" data-sl="plan">${SLI.cal} ${nx ? `Играем ${esc(nx.day === td ? "сегодня" : slDayL(nx.day))}${nx.at_time ? " в " + esc(nx.at_time) : ""}` : "Запланировать катку"}</button>
      ${!out ? "" : mine ? `<span class="slp-btn sm ok">${SLI.check} В твоей библиотеке</span>` : `<button class="slp-btn sm" type="button" data-sl="tolib" aria-expanded="${slLibPick === g.id}">${SLI.plus} В мою библиотеку</button>`}
      ${out && !mine && slLibPick === g.id ? `<div class="slp-libp"><span>В какой статус?</span>${[["playing", "Играю"], ["done", "Пройдено"], ["old", "Играл давно"], ["dropped", "Дроп"], ["future", "Список желаемого"]].map(([k, l]) => `<button class="slp-st" type="button" data-sl-lib="${k}">${l}</button>`).join("")}</div>` : ""}</div>`;
  }
  function slCardTier(g){
    const cur = slTier(g.id);
    return `<section class="slp-blk"><h3>${SLI.tiers}Общий тир-лист</h3><div class="slp-seg">${SL_TIERS.map(([n, c], i) => `<button class="slp-st sltr${cur && cur.tier === i ? " on" : ""}" type="button" style="--tc:${c}" data-sl-tier="${i}" aria-pressed="${!!(cur && cur.tier === i)}">${n}</button>`).join("")}<button class="slp-btn sm" type="button" data-sl="tiers">Весь тир-лист</button></div>${cur ? `<small class="slp-tby">поставил ${esc(cur.updated_by === ME.id ? "ты" : profOf(cur.updated_by).nick || "кто-то")} · нажми на тир ещё раз, чтобы убрать</small>` : `<small class="slp-tby">Один тир-лист на всех — ставить и менять может любой.</small>`}</section>`;
  }
  async function slToLib(id, mode){
    const g = slGame(id); if (!g) return; slLibPick = null;
    const it = {type: "game", title: g.title, uid: g.user_id, status: "done", genre: g.genres.join(", ") || null, desc: g.descr || null, steamId: g.steam_id || null, cover: g.cover && !/^https?:/i.test(g.cover) ? g.cover : null};
    await takeFromFriend(it, mode, null); if (slOpenId === id) slDrawCard(true);
  }

  // ---- «Не можем выбрать»: рулетка или голосование ----
  function slChoose(){
    if (!SL) return; const ap = SL.polls.find(p => Date.parse(p.ends_at) > Date.now());
    if (ap){ slPollShow(ap.id); return; }
    const s = openSheet(`<div class="sh-grab"></div><h3>Не можете выбрать?</h3><p class="sub">Пусть решит случай или большинство.</p>
      <div class="slp-ch"><button type="button" class="slp-chb" data-ch="roul">${SLI.dice}<b>Рулетка</b><small>Крутим постеры — на чём остановится, в то и играем</small></button>
        <button type="button" class="slp-chb" data-ch="poll">${SLI.vote}<b>Голосование</b><small>Минута на голоса, все видят, кто за что. Побеждает большинство</small></button></div>`);
    s.el.classList.add("slp-sheet");
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-ch]"); if (!b) return; s.close(); setTimeout(() => b.dataset.ch === "roul" ? slRoulette() : slPollSetup(), 160); });
  }
  function slPollSetup(){
    const pool = slLib().filter(g => !slDropped(g));
    if (pool.length < 2){ toast("Для голосования нужно хотя бы две игры под текущие фильтры"); return; }
    const pick = new Set([...pool].sort((a, b) => slWant(b).length - slWant(a).length).slice(0, 6).map(g => g.id));
    const s = openSheet(`<div class="sh-grab"></div><h3>Голосование</h3><p class="sub">Отметь от 2 до 12 игр. У всех будет минута, чтобы проголосовать.</p><div class="slp-pk" id="slpoG"></div>
      <div class="slp-f-act" style="margin-top:14px"><button type="button" class="ib blue" id="slpoGo"></button></div>`, {wide: true});
    s.el.classList.add("slp-sheet");
    const q = x => s.el.querySelector(x);
    const draw = () => { q("#slpoG").innerHTML = pool.map(g => `<button class="slp-pk-i${pick.has(g.id) ? " on" : ""}" type="button" data-po="${esc(g.id)}" aria-pressed="${pick.has(g.id)}" title="${esc(g.title)}"><span class="slp-p">${slPosterIn(g)}</span><b>${esc(g.title)}</b><small>${esc(slPl(g))}</small></button>`).join("");
      const b = q("#slpoGo"); b.disabled = pick.size < 2 || pick.size > 12; b.textContent = pick.size < 2 ? "Выбери хотя бы две игры" : pick.size > 12 ? "Не больше 12 игр" : `Запустить на минуту · игр: ${pick.size}`; };
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-po]"); if (!b) return; const id = b.dataset.po; pick.has(id) ? pick.delete(id) : pick.add(id); const y = q("#slpoG").scrollTop; draw(); q("#slpoG").scrollTop = y; });
    q("#slpoGo").onclick = async () => { const b = q("#slpoGo"); b.disabled = true; b.textContent = "Запускаю…";
      const {data, error} = await SB.from("slop_polls").insert({user_id: ME.id, game_ids: [...pick], ends_at: new Date(Date.now() + 62000).toISOString()}).select().single();
      if (error || !data){ toast("Не запустилось, попробуй ещё раз"); draw(); return; }
      SL.polls.unshift(data); slPollSeen.add(data.id); s.close();
      notify(slEveryone(), "slop_poll", "sloppoll:" + data.id, "Минута на выбор, во что играем");
      setTimeout(() => slPollShow(data.id), 200); };
    draw();
  }
  const slPollTally = p => { const ids = p.game_ids.filter(slGame), vs = SL.pvotes.filter(v => v.poll_id === p.id && ids.includes(v.game_id)), cnt = id => vs.filter(v => v.game_id === id).length;
    const max = Math.max(0, ...ids.map(cnt)), top = ids.filter(id => cnt(id) === max).sort(); let h = 0; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return {ids, vs, cnt, max, tie: top.length > 1, win: top.length ? top[h % top.length] : null}; };
  function slPollClose(){ const el = $("slPoll"); clearInterval(slPollTm); slPollId = null; if (!el || el.hidden) return; el.hidden = true; el.innerHTML = ""; if (!slOpenId) document.body.classList.remove("slp-open"); }
  function slPollShow(id){
    const p = SL && SL.polls.find(x => x.id === id); if (!p) return;
    slCloseRoulette(); let el = $("slPoll");
    if (!el){ el = document.createElement("div"); el.id = "slPoll"; el.className = "slp-rl slp-poll"; document.body.appendChild(el);
      el.addEventListener("click", async e => { const q = s => e.target.closest(s), pid = slPollId; let b;
        if ((b = q("[data-pv]")) && pid){ const pp = SL.polls.find(x => x.id === pid); if (!pp || Date.parse(pp.ends_at) <= Date.now()) return; const gid = b.dataset.pv;
          SL.pvotes = SL.pvotes.filter(v => !(v.poll_id === pid && v.user_id === ME.id)); SL.pvotes.push({poll_id: pid, user_id: ME.id, game_id: gid}); try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ } slPollDraw();
          const {error} = await SB.from("slop_poll_votes").upsert({poll_id: pid, user_id: ME.id, game_id: gid, created_at: now()}, {onConflict: "poll_id,user_id"}); if (error) toast("Голос не засчитался, нажми ещё раз"); return; }
        if (!(b = q("[data-pl]"))) return; const a = b.dataset.pl, gid = b.dataset.id;
        if (a === "close") slPollClose(); else if (a === "open"){ slPollClose(); slOpenCard(gid); } else if (a === "plan"){ slPollClose(); slCalendar({gameId: gid, form: true}); } }); }
    clearInterval(slPollTm); slPollId = id; el.hidden = false; document.body.classList.add("slp-open");
    const live = Date.parse(p.ends_at) > Date.now();
    el.innerHTML = `<div class="slp-rl-bg"></div><div class="slp-rl-b slp-po" role="dialog" aria-modal="true" aria-label="Голосование"><button class="slp-btn sm slp-rl-x" type="button" data-pl="close" aria-label="Закрыть">${SLI.x}</button>
      <h3 id="slpoH">Во что играем?</h3><p id="slpoS"></p><div class="slp-po-t"><i id="slpoBar"></i></div><div class="slp-po-g" id="slpoGrid"></div><div class="slp-rl-res" id="slpoRes" aria-live="polite"></div></div>`;
    el.dataset.fin = live ? "" : "1"; slPollDraw();
    if (!live){ slPollFinish(p, true); return; }
    let lastS = -1;
    slPollTm = setInterval(() => { if (slPollId !== id){ clearInterval(slPollTm); return; }
      const left = Date.parse(p.ends_at) - Date.now(), sec = Math.max(0, Math.ceil(left / 1000)), bar = $("slpoBar"), sub = $("slpoS"); if (!bar || !sub) return;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, left / 60000))})`; bar.classList.toggle("hot", sec <= 10);
      sub.innerHTML = `Запустил ${esc(p.user_id === ME.id ? "ты" : profOf(p.user_id).nick || "кто-то")} · осталось <b>${sec}</b> сек · жми на игру, голос можно менять`;
      if (sec !== lastS){ lastS = sec; if (sec <= 5 && sec > 0) try { SND.tick(1); } catch(_){ /* ожидаемо: звук недоступен */ } }
      if (left <= 0){ clearInterval(slPollTm); slPollFinish(p, false); } }, 200);
  }
  function slPollDraw(){
    const p = SL && SL.polls.find(x => x.id === slPollId), grid = $("slpoGrid"); if (!p || !grid) return;
    const t = slPollTally(p), my = t.vs.find(v => v.user_id === ME.id), fin = $("slPoll").dataset.fin === "1";
    grid.innerHTML = t.ids.map(id => { const g = slGame(id), who = t.vs.filter(v => v.game_id === id).map(v => v.user_id), n = who.length;
      return `<button type="button" class="slp-po-i${my && my.game_id === id ? " mine" : ""}${fin && t.win === id ? " win" : ""}" data-pv="${esc(id)}" ${fin ? "disabled" : ""} aria-pressed="${!!(my && my.game_id === id)}"><span class="slp-p">${slPosterIn(g).replace('loading="lazy" ', "")}<i class="slp-po-n${n ? " on" : ""}">${n}</i></span><b>${esc(g.title)}</b><span class="slp-po-w">${n ? slAvs(who, 6) : `<small>${esc(slPl(g))}</small>`}</span></button>`; }).join("");
    grid.classList.toggle("fin", fin);
  }
  function slPollFinish(p, quiet){
    const el = $("slPoll"); if (!el || slPollId !== p.id) return; el.dataset.fin = "1";
    const t = slPollTally(p), g = t.win && slGame(t.win), bar = $("slpoBar"), sub = $("slpoS"), h = $("slpoH"), res = $("slpoRes"); if (bar) bar.style.transform = "scaleX(0)";
    slPollDraw();
    if (!g){ if (h) h.textContent = "Голосование закончилось"; if (sub) sub.textContent = "Игры из этого голосования уже удалены."; return; }
    if (h) h.textContent = "Играем!"; if (sub) sub.textContent = !t.vs.length ? "Никто не проголосовал — выбрал случай." : t.tie ? `Ничья по голосам (${t.max}) — решил жребий.` : `Голосов: ${t.max} из ${t.vs.length}.`;
    if (res) res.innerHTML = `<b>${esc(g.title)}</b><small>${esc(slPl(g))}</small><div><button class="slp-btn pri" type="button" data-pl="open" data-id="${esc(g.id)}">Открыть карточку</button><button class="slp-btn" type="button" data-pl="plan" data-id="${esc(g.id)}">${SLI.cal} Запланировать</button><button class="slp-btn" type="button" data-pl="close">Закрыть</button></div>`;
    const w = el.querySelector(".slp-po-i.win"); if (w && !slRM()) w.scrollIntoView({block: "nearest", behavior: "smooth"});
    if (!quiet){ slFanfare(); slConfetti(); }
  }
  function slFanfare(){
    try { if (!SND.on) return; const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const c = slFanfare.c || (slFanfare.c = new A()); if (c.state === "suspended") c.resume(); const t0 = c.currentTime + .02;
      [[523.25, 0, .16], [659.25, .14, .16], [783.99, .28, .16], [1046.5, .42, .7], [783.99, .42, .7], [659.25, .42, .7], [1318.5, .62, .7]].forEach(([f, d, l]) => { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t0 + d); g.gain.exponentialRampToValueAtTime(.13, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + l); o.connect(g).connect(c.destination); o.start(t0 + d); o.stop(t0 + d + l + .05); });
    } catch(_){ /* ожидаемо: браузер не дал включить звук */ }
  }
  function slConfetti(){
    if (slRM() || !document.body.animate) return; const box = document.createElement("div"); box.className = "slp-conf"; document.body.appendChild(box);
    const cols = ["#b8ff3d", "#4dffc3", "#ff5f57", "#ffd60a", "#0a84ff", "#ff7ad9", "#fff"];
    for (let i = 0; i < 90; i++){ const s = document.createElement("i"), x = Math.random() * 100, dx = (Math.random() - .5) * 260, r = (Math.random() - .5) * 1400, d = 1700 + Math.random() * 1500;
      s.style.cssText = `left:${x}%;background:${cols[i % cols.length]};width:${6 + Math.random() * 7}px;height:${9 + Math.random() * 9}px;border-radius:${Math.random() < .3 ? "50%" : "2px"}`; box.appendChild(s);
      s.animate([{transform: "translate(0,-20px) rotate(0)", opacity: 1}, {transform: `translate(${dx}px,${innerHeight + 40}px) rotate(${r}deg)`, opacity: .9}], {duration: d, delay: Math.random() * 500, easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards"}); }
    setTimeout(() => box.remove(), 4200);
  }

  // ---- рулетка: «Не можем выбрать» ----
  function slCloseRoulette(){ const el = $("slRl"); if (!el || el.hidden) return; el.hidden = true; el.innerHTML = ""; cancelAnimationFrame(slRoulette.raf); if (!slOpenId) document.body.classList.remove("slp-open"); }
  function slRoulette(){
    if (!SL) return; const pool = slLib();
    if (!pool.length){ toast("Не из чего выбирать — под эти фильтры игр нет"); return; }
    if (pool.length === 1){ toast("Тут всего одна игра — в неё и играйте"); slOpenCard(pool[0].id, document.querySelector(`.slp-t[data-sg="${pool[0].id}"] .slp-p`)); return; }
    let el = $("slRl"); if (!el){ el = document.createElement("div"); el.id = "slRl"; el.className = "slp-rl"; document.body.appendChild(el);
      el.addEventListener("click", e => { const b = e.target.closest("[data-rl]"); if (!b) return; const a = b.dataset.rl;
        if (a === "close") slCloseRoulette(); else if (a === "again"){ slCloseRoulette(); slRoulette(); } else if (a === "open"){ const id = b.dataset.id; slCloseRoulette(); slOpenCard(id); } }); }
    const N = 38, rnd = () => pool[Math.floor(Math.random() * pool.length)], win = rnd(), seq = [];
    for (let i = 0; i < N + 5; i++){ let g = i === N ? win : rnd(), tries = 0; while (i !== N && tries++ < 6 && ((seq[i - 1] && seq[i - 1].id === g.id) || (i === N - 1 && g.id === win.id) || (i === N + 1 && g.id === win.id))) g = rnd(); seq.push(g); }
    el.hidden = false; document.body.classList.add("slp-open");
    el.innerHTML = `<div class="slp-rl-bg" data-rl="close"></div><div class="slp-rl-b" role="dialog" aria-modal="true" aria-label="Рулетка">
      <button class="slp-btn sm slp-rl-x" type="button" data-rl="close" aria-label="Закрыть">${SLI.x}</button>
      <h3>Не можете выбрать?</h3><p>Кручу ${pool.length} ${plural(pool.length, "игру", "игры", "игр")}${slS.n !== "all" ? ` · ${(SL_NW[slS.n] || "").toLowerCase()}` : ""}</p>
      <div class="slp-rl-win"><div class="slp-rl-strip">${seq.map((g, i) => `<div class="slp-rl-it${i === N ? " win" : ""}"><span class="slp-p">${slPosterIn(g).replace('loading="lazy" ', "")}</span></div>`).join("")}</div><i class="slp-rl-mark"></i></div>
      <div class="slp-rl-res" aria-live="polite"></div></div>`;
    const box = el.querySelector(".slp-rl-win"), strip = el.querySelector(".slp-rl-strip"), its = strip.children, res = el.querySelector(".slp-rl-res");
    const finish = () => { if (el.hidden || !box.isConnected) return; box.classList.add("fin");
      res.innerHTML = `<b>${esc(win.title)}</b><small>${esc(slPl(win))}</small><div><button class="slp-btn pri" type="button" data-rl="open" data-id="${esc(win.id)}">Открыть карточку</button><button class="slp-btn" type="button" data-rl="again">${SLI.dice} Ещё раз</button></div>`;
      const b = res.querySelector("[data-rl=open]"); if (b) b.focus({preventScroll: true}); };
    requestAnimationFrame(() => {
      if (!its[N]) return; const step = its[1].offsetLeft - its[0].offsetLeft, w = its[0].offsetWidth;
      const target = its[N].offsetLeft + w / 2 - box.clientWidth / 2 + (Math.random() - .5) * w * .55, start = -box.clientWidth / 2 + w / 2;
      if (slRM() || !strip.animate){ strip.style.transform = `translateX(${-target}px)`; finish(); return; }
      const an = strip.animate([{transform: `translateX(${-start}px)`}, {transform: `translateX(${-target}px)`}], {duration: 5600, easing: "cubic-bezier(.1,.62,.06,1)", fill: "forwards"});
      let last = -1; const tick = () => { if (el.hidden || !strip.isConnected) return;
        const x = -new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41, i = Math.floor((x + box.clientWidth / 2) / step);
        if (i !== last){ last = i; try { SND.tick(.6); } catch(_){ /* ожидаемо: звук недоступен */ } }
        if (an.playState !== "finished") slRoulette.raf = requestAnimationFrame(tick); };
      slRoulette.raf = requestAnimationFrame(tick);
      an.onfinish = finish;
    });
  }

  let wSubT = 0;
  function subscribeWall(){
    if (!SB || !ME) return;
    const kick = () => { clearTimeout(wSubT); wSubT = setTimeout(() => loadWall(true), 250); };
    SB.channel("nexus-wall")
      .on("postgres_changes", {event: "*", schema: "public", table: "wall_posts"}, p => { kick(); const n = p.new; if (p.eventType === "INSERT" && n && n.user_id !== ME.id && route !== "people") toast(`${frNick(n.user_id)} написал на стене`); })
      .on("postgres_changes", {event: "*", schema: "public", table: "wall_comments"}, kick)
      .on("postgres_changes", {event: "*", schema: "public", table: "wall_reactions"}, kick)
      .on("postgres_changes", {event: "*", schema: "public", table: "wall_comment_likes"}, kick)
      .on("postgres_changes", {event: "*", schema: "public", table: "showcases"}, () => { clearTimeout(subscribeWall.t); subscribeWall.t = setTimeout(() => loadFriends(true), 400); })
      .subscribe();
  }
  const nickOf = uid => ME && uid === ME.id ? "Ты" : (profOf(uid).nick || "кто-то");
  const whoTitle = uids => uids.map(nickOf).join(", ");
  const imgThumb = path => `<img class="wl-img" src="${publicUrl(path)}" alt="" data-vkimg="${esc(path)}" loading="lazy">`;
  const emoBar = id => `<span class="wl-emo" data-emobar="${id}">${EMO.map(([k, ch, l]) => `<button type="button" data-emo="${ch}" title="${l}" aria-label="${l}">${emoSpan(k)}</button>`).join("")}</span>`;
  function postHTML(p){
    const mine = p.user_id === ME.id, pr = profOf(p.user_id);
    const rx = WALL.reacts.filter(r => r.post_id === p.id), by = new Map();
    rx.forEach(r => { if (!by.has(r.kind)) by.set(r.kind, []); by.get(r.kind).push(r.user_id); });
    const chips = [...by.entries()].sort((a, b) => b[1].length - a[1].length || RX_ORD[a[0]] - RX_ORD[b[0]]);
    const cm = WALL.comments.filter(c => c.post_id === p.id), open = wOpen.has(p.id), all = wAll.has(p.id), shown = all ? cm : cm.slice(-3);
    const ppl = [...new Set(rx.map(r => r.user_id))];
    const cmt = c => { const lk = WALL.clikes.filter(l => l.comment_id === c.id), on = lk.some(l => l.user_id === ME.id);
      return `<div class="wc3">${avaHTML(profOf(c.user_id), "sm")}<div class="b"><div class="bb"><button class="nk" ${c.user_id !== ME.id ? `data-user="${esc(c.user_id)}"` : ""}>${esc(nickOf(c.user_id))}</button>${c.body ? `<span class="tx${onlyEmo(c.body) ? " big" : ""}">${richText(c.body)}</span>` : ""}${c.image ? imgThumb(c.image) : ""}</div>
        <div class="ft"><span>${esc(agoTs(c.created_at))}</span><button class="lk${on ? " on" : ""}" data-wcl="${esc(c.id)}">${on ? "♥" : "♡"} Нравится${lk.length ? ` · ${lk.length}` : ""}</button>${lk.length ? `<button class="who" data-wclwho="${esc(c.id)}" title="${esc(whoTitle(lk.map(l => l.user_id)))}">${avaStack(lk.map(l => l.user_id), 3)}</button>` : ""}${c.user_id === ME.id || mine ? `<button class="del" data-wcdel="${esc(c.id)}">удалить</button>` : ""}</div></div></div>`; };
    const d = cDraft[p.id] || {text: "", file: null};
    return `<article class="wpost" data-wp="${esc(p.id)}">
      <header>${avaHTML(pr)}<div class="who"><button class="nk" ${!mine ? `data-user="${esc(p.user_id)}"` : ""}>${esc(mine ? (pr.nick || NICK) : pr.nick || "кто-то")}</button><small>${esc(vkDate(p.created_at))}</small></div>${mine ? `<button class="wp-del" data-wdel="${esc(p.id)}" title="Удалить пост" aria-label="Удалить пост">${ICON.x}</button>` : ""}</header>
      ${p.body ? `<div class="wp-t${onlyEmo(p.body) ? " big" : ""}">${richText(p.body)}</div>` : ""}${p.image ? `<div class="wp-im">${imgThumb(p.image)}</div>` : ""}
      <div class="wp-rx">${chips.map(([k, uids]) => `<button class="wrx${uids.includes(ME.id) ? " on" : ""}" data-wr="${esc(p.id)}:${k}" title="${esc((REACTS.find(x => x[0] === k) || [])[1] + ": " + whoTitle(uids))}">${emoSpan(k)}<b>${uids.length}</b></button>`).join("")}
        <span class="rx-add-w"><button class="rx-add" data-wrp="${esc(p.id)}" aria-label="Поставить реакцию" title="Реакция">${emoSpan("like")}<i>+</i></button></span>
        ${ppl.length ? `<button class="rx-who" data-wwho="${esc(p.id)}">${avaStack(ppl, 4)}<span>кто</span></button>` : ""}
        <button class="wp-cb${open ? " on" : ""}" data-wcopen="${esc(p.id)}">${ICON.chat}${cm.length ? `${cm.length} ${plural(cm.length, "коммент", "коммента", "комментов")}` : "Комментировать"}</button></div>
      ${open ? `<div class="wp-cm">${cm.length > shown.length ? `<button class="wp-all" data-wcall="${esc(p.id)}">Показать все ${cm.length}</button>` : ""}${shown.map(cmt).join("")}
        <div class="wcf" data-cf="${esc(p.id)}">${avaHTML(myProf(), "sm")}<div class="in-w"><textarea id="wlC-${esc(p.id)}" rows="1" maxlength="2000" placeholder="Комментарий…">${esc(d.text)}</textarea>
          <div class="tools">${emoBar("c-" + p.id)}<label class="att" title="Картинка">${ICON.img}<input type="file" accept="image/*" hidden data-cfile="${esc(p.id)}"></label><span class="pv">${d.file ? `<img src="${URL.createObjectURL(d.file)}" alt=""><button type="button" data-cfrm="${esc(p.id)}">✕</button>` : ""}</span><button class="send" type="button" data-csend="${esc(p.id)}">Отправить</button></div></div></div></div>` : ""}
    </article>`;
  }
  function wallCard(){
    if (!WALL){ loadWall(); return `<div class="fb-card"><p class="a-sub" style="margin:0">Загружаю стену…</p></div>`; }
    const posts = WALL.posts;
    return `<div class="fb-card wl">
      <div class="wl-form">${avaHTML(myProf())}<div class="in-w"><textarea id="wlT" maxlength="4000" rows="2" placeholder="Что нового? Скриншот, мем, мнение о сериале… Отметить друга — @ник">${esc(wDraft.text)}</textarea>
        <div class="tools">${emoBar("p")}<label class="att" title="Прикрепить картинку">${ICON.img}<span>Фото</span><input type="file" id="wlF" accept="image/*" hidden></label><span class="pv" id="wlP">${wDraft.file ? `<img src="${URL.createObjectURL(wDraft.file)}" alt=""><button type="button" data-wfrm="1">✕</button>` : ""}</span><button class="send" type="button" id="wlGo">Опубликовать</button></div></div></div>
      ${WALL.failed ? `<p class="a-sub" style="margin:14px 0 0">Стена пока не загрузилась. Нажми «Обновить» наверху.</p>` : ""}
      ${posts.length ? posts.map(postHTML).join("") : `<div class="a-empty" style="margin-top:12px"><b>Стена пустая</b>Напиши первым — мем, скрин или что сейчас смотришь.</div>`}</div>`;
  }
  function wireWall3(){
    const t = $("wlT"); if (!t) return;
    t.oninput = () => { wDraft.text = t.value; autoGrow(t); }; autoGrow(t);
    const take = f => { if (!f || !f.type.startsWith("image/")) return; wDraft.file = f; renderPeople(); };
    $("wlF").onchange = e => take(e.target.files[0]);
    bindDrop(document.querySelector(".wl-form"), take); pasteTarget = take;
    $("wlGo").onclick = sendPost;
    t.addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); sendPost(); } });
    document.querySelectorAll(".wcf textarea").forEach(c => { const id = c.closest("[data-cf]").dataset.cf; autoGrow(c);
      c.oninput = () => { (cDraft[id] = cDraft[id] || {text: "", file: null}).text = c.value; autoGrow(c); };
      c.addEventListener("focus", () => { pasteTarget = f => { if (!f || !f.type.startsWith("image/")) return; (cDraft[id] = cDraft[id] || {text: ""}).file = f; renderPeople(); }; });
      c.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey){ e.preventDefault(); sendComment(id); } }); });
    document.querySelectorAll(".wcf").forEach(f => bindDrop(f, file => { if (!file.type.startsWith("image/")) return; const id = f.dataset.cf; (cDraft[id] = cDraft[id] || {text: ""}).file = file; renderPeople(); }));
  }
  const autoGrow = t => { t.style.height = "auto"; t.style.height = Math.min(220, t.scrollHeight + 2) + "px"; };
  async function sendPost(){
    const t = $("wlT"), body = t.value.trim(); if (!body && !wDraft.file){ t.focus(); return; }
    const b = $("wlGo"); b.disabled = true; b.textContent = "Публикую…";
    try { const image = wDraft.file ? await upload(wDraft.file) : null;
      const pid = crypto.randomUUID(); const {error} = await SB.from("wall_posts").insert({id: pid, user_id: ME.id, body: body || null, image, created_at: now()}); if (error) throw error;
      notify(mentionedUids(body), "mention_post", "post:" + pid, body);
      wDraft = {text: "", file: null}; SND.click("soft"); await loadWall(true);
    } catch(err){ toast("Не опубликовалось: " + ((err && err.message) || err)); b.disabled = false; b.textContent = "Опубликовать"; }
  }
  async function sendComment(id){
    const d = cDraft[id] || {text: "", file: null}, body = String(d.text || "").trim(); if (!body && !d.file) return;
    const b = document.querySelector(`[data-csend="${CSS.escape(id)}"]`); if (b){ b.disabled = true; b.textContent = "…"; }
    try { const image = d.file ? await upload(d.file) : null;
      const {error} = await SB.from("wall_comments").insert({id: crypto.randomUUID(), post_id: id, user_id: ME.id, body: body || null, image, created_at: now()}); if (error) throw error;
      const post = WALL && WALL.posts.find(x => x.id === id), men = mentionedUids(body); notify(men, "mention_comment", "comment:" + id, body);
      if (post && post.user_id !== ME.id && !men.includes(post.user_id)) notify([post.user_id], "comment", "comment:" + id, body || "картинка");
      cDraft[id] = {text: "", file: null}; wAll.add(id); SND.click("soft"); await loadWall(true);
      setTimeout(() => { const c = $("wlC-" + id); if (c) c.focus(); }, 30);
    } catch(err){ toast("Не отправилось: " + ((err && err.message) || err)); if (b){ b.disabled = false; b.textContent = "Отправить"; } }
  }
  async function toggleReact(id, kind){
    const mine = WALL.reacts.some(r => r.post_id === id && r.user_id === ME.id && r.kind === kind);
    if (mine) WALL.reacts = WALL.reacts.filter(r => !(r.post_id === id && r.user_id === ME.id && r.kind === kind));
    else { WALL.reacts.push({post_id: id, user_id: ME.id, kind}); SND.click("soft"); }
    renderPeople();
    const r = mine ? await SB.from("wall_reactions").delete().eq("post_id", id).eq("user_id", ME.id).eq("kind", kind) : await SB.from("wall_reactions").insert({post_id: id, user_id: ME.id, kind, created_at: now()});
    if (r.error){ toast("Не получилось"); loadWall(true); }
  }
  async function toggleCLike(id){
    const mine = WALL.clikes.some(l => l.comment_id === id && l.user_id === ME.id);
    if (mine) WALL.clikes = WALL.clikes.filter(l => !(l.comment_id === id && l.user_id === ME.id)); else { WALL.clikes.push({comment_id: id, user_id: ME.id}); SND.click("soft"); }
    renderPeople();
    const r = mine ? await SB.from("wall_comment_likes").delete().eq("comment_id", id).eq("user_id", ME.id) : await SB.from("wall_comment_likes").insert({comment_id: id, user_id: ME.id, created_at: now()});
    if (r.error){ toast("Не получилось"); loadWall(true); }
  }
  function whoSheet(title, groups){
    const s = openSheet(`<h3>${esc(title)}</h3>${groups.map(([label, ic, uids]) => `<div class="who-g"><div class="who-h">${ic || ""}<b>${esc(label)}</b><small>${uids.length}</small></div>${uids.map(u => `<button class="who-r" ${ME && u !== ME.id ? `data-user="${esc(u)}"` : ""}>${avaHTML(profOf(u))}<span>${esc(nickOf(u))}</span></button>`).join("")}</div>`).join("")}`);
    s.el.addEventListener("click", e => { if (e.target.closest("[data-user]")) s.close(); });
  }
  function reactPicker(btn, id){
    document.querySelectorAll(".rx-pick").forEach(x => x.remove());
    const w = btn.closest(".rx-add-w"), mineK = new Set(WALL.reacts.filter(r => r.post_id === id && r.user_id === ME.id).map(r => r.kind));
    const pop = document.createElement("div"); pop.className = "rx-pick";
    pop.innerHTML = REACTS.map(([k, l], i) => `<button type="button" class="${mineK.has(k) ? "on" : ""}" data-wr="${esc(id)}:${k}" title="${l}" style="--i:${i}">${emoSpan(k)}</button>`).join("");
    document.body.appendChild(pop);
    const b = btn.getBoundingClientRect(), r = pop.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(b.left - 6, innerWidth - r.width - 8)) + "px";
    pop.style.top = (b.top - r.height - 8 < 60 ? b.bottom + 8 : b.top - r.height - 8) + "px";
  }
  document.addEventListener("pointerdown", e => { if (!e.target.closest(".rx-pick,.rx-add")) document.querySelectorAll(".rx-pick").forEach(x => x.remove()); }, {passive: true});
  addEventListener("scroll", () => document.querySelectorAll(".rx-pick").forEach(x => x.remove()), {passive: true});
  document.addEventListener("change", e => { const f = e.target.closest && e.target.closest("[data-cfile]"); if (!f) return; const id = f.dataset.cfile, file = f.files[0]; if (!file) return; (cDraft[id] = cDraft[id] || {text: ""}).file = file; renderPeople(); });
  document.addEventListener("click", async e => {
    const el = e.target.closest && e.target.closest("[data-wr],[data-wrp],[data-wwho],[data-wcl],[data-wclwho],[data-wcopen],[data-wcall],[data-wdel],[data-wcdel],[data-csend],[data-cfrm],[data-wfrm],[data-emobar] [data-emo],[data-fgrp],[data-fmore],[data-acttab]");
    if (!el || !ME) return;
    if (el.dataset.emo){ const bar = el.closest("[data-emobar]").dataset.emobar, t = bar === "p" ? $("wlT") : $("wlC-" + bar.slice(2)); if (!t) return;
      const a = t.selectionStart ?? t.value.length, z = t.selectionEnd ?? a; t.value = t.value.slice(0, a) + el.dataset.emo + t.value.slice(z); t.dispatchEvent(new Event("input")); t.focus(); const p = a + el.dataset.emo.length; t.setSelectionRange(p, p); return; }
    if (el.dataset.acttab){ actTab = el.dataset.acttab; lsSet("nexus_acttab", actTab); renderPeople(); return; }
    if (el.dataset.fgrp != null){ feedGroupSheet(+el.dataset.fgrp); return; }
    if (el.dataset.fmore){ feedN += 14; renderPeople(); return; }
    if (!WALL) return;
    if (el.dataset.wr){ const [id, k] = el.dataset.wr.split(":"); document.querySelectorAll(".rx-pick").forEach(x => x.remove()); toggleReact(id, k); return; }
    if (el.dataset.wrp){ reactPicker(el, el.dataset.wrp); return; }
    if (el.dataset.wwho){ const rx = WALL.reacts.filter(r => r.post_id === el.dataset.wwho);
      whoSheet("Реакции", REACTS.map(([k, l]) => [l, emoSpan(k), rx.filter(r => r.kind === k).map(r => r.user_id)]).filter(g => g[2].length)); return; }
    if (el.dataset.wcl){ toggleCLike(el.dataset.wcl); return; }
    if (el.dataset.wclwho){ whoSheet("Понравилось", [["Нравится", "♥", WALL.clikes.filter(l => l.comment_id === el.dataset.wclwho).map(l => l.user_id)]]); return; }
    if (el.dataset.wcopen){ const id = el.dataset.wcopen; wOpen.has(id) ? wOpen.delete(id) : wOpen.add(id); renderPeople(); if (wOpen.has(id)) setTimeout(() => { const c = $("wlC-" + id); if (c && innerWidth > 760) c.focus(); }, 30); return; }
    if (el.dataset.wcall){ wAll.add(el.dataset.wcall); renderPeople(); return; }
    if (el.dataset.csend){ sendComment(el.dataset.csend); return; }
    if (el.dataset.cfrm){ if (cDraft[el.dataset.cfrm]) cDraft[el.dataset.cfrm].file = null; renderPeople(); return; }
    if (el.dataset.wfrm){ wDraft.file = null; renderPeople(); return; }
    if (el.dataset.wdel){ if (!confirm("Удалить пост вместе с комментариями?")) return; const {error} = await SB.from("wall_posts").delete().eq("id", el.dataset.wdel); if (error){ toast("Не удалилось"); return; } loadWall(true); return; }
    if (el.dataset.wcdel){ if (!confirm("Удалить комментарий?")) return; const {error} = await SB.from("wall_comments").delete().eq("id", el.dataset.wcdel); if (error){ toast("Не удалилось"); return; } loadWall(true); return; }
  });

