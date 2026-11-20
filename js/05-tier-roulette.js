  // ================= перетаскивание (календарь и тир-лист) =================
  function dragger(root, {canStart, onDrop, onClick, zoneSel}){
    let st = null, ghost = null, over = null;
    root.addEventListener("pointerdown", e => {
      const t = e.target.closest("[data-drag]"); if (!t || e.button > 0) return;
      st = {id: t.dataset.drag, el: t, x: e.clientX, y: e.clientY, moved: false};
      t.setPointerCapture(e.pointerId);
    });
    root.addEventListener("pointermove", e => {
      if (!st) return;
      if (!st.moved){
        if (Math.hypot(e.clientX - st.x, e.clientY - st.y) < 6 || !canStart()) return;
        st.moved = true; st.el.classList.add("lift");
        const it = items.find(i => i.id === st.id);
        ghost = document.createElement("div"); ghost.className = "ghost";
        ghost.innerHTML = it && it.cover ? `<img alt="" src="${blobUrl(it.cover)}" style="${posStyle(it.coverPos)}">` : `<div class="nm">${esc(it ? it.title : "")}</div>`;
        document.body.appendChild(ghost);
      }
      ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px";
      const el = document.elementFromPoint(e.clientX, e.clientY), z = el && el.closest ? el.closest(zoneSel) : null;
      if (z !== over){ over && over.classList.remove("over"); over = z; over && over.classList.add("over"); }
    });
    const end = e => {
      if (!st) return; const s = st; st = null;
      s.el.classList.remove("lift"); if (ghost){ ghost.remove(); ghost = null; }
      const z = over; over && over.classList.remove("over"); over = null;
      if (!s.moved){ if (e.type === "pointerup" && onClick) onClick(s.id, s.el); return; }
      if (z) onDrop(s.id, z, e);
    };
    root.addEventListener("pointerup", end);
    root.addEventListener("pointercancel", end);
  }
  dragger($("aMain"), {zoneSel: "[data-day]", canStart: () => canWrite && route === "calendar", onClick: (id, el) => { if (route !== "calendar") return; const it = items.find(i => i.id === id), d = it && itemDate(it); if (d && el && el.querySelector(".c-more")) calDaySheet(d); else openItem(id); },
    onDrop: async (id, z) => {
      const it = items.find(i => i.id === id); if (!it) return;
      const day = z.dataset.day, field = relOn(it) ? "releaseDate" : "date";
      if (itemDate(it) === day) return;
      const prev = it[field]; it[field] = day; renderCal();
      try { await write(id, field === "releaseDate" ? {releaseDate: day, releasePrec: "day"} : {[field]: day}); toast(`${it.title}: ${fmtDate(day)}`); } catch(err){ it[field] = prev; renderCal(); toast("Не сохранилось"); }
    }});

  // ================= тир-лист =================
  function openTiers(kind){ tierKind = kind; $("tier").hidden = false; document.body.classList.add("ov-open"); renderTiers(); }
  function closeTiers(){ if (!tierKind) return; tierKind = null; $("tier").hidden = true; $("tier").innerHTML = ""; if ($("rl").hidden) document.body.classList.remove("ov-open"); }
  function renderTiers(){
    const pool = items.filter(ofKind(tierKind)).filter(inLib);
    const byT = t => pool.filter(i => (i.tier || "") === t).sort((a,b) => (a.tierOrder ?? 1e9) - (b.tierOrder ?? 1e9) || (a.title||"").localeCompare(b.title||"","ru"));
    const tile = it => `<div class="tt" data-drag="${esc(it.id)}" title="${esc(it.title)}">${posterHTML(it, {tgt:false})}</div>`;
    $("tier").innerHTML = `<div class="tier-in">
      <div class="tier-h"><h2>Тир-лист: ${tierKind === "games" ? "игры" : "кино"}</h2><span style="flex:1"></span>
        <div class="seg" style="--seg-bg:#1c1c1e;--seg-on:#3a3a3c"><button data-tsw="games" aria-pressed="${tierKind==="games"}">Игры</button><button data-tsw="kino" aria-pressed="${tierKind==="kino"}">Кино</button></div>
        <button class="ib" id="tClose" aria-label="Закрыть">${ICON.x}</button>
        <p>Тащи постеры по полкам. Тир не влияет на оценку: цифра на постере остаётся твоей оценкой.</p></div>
      ${TIERS.map(([t,c]) => `<div class="tr"><div class="tl" style="background:${c}">${t}</div><div class="tz" data-zone="${t}">${byT(t).map(tile).join("")}</div></div>`).join("")}
      <div class="tr pool"><div class="tl">Без тира</div><div class="tz" data-zone="">${byT("").map(tile).join("") || `<span style="color:#636366;padding:10px;font-size:14px">${pool.length ? "Всё разложено" : "Пусто"}</span>`}</div></div></div>`;
    $("tClose").onclick = closeTiers;
    $("tier").querySelectorAll("[data-tsw]").forEach(b => b.onclick = () => { tierKind = b.dataset.tsw; renderTiers(); });
  }
  dragger($("tier"), {zoneSel: "[data-zone]", canStart: () => canWrite,
    onDrop: async (id, z, e) => {
      const it = items.find(i => i.id === id); if (!it) return;
      const tier = z.dataset.zone || null;
      const tiles = [...z.querySelectorAll("[data-drag]")].filter(t => t.dataset.drag !== id);
      let idx = tiles.length;
      for (let i = 0; i < tiles.length; i++){ const r = tiles[i].getBoundingClientRect();
        if (e.clientY < r.top || (e.clientY <= r.bottom && e.clientX < r.left + r.width / 2)){ idx = i; break; } }
      const ord = t => { const x = items.find(i => i.id === t.dataset.drag); return x && x.tierOrder != null ? x.tierOrder : null; };
      const prev = idx > 0 ? ord(tiles[idx-1]) : null, next = idx < tiles.length ? ord(tiles[idx]) : null;
      const order = prev == null && next == null ? 1000 : prev == null ? next - 100 : next == null ? prev + 100 : (prev + next) / 2;
      const old = {tier: it.tier, tierOrder: it.tierOrder};
      it.tier = tier; it.tierOrder = order; renderTiers();
      try { await db.doc("items/" + id).update({tier, tierOrder: order}); } catch(err){ Object.assign(it, old); renderTiers(); toast("Не сохранилось"); }
    }});

  // ================= рулетка =================
  let rlState = null;
  function closeRoulette(){ if ($("rl").hidden) return; if (rlState) rlState.dead = true; rlState = null; $("rl").hidden = true; $("rl").innerHTML = ""; if (!tierKind) document.body.classList.remove("ov-open"); }
  const rlTile = it => `<div class="rl-t">${posterHTML(it, {rate:false, tgt:false, badge:false, eager:true})}<div class="tt">${esc(it.title)}</div></div>`;
  function openRoulette(kind){
    const S = rlState = {kind, temps: [], rerolls: 1, spinning: false, last: null, sound: true, actx: null, dead: false};
    S.pool = () => [...items.filter(ofKind(kind)).filter(isFuture), ...S.temps];
    $("rl").hidden = false; document.body.classList.add("ov-open");
    $("rl").innerHTML = `<div class="rl-bg"></div><button class="rl-x" id="rlX" aria-label="Закрыть">${ICON.x}</button>
      <div class="rl-in"><div class="rl-kicker">${kind === "games" ? "Рулетка игр" : "Рулетка кино"}</div><h2 class="rl-h">Что дальше?</h2>
        <p class="rl-sub" id="rlSub"></p>
        <div class="rl-win" id="rlWin"><div class="rl-mark" id="rlMark"></div><div class="rl-strip" id="rlStrip"></div></div>
        <div class="rl-res" id="rlRes"></div>
        <div class="rl-acts" id="rlActs"><button class="rl-go" id="rlGo">Крутить</button></div>
        ${canWrite ? `<div class="rl-add" id="rlAdd"><form id="rlForm"><input class="in" id="rlT" placeholder="Свой вариант: название" autocomplete="off"><input class="in" id="rlG" placeholder="жанр" autocomplete="off">
          ${kind === "kino" ? `<select class="in" id="rlK">${Object.entries(KTYPES).map(([k,l]) => `<option value="${k}">${l}</option>`).join("")}</select>` : ""}<button class="ib blue" type="submit" aria-label="Добавить вариант">${ICON.plus}</button></form>
          <div class="rl-chips" id="rlChips"></div><div class="rl-note">Свои варианты крутятся вместе с «${kind === "games" ? "Список желаемого" : "На будущее"}». Если такой выпадет, он сам попадёт в «На будущее».</div></div>` : ""}
        <div style="margin-top:14px"><button class="ib" id="rlSnd" style="background:rgba(255,255,255,.1);font-size:13px;padding:8px 14px">Звук: вкл</button></div></div>
      <canvas class="rl-cf" id="rlCf"></canvas>`;
    $("rlX").onclick = closeRoulette;
    $("rlSnd").onclick = () => { S.sound = !S.sound; $("rlSnd").textContent = "Звук: " + (S.sound ? "вкл" : "выкл"); };
    $("rlGo").onclick = () => spin(S);
    if ($("rlForm")) $("rlForm").onsubmit = e => { e.preventDefault(); const t = $("rlT").value.trim(); if (!t) return;
      S.temps.push({id: "tmp" + Date.now() + Math.random().toString(36).slice(2,6), title: t, genre: $("rlG").value.trim() || null, type: kind === "games" ? "game" : $("rlK").value, status: "future", temp: true});
      $("rlT").value = ""; $("rlG").value = ""; $("rlT").focus(); rlIdle(S); };
    if ($("rlChips")) $("rlChips").onclick = e => { const b = e.target.closest("[data-rm]"); if (!b) return; S.temps = S.temps.filter(x => x.id !== b.dataset.rm); rlIdle(S); };
    rlIdle(S);
  }
  function rlIdle(S){
    if (S.spinning) return;
    const pool = S.pool(), base = pool.length - S.temps.length;
    $("rlSub").textContent = `${base} в «На будущее»${S.temps.length ? ` + ${S.temps.length} своих` : ""} · один рерол · без нытья`;
    if ($("rlChips")) $("rlChips").innerHTML = S.temps.map(x => `<span>${esc(x.title)}<button type="button" data-rm="${esc(x.id)}" aria-label="Убрать">×</button></span>`).join("");
    const strip = $("rlStrip"); strip.classList.remove("done"); strip.style.filter = "";
    if (!pool.length){ strip.innerHTML = ""; $("rlRes").innerHTML = `<p>Пусто. Добавь варианты ниже или в «${S.kind === "games" ? "Список желаемого" : "На будущее"}».</p>`; $("rlGo").disabled = true; return; }
    const idle = []; while (idle.length < 24) idle.push(...pool);
    strip.innerHTML = idle.slice(0, 24).map(rlTile).join("");
    const t0 = strip.children[0], t1 = strip.children[1];
    const step0 = t1 ? t1.getBoundingClientRect().left - t0.getBoundingClientRect().left : 186;
    strip.style.transform = `translateX(${-(step0 * 4)}px)`;
    const ok = pool.length >= 2;
    if (!$("rlRes").querySelector("h3")) $("rlRes").innerHTML = ok ? "" : `<p>Нужно минимум 2 варианта, сейчас ${pool.length}.</p>`;
    const go = $("rlGo"); if (go) go.disabled = !ok;
  }
  function blip(S, f = 1500){ if (!S.sound) return; try { S.actx = S.actx || new (window.AudioContext || window.webkitAudioContext)(); const a = S.actx, o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.06, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .05);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .06); } catch(e){ /* ожидаемо: браузер не дал включить звук */ } }
  function spin(S){
    const pool = S.pool();
    if (S.spinning || pool.length < 2) return; S.spinning = true;
    const cands = pool.filter(i => !S.last || i.id !== S.last.id);
    let win = cands[Math.floor(Math.random() * cands.length)]; S.last = win;
    const N = 64, W = 56, seq = [];
    for (let i = 0; i < N; i++) seq.push(pool[Math.floor(Math.random() * pool.length)]);
    seq[W] = win;
    const strip = $("rlStrip"); strip.classList.remove("done"); strip.style.transform = "translateX(0px)"; strip.style.filter = "";
    strip.innerHTML = seq.map(rlTile).join("");
    if ($("rlAdd")) $("rlAdd").style.opacity = ".3", $("rlAdd").style.pointerEvents = "none";
    $("rlRes").innerHTML = ""; $("rlActs").innerHTML = `<button class="rl-go" disabled>Крутится…</button>`;
    const tiles = strip.children, step = tiles[1].getBoundingClientRect().left - tiles[0].getBoundingClientRect().left, tw = tiles[0].offsetWidth;
    const view = $("rlWin").clientWidth;
    const target = W * step + tw / 2 - view / 2 + (Math.random() - .5) * tw * .6;
    const dur = 6400, t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 4.5);
    let lastX = 0, lastIdx = -1, lastT = t0;
    const frame = t => {
      if (S.dead) return;
      const p = Math.min(1, (t - t0) / dur), x = target * ease(p), v = Math.abs(x - lastX) / Math.max(1, t - lastT);
      strip.style.transform = `translateX(${-x}px)`; strip.style.filter = v > .3 ? `blur(${Math.min(5, v * 1.6).toFixed(2)}px)` : "";
      const idx = Math.floor((x + view / 2) / step);
      if (idx !== lastIdx){ lastIdx = idx; const m = $("rlMark"); m.classList.remove("tick"); void m.offsetWidth; m.classList.add("tick"); blip(S, 1300 + Math.random() * 300); }
      lastX = x; lastT = t;
      if (p < 1) requestAnimationFrame(frame); else land();
    };
    const land = async () => {
      strip.style.filter = ""; tiles[W].classList.add("win"); strip.classList.add("done");
      blip(S, 880); setTimeout(() => blip(S, 1320), 120); confetti();
      $("rlRes").innerHTML = `<h3>${esc(win.title)}</h3><p>${esc(genres(win).join(", ") || (isGame(win) ? "Игра" : KTYPES[win.type]))}</p>`;
      if (win.temp && canWrite){
        try {
          const body = {title: win.title, genre: win.genre, type: win.type, status: "future", createdAt: now(), updatedAt: now()};
          const ref = await db.collection("items").add(body);
          S.temps = S.temps.filter(x => x.id !== win.id);
          win = {...body, id: ref.id}; S.last = win;
          $("rlRes").insertAdjacentHTML("beforeend", `<p style="color:#30d158">Добавлено в «На будущее»</p>`);
        } catch(e){ toast("Не удалось сохранить вариант"); }
      }
      S.spinning = false;
      if ($("rlAdd")) $("rlAdd").style.opacity = "", $("rlAdd").style.pointerEvents = "";
      if ($("rlChips")) $("rlChips").innerHTML = S.temps.map(x => `<span>${esc(x.title)}<button type="button" data-rm="${esc(x.id)}" aria-label="Убрать">×</button></span>`).join("");
      $("rlActs").innerHTML = `${canWrite ? `<button class="rl-go" id="rlTake">Беру</button>` : ""}${S.rerolls > 0 ? `<button class="rl-go ghostb" id="rlRe">Рерол (${S.rerolls})</button>` : ""}<button class="rl-go ghostb" id="rlLater">Позже</button>`;
      if ($("rlTake")) $("rlTake").onclick = () => { closeRoulette(); takeItem(win, "roulette"); };
      if ($("rlRe")) $("rlRe").onclick = () => { S.rerolls--; spin(S); };
      $("rlLater").onclick = closeRoulette;
    };
    requestAnimationFrame(frame);
  }
  // ================= битва =================
  let btState = null;
  function closeBattle(){ if ($("bt").hidden) return; btState = null; $("bt").hidden = true; $("bt").innerHTML = ""; if (!tierKind && $("rl").hidden) document.body.classList.remove("ov-open"); }
  function openBattle(kind){
    const pool = items.filter(ofKind(kind)).filter(isFuture);
    if (pool.length < 2){ toast(`Для битвы нужно хотя бы 2 позиции в «На будущее»`); return; }
    const q = [...pool].sort(() => Math.random() - .5);
    const S = btState = {kind, q, champ: q.shift(), ch: q.shift(), round: 1, total: pool.length - 1, busy: false};
    $("bt").hidden = false; document.body.classList.add("ov-open");
    btRender(S, "");
  }
  function btCard(it, side, anim){
    return `<button class="bt-c ${anim}" data-side="${side}" aria-label="Выбрать ${esc(it.title)}">${posterHTML(it, {rate:false, tgt:false, badge:false})}<span class="bt-t">${esc(it.title)}</span><span class="bt-g">${esc(genres(it).slice(0,2).join(", ") || (isGame(it) ? "Игра" : KTYPES[it.type] || ""))}</span></button>`;
  }
  function btRender(S, anim){
    if (btState !== S) return;
    $("bt").innerHTML = `<div class="rl-bg"></div><button class="rl-x" id="btX" aria-label="Закрыть">${ICON.x}</button>
      <div class="rl-in"><div class="rl-kicker">${S.kind === "games" ? "Битва игр" : "Битва кино"}</div><h2 class="rl-h">Кто важнее?</h2>
        <p class="rl-sub">Раунд ${S.round} из ${S.total} · выбирай сердцем, клавиши ← →</p>
        <div class="bt-arena">${btCard(S.champ, "l", "")}<span class="bt-vs">VS</span>${btCard(S.ch, "r", anim)}</div>
        <div class="bt-prog"><i style="width:${(S.round - 1) / S.total * 100}%"></i></div></div>`;
    $("btX").onclick = closeBattle;
    $("bt").querySelectorAll(".bt-c").forEach(b => b.onclick = () => btPick(S, b.dataset.side));
  }
  function btPick(S, side){
    if (S.busy || btState !== S) return; S.busy = true;
    const loser = $("bt").querySelector(`.bt-c[data-side="${side === "l" ? "r" : "l"}"]`), win = $("bt").querySelector(`.bt-c[data-side="${side}"]`);
    loser.classList.add(side === "l" ? "out-r" : "out-l"); win.classList.add("won");
    setTimeout(() => {
      S.champ = side === "l" ? S.champ : S.ch; S.busy = false;
      if (!S.q.length) return btFinal(S);
      S.ch = S.q.shift(); S.round++; btRender(S, "in-r");
    }, 420);
  }
  function btFinal(S){
    const w = S.champ;
    $("bt").innerHTML = `<div class="rl-bg"></div><button class="rl-x" id="btX" aria-label="Закрыть">${ICON.x}</button>
      <div class="rl-in"><div class="rl-kicker">Победитель</div><div class="bt-win">${posterHTML(w, {rate:false, tgt:false, badge:false})}</div>
        <div class="rl-res"><h3>${esc(w.title)}</h3><p>${esc(genres(w).join(", "))}</p></div>
        <div class="rl-acts">${canWrite ? `<button class="rl-go" id="btTake">Беру</button>` : ""}<button class="rl-go ghostb" id="btAgain">Ещё раз</button><button class="rl-go ghostb" id="btLater">Позже</button></div></div>`;
    confetti();
    $("btX").onclick = closeBattle; $("btLater").onclick = closeBattle;
    $("btAgain").onclick = () => { closeBattle(); openBattle(S.kind); };
    if ($("btTake")) $("btTake").onclick = () => { closeBattle(); takeItem(w, "battle"); };
  }
  document.addEventListener("keydown", e => { if (!btState || $("bt").hidden) return; if (e.key === "ArrowLeft") btPick(btState, "l"); if (e.key === "ArrowRight") btPick(btState, "r"); if (e.key === "Escape") closeBattle(); });

  // ================= скриншоты =================
  function shotsHTML(it){
    const shots = it.shots || [];
    if (!shots.length && !(canWrite && assets)) return "";
    return `<div class="shots"><div class="shots-h">Скриншоты${shots.length ? ` · ${shots.length}` : ""}</div><div class="shots-row" id="shotsRow">
      ${shots.map((id, i) => `<button class="shot" data-shot="${i}" aria-label="Скриншот ${i + 1}"><img alt="" src="${blobUrl(id)}" loading="lazy"></button>`).join("")}
      ${canWrite && assets ? `<label class="shot add" title="Добавить скриншоты">${ICON.plus}<input type="file" id="shotIn" accept="image/*" multiple hidden></label>` : ""}</div></div>`;
  }
  function wireShots(it){
    const row = $("shotsRow"); if (!row) return;
    row.querySelectorAll("[data-shot]").forEach(b => b.onclick = () => lightbox(it, +b.dataset.shot));
    const add = async files => { files = [...files].filter(f => f.type.startsWith("image/")); if (!files.length) return;
      toast(`Загружаю ${files.length} ${plural(files.length,"скриншот","скриншота","скриншотов")}…`);
      try { const ids = []; for (const f of files) ids.push(await upload(f)); await write(it.id, {shots: [...(it.shots || []), ...ids]}); toast("Скриншоты добавлены"); } catch(e){ toast(upErr(e)); } };
    if ($("shotIn")) $("shotIn").onchange = e => add(e.target.files);
    bindDrop(row, f => add([f]));
  }
  function lightbox(it, i){
    const shots = it.shots || []; if (!shots.length) return;
    let k = i;
    const el = $("lb"); el.hidden = false;
    const draw = () => { el.innerHTML = `<button class="lb-x" id="lbX" aria-label="Закрыть">${ICON.x}</button>
      <img alt="" src="${blobUrl(shots[k])}">
      ${shots.length > 1 ? `<button class="lb-a l" id="lbL" aria-label="Назад">‹</button><button class="lb-a r" id="lbR" aria-label="Вперёд">›</button>` : ""}
      <div class="lb-b"><span>${k + 1} / ${shots.length}</span>${canWrite ? `<button class="ib red" id="lbDel" style="padding:8px 14px;font-size:14px">Удалить</button>` : ""}</div>`;
      $("lbX").onclick = close;
      if ($("lbL")) $("lbL").onclick = () => { k = (k - 1 + shots.length) % shots.length; draw(); };
      if ($("lbR")) $("lbR").onclick = () => { k = (k + 1) % shots.length; draw(); };
      if ($("lbDel")) $("lbDel").onclick = async () => { const rest = shots.filter((_, j) => j !== k); try { await write(it.id, {shots: rest}); close(); toast("Скриншот удалён"); } catch(e){ toast("Не удалилось"); } };
    };
    const key = e => { if (e.key === "Escape") close(); if (e.key === "ArrowLeft" && shots.length > 1){ k = (k - 1 + shots.length) % shots.length; draw(); } if (e.key === "ArrowRight" && shots.length > 1){ k = (k + 1) % shots.length; draw(); } };
    const close = () => { el.hidden = true; el.innerHTML = ""; document.removeEventListener("keydown", key, true); };
    el.onclick = e => { if (e.target === el) close(); };
    document.addEventListener("keydown", key, true);
    draw();
  }

  // ================= обои в карточке =================
  function wallSheet(it){
    let file = null, url = it.wallpaper ? blobUrl(it.wallpaper) : "", blur = it.wallBlur ?? 6, dim = it.wallDim ?? 35;
    const s = openSheet(`<h3>Обои карточки</h3><p class="sub">${esc(it.title)}. Свой фон за страницей, слегка размытый. Ctrl+V, перетаскивание или файл.</p>
      <div class="wp-prev" id="wpPrev"></div>
      <label class="f">Размытие<input type="range" id="wpB" min="0" max="24" step="1" value="${blur}"></label>
      <label class="f">Затемнение<input type="range" id="wpD" min="0" max="80" step="1" value="${dim}"></label>
      <div class="acts"><label class="ib" for="wpF">Файл</label><input type="file" id="wpF" accept="image/*" hidden>${it.wallpaper ? `<button class="ib red" id="wpRm">Убрать</button>` : ""}</div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="wpOk">Сохранить</button><button class="ib" id="wpNo">Отмена</button></div>`, {wide: true});
    const q = id => s.el.querySelector("#" + id);
    const draw = () => { q("wpPrev").innerHTML = url ? `<div class="wp-img" style="background-image:url('${url}');filter:blur(${blur / 3}px) brightness(${1 - dim / 100})"></div><span class="wp-card">карточка</span>` : `<span class="wp-empty">Вставь картинку: Ctrl+V</span>`; };
    const take = f => { file = f; url = URL.createObjectURL(f); draw(); };
    draw();
    pasteTarget = take; bindDrop(q("wpPrev"), take);
    q("wpF").onchange = e => e.target.files[0] && take(e.target.files[0]);
    q("wpB").oninput = e => { blur = +e.target.value; draw(); };
    q("wpD").oninput = e => { dim = +e.target.value; draw(); };
    q("wpNo").onclick = () => s.close();
    if (q("wpRm")) q("wpRm").onclick = async () => { try { await write(it.id, {wallpaper: null}); s.close(); toast("Обои убраны"); } catch(e){ toast("Не сохранилось"); } };
    q("wpOk").onclick = async () => {
      if (!url){ toast("Сначала вставь картинку"); return; }
      try { const patch = {wallBlur: blur, wallDim: dim}; if (file){ toast("Загружаю обои…"); patch.wallpaper = await upload(file); }
        await write(it.id, patch); s.close(); toast("Обои на месте"); } catch(e){ toast(upErr(e)); }
    };
  }

  // ================= конструктор темы =================
  function themeSheet(){
    let t = {...THEME_DEF, ...(theme || {})};
    const FIELDS = [["gBg","Игры: фон"],["gAcc","Игры: акцент"],["kBg","Кино: фон"],["kAcc","Кино: акцент"],["aAcc","Календарь и меню: акцент"]];
    const s = openSheet(`<h3>Тема сайта</h3><p class="sub">Меняется сразу. Сохранится на всех устройствах.</p>
      <div class="th-pre" id="thPre">${THEME_PRESETS.map(([n,p],i) => `<button type="button" data-pi="${i}" title="${n}"><span style="background:linear-gradient(135deg,${p.gBg} 50%,${p.gAcc} 50%)"></span>${n}</button>`).join("")}</div>
      <div class="th-f">${FIELDS.map(([k,l]) => `<label><span>${l}</span><input type="color" id="th_${k}" value="${t[k]}"></label>`).join("")}</div>
      <div class="acts" style="margin-top:16px"><button class="ib blue" id="thOk">Сохранить</button><button class="ib" id="thReset">Сбросить</button><button class="ib" id="thNo">Отмена</button></div>`, {onClose: () => { if (!saved) applyTheme(theme); }});
    let saved = false;
    const q = id => s.el.querySelector("#" + id);
    const sync = () => FIELDS.forEach(([k]) => q("th_" + k).value = t[k]);
    FIELDS.forEach(([k]) => q("th_" + k).oninput = e => { t[k] = e.target.value; applyTheme(t); });
    q("thPre").onclick = e => { const b = e.target.closest("[data-pi]"); if (!b) return; t = {...THEME_PRESETS[+b.dataset.pi][1]}; sync(); applyTheme(t); };
    q("thNo").onclick = () => s.close();
    q("thReset").onclick = async () => { try { await db.doc("meta/theme").delete(); theme = null; saved = true; applyTheme(null); s.close(); toast("Тема сброшена"); } catch(e){ toast("Не сохранилось"); } };
    q("thOk").onclick = async () => { try { await db.doc("meta/theme").set(t); theme = t; saved = true; s.close(); toast("Тема сохранена"); } catch(e){ toast("Не сохранилось"); } };
  }

  function confetti(){
    const cv = $("rlCf") || (() => { const c = document.createElement("canvas"); c.className = "rl-cf"; c.style.zIndex = 98; document.body.appendChild(c); setTimeout(() => c.remove(), 2600); return c; })();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d"), W = cv.width = innerWidth, H = cv.height = innerHeight;
    const cols = ["#ff375f","#ff9f0a","#ffd60a","#30d158","#0a84ff","#bf5af2","#ffffff"];
    const ps = Array.from({length:160}, () => ({x: W/2, y: H*.45, vx: (Math.random()-.5)*16, vy: -Math.random()*15-4, r: Math.random()*6+3, c: cols[Math.floor(Math.random()*cols.length)], a: Math.random()*6, va: (Math.random()-.5)*.4}));
    const t0 = performance.now();
    const f = t => { const e = t - t0; ctx.clearRect(0,0,W,H);
      ps.forEach(p => { p.vy += .42; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - e/2200); ctx.fillStyle = p.c; ctx.fillRect(-p.r/2, -p.r/4, p.r, p.r/2); ctx.restore(); });
      if (e < 2300) requestAnimationFrame(f); else ctx.clearRect(0,0,W,H); };
    requestAnimationFrame(f);
  }

  let tt; function toast(t){ const el = $("toast"); el.textContent = t; el.hidden = true; void el.offsetWidth; el.hidden = false; clearTimeout(tt); tt = setTimeout(() => el.hidden = true, 3200); }

