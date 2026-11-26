  // ================= 4.8: график отпусков =================
  // Черновик лежит в личных настройках (meta/vacation) — его видишь только ты. В профиль уходят только дни (таблица vacations).
  // Калькулятор отпускных живёт в браузере (localStorage) и в базу не попадает вовсе.
  let VAC = null, vacLoading = null;
  const vc = {year: new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0), tool: "vac", range: !!(window.matchMedia && matchMedia("(pointer:coarse)").matches), anchor: null, last: null, cmp: new Set(), doc: null, loaded: false, loading: false, saveT: 0, drag: null, skip: false};
  const VC_FED = ["01-01", "01-02", "01-03", "01-04", "01-05", "01-06", "01-07", "01-08", "02-23", "03-08", "05-01", "05-09", "06-12", "11-04"];
  const VC_FEDN = {"01-01": "Новый год", "01-07": "Рождество Христово", "02-23": "День защитника Отечества", "03-08": "Международный женский день", "05-01": "Праздник Весны и Труда", "05-09": "День Победы", "06-12": "День России", "11-04": "День народного единства"};
  const VC_SAKHA = {"04-27": "День Республики Саха (Якутия)", "06-21": "Ысыах"};
  // переносы выходных по постановлениям Правительства РФ: 2026 — № 1466 от 24.09.2025, 2027 — № 1187 от 17.09.2026
  const VC_OFF = {2026: ["01-09", "03-09", "05-11", "12-31"], 2027: ["02-22", "05-03", "05-10", "06-14", "11-05", "12-31"]};
  const VC_WORK = {2027: ["02-20"]};
  const VC_COLS = ["#ff9f0a", "#bf5af2", "#64d2ff", "#ff375f", "#ffd60a", "#5e5ce6", "#ac8e68", "#00c7be"];
  const VC_I = {
    sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>'),
    lock: I('<rect x="5" y="11" width="14" height="9" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    erase: I('<path d="M20 20H9.5L4 14.5a2 2 0 0 1 0-2.8l8-8a2 2 0 0 1 2.8 0l5.5 5.5a2 2 0 0 1 0 2.8L12.5 20"/><path d="m8.5 8.5 7 7"/>'),
    range: I('<path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/>'),
    palm: I('<path d="M12 21V11M12 11c-1-4-4-6-8-5 3 0 5 2 6 5M12 11c1-4 4-6 8-5-3 0-5 2-6 5M12 11c-3-3-7-2-9 1 3-2 6-1 9 0M12 11c3-3 7-2 9 1-3-2-6-1-9 0"/><path d="M6 21h12"/>')
  };
  const vcSakha = () => !vc.doc || vc.doc.sakha !== false;
  function vcKind(ds, sakha){
    const y = +ds.slice(0, 4), md = ds.slice(5), d = parseD(ds), dow = d.getDay();
    if (VC_FED.includes(md)) return {k: "hol", n: VC_FEDN[md] || "Новогодние каникулы"};
    if (sakha && VC_SAKHA[md]) return {k: "rhol", n: VC_SAKHA[md]};
    if (VC_WORK[y] && VC_WORK[y].includes(md)) return {k: "work", n: "Рабочая суббота (перенос)"};
    if (VC_OFF[y]){ if (VC_OFF[y].includes(md)) return {k: "off", n: "Выходной (перенос)"}; }
    else if (dow === 1 || dow === 2){ // переносов на этот год ещё нет: праздник на выходных — выходной в ближайший рабочий день
      for (const h of ["02-23", "03-08", "05-01", "05-09", "06-12", "11-04"]){ const hd = parseD(`${y}-${h}`).getDay(), sh = hd === 6 ? 2 : hd === 0 ? 1 : 0; if (sh && addDays(`${y}-${h}`, sh) === ds) return {k: "off", n: "Выходной за праздник"}; } }
    if (sakha) for (const h in VC_SAKHA){ const hd = parseD(`${y}-${h}`).getDay(), sh = hd === 6 ? 2 : hd === 0 ? 1 : 0; if (sh && addDays(`${y}-${h}`, sh) === ds) return {k: "off", n: `Выходной за ${VC_SAKHA[h]}`}; }
    return dow === 0 || dow === 6 ? {k: "off", n: ""} : {k: "work", n: ""};
  }
  const vcIsHol = (ds, sakha) => { const k = vcKind(ds, sakha).k; return k === "hol" || k === "rhol"; };
  const vcCount = (days, sakha) => days.filter(d => !vcIsHol(d, sakha)).length;
  const vcRanges = (days, sakha) => { const out = []; [...days].sort().forEach(d => { const l = out[out.length - 1]; if (l && addDays(l.b, 1) === d){ l.b = d; l.all++; } else out.push({a: d, b: d, all: 1}); }); out.forEach(r => { let n = 0; for (let d = r.a; d <= r.b; d = addDays(d, 1)) if (!vcIsHol(d, sakha)) n++; r.n = n; }); return out; };
  const vcSpan = r => { const a = parseD(r.a), b = parseD(r.b), f = (d, y) => d.toLocaleDateString("ru-RU", {day: "numeric", month: "long", ...(y ? {year: "numeric"} : {})}).replace(/\s*г\.$/, "");
    return r.a === r.b ? f(a) : a.getMonth() === b.getMonth() ? `${a.getDate()}–${f(b)}` : `${f(a)} — ${f(b)}`; };
  const vcDn = n => `${n} ${plural(n, "день", "дня", "дней")}`;
  const vcY = () => { const ys = vc.doc.years || (vc.doc.years = {}); if (!ys[vc.year]){ const prev = ys[vc.year - 1] || ys[vc.year + 1]; ys[vc.year] = {total: prev ? prev.total : 28, vac: [], block: []}; } const Y = ys[vc.year]; Y.vac = Array.isArray(Y.vac) ? Y.vac : []; Y.block = Array.isArray(Y.block) ? Y.block : []; return Y; };
  const vacOf = (uid, year) => (VAC || []).find(r => r.user_id === uid && r.year === year);
  const vacHas = uid => { const y = new Date().getFullYear(); return (VAC || []).some(r => r.user_id === uid && r.year >= y && r.days.length); };

  async function loadVac(force){
    if (!SB || !ME) return null; if (VAC && !force) return VAC; if (vacLoading) return vacLoading;
    vacLoading = (async () => { const {data, error} = await fetchAll(() => SB.from("vacations").select("*"), ["user_id", "year"]);
      if (!error) VAC = (data || []).map(r => ({...r, days: Array.isArray(r.days) ? r.days.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort() : []}));
      vacLoading = null; if (!error && (route === "vacation" ? vc.loaded : route === "home" || route === "user")) { try { render(); } catch(e){ logErr("отпуска: перерисовка", e); } } return VAC; })();
    return vacLoading;
  }
  function subscribeVac(){ if (!SB || !ME) return; let t = 0; SB.channel("nexus-vac").on("postgres_changes", {event: "*", schema: "public", table: "vacations"}, () => { clearTimeout(t); t = setTimeout(() => loadVac(true), 400); }).subscribe(); }
  async function vcLoad(){
    if (vc.loading || !db) return; vc.loading = true;
    try { const d = await db.doc("meta/vacation").get(); vc.doc = d.exists ? d.data() : {}; } catch(_){ vc.doc = vc.doc || {}; }
    if (!vc.doc || typeof vc.doc !== "object") vc.doc = {}; vc.doc.v = 1;
    await loadVac(); vc.loaded = true; vc.loading = false; if (route === "vacation") renderVac();
  }
  function vcSave(){ clearTimeout(vc.saveT); vc.saveT = setTimeout(async () => { try { await db.doc("meta/vacation").set(vc.doc); } catch(_){ toast("График не сохранился — проверь интернет"); } }, 600); }

  const vcMonth = (y, m, o) => {
    const lead = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate(), td = today(), tag = o.ro ? "span" : "button";
    let h = `<div class="vc-m"><h3>${MONTHS_NOM[m]}</h3><div class="vc-w">${["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map(x => `<span>${x}</span>`).join("")}</div><div class="vc-d">` + "<i></i>".repeat(lead);
    for (let d = 1; d <= dim; d++){ const ds = `${y}-${pad(m + 1)}-${pad(d)}`, k = vcKind(ds, o.sakha), v = o.vac.has(ds), b = o.block.has(ds);
      const who = (o.others || []).filter(x => x.set.has(ds));
      const cls = ["vc-c", k.k, v ? "v" : "", v && !o.vac.has(addDays(ds, -1)) ? "vs" : "", v && !o.vac.has(addDays(ds, 1)) ? "ve" : "", b ? "b" : "", ds === td ? "t" : "", v && who.length ? "both" : ""].filter(Boolean).join(" ");
      const tip = [parseD(ds).toLocaleDateString("ru-RU", {day: "numeric", month: "long", weekday: "short"}), k.n, v ? (k.k === "hol" || k.k === "rhol" ? "в отпуске, но день не считается" : "отпуск") : "", b ? "нельзя брать" : "", who.length ? "отдыхают: " + who.map(x => x.nick).join(", ") : ""].filter(Boolean).join(" · ");
      h += `<${tag} ${o.ro ? "" : 'type="button" '}class="${cls}" data-vd="${ds}" title="${esc(tip)}">${d}${who.length ? `<em>${who.slice(0, 4).map(x => `<i style="background:${x.c}"></i>`).join("")}</em>` : ""}</${tag}>`; }
    return h + "</div></div>";
  };
  const vcOthers = year => [...vc.cmp].map((u, i) => { const r = vacOf(u, year); return r ? {uid: u, nick: profOf(u).nick || "?", c: VC_COLS[i % VC_COLS.length], set: new Set(r.days), days: r.days} : null; }).filter(Boolean);

  function renderVac(){
    appleHead("График отпусков", `<a class="a-link" href="#more">‹ Ещё</a>`);
    const m = $("aMain");
    if (!ME){ m.innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!vc.loaded){ m.innerHTML = `<p class="a-sub" style="text-align:center;margin-top:40px">Открываю календарь…</p>`; vcLoad(); return; }
    const built = m.querySelector(".vc"); if (built && built.dataset.y === String(vc.year)){ vcDraw(); return; }
    const noData = !VC_OFF[vc.year];
    m.innerHTML = `<div class="vc" data-y="${vc.year}"><header class="vc-top"><div><h1 class="a-h1">График отпусков</h1><p class="a-sub">Отмечай дни в календаре — посчитаю, сколько потратил и сколько осталось. График видишь только ты, пока сам не покажешь его в профиле.</p></div>
        <div class="vc-year"><button type="button" data-vy="-1" aria-label="Предыдущий год">‹</button><b>${vc.year}</b><button type="button" data-vy="1" aria-label="Следующий год">›</button></div></header>
      <section class="vc-card vc-sum" id="vcSum"></section>
      <section class="vc-card vc-tools" id="vcTools"></section>
      ${noData ? `<p class="vc-note">Переносы выходных на ${vc.year} год правительство ещё не утвердило — праздники показаны по Трудовому кодексу, переносы примерные.</p>` : ""}
      <div class="vc-grid" id="vcGrid"></div>
      <div class="vc-leg"><span><i class="vc-c v vs ve">7</i>отпуск</span><span><i class="vc-c b">7</i>нельзя брать</span><span><i class="vc-c hol">7</i>праздник России</span><span><i class="vc-c rhol">7</i>праздник Якутии</span><span><i class="vc-c off">7</i>выходной</span><span><i class="vc-c work t">7</i>сегодня</span></div>
      <section class="vc-card" id="vcRng"></section>
      <section class="vc-card vc-calc" id="vcCalc"></section></div>`;
    vcDraw(); vcCalcDraw(); vcWire(m);
  }
  function vcDraw(){
    if (!$("vcGrid")) return;
    const Y = vcY(), sk = vcSakha(), vac = new Set(Y.vac), block = new Set(Y.block), used = vcCount(Y.vac, sk), hol = Y.vac.length - used, total = Math.max(0, +Y.total || 0), left = total - used;
    const others = vcOthers(vc.year), pub = vacOf(ME.id, vc.year), same = pub && pub.days.join() === [...Y.vac].sort().join();
    $("vcSum").innerHTML = `<label class="vc-st in"><small>Дней отпуска в году</small><input type="number" id="vcTotal" min="0" max="366" inputmode="numeric" value="${total}" aria-label="Сколько дней отпуска в году"></label>
      <div class="vc-st"><small>Запланировано</small><b>${used}</b></div>
      <div class="vc-st${left < 0 ? " bad" : left === 0 && total ? " ok" : ""}"><small>${left < 0 ? "Перебор" : "Осталось"}</small><b>${Math.abs(left)}</b></div>
      <div class="vc-st dim"><small>Праздников внутри отпуска</small><b>${hol}</b></div>
      <div class="vc-bar${left < 0 ? " bad" : ""}"><i style="width:${total ? Math.min(100, used / total * 100) : 0}%"></i></div>`;
    const pool = (VAC || []).filter(r => r.year === vc.year && r.user_id !== ME.id && r.days.length);
    $("vcTools").innerHTML = `<div class="vc-row"><div class="ios-seg vc-seg" role="group" aria-label="Инструмент">${[["vac", VC_I.palm, "Отпуск"], ["block", VC_I.lock, "Нельзя брать"], ["erase", VC_I.erase, "Ластик"]].map(([k, ic, l]) => `<button type="button" data-vt="${k}" aria-pressed="${vc.tool === k}">${ic}${l}</button>`).join("")}</div>
        <button type="button" class="vc-chip" data-vrange="1" aria-pressed="${vc.range}" title="Первое нажатие — начало периода, второе — конец">${VC_I.range}Период в два нажатия</button>
        <button type="button" class="vc-chip" data-vsakha="1" aria-pressed="${sk}" title="27 апреля и 21 июня. По закону республики обязательны для бюджетных организаций">${VC_I.sun}Праздники Якутии</button>
        <button type="button" class="vc-chip dng" data-vclear="1">Очистить год</button></div>
      <p class="vc-hint">${vc.anchor ? `Начало периода — ${esc(vcSpan({a: vc.anchor, b: vc.anchor}))}. Нажми на последний день.` : vc.tool === "block" ? "Отмечай дни, которые нельзя брать, — отпуск на них потом не встанет." : vc.tool === "erase" ? "Ластик снимает и отпуск, и запрет." : vc.range ? "Нажми на первый и на последний день отпуска." : "Тяни мышкой по дням, чтобы отметить период, или нажимай на дни по одному. Shift+клик — период от прошлого нажатия."}</p>
      <div class="vc-row vc-pub">${pub ? (same ? `<span class="vc-ok">${ICON.check || "✓"} В профиле: друзья видят эти дни</span>` : `<button type="button" class="vc-btn pri" data-vpub="1">Обновить в профиле</button>`) + `<button type="button" class="vc-btn" data-vpub="0">Убрать из профиля</button>` : `<button type="button" class="vc-btn pri" data-vpub="1">Показать в профиле</button><small>Друзья увидят только дни — по кнопке «Отпуск» в твоём профиле. Запреты, остаток и расчёты остаются у тебя.</small>`}</div>
      <div class="vc-row vc-cmp"><span class="vc-lb">Сверить с друзьями:</span>${pool.length ? pool.map(r => { const i = [...vc.cmp].indexOf(r.user_id), on = i >= 0; return `<button type="button" class="vc-chip who" data-vcmp="${esc(r.user_id)}" aria-pressed="${on}" style="${on ? `--cc:${VC_COLS[i % VC_COLS.length]}` : ""}">${avaHTML(profOf(r.user_id), "xs")}${esc(profOf(r.user_id).nick || "?")}</button>`; }).join("") : `<small>На ${vc.year} год пока никто не показал свой отпуск в профиле.</small>`}</div>
      ${others.length ? `<div class="vc-ovl">${others.map(o => { const common = o.days.filter(d => vac.has(d)), rs = vcRanges(common, sk); return `<p><i style="background:${o.c}"></i><b>${esc(o.nick)}</b> — ${common.length ? `вместе отдыхаете ${vcDn(common.length)}: ${rs.map(vcSpan).map(esc).join(", ")}` : "пока ни одного общего дня"}</p>`; }).join("")}</div>` : ""}`;
    $("vcGrid").innerHTML = Array.from({length: 12}, (_, i) => vcMonth(vc.year, i, {vac, block, sakha: sk, others})).join("");
    if (vc.anchor){ const a = $("vcGrid").querySelector(`[data-vd="${vc.anchor}"]`); if (a) a.classList.add("anc"); }
    const rs = vcRanges(Y.vac, sk), long = rs.some(r => r.n >= 14), warn = [];
    if (left < 0) warn.push(`Запланировано на ${vcDn(-left)} больше, чем есть.`);
    if (rs.length && !long) warn.push("По Трудовому кодексу хотя бы одна часть отпуска должна быть не короче 14 календарных дней.");
    $("vcRng").innerHTML = `<h2 class="vc-h2">Мои периоды<span>${rs.length || ""}</span></h2>${rs.length ? `<div class="vc-rl">${rs.map(r => `<div class="vc-r"><b>${esc(vcSpan(r))}</b><span>${vcDn(r.n)}${r.all !== r.n ? ` · праздников: ${r.all - r.n}, не считаются` : ""}</span><button type="button" data-vdel="${r.a}:${r.b}" aria-label="Убрать период">${ICON.x}</button></div>`).join("")}</div>` : `<p class="vc-empty">Пока пусто. Отметь первый период в календаре выше.</p>`}
      ${warn.map(w => `<p class="vc-warn">${esc(w)}</p>`).join("")}
      <p class="vc-note">Праздничные дни в отпуск не входят и его продлевают (ст. 120 ТК РФ), поэтому не считаются. Обычные выходные — считаются.</p>`;
    vcCalcSync();
  }
  function vcApply(a, b){
    const Y = vcY(), [from, to] = a <= b ? [a, b] : [b, a], days = []; for (let d = from; d <= to && days.length < 370; d = addDays(d, 1)) days.push(d);
    const vs = new Set(Y.vac), bs = new Set(Y.block);
    if (vc.tool === "vac"){ const cand = days.filter(d => !bs.has(d)), allOn = cand.length && cand.every(d => vs.has(d)); cand.forEach(d => allOn ? vs.delete(d) : vs.add(d));
      if (!cand.length) toast("Эти дни заблокированы — сними запрет ластиком"); else if (cand.length !== days.length) toast(`Пропустил заблокированные дни: ${days.length - cand.length}`); }
    else if (vc.tool === "block"){ const allOn = days.every(d => bs.has(d)); days.forEach(d => { if (allOn) bs.delete(d); else { bs.add(d); vs.delete(d); } }); }
    else days.forEach(d => { vs.delete(d); bs.delete(d); });
    Y.vac = [...vs].sort(); Y.block = [...bs].sort(); vc.last = b; try { SND.click("soft"); } catch(_){ /* ожидаемо: звук недоступен */ } vcSave(); vcDraw();
  }
  function vcTap(ds, shift){
    if (shift && vc.last){ vc.anchor = null; vcApply(vc.last, ds); return; }
    if (!vc.range){ vcApply(ds, ds); return; }
    if (!vc.anchor){ vc.anchor = ds; vcDraw(); return; }
    const a = vc.anchor; vc.anchor = null; vcApply(a, ds);
  }
  function vcWire(m){
    const grid = $("vcGrid"), box = m.querySelector(".vc");
    const pv = () => { const d = vc.drag, [a, b] = d.a <= d.b ? [d.a, d.b] : [d.b, d.a]; grid.querySelectorAll(".vc-c").forEach(c => c.classList.toggle("pv", c.dataset.vd >= a && c.dataset.vd <= b)); };
    grid.addEventListener("pointerdown", e => { const c = e.target.closest(".vc-c"); if (!c || e.pointerType !== "mouse" || e.button || e.shiftKey || vc.range) return; e.preventDefault(); vc.drag = {a: c.dataset.vd, b: c.dataset.vd}; });
    grid.addEventListener("pointerover", e => { if (!vc.drag) return; const c = e.target.closest(".vc-c"); if (!c || c.dataset.vd === vc.drag.b) return; vc.drag.b = c.dataset.vd; pv(); });
    const up = () => { const d = vc.drag; if (!d) return; vc.drag = null; if (!document.body.contains(grid)){ removeEventListener("pointerup", up); return; } if (d.a === d.b) return; vc.skip = true; setTimeout(() => { vc.skip = false; }, 60); vcApply(d.a, d.b); };
    if (vc.up) removeEventListener("pointerup", vc.up); vc.up = up; addEventListener("pointerup", up);
    grid.addEventListener("click", e => { const c = e.target.closest(".vc-c"); if (!c) return; if (vc.skip){ vc.skip = false; return; } vcTap(c.dataset.vd, e.shiftKey); });
    box.addEventListener("click", async e => { const q = s => e.target.closest(s); let b;
      if ((b = q("[data-vy]"))){ vc.year = Math.min(2100, Math.max(2020, vc.year + +b.dataset.vy)); vc.anchor = null; renderVac(); return; }
      if ((b = q("[data-vt]"))){ vc.tool = b.dataset.vt; vc.anchor = null; vcDraw(); return; }
      if (q("[data-vrange]")){ vc.range = !vc.range; vc.anchor = null; vcDraw(); return; }
      if (q("[data-vsakha]")){ vc.doc.sakha = !vcSakha(); vcSave(); vcDraw(); return; }
      if ((b = q("[data-vclear]"))){ if (!b.dataset.sure){ b.dataset.sure = "1"; b.textContent = "Точно очистить? Нажми ещё раз"; return; } const Y = vcY(); Y.vac = []; Y.block = []; vc.anchor = null; vcSave(); vcDraw(); toast(`${vc.year} год очищен`); return; }
      if ((b = q("[data-vcmp]"))){ const u = b.dataset.vcmp; vc.cmp.has(u) ? vc.cmp.delete(u) : vc.cmp.add(u); vcDraw(); return; }
      if ((b = q("[data-vdel]"))){ const [a, z] = b.dataset.vdel.split(":"), Y = vcY(); Y.vac = Y.vac.filter(d => d < a || d > z); vcSave(); vcDraw(); return; }
      if ((b = q("[data-vpub]"))){ const on = b.dataset.vpub === "1", Y = vcY(); if (on && !Y.vac.length){ toast("Сначала отметь хотя бы один день отпуска"); return; }
        b.disabled = true; const days = [...Y.vac].sort();
        const r = on ? await SB.from("vacations").upsert({user_id: ME.id, year: vc.year, days, updated_at: now()}, {onConflict: "user_id,year"}) : await SB.from("vacations").delete().eq("user_id", ME.id).eq("year", vc.year);
        if (r.error){ toast("Не получилось, попробуй ещё раз"); b.disabled = false; return; }
        VAC = (VAC || []).filter(x => !(x.user_id === ME.id && x.year === vc.year)); if (on) VAC.push({user_id: ME.id, year: vc.year, days, updated_at: now()});
        toast(on ? "Готово — в твоём профиле появилась кнопка «Отпуск»" : "Убрал из профиля"); vcDraw(); return; }
      if ((b = q("[data-vcd]"))){ const i = $("vcDays"); if (i){ i.value = b.dataset.vcd; vcCalcRun(); } return; }
      if (q("[data-vcadd]")){ const C = vcCalcGet(); C.parts.push({dim: 30, cnt: 15}); vcCalcSet(C); vcCalcDraw(); return; }
      if ((b = q("[data-vcrm]"))){ const C = vcCalcGet(); C.parts.splice(+b.dataset.vcrm, 1); vcCalcSet(C); vcCalcDraw(); return; }
    });
    box.addEventListener("input", e => { const t = e.target;
      if (t.id === "vcTotal"){ const Y = vcY(); Y.total = Math.min(366, Math.max(0, parseInt(t.value, 10) || 0)); vcSave(); clearTimeout(vc.totT); vc.totT = setTimeout(() => { if (document.activeElement !== $("vcTotal")) vcDraw(); }, 50); vcSumLive(); return; }
      if (t.closest && t.closest("#vcCalc")) vcCalcRun(true); });
    box.addEventListener("change", e => { if (e.target.id === "vcTotal") vcDraw(); });
  }
  function vcSumLive(){ const Y = vcY(), used = vcCount(Y.vac, vcSakha()), st = $("vcSum") && $("vcSum").querySelectorAll(".vc-st"); if (!st || st.length < 3) return; const left = (+Y.total || 0) - used;
    st[2].className = "vc-st" + (left < 0 ? " bad" : ""); st[2].innerHTML = `<small>${left < 0 ? "Перебор" : "Осталось"}</small><b>${Math.abs(left)}</b>`; }

  // ---- калькулятор отпускных: всё считается и хранится только в этом браузере ----
  const vcCalcGet = () => { let c = null; try { c = JSON.parse(lsGet("nexus_vac_calc") || "null"); } catch(_){ /* ожидаемо: старые кривые данные */ } c = c && typeof c === "object" ? c : {}; return {earn: c.earn || "", full: c.full == null ? 12 : c.full, parts: Array.isArray(c.parts) ? c.parts : [], days: c.days || "", rate: c.rate || 13}; };
  const vcCalcSet = c => lsSet("nexus_vac_calc", JSON.stringify(c));
  const vcNum = v => { const n = parseFloat(String(v == null ? "" : v).replace(/\s/g, "").replace(",", ".")); return isFinite(n) ? n : 0; };
  function vcCalcDraw(){
    const el = $("vcCalc"); if (!el) return; const C = vcCalcGet();
    el.innerHTML = `<h2 class="vc-h2">Калькулятор отпускных<span>${VC_I.lock}видишь только ты</span></h2>
      <p class="vc-note" style="margin-top:0">Цифры никуда не отправляются и в профиль не попадают — они хранятся только в этом браузере.</p>
      <div class="vc-f">
        <label><small>Начислено за 12 месяцев до отпуска, ₽</small><input class="vc-in" id="vcEarn" inputmode="decimal" placeholder="например 960 000" value="${esc(C.earn)}"><em>Зарплата, премии, районный коэффициент и северные надбавки — до вычета налога. Без больничных, отпускных и матпомощи.</em></label>
        <label><small>Полностью отработанных месяцев</small><input class="vc-in" id="vcFull" type="number" min="0" max="12" inputmode="numeric" value="${esc(C.full)}"><em>Месяцы без больничных, отпусков и прогулов. Обычно 12 минус неполные.</em></label>
        <label><small>Дней отпуска</small><input class="vc-in" id="vcDays" type="number" min="0" max="366" inputmode="numeric" placeholder="14" value="${esc(C.days)}"><span class="vc-qd" id="vcQd"></span></label>
        <label><small>Ставка НДФЛ</small><select class="vc-in" id="vcRate">${[13, 15, 18, 20, 22].map(r => `<option value="${r}"${+C.rate === r ? " selected" : ""}>${r}%</option>`).join("")}</select><em>13% — если доход за год до 2,4 млн ₽. Выше — 15% и дальше по шкале.</em></label>
      </div>
      <div class="vc-parts"><small>Неполные месяцы (болел, был в отпуске, устроился не с первого числа)</small>
        ${C.parts.map((p, i) => `<div class="vc-part"><label>дней в месяце<input class="vc-in" data-vp="${i}:dim" type="number" min="28" max="31" value="${esc(p.dim)}"></label><label>из них отработано, календарных<input class="vc-in" data-vp="${i}:cnt" type="number" min="0" max="31" value="${esc(p.cnt)}"></label><button type="button" data-vcrm="${i}" aria-label="Убрать месяц">${ICON.x}</button></div>`).join("")}
        <button type="button" class="vc-btn" data-vcadd="1">+ Добавить неполный месяц</button></div>
      <div class="vc-res" id="vcRes" aria-live="polite"></div>
      <p class="vc-note">Это прикидка по правилам из Положения о среднем заработке (постановление № 922): средний дневной заработок = начислено ÷ (29,3 × полные месяцы + дни по неполным). Точную сумму считает бухгалтерия — у неё могут быть индексации, премии по особым правилам и другая ставка налога.</p>`;
    vcCalcSync(); vcCalcRun();
  }
  function vcCalcSync(){ const el = $("vcQd"); if (!el || !vc.doc) return; const Y = vcY(), sk = vcSakha(), rs = vcRanges(Y.vac, sk), all = vcCount(Y.vac, sk);
    el.innerHTML = all ? `<button type="button" data-vcd="${all}">весь год: ${all}</button>` + rs.slice(0, 6).map(r => `<button type="button" data-vcd="${r.n}" title="${esc(vcSpan(r))}">${esc(vcSpan(r))}: ${r.n}</button>`).join("") : ""; }
  function vcCalcRun(save){
    const g = id => $(id), res = g("vcRes"); if (!res) return;
    const C = {earn: g("vcEarn").value, full: g("vcFull").value, days: g("vcDays").value, rate: +g("vcRate").value || 13, parts: []};
    document.querySelectorAll("#vcCalc [data-vp]").forEach(i => { const [k, f] = i.dataset.vp.split(":"); (C.parts[+k] = C.parts[+k] || {})[f] = i.value; });
    if (save) vcCalcSet(C);
    const earn = vcNum(C.earn), full = Math.min(12, Math.max(0, vcNum(C.full))), days = Math.max(0, vcNum(C.days));
    const pd = C.parts.reduce((s, p) => { const dim = Math.min(31, Math.max(28, vcNum(p.dim) || 30)), cnt = Math.min(dim, Math.max(0, vcNum(p.cnt))); return s + 29.3 / dim * cnt; }, 0), base = 29.3 * full + pd;
    if (!(earn > 0) || !(base > 0)){ res.innerHTML = `<p class="vc-empty">Впиши заработок за год — посчитаю средний дневной и отпускные.</p>`; return; }
    const avg = earn / base, gross = avg * days, tax = Math.round(gross * C.rate / 100), f2 = n => n.toLocaleString("ru-RU", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " ₽";
    res.innerHTML = `<div class="vc-rs"><div><small>Расчётных дней</small><b>${base.toLocaleString("ru-RU", {maximumFractionDigits: 2})}</b></div><div><small>Средний дневной заработок</small><b>${f2(avg)}</b></div>
      <div><small>Начислят за ${vcDn(days)}</small><b>${f2(gross)}</b></div><div><small>НДФЛ ${C.rate}%</small><b>− ${fmtRub(tax)}</b></div><div class="big"><small>На руки</small><b>${f2(gross - tax)}</b></div></div>
      ${days ? "" : `<p class="vc-empty" style="margin-top:8px">Укажи, на сколько дней отпуск, — или нажми на период выше.</p>`}`;
  }

  // ---- «Отпуск» в профиле: только дни ----
  function vacSheet(uid){
    const mine = uid === ME.id, p = profOf(uid), rows = (VAC || []).filter(r => r.user_id === uid && r.days.length).sort((a, b) => a.year - b.year); if (!rows.length){ toast("Отпуск в профиле не показан"); return; }
    const cy = new Date().getFullYear(); let year = (rows.find(r => r.year >= cy && r.days.some(d => d >= today())) || rows.find(r => r.year >= cy) || rows[rows.length - 1]).year;
    const s = openSheet(`<div class="sh-grab"></div><div id="vacSh"></div>`, {wide: true}); s.el.classList.add("vc-sheet");
    const draw = () => { const r = rows.find(x => x.year === year), sk = vcSakha(), rs = vcRanges(r.days, sk), td = today(), now_ = rs.find(x => x.a <= td && td <= x.b), next = rs.find(x => x.a > td);
      const my = !mine && vc.doc && vc.doc.years && vc.doc.years[year] ? new Set(vc.doc.years[year].vac || []) : null, common = my ? r.days.filter(d => my.has(d)) : [];
      s.el.querySelector("#vacSh").innerHTML = `<div class="tlv-h">${avaHTML(p, "md")}<div><h3>Отпуск${mine ? "" : " — " + esc(p.nick || "")}</h3><p class="sub">${now_ ? `Сейчас в отпуске — до ${esc(vcSpan({a: now_.b, b: now_.b}))}` : next ? `Ближайший — с ${esc(vcSpan({a: next.a, b: next.a}))}, через ${vcDn(Math.round((parseD(next.a) - parseD(td)) / 864e5))}` : "В этом году отпуск уже позади"}</p></div></div>
        ${rows.length > 1 ? `<div class="ios-seg" style="margin-bottom:12px">${rows.map(x => `<button type="button" data-vsy="${x.year}" aria-pressed="${x.year === year}">${x.year}</button>`).join("")}</div>` : ""}
        <div class="vc-rl">${rs.map(x => `<div class="vc-r${x.b < td ? " past" : ""}"><b>${esc(vcSpan(x))}${rows.length > 1 ? "" : " " + year}</b><span>${vcDn(x.n)}</span></div>`).join("")}</div>
        ${my ? `<p class="vc-note">${common.length ? `С твоим графиком совпадает ${vcDn(common.length)}: ${vcRanges(common, sk).map(vcSpan).map(esc).join(", ")}.` : "С твоим графиком на этот год общих дней нет."}</p>` : ""}
        <div class="vc-grid ro">${Array.from({length: 12}, (_, i) => i).filter(i => r.days.some(d => +d.slice(5, 7) === i + 1)).map(i => vcMonth(year, i, {ro: true, vac: new Set(r.days), block: new Set(), sakha: sk})).join("")}</div>
        <div class="acts" style="margin-top:14px">${mine ? `<button class="ib blue" type="button" data-vgo="1">Изменить график</button>` : `<button class="ib blue" type="button" data-vgo="1">Сверить в календаре</button>`}</div>`; };
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-vsy]"); if (b){ year = +b.dataset.vsy; draw(); return; }
      if (e.target.closest("[data-vgo]")){ s.close(); if (!mine) vc.cmp.add(uid); vc.year = year; go("vacation"); if (route === "vacation") renderVac(); } });
    draw();
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-vacof]"); if (!b || !ME) return; e.preventDefault(); const u = b.dataset.vacof; if (VAC) vacSheet(u); else loadVac().then(() => VAC && vacSheet(u)); });

  // ================= 3.4: книга жалоб и предложений =================
  let BOOK = null, bookLoading = null, bookDraft = {text: "", file: null}, bookN = 5;
  async function loadBook(force){
    if (!SB || !ME) return null; if (BOOK && !force) return BOOK; if (bookLoading) return bookLoading;
    bookLoading = (async () => { const [f, v, c, cl] = await Promise.all([SB.from("feedback").select("*").order("created_at", {ascending: false}).limit(200), fetchAll(() => SB.from("feedback_votes").select("*"), ["feedback_id", "user_id"]), fetchAll(() => SB.from("feedback_comments").select("*").order("created_at", {ascending: true}), ["id"]), fetchAll(() => SB.from("feedback_comment_likes").select("comment_id,user_id,created_at"), ["comment_id", "user_id"])]);
      BOOK = {items: f.error ? [] : (f.data || []).sort(byAt("created_at")), votes: v.error ? [] : v.data || [], comments: c && !c.error ? c.data || [] : [], clikes: cl && !cl.error ? cl.data || [] : []}; bookLoading = null; if (route === "people") renderPeople(); return BOOK; })();
    return bookLoading;
  }
  function subscribeBook(){ if (!SB || !ME) return; let t = 0; const k = () => { clearTimeout(t); t = setTimeout(() => loadBook(true), 300); };
    SB.channel("nexus-book").on("postgres_changes", {event: "*", schema: "public", table: "feedback"}, k).on("postgres_changes", {event: "*", schema: "public", table: "feedback_votes"}, k).on("postgres_changes", {event: "*", schema: "public", table: "feedback_comments"}, k).on("postgres_changes", {event: "*", schema: "public", table: "feedback_comment_likes"}, k)
      .on("postgres_changes", {event: "*", schema: "public", table: "tierlist_likes"}, () => { clearTimeout(loadTlLikes.t); loadTlLikes.t = setTimeout(loadTlLikes, 300); })
      .on("postgres_changes", {event: "*", schema: "public", table: "tierlists"}, p => { if (FR && rtPatch(FR.tierlists, p, ["id"], {norm: x => ({...x, tiers: Array.isArray(x.tiers) ? x.tiers : [], pool: Array.isArray(x.pool) ? x.pool : []}), front: true})) rtLater("fr", () => render(), 300); else { clearTimeout(subscribeBook.t); subscribeBook.t = setTimeout(() => loadFriends(true), 500); } }).subscribe(); }
  const THUMB_U = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4-7c1.5 0 3 1 2.5 3l-.8 4H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 21H7"/></svg>';
  const THUMB_D = THUMB_U.replace("<svg", '<svg style="transform:rotate(180deg)"');
  const BK_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/></svg>';
  function bookCard(){
    if (!BOOK){ loadBook(); return `<div class="fb-card book"><p class="a-sub" style="margin:0">Открываю книгу…</p></div>`; }
    const its = BOOK.items, shown = its.slice(0, bookN);
    const ent = f => { const vs = BOOK.votes.filter(v => v.feedback_id === f.id), up = vs.filter(v => v.v === 1), dn = vs.filter(v => v.v === -1), my = vs.find(v => v.user_id === ME.id);
      const nc = (BOOK.comments || []).filter(c => c.feedback_id === f.id).length, upN = up.map(v => v.user_id);
      return `<article class="bk-e"><div class="bk-h">${avaHTML(profOf(f.user_id), "sm")}<b>${esc(nickOf(f.user_id))}</b><small>${BK_CLOCK}${esc(vkDate(f.created_at))}</small>${f.user_id === ME.id ? `<button class="bk-x" data-bkdel="${esc(f.id)}" title="Удалить">${ICON.x}</button>` : ""}</div>
        ${f.image ? `<img class="bk-img" src="${esc(publicUrl(f.image))}" alt="" data-vkimg="${esc(f.image)}" loading="lazy">` : ""}${f.body ? `<p class="bk-t${f.image ? "" : " solo"}">${f.image ? `<b>${esc(nickOf(f.user_id))}</b> ` : ""}${richText(f.body)}</p>` : ""}
        <div class="bk-v"><button class="up${my && my.v === 1 ? " on" : ""}" data-bkv="${esc(f.id)}:1" title="Нравится">${BK_HEART}<span>Нравится</span></button><button class="bk-cmb${bkOpen.has(f.id) ? " on" : ""}" data-bkc="${esc(f.id)}" title="Комментировать">${ICON.chat}<span>${nc ? nc : "Ответить"}</span></button><button class="dn${my && my.v === -1 ? " on" : ""}" data-bkv="${esc(f.id)}:-1" title="Не нравится">${THUMB_D}<b>${dn.length || ""}</b></button></div>
        ${vs.length ? `<button class="who" data-bkwho="${esc(f.id)}" title="Кто отметился">${BK_HEART}<span>${upN.length ? `${esc(upN.slice(0, 3).map(nickOf).join(", "))}${upN.length > 3 ? ` и ещё ${upN.length - 3}` : ""} <em>${upN.length > 1 ? "лайкнули" : "лайкнул"}</em>` : `<em>пока без лайков</em>`}${dn.length ? ` <em>· против: ${dn.length}</em>` : ""}</span></button>` : ""}${bkComments(f)}</article>`; };
    return `<div class="fb-card book"><div class="bk-top"><span class="bk-logo">Книга жалоб</span><small>и предложений</small></div>
      <p class="bk-sub">Что бесит, чего не хватает, идеи для сайта</p>
      <div class="bk-form"><textarea id="bkT" rows="3" maxlength="3000" placeholder="Пиши как есть…">${esc(bookDraft.text)}</textarea>
        <div class="bk-tools"><label class="bk-att" title="Картинка">${ICON.img}<input type="file" id="bkF" accept="image/*" hidden></label><span class="bk-pv" id="bkP">${bookDraft.file ? `<img src="${URL.createObjectURL(bookDraft.file)}" alt=""><button type="button" data-bkrm="1">✕</button>` : `<small>или перетащи фото</small>`}</span><button class="bk-go" id="bkGo" type="button">Опубликовать</button></div></div>
      ${shown.length ? `<div class="bk-l">${shown.map(ent).join("")}</div>${its.length > bookN ? `<button class="bk-more" data-bkmore="1">Показать ещё · ${its.length - bookN}</button>` : ""}` : `<p class="bk-empty">Пока ни одной записи. Будь первым.</p>`}</div>`;
  }
  function wireBook(){
    const t = $("bkT"); if (!t) return;
    t.oninput = () => bookDraft.text = t.value;
    const take = f => { if (!f || !f.type.startsWith("image/")) return; bookDraft.file = f; renderPeople(); };
    $("bkF").onchange = e => take(e.target.files[0]); bindDrop(document.querySelector(".bk-form"), take);
    t.addEventListener("focus", () => { pasteTarget = take; });
    $("bkGo").onclick = async () => { const body = t.value.trim(); if (!body && !bookDraft.file){ t.focus(); return; } const b = $("bkGo"); b.disabled = true; b.textContent = "Публикую…";
      try { const image = bookDraft.file ? await upload(bookDraft.file) : null; const {error} = await SB.from("feedback").insert({id: crypto.randomUUID(), user_id: ME.id, body: body || null, image, created_at: now()}); if (error) throw error;
        bookDraft = {text: "", file: null}; SND.paper("flip"); await loadBook(true); } catch(err){ toast("Не записалось: " + ((err && err.message) || err)); b.disabled = false; b.textContent = "Опубликовать"; } };
  }
  document.addEventListener("click", async e => { const el = e.target.closest && e.target.closest("[data-bkv],[data-bkwho],[data-bkdel],[data-bkrm],[data-bkmore]"); if (!el || !ME || !BOOK) return;
    if (el.dataset.bkrm){ bookDraft.file = null; renderPeople(); return; }
    if (el.dataset.bkmore){ bookN += 10; renderPeople(); return; }
    if (el.dataset.bkwho){ const vs = BOOK.votes.filter(v => v.feedback_id === el.dataset.bkwho); whoSheet("Голоса", [["За", THUMB_U, vs.filter(v => v.v === 1).map(v => v.user_id)], ["Против", THUMB_D, vs.filter(v => v.v === -1).map(v => v.user_id)]].filter(g => g[2].length)); return; }
    if (el.dataset.bkdel){ if (!confirm("Удалить запись из книги?")) return; const {error} = await SB.from("feedback").delete().eq("id", el.dataset.bkdel); if (error){ toast("Не удалилось"); return; } loadBook(true); return; }
    if (el.dataset.bkv){ const [id, v0] = el.dataset.bkv.split(":"), v = +v0, cur = BOOK.votes.find(x => x.feedback_id === id && x.user_id === ME.id);
      BOOK.votes = BOOK.votes.filter(x => !(x.feedback_id === id && x.user_id === ME.id)); if (!cur || cur.v !== v) BOOK.votes.push({feedback_id: id, user_id: ME.id, v}); renderPeople(); SND.click("soft");
      const r = cur && cur.v === v ? await SB.from("feedback_votes").delete().eq("feedback_id", id).eq("user_id", ME.id) : await SB.from("feedback_votes").upsert({feedback_id: id, user_id: ME.id, v, created_at: now()});
      if (r.error){ toast("Не получилось"); loadBook(true); } }
  });


  // ================= 3.5: «уже есть у друзей» при добавлении =================
  let FF_G = false;
  const frFindHTML = cls => FR && FR.items && FR.items.length && !FV ? `<div class="af-row ff" id="ffBox"><p class="af-cap">Или возьми у друзей</p><span class="ff-in">${ICON.search}<input class="${cls}" id="ffQ" autocomplete="off" placeholder="Начни вводить название — покажу, у кого уже есть"></span><div class="ff-res" id="ffRes" hidden></div></div><div class="ff-has" id="ffHas" hidden></div>` : `<div class="ff-has" id="ffHas" hidden></div>`;
  async function frCoverFile(it){ if (!it.cover) return null; try { const r = await fetch(publicUrl(it.cover)); if (!r.ok) return null; const b = await r.blob(); return new File([b], "cover.jpg", {type: b.type || "image/jpeg"}); } catch(_){ return null; } }
  const ffPool = g => { const m = new Map(); (FR ? FR.items : []).filter(i => ME && i.uid !== ME.id && (g ? isGame(i) : !isGame(i)) && i.title && i.status !== "wish").forEach(i => { const k = frKey(i), e = m.get(k);
    if (e){ if (!e.uids.includes(i.uid)) e.uids.push(i.uid); if (!e.it.cover && i.cover) e.it = i; } else m.set(k, {it: i, uids: [i.uid]}); }); return [...m.values()]; };
  const ffWho = uids => `${avaStack(uids, 3)}<small>есть у ${esc(uids.map(nickOf).slice(0, 2).join(", "))}${uids.length > 2 ? ` и ещё ${uids.length - 2}` : ""}</small>`;
  function wireFrFind(g, apply){
    FF_G = g; const q = $("ffQ"), box = $("ffRes"); if (!q || !box) return;
    let hits = [];
    const draw = () => { const v = normT(q.value).trim(); if (v.length < 2){ box.hidden = true; return; }
      const mk = myKeys(); hits = ffPool(g).filter(e => [e.it.title, e.it.originalTitle].some(t => t && normT(t).includes(v)))
        .sort((a, b) => b.uids.length - a.uids.length || (normT(a.it.title).startsWith(v) ? -1 : 0) - (normT(b.it.title).startsWith(v) ? -1 : 0)).slice(0, 8);
      box.hidden = false;
      box.innerHTML = hits.length ? hits.map((e, i) => { const have = mk.hasIt(e.it);
        return `<button type="button" class="ff-r" data-ff="${i}" ${have ? "disabled" : ""}>${posterHTML(e.it, {tgt: false, rate: false, badge: false})}<span class="t"><b>${esc(e.it.title)}</b><small>${esc([e.it.year, g ? genres(e.it).slice(0, 2).join(", ") : KTYPES[e.it.type]].filter(Boolean).join(" · "))}</small></span><span class="w">${have ? `<small class="mine">уже у тебя</small>` : ffWho(e.uids)}</span></button>`; }).join("")
        : `<p class="ff-none">У друзей такого нет — вставь ссылку выше</p>`; };
    q.addEventListener("input", draw); q.addEventListener("focus", draw);
    q.addEventListener("keydown", e => { if (e.key === "Escape") box.hidden = true; if (e.key === "Enter"){ e.preventDefault(); const b = box.querySelector(".ff-r:not([disabled])"); if (b) b.click(); } });
    document.addEventListener("pointerdown", e => { if (!e.target.closest("#ffBox")) box.hidden = true; }, {capture: true});
    box.onclick = async e => { const b = e.target.closest("[data-ff]"); if (!b || b.disabled) return; const h0 = hits[+b.dataset.ff]; if (!h0) return;
      box.hidden = true; q.value = h0.it.title; b.disabled = true; SND.click("soft");
      await apply(h0.it); ffHasChk(); toast(`Взял у ${nickOf(h0.uids[0])} — осталось выбрать статус${g ? "" : " и оценку"}`); };
  }
  function ffHasChk(){
    const el = $("ffHas"); if (!el || !FR) return; const t = $("f_title") && $("f_title").value.trim(); if (!t){ el.hidden = true; return; }
    const probe = {type: FF_G ? "game" : (($("f_type") || {}).value || "movie"), title: t, originalTitle: $("f_originalTitle") ? $("f_originalTitle").value.trim() : "", steamId: FORM_IDS.steamId, kpId: FORM_IDS.kpId};
    const uids = [...new Set(FR.items.filter(i => ME && i.uid !== ME.id && sameIt(i, probe)).map(i => i.uid))];
    const mine = MYITEMS.some(i => sameIt(i, probe));
    el.hidden = !uids.length && !mine;
    el.innerHTML = mine ? `<span class="ff-warn">${ICON.info || "!"}Это уже есть в твоей библиотеке</span>` : uids.length ? `<span class="ff-ok">${ffWho(uids)}</span>` : "";
  }

  // ================= 3.5: комментарии в книге жалоб =================
  const bkOpen = new Set(), bkCDraft = {};
  function bkComments(f){
    const cms = (BOOK.comments || []).filter(c => c.feedback_id === f.id).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    const open = bkOpen.has(f.id), shown = open ? cms : cms.slice(-2);
    const cm = c => `<div class="bk-cm">${avaHTML(profOf(c.user_id), "xs")}<div class="bk-cb"><div class="bk-ch"><b>${esc(nickOf(c.user_id))}</b><small>${esc(vkDate(c.created_at))}</small>${c.user_id === ME.id ? `<button class="bk-x" data-bkcdel="${esc(c.id)}" title="Удалить">${ICON.x}</button>` : ""}</div><p>${richText(c.body)}</p><div class="bk-ca">${bkLikeBtn(c)}${c.user_id !== ME.id ? `<button class="bk-rep" data-bkc="${esc(f.id)}" data-bkat="${esc(nickOf(c.user_id))}">Ответить</button>` : ""}</div></div></div>`;
    return `${cms.length > shown.length ? `<button class="bk-cmore" data-bkc="${esc(f.id)}">Показать все ${cms.length} ${plural(cms.length, "комментарий", "комментария", "комментариев")}</button>` : ""}
      ${shown.length ? `<div class="bk-cl">${shown.map(cm).join("")}</div>` : ""}
      ${open ? `<div class="bk-cf"><textarea id="bkC-${esc(f.id)}" rows="1" maxlength="1000" placeholder="Ответить…">${esc(bkCDraft[f.id] || "")}</textarea><button type="button" data-bkcs="${esc(f.id)}" title="Отправить">↵</button></div>` : ""}`;
  }
  const BK_HEART = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3.1 1.6-1.9 3-3.1 5.2-3.1 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21Z"/></svg>';
  function bkLikeBtn(c){
    const ls = (BOOK.clikes || []).filter(l => l.comment_id === c.id), on = ls.some(l => l.user_id === ME.id);
    return `<button class="bk-lk${on ? " on" : ""}" data-bkl="${esc(c.id)}" title="${on ? "Убрать лайк" : "Лайк"}">${BK_HEART}${ls.length ? `<b>${ls.length}</b>` : ""}</button>${ls.length ? `<button class="bk-lw" data-bklw="${esc(c.id)}" title="Кто лайкнул">${avaStack(ls.map(l => l.user_id), 3)}</button>` : ""}`;
  }
  async function bkSend(id){
    const t = $("bkC-" + id); if (!t) return; const body = t.value.trim(); if (!body) return; t.disabled = true;
    const row = {id: crypto.randomUUID(), feedback_id: id, user_id: ME.id, body, created_at: now()};
    const {error} = await SB.from("feedback_comments").insert(row);
    if (error){ toast("Не отправилось: " + error.message); t.disabled = false; return; }
    BOOK.comments = [...(BOOK.comments || []), row]; delete bkCDraft[id]; SND.paper("soft");
    const f = BOOK.items.find(x => x.id === id), to = new Set([f && f.user_id, ...BOOK.comments.filter(c => c.feedback_id === id).map(c => c.user_id), ...mentionedUids(body)]); to.delete(ME.id);
    if (to.size) notify([...to], "book_comment", "book:" + id, body);
    renderPeople(); setTimeout(() => { const n = $("bkC-" + id); if (n) n.focus(); }, 30);
  }
  document.addEventListener("click", async e => { const el = e.target.closest && e.target.closest("[data-bkc],[data-bkcs],[data-bkcdel],[data-bkl],[data-bklw]"); if (!el || !ME || !BOOK) return;
    if (el.dataset.bklw){ whoSheet("Лайкнули", [["Лайки", BK_HEART, (BOOK.clikes || []).filter(l => l.comment_id === el.dataset.bklw).map(l => l.user_id)]]); return; }
    if (el.dataset.bkl){ const id = el.dataset.bkl, on = (BOOK.clikes || []).some(l => l.comment_id === id && l.user_id === ME.id);
      BOOK.clikes = on ? BOOK.clikes.filter(l => !(l.comment_id === id && l.user_id === ME.id)) : [...(BOOK.clikes || []), {comment_id: id, user_id: ME.id}]; renderPeople(); if (!on) SND.click("soft");
      const r = on ? await SB.from("feedback_comment_likes").delete().eq("comment_id", id).eq("user_id", ME.id) : await SB.from("feedback_comment_likes").insert({comment_id: id, user_id: ME.id});
      if (r.error){ toast("Не получилось"); loadBook(true); } return; }
    if (el.dataset.bkc){ const id = el.dataset.bkc; if (bkOpen.has(id) && el.classList.contains("bk-cmb")) bkOpen.delete(id); else bkOpen.add(id);
      if (el.dataset.bkat){ const nk = "@" + el.dataset.bkat + " "; if (!(bkCDraft[id] || "").includes(nk)) bkCDraft[id] = nk + (bkCDraft[id] || ""); } renderPeople(); if (bkOpen.has(id)) setTimeout(() => { const n = $("bkC-" + id); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 30); return; }
    if (el.dataset.bkcs){ bkSend(el.dataset.bkcs); return; }
    if (el.dataset.bkcdel){ if (!confirm("Удалить комментарий?")) return; const {error} = await SB.from("feedback_comments").delete().eq("id", el.dataset.bkcdel); if (error){ toast("Не удалилось"); return; } BOOK.comments = BOOK.comments.filter(c => c.id !== el.dataset.bkcdel); renderPeople(); }
  });
  document.addEventListener("input", e => { const t = e.target; if (t && t.id && t.id.startsWith("bkC-")){ bkCDraft[t.id.slice(4)] = t.value; t.style.height = "auto"; t.style.height = Math.min(140, t.scrollHeight) + "px"; } });
  document.addEventListener("keydown", e => { const t = e.target; if (t && t.id && t.id.startsWith("bkC-") && e.key === "Enter" && !e.shiftKey && !document.querySelector(".mn-pop:not([hidden])")){ e.preventDefault(); bkSend(t.id.slice(4)); } });


  // ================= 3.7: перенос списков из Кинопоиска, MyShows и MangaLib =================
  const IMP = {
    kp: {n: "Кинопоиск", kind: "kino", c: "#ff6200"},
    ms: {n: "MyShows", kind: "kino", c: "#1e88e5"},
    ml: {n: "MangaLib", kind: "read", c: "#f5a623"}};
  const IMP_ST = {kino: [["playing", "Смотрю"], ["done", "Просмотрено"], ["future", "Буду смотреть"], ["dropped", "Бросил"]],
    read: [["reading", "Читаю"], ["done", "Прочитано"], ["plan", "В планах"], ["dropped", "Брошено"]]};
  const impSeg = (kind, one) => `<div class="imp-seg" role="tablist"><button type="button" aria-pressed="true">${one}</button><button type="button" data-impopen="${kind}"><span class="imp-l1">Перенести весь список</span><span class="imp-l2">Весь список</span><small>${kind === "read" ? "MangaLib" : "Кинопоиск · MyShows"}</small><i>›</i></button></div>`;
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-impopen]"); if (!b) return; e.preventDefault(); importSheet(b.dataset.impopen); });
  // разбор текста со страницы оценок Кинопоиска (Ctrl+A → Ctrl+C)
  function parseKpList(txt){
    const L = String(txt || "").split(/\r?\n/).map(s => s.replace(/ /g, " ").trim()).filter(Boolean);
    const isNum = s => /^(10|[1-9])([.,]\d)?$/.test(s), isIdx = s => /^\d{1,5}\.?$/.test(s), isDate = s => /^\d{1,2}\.\d{1,2}\.\d{4}/.test(s);
    const junk = s => /^(оценк|мои оценки|фильмы|сериалы|сортир|показать|все|страниц|следующ|предыдущ|буду смотреть|избранное|рецензи|друзья|подписк|кинопоиск|войти|меню|\d+\s+(оценк|фильм))/i.test(s);
    const yrParen = /^(.+?)\s*\(([^()]*?)((?:19|20)\d{2})(?:\s*[–—-]\s*(?:(?:19|20)\d{2}|\.\.\.)?)?\)\s*$/;
    const yrLine = /^(?:(.+?),\s*)?((?:19|20)\d{2})(?:\s*[–—-]\s*(?:(?:19|20)\d{2}|\.\.\.)?)?(?:\s*[,•·].*)?$/;
    const titleOk = s => s.length > 0 && s.length < 140 && /\p{L}/u.test(s) && !isDate(s) && !junk(s) && !/^\d+\s*мин/.test(s);
    const heads = [];
    for (let i = 0; i < L.length; i++){
      const s = L[i]; let m = s.match(yrParen);
      if (m && titleOk(m[1])){ heads.push({i, end: i, title: m[1].trim(), year: +m[3], series: /сериал|мини/i.test(m[2]) || /[–—-]/.test(s.slice(s.lastIndexOf("(")))}); continue; }
      const n = L[i + 1];
      if (n && titleOk(s) && !yrParen.test(s) && !isNum(s) && !isIdx(s)){ const k = n.match(yrLine); if (k && (!k[1] || titleOk(k[1]))){ heads.push({i, end: i + 1, title: s, orig: k[1] && k[1] !== s ? k[1].trim() : null, year: +k[2], series: /[–—-]/.test(n) || /сериал/i.test(n)}); i++; } }
    }
    const pre = heads.map(h => h.i > 0 && isIdx(L[h.i - 1]) ? parseInt(L[h.i - 1]) : null);
    const idxMode = heads.length > 1 && pre.filter((v, j) => v != null && j && pre[j - 1] != null && v === pre[j - 1] + 1).length >= (heads.length - 1) * .6;
    const out = heads.map((h, j) => { const stop = j + 1 < heads.length ? heads[j + 1].i - (idxMode ? 1 : 0) : L.length;
      const r = {ext: "kp:" + normT(h.title) + h.year, title: h.title, orig: h.orig || null, year: h.year, type: h.series ? "series" : "movie", rating: null, date: null};
      for (let x = h.end + 1; x < stop && x <= h.end + 6; x++){ const s = L[x];
        if (!r.orig && /^(.+?),\s*\d+\s*мин/.test(s)){ r.orig = s.match(/^(.+?),\s*\d+\s*мин/)[1]; continue; }
        if (r.rating == null && isNum(s)){ r.rating = Math.min(10, parseFloat(s.replace(",", "."))); continue; }
        const d = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/); if (d && !r.date){ r.date = `${d[3]}-${d[2].padStart(2, "0")}-${d[1].padStart(2, "0")}`; } }
      return r; });
    if (out.length) return out;
    // запасной вариант: по названию в строке, «Название (2014) 8»
    return L.filter(titleOk).slice(0, 2000).map(s => { const m = s.match(/^(.+?)(?:\s*\(((?:19|20)\d{2})\))?(?:\s*[—–-]?\s*(10|[1-9])(?:\s*\/\s*10)?)?$/) || [s, s];
      return {ext: "kp:" + normT(m[1]) + (m[2] || ""), title: m[1].trim(), year: m[2] ? +m[2] : null, type: "movie", rating: m[3] ? +m[3] : null}; });
  }
  async function impCoverId(url){
    if (!url || !assets) return null;
    try { const r = await fetch(viaPx(`${SB_BASE}/functions/v1/import?img=${encodeURIComponent(url)}`)); if (!r.ok) return null;
      const b = await r.blob(); if (!b.type.startsWith("image/") || b.size < 800) return null; return (await assets.upload(b, {type: b.type})).id; } catch(_){ return null; }
  }
  const rKey = t => normT(t).replace(/\s+/g, "");

  const IMP_FAQ = {
    ms: [
      ["Где взять ник MyShows?", `<ol><li>Открой <a href="https://myshows.me/" target="_blank" rel="noopener">myshows.me</a> в браузере и войди.</li><li>Нажми на свою аватарку → «Профиль».</li><li>В адресной строке будет <code>myshows.me/ТВОЙ_НИК</code> — скопируй адрес целиком и вставь сюда. Можно вписать и просто ник.</li></ol><p>С телефона удобнее открыть сайт myshows.me в браузере: в приложении адрес профиля не видно.</p>`],
      ["Пишет «профиль не найден» или список пустой", `<ul><li>Проверь ник — без пробелов и лишних символов, именно как в адресе профиля.</li><li>Профиль должен быть открытым: в настройках приватности MyShows разреши показывать профиль всем. Закрытый профиль сайт не видит.</li><li>Если только что поменял настройки — подожди минуту и нажми «Найти» ещё раз.</li></ul>`],
      ["Что переносится и куда", `<ul><li><b>Смотрю</b> → «Смотрю», с числом просмотренных серий.</li><li><b>Досмотрел</b> → «Просмотрено», все серии отмечены.</li><li><b>Буду смотреть</b> → «На будущее».</li><li><b>Бросил</b> → «Брошено» (по умолчанию выключено — включи кнопкой над списком).</li><li>Оценки MyShows пятибалльные — умножаю на 2: ★4 станет 8.</li><li>Постеры, год, оригинальное название, аниме или сериал — тоже переносятся.</li></ul>`],
      ["Что не переносится", `<p>Фильмы (MyShows не отдаёт их по нику), комментарии, даты просмотра отдельных серий и избранные эпизоды.</p>`],
      ["Можно перенести ещё раз?", `<p>Да. То, что уже есть на полке, помечается «уже есть» и пропускается — дублей не будет. Удобно, если досмотрел что-то новое на MyShows.</p>`]],
    ml: [
      ["Где взять ссылку на профиль MangaLib?", `<ol><li>Открой <a href="https://mangalib.me/" target="_blank" rel="noopener">mangalib.me</a> и войди.</li><li>Нажми на аватарку → «Профиль».</li><li>Скопируй адрес из браузера — он вида <code>mangalib.me/ru/user/1234567</code>. Можно вставить и только число.</li></ol><p>В приложении: открой профиль → «Поделиться» → «Копировать ссылку».</p>`],
      ["Пишет «закладки скрыты» или «не нашёл»", `<ul><li>На MangaLib открой настройки → приватность и разреши показывать закладки всем.</li><li>Проверь, что ссылка именно на профиль (<code>/user/…</code>), а не на мангу.</li><li>После смены настроек подожди минуту и нажми «Найти» ещё раз.</li></ul>`],
      ["Что переносится и куда", `<ul><li><b>Читаю</b> → «Читаю», <b>Прочитано</b> → «Прочитано», <b>В планах</b> → «В планах».</li><li><b>Любимые</b> → в любимые (сердечко на полке).</li><li><b>Брошено</b> и свои папки → «В планах» (брошенное по умолчанию выключено).</li><li>Сколько глав прочитал, сколько вышло, твоя оценка, ссылка на тайтл и обложка.</li></ul>`],
      ["Что не переносится", `<p>Ранобэ и аниме с других сайтов Lib, заметки к закладкам, история чтения по датам.</p>`],
      ["Можно перенести ещё раз?", `<p>Да, повторный перенос добавит только новые тайтлы — то, что уже есть в Читалке, пропускается.</p>`]],
    kp: [
      ["Как скопировать оценки с компьютера", `<ol><li>Открой <a href="https://www.kinopoisk.ru/" target="_blank" rel="noopener">kinopoisk.ru</a> и войди.</li><li>Нажми на аватарку → «Оценки» (или «Буду смотреть»).</li><li>Нажми <b>Ctrl+A</b> (выделить всё), затем <b>Ctrl+C</b> (копировать). На Mac — ⌘A и ⌘C.</li><li>Вернись сюда, кликни в поле и нажми <b>Ctrl+V</b> — список разберётся сам.</li></ol>`],
      ["Как сделать это с телефона", `<ol><li>Открой kinopoisk.ru в браузере, не в приложении — из приложения текст не скопировать.</li><li>В меню браузера включи «Версия для ПК» / «Полная версия сайта».</li><li>Зайди в «Оценки», зажми текст → «Выбрать всё» → «Копировать».</li><li>Вставь сюда долгим нажатием → «Вставить».</li></ol>`],
      ["Оценок много, они на нескольких страницах", `<p>Кинопоиск показывает оценки по страницам. Скопируй первую страницу, перенеси, потом открой следующую и повтори — то, что уже перенесено, пропустится. Если внизу есть выбор «показывать по …», поставь максимум — страниц будет меньше.</p>`],
      ["Перенести «Буду смотреть»", `<p>Открой на Кинопоиске список «Буду смотреть», скопируй так же и перед разбором выбери «Положить как → Буду смотреть». Фильмы встанут в «На будущее».</p>`],
      ["Что переносится и куда", `<ul><li>Название, оригинальное название, год, твоя оценка и дата, когда поставил оценку — она станет датой просмотра.</li><li>Сериалы узнаю по пометке «сериал» или по годам вида 2008–2013.</li><li>Постеров в тексте страницы нет — карточки будут с названием. Постер легко поставить потом: открой карточку → «Редактировать» → вставь ссылку на фильм с Кинопоиска → «Заполнить».</li></ul>`],
      ["Не нашлось ни одного фильма", `<ul><li>Скопируй страницу целиком — вместе с названиями и годами, а не только оценки.</li><li>Можно вставить и свой список, по фильму на строку: <code>Интерстеллар (2014) 10</code>.</li><li>Если всё равно не выходит — скинь скопированный текст в «Книгу жалоб и предложений», поправим разбор.</li></ul>`]],
    all: [["Это безопасно?", `<p>Пароли не нужны и никуда не вводятся. Беру только то, что и так открыто в твоём профиле на этих сайтах, и ничего там не меняю.</p>`]]};
  const impFaqHTML = src => `<div class="imp-faq"><div class="imp-faq-h">${ICON.info || ""}Вопросы и подробная инструкция</div>${[...IMP_FAQ[src], ...IMP_FAQ.all].map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="imp-faq-a">${a}</div></details>`).join("")}</div>`;
  function importSheet(mode){
    if (!ME){ toast("Сначала войди"); return; }
    const srcs = Object.entries(IMP).filter(([, v]) => mode === "all" || v.kind === mode);
    let src = srcs[0][0], kind = IMP[src].kind, list = null, who = "", kpSt = "done", busy = false, off = new Set(["dropped"]), pick = new Set();
    const s = openSheet(`<h3>${mode === "read" ? "Перенос закладок" : "Перенос списка"}</h3><p class="sub" id="impSub">Всё переедет на твои полки разом — со статусами, ${mode === "read" ? "главами" : mode === "kino" ? "сериями" : "сериями и главами"} и оценками. Что уже есть, пропущу.</p>
      ${srcs.length > 1 ? `<div class="imp-src" id="impSrc">${srcs.map(([k, v]) => `<button type="button" data-src="${k}" style="--c:${v.c}" aria-pressed="${k === src}">${esc(v.n)}</button>`).join("")}</div>` : ""}
      <div id="impIn"></div><div id="impRes"></div>`, {wide: true});
    s.el.classList.add("imp-sheet");
    const q = x => s.el.querySelector(x);
    const have = it => kind === "read" ? (READS || []).some(r => [r.title, r.origTitle].filter(Boolean).some(t => rKey(t) === rKey(it.title) || (it.orig && rKey(t) === rKey(it.orig))))
      : myKeys().hasIt({type: it.type, title: it.title, originalTitle: it.orig});
    const stOf = it => src === "kp" ? kpSt : it.status;
    const drawIn = () => {
      q("#impRes").innerHTML = ""; list = null;
      q("#impIn").innerHTML = src === "kp" ? `<ol class="imp-steps"><li>Открой <a href="https://www.kinopoisk.ru/" target="_blank" rel="noopener">Кинопоиск</a> → свой профиль → <b>Оценки</b> (или «Буду смотреть»)</li><li>Нажми <b>Ctrl+A</b>, затем <b>Ctrl+C</b> — на телефоне «Выбрать всё» → «Копировать»</li><li>Вставь сюда — разберу сам</li></ol>
          <textarea class="in imp-ta" id="impQ" rows="4" placeholder="Вставь сюда всё со страницы оценок"></textarea>
          <div class="imp-kps"><span>Положить как</span><button type="button" data-kps="done" aria-pressed="true">Просмотрено</button><button type="button" data-kps="future" aria-pressed="false">Буду смотреть</button></div>
          <div class="acts"><button class="ib blue" id="impGo">Разобрать</button></div>${impFaqHTML("kp")}`
        : `<label class="f">${src === "ms" ? "Ник или ссылка на профиль MyShows" : "Ссылка на профиль MangaLib"}<input class="in" id="impQ" autocomplete="off" placeholder="${src === "ms" ? "myshows.me/твой_ник" : "mangalib.me/ru/user/1234567"}"></label>
          <div class="acts"><button class="ib blue" id="impGo">Найти</button></div>${impFaqHTML(src)}`;
      const inp = q("#impQ"); setTimeout(() => inp.focus(), 60);
      inp.addEventListener("keydown", e => { if (e.key === "Enter" && src !== "kp"){ e.preventDefault(); load(); } });
      if (src === "kp") inp.addEventListener("paste", () => setTimeout(load, 30));
      q("#impGo").onclick = load;
      s.el.querySelectorAll("[data-kps]").forEach(b => b.onclick = () => { kpSt = b.dataset.kps; s.el.querySelectorAll("[data-kps]").forEach(x => x.setAttribute("aria-pressed", x === b)); if (list) drawRes(); });
    };
    const load = async () => {
      const v = q("#impQ").value.trim(); if (!v){ q("#impQ").focus(); return; }
      const res = q("#impRes"); res.innerHTML = `<p class="imp-wait"><i class="imp-spin"></i>Собираю список…</p>`;
      try {
        if (src === "kp"){ list = parseKpList(v); who = "Кинопоиск"; if (!list.length) throw new Error("Не нашёл в тексте ни одного фильма. Скопируй страницу целиком — вместе с названиями и годами"); }
        else { const {data, error} = await SB.functions.invoke("import", {body: {src: src === "ms" ? "myshows" : "mangalib", q: v}});
          if (error || !data) throw new Error("Сервис не ответил, попробуй ещё раз"); if (data.error) throw new Error(data.error);
          list = data.items || []; who = data.who || ""; if (!list.length) throw new Error("Список пустой"); }
        const seen = new Set(); list = list.filter(x => x.title && !seen.has(x.ext) && seen.add(x.ext));
        list.forEach(x => x.have = have(x)); pick = new Set(list.filter(x => !x.have).map(x => x.ext)); drawRes();
      } catch(err){ res.innerHTML = `<p class="imp-err">${esc((err && err.message) || "Не получилось")}</p>`; }
    };
    const drawRes = () => {
      const sts = IMP_ST[kind], cnt = st => list.filter(x => stOf(x) === st).length;
      const vis = list.filter(x => !off.has(stOf(x)));
      const n = vis.filter(x => pick.has(x.ext) && !x.have).length, haveN = list.filter(x => x.have).length;
      const lab = x => { const st = stOf(x), l = (sts.find(z => z[0] === st) || [, st])[1]; return kind === "read" && st === "dropped" ? "брошено → в планы" : l.toLowerCase(); };
      const meta = x => [x.year, kind === "read" ? x.kind : KTYPES[x.type], kind === "read" ? (x.chRead ? `${x.chRead}${x.chTotal ? "/" + x.chTotal : ""} гл.` : "") : (x.epT ? `${x.epW || 0}/${x.epT} сер.` : ""), x.date ? fmtShort(x.date) : ""].filter(Boolean).join(" · ");
      q("#impRes").innerHTML = `<div class="imp-sum"><b>${list.length}</b> ${plural(list.length, "тайтл", "тайтла", "тайтлов")}${who && src !== "kp" ? ` у <b>${esc(who)}</b>` : ""}${haveN ? ` · ${haveN} уже на полке` : ""}</div>
        ${src === "kp" ? "" : `<div class="imp-chips">${sts.filter(([k]) => cnt(k)).map(([k, l]) => `<button type="button" data-ist="${k}" aria-pressed="${!off.has(k)}">${off.has(k) ? "" : CHECK_I}${l}<small>${cnt(k)}</small></button>`).join("")}</div>`}
        <div class="imp-l">${vis.map(x => `<label class="imp-r${x.have ? " have" : ""}"><input type="checkbox" data-iext="${esc(x.ext)}" ${x.have ? "disabled" : pick.has(x.ext) ? "checked" : ""}><span class="cv">${x.cover ? `<img src="${esc(String(CFG.SUPABASE_URL).replace(/\/$/, "") + "/functions/v1/import?img=" + encodeURIComponent(x.cover))}" alt="" loading="lazy" onerror="this.remove()">` : `<i>${esc((x.title || "?").slice(0, 1))}</i>`}</span><span class="t"><b>${esc(x.title)}</b><small>${esc(meta(x))}</small></span><span class="st">${x.have ? "уже есть" : esc(lab(x))}${x.rating ? `<em class="${rateCls(x.rating)}">${num1(x.rating)}</em>` : ""}</span></label>`).join("")}</div>
        <div class="imp-go"><button class="ib blue" id="impDo" ${n ? "" : "disabled"}>Перенести ${n}</button><button class="ib" id="impAll">${vis.every(x => x.have || pick.has(x.ext)) ? "Снять все" : "Выбрать все"}</button></div>
        <div class="imp-bar" id="impBar" hidden><i></i><span></span></div>`;
      q("#impRes").querySelectorAll("[data-ist]").forEach(b => b.onclick = () => { const k = b.dataset.ist; off.has(k) ? off.delete(k) : off.add(k); drawRes(); });
      q("#impRes").querySelectorAll("[data-iext]").forEach(c => c.onchange = () => { c.checked ? pick.add(c.dataset.iext) : pick.delete(c.dataset.iext); const n2 = list.filter(x => !off.has(stOf(x)) && pick.has(x.ext) && !x.have).length; q("#impDo").textContent = `Перенести ${n2}`; q("#impDo").disabled = !n2; });
      q("#impAll").onclick = () => { const all = vis.every(x => x.have || pick.has(x.ext)); vis.forEach(x => { if (!x.have) all ? pick.delete(x.ext) : pick.add(x.ext); }); drawRes(); };
      q("#impDo").onclick = run;
    };
    const run = async () => {
      if (busy) return; busy = true;
      const todo = list.filter(x => !off.has(stOf(x)) && pick.has(x.ext) && !x.have);
      const bar = q("#impBar"); bar.hidden = false; q("#impDo").disabled = true; q("#impAll").disabled = true;
      let done = 0, fail = 0;
      const tick = () => { bar.querySelector("i").style.width = (done / todo.length * 100) + "%"; bar.querySelector("span").textContent = `Переношу ${done} из ${todo.length}…`; };
      tick();
      const one = async x => {
        const cover = x.cover ? await impCoverId(x.cover) : null, via = "import:" + IMP[src].n;
        if (kind === "read"){
          const r = {title: x.title, origTitle: x.orig || null, type: x.type || "manga", status: rNorm(x.status), fav: x.fav || null, favAt: x.fav ? now() : null,
            myRating: x.rating ?? null, chRead: x.chRead || 0, chTotal: x.chTotal || null, url: x.url || null, cover: cover || null, coverUrl: null, via};
          if (!(await saveRead(r))) throw 0;
        } else {
          const st = stOf(x), ser = isSerT(x.type);
          const body = {type: x.type || "movie", title: x.title, originalTitle: x.orig || null, year: x.year || null, status: st, rating: st === "future" ? null : (x.rating ?? null),
            createdAt: now(), updatedAt: now(), via};
          if (cover) body.cover = cover;
          if (src === "ms" && /^ms:\d+$/.test(x.ext)) body.srcUrl = `https://myshows.me/view/${x.ext.slice(3)}/`;
          if (ser){ body.epTotal = x.epT || null; body.epWatched = st === "done" && x.epT ? x.epT : (x.epW ?? null); }
          if (st === "done"){ if (x.date){ body.date = x.date; } else body.noDate = true; }
          if (st === "dropped") body.noDate = true;
          await db.collection("items").add(body);
        }
      };
      const q2 = [...todo]; const worker = async () => { while (q2.length){ const x = q2.shift(); try { await one(x); x.have = true; } catch(_){ fail++; } done++; tick(); } };
      await Promise.all([worker(), worker(), worker()]);
      busy = false; SND.paper && SND.paper("flip");
      const msg = fail ? `Готово: ${done - fail}, не получилось ${fail}` : `Готово! Перенесено ${done} — уже на полках`; bar.querySelector("span").textContent = msg;
      toast(`Перенесено ${done - fail} ${plural(done - fail, "тайтл", "тайтла", "тайтлов")} из ${IMP[src].n}`);
      if (kind === "read" && route === "read") renderRead(); else render();
      setTimeout(() => { if (s.closed) return; drawRes(); const b2 = q("#impBar"); b2.hidden = false; b2.classList.add("ok"); b2.querySelector("i").style.width = "100%"; b2.querySelector("span").textContent = msg; }, 900);
    };
    if (q("#impSrc")) q("#impSrc").onclick = e => { const b = e.target.closest("[data-src]"); if (!b || busy) return; src = b.dataset.src; kind = IMP[src].kind; q("#impSrc").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); drawIn(); };
    drawIn();
  }

  // ================= 3.4: «+» на полке Читалки — выбрать из своих тайтлов =================
  function readShelfPick(st, fav){
    const pool = (READS || []).filter(r => fav ? !r.fav : rNorm(r.status) !== st).sort(recentFirst);
    if (!pool.length){ readSheet(null, {status: st, ...(fav ? {fav: true} : {})}); return; }
    const name = fav ? "Любимые" : (RSTAT3.find(x => x[0] === st) || [])[1];
    const s = openSheet(`<h3>На полку «${esc(name)}»</h3><p class="sub">Выбери из своих тайтлов — они переедут сюда. Или добавь новый.</p>
      <label class="pk-q">${ICON.search}<input class="in" id="rpQ" placeholder="Найти" autocomplete="off"></label>
      <div class="pk" id="rpK">${pool.map(r => `<button type="button" class="pk-c" data-k="${esc(r.id)}" aria-pressed="false">${rCover(r)}<i class="pk-ok">${CHECK_I}</i><span>${esc(r.title)}</span></button>`).join("")}</div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="rpOk">Готово</button><button class="ib" id="rpNew">${ICON.plus}Новый тайтл</button></div>`, {wide: true, onClose: () => render()});
    const q = x => s.el.querySelector(x);
    q("#rpQ").addEventListener("input", e => { const v = e.target.value.trim().toLowerCase(); s.el.querySelectorAll(".pk-c").forEach(b => b.hidden = !!v && !b.textContent.toLowerCase().includes(v)); });
    q("#rpK").onclick = async e => { const b = e.target.closest(".pk-c"); if (!b || b.disabled) return; const r = (READS || []).find(x => x.id === b.dataset.k); if (!r) return;
      const on = b.getAttribute("aria-pressed") !== "true", prev = {status: r.status, fav: r.fav, favAt: r.favAt}; b.disabled = true; b.setAttribute("aria-pressed", on); SND.paper("soft");
      const patch = fav ? {fav: on || null, favAt: on ? now() : null} : {status: on ? st : (b.dataset.was || r.status)}; if (!fav && on) b.dataset.was = r.status;
      if (!(await saveRead({...r, ...patch}))){ b.setAttribute("aria-pressed", !on); Object.assign(r, prev); } b.disabled = false; };
    q("#rpOk").onclick = () => s.close();
    q("#rpNew").onclick = () => { s.close(); readSheet(null, {status: st, ...(fav ? {fav: true} : {})}); };
  }

  // ================= 3.3: «ОЦЕНИТЬ» — по очереди всё без оценки =================
  const rateQueue = kind => MYITEMS.filter(i => kind === "games" ? isGame(i) && inLib(i) && gStatus(i.status) !== "playing" : !isGame(i) && inLib(i) && kNorm(i) !== "playing").filter(i => typeof i.rating !== "number").sort(byAt("createdAt"));
  const rateCta = kind => { if (!canWrite || FV) return ""; const n = rateQueue(kind).length; if (!n) return "";
    return `<button class="rate-cta ${kind}" data-rateq="${kind}"><span class="rc-ic">${ICON.star}</span><span class="rc-t"><b>ОЦЕНИТЬ</b><small>${n} ${plural(n, kind === "games" ? "игра ждёт" : "запись ждёт", kind === "games" ? "игры ждут" : "записи ждут", kind === "games" ? "игр ждут" : "записей ждут")} оценки — по очереди, колесом</small></span><span class="rc-go">›</span></button>`; };
  function rateSheet(kind){
    const q = rateQueue(kind); if (!q.length){ toast("Всё уже оценено"); return; }
    let i = 0, done = 0;
    const s = openSheet(`<div class="rq" id="rq"></div>`, {wide: true, onClose: () => render()});
    const box = s.el.querySelector("#rq");
    const step = () => {
      if (i >= q.length){ box.innerHTML = `<div class="rq-end"><b>${done ? "Готово!" : "Пропущено всё"}</b><p class="sub">${done ? `Оценено ${done} из ${q.length}.` : "Можно вернуться позже."}</p><div class="acts"><button class="ib blue" id="rqX">Закрыть</button></div></div>`; box.querySelector("#rqX").onclick = () => s.close(); if (done) confetti(); return; }
      const it = q[i];
      box.innerHTML = `<div class="rq-top"><span>${i + 1} из ${q.length}</span><div class="rq-pb"><i style="width:${i / q.length * 100}%"></i></div></div>
        <div class="rq-card">${posterHTML(it, {tgt: false, rate: false})}<div><h3>${esc(it.title)}</h3><p class="sub">${esc([isGame(it) ? GSTATUS[gStatus(it.status)] : kLab(it).l, it.year, genres(it).slice(0, 2).join(", ")].filter(Boolean).join(" · "))}</p></div></div>
        ${wheelHTML("rqW", null)}
        <div class="acts" style="margin-top:14px"><button class="ib blue" id="rqOk" disabled>Оценить и дальше</button><button class="ib" id="rqSkip">Пропустить</button><button class="ib" id="rqStop">Хватит</button></div>`;
      wireWheel("rqW", v => { box.querySelector("#rqOk").disabled = v == null; });
      const sync = () => { const b = box.querySelector("#rqOk"); if (b) b.disabled = wheelVal("rqW") == null; };
      box.querySelector("#rqW").addEventListener("scroll", () => setTimeout(sync, 160), {passive: true, capture: true});
      box.querySelector("#rqW").addEventListener("click", () => setTimeout(sync, 400));
      box.querySelector("#rqOk").onclick = async () => { const v = wheelVal("rqW"); if (v == null) return; const b = box.querySelector("#rqOk"); b.disabled = true;
        try { await write(it.id, {rating: v}); done++; SND.click("soft"); } catch(_){ toast("Не сохранилось"); } i++; step(); };
      box.querySelector("#rqSkip").onclick = () => { i++; step(); };
      box.querySelector("#rqStop").onclick = () => s.close();
    };
    step();
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-rateq],[data-upd]"); if (!el || !ME) return;
    if (el.dataset.rateq){ rateSheet(el.dataset.rateq); return; }
    const [k, u] = el.dataset.upd.split(":"); updSheet(k, u || null); });

  // ================= 3.3: «Подробнее» в календаре выходов =================
  let FULL_ID = null, pdX = 0, pdY = 0;
  document.addEventListener("pointerdown", e => { pdX = e.clientX; pdY = e.clientY; }, true);
  function openFull(id){ const it = items.find(i => i.id === id); if (!it) return; FULL_ID = id; openId = id; useWorld(it); isGame(it) ? openGame(it) : openKino(it); pfViewExtras(it); }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-relmore]"); if (!el) return; e.preventDefault(); e.stopPropagation();
    if (Math.hypot(e.clientX - pdX, e.clientY - pdY) > 8) return;
    const k = el.dataset.relmore; if (k.includes("/")) friendItemSheet(k); else openFull(k); }, true);

  // ================= 3.3: уведомления, колокольчик, упоминания =================
  let NTF = [], ntfOpen = false;
  async function loadNtf(){
    if (!SB || !ME) return;
    const {data, error} = await SB.from("notifications").select("*").order("created_at", {ascending: false}).limit(60);
    if (!error) NTF = data || []; syncBell();
  }
  function subscribeNtf(){
    if (!SB || !ME) return;
    SB.channel("nexus-ntf-" + ME.id).on("postgres_changes", {event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${ME.id}`}, p => {
      const n = p.new; if (!n || NTF.some(x => x.id === n.id)) return; NTF.unshift(n); syncBell(); const t = ntfText(n) + (n.kind === "suggest" && n.body ? ` «${esc(n.body)}»` : "");
      if (n.kind === "suggest") loadSug();
      toast(t.replace(/<[^>]+>/g, "")); SND.click(); sysNote("NEXUS", t.replace(/<[^>]+>/g, ""), () => ntfGo(n));
      if (ntfOpen) bellPop(true);
    }).subscribe();
  }
  const ntfText = n => { const who = `<b>${esc(profOf(n.actor).nick || "кто-то")}</b>`;
    if (n.kind === "place_want") return `${who} зовёт сходить в заведение`; if (n.kind === "place_visit") return `${who} отметил, что вы были вместе`;
    if (n.kind === "slop_plan") return `${who} зовёт играть в СЛОПе`; if (n.kind === "slop_poll") return `${who} запустил голосование в СЛОПе`;
    return n.kind === "mention_post" ? `${who} отметил тебя в посте` : n.kind === "mention_comment" ? `${who} отметил тебя в комментарии` : n.kind === "comment" ? `${who} ответил на твой пост` : n.kind === "mention_event" ? `${who} отметил тебя на стене ${String(n.ref || "").startsWith("watch:") ? "кинопоказа" : "мероприятия"}` : n.kind === "tier_reply" ? `${who} ответил своей версией на твой тир-лист` : n.kind === "tier_comment" ? `${who} написал в тир-листе` : n.kind === "book_comment" ? `${who} ответил в книге жалоб` : n.kind === "suggest" ? `${who} предлагает тебе` : n.kind === "suggest_ok" ? `${who} сохранил себе то, что ты предложил` : `${who} зовёт тебя`; };
  const bellInv = () => (EV && ME ? myInvites() : []).map(m => ({inv: true, m, e: evById(m.event_id), ts: m.updated_at || (evById(m.event_id) || {}).created_at || ""})).filter(x => x.e);
  const ntfUnread = () => NTF.filter(n => !n.read).length + bellInv().length;
  function syncBell(){ const b = $("bellBtn"); if (!b) return; const n = ntfUnread(), d = b.querySelector(".bell-n"); d.hidden = !n; d.textContent = n > 9 ? "9+" : n; b.classList.toggle("on", !!n); }
  function ntfGo(n){
    const [k, id] = String(n.ref || "").split(":"); if (!id) return;
    if (k === "event" || k === "watch"){ go(n.ref); return; }
    if (k === "sug"){ sugSheet(id); return; }
    if (k === "slopplan" || k === "sloppoll"){ slNtf(k, id); return; }
    if (k === "place"){ go("place:" + id); return; }
    if (k === "user"){ go(n.ref); return; }
    if (k === "book"){ bkOpen.add(id); const jb = () => { const el = document.querySelector(`[data-bkc="${CSS.escape(id)}"]`); if (el){ const a = el.closest(".bk-e"); a.scrollIntoView({behavior: "smooth", block: "center"}); a.classList.remove("flash"); void a.offsetWidth; a.classList.add("flash"); } else if (bookN < 500){ bookN = 500; renderPeople(); } };
      if (route === "people") renderPeople(); else go("people"); setTimeout(jb, 400); setTimeout(jb, 1300); return; }
    if (k === "tier"){ const op = () => tlById(id) ? tlView(id) : loadFriends(true).then(() => tlView(id)); if (FR) op(); else loadFriends().then(op); return; }
    actTab = "wall"; lsSet("nexus_acttab", "wall"); if (k === "comment") wOpen.add(id);
    const jump = () => { const el = document.querySelector(`[data-wp="${CSS.escape(id)}"]`); if (el){ el.scrollIntoView({behavior: "smooth", block: "center"}); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } };
    if (route === "people") renderPeople(); else go("people");
    setTimeout(jump, 350); setTimeout(jump, 1200);
  }
  function bellPop(keep){
    document.querySelectorAll(".ntf-pop").forEach(x => x.remove()); if (!keep && ntfOpen){ ntfOpen = false; return; }
    ntfOpen = true; const b = $("bellBtn"), r = b.getBoundingClientRect(), pop = document.createElement("div"); pop.className = "ntf-pop";
    const inv = bellInv(), all = [...inv, ...NTF.map(n => ({n, ts: n.created_at}))].sort((a, x) => String(x.ts).localeCompare(String(a.ts)));
    pop.innerHTML = `<div class="ntf-h"><b>Уведомления</b>${NTF.some(n => !n.read) ? `<button type="button" data-ntfall="1">Прочитать всё</button>` : ""}</div><div class="ntf-l">${all.length ? all.map(x => {
      if (x.inv){ const e = x.e, f = e.kind === "watch" ? filmItem(e) : null;
        return `<button class="ntf-r unread" data-ntfev="${esc(evRoute(e))}">${avaHTML(profOf(x.m.invited_by || e.owner), "sm")}<span class="t"><span><b>${esc(frNick(x.m.invited_by || e.owner))}</b> зовёт ${e.kind === "watch" ? "смотреть" : "на"} «${esc(f ? f.title || e.title : e.title)}»</span><small>${esc(evIn(e) || evWhen(e))} · ждёт ответа</small></span><i class="ntf-k inv">${ICON.calendar}</i></button>`; }
      const n = x.n; return `<button class="ntf-r${n.read ? "" : " unread"}" data-ntf="${esc(n.id)}">${avaHTML(profOf(n.actor), "sm")}<span class="t"><span>${ntfText(n)}</span>${n.body ? `<em>«${esc(n.body)}»</em>` : ""}<small>${esc(agoTs(n.created_at))}</small></span><i class="ntf-k">${n.kind === "comment" || n.kind === "book_comment" ? ICON.chat : n.kind === "tier_reply" ? ICON.tiers : n.kind === "suggest" || n.kind === "suggest_ok" ? ICON.film : /^place_/.test(n.kind) ? ICON.pin : "@"}</i></button>`; }).join("")
      : `<p class="ntf-e">Пока тихо. Сюда придут упоминания, ответы на посты и приглашения.</p>`}</div>`;
    document.body.appendChild(pop);
    const w = pop.offsetWidth; pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + "px"; pop.style.top = (r.bottom + 8) + "px";
    const unread = NTF.filter(n => !n.read).map(n => n.id);
    if (unread.length) setTimeout(async () => { if (!ntfOpen) return; const {error} = await SB.from("notifications").update({read: true}).in("id", unread); if (!error){ NTF.forEach(n => { if (unread.includes(n.id)) n.read = true; }); syncBell(); } }, 1500);
  }
  document.addEventListener("click", async e => {
    const t = e.target; if (!t.closest) return;
    if (t.closest("#bellBtn")){ if (!ME){ toast("Сначала войди"); return; } bellPop(false); return; }
    const pop = t.closest(".ntf-pop");
    if (!pop && ntfOpen){ ntfOpen = false; document.querySelectorAll(".ntf-pop").forEach(x => x.remove()); return; }
    if (!pop) return;
    const r = t.closest("[data-ntf]"), ev = t.closest("[data-ntfev]"), all = t.closest("[data-ntfall]");
    if (all){ const ids = NTF.filter(n => !n.read).map(n => n.id); if (ids.length){ await SB.from("notifications").update({read: true}).in("id", ids); NTF.forEach(n => n.read = true); syncBell(); bellPop(true); } return; }
    if (ev){ ntfOpen = false; pop.remove(); go(ev.dataset.ntfev); return; }
    if (r){ const n = NTF.find(x => x.id === r.dataset.ntf); ntfOpen = false; pop.remove(); if (n) ntfGo(n); }
  });
  addEventListener("resize", () => { if (ntfOpen){ ntfOpen = false; document.querySelectorAll(".ntf-pop").forEach(x => x.remove()); } });
  // кого отметили: @ник в тексте
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function mentionedUids(text){
    if (!FR || !text) return [];
    const t = String(text).toLowerCase();
    return FR.profiles.filter(p => p.nick && (!ME || p.user_id !== ME.id) && new RegExp("@" + reEsc(p.nick.toLowerCase()) + "(?![\\p{L}\\p{N}_])", "u").test(t)).map(p => p.user_id);
  }
  async function notify(uids, kind, ref, body){
    const rows = [...new Set(uids)].filter(u => u && ME && u !== ME.id).map(u => ({user_id: u, actor: ME.id, kind, ref, body: body ? String(body).replace(/\s+/g, " ").slice(0, 140) : null}));
    if (!rows.length) return; const {error} = await SB.from("notifications").insert(rows); if (error) console.warn("notify", error.message);
  }
  function linkMentions(html){
    if (!FR || !html || html.indexOf("@") < 0) return html;
    const ps = FR.profiles.filter(p => p.nick).sort((a, b) => b.nick.length - a.nick.length); if (!ps.length) return html;
    const re = new RegExp("@(" + ps.map(p => reEsc(esc(p.nick))).join("|") + ")(?![\\p{L}\\p{N}_])", "giu");
    return html.replace(re, (m, nk) => { const p = ps.find(x => esc(x.nick).toLowerCase() === nk.toLowerCase()); if (!p) return m; const me = ME && p.user_id === ME.id;
      return `<button class="mention${me ? " me" : ""}" ${me ? 'data-go="home"' : `data-user="${esc(p.user_id)}"`}>@${esc(p.nick)}</button>`; });
  }
  // подсказка ников при наборе «@»
  let mnBox = null, mnTa = null, mnSel = 0, mnList = [];
  const mnClose = () => { if (mnBox){ mnBox.remove(); mnBox = null; } mnTa = null; };
  function mnShow(ta){
    const pos = ta.selectionStart ?? ta.value.length, m = ta.value.slice(0, pos).match(/(?:^|[\s(])@([\p{L}\p{N}_.-]{0,16})$/u);
    if (!m || !FR){ mnClose(); return; }
    const qq = m[1].toLowerCase(); mnList = FR.profiles.filter(p => p.nick && (!ME || p.user_id !== ME.id) && p.nick.toLowerCase().startsWith(qq)).slice(0, 6);
    if (!mnList.length){ mnClose(); return; }
    mnTa = ta; mnSel = Math.min(mnSel, mnList.length - 1);
    if (!mnBox){ mnBox = document.createElement("div"); mnBox.className = "mn-pop"; document.body.appendChild(mnBox);
      mnBox.addEventListener("pointerdown", e => { e.preventDefault(); const b = e.target.closest("[data-mn]"); if (b) mnPick(+b.dataset.mn); }); }
    mnBox.innerHTML = `<div class="h">Отметить</div>` + mnList.map((p, i) => `<button type="button" data-mn="${i}" class="${i === mnSel ? "on" : ""}">${avaHTML(p, "sm")}<span>${esc(p.nick)}</span></button>`).join("");
    const r = ta.getBoundingClientRect(), h = mnBox.offsetHeight; mnBox.style.left = Math.max(8, Math.min(innerWidth - mnBox.offsetWidth - 8, r.left)) + "px";
    mnBox.style.top = (r.bottom + h + 8 > innerHeight && r.top - h - 6 > 0 ? r.top - h - 6 : r.bottom + 6) + "px";
  }
  function mnPick(i){
    const ta = mnTa, p = mnList[i]; if (!ta || !p) return;
    const pos = ta.selectionStart ?? ta.value.length, before = ta.value.slice(0, pos).replace(/@([\p{L}\p{N}_.-]{0,16})$/u, "@" + p.nick + " ");
    ta.value = before + ta.value.slice(pos); ta.setSelectionRange(before.length, before.length); ta.dispatchEvent(new Event("input", {bubbles: true})); mnClose(); ta.focus();
  }
  const isWallTa = t => t && t.tagName === "TEXTAREA" && (t.id === "wlT" || t.id === "vkT" || /^(wlC|bkC)-/.test(t.id));
  document.addEventListener("input", e => { if (isWallTa(e.target)){ mnSel = 0; mnShow(e.target); } });
  document.addEventListener("keydown", e => { if (!mnBox || e.target !== mnTa) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); e.stopPropagation(); mnSel = (mnSel + (e.key === "ArrowDown" ? 1 : -1) + mnList.length) % mnList.length; mnShow(mnTa); }
    else if (e.key === "Enter" || e.key === "Tab"){ e.preventDefault(); e.stopImmediatePropagation(); mnPick(mnSel); }
    else if (e.key === "Escape"){ e.stopPropagation(); mnClose(); } }, true);
  document.addEventListener("focusout", e => { if (e.target === mnTa) setTimeout(mnClose, 120); });
  addEventListener("resize", () => { clearTimeout(applySecBg.t); applySecBg.t = setTimeout(applySecBg, 200); });

  // ================= 4.3: сторож связи с базой =================
  // если данные не дошли за 12 секунд — говорим прямо, а не показываем пустой профиль
  let bootWD = 0, netShown = false;
  async function netFail(){
    if (netShown || itemsLoaded) return;
    // через прокси не загрузилось — уходим напрямую, только если прямое подключение правда работает (с VPN).
    // Раньше уходили не проверяя, и в России без VPN вкладка до закрытия оставалась без базы.
    if (PROXY && pxOn()){
      let direct = false;
      try { const r = await fetch(`${SB_BASE}/auth/v1/health`, {headers: {apikey: CFG.SUPABASE_ANON_KEY}, cache: "no-store", signal: AbortSignal.timeout(4000)}); direct = r.ok; } catch(_){ /* ожидаемо: напрямую база закрыта (Россия без VPN) */ }
      if (netShown || itemsLoaded) return;
      if (direct){ try { sessionStorage.setItem("nexus_px_off", "1"); location.reload(); return; } catch(_){ /* ожидаемо: sessionStorage закрыт — покажем окно */ } }
    }
    netShown = true;
    let el = $("netFail"); if (!el){ el = document.createElement("div"); el.id = "netFail"; document.body.appendChild(el); }
    el.innerHTML = `<div class="nf-box" role="alertdialog" aria-label="Нет связи с базой"><div class="nf-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.5 5.1"/><path d="M5 12.6a10 10 0 0 1 3.5-2M19 12.6a10 10 0 0 0-2.4-1.7"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1"/><path d="m3 3 18 18"/></svg></div>
      <h3>Нет связи с базой NEXUS</h3>
      <p>Сайт открылся, но твои данные до него не доходят. Похоже, провайдер режет соединение с сервером базы — в России такое бывает без VPN.</p>
      <p><b>Ничего не пропало:</b> игры, фильмы и всё остальное лежат на месте, их просто не видно.</p>
      <ol><li>Включи VPN</li><li>Нажми «Обновить»</li></ol>
      <p id="nfD" style="font-size:12px;opacity:.7">Проверяю связь…</p>
      <div class="nf-acts"><button type="button" class="ib blue" id="nfR">Обновить</button><button type="button" class="ib" id="nfW">Подождать ещё</button></div></div>`;
    el.hidden = false; document.body.classList.add("nf-on");
    // «Обновить» ещё и сбрасывает сохранённые старые файлы сайта, чтобы телефон не сидел на прошлой версии
    $("nfR").onclick = async () => { try { sessionStorage.removeItem("nexus_px_off"); } catch(_){ /* ожидаемо */ } try { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); if (window.caches){ const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } } catch(_){ /* ожидаемо: нет service worker (приватный режим и т. п.) */ } location.reload(); };
    netDiag($("nfD"));
    $("nfW").onclick = () => { el.hidden = true; document.body.classList.remove("nf-on"); netShown = false; clearTimeout(bootWD); bootWD = setTimeout(netFail, 15000); };
  }
  // что видит этот браузер: ответили ли прокси и база напрямую (чтобы с телефона было понятно, где обрыв)
  async function netDiag(d){
    if (!d) return;
    const t = async u => { const t0 = performance.now(); try { const r = await fetch(u, {cache: "no-store", signal: AbortSignal.timeout(8000)}); return "ответил за " + Math.round(performance.now() - t0) + " мс (код " + r.status + ")"; } catch(e){ return "не ответил (" + ((e && e.name) || "ошибка") + ")"; } };
    const [px, dr] = await Promise.all([PROXY ? t(PROXY + "?p=" + encodeURIComponent("/auth/v1/health")) : Promise.resolve("выключен"), t(SB_BASE + "/auth/v1/health")]);
    d.textContent = "Версия сайта " + NEXUS_VER + ". Прокси: " + px + ". Напрямую: " + dr + (pxOff() ? ". Режим: напрямую." : ".");
    // то же, но с твоим входом: что именно не проходит
    try {
      const {data: {session}} = await Promise.race([SB.auth.getSession(), new Promise((_, no) => setTimeout(() => no(new Error("getSession завис")), 8000))]);
      if (!session){ d.textContent += " Вход: сессии нет."; return; }
      const hd = {apikey: CFG.SUPABASE_ANON_KEY, authorization: "Bearer " + session.access_token};
      const q = async (base, px) => { const t0 = performance.now(); try { const r = await fetch(base, {headers: px ? {apikey: hd.apikey, "x-nx-auth": hd.authorization} : hd, cache: "no-store", signal: AbortSignal.timeout(10000)}); const tx = await r.text(); return r.status + ", " + Math.round(tx.length / 1024) + " КБ, " + Math.round(performance.now() - t0) + " мс"; } catch(e){ return "не ответил (" + ((e && e.name) || "ошибка") + ")"; } };
      const path = "/rest/v1/profiles?select=nick&limit=1", [a2, b2] = await Promise.all([PROXY ? q(PROXY + "?p=" + encodeURIComponent(path), true) : Promise.resolve("выключен"), q(SB_BASE + path)]);
      d.textContent += " Со входом: прокси " + a2 + "; напрямую " + b2 + ".";
    } catch(e){ d.textContent += " Вход: " + ((e && e.message) || "ошибка") + "."; }
  }
  function netOk(){ clearTimeout(bootWD); netShown = false; const el = $("netFail"); if (el){ el.hidden = true; document.body.classList.remove("nf-on"); } }


