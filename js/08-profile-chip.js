  // ================= чип профиля и фоны разделов =================
  let SECBG = null;
  const SEC_NAMES = {home: "Главная", games: "Игры", kino: "Кино", read: "Читалка", slop: "СЛОП", calendar: "Календарь", people: "Активность", more: "Ещё"};
  function fillMeSlots(){
    const html = ME ? `<button class="me-chip" data-profile="1" title="Профиль и настройки"><span class="me-avw">${avaHTML(myProf(), "sm")}<i class="e7-avb sm" role="button" tabindex="-1" data-avaedit="1" title="Сменить аватарку" aria-label="Сменить аватарку">${ICON.img}</i></span><span class="nm">${esc(NICK)}</span></button>` : "";
    document.querySelectorAll(".me-slot").forEach(e => { if (e.innerHTML !== html) e.innerHTML = html; });
  }
  function applySecBg(){
    const el = $("secBg"); if (!el) return;
    const tab = (ROUTES[route] || ROUTES.games).tab, pfR = route === "home" || route === "user", c = pfR ? (PF_BG && PF_BG.img ? {img: innerWidth < 760 && PF_BG.m ? PF_BG.m : PF_BG.img, dim: PF_BG.dim, blur: 0} : null) : SECBG && SECBG[tab];
    if (!c || !c.img){ el.hidden = true; document.body.classList.remove("has-secbg"); return; }
    const url = publicUrl(c.img), i = el.querySelector("i");
    if (i.dataset.u !== url){ i.style.backgroundImage = `url('${url}')`; i.dataset.u = url; }
    i.style.filter = `blur(${c.blur ?? 0}px)`; el.style.setProperty("--sb-dim", (c.dim ?? 55) / 100);
    el.classList.toggle("pf-sb", pfR); el.hidden = false; document.body.classList.add("has-secbg");
  }
  function bgSheet(sec, initFile){
    if (!ME || !db) return;
    const cur = (SECBG && SECBG[sec]) || {};
    let file = initFile || null, img = cur.img || null, blur = cur.blur ?? 0, dim = cur.dim ?? 55;
    const s = openSheet(`<h3>Фон: ${esc(SEC_NAMES[sec] || sec)}</h3><p class="sub">Картинка встанет под весь раздел. Перетащи её сюда, вставь через Ctrl+V или выбери файл.</p>
      <div class="sb-prev" id="sbP"><i></i><b></b><span>Перетащи картинку или нажми Ctrl+V</span></div>
      <div class="acts"><label class="ib" for="sbF">Выбрать картинку</label><input type="file" id="sbF" accept="image/*" hidden><button class="ib red" id="sbRm">Убрать фон</button></div>
      <label class="sb-rng">Размытие<input type="range" id="sbB" min="0" max="30" value="${blur}"><span id="sbBv"></span></label>
      <label class="sb-rng">Затемнение<input type="range" id="sbD" min="0" max="90" value="${dim}"><span id="sbDv"></span></label>
      <div class="acts" style="margin-top:16px"><button class="ib blue" id="sbOk">Сохранить</button><button class="ib" id="sbNo">Отмена</button></div>`);
    const q = x => s.el.querySelector(x);
    const draw = () => { const u = file ? URL.createObjectURL(file) : img ? publicUrl(img) : "";
      q("#sbP i").style.backgroundImage = u ? `url('${u}')` : "none"; q("#sbP i").style.filter = `blur(${blur * .5}px)`;
      q("#sbP b").style.opacity = u ? dim / 100 : 0; q("#sbP span").hidden = !!u; q("#sbRm").hidden = !u;
      q("#sbBv").textContent = blur + "px"; q("#sbDv").textContent = dim + "%"; };
    const take = f => { if (f && f.type.startsWith("image/")){ file = f; draw(); } };
    q("#sbF").onchange = e => take(e.target.files[0]);
    pasteTarget = take; bindDrop(q("#sbP"), take); q("#sbP").onclick = () => q("#sbF").click();
    q("#sbB").oninput = e => { blur = +e.target.value; draw(); };
    q("#sbD").oninput = e => { dim = +e.target.value; draw(); };
    q("#sbRm").onclick = () => { file = null; img = null; draw(); };
    q("#sbNo").onclick = () => s.close();
    q("#sbOk").onclick = async () => { const b = q("#sbOk"); b.disabled = true; b.textContent = "Сохраняю…";
      try { if (file) img = await upload(file);
        const next = {...(SECBG || {})}; if (img) next[sec] = {img, blur, dim}; else delete next[sec];
        await db.doc("meta/bg").set(next); SECBG = next; applySecBg(); s.close(); toast(img ? "Фон сохранён" : "Фон убран");
      } catch(e){ toast("Не сохранилось"); b.disabled = false; b.textContent = "Сохранить"; } };
    draw();
  }

