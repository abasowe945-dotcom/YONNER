  // ================= 7.31: студия профиля — фон блоков, стикеры, палитра, ник, звук, свои темы, галерея =================
  // Всё лежит в profiles.cosm: bb — фон блоков, stk — стикеры, pal — палитра, nk — ник, snd — звук, saved — сохранённые темы.
  // Рисуется поверх уже готового профиля (stAfter), поэтому старый профиль без этих настроек выглядит как раньше.
  const ST_LOOK = ["theme", "sty", "pal", "nk", "bgx", "grid", "bb", "stk", "fx", "frame", "txt", "hdr"]; // что входит в «тему»
  const ST_CS = ["theme", "sty", "fx", "frame", "txt", "hdr"]; // эти рисует «Оформление», их показываем через CS_PREV
  const stCol = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : "";
  const stMed = id => id ? (String(id).startsWith("blob:") ? id : publicUrl(id)) : "";
  let ST_SND = null, stSel = null;
  // ---- палитра: цвета из картинки (аватарка, шапка, фон)
  const stHex = (r, g, b) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const stHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0; let h = 0; if (d){ h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return {h, s, l}; };
  async function stPalFrom(url){
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = url; await img.decode();
    const S = 56, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d"); x.drawImage(img, 0, 0, S, S);
    const d = x.getImageData(0, 0, S, S).data, B = new Map();
    for (let i = 0; i < d.length; i += 4){ if (d[i + 3] < 128) continue; const k = (d[i] >> 4) * 256 + (d[i + 1] >> 4) * 16 + (d[i + 2] >> 4), o = B.get(k) || {n: 0, r: 0, g: 0, b: 0}; o.n++; o.r += d[i]; o.g += d[i + 1]; o.b += d[i + 2]; B.set(k, o); }
    const L = [...B.values()].map(o => { const r = o.r / o.n, g = o.g / o.n, b = o.b / o.n; return {n: o.n, r, g, b, ...stHsl(r, g, b)}; }).sort((a, b) => b.n - a.n);
    if (!L.length) throw new Error("пустая картинка");
    const dom = L[0], vivid = L.filter(o => o.l > .3 && o.l < .78).sort((a, b) => b.s * Math.sqrt(b.n) - a.s * Math.sqrt(a.n));
    const ac = vivid[0] || dom, ac2 = vivid.find(o => Math.min(Math.abs(o.h - ac.h), 360 - Math.abs(o.h - ac.h)) > 40) || vivid[1] || ac;
    const dk = (o, k) => stHex(o.r * k, o.g * k, o.b * k), bgL = Math.max(.08, Math.min(.5, .12 / Math.max(.05, dom.l)));
    const bg = dk(dom, bgL), card = stHex(dom.r * bgL * 1.6 + 10, dom.g * bgL * 1.6 + 10, dom.b * bgL * 1.6 + 12);
    return {bg, card, text: "#f5f5f7", ac: stHex(ac.r, ac.g, ac.b), ac2: stHex(ac2.r, ac2.g, ac2.b)};
  }
  // ---- всё, что рисуется поверх профиля
  function stAfter(p, mine){
    const C = lyCos(p), pf = document.querySelector("#aMain .pf"); if (!pf) return;
    // палитра
    const pal = C.pal && typeof C.pal === "object" ? C.pal : null;
    pf.classList.toggle("cs-pal", !!pal);
    if (pal){ [["--pal-bg", pal.bg], ["--pal-card", pal.card], ["--pal-text", pal.text], ["--ac", pal.ac], ["--ac2", pal.ac2], ["--fc", pal.ac2 || pal.ac]].forEach(([k, v]) => { if (stCol(v)) pf.style.setProperty(k, v); });
      if (stCol(pal.bg) && !pf.querySelector(".lyx")) pf.insertAdjacentHTML("afterbegin", `<div class="lyx" aria-hidden="true"><i style="background:${pal.bg}"></i></div>`); }
    // ник
    const h1 = pf.querySelector(".pf-head .pf-id h1"), nk = C.nk && typeof C.nk === "object" ? C.nk : {};
    if (h1){ const t = h1.textContent; h1.dataset.t = t;
      ["glitch", "wave", "type", "blink", "pulse", "rainbow", "outline"].forEach(k => pf.classList.remove("nk-" + k));
      if (nk.a) pf.classList.add("nk-" + nk.a); if (nk.o) pf.classList.add("nk-outline");
      if (nk.a === "wave") h1.innerHTML = [...t].map((ch, i) => `<span style="--i:${i}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");
      [["--nkc", nk.c], ["--nks", nk.s], ["--nksh", nk.sh]].forEach(([k, v]) => { if (stCol(v)) pf.style.setProperty(k, v); else pf.style.removeProperty(k); });
      pf.style.setProperty("--nksw", (Math.max(0, Math.min(6, +nk.sw || 0))) + "px"); pf.style.setProperty("--nkshb", (Math.max(0, Math.min(40, +nk.shb || 0))) + "px");
      pf.classList.toggle("nk-stroke", +nk.sw > 0 && !!stCol(nk.s)); pf.classList.toggle("nk-shadow", !!stCol(nk.sh) && +nk.shb > 0); pf.classList.toggle("nk-col", !!stCol(nk.c)); }
    // фон отдельных блоков (этажей и карточек)
    const bb = C.bb && typeof C.bb === "object" ? C.bb : {};
    pf.querySelectorAll(".ly-b[data-lyk]").forEach(el => { const b = bb[el.dataset.lyk]; el.classList.toggle("has-bb", !!(b && (b.img || b.grad)));
      if (!b || !(b.img || b.grad)){ el.style.removeProperty("--bbg"); return; }
      const dim = Math.max(0, Math.min(90, +b.dim || 0)) / 100, g = b.grad ? `linear-gradient(${Math.round(+b.ang || 135)}deg,${stCol(b.c1) || "#222"},${stCol(b.c2) || "#000"})` : "";
      el.style.setProperty("--bbg", `linear-gradient(rgba(0,0,0,${dim}),rgba(0,0,0,${dim}))${b.img ? `,url('${stMed(b.img)}') ${Math.round(+b.x || 50)}% ${Math.round(+b.y || 50)}%/cover` : ""}${g ? "," + g : ""}`); });
    // стикеры: привязаны к блоку или к шапке, координаты — в процентах блока, поэтому на телефоне встают туда же
    const ed = lyEditing(mine);
    pf.querySelectorAll(".stk").forEach(s => s.remove());
    (Array.isArray(C.stk) ? C.stk : []).slice(0, 40).forEach(s => {
      const host = s.b === "head" ? pf.querySelector(".pf-head") : pf.querySelector(`.ly-b[data-lyk="${CSS.escape(s.b || "")}"]`); if (!host) return;
      const el = document.createElement("span"); el.className = "stk" + (ed ? " ed" : "") + (stSel === s.id ? " sel" : ""); el.dataset.stk = s.id;
      el.style.cssText = `left:${+s.x || 50}%;top:${+s.y || 50}%;--s:${Math.max(.3, Math.min(5, +s.s || 1))};--r:${Math.round(+s.r || 0)}deg;z-index:${10 + (Math.max(0, Math.min(40, +s.z || 0)))}`;
      if (s.img) el.innerHTML = `<img alt="" src="${esc(stMed(s.img))}" draggable="false">`; else el.textContent = s.e || "⭐";
      host.appendChild(el); });
    if (ed && stSel) stToolbar();
    // звук профиля
    stSoundBtn(C.snd, mine);
    // чужой профиль: взять оформление
    if (!mine && !pf.querySelector("[data-sttake]")){ const a = pf.querySelector(".pf-head .pf-acts"); if (a) a.insertAdjacentHTML("afterbegin", `<button class="pf-btn" type="button" data-sttake="${esc(p.user_id || "")}" title="Примерить оформление этого профиля на себя">${ICON.palette || ICON.edit}<span>Взять оформление</span></button>`); }
  }
  // ---- звук
  function stSoundBtn(snd, mine){
    let b = document.getElementById("stSnd"); const ok = snd && snd.id && ["home", "user"].includes(route);
    if (!ok){ if (b) b.remove(); if (ST_SND && !ok){ ST_SND.a.pause(); ST_SND = null; } return; }
    const url = stMed(snd.id); if (ST_SND && ST_SND.url !== url){ ST_SND.a.pause(); ST_SND = null; }
    if (!b){ b = document.createElement("button"); b.id = "stSnd"; b.type = "button"; b.className = "st-snd"; document.body.appendChild(b); }
    const on = !!(ST_SND && !ST_SND.a.paused);
    b.innerHTML = `<span class="eq${on ? " on" : ""}"><i></i><i></i><i></i></span><span class="t"><b>${on ? "Играет" : "Звук профиля"}</b><small>${esc(snd.t || "нажми, чтобы включить")}</small></span>`;
    b.onclick = () => { if (!ST_SND){ const a = new Audio(url); a.loop = true; a.volume = Math.max(.05, Math.min(1, (+snd.v || 60) / 100)); ST_SND = {a, url}; a.onplay = a.onpause = () => stSoundBtn(snd, mine); }
      if (ST_SND.a.paused){ const r = ST_SND.a.play(); if (r && r.catch) r.catch(e => { toast("Звук не включился"); logErr("звук профиля", e); }); } else ST_SND.a.pause(); };
  }
  window.addEventListener("hashchange", () => { if (!["home", "user"].includes(route)){ const b = document.getElementById("stSnd"); if (b) b.remove(); if (ST_SND){ ST_SND.a.pause(); ST_SND = null; } } });
  // ---- стикеры: выбор, перетаскивание, панелька
  function stToolbar(){
    document.querySelectorAll(".stk-tb").forEach(x => x.remove());
    const el = document.querySelector(`.stk[data-stk="${CSS.escape(stSel)}"]`); if (!el) return;
    const r = el.getBoundingClientRect(), tb = document.createElement("div"); tb.className = "stk-tb";
    tb.innerHTML = `<button type="button" data-stka="s-" title="Меньше">−</button><button type="button" data-stka="s+" title="Больше">+</button><button type="button" data-stka="r-" title="Повернуть влево">⟲</button><button type="button" data-stka="r+" title="Повернуть вправо">⟳</button><button type="button" data-stka="z" title="Поверх остальных">⇡</button><button type="button" data-stka="x" class="x" title="Удалить">✕</button>`;
    tb.style.left = Math.max(8, Math.min(innerWidth - 230, r.left + r.width / 2 - 110)) + "px"; tb.style.top = Math.max(70, r.top - 50) + "px"; document.body.appendChild(tb);
  }
  const stFind = id => (LY_ED && Array.isArray(LY_ED.stk) ? LY_ED.stk : []).find(s => s.id === id);
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("[data-stka]"); if (!a || !LY_ED) return; e.preventDefault(); e.stopPropagation();
    const s = stFind(stSel); if (!s) return; const k = a.dataset.stka;
    if (k === "s-") s.s = Math.max(.3, (+s.s || 1) / 1.15); else if (k === "s+") s.s = Math.min(5, (+s.s || 1) * 1.15);
    else if (k === "r-") s.r = (+s.r || 0) - 12; else if (k === "r+") s.r = (+s.r || 0) + 12;
    else if (k === "z") s.z = Math.max(...LY_ED.stk.map(x => +x.z || 0)) + 1;
    else if (k === "x"){ LY_ED.stk = LY_ED.stk.filter(x => x !== s); stSel = null; document.querySelectorAll(".stk-tb").forEach(x => x.remove()); }
    lyDraw();
  }, true);
  let stDrag = null;
  document.addEventListener("pointerdown", e => {
    const el = e.target.closest && e.target.closest(".stk.ed"); if (!el || !LY_ED) return;
    e.preventDefault(); e.stopPropagation(); stSel = el.dataset.stk; document.querySelectorAll(".stk.sel").forEach(x => x.classList.remove("sel")); el.classList.add("sel");
    document.querySelectorAll(".stk-tb").forEach(x => x.remove());
    stDrag = {el, x: e.clientX, y: e.clientY, moved: false}; try { el.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: указатель уже отпущен */ }
  }, true);
  document.addEventListener("pointermove", e => { if (!stDrag) return; const dx = e.clientX - stDrag.x, dy = e.clientY - stDrag.y; if (Math.abs(dx) + Math.abs(dy) > 3) stDrag.moved = true;
    stDrag.el.style.translate = `${dx}px ${dy}px`; });
  const stDrop = e => {
    if (!stDrag) return; const {el, moved} = stDrag; stDrag = null; const s = stFind(el.dataset.stk); if (!s){ return; }
    if (moved){ el.style.visibility = "hidden"; const under = document.elementFromPoint(e.clientX, e.clientY); el.style.visibility = "";
      const host = under && (under.closest(".ly-b[data-lyk]") || under.closest(".pf-head"));
      if (host){ const r = host.getBoundingClientRect(); s.b = host.classList.contains("pf-head") ? "head" : host.dataset.lyk; s.x = +((e.clientX - r.left) / r.width * 100).toFixed(1); s.y = +((e.clientY - r.top) / r.height * 100).toFixed(1); }
      lyDraw(); } else stToolbar();
  };
  document.addEventListener("pointerup", stDrop); document.addEventListener("pointercancel", stDrop);
  document.addEventListener("wheel", e => { const el = e.target.closest && e.target.closest(".stk.ed"); if (!el || !LY_ED) return; e.preventDefault(); const s = stFind(el.dataset.stk); if (!s) return;
    if (e.shiftKey) s.r = (+s.r || 0) + (e.deltaY > 0 ? 6 : -6); else s.s = Math.max(.3, Math.min(5, (+s.s || 1) * (e.deltaY > 0 ? .92 : 1.08)));
    el.style.setProperty("--s", s.s); el.style.setProperty("--r", (s.r || 0) + "deg"); }, {passive: false});
  document.addEventListener("pointerdown", e => { if (!stSel || !LY_ED) return; if (e.target.closest && (e.target.closest(".stk") || e.target.closest(".stk-tb"))) return; stSel = null; document.querySelectorAll(".stk.sel").forEach(x => x.classList.remove("sel")); document.querySelectorAll(".stk-tb").forEach(x => x.remove()); });
  window.addEventListener("scroll", () => { if (stSel) document.querySelectorAll(".stk-tb").forEach(x => x.remove()); }, {passive: true});
  const STK_EMO = ["💀", "🔥", "⭐", "✨", "💥", "❤️", "🖤", "💔", "👑", "🎮", "🕹️", "👾", "🎬", "🍿", "📼", "🎧", "🎸", "🍕", "🍺", "☕", "🌙", "☀️", "⚡", "🌈", "🌸", "🍀", "🐺", "🐱", "🐸", "🦊", "🐉", "👻", "🤡", "🗿", "🥀", "🩸", "⚔️", "🛡️", "🏆", "🎯", "💯", "🚀", "🛸", "🌌", "📌", "📎", "✏️", "🧃", "🍓", "🍒", "💿", "🎲", "♠️", "♥️", "🤘", "👀", "😭", "🫡", "🤓", "😈"];
  function stAddSheet(){
    const s = openSheet(`<h3>Стикер</h3><p class="sub">Встанет в шапку — потом тащи куда хочешь, хоть поверх полок. Колесо мыши — размер, Shift + колесо — поворот.</p>
      <div class="st-emo">${STK_EMO.map(e => `<button type="button" data-ste="${e}">${e}</button>`).join("")}</div>
      <div class="acts" style="margin-top:12px"><button type="button" class="ib" id="stImg">${ICON.img}Своя картинка (PNG, GIF)</button></div>`, {wide: true});
    const add = o => { LY_ED.stk = Array.isArray(LY_ED.stk) ? LY_ED.stk : []; if (LY_ED.stk.length >= 40){ toast("Хватит 40 стикеров"); return; }
      const id = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); LY_ED.stk.push({id, b: "head", x: 40 + Math.random() * 30, y: 30 + Math.random() * 40, s: 1, r: Math.round(Math.random() * 30 - 15), z: LY_ED.stk.length, ...o}); stSel = id; lyMark(); s.close(); lyDraw(); };
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-ste]"); if (b) add({e: b.dataset.ste}); });
    s.el.querySelector("#stImg").onclick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/png,image/gif,image/webp,image/*"; i.onchange = () => { const f = i.files[0]; if (!f) return; if (f.size > 1.5 * 1024 * 1024){ toast("Стикер тяжелее 1,5 МБ — сожми его"); return; }
      const key = "stk" + Date.now(); LY_ED.files[key] = f; add({img: URL.createObjectURL(f), fk: key}); }; i.click(); };
  }
  // ---- фон блока
  function stBbSheet(k){
    LY_ED.bb = LY_ED.bb && typeof LY_ED.bb === "object" ? LY_ED.bb : {}; const b = LY_ED.bb[k] = LY_ED.bb[k] || {};
    const s = openSheet(`<h3>Фон блока «${esc(LY_NAME[k] || k)}»</h3><p class="sub">Свой фон только за этим блоком: картинка или градиент.</p><div id="stBbB"></div>`);
    const live = () => { clearTimeout(live.t); live.t = setTimeout(lyDraw, 60); };
    const draw = () => { s.el.querySelector("#stBbB").innerHTML = `<div class="cs-sr"><b>Картинка</b><div class="cs-acs"><button type="button" class="ib" data-bbi="1">${b.img ? "Другая" : "Выбрать"}</button>${b.img ? `<button type="button" class="ib red" data-bbix="1">Убрать</button>` : ""}</div>
        ${b.img ? `<label class="cs-rg"><span>Сдвиг по горизонтали</span><input type="range" min="0" max="100" data-bbr="x" value="${b.x ?? 50}"><em></em></label><label class="cs-rg"><span>Сдвиг по вертикали</span><input type="range" min="0" max="100" data-bbr="y" value="${b.y ?? 50}"><em></em></label>` : ""}</div>
      <div class="cs-sr" style="margin-top:8px"><b>Градиент</b><div class="cs-acs"><label class="cs-sw sm"><input type="checkbox" data-bbg="1" ${b.grad ? "checked" : ""}><span>вкл</span></label><input type="color" data-bbc="c1" value="${stCol(b.c1) || "#2a0845"}"><input type="color" data-bbc="c2" value="${stCol(b.c2) || "#6441a5"}"></div><label class="cs-rg"><span>Угол</span><input type="range" min="0" max="360" step="5" data-bbr="ang" value="${b.ang ?? 135}"><em></em></label></div>
      <div class="cs-sr" style="margin-top:8px"><label class="cs-rg"><span>Затемнение</span><input type="range" min="0" max="90" step="5" data-bbr="dim" value="${b.dim ?? 35}"><em></em></label></div>
      <div class="acts" style="margin-top:12px"><button type="button" class="ib red" data-bbclr="1">Убрать фон блока</button><button type="button" class="ib blue" data-bbok="1">Готово</button></div>`; };
    s.el.addEventListener("input", e => { const d = e.target.dataset; if (d.bbr){ b[d.bbr] = +e.target.value; if (b.dim == null) b.dim = 35; live(); } else if (d.bbc){ b[d.bbc] = e.target.value; b.grad = true; live(); } });
    s.el.addEventListener("change", e => { if (e.target.dataset.bbg){ b.grad = e.target.checked; if (b.dim == null) b.dim = 35; live(); } });
    s.el.addEventListener("click", e => { const t = e.target.closest("button"); if (!t) return; const d = t.dataset;
      if (d.bbi){ const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { const f = i.files[0]; if (!f) return; if (f.size > 3.4 * 1024 * 1024){ toast("Картинка тяжелее 3,4 МБ — сожми её"); return; } const key = "bb" + k; LY_ED.files[key] = f; b.img = URL.createObjectURL(f); b.fk = key; if (b.dim == null) b.dim = 35; draw(); live(); }; i.click(); }
      else if (d.bbix){ delete b.img; delete b.fk; draw(); live(); }
      else if (d.bbclr){ delete LY_ED.bb[k]; s.close(); lyDraw(); }
      else if (d.bbok) s.close(); });
    draw();
  }
  // ---- палитра
  function stPalSheet(){
    const p0 = MEP || {}, pal = LY_ED.pal = LY_ED.pal || {bg: "#0d0d12", card: "#17171f", text: "#f5f5f7", ac: "#ff375f", ac2: "#64d2ff"};
    const srcs = [["Аватарка", p0.avatar_full || p0.avatar], ["Шапка", (CS_PREV || p0.cosm || {}).hdr && (CS_PREV || p0.cosm || {}).hdr.img], ["Фон профиля", LY_ED.bgx && LY_ED.bgx.media && !LY_ED.bgx.media.v ? LY_ED.bgx.media.id : null], ["Фон страницы", p0.bg]].filter(x => x[1]);
    const s = openSheet(`<h3>Палитра профиля</h3><p class="sub">Пять цветов на весь профиль. Можно собрать самому или взять с картинки — подберём сами.</p><div id="stPalB"></div>`);
    const live = () => { clearTimeout(live.t); live.t = setTimeout(lyDraw, 60); };
    const draw = () => { s.el.querySelector("#stPalB").innerHTML = `${srcs.length ? `<div class="cs-lbl">Взять цвета с картинки</div><div class="cs-acs">${srcs.map(([l, id], i) => `<button type="button" class="ib" data-palsrc="${i}">${esc(l)}</button>`).join("")}</div>` : `<p class="a-sub">Поставь аватарку или шапку — и цвета можно будет взять с неё.</p>`}
      <div class="st-pal">${[["bg", "Фон"], ["card", "Карточки"], ["text", "Текст"], ["ac", "Акцент"], ["ac2", "Второй акцент"]].map(([k, l]) => `<label><input type="color" data-palc="${k}" value="${stCol(pal[k]) || "#000000"}"><span>${l}</span></label>`).join("")}</div>
      <div class="acts" style="margin-top:12px"><button type="button" class="ib red" data-palx="1">Без палитры</button><button type="button" class="ib blue" data-palok="1">Готово</button></div>`; };
    s.el.addEventListener("input", e => { const k = e.target.dataset.palc; if (k){ pal[k] = e.target.value; live(); } });
    s.el.addEventListener("click", async e => { const t = e.target.closest("button"); if (!t) return; const d = t.dataset;
      if (d.palsrc != null){ t.disabled = true; try { Object.assign(pal, await stPalFrom(stMed(srcs[+d.palsrc][1]))); draw(); lyDraw(); toast("Цвета взяты с картинки"); } catch(err){ toast("Не получилось прочитать цвета с картинки"); logErr("палитра с картинки", err); } t.disabled = false; }
      else if (d.palx){ LY_ED.pal = null; s.close(); lyDraw(); }
      else if (d.palok) s.close(); });
    draw();
  }
  // ---- ник
  const ST_NKA = [["", "Без анимации"], ["glitch", "Глитч"], ["wave", "Волна"], ["type", "Печатная машинка"], ["blink", "Неоновое мигание"], ["pulse", "Дыхание"], ["rainbow", "Радуга"]];
  function stNkSheet(){
    const nk = LY_ED.nk = LY_ED.nk || {};
    const s = openSheet(`<h3>Ник</h3><p class="sub">Анимация, цвет, обводка и тень. Шрифт и размер — в «Оформлении» → «Шрифты».</p><div id="stNkB"></div>`);
    const live = () => { clearTimeout(live.t); live.t = setTimeout(lyDraw, 60); };
    const draw = () => { s.el.querySelector("#stNkB").innerHTML = `<div class="cs-lbl">Анимация</div><div class="cs-tabs ly-seg">${ST_NKA.map(([k, l]) => `<button type="button" data-nka="${k}" aria-pressed="${(nk.a || "") === k}">${l}</button>`).join("")}</div>
      <div class="cs-sr" style="margin-top:10px"><b>Свой цвет</b><div class="cs-acs"><label class="cs-sw sm"><input type="checkbox" data-nkon="c" ${stCol(nk.c) ? "checked" : ""}><span>вкл</span></label><input type="color" data-nkc="c" value="${stCol(nk.c) || "#ffffff"}"><label class="cs-sw sm"><input type="checkbox" data-nko="1" ${nk.o ? "checked" : ""}><span>только контур</span></label></div></div>
      <div class="cs-sr" style="margin-top:8px"><b>Обводка</b><div class="cs-acs"><input type="color" data-nkc="s" value="${stCol(nk.s) || "#000000"}"></div><label class="cs-rg"><span>Толщина</span><input type="range" min="0" max="6" step=".5" data-nkr="sw" value="${nk.sw || 0}"><em></em></label></div>
      <div class="cs-sr" style="margin-top:8px"><b>Тень или свечение</b><div class="cs-acs"><input type="color" data-nkc="sh" value="${stCol(nk.sh) || "#ff375f"}"></div><label class="cs-rg"><span>Размытие</span><input type="range" min="0" max="40" data-nkr="shb" value="${nk.shb || 0}"><em></em></label></div>
      <div class="acts" style="margin-top:12px"><button type="button" class="ib red" data-nkx="1">Сбросить ник</button><button type="button" class="ib blue" data-nkok="1">Готово</button></div>`; };
    s.el.addEventListener("input", e => { const d = e.target.dataset;
      if (d.nkc){ nk[d.nkc] = e.target.value; if (d.nkc === "s" && !nk.sw) nk.sw = 2; if (d.nkc === "sh" && !nk.shb) nk.shb = 14; live(); }
      else if (d.nkr){ nk[d.nkr] = +e.target.value; if (d.nkr === "sw" && !nk.s) nk.s = "#000000"; if (d.nkr === "shb" && !nk.sh) nk.sh = "#ff375f"; live(); } });
    s.el.addEventListener("change", e => { const d = e.target.dataset;
      if (d.nkon){ if (e.target.checked) nk.c = s.el.querySelector('[data-nkc="c"]').value; else delete nk.c; live(); }
      else if (d.nko){ nk.o = e.target.checked || undefined; if (nk.o && !nk.sw){ nk.sw = 2; nk.s = nk.s || "#ffffff"; } live(); draw(); } });
    s.el.addEventListener("click", e => { const t = e.target.closest("button"); if (!t) return; const d = t.dataset;
      if (d.nka != null){ nk.a = d.nka || undefined; draw(); lyDraw(); } else if (d.nkx){ LY_ED.nk = {}; s.close(); lyDraw(); } else if (d.nkok) s.close(); });
    draw();
  }
  // ---- звук профиля
  function stSndSheet(){
    const cur = LY_ED.snd || null;
    const s = openSheet(`<h3>Звук профиля</h3><p class="sub">MP3 или M4A до 3,4 МБ. Сам не играет — гость жмёт кнопку внизу экрана, если хочет послушать.</p>
      <div class="acts"><button type="button" class="ib" id="sdF">${cur ? "Другой файл" : "Выбрать файл"}</button>${cur ? `<button type="button" class="ib red" id="sdX">Убрать звук</button>` : ""}</div>
      <label class="f">Подпись<input class="in" id="sdT" maxlength="60" placeholder="Например: тема из Silent Hill" value="${esc((cur && cur.t) || "")}"></label>
      <label class="cs-rg"><span>Громкость</span><input type="range" min="5" max="100" id="sdV" value="${(cur && cur.v) || 60}"><em></em></label>
      <div class="acts" style="margin-top:12px"><button type="button" class="ib blue" id="sdOk">Готово</button></div>`);
    const q = x => s.el.querySelector(x);
    q("#sdF").onclick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/*"; i.onchange = () => { const f = i.files[0]; if (!f) return;
      if (f.size > 3.4 * 1024 * 1024){ toast("Файл тяжелее 3,4 МБ — обрежь трек или сожми его"); return; } LY_ED.files.snd = f; LY_ED.snd = {id: URL.createObjectURL(f), t: q("#sdT").value.trim() || f.name.replace(/\.[^.]+$/, "").slice(0, 60), v: +q("#sdV").value}; s.close(); lyDraw(); toast("Звук добавлен — кнопка внизу экрана"); }; i.click(); };
    if (q("#sdX")) q("#sdX").onclick = () => { LY_ED.snd = null; delete LY_ED.files.snd; s.close(); lyDraw(); };
    q("#sdOk").onclick = () => { if (LY_ED.snd){ LY_ED.snd.t = q("#sdT").value.trim().slice(0, 60); LY_ED.snd.v = +q("#sdV").value; } s.close(); lyDraw(); };
  }
  // ---- свои темы, «взять у друга», галерея
  const stLook = c => { const o = {}; ST_LOOK.forEach(k => { if (c && c[k] != null) o[k] = lyJ(c[k]); }); return o; };
  function stApplyLook(look, from){
    if (!LY_ED) lyStart(true);
    ["grid", "bgx", "pal", "nk", "stk", "bb"].forEach(k => { LY_ED[k] = look[k] != null ? lyJ(look[k]) : (k === "stk" ? [] : k === "bb" ? {} : null); });
    if (!LY_ED.grid) LY_ED.grid = lyNorm(LY_PRESET.launcher());
    LY_ED.cs = {}; ST_CS.forEach(k => { LY_ED.cs[k] = look[k] != null ? lyJ(look[k]) : undefined; });
    CS_PREV = {...((MEP && MEP.cosm) || {}), ...LY_ED.cs}; LY_ED.from = from || null;
    if (route !== "home") go("home"); setTimeout(() => { render(); toast(`Примерил${from ? " оформление " + from : ""}. Нравится — «Готово», нет — «Отмена»`); }, 150);
  }
  let TH_LIKES = null, thOff = false;
  async function stLoadLikes(){ if (thOff) return [];
    const r = await fetchAll(() => SB.from("theme_likes").select("*"), ["owner", "tid", "user_id"]);
    if (r.error){ if (/theme_likes|does not exist|schema cache/i.test(r.error.message || "")) thOff = true; else logErr("лайки тем", r.error); TH_LIKES = []; } else TH_LIKES = r.data || []; return TH_LIKES; }
  const stSw = t => { const pal = t.pal || {}, g = t.bgx || {}; return [pal.bg, pal.card, pal.ac, pal.ac2, g.c1, g.c2].map(stCol).filter(Boolean).slice(0, 5); };
  async function stGallery(onlyUid){
    if (!FR) await loadFriends();
    const s = openSheet(`<h3>${onlyUid ? "Оформление " + esc(frNick(onlyUid)) : "Темы друзей"}</h3><p class="sub">«Примерить» — оформление встанет на твой профиль в конструкторе. Нравится — жмёшь «Готово», нет — «Отмена», ничего не потеряется.</p><div id="thG"><p class="a-sub">Загружаю…</p></div>`, {wide: true});
    await stLoadLikes();
    const draw = () => {
      const list = [];
      FR.profiles.forEach(pp => { const p = ME && pp.user_id === ME.id ? {...pp, ...myProf()} : pp; if (onlyUid && p.user_id !== onlyUid) return; const c = p.cosm || {};
        if (onlyUid || (ME && p.user_id !== ME.id)){ const look = stLook(c); if (Object.keys(look).length) list.push({p, tid: "@live", name: "Профиль целиком", look, live: true}); }
        (Array.isArray(c.saved) ? c.saved : []).forEach(t => t && t.id && t.look && list.push({p, tid: t.id, name: t.name || "Без названия", look: t.look})); });
      const lk = (o, t) => (TH_LIKES || []).filter(x => x.owner === o && x.tid === t);
      list.sort((a, b) => lk(b.p.user_id, b.tid).length - lk(a.p.user_id, a.tid).length);
      s.el.querySelector("#thG").innerHTML = list.length ? `<div class="th-g">${list.map(x => { const sw = stSw(x.look), L = lk(x.p.user_id, x.tid), on = L.some(l => ME && l.user_id === ME.id), mine = ME && x.p.user_id === ME.id;
        return `<div class="th-c"><div class="th-pv" style="${sw.length ? `background:linear-gradient(135deg,${sw.join(",")})` : ""}"><span>${esc((LY_LAYS.find(l => l[0] === (x.look.grid && x.look.grid.lay)) || ["", "Лаунчер"])[1])}${x.look.theme && x.look.theme !== "base" ? " · " + esc((typeof csThemesAll === "function" && (csThemesAll().find(t => t.id === x.look.theme) || {}).t) || "") : ""}</span>${(x.look.stk || []).slice(0, 4).map(s => s.e ? `<i>${esc(s.e)}</i>` : "").join("")}</div>
          <div class="th-i">${avaHTML(x.p, "sm")}<span><b>${esc(x.name)}</b><small>${esc(x.p.nick || "")}${x.live ? " · сейчас в профиле" : ""}</small></span></div>
          <div class="th-a"><button type="button" class="ib blue" data-thtry="${esc(x.p.user_id + "|" + x.tid)}">Примерить</button>${x.live || thOff ? "" : `<button type="button" class="ib${on ? " on" : ""}" data-thlike="${esc(x.p.user_id + "|" + x.tid)}" ${mine ? "disabled" : ""}>♥ ${L.length || ""}</button>`}${mine && !x.live ? `<button type="button" class="ib red" data-thdel="${esc(x.tid)}" title="Удалить тему">${ICON.x}</button>` : ""}</div></div>`; }).join("")}</div>`
        : `<div class="a-empty"><b>Пока ни одной темы</b>Собери профиль в конструкторе и нажми «Сохранить как тему» — она появится здесь у всех.</div>`;
      s.el._list = list; };
    draw();
    s.el.addEventListener("click", async e => { const t = e.target.closest("button"); if (!t) return; const d = t.dataset;
      if (d.thtry){ const [u, tid] = d.thtry.split("|"), x = s.el._list.find(y => y.p.user_id === u && y.tid === tid); if (!x) return; s.close(); stApplyLook(x.look, x.p.nick); }
      else if (d.thlike){ const [owner, tid] = d.thlike.split("|"), on = t.classList.contains("on"); t.disabled = true;
        const r = on ? await SB.from("theme_likes").delete().match({owner, tid, user_id: ME.id}) : await SB.from("theme_likes").insert({owner, tid});
        if (r.error){ toast(/theme_likes|schema/i.test(r.error.message || "") ? "Лайки заработают после обновления базы" : "Не сохранилось"); if (!/theme_likes|schema/i.test(r.error.message || "")) logErr("лайк темы", r.error); } await stLoadLikes(); draw(); }
      else if (d.thdel){ if (!confirm("Удалить эту тему из галереи?")) return; const c = {...((MEP && MEP.cosm) || {})}; c.saved = (c.saved || []).filter(x => x.id !== d.thdel); if (await saveProf({cosm: c})){ toast("Тема удалена"); draw(); } } });
  }
  async function stSaveAs(){
    const name = (prompt("Как назвать тему? Её увидят друзья в «Темах друзей»", "") || "").trim().slice(0, 40); if (!name) return;
    LY_ED.saveAs = name; toast(`Тема «${name}» сохранится вместе с профилем — жми «Готово»`);
  }
  // ---- кнопки: панель конструктора, блоки, чужой профиль
  document.addEventListener("click", e => {
    const t = e.target.closest && e.target.closest("[data-stbb],[data-stadd],[data-stpal],[data-stnk],[data-stsnd],[data-stgal],[data-stsave],[data-sttake]"); if (!t || !ME) return;
    e.preventDefault(); const d = t.dataset;
    if (d.sttake){ const p = FR && FR.profiles.find(x => x.user_id === d.sttake); if (!p) return; const look = stLook(p.cosm || {}), sv = Array.isArray((p.cosm || {}).saved) ? p.cosm.saved : [];
      if (sv.length) stGallery(d.sttake); else if (Object.keys(look).length) stApplyLook(look, p.nick); else toast(`${p.nick} пока ничего не оформлял`); return; }
    if (d.stgal){ stGallery(); return; }
    if (!LY_ED) return;
    if (d.stbb) stBbSheet(d.stbb); else if (d.stadd) stAddSheet(); else if (d.stpal) stPalSheet(); else if (d.stnk) stNkSheet(); else if (d.stsnd) stSndSheet(); else if (d.stsave) stSaveAs();
  }, true);
