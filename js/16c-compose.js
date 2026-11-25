  // ================= 7.16: эмодзи и фото в любом поле для текста =================
  // Одна плавающая панелька у активного поля: кнопка эмодзи везде, где пишут текст, и кнопка «фото» в комментариях.
  // Фото (кнопкой или Ctrl+V) заливается сразу и вставляется в текст меткой ⟦img:путь⟧ — отправка комментариев не меняется,
  // а при показе метка превращается в картинку (см. richText).
  const CM_EMOJI = ["😂", "💀", "😭", "🥀", "🤡", "🔥", "👀", "🐐", "💯", "🫡", "🤓", "🗿", "🧢", "😍", "🥺", "🥹", "😎", "🤔", "🙄", "😤",
    "😡", "🤬", "😱", "🤯", "🥶", "🥵", "🤮", "🫠", "😬", "😐", "🤣", "😏", "😈", "👻", "🙏", "👍", "👎", "👏", "🙌", "🫶",
    "💪", "🤝", "✌️", "🤙", "❤️", "🖤", "💔", "🩷", "💅", "🎉", "✨", "⭐", "🌹", "💩", "🍿", "🎮"];
  const CM_IMG_RE = /⟦img:([\w\/.\-]+)⟧/g;
  const cmIsField = el => !!el && el.nodeType === 1 && !el.readOnly && !el.disabled && !el.closest("[data-noemo]") &&
    (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && (!el.type || el.type === "text") && +el.maxLength > 50));
  // поля, куда можно класть фото: комментарии к тир-листам, в СЛОПе и ответы в книге жалоб
  const cmCanPhoto = el => !!el && (el.matches(".tlc-in textarea, #slCIn, [id^='bkC-']"));
  let cmBar = null, cmField = null, cmPop = null, cmSig = "", cmTimer = 0;
  function cmEnsure(){
    if (cmBar) return;
    cmBar = document.createElement("div"); cmBar.className = "cm-bar"; cmBar.hidden = true;
    cmBar.innerHTML = `<button type="button" class="cm-b" data-cm="emo" title="Эмодзи" aria-label="Эмодзи">😀</button><button type="button" class="cm-b" data-cm="img" title="Добавить фото (или Ctrl+V)" aria-label="Добавить фото">＋</button><span class="cm-th"></span>`;
    document.body.appendChild(cmBar);
    cmBar.addEventListener("mousedown", e => { e.preventDefault(); }); // поле не теряет фокус
    cmBar.addEventListener("click", e => {
      const b = e.target.closest("[data-cm]"); if (!b || !cmField) return;
      if (b.dataset.cm === "emo"){ cmPop && !cmPop.hidden ? cmPopClose() : cmPopOpen(); return; }
      if (b.dataset.cm === "img"){ const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => i.files[0] && cmAddPhoto(cmField, i.files[0]); i.click(); return; }
      if (b.dataset.cmx != null) return;
    });
    cmBar.querySelector(".cm-th").addEventListener("click", e => {
      const x = e.target.closest("[data-cmx]"); if (!x || !cmField) return;
      cmField.value = cmField.value.replace("⟦img:" + x.dataset.cmx + "⟧", "").replace(/ +$/, ""); cmField.dispatchEvent(new Event("input", {bubbles: true})); cmFresh(true); });
  }
  function cmInsert(el, text){
    const max = +el.maxLength > 0 ? +el.maxLength : 1e9;
    if (el.value.length + text.length > max){ if (typeof toast === "function") toast("Не влезает — поле короткое"); return false; }
    const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? a;
    el.setRangeText(text, a, b, "end"); el.dispatchEvent(new Event("input", {bubbles: true})); el.focus(); return true;
  }
  async function cmAddPhoto(el, file){
    if (!file || !/^image\//.test(file.type)){ if (typeof toast === "function") toast("Нужна картинка"); return; }
    if (file.size > 10 * 1024 * 1024){ if (typeof toast === "function") toast("Картинка тяжелее 10 МБ"); return; }
    if (!ME){ return; }
    if (typeof toast === "function") toast("Загружаю фото…");
    try {
      const id = await upload(file);
      if (!/^[\w\/.\-]+$/.test(id || "")) throw new Error("странный путь файла");
      const pre = el.value && !/\s$/.test(el.value) ? " " : "";
      if (cmInsert(el, pre + "⟦img:" + id + "⟧")) cmFresh(true);
    } catch(err){ logErr("фото в комментарии", err); if (typeof toast === "function") toast("Не получилось загрузить фото"); }
  }
  function cmPlace(){
    if (!cmBar || !cmField) return;
    const r = cmField.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh){ cmBar.hidden = true; return; }
    cmBar.hidden = false;
    const w = cmBar.offsetWidth, h = cmBar.offsetHeight;
    let top = r.top - h - 4; if (top < 4) top = Math.min(r.bottom + 4, vh - h - 4);
    cmBar.style.top = Math.max(4, top) + "px"; cmBar.style.left = Math.max(4, Math.min(r.right - w, window.innerWidth - w - 4)) + "px";
    if (cmPop && !cmPop.hidden){ const pw = cmPop.offsetWidth, ph = cmPop.offsetHeight; let pt = parseFloat(cmBar.style.top) - ph - 6; if (pt < 4) pt = parseFloat(cmBar.style.top) + h + 6;
      cmPop.style.top = pt + "px"; cmPop.style.left = Math.max(4, Math.min(parseFloat(cmBar.style.left), window.innerWidth - pw - 4)) + "px"; }
  }
  function cmFresh(force){
    if (!cmField || !cmBar) return;
    const ids = [...cmField.value.matchAll(CM_IMG_RE)].map(m => m[1]), sig = ids.join("|");
    if (!force && sig === cmSig) return; cmSig = sig;
    cmBar.querySelector(".cm-th").innerHTML = cmCanPhoto(cmField) ? ids.map(id => `<span class="cm-t"><img alt="" src="${esc(publicUrl(id))}"><button type="button" data-cmx="${esc(id)}" aria-label="Убрать фото">×</button></span>`).join("") : "";
    cmPlace();
  }
  function cmPopOpen(){
    if (!cmPop){
      cmPop = document.createElement("div"); cmPop.className = "cm-pop"; cmPop.hidden = true; cmPop.setAttribute("data-noemo", "1");
      cmPop.innerHTML = CM_EMOJI.map(e => `<button type="button" data-e="${e}">${e}</button>`).join("");
      cmPop.addEventListener("mousedown", e => e.preventDefault());
      cmPop.addEventListener("click", e => { const b = e.target.closest("[data-e]"); if (b && cmField) cmInsert(cmField, b.dataset.e); });
      document.body.appendChild(cmPop);
    }
    cmPop.hidden = false; cmPlace();
  }
  function cmPopClose(){ if (cmPop) cmPop.hidden = true; }
  function cmShow(el){
    cmEnsure(); cmField = el; cmBar.querySelector('[data-cm="img"]').hidden = !cmCanPhoto(el); cmSig = "\u0000"; cmFresh(true); cmPopClose();
    clearInterval(cmTimer); cmTimer = setInterval(() => { if (!cmField || !document.body.contains(cmField)){ cmHide(); return; } cmFresh(false); cmPlace(); }, 400);
  }
  function cmHide(){ clearInterval(cmTimer); cmField = null; if (cmBar) cmBar.hidden = true; cmPopClose(); }
  document.addEventListener("focusin", e => { if (cmIsField(e.target) && !e.target.closest(".cm-bar,.cm-pop")) cmShow(e.target); });
  document.addEventListener("focusout", e => { if (e.target === cmField) setTimeout(() => { if (document.activeElement !== cmField) cmHide(); }, 150); });
  window.addEventListener("scroll", () => cmPlace(), true); window.addEventListener("resize", () => cmPlace());
  document.addEventListener("keydown", e => { if (e.key === "Escape" && cmPop && !cmPop.hidden){ cmPopClose(); } });
  // Ctrl+V: картинка из буфера (скриншот, скопированная картинка)
  document.addEventListener("paste", e => {
    const el = e.target; if (!cmCanPhoto(el) || !e.clipboardData) return;
    const f = [...e.clipboardData.files].find(x => /^image\//.test(x.type)) || [...(e.clipboardData.items || [])].map(i => i.kind === "file" && /^image\//.test(i.type) ? i.getAsFile() : null).find(Boolean);
    if (!f) return; e.preventDefault(); cmAddPhoto(el, f);
  }, true);
