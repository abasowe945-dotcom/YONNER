  // ================= аккаунт, ник, профиль =================
  let NICK = "H3RO", SB = null, ME = null, IS_ADMIN = false;
  const nickShort = () => NICK.toUpperCase().slice(0, 8);
  function nickLogo(n){
    let i = n.search(/\d/); if (i < 0) i = Math.min(1, n.length - 1);
    return `${esc(n.slice(0, i))}<span>${esc(n[i] || "")}</span>${esc(n.slice(i + 1))} NEXUS`;
  }
  function setNick(n){
    NICK = n || "H3RO";
    document.querySelectorAll(".nick-t").forEach(e => e.textContent = NICK);
    if ($("kLogo")) $("kLogo").textContent = "NEXUS";
    document.title = "NEXUS";
  }
  function nickSheet(first){
    return new Promise(res => {
      const s = openSheet(`<h3>${first ? "Как тебя звать?" : "Ник"}</h3><p class="sub">Его увидят друзья, он же стоит на твоих оценках. Потом можно поменять в «Ещё → Профиль».</p>
        <label class="f">Ник<input class="in" id="nkI" maxlength="16" placeholder="H3RO" value="${first ? "" : esc(NICK)}" autocomplete="nickname"></label>
        ${first ? `<label class="f">День рождения${bdFields(null, "nk")}</label><p class="sub" style="margin:-4px 0 14px;font-size:12.5px">Друзья увидят число и месяц в календаре дней рождения. Год можно не указывать, всё поле — пропустить.</p>` : ""}
        <div class="acts"><button class="ib blue" id="nkOk">${first ? "Поехали" : "Сохранить"}</button>${first ? "" : `<button class="ib" id="nkNo">Отмена</button>`}</div>`, {onClose: () => res(null)});
      if (first) s.el.parentNode.querySelector(".sh-bg").onclick = null;
      const inp = s.el.querySelector("#nkI"); setTimeout(() => inp.focus(), 50);
      if (!first) s.el.querySelector("#nkNo").onclick = () => s.close();
      const ok = async () => { const n = inp.value.trim().replace(/\s+/g, " ");
        if (n.length < 2){ toast("Минимум 2 символа"); return; }
        const bd = first && s.el.querySelector("#nkD") ? bdRead(s.el, "nk") : "";
        if (bd === false){ toast("Такого числа в этом месяце нет"); return; }
        const {error} = await SB.from("profiles").upsert({user_id: ME.id, nick: n, ...(bd ? {birthday: bd} : {})});
        if (bd) nickSheet.bday = bd;
        if (error){ toast("Не сохранилось: " + error.message); return; }
        setNick(n); res(n); s.close(); };
      s.el.querySelector("#nkOk").onclick = ok;
      inp.addEventListener("keydown", e => { if (e.key === "Enter") ok(); });
    });
  }
  (() => { const g = $("gh"); if (!g) return; const set = () => document.documentElement.style.setProperty("--ghh", g.offsetHeight + "px"); set();
    if (window.ResizeObserver) new ResizeObserver(set).observe(g); else addEventListener("resize", set); })();
  // ================= анимации: появление карточек и 3D-наклон =================
  const ANIM_GRIDS = ".s-grid,.k-grid,.fr-grid,.dr-grid,.s-row,.mt-grid,.rel-list,.so-list";
  function enterAnim(){
    document.querySelectorAll(ANIM_GRIDS).forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--i", Math.min(i, 18))));
    document.querySelectorAll(".pn,.rc-c,.fv-tile").forEach((c, i) => c.style.setProperty("--i", Math.min(i, 10)));
    document.body.classList.remove("enter"); void document.body.offsetWidth; document.body.classList.add("enter");
    clearTimeout(enterAnim.t); enterAnim.t = setTimeout(() => document.body.classList.remove("enter"), 1400);
  }
  (() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    const SEL = ".s-card,.k-card,.fr-card,.dr";
    let cur = null;
    const reset = c => { const p = c.querySelector(".poster"); c.classList.remove("tilting"); if (p) p.style.transform = ""; };
    document.addEventListener("pointermove", e => {
      const c = e.target.closest ? e.target.closest(SEL) : null;
      if (cur && cur !== c){ reset(cur); cur = null; }
      if (!c) return;
      const p = c.querySelector(".poster"); if (!p) return;
      if (!p.querySelector(".tilt-glare")) p.insertAdjacentHTML("beforeend", '<i class="tilt-glare"></i>');
      const r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cur = c; c.classList.add("tilting");
      p.style.transform = calm ? "scale(1.05)" : `perspective(800px) translateY(-6px) translateZ(40px) rotateX(${(-y * 18).toFixed(2)}deg) rotateY(${(x * 18).toFixed(2)}deg) scale(1.08)`;
      p.style.setProperty("--gx", ((x + .5) * 100).toFixed(1) + "%"); p.style.setProperty("--gy", ((y + .5) * 100).toFixed(1) + "%");
    }, {passive: true});
    document.addEventListener("pointerleave", () => { if (cur){ reset(cur); cur = null; } });
  })();

