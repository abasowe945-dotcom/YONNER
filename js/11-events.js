  // ================= 2.2: мероприятия =================
  let EV = null, evLoading = null, evAgain = false, viewEv = null;
  const evNotified = new Set();
  const evById = id => EV && EV.events.find(e => e.id === id);
  const evMem = id => EV ? EV.members.filter(m => m.event_id === id) : [];
  const evMy = id => evMem(id).find(m => ME && m.user_id === ME.id);
  const evStart = e => e && e.starts_at ? new Date(e.starts_at) : null;
  const evPast = e => { const s = evStart(e); return !!s && s.getTime() < Date.now() - 6 * 3600e3; };
  const evWhen = e => { const s = evStart(e); if (!s) return "дата не назначена"; return s.toLocaleDateString("ru-RU", {weekday: "short", day: "numeric", month: "long"}) + " · " + s.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"}); };
  const evIn = e => { const s = evStart(e); if (!s) return ""; const d = Math.round((parseD(localDate(s)) - parseD(today())) / 864e5);
    return d < 0 ? "прошло" : d === 0 ? (s < new Date() ? "идёт сейчас" : "сегодня") : d === 1 ? "завтра" : `через ${d} ${plural(d, "день", "дня", "дней")}`; };
  const EV_G = ["linear-gradient(135deg,#5e5ce6,#bf5af2)", "linear-gradient(135deg,#ff375f,#ff9f0a)", "linear-gradient(135deg,#30d158,#0a84ff)", "linear-gradient(135deg,#ff9f0a,#ff375f)", "linear-gradient(135deg,#64d2ff,#5e5ce6)"];
  const evBg = e => e.photo ? `url('${publicUrl(e.photo)}')` : EV_G[(e.title || "").length % EV_G.length];
  // формат фото мероприятия и его масштаб/сдвиг (как у обложек)
  const EV_FMT = {wide: {t: "Горизонтально", r: "16:9", w: 1600, h: 900}, story: {t: "Как сториз", r: "9:16", w: 1080, h: 1920}, square: {t: "Квадрат", r: "1:1", w: 1080, h: 1080}};
  const evFmt = e => e && EV_FMT[e.photo_fmt] ? e.photo_fmt : "wide";
  const evPos = e => e && e.photo_pos && typeof e.photo_pos === "object" ? e.photo_pos : null;
  const evImg = e => e && e.photo ? `<img alt="" src="${publicUrl(e.photo)}" style="${posStyle(evPos(e))}" draggable="false">` : "";
  // картинка ровно в выбранном формате и кадре — для Телеграма и сториз
  async function evCrop(e){
    const F = EV_FMT[evFmt(e)], p = {x: 50, y: 50, s: 1, ...(evPos(e) || {})};
    const r = await fetch(publicUrl(e.photo), {mode: "cors"}); if (!r.ok) throw new Error("нет картинки");
    const im = await createImageBitmap(await r.blob()), W = F.w, H = F.h, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"), k = Math.max(W / im.width, H / im.height), dw = im.width * k, dh = im.height * k;
    const ox = (W - dw) * p.x / 100, oy = (H - dh) * p.y / 100, cx = W * p.x / 100, cy = H * p.y / 100;
    x.imageSmoothingQuality = "high"; x.drawImage(im, cx + (ox - cx) * p.s, cy + (oy - cy) * p.s, dw * p.s, dh * p.s);
    return await new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error("пусто")), "image/png"));
  }
  const myInvites = () => EV && ME ? EV.members.filter(m => m.user_id === ME.id && m.status === "invited" && evById(m.event_id) && !evPast(evById(m.event_id))) : [];
  async function loadEvents(force){
    if (!SB || !ME) return null;
    if (EV && !force && Date.now() - EV.at < 30000) return EV;
    if (evLoading){ if (force) evAgain = true; return evLoading; }
    evLoading = (async () => {
      try {
        const [e, m, p, l] = await Promise.all([fetchAll(() => SB.from("events").select("*"), ["id"]), fetchAll(() => SB.from("event_members").select("*"), ["event_id", "user_id"]), fetchAll(() => SB.from("event_posts").select("*"), ["id"]), fetchAll(() => SB.from("event_post_likes").select("*"), ["post_id", "user_id"])]);
        if (e.error) throw e.error; if (m.error) throw m.error; if (p.error) throw p.error;
        EV = {at: Date.now(), events: e.data || [], members: m.data || [], posts: p.data || [], likes: l.error ? [] : (l.data || [])};
      } catch(err){ logErr("загрузка мероприятий", err); if (!EV) EV = {at: Date.now(), events: [], members: [], posts: [], failed: true}; }
      evLoading = null; checkInvites(); render(); if (typeof plRedraw === "function" && typeof PL !== "undefined" && PL) plRedraw();
      if (evAgain){ evAgain = false; loadEvents(true); }
      return EV;
    })();
    return evLoading;
  }
  function subscribeEvents(){
    if (!SB || !ME) return;
    SB.channel("nexus-events")
      .on("postgres_changes", {event: "*", schema: "public", table: "events"}, () => rtLater("ev", () => loadEvents(true), 300))
      .on("postgres_changes", {event: "*", schema: "public", table: "event_members"}, p => { const n = p.new;
        const after = () => { if (p.eventType === "INSERT" && n && n.user_id === ME.id && n.status === "invited" && n.invited_by !== ME.id) notifyInvite(n); };
        if (EV && rtPatch(EV.members, p, ["event_id", "user_id"]) && (!n || evById(n.event_id))){ rtLater("evr", () => { checkInvites(); render(); }); after(); }
        else loadEvents(true).then(after); })
      .on("postgres_changes", {event: "*", schema: "public", table: "event_posts"}, p => { if (EV && rtPatch(EV.posts, p, ["id"])) rtLater("evr", () => render()); else rtLater("ev", () => loadEvents(true), 300); })
      .on("postgres_changes", {event: "*", schema: "public", table: "event_post_likes"}, p => { if (EV && rtPatch(EV.likes, p, ["post_id", "user_id"])) rtLater("evr", () => render()); else rtLater("ev", () => loadEvents(true), 300); })
      .on("postgres_changes", {event: "INSERT", schema: "public", table: "profiles"}, p => { const n = p.new; if (!n || n.user_id === ME.id) return;
        toast(`${n.nick || "Кто-то новый"} присоединился к NEXUS`); SND.click(); sysNote("NEXUS · новенький", `${n.nick || "Кто-то"} теперь на сайте`, () => go("user:" + n.user_id)); loadFriends(true); })
      .subscribe();
  }
  // системное уведомление: через service worker (Android и приложение на экране «Домой» на iPhone), иначе — как раньше (компьютер)
  const noteClicks = new Map();
  const sysNote = (title, body, onClick) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const tag = "n" + Date.now() + Math.random().toString(36).slice(2, 6); if (onClick) noteClicks.set(tag, onClick);
    const opts = {body, icon: "icon-192.png", badge: "icon-192.png", tag, lang: "ru"};
    const old = () => { try { const n = new Notification(title, opts); n.onclick = () => { window.focus(); const f = noteClicks.get(tag); f && f(); n.close(); }; } catch(e){ logErr("уведомление", e); } };
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(e => { logErr("уведомление через service worker", e); old(); });
    else old();
  };
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { const t = e.data && e.data.nexusNote, f = t && noteClicks.get(t); if (f){ noteClicks.delete(t); f(); } });
  function notifyInvite(m){
    const e = evById(m.event_id); if (!e || evNotified.has(e.id)) return; evNotified.add(e.id); lsSet("nexus_inv_" + e.id, "1");
    const t = `${frNick(m.invited_by || e.owner)} зовёт тебя: ${e.title}`;
    toast(e.kind === "watch" ? `${frNick(m.invited_by || e.owner)} зовёт смотреть: ${(e.film && e.film.title) || e.title}` : t); SND.click(); sysNote("NEXUS · приглашение", `${t}\n${evWhen(e)}`, () => go(evRoute(e)));
  }
  function checkInvites(){
    if (!EV || !ME) return;
    myInvites().forEach(m => { if (!evNotified.has(m.event_id) && !lsGet("nexus_inv_" + m.event_id)) notifyInvite(m); else evNotified.add(m.event_id); });
    EV.members.filter(m => m.user_id === ME.id && m.status === "going").forEach(m => { const e = evById(m.event_id), s = evStart(e); if (!s) return;
      const h = (s - Date.now()) / 36e5, k = "nexus_rem_" + e.id; if (h > 0 && h < 24 && !lsGet(k)){ lsSet(k, "1"); toast(`Скоро: ${e.title}, ${evWhen(e)}`); sysNote("NEXUS · скоро мероприятие", `${e.title}\n${evWhen(e)}`, () => go("event:" + e.id)); } });
  }
  async function rsvp(id, st){
    const {error} = await SB.from("event_members").upsert({event_id: id, user_id: ME.id, status: st, updated_at: now()});
    if (error){ toast("Не сохранилось: " + error.message); return; }
    evNotified.add(id); toast(st === "going" ? "Ты идёшь" : "Езжайте без тебя"); if (st === "going") confetti(); await loadEvents(true);
  }
  function eventsCard(){
    if (!EV){ loadEvents(); return `<div class="fb-card ev-card"><h3>${ICON.party} Мероприятия</h3><p class="a-sub" style="margin:0;font-size:13px">Загружаю…</p></div>`; }
    const inv = myInvites(), MON = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    const up = EV.events.filter(e => e.kind !== "watch" && !evPast(e)).sort((a, b) => (a.starts_at || "9").localeCompare(b.starts_at || "9"));
    const past = EV.events.filter(e => e.kind !== "watch" && evPast(e)).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
    const th = e => { const s = evStart(e); return `<span class="ev-th" style="--g:${e.photo ? "#2c2c2e" : evBg(e)}">${e.photo ? evImg(e) : s ? `<small>${MON[s.getMonth()]}</small><b>${s.getDate()}</b>` : `<b>?</b>`}</span>`; };
    const row = e => { const go_ = evMem(e.id).filter(m => m.status === "going"); return `<button class="ev-row${evPast(e) ? " past" : ""}" data-ev="${esc(e.id)}">${th(e)}<span class="t"><b>${esc(e.title)}</b><small>${esc(evIn(e) || evWhen(e))}${go_.length ? ` · ${go_.length} ${plural(go_.length, "идёт", "идут", "идут")}` : ""}</small></span>${go_.length ? avaStack(go_.map(m => m.user_id), 3) : ""}</button>`; };
    const note = "Notification" in window && Notification.permission === "default" ? `<button class="ev-note" data-notif="1">Включить уведомления о приглашениях</button>` : "";
    return `<div class="fb-card ev-card"><h3>${ICON.party} Мероприятия<a class="v6-all" href="#events">все ›</a><button class="ev-add" data-evnew="1" title="Создать мероприятие" aria-label="Создать мероприятие">+</button></h3>
      ${inv.filter(m => evById(m.event_id).kind !== "watch").map(m => { const e = evById(m.event_id); return `<div class="ev-inv"><div class="k">${esc(frNick(m.invited_by || e.owner))} зовёт</div>${row(e)}<div class="acts"><button class="ib green" data-rsvp="${esc(e.id)}:going">Иду</button><button class="ib" data-rsvp="${esc(e.id)}:not">Езжайте</button></div></div>`; }).join("")}
      <div class="ev-scroll">${up.filter(e => !inv.some(m => m.event_id === e.id)).map(row).join("")}</div>${past.length ? `<details class="ev-arch"><summary>Архив<small>${past.length} ${plural(past.length, "прошедшее", "прошедших", "прошедших")}</small></summary><div class="ev-scroll">${past.map(row).join("")}</div></details>` : ""}
      ${EV.events.some(e => e.kind !== "watch") ? "" : `<p class="a-sub" style="margin:0 0 10px;font-size:13px">Пока ничего не запланировано. Кино, катка, шашлыки — позови всех.</p><button class="ib blue bd-set" data-evnew="1">Создать мероприятие</button>`}
      ${note}</div>`;
  }
  // 6.0: ближайшие мероприятия — на главной и на своей странице
  const evDaysTo = e => { const s = evStart(e); return s ? Math.round((parseD(localDate(s)) - parseD(today())) / 864e5) : null; };
  const evBig = e => { const d = evDaysTo(e); if (d === null) return {n: "?", l: ""}; if (d < 0) return {n: "", l: "прошло"}; if (d === 0) return {n: "0", l: evIn(e)}; return {n: String(d), l: plural(d, "день", "дня", "дней")}; };
  function evTile(e, o = {}){
    const s = evStart(e), mem = evMem(e.id), go_ = mem.filter(m => m.status === "going"), my = evMy(e.id), b = evBig(e), past = evPast(e);
    const MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const myL = my ? (my.status === "going" ? `<span class="v6-ev-me go">Ты идёшь</span>` : my.status === "not" ? `<span class="v6-ev-me no">Не идёшь</span>` : `<span class="v6-ev-me inv">Зовут тебя</span>`) : "";
    return `<button type="button" class="v6-ev${past ? " past" : ""}${o.big ? " big" : ""}" data-ev="${esc(e.id)}">
      <span class="v6-ev-ph" style="--g:${e.photo ? "#2c2c2e" : evBg(e)}">${e.photo ? evImg(e) : ""}<span class="v6-ev-d">${s ? `<b>${s.getDate()}</b><small>${MON[s.getMonth()]}</small>` : `<b>?</b>`}</span></span>
      <span class="v6-ev-t"><b>${esc(e.title)}</b><small>${esc(evWhen(e))}${e.place ? " · " + esc(e.place) : ""}</small><span class="v6-ev-m">${go_.length ? avaStack(go_.map(m => m.user_id), 4) : ""}<span>${go_.length ? `${go_.length} ${plural(go_.length, "идёт", "идут", "идут")}` : "пока никто не отметился"}</span>${myL}</span></span>
      ${past ? "" : `<span class="v6-ev-c"><b>${b.n}</b><small>${esc(b.l)}</small></span>`}</button>`;
  }
  function evNextCard(){
    if (!EV){ loadEvents(); return `<div class="pf-card v6-evn"><h3>${ICON.party}Ближайшие мероприятия</h3><p class="pf-mute">Загружаю…</p></div>`; }
    const up = EV.events.filter(e => e.kind !== "watch" && !evPast(e)).sort((a, b) => (a.starts_at || "9").localeCompare(b.starts_at || "9"));
    return `<div class="pf-card v6-evn"><h3>${ICON.party}Ближайшие мероприятия<small><a href="#events">все ›</a></small></h3>
      ${up.length ? up.slice(0, 3).map(e => evTile(e)).join("") : `<p class="pf-mute">Ничего не запланировано.</p>`}
      <button type="button" class="v6-ev-add" data-evnew="1">${ICON.plus || "+"}Создать мероприятие</button></div>`;
  }
  // ================= 7.29: «Мероприятия» в стиле сайта — афиша, большие карточки, заведения =================
  const E7_MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const E7_WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  let e7Tab = "up";
  // заведение, к которому привязано мероприятие (если заведения ещё не загружены — догружаем)
  function evPlace(e){
    if (!e || !e.place_id) return null;
    if (typeof PL === "undefined") return null;
    if (!PL){ if (typeof loadPlaces === "function" && !evPlace.asked){ evPlace.asked = 1; loadPlaces().then(() => { if (/^event/.test(route)) render(); }); } return null; }
    return PL.places.find(x => x.id === e.place_id) || null;
  }
  const evPlaceName = e => { const pl = evPlace(e); return pl ? pl.name : e.place || ""; };
  const e7Pl = (e, cls = "") => { const pl = evPlace(e), nm = evPlaceName(e); if (!nm) return "";
    return pl ? `<span class="e7-pl${cls}" role="link" tabindex="0" data-e7pl="${esc(pl.id)}" title="Открыть заведение">${ICON.pin}${esc(nm)}</span>` : `<span class="e7-pl plain${cls}">${ICON.pin}${esc(nm)}</span>`; };
  function e7Card(e, o = {}){
    const s = evStart(e), go_ = evMem(e.id).filter(m => m.status === "going"), my = evMy(e.id), past = evPast(e), d = evDaysTo(e);
    const cd = past ? "прошло" : d === null ? "без даты" : d === 0 ? (s < new Date() ? "идёт сейчас" : "сегодня") : d === 1 ? "завтра" : `через ${d} ${plural(d, "день", "дня", "дней")}`;
    const myL = my ? (my.status === "going" ? `<span class="e7-me go">${past ? "Был" : "Ты идёшь"}</span>` : my.status === "not" ? `<span class="e7-me no">Не иду</span>` : `<span class="e7-me inv">Зовут тебя</span>`) : "";
    return `<button type="button" class="e7-card${past ? " past" : ""}${o.cls ? " " + o.cls : ""}" data-ev="${esc(e.id)}">
      <span class="e7-media" style="--g:${e.photo ? "#15151a" : evBg(e)}">${e.photo ? evImg(e) : `<i class="e7-pat"></i>`}
        <span class="e7-date">${s ? `<b>${s.getDate()}</b><small>${E7_MON[s.getMonth()]}</small>` : "<b>?</b>"}</span>
        <span class="e7-cd${!past && d !== null && d <= 1 ? " hot" : ""}">${esc(cd)}</span></span>
      <span class="e7-body"><b class="e7-t">${esc(e.title)}</b>
        <small class="e7-when">${s ? `${E7_WD[s.getDay()]} · ${pad(s.getHours())}:${pad(s.getMinutes())}` : "дата не назначена"}${evPlaceName(e) ? ` · ${esc(evPlaceName(e))}` : ""}</small>
        <span class="e7-foot">${go_.length ? avaStack(go_.map(m => m.user_id), 5) : ""}<span class="e7-n">${go_.length ? `${go_.length} ${plural(go_.length, past ? "был" : "идёт", past ? "были" : "идут", past ? "были" : "идут")}` : past ? "никто не отметился" : "пока никто"}</span>${myL}</span></span></button>`;
  }
  function e7Hero(e){
    const s = evStart(e), d = evDaysTo(e), go_ = evMem(e.id).filter(m => m.status === "going"), my = evMy(e.id);
    const big = d === null ? "?" : d <= 0 ? (s < new Date() ? "LIVE" : "0") : String(d), lab = d === null ? "дата не назначена" : d <= 0 ? (s < new Date() ? "идёт сейчас" : "сегодня") : plural(d, "день", "дня", "дней");
    return `<section class="e7-hero" data-ev="${esc(e.id)}" role="link" tabindex="0">
      <div class="e7-hero-bg" style="--g:${e.photo ? "#101014" : evBg(e)}">${e.photo ? `<div class="e7-hero-blur" style="background-image:url('${publicUrl(e.photo)}')"></div>${evImg(e)}` : `<i class="e7-pat"></i>`}</div>
      <div class="e7-hero-in"><span class="e7-kick">Ближайшее</span><h2>${esc(e.title)}</h2>
        <div class="e7-chips"><span class="e7-chip">${ICON.calendar}${esc(evWhen(e))}</span>${e7Pl(e, " e7-chip")}</div>
        <div class="e7-hero-m">${go_.length ? avaStack(go_.map(m => m.user_id), 7) : ""}<span>${go_.length ? `${go_.length} ${plural(go_.length, "идёт", "идут", "идут")}` : "Пока никто не отметился"}</span></div>
        <div class="e7-rsvp"><button type="button" class="e7-btn go" data-rsvp="${esc(e.id)}:going" aria-pressed="${!!my && my.status === "going"}">✓ Иду</button><button type="button" class="e7-btn" data-rsvp="${esc(e.id)}:not" aria-pressed="${!!my && my.status === "not"}">Езжайте</button></div></div>
      <div class="e7-count"><b>${big}</b><small>${esc(lab)}</small></div></section>`;
  }
  function renderEvents(){
    appleHead("Мероприятия", `<button class="a-link" data-go="people">‹ Активность</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!EV){ $("aMain").innerHTML = `<p class="a-sub">Загружаю…</p>`; loadEvents(); return; }
    const all = EV.events.filter(e => e.kind !== "watch");
    const inv = myInvites().filter(m => evById(m.event_id).kind !== "watch").map(m => m.event_id);
    const up = all.filter(e => !evPast(e)).sort((a, b) => (a.starts_at || "9").localeCompare(b.starts_at || "9"));
    const past = all.filter(e => evPast(e)).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
    const mineGo = all.filter(e => { const m = evMy(e.id); return m && m.status === "going"; });
    const hero = up.find(e => evStart(e)) || up[0] || null, rest = up.filter(e => e !== hero && !inv.includes(e.id));
    const byM = {}; past.forEach(e => { const k = e.starts_at.slice(0, 7); (byM[k] = byM[k] || []).push(e); });
    const MN = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const tab = (k, l, n) => `<button type="button" role="tab" data-e7tab="${k}" aria-selected="${e7Tab === k}">${l}<i>${n}</i></button>`;
    const list = e7Tab === "past" ? (past.length ? Object.keys(byM).map(k => `<div class="e7-mon"><b>${MN[+k.slice(5) - 1]}</b><span>${k.slice(0, 4)}</span><i>${byM[k].length}</i></div><div class="e7-grid">${byM[k].map(e => e7Card(e)).join("")}</div>`).join("") : `<div class="e7-empty"><b>Архив пуст</b>Прошедшие встречи соберутся здесь.</div>`)
      : e7Tab === "mine" ? (mineGo.length ? `<div class="e7-grid">${mineGo.sort((a, b) => (b.starts_at || "").localeCompare(a.starts_at || "")).map(e => e7Card(e)).join("")}</div>` : `<div class="e7-empty"><b>Ты пока никуда не идёшь</b>Открой встречу и жми «Иду».</div>`)
      : (rest.length ? `<div class="e7-grid">${rest.map(e => e7Card(e)).join("")}</div>` : hero ? "" : `<div class="e7-empty"><b>Ничего не запланировано</b>Кино, катка, шашлыки, ДР — позови всех.<button type="button" class="e7-btn go" data-evnew="1">${ICON.plus}Создать мероприятие</button></div>`);
    $("aMain").innerHTML = `<div class="e7">
      <header class="e7-top"><div class="e7-ttl"><span class="e7-kick">NEXUS // встречи</span><h1>Мероприятия</h1></div>
        <div class="e7-stats"><span><b>${up.length}</b>скоро</span><span><b>${past.length}</b>прошло</span><span><b>${mineGo.length}</b>ты идёшь</span></div>
        <div class="e7-acts"><a class="e7-btn" href="#calendar">${ICON.calendar}<span>Календарь</span></a><button type="button" class="e7-btn go" data-evnew="1">${ICON.plus}<span>Создать</span></button></div></header>
      ${inv.length ? `<div class="e7-sec"><h2>Тебя зовут<i>${inv.length}</i></h2></div><div class="e7-invs">${inv.map(id => { const e = evById(id), m = evMy(id); return `<div class="e7-inv"><div class="k">${avaHTML(profOf(m.invited_by || e.owner), "sm")}<b>${esc(frNick(m.invited_by || e.owner))}</b> зовёт</div>${e7Card(e, {cls: "row"})}<div class="e7-rsvp"><button type="button" class="e7-btn go" data-rsvp="${esc(e.id)}:going">✓ Иду</button><button type="button" class="e7-btn" data-rsvp="${esc(e.id)}:not">Езжайте</button></div></div>`; }).join("")}</div>` : ""}
      ${hero && e7Tab === "up" && !inv.includes(hero.id) ? e7Hero(hero) : ""}
      <div class="e7-tabs" role="tablist">${tab("up", "Скоро", up.length)}${tab("past", "Прошедшие", past.length)}${tab("mine", "Я иду", mineGo.length)}</div>
      ${list}</div>`;
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-e7tab]"); if (!b) return; e7Tab = b.dataset.e7tab; render(); });
  // клик по заведению в мероприятии — открываем его карточку (поверх, без ухода со страницы)
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-e7pl]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (typeof plOpenSheet === "function" && PL) plOpenSheet(b.dataset.e7pl); else go("place:" + b.dataset.e7pl);
  }, true);
  const vkDate = ts => { const d = new Date(ts), t = d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"}), k = localDate(d);
    return (k === today() ? "сегодня" : k === addDays(today(), -1) ? "вчера" : d.toLocaleDateString("ru-RU", {day: "numeric", month: "long"})) + " в " + t; };
  let wallDraft = {id: null, text: "", file: null};
  function renderEvent(){
    appleHead("Мероприятие", `<button class="a-link" data-go="events">‹ Мероприятия</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!EV){ $("aMain").innerHTML = `<p class="a-sub">Загружаю…</p>`; loadEvents(); return; }
    const e = evById(viewEv);
    if (!e){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Мероприятие не найдено</b>Возможно, его удалили.</div>`; return; }
    if (!FR) loadFriends();
    const act = document.activeElement, wasF = act && act.id === "vkT", sel = wasF ? act.selectionStart : null;
    const mem = evMem(e.id), my = evMy(e.id), own = e.owner === ME.id;
    const goL = mem.filter(m => m.status === "going"), noL = mem.filter(m => m.status === "not"), invL = mem.filter(m => m.status === "invited");
    const posts = EV.posts.filter(p => p.event_id === e.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const nick = uid => uid === ME.id ? "Ты" : profOf(uid).nick;
    const pl = evPlace(e), d = evDaysTo(e), s0 = evStart(e), past = evPast(e);
    const big = d === null ? "?" : past ? "✓" : d <= 0 ? (s0 < new Date() ? "LIVE" : "0") : String(d), lab = d === null ? "дата не назначена" : past ? "прошло" : d <= 0 ? (s0 < new Date() ? "идёт сейчас" : "сегодня") : plural(d, "день", "дня", "дней");
    const plSc = pl && typeof plScore === "function" ? plScore(pl.id) : null;
    const venue = pl ? `<section class="e7-box e7-venue"><h3>${ICON.pin}Заведение</h3>
        <button type="button" class="e7-vn" data-e7pl="${esc(pl.id)}"><span class="ph">${pl.photo && typeof plImg === "function" ? `<img alt="" src="${esc(plImg(pl))}" onerror="this.remove()">` : ICON.pin}</span>
          <span class="t"><b>${esc(pl.name)}</b><small>${esc([typeof plKindL === "function" ? plKindL(pl.kind) : "", pl.address].filter(Boolean).join(" · "))}</small></span>
          ${plSc != null ? `<span class="sc ${typeof plCls === "function" ? plCls(plSc) : ""}">${num1(plSc)}</span>` : `<span class="sc none">—</span>`}</button>
        <div class="e7-vn-a"><button type="button" class="e7-btn sm" data-e7pl="${esc(pl.id)}">Карточка места</button>${pl.gis_url ? `<a class="e7-btn sm" href="${esc(pl.gis_url)}" target="_blank" rel="noopener">2ГИС</a>` : ""}</div></section>`
      : e.place ? `<section class="e7-box e7-venue"><h3>${ICON.pin}Где</h3><p class="e7-txt">${esc(e.place)}</p><div class="e7-vn-a"><a class="e7-btn sm" href="https://yandex.ru/maps/?text=${encodeURIComponent("Якутск " + e.place)}" target="_blank" rel="noopener">На карте</a>${own ? `<button type="button" class="e7-btn sm" data-evedit="${esc(e.id)}">Привязать заведение</button>` : ""}</div></section>` : "";
    const mrow = (arr, cls, t) => `<div class="e7-mg ${cls}"><h4>${t}<i>${arr.length}</i></h4>${arr.length ? arr.map(m => `<button type="button" class="e7-mp" ${m.user_id !== ME.id ? `data-user="${esc(m.user_id)}"` : ""}>${avaHTML(profOf(m.user_id), "sm")}<span>${esc(nick(m.user_id))}</span>${m.user_id === e.owner ? "<small>организатор</small>" : ""}</button>`).join("") : `<p class="e7-none">никого</p>`}</div>`;
    const wall = `<section class="e7-box e7-wall vk"><h3>${ICON.chat || ""}Стена<small>${posts.length} ${plural(posts.length, "запись", "записи", "записей")}</small></h3>
      <div class="vk-form e7-form">${avaHTML(profOf(ME.id), "sm")}<div class="e7-fw"><textarea id="vkT" maxlength="2000" placeholder="Написать на стене… @ник — позвать"></textarea>
        <div class="vk-tools"><span class="vk-emo">${EMO.map(([k, ch, l]) => `<button type="button" data-emo="${ch}" title="${l}" aria-label="${l}">${emoSpan(k)}</button>`).join("")}</span>
          <label class="vk-att e7-btn sm" for="vkF">${ICON.img || ""}Картинка</label><input type="file" id="vkF" accept="image/*" hidden><span class="vk-prev" id="vkP"></span>
          <button type="button" class="vk-btn e7-btn go sm" id="vkGo">Отправить</button></div></div></div>
      ${posts.length ? posts.map(p => { const lk = likesOf(p.id), on = lk.some(l => l.user_id === ME.id);
        return `<article class="vk-post e7-post">${avaHTML(profOf(p.user_id), "sm")}<div class="b"><div class="h"><button type="button" class="vk-n" ${p.user_id !== ME.id ? `data-user="${esc(p.user_id)}"` : ""}>${esc(profOf(p.user_id).nick || "кто-то")}</button><small>${vkDate(p.created_at)}</small></div>
        ${p.body ? `<div class="vk-t${onlyEmo(p.body) ? " big" : ""}">${richText(p.body)}</div>` : ""}${p.image ? `<img class="vk-img" src="${publicUrl(p.image)}" alt="" data-vkimg="${esc(p.image)}" loading="lazy">` : ""}
        <div class="vk-d"><button type="button" class="vk-like${on ? " on" : ""}" data-like="${esc(p.id)}" title="${esc(lk.length ? "Понравилось: " + lk.map(l => profOf(l.user_id).nick).join(", ") : "Мне нравится")}">♥ ${lk.length || ""}</button>${lk.length ? `<span class="vk-lk">${lk.slice(0, 6).map(l => avaHTML(profOf(l.user_id))).join("")}</span>` : ""}${p.user_id === ME.id || own ? `<button type="button" class="e7-del" data-vkdel="${esc(p.id)}">удалить</button>` : ""}</div></div></article>`; }).join("") : `<div class="vk-empty e7-none">На стене пусто. Напиши первым — кто что берёт, во сколько собираемся.</div>`}</section>`;
    $("aMain").innerHTML = `<div class="e7p">
      <section class="e7p-hero${e.photo ? " ph-" + evFmt(e) : ""}">
        <div class="e7-hero-bg" style="--g:${e.photo ? "#101014" : evBg(e)}">${e.photo ? `<div class="e7-hero-blur" style="background-image:url('${publicUrl(e.photo)}')"></div>${evFmt(e) === "wide" ? evImg(e) : ""}` : `<i class="e7-pat"></i>`}</div>
        ${e.photo && evFmt(e) !== "wide" ? `<div class="e7p-pic">${evImg(e)}</div>` : ""}
        <div class="e7p-in"><span class="e7-kick">${esc(evWhen(e))}</span><h1>${esc(e.title)}</h1>
          <div class="e7-chips">${e7Pl(e, " e7-chip")}<span class="e7-chip">${avaHTML(profOf(e.owner), "xs")}организатор: ${esc(own ? "ты" : profOf(e.owner).nick || "кто-то")}</span></div>
          ${my && my.status === "invited" ? `<div class="e7-ask">${esc(frNick(my.invited_by || e.owner))} зовёт тебя. Пойдёшь?</div>` : ""}
          <div class="e7-rsvp"><button type="button" class="e7-btn go" data-rsvp="${esc(e.id)}:going" aria-pressed="${!!my && my.status === "going"}">✓ ${past ? "Был" : "Иду"}</button><button type="button" class="e7-btn" data-rsvp="${esc(e.id)}:not" aria-pressed="${!!my && my.status === "not"}">${past ? "Не был" : "Езжайте"}</button></div></div>
        <div class="e7-count"><b>${big}</b><small>${esc(lab)}</small></div></section>
      <div class="e7p-acts"><button type="button" class="e7-btn" data-evinv="${esc(e.id)}">${ICON.people}Пригласить</button><button type="button" class="e7-btn tg" data-tgcopy="event:${esc(e.id)}" title="Скопировать приглашение для Телеграма"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M21.6 4.3 18.4 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L5.9 13.2 1 11.7c-1-.3-1.1-1 .2-1.5L20.2 2.9c.9-.3 1.7.2 1.4 1.4Z"/></svg>Для Телеграма</button>${e.photo ? `<button type="button" class="e7-btn" data-tgposter="${esc(e.id)}" title="Скопировать картинку мероприятия — вставь в Телеграм, а текст в подпись">${ICON.img || ""}Картинка</button>` : ""}<a class="e7-btn" href="#calendar">${ICON.calendar}Календарь</a>${own ? `<span class="sp"></span><button type="button" class="e7-btn" data-evedit="${esc(e.id)}">${ICON.edit}Изменить</button><button type="button" class="e7-btn red" data-evdel="${esc(e.id)}">Удалить</button>` : ""}</div>
      <div class="e7p-grid"><div class="e7p-main">
        ${e.descr ? `<section class="e7-box"><h3>${ICON.info || ""}О встрече</h3><div class="e7-txt">${richText(e.descr)}</div></section>` : ""}
        ${venue}${wall}</div>
        <aside class="e7p-side"><section class="e7-box e7-mem"><h3>${ICON.people}Кто идёт<small>${goL.length} из ${mem.length}</small></h3>${mrow(goL, "go", past ? "Были" : "Идут")}${mrow(invL, "inv", "Приглашены")}${mrow(noL, "no", "Не идут")}</section></aside>
      </div></div>`;
    wireWall(e, wasF, sel);
  }
  function wireWall(e, wasF, sel){
    const t = $("vkT"); if (!t) return;
    if (wallDraft.id !== e.id) wallDraft = {id: e.id, text: "", file: null};
    t.value = wallDraft.text; t.oninput = () => wallDraft.text = t.value;
    if (wasF){ t.focus(); t.setSelectionRange(sel ?? t.value.length, sel ?? t.value.length); }
    const prev = () => { $("vkP").innerHTML = wallDraft.file ? `<img src="${URL.createObjectURL(wallDraft.file)}" alt=""><a data-vkrm="1">убрать</a>` : ""; };
    const take = f => { if (!f || !f.type.startsWith("image/")) return; wallDraft.file = f; prev(); };
    prev();
    $("vkF").onchange = ev => take(ev.target.files[0]);
    $("vkP").onclick = ev => { if (ev.target.closest("[data-vkrm]")){ wallDraft.file = null; prev(); } };
    pasteTarget = take; bindDrop(document.querySelector(".vk-form"), take);
    document.querySelector(".vk-emo").onclick = ev => { const b = ev.target.closest("[data-emo]"); if (!b) return;
      const a = t.selectionStart ?? t.value.length, z = t.selectionEnd ?? a; t.value = t.value.slice(0, a) + b.dataset.emo + t.value.slice(z); wallDraft.text = t.value;
      t.focus(); const p = a + b.dataset.emo.length; t.setSelectionRange(p, p); };
    const send = async () => {
      const body = t.value.trim(); if (!body && !wallDraft.file){ t.focus(); return; }
      const btn = $("vkGo"); btn.disabled = true; btn.textContent = "Отправляю…";
      try {
        const image = wallDraft.file ? await upload(wallDraft.file) : null;
        const {error} = await SB.from("event_posts").insert({id: crypto.randomUUID(), event_id: e.id, user_id: ME.id, body: body || null, image, created_at: now()});
        if (error) throw error;
        if (body) notify(mentionedUids(body), "mention_event", evRoute(e), body);
        wallDraft.text = ""; wallDraft.file = null; await loadEvents(true);
      } catch(err){ toast("Не отправилось: " + ((err && err.message) || err)); btn.disabled = false; btn.textContent = "Отправить"; }
    };
    $("vkGo").onclick = send;
    t.addEventListener("keydown", ev => { if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); send(); } });
  }
  function eventSheet(e, o = {}){
    if (!ME || !assets) return;
    let placeId = e ? e.place_id || null : o.place_id || null; const place0 = e ? e.place_id || null : null;
    const isNew = !e; let file = null, removed = false, fmt = evFmt(e), pos = {x: 50, y: 50, s: 1, ...(evPos(e) || {})}; const photo0 = e ? e.photo : null;
    let url = photo0 ? publicUrl(photo0) : "";
    const s0 = evStart(e), others = FR ? FR.profiles.filter(p => p.user_id !== ME.id) : [];
    const s = openSheet(`<h3>${isNew ? "Новое мероприятие" : "Изменить мероприятие"}</h3><p class="sub">Нужно только название. Фото, место и описание — по желанию.</p>
      <div class="evf" id="evFm" role="group" aria-label="Формат фото">${Object.entries(EV_FMT).map(([k, v]) => `<button type="button" data-fmt="${k}" aria-pressed="${k === fmt}"><i class="r-${k}"></i><b>${v.t}</b><small>${v.r}</small></button>`).join("")}</div>
      <div class="ev-ph" id="evPh" role="button" tabindex="0"></div><input type="file" id="evF" accept="image/*" hidden>
      <div class="ev-zoom" id="evZ"><label>Масштаб<input type="range" id="evS" min="1" max="3" step="0.01"></label><button type="button" class="ib" id="evRe">Сбросить</button><button type="button" class="ib" id="evCh">Заменить</button><button type="button" class="ib red" id="evRm">Убрать</button></div>
      <label class="f">Название<input class="in" id="evT" maxlength="80" placeholder="Кино в пятницу" value="${esc(e ? e.title : "")}"></label>
      <div class="ev-two"><label class="f">Дата<input class="in" type="date" id="evD" placeholder="Выбрать дату" value="${s0 ? localDate(s0) : ""}"></label><label class="f">Время<input class="in" type="time" id="evTm" value="${s0 ? pad(s0.getHours()) + ":" + pad(s0.getMinutes()) : "19:00"}"></label></div>
      <div class="e7-plpk"><div class="av-lb">Заведение с карты <small>по желанию — тогда встреча появится в карточке места</small></div><div id="evPlS"></div><input class="in" id="evPlQ" placeholder="Найти заведение по названию…" autocomplete="off"><div class="e7-plst" id="evPlL"></div></div>
      <label class="f">Место текстом<input class="in" id="evPl" maxlength="200" placeholder="Адрес, если места нет на карте" value="${esc(e ? e.place || "" : o.place_id && typeof PL !== "undefined" && PL && PL.places.find(x => x.id === o.place_id) ? PL.places.find(x => x.id === o.place_id).name : "")}"></label>
      <label class="f">Описание<textarea class="in" id="evDs" maxlength="3000" placeholder="Что будем делать, что взять с собой">${esc(e ? e.descr || "" : "")}</textarea></label>
      ${isNew && others.length ? `<div class="av-lb">Позвать друзей</div><div class="ev-pick" id="evPk">${others.map(p => `<button type="button" data-u="${esc(p.user_id)}" aria-pressed="false">${avaHTML(p)}${esc(p.nick)}</button>`).join("")}</div>` : ""}
      <div class="acts"><button class="ib blue" id="evOk">${isNew ? "Создать" : "Сохранить"}</button><button class="ib" id="evNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x), ph = q("#evPh");
    // 7.29: привязка к заведению
    const plAll = () => typeof PL !== "undefined" && PL ? PL.places : [];
    const drawPl = () => {
      const sel = placeId && plAll().find(x => x.id === placeId), qq = q("#evPlQ").value.trim().toLowerCase();
      q("#evPlS").innerHTML = sel ? `<div class="e7-plsel">${sel.photo && typeof plImg === "function" ? `<img alt="" src="${esc(plImg(sel))}" onerror="this.remove()">` : `<i>${ICON.pin}</i>`}<span><b>${esc(sel.name)}</b><small>${esc([typeof plKindL === "function" ? plKindL(sel.kind) : "", sel.address].filter(Boolean).join(" · "))}</small></span><button type="button" data-plx="1" aria-label="Отвязать">${ICON.x}</button></div>` : placeId ? `<div class="e7-plsel"><span><b>Заведение</b><small>загружаю…</small></span><button type="button" data-plx="1" aria-label="Отвязать">${ICON.x}</button></div>` : "";
      q("#evPlQ").hidden = !!placeId;
      if (placeId){ q("#evPlL").innerHTML = ""; return; }
      if (typeof PL === "undefined"){ q("#evPlL").innerHTML = ""; return; }
      if (!PL){ q("#evPlL").innerHTML = `<small class="e7-none">Загружаю заведения…</small>`; if (typeof loadPlaces === "function") loadPlaces().then(() => { if (!s.closed) drawPl(); }); return; }
      const list = plAll().filter(x => !qq || (x.name || "").toLowerCase().includes(qq) || (x.address || "").toLowerCase().includes(qq)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, qq ? 12 : 8);
      q("#evPlL").innerHTML = list.length ? list.map(x => `<button type="button" data-plid="${esc(x.id)}">${x.photo && typeof plImg === "function" ? `<img alt="" src="${esc(plImg(x))}" onerror="this.remove()">` : `<i>${ICON.pin}</i>`}<span>${esc(x.name)}</span></button>`).join("") : `<small class="e7-none">${qq ? "Ничего не нашлось — впиши место текстом ниже" : "На карте пока нет заведений"}</small>`;
    };
    q("#evPlQ").oninput = drawPl;
    q("#evPlL").onclick = ev => { const b = ev.target.closest("[data-plid]"); if (!b) return; placeId = b.dataset.plid; const pl = plAll().find(x => x.id === placeId); if (pl && !q("#evPl").value.trim()) q("#evPl").value = pl.name; q("#evPlQ").value = ""; drawPl(); };
    q("#evPlS").onclick = ev => { if (ev.target.closest("[data-plx]")){ placeId = null; drawPl(); setTimeout(() => q("#evPlQ").focus(), 20); } };
    drawPl();
    const drawPh = () => {
      ph.className = `ev-ph f-${fmt}${url ? " has" : ""}`;
      ph.innerHTML = url ? `<img src="${url}" alt="" draggable="false" style="${posStyle(pos)}">` : `<span>Фото: перетащи, вставь Ctrl+V<br>или нажми, чтобы выбрать</span>`;
      q("#evZ").hidden = !url; q("#evS").value = pos.s;
      q("#evFm").querySelectorAll("[data-fmt]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fmt === fmt));
    };
    const applyPos = () => { const im = ph.querySelector("img"); if (im) im.setAttribute("style", posStyle(pos)); q("#evS").value = pos.s; };
    const take = f => { if (!f || !f.type.startsWith("image/")) return; file = f; removed = false; url = URL.createObjectURL(f); pos = {x: 50, y: 50, s: 1}; drawPh(); };
    ph.onclick = () => { if (!url) q("#evF").click(); }; q("#evF").onchange = ev => take(ev.target.files[0]); bindDrop(ph, take); pasteTarget = take;
    q("#evFm").onclick = ev => { const b = ev.target.closest("[data-fmt]"); if (b){ fmt = b.dataset.fmt; drawPh(); } };
    q("#evS").oninput = ev => { pos.s = +ev.target.value; applyPos(); };
    q("#evRe").onclick = () => { pos = {x: 50, y: 50, s: 1}; applyPos(); };
    q("#evCh").onclick = () => q("#evF").click();
    q("#evRm").onclick = () => { file = null; url = ""; removed = true; pos = {x: 50, y: 50, s: 1}; drawPh(); };
    ph.addEventListener("wheel", ev => { if (!url) return; ev.preventDefault(); pos.s = Math.min(3, Math.max(1, +(pos.s - ev.deltaY * 0.0015).toFixed(3))); applyPos(); }, {passive: false});
    let drag = null;
    ph.addEventListener("pointerdown", ev => { if (!url) return; drag = {x: ev.clientX, y: ev.clientY, px: pos.x, py: pos.y, w: ph.clientWidth, h: ph.clientHeight}; ph.setPointerCapture(ev.pointerId); ph.classList.add("grab"); });
    ph.addEventListener("pointermove", ev => { if (!drag) return; const k = Math.max(pos.s - .4, .6);
      pos.x = Math.min(100, Math.max(0, drag.px - (ev.clientX - drag.x) / drag.w * 100 / k));
      pos.y = Math.min(100, Math.max(0, drag.py - (ev.clientY - drag.y) / drag.h * 100 / k)); applyPos(); });
    const endDrag = () => { drag = null; ph.classList.remove("grab"); };
    ph.addEventListener("pointerup", endDrag); ph.addEventListener("pointercancel", endDrag);
    drawPh();
    if (q("#evPk")) q("#evPk").onclick = ev => { const b = ev.target.closest("[data-u]"); if (b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); };
    q("#evNo").onclick = () => s.close();
    q("#evOk").onclick = async () => {
      const title = q("#evT").value.trim(); if (!title){ q("#evT").focus(); toast("Придумай название"); return; }
      const d = q("#evD").value, tm = q("#evTm").value || "19:00", starts_at = d ? new Date(`${d}T${tm}`).toISOString() : null;
      const btn = q("#evOk"); btn.disabled = true; btn.textContent = "Сохраняю…";
      try {
        const photo = file ? await upload(file) : removed ? null : photo0;
        const row = {title, descr: q("#evDs").value.trim() || null, place: q("#evPl").value.trim() || null, starts_at, photo,
          photo_fmt: photo ? fmt : null, photo_pos: photo ? {x: +pos.x.toFixed(1), y: +pos.y.toFixed(1), s: +(+pos.s).toFixed(3)} : null};
        if (placeId || place0) row.place_id = placeId;
        const noCol = er => er && /place_id/i.test((er.message || "") + (er.details || "") + (er.hint || ""));
        let id = e && e.id;
        if (isNew){
          id = crypto.randomUUID();
          let r = await SB.from("events").insert({id, owner: ME.id, created_at: now(), ...row});
          if (r.error && noCol(r.error)){ delete row.place_id; toast("Привязка к заведению заработает после обновления базы — мероприятие создаю без неё"); r = await SB.from("events").insert({id, owner: ME.id, created_at: now(), ...row}); }
          if (r.error) throw r.error;
          r = await SB.from("event_members").insert({event_id: id, user_id: ME.id, status: "going", updated_at: now()}); if (r.error) throw r.error;
          const inv = q("#evPk") ? [...q("#evPk").querySelectorAll('[aria-pressed="true"]')].map(b => ({event_id: id, user_id: b.dataset.u, status: "invited", invited_by: ME.id, updated_at: now()})) : [];
          if (inv.length){ r = await SB.from("event_members").insert(inv); if (r.error) toast("Мероприятие создано, но приглашения не ушли: " + r.error.message); }
          evNotified.add(id);
        } else { let r = await SB.from("events").update(row).eq("id", id);
          if (r.error && noCol(r.error)){ delete row.place_id; toast("Привязка к заведению заработает после обновления базы"); r = await SB.from("events").update(row).eq("id", id); }
          if (r.error) throw r.error; }
        s.close(); toast(isNew ? "Мероприятие создано" : "Сохранено"); await loadEvents(true); go("event:" + id);
      } catch(err){ toast("Не сохранилось: " + ((err && err.message) || err)); btn.disabled = false; btn.textContent = isNew ? "Создать" : "Сохранить"; }
    };
  }
  function inviteSheet(id){
    const e = evById(id); if (!e || !FR) return;
    const inMem = new Set(evMem(id).map(m => m.user_id)), list = FR.profiles.filter(p => p.user_id !== ME.id && !inMem.has(p.user_id));
    const s = openSheet(`<h3>Пригласить</h3><p class="sub">${esc(e.title)} · ${esc(evWhen(e))}. Друзьям придёт уведомление на сайте.</p>
      ${list.length ? `<div class="ev-pick" id="ivPk">${list.map(p => `<button type="button" data-u="${esc(p.user_id)}" aria-pressed="false">${avaHTML(p)}${esc(p.nick)}</button>`).join("")}</div>` : `<p class="sub">Все уже приглашены.</p>`}
      <div class="acts">${list.length ? `<button class="ib blue" id="ivOk">Отправить приглашения</button><button class="ib" id="ivAll">Всех</button>` : ""}<button class="ib" id="ivNo">Закрыть</button></div>`);
    const q = x => s.el.querySelector(x);
    q("#ivNo").onclick = () => s.close();
    if (!list.length) return;
    q("#ivPk").onclick = ev => { const b = ev.target.closest("[data-u]"); if (b) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); };
    q("#ivAll").onclick = () => q("#ivPk").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "true"));
    q("#ivOk").onclick = async () => {
      const rows = [...q("#ivPk").querySelectorAll('[aria-pressed="true"]')].map(b => ({event_id: id, user_id: b.dataset.u, status: "invited", invited_by: ME.id, updated_at: now()}));
      if (!rows.length){ toast("Выбери, кого позвать"); return; }
      const {error} = await SB.from("event_members").insert(rows);
      if (error){ toast("Не ушло: " + error.message); return; }
      s.close(); toast(`Приглашения отправлены: ${rows.length}`); loadEvents(true);
    };
  }
  document.addEventListener("click", async e => {
    const el = e.target.closest && e.target.closest("[data-ev],[data-evnew],[data-rsvp],[data-notif],[data-evinv],[data-evedit],[data-evdel],[data-vkdel],[data-vkimg],[data-fwt],[data-snd]"); if (!el) return;
    if (el.dataset.fwt){ fwHide = !fwHide; lsSet("nexus_fw", fwHide ? "0" : "1"); renderFw(); return; }
    if (el.dataset.snd){ SND.set(el.dataset.snd === "1"); if (route === "more") renderMore(); return; }
    if (!ME) return;
    if (el.dataset.ev){ const ev = evById(el.dataset.ev); go(ev ? evRoute(ev) : "event:" + el.dataset.ev); return; }
    if (el.dataset.evnew){ if (!FR) await loadFriends(); eventSheet(null); return; }
    if (el.dataset.rsvp){ const [id, st] = el.dataset.rsvp.split(":"); rsvp(id, st); return; }
    if (el.dataset.notif){ if ("Notification" in window) Notification.requestPermission().then(p => { toast(p === "granted" ? "Уведомления включены" : "Браузер не разрешил уведомления"); render(); }); return; }
    if (el.dataset.evinv){ if (!FR) await loadFriends(); inviteSheet(el.dataset.evinv); return; }
    if (el.dataset.evedit){ eventSheet(evById(el.dataset.evedit)); return; }
    if (el.dataset.evdel){ const ev = evById(el.dataset.evdel); if (!ev || !confirm(`Удалить «${ev.title}» вместе со стеной?`)) return;
      const {error} = await SB.from("events").delete().eq("id", ev.id); if (error){ toast("Не удалилось"); return; } toast("Удалено"); await loadEvents(true); go("people"); return; }
    if (el.dataset.vkdel){ if (!confirm("Удалить запись со стены?")) return; const {error} = await SB.from("event_posts").delete().eq("id", el.dataset.vkdel); if (error){ toast("Не удалилось"); return; } loadEvents(true); return; }
    if (el.dataset.vkimg){ lightbox({shots: [el.dataset.vkimg]}, 0); return; }
  });

