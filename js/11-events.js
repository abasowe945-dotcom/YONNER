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
      evLoading = null; checkInvites(); render();
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
  function renderEvents(){
    appleHead("Мероприятия", `<button class="a-link" data-go="people">‹ Активность</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!EV){ $("aMain").innerHTML = `<p class="a-sub">Загружаю…</p>`; loadEvents(); return; }
    const all = EV.events.filter(e => e.kind !== "watch");
    const inv = myInvites().filter(m => evById(m.event_id).kind !== "watch").map(m => m.event_id);
    const up = all.filter(e => !evPast(e)).sort((a, b) => (a.starts_at || "9").localeCompare(b.starts_at || "9"));
    const past = all.filter(e => evPast(e)).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
    const byM = {}; past.forEach(e => { const k = e.starts_at.slice(0, 7); (byM[k] = byM[k] || []).push(e); });
    const MN = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
    $("aMain").innerHTML = `<div class="v6-evp"><div class="v6-evp-h"><h1 class="a-h1">Мероприятия</h1><span class="sp"></span><a class="ib" href="#calendar">${ICON.calendar}В календаре</a><button type="button" class="ib blue" data-evnew="1">${ICON.plus || "+"}Создать</button></div>
      ${inv.length ? `<h2 class="v6-evp-s">Тебя зовут<span>${inv.length}</span></h2>${inv.map(id => { const e = evById(id); return `<div class="v6-ev-inv">${evTile(e, {big: true})}<div class="acts"><button class="ib green" data-rsvp="${esc(e.id)}:going">Иду</button><button class="ib" data-rsvp="${esc(e.id)}:not">Езжайте без меня</button></div></div>`; }).join("")}` : ""}
      <h2 class="v6-evp-s">Скоро<span>${up.filter(e => !inv.includes(e.id)).length}</span></h2>
      ${up.filter(e => !inv.includes(e.id)).length ? `<div class="v6-ev-list">${up.filter(e => !inv.includes(e.id)).map(e => evTile(e, {big: true})).join("")}</div>` : `<div class="a-empty"><b>Ничего не запланировано</b>Кино, катка, шашлыки, ДР — позови всех.</div>`}
      ${past.length ? `<h2 class="v6-evp-s">Прошедшие<span>${past.length}</span></h2>${Object.keys(byM).map(k => `<div class="v6-evp-m">${MN[+k.slice(5) - 1]} ${k.slice(0, 4)}</div><div class="v6-ev-list">${byM[k].map(e => evTile(e)).join("")}</div>`).join("")}` : ""}</div>`;
  }
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
    const pl = (arr, cls, t) => `<h4 class="${cls}">${t}<span>${arr.length}</span></h4>${arr.length ? arr.map(m => `<button class="p" ${m.user_id !== ME.id ? `data-user="${esc(m.user_id)}"` : ""}>${avaHTML(profOf(m.user_id))}${esc(nick(m.user_id))}${m.user_id === e.owner ? "<small>организатор</small>" : ""}</button>`).join("") : `<div class="none">никого</div>`}`;
    const wall = `<div class="vk"><div class="vk-top"></div><div class="vk-h">Стена<span>${posts.length} ${plural(posts.length, "запись", "записи", "записей")}</span></div>
      <div class="vk-form"><textarea id="vkT" maxlength="2000" placeholder="Написать сообщение..."></textarea>
        <div class="vk-tools"><span class="vk-emo">${EMO.map(([k, ch, l]) => `<button type="button" data-emo="${ch}" title="${l}" aria-label="${l}">${emoSpan(k)}</button>`).join("")}</span>
          <label class="vk-att" for="vkF">прикрепить картинку</label><input type="file" id="vkF" accept="image/*" hidden><span class="vk-prev" id="vkP"></span>
          <button type="button" class="vk-btn" id="vkGo">Отправить</button></div></div>
      ${posts.length ? posts.map(p => `<div class="vk-post">${avaHTML(profOf(p.user_id))}<div><button class="vk-n" ${p.user_id !== ME.id ? `data-user="${esc(p.user_id)}"` : ""}>${esc(profOf(p.user_id).nick || "кто-то")}</button>
        ${p.body ? `<div class="vk-t${onlyEmo(p.body) ? " big" : ""}">${richText(p.body)}</div>` : ""}${p.image ? `<img class="vk-img" src="${publicUrl(p.image)}" alt="" data-vkimg="${esc(p.image)}" loading="lazy">` : ""}
        <div class="vk-d">${vkDate(p.created_at)} | ${(() => { const lk = likesOf(p.id), on = lk.some(l => l.user_id === ME.id);
          return `<a class="vk-like${on ? " on" : ""}" data-like="${esc(p.id)}" title="${esc(lk.length ? "Понравилось: " + lk.map(l => profOf(l.user_id).nick).join(", ") : "Мне нравится")}">Мне нравится${lk.length ? ` ♥ ${lk.length}` : ""}</a>${lk.length ? `<span class="vk-lk">${lk.slice(0, 6).map(l => avaHTML(profOf(l.user_id))).join("")}</span>` : ""}`; })()}${p.user_id === ME.id || own ? ` | <a data-vkdel="${esc(p.id)}">удалить</a>` : ""}</div></div></div>`).join("") : `<div class="vk-empty">На стене пока нет записей. Напиши первым.</div>`}</div>`;
    $("aMain").innerHTML = `<div class="evp">
      <div class="evp-hero${e.photo ? " ph-" + evFmt(e) : ""}" style="--g:${e.photo ? "#111" : evBg(e)}">${e.photo ? (evFmt(e) === "wide" ? `<div class="evp-img">${evImg(e)}</div>` : `<div class="evp-blur" style="background-image:url('${publicUrl(e.photo)}')"></div><div class="evp-pic">${evImg(e)}</div>`) : ""}${evIn(e) ? `<span class="cd">${esc(evIn(e))}</span>` : ""}<div class="in"><div class="when">${esc(evWhen(e))}</div><h1>${esc(e.title)}</h1></div></div>
      <div class="evp-grid"><div class="evp-a">
        <div class="ios-card evp-info">
          <div class="ios-row"><span class="ic" style="background:${GRAD.red}">${ICON.calendar}</span><span class="t">${esc(evWhen(e))}</span><span class="val">${esc(evIn(e))}</span></div>
          ${e.place ? `<div class="ios-row"><span class="ic" style="background:${GRAD.green}">${ICON.pin}</span><span class="t">${esc(e.place)}</span><a href="https://yandex.ru/maps/?text=${encodeURIComponent(e.place)}" target="_blank" rel="noopener">На карте</a></div>` : ""}
          <div class="ios-row"><span class="ic" style="background:${GRAD.violet}">${ICON.people}</span><span class="t">Организатор: <b>${esc(own ? "ты" : profOf(e.owner).nick || "кто-то")}</b></span></div>
          ${e.descr ? `<div class="evp-desc">${richText(e.descr)}</div>` : ""}
        </div>
      </div><div class="evp-w">${wall}</div><div class="evp-side"><div class="ios-card">
        ${my && my.status === "invited" ? `<div class="rsvp-k">${esc(frNick(my.invited_by || e.owner))} зовёт тебя. Пойдёшь?</div>` : ""}
        <div class="rsvp"><button class="go" data-rsvp="${esc(e.id)}:going" aria-pressed="${!!my && my.status === "going"}">✓ Иду</button><button class="no" data-rsvp="${esc(e.id)}:not" aria-pressed="${!!my && my.status === "not"}">✕ Езжайте</button></div>
        <div class="evp-acts"><button class="ib" data-evinv="${esc(e.id)}">Пригласить</button><button class="ib tg" data-tgcopy="event:${esc(e.id)}" title="Скопировать приглашение для Телеграма"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M21.6 4.3 18.4 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L5.9 13.2 1 11.7c-1-.3-1.1-1 .2-1.5L20.2 2.9c.9-.3 1.7.2 1.4 1.4Z"/></svg>Для Телеграма</button>${e.photo ? `<button class="ib" data-tgposter="${esc(e.id)}" title="Скопировать картинку мероприятия — вставь в Телеграм, а текст в подпись">Картинка</button>` : ""}${own ? `<button class="ib" data-evedit="${esc(e.id)}">Изменить</button><button class="ib red" data-evdel="${esc(e.id)}">Удалить</button>` : ""}</div>
        <div class="mem">${pl(goL, "go", "Идут")}${pl(noL, "no", "Не идут")}${pl(invL, "", "Приглашены")}</div>
      </div></div></div></div>`;
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
  function eventSheet(e){
    if (!ME || !assets) return;
    const isNew = !e; let file = null, removed = false, fmt = evFmt(e), pos = {x: 50, y: 50, s: 1, ...(evPos(e) || {})}; const photo0 = e ? e.photo : null;
    let url = photo0 ? publicUrl(photo0) : "";
    const s0 = evStart(e), others = FR ? FR.profiles.filter(p => p.user_id !== ME.id) : [];
    const s = openSheet(`<h3>${isNew ? "Новое мероприятие" : "Изменить мероприятие"}</h3><p class="sub">Нужно только название. Фото, место и описание — по желанию.</p>
      <div class="evf" id="evFm" role="group" aria-label="Формат фото">${Object.entries(EV_FMT).map(([k, v]) => `<button type="button" data-fmt="${k}" aria-pressed="${k === fmt}"><i class="r-${k}"></i><b>${v.t}</b><small>${v.r}</small></button>`).join("")}</div>
      <div class="ev-ph" id="evPh" role="button" tabindex="0"></div><input type="file" id="evF" accept="image/*" hidden>
      <div class="ev-zoom" id="evZ"><label>Масштаб<input type="range" id="evS" min="1" max="3" step="0.01"></label><button type="button" class="ib" id="evRe">Сбросить</button><button type="button" class="ib" id="evCh">Заменить</button><button type="button" class="ib red" id="evRm">Убрать</button></div>
      <label class="f">Название<input class="in" id="evT" maxlength="80" placeholder="Кино в пятницу" value="${esc(e ? e.title : "")}"></label>
      <div class="ev-two"><label class="f">Дата<input class="in" type="date" id="evD" placeholder="Выбрать дату" value="${s0 ? localDate(s0) : ""}"></label><label class="f">Время<input class="in" type="time" id="evTm" value="${s0 ? pad(s0.getHours()) + ":" + pad(s0.getMinutes()) : "19:00"}"></label></div>
      <label class="f">Место<input class="in" id="evPl" maxlength="200" placeholder="Адрес или название места" value="${esc(e ? e.place || "" : "")}"></label>
      <label class="f">Описание<textarea class="in" id="evDs" maxlength="3000" placeholder="Что будем делать, что взять с собой">${esc(e ? e.descr || "" : "")}</textarea></label>
      ${isNew && others.length ? `<div class="av-lb">Позвать друзей</div><div class="ev-pick" id="evPk">${others.map(p => `<button type="button" data-u="${esc(p.user_id)}" aria-pressed="false">${avaHTML(p)}${esc(p.nick)}</button>`).join("")}</div>` : ""}
      <div class="acts"><button class="ib blue" id="evOk">${isNew ? "Создать" : "Сохранить"}</button><button class="ib" id="evNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x), ph = q("#evPh");
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
        let id = e && e.id;
        if (isNew){
          id = crypto.randomUUID();
          let r = await SB.from("events").insert({id, owner: ME.id, created_at: now(), ...row}); if (r.error) throw r.error;
          r = await SB.from("event_members").insert({event_id: id, user_id: ME.id, status: "going", updated_at: now()}); if (r.error) throw r.error;
          const inv = q("#evPk") ? [...q("#evPk").querySelectorAll('[aria-pressed="true"]')].map(b => ({event_id: id, user_id: b.dataset.u, status: "invited", invited_by: ME.id, updated_at: now()})) : [];
          if (inv.length){ r = await SB.from("event_members").insert(inv); if (r.error) toast("Мероприятие создано, но приглашения не ушли: " + r.error.message); }
          evNotified.add(id);
        } else { const r = await SB.from("events").update(row).eq("id", id); if (r.error) throw r.error; }
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

