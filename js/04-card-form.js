  // ================= карточка =================
  function closeView(){
    FULL_ID = null;
    fxSeen = null;
    $("view").hidden = true; $("view").innerHTML = ""; $("viewBg").hidden = true; $("viewBg").innerHTML = ""; openId = null; pasteTarget = null;
    document.body.classList.remove("view-open");
    document.body.dataset.theme = (ROUTES[route] || ROUTES.games).theme;
  }
  function useWorld(it){ viewTheme = isGame(it) ? "games" : "kino"; document.body.dataset.theme = viewTheme; }
  function showView(html, it){
    const bg = it && it.wallpaper ? `<div class="bgimg wall" style="background-image:url('${blobUrl(it.wallpaper)}');filter:blur(${it.wallBlur ?? 6}px) brightness(${1 - (it.wallDim ?? 35) / 100})"></div>`
      : it && it.cover ? `<div class="bgimg" style="background-image:url('${blobUrl(it.cover)}')"></div>` : "";
    const cls = viewTheme === "games" ? "s-close" : "k-close";
    $("viewBg").innerHTML = `${bg}<div class="shade"></div>`;
    $("view").innerHTML = `<button class="${cls}" id="closeBtnX" aria-label="Закрыть">${ICON.x}</button><button class="v-back" id="closeBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Назад</button><div class="${viewTheme === "games" ? "s-view" : "k-view"}">${html}</div>`;
    ["view", "viewBg"].forEach(k => { $(k).classList.toggle("nocover", !(it && (it.cover || it.wallpaper))); $(k).classList.toggle("haswall", !!(it && it.wallpaper)); $(k).hidden = false; });
    document.body.classList.add("view-open");
    $("closeBtn").onclick = closeView;
  }
  function wirePoster(it){
    const el = $("heroPoster"); if (!el || !canWrite || !assets) return;
    const open = () => coverEditor({src: it.cover ? blobUrl(it.cover) : "", pos: it.coverPos, title: it.title, onSave: r => saveCoverFor(it, r)});
    el.onclick = open; el.onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); } };
    const withFile = f => coverEditor({src: URL.createObjectURL(f), pos: null, title: it.title, onSave: r => saveCoverFor(it, {...r, file: r.file || f})});
    bindDrop(el, withFile); pasteTarget = withFile;
  }
  function openItem(id){
    const it = items.find(i => i.id === id); if (!it) return;
    if (FULL_ID !== id){ if (relOn(it)) return soonSheet(it); if (isFuture(it)) return futureSheet(it); }
    const keep = openId === id ? $("view").scrollTop : 0;
    openId = id; useWorld(it);
    isGame(it) ? openGame(it) : openKino(it);
    pfViewExtras(it);
    $("view").scrollTop = keep;
  }
  async function quickRate(it, v){
    if ((it.rating ?? null) === v) return;
    try { await write(it.id, {rating: v}); toast(v == null ? "Оценка убрана" : `Оценка: ${num1(v)}`); } catch(e){ toast("Не сохранилось"); }
  }
  // быстрая смена статуса прямо со страницы
  async function quickStatus(it, st){
    const g = isGame(it);
    if (g ? gStatus(it.status) === st : it.status === st) return;
    const patch = {status: st};
    if (g){
      patch.finishedAt = (st === "done" || st === "dropped" || st === "youtube") ? today() : null;
      if (hasActive(it) && st === "dropped"){ failContract(it); return; }
      if (hasActive(it) && st === "done") patch.contract = {...it.contract, state: "done", closedAt: today()};
    }
    const watched = x => x === "done" || x === "played";
    if (!g && isSerT(it.type) && st === "done"){ if (+it.epTotal && (+it.epWatched || 0) < +it.epTotal) patch.epWatched = +it.epTotal; patch.now = null; }
    if (g){ if (!it.date) patch.date = today(); }
    else patch.date = watched(st) ? (watched(it.status) && it.date ? it.date : today()) : null;
    if (st === "dropped"){ dropSheet(it, patch); return; }
    try { await write(it.id, patch); toast(g ? GSTATUS[st] : kLab({...it, status: st}).l); if (g && st === "done") confetti(); } catch(e){ toast("Не сохранилось"); }
  }
  function dropSheet(it, patch){
    const s = openSheet(`<h3>${isGame(it) ? "Дроп" : "Бросил"}</h3><p class="sub">${esc(it.title)}. Пара слов почему, для стены дропов.</p>
      <label class="f">Причина<input class="in" id="drR" placeholder="${isGame(it) ? "Надоел гринд" : "Скучно на второй серии"}" value="${esc(it.dropReason || "")}"></label>
      <div class="acts"><button class="ib red" id="drOk">Дропнуть</button><button class="ib" id="drNo">Отмена</button></div>`);
    s.el.querySelector("#drNo").onclick = () => s.close();
    s.el.querySelector("#drOk").onclick = async () => {
      try { await write(it.id, {...patch, dropReason: s.el.querySelector("#drR").value.trim() || null}); s.close(); toast("В дроп"); } catch(e){ toast("Не сохранилось"); }
    };
  }

  function openGame(it){
    const s = gStatus(it.status), gs = genres(it), src = srcOf(it), c = it.contract, price = priceText(it), t = timerInfo(it);
    const facts = [it.noDate ? ["Когда", "давно, без даты"] : itemDate(it) ? ["Начал играть", fmtDate(itemDate(it))] : null, it.finishedAt && s !== "playing" ? [s === "done" ? "Прошёл" : "Дропнул", fmtDate(it.finishedAt)] : null,
      src ? ["Источник", SRC_NAME[src]] : null, it.release ? ["Дата выхода", it.release] : (it.year ? ["Год выхода", it.year] : null), price ? ["Цена", price] : null, gs.length ? ["Жанр", gs.join(", ")] : null].filter(Boolean);
    let cbox = "";
    if (c){ const h = cHours(c), left = daysTo(c.deadline), pct = Math.min(100, h / c.goal * 100);
      const title = c.state === "done" ? "Контракт выполнен" : c.state === "failed" ? "Контракт сорван" : left < 0 ? "Контракт просрочен" : "Активный контракт";
      cbox = `<div class="s-cbox ${c.state === "done" ? "done" : c.state === "failed" ? "failed" : ""}"><div class="k">${ICON.target}${title}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:8px;font-size:14px;color:var(--s-dim)"><span><b style="color:#fff">${num1(h)}</b> из ${num1(c.goal)} ч</span><span>с ${fmtDate(c.start)} до ${fmtDate(c.deadline)}</span></div>
        ${(c.sessions || []).length ? `<ul class="sess">${c.sessions.slice(-6).reverse().map(x => `<li><b>${num1(x.h)} ч</b><span>${parseD(x.d).toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</span><span>${esc(x.t || "")}</span></li>`).join("")}</ul>` : ""}
        ${canWrite && c.state === "active" ? `<div class="s-acts" style="margin-top:12px">${left < 0 ? `<button class="s-btn red" data-cfail="${esc(it.id)}">Засчитать провал</button><button class="s-btn dark" data-cext="${esc(it.id)}">+3 дня</button>` : `<button class="s-btn" data-csess="${esc(it.id)}">+ Сессия</button><button class="s-btn red" data-cfail="${esc(it.id)}">Сдаться</button>`}</div>` : ""}</div>`; }
    const tbox = t ? `<div class="s-timer ${t.running ? "run" : t.status}"><div class="n">${t.days}</div><div><div class="lb">Таймер</div><div class="tx">${t.running ? `<span class="pulse"></span>${plural(t.days,"день","дня","дней")} в процессе` : t.status === "done" ? `Прошёл за ${t.days} ${plural(t.days,"день","дня","дней")}` : `Дропнул через ${t.days} ${plural(t.days,"день","дня","дней")}`}</div></div></div>` : "";
    const lbl = `${src ? `<span>${SRC_ICON[src]}${SRC_NAME[src]}</span>` : ""}${hasActive(it) ? `<span style="color:#ff6961">${ICON.target}Контракт</span>` : ""}<span>${GSTATUS[s]}</span>`;
    showView(`
      <div class="s-crumb"><a id="crumb">Все игры</a> &gt; ${esc(it.title)}</div>
      <div class="s-trow"><h2 class="s-title">${esc(it.title)}</h2>${"" ? `<button class="pen" aria-label="Изменить" title="Изменить">${ICON.edit}</button>` : ""}${"" ? `<button class="pen" aria-label="Обои карточки" title="Обои карточки">${ICON.wall}</button>` : ""}</div>
      <div class="s-store">
        <div>
          ${it.cover ? `<div class="s-banner"><img class="blur" alt="" src="${blobUrl(it.cover)}"><img class="front" alt="" src="${blobUrl(it.cover)}"><div class="lbl">${lbl}</div></div>`
            : `<div class="s-banner empty">${esc(it.title)}<div class="lbl">${lbl}</div></div>`}
          <h3 class="s-desc-h">Об этой игре</h3>
          <div class="s-desc">${it.desc ? esc(it.desc) : `<span style="color:var(--s-faint)">Описания нет. Нажми на карандаш и вставь его со страницы игры в Steam.</span>`}</div>
          <div class="s-blocks">
            ${staleBox(it)}${cbox}${tbox}
            ${canWrite ? `<div class="s-rate"><div class="lb">Моя оценка · тяни, сохранится само</div>${wheelHTML("vRate", it.rating)}</div>` : typeof it.rating === "number" ? `<div class="s-meter"><div class="n ${rateCls(it.rating)}">${num1(it.rating)}<small>/10</small></div>
              <div><div class="lb">Моя оценка</div><div class="segs ${rateCls(it.rating)}">${Array.from({length:10},(_,i) => `<i class="${i < Math.round(it.rating) ? "on" : ""}"></i>`).join("")}</div><div class="rv">${review(it.rating)}</div></div></div>` : ""}
            <div><h3 class="s-desc-h">Мои заметки</h3><div class="s-desc">${it.note ? esc(it.note) : `<span style="color:var(--s-faint)">Пусто.</span>`}</div></div>
            ${shotsHTML(it)}
          </div>
        </div>
        <div class="s-side">
          ${posterHTML(it, {id:"heroPoster", editable: canWrite && !!assets, tgt:false, rate:false, eager:true})}
          ${canWrite ? `<div class="pv-acts"><button class="pv-btn" id="editBtn">${ICON.edit}Редактировать</button>${assets ? `<button class="pv-btn" id="wallBtn">${ICON.wall}Фон страницы</button>` : ""}${ME ? `<button class="pv-btn sg-pv" id="sugBtn">${ICON.send}Предложить другу</button>` : ""}</div>` : ""}
          <dl class="s-facts">${facts.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
          ${gs.length ? `<div class="s-tags">${gs.map(g => `<span>${esc(g)}</span>`).join("")}</div>` : ""}
          ${canWrite && (s === "playing" || s === "endless") && (!c || c.state !== "active") ? `<div class="s-acts" style="margin-top:16px"><button class="s-btn red" id="ctBtn">${ICON.target}Заключить контракт</button></div>` : ""}
          ${canWrite && (s === "playing" || s === "endless") ? `<div class="s-acts" style="margin-top:8px"><button class="s-btn dark" data-played="${esc(it.id)}">${ICON.clock}Играл сегодня</button></div>` : ""}
        </div>
      </div>
      <div class="s-buy"><h3>${esc(it.title)}</h3>
        ${canWrite ? `<div class="chips" id="stChips" style="margin-top:12px">${Object.entries(GSTATUS).map(([k,l]) => `<button type="button" class="${k}" data-st="${k}" aria-pressed="${k===s}">${l}</button>`).join("")}</div>` : ""}
        ${s === "dropped" && it.dropReason ? `<div class="why"><b>Причина дропа</b>${esc(it.dropReason)}</div>` : ""}
        ${price || src === "pirate" ? `<div class="s-pricebox">${price ? `<span class="p${src === "pirate" ? " strike" : ""}">${esc(price)}</span>` : ""}${src === "pirate" ? `<span class="st dropped" style="background:#d6a24a;color:#1a1208">0 ₽</span>` : `<span class="st ${s}">${GSTATUS[s]}</span>`}</div>` : ""}</div>`, it);
    $("crumb").onclick = closeView;
    if (!canWrite) return;
    if ($("editBtn")) $("editBtn").onclick = () => openForm(it, "games");
    if ($("sugBtn")) $("sugBtn").onclick = () => suggestItem(it);
    $("stChips").onclick = e => { const b = e.target.closest("[data-st]"); if (b) quickStatus(it, b.dataset.st); };
    wireWheel("vRate", v => quickRate(it, v));
    if ($("ctBtn")) $("ctBtn").onclick = () => contractSheet(it);
    wirePoster(it); wireShots(it);
    if ($("wallBtn")) $("wallBtn").onclick = () => wallSheet(it);
  }

  function openKino(it){
    const st = kLab(it), gs = genres(it), cast = (it.cast || "").split(",").map(s => s.trim()).filter(Boolean);
    const meta = [it.year, KTYPES[it.type], gs.slice(0,3).join(", "), it.duration].filter(Boolean);
    const facts = [["Год", it.year], ["Страна", it.country], ["Режиссёр", it.director], ["Сценарий", it.writer], ["Длительность", it.duration],
      ["Премьера в мире", it.premiereWorld], ["Премьера в России", it.premiereRu], ["Бюджет", it.budget], ["Сборы в мире", it.boxWorld],
      ["Моя оценка", typeof it.rating === "number" ? `${num1(it.rating)} / 10` : null], ["Тип", KTYPES[it.type]], [kinoDateLabel(it), it.noDate && ["done","played"].includes(it.status) ? "давно, без даты" : fmtDate(itemDate(it))]].filter(f => f[1]);
    showView(`
      <div class="k-hero">
        <div class="k-hcol"><div class="pwrap">${posterHTML(it, {id:"heroPoster", editable: canWrite && !!assets, rate:false, eager:true})}<div class="gfx" id="gfx"></div></div>
          ${canWrite ? `<div class="pv-acts"><button class="pv-btn" id="editBtn">${ICON.edit}Редактировать</button>${assets ? `<button class="pv-btn" id="wallBtn">${ICON.wall}Фон страницы</button>` : ""}${ME ? `<button class="pv-btn sg-pv" id="sugBtn">${ICON.send}Предложить другу</button>` : ""}</div>` : ""}</div>
        <div class="k-glass" style="position:relative">
          <h2 class="k-title">${esc(it.title)}</h2>
          ${it.originalTitle || it.age ? `<div class="k-orig">${it.originalTitle ? `<span>${esc(it.originalTitle)}</span>` : ""}${it.age ? `<span class="k-age">${esc(it.age)}</span>` : ""}</div>` : ""}
          ${typeof it.rating === "number" || it.kpRating ? `<div class="k-score">${typeof it.rating === "number" ? `<span class="lg ${rateCls(it.rating)}">${esc(nickShort())}</span><span class="v">${num1(it.rating)}<small>/10</small></span>` : ""}
            ${it.kpRating ? `<span class="k-kp"><span class="lg">КП</span><span class="v" style="font-size:24px">${num1(it.kpRating)}</span></span>` : ""}</div>` : ""}
          <div class="k-meta">${meta.map((m,i) => (i ? "<i></i>" : "") + `<span>${esc(m)}</span>`).join("")}</div>
          ${canWrite ? `<div class="k-rate"><div class="lb">Моя оценка</div>${wheelHTML("vRate", it.rating)}</div>` : ""}
          ${isSeries(it) ? epBlock(it) : ""}
          ${canWrite ? `<div class="k-sts" id="stChips">${kOpts(it.type).map(([k,l]) => `<button type="button" data-st="${k}" style="--c:${KCOL[k]}" aria-pressed="${k===kNorm(it)}">${l}</button>`).join("")}</div>`
            : `<span class="k-status" style="background:${st.c}">${esc(st.l)}</span>`}
        </div>
      </div>
      <div class="k-lower k-glass">
        <div>
          ${it.status === "dropped" && it.dropReason ? `<div class="k-why"><b>Почему бросил</b>${esc(it.dropReason)}</div>` : ""}
          ${it.short ? `<p class="k-lead">${esc(it.short)}</p>` : ""}
          ${it.desc ? `<h3>Описание</h3><p>${esc(it.desc)}</p>` : ""}
          ${it.tagline ? `<p class="k-tagline">${esc(it.tagline)}</p>` : ""}
          ${cast.length ? `<h3>В главных ролях</h3><div class="k-cast">${cast.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : ""}
          <h3>Заметка</h3><p>${it.note ? esc(it.note) : `<span style="color:var(--k-faint)">Пусто.</span>`}</p>
          ${shotsHTML(it)}
          ${gs.length ? `<h3>Жанры</h3><div class="k-tags">${gs.map(x => `<span>${esc(x)}</span>`).join("")}</div>` : ""}
        </div>
        <dl class="k-facts">${facts.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      </div>`, it);
    playFx(it);
    if (!canWrite) return;
    if ($("editBtn")) $("editBtn").onclick = () => openForm(it, "kino");
    if ($("sugBtn")) $("sugBtn").onclick = () => suggestItem(it);
    $("stChips").onclick = e => { const b = e.target.closest("[data-st]"); if (b) quickStatus(it, b.dataset.st); };
    wireWheel("vRate", v => quickRate(it, v));
    wirePoster(it); wireShots(it);
    if ($("wallBtn")) $("wallBtn").onclick = () => wallSheet(it);
  }

  // ================= разбор текста Кинопоиска =================
  function parseKP(txt){
    const lines = txt.split(/\r?\n/).map(l => l.replace(/[ \t ]+/g, " ").trim()).filter(Boolean), out = {};
    const LBL = {"год производства":"year","страна":"country","жанр":"genre","слоган":"tagline","режиссер":"director","режиссёр":"director","сценарий":"writer","продюсер":"producer",
      "оператор":"operator","композитор":"composer","бюджет":"budget","сборы в мире":"boxWorld","премьера в мире":"premiereWorld","премьера в россии":"premiereRu","время":"duration","возраст":"age"};
    const KEYS = Object.keys(LBL).sort((a,b) => b.length - a.length);
    const IGN = ["художник","монтаж","сборы в сша","сборы в россии","цифровой релиз","рейтинг mpaa","о фильме","о сериале","в главных ролях","роли дублировали","сиквелы","трейлер","добавить в папку","буду смотреть","оценить","рейтинг фильма","в списках","обзор","нашли ошибку","добавить инфо"];
    const labelOf = l => { const low = l.toLowerCase(); for (const k of KEYS) if (low === k || low.startsWith(k + " ") || low.startsWith(k + ":")) return [k, l.slice(k.length).replace(/^[:\s]+/, "")]; return null; };
    const isIgn = l => { const low = l.toLowerCase(); return IGN.some(k => low.startsWith(k)); };
    const clean = (v, key) => {
      v = v.replace(/,?\s*(\.\.\.|…)\s*$/, "").replace(/\s+слова$/i, "").replace(/\s+сборы$/i, "").trim();
      if (key === "boxWorld" && v.includes("=")) v = v.split("=").pop().trim();
      if (key === "premiereWorld" || key === "premiereRu") v = v.split(/,\s*[«"]/)[0].replace(/,\s*$/, "").trim();
      if (key === "year"){ const m = v.match(/\d{4}/); v = m ? +m[0] : null; }
      if (key === "tagline") v = v.replace(/^[«"]|[»"]$/g, "");
      return v;
    };
    let firstLabel = lines.length;
    lines.forEach((l, i) => { const m = labelOf(l); if (!m) return; firstLabel = Math.min(firstLabel, i);
      let v = m[1]; if (!v && lines[i+1] && !labelOf(lines[i+1]) && !isIgn(lines[i+1])) v = lines[i+1];
      if (v && out[LBL[m[0]]] == null){ const c = clean(v, LBL[m[0]]); if (c) out[LBL[m[0]]] = c; } });
    const head = lines.slice(0, Math.min(firstLabel, 12)).filter(l => !isIgn(l));
    if (head[0]){ const m = head[0].match(/^(.+?)\s*\((\d{4})(?:\s*[–-]\s*(?:\d{4}|\.\.\.))?\)\s*$/); out.title = m ? m[1] : head[0]; if (m && !out.year) out.year = +m[2]; }
    if (head[1]){ const am = head[1].match(/^(.*?)\s*(\d{1,2}\+)\s*$/), name = am ? am[1] : head[1];
      if (am && !out.age) out.age = am[2];
      if (/[A-Za-z]/.test(name) && name.length < 80 && !/\d[.,]\d/.test(name)) out.originalTitle = name; }
    if (!out.age){ const a = lines.find(l => /^\d{1,2}\+$/.test(l)); if (a) out.age = a; }
    const kp = lines.find(l => /^\d[.,]\d{1,2}$/.test(l)); if (kp) out.kpRating = parseFloat(kp.replace(",", "."));
    const sh = head.slice(1).find(l => l.length >= 40 && l.length <= 300 && l !== out.originalTitle); if (sh) out.short = sh;
    const ds = lines.filter(l => l.length > 150 && !labelOf(l)).sort((a,b) => b.length - a.length)[0]; if (ds && ds !== out.short) out.desc = ds;
    const sm = txt.match(/(\d+)\s+сезон/i); if (sm) out.seasons = +sm[1];
    const em = txt.match(/(\d+)\s+(?:сери[йияю]|эпизод)/i); if (em) out.epTotal = +em[1];
    const ci = lines.findIndex(l => /^в главных ролях/i.test(l));
    if (ci >= 0){ const cast = [];
      for (let i = ci + 1; i < lines.length && cast.length < 14; i++){ const l = lines[i]; if (/^\d+\s*актер/i.test(l) || isIgn(l) || labelOf(l)) break; cast.push(l); }
      if (cast.length) out.cast = cast.join(", "); }
    Object.keys(out).forEach(k => { if (out[k] == null || out[k] === "") delete out[k]; });
    return out;
  }

  // ================= разбор текста Steam =================
  function parseSteam(txt){
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean), out = {};
    const after = re => { for (let i = 0; i < lines.length; i++){ const m = lines[i].match(re); if (m){ const v = (m[1] || "").trim(); return v || (lines[i+1] || "").trim(); } } return ""; };
    out.title = after(/^(?:название|title)\s*:\s*(.*)$/i);
    if (!out.title){ const crumb = lines.find(l => /^(все игры|all games)\s*>/i.test(l)); if (crumb) out.title = crumb.split(">").pop().trim(); }
    out.genre = after(/^(?:жанры?|genres?)\s*:?\s*(.*)$/i) || after(/^(?:метки|популярные метки|теги|tags)\s*:?\s*(.*)$/i);
    if (out.genre) out.genre = normGenres(out.genre, true);
    out.release = after(/^(?:дата выхода|release date)\s*:?\s*(.*)$/i);
    if (/(бесплатно|free to play)/i.test(txt)) out.free = true;
    const rub = txt.match(/(\d[\d\s\u00a0]*)(?:[.,]\d{2})?\s*(?:руб\.?|₽)/i), kzt = txt.match(/(\d[\d\s\u00a0]*)(?:[.,]\d{2})?\s*(?:₸|тг|тенге)/i);
    if (rub) out.rub = +rub[1].replace(/\D/g, ""); else if (kzt) out.kzt = +kzt[1].replace(/\D/g, "");
    const label = /^(название|жанр|разработчик|издатель|франшиза|дата выхода|все игры|title|genre|developer|publisher|franchise|release|all games)/i;
    const desc = lines.filter(l => l.length > 60 && !label.test(l)).sort((a,b) => b.length - a.length)[0];
    if (desc) out.desc = desc;
    Object.keys(out).forEach(k => { if (!out[k]) delete out[k]; });
    return out;
  }

  // ================= полная форма =================
  const GAME_GENRES = ["РПГ","Экшен","Шутер","Рогалик","Сессионка","Френдслоп","Хоррор","Выживание","Открытый мир","Приключение","Soulslike","Метроидвания","Платформер","Стелс",
    "Интерактивное кино","Визуальная новелла","Градостроительный симулятор","Стратегия","Тактика","Симулятор","Песочница","Иммерсив-сим","Экстракшен-шутер","Королевская битва","MOBA",
    "Файтинг","Гонки","Спорт","Головоломка","Карточная","Кооп","Hack and slash","Point-and-click","Инди"];
  function releaseFields(it, cls){
    const p = relPrec(it), v = it.releaseDate || "", y = v ? v.slice(0,4) : String(new Date().getFullYear() + 1), q = v ? relQ(parseD(v)) : 1;
    const opt = [["year","Год"],["quarter","Квартал"],["month","Месяц"],["day","Дата"]];
    return `<label>Дата выхода<div class="rel-prec"><div class="seg" id="relPrec">${opt.map(([k,l]) => `<button type="button" data-p="${k}" aria-pressed="${k===p}">${l}</button>`).join("")}</div>
      <div class="rel-in">
        <input class="${cls}" id="f_relY" type="number" min="2000" max="2100" value="${esc(y)}" ${p === "year" || p === "quarter" ? "" : "hidden"} aria-label="Год">
        <select class="${cls}" id="f_relQ" ${p === "quarter" ? "" : "hidden"} aria-label="Квартал">${[1,2,3,4].map(n => `<option value="${n}"${n===q?" selected":""}>Q${n}</option>`).join("")}</select>
        <input class="${cls}" id="f_relM" type="month" value="${p === "month" ? esc(v.slice(0,7)) : ""}" ${p === "month" ? "" : "hidden"} aria-label="Месяц">
        <input class="${cls}" id="f_relD" type="date" value="${p === "day" ? esc(v) : ""}" ${p === "day" ? "" : "hidden"} aria-label="Дата">
      </div>
      <span class="rate-note">Знаешь только год, квартал или месяц — выбери это. Дата подтянется из вставленного текста.</span></div></label>`;
  }
  function wireRelease(root = document){
    const q = sel => root.querySelector(sel);
    let prec = q("#relPrec").querySelector('[aria-pressed="true"]').dataset.p;
    const set = p => { prec = p; q("#relPrec").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.p === p));
      q("#f_relY").hidden = !(p === "year" || p === "quarter"); q("#f_relQ").hidden = p !== "quarter"; q("#f_relM").hidden = p !== "month"; q("#f_relD").hidden = p !== "day"; };
    const cur = () => { const g = api.get(); return g ? g.releaseDate : null; };
    q("#relPrec").onclick = e => { const b = e.target.closest("[data-p]"); if (!b) return;
      const d = cur(); if (d){ q("#f_relY").value = d.slice(0,4); q("#f_relQ").value = relQ(parseD(d)); q("#f_relM").value = d.slice(0,7); if (!q("#f_relD").value) q("#f_relD").value = d; }
      set(b.dataset.p); };
    const api = {
      fill(r){ if (!r) return false; q("#f_relY").value = r.d.slice(0,4); q("#f_relQ").value = relQ(parseD(r.d)); q("#f_relM").value = r.d.slice(0,7); if (r.prec === "day") q("#f_relD").value = r.d; set(r.prec); return true; },
      get(){
        if (prec === "day") return q("#f_relD").value ? {releaseDate: q("#f_relD").value, releasePrec: "day"} : null;
        if (prec === "month") return q("#f_relM").value ? {releaseDate: q("#f_relM").value + "-01", releasePrec: "month"} : null;
        const y = +q("#f_relY").value; if (!(y > 1900)) return null;
        if (prec === "quarter") return {releaseDate: `${y}-${pad((+q("#f_relQ").value - 1) * 3 + 1)}-01`, releasePrec: "quarter"};
        return {releaseDate: `${y}-01-01`, releasePrec: "year"};
      }
    };
    return api;
  }
  const GENRE_MAP = [[/^(ролев|rpg|рпг|jrpg|crpg)/i,"РПГ"],[/^(экшен|action)/i,"Экшен"],[/^(шутер|shooter|fps)/i,"Шутер"],[/^(рогалик|roguelike|roguelite|rogue)/i,"Рогалик"],
    [/^(хоррор|horror|ужас)/i,"Хоррор"],[/^(выживан|survival)/i,"Выживание"],[/^(открыт|open world)/i,"Открытый мир"],[/^(приключ|adventure)/i,"Приключение"],[/^(стратег|strategy|rts)/i,"Стратегия"],
    [/^(тактич|tactic)/i,"Тактика"],[/^(симулятор|симуляц|simulation|simulator)/i,"Симулятор"],[/^(песочниц|sandbox)/i,"Песочница"],[/^(инди|indie)/i,"Инди"],[/^(гонк|racing)/i,"Гонки"],
    [/^(спорт|sport)/i,"Спорт"],[/^(файтинг|fighting)/i,"Файтинг"],[/^(головолом|puzzle)/i,"Головоломка"],[/^(платформер|platformer)/i,"Платформер"],[/^(стелс|stealth)/i,"Стелс"],
    [/^(метроидван|metroidvania)/i,"Метроидвания"],[/^(souls)/i,"Soulslike"],[/^(визуальн|visual novel)/i,"Визуальная новелла"],[/^(градостро|city build)/i,"Градостроительный симулятор"],
    [/^(кооп|co-?op)/i,"Кооп"],[/^(карточн|card)/i,"Карточная"],[/^(massively|mmo)/i,"ММО"],[/^(казуал|casual)/i,"Казуальная"],[/^(ранний доступ|early access|бесплатн|free to play)/i,null]];
  function normGenres(str, game){
    const out = [];
    String(str || "").split(/[,;\/|]|\s{2,}/).map(x => x.trim()).filter(Boolean).forEach(g => {
      let v = g;
      if (game){ const m = GENRE_MAP.find(([re]) => re.test(g)); if (m) v = m[1]; }
      if (v == null) return;
      v = v.charAt(0).toUpperCase() + v.slice(1);
      if (!out.some(x => x.toLowerCase() === v.toLowerCase())) out.push(v);
    });
    return out.join(", ");
  }
  function genreChips(inputId){
    const box = $("gChips"), inp = $(inputId);
    const cur = () => inp.value.split(",").map(x => x.trim()).filter(Boolean);
    const sync = () => { const low = cur().map(x => x.toLowerCase()); box.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", low.includes(b.dataset.g.toLowerCase()))); };
    box.onclick = e => { const b = e.target.closest("[data-g]"); if (!b) return; let list = cur(); const i = list.findIndex(x => x.toLowerCase() === b.dataset.g.toLowerCase());
      if (i >= 0) list.splice(i, 1); else list.push(b.dataset.g); inp.value = list.join(", "); sync(); };
    inp.addEventListener("input", sync); sync();
  }
  // 4.9: «давно» — единственный способ получить запись без даты
  const ndSet = on => { const nd = $("f_nodate"); if (!nd || nd.checked === !!on) return; nd.checked = !!on; nd.dispatchEvent(new Event("change", {bubbles: true})); };
  document.addEventListener("change", e => { if (e.target && e.target.id === "f_nodate" && $("f_date")){ $("f_date").disabled = e.target.checked; if (e.target.checked) $("f_date").value = ""; else if (!$("f_date").value) $("f_date").value = today(); } });
  const CHEV_I = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const LINK_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>';
  // «S2 · E5»: на какой серии остановился, если известны серии по сезонам
  function seasonPos(arr, w){
    if (!Array.isArray(arr) || !arr.length || !(w > 0)) return null;
    let left = w;
    for (let i = 0; i < arr.length; i++){ const n = arr[i]; if (!(n > 0)) return null; if (left <= n) return `S${i + 1} · E${left}`; left -= n; }
    return "всё досмотрено";
  }
  // общая обвязка: выезжающая панель подробностей и строка-итог под ссылкой
  // 7.15: ссылки AnimeGO / YummyAnime → API YummyAnime (api.yani.tv отвечает сайту напрямую)
  const YANI = "https://api.yani.tv";
  function aniRef(raw){
    const v = String(raw || "").trim(); if (!v || /\s/.test(v)) return null;
    try { const u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v), h = u.hostname;
      if (/yummy|yani\.tv/i.test(h)){ const m = u.pathname.match(/\/(?:catalog\/item|anime)\/([^/?#]+)/); return m ? {src: "yummy", slug: decodeURIComponent(m[1]), url: u.href} : null; }
      if (/animego/i.test(h)){ const m = u.pathname.match(/\/anime\/([^/?#]+)/); return m ? {src: "animego", slug: decodeURIComponent(m[1]).replace(/-\d+$/, ""), url: u.href} : null; }
    } catch(e){ /* ожидаемо: это не ссылка */ }
    return null;
  }
  async function aniGet(slug){
    const r = await fetch(`${YANI}/anime/${encodeURIComponent(slug)}`); if (r.status === 404) return null;
    if (!r.ok) throw new Error("YummyAnime не ответил, попробуй ещё раз");
    const j = await r.json(); return j && j.response || null;
  }
  // латиница из адреса → кириллица, чтобы найти на YummyAnime по названию
  const ANI_TR = [["shch","щ"],["sch","щ"],["yo","ё"],["zh","ж"],["kh","х"],["ts","ц"],["ch","ч"],["sh","ш"],["yu","ю"],["ya","я"],["iy","ий"],["yy","ый"],["ye","е"],["a","а"],["b","б"],["v","в"],["g","г"],["d","д"],["e","е"],["z","з"],["i","и"],["y","ы"],["k","к"],["l","л"],["m","м"],["n","н"],["o","о"],["p","п"],["r","р"],["s","с"],["t","т"],["u","у"],["f","ф"],["h","х"],["c","к"],["j","й"],["w","в"],["x","кс"],["q","к"]];
  const aniCyr = s => { s = String(s).toLowerCase(); let o = "", i = 0; while (i < s.length){ const m = ANI_TR.find(([l]) => s.startsWith(l, i)); if (m){ o += m[1]; i += m[0].length; } else { o += s[i]; i++; } } return o; };
  const aniNorm = s => String(s || "").toLowerCase().replace(/ё/g, "е").replace(/[ьъ]/g, "").replace(/[^a-zа-я0-9]+/g, " ").trim();
  async function aniFind(slug){
    const words = slug.replace(/-/g, " "), qs = [aniCyr(words), words];
    let list = [];
    for (const q of qs){ const r = await fetch(`${YANI}/search?limit=6&q=${encodeURIComponent(q)}`); if (!r.ok) throw new Error("YummyAnime не ответил, попробуй ещё раз");
      const j = await r.json(); list = (j && j.response) || []; if (list.length) break; }
    const want = new Set(aniNorm(aniCyr(words)).split(" ").filter(Boolean)), wantL = new Set(aniNorm(words).split(" ").filter(Boolean));
    const score = a => { if (a.anime_url === slug) return 99;
      const tw = new Set(aniNorm(a.title).split(" ").filter(Boolean)), uw = new Set(aniNorm(a.anime_url).split(" ").filter(Boolean));
      const j = (A, B) => { if (!A.size || !B.size) return 0; let k = 0; A.forEach(x => { if (B.has(x)) k++; }); return k / (A.size + B.size - k); };
      return j(want, tw) + 0.3 * j(wantL, uw); };
    const sorted = list.map(a => [score(a), a]).sort((x, y) => y[0] - x[0]).map(x => x[1]);
    return {best: sorted[0] || null, alts: sorted};
  }
  function formKit(isNew, src){
    const dr = $("afDr"), tog = $("afTog");
    const openDr = (on = true) => { dr.classList.toggle("open", on); tog.setAttribute("aria-expanded", on); };
    tog.onclick = () => openDr(!dr.classList.contains("open"));
    const sum = (state = "", msg = "") => {
      const el = $("afSum"), t = $("f_title").value.trim();
      const gs = ($("f_genre") ? $("f_genre").value : "").split(",").map(x => x.trim()).filter(Boolean).slice(0, 3).join(", ");
      const yr = ($("f_year") && $("f_year").value) || (($("f_release") && $("f_release").value.match(/(19|20)\d{2}/)) || [])[0] || "";
      const pr = $("f_rub") && $("f_rub").value ? `${$("f_rub").value} ₽` : "";
      el.className = "af-sum " + state;
      if (state === "busy"){ el.innerHTML = `<span class="ic"></span><span class="tx"><b>Ищу на ${src}…</b><small>пара секунд</small></span>`; return; }
      const ic = state === "bad" ? "!" : state === "ok" ? "✓" : t ? "•" : "→";
      el.innerHTML = t && state !== "bad" ? `<span class="ic">${ic}</span><span class="tx"><b>${esc(t)}</b><small>${esc(msg || [gs, yr, pr].filter(Boolean).join(" · ") || "остальное в «Подробнее»")}</small></span>`
        : `<span class="ic">${ic}</span><span class="tx">${state === "bad" ? `<b>Не вышло</b>` : ""}<small>${esc(msg || (src === "Steam" ? "Вставь ссылку — подтянутся название, описание, жанры, дата, цена и обложка" : "Вставь ссылку — подтянутся название, тип, год, жанры, описание, актёры, сезоны и постер"))}</small></span>`;
    };
    $("f_title").addEventListener("input", () => sum($("afSum").classList.contains("ok") ? "ok" : ""));
    openDr(!isNew); sum(isNew ? "" : "");
    return {openDr, sum, setSrc: x => { src = x; }};
  }
  function openForm(it, kind, opts = {}){
    const isNew = !it, lock = opts.lock || null;
    FORM_NEW = isNew && !lock; fdTouched = false; FORM_IDS = {}; setTimeout(ndAuto, 60);
    it = it || (kind === "games" ? {type:"game", status: lock || "playing"} : {type:"movie", status: lock || "done"});
    const g = isGame(it); useWorld(it);
    const dateVal = isNew ? today() : (itemDate(it) || today());
    let cover = {file:null, url: it.cover ? blobUrl(it.cover) : "", pos: it.coverPos || null, remove:false};
    const posterBox = () => `<div class="poster editable" id="fPoster" tabindex="0" role="button" aria-label="Обложка">
        ${cover.url ? `<img alt="" src="${cover.url}" style="${posStyle(cover.pos)}">` : `<div class="ph" style="font-weight:500;font-size:14px"><b style="font-size:16px">Обложка</b>Подтянется по ссылке.<br>Или скопируй картинку и нажми Ctrl+V</div>`}
        <span class="edit-hint">${cover.url ? "Изменить обложку" : "Добавить обложку"}</span></div>`;
    const wireFormPoster = () => {
      const el = $("fPoster"); if (!assets){ el.onclick = () => toast("Обложку может менять только владелец"); return; }
      const edit = file => coverEditor({src: file ? URL.createObjectURL(file) : cover.url, pos: file ? null : cover.pos, title: $("f_title") && $("f_title").value,
        onSave: r => { if (r.remove) cover = {file:null,url:"",pos:null,remove:true}; else { if (r.file || file){ cover.file = r.file || file; cover.url = URL.createObjectURL(cover.file); cover.remove = false; } cover.pos = r.pos; }
          $("fPoster").outerHTML = posterBox(); wireFormPoster(); }});
      el.onclick = () => edit(null); bindDrop(el, f => edit(f)); pasteTarget = f => edit(f);
    };
    const togBtn = sub => `<button type="button" class="af-tog" id="afTog" aria-expanded="false"><span>Подробнее<small>${sub}</small></span><span class="chev">${CHEV_I}</span></button>`;
    if (g){
      let st = gStatus(it.status), srcSel = srcOf(it) || (isNew && !lock ? (gSrc || "steam") : null), free = !!it.priceFree;
      if (it.status === "future") st = "future";
      let gOld = !!it.noDate && st === "done";
      const rub0 = typeof it.priceRub === "number" ? it.priceRub : (/₽|руб/i.test(it.price || "") ? +(it.price.replace(/\D/g, "")) || null : null);
      showView(`
        <div class="s-crumb"><a id="crumb">Все игры</a> &gt; ${isNew ? "Новая игра" : esc(it.title)}</div>
        <h2 class="s-title">${lock === "future" ? (isNew ? "В список желаемого" : "Изменить: список желаемого") : lock === "soon" ? (isNew ? "Ждать релиз" : "Изменить релиз") : isNew ? "Добавить игру" : "Изменить игру"}</h2>
        ${lock ? `<p style="margin:-8px 0 18px;color:var(--s-dim)">${lock === "future" ? "Попадёт в «Список желаемого» и в пул рулетки. Оценка, дата начала, цена и Лицензия/Пиратка — когда начнёшь играть." : "Попадёт в календарь выходов с обратным отсчётом."}</p>` : ""}
        <div class="s-form">
          <div>${posterBox()}</div>
          <form class="s-fields" id="editForm" novalidate>
            <div class="af-row"><p class="af-cap">Ссылка на игру в Steam</p>
              <div class="af-link"><span class="lk">${LINK_I}<input class="s-in" id="f_url" inputmode="url" autocomplete="off" placeholder="store.steampowered.com/app/1245620"></span><button type="button" class="s-btn" id="f_urlGo">Заполнить</button></div>
              <div class="af-sum" id="afSum"></div></div>${isNew ? frFindHTML(g ? "s-in" : "k-in") : ""}
            ${lock === "soon" ? releaseFields(it, "s-in") : ""}
            ${lock ? "" : `<label>Статус<div class="chips" id="f_st">${Object.entries(GSTATUS).flatMap(e => e[0] === "done" ? [e, ["old", "Играл давно"]] : [e]).map(([k,l]) => `<button type="button" class="${k === "old" ? "done old" : k}" data-v="${k}" aria-pressed="${k === "old" ? gOld : k === st && !(k === "done" && gOld)}">${l}</button>`).join("")}<button type="button" data-v="future" aria-pressed="${st === "future"}">На будущее</button></div></label>`}
            <label id="srcWrap" ${lock || st === "future" || st === "youtube" ? "hidden" : ""}>Где взял<div class="chips" id="f_src">${["steam","pirate"].map(k => `<button type="button" class="${k}" data-v="${k}" aria-pressed="${k===srcSel}">${SRC_ICON[k]}${SRC_NAME[k]}</button>`).join("")}</div></label>
            <label id="dropWrap" ${st === "dropped" ? "" : "hidden"}>Причина дропа<textarea class="s-in" id="f_drop" style="min-height:70px" placeholder="Почему бросил">${esc(it.dropReason||"")}</textarea></label>
            ${lock ? "" : `<label id="rateWrap" ${st === "future" ? "hidden" : ""}>Моя оценка${wheelHTML("f_rating", it.rating)}</label>`}
            ${togBtn(lock ? "название, описание, жанры, заметки" : "название, описание, жанры, даты, цена, заметки")}
            <div class="af-dr" id="afDr"><div class="af-in">
              <div class="s-quick"><p><b>Без ссылки.</b> Выдели на странице игры текст с названием, жанром и датой, скопируй и вставь сюда — разложу по полям.</p>
                <textarea class="s-in" id="f_quick" placeholder="Вставь сюда текст со страницы Steam"></textarea></div>
              <label>Название игры<input class="s-in" id="f_title" value="${esc(it.title||"")}"></label>
              <label>Описание<textarea class="s-in" id="f_desc" style="min-height:130px">${esc(it.desc||"")}</textarea></label>
              <label>Жанры<input class="s-in" id="f_genre" placeholder="выбери ниже или впиши свои через запятую" value="${esc(it.genre||"")}"><div class="gchips" id="gChips">${GAME_GENRES.map(x => `<button type="button" data-g="${x}">${x}</button>`).join("")}</div></label>
              ${lock === "soon" ? "" : `<div class="s-two">
                <label>Дата выхода<input class="s-in" id="f_release" placeholder="16 мая. 2024" value="${esc(it.release||"")}"></label>
                ${lock ? "" : `<label>Начал играть<span class="nd-row"><input class="s-in" id="f_date" type="date" value="${it.noDate ? "" : esc(dateVal)}" ${it.noDate ? "disabled" : ""}><label class="nd-tog"><input type="checkbox" id="f_nodate" ${it.noDate ? "checked" : ""}><span>Без даты</span></label></span></label>`}
              </div>`}
              <div id="buyWrap" style="display:grid;gap:14px" ${lock || st === "future" || st === "youtube" ? "hidden" : ""}>
              <label>Цена<div class="price-row"><div class="cur"><input class="s-in" id="f_rub" inputmode="numeric" placeholder="1 999" value="${rub0 ?? ""}"><span>₽</span></div>
                <div class="cur"><input class="s-in" id="f_kzt" inputmode="numeric" placeholder="10 915" value="${rub0 != null ? Math.round(rub0 * KZT_PER_RUB) : ""}"><span>₸</span></div>
                <button type="button" class="free" id="f_free" aria-pressed="${!!it.priceFree}">Бесплатно</button></div>
                <span class="rate-note">Пиши в любом поле, второе посчитается само по курсу 1 ₽ = ${String(KZT_PER_RUB).replace(".", ",")} ₸. На странице игры цена в рублях.</span></label>
              </div>
              <label>Мои заметки<textarea class="s-in" id="f_note" style="min-height:80px">${esc(it.note||"")}</textarea></label>
            </div></div>
            <div class="s-acts"><button class="s-btn green" type="submit">${isNew ? (lock === "future" ? "Добавить в список желаемого" : lock === "soon" ? "Ждать релиз" : "Добавить в библиотеку") : "Сохранить"}</button>${ME ? `<button class="s-btn dark sg-fb" type="button" id="sugFormBtn" title="Отправить эту карточку другу — без твоего статуса и заметок">${ICON.send}Предложить другу</button>` : ""}<button class="s-btn dark" type="button" id="cancelBtn">Отмена</button>${isNew ? "" : `<button class="s-btn red" type="button" id="delBtn">Удалить</button>`}</div>
            <div id="confirmBox"></div>
          </form>
        </div>`, it.cover ? it : null);
      $("crumb").onclick = closeView;
      const kit = formKit(isNew, "Steam");
      const chips = (id, fn) => $(id).onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; $(id).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); fn(b.dataset.v); };
      chips("f_src", v => srcSel = v);
      if (!lock) chips("f_st", v => { gOld = v === "old"; st = gOld ? "done" : v; ndSet(gOld); $("dropWrap").hidden = st !== "dropped"; $("rateWrap").hidden = st === "future"; $("buyWrap").hidden = $("srcWrap").hidden = st === "future" || st === "youtube"; });
      genreChips("f_genre");
      if (!lock && $("f_nodate")) $("f_nodate").addEventListener("change", () => { if ($("f_nodate").checked || !gOld) return; gOld = false;
        $("f_st").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x.dataset.v === "done")); });
      const rel = lock === "soon" ? wireRelease() : null;
      const setFree = v => { free = v; $("f_free").setAttribute("aria-pressed", v); $("f_rub").disabled = $("f_kzt").disabled = v; };
      setFree(free);
      $("f_free").onclick = () => setFree(!free);
      const digits = v => v.replace(/\D/g, "");
      $("f_rub").addEventListener("input", e => { const v = digits(e.target.value); $("f_kzt").value = v ? Math.round(+v * KZT_PER_RUB) : ""; });
      $("f_kzt").addEventListener("input", e => { const v = digits(e.target.value); $("f_rub").value = v ? Math.round(+v / KZT_PER_RUB) : ""; });
      if (!lock) wireWheel("f_rating");
      const steamFill = async raw => {
        const m = String(raw || "").match(/store\.steampowered\.com\/app\/(\d+)/i) || String(raw || "").trim().match(/^(\d{2,10})$/); if (m) FORM_IDS.steamId = m[1];
        if (!m){ kit.sum("bad", "Это не похоже на ссылку на игру в Steam. Заполни вручную в «Подробнее»"); kit.openDr(true); return; }
        const btn = $("f_urlGo"); btn.disabled = true; btn.textContent = "Ищу…"; kit.sum("busy");
        try {
          const {data: d, error} = await SB.functions.invoke("steam", {body: {appid: m[1]}});
          if (error || !d || d.error) throw new Error((d && d.error) || (error && error.message) || "нет ответа");
          const got = [];
          if (d.name){ $("f_title").value = d.name; got.push("название"); }
          if (d.short){ $("f_desc").value = d.short; got.push("описание"); }
          const mapped = (d.tags || []).filter(t => GENRE_MAP.some(([re, v]) => v && re.test(t)));
          const coop = (d.categories || []).some(c => /кооп|co-?op/i.test(c)) ? ["Кооп"] : [];
          const gs = normGenres([$("f_genre").value, ...(d.genres || []), ...mapped, ...coop].filter(Boolean).join(", "), true);
          if (gs){ $("f_genre").value = gs; $("f_genre").dispatchEvent(new Event("input")); got.push("жанры"); }
          const rd = d.release && d.release.date;
          if (rd){ if ($("f_release")) $("f_release").value = rd; if (rel && rel.fill(toISO(rd))) {} got.push("дату выхода"); }
          if (lock !== "future" && lock !== "soon"){
            if (d.is_free){ setFree(true); got.push("цену"); }
            else if (d.price && d.price.currency === "RUB"){ const r = Math.round(d.price.final / 100); setFree(false); $("f_rub").value = r; $("f_kzt").value = Math.round(r * KZT_PER_RUB); got.push("цену"); }
            else if (d.priceKz && d.priceKz.currency === "KZT"){ const k = Math.round(d.priceKz.final / 100); setFree(false); $("f_kzt").value = k; $("f_rub").value = Math.round(k / KZT_PER_RUB); got.push("цену из тенге"); }
          }
          if (d.cover && !cover.file && !(cover.url && !isNew)){
            const bin = Uint8Array.from(atob(d.cover), c => c.charCodeAt(0));
            const f = new File([bin], "steam-cover.jpg", {type: d.coverType || "image/jpeg"});
            cover = {file: f, url: URL.createObjectURL(f), pos: null, remove: false};
            $("fPoster").outerHTML = posterBox(); wireFormPoster(); got.push("обложку");
          }
          if (!got.length) throw new Error("Steam ничего не отдал");
          kit.sum("ok"); ffHasChk(); toast("Подтянул: " + got.join(", "));
        } catch(e){ kit.sum("bad", "Steam не отдал данные (" + (e.message || e) + "). Заполни вручную — поля ниже"); kit.openDr(true); setTimeout(() => $("f_title").focus(), 350); }
        btn.disabled = false; btn.textContent = "Заполнить";
      };
      $("f_urlGo").onclick = () => steamFill($("f_url").value);
      wireFrFind(true, async fi => {
        if (fi.title) $("f_title").value = fi.title; if (fi.desc) $("f_desc").value = fi.desc;
        if (fi.genre){ $("f_genre").value = fi.genre; $("f_genre").dispatchEvent(new Event("input")); }
        if (fi.release && $("f_release")) $("f_release").value = fi.release; if (rel && fi.releaseDate) rel.fill(fi.releaseDate);
        if (fi.steamId) FORM_IDS.steamId = fi.steamId;
        if (!cover.file){ const f = await frCoverFile(fi); if (f){ cover = {file: f, url: URL.createObjectURL(f), pos: fi.coverPos || null, remove: false}; $("fPoster").outerHTML = posterBox(); wireFormPoster(); } }
        kit.sum("ok"); });
      $("f_url").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); steamFill($("f_url").value); } });
      $("f_url").addEventListener("paste", () => setTimeout(() => { const v = $("f_url").value.trim(); if (v) steamFill(v); }, 0));
      $("f_quick").addEventListener("input", () => { if (/^\s*https?:\/\/store\.steampowered\.com\/app\/\d+\S*\s*$/i.test($("f_quick").value)){ $("f_url").value = $("f_quick").value.trim(); $("f_quick").value = ""; steamFill($("f_url").value); return; }
        const r = parseSteam($("f_quick").value), got = [];
        [["title","f_title","название"],["desc","f_desc","описание"],["genre","f_genre","жанры"],["release","f_release","дату"]].forEach(([k,id,l]) => { if (r[k] && $(id)){ $(id).value = r[k]; got.push(l); } });
        if (rel && r.release && rel.fill(toISO(r.release))) got.push("дату выхода");
        if (r.genre){ const merged = normGenres([$("f_genre").value, r.genre].join(", "), true); $("f_genre").value = merged; }
        $("f_genre").dispatchEvent(new Event("input"));
        if (r.free){ setFree(true); got.push("цену"); }
        else if (r.rub){ setFree(false); $("f_rub").value = r.rub; $("f_kzt").value = Math.round(r.rub * KZT_PER_RUB); got.push("цену"); }
        else if (r.kzt){ setFree(false); $("f_kzt").value = r.kzt; $("f_rub").value = Math.round(r.kzt / KZT_PER_RUB); got.push("цену из тенге"); }
        if (got.length){ toast("Нашёл: " + got.join(", ")); kit.sum("ok"); } });
      $("editForm").onsubmit = async e => { e.preventDefault();
        if (lock) st = lock;
        const later = st === "future" || st === "soon", yt = st === "youtube";
        if (!$("f_title").value.trim()){ kit.openDr(true); kit.sum("bad", "Нужно название: вставь ссылку или впиши его вручную"); setTimeout(() => $("f_title").focus(), 300); return; }
        if (!kSugNext && !later && !yt && !srcSel){ toast("Выбери, где взял: Лицензия или Пиратка"); $("srcWrap").scrollIntoView({behavior: "smooth", block: "center"}); return; }
        let relTxt = $("f_release") ? $("f_release").value.trim() : (it.release || ""), relD = null;
        if (lock === "soon"){ relD = rel.get(); if (!relD){ toast("Укажи дату или месяц выхода"); return; } if (!relTxt) relTxt = relLabel(relD); }
        const ym = (relD ? relD.releaseDate : relTxt).match(/(19|20)\d{2}/);
        const nd = $("f_nodate") && $("f_nodate").checked;
        const body = {type:"game", title:$("f_title").value.trim(), desc:$("f_desc").value.trim() || null, genre:$("f_genre").value.trim() || null,
          release: relTxt || null, year: ym ? +ym[0] : (it.year || null), price: later ? (it.price ?? null) : null, priceFree: later ? !!it.priceFree : yt ? false : free, priceRub: later ? (it.priceRub ?? null) : (free || yt ? null : (digits($("f_rub").value) ? +digits($("f_rub").value) : null)),
          rating: lock ? (it.rating ?? null) : st === "future" ? (it.rating ?? null) : wheelVal("f_rating"), date: lock || nd ? null : (($("f_date") && $("f_date").value) || null), noDate: !lock && !!nd, source: later ? (it.source || null) : yt ? null : srcSel, status: st,
          finishedAt: nd ? null : (st === "done" || st === "dropped" || st === "youtube") ? (it.finishedAt && gStatus(it.status) === st ? it.finishedAt : today()) : null, dropReason: st === "dropped" ? ($("f_drop").value.trim() || null) : null, note:$("f_note").value.trim() || null};
        if (relD) Object.assign(body, relD);
        if (kSugNext){ kSugNext = false; suggestFromForm(it, body, cover); return; }
        await save(it, isNew, body, cover); };
      if ($("sugFormBtn")) $("sugFormBtn").onclick = () => { kSugNext = true; $("editForm").requestSubmit(); kSugNext = false; };
    } else {
      let st = it.status === "wish" ? "future" : (it.status || "done");
      const watchedSt = x => x === "done" || x === "played";
      let kOld = !!it.noDate && watchedSt(st);
      const kDate = watchedSt(st) ? (it.date || itemDate(it) || today()) : "";
      const KPF = [["country","Страна"],["director","Режиссёр"],["writer","Сценарий"],["producer","Продюсер"],["operator","Оператор"],["composer","Композитор"],["duration","Время"],["age","Возраст"],
        ["tagline","Слоган"],["budget","Бюджет"],["boxWorld","Сборы в мире"],["premiereWorld","Премьера в мире"],["premiereRu","Премьера в России"],["kpRating","Рейтинг Кинопоиска"]];
      let seArr = Array.isArray(it.seasonEps) ? it.seasonEps.map(n => n > 0 ? +n : null) : (+it.seasons > 0 ? Array(+it.seasons).fill(null) : []);
      let seKnown = +it.epTotal || null;
      showView(`
        <div class="k-form">
          <div>${posterBox()}</div>
          <form class="k-fields" id="editForm" novalidate>
            <h2 class="k-title" style="font-size:40px;margin:0">${lock === "future" ? (isNew ? "На будущее" : "Изменить: на будущее") : lock === "soon" ? (isNew ? "Ждать релиз" : "Изменить релиз") : isNew ? "Новое кино" : "Правка"}</h2>
            ${isNew && !lock ? impSeg("kino", "Один фильм") : ""}
            ${lock ? `<p style="margin:0;color:var(--k-dim);text-transform:none;letter-spacing:0">${lock === "future" ? "Попадёт в «На будущее» и в пул рулетки." : "Попадёт в календарь выходов. Дата премьеры подтянется из Кинопоиска."}</p>` : ""}
            <div class="af-row"><p class="af-cap">Ссылка: Кинопоиск, AnimeGO или YummyAnime</p>
              <div class="af-link"><span class="lk">${LINK_I}<input class="k-in" id="f_url" inputmode="url" autocomplete="off" placeholder="kinopoisk.ru/film/301 · animego · yummyani"></span><button type="button" class="k-btn white sm" id="f_urlGo">Заполнить</button></div>
              <div class="af-sum" id="afSum"></div><div class="af-alt" id="afAlt" hidden></div></div>${isNew ? frFindHTML(g ? "s-in" : "k-in") : ""}
            <div class="af-row"><div><span class="af-seg" id="f_typeSeg">${Object.entries(KTYPES).map(([k,l]) => `<button type="button" data-t="${k}" aria-pressed="${k===it.type}">${l}</button>`).join("")}</span></div>
              <select id="f_type" hidden>${Object.entries(KTYPES).map(([k,l]) => `<option value="${k}"${k===it.type?" selected":""}>${l}</option>`).join("")}</select></div>
            ${lock ? "" : `<div class="af-row"><div class="ks-chips" id="f_stc"></div><select id="f_status" hidden>${["playing","done","played","paused","dropped","future"].map(s => `<option value="${s}"${s===st?" selected":""}>${s}</option>`).join("")}</select></div>`}
            ${lock === "soon" ? releaseFields(it, "k-in") : ""}
            <div class="se-ed ser-f" id="seEd" hidden>
              <div class="se-h">Сезоны<small id="seTot"></small></div>
              <div class="se-row" id="seRow"></div>
              ${lock ? "" : `<div class="se-w">Посмотрено серий <input id="f_epWatched" inputmode="numeric" value="${it.epWatched ?? ""}" placeholder="0"> <b id="seWp"></b></div>`}
              <input type="hidden" id="f_seasons" value="${it.seasons ?? ""}"><input type="hidden" id="f_epTotal" value="${it.epTotal ?? ""}">
            </div>
            <label id="dropWrap" ${st === "dropped" ? "" : "hidden"}>Почему бросил<textarea class="k-in" id="f_drop" style="min-height:70px">${esc(it.dropReason||"")}</textarea></label>
            ${lock ? "" : `<label id="rateWrap" ${st === "future" ? "hidden" : ""}>Моя оценка${wheelHTML("f_rating", it.rating)}</label>`}
            ${togBtn("название, год, дата, жанры, описание, режиссёр и актёры")}
            <div class="af-dr" id="afDr"><div class="af-in">
              <div class="k-quick"><p><b>Без ссылки.</b> Выдели на Кинопоиске всё от названия до блока «О фильме», скопируй и вставь сюда — разложу по полям.</p>
                <textarea class="k-in" id="f_quick" style="min-height:70px" placeholder="Вставь сюда текст со страницы Кинопоиска"></textarea></div>
              <div class="k-two">
                <label>Название<input class="k-in" id="f_title" value="${esc(it.title||"")}"></label>
                <label>Оригинальное название<input class="k-in" id="f_originalTitle" value="${esc(it.originalTitle||"")}"></label>
              </div>
              <div class="k-two">
                <label>Год выхода<input class="k-in" id="f_year" type="number" min="1900" max="2100" value="${it.year ?? ""}"></label>
                ${lock ? "" : `<label>Дата просмотра<span class="nd-row"><input class="k-in" id="f_date" type="date" value="${it.noDate ? "" : esc(kDate)}" placeholder="когда досмотришь" ${it.noDate ? "disabled" : ""}><label class="nd-tog"><input type="checkbox" id="f_nodate" ${it.noDate ? "checked" : ""}><span>Без даты</span></label></span></label>`}
              </div>
              <label>Жанры через запятую<input class="k-in" id="f_genre" value="${esc(it.genre||"")}"></label>
              <label>Коротко<input class="k-in" id="f_short" value="${esc(it.short||"")}"></label>
              <label>Описание<textarea class="k-in" id="f_desc">${esc(it.desc||"")}</textarea></label>
              <details class="k-more" id="kMore" ${KPF.some(([k]) => it[k]) || it.cast ? "open" : ""}><summary>Режиссёр, страна, сборы, актёры</summary>
                <div class="k-two">${KPF.map(([k,l]) => `<label>${l}<input class="k-in" id="f_${k}" value="${esc(it[k] ?? "")}"></label>`).join("")}</div>
                <label style="margin-top:14px">В главных ролях<textarea class="k-in" id="f_cast" style="min-height:70px" placeholder="через запятую">${esc(it.cast||"")}</textarea></label>
              </details>
              <label>Заметка<textarea class="k-in" id="f_note">${esc(it.note||"")}</textarea></label>
            </div></div>
            <div class="k-acts" style="margin-top:6px"><button class="k-btn white" type="submit">${isNew ? (lock === "future" ? "Добавить на будущее" : lock === "soon" ? "Ждать релиз" : "Добавить") : "Сохранить"}</button>${ME ? `<button class="k-btn sg-fb" type="button" id="sugFormBtn" title="Отправить эту карточку другу — без твоего статуса и заметок">${ICON.send}Предложить другу</button>` : ""}<button class="k-btn" type="button" id="cancelBtn">Отмена</button>${isNew ? "" : `<button class="k-btn danger" type="button" id="delBtn">Удалить</button>`}</div>
            <div id="confirmBox"></div>
          </form>
        </div>`, it.cover ? it : null);
      const kit = formKit(isNew, "Кинопоиске");
      if (!lock) wireWheel("f_rating");
      const rel = lock === "soon" ? wireRelease() : null;
      // статусы под тип: фильм — Просмотрено/Отложено, сериал — Смотрю/Брошено
      const okSt = t => isSerT(t) ? ["playing","dropped","done","future"] : ["done","played","paused","future"];
      const drawSt = () => { if (lock) return; const t = $("f_type").value, cur = st === "future" ? "future" : kOld && watchedSt(st) ? "old" : kNorm({type: t, status: st});
        const opts = [...kOpts(t).flatMap(e => e[0] === "done" ? [e, ["old", "Смотрел давно"]] : [e]), ["future","На будущее"]];
        $("f_stc").innerHTML = opts.map(([k,l]) => `<button type="button" data-v="${k}" class="${k === "future" ? "fut" : ""}" style="--c:${KCOL[k] || "#c7c7d6"}" aria-pressed="${k === cur}">${l}</button>`).join(""); };
      const setSt = v => { kOld = v === "old"; if (kOld) v = "done"; ndSet(kOld); st = v; $("f_status").value = v; $("f_status").dispatchEvent(new Event("change")); drawSt(); };
      let stTouched = false;
      if (!lock) $("f_stc").onclick = e => { const b = e.target.closest("[data-v]"); if (b){ stTouched = true; setSt(b.dataset.v); } };
      if (!lock && $("f_nodate")) $("f_nodate").addEventListener("change", () => { if (!$("f_nodate").checked && kOld){ kOld = false; drawSt(); } });
      if (!lock) $("f_status").onchange = e => { st = e.target.value; $("dropWrap").hidden = st !== "dropped"; $("rateWrap").hidden = st === "future"; if (watchedSt(st) && !$("f_date").value && !$("f_nodate").checked) $("f_date").value = today(); };
      // сезоны
      const seSum = () => seArr.length && seArr.every(n => n > 0) ? seArr.reduce((s, n) => s + n, 0) : null;
      const seTot = () => { const s = seSum(), tot = s ?? seKnown; $("f_seasons").value = seArr.length || ""; $("f_epTotal").value = tot ?? "";
        $("seTot").textContent = seArr.length ? `${seArr.length} ${plural(seArr.length, "сезон", "сезона", "сезонов")}${tot ? ` · ${tot} ${plural(tot, "серия", "серии", "серий")}` : ""}` : "нажми +, если знаешь";
        const w = $("f_epWatched") ? +$("f_epWatched").value || 0 : 0, p = seasonPos(seArr, w);
        if ($("seWp")) $("seWp").textContent = p ? (p.startsWith("S") ? "это " + p : p) : "";
        const cs = p && p.startsWith("S") ? +p.slice(1, p.indexOf(" ")) - 1 : -1;
        $("seRow").querySelectorAll(".se-p").forEach((el, i) => el.classList.toggle("se-on", i === cs)); };
      const seRender = () => { $("seRow").innerHTML = seArr.map((n, i) => `<span class="se-p"><span>S${i + 1}</span><input inputmode="numeric" data-se="${i}" value="${n ?? ""}" placeholder="?" aria-label="Серий в ${i + 1} сезоне" title="Серий в ${i + 1} сезоне"></span>`).join("")
        + `<button type="button" class="se-b" data-sea="1" title="Добавить сезон">+</button>${seArr.length ? `<button type="button" class="se-b" data-ser="1" title="Убрать последний сезон">−</button>` : ""}`; seTot(); };
      const seFromInputs = () => { const n = +$("f_seasons").value || 0; seKnown = +$("f_epTotal").value || seKnown;
        if (n && n !== seArr.length) seArr = Array.from({length: n}, (_, i) => seArr[i] ?? null); seRender(); };
      $("seRow").addEventListener("input", e => { const i = e.target.dataset.se; if (i == null) return; const v = +e.target.value.replace(/\D/g, ""); e.target.value = v || ""; seArr[+i] = v > 0 ? v : null; seTot(); });
      $("seRow").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.sea){ seArr.push(seArr.length ? seArr[seArr.length - 1] : null); seRender(); const ins = $("seRow").querySelectorAll("input"); ins[ins.length - 1].select(); }
        if (b.dataset.ser){ seArr.pop(); seRender(); } });
      if ($("f_epWatched")) $("f_epWatched").addEventListener("input", seTot);
      seRender();
      const serToggle = () => { const t = $("f_type").value, on = isSerT(t);
        $("f_typeSeg").querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === t));
        $("seEd").hidden = !on;
        if (!lock && st !== "future" && (!okSt(t).includes(st) || (isNew && !stTouched))) { if (kOld){ kOld = false; ndSet(false); } st = on ? "playing" : "done"; $("f_status").value = st; $("f_status").dispatchEvent(new Event("change")); }
        drawSt(); };
      $("f_typeSeg").onclick = e => { const b = e.target.closest("[data-t]"); if (!b) return; $("f_type").value = b.dataset.t; $("f_type").dataset.touched = "1"; serToggle(); };
      serToggle();
      const kpFill = async raw => {
        if (!/kinopoisk\.ru\/(film|series)\/\d+/i.test(String(raw || "")) && !/^\s*\d{2,10}\s*$/.test(String(raw || ""))){ kit.sum("bad", "Это не похоже на ссылку на Кинопоиск, AnimeGO или YummyAnime. Заполни вручную в «Подробнее»"); kit.openDr(true); return; }
        const btn = $("f_urlGo"); btn.disabled = true; btn.textContent = "Ищу…"; kit.setSrc("Кинопоиске"); kit.sum("busy"); $("afAlt").hidden = true;
        try {
          const kpm = String(raw || "").match(/kinopoisk\.ru\/(?:film|series)\/(\d+)/i); if (kpm) FORM_IDS.kpId = kpm[1];
          const {data: d, error} = await SB.functions.invoke("kino", {body: {url: raw}});
          let err = d && d.error;
          if (!d && error){ try { const j = await error.context.json(); err = j.error; } catch(e){ err = error.message; } }
          if (err || !d) throw new Error(err === "captcha" ? "Кинопоиск не ответил, попробуй ещё раз" : err === "not_found" ? "Не нашёл этот фильм на Кинопоиске. Проверь ссылку" : (err || "нет ответа"));
          const got = [], set = (id, v, label) => { if (v != null && v !== "" && $(id)){ $(id).value = v; if (label) got.push(label); } };
          set("f_title", d.title, "название"); set("f_originalTitle", d.originalTitle); set("f_year", d.year, "год");
          if (d.type && !$("f_type").dataset.touched){ $("f_type").value = d.type; serToggle(); }
          if (d.genres && d.genres.length) set("f_genre", normGenres(d.genres.join(", "), false), "жанры");
          set("f_short", d.short); set("f_desc", d.desc, "описание"); set("f_cast", d.cast, d.cast ? "актёров" : null);
          set("f_seasons", d.seasons, d.seasons ? "сезоны" : null); set("f_epTotal", d.epTotal, d.epTotal ? "серии" : null); seFromInputs();
          let extra = 0; KPF.forEach(([k]) => { if (d[k] != null && d[k] !== "" && $("f_" + k)){ $("f_" + k).value = d[k]; extra++; } });
          if (extra){ $("kMore").open = true; got.push(`${extra} ${plural(extra, "деталь", "детали", "деталей")}`); }
          if (rel && rel.fill(d.premiereRuISO || d.premiereWorldISO || toISO(d.premiereRu) || toISO(d.premiereWorld))) got.push("дату премьеры");
          if (d.cover && !cover.file && !(cover.url && !isNew)){
            const bin = Uint8Array.from(atob(d.cover), c => c.charCodeAt(0));
            const f = new File([bin], "kp-poster.jpg", {type: d.coverType || "image/jpeg"});
            cover = {file: f, url: URL.createObjectURL(f), pos: null, remove: false};
            $("fPoster").outerHTML = posterBox(); wireFormPoster(); got.push("постер");
          }
          if (!got.length) throw new Error("Кинопоиск ничего не отдал");
          kit.sum("ok"); ffHasChk(); toast("Подтянул: " + got.join(", "));
        } catch(e){ kit.sum("bad", (e.message || "Не получилось достать данные с Кинопоиска") + ". Заполни вручную — поля ниже"); kit.openDr(true); setTimeout(() => $("f_title").focus(), 350); }
        btn.disabled = false; btn.textContent = "Заполнить";
      };

      // 7.15: аниме по ссылке AnimeGO / YummyAnime — данные берём из открытого API YummyAnime
      let aniCover = false;
      const aniFill = async (raw, pick) => {
        const ref = aniRef(raw); if (!ref && !pick) return;
        const btn = $("f_urlGo"); btn.disabled = true; btn.textContent = "Ищу…"; kit.setSrc(ref && ref.src === "animego" ? "AnimeGO" : "YummyAnime"); kit.sum("busy"); $("afAlt").hidden = true;
        try {
          let a = pick ? await aniGet(pick) : null, alts = [];
          if (!a && ref) a = await aniGet(ref.slug);
          if (!a && ref){ const r = await aniFind(ref.slug); alts = r.alts; if (r.best) a = await aniGet(r.best.anime_url) || r.best; }
          if (!a) throw new Error("Не нашёл это аниме");
          const got = [], set = (id, v, label) => { if (v != null && v !== "" && $(id)){ $(id).value = v; if (label) got.push(label); } };
          const lat = (a.other_titles || []).find(x => /^[\x20-\x7e]+$/.test(x)) || "";
          set("f_title", a.title, "название"); set("f_originalTitle", lat); set("f_year", a.year, "год");
          if (!$("f_type").dataset.touched){ $("f_type").value = "anime"; serToggle(); }
          if (a.genres && a.genres.length) set("f_genre", normGenres(a.genres.map(x => x.title).join(", "), false), "жанры");
          const desc = String(a.description || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
          set("f_desc", desc, desc ? "описание" : null);
          const movie = a.type && /movie|film|фильм/i.test((a.type.alias || "") + (a.type.name || ""));
          const eps = a.episodes && (+a.episodes.count || +a.episodes.aired) || null;
          if (!movie && eps){ seArr = [eps]; seKnown = eps; seRender(); got.push(eps + " " + plural(eps, "серия", "серии", "серий")); }
          if (a.creators && a.creators.length) set("f_director", a.creators.map(x => x.title).join(", "));
          if (a.min_age && a.min_age.title) set("f_age", a.min_age.title);
          if (a.duration) set("f_duration", a.duration + " мин" + (movie ? "" : " / серия"));
          if (a.rating && a.rating.kp_rating) set("f_kpRating", a.rating.kp_rating);
          set("f_country", "Япония");
          const ids = a.remote_ids || {}; FORM_IDS.kpId = ids.kp_id ? String(ids.kp_id) : FORM_IDS.kpId;
          FORM_IDS.srcUrl = ref ? ref.url : FORM_IDS.srcUrl;
          const pu = a.poster && (a.poster.fullsize || a.poster.huge || a.poster.big);
          if (pu && ((!cover.file && !(cover.url && !isNew)) || aniCover)){
            try { const r = await fetch(/^\/\//.test(pu) ? "https:" + pu : pu); if (!r.ok) throw new Error("постер " + r.status);
              const b = await r.blob(), f = new File([b], "anime-poster.jpg", {type: b.type || "image/jpeg"});
              cover = {file: f, url: URL.createObjectURL(f), pos: null, remove: false}; aniCover = true;
              $("fPoster").outerHTML = posterBox(); wireFormPoster(); got.push("постер");
            } catch(e){ logErr("аниме-постер", e); }
          }
          kit.sum("ok"); ffHasChk(); toast("Подтянул: " + got.join(", "));
          const others = alts.filter(x => x.anime_url !== a.anime_url).slice(0, 3);
          if (others.length){ $("afAlt").innerHTML = `<small>Не то?</small>${others.map(x => `<button type="button" data-au="${esc(x.anime_url)}">${esc(x.title)}${x.year ? ` <i>${x.year}</i>` : ""}</button>`).join("")}`; $("afAlt").hidden = false; }
          // актёры озвучки и остальное — с Кинопоиска, если у аниме есть его номер; не вышло — не страшно
          if (ids.kp_id) SB.functions.invoke("kino", {body: {url: `https://www.kinopoisk.ru/film/${ids.kp_id}/`}}).then(({data: d}) => {
            if (!d || d.error) return; const emp = id => $(id) && !$(id).value.trim();
            if (d.cast && emp("f_cast")) $("f_cast").value = d.cast;
            KPF.forEach(([k]) => { if (d[k] != null && d[k] !== "" && emp("f_" + k)) $("f_" + k).value = d[k]; });
            if (emp("f_originalTitle") && d.originalTitle) $("f_originalTitle").value = d.originalTitle;
          }).catch(e => { /* ожидаемо: Кинопоиск иногда отвечает капчей, данные с YummyAnime уже есть */ });
        } catch(e){ kit.sum("bad", (e.message || "Не получилось достать данные") + ". Заполни вручную — поля ниже"); kit.openDr(true); setTimeout(() => $("f_title").focus(), 350); }
        btn.disabled = false; btn.textContent = "Заполнить";
      };
      $("afAlt").onclick = e => { const b = e.target.closest("[data-au]"); if (b) aniFill($("f_url").value, b.dataset.au); };
      const anyFill = v => aniRef(v) ? aniFill(v) : kpFill(v);
      $("f_urlGo").onclick = () => anyFill($("f_url").value);
      wireFrFind(false, async fi => {
        const set = (id, v) => { if (v != null && v !== "" && $(id)) $(id).value = v; };
        set("f_title", fi.title); set("f_originalTitle", fi.originalTitle); set("f_year", fi.year);
        if (fi.type && KTYPES[fi.type]){ $("f_type").value = fi.type; $("f_type").dataset.touched = "1"; serToggle(); }
        set("f_genre", fi.genre); set("f_short", fi.short); set("f_desc", fi.desc); set("f_cast", fi.cast);
        if (Array.isArray(fi.seasonEps) && fi.seasonEps.length){ seArr = fi.seasonEps.map(x => x > 0 ? +x : null); seKnown = +fi.epTotal || seKnown; seRender(); }
        else { set("f_seasons", fi.seasons); set("f_epTotal", fi.epTotal); seFromInputs(); }
        let extra = 0; KPF.forEach(([k]) => { if (fi[k] != null && fi[k] !== "" && $("f_" + k)){ $("f_" + k).value = fi[k]; extra++; } }); if (extra) $("kMore").open = true;
        if (fi.kpId) FORM_IDS.kpId = fi.kpId; if (rel && fi.releaseDate) rel.fill(fi.releaseDate);
        if (!cover.file){ const f = await frCoverFile(fi); if (f){ cover = {file: f, url: URL.createObjectURL(f), pos: fi.coverPos || null, remove: false}; $("fPoster").outerHTML = posterBox(); wireFormPoster(); } }
        kit.sum("ok"); });
      $("f_url").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); anyFill($("f_url").value); } });
      $("f_url").addEventListener("paste", () => setTimeout(() => { const v = $("f_url").value.trim(); if (v) anyFill(v); }, 0));
      $("f_quick").addEventListener("input", () => {
        if (aniRef($("f_quick").value.trim()) && !/\s/.test($("f_quick").value.trim())){ $("f_url").value = $("f_quick").value.trim(); $("f_quick").value = ""; aniFill($("f_url").value); return; }
        if (/^\s*https?:\/\/(www\.)?kinopoisk\.ru\/(film|series)\/\d+\S*\s*$/i.test($("f_quick").value)){ $("f_url").value = $("f_quick").value.trim(); $("f_quick").value = ""; kpFill($("f_url").value); return; }
        const r = parseKP($("f_quick").value), got = [];
        const NAMES = {title:"название",originalTitle:"оригинал",year:"год",genre:"жанры",short:"коротко",desc:"описание",cast:"актёров"};
        if (r.genre) r.genre = normGenres(r.genre, false);
        if ((r.seasons || r.epTotal) && !$("f_type").dataset.touched){ $("f_type").value = "series"; serToggle(); }
        ["title","originalTitle","year","genre","short","desc","cast","seasons","epTotal",...KPF.map(x => x[0])].forEach(k => { if (r[k] != null && $("f_" + k)){ $("f_" + k).value = r[k]; if (NAMES[k]) got.push(NAMES[k]); } });
        if (r.seasons || r.epTotal) seFromInputs();
        const extra = KPF.filter(([k]) => r[k] != null).length;
        if (extra){ $("kMore").open = true; got.push(`${extra} ${plural(extra,"деталь","детали","деталей")}`); }
        if (rel && rel.fill(toISO(r.premiereRu) || toISO(r.premiereWorld))) got.push("дату премьеры");
        if (r.year && !$("f_type").dataset.touched && /сезон|серии|сериал/i.test($("f_quick").value)){ $("f_type").value = "series"; serToggle(); }
        if (got.length) kit.sum("ok");
        toast(got.length ? "Разложил: " + got.join(", ") : "Не узнал формат. Скопируй вместе с блоком «О фильме»");
      });
      $("editForm").onsubmit = async e => { e.preventDefault();
        const n = id => $(id).value === "" ? null : +$(id).value, tx = id => $(id).value.trim() || null;
        if (!$("f_title").value.trim()){ kit.openDr(true); kit.sum("bad", "Нужно название: вставь ссылку или впиши его вручную"); setTimeout(() => $("f_title").focus(), 300); return; }
        if (lock) st = lock;
        let relD = null; if (lock === "soon"){ relD = rel.get(); if (!relD){ toast("Укажи дату или месяц выхода"); return; } }
        const nd = !lock && $("f_nodate").checked;
        const body = {title:$("f_title").value.trim(), originalTitle: tx("f_originalTitle"), type:$("f_type").value, status:st, rating: lock ? (it.rating ?? null) : wheelVal("f_rating"), year:n("f_year") || (relD ? +relD.releaseDate.slice(0,4) : null), date: !lock && watchedSt(st) && !nd ? ($("f_date").value || today()) : null, noDate: nd,
          genre: tx("f_genre"), short: tx("f_short"), desc: tx("f_desc"), cast: tx("f_cast"), dropReason: st === "dropped" ? tx("f_drop") : null, note: tx("f_note")};
        KPF.forEach(([k]) => { body[k] = tx("f_" + k); });
        const ser = isSerT(body.type);
        body.seasons = ser ? n("f_seasons") : null; body.epTotal = ser ? n("f_epTotal") : null; body.seasonEps = ser && seArr.length ? seArr.slice() : null;
        body.epWatched = ser ? (lock ? (it.epWatched ?? null) : ($("f_epWatched").value === "" ? null : +$("f_epWatched").value.replace(/\D/g, "") || 0)) : null;
        if (ser && st === "done"){ if (body.epTotal && (body.epWatched ?? 0) < body.epTotal) body.epWatched = body.epTotal; body.now = null; }
        if (body.kpRating) body.kpRating = parseFloat(String(body.kpRating).replace(",", ".")) || null;
        if (relD) Object.assign(body, relD);
        if (kSugNext){ kSugNext = false; suggestFromForm(it, body, cover); return; }
        await save(it, isNew, body, cover); };
      if ($("sugFormBtn")) $("sugFormBtn").onclick = () => { kSugNext = true; $("editForm").requestSubmit(); kSugNext = false; };
    }
    wireFormPoster();
    if (isNew) setTimeout(() => { const u = $("f_url"); if (u && matchMedia("(pointer:fine)").matches) u.focus(); }, 120);
    $("cancelBtn").onclick = () => { closeView(); if (!isNew && inLib(it)) openItem(it.id); };
    const del = $("delBtn");
    if (del) del.onclick = () => {
      $("confirmBox").innerHTML = `<div class="confirm">Удалить «${esc(it.title)}» насовсем?<button class="${g ? "s-btn red" : "k-btn danger sm"}" type="button" id="delYes">Да, удалить</button><button class="${g ? "s-btn dark" : "k-btn sm"}" type="button" id="delNo">Нет</button></div>`;
      $("delNo").onclick = () => $("confirmBox").innerHTML = "";
      $("delYes").onclick = async () => { try { await db.doc("items/" + it.id).delete(); closeView(); toast("Удалено"); } catch(err){ toast("Не удалилось"); } };
    };
  }
  async function save(it, isNew, body, cover){
    if (!body.title) return;
    body.updatedAt = now();
    try {
      if (cover.remove){ body.cover = null; body.coverPos = null; }
      else { if (cover.file) body.cover = await upload(cover.file); if (cover.url || cover.file) body.coverPos = cover.pos || null; }
      let id = it.id;
      if (FORM_IDS.steamId && isGame(body)) body.steamId = FORM_IDS.steamId; if (FORM_IDS.kpId && !isGame(body)) body.kpId = FORM_IDS.kpId;
      if (FORM_IDS.srcUrl && !isGame(body)) body.srcUrl = FORM_IDS.srcUrl;
      // статус «Смотрю»/«Играю» сразу кладёт на полку «Смотрю»/«Сейчас играю» на главной
      if (body.status === "playing" && (isNew || it.status !== "playing") && !(it && it.now)){ body.now = true; body.nowAt = body.updatedAt; }
      if (isNew && isGame(body) && (body.status === "done" || body.status === "dropped" || body.status === "youtube")) body.addedDone = true;
      if (isNew && pfPend && Date.now() - pfPend.t < 15 * 6e4 && (pfPend.kind === "games") === isGame(body)){ body[pfPend.flag] = true; body[pfPend.flag + "At"] = body.updatedAt; pfPend = null; }
      if (isNew){ body.createdAt = body.updatedAt; id = (await db.collection("items").add(body)).id; }
      else await db.doc("items/" + it.id).update(body);
      toast(isNew ? "Добавлено" : "Сохранено");
      openId = null;
      if (body.status === "future" || body.status === "soon"){ closeView(); return; }
      setTimeout(() => openItem(id), 60);
    } catch(err){ toast(err && (err.code === "too_large" || err.code === "unsupported_type") ? upErr(err) : "Не сохранилось, попробуй ещё раз"); }
  }

