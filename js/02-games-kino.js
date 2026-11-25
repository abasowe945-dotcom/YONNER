  // ================= ИГРЫ =================
  function contractBanner(){
    const it = activeContract(); if (!it) return "";
    const c = it.contract, h = cHours(c), left = daysTo(c.deadline), late = left < 0, pct = Math.min(100, h / c.goal * 100);
    return `<div class="ct${late ? " late" : ""}">
      ${posterHTML(it, {rate:false, tgt:false})}
      <div><div class="k">${ICON.target}${late ? "Срок вышел" : "Активный контракт"}</div><h4>${esc(it.title)}</h4>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="nums"><span><b>${num1(h)}</b> из ${num1(c.goal)} ч</span><span>${late ? `просрочено на <b>${-left}</b> ${plural(-left,"день","дня","дней")}` : left === 0 ? "<b>последний день</b>" : `осталось <b>${left}</b> ${plural(left,"день","дня","дней")}`}</span></div></div>
      <div class="ac">${canWrite ? (late ? `<button class="s-btn red" data-cfail="${esc(it.id)}">Засчитать провал</button><button class="s-btn dark" data-cext="${esc(it.id)}">+3 дня</button>`
        : `<button class="s-btn" data-csess="${esc(it.id)}">+ Сессия</button>`) : ""}<button class="s-btn dark" data-id="${esc(it.id)}">Открыть</button></div></div>`;
  }
  function renderGames(){
    const fut = route === "games-future";
    const all = items.filter(isGame), lib = all.filter(inLib), futs = all.filter(isFuture); // 4.9: «Жду» сам в список желаемого не попадает
    $("gSeg").innerHTML = `<a href="${rh("games")}" ${!fut ? 'aria-current="page"' : ""}>Библиотека<small>${lib.length}</small></a><a href="${rh("games-future")}" ${fut ? 'aria-current="page"' : ""}>Список желаемого<small>${futs.length}</small></a>`;
    const q = qv();
    const match = i => !q || [i.title,i.genre,i.desc,i.note].join(" ").toLowerCase().includes(q);
    if (fut){
      const list = futs.filter(match).sort(sorter("recent"));
      $("sMain").innerHTML = `${fvBanner("games")}<div class="s-head"><h1 class="s-h1">Список желаемого</h1></div>
        <div class="fut-head"><p>Что когда-нибудь пройду. Отсюда крутится рулетка.</p><span style="flex:1"></span>
          <button class="s-btn hot" id="rlS">${ICON.dice}Крутить рулетку</button><button class="s-btn dark" id="btS">${ICON.sword}Битва</button>${canWrite ? `<button class="s-btn dark" id="addFutS">${ICON.plus}Добавить</button>` : ""}</div>
        <section class="s-grid">${list.length ? list.map(gCard).join("") : `<div class="s-empty"><b>Пока пусто</b>Добавь игры с постером и жанром, потом рулетка выберет следующую.</div>`}</section>`;
      $("rlS").onclick = () => openRoulette("games");
      $("btS").onclick = () => openBattle("games");
      if ($("addFutS")) $("addFutS").onclick = () => openForm(null, "games", {lock: "future"});
      return;
    }
    const srcCount = s => lib.filter(i => srcOf(i) === s).length;
    const pool = lib.filter(i => !gSrc || srcOf(i) === gSrc);
    const cnt = s => pool.filter(i => gStatus(i.status) === s).length;
    const rated = pool.filter(i => typeof i.rating === "number");
    const avg = rated.length ? num1(rated.reduce((s,i)=>s+i.rating,0)/rated.length) : "—";
    const now = pool.filter(i => gStatus(i.status) === "playing" || gStatus(i.status) === "endless");
    let list = pool.filter(i => (!gF || gStatus(i.status) === gF) && match(i));
    list.sort((a,b) => sorter(gSort)(a,b) || (a.title||"").localeCompare(b.title||"","ru"));
    $("sMain").innerHTML = `${FV ? fvBanner("games") : sugStrip("game") + contractBanner() + releasesPanel("games") + ctaRow("games")}
      <div class="s-head" style="margin-top:26px"><div><div class="t-row"><h1 class="s-h1">Библиотека</h1>${futPill("games", futs.length)}</div>
        <div class="src-pills">${[["","Все",lib.length,""],["steam","Лицензия",srcCount("steam"),SRC_ICON.steam],["pirate","Пиратка",srcCount("pirate"),SRC_ICON.pirate]]
          .map(([v,l,n,ic]) => `<button class="src-p ${v}" data-src="${v}" aria-pressed="${gSrc===v}">${ic ? `<span class="i">${ic}</span>` : ""}${l}<small>${n}</small></button>`).join("")}</div></div>
        <div class="s-stats">${[["",pool.length,"всего"],["blue",cnt("playing"),"в процессе"],["purple",cnt("endless"),"онлайн-игры"],["green",cnt("done"),"пройдено"],["yt",cnt("youtube"),"на YouTube"],["red",cnt("dropped"),"дроп"],["",avg,"средняя"]]
          .map(([c,v,l]) => `<div class="s-stat ${c}"><b>${esc(v)}</b><small>${l}</small></div>`).join("")}</div></div>
      ${now.length ? `<div class="s-shelf-h">В процессе</div><div class="s-row">${now.map(gCard).join("")}</div>` : ""}
      <div class="s-bar"><div class="seg">${[["","Все",pool.length],["playing","В процессе",cnt("playing")],["endless","Онлайн-игры",cnt("endless")],["done","Пройдено",cnt("done")],["youtube","На YouTube",cnt("youtube")],["dropped","Дроп",cnt("dropped")]]
        .map(([v,l,n]) => `<button data-gf="${v}" aria-pressed="${gF===v}">${l}<small>${n}</small></button>`).join("")}</div>
        <span style="display:flex;gap:10px;align-items:center"><select class="s-sel" id="gSort" aria-label="Сортировка">${sortOpts(gSort)}</select>${canWrite ? `<button class="s-btn dark" data-reord="lib:games" title="Расставить вручную">${ICON.drag}</button>` : ""}${canWrite ? `<button class="s-btn" data-addk="games">${ICON.plus}Добавить</button>` : ""}</span></div>
      <section class="s-grid">${list.length ? list.map(gCard).join("") :
        `<div class="s-empty"><b>${pool.length ? "Ничего не найдено" : lib.length ? "В этом разделе пусто" : "Библиотека пуста"}</b>${pool.length ? "Сбрось фильтр или поиск." : lib.length ? "Укажи источник игры через «Изменить»." : "Жми «+ Добавить» и вставь данные со страницы игры в Steam."}</div>`}</section>`;
    $("gSort").onchange = e => { gSort = e.target.value; renderGames(); };
  }

  // ================= КИНО =================
  function renderKino(){
    const fut = route === "kino-future";
    const all = items.filter(i => !isGame(i)), lib = all.filter(inLib), futs = all.filter(isFuture);
    $("kSeg").innerHTML = `<a href="${rh("kino")}" ${!fut ? 'aria-current="page"' : ""}>Библиотека<small>${lib.length}</small></a><a href="${rh("kino-future")}" ${fut ? 'aria-current="page"' : ""}>На будущее<small>${futs.length}</small></a>`;
    const q = qv();
    const match = i => !q || [i.title,i.genre,i.note].join(" ").toLowerCase().includes(q);
    if (fut){
      const list = futs.filter(match).sort(sorter("recent"));
      $("kMain").innerHTML = `${fvBanner("kino")}<h1 class="k-h1">На будущее</h1>
        <div class="k-filters" style="margin-top:12px"><span style="color:var(--k-dim)">Что посмотрю потом. Рулетка выберет за тебя.</span><span style="flex:1"></span>
          <button class="k-btn hot sm" id="rlK">${ICON.dice}Крутить рулетку</button><button class="k-btn sm" id="btK">${ICON.sword}Битва</button>${canWrite ? `<button class="k-btn sm" id="addFutK">${ICON.plus}Добавить</button>` : ""}</div>
        <section class="k-grid">${list.length ? list.map(kCard).join("") : `<div class="k-empty"><b>Пока пусто</b>Добавь фильмы и сериалы с постером и жанром.</div>`}</section>`;
      $("rlK").onclick = () => openRoulette("kino");
      $("btK").onclick = () => openBattle("kino");
      if ($("addFutK")) $("addFutK").onclick = () => openForm(null, "kino", {lock: "future"});
      return;
    }
    const rated = lib.filter(i => typeof i.rating === "number");
    const avg = rated.length ? num1(rated.reduce((s,i)=>s+i.rating,0)/rated.length) : "—";
    const nowW = lib.filter(i => isSerT(i.type) && kNorm(i) === "playing");
    if (kF === "gp" && !lib.some(i => i.gp)) kF = "";
    let list = lib.filter(i => (!kF || (kF === "gp" ? !!i.gp : kNorm(i) === kF)) && (!kT || i.type === kT) && match(i));
    list.sort((a,b) => sorter(kSort)(a,b) || (a.title||"").localeCompare(b.title||"","ru"));
    $("kMain").innerHTML = `${fvBanner("kino")}<div class="t-row"><h1 class="k-h1">Кино и сериалы</h1>${futPill("kino", futs.length)}</div>
      <div class="k-stats">${[[lib.length,"всего"],[lib.filter(i=>kNorm(i)==="done").length,"просмотрено"],[nowW.length,"смотрю"],[avg,"средняя оценка"]].map(([v,l]) => `<span><b>${esc(v)}</b>${l}</span>`).join("")}</div>
      ${FV ? "" : sugStrip("kino") + releasesPanel("kino") + ctaRow("kino")}
      ${nowW.length ? `<div class="k-label">Смотрю сейчас</div><div class="k-row">${nowW.map(kCard).join("")}</div>` : ""}
      <div class="k-filters"><button class="k-chipb" data-kf="" aria-pressed="${kF===""}">Все</button>${[["done","Просмотрено"],["paused","Отложено"],["playing","Смотрю"],["dropped","Брошено"]].filter(([s]) => lib.some(i => kNorm(i) === s)).map(([s,l]) => `<button class="k-chipb" data-kf="${s}" aria-pressed="${kF===s}">${l}</button>`).join("")}${lib.some(i => i.gp) ? `<button class="k-chipb k-gp" data-kf="gp" aria-pressed="${kF==="gp"}">${GP_I}Guilty pleasure<small>${lib.filter(i => i.gp).length}</small></button>` : ""}
        <span class="k-sepv"></span><button class="k-chipb" data-kt="" aria-pressed="${kT===""}">Всё кино</button>${[["movie","Фильмы"],["series","Сериалы"],["anime","Аниме"]].map(([k,l]) => `<button class="k-chipb" data-kt="${k}" aria-pressed="${kT===k}">${l}</button>`).join("")}
        <span class="k-sepv"></span><select class="k-sel" id="kSort" aria-label="Сортировка">${[["watched","По дате просмотра"],["mine","Мой порядок"],["recent","Недавние"],["rating","По оценке"],["year","По дате выхода"],["title","По названию"]].map(([v,l]) => `<option value="${v}"${v===kSort?" selected":""}>${l}</option>`).join("")}</select>${canWrite ? `<button class="k-btn sm" data-reord="lib:kino" title="Расставить вручную" style="margin-left:8px">${ICON.drag}</button>` : ""}<span class="k-count">${lib.length ? `${list.length} из ${lib.length}` : ""}</span>${canWrite ? `<button class="k-btn white sm" data-addk="kino" style="margin-left:10px">${ICON.plus}Добавить</button>` : ""}</div>
      ${list.length ? (kSort === "watched" ? kTimeline(list) : [["movie","Фильмы"],["series","Сериалы"],["anime","Аниме"]].map(([t,l]) => { const part = list.filter(i => (i.type || "movie") === t); return part.length ? `<div class="k-sec"><h2>${l}</h2><span>${part.length}</span><i></i></div><section class="k-grid dvd-grid">${part.map((x, i) => kCard(x, {i})).join("")}</section>` : ""; }).join(""))
        : `<section class="k-grid"><div class="k-empty"><b>${lib.length ? "Ничего не нашлось" : "Здесь пока пусто"}</b>${lib.length ? "Сбрось фильтры или поиск." : "Жми «+ Добавить»."}</div></section>`}`;
    $("kSort").onchange = e => { kSort = e.target.value; renderKino(); };
  }
  // 3.0: всё кино в порядке просмотра, по месяцам
  function kTimeline(list){
    const groups = new Map(), td = new Date();
    list.forEach(i => { const d = i.date && !i.noDate && ["done", "played"].includes(i.status) ? i.date : null, key = d ? d.slice(0, 7) : (kNorm(i) === "playing" ? "~now" : "~none");
      if (!groups.has(key)) groups.set(key, []); groups.get(key).push(i); });
    const keys = [...groups.keys()].sort((a, b) => (a === "~now" ? -1 : b === "~now" ? 1 : a === "~none" ? 1 : b === "~none" ? -1 : b.localeCompare(a)));
    let n = 0;
    return keys.filter(k => k !== "~now" || kF === "playing").map(k => { const part = groups.get(k);
      const label = k === "~now" ? "Смотрю сейчас" : k === "~none" ? "Без даты" : (() => { const [y, m] = k.split("-").map(Number); return `${MONTHS_NOM[m - 1].replace(/^./, c => c.toUpperCase())}${y !== td.getFullYear() ? " " + y : ""}`; })();
      return `<div class="k-sec k-mon"><h2>${label}</h2><span>${part.length}</span><i></i></div><section class="k-grid dvd-grid">${part.map(x => kCard(x, {i: n++})).join("")}</section>`; }).join("");
  }
  function tick(){ const d = new Date(), s = d.toLocaleDateString("ru-RU",{weekday:"short",day:"numeric",month:"short"}).replace(/\.$/,"");
    $("clock").innerHTML = `<b>${d.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}</b><small>${s.charAt(0).toUpperCase()+s.slice(1)}</small>`; }
  tick(); setInterval(tick, 20000);
  // 3.6: сколько осталось работать до 18:00 (по будням)
  const WORK_DEF = {on: true, start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5]};
  const workCfg = () => { let w = null; try { w = MEP && MEP.work; } catch(_){ /* ожидаемо: профиль ещё не загружен */ } return {...WORK_DEF, ...(w || {})}; };
  const hm = s => { const [a, b] = String(s || "0:0").split(":").map(Number); return (a || 0) * 60 + (b || 0); };
  function workTick(){ const el = $("workT"); if (!el) return; const d = new Date(), wd = d.getDay(), W = workCfg(), end = new Date(d), em = hm(W.end); end.setHours(Math.floor(em / 60), em % 60, 0, 0);
    if (!W.on || !W.days.includes(wd) || d.getHours() * 60 + d.getMinutes() < hm(W.start) - 60){ el.hidden = true; workHome(el); return; }
    el.hidden = false; const left = Math.floor((end - d) / 1000), p2 = n => String(n).padStart(2, "0");
    const html = left > 0 ? `<i aria-hidden="true">👨‍💻</i><span><small>ОСТАЛОСЬ РАБОТАТЬ</small><b>${Math.floor(left / 3600)}:${p2(Math.floor(left / 60) % 60)}:${p2(left % 60)}</b></span>`
      : `<i aria-hidden="true">🍻</i><span><small class="ok">СМЕНА ОКОНЧЕНА</small><b class="ok">свобода</b></span>`;
    el.classList.toggle("done", left <= 0); el.title = (left > 0 ? `До конца рабочего дня (${W.end})` : "Рабочий день окончен") + " · нажми, чтобы настроить"; if (el.innerHTML !== html) el.innerHTML = html; workHome(el); }
  // 6.0: на телефоне таймер живёт плашкой на главной
  function workHome(src){ const h = $("workHome"); if (!h) return; h.hidden = src.hidden; h.classList.toggle("done", src.classList.contains("done")); if (h.innerHTML !== src.innerHTML) h.innerHTML = src.innerHTML; }
  setTimeout(workTick, 0); setInterval(workTick, 1000);
  const WD_NAMES = [[1, "Пн"], [2, "Вт"], [3, "Ср"], [4, "Чт"], [5, "Пт"], [6, "Сб"], [0, "Вс"]];
  function workSheet(){
    if (!ME){ toast("Сначала войди"); return; }
    const W = workCfg(); let days = [...W.days], on = W.on;
    const s = openSheet(`<h3>Рабочий день</h3><p class="sub">Таймер «Осталось работать» в шапке считает до конца твоей смены. Видишь его только ты.</p>
      <div class="wk-row"><label class="f">Начало<input class="in" type="time" id="wkS" value="${esc(W.start)}"></label><label class="f">Конец<input class="in" type="time" id="wkE" value="${esc(W.end)}"></label></div>
      <div class="av-lb">Рабочие дни</div><div class="wk-days" id="wkD">${WD_NAMES.map(([n, l]) => `<button type="button" data-wd="${n}" aria-pressed="${days.includes(n)}">${l}</button>`).join("")}</div>
      <label class="wk-on"><input type="checkbox" id="wkOn" ${on ? "checked" : ""}><span>Показывать таймер в шапке</span></label>
      <p class="sub" style="margin:10px 0 0">Таймер появляется за час до начала смены, после конца горит зелёным до полуночи.</p>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="wkOk">Сохранить</button><button class="ib" id="wkDef">По умолчанию (9–18, будни)</button></div>`);
    const q = x => s.el.querySelector(x);
    q("#wkD").onclick = e => { const b = e.target.closest("[data-wd]"); if (!b) return; const n = +b.dataset.wd; days = days.includes(n) ? days.filter(x => x !== n) : [...days, n]; b.setAttribute("aria-pressed", days.includes(n)); };
    q("#wkDef").onclick = () => { q("#wkS").value = WORK_DEF.start; q("#wkE").value = WORK_DEF.end; days = [...WORK_DEF.days]; q("#wkOn").checked = true; s.el.querySelectorAll("[data-wd]").forEach(b => b.setAttribute("aria-pressed", days.includes(+b.dataset.wd))); };
    q("#wkOk").onclick = async () => { const st = q("#wkS").value || WORK_DEF.start, en = q("#wkE").value || WORK_DEF.end;
      if (hm(en) <= hm(st)){ toast("Конец смены должен быть позже начала"); return; }
      if (!days.length){ toast("Выбери хотя бы один день"); return; }
      const b = q("#wkOk"); b.disabled = true;
      if (await saveProf({work: {on: q("#wkOn").checked, start: st, end: en, days: days.sort()}})){ s.close(); workTick(); toast(q("#wkOn").checked ? `Таймер до ${en}` : "Таймер скрыт — вернуть можно в профиле"); } else b.disabled = false; };
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#workT,[data-worksheet]")) workSheet(); });

  // ================= APPLE-СТРАНИЦЫ =================
  function appleHead(crumb, acts = ""){ $("aCrumb").textContent = crumb; $("aTopActs").innerHTML = acts; }

  function renderSoon(){
    appleHead("Скоро", canWrite ? `<button class="a-btn" id="addSoon">${ICON.plus}Добавить</button>` : "");
    const all = items.filter(isSoon).filter(i => !soF || (soF === "games" ? isGame(i) : !isGame(i)));
    const upcoming = all.filter(i => i.releaseDate && daysTo(i.releaseDate) >= 0).sort((a,b) => a.releaseDate.localeCompare(b.releaseDate));
    const released = all.filter(i => i.releaseDate && daysTo(i.releaseDate) < 0).sort((a,b) => b.releaseDate.localeCompare(a.releaseDate));
    const card = it => { const d = daysTo(it.releaseDate), g = isGame(it);
      return `<button class="so${d < 0 ? " out" : ""}" data-soon="${esc(it.id)}">${posterHTML(it, {rate:false, tgt:false})}
        <div><div class="ty ${g ? "game" : "kino"}">${g ? "Игра" : KTYPES[it.type] || "Кино"}</div><h4>${esc(it.title)}</h4><div class="dt">${fmtDate(it.releaseDate)}</div></div>
        <div class="cd">${d < 0 ? `<b>Вышло</b><small>${-d} ${plural(-d,"день","дня","дней")} назад</small>` : d === 0 ? `<b>Сегодня</b><small>релиз</small>` : `<b>${d}</b><small>${plural(d,"день","дня","дней")}</small>`}</div></button>`; };
    $("aMain").innerHTML = `<h1 class="a-h1">Скоро выйдут</h1><p class="a-sub">Даты релизов, которые ты ждёшь. Они же отмечены в календаре.</p>
      <div style="margin-top:18px" class="seg">${[["","Всё"],["games","Игры"],["kino","Кино"]].map(([v,l]) => `<button data-sof="${v}" aria-pressed="${soF===v}">${l}</button>`).join("")}</div>
      ${upcoming.length ? `<div class="so-list">${upcoming.map(card).join("")}</div>` : `<div class="a-empty" style="margin-top:20px"><b>Ничего не ждёшь</b>Добавь игру или фильм с датой выхода.</div>`}
      ${released.length ? `<h2 class="so-h">Уже вышли</h2><div class="so-list">${released.map(card).join("")}</div>` : ""}`;
    if ($("addSoon")) $("addSoon").onclick = () => quickAdd(soF === "kino" ? "kino" : "games", "soon");
  }

  function renderRecap(){
    appleHead("Итоги", `<button class="a-link" data-go="more">‹ Ещё</button>`);
    const Y = recY, inY = it => (itemDate(it) || "").startsWith(Y + "-") && inLib(it);
    const games = items.filter(i => isGame(i) && inY(i)), kino = items.filter(i => !isGame(i) && inY(i));
    const doneG = games.filter(i => gStatus(i.status) === "done").length, dropG = games.filter(i => gStatus(i.status) === "dropped").length;
    const watched = kino.filter(i => i.status === "done" || i.status === "played").length;
    const all = [...games, ...kino], rated = all.filter(i => typeof i.rating === "number");
    const avg = rated.length ? num1(rated.reduce((s,i)=>s+i.rating,0)/rated.length) : "—";
    let hours = 0, cDone = 0, cFail = 0;
    items.filter(isGame).forEach(i => { const c = i.contract; if (!c) return;
      (c.sessions || []).forEach(s => { if ((s.d || "").startsWith(Y + "-")) hours += +s.h || 0; });
      if ((c.start || "").startsWith(Y + "-")){ if (c.state === "done") cDone++; if (c.state === "failed") cFail++; } });
    const months = Array.from({length:12}, (_,m) => { const p = `${Y}-${pad(m+1)}-`; return [games.filter(i => itemDate(i).startsWith(p)).length, kino.filter(i => itemDate(i).startsWith(p)).length]; });
    const maxM = Math.max(1, ...months.map(([a,b]) => a + b));
    const gc = {}; all.forEach(i => genres(i).forEach(g => { const k = g.toLowerCase(); gc[k] = (gc[k] || 0) + 1; }));
    const topG = Object.entries(gc).sort((a,b) => b[1] - a[1]).slice(0,5), maxG = topG.length ? topG[0][1] : 1;
    const dg = {}; items.filter(i => isGame(i) ? gStatus(i.status) === "dropped" : i.status === "dropped").filter(inY).forEach(i => genres(i).forEach(g => { const k = g.toLowerCase(); dg[k] = (dg[k] || 0) + 1; }));
    const dropGenre = Object.entries(dg).sort((a,b) => b[1] - a[1])[0];
    const top = list => list.filter(i => typeof i.rating === "number").sort((a,b) => b.rating - a.rating).slice(0,5);
    const topRow = list => list.length ? `<div class="rc-top">${list.map((it,i) => `<button style="border:0;background:none;padding:0;text-align:left;color:inherit;cursor:pointer" data-id="${esc(it.id)}"><div style="position:relative">${posterHTML(it, {tgt:false})}<span class="rc-top n" style="position:absolute;left:8px;bottom:6px;z-index:2;font-size:34px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6);line-height:1">${i+1}</span></div><div class="t" style="margin-top:6px;font-size:13px;font-weight:600">${esc(it.title)}</div></button>`).join("")}</div>` : `<p style="color:var(--c-dim);margin:0">Поставь оценки, и тут появится топ.</p>`;
    const MN = ["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"];
    $("aMain").innerHTML = `<div class="c-head"><h1 class="a-h1">Итоги <span>${Y}</span></h1><div class="c-arrows"><button class="ar" id="rPrev" aria-label="Прошлый год">‹</button><button class="ar" id="rNext" aria-label="Следующий год">›</button></div></div>
      <div class="rc-hero"><div class="y">${Y}</div><p>${all.length ? `${games.length} ${plural(games.length,"игра","игры","игр")} начато, ${watched} ${plural(watched,"фильм","фильма","фильмов")} и сериалов посмотрено.${topG[0] ? ` Твой жанр года: ${esc(topG[0][0])}.` : ""}` : "За этот год пока пусто. Самое время начать."}</p></div>
      <div class="rc-grid">${[[games.length,"игр начато"],[doneG,"игр пройдено"],[dropG,"игр дропнуто"],[watched,"фильмов и сериалов"],[num1(hours),"часов в контрактах"],[avg,"средняя оценка"],[cDone,"контрактов выполнено"],[cFail,"контрактов провалено"]]
        .map(([v,l]) => `<div class="rc-c"><b>${v}</b><small>${l}</small></div>`).join("")}</div>
      <div class="rc-sec"><h3>По месяцам</h3><div class="rc-months">${months.map(([a,b],m) => `<div class="rc-m"><i style="height:${b/maxM*120}px;background:var(--c-kino)"></i><i style="height:${a/maxM*120}px;background:var(--c-game)"></i><span>${MN[m]}</span></div>`).join("")}</div>
        <div class="c-legend" style="margin-top:12px;font-size:13px;color:var(--c-dim)"><span><i style="background:var(--c-game)"></i>игры</span><span><i style="background:var(--c-kino)"></i>кино</span></div></div>
      <div class="rc-sec"><h3>Топ игр года</h3>${topRow(top(games))}</div>
      <div class="rc-sec"><h3>Топ кино года</h3>${topRow(top(kino))}</div>
      <div class="rc-sec"><h3>Любимые жанры</h3>${topG.length ? `<div class="rc-genres">${topG.map(([g,n]) => `<div class="rc-g"><span>${esc(g)}</span><div class="b"><i style="width:${n/maxG*100}%"></i></div><span class="n">${n}</span></div>`).join("")}</div>` : `<p style="color:var(--c-dim);margin:0">Жанры не указаны.</p>`}
        ${dropGenre ? `<p style="margin:16px 0 0;color:var(--c-dim)">Чаще всего бросаешь: <b style="color:var(--c-fg)">${esc(dropGenre[0])}</b> (${dropGenre[1]})</p>` : ""}</div>`;
    $("rPrev").onclick = () => { recY--; renderRecap(); };
    $("rNext").onclick = () => { recY++; renderRecap(); };
  }

  function renderDrops(){
    appleHead("Стена дропов", `<button class="a-link" data-go="more">‹ Ещё</button>`);
    const drops = items.filter(i => (isGame(i) ? gStatus(i.status) === "dropped" && inLib(i) : i.status === "dropped"))
      .filter(i => !drF || (drF === "games" ? isGame(i) : !isGame(i))).sort(sorter("recent"));
    const dg = {}; drops.forEach(i => genres(i).forEach(g => { const k = g.toLowerCase(); dg[k] = (dg[k] || 0) + 1; }));
    const top = Object.entries(dg).sort((a,b) => b[1] - a[1])[0];
    $("aMain").innerHTML = `<h1 class="a-h1">Стена дропов</h1><p class="a-sub">${drops.length} ${plural(drops.length,"дроп","дропа","дропов")}${top ? ` · чаще всего бросаешь: ${esc(top[0])}` : ""}</p>
      <div style="margin-top:18px" class="seg">${[["","Всё"],["games","Игры"],["kino","Кино"]].map(([v,l]) => `<button data-drf="${v}" aria-pressed="${drF===v}">${l}</button>`).join("")}</div>
      ${drops.length ? `<div class="dr-grid">${drops.map(it => `<button class="dr press" data-id="${esc(it.id)}"><div style="position:relative">${posterHTML(it, {tgt:false})}<span class="stamp">Дроп</span></div>
        <div class="t">${esc(it.title)}</div><div class="why">${it.dropReason ? "«" + esc(it.dropReason) + "»" : "без причины"}</div></button>`).join("")}</div>` : `<div class="a-empty" style="margin-top:20px"><b>Ни одного дропа</b>Либо ты железный, либо ещё не начинал.</div>`}`;
  }

  function renderMoney(){
    appleHead("Деньги", `<button class="a-link" data-go="more">‹ Ещё</button>`);
    const Y = recY, m = moneyStats(Y), all = moneyStats(null);
    const months = Array.from({length:12}, (_, i) => m.paid.filter(x => (itemDate(x) || "").startsWith(`${Y}-${pad(i+1)}-`)).reduce((s, x) => s + priceOf(x), 0));
    const maxM = Math.max(1, ...months), MN = ["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"];
    const top = [...m.paid, ...m.pir].sort((a,b) => priceOf(b) - priceOf(a)).slice(0, 5);
    const avg = m.paid.length ? m.spent / m.paid.length : 0;
    $("aMain").innerHTML = `<div class="c-head"><h1 class="a-h1">Деньги <span>${Y}</span></h1><div class="c-arrows"><button class="ar" id="mPrev" aria-label="Прошлый год">‹</button><button class="ar" id="mNext" aria-label="Следующий год">›</button></div></div>
      <p class="a-sub">Считаю по цене в рублях и дате начала игры. Бесплатные не в счёт.</p>
      <div class="rc-grid">${[[fmtRub(m.spent),"потрачено за год"],[fmtRub(m.saved),"сэкономлено на пиратке"],[m.paid.length,"куплено игр"],[m.paid.length ? fmtRub(avg) : "—","средняя цена"],
        [m.hours ? fmtRub(m.spent / m.hours) : "—","за час в контрактах"],[fmtRub(all.spent),"потрачено за всё время"]].map(([v,l]) => `<div class="rc-c"><b style="font-size:30px">${v}</b><small>${l}</small></div>`).join("")}</div>
      <div class="rc-sec"><h3>Траты по месяцам</h3><div class="rc-months">${months.map((v,i) => `<div class="rc-m" title="${fmtRub(v)}"><i style="height:${v/maxM*120}px;background:var(--c-ring)"></i><span>${MN[i]}</span></div>`).join("")}</div></div>
      <div class="rc-sec"><h3>Самые дорогие</h3>${top.length ? `<div class="mo-list">${top.map(i => `<button class="mo-row" data-id="${esc(i.id)}"><span class="mo-ic" style="background:${srcOf(i) === "pirate" ? "#d6a24a" : "#0a84ff"}">${SRC_ICON[srcOf(i) || "steam"]}</span><span class="t">${esc(i.title)}<small>${srcOf(i) === "pirate" ? "пиратка, не потрачено" : "куплено"}</small></span><b style="font-variant-numeric:tabular-nums${srcOf(i) === "pirate" ? ";text-decoration:line-through;color:var(--c-dim)" : ""}">${fmtRub(priceOf(i))}</b></button>`).join("")}</div>` : `<p style="color:var(--c-dim);margin:0">Укажи цены у игр, и тут появится статистика.</p>`}</div>`;
    $("mPrev").onclick = () => { recY--; renderMoney(); };
    $("mNext").onclick = () => { recY++; renderMoney(); };
  }
  function renderAch(){
    appleHead("Ачивки", `<button class="a-link" data-go="more">‹ Ещё</button>`);
    const list = achList(), n = list.filter(a => a.got).length;
    $("aMain").innerHTML = `<h1 class="a-h1">Ачивки <span>${n} из ${list.length}</span></h1><p class="a-sub">Открываются сами, когда выполняешь условие.</p>
      <div class="ach-grid">${list.map(a => `<div class="ach${a.got ? " got" : ""}" style="--ac:${a.c}"><span class="ach-ic">${ICON.trophy}</span><b>${a.t}</b><small>${a.d}</small>
        ${a.got ? `<span class="ach-ok">Открыта</span>` : `<div class="ach-bar"><i style="width:${a.cur / a.max * 100}%"></i></div><span class="ach-n">${a.max >= 1000 ? fmtRub(a.cur) + " / " + fmtRub(a.max) : `${num1(a.cur)} / ${a.max}`}</span>`}</div>`).join("")}</div>`;
  }

  // ---------- календарь ----------
  function tileHTML(it, extra){
    const g = isGame(it), soon = relOn(it);
    const img = it.cover ? `<img alt="" src="${blobUrl(it.cover)}" style="${posStyle(it.coverPos)}">` : `<div class="nm">${esc(it.title)}</div>`;
    const lbl = soon ? "Релиз" : g ? "Начал играть" : kinoDateLabel(it);
    const rate = !soon && typeof it.rating === "number" ? `<span class="c-rate ${rateCls(it.rating)}">${num1(it.rating)}</span>` : "";
    return `<div class="c-t ${g ? "game" : "kino"}${soon ? " rel" : ""}" data-drag="${esc(it.id)}" title="${esc(it.title + " · " + lbl)}">${img}${soon ? `<span class="c-relb">${relShort(it).toUpperCase()}</span>` : ""}${g && hasActive(it) ? `<span class="c-tgt">${ICON.target}</span>` : ""}<span class="c-kind">${g ? ICON.pad : ICON.film}</span>${rate}${extra || ""}</div>`;
  }
  // ---------- календари друзей: кто во что начал играть, что прошёл, дропнул и посмотрел ----------
  let calUid = null; // null — свой календарь, "*" — все вместе, иначе uid друга
  const calMine = () => MYITEMS.map(i => ({...i, uid: ME ? ME.id : "me"}));
  function calPool(){
    if (!calUid) return [];
    const fr = (FR ? FR.items : []).filter(i => !ME || i.uid !== ME.id);
    return calUid === "*" ? [...calMine(), ...fr] : ME && calUid === ME.id ? calMine() : fr.filter(i => i.uid === calUid);
  }
  // одна запись может дать две отметки: день начала и день, когда прошёл или дропнул
  function calEntries(){
    const out = [];
    calPool().forEach(it => {
      if (relOn(it) || isFuture(it) || isSoon(it) || it.noDate) return;
      if (isGame(it)){
        const s = gStatus(it.status), start = it.date || (it.createdAt ? localDate(new Date(it.createdAt)) : null);
        const fin = (s === "done" || s === "dropped") ? (it.finishedAt || null) : null;
        if (start && start !== fin) out.push({it, day: start, k: "start"});
        if (fin) out.push({it, day: fin, k: s === "done" ? "done" : "drop"});
      } else { const d = itemDate(it); if (d) out.push({it, day: d, k: "watch"}); }
    });
    return out;
  }
  const CAL_K = {start: "начал играть", done: "прошёл", drop: "дропнул", watch: "посмотрел"};
  const calKey = e => e.it.uid + "/" + e.it.id;
  function calTile(e, extra){
    const it = e.it, g = isGame(it);
    const img = it.cover ? `<img alt="" src="${blobUrl(it.cover)}" style="${posStyle(it.coverPos)}">` : `<div class="nm">${esc(it.title)}</div>`;
    const rate = e.k !== "start" && typeof it.rating === "number" ? `<span class="c-rate ${rateCls(it.rating)}">${num1(it.rating)}</span>` : "";
    const who = calUid === "*" ? `<span class="c-who-a">${avaHTML(profOf(it.uid), "xs")}</span>` : "";
    const mark = e.k === "done" ? `<span class="c-fin c-fin-ok" aria-hidden="true">${CHECK_I}</span>` : e.k === "drop" ? `<span class="c-fin c-fin-dr">ДРОП</span>` : "";
    return `<div class="c-t ${g ? "game" : "kino"} c-fr" data-cfi="${esc(calKey(e))}" title="${esc(it.title + " · " + nickOf(it.uid) + " " + CAL_K[e.k])}">${img}${who}${mark}<span class="c-kind">${g ? ICON.pad : ICON.film}</span>${rate}${extra || ""}</div>`;
  }
  function calWhoBar(){
    if (!ME) return "";
    if (!FR){ loadFriends().then(() => { if (route === "calendar") renderCal(); }); }
    const fr = (FR ? FR.profiles : []).filter(p => p.user_id !== ME.id);
    const cnt = uid => (FR ? FR.items : []).filter(i => i.uid === uid && !isFuture(i) && !isSoon(i)).length;
    fr.sort((a, b) => cnt(b.user_id) - cnt(a.user_id));
    const chip = (v, label, ava) => `<button type="button" class="c-who" data-calu="${esc(v)}" aria-pressed="${(calUid || "") === v}">${ava}<span>${esc(label)}</span></button>`;
    return `<div class="c-whos" role="toolbar" aria-label="Чей календарь">${chip("", "Мой", avaHTML(profOf(ME.id), "xs"))}${fr.length ? chip("*", "Все вместе", `<span class="c-who-all">${ICON.people || ""}</span>`) : ""}${fr.map(p => chip(p.user_id, p.nick || "друг", avaHTML(p, "xs"))).join("")}</div>`;
  }
  function renderCal(){
    appleHead("Календарь");
    if (calUid) return renderCalFr();
    const first = new Date(calY, calM, 1), mName = first.toLocaleDateString("ru-RU", {month:"long"});
    const byDay = {};
    items.forEach(it => { const d = itemDate(it); if (d) (byDay[d] = byDay[d] || []).push(it); });
    Object.values(byDay).forEach(a => a.sort((x,y) => (relOn(x) - relOn(y)) || (y.rating ?? -1) - (x.rating ?? -1)));
    // 6.0: мероприятия и ГО ПОСМОТРИМ в календаре — и прошедшие, и будущие
    const evDay = {}; if (typeof EV !== "undefined"){ if (!EV && ME) loadEvents(); if (EV) EV.events.forEach(e => { if (!e.starts_at) return; const k = localDate(new Date(e.starts_at)); (evDay[k] = evDay[k] || []).push(e); }); }
    const evChip = e => { const t = new Date(e.starts_at), past = evPast(e); return `<button type="button" class="c-evc${past ? " past" : ""}${e.kind === "watch" ? " w" : ""}" data-ev="${esc(e.id)}" title="${esc(e.title + " · " + evWhen(e))}">${e.kind === "watch" ? ICON.film : ICON.party}<span>${esc(e.title)}</span><small>${t.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"})}</small></button>`; };
    const prefix = `${calY}-${pad(calM+1)}-`;
    const evN = Object.keys(evDay).filter(k => k.startsWith(prefix)).reduce((a, k) => a + evDay[k].length, 0);
    const mi = items.filter(it => (itemDate(it) || "").startsWith(prefix));
    const gN = mi.filter(i => isGame(i) && !relOn(i)).length, kN = mi.filter(i => !isGame(i) && !relOn(i)).length, rN = mi.filter(relOn).length;
    const start = (first.getDay() + 6) % 7, days = new Date(calY, calM + 1, 0).getDate(), cells = Math.ceil((start + days) / 7) * 7, td = today();
    let h = "";
    for (let i = 0; i < cells; i++){
      const d = new Date(calY, calM, i - start + 1), key = localDate(d), evs = byDay[key] || [], n = Math.min(evs.length, 4), ee = evDay[key] || [];
      const tiles = evs.slice(0, 4).map((it, j) => tileHTML(it, j === 3 && evs.length > 4 ? `<span class="c-more">+${evs.length - 3}</span>` : "")).join("");
      h += `<div class="c-day${d.getMonth() !== calM ? " out" : ""}${key === td ? " today" : ""}${n ? " has" : ""}${ee.length ? " has-ev" : ""}" data-day="${key}"><span class="c-num">${d.getDate()}</span>${ee.length ? `<div class="c-evs">${ee.map(evChip).join("")}</div>` : ""}${n ? `<div class="c-tiles n${n}">${tiles}</div>` : ""}</div>`;
    }
    $("aMain").innerHTML = `<div class="c-head"><h1 class="a-h1">${esc(mName.charAt(0).toUpperCase() + mName.slice(1))} <span>${calY}</span></h1>
        <div class="c-arrows"><button type="button" class="ar" id="cPrev" aria-label="Прошлый месяц">‹</button><button type="button" id="cToday">Сегодня</button><button type="button" class="ar" id="cNext" aria-label="Следующий месяц">›</button></div></div>
      ${calWhoBar()}
      <div class="c-sum"><span class="k"><i style="background:var(--c-game)"></i><b>${gN}</b>игр</span><span class="k"><i style="background:var(--c-kino)"></i><b>${kN}</b>кино</span>${rN ? `<span><b>${rN}</b>${plural(rN,"релиз","релиза","релизов")}</span>` : ""}${evN ? `<span class="k"><i style="background:#ff375f"></i><b>${evN}</b>${plural(evN,"встреча","встречи","встреч")}</span>` : ""}<span class="sep"></span>
        <span class="c-legend"><span><i style="background:var(--r-green)"></i>7,5+</span><span><i style="background:var(--r-yel)"></i>5–7</span><span><i style="background:var(--r-red)"></i>до 5</span></span></div>
      <div class="c-dows"><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div></div>
      <div class="c-grid" id="cGrid">${h}</div>
      <p class="c-tip">${canWrite ? "Перетащи обложку на другой день, чтобы поменять дату. Пунктир — дата релиза." : "Клик по обложке открывает карточку."}</p>`;
    $("cPrev").onclick = () => { calM--; if (calM < 0){ calM = 11; calY--; } renderCal(); };
    $("cNext").onclick = () => { calM++; if (calM > 11){ calM = 0; calY++; } renderCal(); };
    $("cToday").onclick = () => { const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); renderCal(); };
  }

  function renderCalFr(){
    const first = new Date(calY, calM, 1), mName = first.toLocaleDateString("ru-RU", {month:"long"});
    const byDay = {}, ents = calEntries(), ord = {done: 0, drop: 1, watch: 2, start: 3};
    ents.forEach(e => (byDay[e.day] = byDay[e.day] || []).push(e));
    Object.values(byDay).forEach(a => a.sort((x, y) => (ord[x.k] - ord[y.k]) || (y.it.rating ?? -1) - (x.it.rating ?? -1)));
    const evDay = {}; if (typeof EV !== "undefined" && EV) EV.events.forEach(e => { if (!e.starts_at) return; const k = localDate(new Date(e.starts_at)); (evDay[k] = evDay[k] || []).push(e); });
    const evChip = e => { const t = new Date(e.starts_at); return `<button type="button" class="c-evc${evPast(e) ? " past" : ""}${e.kind === "watch" ? " w" : ""}" data-ev="${esc(e.id)}" title="${esc(e.title + " · " + evWhen(e))}">${e.kind === "watch" ? ICON.film : ICON.party}<span>${esc(e.title)}</span><small>${t.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"})}</small></button>`; };
    const prefix = `${calY}-${pad(calM+1)}-`, me = ents.filter(e => e.day.startsWith(prefix));
    const n = k => me.filter(e => e.k === k).length;
    const start = (first.getDay() + 6) % 7, days = new Date(calY, calM + 1, 0).getDate(), cells = Math.ceil((start + days) / 7) * 7, td = today();
    let h = "";
    for (let i = 0; i < cells; i++){
      const d = new Date(calY, calM, i - start + 1), key = localDate(d), es = byDay[key] || [], c = Math.min(es.length, 4), ee = evDay[key] || [];
      const tiles = es.slice(0, 4).map((e, j) => calTile(e, j === 3 && es.length > 4 ? `<span class="c-more">+${es.length - 3}</span>` : "")).join("");
      h += `<div class="c-day${d.getMonth() !== calM ? " out" : ""}${key === td ? " today" : ""}${c ? " has" : ""}${ee.length ? " has-ev" : ""}" data-day="${key}"><span class="c-num">${d.getDate()}</span>${ee.length ? `<div class="c-evs">${ee.map(evChip).join("")}</div>` : ""}${c ? `<div class="c-tiles n${c}">${tiles}</div>` : ""}</div>`;
    }
    const all = calUid === "*", who = all ? "" : nickOf(calUid);
    $("aMain").innerHTML = `<div class="c-head"><h1 class="a-h1">${esc(mName.charAt(0).toUpperCase() + mName.slice(1))} <span>${calY}</span></h1>
        <div class="c-arrows"><button type="button" class="ar" id="cPrev" aria-label="Прошлый месяц">‹</button><button type="button" id="cToday">Сегодня</button><button type="button" class="ar" id="cNext" aria-label="Следующий месяц">›</button></div></div>
      ${calWhoBar()}
      <div class="c-sum"><span class="k"><i style="background:var(--c-game)"></i><b>${n("start")}</b>${plural(n("start"), "начал", "начал", "начал")} играть</span><span class="k"><i style="background:var(--r-green)"></i><b>${n("done")}</b>прошёл</span>${n("drop") ? `<span class="k"><i style="background:var(--r-red)"></i><b>${n("drop")}</b>дроп</span>` : ""}<span class="k"><i style="background:var(--c-kino)"></i><b>${n("watch")}</b>посмотрел</span>
        ${!FR ? `<span>Загружаю…</span>` : !me.length ? `<span>${all ? "В этом месяце у всех тихо" : `У ${esc(who)} в этом месяце пусто`}</span>` : ""}</div>
      <div class="c-dows"><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div></div>
      <div class="c-grid c-grid-fr" id="cGrid">${h}</div>
      <p class="c-tip">${all ? "Аватарка на обложке — чья запись. " : ""}Зелёная галочка — прошёл, «ДРОП» — бросил, без значка — начал играть или посмотрел. Клик по обложке открывает карточку.</p>`;
    $("cPrev").onclick = () => { calM--; if (calM < 0){ calM = 11; calY--; } renderCal(); };
    $("cNext").onclick = () => { calM++; if (calM > 11){ calM = 0; calY++; } renderCal(); };
    $("cToday").onclick = () => { const t = new Date(); calY = t.getFullYear(); calM = t.getMonth(); renderCal(); };
  }
  function calOpenFr(key){ const [uid, id] = key.split("/"); if (ME && uid === ME.id) openItem(id); else friendItemSheet(key); }
  function calFrDaySheet(day){
    const ord = {done: 0, drop: 1, watch: 2, start: 3}, list = calEntries().filter(e => e.day === day).sort((x, y) => (ord[x.k] - ord[y.k]));
    if (!list.length) return;
    const s = openSheet(`<h3>${parseD(day).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "long"}).replace(/^./, c => c.toUpperCase())}</h3>
      <p class="sub">${list.length} ${plural(list.length, "запись", "записи", "записей")}</p>
      <div class="cds">${list.map(e => `<button class="cds-c" data-cfi="${esc(calKey(e))}">${posterHTML(e.it, {tgt: false})}<span class="ti">${esc(e.it.title)}</span><small>${avaHTML(profOf(e.it.uid), "xs")} ${esc(nickOf(e.it.uid))} ${esc(CAL_K[e.k])}</small></button>`).join("")}</div>`, {wide: true});
    s.el.addEventListener("click", ev => { const b = ev.target.closest("[data-cfi]"); if (!b) return; ev.stopPropagation(); s.close(); setTimeout(() => calOpenFr(b.dataset.cfi), 60); }, true);
  }
  document.addEventListener("click", e => {
    if (route !== "calendar" || !$("aMain").contains(e.target)) return;
    const w = e.target.closest && e.target.closest("[data-calu]");
    if (w){ calUid = w.dataset.calu || null; renderCal(); return; }
    if (!calUid) return;
    if (e.target.closest("[data-ev]")) return;
    const t = e.target.closest("[data-cfi]"); if (t){ calOpenFr(t.dataset.cfi); return; }
    const d = e.target.closest(".c-day.has"); if (!d) return;
    const list = calEntries().filter(x => x.day === d.dataset.day);
    if (list.length > 1) calFrDaySheet(d.dataset.day); else if (list[0]) calOpenFr(calKey(list[0]));
  });

  // 3.2: день с несколькими играми и фильмами — окно со всеми карточками
  function calDaySheet(day){
    const list = items.filter(i => itemDate(i) === day).sort((x, y) => (relOn(x) - relOn(y)) || (isGame(y) - isGame(x)) || (y.rating ?? -1) - (x.rating ?? -1));
    if (!list.length) return;
    const lbl = it => relOn(it) ? "релиз" : isGame(it) ? (GSTATUS[gStatus(it.status)] || "игра").toLowerCase() : kLab(it).l.toLowerCase();
    const s = openSheet(`<h3>${parseD(day).toLocaleDateString("ru-RU", {weekday: "long", day: "numeric", month: "long"}).replace(/^./, c => c.toUpperCase())}</h3>
      <p class="sub">${list.length} ${plural(list.length, "запись", "записи", "записей")} · выбери, что открыть</p>
      <div class="cds">${list.map(it => `<button class="cds-c" data-id="${esc(it.id)}">${posterHTML(it, {tgt: false})}<span class="ti">${esc(it.title)}</span><small><span class="kd ${isGame(it) ? "g" : "k"}">${isGame(it) ? ICON.pad : ICON.film}</span>${esc(lbl(it))}</small></button>`).join("")}</div>`, {wide: true});
    s.el.addEventListener("click", e => { if (e.target.closest("[data-id]")) s.close(); }, true);
  }
  document.addEventListener("click", e => { if (route !== "calendar" || calUid || $("aMain").contains(e.target) === false) return; const d = e.target.closest && e.target.closest(".c-day.has"); if (!d || e.target.closest("[data-drag]") || e.target.closest("[data-ev]")) return;
    const n = items.filter(i => itemDate(i) === d.dataset.day).length; if (n > 1) calDaySheet(d.dataset.day); else { const it = items.find(i => itemDate(i) === d.dataset.day); if (it) openItem(it.id); } });

