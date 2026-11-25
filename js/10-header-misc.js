  // ================= 2.1: шапка — тема, патчноуты =================
  function syncHead(){
    const d = $("pnBtn") && $("pnBtn").querySelector(".dot"); if (d) d.hidden = !patchUnseen();
    const md = $("ghMenuBtn") && $("ghMenuBtn").querySelector(".dot"); if (md) md.hidden = !patchUnseen();
    const light = document.documentElement.dataset.mode === "light", b = $("modeBtn");
    if (b && b.dataset.m !== String(light)){ b.dataset.m = String(light); b.innerHTML = light ? ICON.moon : ICON.sun; b.title = light ? "Тёмная тема" : "Светлая тема"; }
  }
  function setMode(m){
    const root = document.documentElement; if (root.dataset.mode === m) return;
    const run = () => { root.dataset.mode = m; root.dataset.theme = m; lsSet("nexus_mode", m); applyTheme(theme);
      const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.content = m === "light" ? "#f3f1ec" : "#0e0e10";
      syncHead(); if (route === "more" && $("view").hidden) renderMore(); };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(run); else run();
  }
  $("modeBtn").onclick = () => { const b = $("modeBtn"); b.classList.add("spin"); setTimeout(() => b.classList.remove("spin"), 380); setMode(document.documentElement.dataset.mode === "light" ? "dark" : "light"); };

  // ================= 2.1: живой поиск =================
  let srSel = -1;
  const hlq = (t, q) => { const i = t.toLowerCase().indexOf(q); return i < 0 ? esc(t) : esc(t.slice(0, i)) + "<mark>" + esc(t.slice(i, i + q.length)) + "</mark>" + esc(t.slice(i + q.length)); };
  function searchPop(){
    const pop = $("srPop"), q = qv();
    if (!q){ pop.hidden = true; return; }
    const score = i => { const t = (i.title || "").toLowerCase(), o = (i.originalTitle || "").toLowerCase();
      return t.startsWith(q) ? 0 : t.includes(q) ? 1 : o.includes(q) ? 2 : (i.genre || "").toLowerCase().includes(q) ? 3 : 9; };
    const hits = items.map(i => [score(i), i]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || (b[1].updatedAt || "").localeCompare(a[1].updatedAt || "")).map(x => x[1]);
    const gs = hits.filter(isGame).slice(0, 6), ks = hits.filter(i => !isGame(i)).slice(0, 6);
    const ppl = FR && ME ? FR.profiles.filter(p => p.user_id !== ME.id && (p.nick || "").toLowerCase().includes(q)).slice(0, 4) : [];
    const sub = it => isGame(it) ? ["Игра", isFuture(it) ? "в списке желаемого" : isSoon(it) ? "ждёт релиз" : GSTATUS[gStatus(it.status)].toLowerCase(), genres(it).slice(0, 2).join(", ")]
      : [KTYPES[it.type] || "Кино", isFuture(it) ? "на будущее" : isSoon(it) ? "ждёт премьеру" : kLab(it).l.toLowerCase(), it.year];
    const row = it => `<button class="sr-i" data-sr="${esc(it.id)}" role="option">${posterHTML(it, {rate:false, tgt:false, badge:false})}<span class="t"><b>${hlq(it.title || "", q)}</b><small>${esc(sub(it).filter(Boolean).join(" · "))}</small></span>${typeof it.rating === "number" ? `<span class="r ${rateCls(it.rating)}">${num1(it.rating)}</span>` : ""}</button>`;
    let h = "";
    if (FV) h += `<div class="sr-h">Полка ${esc(profOf(FV).nick || "")}</div>`;
    if (gs.length) h += `<div class="sr-h">Игры</div>` + gs.map(row).join("");
    if (ks.length) h += `<div class="sr-h">Кино</div>` + ks.map(row).join("");
    if (ppl.length) h += `<div class="sr-h">Друзья</div>` + ppl.map(p => `<button class="sr-i" data-sru="${esc(p.user_id)}" role="option">${avaHTML(p)}<span class="t"><b>${hlq(p.nick || "", q)}</b><small>открыть профиль</small></span></button>`).join("");
    const any = gs.length || ks.length || ppl.length;
    pop.innerHTML = any ? h + `<div class="sr-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> выбрать</span><span><kbd>Enter</kbd> открыть</span><span><kbd>Esc</kbd> закрыть</span></div>`
      : `<div class="sr-empty">Ничего не нашлось по «${esc($("q").value.trim())}»</div>`;
    pop.hidden = false; srSel = -1;
  }
  $("q").addEventListener("input", () => { searchPop(); const w = (ROUTES[route] || {}).w; if (w === "wGames") renderGames(); else if (w === "wKino") renderKino(); });
  $("q").addEventListener("focus", () => { if (qv()) searchPop(); });
  $("q").addEventListener("keydown", e => {
    const pop = $("srPop"), its = [...pop.querySelectorAll(".sr-i")];
    if (e.key === "Escape"){ if ($("q").value){ $("q").value = ""; $("q").dispatchEvent(new Event("input")); } pop.hidden = true; $("q").blur(); e.stopPropagation(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); if (!its.length) return; srSel = (srSel + (e.key === "ArrowDown" ? 1 : -1) + its.length) % its.length;
      its.forEach((x, i) => x.classList.toggle("on", i === srSel)); its[srSel].scrollIntoView({block: "nearest"}); return; }
    if (e.key === "Enter"){ const t = its[srSel >= 0 ? srSel : 0]; if (t){ e.preventDefault(); t.click(); } }
  });
  $("srPop").addEventListener("mousedown", e => e.preventDefault());
  $("srPop").addEventListener("click", e => { const b = e.target.closest(".sr-i"); if (!b) return; e.stopPropagation(); $("srPop").hidden = true; $("q").blur();
    if (b.dataset.sru){ go("user:" + b.dataset.sru); return; }
    const id = b.dataset.sr; if (FV) friendItemSheet(FV + "/" + id); else openItem(id); });
  document.addEventListener("pointerdown", e => { if (!e.target.closest("#ghSearch")) $("srPop").hidden = true; });
  document.addEventListener("keydown", e => { if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) && !(e.target.closest && e.target.closest("input,textarea,select,[contenteditable]"))){ e.preventDefault(); $("q").focus(); } });

  // ================= 2.1: крутящийся календарь выходов =================
  const calmMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function wireCarousels(){ document.querySelectorAll('[data-carou="1"]').forEach(wireCarousel); }
  function wireCarousel(el){
    el.dataset.carou = "2";
    const cards = () => [...el.children];
    const upd = () => {
      const r = el.getBoundingClientRect(); if (!r.width) return;
      const cx = r.left + r.width / 2; let best = null, bd = 1e9;
      cards().forEach(c => { const b = c.getBoundingClientRect(), off = (b.left + b.width / 2 - cx) / (r.width / 2), a = Math.max(-1.5, Math.min(1.5, off)), ad = Math.abs(a);
        c.style.transform = calmMotion ? "" : `rotateY(${(-a * 46).toFixed(2)}deg) translateZ(${(-ad * 110).toFixed(1)}px) scale(${(1 - Math.min(ad, 1) * .06).toFixed(3)})`;
        c.style.opacity = (1 - Math.min(ad, 1.3) * .3).toFixed(3); c.style.zIndex = 100 - Math.round(ad * 50);
        if (Math.abs(off) < bd){ bd = Math.abs(off); best = c; } });
      cards().forEach(c => c.classList.toggle("mid", c === best));
    };
    let lastSL = null, acc = 0, sndOn = false; setTimeout(() => { sndOn = true; lastSL = el.scrollLeft; }, 600);
    let raf = 0; el.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd);
      if (sndOn){ const dd = Math.abs(el.scrollLeft - lastSL); lastSL = el.scrollLeft; acc += dd; if (acc > 44){ acc = 0; SND.tick(Math.min(1, dd / 28)); } } }, {passive: true});
    let drag = null, vel = 0, lastX = 0, lastT = 0, moved = false, mom = 0;
    const snap = () => { const r = el.getBoundingClientRect(), cx = r.left + r.width / 2; let bd = null;
      cards().forEach(c => { const b = c.getBoundingClientRect(), d = b.left + b.width / 2 - cx; if (bd == null || Math.abs(d) < Math.abs(bd)) bd = d; });
      if (bd) el.scrollBy({left: bd, behavior: "smooth"}); };
    el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button) return; cancelAnimationFrame(mom); drag = {x: e.clientX, l: el.scrollLeft}; lastX = e.clientX; lastT = performance.now(); vel = 0; moved = false; });
    el.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 4){ moved = true; el.classList.add("drag"); try { el.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } }
      if (!moved) return; el.scrollLeft = drag.l - dx; const t = performance.now(); vel = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t; });
    const up = () => { if (!drag) return; drag = null; el.classList.remove("drag"); if (!moved) return;
      let v = -vel * 16; const step = () => { v *= .93; el.scrollLeft += v; if (Math.abs(v) > .5) mom = requestAnimationFrame(step); else snap(); };
      mom = requestAnimationFrame(step); };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
    el.addEventListener("click", e => { if (moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    el.addEventListener("dragstart", e => e.preventDefault());
    // на старте ближайший релиз чуть левее центра, справа видно следующие
    requestAnimationFrame(() => { const cs = cards(); if (cs.length > 2 && innerWidth > 640 && !el.classList.contains("gw-list")){ const r = el.getBoundingClientRect(), b = cs[1].getBoundingClientRect(); el.scrollLeft += b.left + b.width / 2 - (r.left + r.width / 2) - b.width * .35; } upd(); });
  }
  addEventListener("resize", () => document.querySelectorAll('[data-carou="2"]').forEach(el => el.dispatchEvent(new Event("scroll"))));

  // ================= 2.1: выбор даты =================
  const MON_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  const fmtDP = v => { if (!v) return ""; const d = parseD(v); return `${d.getDate()} ${MON_GEN[d.getMonth()]} ${d.getFullYear()}`; };
  let dpCur = null;
  function enhanceDate(inp){
    if (inp.dataset.dp) return; inp.dataset.dp = "1";
    const btn = document.createElement("button"); btn.type = "button"; btn.className = inp.className + " dp-btn"; btn.innerHTML = `${ICON.calendar}<span class="v"></span>`;
    if (inp.id) btn.dataset.for = inp.id;
    const P = HTMLInputElement.prototype, dv = Object.getOwnPropertyDescriptor(P, "value"), dd = Object.getOwnPropertyDescriptor(P, "disabled"), dh = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "hidden");
    inp.after(btn); inp.type = "hidden";
    const sync = () => { const v = dv.get.call(inp), s = btn.querySelector(".v");
      s.textContent = v ? fmtDP(v) : (inp.getAttribute("placeholder") || "Выбрать дату"); s.classList.toggle("ph", !v);
      const off = dd.get.call(inp), nd = off && btn.closest(".nd-row");
      if (nd){ s.textContent = "Давно · нажми, чтобы указать дату"; s.classList.add("ph"); }
      btn.disabled = off && !nd; btn.classList.toggle("off", !!nd); btn.hidden = dh.get.call(inp); };
    Object.defineProperty(inp, "value", {configurable: true, get(){ return dv.get.call(inp); }, set(v){ dv.set.call(inp, v); sync(); }});
    Object.defineProperty(inp, "disabled", {configurable: true, get(){ return dd.get.call(inp); }, set(v){ dd.set.call(inp, v); sync(); }});
    Object.defineProperty(inp, "hidden", {configurable: true, get(){ return dh.get.call(inp); }, set(v){ dh.set.call(inp, v); sync(); }});
    inp.focus = () => btn.click();
    btn.onclick = () => { if (dd.get.call(inp)){ const nd = btn.closest(".nd-row") && btn.closest(".nd-row").querySelector("input[type=checkbox]"); if (!nd) return; nd.checked = false; fdTouched = true; nd.dispatchEvent(new Event("change", {bubbles: true})); } openDP(); };
    const openDP = () => datePop(btn, dv.get.call(inp), v => { inp.value = v; inp.dispatchEvent(new Event("input", {bubbles: true})); inp.dispatchEvent(new Event("change", {bubbles: true})); },
      {clear: !inp.hasAttribute("required"), bday: inp.dataset.bday === "1"});
    sync();
  }
  function datePop(anchor, val, onPick, o = {}){
    if (dpCur) dpCur.close();
    const sel = val ? parseD(val) : null, now = new Date();
    let vy = (sel || (o.bday ? new Date(now.getFullYear() - 25, now.getMonth(), 1) : now)).getFullYear(), vm = (sel || now).getMonth(), mode = o.bday && !sel ? "y" : "d";
    const pop = document.createElement("div"); pop.className = "dp-pop"; pop.setAttribute("role", "dialog"); document.body.appendChild(pop);
    const place = () => { const r = anchor.getBoundingClientRect(), W = pop.offsetWidth || 304, H = pop.offsetHeight || 380;
      let x = Math.min(Math.max(10, r.left), innerWidth - W - 10), y = r.bottom + 8; if (y + H > innerHeight - 10) y = Math.max(10, r.top - H - 8);
      pop.style.left = x + "px"; pop.style.top = y + "px"; };
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const draw = () => {
      let body = "";
      if (mode === "y"){ const ys = []; for (let y = now.getFullYear() + 5; y >= now.getFullYear() - 90; y--) ys.push(y);
        body = `<div class="dp-yrs">${ys.map(y => `<button type="button" data-y="${y}" class="${y === vy ? "on" : ""}">${y}</button>`).join("")}</div>
          <div class="dp-ms">${MONTHS_NOM.map((m, i) => `<button type="button" data-m="${i}" class="${i === vm ? "on" : ""}">${m.slice(0, 3)}</button>`).join("")}</div>`; }
      else { const first = new Date(vy, vm, 1), st = (first.getDay() + 6) % 7, td = today();
        let cells = ""; for (let i = 0; i < 42; i++){ const d = new Date(vy, vm, i - st + 1), k = localDate(d);
          cells += `<button type="button" data-d="${k}" class="${d.getMonth() !== vm ? "o" : ""}${k === td ? " td" : ""}${k === val ? " on" : ""}${i % 7 > 4 ? " wk" : ""}">${d.getDate()}</button>`; }
        body = `<div class="dp-dw">${["пн","вт","ср","чт","пт","сб","вс"].map(x => `<span>${x}</span>`).join("")}</div><div class="dp-g">${cells}</div>`; }
      pop.innerHTML = `<div class="dp-h"><button type="button" class="dp-t${mode === "y" ? " yr" : ""}" data-t="1" title="Выбрать год и месяц">${cap(MONTHS_NOM[vm])} ${vy}</button>${mode === "d" ? `<button type="button" class="dp-ar" data-a="-1" aria-label="Прошлый месяц">‹</button><button type="button" class="dp-ar" data-a="1" aria-label="Следующий месяц">›</button>` : ""}</div>${body}
        <div class="dp-f">${o.bday ? "" : `<button type="button" data-q="0">Сегодня</button><button type="button" data-q="-1">Вчера</button>`}${o.clear && val ? `<button type="button" class="x" data-q="x">Очистить</button>` : ""}${mode === "y" ? `<button type="button" data-t="1">К дням</button>` : ""}</div>`;
      if (mode === "y"){ const on = pop.querySelector(".dp-yrs .on"); if (on) on.parentNode.scrollTop = on.offsetTop - 100; }
      place();
    };
    const close = () => { pop.remove(); document.removeEventListener("pointerdown", away, true); document.removeEventListener("keydown", key, true); removeEventListener("scroll", place, true); if (dpCur && dpCur.pop === pop) dpCur = null; };
    pop.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; e.stopPropagation();
      if (b.dataset.t){ mode = mode === "y" ? "d" : "y"; draw(); return; }
      if (b.dataset.a){ vm += +b.dataset.a; if (vm < 0){ vm = 11; vy--; } if (vm > 11){ vm = 0; vy++; } draw(); return; }
      if (b.dataset.y){ vy = +b.dataset.y; draw(); return; }
      if (b.dataset.m){ vm = +b.dataset.m; mode = "d"; draw(); return; }
      if (b.dataset.d){ onPick(b.dataset.d); close(); return; }
      const q = b.dataset.q; if (q === "x"){ onPick(""); close(); } else if (q != null){ onPick(addDays(today(), +q)); close(); } });
    pop.addEventListener("wheel", e => { if (mode !== "d") return; e.preventDefault(); vm += e.deltaY > 0 ? 1 : -1; if (vm < 0){ vm = 11; vy--; } if (vm > 11){ vm = 0; vy++; } draw(); }, {passive: false});
    const away = e => { if (!pop.contains(e.target) && !anchor.contains(e.target)) close(); };
    const key = e => { if (e.key === "Escape"){ e.stopPropagation(); e.preventDefault(); close(); } };
    setTimeout(() => document.addEventListener("pointerdown", away, true));
    document.addEventListener("keydown", key, true); addEventListener("scroll", place, true);
    dpCur = {pop, close}; draw();
  }
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1){
    if (n.matches && n.matches('input[type="date"]')) enhanceDate(n); else if (n.querySelectorAll) n.querySelectorAll('input[type="date"]').forEach(enhanceDate); } })
    .observe(document.body, {childList: true, subtree: true});

  // ================= 2.1: анимации постера по жанру =================
  // главный жанр выбирается не по порядку в списке, а по силе: ужасы и боевик перебивают драму
  const FX_ORDER = [["gore", /ужас|хоррор|horror|слэшер/], ["bullet", /боевик|экшен|военн|action|вестерн/], ["siren", /триллер|криминал|детектив|нуар/], ["holo", /фантаст|киберпанк|sci.?fi/],
    ["magic", /фэнтези|fantasy|сказк/], ["mask", /комеди/], ["hearts", /мелодрам|романт/], ["notes", /мюзикл|музык/], ["pow", /мульт|аниме|анимац/], ["sparkle", /приключ|семейн/], ["halo", /драм|биограф|истори/]];
  const fxKind = it => { const g = genres(it).map(x => x.toLowerCase()); for (const [k, re] of FX_ORDER) if (g.some(x => re.test(x))) return k; return null; };
  const RN = (a, b) => a + Math.random() * (b - a);
  const blobPath = (r, n) => { const pts = []; for (let i = 0; i < n * 2; i++){ const a = i / (n * 2) * Math.PI * 2 + RN(-.15, .15), rr = i % 2 ? r * RN(.72, .9) : r * RN(.95, 1.45); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], f = x => x.toFixed(1); let m0 = mid(pts[pts.length - 1], pts[0]), d = `M${f(m0[0])} ${f(m0[1])}`;
    pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % pts.length]); d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; }); return d + "Z"; };
  const floats = (n, chars, cols, o = {}) => Array.from({length: n}, (_, i) => `<i class="fx-float" style="--s:${RN(o.s0 || 14, o.s1 || 26).toFixed(0)}px;--c:${cols[i % cols.length]};--x:${RN(-90, 30) | 0}px;--y:${RN(-150, -70) | 0}px;--rot:${RN(-30, 30) | 0}deg;--t:${RN(2.6, 4.2).toFixed(1)}s;--d:${(i * .35 + RN(0, .3)).toFixed(2)}s">${chars[i % chars.length]}</i>`).join("");
  const sparks = (n, cols) => Array.from({length: n}, (_, i) => `<i class="fx-spark" style="--s:${RN(7, 16).toFixed(0)}px;--c:${cols[i % cols.length]};--x:${RN(-120, 50) | 0}px;--y:${RN(-110, 90) | 0}px;--t:${RN(1.8, 3.2).toFixed(1)}s;--d:${(i * .18).toFixed(2)}s"></i>`).join("");
  function fxHTML(k){
    let o = "", out = "", clip = "";
    if (k === "blood"){
      o += `<svg class="fx-splat" style="--r:${RN(0, 360) | 0}deg" viewBox="-50 -50 100 100"><path fill="#7d0703" d="${blobPath(25, 7)}"/><path fill="#b3110a" d="${blobPath(18, 6)}"/><path fill="#d61f14" d="${blobPath(10, 5)}"/>${Array.from({length: 6}, () => { const a = RN(0, 6.28), d = RN(30, 44); return `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${RN(1.5, 4).toFixed(1)}" fill="#a10c06"/>`; }).join("")}<ellipse cx="-7" cy="-8" rx="4" ry="2.4" fill="rgba(255,255,255,.4)" transform="rotate(-30 -7 -8)"/></svg>`;
      for (let i = 0; i < 18; i++){ const a = RN(-205, 35) * Math.PI / 180, d = RN(28, 115); o += `<i class="fx-drop" style="--s:${RN(4, 11).toFixed(1)}px;--x:${(Math.cos(a) * d) | 0}px;--y:${(Math.sin(a) * d) | 0}px;--d:${(.16 + RN(0, .12)).toFixed(2)}s"></i>`; }
      [[-16, 5], [-2, 7], [13, 4]].forEach(([l, w], i) => o += `<i class="fx-drip" style="--l:${l}px;--t:${RN(6, 16) | 0}px;--w:${w}px;--h:${RN(50, 130) | 0}px;--d:${(.55 + i * .25).toFixed(2)}s"></i>`);
    }
    if (k === "bullet"){
      o += `<i class="fx-flash"></i>`; clip += `<svg class="fx-crack" viewBox="-90 -90 180 180" fill="none" stroke="rgba(255,255,255,.9)" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 1.5px rgba(0,0,0,.7))">`;
      for (let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2 + RN(-.2, .2), L = RN(38, 88); let p = "M0 0";
        for (let s = 1; s <= 3; s++){ const aa = a + RN(-.22, .22), ll = L * s / 3; p += `L${(Math.cos(aa) * ll).toFixed(1)} ${(Math.sin(aa) * ll).toFixed(1)}`; }
        clip += `<path d="${p}" stroke-width="${RN(.8, 1.9).toFixed(1)}" style="--len:${(L * 1.3) | 0}"/>`; }
      [14, 30, 52].forEach(rr => { let p = ""; for (let i = 0; i <= 10; i++){ const a = i / 10 * Math.PI * 2, r2 = rr * RN(.82, 1.18); p += (i ? "L" : "M") + (Math.cos(a) * r2).toFixed(1) + " " + (Math.sin(a) * r2).toFixed(1); }
        clip += `<path d="${p}" stroke-width="${rr > 40 ? .7 : 1.1}" stroke="rgba(255,255,255,${rr > 40 ? .4 : .7})" style="--len:${(rr * 7.5) | 0}"/>`; });
      clip += `</svg><i class="fx-hole"></i>`;
      for (let i = 0; i < 10; i++){ const a = RN(0, 360) * Math.PI / 180, d = RN(40, 120); o += `<i class="fx-shard" style="--s:${RN(4, 9).toFixed(1)}px;--x:${(Math.cos(a) * d) | 0}px;--y:${(Math.sin(a) * d + 50) | 0}px;--rot:${RN(-420, 420) | 0}deg"></i>`; }
    }
    if (k === "halo"){ o += `<i class="fx-rays"></i><i class="fx-halo"></i>`;
      for (let i = 0; i < 12; i++) o += `<i class="fx-mote" style="--s:${RN(2, 4.5).toFixed(1)}px;--x:${RN(-120, 30) | 0}px;--y:${RN(-20, 160) | 0}px;--t:${RN(3.5, 6.5).toFixed(1)}s;--d:${RN(0, 4).toFixed(1)}s"></i>`; }
    if (k === "mask") o += `<svg class="fx-mask" viewBox="0 0 88 100"><defs><linearGradient id="fxMk" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#ffe08a"/><stop offset="1" stop-color="#e9a822"/></linearGradient></defs>
      <path d="M78 12c6 3 9 8 7 14-3-4-7-6-10-6" fill="#e0245e"/><path d="M8 10C26 2 62 2 80 10c4 34-6 70-36 86C14 80 4 44 8 10Z" fill="url(#fxMk)" stroke="#9c6a06" stroke-width="2"/>
      <path d="M17 26q11-9 21-1M50 25q10-8 21 1" stroke="#3a2200" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M19 38q9-10 19 0q-9-5-19 0Z M50 38q9-10 19 0q-9-5-19 0Z" fill="#3a2200" stroke="#3a2200" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="22" cy="53" r="6" fill="#ff7a5a" opacity=".45"/><circle cx="66" cy="53" r="6" fill="#ff7a5a" opacity=".45"/>
      <path d="M21 58q23 30 46 0q-23 11-46 0Z" fill="#3a2200"/><path d="M30 64q14 8 28 0" stroke="#ff8fa3" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;
    if (k === "siren") o += `<i class="fx-siren"></i><svg class="fx-lens" viewBox="0 0 52 52"><circle cx="21" cy="21" r="13" fill="rgba(180,220,255,.18)" stroke="#fff" stroke-width="4"/><path d="M31 31l15 15" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M14 16a8 8 0 0 1 6-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/></svg>`;
    if (k === "holo"){ o += [0, .8, 1.6].map(d => `<i class="fx-ring" style="--d:${d}s"></i>`).join(""); out = `<i class="fx-scan"></i>`; }
    if (k === "magic") o += sparks(16, ["#ffffff", "#d7b6ff", "#9fd8ff", "#ffe39a"]);
    if (k === "sparkle") o += sparks(14, ["#ffd66b", "#fff2c2", "#ffb347"]);
    if (k === "hearts") o += floats(8, ["♥"], ["#ff4d6d", "#ff8fa3", "#ff2e63"]);
    if (k === "notes") o += floats(8, ["♪", "♫", "♬"], ["#ffffff", "#ffd60a", "#64d2ff"], {s0: 18, s1: 30});
    if (k === "pow") o += `<svg class="fx-pow" viewBox="-50 -50 100 100"><path d="${Array.from({length: 24}, (_, i) => { const a = i / 24 * Math.PI * 2, r = i % 2 ? 26 : 46; return (i ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1); }).join("")}Z" fill="#ffd60a" stroke="#1d1d1f" stroke-width="3" stroke-linejoin="round"/><text x="0" y="9" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="26" fill="#ff2d55" stroke="#1d1d1f" stroke-width="1.5">!!</text></svg>` + floats(5, ["★"], ["#ffd60a", "#fff", "#ff9f0a"], {s0: 12, s1: 20});
    return out + (clip ? `<div class="clip"><div class="o">${clip}</div></div>` : "") + `<div class="o">${o}</div>`;
  }
  let fxSeen = null;
  const FX_ONCE = ["blood", "bullet", "mask", "siren", "pow"];
  function playFx(it, force){
    const box = $("gfx"), k = fxKind(it); if (!box || !k) return;
    if (k === "gore"){ const again = fxSeen === it.id; fxSeen = it.id; dread(again); goreFx(box.parentNode, again); return; }
    if (calmMotion) return;
    if (!force && FX_ONCE.includes(k) && fxSeen === it.id) return;
    fxSeen = it.id; box.innerHTML = fxHTML(k); box.dataset.k = k;
    const p = $("heroPoster");
    if (p && (k === "bullet" || k === "holo")){ const c = k === "bullet" ? "shake" : "glitch"; p.classList.remove(c); void p.offsetWidth; p.classList.add(c); }
    if (p && !p.dataset.fxw){ p.dataset.fxw = "1"; let last = Date.now();
      p.addEventListener("mouseenter", () => { if (Date.now() - last < 4500) return; last = Date.now(); playFx(it, true); }); }
  }

  // ================= 2.1: дни рождения =================
  let bdY = new Date().getFullYear(), bdM = new Date().getMonth();
  const bdNext = b => { const [y, m, d] = String(b).split("-").map(Number), t = parseD(today()); let n = new Date(t.getFullYear(), m - 1, d); if (n < t) n = new Date(t.getFullYear() + 1, m - 1, d);
    return {days: Math.round((n - t) / 864e5), date: n, age: y > 1900 ? n.getFullYear() - y : null}; };
  const bdLabel = b => { if (!b) return ""; const d = parseD(b); return `${d.getDate()} ${MON_GEN[d.getMonth()]}`; };
  // ================= 2.1: «Ещё», папки как в iOS =================
  const GRAD = {pink: "linear-gradient(135deg,#ff375f,#bf5af2)", gold: "linear-gradient(135deg,#ffd60a,#ff9500)", mint: "linear-gradient(135deg,#34c759,#00c7be)", red: "linear-gradient(135deg,#ff6b5e,#c4170c)",
    blue: "linear-gradient(135deg,#40a9ff,#5e5ce6)", green: "linear-gradient(135deg,#4cd964,#0a8f3c)", gray: "linear-gradient(135deg,#aeaeb2,#636366)", violet: "linear-gradient(135deg,#bf5af2,#5e5ce6)", orange: "linear-gradient(135deg,#ff9f0a,#ff375f)"};
  function moreApps(){
    const drops = items.filter(i => isGame(i) ? gStatus(i.status) === "dropped" && inLib(i) : i.status === "dropped").length;
    const at = [lastBackup && lastBackup.at, autoBackup && autoBackup.at].filter(Boolean).sort().pop(), bdays = at ? Math.floor((Date.now() - Date.parse(at)) / 864e5) : null;
    return {
      stats: {t: "Статистика", apps: [
        {t: `Итоги ${recY}`, s: "игры и кино за год", g: GRAD.pink, i: ICON.trophy, a: 'data-go="recap"'},
        {t: "Деньги", s: fmtRub(moneyStats(null).spent), g: GRAD.gold, i: ICON.coin, a: 'data-go="money"'},
        {t: "Ачивки", s: `${achList().filter(a => a.got).length} из ${ACH.length}`, g: GRAD.mint, i: ICON.star, a: 'data-go="ach"'},
        {t: "Стена дропов", s: `${drops} ${plural(drops, "дроп", "дропа", "дропов")}`, g: GRAD.red, i: ICON.skull, a: 'data-go="drops"'}]},
      tools: {t: "Инструменты", apps: [
        {t: "График отпусков", s: (() => { const r = ME && vacOf(ME.id, new Date().getFullYear()) || ME && vacOf(ME.id, new Date().getFullYear() + 1); return r ? "в профиле: " + vcDn(r.days.length) : "календарь и расчёт"; })(), g: GRAD.mint, i: VC_I.palm, a: 'data-go="vacation"'}]},
      site: {t: "Сайт и данные", apps: [
        {t: "Патчноуты", s: "версия " + PATCHES[0].v, g: GRAD.blue, i: ICON.scroll, a: 'data-go="patch"', b: patchUnseen() ? "NEW" : ""},
        {t: "Скачать бэкап", s: bdays == null ? "ещё не было" : bdays === 0 ? "сегодня" : `${bdays} дн. назад`, g: GRAD.green, i: ICON.down, a: 'data-backup="1"', b: bdays == null || bdays >= 30 ? "!" : ""},
        {t: "Загрузить бэкап", s: "из zip-архива", g: GRAD.gray, i: ICON.up, a: 'data-imp="1"'},
        ...(IS_ADMIN ? [{t: "Журнал ошибок", s: "видишь только ты", g: GRAD.red, i: ICON.info, a: 'data-errlog="1"'}] : [])]}
    };
  }
  const appHTML = (a, i = 0) => `<button class="ios-app" style="--i:${i}" ${a.a}>${a.b ? `<span class="bdg">${a.b}</span>` : ""}<span class="ai" style="--g:${a.g}">${a.i}</span><span>${a.t}</span>${a.s ? `<small>${esc(a.s)}</small>` : ""}</button>`;
  function renderMore(){
    appleHead("Ещё");
    const g = items.filter(isGame).length, k = items.length - g, light = document.documentElement.dataset.mode === "light", A = moreApps();
    const myBd = MEP && MEP.birthday;
    $("aMain").innerHTML = `<h1 class="a-h1">Ещё</h1>
      <div class="ios-top">
        <div class="ios-card">
          <button class="ios-prof" data-profile="1">${ME ? avaHTML(myProf(), "md") : ""}<span class="t"><b>${esc(NICK)}</b><small>${esc((ME && ME.email) || "")}</small><small>${g} ${plural(g, "игра", "игры", "игр")} · ${k} кино на полке</small></span><span class="chev">›</span></button>
          <button class="ios-row" data-ava="1"><span class="ic" style="background:${GRAD.orange}">${ICON.img}</span><span class="t">Аватар</span><span class="chev">›</span></button>
          <button class="ios-row" data-bdset="1"><span class="ic" style="background:${GRAD.pink}">${ICON.cake}</span><span class="t">День рождения</span><span class="val">${myBd ? bdLabel(myBd) : "не указан"}</span><span class="chev">›</span></button>
        </div>
        <div class="ios-card">
          <div class="ios-row"><span class="ic" style="background:${GRAD.violet}">${light ? ICON.sun : ICON.moon}</span><span class="t">Тема</span><span class="ios-seg"><button data-mode="dark" aria-pressed="${!light}">${ICON.moon}Тёмная</button><button data-mode="light" aria-pressed="${light}">${ICON.sun}Светлая</button></span></div>
          <div class="ios-row"><span class="ic" style="background:${GRAD.green}">${ICON.sound}</span><span class="t">Звуки</span><span class="ios-seg"><button data-snd="1" aria-pressed="${SND.on}">Вкл</button><button data-snd="0" aria-pressed="${!SND.on}">Выкл</button></span></div>
          <button class="ios-row" data-theme-open="1"><span class="ic" style="background:${GRAD.orange}">${ICON.palette}</span><span class="t">Цвета разделов</span><span class="val">для тёмной темы</span><span class="chev">›</span></button>
          <button class="ios-row" data-bgs="1"><span class="ic" style="background:${GRAD.blue}">${ICON.wall}</span><span class="t">Фоны разделов</span><span class="chev">›</span></button>
          <button class="ios-row" data-pw="1"><span class="ic" style="background:${GRAD.gray}">${ICON.key}</span><span class="t">Пароль</span><span class="chev">›</span></button>
        </div>
      </div>
      <div class="ios-card v6-m-only" style="margin-top:14px"><button class="ios-row" data-go="calendar"><span class="ic" style="background:${GRAD.red}">${ICON.calendar}</span><span class="t">Календарь</span><span class="chev">›</span></button><button class="ios-row" data-go="events"><span class="ic" style="background:${GRAD.pink}">${ICON.party}</span><span class="t">Мероприятия</span><span class="chev">›</span></button><button class="ios-row" data-go="places"><span class="ic" style="background:${GRAD.orange}">${ICON.pin}</span><span class="t">Заведения</span><span class="chev">›</span></button></div>
      <div class="ios-h">Разделы</div>
      <div class="ios-home">${Object.entries(A).map(([key, F]) => `<button class="ios-fold" data-fold="${key}"><span class="box">${F.apps.slice(0, 4).map(a => `<span class="ai" style="--g:${a.g}">${a.i}</span>`).join("")}</span><span class="lb">${F.t}<small>${F.apps.length} ${plural(F.apps.length, "раздел", "раздела", "разделов")}${F.apps.some(a => a.b) ? " · есть новое" : ""}</small></span></button>`).join("")}</div>`;
  }
  // журнал ошибок — только для владельца (таблица nexus_admins)
  async function errLogSheet(){
    const s = openSheet(`<h3>Журнал ошибок</h3><p class="sub">Последние ошибки у всех на сайте. Одинаковые склеены.</p><div class="errlog" id="elList">Загружаю…</div>
      <div class="acts" style="margin-top:14px"><button class="ib red" id="elClr">Очистить</button><button class="ib" id="elNo">Закрыть</button></div>`, {wide: true});
    s.el.querySelector("#elNo").onclick = () => s.close();
    const draw = async () => {
      const box = s.el.querySelector("#elList"); if (!box) return;
      const {data, error} = await SB.from("client_errors").select("id,user_id,at,place,msg,stack,url,ua,ver").order("at", {ascending: false}).limit(300);
      if (error){ box.textContent = "Не загрузилось: " + error.message; return; }
      if (!data.length){ box.textContent = "Ошибок нет. Подозрительно чисто."; return; }
      const g = new Map(); data.forEach(r => { const k = r.place + "|" + r.msg, x = g.get(k); if (x){ x.n++; x.who.add(r.user_id); } else g.set(k, {...r, n: 1, who: new Set([r.user_id])}); });
      box.innerHTML = [...g.values()].map(r => `<details style="margin:0 0 8px;padding:8px 10px;border-radius:10px;background:rgba(127,127,127,.12)"><summary style="cursor:pointer"><b>${esc(r.place)}</b> · ${esc(r.msg)} <small style="opacity:.6">×${r.n} · ${[...r.who].map(u => esc(frNick(u))).join(", ")} · ${esc(new Date(r.at).toLocaleString("ru-RU"))} · v${esc(r.ver || "?")}</small></summary><pre style="white-space:pre-wrap;font-size:11px;opacity:.75;margin:6px 0 0">${esc(r.url || "")}\n${esc(r.ua || "")}\n${esc(r.stack || "")}</pre></details>`).join("");
    };
    s.el.querySelector("#elClr").onclick = async () => { const {error} = await SB.from("client_errors").delete().gte("id", 0); if (error){ toast("Не очистилось"); return; } toast("Журнал очищен"); draw(); };
    draw();
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("[data-errlog]")) errLogSheet(); });
  let folderClose = null;
  function openFolder(key, from){
    const F = moreApps()[key]; if (!F) return;
    const r = (from.querySelector(".box") || from).getBoundingClientRect();
    const w = document.createElement("div"); w.className = "fo-wrap";
    w.innerHTML = `<div class="fo-bg"></div><div class="fo" role="dialog" aria-label="${esc(F.t)}"><h3>${esc(F.t)}</h3><div class="fo-g">${F.apps.map(appHTML).join("")}</div></div>`;
    document.body.appendChild(w);
    const fo = w.querySelector(".fo"), sx = r.width / fo.offsetWidth, tx = r.left + r.width / 2 - innerWidth / 2, ty = r.top + r.height / 2 - innerHeight / 2;
    fo.style.setProperty("--from", `translate(${tx.toFixed(0)}px,${ty.toFixed(0)}px) scale(${sx.toFixed(3)})`);
    requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add("on")));
    document.body.classList.add("sheet-open");
    const close = () => { if (!w.isConnected || w.dataset.closing) return; w.dataset.closing = "1"; w.classList.remove("on"); folderClose = null;
      setTimeout(() => { w.remove(); if (!sheets.length) document.body.classList.remove("sheet-open"); }, 480); };
    w.querySelector(".fo-bg").onclick = close;
    w.addEventListener("click", e => { if (e.target.closest(".ios-app")) setTimeout(close, 40); });
    folderClose = close;
  }
  function bgsSheet(){
    const s = openSheet(`<h3>Фоны разделов</h3><p class="sub">Картинка под весь раздел с размытием и затемнением. Можно перетащить картинку прямо на плитку.</p>
      <div class="sb-grid">${Object.entries(SEC_NAMES).map(([k, l]) => { const c = SECBG && SECBG[k]; return `<button data-secbg="${k}" class="${c && c.img ? "on" : ""}" style="${c && c.img ? `background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.55)),url('${publicUrl(c.img)}')` : ""}">${l}</button>`; }).join("")}</div>
      <div class="acts" style="margin-top:14px"><button class="ib" id="bgsNo">Готово</button></div>`);
    s.el.querySelector("#bgsNo").onclick = () => s.close();
    s.el.querySelectorAll("[data-secbg]").forEach(b => { b.addEventListener("click", () => s.close()); bindDrop(b, f => { s.close(); bgSheet(b.dataset.secbg, f); }); });
  }
  function importPick(){
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".zip,.json,application/zip,application/json";
    inp.onchange = async () => { const f = inp.files[0]; if (!f) return; toast("Загружаю бэкап…");
      try { const r = await importBackup(f, (i, n) => toast(`Загружаю ${i}/${n}…`)); toast(`Загружено записей: ${r.n}` + (r.pics ? `, картинок: ${r.pics}` : "") + (r.skip ? `. Уже были: ${r.skip}` : "")); }
      catch(err){ toast("Не похоже на бэкап NEXUS"); } };
    inp.click();
  }
  document.addEventListener("click", e => {
    const el = e.target.closest && e.target.closest("[data-fold],[data-mode],[data-bgs],[data-pw],[data-ava],[data-imp],[data-bdset],[data-bdm]"); if (!el) return;
    if (el.dataset.fold){ openFolder(el.dataset.fold, el); return; }
    if (el.dataset.mode){ setMode(el.dataset.mode); return; }
    if (!ME) return;
    if (el.dataset.bgs) bgsSheet(); else if (el.dataset.pw) passwordSheet(false); else if (el.dataset.ava) avaSheet(false); else if (el.dataset.imp) importPick(); else if (el.dataset.bdset) bdaySheet();
    else if (el.dataset.bdm){ bdM += +el.dataset.bdm; if (bdM < 0){ bdM = 11; bdY--; } if (bdM > 11){ bdM = 0; bdY++; } renderPeople(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && folderClose){ e.stopPropagation(); folderClose(); } }, true);

  const agoTs = ts => { if (!ts) return ""; const m = Math.round((Date.now() - Date.parse(ts)) / 6e4);
    if (m < 1) return "только что"; if (m < 60) return `${m} мин`; const h = Math.round(m / 60); if (h < 24) return `${h} ч`;
    const d = Math.round(h / 24); return d === 1 ? "вчера" : d < 30 ? `${d} дн.` : fmtDate(localDate(new Date(ts))); };
  const verbOf = it => {
    if (isGame(it)){ const s = gStatus(it.status);
      return it.status === "future" ? "хочет поиграть в" : it.status === "soon" ? "ждёт релиз" : s === "done" ? "прошёл" : s === "youtube" ? "посмотрел прохождение" : s === "dropped" ? "дропнул" : s === "endless" ? "залип в" : "играет в"; }
    return it.status === "future" ? "хочет посмотреть" : it.status === "soon" ? "ждёт премьеру" : it.status === "done" || it.status === "played" ? "посмотрел" : it.status === "dropped" ? "бросил" : it.status === "paused" ? "отложил" : "смотрит";
  };
  function renderPeople(){
    appleHead("Активность", `<button class="a-link" data-frrefresh="1">Обновить</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty" style="margin-top:20px"><b>Нужно войти</b></div>`; return; }
    if (!FR){ $("aMain").innerHTML = `<h1 class="a-h1">Активность</h1><p class="a-sub">Загружаю…</p>`; loadFriends(); return; }
    const fa = document.activeElement, fid = fa && fa.id && /^(wl|bk)/.test(fa.id) ? fa.id : null, fsel = fid ? [fa.selectionStart, fa.selectionEnd] : null, sy = scrollY, td = today();
    const others = FR.profiles.filter(p => p.user_id !== ME.id).map(p => {
      const its = frItems(p.user_id), last = its.reduce((m, i) => (i._upd || "") > (m ? m._upd || "" : "") ? i : m, null);
      return {p, last, ts: last ? last._upd : "", c: compat(p.user_id), n: its.filter(inLib).length};
    }).sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
    // друзья справа
    const friendsH = others.map(o => { const mins = o.ts ? (Date.now() - Date.parse(o.ts)) / 6e4 : 1e9, dot = mins < 20 ? "on" : mins < 1440 ? "rc" : "";
      return `<button class="fl-i" data-user="${esc(o.p.user_id)}"><span class="av">${avaHTML(o.p)}<i class="${dot}" title="${dot === "on" ? "только что был на сайте" : dot === "rc" ? "был сегодня" : ""}"></i></span>
        <span class="t"><b>${esc(o.p.nick)}<span>${o.ts ? agoTs(o.ts) : ""}</span></b><small>${o.last ? `${verbOf(o.last)} <em>${esc(o.last.title)}</em>` : "пока ничего не добавил"}</small></span>${o.c.pct != null ? `<span class="fr-pct ${pctCls(o.c.pct)}" title="Совпадение оценок">${o.c.pct}%</span>` : ""}</button>`; }).join("");
    // дни рождения
    const people = FR.profiles.map(p => p.user_id === ME.id ? {...p, ...myProf()} : p).filter(p => p.birthday);
    const first = new Date(bdY, bdM, 1), st = (first.getDay() + 6) % 7, dim = new Date(bdY, bdM + 1, 0).getDate();
    const onDay = d => people.filter(p => { const [, m, dd] = p.birthday.split("-").map(Number); return m - 1 === bdM && dd === d; });
    let cal = ["пн","вт","ср","чт","пт","сб","вс"].map(x => `<span class="dw">${x}</span>`).join("");
    for (let i = 0; i < st; i++) cal += `<span class="d o"></span>`;
    for (let d = 1; d <= dim; d++){ const ps = onDay(d), key = `${bdY}-${pad(bdM + 1)}-${pad(d)}`;
      cal += ps.length ? `<span class="d bd${key === td ? " td" : ""}" ${ps[0].user_id !== ME.id ? `data-user="${esc(ps[0].user_id)}"` : ""} title="${esc(ps.map(p => p.nick).join(", "))}">${d}${avaHTML(ps[0], "xs")}</span>` : `<span class="d${key === td ? " td" : ""}">${d}</span>`; }
    const soon = people.map(p => ({p, n: bdNext(p.birthday)})).sort((a, b) => a.n.days - b.n.days).slice(0, 5);
    const myBd = MEP && MEP.birthday;
    const bdH = `<div class="fb-card"><h3>${ICON.cake.replace("<svg", '<svg width="18" height="18"')} Дни рождения<small>${people.length}</small></h3>
      <div class="bd-nav"><button type="button" data-bdm="-1" aria-label="Прошлый месяц">‹</button><b>${MONTHS_NOM[bdM]} ${bdY !== new Date().getFullYear() ? bdY : ""}</b><button type="button" data-bdm="1" aria-label="Следующий месяц">›</button></div>
      <div class="bd-cal">${cal}</div>
      ${soon.length ? `<div class="bd-list">${soon.map(({p, n}) => `<button class="bd-row${n.days === 0 ? " now" : ""}" ${p.user_id !== ME.id ? `data-user="${esc(p.user_id)}"` : 'data-bdset="1"'}>${avaHTML(p)}<span class="t">${esc(p.user_id === ME.id ? "Ты" : p.nick)}<small>${bdLabel(p.birthday)}${n.age && p.user_id === ME.id ? ` · исполнится ${n.age}` : ""}</small></span><span class="w">${n.days === 0 ? "сегодня" : n.days === 1 ? "завтра" : `через ${n.days} ${plural(n.days, "день", "дня", "дней")}`}</span></button>`).join("")}</div>`
        : `<p class="a-sub" style="margin:10px 0 0;font-size:13px">Пока никто не указал день рождения.</p>`}
      ${myBd ? "" : `<button class="ib blue bd-set" data-bdset="1">Указать свой</button>`}</div>`;
    $("aMain").innerHTML = `<h1 class="a-h1">Активность</h1><p class="a-sub">${others.length ? `${others.length} ${plural(others.length, "человек", "человека", "человек")} на NEXUS кроме тебя. Видно всё, кроме заметок и причин дропа.` : "Пока здесь никого, кроме тебя. Скинь друзьям ссылку на сайт."}</p>
      <div class="fb">
        <aside class="fb-col fb-l">${eventsCard()}${placesCard()}${recCard()}${tlCard()}${bdH}</aside>
        <section class="fb-feed-w">${watchCard()}<div class="act-tabs" role="tablist"><button data-acttab="wall" aria-pressed="${actTab === "wall"}">${ICON.chat}Стена${WALL && WALL.posts.length ? `<small>${WALL.posts.length}</small>` : ""}</button><button data-acttab="feed" aria-pressed="${actTab === "feed"}">${ICON.people}Лента друзей</button></div>${actTab === "feed" ? feedCard() : wallCard()}</section>
        <aside class="fb-col fb-r"><div class="fb-card plain"><h3>Друзья<small>${others.length}</small></h3>${others.length ? `<div class="fl">${friendsH}</div>` : `<p class="a-sub" style="margin:0;font-size:13px">Скинь ссылку на сайт — тут появятся друзья и что они делали.</p>`}</div>${bookCard()}</aside>
      </div>`;
    document.querySelectorAll('[data-stack="1"]').forEach(wireStack);
    wireWall3(); wireBook(); if (actTab === "wall" && !WALL) loadWall();
    if (fid){ const n = $(fid); if (n){ n.focus({preventScroll: true}); try { n.setSelectionRange(fsel[0], fsel[1]); } catch(_){ /* ожидаемо: поле без курсора */ } } } if (Math.abs(scrollY - sy) > 2) scrollTo(0, sy);
  }

  // ================= 2.2: звуки — клики и трещотка =================
  const SND = (() => {
    let ctx = null, on = lsGet("nexus_snd") !== "0", lastTick = 0; const bufs = {};
    const ac = () => { if (!ctx){ const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { ctx = new A(); } catch(_){ return null; } } if (ctx.state === "suspended") ctx.resume(); return ctx; };
    const noise = (c, dur) => { const k = dur + "|" + c.sampleRate; if (bufs[k]) return bufs[k]; const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4); return bufs[k] = b; };
    // глухой щелчок, как в старых RPG: деревянный «тук» и приглушённый шорох
    function click(kind){
      if (!on) return; const c = ac(); if (!c) return; const t = c.currentTime;
      const f = kind === "tab" ? 150 : kind === "soft" ? 260 : 195, v = kind === "soft" ? .11 : .2;
      const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(); o.type = "triangle";
      o.frequency.setValueAtTime(f * 1.9, t); o.frequency.exponentialRampToValueAtTime(f, t + .035);
      lp.type = "lowpass"; lp.frequency.value = 900; lp.Q.value = .7;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .11);
      o.connect(lp).connect(g).connect(c.destination); o.start(t); o.stop(t + .12);
      const n = c.createBufferSource(), f2 = c.createBiquadFilter(), ng = c.createGain(); n.buffer = noise(c, .03);
      f2.type = "lowpass"; f2.frequency.value = 1300; ng.gain.value = kind === "soft" ? .12 : .22; n.connect(f2).connect(ng).connect(c.destination); n.start(t);
    }
    // печатная машинка: удар литеры, на пробел глуше, на Enter — звоночек каретки
    let lastKey = 0;
    function type(kind = "key"){
      if (!on) return; const c = ac(); if (!c) return; const now = performance.now(); if (now - lastKey < 22) return; lastKey = now; const t = c.currentTime;
      const n = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise(c, kind === "space" ? .045 : .03);
      bp.type = "bandpass"; bp.frequency.value = kind === "space" ? 900 : 2300 + Math.random() * 900; bp.Q.value = kind === "space" ? 1.2 : 3.2;
      g.gain.value = kind === "space" ? .32 : .26 + Math.random() * .08; n.connect(bp).connect(g).connect(c.destination); n.start(t);
      const o = c.createOscillator(), og = c.createGain(); o.type = "square"; o.frequency.setValueAtTime(kind === "space" ? 95 : 140 + Math.random() * 40, t); o.frequency.exponentialRampToValueAtTime(60, t + .04);
      const ol = c.createBiquadFilter(); ol.type = "lowpass"; ol.frequency.value = 500;
      og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(kind === "space" ? .09 : .06, t + .003); og.gain.exponentialRampToValueAtTime(.0001, t + .06);
      o.connect(ol).connect(og).connect(c.destination); o.start(t); o.stop(t + .07);
      if (kind === "enter"){ [2093, 4186, 6279].forEach((fq, i) => { const b = c.createOscillator(), bg = c.createGain(); b.type = "sine"; b.frequency.value = fq * (1 + Math.random() * .002);
        bg.gain.setValueAtTime(.0001, t + .05); bg.gain.exponentialRampToValueAtTime([.07, .03, .012][i], t + .055); bg.gain.exponentialRampToValueAtTime(.0001, t + .9); b.connect(bg).connect(c.destination); b.start(t + .05); b.stop(t + .95); }); }
    }
    // щелчок трещотки: короткий шум через узкий фильтр, выше и громче на скорости
    function tick(speed = .3){
      if (!on) return; const c = ac(); if (!c) return; const now = performance.now(); if (now - lastTick < 26) return; lastTick = now;
      const t = c.currentTime, sp = Math.max(0, Math.min(1, speed));
      const n = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise(c, .011);
      bp.type = "bandpass"; bp.frequency.value = 1900 + sp * 2600 + Math.random() * 350; bp.Q.value = 7; g.gain.value = .16 + sp * .12;
      n.connect(bp).connect(g).connect(c.destination); n.start(t);
      const o = c.createOscillator(), og = c.createGain(); o.type = "triangle"; o.frequency.value = 1150 + sp * 900;
      og.gain.setValueAtTime(.022, t); og.gain.exponentialRampToValueAtTime(.0001, t + .018); o.connect(og).connect(c.destination); o.start(t); o.stop(t + .02);
    }
    // шорох бумаги: шум с «хрустящими» всплесками через полосовой фильтр, кривая громкости как у листа, который тянут
    function paper(kind = "out"){
      if (!on) return; const c = ac(); if (!c) return; const t = c.currentTime;
      const dur = kind === "flip" ? .42 : kind === "soft" ? .16 : .3, sr = c.sampleRate, b = c.createBuffer(1, Math.ceil(sr * dur), sr), d = b.getChannelData(0);
      let crk = 0; for (let i = 0; i < d.length; i++){ const x = i / d.length; if (Math.random() < .0016) crk = 1; crk *= .9935;
        const env = kind === "flip" ? Math.sin(Math.PI * Math.min(1, x * 1.25)) * (1 - x * .5) : Math.pow(Math.sin(Math.PI * x), .7);
        d[i] = (Math.random() * 2 - 1) * env * (.35 + crk * .9); }
      const n = c.createBufferSource(); n.buffer = b; n.playbackRate.value = .92 + Math.random() * .16;
      const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = .9; bp.frequency.setValueAtTime(kind === "flip" ? 2600 : 3400, t); bp.frequency.linearRampToValueAtTime(kind === "flip" ? 5200 : 4200, t + dur);
      const g = c.createGain(); g.gain.value = kind === "soft" ? .07 : kind === "flip" ? .22 : .15;
      n.connect(hp).connect(bp).connect(g).connect(c.destination); n.start(t);
      if (kind === "flip"){ const o = c.createOscillator(), og = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(180, t + dur * .7); o.frequency.exponentialRampToValueAtTime(90, t + dur);
        og.gain.setValueAtTime(.0001, t + dur * .7); og.gain.exponentialRampToValueAtTime(.05, t + dur * .74); og.gain.exponentialRampToValueAtTime(.0001, t + dur + .05); o.connect(og).connect(c.destination); o.start(t + dur * .7); o.stop(t + dur + .06); }
    }
    let lastDeal = 0;
    function deal(){ if (!on) return; const c = ac(); if (!c) return; const tn = performance.now(); if (tn - lastDeal < 45) return; lastDeal = tn; const t = c.currentTime;
      const n = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise(c, .09); bp.type = "bandpass"; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(1300, t); bp.frequency.exponentialRampToValueAtTime(4400, t + .08); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + .1);
      n.connect(bp).connect(g).connect(c.destination); n.start(t);
      const o = c.createOscillator(), og = c.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(230, t + .07); o.frequency.exponentialRampToValueAtTime(110, t + .13);
      og.gain.setValueAtTime(.0001, t + .07); og.gain.exponentialRampToValueAtTime(.08, t + .075); og.gain.exponentialRampToValueAtTime(.0001, t + .15); o.connect(og).connect(c.destination); o.start(t + .07); o.stop(t + .16); }
    return {click, tick, paper, type, deal, get on(){ return on; }, set(v){ on = v; lsSet("nexus_snd", v ? "1" : "0"); if (v) click(); }};
  })();
  document.addEventListener("pointerdown", e => {
    if (e.button) return; const t = e.target.closest && e.target.closest("button,a,[role=button],summary,select,label.nd-tog,.fx,.k-card,.s-card");
    if (!t || t.closest(".rw-track,.dp-g")) return;
    SND.click(t.closest(".tab") ? "tab" : t.closest("[data-carou]") ? "soft" : "");
  }, true);

  // ================= 2.2: плашка «На будущее» у названия =================
  const futPill = (kind, n) => `<a class="fut-pill" href="${rh(kind + "-future")}" title="Отложенное на потом, отсюда крутится рулетка">${kind === "games" ? "Список желаемого" : "На будущее"}<b>${n}</b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></a>`;

  // ================= 2.2: день рождения, год по желанию =================
  // без года храним как 0004-ММ-ДД: год показывать не нужно
  const bdFields = (v, pre) => { let y = "", m = "", d = ""; if (v){ const [yy, mm, dd] = v.split("-").map(Number); y = yy > 1900 ? yy : ""; m = mm; d = dd; }
    const Y = new Date().getFullYear(), ys = []; for (let i = Y - 6; i >= Y - 90; i--) ys.push(i);
    return `<div class="bd-f"><select class="in" id="${pre}D" aria-label="День"><option value="">День</option>${Array.from({length: 31}, (_, i) => `<option${i + 1 === d ? " selected" : ""}>${i + 1}</option>`).join("")}</select>
      <select class="in" id="${pre}M" aria-label="Месяц"><option value="">Месяц</option>${MON_GEN.map((x, i) => `<option value="${i + 1}"${i + 1 === m ? " selected" : ""}>${x}</option>`).join("")}</select>
      <select class="in" id="${pre}Y" aria-label="Год"><option value="">Год не важен</option>${ys.map(x => `<option${x === y ? " selected" : ""}>${x}</option>`).join("")}</select></div>`; };
  const bdRead = (root, pre) => { const q = x => +root.querySelector("#" + pre + x).value || 0, d = q("D"), m = q("M"), y = q("Y");
    if (!d || !m) return null; const chk = new Date(y || 2004, m - 1, d); if (chk.getMonth() !== m - 1) return false;
    return `${y ? y : "0004"}-${pad(m)}-${pad(d)}`; };
  function bdaySheet(prompt){
    if (!ME) return;
    const cur = MEP && MEP.birthday;
    const s = openSheet(`<h3>${prompt ? "Когда у тебя день рождения?" : "День рождения"}</h3><p class="sub">Друзья увидят число и месяц в календаре дней рождения. Год можно не указывать.</p>
      <label class="f">Дата${bdFields(cur, "bdx")}</label>
      <div class="acts"><button class="ib blue" id="bdOk">Сохранить</button>${cur ? `<button class="ib red" id="bdRm">Убрать</button>` : ""}<button class="ib" id="bdNo">${prompt ? "Позже" : "Отмена"}</button></div>`);
    const q = x => s.el.querySelector(x);
    q("#bdNo").onclick = () => s.close();
    if (q("#bdRm")) q("#bdRm").onclick = async () => { if (await saveProf({birthday: null})){ toast("День рождения убран"); s.close(); } };
    q("#bdOk").onclick = async () => { const v = bdRead(s.el, "bdx"); if (v === false){ toast("Такого числа в этом месяце нет"); return; } if (!v){ toast("Выбери день и месяц"); return; }
      if (await saveProf({birthday: v})){ toast("Сохранено: " + bdLabel(v)); s.close(); } };
  }
  // уже зарегистрированных спрашиваем один раз, потом не чаще раза в неделю
  function askBday(){
    if (!ME || (MEP && MEP.birthday)) return;
    const k = "nexus_bd_ask_" + ME.id, t = +lsGet(k) || 0; if (Date.now() - t < 7 * 864e5) return;
    let n = 0; const tryOpen = () => { if (sheets.length || !$("ce").hidden){ if (++n < 40) setTimeout(tryOpen, 900); return; } lsSet(k, String(Date.now())); bdaySheet(true); };
    setTimeout(tryOpen, 2600);
  }

  // ================= 2.2: мини-окно активности друзей =================
  let fwHide = lsGet("nexus_fw") === "0";
  function renderFw(){
    const el = $("fw"); if (!el) return;
    const w = (ROUTES[route] || {}).w;
    if (!(ME && FR && !FV && (w === "wGames" || w === "wKino"))){ el.hidden = true; return; }
    const ev = FR.items.filter(i => i.uid !== ME.id && i._upd).sort((a, b) => b._upd.localeCompare(a._upd)).slice(0, 4);
    if (!ev.length){ el.hidden = true; return; }
    el.hidden = false; el.classList.toggle("min", fwHide);
    const html = fwHide ? `<button class="fw-pill" data-fwt="1" title="Активность друзей">${avaStack([...new Set(ev.map(i => i.uid))], 3)}<span>${ev.length}</span></button>`
      : `<div class="fw-h"><span>Друзья сейчас</span><a href="#people">все</a><button data-fwt="1" aria-label="Свернуть" title="Свернуть">−</button></div>${ev.map(i => `<button class="fw-r" data-fi="${esc(i.uid + "/" + i.id)}" title="${esc(frNick(i.uid) + " " + verbOf(i) + " " + i.title)}">${avaHTML(profOf(i.uid), "xs")}<span><b>${esc(frNick(i.uid))}</b> ${verbOf(i)} ${esc(i.title)}</span><small>${agoTs(i._upd)}</small></button>`).join("")}`;
    if (el.innerHTML !== html) el.innerHTML = html;
  }

  // ================= 2.2: ужасы — кровь течёт из-за постера =================
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function goreFx(wrap, instant){
    const P = wrap.querySelector(".poster"); if (!P || !P.offsetWidth) return;
    wrap.querySelectorAll(".gore").forEach(x => x.remove());
    const W = P.offsetWidth, H = P.offsetHeight, padX = Math.round(W * .42), extra = Math.round(H * 1.5), VW = W + padX * 2, VH = H + extra;
    const NS = "http://www.w3.org/2000/svg", fid = "goo" + Math.random().toString(36).slice(2, 8);
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "gore"); svg.setAttribute("width", VW); svg.setAttribute("height", VH);
    svg.style.left = -padX + "px"; svg.style.top = "0px";
    svg.innerHTML = `<defs><linearGradient id="${fid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#930303"/><stop offset=".55" stop-color="#6c0101"/><stop offset="1" stop-color="#3a0000"/></linearGradient>
      <filter id="${fid}" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="b"/>
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" result="goo"/>
        <feGaussianBlur in="goo" stdDeviation="2.4" result="gb"/>
        <feSpecularLighting in="gb" surfaceScale="5" specularConstant="1.15" specularExponent="30" lighting-color="#ffd9cf" result="sp"><fePointLight x="${Math.round(VW * .3)}" y="${-H}" z="${Math.round(H * .9)}"/></feSpecularLighting>
        <feComposite in="sp" in2="goo" operator="in" result="spi"/>
        <feComposite in="goo" in2="spi" operator="arithmetic" k1="0" k2="1" k3=".75" k4="0"/>
      </filter><linearGradient id="${fid}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="${(H / VH + .12).toFixed(2)}" stop-color="#fff"/><stop offset=".97" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${fid}m"><rect width="${VW}" height="${VH}" fill="url(#${fid}f)"/></mask></defs><g mask="url(#${fid}m)"><g filter="url(#${fid})" fill="url(#${fid}g)"></g></g>`;
    const g = svg.querySelector("g[filter]"), x0 = padX, x1 = padX + W, poolY = H + extra * .96, streams = [];
    const el = (tag, at) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); g.appendChild(n); return n; };
    const pool = el("ellipse", {cx: padX + W / 2, cy: poolY, rx: 0, ry: 0});
    const lobes = Array.from({length: 9}, (_, i) => ({a: i / 9 * Math.PI * 2 + Math.random() * .5, k: .7 + Math.random() * .5, r: .25 + Math.random() * .3, n: el("circle", {cx: padX + W / 2, cy: poolY, r: 0})}));
    const ledge = el("rect", {x: x0 + 4, y: H - 14, width: W - 8, height: 0, rx: 6});
    const add = (x, y, w, maxY, delay) => { const body = el("rect", {width: w, rx: w / 2, x: x - w / 2, y, height: 0}), head = el("circle", {r: w * .78, cx: x, cy: y});
      const beads = [.25 + Math.random() * .2, .55 + Math.random() * .25].map(t => ({t, r: w * (.55 + Math.random() * .35), n: el("circle", {r: 0, cx: x, cy: y})}));
      streams.push({x, y0: y, y, vy: 0, w, maxY, delay, head, body, beads, wob: Math.random() * 6, sp: .7 + Math.random() * .6}); };
    const nb = W > 250 ? 10 : 7;
    for (let i = 0; i < nb; i++) add(x0 + W * (.06 + .88 * Math.random()), H - 16, 5 + Math.random() * 10, H + extra * (.35 + Math.random() * .62), .2 + Math.random() * 1.8);
    [[x0 + 2, -1], [x1 - 2, 1]].forEach(([x, s]) => { for (let k = 0; k < 2; k++) add(x + s * (2 + Math.random() * 5), H * (.08 + Math.random() * .55), 4 + Math.random() * 6, H + extra * (.3 + Math.random() * .6), .6 + Math.random() * 2.2); });
    wrap.insertBefore(svg, wrap.firstChild);
    const draw = (T, pg) => {
      streams.forEach(s => { const xw = s.x + Math.sin(T * 1.2 + s.wob) * .7, len = Math.max(0, s.y - s.y0);
        s.body.setAttribute("x", (xw - s.w / 2).toFixed(1)); s.body.setAttribute("y", s.y0.toFixed(1)); s.body.setAttribute("height", len.toFixed(1));
        s.head.setAttribute("cx", xw.toFixed(1)); s.head.setAttribute("cy", s.y.toFixed(1)); s.head.setAttribute("r", (s.w * (.7 + Math.min(1, len / 60) * .25)).toFixed(1));
        s.beads.forEach(b => { const by = s.y0 + len * b.t, bx = s.x + Math.sin(T * 1.6 + s.wob + b.t * 5) * 1.1; b.n.setAttribute("cx", bx.toFixed(1)); b.n.setAttribute("cy", by.toFixed(1)); b.n.setAttribute("r", (len > 20 ? b.r : 0).toFixed(1)); }); });
      const e = 0, rx = 0, ry = 0; pool.setAttribute("rx", rx.toFixed(1)); pool.setAttribute("ry", ry.toFixed(1));
      lobes.forEach(l => { l.n.setAttribute("cx", (padX + W / 2 + Math.cos(l.a) * rx * l.k).toFixed(1)); l.n.setAttribute("cy", (poolY + Math.sin(l.a) * ry * l.k * 1.1).toFixed(1)); l.n.setAttribute("r", (ry * l.r * 2.2 * e + (pg > .3 ? Math.sin(T * .8 + l.a) * .8 : 0)).toFixed(1)); });
      ledge.setAttribute("height", (Math.min(1, pg * 3 + .2) * 22).toFixed(1));
    };
    if (instant || calmMotion){ streams.forEach(s => s.y = s.maxY); draw(9, 1); return; }
    const t0 = performance.now(); let last = t0;
    const step = now => {
      if (!svg.isConnected) return;
      const dt = Math.min(.05, (now - last) / 1000), T = (now - t0) / 1000; last = now; let alive = false;
      streams.forEach(s => { if (T < s.delay){ alive = true; return; } if (s.y < s.maxY){ alive = true;
        s.vy = Math.min(s.vy + 120 * dt, (42 + s.w * 5) * s.sp * Math.max(.35, 1 - (s.y - H) / extra)); s.y = Math.min(s.maxY, s.y + s.vy * dt * (.55 + .45 * Math.abs(Math.sin(T * 2.2 + s.wob)))); } });
      const pg = Math.min(1, Math.max(0, (T - 1.4) / 6));
      draw(T, pg);
      if ((alive || pg < 1) && T < 22) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function dread(instant){
    let v = $("view"); if (!v || v.hidden) v = document.querySelector(".wp"); if (!v || v.querySelector(".dread")) return;
    const d = document.createElement("div"); d.className = "dread"; if (instant) d.style.cssText = "animation:none;opacity:1";
    const sh = v.querySelector(".shade"); sh ? sh.after(d) : v.prepend(d);
  }

  // ================= 2.2: эмодзи в стиле iOS =================
  const EMO = [["lol", "😂", "смех"], ["angry", "😡", "злость"], ["poker", "😐", "покерфейс"], ["cringe", "😬", "кринж"], ["cry", "😭", "плач"],
    ["like", "👍", "лайк"], ["fire", "🔥", "огонь"], ["skull", "💀", "череп"], ["salute", "🫡", "GG"], ["clown", "🤡", "клоун"], ["poop", "💩", "какашка"], ["party", "🎉", "праздник"]];
  const EMO_SVG = (() => {
    const face = (f = "url(#emY)") => `<circle cx="32" cy="32" r="29" fill="${f}"/><ellipse cx="24" cy="14" rx="13" ry="6" fill="#fff" opacity=".28"/>`, B = "#6b3c0b";
    return {
      lol: face() + `<path d="M15 27q6-8 12 0M37 27q6-8 12 0" stroke="${B}" stroke-width="3.8" fill="none" stroke-linecap="round"/><path d="M14 35q18 3 36 0q-2 18-18 18t-18-18Z" fill="${B}"/><path d="M16 36q16 3 32 0v3.5q-16 3-32 0Z" fill="#fff"/><path d="M24 47q8-5 16 0q-8 5-16 0Z" fill="#ff6b6b"/><path d="M10 27q-8 9-4 16q6 3 9-4q1-7-5-12Z" fill="url(#emT)"/><path d="M54 27q8 9 4 16q-6 3-9-4q-1-7 5-12Z" fill="url(#emT)"/>`,
      angry: face("url(#emR)") + `<path d="M14 20l13 7M50 20l-13 7" stroke="#5a1200" stroke-width="4" stroke-linecap="round"/><ellipse cx="23" cy="32" rx="3.4" ry="4" fill="#5a1200"/><ellipse cx="41" cy="32" rx="3.4" ry="4" fill="#5a1200"/><path d="M22 48q10-8 20 0" stroke="#5a1200" stroke-width="3.8" fill="none" stroke-linecap="round"/>`,
      poker: face() + `<ellipse cx="23" cy="28" rx="3.3" ry="4.8" fill="${B}"/><ellipse cx="41" cy="28" rx="3.3" ry="4.8" fill="${B}"/><path d="M21 44h22" stroke="${B}" stroke-width="3.8" stroke-linecap="round"/>`,
      cringe: face() + `<ellipse cx="23" cy="25" rx="3.3" ry="4.8" fill="${B}"/><ellipse cx="41" cy="25" rx="3.3" ry="4.8" fill="${B}"/><rect x="14" y="36" width="36" height="14" rx="7" fill="#fff" stroke="${B}" stroke-width="2.8"/><path d="M15 43h34M23 36.5v13M32 36.5v13M41 36.5v13" stroke="${B}" stroke-width="1.7"/>`,
      like: `<path d="M8 31a3 3 0 0 1 3-3h8v27h-8a3 3 0 0 1-3-3Z" fill="#e8890f"/><path d="M21 28l9-15c2.5-4.2 9-2.8 9 2.2V26h12.5a5.5 5.5 0 0 1 5.4 6.5l-3.3 18A6 6 0 0 1 46.7 55H21Z" fill="url(#emY)" stroke="#c97a10" stroke-width="2" stroke-linejoin="round"/><path d="M42 35h11M42 42h10M42 49h8" stroke="#c97a10" stroke-width="2" stroke-linecap="round" opacity=".55"/><ellipse cx="33" cy="20" rx="4" ry="2.4" fill="#fff" opacity=".35" transform="rotate(-55 33 20)"/>`,
      fire: `<path d="M33 3c3 11 17 17 17 34a18 18 0 0 1-36 0c0-9 4-14 7-18 1 7 5 10 9 11-3-11 0-20 3-27Z" fill="url(#emF)"/><path d="M32 30c3 7 10 10 10 18a10 10 0 0 1-20 0c0-6 3-9 5-12 1 3 3 5 5 6-1-5-1-9 0-12Z" fill="#ffe36b"/>`,
      skull: `<path d="M32 5C18 5 8 15 8 28c0 8 4 14 10 17v7a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-7c6-3 10-9 10-17C56 15 46 5 32 5Z" fill="#f1f2f5" stroke="#b5b9c3" stroke-width="2"/><ellipse cx="22" cy="30" rx="7" ry="7.5" fill="#2b2f38"/><ellipse cx="42" cy="30" rx="7" ry="7.5" fill="#2b2f38"/><path d="M32 37l-4.5 8h9Z" fill="#2b2f38"/><path d="M26 50v6M32 50v6M38 50v6" stroke="#b5b9c3" stroke-width="2.2"/><ellipse cx="22" cy="14" rx="9" ry="4" fill="#fff" opacity=".7"/>`,
      salute: face() + `<ellipse cx="40" cy="30" rx="3.2" ry="4.6" fill="${B}"/><ellipse cx="25" cy="32" rx="3.2" ry="4.6" fill="${B}"/><path d="M25 46h16" stroke="${B}" stroke-width="3.6" stroke-linecap="round"/><path d="M1 27c6-12 18-17 30-14l3 2c2 3 0 6-3 6l-17 5c-5 1-9 2-13 1Z" fill="url(#emY)" stroke="#c97a10" stroke-width="2" stroke-linejoin="round"/><path d="M14 17l12-3M12 22l15-3" stroke="#c97a10" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`,
      clown: `<circle cx="11" cy="25" r="9" fill="#ff7a00"/><circle cx="53" cy="25" r="9" fill="#ff7a00"/><circle cx="15" cy="15" r="7" fill="#ffd60a"/><circle cx="49" cy="15" r="7" fill="#2fb4ff"/><circle cx="32" cy="35" r="24" fill="#fafafa" stroke="#d9d9de" stroke-width="1.2"/><path d="M18 27l5-6 5 6-5 6Z" fill="#2fb4ff"/><path d="M36 27l5-6 5 6-5 6Z" fill="#2fb4ff"/><circle cx="23" cy="27" r="2.2" fill="#222"/><circle cx="41" cy="27" r="2.2" fill="#222"/><circle cx="32" cy="37" r="6.5" fill="#ff2d2d"/><circle cx="30" cy="35" r="2" fill="#fff" opacity=".65"/><path d="M17 44q15 15 30 0q-15 7-30 0Z" fill="#e0242b"/>`,
      poop: `<path d="M9 54c-3-9 5-13 9-13-3-8 4-13 9-13-1-8 5-12 10-13 3-1 4-4 3-8 9 4 8 13 5 16 8 0 11 6 9 11 8 1 11 9 7 14-1 4-4 6-8 6H17c-4 0-7-1-8-0Z" fill="url(#emP)"/><ellipse cx="25" cy="42" rx="5" ry="6" fill="#fff"/><ellipse cx="39" cy="42" rx="5" ry="6" fill="#fff"/><circle cx="26" cy="43.5" r="2.7" fill="#2a1505"/><circle cx="38" cy="43.5" r="2.7" fill="#2a1505"/><path d="M24 51q8 6 16 0" stroke="#2a1505" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M29 18q4-3 9-1" stroke="#fff" stroke-width="2" opacity=".3" fill="none" stroke-linecap="round"/>`,
      party: `<path d="M7 59l12-37 23 23Z" fill="url(#emY)" stroke="#c97a10" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 44l9 9M16 33l16 16" stroke="#ff375f" stroke-width="4"/><path d="M33 21q7-8 2-15" stroke="#30d158" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M43 31q9-4 15 3" stroke="#0a84ff" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="51" cy="13" r="3.2" fill="#ff375f"/><rect x="40" y="5" width="6" height="6" rx="1" fill="#ffd60a" transform="rotate(22 43 8)"/><circle cx="57" cy="44" r="2.8" fill="#bf5af2"/><rect x="25" y="9" width="5" height="5" rx="1" fill="#64d2ff" transform="rotate(-18 27 11)"/><rect x="49" y="22" width="5" height="5" rx="1" fill="#ff9f0a" transform="rotate(35 51 24)"/>`,
      cry: face() + `<path d="M15 19q5-4 11 0M49 19q-5-4-11 0" stroke="${B}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M16 27q5 4 10 0M38 27q5 4 10 0" stroke="${B}" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M17 29q-3 14-1 31h9q2-17-1-31Z" fill="url(#emT)" opacity=".95"/><path d="M40 29q-3 14-1 31h9q2-17-1-31Z" fill="url(#emT)" opacity=".95"/><path d="M23 40q9-6 18 0q2 12-9 13q-11-1-9-13Z" fill="${B}"/><path d="M27 49q5-3 10 0q-5 4-10 0Z" fill="#ff6b6b"/>`
    };
  })();
  document.body.insertAdjacentHTML("beforeend", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="emY" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffec8f"/><stop offset=".55" stop-color="#fdc83a"/><stop offset="1" stop-color="#f0981a"/></radialGradient>
    <radialGradient id="emR" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ffb07a"/><stop offset=".5" stop-color="#f45d2c"/><stop offset="1" stop-color="#c41e0d"/></radialGradient>
    <linearGradient id="emT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e6ff"/><stop offset="1" stop-color="#2f9ff0"/></linearGradient>
    <linearGradient id="emF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb627"/><stop offset=".55" stop-color="#ff6a00"/><stop offset="1" stop-color="#e5260f"/></linearGradient>
    <linearGradient id="emP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5683a"/><stop offset="1" stop-color="#5d3416"/></linearGradient></defs></svg>`);
  const emoSpan = k => `<span class="emo" title="${(EMO.find(x => x[0] === k) || [])[2] || ""}"><svg viewBox="0 0 64 64">${EMO_SVG[k]}</svg></span>`;
  const EMO_RE = new RegExp(EMO.map(x => x[1]).join("|"), "g");
  const richText = s => linkMentions(esc(s).replace(EMO_RE, ch => emoSpan(EMO.find(x => x[1] === ch)[0])));
  const onlyEmo = s => { const t = String(s || "").replace(EMO_RE, "").trim(); return !t && String(s || "").trim().length > 0; };


  // ================= 6.0: меню настроек в шапке =================
  (function(){
    const menu = $("ghMenu"), btn = $("ghMenuBtn"); if (!menu || !btn) return;
    const rows = [["pnBtn", "Патчноуты"], ["modeBtn", "Тема"], ["sndBtn", "Звуки"], ["bgBtn", "Фон этой страницы"]];
    rows.forEach(([id, l]) => { const b = $(id); if (!b) return; const r = document.createElement("div"); r.className = "gh-mi"; r.setAttribute("role", "menuitem"); r.tabIndex = -1; b.tabIndex = 0; r.appendChild(b); const t = document.createElement("span"); t.textContent = l; r.appendChild(t); r.addEventListener("click", e => { if (!b.contains(e.target)) b.click(); }); menu.appendChild(r); });
    const ex = (l, ic, fn) => { const r = document.createElement("button"); r.type = "button"; r.className = "gh-mi"; r.setAttribute("role", "menuitem"); r.innerHTML = `<span class="gh-ic">${ic}</span><span>${l}</span>`; r.addEventListener("click", fn); menu.appendChild(r); };
    ex("Рабочий день", ICON.clock || "", () => { close(); if (typeof workSheet === "function") workSheet(); });
    ex("Все настройки", ICON.more, () => { close(); go("more"); });
    const open = () => { menu.hidden = false; btn.setAttribute("aria-expanded", "true"); const f = menu.querySelector("a,button"); if (f) f.focus({preventScroll: true}); };
    function close(){ if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", e => { e.stopPropagation(); menu.hidden ? open() : close(); });
    menu.addEventListener("click", e => { if (e.target.closest("#pnBtn,#bgBtn") || e.target.closest(".gh-mi > span")) setTimeout(close, 0); });
    document.addEventListener("click", e => { if (!menu.contains(e.target) && e.target !== btn) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    window.addEventListener("hashchange", close);
  })();
