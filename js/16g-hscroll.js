  // ================= 7.13: прокрутка любых горизонтальных лент мышкой =================
  // Всё, что листается вбок (вкладки, «Играет», ряды карточек, панели конструктора), получает:
  // стрелки по краям при наведении и перетаскивание мышкой. Ленты .hs-in со своими стрелками не трогаем.
  // На телефоне не нужно — там листают пальцем.
  (() => {
    let fine = false;
    try { fine = matchMedia("(hover: hover) and (pointer: fine)").matches; } catch(_){ /* ожидаемо: старый браузер */ }
    if (!fine) return;
    const NO_DRAG = "input,textarea,select,option,[contenteditable],[data-lydrag],.stk,.ly-h,[draggable=\"true\"]";
    const chev = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    const mk = dir => { const b = document.createElement("button"); b.type = "button"; b.className = "hx-b " + dir; b.tabIndex = -1;
      b.setAttribute("aria-label", dir === "prev" ? "Листать влево" : "Листать вправо"); b.innerHTML = chev(dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"); return b; };
    const P = mk("prev"), N = mk("next");
    let cur = null, hideT = 0;
    const scrollable = el => { if (!el || el.nodeType !== 1 || el === document.body || el === document.documentElement) return false;
      if (el.dataset.hscroll || el.classList.contains("hs-in")) return false;
      if (el.scrollWidth - el.clientWidth < 8) return false;
      const ox = getComputedStyle(el).overflowX; return ox === "auto" || ox === "scroll"; };
    const find = t => { for (let el = t, n = 0; el && n < 12; el = el.parentElement, n++){ if (el.classList && el.classList.contains("hx-b")) return cur; if (scrollable(el)) return el; } return null; };
    const place = () => { if (!cur || !cur.isConnected){ hide(true); return; }
      const r = cur.getBoundingClientRect(), max = cur.scrollWidth - cur.clientWidth - 2;
      if (r.width < 60 || r.bottom < 0 || r.top > innerHeight){ hide(true); return; }
      const s = Math.max(26, Math.min(36, r.height - 4)), y = r.top + r.height / 2 - s / 2;
      for (const [b, x, on] of [[P, r.left + 4, cur.scrollLeft > 2], [N, r.right - s - 4, cur.scrollLeft < max]]){
        if (!b.isConnected) document.body.appendChild(b);
        Object.assign(b.style, {left: x + "px", top: y + "px", width: s + "px", height: s + "px"}); b.classList.toggle("on", on); } };
    const hide = now => { clearTimeout(hideT); const go = () => { if (cur) cur.removeEventListener("scroll", place); cur = null; P.classList.remove("on"); N.classList.remove("on"); };
      if (now) go(); else hideT = setTimeout(go, 220); };
    const show = el => { clearTimeout(hideT); if (cur !== el){ if (cur) cur.removeEventListener("scroll", place); cur = el; el.addEventListener("scroll", place, {passive: true}); wire(el); } place(); };
    document.addEventListener("pointerover", e => { if (e.pointerType && e.pointerType !== "mouse") return; const el = find(e.target); if (el) show(el); else if (cur) hide(); }, {passive: true});
    document.documentElement.addEventListener("mouseleave", () => hide(), {passive: true});
    window.addEventListener("scroll", () => { if (cur) place(); }, {passive: true, capture: true});
    window.addEventListener("resize", () => { if (cur) place(); }, {passive: true});
    [P, N].forEach(b => { b.addEventListener("pointerdown", e => e.preventDefault());
      b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); if (!cur) return;
        cur.scrollBy({left: (b === P ? -1 : 1) * Math.max(140, cur.clientWidth * .75), behavior: "smooth"});
        if (typeof SND !== "undefined" && SND.tick) try { SND.tick(.5); } catch(_){ /* ожидаемо: звук не включился */ } }); });
    // перетаскивание мышкой с инерцией
    const wired = new WeakSet();
    function wire(el){ if (wired.has(el)) return; wired.add(el);
      let d = null, moved = false, vel = 0, lx = 0, lt = 0, mom = 0;
      el.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button || e.target.closest(NO_DRAG)) return;
        cancelAnimationFrame(mom); d = {x: e.clientX, l: el.scrollLeft, id: e.pointerId}; moved = false; lx = e.clientX; lt = performance.now(); vel = 0; });
      el.addEventListener("pointermove", e => { if (!d) return; const dx = e.clientX - d.x;
        if (!moved){ if (Math.abs(dx) < 6) return; moved = true; el.classList.add("hx-drag"); try { el.setPointerCapture(d.id); } catch(_){ /* ожидаемо: кнопку уже отпустили */ } }
        el.scrollLeft = d.l - dx; const t = performance.now(); vel = (e.clientX - lx) / Math.max(1, t - lt); lx = e.clientX; lt = t; });
      const up = () => { if (!d) return; d = null; el.classList.remove("hx-drag"); if (!moved) return;
        let v = -vel * 16; const step = () => { v *= .92; el.scrollLeft += v; if (Math.abs(v) > .4) mom = requestAnimationFrame(step); }; mom = requestAnimationFrame(step); };
      el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
      // после перетаскивания клик не срабатывает (чтобы не открыть карточку случайно)
      el.addEventListener("click", e => { if (moved){ e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
      el.addEventListener("dragstart", e => { if (!e.target.closest || !e.target.closest('[draggable="true"]')) e.preventDefault(); });
    }
  })();
