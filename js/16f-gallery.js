  // ================= 7.11: оформление из Steam (backgrounds.gallery) =================
  // Ссылку на предмет разбирает функция gallery-import: она через API Steam находит файлы и кладёт их в media/<uid>/.
  // Профиль меняем уже здесь: аватар → ava_cfg.gif, рамка → cosm.frame, шапка → cosm.hdr, фон → cosm.bgx.media, стикер → cosm.stk.
  // Всё, что импортировали в шапку/фон/стикеры, копится в cosm.lib — «Мои фоны» и «Мои стикеры».
  const BG_SITE = "https://backgrounds.gallery";
  const BG_TGT = {avatar: "На аватар", frame: "В рамки", header: "В шапку", bg: "В фон профиля", sticker: "В мои стикеры"};
  const BG_DONE = {avatar: "Аватар поставлен", frame: "Рамка надета", header: "Шапка поставлена", bg: "Фон профиля поставлен", sticker: "Стикер в шапке — двигай его в конструкторе"};
  const BG_TYPE = {background: "Фон", sticker: "Стикер", miniprofile: "Мини-профиль", frame: "Рамка", avatar: "Анимированный аватар", movie: "Стартап-видео"};
  const BG_SECS = [["items/frames", "Рамки"], ["items/avatars", "Аватары"], ["items/mini-profiles", "Мини-профили"], ["items/stickers", "Стикеры"], ["items/startup-movies", "Стартап-видео"], ["", "Фоны"], ["animated", "Анимированные фоны"]];
  const bgUrlOk = u => { try { const x = new URL(String(u || "").trim()); return /(^|\.)backgrounds\.gallery$/.test(x.hostname) && /^\/(item\/\d+\/\d+|backgrounds\/\d+\/\d+)/.test(x.pathname); } catch(_){ return false; /* ожидаемо: это не ссылка */ } };
  const bgLib = () => { const l = (MEP && MEP.cosm && MEP.cosm.lib) || {}; return {stk: Array.isArray(l.stk) ? l.stk : [], bg: Array.isArray(l.bg) ? l.bg : []}; };
  // лёгкий режим: экономия трафика или «меньше движения» — вместо видео картинка-превью
  const bgLite = () => { try { return !!(navigator.connection && navigator.connection.saveData) || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(_){ return false; /* ожидаемо: старый браузер */ } };

  async function bgCall(body){
    const {data, error} = await SB.functions.invoke("gallery-import", {body});
    if (error){ let m = error.message || "ошибка";
      try { const j = error.context && await error.context.json(); if (j && j.error) m = j.error; } catch(_){ /* ожидаемо: ответ не json */ }
      throw new Error(m); }
    if (!data || data.error) throw new Error((data && data.error) || "пустой ответ");
    return data;
  }

  // поставить то, что пришло из импорта, в профиль
  async function bgApply(r){
    const c = {...((MEP && MEP.cosm) || {})}, lib = bgLib(), v = r.media === "video" || undefined;
    const keep = (k, o, key) => { lib[k] = [o, ...lib[k].filter(x => x[key] !== o[key])].slice(0, 60); };
    if (r.target === "avatar"){
      const cfg = {...((MEP && MEP.ava_cfg) || {}), gif: r.path, gp: {x: 50, y: 50, s: 1}}, patch = {ava_cfg: cfg};
      if (!MEP || !MEP.avatar) patch.avatar = r.path; // без своей аватарки гифка не показалась бы
      return saveProf(patch);
    }
    if (r.target === "frame"){ if (!r.cosmetic_id) throw new Error("рамка не создалась"); await loadCosm(true); c.frame = r.cosmetic_id; }
    else if (r.target === "header"){ const h = c.hdr || {}; c.hdr = {img: r.path, v, pst: r.poster_path || undefined, h: h.h || "l", dim: 25, x: 50, y: 50, blur: 0}; keep("bg", {id: r.path, v, pst: r.poster_path || undefined, t: r.title}, "id"); }
    else if (r.target === "bg"){ c.bgx = {...(c.bgx && typeof c.bgx === "object" ? c.bgx : {}), media: {id: r.path, v, pst: r.poster_path || undefined}}; keep("bg", {id: r.path, v, pst: r.poster_path || undefined, t: r.title}, "id"); }
    else if (r.target === "sticker"){ const stk = Array.isArray(c.stk) ? [...c.stk] : [];
      keep("stk", {img: r.path, t: r.title}, "img");
      if (stk.length < 40) stk.push({id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), b: "head", x: 40 + Math.random() * 30, y: 30 + Math.random() * 40, s: 1, r: 0, z: stk.length, img: r.path});
      else toast("В профиле уже 40 стикеров — этот лежит в «Моих стикерах»");
      c.stk = stk; }
    c.lib = lib;
    const ok = await saveProf({cosm: c});
    // открыт конструктор — кладём новое и в его черновик, иначе «Готово» затрёт импорт старым
    if (ok && typeof LY_ED !== "undefined" && LY_ED){
      if (r.target === "sticker") LY_ED.stk = JSON.parse(JSON.stringify(c.stk));
      if (r.target === "bg"){ LY_ED.bgx = {...(LY_ED.bgx || {}), media: {...c.bgx.media}}; delete LY_ED.files.media; }
      if (LY_ED.cs && (r.target === "header" || r.target === "frame")) LY_ED.cs[r.target === "header" ? "hdr" : "frame"] = c[r.target === "header" ? "hdr" : "frame"];
      if (typeof lyDraw === "function") lyDraw(); }
    return ok;
  }

  // превью предмета: видео с постером, иначе картинка
  function bgPrevHTML(info){ const f = info.files || {}, vid = f.mp4 || f.webm, img = info.type === "avatar" ? (f.gif || f.image) : (f.alt || f.image || f.poster);
    return vid ? `<video src="${esc(vid)}"${f.poster ? ` poster="${esc(f.poster)}"` : ""} autoplay muted loop playsinline></video>` : img ? `<img alt="" src="${esc(img)}">` : ""; }

  function bgTutHTML(open){
    return `<details class="bgi-tut"${open ? " open" : ""}><summary>Как это работает</summary>
      <ol>
        <li>Открой <a href="${BG_SITE}" target="_blank" rel="noopener">backgrounds.gallery</a> — там всё оформление из Steam. Разделы: ${BG_SECS.map(([u, l]) => `<a href="${BG_SITE}/${u}" target="_blank" rel="noopener">${l}</a>`).join(", ")}.</li>
        <li>Открой понравившийся предмет, скопируй ссылку из адресной строки и вставь её сюда. Покажется превью и кнопки, куда его поставить.</li>
        <li>Куда что идёт: <b>рамки</b> — в рамки аватарки, <b>анимированные аватары</b> — на аватар, <b>мини-профили и стартап-видео</b> — в шапку или фон профиля, <b>фоны</b> — в фон профиля или шапку, <b>стикеры</b> — в «Мои стикеры» и сразу в шапку.</li>
        <li>Всё, что поставил в шапку и фон, остаётся в <b>«Моих фонах»</b>, стикеры — в <b>«Моих стикерах»</b>: их можно вернуть в конструкторе (кнопки «Фон» и «Стикер»), качать заново не надо.</li>
      </ol>
      <p><b>Ещё быстрее — кнопка прямо на сайте</b> (только компьютер):</p>
      <ol>
        <li>Поставь расширение <a href="https://www.tampermonkey.net/" target="_blank" rel="noopener">Tampermonkey</a> — там кнопки для Chrome, Edge, Firefox, Opera и Яндекс Браузера.</li>
        <li>В Chrome, Edge и Яндекс Браузере: открой страницу расширений (<code>chrome://extensions</code> или <code>edge://extensions</code>), у Tampermonkey нажми «Подробнее» и включи <b>«Разрешить пользовательские скрипты»</b>. Без этого кнопок не будет.</li>
        <li>Открой <a href="nexus.user.js" target="_blank" rel="noopener">скрипт NEXUS</a> — Tampermonkey предложит установить, жми «Установить».</li>
        <li>Обнови backgrounds.gallery: на каждой карточке появится кнопка <b>«+ В NEXUS»</b>. Нажал — открылся NEXUS с превью, осталось выбрать, куда поставить.</li>
      </ol>
      <p class="a-sub">На телефоне — через вставку ссылки. Видео весят по несколько мегабайт: если у друга слабый интернет или включена экономия трафика, вместо видео он увидит картинку-превью.</p></details>`;
  }

  function bgSheet(url0){
    if (!ME || !SB){ toast("Сначала войди в NEXUS"); return; }
    const s = openSheet(`<h3>Оформление из Steam</h3><p class="sub">Рамки, анимированные аватары, мини-профили, стартап-видео, фоны и стикеры с <a href="${BG_SITE}" target="_blank" rel="noopener">backgrounds.gallery</a> — по ссылке на предмет.</p>
      <div class="bgi-row"><label class="v6-fl">Ссылка на предмет<input id="bgiU" inputmode="url" autocomplete="off" placeholder="https://backgrounds.gallery/item/…"></label><button type="button" class="ib" id="bgiPaste">Вставить</button><button type="button" class="ib blue" id="bgiGo">Показать</button></div>
      <div id="bgiP"></div>${bgTutHTML(!url0)}`, {wide: true});
    const q = x => s.el.querySelector(x), inp = q("#bgiU"), box = q("#bgiP");
    let cur = null, busy = false;
    const show = async () => { const u = inp.value.trim(); if (!u) return;
      if (!bgUrlOk(u)){ box.innerHTML = `<p class="bgi-err">Это не ссылка на предмет с backgrounds.gallery. Нужна вида <code>backgrounds.gallery/item/…</code> или <code>backgrounds.gallery/backgrounds/…</code></p>`; return; }
      box.innerHTML = `<p class="a-sub">Ищу предмет в Steam…</p>`; cur = null;
      try { const info = await bgCall({url: u, action: "preview"}); cur = {url: u, info};
        box.innerHTML = `<div class="bgi-card"><div class="bgi-pv${info.type === "frame" || info.type === "sticker" || info.type === "avatar" ? " sq" : ""}">${bgPrevHTML(info)}</div><div class="bgi-i"><small>${esc(BG_TYPE[info.type] || "Предмет")}${info.animated ? " · анимированный" : ""}</small><b>${esc(info.title || "Без названия")}</b>
          <div class="bgi-acts">${(info.targets || []).map(t => `<button type="button" class="ib blue" data-bgt="${esc(t)}">${esc(BG_TGT[t] || t)}</button>`).join("")}</div><p class="a-sub" id="bgiS"></p></div></div>`;
      } catch(e){ box.innerHTML = `<p class="bgi-err">Не получилось: ${esc(e.message)}</p>`; if (!/не найден|нельзя|ссылк|предмет/i.test(e.message)) logErr("импорт из Steam: превью", e); } };
    q("#bgiGo").onclick = show;
    inp.addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); show(); } });
    inp.addEventListener("paste", () => setTimeout(show, 0));
    q("#bgiPaste").onclick = async () => { try { inp.value = (await navigator.clipboard.readText()).trim(); show(); } catch(_){ inp.focus(); toast("Вставь ссылку сам: Ctrl+V"); /* ожидаемо: браузер не дал читать буфер */ } };
    box.addEventListener("click", async e => { const b = e.target.closest("[data-bgt]"); if (!b || !cur || busy) return; busy = true;
      const t = b.dataset.bgt, st = q("#bgiS"); box.querySelectorAll("[data-bgt]").forEach(x => x.disabled = true); b.textContent = "Ставлю…";
      if (st) st.textContent = cur.info.files && (cur.info.files.mp4 || cur.info.files.webm) ? "Качаю видео — это до минуты" : "Качаю файл…";
      try { const r = await bgCall({url: cur.url, action: "import", target: t});
        if (await bgApply(r)){ toast(BG_DONE[t] || "Готово"); s.close(); if (route !== "home") go("home"); else render(); }
        else throw new Error("профиль не сохранился");
      } catch(err){ if (st) st.textContent = "Не получилось: " + err.message; logErr("импорт из Steam: " + t, err);
        box.querySelectorAll("[data-bgt]").forEach(x => { x.disabled = false; x.textContent = BG_TGT[x.dataset.bgt] || x.dataset.bgt; }); }
      busy = false; });
    if (url0){ inp.value = url0; show(); } else setTimeout(() => inp.focus(), 300);
    return s;
  }

  // «Мои стикеры» / «Мои фоны» — сетка миниатюр для окон стикера и фона в конструкторе
  function bgLibHTML(kind){ const L = bgLib()[kind];
    const more = `<button type="button" class="ib" data-bgopen="1">Ещё из Steam</button>`;
    if (!L.length) return `<div class="cs-sr bgl"><b>${kind === "stk" ? "Мои стикеры" : "Мои фоны"}</b><small>Пусто. Добавь с backgrounds.gallery — они будут лежать здесь.</small><div class="cs-acs">${more}</div></div>`;
    return `<div class="cs-sr bgl"><b>${kind === "stk" ? "Мои стикеры" : "Мои фоны"}</b><div class="bgl-g">${L.map((x, i) => kind === "stk"
      ? `<button type="button" class="bgl-c" data-bgl="${i}" title="${esc(x.t || "")}"><img alt="" loading="lazy" src="${esc(publicUrl(x.img))}"></button>`
      : `<button type="button" class="bgl-c w" data-bgl="${i}" title="${esc(x.t || "")}">${x.v ? (x.pst ? `<img alt="" loading="lazy" src="${esc(publicUrl(x.pst))}">` : `<video src="${esc(publicUrl(x.id))}" muted preload="metadata"></video>`) + `<i>▶</i>` : `<img alt="" loading="lazy" src="${esc(publicUrl(x.id))}">`}</button>`).join("")}</div><div class="cs-acs">${more}</div></div>`; }

  // ссылка ?bgimport=… (её открывает кнопка «+ В NEXUS» из Tampermonkey): запоминаем до входа и открываем окно
  (() => { let u = null;
    try { u = new URLSearchParams(location.search).get("bgimport"); } catch(_){ /* ожидаемо: старый браузер */ }
    if (u){ try { sessionStorage.setItem("nx_bgimp", u); } catch(_){ /* ожидаемо: приватный режим */ }
      const p = new URLSearchParams(location.search); p.delete("bgimport"); const qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash); }
    else { try { u = sessionStorage.getItem("nx_bgimp"); } catch(_){ /* ожидаемо: приватный режим */ } }
    if (!u) return; let n = 0;
    const t = setInterval(() => { if (++n > 1200){ clearInterval(t); return; }
      if (!ME || !MEP || !SB || sheets.length) return;
      clearInterval(t); try { sessionStorage.removeItem("nx_bgimp"); } catch(_){ /* ожидаемо: приватный режим */ }
      bgSheet(u); }, 500); })();
