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
  const csStats = uid => { if (!FR) return null; const g = FR.items.filter(i => i.uid === uid && isGame(i));
    return {lvl: csLevel(uid).lv, streak: csMaxStreak(uid), drops: g.filter(i => gStatus(i.status) === "dropped").length, first: v6FirstN(uid), cup: v6Cups(uid).length, top3: v6Hall().filter(h => h.top.some(x => x.p.user_id === uid)).length, weeks: csWeeks(uid), done: g.filter(i => gStatus(i.status) === "done").length}; };
  const csOk = (u, st) => { u = u || {t: "free"}; if (u.t === "free") return true; if (!st) return false; if (u.t === "cup" || u.t === "top3") return st[u.t] >= 1; return (st[u.t] || 0) >= (u.n || 1); };
  const csNeed = u => { u = u || {}; return u.t === "lvl" ? `откроется на ${u.n} уровне` : u.t === "streak" ? `серия ${u.n} ${plural(u.n, "день", "дня", "дней")} подряд` : u.t === "drops" ? `дропни ${u.n} ${plural(u.n, "игру", "игры", "игр")}` : u.t === "first" ? `первооткрыватель ${u.n} раз` : u.t === "cup" ? "выиграй сезон" : u.t === "top3" ? "попади в тройку сезона" : u.t === "weeks" ? `закрой все задания недели ${u.n === 1 ? "один раз" : u.n + " раза"}` : u.t === "done" ? `пройди ${u.n} ${plural(u.n, "игру", "игры", "игр")}` : ""; };
  const csFrames = () => (COSM || []).filter(c => c.kind === "frame");
  const csThemesAll = () => [...CS_THEMES, ...(COSM || []).filter(c => c.kind === "theme").map(c => ({id: "db:" + c.id, t: c.title, d: (c.data && c.data.d) || "", u: c.unlock, db: c}))];
  // что человек надел — с проверкой, что это у него открыто (чужое не покажем)
  function csOf(p){
    const c = (p && p.cosm) || {}, st = FR ? csStats(p.user_id) : null;
    const th = csThemesAll().find(x => x.id === c.theme), fx = CS_FX.find(x => x.id === c.fx), fr = csFrames().find(x => x.id === c.frame);
    return {theme: th && csOk(th.u, st) ? th : null, fx: fx && fx.id && csOk(fx.u, st) ? fx : null, frame: fr && csOk(fr.unlock, st) ? fr : null, layout: Array.isArray(c.layout) ? c.layout : null, hide: Array.isArray(c.hide) ? c.hide : []};
  }
  // ---- для renderProfile: класс темы, рамка, порядок блоков
  function csPfAttrs(p){ if (!COSM && !COSM_OFF) loadCosm(); const o = csOf(p), t = o.theme;
    if (!t || t.id === "base") return {cls: "", style: ""};
    if (t.db){ const d = t.db.data || {}; return {cls: " v6t v6t-db" + (d.style ? " v6t-" + esc(d.style) : ""), style: `${d.ac ? `--ac:${esc(d.ac)};--tac:${esc(d.ac)};` : ""}${t.db.img ? `--tbg:url('${publicUrl(t.db.img)}');` : ""}`}; }
    return {cls: " v6t v6t-" + t.id, style: ""}; }
  function csFrameHTML(p){ const f = csOf(p).frame; return f && f.img ? `<img class="v6-frame" alt="" src="${publicUrl(f.img)}" draggable="false">` : ""; }
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
  function csSheet(){
    if (!ME) return; if (!COSM && !COSM_OFF) loadCosm();
    const p = myProf(), st = csStats(ME.id), L = csLevel(ME.id);
    let cur = {theme: "base", fx: "", frame: "", layout: CS_FLOORS.map(x => x[0]), hide: [], ...((p && p.cosm) || {})};
    const s = openSheet(`<h3>Оформление профиля</h3><p class="sub">Открывается само за дела на сайте, надеваешь сам. Видно всем, кто зайдёт к тебе в профиль. Сейчас у тебя <b>${L.lv} уровень</b> (${L.xp} опыта, до следующего ${L.next - L.xp}).</p>
      <div class="cs-tabs" id="csT"></div><div id="csB"></div>
      <div class="acts" style="margin-top:16px"><button class="ib blue" id="csOk">Сохранить</button><button class="ib" id="csNo">Отмена</button><label class="cs-fxoff"><input type="checkbox" id="csFxOff" ${lsGet("nexus_fx_off") === "1" ? "checked" : ""}>Не показывать мне эффекты в чужих профилях</label></div>`, {wide: true});
    const q = sel => s.el.querySelector(sel);
    const lock = u => !csOk(u, st);
    const card = (on, locked, prev, t, d, u, attr) => `<button type="button" class="cs-c${on ? " on" : ""}${locked ? " lk" : ""}" ${locked ? "disabled" : attr}>${prev}<b>${esc(t)}</b><small>${locked ? esc(csNeed(u)) : esc(d || "")}</small></button>`;
    const draw = () => {
      q("#csT").innerHTML = [["theme", "Темы"], ["frame", "Рамки"], ["fx", "Эффекты"], ["layout", "Блоки"]].map(([k, l]) => `<button type="button" data-cst="${k}" aria-pressed="${csTab === k}">${l}</button>`).join("");
      let h = "";
      if (csTab === "theme") h = `<div class="cs-g">${csThemesAll().map(t => card(cur.theme === t.id, lock(t.u), `<span class="cs-pv v6t-pv-${t.db ? "db" : t.id}" style="${t.db && t.db.img ? `background-image:url('${publicUrl(t.db.img)}')` : ""}${t.db && t.db.data && t.db.data.ac ? `;--tac:${esc(t.db.data.ac)}` : ""}"><i></i><i></i><i></i></span>`, t.t, t.d, t.u, `data-csv="theme:${esc(t.id)}"`)).join("")}</div>${IS_ADMIN && !COSM_OFF ? `<button type="button" class="ib cs-adm" data-csadd="theme">+ Своя тема (фон и цвет)</button>` : ""}`;
      else if (csTab === "frame") h = COSM_OFF ? `<p class="a-sub">Рамки появятся после обновления базы.</p>` : `<div class="cs-g">${card(!cur.frame, false, `<span class="cs-pv fr">${avaHTML(p, "big")}</span>`, "Без рамки", "", null, `data-csv="frame:"`)}${csFrames().map(f => card(cur.frame === f.id, lock(f.unlock), `<span class="cs-pv fr">${avaHTML(p, "big")}<img alt="" src="${publicUrl(f.img)}"></span>`, f.title, (f.data && f.data.d) || "", f.unlock, `data-csv="frame:${esc(f.id)}"`)).join("")}</div>${csFrames().length ? "" : `<p class="a-sub">Рамок пока нет — их рисует и загружает админ.</p>`}${IS_ADMIN ? `<button type="button" class="ib cs-adm" data-csadd="frame">+ Загрузить рамку</button>` : ""}`;
      else if (csTab === "fx") h = `<div class="cs-g">${CS_FX.map(f => card(cur.fx === f.id, lock(f.u), `<span class="cs-pv fx fx-${f.id || "none"}"></span>`, f.t, f.d, f.u, `data-csv="fx:${esc(f.id)}"`)).join("")}</div><p class="a-sub" style="margin-top:8px">Эффекты не грузят телефон: на слабых экранах частиц меньше, а при «уменьшении движения» их нет совсем.</p>`;
      else h = `<p class="a-sub">Порядок блоков в профиле. Стрелками двигай, ненужное прячь.</p><div class="cs-lay">${cur.layout.filter(k => CS_FLOORS.some(f => f[0] === k)).concat(CS_FLOORS.map(f => f[0]).filter(k => !cur.layout.includes(k))).map((k, i, a) => `<div class="cs-lr${cur.hide.includes(k) ? " off" : ""}"><b>${esc(CS_FLOORS.find(f => f[0] === k)[1])}</b><button type="button" data-csmv="${k}:-1" ${i ? "" : "disabled"} aria-label="Выше">↑</button><button type="button" data-csmv="${k}:1" ${i < a.length - 1 ? "" : "disabled"} aria-label="Ниже">↓</button><button type="button" data-cshd="${k}" aria-label="${cur.hide.includes(k) ? "Показать" : "Спрятать"}">${cur.hide.includes(k) ? "показать" : "спрятать"}</button></div>`).join("")}</div>`;
      q("#csB").innerHTML = h;
    };
    s.el.addEventListener("click", async e => {
      const t = e.target.closest("[data-cst]"); if (t){ csTab = t.dataset.cst; draw(); return; }
      const v = e.target.closest("[data-csv]"); if (v){ const [k, ...rest] = v.dataset.csv.split(":"); cur[k] = rest.join(":"); draw(); return; }
      const m = e.target.closest("[data-csmv]"); if (m){ const [k, d] = m.dataset.csmv.split(":"); const a = cur.layout.filter(x => CS_FLOORS.some(f => f[0] === x)); CS_FLOORS.forEach(f => { if (!a.includes(f[0])) a.push(f[0]); }); const i = a.indexOf(k), j = i + +d; [a[i], a[j]] = [a[j], a[i]]; cur.layout = a; draw(); return; }
      const hd = e.target.closest("[data-cshd]"); if (hd){ const k = hd.dataset.cshd; cur.hide = cur.hide.includes(k) ? cur.hide.filter(x => x !== k) : [...cur.hide, k]; draw(); return; }
      const ad = e.target.closest("[data-csadd]"); if (ad){ csAdmin(ad.dataset.csadd, () => draw()); return; }
    });
    q("#csNo").onclick = () => s.close();
    q("#csOk").onclick = async () => { const b = q("#csOk"); b.disabled = true; lsSet("nexus_fx_off", q("#csFxOff").checked ? "1" : "0");
      if (await saveProf({cosm: cur})){ toast("Оформление сохранено"); s.close(); } b.disabled = false; };
    draw();
  }
  // админ: загрузить рамку или свою тему
  function csAdmin(kind, done){
    const UN = [["free", "Сразу всем"], ["lvl", "Уровень"], ["streak", "Серия дней"], ["weeks", "Закрытые недели заданий"], ["first", "Первооткрыватель"], ["drops", "Дропы"], ["done", "Пройдено игр"], ["top3", "Тройка сезона"], ["cup", "Победа в сезоне"]];
    const s = openSheet(`<h3>${kind === "frame" ? "Новая рамка" : "Новая тема"}</h3><p class="sub">${kind === "frame" ? "Квадратная картинка 512×512 с прозрачной серединой: PNG, WebP или анимированный APNG/WebP. Аватар займёт центральные 78%." : "Фон профиля и цвет акцента. Стиль карточек — от одной из встроенных тем."}</p>
      <label class="v6-fl">Название<input id="caT" maxlength="40"></label><label class="v6-fl">Описание<input id="caD" maxlength="80"></label>
      <label class="v6-fl">${kind === "frame" ? "Картинка рамки" : "Фон (картинка)"}<input type="file" id="caF" accept="image/png,image/webp,image/apng,image/gif${kind === "theme" ? ",image/jpeg" : ""}"></label>
      ${kind === "theme" ? `<label class="v6-fl">Цвет акцента<input type="color" id="caC" value="#ff375f"></label><label class="v6-fl">Стиль карточек<select id="caS">${CS_THEMES.filter(t => t.id !== "base").map(t => `<option value="${t.id}">${esc(t.t)}</option>`).join("")}</select></label>` : ""}
      <label class="v6-fl">Как открывается<select id="caU">${UN.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label><label class="v6-fl">Сколько нужно (уровень, дней, раз)<input id="caN" type="number" min="1" value="3"></label>
      <div class="acts"><button class="ib blue" id="caOk">Загрузить</button><button class="ib" id="caNo">Отмена</button></div>`);
    const q = sel => s.el.querySelector(sel);
    q("#caNo").onclick = () => s.close();
    q("#caOk").onclick = async () => {
      const f = q("#caF").files[0], t = q("#caT").value.trim(); if (!t){ toast("Дай название"); return; } if (kind === "frame" && !f){ toast("Выбери картинку рамки"); return; }
      const b = q("#caOk"); b.disabled = true; b.textContent = "Загружаю…";
      try {
        const img = f ? (await assets.upload(f, {type: f.type})).id : null, u = q("#caU").value;
        const row = {id: (kind === "frame" ? "fr_" : "th_") + Date.now().toString(36), kind, title: t, img, data: {d: q("#caD").value.trim(), ...(kind === "theme" ? {ac: q("#caC").value, style: q("#caS").value} : {})}, unlock: u === "free" || u === "cup" || u === "top3" ? {t: u} : {t: u, n: Math.max(1, +q("#caN").value || 1)}};
        const {error} = await SB.from("cosmetics").insert(row); if (error) throw error;
        COSM = [...(COSM || []), {...row, created_at: now()}]; toast("Добавлено в каталог"); s.close(); done && done();
      } catch(err){ logErr("загрузка оформления", err); toast("Не получилось: " + (err.message || err)); b.disabled = false; b.textContent = "Загрузить"; }
    };
  }
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
