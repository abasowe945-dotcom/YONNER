  // ================= друзья =================
  const AVA = ["#0a84ff","#30d158","#ff9f0a","#ff375f","#bf5af2","#64d2ff","#ff453a","#ffd60a","#5e5ce6","#00c7be"];
  const avaColor = uid => AVA[[...String(uid)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % AVA.length];
  const AVA_COLORS = ["#ff453a","#ff9f0a","#ffd60a","#30d158","#00c7be","#64d2ff","#0a84ff","#5e5ce6","#bf5af2","#ff375f","#a2845e","#3a3a3c"];
  // простые мордочки: белая голова, тёмные черты, фон — цвет пользователя
  const K = "#1d1d1f", Wh = "#fff";
  const ANIMALS = {
    cat:   ["Кот", `<path d="M17 25 15 11l12 8M47 25l2-14-12 8" fill="${Wh}"/><circle cx="32" cy="35" r="17" fill="${Wh}"/><circle cx="25.5" cy="33" r="2.4" fill="${K}"/><circle cx="38.5" cy="33" r="2.4" fill="${K}"/><path d="M30 39h4l-2 2.5z" fill="#ff8fa3"/><path d="M32 41.5c-1 2-3 2.5-4.5 1.5M32 41.5c1 2 3 2.5 4.5 1.5M14 38l8 1M14 42l8-1M50 38l-8 1M50 42l-8-1" stroke="${K}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`],
    dog:   ["Пёс", `<circle cx="32" cy="34" r="16" fill="${Wh}"/><ellipse cx="16.5" cy="31" rx="5.5" ry="11" fill="${K}" transform="rotate(15 16.5 31)"/><ellipse cx="47.5" cy="31" rx="5.5" ry="11" fill="${K}" transform="rotate(-15 47.5 31)"/><circle cx="26" cy="31" r="2.3" fill="${K}"/><circle cx="38" cy="31" r="2.3" fill="${K}"/><ellipse cx="32" cy="41" rx="7" ry="5.5" fill="#f2f2f2"/><ellipse cx="32" cy="38.5" rx="3.2" ry="2.3" fill="${K}"/><path d="M32 41v2.5M29 44.5c1.5 1 4.5 1 6 0" stroke="${K}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`],
    fox:   ["Лиса", `<path d="M14 14l9 13M50 14l-9 13" stroke="${Wh}" stroke-width="7" stroke-linecap="round"/><path d="M12 24c4-2 14 0 20 2 6-2 16-4 20-2-1 12-8 23-20 26C20 47 13 36 12 24z" fill="#ff7a1a"/><path d="M14 30c5 0 11 4 18 12 7-8 13-12 18-12-3 10-9 16-18 18-9-2-15-8-18-18z" fill="${Wh}"/><circle cx="25" cy="31" r="2.3" fill="${K}"/><circle cx="39" cy="31" r="2.3" fill="${K}"/><circle cx="32" cy="44.5" r="2.4" fill="${K}"/>`],
    bear:  ["Медведь", `<circle cx="19" cy="20" r="6.5" fill="#8a5a3c"/><circle cx="45" cy="20" r="6.5" fill="#8a5a3c"/><circle cx="32" cy="34" r="17" fill="#a0694a"/><ellipse cx="32" cy="40" rx="8" ry="6.5" fill="#e8c9a8"/><circle cx="25.5" cy="31" r="2.3" fill="${K}"/><circle cx="38.5" cy="31" r="2.3" fill="${K}"/><ellipse cx="32" cy="37.5" rx="3" ry="2.2" fill="${K}"/><path d="M32 39.5v2.5M29.5 43c1.5 1 3.5 1 5 0" stroke="${K}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`],
    panda: ["Панда", `<circle cx="19" cy="20" r="6.5" fill="${K}"/><circle cx="45" cy="20" r="6.5" fill="${K}"/><circle cx="32" cy="34" r="17" fill="${Wh}"/><ellipse cx="25" cy="32" rx="4.5" ry="5.8" fill="${K}" transform="rotate(-25 25 32)"/><ellipse cx="39" cy="32" rx="4.5" ry="5.8" fill="${K}" transform="rotate(25 39 32)"/><circle cx="25.5" cy="31.5" r="1.4" fill="${Wh}"/><circle cx="38.5" cy="31.5" r="1.4" fill="${Wh}"/><ellipse cx="32" cy="39" rx="2.8" ry="2" fill="${K}"/><path d="M29.5 42.5c1.5 1 3.5 1 5 0" stroke="${K}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`],
    bunny: ["Заяц", `<ellipse cx="24.5" cy="15" rx="4.6" ry="12" fill="${Wh}"/><ellipse cx="39.5" cy="15" rx="4.6" ry="12" fill="${Wh}"/><ellipse cx="24.5" cy="15" rx="2" ry="8" fill="#ffb3c1"/><ellipse cx="39.5" cy="15" rx="2" ry="8" fill="#ffb3c1"/><circle cx="32" cy="37" r="15" fill="${Wh}"/><circle cx="26" cy="35" r="2.3" fill="${K}"/><circle cx="38" cy="35" r="2.3" fill="${K}"/><path d="M30 40h4l-2 2z" fill="#ff8fa3"/><path d="M32 42v2M30 46h4" stroke="${K}" stroke-width="1.5" stroke-linecap="round"/>`],
    frog:  ["Жаба", `<circle cx="22" cy="22" r="8" fill="#5ed36a"/><circle cx="42" cy="22" r="8" fill="#5ed36a"/><ellipse cx="32" cy="37" rx="19" ry="14" fill="#5ed36a"/><circle cx="22" cy="21.5" r="4.5" fill="${Wh}"/><circle cx="42" cy="21.5" r="4.5" fill="${Wh}"/><circle cx="22.5" cy="22" r="2.3" fill="${K}"/><circle cx="42.5" cy="22" r="2.3" fill="${K}"/><path d="M19 38c6 6 20 6 26 0" stroke="${K}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="18" cy="35" r="2.2" fill="#ff8fa3" opacity=".7"/><circle cx="46" cy="35" r="2.2" fill="#ff8fa3" opacity=".7"/>`],
    owl:   ["Сова", `<path d="M15 16l8 8M49 16l-8 8" stroke="#8a5a3c" stroke-width="5" stroke-linecap="round"/><ellipse cx="32" cy="35" rx="18" ry="17" fill="#a0694a"/><circle cx="24.5" cy="31" r="7.5" fill="${Wh}"/><circle cx="39.5" cy="31" r="7.5" fill="${Wh}"/><circle cx="24.5" cy="31" r="3.4" fill="${K}"/><circle cx="39.5" cy="31" r="3.4" fill="${K}"/><path d="M29 38l3 5 3-5z" fill="#ffb21a"/><path d="M22 46c3 2 6 2 10 0 4 2 7 2 10 0" stroke="#e8c9a8" stroke-width="2" fill="none" stroke-linecap="round"/>`],
    peng:  ["Пингвин", `<ellipse cx="32" cy="35" rx="18" ry="18" fill="${K}"/><path d="M32 26c-4-5-13-4-13 4 0 9 6 16 13 18 7-2 13-9 13-18 0-8-9-9-13-4z" fill="${Wh}"/><circle cx="26" cy="32" r="2.3" fill="${K}"/><circle cx="38" cy="32" r="2.3" fill="${K}"/><path d="M28 37h8l-4 4.5z" fill="#ffb21a"/>`],
    pig:   ["Свин", `<path d="M17 24l-1-11 10 6M47 24l1-11-10 6" fill="#ffb3c1"/><circle cx="32" cy="35" r="17" fill="#ffc8d3"/><circle cx="25" cy="31" r="2.3" fill="${K}"/><circle cx="39" cy="31" r="2.3" fill="${K}"/><ellipse cx="32" cy="40" rx="7.5" ry="5.5" fill="#ff9fb3"/><ellipse cx="29.3" cy="40" rx="1.6" ry="2.3" fill="#c25d73"/><ellipse cx="34.7" cy="40" rx="1.6" ry="2.3" fill="#c25d73"/>`],
    mouse: ["Мышь", `<circle cx="17" cy="22" r="10" fill="#c9c9d0"/><circle cx="47" cy="22" r="10" fill="#c9c9d0"/><circle cx="17" cy="22" r="6" fill="#ffb3c1"/><circle cx="47" cy="22" r="6" fill="#ffb3c1"/><circle cx="32" cy="37" r="15" fill="#dcdce2"/><circle cx="26.5" cy="35" r="2.3" fill="${K}"/><circle cx="37.5" cy="35" r="2.3" fill="${K}"/><circle cx="32" cy="41" r="2.4" fill="#ff8fa3"/><path d="M20 40l7 1M20 44l7-1M44 40l-7 1M44 44l-7-1" stroke="${K}" stroke-width="1.3" stroke-linecap="round"/>`],
    racc:  ["Енот", `<path d="M15 24l2-11 9 7M49 24l-2-11-9 7" fill="#8e8e93"/><circle cx="32" cy="35" r="17" fill="#aeaeb2"/><path d="M15 31c5-5 12-5 17 0 5-5 12-5 17 0-2 6-9 8-17 4-8 4-15 2-17-4z" fill="${K}"/><circle cx="25" cy="32" r="2.2" fill="${Wh}"/><circle cx="39" cy="32" r="2.2" fill="${Wh}"/><path d="M24 42c4 6 12 6 16 0z" fill="${Wh}"/><ellipse cx="32" cy="41" rx="2.6" ry="1.9" fill="${K}"/>`],
  };
  const animalSVG = k => ANIMALS[k] ? `<svg viewBox="0 0 64 64" aria-hidden="true">${ANIMALS[k][1]}</svg>` : "";
  const avaBg = p => p.ava_color || avaColor(p.user_id);
  const avaHTML = (p, size) => { p = p || {}; size = size === true ? "big" : (size || "");
    const inner = p.avatar ? `<img alt="" src="${publicUrl(p.avatar)}" loading="lazy" onerror="this.remove()">` : p.ava_animal && ANIMALS[p.ava_animal] ? animalSVG(p.ava_animal) : esc((p.nick || "?").slice(0, 1).toUpperCase());
    return `<span class="fr-ava${size ? " " + size : ""}" style="background:${avaBg(p)}" title="${esc(p.nick || "")}">${inner}</span>`; };
  // 6.1: большой аватар в профиле — своя форма и свой кадр; везде ещё остаётся маленький квадрат
  const avaShape = p => { const c = p && p.ava_cfg; return c && ["square", "round", "circle", "portrait"].includes(c.shape) ? c.shape : "square"; };
  const avaBigHTML = p => { p = p || {}; const c = p.ava_cfg, sh = avaShape(p); if (!c) return avaHTML(p, "big");
    const src = p.avatar ? (p.avatar_full || p.avatar) : null;
    if (!src) return avaHTML(p, "big").replace('class="fr-ava big"', `class="fr-ava big v6-shape-${sh}"`);
    return `<span class="fr-ava big v6-shape-${sh}" style="background:${avaBg(p)}" title="${esc(p.nick || "")}"><img alt="" src="${publicUrl(src)}" style="${p.avatar_full && c.big ? posStyle(c.big) : ""}" onerror="this.remove()"></span>`; };
  let MEP = null; // мой профиль: ник, фото, зверь, цвет
  const myProf = () => ({user_id: ME ? ME.id : "", nick: NICK, ...(MEP || {})});
  const profOf = uid => uid === (ME && ME.id) ? myProf() : (FR && FR.profiles.find(x => x.user_id === uid)) || {user_id: uid, nick: "?"};
  const avaStack = (uids, max = 5) => `<span class="ava-stack">${uids.slice(0, max).map(u => avaHTML(profOf(u), "sm")).join("")}${uids.length > max ? `<span class="more">+${uids.length - max}</span>` : ""}</span>`;
  function avaSheet(first){
    return new Promise(res => {
      let st = {avatar: (MEP && MEP.avatar) || null, ava_animal: (MEP && MEP.ava_animal) || null, ava_color: (MEP && MEP.ava_color) || AVA_COLORS[Math.floor(Math.random() * AVA_COLORS.length)]}, file = null;
      // 6.1: форма в профиле и два кадра — большой для профиля, маленький квадрат для остального сайта
      const c0 = (MEP && MEP.ava_cfg) || {}; let cfg = {shape: c0.shape || "square", big: {x: 50, y: 50, s: 1, ...(c0.big || {})}, sm: {x: 50, y: 50, s: 1, ...(c0.sm || {})}}, smMoved = false, fileUrl = null;
      const fullSrc = () => file ? fileUrl : MEP && MEP.avatar_full && st.avatar ? publicUrl(MEP.avatar_full) : st.avatar ? publicUrl(st.avatar) : null;
      const prevP = () => ({...myProf(), ...st, avatar: file ? null : st.avatar});
      const s = openSheet(`<h3>${first ? "Выбери аватарку" : "Аватар"}</h3><p class="sub">Видна друзьям в ленте, в профиле, у релизов и в совместной рулетке. Фото можно перетащить сюда или вставить через Ctrl+V.</p>
        <div class="av-prev" id="avPrev"></div><div id="v6Ava"></div>
        <div class="acts"><label class="ib" for="avF">Загрузить фото</label><input type="file" id="avF" accept="image/*" hidden><button class="ib" id="avRm" ${st.avatar ? "" : "hidden"}>Убрать фото</button></div>
        <div class="av-lb">Или зверь</div><div class="av-grid" id="avA"></div>
        <div class="av-lb">Цвет фона</div><div class="av-cols" id="avC">${AVA_COLORS.map(c => `<button style="background:${c}" data-c="${c}" aria-label="Цвет"></button>`).join("")}</div>
        <div class="acts" style="margin-top:18px"><button class="ib blue" id="avOk">${first ? "Готово" : "Сохранить"}</button><button class="ib" id="avNo">${first ? "Пропустить" : "Отмена"}</button></div>`, {onClose: () => res(null)});
      const q = sel => s.el.querySelector(sel);
      const draw = () => {
        q("#avPrev").innerHTML = file ? `<span class="fr-ava" style="background:${st.ava_color}"><img alt="" src="${URL.createObjectURL(file)}"></span>` : avaHTML(prevP());
        q("#avA").innerHTML = [["", "Буква"], ...Object.entries(ANIMALS).map(([k, v]) => [k, v[0]])].map(([k, l]) => `<button data-a="${k}" title="${l}" aria-pressed="${!file && !st.avatar && (st.ava_animal || "") === k}">${avaHTML({...myProf(), avatar: null, ava_animal: k || null, ava_color: st.ava_color})}</button>`).join("");
        q("#avC").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === st.ava_color));
        q("#avRm").hidden = !(st.avatar || file);
        const src = fullSrc(), canSm = !!(file || (MEP && MEP.avatar_full && st.avatar));
        q("#v6Ava").innerHTML = `<div class="av-lb">Форма в профиле</div><div class="v6-shp">${[["square", "Квадрат"], ["round", "Скруглённый"], ["circle", "Круг"], ["portrait", "Прямоугольник"]].map(([k, l]) => `<button type="button" data-shp="${k}" aria-pressed="${cfg.shape === k}"><i class="v6-si ${k}"></i>${l}</button>`).join("")}</div>
          ${src ? `<div class="v6-crops"><div class="v6-cw"><div class="v6-crop shape-${cfg.shape}" data-crop="big"><img alt="" src="${src}" style="${posStyle(cfg.big)}" draggable="false"></div><span>В профиле</span><input type="range" min="1" max="3" step=".02" value="${cfg.big.s}" data-zoom="big" aria-label="Масштаб в профиле"></div>
            <div class="v6-cw"><div class="v6-crop sq${canSm ? "" : " off"}" data-crop="sm"><img alt="" src="${src}" style="${posStyle(canSm ? cfg.sm : {})}" draggable="false"></div><span>Везде на сайте</span>${canSm ? `<input type="range" min="1" max="3" step=".02" value="${cfg.sm.s}" data-zoom="sm" aria-label="Масштаб на сайте">` : `<small>Чтобы выбрать кадр, загрузи фото заново</small>`}</div></div><p class="v6-hint">Двигай картинку пальцем или мышкой, масштаб — ползунком. В ленте, рейтинге и комментариях аватар всегда маленький квадрат.</p>` : ""}`;
      };
      q("#v6Ava").addEventListener("click", e => { const b = e.target.closest("[data-shp]"); if (!b) return; cfg.shape = b.dataset.shp; draw(); });
      q("#v6Ava").addEventListener("input", e => { const z = e.target.closest("[data-zoom]"); if (!z) return; const k = z.dataset.zoom; cfg[k].s = +z.value; if (k === "sm") smMoved = true; const im = q(`[data-crop="${k}"] img`); if (im) im.style.cssText = posStyle(cfg[k]); });
      let drag = null;
      q("#v6Ava").addEventListener("pointerdown", e => { const f = e.target.closest("[data-crop]"); if (!f || f.classList.contains("off")) return; e.preventDefault(); const k = f.dataset.crop; drag = {k, f, x: e.clientX, y: e.clientY, p: {...cfg[k]}}; f.setPointerCapture(e.pointerId); });
      q("#v6Ava").addEventListener("pointermove", e => { if (!drag) return; const r = drag.f.getBoundingClientRect(), c = cfg[drag.k];
        c.x = Math.max(0, Math.min(100, drag.p.x - (e.clientX - drag.x) / r.width * 100 / c.s * 1.6)); c.y = Math.max(0, Math.min(100, drag.p.y - (e.clientY - drag.y) / r.height * 100 / c.s * 1.6));
        if (drag.k === "sm") smMoved = true; const im = drag.f.querySelector("img"); if (im) im.style.cssText = posStyle(c); });
      q("#v6Ava").addEventListener("pointerup", () => { drag = null; });
      q("#avA").onclick = e => { const b = e.target.closest("[data-a]"); if (!b) return; st.ava_animal = b.dataset.a || null; st.avatar = null; file = null; draw(); };
      q("#avC").onclick = e => { const b = e.target.closest("[data-c]"); if (!b) return; st.ava_color = b.dataset.c; draw(); };
      const takeAva = f => { if (f && f.type.startsWith("image/")){ file = f; fileUrl = URL.createObjectURL(f); cfg.big = {x: 50, y: 50, s: 1}; cfg.sm = {x: 50, y: 50, s: 1}; smMoved = true; draw(); } };
      q("#avF").onchange = e => takeAva(e.target.files[0]);
      pasteTarget = takeAva; bindDrop(q("#avPrev"), takeAva); bindDrop(s.el, takeAva);
      q("#avRm").onclick = () => { st.avatar = null; file = null; draw(); };
      q("#avNo").onclick = async () => { if (first && !MEP?.ava_color){ await saveProf({ava_color: st.ava_color}); } s.close(); };
      q("#avOk").onclick = async () => {
        const btn = q("#avOk"); btn.disabled = true; btn.textContent = "Сохраняю…";
        try {
          if (file){ st.avatar = await squareUpload(file, cfg.sm); st.avatar_full = await fullUpload(file); }
          else if (smMoved && MEP && MEP.avatar_full && st.avatar){ try { st.avatar = await squareUpload(publicUrl(MEP.avatar_full), cfg.sm); } catch(err){ logErr("кадр аватарки", err); toast("Кадр для сайта не обновился — загрузи фото заново"); } }
          if (!st.avatar) st.avatar_full = null;
          st.ava_cfg = cfg;
          if (await saveProf(st)){ toast("Аватар обновлён"); res(st); s.close(); }
        } catch(e){ toast("Не получилось загрузить фото"); }
        btn.disabled = false; btn.textContent = first ? "Готово" : "Сохранить";
      };
      draw();
    });
  }
  async function squareUpload(file, pos){
    const img = await new Promise((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = file instanceof Blob ? URL.createObjectURL(file) : file; });
    const S = 320, c = document.createElement("canvas"); c.width = c.height = S;
    const p = {x: 50, y: 50, s: 1, ...(pos || {})}, iw = img.naturalWidth, ih = img.naturalHeight, k = Math.max(S / iw, S / ih), dw = iw * k, dh = ih * k;
    const ox = (S - dw) * p.x / 100, oy = (S - dh) * p.y / 100, cx = S * p.x / 100, cy = S * p.y / 100, x = c.getContext("2d"); x.imageSmoothingQuality = "high";
    x.drawImage(img, cx + (ox - cx) * p.s, cy + (oy - cy) * p.s, dw * p.s, dh * p.s); // 6.1: кадр, выбранный вручную (как у обложек)
    const blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", .88));
    return (await assets.upload(blob, {type: "image/jpeg"})).id;
  }
  // 6.1: большая копия аватарки для профиля (до 1200 px по длинной стороне)
  async function fullUpload(file){
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(file); });
    const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", .9));
    return (await assets.upload(blob, {type: "image/jpeg"})).id;
  }
  async function saveProf(patch){
    const row = {user_id: ME.id, nick: NICK, ...patch};
    let {error} = await SB.from("profiles").upsert(row);
    if (error && /avatar_full|ava_cfg/.test(error.message || "")){ delete row.avatar_full; delete row.ava_cfg; delete patch.avatar_full; delete patch.ava_cfg; ({error} = await SB.from("profiles").upsert(row)); if (!error) toast("Аватар сохранён, а форма заработает после обновления базы"); }
    if (error){ toast("Не сохранилось: " + error.message); return false; }
    MEP = {...(MEP || {}), ...patch};
    if (FR){ const p = FR.profiles.find(x => x.user_id === ME.id); if (p) Object.assign(p, patch); else FR.profiles.push(row); }
    render(); return true;
  }
  const normT = t => String(t || "").toLowerCase().replace(/[™®©]/g, "").replace(/\b(the|game of the year|goty|definitive|remastered|remaster|deluxe|complete|enhanced|ultimate|director'?s cut|final cut|edition)\b/g, " ").replace(/(^|[^\p{L}])(издание|издания|изд)(?=[^\p{L}]|$)/gu, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const frKeys = it => { const p = isGame(it) ? "g|" : "k|", out = [p + normT(it.title)]; if (it.originalTitle) out.push(p + normT(it.originalTitle)); if (it.steamId) out.push("g|s:" + it.steamId); if (it.kpId) out.push("k|kp:" + it.kpId); return [...new Set(out.filter(k => k.length > 2))]; };
  const frKey = it => frKeys(it)[0];
  const sameIt = (a, b) => { const kb = frKeys(b); return frKeys(a).some(k => kb.includes(k)); };
  const frNick = uid => { const p = FR && FR.profiles.find(x => x.user_id === uid); return p ? p.nick : "кто-то"; };
  async function loadFriends(force){
    if (!SB || !ME) return null;
    if (FR && !force && Date.now() - FR.at < 60000) return FR;
    if (frLoading) return frLoading;
    frLoading = (async () => {
      try {
        let [pr, it, rd, sc, tq] = await Promise.all([fetchAll(() => SB.from("profiles").select(PF_COLS), ["user_id"]), fetchAll(() => SB.rpc("public_items"), ["user_id", "id"]), fetchAll(() => SB.from("reads").select("id,user_id,data,updated_at"), ["user_id", "id"]), fetchAll(() => SB.from("showcases").select("*"), ["id"]), fetchAll(() => SB.from("tierlists").select("*").order("updated_at", {ascending: false}), ["id"])]);
        if (pr.error) pr = await fetchAll(() => SB.from("profiles").select("user_id,nick,avatar,ava_animal,ava_color,birthday,created_at"), ["user_id"]);
        if (pr.error) throw pr.error; if (it.error) throw it.error;
        FR = {at: Date.now(), profiles: pr.data || [], items: (it.data || []).map(r => ({...(r.data || {}), id: r.id, uid: r.user_id, _upd: r.updated_at})), reads: rd && !rd.error ? (rd.data || []).map(r => ({...(r.data || {}), id: r.id, uid: r.user_id, _upd: r.updated_at})) : [], showcases: sc && !sc.error ? (sc.data || []).map(x => ({...x, entries: Array.isArray(x.entries) ? x.entries : []})) : [], tierlists: tq && !tq.error ? (tq.data || []).map(x => ({...x, tiers: Array.isArray(x.tiers) ? x.tiers : [], pool: Array.isArray(x.pool) ? x.pool : []})) : []};
        if (FV) items = frItems(FV);
      } catch(e){ logErr("загрузка друзей", e); if (force || !FR) toast("Не получилось загрузить друзей: " + (e.message || e)); if (!FR) FR = {at: Date.now(), profiles: [], items: [], failed: true}; }
      frLoading = null; render(); return FR;
    })();
    return frLoading;
  }
  const frItems = uid => FR ? FR.items.filter(i => i.uid === uid) : [];
  const myKeys = () => { const s = new Set(); MYITEMS.forEach(i => frKeys(i).forEach(k => s.add(k))); s.hasIt = it => frKeys(it).some(k => s.has(k)); return s; };
  function compat(uid){
    const mine = new Map(); MYITEMS.filter(inLib).filter(i => typeof i.rating === "number").forEach(i => frKeys(i).forEach(k => { if (!mine.has(k)) mine.set(k, i); }));
    const hit = f => { const k = frKeys(f).find(x => mine.has(x)); return k ? mine.get(k) : null; };
    const common = frItems(uid).filter(inLib).filter(i => typeof i.rating === "number" && hit(i))
      .map(f => { const m = hit(f); return {f, m, d: Math.abs(f.rating - m.rating)}; });
    const pct = common.length >= 2 ? Math.max(0, Math.round(100 - common.reduce((s, c) => s + c.d, 0) / common.length * 12)) : null;
    return {common, pct};
  }
  const pctCls = p => p == null ? "" : p >= 75 ? "hi" : p >= 50 ? "mid" : "lo";
  function feedEvents(uid){
    const ev = [];
    for (const it of FR ? FR.items : []){
      if (it.uid === ME.id || (uid && it.uid !== uid)) continue;
      const add = (d, verb) => { if (d) ev.push({it, d: String(d).slice(0, 10), verb}); };
      if (isGame(it)){
        const s = gStatus(it.status);
        if (it.status === "future") add(it.createdAt, "хочет поиграть в");
        else if (it.status === "soon") add(it.createdAt, "ждёт релиз");
        else if (s === "done") add(it.finishedAt || it.date, "прошёл");
        else if (s === "dropped") add(it.finishedAt || it.date, "дропнул");
        else if (s === "endless") add(it.date || it.createdAt, "залип в");
        else add(it.date || it.createdAt, "начал играть в");
      } else {
        if (it.status === "future") add(it.createdAt, "хочет посмотреть");
        else if (it.status === "soon") add(it.createdAt, "ждёт премьеру");
        else if (it.status === "done" || it.status === "played") add(it.date || it.updatedAt, "посмотрел");
        else if (it.status === "dropped") add(it.updatedAt || it._upd, "бросил");
        else if (it.status === "paused") add(it.updatedAt || it._upd, "отложил");
        else add(it.date || it.createdAt, "смотрит");
      }
    }
    return ev.sort((a, b) => b.d.localeCompare(a.d));
  }
  const agoTxt = d => { const n = Math.round((parseD(today()) - parseD(d)) / 864e5); return n <= 0 ? "сегодня" : n === 1 ? "вчера" : n < 30 ? `${n} ${plural(n, "день", "дня", "дней")} назад` : fmtDate(d); };
  const feedRow = (e, showNick = true) => {
    const r = typeof e.it.rating === "number" && /прошёл|дропнул|посмотрел|бросил/.test(e.verb) ? `<span class="r ${rateCls(e.it.rating)}">${num1(e.it.rating)}</span>` : "";
    return `<button class="fd-row" data-fi="${esc(e.it.uid + "/" + e.it.id)}">${posterHTML(e.it, {rate:false, tgt:false, badge:false})}${showNick ? avaHTML(profOf(e.it.uid), "sm") : ""}<span class="t">${showNick ? `<b>${esc(frNick(e.it.uid))}</b> ` : ""}${e.verb} <b>${esc(e.it.title)}</b><small>${agoTxt(e.d)}${isGame(e.it) ? " · игра" : " · " + esc(KTYPES[e.it.type] || "кино")}</small></span>${r}</button>`;
  };

  function fvBanner(kind){
    if (!FV) return "";
    const p = profOf(FV), c = FR ? compat(FV) : {pct: null};
    return `<div class="fv-ban">${avaHTML(p, "md")}<div class="t"><b>Полка ${esc(p.nick || "")}</b><small>${c.pct != null ? `совпадение вкусов ${c.pct}% · ` : ""}только просмотр, нажми на карточку, чтобы взять к себе</small></div>
      <div class="seg"><a href="#fv:${esc(FV)}:games" ${kind === "games" ? 'aria-current="page"' : ""}>Игры</a><a href="#fv:${esc(FV)}:kino" ${kind === "kino" ? 'aria-current="page"' : ""}>Кино</a></div>
      <a class="fv-back" href="#user:${esc(FV)}">‹ Профиль</a></div>`;
  }
  function friendItemSheet(key){
    const [uid, id] = key.split("/"); const it = FR && FR.items.find(i => i.uid === uid && i.id === id); if (!it) return;
    const g = isGame(it), have = myKeys().hasIt(it);
    const st = isFuture(it) ? "На будущее" : isSoon(it) ? (g ? "Ждёт релиз" : "Ждёт премьеру") : g ? GSTATUS[gStatus(it.status)] : kLab(it).l;
    const dates = [it.date && !isFuture(it) ? `начал ${fmtDate(it.date)}` : "", it.finishedAt ? `закончил ${fmtDate(it.finishedAt)}` : "", it.releaseDate ? `выход ${relLabel(it)}` : (it.release ? `выход ${it.release}` : "")].filter(Boolean).join(" · ");
    const mine = MYITEMS.find(i => sameIt(i, it));
    const s = openSheet(`<div class="qa-top">${posterHTML(it, {tgt:false})}<div><h3>${esc(it.title)}</h3>
        <p class="sub">${esc([g ? "Игра" : KTYPES[it.type], it.year, genres(it).slice(0, 3).join(", ")].filter(Boolean).join(" · "))}</p>
        <p class="sub" style="margin-top:8px">${avaHTML(profOf(uid), "xs")} <b style="color:inherit">${esc(frNick(uid))}</b>: ${esc(st)}${typeof it.rating === "number" ? ` · оценка <b style="color:inherit">${num1(it.rating)}</b>` : ""}${it.tier ? ` · тир ${esc(it.tier)}` : ""}</p>
        ${dates ? `<p class="sub" style="margin-top:4px">${esc(dates)}</p>` : ""}
        ${mine && typeof mine.rating === "number" ? `<p class="sub" style="margin-top:4px">Твоя оценка: <b style="color:inherit">${num1(mine.rating)}</b></p>` : ""}</div></div>
      ${it.desc ? `<p class="sub" style="margin:14px 0 0;max-height:150px;overflow:auto;white-space:pre-line">${esc(it.desc.slice(0, 900))}</p>` : ""}
      ${have ? `<div class="acts" style="margin-top:16px"><button class="ib full" disabled>Уже есть у тебя</button></div>`
        : isSoon(it) ? `<div class="acts" style="margin-top:16px"><button class="ib blue full" data-take="soon">Жду вместе</button></div>`
        : `<div class="av-lb" style="margin-top:16px">Взять к себе как</div><div class="fi-take">${(g ? [["done", "Прошёл", ICON.medal], ["old", "Играл давно", ICON.medal], ["playing", "Играю", ICON.pad], ["dropped", "Дропнул", ICON.blood], ["future", "Буду проходить", ICON.clock]] : [["done", "Посмотрел", ICON.film], ["old", "Смотрел давно", ICON.film], ...(isSerT(it.type) ? [["playing", "Смотрю", ICON.kino]] : []), ["future", "Буду смотреть", ICON.clock]]).map(([k, l, ic]) => `<button class="fi-t ${k}" data-take="${k}">${ic}<span>${l}</span></button>`).join("")}</div>
        <div class="fi-drop" id="fiDrop" hidden><label class="f">Почему дропнул <small style="text-transform:none;letter-spacing:0;opacity:.7">по желанию</small><textarea class="in" id="fiDR" rows="2" maxlength="300" placeholder="Надоел гринд, сломался сюжет…"></textarea></label><div class="acts"><button class="ib red" data-take="dropped!">Дропнул</button><button class="ib" id="fiDN">Отмена</button></div></div>`}`);
    s.el.querySelector(".qa-top .poster").classList.add("qa-poster");
    const fdN = s.el.querySelector("#fiDN"); if (fdN) fdN.onclick = () => { s.el.querySelector("#fiDrop").hidden = true; s.el.querySelector(".fi-take").hidden = false; };
    s.el.querySelectorAll("[data-take]").forEach(b => b.onclick = async () => {
      if (b.dataset.take === "dropped"){ s.el.querySelector(".fi-take").hidden = true; s.el.querySelector("#fiDrop").hidden = false; setTimeout(() => s.el.querySelector("#fiDR").focus(), 30); return; }
      s.el.querySelectorAll("[data-take]").forEach(x => x.disabled = true); b.classList.add("busy");
      const mode = b.dataset.take === "dropped!" ? "dropped" : b.dataset.take, reason = mode === "dropped" ? s.el.querySelector("#fiDR").value.trim() : "";
      const id = await takeFromFriend(it, mode, reason); if (id){ s.close(); if (b.dataset.take === "done" || b.dataset.take === "old") setTimeout(() => { if (!FV) openItem(id); else toast("Оценку поставишь в своей карточке"); }, 120); } else s.el.querySelectorAll("[data-take]").forEach(x => x.disabled = false); });
  }
  async function takeFromFriend(it, mode, reason){
    if (!db) return false;
    if (myKeys().hasIt(it)){ toast("Уже есть у тебя"); return false; }
    const keep = ["title", "type", "genre", "desc", "year", "release", "coverPos", "epTotal", "seasons", "seasonEps", "originalTitle", "director", "country", "duration", "steamId", "kpId"];
    const soon = isSoon(it) && it.releaseDate;
    const old = mode === "old"; if (old) mode = "done";
    const st = soon ? "soon" : mode === "done" ? "done" : mode === "playing" ? "playing" : mode === "dropped" && isGame(it) ? "dropped" : "future";
    const body = {status: st, createdAt: now(), updatedAt: now(), via: "friend:" + frNick(it.uid)};
    if (st === "done" || st === "dropped"){ if (isGame(it)) body.addedDone = true;
      if (old) body.noDate = true; else { body.date = today(); if (isGame(it)) body.finishedAt = today(); } }
    if (st === "dropped") body.dropReason = reason || null;
    if (st === "playing") body.date = today();
    if (soon){ body.releaseDate = it.releaseDate; if (it.releasePrec) body.releasePrec = it.releasePrec; }
    keep.forEach(k => { if (it[k] != null) body[k] = it[k]; });
    if (it.cover && assets){
      try { const r = await fetch(publicUrl(it.cover)); if (!r.ok) throw 0; const bl = await r.blob(); body.cover = (await assets.upload(bl, {type: bl.type || "image/jpeg"})).id; } catch(e){ delete body.coverPos; }
    }
    try { const {id} = await db.collection("items").add(body); toast(soon ? `${it.title} — ждёшь вместе` : st === "done" ? `${it.title} — ${isGame(it) ? "в пройденных" : "в просмотренных"}` : st === "dropped" ? `${it.title} — в дропе` : st === "playing" ? `${it.title} — ${isGame(it) ? "играешь" : "смотришь"}` : `${it.title} — в «${isGame(it) ? "Список желаемого" : "На будущее"}»`); return id; } catch(e){ toast("Не сохранилось"); return false; }
  }

  function coopRoulette(kind){
    const p = FR && FR.profiles.find(x => x.user_id === viewUid); if (!p) return;
    const g = kind === "games", pick = list => list.filter(i => (g ? isGame(i) : !isGame(i)) && isFuture(i));
    const mineL = pick(MYITEMS), theirL = pick(frItems(p.user_id)), tk = new Set(theirL.flatMap(frKeys));
    const both = mineL.filter(i => frKeys(i).some(k => tk.has(k))).map(i => ({it: i, who: "оба хотите", uids: [ME.id, p.user_id]}));
    const pool = both.length ? both : [...mineL.map(i => ({it: i, who: "из твоего списка", uids: [ME.id]})), ...theirL.map(i => ({it: i, who: `из списка ${p.nick}`, uids: [p.user_id]}))];
    const title = g ? "Во что поиграть вместе" : "Что посмотреть вместе";
    if (!pool.length){ openSheet(`<h3>${title}</h3><p class="sub">У вас обоих пусто в «${g ? "Список желаемого" : "На будущее"}»${g ? "" : " для кино"}. Добавьте что-нибудь, и будет из чего крутить.</p>`); return; }
    const s = openSheet(`<h3>${title}</h3><div style="display:flex;justify-content:center;margin:4px 0 8px"><span class="ava-stack" style="--av-ring:#1c1c1e">${avaHTML(myProf(), "md")}${avaHTML(p, "md")}</span></div><p class="sub">${both.length ? `Крутим из общего: ${both.length} ${plural(both.length, "позиция", "позиции", "позиций")} есть в «${g ? "Список желаемого" : "На будущее"}» у обоих.` : `Общего нет, крутим из обоих списков: ${pool.length} ${plural(pool.length, "позиция", "позиции", "позиций")}.`}</p>
      <div class="cr-box" id="crBox"><div id="crP"></div><div class="t" id="crT"></div><div class="w" id="crW"></div></div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="crGo">Крутить</button><span id="crX"></span></div>`);
    const show = x => { s.el.querySelector("#crP").innerHTML = posterHTML(x.it, {rate:false, tgt:false, badge:false}); s.el.querySelector("#crT").textContent = x.it.title; s.el.querySelector("#crW").innerHTML = `${avaStack(x.uids)} ${esc(x.who)}`; };
    let busy = false;
    const spin = () => {
      if (busy) return; busy = true; const box = s.el.querySelector("#crBox"); box.classList.remove("win"); box.classList.add("spin"); s.el.querySelector("#crX").innerHTML = "";
      const win = pool[Math.floor(Math.random() * pool.length)]; let n = 0; const total = pool.length > 1 ? 22 : 1;
      const step = () => { n++; show(n >= total ? win : pool[Math.floor(Math.random() * pool.length)]);
        if (n < total) setTimeout(step, 40 + n * n * .55); else { box.classList.remove("spin"); box.classList.add("win"); busy = false; s.el.querySelector("#crGo").textContent = "Ещё раз";
          if (win.it.uid && !myKeys().hasIt(win.it)){ s.el.querySelector("#crX").innerHTML = `<button class="ib" id="crTake">Взять к себе</button>`; s.el.querySelector("#crTake").onclick = async e => { e.target.disabled = true; if (await takeFromFriend(win.it)) e.target.textContent = "Добавлено"; else e.target.disabled = false; }; } } };
      step();
    };
    s.el.querySelector("#crGo").onclick = spin; spin();
  }

  // ================= бэкап: записи + картинки в одном zip =================
  const imgIds = it => [it.cover, it.wallpaper, ...(Array.isArray(it.shots) ? it.shots : [])].filter(x => typeof x === "string" && x);
  const MIME = {png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif"};
  const extMime = p => MIME[(p.split(".").pop() || "").toLowerCase()] || "image/png";
  const needZip = async () => { for (let i = 0; i < 50 && !window.JSZip; i++) await new Promise(r => setTimeout(r, 100)); if (!window.JSZip) throw new Error("nozip"); };
  function saveBlob(blob, name){
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }
  async function exportZip(onProg){
    await needZip();
    const zip = new JSZip(), ids = [...new Set(MYITEMS.flatMap(imgIds))];
    let done = 0, ok = 0, i = 0;
    const worker = async () => { while (i < ids.length){ const id = ids[i++];
      try { const r = await fetch(publicUrl(id), {cache: "force-cache"}); if (!r.ok) throw 0; zip.file("media/" + id, await r.blob()); ok++; } catch(e){ /* ожидаемо: картинку удалили — бэкап идёт без неё */ }
      done++; onProg && onProg(done, ids.length); } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    zip.file("nexus.json", JSON.stringify({nexus: 2, nick: NICK, exportedAt: now(), items: MYITEMS, theme}, null, 2));
    const blob = await zip.generateAsync({type: "blob", compression: "STORE"});
    saveBlob(blob, `${NICK}-nexus-${today()}.zip`);
    const info = {at: now(), items: MYITEMS.length, files: ok, missing: ids.length - ok};
    lastBackup = info; try { await db.doc("meta/backup").set(info); } catch(e){ logErr("бэкап: отметка", e); }
    return info;
  }
  async function runBackup(btn){
    if (backupBusy || !ME) return; backupBusy = true;
    const label = btn ? btn.textContent : "";
    try {
      const info = await exportZip((d, n) => { if (btn) btn.textContent = `Картинки ${d}/${n}…`; });
      toast(`Бэкап готов: ${info.items} ${plural(info.items, "запись", "записи", "записей")}, ${info.files} ${plural(info.files, "картинка", "картинки", "картинок")}` + (info.missing ? `. Не скачалось: ${info.missing}` : ""));
    } catch(e){ toast(e && e.message === "nozip" ? "Не загрузился модуль архива. Обнови страницу" : "Бэкап не получился"); }
    backupBusy = false; if (btn) btn.textContent = label; if (route === "more") render();
  }
  async function importBackup(f, onProg){
    let j, zip = null;
    if (/\.zip$/i.test(f.name) || /zip/.test(f.type)){ await needZip(); zip = await JSZip.loadAsync(f); const jf = zip.file("nexus.json"); if (!jf) throw 0; j = JSON.parse(await jf.async("string")); }
    else j = JSON.parse(await f.text());
    const list = Array.isArray(j) ? j : j && j.items; if (!Array.isArray(list)) throw 0;
    const k = i => (i.title || "").toLowerCase() + "|" + i.type, have = new Set(MYITEMS.map(k));
    const map = {}, mine = ME.id + "/";
    const remap = async id => {
      if (typeof id !== "string" || !id) return null; if (id in map) return map[id];
      let nid = null; const zf = zip && zip.file("media/" + id);
      if (zf){ try { const type = extMime(id); const b = await zf.async("blob"); nid = (await assets.upload(new Blob([b], {type}), {type})).id; } catch(e){ logErr("бэкап: загрузка картинки", e); } }
      else if (id.startsWith(mine)) nid = id; // картинка ещё лежит на сервере
      return map[id] = nid;
    };
    let n = 0, skip = 0, pics = 0, idx = 0;
    for (const raw of list){
      idx++; onProg && onProg(idx, list.length);
      const {id, ...body} = raw || {}; if (!body.title){ continue; } if (have.has(k(body))){ skip++; continue; }
      if (body.cover){ body.cover = await remap(body.cover); if (body.cover) pics++; else { delete body.cover; delete body.coverPos; } }
      if (body.wallpaper){ body.wallpaper = await remap(body.wallpaper); if (body.wallpaper) pics++; else delete body.wallpaper; }
      if (Array.isArray(body.shots)){ const out = []; for (const sId of body.shots){ const x = await remap(sId); if (x){ out.push(x); pics++; } } body.shots = out; } else delete body.shots;
      await db.collection("items").add(body); have.add(k(body)); n++;
    }
    return {n, skip, pics};
  }
  function backupBanner(){
    if (!ME) return "";
    const at = [lastBackup && lastBackup.at, autoBackup && autoBackup.at].filter(Boolean).sort().pop();
    const days = at ? Math.max(0, Math.floor((Date.now() - Date.parse(at)) / 864e5)) : null;
    const warn = days == null || days >= 30;
    const auto = at && autoBackup && autoBackup.at === at;
    const when = days == null ? "Бэкапа ещё не было" : days === 0 ? "Бэкап сделан сегодня" : `Последний бэкап ${days} ${plural(days, "день", "дня", "дней")} назад`;
    const sub = days == null ? "Скачай архив: записи, обложки, обои и скриншоты в одном файле"
      : warn ? "Давно не сохранялся. Скачай свежий архив, чтобы ничего не потерять"
      : auto ? "Автоматический, на GitHub. Можно скачать и свой архив" : "Записи и картинки сохранены в архив";
    return `<div class="bk${warn ? " warn" : ""}"><span class="bk-ic">${warn ? "!" : "✓"}</span><div class="bk-t"><b>${when}</b><small>${sub}</small></div>
      <button class="ib${warn ? " blue" : ""}" data-backup="1">${backupBusy ? "Собираю…" : "Скачать бэкап"}</button></div>`;
  }

  function profileSheet(){
    const s = openSheet(`<h3>Профиль</h3><p class="sub">${esc(ME.email || "")}</p>
      <div class="acts" style="align-items:center">${avaHTML(myProf(), "md")}<button class="ib" id="pfAva">Аватар</button><button class="ib" id="pfNick" style="flex:1">Ник: <b style="margin-left:6px">${esc(NICK)}</b></button></div>
      <div class="acts" style="margin-top:10px"><button class="ib" id="pfBd" style="flex:1">День рождения: <b style="margin-left:6px">${MEP && MEP.birthday ? bdLabel(MEP.birthday) : "не указан"}</b></button></div>
      <div class="acts" style="margin-top:10px"><button class="ib" data-impopen="all" style="flex:1">Перенести списки: <b style="margin-left:6px">Кинопоиск · MyShows · MangaLib</b></button></div>
      <div class="acts" style="margin-top:10px"><button class="ib" data-worksheet="1" style="flex:1">Рабочий день: <b style="margin-left:6px">${(() => { const W = workCfg(); return W.on ? `${W.start}–${W.end}` : "таймер скрыт"; })()}</b></button></div>
      <div class="av-lb">Фоны разделов</div>
      <div class="sb-grid">${Object.entries(SEC_NAMES).map(([k, l]) => { const c = SECBG && SECBG[k]; return `<button data-secbg="${k}" class="${c && c.img ? "on" : ""}" style="${c && c.img ? `background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.55)),url('${publicUrl(c.img)}')` : ""}">${l}</button>`; }).join("")}</div>
      <div class="acts" style="margin-top:12px"><button class="ib" data-theme-open="1">Цвета сайта</button><button class="ib" id="pfPw">Сменить пароль</button></div>
      <div class="av-lb">Бэкап</div>
      <div class="acts" style="margin-top:8px"><button class="ib" id="pfExp">Скачать бэкап</button><label class="ib" for="pfImpF">Загрузить бэкап</label><input type="file" id="pfImpF" accept=".zip,.json,application/zip,application/json" hidden></div>
      <p class="sub" style="margin:12px 0 0">Бэкап — это zip-архив: все записи, обложки, обои и скриншоты. При загрузке записи, которые уже есть на полке, пропускаются. Старые бэкапы .json тоже подходят.</p>
      <div class="acts" style="margin-top:16px"><button class="ib red" id="pfOut">Выйти из аккаунта</button></div>`);
    s.el.querySelector("#pfNick").onclick = () => { s.close(); nickSheet(false); };
    s.el.querySelector("#pfAva").onclick = () => { s.close(); avaSheet(false); };
    s.el.querySelector("#pfPw").onclick = () => { s.close(); passwordSheet(false); };
    s.el.querySelector("#pfBd").onclick = () => { s.close(); bdaySheet(); };
    s.el.querySelectorAll("[data-secbg],[data-theme-open],[data-worksheet],[data-impopen]").forEach(b => b.addEventListener("click", () => s.close()));
    s.el.querySelectorAll("[data-secbg]").forEach(b => bindDrop(b, f => { s.close(); bgSheet(b.dataset.secbg, f); }));
    s.el.querySelector("#pfExp").onclick = e => runBackup(e.currentTarget);
    s.el.querySelector("#pfImpF").onchange = async e => {
      const f = e.target.files[0]; if (!f) return; const lb = s.el.querySelector('label[for="pfImpF"]');
      try { const r = await importBackup(f, (i, n) => { lb.textContent = `Загружаю ${i}/${n}…`; });
        toast(`Загружено записей: ${r.n}` + (r.pics ? `, картинок: ${r.pics}` : "") + (r.skip ? `. Уже были: ${r.skip}` : "")); s.close();
      } catch(err){ lb.textContent = "Загрузить бэкап"; toast("Не похоже на бэкап NEXUS"); }
    };
    s.el.querySelector("#pfOut").onclick = async () => { await SB.auth.signOut(); try { if (window.caches) await caches.delete("nexus-data"); } catch(e){ logErr("выход: очистка кэша", e); } location.reload(); };
  }

  // ================= хранилище на Supabase =================
  const CFG = window.NEXUS_CONFIG || {};
  const publicUrl = path => `${String(CFG.SUPABASE_URL).replace(/\/$/, "")}/storage/v1/object/public/media/${String(path).split("/").map(encodeURIComponent).join("/")}`;
  function makeBackend(sb, uid){
    const map = new Map(), listeners = []; let loaded = false;
    const snap = () => ({metadata: {fromCache: !loaded, hasPendingWrites: false}, docs: [...map].map(([id, d]) => ({id, exists: true, data: () => d}))});
    const emit = () => listeners.forEach(f => { try { f(snap()); } catch(e){ console.error(e); } });
    async function loadAll(){
      const rows = []; let from = 0;
      for (;;){ const {data, error} = await sb.from("items").select("id,data").eq("user_id", uid).order("id", {ascending: true}).range(from, from + 999); if (error) throw error; rows.push(...data); if (data.length < 1000) break; from += 1000; }
      map.clear(); rows.forEach(r => map.set(r.id, r.data)); loaded = true; emit();
    }
    sb.channel("items-" + uid).on("postgres_changes", {event: "*", schema: "public", table: "items", filter: `user_id=eq.${uid}`}, p => {
      if (p.eventType === "DELETE"){ if (p.old && p.old.id) map.delete(p.old.id); } else if (p.new && p.new.id) map.set(p.new.id, p.new.data);
      emit();
    }).subscribe();
    const metaCache = {}, metaL = {};
    const metaNotify = key => (metaL[key] || []).forEach(fn => fn({exists: metaCache[key] != null, data: () => metaCache[key]}));
    const fail = e => ({code: "unavailable", message: (e && e.message) || String(e)});
    const db = {
      collection(name){
        return {
          onSnapshot(next, err){ listeners.push(next); if (loaded) next(snap()); else loadAll().catch(e => err && err(fail(e))); return () => {}; },
          async add(body){ const id = crypto.randomUUID(); map.set(id, body); emit();
            const {error} = await sb.from("items").insert({id, user_id: uid, data: body});
            if (error){ map.delete(id); emit(); throw fail(error); } return {id}; }
        };
      },
      doc(path){
        const [col, id] = path.split("/");
        if (col === "items") return {
          async get(){ const d = map.get(id); return {id, exists: !!d, data: () => d}; },
          async update(patch){ const cur = map.get(id); if (!cur) throw {code: "invalid_argument", message: "нет записи"};
            const next = {...cur, ...patch}; map.set(id, next); emit();
            const {error} = await sb.from("items").update({data: next, updated_at: new Date().toISOString()}).eq("id", id).eq("user_id", uid);
            if (error){ map.set(id, cur); emit(); throw fail(error); } },
          async delete(){ const cur = map.get(id); map.delete(id); emit();
            const {error} = await sb.from("items").delete().eq("id", id).eq("user_id", uid);
            if (error){ if (cur) map.set(id, cur); emit(); throw fail(error); } }
        };
        const key = id;
        return {
          async get(){ if (!(key in metaCache)){ const {data, error} = await sb.from("meta").select("data").eq("user_id", uid).eq("key", key).maybeSingle(); if (error) throw fail(error); metaCache[key] = data ? data.data : null; }
            return {exists: metaCache[key] != null, data: () => metaCache[key]}; },
          async set(d){ metaCache[key] = d; metaNotify(key); const {error} = await sb.from("meta").upsert({user_id: uid, key, data: d}); if (error) throw fail(error); },
          async delete(){ metaCache[key] = null; metaNotify(key); const {error} = await sb.from("meta").delete().eq("user_id", uid).eq("key", key); if (error) throw fail(error); },
          onSnapshot(fn){ (metaL[key] = metaL[key] || []).push(fn); this.get().then(fn).catch(e => logErr("настройки: " + key, e)); return () => {}; }
        };
      }
    };
    const assets = {
      async upload(blob, opts = {}){
        const type = opts.type || blob.type || "image/png";
        if (blob.size > 20 * 1024 * 1024) throw {code: "too_large"};
        const ext = (type.split("/")[1] || "png").replace("jpeg", "jpg").replace("svg+xml", "svg");
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const {error} = await sb.storage.from("media").upload(path, blob, {contentType: type, cacheControl: "31536000", upsert: false});
        if (error) throw {code: /size|large|exceed/i.test(error.message) ? "too_large" : "upstream_error", message: error.message};
        return {id: path, url: publicUrl(path), sizeBytes: blob.size, contentType: type};
      }
    };
    return {db, assets};
  }

  // ================= вход =================
  function authScreen(msg){
    const el = $("auth"); el.hidden = false; document.body.classList.add("ov-open");
    const invH = /^#(event|watch):/.test(location.hash) ? (location.hash.startsWith("#watch:") ? "Тебя зовут на совместный просмотр." : "Тебя зовут на мероприятие.") : "";
    el.innerHTML = `<div class="au-box"><div class="au-logo">NEXUS</div><p class="au-sub">${invH ? `<b class="au-inv">${invH}</b> Войди или создай аккаунт — и оно сразу откроется.` : "Твоя полка игр и кино. Войди или создай аккаунт."}</p>
      <form id="auF"><label class="f">Почта<input class="in" id="auE" type="email" autocomplete="email" required></label>
        <label class="f">Пароль<span class="pw"><input class="in" id="auP" type="password" autocomplete="current-password" minlength="6" required><button type="button" class="eye" data-eye="auP" aria-label="Показать пароль"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
        <label class="f" id="auP2w" hidden>Повтори пароль<span class="pw"><input class="in" id="auP2" type="password" autocomplete="new-password" minlength="6"><button type="button" class="eye" data-eye="auP2" aria-label="Показать пароль"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
        <p class="au-hint" id="auH"></p>
        <div class="acts"><button class="ib blue" type="submit" id="auIn">Войти</button><button class="ib" type="button" id="auUp">Создать аккаунт</button></div>
        <button type="button" class="au-forgot" id="auFg">Забыли пароль?</button>
        <p class="au-msg" id="auM">${esc(msg || "")}</p></form></div>`;
    const hint = () => { const a = $("auP").value, b = $("auP2").value, out = [];
      if (/[а-яё]/i.test(a)) out.push("В пароле русские буквы. Проверь раскладку");
      if (!$("auP2w").hidden && b) out.push(a === b ? "✓ Пароли совпадают" : "✗ Пароли не совпадают");
      $("auH").textContent = out.join(" · "); $("auH").className = "au-hint" + (out.some(x => x.startsWith("✗") || x.includes("русские")) ? " bad" : b && a === b ? " ok" : ""); };
    $("auP").addEventListener("input", hint); $("auP2").addEventListener("input", hint);
    $("auIn").addEventListener("click", () => { $("auP2w").hidden = true; $("auUp").textContent = "Создать аккаунт"; hint(); });
    const go = async signUp => {
      const email = $("auE").value.trim(), password = $("auP").value;
      if (!email || password.length < 6){ $("auM").textContent = "Почта и пароль от 6 символов"; return; }
      if (signUp && $("auP2w").hidden){ $("auP2w").hidden = false; $("auUp").textContent = "Готово, создать"; $("auM").textContent = "Повтори пароль ещё раз"; $("auP2").focus(); hint(); return; }
      if (signUp && $("auP2").value !== password){ $("auM").textContent = "Пароли не совпадают"; $("auP2").focus(); return; }
      $("auM").textContent = signUp ? "Создаю аккаунт…" : "Вхожу…";
      const r = signUp ? await SB.auth.signUp({email, password}) : await SB.auth.signInWithPassword({email, password});
      if (r.error){ $("auM").textContent = /invalid login/i.test(r.error.message) ? "Неверная почта или пароль" : /already registered/i.test(r.error.message) ? "Такой аккаунт уже есть, жми «Войти»" : r.error.message; return; }
      if (!r.data.session){ $("auM").textContent = "Проверь почту и подтверди адрес, потом войди"; return; }
      el.hidden = true; el.innerHTML = ""; document.body.classList.remove("ov-open");
      start(r.data.session.user);
    };
    $("auF").onsubmit = e => { e.preventDefault(); go(false); };
    $("auUp").onclick = () => go(true);
    $("auFg").onclick = async () => {
      const email = $("auE").value.trim();
      if (!/\S+@\S+\.\S+/.test(email)){ $("auM").textContent = "Впиши почту выше, и я пришлю ссылку для нового пароля"; $("auE").focus(); return; }
      $("auM").textContent = "Отправляю письмо…";
      const {error} = await SB.auth.resetPasswordForEmail(email, {redirectTo: location.origin + location.pathname});
      $("auM").textContent = error ? (/rate|limit|seconds/i.test(error.message) ? "Слишком часто, попробуй через минуту" : "Не отправилось: " + error.message)
        : "Если такой аккаунт есть, на почту придёт письмо со ссылкой. Не пришло (проверь «Спам») — напиши владельцу сайта, он сбросит пароль вручную.";
    };
  }
  const EYE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>', EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-eye]"); if (!b) return; e.preventDefault();
    const inp = document.getElementById(b.dataset.eye); if (!inp) return; const show = inp.type === "password"; inp.type = show ? "text" : "password";
    b.innerHTML = show ? EYE_OFF : EYE_SVG; b.setAttribute("aria-label", show ? "Скрыть пароль" : "Показать пароль"); inp.focus(); });
  function passwordSheet(recovery){
    const s = openSheet(`<h3>${recovery ? "Новый пароль" : "Сменить пароль"}</h3><p class="sub">${recovery ? "Придумай новый пароль для входа." : "Новый пароль заработает сразу."} Минимум 6 символов.</p>
      <label class="f">Новый пароль<span class="pw"><input class="in" id="npP" type="password" autocomplete="new-password" minlength="6"><button type="button" class="eye" data-eye="npP" aria-label="Показать пароль">${EYE_SVG}</button></span></label>
      <label class="f">Повтори пароль<span class="pw"><input class="in" id="npP2" type="password" autocomplete="new-password" minlength="6"><button type="button" class="eye" data-eye="npP2" aria-label="Показать пароль">${EYE_SVG}</button></span></label>
      <div class="acts" style="margin-top:12px"><button class="ib blue" id="npOk">Сохранить</button><button class="ib" id="npNo">Отмена</button></div>`);
    const q = x => s.el.querySelector(x); setTimeout(() => q("#npP").focus(), 60);
    q("#npNo").onclick = () => s.close();
    q("#npOk").onclick = async () => { const p = q("#npP").value; if (p.length < 6){ toast("Минимум 6 символов"); return; }
      if (p !== q("#npP2").value){ toast("Пароли не совпадают"); return; } if (/[а-яё]/i.test(p) && !confirm("В пароле русские буквы. Точно так и оставить?")) return;
      q("#npOk").disabled = true; const {error} = await SB.auth.updateUser({password: p}); q("#npOk").disabled = false;
      if (error){ toast("Не получилось: " + error.message); return; } toast("Пароль обновлён"); s.close(); };
  }

  async function start(user){
    ME = user; flushErr();
    SB.rpc("is_nexus_admin").then(r => { IS_ADMIN = !!r && r.data === true; if (IS_ADMIN && route === "more") render(); }, e => logErr("проверка админа", e));
    let {data: prof, error: pe} = await SB.from("profiles").select("nick,avatar,ava_animal,ava_color,birthday,pid,bg,bg_m,bg_dim,work").eq("user_id", user.id).maybeSingle();
    if (pe) ({data: prof, error: pe} = await SB.from("profiles").select("nick,avatar,ava_animal,ava_color,birthday,pid,bg,bg_m,bg_dim").eq("user_id", user.id).maybeSingle());
    if (pe) ({data: prof} = await SB.from("profiles").select("nick,avatar,ava_animal,ava_color,birthday").eq("user_id", user.id).maybeSingle());
    if (prof && prof.nick){ setNick(prof.nick); MEP = prof; setTimeout(patchPopup, 1500); setTimeout(askBday, 50); } else { lsSet("nexus_patch_seen", PATCHES[0].v); lsSet("nexus_patch_pop", PATCHES[0].v); await nickSheet(true); MEP = {nick: NICK, ...(nickSheet.bday ? {birthday: nickSheet.bday} : {})}; assets = makeBackend(SB, user.id).assets; await avaSheet(true); }
    const be = makeBackend(SB, user.id); db = be.db; assets = be.assets; canWrite = !FV;
    const timer = setTimeout(netFail, 12000);
    db.doc("meta/theme").onSnapshot(d => { theme = d.exists ? d.data() : null; applyTheme(theme); });
    db.doc("meta/bg").onSnapshot(d => { SECBG = d.exists ? d.data() : null; applySecBg(); });
    Promise.all(["backup", "autobackup"].map(x => db.doc("meta/" + x).get().then(d => d.exists ? d.data() : null).catch(() => null)))
      .then(([b, a]) => { lastBackup = b; autoBackup = a; if (route === "more") render(); });
    document.body.classList.remove("guest-tl"); if (pendingTl) setTimeout(openTlLink, 300);
    // при входе — только главное; остальное сразу, если оно нужно открытому разделу, иначе по очереди через пару секунд
    loadFriends(); loadEvents(); loadNtf(); loadSug(); loadReads().then(() => handleInbox());
    subscribeEvents(); subscribeWall(); subscribeSlop(); subscribePlaces(); subscribeVac(); subscribeNtf(); subscribeBook();
    const NEED = {people: "*", home: ["wall", "vac"], user: ["wall", "vac"], slop: ["slop"], places: ["places"], vacation: ["vac"]};
    const LATER = [["wall", loadWall], ["vac", loadVac], ["slop", loadSlop], ["places", loadPlaces], ["tl", loadTlLikes]];
    const need = NEED[route] || [];
    const rest = LATER.filter(([k, fn]) => { if (need === "*" || need.includes(k)){ fn(); return false; } return true; });
    setTimeout(async () => { for (const [k, fn] of rest){ try { await fn(); } catch(e){ logErr("фоновая загрузка: " + k, e); } await new Promise(r => setTimeout(r, 300)); } }, 2500);
    db.collection("items").onSnapshot(snap => {
      if (!snap.metadata.fromCache){ clearTimeout(timer); itemsLoaded = true; netOk(); }
      MYITEMS = snap.docs.map(d => ({id: d.id, ...d.data()}));
      if (!FV) items = MYITEMS;
      const firstLoad = !start.loaded; start.loaded = true;
      render(); if (firstLoad) enterAnim(); if (!FV) checkAch();
      if (openId && !$("view").hidden && $("heroPoster") && $("ce").hidden && !sheets.length) openItem(openId);
    }, e => { clearTimeout(timer); netFail(); });
    render();
  }

