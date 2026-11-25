  // ================= общий рендер и навигация =================
  function render(){
    const r = ROUTES[route] || ROUTES.games;
    if ($("view").hidden) document.body.dataset.theme = r.theme;
    ["wGames","wKino","wApple","wSlop","wPlaces"].forEach(w => $(w).hidden = w !== r.w);
    document.body.dataset.world = r.w; if (r.w !== "wApple"){ $("aCrumb").textContent = ""; $("aTopActs").innerHTML = ""; }
    if (r.w === "wGames") renderGames();
    else if (r.w === "wKino") renderKino();
    else if (r.w === "wSlop") renderSlop();
    else if (r.w === "wPlaces") renderPlaces();
    else ({soon:renderSoon, calendar:renderCal, events:renderEvents, more:renderMore, vacation:renderVac, recap:renderRecap, drops:renderDrops, money:renderMoney, ach:renderAch, patch:renderPatch, people:renderPeople, user:() => renderProfile(viewUid), event:renderEvent, watch:renderWatch, home:() => renderProfile(null), read:renderRead, watchcal:() => renderWatchCal()})[route]();
    document.body.dataset.route = route;
    fillMeSlots(); applySecBg(); wireCarousels(); wireHScrolls(); document.querySelectorAll('[data-pile="1"]').forEach(wirePile); document.querySelectorAll('[data-stack="1"]').forEach(wireStack); syncHead(); renderFw(); syncBell();
    renderTabbar(); if (typeof workTick === "function") workTick();
    if (tierKind) renderTiers();
  }
  function readHash(){ const h = decodeURIComponent(location.hash.slice(1));
    const fv = h.match(/^fv:([^:]+):(games|games-future|kino|kino-future)$/);
    if (fv){ setFV(fv[1]); route = fv[2]; return; }
    setFV(null);
    if (h.startsWith("user:")){ route = "user"; viewUid = h.slice(5); return; }
    if (h.startsWith("event:")){ route = "event"; viewEv = h.slice(6); return; }
    if (h.startsWith("watch:")){ route = "watch"; viewEv = h.slice(6); return; }
    if (h.startsWith("tier:")){ pendingTl = h.slice(5); route = "people"; return; }
    if (h.startsWith("place:")){ plPending = h.slice(6); route = "places"; return; }
    route = ROUTES[h] && !["user", "event", "watch"].includes(h) ? h : "home"; }
  function animateWorld(){
    const r = ROUTES[route], p = ROUTES[prevRoute] || r;
    const a = TAB_ORDER.indexOf(r.tab), b = TAB_ORDER.indexOf(p.tab);
    const el = $(r.w); el.classList.remove("in-r","in-l","in-f"); void el.offsetWidth;
    el.classList.add(a > b ? "in-r" : a < b ? "in-l" : "in-f");
  }
  window.addEventListener("hashchange", () => { prevRoute = route; if ($("q").value){ $("q").value = ""; $("srPop").hidden = true; } closeView(); closeTiers(); closeRoulette(); closeBattle(); readHash(); render(); animateWorld(); enterAnim(); window.scrollTo(0,0); });
  const go = r => { location.hash = r; };
  const rh = r => FV ? `#fv:${FV}:${r}` : "#" + r;
  function setFV(uid){
    if (uid === FV){ if (uid) items = frItems(uid); return; }
    FV = uid; document.body.classList.toggle("fv", !!uid);
    if (uid){ items = frItems(uid); canWrite = false; if (!FR) loadFriends(); }
    else { items = MYITEMS; canWrite = !!(ME && db); }
  }

  document.addEventListener("click", e => {
    const t = e.target;
    const pick = sel => t.closest && t.closest(sel);
    let el;
    if (pick(".gh a, .gh button") && !$("view").hidden){ closeView(); if (pick(".gh-logo") && location.hash.replace("#", "") === "games"){ e.preventDefault(); } }
    if (FV){
      if (pick("[data-ep1],[data-epp],[data-epm],[data-played],[data-sdrop],[data-csess],[data-cfail],[data-cext],[data-reldate],[data-addsoon],[data-addk],[data-ctopen],[data-battle],[data-roul]")){ e.preventDefault(); return; }
      if ((el = pick("[data-id],[data-fut],[data-soon]")) && !pick(".view") && !pick(".sheet")){ friendItemSheet(FV + "/" + (el.dataset.id || el.dataset.fut || el.dataset.soon)); return; }
    }
    if ((el = pick("[data-src]"))){ gSrc = el.dataset.src; renderGames(); return; }
    if ((el = pick("[data-gf]"))){ gF = el.dataset.gf; renderGames(); return; }
    if ((el = pick("[data-kf]"))){ kF = el.dataset.kf; renderKino(); return; }
    if ((el = pick("[data-kt]"))){ kT = el.dataset.kt; renderKino(); return; }
    if ((el = pick("[data-sof]"))){ soF = el.dataset.sof; renderSoon(); return; }
    if ((el = pick("[data-drf]"))){ drF = el.dataset.drf; renderDrops(); return; }
    if ((el = pick("[data-go]"))){ go(el.dataset.go); return; }
    if ((el = pick("[data-tier]"))){ openTiers(el.dataset.tier); return; }
    if ((el = pick("[data-roul]"))){ openRoulette(el.dataset.roul); return; }
    if ((el = pick("[data-csess]"))){ sessionSheet(items.find(i => i.id === el.dataset.csess)); return; }
    if ((el = pick("[data-cfail]"))){ failContract(items.find(i => i.id === el.dataset.cfail)); return; }
    if ((el = pick("[data-cext]"))){ extendContract(items.find(i => i.id === el.dataset.cext)); return; }
    if ((el = pick("[data-fut]"))){ futureSheet(items.find(i => i.id === el.dataset.fut)); return; }
    if ((el = pick("[data-ep1]")) || (el = pick("[data-epp]"))){ e.preventDefault(); e.stopPropagation(); epStep(items.find(i => i.id === (el.dataset.ep1 || el.dataset.epp)), 1); return; }
    if ((el = pick("[data-epm]"))){ epStep(items.find(i => i.id === el.dataset.epm), -1); return; }
    if ((el = pick("[data-played]"))){ const it = items.find(i => i.id === el.dataset.played); if (it) write(it.id, {lastPlayed: today()}).then(() => toast("Отметил: играл сегодня")).catch(() => toast("Не сохранилось")); return; }
    if ((el = pick("[data-sdrop]"))){ const it = items.find(i => i.id === el.dataset.sdrop); if (it) quickStatus(it, "dropped"); return; }
    if ((el = pick("[data-ctopen]"))){ const it = items.find(i => i.id === el.dataset.ctopen); if (it) contractSheet(it); return; }
    if ((el = pick("[data-battle]"))){ openBattle(el.dataset.battle); return; }
    if ((el = pick("[data-profile]"))){ if (ME) profileSheet(); return; }
    if ((el = pick("[data-backup]"))){ runBackup(el); return; }
    if ((el = pick("[data-addk]"))){ openForm(null, el.dataset.addk); return; }
    if ((el = pick("[data-secbg]"))){ bgSheet(el.dataset.secbg); return; }
    if ((el = pick("[data-user]"))){ go("user:" + el.dataset.user); return; }
    if ((el = pick("[data-fi]"))){ friendItemSheet(el.dataset.fi); return; }
    if ((el = pick("[data-coop]"))){ coopRoulette(el.dataset.coop); return; }
    if ((el = pick("[data-frrefresh]"))){ loadFriends(true); loadWall(true); return; }
    if ((el = pick("[data-theme-open]"))){ canWrite ? themeSheet() : toast("Тему может менять только владелец"); return; }
    if ((el = pick("[data-reldate]"))){ e.preventDefault(); relDateSheet(items.find(i => i.id === el.dataset.reldate)); return; }
    if ((el = pick("[data-soon]"))){ soonSheet(items.find(i => i.id === el.dataset.soon)); return; }
    if ((el = pick("[data-addsoon]"))){ openForm(null, el.dataset.addsoon, {lock: "soon"}); return; }
    if ((el = pick("[data-id]")) && !pick(".view")){ openItem(el.dataset.id); return; }
  });
  const qv = () => ($("q").value || "").trim().toLowerCase();
  $("tierS").onclick = () => openTiers("games");
  $("tierK").onclick = () => openTiers("kino");
  $("tierS").innerHTML = ICON.tiers + "<span>Тир-лист</span>"; $("tierK").innerHTML = ICON.tiers + "<span>Тир-лист</span>";
  $("rlTopS").innerHTML = ICON.dice + "<span>Колесо фортуны</span>"; $("rlTopK").innerHTML = ICON.dice + "<span>Колесо фортуны</span>";
  ["tierS", "tierK"].forEach(x => $(x).title = "Тир-лист"); ["rlTopS", "rlTopK"].forEach(x => $(x).title = "Колесо фортуны");

  // 3.2: свайпа между разделами больше нет — разделы переключаются только нижней панелью

  // ================= листы =================
  const sheets = [];
  function openSheet(inner, {wide = false, onClose} = {}){
    const w = document.createElement("div"); w.className = "sh-wrap";
    w.innerHTML = `<div class="sh-bg"></div><div class="sh${wide ? " wide" : ""}" role="dialog"><div class="sh-top"><button type="button" class="sh-back" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Назад</button><button type="button" class="sh-x" aria-label="Закрыть">${ICON.x}</button></div>${inner}</div>`;
    $("sheetRoot").appendChild(w); requestAnimationFrame(() => w.classList.add("on"));
    document.body.classList.add("sheet-open");
    const prevPaste = pasteTarget;
    const s = {el: w.querySelector(".sh"), close(){
      if (s.closed) return; s.closed = true; w.classList.remove("on"); pasteTarget = prevPaste;
      sheets.splice(sheets.indexOf(s), 1);
      setTimeout(() => { w.remove(); if (!sheets.length) document.body.classList.remove("sheet-open"); }, 300);
      onClose && onClose(); }};
    w.querySelector(".sh-bg").onclick = () => s.close();
    w.querySelector(".sh-back").onclick = w.querySelector(".sh-x").onclick = () => s.close();
    sheets.push(s); return s;
  }
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !$("ce").hidden) return;
    if (sheets.length) return sheets[sheets.length - 1].close();
    if (!$("rl").hidden) return closeRoulette();
    if (!$("view").hidden) return closeView();
    if (tierKind) return closeTiers();
  });

  // ================= вставка картинок =================
  document.addEventListener("paste", e => {
    if (!pasteTarget) return;
    const f = [...(e.clipboardData?.items || [])].find(i => i.kind === "file" && i.type.startsWith("image/"));
    if (f){ e.preventDefault(); pasteTarget(f.getAsFile()); return; }
    if (e.target.closest && e.target.closest("input,textarea")) return;
    toast("В буфере нет картинки: ПКМ по картинке → «Копировать изображение»");
  });
  function bindDrop(el, fn, onUrl){
    el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("drop"); });
    el.addEventListener("dragleave", () => el.classList.remove("drop"));
    el.addEventListener("drop", e => { e.preventDefault(); el.classList.remove("drop");
      const f = [...(e.dataTransfer?.files||[])].find(f => f.type.startsWith("image/")); if (f){ fn(f); return; }
      const dt = e.dataTransfer, html = dt ? dt.getData("text/html") : "", m = html && html.match(/<img[^>]+src=["']([^"']+)/i);
      const u = (m && m[1]) || (dt && (dt.getData("text/uri-list") || dt.getData("text/plain")) || "").split(/\s+/)[0];
      if (onUrl && /^https?:\/\//i.test(u || "")){ urlToFile(u).then(file => file ? fn(file) : onUrl(u)); return; }
      toast("Перетащи файл картинки"); });
  }
  async function urlToFile(u){ try { const r = await fetch(u, {mode: "cors"}); if (!r.ok) return null; const b = await r.blob(); return b.type.startsWith("image/") ? new File([b], "cover", {type: b.type}) : null; } catch(_){ return null; } }
  async function upload(blob){
    const type = ["image/png","image/jpeg","image/webp","image/gif"].includes(blob.type) ? blob.type : "image/png";
    return (await assets.upload(blob, {type})).id;
  }
  const upErr = err => ({too_large:"Картинка больше 20 МБ", unsupported_type:"Нужен PNG, JPG, WebP или GIF", rate_limited:"Слишком часто, подожди"}[err && err.code] || "Не загрузилось");

  function coverEditor({src, pos, title, onSave}){
    let file = null, url = src || "", p = {x:50, y:50, s:1, ...(pos||{})};
    const prevPaste = pasteTarget, ce = $("ce");
    const draw = () => {
      ce.innerHTML = `<div class="ce-box" role="dialog" aria-label="Обложка">
        <div class="poster" id="cePoster">${url ? `<img alt="" src="${url}" id="ceImg" style="${posStyle(p)}">` : `<div class="ph"><b>Нет обложки</b>Скопируй картинку и нажми Ctrl+V<br>или перетащи её сюда</div>`}</div>
        <div><h3>Обложка${title ? ": " + esc(title) : ""}</h3>
          <p>Новая картинка: скопируй в браузере и нажми <b>Ctrl+V</b>, перетащи сюда или выбери файл. Чтобы выровнять, тяни картинку и крути колесо.</p>
          <label class="r">Масштаб <input type="range" id="ceS" min="1" max="3" step="0.01" value="${p.s}" ${url ? "" : "disabled"}></label>
          <label class="r">По горизонтали <input type="range" id="ceX" min="0" max="100" step="0.5" value="${p.x}" ${url ? "" : "disabled"}></label>
          <label class="r">По вертикали <input type="range" id="ceY" min="0" max="100" step="0.5" value="${p.y}" ${url ? "" : "disabled"}></label>
          <div class="acts"><label class="ib" for="ceFile">Файл</label><input type="file" id="ceFile" accept="image/*" hidden>
            <button type="button" class="ib" id="ceReset" ${url ? "" : "disabled"}>Сбросить</button>${src ? `<button type="button" class="ib red" id="ceRm">Убрать</button>` : ""}</div>
          <div class="acts" style="margin-top:16px"><button type="button" class="ib blue" id="ceOk">Готово</button><button type="button" class="ib" id="ceNo">Отмена</button></div></div></div>`;
      const img = $("ceImg"), box = $("cePoster");
      const apply = () => { if (img) img.setAttribute("style", posStyle(p)); $("ceS").value = p.s; $("ceX").value = p.x; $("ceY").value = p.y; };
      $("ceS").oninput = e => { p.s = +e.target.value; apply(); };
      $("ceX").oninput = e => { p.x = +e.target.value; apply(); };
      $("ceY").oninput = e => { p.y = +e.target.value; apply(); };
      $("ceReset").onclick = () => { p = {x:50,y:50,s:1}; apply(); };
      $("ceFile").onchange = e => e.target.files[0] && take(e.target.files[0]);
      if ($("ceRm")) $("ceRm").onclick = () => { close(); onSave({remove:true}); };
      $("ceOk").onclick = () => { close(); onSave({file, pos:p}); };
      $("ceNo").onclick = close;
      box.addEventListener("wheel", e => { if (!img) return; e.preventDefault(); p.s = Math.min(3, Math.max(1, +(p.s - e.deltaY * 0.0015).toFixed(3))); apply(); }, {passive:false});
      let drag = null;
      box.addEventListener("pointerdown", e => { if (!img) return; drag = {x:e.clientX, y:e.clientY, px:p.x, py:p.y, w:box.clientWidth, h:box.clientHeight}; box.setPointerCapture(e.pointerId); });
      box.addEventListener("pointermove", e => { if (!drag) return; const k = Math.max(p.s - .4, .6);
        p.x = Math.min(100, Math.max(0, drag.px - (e.clientX - drag.x) / drag.w * 100 / k));
        p.y = Math.min(100, Math.max(0, drag.py - (e.clientY - drag.y) / drag.h * 100 / k)); apply(); });
      box.addEventListener("pointerup", () => drag = null);
      bindDrop(box, take);
    };
    const take = f => { file = f; url = URL.createObjectURL(f); p = {x:50,y:50,s:1}; draw(); };
    const close = () => { ce.hidden = true; ce.innerHTML = ""; pasteTarget = prevPaste; };
    pasteTarget = take; ce.hidden = false; draw();
  }
  async function saveCoverFor(it, res){
    try {
      if (res.remove){ await write(it.id, {cover:null, coverPos:null}); toast("Обложка убрана"); return; }
      const patch = {coverPos: res.pos};
      if (res.file){ toast("Загружаю обложку…"); patch.cover = await upload(res.file); } else if (!it.cover) return;
      await write(it.id, patch); toast("Обложка сохранена");
    } catch(err){ toast(upErr(err)); }
  }

  // ================= быстрое добавление: на будущее / скоро =================
  function quickAdd(kind, status, it){
    const isNew = !it, g = kind === "games";
    let cover = {file:null, url: it && it.cover ? blobUrl(it.cover) : "", pos: it ? it.coverPos : null, remove:false};
    const posterBox = () => `<div class="poster qa-poster" id="qaP" tabindex="0" role="button" aria-label="Обложка">${cover.url ? `<img alt="" src="${cover.url}" style="${posStyle(cover.pos)}">` : `<div class="ph">Постер<br>Ctrl+V или клик</div>`}</div>`;
    const s = openSheet(`<h3>${isNew ? (status === "soon" ? "Скоро выйдет" : "На будущее") : "Изменить"}</h3>
      <p class="sub">${status === "soon" ? "Название, дата выхода, постер и жанр." : "Только постер и жанр. Остальное заполнишь, когда рулетка выберет."}</p>
      <div class="qa-top"><div id="qaPw">${posterBox()}</div><div>
        <label class="f">Название<input class="in" id="qaT" value="${esc(it ? it.title : "")}" required></label>
        ${status === "soon" || !g ? `<label class="f">Тип<select class="in" id="qaK">${(g ? [["game","Игра"],...Object.entries(KTYPES)] : [...Object.entries(KTYPES),["game","Игра"]]).map(([k,l]) => `<option value="${k}"${it && it.type === k ? " selected" : ""}>${l}</option>`).join("")}</select></label>` : ""}
      </div></div>
      <label class="f">Жанр<input class="in" id="qaG" placeholder="Экшен, выживание" value="${esc(it ? it.genre || "" : "")}"></label>
      ${status === "soon" ? `<label class="f">Дата выхода<input class="in" type="date" id="qaD" value="${esc(it ? it.releaseDate || "" : "")}" required></label>` : ""}
      <div class="acts"><button class="ib blue" id="qaOk">${isNew ? "Добавить" : "Сохранить"}</button><button class="ib" id="qaNo">Отмена</button></div>`);
    const wire = () => { const el = $("qaP");
      const edit = file => coverEditor({src: file ? URL.createObjectURL(file) : cover.url, pos: file ? null : cover.pos, title: $("qaT").value,
        onSave: r => { if (r.remove) cover = {file:null,url:"",pos:null,remove:true}; else { if (r.file || file){ cover.file = r.file || file; cover.url = URL.createObjectURL(cover.file); cover.remove = false; } cover.pos = r.pos; }
          $("qaPw").innerHTML = posterBox(); wire(); }});
      el.onclick = () => assets ? edit(null) : toast("Обложку может менять только владелец");
      bindDrop(el, f => edit(f)); pasteTarget = f => edit(f); };
    wire();
    $("qaNo").onclick = () => s.close();
    $("qaOk").onclick = async () => {
      const title = $("qaT").value.trim(); if (!title){ $("qaT").focus(); return; }
      const rd = status === "soon" ? $("qaD").value : null; if (status === "soon" && !rd){ $("qaD").focus(); return; }
      const body = {title, genre: $("qaG").value.trim() || null, type: $("qaK") ? $("qaK").value : (g ? "game" : "movie"), status, updatedAt: now()};
      if (rd){ body.releaseDate = rd; const ym = rd.match(/^\d{4}/); if (ym) body.year = +ym[0]; }
      try {
        if (cover.remove){ body.cover = null; body.coverPos = null; }
        else { if (cover.file) body.cover = await upload(cover.file); if (cover.url || cover.file) body.coverPos = cover.pos || null; }
        if (isNew){ body.createdAt = body.updatedAt; await db.collection("items").add(body); toast("Добавлено"); }
        else { await db.doc("items/" + it.id).update(body); toast("Сохранено"); }
        s.close();
      } catch(err){ toast(err && (err.code === "too_large" || err.code === "unsupported_type") ? upErr(err) : "Не сохранилось"); }
    };
  }
  function delConfirm(s, it){
    const box = s.el.querySelector(".delbox");
    box.innerHTML = `<div class="confirm" style="margin-top:12px">Удалить «${esc(it.title)}»?<button class="ib red" id="dY">Удалить</button><button class="ib" id="dN">Нет</button></div>`;
    s.el.querySelector("#dN").onclick = () => box.innerHTML = "";
    s.el.querySelector("#dY").onclick = async () => { try { await db.doc("items/" + it.id).delete(); s.close(); toast("Удалено"); } catch(e){ toast("Не удалилось"); } };
  }
  function futureSheet(it){
    if (!it) return; const g = isGame(it);
    const s = openSheet(`<div class="qa-top">${posterHTML(it, {rate:false})}<div><h3>${esc(it.title)}</h3><p class="sub">${esc([g ? "Игра" : KTYPES[it.type], it.genre].filter(Boolean).join(" · "))}<br>На будущее</p></div></div>
      ${canWrite ? `<button class="ib blue full" id="fTake">${g ? "Начать играть" : "Начать смотреть"}</button>
      <div class="acts" style="margin-top:10px"><button class="ib" id="fEd">Изменить</button><button class="ib red" id="fDel">Удалить</button></div><div class="delbox"></div>` : ""}`);
    s.el.querySelector(".qa-top .poster").classList.add("qa-poster");
    if (!canWrite) return;
    s.el.querySelector("#fTake").onclick = () => { s.close(); takeItem(it); };
    s.el.querySelector("#fEd").onclick = () => { s.close(); openForm(it, g ? "games" : "kino", {lock: "future"}); };
    s.el.querySelector("#fDel").onclick = () => delConfirm(s, it);
  }
  function soonSheet(it){
    if (!it) return; const g = isGame(it), d = daysTo(it.releaseDate);
    const s = openSheet(`<div class="qa-top">${posterHTML(it, {rate:false, tgt:false})}<div><h3>${esc(it.title)}</h3>
      <p class="sub">${esc([g ? "Игра" : KTYPES[it.type], it.genre].filter(Boolean).join(" · "))}</p>
      <div style="font-size:44px;font-weight:800;letter-spacing:-.03em;line-height:1">${relCount(it).big}</div>
      <div style="color:#8e8e93;margin-top:4px">${relCount(it).small} · ${relLabel(it)}</div></div></div>
      ${canWrite ? `${isFuture(it) ? `<p class="sub" style="margin:0 0 10px">Лежит в «${g ? "Список желаемого" : "На будущее"}» и остаётся в календаре до выхода.</p>${d <= 0 ? `<button class="ib blue full" id="soTake">${g ? "Начать играть" : "Начать смотреть"}</button>` : ""}` : `<button class="ib blue full" id="soMove">${d <= 0 ? `Вышло, перенести в «${g ? "Список желаемого" : "На будущее"}»` : g ? "Буду играть — в «Список желаемого»" : "Буду смотреть — в «На будущее»"}</button>`}
      <div class="acts" style="margin-top:10px"><button class="ib" id="soEd">Изменить</button><button class="ib red" id="soDel">Удалить</button></div><div class="delbox"></div>` : ""}`);
    s.el.querySelector(".qa-top .poster").classList.add("qa-poster");
    if (!canWrite) return;
    if (s.el.querySelector("#soMove")) s.el.querySelector("#soMove").onclick = async () => { await write(it.id, {status:"future"}); s.close(); const fn = g ? "Список желаемого" : "На будущее"; toast(d > 0 ? `В «${fn}», в календаре тоже остаётся` : `Перенесено в «${fn}»`); };
    if (s.el.querySelector("#soTake")) s.el.querySelector("#soTake").onclick = () => { s.close(); takeItem(it); };
    s.el.querySelector("#soEd").onclick = () => { s.close(); openForm(it, g ? "games" : "kino", {lock: "soon"}); };
    s.el.querySelector("#soDel").onclick = () => delConfirm(s, it);
  }
  function relDateSheet(it){
    if (!it) return;
    const s = openSheet(`<h3>Дата выхода</h3><p class="sub">${esc(it.title)} · сейчас: ${relLabel(it)}</p>${releaseFields(it, "in")}
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="rdOk">Сохранить</button><button class="ib" id="rdNo">Отмена</button></div>`);
    const rel = wireRelease(s.el);
    s.el.querySelector("#rdNo").onclick = () => s.close();
    s.el.querySelector("#rdOk").onclick = async () => { const r = rel.get(); if (!r){ toast("Укажи дату"); return; }
      try { await write(it.id, {...r, year: +r.releaseDate.slice(0,4)}); s.close(); toast(`${it.title}: ${relLabel({...it, ...r})}`); } catch(e){ toast("Не сохранилось"); } };
  }
  async function takeItem(it, via){
    const patch = isGame(it) ? {status: "playing", date: today()} : {status: "playing"};
    if (via) patch.via = via;
    try { await write(it.id, patch); } catch(e){ toast("Не сохранилось"); return; }
    const upd = {...it, ...patch};
    toast(isGame(it) ? "Погнали. Выбери Лицензия или Пиратка и цену" : "Приятного просмотра");
    openForm(upd, isGame(it) ? "games" : "kino");
  }

  // ================= контракты =================
  function contractSheet(it){
    const other = activeContract();
    if (other && other.id !== it.id){ toast(`Сначала закрой контракт по «${other.title}»`); return; }
    const s = openSheet(`<h3><span style="display:inline-flex;width:22px;height:22px;vertical-align:-4px;margin-right:6px">${ICON.target}</span>Контракт</h3>
      <p class="sub">${esc(it.title)}. Пока контракт активен, это твоя единственная игра.</p>
      <label class="f">Сколько часов<input class="in" type="number" id="cG" min="1" step="0.5" value="10"></label>
      <div class="f">Срок<div class="chips ct-terms" id="cTerm">${[[3,"3 дня"],[7,"Неделя"],[14,"2 недели"],[30,"Месяц"],[0,"Своя дата"]].map(([n, l]) => `<button type="button" data-n="${n}">${l}</button>`).join("")}</div></div>
      <label class="f" id="cDw" hidden>До какого числа<input class="in" type="date" id="cD" value=""></label>
      <p class="sub" id="cDl" style="margin:2px 0 10px">Выбери срок, за который обещаешь наиграть эти часы.</p>
      <div class="acts"><button class="ib blue" id="cOk" disabled>Подписать</button><button class="ib" id="cNo">Отмена</button></div>`);
    const cD = s.el.querySelector("#cD"), cDl = s.el.querySelector("#cDl"), cOk = s.el.querySelector("#cOk");
    const cSync = () => { const v = cD.value, ok = !!v && daysTo(v) >= 0; cOk.disabled = !ok; const g = +s.el.querySelector("#cG").value || 0, d = ok ? Math.max(1, daysTo(v)) : 0;
      cDl.innerHTML = ok ? `До <b style="color:inherit">${fmtDate(v)}</b> · ${d} ${plural(d, "день", "дня", "дней")}${g ? ` · примерно ${num1(g / d)} ч в день` : ""}` : "Выбери срок, за который обещаешь наиграть эти часы."; };
    s.el.querySelectorAll("#cTerm button").forEach(b => b.onclick = () => { s.el.querySelectorAll("#cTerm button").forEach(x => x.setAttribute("aria-pressed", x === b));
      const n = +b.dataset.n; s.el.querySelector("#cDw").hidden = n !== 0; if (n) cD.value = addDays(today(), n); else { if (!cD.value) cD.value = addDays(today(), 10); } cSync(); });
    cD.addEventListener("change", cSync); cD.addEventListener("input", cSync); s.el.querySelector("#cG").addEventListener("input", cSync);
    s.el.querySelector("#cNo").onclick = () => s.close();
    s.el.querySelector("#cOk").onclick = async () => {
      const goal = +s.el.querySelector("#cG").value, deadline = s.el.querySelector("#cD").value;
      if (!(goal > 0) || !deadline || daysTo(deadline) < 0){ toast("Укажи часы и дату в будущем"); return; }
      try { await write(it.id, {status: "playing", contract: {goal, start: today(), deadline, sessions: [], state: "active"}}); s.close(); toast("Контракт подписан. Назад дороги нет"); }
      catch(e){ toast("Не сохранилось"); }
    };
  }
  function sessionSheet(it){
    if (!it || !hasActive(it)) return;
    const s = openSheet(`<h3>Сессия</h3><p class="sub">${esc(it.title)} · ${num1(cHours(it.contract))} из ${num1(it.contract.goal)} ч</p>
      <div class="row2"><label class="f">Часов<input class="in" type="number" id="sH" min="0.25" step="0.25" value="1"></label>
        <label class="f">Когда<input class="in" type="date" id="sD" value="${today()}"></label></div>
      <label class="f">Что было<input class="in" id="sT" placeholder="Убил второго босса"></label>
      <div class="acts"><button class="ib blue" id="sOk">Записать</button><button class="ib" id="sNo">Отмена</button></div>`);
    s.el.querySelector("#sNo").onclick = () => s.close();
    s.el.querySelector("#sOk").onclick = async () => {
      const h = +s.el.querySelector("#sH").value; if (!(h > 0)){ toast("Сколько часов?"); return; }
      const c = JSON.parse(JSON.stringify(it.contract));
      c.sessions = [...(c.sessions || []), {d: s.el.querySelector("#sD").value || today(), h, t: s.el.querySelector("#sT").value.trim() || null}];
      const done = cHours(c) >= c.goal;
      if (done){ c.state = "done"; c.closedAt = today(); }
      try { await write(it.id, {contract: c, lastPlayed: today()}); s.close(); if (done){ toast("Контракт выполнен. Красавчик"); confetti(); } else toast(`+${num1(h)} ч`); }
      catch(e){ toast("Не сохранилось"); }
    };
  }
  function failContract(it){
    if (!it) return;
    const s = openSheet(`<h3>Сорвать контракт?</h3><p class="sub">«${esc(it.title)}» уйдёт в дроп и на стену позора.</p>
      <label class="f">Причина<input class="in" id="fR" placeholder="Надоел гринд" value="${esc(it.dropReason || "")}"></label>
      <div class="acts"><button class="ib red" id="fOk">Сдаюсь</button><button class="ib" id="fNo">Ещё поборюсь</button></div>`);
    s.el.querySelector("#fNo").onclick = () => s.close();
    s.el.querySelector("#fOk").onclick = async () => {
      const c = {...it.contract, state: "failed", closedAt: today()};
      const reason = s.el.querySelector("#fR").value.trim() || `Сорвал контракт: ${num1(cHours(c))} из ${num1(c.goal)} ч`;
      try { await write(it.id, {contract: c, status: "dropped", dropReason: reason, finishedAt: today()}); s.close(); toast("Контракт сорван"); } catch(e){ toast("Не сохранилось"); }
    };
  }
  async function extendContract(it){
    if (!it) return;
    const base = daysTo(it.contract.deadline) < 0 ? today() : it.contract.deadline;
    try { await write(it.id, {contract: {...it.contract, deadline: addDays(base, 3)}}); toast("Ещё 3 дня. Последний шанс"); } catch(e){ toast("Не сохранилось"); }
  }

