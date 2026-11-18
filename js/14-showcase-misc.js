  // ================= 3.1: свои витрины в профиле (как в Steam) =================
  const SC_KIND = {game: ["Игры", "игр"], kino: ["Кино и сериалы", "кино"], read: ["Книги и манга", "книг"]};
  const scList = uid => (FR && FR.showcases ? FR.showcases.filter(x => x.user_id === uid) : []).sort((a, b) => (a.ord - b.ord) || String(a.created_at).localeCompare(String(b.created_at)));
  // запись витрины: ссылка на свою запись (ref) или самостоятельная карточка (t, cover, url, year, note)
  function scResolve(e, sc){
    if (e.ref){
      if (sc.kind === "read"){ const r = ME && sc.user_id === ME.id ? (READS || []).find(x => x.id === e.ref) : frReads(sc.user_id).find(x => x.id === e.ref); if (r) return {read: r}; }
      else { const it = ME && sc.user_id === ME.id ? MYITEMS.find(x => x.id === e.ref) : frItems(sc.user_id).find(x => x.id === e.ref); if (it) return {it}; }
    }
    return {free: e};
  }
  const scFreeItem = (e, sc) => ({id: "x", title: e.t || "Без названия", cover: e.cover || null, type: sc.kind === "game" ? "game" : e.type || "movie", status: "x"});
  function scCard(e, i, sc, mine){
    const r = scResolve(e, sc), del = mine ? `<span class="sc-x" role="button" data-scrm="${esc(sc.id)}:${i}" title="Убрать из витрины">${ICON.x}</span>` : "";
    if (r.read) return `<button class="pf-c sc-c" ${mine ? `data-rd="${esc(r.read.id)}"` : `data-frd="${esc(sc.user_id + "/" + r.read.id)}"`}>${rCover(r.read)}${del}<span class="ti">${esc(r.read.title)}</span>${e.note ? `<small>${esc(e.note)}</small>` : ""}</button>`;
    if (r.it) return `<button class="pf-c sc-c" ${mine ? `data-id="${esc(r.it.id)}"` : `data-fi="${esc(sc.user_id + "/" + r.it.id)}"`}>${posterHTML(r.it, {tgt: false})}${del}<span class="ti">${esc(r.it.title)}</span>${e.note ? `<small>${esc(e.note)}</small>` : ""}</button>`;
    const f = scFreeItem(e, sc);
    return `<button class="pf-c sc-c" data-scen="${esc(sc.id)}:${i}">${sc.kind === "read" ? rCover({title: f.title, cover: f.cover, coverUrl: e.coverUrl || null}) : posterHTML(f, {tgt: false, badge: false})}${del}<span class="ti">${esc(f.title)}</span>${e.note || e.year ? `<small>${esc(e.note || e.year)}</small>` : ""}</button>`;
  }
  function scBox(sc, mine){
    const add = mine ? `<button class="pf-add" type="button" data-scadd="${esc(sc.id)}"><i>${ICON.plus}</i><span>Добавить</span></button>` : "";
    const body = sc.entries.length || mine ? railHTML("pf-rail", sc.entries.map((e, i) => scCard(e, i, sc, mine)).join("") + add) : `<div class="pf-empty"><span>Пока пусто</span></div>`;
    return `<section class="pf-box sc-box"><header><h3>${esc(sc.title)}<small>${sc.entries.length}</small></h3><span class="sc-k">${SC_KIND[sc.kind][0]}</span>${mine ? reordBtn("sc:" + sc.id, sc.entries.length) + `<button class="pf-mini" data-scedit="${esc(sc.id)}">${ICON.edit}Настроить</button>` : ""}</header>${body}</section>`;
  }
  function scFloor(uid, mine){
    const list = scList(uid);
    if (!list.length && !mine) return "";
    return `<section class="pf-floor fl-s"><div class="pf-fh"><span class="ic">${ICON.star}</span><h2>Витрины</h2>${mine ? `<button class="pf-fh-b" data-scnew="1">${ICON.plus}Создать витрину</button>` : ""}</div>
      ${list.map(sc => scBox(sc, mine)).join("")}
      ${!list.length && mine ? `<div class="pf-empty"><span>Своя полка на любой вкус: «Нелюбимые игры», «Фильмы на Новый год», «Манга, от которой плакал». Её увидят все, кто зайдёт в профиль.</span><button class="pf-eb" type="button" data-scnew="1">${ICON.plus}Создать</button></div>` : ""}</section>`;
  }
  async function scSave(sc){
    const row = {id: sc.id, user_id: ME.id, title: sc.title, kind: sc.kind, entries: sc.entries, ord: sc.ord || 0, updated_at: now()};
    const {error} = await SB.from("showcases").upsert(row);
    if (error){ toast("Не сохранилось: " + error.message); return false; }
    if (FR){ FR.showcases = FR.showcases || []; const i = FR.showcases.findIndex(x => x.id === sc.id); if (i >= 0) FR.showcases[i] = {...FR.showcases[i], ...row}; else FR.showcases.push({...row, created_at: now()}); }
    if (route === "home") render(); return true;
  }
  function scNewSheet(){
    let kind = "game";
    const s = openSheet(`<h3>Новая витрина</h3><p class="sub">Выбери, что будет на полке, и придумай название. Витрину увидят все, кто откроет твой профиль.</p>
      <div class="sc-kinds" id="scK">${Object.entries(SC_KIND).map(([k, [l]]) => `<button type="button" data-k="${k}" aria-pressed="${k === kind}">${k === "game" ? ICON.games : k === "kino" ? ICON.kino : BOOK_I}<span>${l}</span></button>`).join("")}</div>
      <label class="f">Название<input class="in" id="scT" maxlength="60" placeholder="Например: Нелюбимые игры" autocomplete="off"></label>
      <div class="sc-ideas" id="scI"></div>
      <div class="acts" style="margin-top:12px"><button class="ib blue" id="scOk">Создать и наполнить</button><button class="ib" id="scNo">Отмена</button></div>`);
    const q = x => s.el.querySelector(x);
    const IDEAS = {game: ["Нелюбимые игры", "Лучший кооп", "Игры детства", "Платина", "Переоценённые"], kino: ["Фильмы на Новый год", "Пересматриваю каждый год", "Разочарование года", "Смотреть с девушкой", "Лучшие концовки"], read: ["Манга, от которой плакал", "Комиксы для старта", "Бросил на середине", "Лучшая рисовка"]};
    const ideas = () => { q("#scI").innerHTML = IDEAS[kind].map(t => `<button type="button" data-t="${esc(t)}">${esc(t)}</button>`).join(""); };
    q("#scK").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; kind = b.dataset.k; q("#scK").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); ideas(); SND.tick(.5); };
    q("#scI").onclick = e => { const b = e.target.closest("[data-t]"); if (b){ q("#scT").value = b.dataset.t; q("#scT").focus(); } };
    q("#scNo").onclick = () => s.close();
    q("#scOk").onclick = async () => { const t = q("#scT").value.trim(); if (!t){ q("#scT").focus(); toast("Дай витрине название"); return; }
      const sc = {id: crypto.randomUUID(), title: t, kind, entries: [], ord: scList(ME.id).length}; q("#scOk").disabled = true;
      if (await scSave(sc)){ s.close(); toast("Витрина создана"); setTimeout(() => scAddSheet(sc.id), 200); } else q("#scOk").disabled = false; };
    ideas(); setTimeout(() => q("#scT").focus(), 60);
  }
  function scEditSheet(id){
    const sc0 = scList(ME.id).find(x => x.id === id); if (!sc0) return; const sc = JSON.parse(JSON.stringify(sc0));
    const draw = () => sc.entries.map((e, i) => { const r = scResolve(e, sc), t = r.read ? r.read.title : r.it ? r.it.title : e.t;
      return `<div class="sce-r"><span class="n">${i + 1}</span><span class="t">${esc(t || "Без названия")}<input class="in" data-note="${i}" value="${esc(e.note || "")}" placeholder="подпись, по желанию" maxlength="60"></span><button type="button" data-up="${i}" title="Выше" ${i ? "" : "disabled"}>↑</button><button type="button" data-rm="${i}" title="Убрать">${ICON.x}</button></div>`; }).join("") || `<p class="sub">Пока пусто.</p>`;
    const s = openSheet(`<h3>Витрина</h3><label class="f">Название<input class="in" id="sceT" maxlength="60" value="${esc(sc.title)}"></label>
      <div class="av-lb">Что на полке · ${SC_KIND[sc.kind][0]}</div><div class="sce" id="sceL">${draw()}</div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="sceOk">Сохранить</button><button class="ib" id="sceAdd">${ICON.plus}Добавить</button><button class="ib red" id="sceDel">Удалить витрину</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    q("#sceL").addEventListener("input", e => { const n = e.target.dataset.note; if (n != null) sc.entries[+n].note = e.target.value.trim() || null; });
    q("#sceL").onclick = e => { const up = e.target.closest("[data-up]"), rm = e.target.closest("[data-rm]");
      if (up){ const i = +up.dataset.up; [sc.entries[i - 1], sc.entries[i]] = [sc.entries[i], sc.entries[i - 1]]; q("#sceL").innerHTML = draw(); }
      if (rm){ sc.entries.splice(+rm.dataset.rm, 1); q("#sceL").innerHTML = draw(); } };
    q("#sceAdd").onclick = () => { s.close(); scAddSheet(id); };
    q("#sceDel").onclick = async () => { if (!confirm(`Удалить витрину «${sc.title}»?`)) return; const {error} = await SB.from("showcases").delete().eq("id", id); if (error){ toast("Не удалилось"); return; }
      FR.showcases = FR.showcases.filter(x => x.id !== id); s.close(); render(); };
    q("#sceOk").onclick = async () => { sc.title = q("#sceT").value.trim() || sc.title; if (await scSave(sc)){ s.close(); toast("Сохранено"); } };
  }
  // добавить в витрину: из коллекции, по ссылке или вручную
  function scAddSheet(id){
    const sc = scList(ME.id).find(x => x.id === id); if (!sc) return;
    let tab = "lib", file = null, coverUrl = null, got = null;
    const pool = sc.kind === "read" ? [...(READS || [])].sort(byAt("updatedAt")) : MYITEMS.filter(i => sc.kind === "game" ? isGame(i) : !isGame(i)).sort(byAt("updatedAt"));
    const has = ref => sc.entries.some(e => e.ref === ref);
    const linkHint = sc.kind === "game" ? "Ссылка на игру в Steam" : sc.kind === "kino" ? "Ссылка на Кинопоиск" : "Ссылка на com-x или readmanga";
    const s = openSheet(`<h3>Добавить в «${esc(sc.title)}»</h3>
      <div class="rs-seg sc-tabs" id="scTb"><button type="button" data-t="lib" aria-pressed="true">Из коллекции</button><button type="button" data-t="url" aria-pressed="false">По ссылке</button><button type="button" data-t="man" aria-pressed="false">Вручную</button></div>
      <div id="scP-lib"><label class="pk-q">${ICON.search}<input class="in" id="scQ" placeholder="Найти на полке" autocomplete="off"></label>
        <div class="pk" id="scPk">${pool.length ? pool.map(x => `<button type="button" class="pk-c" data-k="${esc(x.id)}" aria-pressed="${has(x.id)}">${sc.kind === "read" ? rCover(x) : posterHTML(x, {tgt: false, rate: false, badge: false})}<i class="pk-ok">${CHECK_I}</i><span>${esc(x.title)}</span></button>`).join("") : `<p class="sub" style="grid-column:1/-1">В коллекции пусто — добавь по ссылке или вручную.</p>`}</div></div>
      <div id="scP-url" hidden><label class="f">${linkHint}<span class="rs-q"><input class="in" id="scU" inputmode="url" placeholder="https://" autocomplete="off"><button type="button" class="rs-find" id="scUGo" title="Найти">${ICON.search}</button></span></label><div id="scUR" class="sc-ur"></div></div>
      <div id="scP-man" hidden><div class="rs3"><div class="rs3-cv" id="scCv"></div><div class="rs3-f">
        <label class="f">Название<input class="in" id="scMT" maxlength="120" autocomplete="off"></label>
        <label class="f">Год<input class="in" id="scMY" inputmode="numeric" maxlength="4"></label>
        <label class="f">Подпись<input class="in" id="scMN" maxlength="60" placeholder="почему тут, по желанию"></label></div></div></div>
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="scDone">Готово</button><button class="ib" id="scAddOne" hidden>Добавить на витрину</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const showTab = t => { tab = t; ["lib", "url", "man"].forEach(k => q("#scP-" + k).hidden = k !== t); q("#scTb").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === t)); q("#scAddOne").hidden = t === "lib"; if (t === "man") drawCv(); };
    q("#scTb").onclick = e => { const b = e.target.closest("[data-t]"); if (b) showTab(b.dataset.t); };
    q("#scQ").addEventListener("input", e => { const v = e.target.value.trim().toLowerCase(); s.el.querySelectorAll("#scPk .pk-c").forEach(b => b.hidden = !!v && !b.textContent.toLowerCase().includes(v)); });
    q("#scPk").onclick = e => { const b = e.target.closest(".pk-c"); if (!b) return; const ref = b.dataset.k, on = !has(ref);
      if (on){ const x = pool.find(i => i.id === ref); sc.entries.push({ref, t: x.title, cover: x.cover || null}); } else sc.entries = sc.entries.filter(e2 => e2.ref !== ref);
      b.setAttribute("aria-pressed", on); SND.tick(.7); };
    const drawCv = () => { const src = file ? URL.createObjectURL(file) : coverUrl; q("#scCv").innerHTML = src ? `<span class="rx-cv"><img src="${esc(src)}" alt="" referrerpolicy="no-referrer"></span>` : `<span class="rx-cv rs-empty"><span class="ph"><i class="rs-up">${ICON.up}</i><b>Перетащи постер</b><small>или нажми, или Ctrl+V</small></span></span>`; };
    const take = f => { if (!f || !f.type.startsWith("image/")) return; file = f; coverUrl = null; if (tab !== "man") showTab("man"); drawCv(); };
    q("#scCv").onclick = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => take(i.files[0]); i.click(); };
    bindDrop(q("#scCv"), take, u => { file = null; coverUrl = u; drawCv(); }); pasteTarget = take;
    const b64file = (b64, type) => { try { const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); return new File([bin], "cover.jpg", {type: type || "image/jpeg"}); } catch(_){ return null; } };
    q("#scUGo").onclick = async () => { const u = q("#scU").value.trim(); if (!u){ q("#scU").focus(); return; } const out = q("#scUR"); out.innerHTML = `<p class="sub">Ищу…</p>`; got = null;
      try {
        if (sc.kind === "game"){ const m = u.match(/store\.steampowered\.com\/app\/(\d+)/i) || u.match(/^(\d{2,10})$/); if (!m) throw new Error("это не ссылка на игру в Steam");
          const {data: d, error} = await SB.functions.invoke("steam", {body: {appid: m[1]}}); if (error || !d || d.error) throw new Error((d && d.error) || "Steam не ответил");
          got = {t: d.name, year: (String((d.release && d.release.date) || "").match(/\d{4}/) || [])[0] || null, url: u, file: d.cover ? b64file(d.cover, d.coverType) : null}; }
        else if (sc.kind === "kino"){ const {data: d, error} = await SB.functions.invoke("kino", {body: {url: u}}); if (error || !d || d.error) throw new Error((d && d.error) === "not_found" ? "не нашёл фильм" : "Кинопоиск не ответил");
          got = {t: d.title, year: d.year || null, url: u, type: d.type || "movie", file: d.cover ? b64file(d.cover, d.coverType) : null}; }
        else { const d = await readerFetch(u); got = {t: d.title, year: d.year || null, url: u, file: d.cover ? b64file(d.cover, d.coverType) : null, coverUrl: d.coverUrl || null}; }
        if (!got.t) throw new Error("не нашёл название");
        const src = got.file ? URL.createObjectURL(got.file) : got.coverUrl;
        out.innerHTML = `<div class="sc-got">${src ? `<img src="${esc(src)}" alt="" referrerpolicy="no-referrer">` : ""}<div><b>${esc(got.t)}</b><small>${esc(got.year || "")}</small></div></div>`;
      } catch(err){ out.innerHTML = `<p class="sub">Не вышло: ${esc(err.message || err)}. Добавь вручную.</p>`; } };
    q("#scU").addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); q("#scUGo").click(); } });
    q("#scAddOne").onclick = async () => { const b = q("#scAddOne"); let e = null;
      if (tab === "url"){ if (!got){ toast("Сначала найди по ссылке"); return; } e = {t: got.t, year: got.year, url: got.url, type: got.type || null, f: got.file, coverUrl: got.coverUrl || null}; }
      else { const t = q("#scMT").value.trim(); if (!t){ q("#scMT").focus(); toast("Нужно название"); return; } e = {t, year: q("#scMY").value.trim() || null, note: q("#scMN").value.trim() || null, f: file, coverUrl}; }
      b.disabled = true; b.textContent = "Добавляю…";
      try { const cover = e.f && assets ? await upload(e.f) : null; const entry = {t: e.t, cover, year: e.year || null, url: e.url || null, note: e.note || null, type: e.type || null}; if (!cover && e.coverUrl) entry.coverUrl = e.coverUrl;
        sc.entries.push(entry); if (await scSave(sc)){ toast(`«${e.t}» на витрине`); file = null; coverUrl = null; got = null; q("#scMT").value = ""; q("#scMY").value = ""; q("#scMN").value = ""; q("#scU").value = ""; q("#scUR").innerHTML = ""; drawCv(); }
      } catch(err){ toast("Не загрузилось"); }
      b.disabled = false; b.textContent = "Добавить на витрину"; };
    q("#scDone").onclick = async () => { if (tab === "lib" || sc.entries.length !== (scList(ME.id).find(x => x.id === id) || {entries: []}).entries.length) await scSave(sc); s.close(); };
  }
  function scEntrySheet(key){
    const [id, i] = key.split(":"), sc = FR && FR.showcases && FR.showcases.find(x => x.id === id); if (!sc) return; const e = sc.entries[+i]; if (!e) return;
    const src = e.cover ? publicUrl(e.cover) : e.coverUrl;
    openSheet(`<div class="rs-top">${src ? `<span class="rx-cv"><img src="${esc(src)}" alt="" referrerpolicy="no-referrer"></span>` : `<span class="rx-cv"><span class="ph" style="--h:${rHue(e.t)}"><b>${esc(e.t)}</b></span></span>`}<div><h3 style="margin-bottom:4px">${esc(e.t)}</h3>
      <p class="sub">${esc([SC_KIND[sc.kind][0], e.year].filter(Boolean).join(" · "))}</p><p class="sub" style="margin-top:8px">${avaHTML(profOf(sc.user_id), "xs")} витрина «${esc(sc.title)}»</p>
      ${e.note ? `<p class="sub" style="margin-top:8px;color:#e5e5ea">${esc(e.note)}</p>` : ""}${e.url ? `<p class="sub" style="margin-top:8px"><a href="${esc(e.url)}" target="_blank" rel="noopener" style="color:#64d2ff">Открыть ссылку ↗</a></p>` : ""}</div></div>`);
  }
  document.addEventListener("click", async e => {
    const km = e.target.closest && e.target.closest("[data-kmore]"); if (km && ME){ e.preventDefault(); e.stopPropagation(); openItem(km.dataset.kmore); return; }
    const x = e.target.closest && e.target.closest("[data-unnow],[data-unread]"); if (!x || !ME) return;
    e.preventDefault(); e.stopPropagation();
    if (x.dataset.unread){ const r = (READS || []).find(z => z.id === x.dataset.unread); if (!r) return; x.closest(".rx-mag").classList.add("gone");
      if (await saveRead({...r, status: "plan"})){ toast(`«${r.title}» убран из «Читаю» — лежит в «В планах»`); SND.paper("soft"); render(); } return; }
    const [k, id] = x.dataset.unnow.split(":"); x.closest(".pf-c,.rx-mag").classList.add("gone");
    if (k === "read"){ const r = (READS || []).find(z => z.id === id); if (r && await saveRead({...r, now: null, nowAt: null})){ toast("Убрано с полки «Сейчас читаю»"); render(); } return; }
    try { await db.doc("items/" + id).update({now: null, nowAt: null}); toast("Убрано с полки «Смотрю»"); } catch(_){ toast("Не сохранилось"); render(); }
  }, true);
  document.addEventListener("click", e => {
    const el = e.target.closest && e.target.closest("[data-scnew],[data-scadd],[data-scedit],[data-scen],[data-scrm]"); if (!el || !ME) return;
    if (el.dataset.scrm){ e.preventDefault(); e.stopPropagation(); const [id, i] = el.dataset.scrm.split(":"), sc = scList(ME.id).find(x => x.id === id); if (!sc) return;
      const c = JSON.parse(JSON.stringify(sc)); c.entries.splice(+i, 1); scSave(c); return; }
    if (el.dataset.scnew){ scNewSheet(); return; }
    if (el.dataset.scadd){ scAddSheet(el.dataset.scadd); return; }
    if (el.dataset.scedit){ scEditSheet(el.dataset.scedit); return; }
    if (el.dataset.scen){ scEntrySheet(el.dataset.scen); return; }
  }, true);

  // ================= 3.2: давно пройденное — «Без даты», чтобы не попадало в календарь =================
  let FORM_NEW = false, fdTouched = false, FORM_IDS = {};
  function ndAuto(){
    return; // 4.9: без даты — только через статус «давно», автогалочки больше нет
    if (!FORM_NEW || fdTouched) return; const nd = $("f_nodate"); if (!nd) return;
    const chip = document.querySelector('#f_st [aria-pressed="true"]'), cur = chip ? chip.dataset.v : ($("f_status") ? $("f_status").value : "");
    const old = ["done", "played", "dropped"].includes(cur);
    if (nd.checked !== old){ nd.checked = old; nd.dispatchEvent(new Event("change", {bubbles: true})); }
    const row = nd.closest(".nd-row"); if (!row) return; let h = row.parentElement.querySelector(".nd-hint");
    if (old && !h){ h = document.createElement("small"); h.className = "nd-hint"; h.textContent = "Давно прошёл или посмотрел — оставь «Без даты», в календарь и траты не попадёт. Было сегодня — сними галочку."; row.after(h); }
    if (!old && h) h.remove();
  }
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#f_st,#f_stc")) setTimeout(ndAuto, 0); });
  document.addEventListener("change", e => { const t = e.target; if (!t) return; if (t.id === "f_status") setTimeout(ndAuto, 0); if ((t.id === "f_date" || t.id === "f_nodate") && e.isTrusted) fdTouched = true; });
  document.addEventListener("input", e => { if (e.target && e.target.id === "f_date" && e.isTrusted) fdTouched = true; });

  // ================= 3.2: печатная машинка =================
  document.addEventListener("keydown", e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (!t || !(t.matches && t.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),textarea,[contenteditable]"))) return;
    if (e.key === "Enter") SND.type("enter"); else if (e.key === " ") SND.type("space"); else if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") SND.type("key");
  }, true);

  // ================= 3.2: календарь ГО ПОСМОТРИМ и архив просмотров =================
  let wcY = new Date().getFullYear(), wcM = new Date().getMonth();
  const whoProp = e => ME && e.owner === ME.id ? "ты" : (profOf(e.owner).nick || "кто-то");
  const evTime = e => { const s = evStart(e); return s ? s.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"}) : ""; };
  function renderWatchCal(){
    appleHead("ГО ПОСМОТРИМ", `<button class="a-link" data-go="people">‹ Активность</button>`);
    if (!ME){ $("aMain").innerHTML = `<div class="a-empty"><b>Нужно войти</b></div>`; return; }
    if (!EV){ $("aMain").innerHTML = `<p class="a-sub" style="padding:40px">Загружаю…</p>`; loadEvents(); return; }
    if (!FR) loadFriends();
    const all = EV.events.filter(e => e.kind === "watch" && e.starts_at), by = new Map();
    all.forEach(e => { const k = localDate(evStart(e)); if (!by.has(k)) by.set(k, []); by.get(k).push(e); });
    by.forEach(l => l.sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
    const first = new Date(wcY, wcM, 1), st = (first.getDay() + 6) % 7, dim = new Date(wcY, wcM + 1, 0).getDate(), td = today();
    let cells = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map(x => `<span class="wcal-w">${x}</span>`).join("");
    for (let i = 0; i < st; i++) cells += `<span class="wcal-d o"></span>`;
    for (let d = 1; d <= dim; d++){
      const key = `${wcY}-${pad(wcM + 1)}-${pad(d)}`, l = by.get(key) || [], past = key < td;
      const cls = `wcal-d${key === td ? " td" : ""}${l.length ? " has" : ""}${past ? " past" : ""}`;
      if (!l.length){ cells += `<span class="${cls}"><i class="n">${d}</i></span>`; continue; }
      if (l.length === 1){ const e = l[0], f = filmItem(e);
        cells += `<button class="${cls}" data-w="${esc(e.id)}"><i class="n">${d}</i><span class="wcal-e">${f.cover ? `<span class="cv" style="background-image:url('${publicUrl(f.cover)}')"></span>` : ""}<b>${esc(f.title || e.title)}</b><small>${evTime(e)} · ${avaHTML(profOf(e.owner), "xs")} ${esc(whoProp(e))}</small></span></button>`; continue; }
      cells += `<button class="${cls} multi" data-wday="${key}"><i class="n">${d}</i><span class="wcal-e"><span class="stack">${l.slice(0, 3).map(e => { const f = filmItem(e); return `<span class="cv" style="${f.cover ? `background-image:url('${publicUrl(f.cover)}')` : ""}"></span>`; }).join("")}</span><b>${l.length} ${plural(l.length, "просмотр", "просмотра", "просмотров")}</b><small>${esc([...new Set(l.map(whoProp))].join(", "))}</small></span></button>`;
    }
    const arch = all.filter(evPast).sort((a, b) => b.starts_at.localeCompare(a.starts_at));
    const up = all.filter(e => !evPast(e)).length;
    $("aMain").innerHTML = `<div class="wcal-pg">
      <div class="wcal-top"><h1 class="a-h1">ГО <span>ПОСМОТРИМ</span></h1><button class="gw-new" data-wnew="1">+ Позвать смотреть</button></div>
      <p class="a-sub">${up ? `${up} ${plural(up, "сеанс", "сеанса", "сеансов")} впереди` : "Пока ничего не назначено"}. Нажми на фильм — откроется сеанс.</p>
      <div class="wcal" id="wcal"><div class="wcal-nav"><button data-wcm="-1" aria-label="Прошлый месяц">${CHEV_L}</button><b>${MONTHS_NOM[wcM]}${wcY !== new Date().getFullYear() ? " " + wcY : ""}</b><button data-wcm="1" aria-label="Следующий месяц">${CHEV_R}</button>${wcY !== new Date().getFullYear() || wcM !== new Date().getMonth() ? `<button class="wcal-today" data-wcm="0">Сегодня</button>` : ""}</div>
        <div class="wcal-g">${cells}</div></div>
      <h2 class="wcal-h">Архив просмотров<small>${arch.length}</small></h2>
      ${arch.length ? `<div class="wcal-arch">${arch.map(e => { const f = filmItem(e), goers = evMem(e.id).filter(m => m.status === "going").map(m => m.user_id);
        return `<button class="wca-r" data-w="${esc(e.id)}">${posterHTML(f, {tgt: false, rate: false, badge: false})}<span class="t"><b>${esc(f.title || e.title)}</b><small>${esc(evWhen(e))} · ${e.mode === "cinema" ? "киновечер" : "онлайн"}</small><small>предложил ${avaHTML(profOf(e.owner), "xs")} ${esc(whoProp(e))}</small></span>${goers.length ? avaStack(goers, 4) : ""}</button>`; }).join("")}</div>`
        : `<p class="a-sub">Здесь появятся сеансы, которые уже прошли.</p>`}</div>`;
  }
  function wcalPop(btn){
    document.querySelectorAll(".wcal-pop").forEach(x => x.remove());
    const l = EV.events.filter(e => e.kind === "watch" && e.starts_at && localDate(evStart(e)) === btn.dataset.wday).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const box = $("wcal"), pop = document.createElement("div"); pop.className = "wcal-pop";
    pop.innerHTML = `<div class="h">${parseD(btn.dataset.wday).toLocaleDateString("ru-RU", {day: "numeric", month: "long", weekday: "long"})}</div>${l.map(e => { const f = filmItem(e);
      return `<button data-w="${esc(e.id)}">${posterHTML(f, {tgt: false, rate: false, badge: false})}<span><b>${esc(f.title || e.title)}</b><small>${evTime(e)} · ${e.mode === "cinema" ? "киновечер" : "онлайн"}</small><small>${avaHTML(profOf(e.owner), "xs")} предложил ${esc(whoProp(e))}</small></span></button>`; }).join("")}`;
    box.appendChild(pop);
    const b = btn.getBoundingClientRect(), r = box.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = b.left - r.left + b.width / 2 - pw / 2; x = Math.max(8, Math.min(r.width - pw - 8, x));
    let y = b.bottom - r.top + 6; if (y + ph > r.height + 120 && b.top - r.top - ph - 6 > 0) y = b.top - r.top - ph - 6;
    pop.style.left = x + "px"; pop.style.top = y + "px"; SND.click("soft");
  }
  document.addEventListener("pointerdown", e => { if (!e.target.closest(".wcal-pop,[data-wday]")) document.querySelectorAll(".wcal-pop").forEach(x => x.remove()); }, {passive: true});
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-wday],[data-wcm],[data-wcal],[data-epsh]"); if (!el || !ME) return;
    if (el.dataset.wday){ wcalPop(el); return; }
    if (el.dataset.wcm != null){ const d = +el.dataset.wcm; if (!d){ wcY = new Date().getFullYear(); wcM = new Date().getMonth(); } else { wcM += d; if (wcM < 0){ wcM = 11; wcY--; } if (wcM > 11){ wcM = 0; wcY++; } } renderWatchCal(); return; }
    if (el.dataset.wcal){ go("watchcal"); return; }
    if (el.dataset.epsh){ epSheet(el.dataset.epsh); return; }
  });

  // ================= 3.2: окно серий — прогресс и правка сезонов =================
  function epSheet(id){
    const it = MYITEMS.find(i => i.id === id); if (!it) return;
    let arr = Array.isArray(it.seasonEps) && it.seasonEps.length ? it.seasonEps.map(n => Math.max(0, +n || 0)) : +it.seasons > 0 ? Array(+it.seasons).fill(0) : [];
    if (!arr.length && +it.epTotal) arr = [+it.epTotal];
    let w = +it.epWatched || 0;
    const tot = () => arr.reduce((s, n) => s + n, 0) || (arr.length ? 0 : +it.epTotal || 0);
    const pos = () => { let left = w; for (let i = 0; i < arr.length; i++){ if (left <= arr[i]) return {s: i + 1, e: left}; left -= arr[i]; } return {s: arr.length || 1, e: left}; };
    const s = openSheet(`<div class="eps-h">${posterHTML(it, {tgt: false, rate: false})}<div><h3>${esc(it.title)}</h3><p class="sub">${esc([KTYPES[it.type], it.year].filter(Boolean).join(" · "))}</p></div></div>
      <div class="eps-p" id="epP"></div>
      <div class="eps-b"><button class="ib" id="epM">−1</button><button class="ib blue" id="epPl">+1 серия</button></div>
      <div class="av-lb">Где я сейчас</div><div class="eps-at"><label>Сезон<select class="in" id="epS"></select></label><label>Серия<input class="in" id="epE" inputmode="numeric"></label></div>
      <div class="av-lb">Сезоны и серии <small style="text-transform:none;letter-spacing:0;opacity:.7">если Кинопоиск вставил неправильно</small></div>
      <div class="eps-se" id="epSe"></div><button class="ib" id="epAdd" style="margin-top:8px">${ICON.plus}Добавить сезон</button>
      <div class="acts" style="margin-top:16px"><button class="ib blue" id="epOk">Сохранить</button><button class="ib" id="epCard">Карточка сериала</button><button class="ib" id="epNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    q("#epCard").onclick = () => { s.close(); setTimeout(() => openItem(it.id), 80); };
    const draw = () => { const t = tot(); w = Math.max(0, t ? Math.min(w, t) : w); const p = pos();
      q("#epP").innerHTML = `<div class="n"><b>${w}</b> из ${t || "?"} ${plural(t || w, "серии", "серий", "серий")}${arr.length ? `<span>S${p.s} · E${p.e}</span>` : ""}</div>
        <div class="segs">${arr.length ? arr.map((n, i) => { const before = arr.slice(0, i).reduce((x, y) => x + y, 0), pr = n ? Math.max(0, Math.min(1, (w - before) / n)) : 0; return `<i style="--n:${Math.max(1, n)}" title="${i + 1} сезон · ${n} сер."><u style="width:${(pr * 100).toFixed(1)}%"></u></i>`; }).join("") : `<i style="--n:1"><u style="width:${t ? Math.min(100, w / t * 100) : 0}%"></u></i>`}</div>`;
      q("#epS").innerHTML = (arr.length ? arr : [0]).map((n, i) => `<option value="${i + 1}"${p.s === i + 1 ? " selected" : ""}>${i + 1}</option>`).join(""); q("#epE").value = arr.length ? p.e : w;
      q("#epSe").innerHTML = arr.map((n, i) => `<div class="eps-r"><span>${i + 1} сезон</span><button type="button" data-sd="${i}:-1">−</button><input class="in" data-si="${i}" inputmode="numeric" value="${n || ""}" placeholder="?"><button type="button" data-sd="${i}:1">+</button><span class="u">серий</span><button type="button" class="x" data-sx="${i}" title="Убрать сезон">${ICON.x}</button></div>`).join("") || `<p class="sub" style="margin:0">Сезоны не указаны — добавь хотя бы один.</p>`;
      q("#epM").disabled = !w; };
    q("#epM").onclick = () => { w = Math.max(0, w - 1); draw(); SND.tick(.6); };
    q("#epPl").onclick = () => { const t = tot(); if (t && w >= t) return; w++; draw(); SND.tick(.8); };
    const setAt = () => { const si = +q("#epS").value || 1, ei = Math.max(0, parseInt(q("#epE").value, 10) || 0); w = arr.length ? arr.slice(0, si - 1).reduce((a, b) => a + b, 0) + Math.min(ei, arr[si - 1] || ei) : ei; draw(); };
    q("#epS").onchange = setAt; q("#epE").onchange = setAt;
    q("#epSe").addEventListener("change", e => { const i = e.target.dataset.si; if (i != null){ arr[+i] = Math.max(0, parseInt(e.target.value, 10) || 0); draw(); } });
    q("#epSe").onclick = e => { const d = e.target.closest("[data-sd]"), x = e.target.closest("[data-sx]");
      if (d){ const [i, k] = d.dataset.sd.split(":").map(Number); arr[i] = Math.max(0, (arr[i] || 0) + k); draw(); }
      if (x){ arr.splice(+x.dataset.sx, 1); draw(); } };
    q("#epAdd").onclick = () => { arr.push(arr[arr.length - 1] || 10); draw(); };
    q("#epNo").onclick = () => s.close();
    q("#epOk").onclick = async () => { const t = tot(), patch = {seasons: arr.length || null, seasonEps: arr.length ? arr.slice() : null, epTotal: t || null, epWatched: w};
      if (t && w >= t && it.status !== "done"){ patch.status = "done"; patch.date = today(); patch.noDate = null; patch.now = null; }
      else if (it.status === "done" && t && w < t){ patch.status = "playing"; }
      try { await write(it.id, patch); s.close(); toast(patch.status === "done" ? "Досмотрено — переехал в просмотренные" : "Сохранено"); if (patch.status === "done") confetti(); } catch(_){ toast("Не сохранилось"); } };
    draw();
  }


  // ================= 3.2: приглашение для Телеграма =================
  const SITE_URL = () => location.origin + location.pathname.replace(/index\.html$/, "");
  // компактное приглашение: в Телеграм Desktop вставляется с жирным и ссылками, а название ведёт на постер — он встаёт превью
  function tgText(kind, e){
    const s = evStart(e), when = s ? s.toLocaleDateString("ru-RU", {weekday: "short", day: "numeric", month: "long"}).replace(/^./, c => c.toUpperCase()) + ", " + s.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"}) : "дата пока не назначена";
    const nick = uid => ME && uid === ME.id ? NICK : (profOf(uid).nick || "");
    const going = evMem(e.id).filter(m => m.status === "going").map(m => nick(m.user_id)).filter(Boolean);
    const site = `${SITE_URL()}#${kind}:${e.id}`, H = x => esc(x);
    const who = [`Зовёт ${nick(e.owner)}`, going.length ? `идут: ${going.join(", ")}` : ""].filter(Boolean).join(" · ");
    const descr = e.descr ? String(e.descr).trim().replace(/\s*\n\s*/g, " ").slice(0, 280) : "";
    let head, sub, img = e.photo ? publicUrl(e.photo) : null, extraP = "", extraH = "";
    if (kind === "watch"){ const f = filmItem(e); if (f.cover) img = publicUrl(f.cover);
      const title = (f.title || e.title) + (f.year ? ` (${f.year})` : "");
      head = {p: `ГО ПОСМОТРИМ — ${title}`, h: `<b>ГО ПОСМОТРИМ — ${img ? `<a href="${H(img)}">${H(f.title || e.title)}</a>` : H(f.title || e.title)}</b>${f.year ? ` (${f.year})` : ""}`};
      const where = e.mode === "cinema" ? `киновечер${e.place ? ", " + e.place : ""}` : "онлайн";
      sub = {p: `${when} · ${where}`, h: `${H(when)} · ${H(where)}`};
    } else {
      head = {p: e.title, h: `<b>${img ? `<a href="${H(img)}">${H(e.title)}</a>` : H(e.title)}</b>`};
      sub = {p: [when, e.place].filter(Boolean).join(" · "), h: [H(when), e.place ? H(e.place) : ""].filter(Boolean).join(" · ")};
    }
    const plain = [head.p, sub.p, descr, who, `Иду / не иду: ${site}`].filter(Boolean).join("\n") + extraP;
    const html = [head.h, sub.h, descr ? `<i>${H(descr)}</i>` : "", H(who), `<a href="${H(site)}">Иду / не иду →</a>`].filter(Boolean).join("<br>") + extraH;
    return {plain, html};
  }
  async function tgCopy(key){
    const [kind, id] = key.split(":"), e = evById(id); if (!e) return;
    const t = tgText(kind, e);
    try {
      if (window.ClipboardItem && navigator.clipboard.write) await navigator.clipboard.write([new ClipboardItem({"text/html": new Blob([t.html], {type: "text/html"}), "text/plain": new Blob([t.plain], {type: "text/plain"})})]);
      else await navigator.clipboard.writeText(t.plain);
      toast("Скопировано — вставь в чат Телеграма"); SND.click("soft");
    } catch(_){
      try { await navigator.clipboard.writeText(t.plain); toast("Скопировано — вставь в чат Телеграма"); }
      catch(__){ const s = openSheet(`<h3>Для Телеграма</h3><p class="sub">Выдели и скопируй текст.</p><textarea class="in" readonly style="min-height:170px;font:400 14px/1.45 var(--ios)">${esc(t.plain)}</textarea>`); const ta = s.el.querySelector("textarea"); ta.focus(); ta.select(); }
    }
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-tgcopy]"); if (el && ME){ e.preventDefault(); tgCopy(el.dataset.tgcopy); } });
  // постер картинкой в буфер: в Телеграме вставляешь его, а текст приглашения — в подпись
  document.addEventListener("click", async e => { const el = e.target.closest && e.target.closest("[data-tgposter]"); if (!el || !ME) return; e.preventDefault();
    const ev = evById(el.dataset.tgposter); if (!ev) return; const pic = ev.kind === "watch" ? (filmItem(ev).cover || ev.photo) : ev.photo; if (!pic) return; const f = {cover: pic}; el.disabled = true;
    try {
      const png = ev.kind !== "watch" && ev.photo ? evCrop(ev) : new Promise(async (ok, no) => { try { const r = await fetch(publicUrl(f.cover), {mode: "cors"}); const b = await r.blob(); if (b.type === "image/png") return ok(b);
        const im = await createImageBitmap(b), c = document.createElement("canvas"); c.width = im.width; c.height = im.height; c.getContext("2d").drawImage(im, 0, 0); c.toBlob(x => x ? ok(x) : no(0), "image/png"); } catch(err){ no(err); } });
      await navigator.clipboard.write([new ClipboardItem({"image/png": png})]);
      toast((ev.kind === "watch" ? "Постер" : "Картинка") + " скопирована — вставь в чат, а текст приглашения в подпись");
    } catch(_){ window.open(publicUrl(f.cover), "_blank"); toast("Браузер не дал скопировать — открыл картинку, сохрани её"); }
    el.disabled = false; });

  // ================= 3.3: свой порядок на любой полке =================
  const posOf = (x, k) => x && x.pos && typeof x.pos[k] === "number" ? x.pos[k] : null;
  const byPos = (k, fb) => (a, b) => { const pa = posOf(a, k), pb = posOf(b, k); if (pa != null || pb != null) return (pa ?? 1e6) - (pb ?? 1e6) || (fb ? fb(a, b) : 0); return fb ? fb(a, b) : 0; };
  const byFin = (a, b) => String(b.finishedAt || b.date || b.createdAt || "").localeCompare(String(a.finishedAt || a.date || a.createdAt || ""));
  const SHELF = {
    gnow: {t: "Сейчас играю", f: i => isGame(i) && i.now, fb: (a, b) => byAt("nowAt")(a, b)},
    gfav: {t: "Любимые игры", f: i => isGame(i) && i.fav, fb: (a, b) => byAt("favAt")(a, b)},
    gdone: {t: "Пройденные", f: i => isGame(i) && inLib(i) && gStatus(i.status) === "done", fb: byFin},
    gyt: {t: "Прошёл на YouTube", f: i => isGame(i) && inLib(i) && gStatus(i.status) === "youtube", fb: byFin},
    gdrop: {t: "Дроп", f: i => isGame(i) && inLib(i) && gStatus(i.status) === "dropped", fb: byFin},
    kfav: {t: "Любимые фильмы и сериалы", f: i => !isGame(i) && i.fav, fb: (a, b) => byAt("favAt")(a, b)},
    know: {t: "Смотрю", f: i => !isGame(i) && i.now && kNorm(i) !== "done", fb: (a, b) => byAt("nowAt")(a, b)},
    kseen: {t: "Просмотренные", f: i => !isGame(i) && inLib(i) && kNorm(i) === "done", fb: (a, b) => String(b.date || "").localeCompare(String(a.date || "")) || byAt("createdAt")(a, b)},
    kplan: {t: "Буду смотреть", f: i => !isGame(i) && isFuture(i), fb: (a, b) => byAt("createdAt")(a, b)},
    rfav: {t: "Любимые тайтлы", rd: 1, f: r => r.fav, fb: (a, b) => byAt("favAt")(a, b)},
    rnow: {t: "Сейчас читаю", rd: 1, f: r => r.now, fb: (a, b) => byAt("nowAt")(a, b)},
    rdone: {t: "Прочитанные", rd: 1, f: r => rNorm(r.status) === "done", fb: (a, b) => byAt("updatedAt")(a, b)},
    rread: {t: "Читаю", rd: 1, f: r => rNorm(r.status) === "reading", fb: (a, b) => recentFirst(a, b)},
  };
  const shelfOf = (k, pool) => pool.filter(SHELF[k].f).sort(byPos(k, SHELF[k].fb));
  const reordBtn = (k, n) => n > 1 ? `<button class="pf-mini" type="button" data-reord="${k}" title="Расставить перетаскиванием">${ICON.drag}Расставить</button>` : "";
  function reorderSheet(title, list, cellHTML, onSave){
    const s = openSheet(`<h3>${esc(title)}</h3><p class="sub">Перетаскивай обложки мышкой или пальцем. В таком порядке они будут стоять у тебя и у друзей.</p>
      <div class="og" id="og">${list.map(x => `<div class="og-c" data-oid="${esc(x.id)}">${cellHTML(x)}<span>${esc(x.title || x.t || "")}</span></div>`).join("")}</div>
      <div class="acts"><button class="ib blue" id="ogOk">Сохранить</button><button class="ib" id="ogNo">Отмена</button></div>`, {wide: true});
    const box = s.el.querySelector("#og"); let drag = null;
    const flip = mv => { const cs = [...box.children], r0 = new Map(cs.map(c => [c, c.getBoundingClientRect()])); mv();
      cs.forEach(c => { if (c === (drag && drag.c)) return; const a = r0.get(c), b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top; if (!dx && !dy) return;
        c.style.transition = "none"; c.style.transform = `translate(${dx}px,${dy}px)`; requestAnimationFrame(() => { c.style.transition = "transform .28s cubic-bezier(.2,.9,.3,1.1)"; c.style.transform = ""; }); }); };
    box.addEventListener("pointerdown", e => { const c = e.target.closest(".og-c"); if (!c || e.button) return; e.preventDefault(); drag = {c, x: e.clientX, y: e.clientY, on: false}; try { box.setPointerCapture(e.pointerId); } catch(_){ /* ожидаемо: палец уже убран */ } });
    box.addEventListener("pointermove", e => { if (!drag) return;
      if (!drag.on){ if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return; drag.on = true; drag.c.classList.add("lift"); }
      const t = document.elementFromPoint(e.clientX, e.clientY), o = t && t.closest(".og-c");
      if (!o || o === drag.c || o.parentNode !== box) return;
      const cs = [...box.children], from = cs.indexOf(drag.c), to = cs.indexOf(o);
      flip(() => box.insertBefore(drag.c, from < to ? o.nextSibling : o)); SND.tick(.5); });
    const end = () => { if (!drag) return; drag.c.classList.remove("lift"); drag = null; };
    box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
    s.el.querySelector("#ogNo").onclick = () => s.close();
    s.el.querySelector("#ogOk").onclick = async () => { const b = s.el.querySelector("#ogOk"); b.disabled = true; b.textContent = "Сохраняю…";
      const bad = await onSave([...box.children].map(c => c.dataset.oid)); s.close(); toast(bad ? "Часть не сохранилась" : "Порядок сохранён"); render(); };
  }
  async function savePos(k, ids){
    let bad = 0;
    for (let i = 0; i < ids.length; i++){
      if (SHELF[k].rd){ const r = (READS || []).find(x => x.id === ids[i]); if (!r || posOf(r, k) === i) continue; const row = await saveRead({...r, pos: {...(r.pos || {}), [k]: i}}); if (!row) bad++; }
      else { const it = MYITEMS.find(x => x.id === ids[i]); if (!it || posOf(it, k) === i) continue; try { await db.doc("items/" + it.id).update({pos: {...(it.pos || {}), [k]: i}}); } catch(_){ bad++; } }
    }
    return bad;
  }
  function reord(key){
    if (key.startsWith("sc:")){ const sc = scList(ME.id).find(x => x.id === key.slice(3)); if (!sc) return;
      const list = sc.entries.map((e, i) => { const r = scResolve(e, sc); return {id: String(i), title: r.read ? r.read.title : r.it ? r.it.title : e.t, r, e}; });
      reorderSheet(sc.title, list, x => x.r.read ? rCover(x.r.read) : posterHTML(x.r.it || scFreeItem(x.e, sc), {tgt: false, rate: false, badge: false}), async ids => { const c = JSON.parse(JSON.stringify(sc)); c.entries = ids.map(i => sc.entries[+i]); return (await scSave(c)) ? 0 : 1; });
      return; }
    if (key.startsWith("lib:")){ orderSheet(key.slice(4)); return; }
    const S = SHELF[key]; if (!S) return;
    const list = shelfOf(key, S.rd ? (READS || []) : MYITEMS);
    if (list.length < 2){ toast("Тут пока нечего расставлять"); return; }
    reorderSheet(S.t, list, x => S.rd ? rCover(x) : posterHTML(x, {tgt: false, rate: false}), ids => savePos(key, ids));
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-reord]"); if (!el || !ME) return; e.preventDefault(); e.stopPropagation(); reord(el.dataset.reord); }, true);

  // ================= 3.3: стопка игр — карты вылетают из колоды =================
  function wirePile(el){
    if (el.dataset.pile === "2") return; el.dataset.pile = "2";
    const cards = [...el.querySelectorAll(".pf-c")]; if (!cards.length || !("IntersectionObserver" in window) || calmMotion) return;
    cards.forEach((c, i) => { c.style.setProperty("--r", `${(((i * 37) % 7) - 3) * .9}deg`); c.classList.add("pend"); });
    let q = [], busy = false;
    const pump = () => { if (busy) return; const c = q.shift(); if (!c) return; busy = true; c.classList.remove("pend"); c.classList.add("dealt"); SND.deal(); setTimeout(() => { busy = false; pump(); }, 85); };
    const io = new IntersectionObserver(es => { es.filter(x => x.isIntersecting && x.target.classList.contains("pend")).sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left).forEach(x => { if (!q.includes(x.target)) q.push(x.target); io.unobserve(x.target); }); pump(); }, {root: el, threshold: .35});
    cards.forEach(c => io.observe(c));
    // на всякий случай: через 4 секунды показываем всё, что так и не вылетело
    setTimeout(() => cards.forEach(c => c.classList.remove("pend")), 4000);
  }

  // ================= 3.3: «Обновления» — что недавно добавлено =================
  function updSheet(kind, uid){
    const mine = !uid || (ME && uid === ME.id), pool = (mine ? MYITEMS : frItems(uid)).filter(i => kind === "games" ? isGame(i) : !isGame(i)).filter(i => i.createdAt).sort(byAt("createdAt")).slice(0, 40);
    const st = it => isFuture(it) ? "на будущее" : isSoon(it) ? "ждёт релиз" : isGame(it) ? GSTATUS[gStatus(it.status)].toLowerCase() : kLab(it).l.toLowerCase();
    let last = "", h = "";
    pool.forEach(it => { const d = localDate(new Date(it.createdAt)); if (d !== last){ last = d; h += `<div class="upd-d">${d === today() ? "Сегодня" : d === addDays(today(), -1) ? "Вчера" : fmtDate(d)}</div>`; }
      h += `<button class="fgs-r" ${mine ? `data-id="${esc(it.id)}"` : `data-fi="${esc(uid + "/" + it.id)}"`}>${posterHTML(it, {rate: false, tgt: false})}<span class="t"><b>${esc(it.title)}</b><small>${esc(st(it))}${genres(it)[0] ? " · " + esc(genres(it)[0].toLowerCase()) : ""}</small></span>${typeof it.rating === "number" ? `<span class="r ${rateCls(it.rating)}">${num1(it.rating)}</span>` : ""}</button>`; });
    const s = openSheet(`<h3>Обновления · ${kind === "games" ? "игры" : "кино"}</h3><p class="sub">${mine ? "Что ты добавлял последним" : `Что ${esc(profOf(uid).nick || "")} добавлял последним`}</p><div class="fgs upd">${h || `<p class="sub">Пока ничего.</p>`}</div>`, {wide: true});
    s.el.addEventListener("click", e => { if (e.target.closest("[data-id],[data-fi]")) s.close(); }, true);
  }

  // ================= 3.4: кино в профиле — минимально, как в стримингах =================
  const tvCard = (it, attr, sub) => `<button class="tv-c" ${attr}><span class="tv-p">${posterHTML(it, {tgt: false, rate: false, badge: false})}<span class="tv-o"><b>${esc(it.title)}</b><small>${esc([it.year, KTYPES[it.type]].filter(Boolean).join(" · "))}</small>${typeof it.rating === "number" ? `<span class="tv-r ${rateCls(it.rating)}">${num1(it.rating)}</span>` : ""}</span></span><span class="tv-t">${esc(it.title)}</span>${sub ? `<small class="tv-s">${sub}</small>` : ""}</button>`;

  // ================= 3.4: напоминание составить тир-лист =================
  const tierCta = kind => { if (!canWrite || FV) return ""; const lib = MYITEMS.filter(i => (kind === "games" ? isGame(i) : !isGame(i)) && inLib(i)); const n = lib.filter(i => !i.tier).length;
    if (lib.length < 3 || !n) return "";
    return `<button class="tier-cta" data-tierq="${kind}"><span class="tc-bars">${TIERS.map(([l, c]) => `<i style="--c:${c}">${l}</i>`).join("")}</span><span class="rc-t"><b>ТИР-ЛИСТ</b><small>${n} ${plural(n, "запись", "записи", "записей")} без тира — разложи по полкам S–D, друзья увидят в профиле</small></span><span class="rc-go">›</span></button>`; };
  const ctaRow = kind => { const h = rateCta(kind) + tierCta(kind); return h ? `<div class="cta-row">${h}</div>` : ""; };
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-tierq]"); if (el && ME) openTiers(el.dataset.tierq); });

  // ================= 3.4: свои тир-листы =================
  const TL_COLORS = ["#ff5f57", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2", "#ff375f", "#8e8e93", "#ff7f7f", "#ffbf7f", "#ffdf7f", "#ffff7f", "#bfff7f", "#7fff7f", "#7fffff", "#7fbfff", "#7f7fff", "#ff7fff"];
  const tlAll = () => (FR && FR.tierlists) || [];
  const tlById = id => tlAll().find(x => x.id === id);
  const tlRoot = tl => tl && tl.reply_to ? (tlById(tl.reply_to) || tl) : tl;
  const tlItems = tl => [...(tl.tiers || []).flatMap(t => t.items || []), ...(tl.pool || [])];
  const tlBoard = (tl, small) => `<div class="tlb${small ? " sm" : ""}">${(tl.tiers || []).map(t => `<div class="tlb-r"><span class="tlb-l" style="--c:${esc(t.c || "#8e8e93")}">${esc(t.n || "")}</span><span class="tlb-z">${(t.items || []).map(x => `<span class="tlb-i" title="${esc(x.t || "")}">${x.img ? `<img src="${esc(publicUrl(x.img))}" alt="" loading="lazy">` : ""}${x.t && !small ? `<small>${esc(x.t)}</small>` : ""}</span>`).join("")}</span></div>`).join("")}</div>`;
  // тир-лист из оценок полки (S–D у игр и кино)
  function itemTierBoard(list, small){
    const rows = TIERS.map(([l, c]) => ({l, c, its: list.filter(i => i.tier === l).sort((a, b) => (a.tierOrder ?? 1e6) - (b.tierOrder ?? 1e6))})).filter(r => r.its.length);
    if (!rows.length) return "";
    return `<div class="tlb${small ? " sm" : ""}">${rows.map(r => `<div class="tlb-r"><span class="tlb-l" style="--c:${r.c}">${r.l}</span><span class="tlb-z">${r.its.map(i => `<span class="tlb-i poster-i" title="${esc(i.title)}">${i.cover ? `<img src="${esc(publicUrl(i.cover))}" alt="" loading="lazy" style="${posStyle(i.coverPos)}">` : `<em>${esc(i.title)}</em>`}</span>`).join("")}</span></div>`).join("")}</div>`;
  }
  function tlFloor(uid, mine, g, k){
    const gl = g.filter(inLib).filter(i => i.tier), kl = k.filter(inLib).filter(i => i.tier);
    const pins = tlAll().filter(x => x.user_id === uid && x.pinned).sort(byAt("updated_at"));
    if (!gl.length && !kl.length && !pins.length && !mine) return "";
    const box = (title, body, act) => `<section class="pf-box tl-box"><header><h3>${title}</h3>${act || ""}</header>${body}</section>`;
    return `<section class="pf-floor fl-t"><div class="pf-fh"><span class="ic">${ICON.tiers}</span><h2>Тир-листы</h2>${mine ? `<span class="pf-fh-r"><button class="pf-fh-b" data-tmimp="1">${ICON.down}TierMaker</button><button class="pf-fh-b" data-tlnew="1">${ICON.plus}Создать</button></span>` : ""}</div>
      ${gl.length ? box("Игры", itemTierBoard(gl, true), mine ? `<button class="pf-mini" data-tierq="games">${ICON.edit}Изменить</button>` : "") : ""}
      ${kl.length ? box("Кино и сериалы", itemTierBoard(kl, true), mine ? `<button class="pf-mini" data-tierq="kino">${ICON.edit}Изменить</button>` : "") : ""}
      ${pins.map(t => box(esc(t.title), tlBoard(t, true), `<button class="pf-mini" data-tlv="${esc(t.id)}">Открыть</button>`)).join("")}
      ${!gl.length && !kl.length && !pins.length ? `<div class="pf-empty"><span>Составь тир-лист игр или кино, или свой — на любую тему, с картинками. Можно перенести готовый с TierMaker. Закреплённые видят все.</span><button class="pf-eb" data-tlnew="1">${ICON.plus}Создать</button></div>` : ""}</section>`;
  }
  async function squareImg(file, S = 256){
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(file); });
    const c = document.createElement("canvas"); c.width = c.height = S; const m = Math.min(img.naturalWidth, img.naturalHeight);
    c.getContext("2d").drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, S, S);
    const blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", .86)); return (await assets.upload(blob, {type: "image/jpeg"})).id;
  }
  const rid = () => Math.random().toString(36).slice(2, 10);
  function tlEditor(src, o = {}){
    if (!assets){ toast("Сначала войди"); return; }
    const isNew = !src || !!o.reply || !!o.preset, base = src ? JSON.parse(JSON.stringify(src)) : null;
    const tl = o.preset ? {id: crypto.randomUUID(), title: o.preset.title || "", tiers: o.preset.tiers, pool: o.preset.pool || [], pinned: false, reply_to: null, source: o.preset.source || null}
      : isNew ? {id: crypto.randomUUID(), title: o.reply ? `Моя версия: ${base.title}`.slice(0, 80) : "", tiers: base ? base.tiers : TIERS.map(([n, c]) => ({n, c, items: []})), pool: base ? base.pool || [] : [], pinned: false, reply_to: o.reply ? (base.reply_to || base.id) : null, source: base ? base.source || null : null}
      : base;
    // своя версия: те же тиры и картинки, но всё лежит в «Не распределено» — расставляешь с нуля
    if (o.reply){ tl.pool = [...(base.tiers || []).flatMap(t => t.items || []), ...(base.pool || [])].map(x => ({...x, id: rid()})); tl.tiers = (base.tiers || []).map(t => ({n: t.n, c: t.c, items: []})); }
    let busy = 0;
    const s = openSheet(`<div class="tle"><input class="in tle-ti" id="tleT" maxlength="80" placeholder="Название тир-листа: «Лучшие боссы», «Аниме-опенинги»…" value="${esc(tl.title)}">
      <div class="tle-b" id="tleB"></div>
      <div class="tle-pool"><div class="tle-ph"><b>Не распределено</b><small>перетащи картинки в тиры · нажми на картинку, чтобы подписать</small></div><div class="tle-z" data-ti="pool" id="tleP"></div></div>
      <div class="tle-tools"><label class="ib">${ICON.img}Добавить картинки<input type="file" id="tleF" accept="image/*" multiple hidden></label><button class="ib" id="tleAddT">${ICON.plus}Тир</button><button type="button" class="ib" id="tleTm">${ICON.down}Импорт с TierMaker</button><button type="button" class="ib tle-pin${tl.pinned ? " on" : ""}" id="tlePin">${ICON.pin}${tl.pinned ? "Закреплён в профиле" : "Закрепить в профиле"}</button></div>
      <div class="acts" style="margin-top:12px"><button class="ib blue" id="tleOk">Сохранить</button><button class="ib" id="tleNo">Отмена</button></div></div>`, {wide: true});
    s.el.classList.add("tle-sheet");
    const q = x => s.el.querySelector(x);
    const itH = x => `<span class="tle-it" data-iid="${esc(x.id)}">${x.img ? `<img src="${esc(publicUrl(x.img))}" alt="" draggable="false">` : `<i class="up"></i>`}${x.t ? `<small>${esc(x.t)}</small>` : ""}</span>`;
    const draw = () => {
      q("#tleB").innerHTML = tl.tiers.map((t, i) => `<div class="tle-r"><div class="tle-l" style="--c:${esc(t.c)}"><textarea rows="${Math.min(3, Math.max(1, Math.ceil((t.n || "").length / 9)))}" maxlength="40" data-tn="${i}" aria-label="Название тира" style="font-size:${(t.n || "").length > 14 ? 12 : (t.n || "").length > 6 ? 14 : 17}px">${esc(t.n)}</textarea><span class="tle-lb"><button type="button" data-tc="${i}" title="Цвет">●</button><button type="button" data-tu="${i}" title="Выше" ${i ? "" : "disabled"}>↑</button><button type="button" data-tx="${i}" title="Убрать тир">✕</button></span></div><div class="tle-z" data-ti="${i}">${t.items.map(itH).join("")}</div></div>`).join("");
      q("#tleP").innerHTML = tl.pool.map(itH).join("") + `<label class="tle-add">${ICON.plus}<input type="file" accept="image/*" multiple hidden data-tlf="1"></label>`;
    };
    const find = iid => { for (const t of tl.tiers){ const i = t.items.findIndex(x => x.id === iid); if (i >= 0) return [t.items, i]; } const i = tl.pool.findIndex(x => x.id === iid); return i >= 0 ? [tl.pool, i] : null; };
    const addFiles = async files => { files = [...files].filter(f => f.type.startsWith("image/")).slice(0, 40); if (!files.length) return;
      for (const f of files){ const x = {id: rid(), img: null, t: ""}; tl.pool.push(x); busy++; draw();
        try { x.img = await squareImg(f); } catch(_){ tl.pool = tl.pool.filter(y => y !== x); toast("Картинка не загрузилась"); } busy--; draw(); } };
    q("#tleF").onchange = e => addFiles(e.target.files);
    s.el.addEventListener("change", e => { if (e.target.dataset && e.target.dataset.tlf) addFiles(e.target.files); });
    bindDrop(q(".tle"), f => addFiles([f])); pasteTarget = f => addFiles([f]);
    s.el.addEventListener("input", e => { const i = e.target.dataset && e.target.dataset.tn; if (i != null) tl.tiers[+i].n = e.target.value.replace(/\s*\n\s*/g, " "); });
    s.el.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset && e.target.dataset.tn != null){ e.preventDefault(); e.target.blur(); } });
    s.el.addEventListener("click", e => {
      const c = e.target.closest("[data-tc]"), u = e.target.closest("[data-tu]"), x = e.target.closest("[data-tx]");
      if (c){ const t = tl.tiers[+c.dataset.tc]; t.c = TL_COLORS[(TL_COLORS.indexOf(t.c) + 1) % TL_COLORS.length]; draw(); return; }
      if (u){ const i = +u.dataset.tu; [tl.tiers[i - 1], tl.tiers[i]] = [tl.tiers[i], tl.tiers[i - 1]]; draw(); return; }
      if (x){ const i = +x.dataset.tx; tl.pool.push(...tl.tiers[i].items); tl.tiers.splice(i, 1); draw(); return; }
    });
    q("#tleAddT").onclick = () => { if (tl.tiers.length >= 20) return; tl.tiers.push({n: String.fromCharCode(65 + tl.tiers.length), c: TL_COLORS[tl.tiers.length % TL_COLORS.length], items: []}); draw(); };
    q("#tleTm").onclick = () => tmImport(x => { const empty = !tl.tiers.some(t => t.items.length) && !tl.pool.length;
      if (empty){ tl.tiers = x.tiers; tl.pool = x.pool; tl.source = x.source; if (!q("#tleT").value.trim()) q("#tleT").value = x.title; }
      else tl.pool.push(...x.tiers.flatMap(t => t.items), ...x.pool);
      draw(); toast(empty ? "Тир-лист перенесён — правь под себя" : "Картинки с TierMaker добавлены в «Не распределено»"); });
    q("#tlePin").onclick = () => { tl.pinned = !tl.pinned; const b = q("#tlePin"); b.classList.toggle("on", tl.pinned); b.innerHTML = `${ICON.pin}${tl.pinned ? "Закреплён в профиле" : "Закрепить в профиле"}`; };
    // перетаскивание картинок между тирами
    let dr = null;
    q(".tle").addEventListener("pointerdown", e => { const it = e.target.closest(".tle-it"); if (!it || e.button) return; e.preventDefault(); dr = {it, x: e.clientX, y: e.clientY, on: false, g: null}; });
    const mvH = e => { if (!dr) return;
      if (!dr.on){ if (Math.hypot(e.clientX - dr.x, e.clientY - dr.y) < 6) return; dr.on = true; dr.g = dr.it.cloneNode(true); dr.g.className = "tle-it tle-ghost"; document.body.appendChild(dr.g); dr.it.classList.add("lift"); }
      dr.g.style.left = e.clientX + "px"; dr.g.style.top = e.clientY + "px";
      s.el.querySelectorAll(".tle-z.over").forEach(z => z.classList.remove("over")); const z = document.elementFromPoint(e.clientX, e.clientY); const zz = z && z.closest && z.closest(".tle-z"); if (zz) zz.classList.add("over"); };
    const upH = e => { if (!dr) return; const d = dr; dr = null; s.el.querySelectorAll(".tle-z.over").forEach(z => z.classList.remove("over"));
      if (!d.on){ itemEdit(d.it.dataset.iid); return; }
      d.g.remove(); d.it.classList.remove("lift");
      const el = document.elementFromPoint(e.clientX, e.clientY), z = el && el.closest && el.closest(".tle-z"); if (!z) return;
      const f = find(d.it.dataset.iid); if (!f) return; const [arr, i] = f, [x] = arr.splice(i, 1);
      const dest = z.dataset.ti === "pool" ? tl.pool : tl.tiers[+z.dataset.ti].items, before = el.closest(".tle-it"), bi = before ? dest.findIndex(y => y.id === before.dataset.iid) : -1;
      if (bi >= 0) dest.splice(bi, 0, x); else dest.push(x); SND.tick(.7); draw(); };
    addEventListener("pointermove", mvH); addEventListener("pointerup", upH);
    const c0 = s.close; s.close = () => { removeEventListener("pointermove", mvH); removeEventListener("pointerup", upH); if (dr && dr.g) dr.g.remove(); dr = null; c0(); };
    const itemEdit = iid => { const f = find(iid); if (!f) return; const x = f[0][f[1]];
      const m = openSheet(`<div class="tle-ed">${x.img ? `<img src="${esc(publicUrl(x.img))}" alt="">` : ""}<label class="f">Подпись <small style="text-transform:none;letter-spacing:0;opacity:.7">по желанию</small><input class="in" id="tieT" maxlength="40" value="${esc(x.t || "")}"></label></div>
        <div class="acts"><button class="ib blue" id="tieOk">Готово</button><button class="ib red" id="tieDel">Удалить картинку</button></div>`);
      const inp = m.el.querySelector("#tieT"); setTimeout(() => inp.focus(), 50);
      const ok = () => { x.t = inp.value.trim(); m.close(); draw(); };
      m.el.querySelector("#tieOk").onclick = ok; inp.addEventListener("keydown", ev => { if (ev.key === "Enter"){ ev.preventDefault(); ok(); } });
      m.el.querySelector("#tieDel").onclick = () => { const g = find(iid); if (g) g[0].splice(g[1], 1); m.close(); draw(); }; };
    q("#tleNo").onclick = () => s.close();
    q("#tleOk").onclick = async () => { tl.title = q("#tleT").value.trim(); if (!tl.title){ q("#tleT").focus(); toast("Придумай название"); return; }
      if (busy){ toast("Подожди, картинки ещё грузятся"); return; }
      const clean = a => a.filter(x => x.img).map(x => ({id: x.id, img: x.img, t: x.t || ""}));
      const row = {id: tl.id, user_id: ME.id, title: tl.title, tiers: tl.tiers.map(t => ({n: (t.n || "").trim() || "?", c: t.c, items: clean(t.items)})), pool: clean(tl.pool), pinned: !!tl.pinned, reply_to: tl.reply_to || null, source: tl.source || null, updated_at: now()};
      const b = q("#tleOk"); b.disabled = true; b.textContent = "Сохраняю…";
      const {error} = await SB.from("tierlists").upsert(row);
      if (error){ toast("Не сохранилось: " + error.message); b.disabled = false; b.textContent = "Сохранить"; return; }
      if (FR){ FR.tierlists = FR.tierlists || []; const i = FR.tierlists.findIndex(x => x.id === row.id); if (i >= 0) FR.tierlists[i] = {...FR.tierlists[i], ...row}; else FR.tierlists.unshift({...row, created_at: now()}); }
      if (isNew && row.reply_to){ const root = tlById(row.reply_to); if (root && root.user_id !== ME.id) notify([root.user_id], "tier_reply", "tier:" + row.id, row.title); }
      s.close(); toast(row.pinned ? "Тир-лист сохранён и закреплён в профиле" : "Тир-лист сохранён"); render(); setTimeout(() => tlView(row.id), 120); };
    draw(); if (!tl.title) setTimeout(() => q("#tleT").focus(), 80);
  }
  function tlView(id){
    const tl = tlById(id); if (!tl){ toast("Тир-лист не найден"); return; }
    const root = tlRoot(tl), mine = ME && tl.user_id === ME.id, p = profOf(tl.user_id);
    const vers = tlAll().filter(x => x.reply_to === root.id && x.user_id !== root.user_id).sort(byAt("updated_at"));
    const s = openSheet(`<div class="tlv-h">${avaHTML(p, "md")}<div><h3>${esc(tl.title)}</h3><p class="sub">${esc(mine ? "твой тир-лист" : p.nick || "")}${tl.reply_to && root !== tl ? ` · версия тир-листа «${esc(root.title)}»` : ""}${tl.pinned ? " · закреплён в профиле" : ""}${tmSrc(tl)}</p></div></div>
      ${tlBoard(tl)}${(tl.pool || []).length ? `<div class="tlv-pool"><small>Не распределено</small><div class="tlb-z">${tl.pool.map(x => `<span class="tlb-i"><img src="${esc(publicUrl(x.img))}" alt=""></span>`).join("")}</div></div>` : ""}
      <div class="tll" data-tllbox="${esc(tl.id)}">${tlLikeHTML(tl.id)}</div>
      <div class="acts tlv-share"><button class="ib" data-tlshare="1">${ICON.link}Поделиться ссылкой</button><button class="ib" data-tlpng="1">${ICON.img}Картинкой</button></div>
      <div class="acts" style="margin-top:10px">${mine ? `<button class="ib blue" data-tle="${esc(tl.id)}">Редактировать</button><button class="ib" data-tlpin="${esc(tl.id)}">${tl.pinned ? "Открепить" : "Закрепить в профиле"}</button><button class="ib red" data-tldel="${esc(tl.id)}">Удалить</button>`
        : `<button class="ib blue" data-tlreply="${esc(tl.id)}">Ответить своей версией</button>`}${tl !== root ? `<button class="ib" data-tlv="${esc(root.id)}">Оригинал</button>` : ""}</div>
      <div class="tlv-vers"><h4>Версии других<small>${vers.length}</small></h4>${vers.length ? vers.map(v => `<button class="tlv-r${v.id === tl.id ? " on" : ""}" data-tlv="${esc(v.id)}">${avaHTML(profOf(v.user_id), "sm")}<span class="t"><b>${esc(profOf(v.user_id).nick || "")}</b><small>${esc(v.title)} · ${esc(agoTs(v.updated_at || v.created_at))}</small></span><span class="tll-c" data-tllc="${esc(v.id)}">${tlLikeCnt(v.id)}</span><span class="th">${tlItems(v).slice(0, 4).map(x => `<img src="${esc(publicUrl(x.img))}" alt="">`).join("")}</span></button>`).join("") : `<p class="sub" style="margin:0">Пока никто не ответил своей версией.</p>`}</div>`, {wide: true});
    s.el.addEventListener("click", async e => { const b = e.target.closest("[data-tle],[data-tlpin],[data-tldel],[data-tlreply],[data-tlv],[data-tlshare],[data-tlpng]"); if (!b) return; e.stopPropagation();
      if (b.dataset.tlshare){ tlShareLink(tl); return; }
      if (b.dataset.tlpng){ tlImageSheet(tl, profOf(tl.user_id)); return; }
      if (b.dataset.tlv){ s.close(); setTimeout(() => tlView(b.dataset.tlv), 60); return; }
      if (b.dataset.tle){ s.close(); tlEditor(tl); return; }
      if (b.dataset.tlreply){ s.close(); tlEditor(tl, {reply: true}); return; }
      if (b.dataset.tlpin){ const v = !tl.pinned, {error} = await SB.from("tierlists").update({pinned: v, updated_at: now()}).eq("id", tl.id); if (error){ toast("Не получилось"); return; } tl.pinned = v; s.close(); toast(v ? "Закреплён в профиле" : "Откреплён"); render(); return; }
      if (b.dataset.tldel){ if (!confirm(`Удалить тир-лист «${tl.title}»?`)) return; const {error} = await SB.from("tierlists").delete().eq("id", tl.id); if (error){ toast("Не удалилось"); return; } FR.tierlists = FR.tierlists.filter(x => x.id !== tl.id && x.reply_to !== tl.id); s.close(); render(); }
    }, true);
  }
  // лайки на тир-листы: все видят, кто лайкнул
  let TLL = [];
  async function loadTlLikes(){ if (!SB || !ME) return; const {data, error} = await fetchAll(() => SB.from("tierlist_likes").select("tierlist_id,user_id,created_at").order("created_at", {ascending: true}), ["tierlist_id", "user_id"]); if (!error){ TLL = data || []; tlLikesSync(); } }
  const tlLikers = id => TLL.filter(l => l.tierlist_id === id).map(l => l.user_id);
  const tlLikeCnt = id => { const n = tlLikers(id).length; return n ? BK_HEART + n : ""; };
  const tlLikeHTML = id => { const us = tlLikers(id), on = !!ME && us.includes(ME.id);
    return `<button class="tll-b${on ? " on" : ""}" type="button" data-tllike="${esc(id)}" aria-pressed="${on}">${BK_HEART}<span>${on ? "Нравится" : "Лайк"}</span>${us.length ? `<b>${us.length}</b>` : ""}</button>${us.length ? `<button class="tll-w" type="button" data-tllwho="${esc(id)}" title="Кто лайкнул">${avaStack(us, 6)}<small>${esc(us.slice(0, 3).map(nickOf).join(", "))}${us.length > 3 ? ` и ещё ${us.length - 3}` : ""}</small></button>` : `<small class="tll-0">Пока никто не лайкнул</small>`}`; };
  function tlLikesSync(){ document.querySelectorAll("[data-tllbox]").forEach(b => { b.innerHTML = tlLikeHTML(b.dataset.tllbox); }); document.querySelectorAll("[data-tllc]").forEach(b => { b.innerHTML = tlLikeCnt(b.dataset.tllc); }); }
  document.addEventListener("click", async e => { const el = e.target.closest && e.target.closest("[data-tllike],[data-tllwho]"); if (!el || !ME) return;
    if (el.dataset.tllwho){ whoSheet("Лайкнули тир-лист", [["Лайки", BK_HEART, tlLikers(el.dataset.tllwho)]]); return; }
    const id = el.dataset.tllike, on = tlLikers(id).includes(ME.id);
    TLL = on ? TLL.filter(l => !(l.tierlist_id === id && l.user_id === ME.id)) : [...TLL, {tierlist_id: id, user_id: ME.id}]; tlLikesSync(); if (!on) SND.click("soft");
    const nb = document.querySelector(`[data-tllike="${id}"]`); if (nb && !on){ nb.classList.add("pop"); setTimeout(() => nb.classList.remove("pop"), 500); }
    const r = on ? await SB.from("tierlist_likes").delete().eq("tierlist_id", id).eq("user_id", ME.id) : await SB.from("tierlist_likes").upsert({tierlist_id: id, user_id: ME.id}, {onConflict: "tierlist_id,user_id", ignoreDuplicates: true});
    if (r.error){ toast("Лайк не сохранился"); loadTlLikes(); } });
  function tlCard(){
    if (!FR) return "";
    const roots = tlAll().filter(x => !x.reply_to).sort(byAt("updated_at"));
    const row = t => { const n = tlAll().filter(x => x.reply_to === t.id).length, th = tlItems(t).slice(0, 4);
      return `<button class="tlc-r" data-tlv="${esc(t.id)}"><span class="th">${th.length ? th.map(x => `<img src="${esc(publicUrl(x.img))}" alt="">`).join("") : `<i>${ICON.tiers}</i>`}</span><span class="t"><b>${esc(t.title)}</b><small>${avaHTML(profOf(t.user_id), "xs")} ${esc(nickOf(t.user_id))}${n ? ` · ${n} ${plural(n, "версия", "версии", "версий")}` : ""}</small></span><span class="tll-c" data-tllc="${esc(t.id)}">${tlLikeCnt(t.id)}</span></button>`; };
    return `<div class="fb-card tlc"><h3>${ICON.tiers}Тир-листы<button class="ev-add" data-tlnew="1" title="Создать тир-лист" aria-label="Создать тир-лист">+</button></h3>
      ${roots.length ? `<div class="tlc-l">${roots.slice(0, 6).map(row).join("")}</div>${roots.length > 6 ? `<button class="ib full" data-tlall="1" style="margin-top:8px">Все ${roots.length}</button>` : ""}<button class="tlc-tm" data-tmimp="1">${ICON.down}Импорт с TierMaker</button>` : `<p class="a-sub" style="margin:0 0 10px;font-size:13px">Свой тир-лист на любую тему: картинки, тиры, подписи. Или перенеси готовый с TierMaker по ссылке. Друзья могут ответить своей версией.</p><div class="tlc-empty"><button class="ib blue bd-set" data-tlnew="1">Создать тир-лист</button><button class="ib bd-set" data-tmimp="1">${ICON.down}С TierMaker</button></div>`}</div>`;
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-tlnew],[data-tlv],[data-tlall],[data-tmimp]"); if (!el || !ME || el.closest(".sh")) return;
    if (el.dataset.tlnew){ tlEditor(null); return; }
    if (el.dataset.tmimp){ tmImport(); return; }
    if (el.dataset.tlv){ tlView(el.dataset.tlv); return; }
    if (el.dataset.tlall){ const roots = tlAll().filter(x => !x.reply_to).sort(byAt("updated_at"));
      const s = openSheet(`<h3>Все тир-листы</h3><div class="tlc-l">${roots.map(t => `<button class="tlc-r" data-tlv="${esc(t.id)}"><span class="th">${tlItems(t).slice(0, 4).map(x => `<img src="${esc(publicUrl(x.img))}" alt="">`).join("")}</span><span class="t"><b>${esc(t.title)}</b><small>${esc(nickOf(t.user_id))}</small></span></button>`).join("")}</div>`, {wide: true});
      s.el.addEventListener("click", ev => { const b = ev.target.closest("[data-tlv]"); if (b){ s.close(); setTimeout(() => tlView(b.dataset.tlv), 60); } }, true); }
  });

  // ================= 4.1–4.2: предложить другу — кино, игры, Читалка =================
  // что переезжает к другу: только сам тайтл, без твоих статуса, дат и заметок
  const SK = {
    kino: {lbl: "Кино", verb: "посмотреть", strip: "Тебе предлагают посмотреть",
      keep: ["title", "originalTitle", "type", "year", "genre", "short", "desc", "cast", "seasons", "epTotal", "seasonEps", "kpId", "releaseDate", "releasePrec",
        "country", "director", "writer", "producer", "operator", "composer", "duration", "age", "tagline", "budget", "boxWorld", "premiereWorld", "premiereRu", "kpRating"]},
    game: {lbl: "Игры", verb: "поиграть", strip: "Тебе предлагают поиграть",
      keep: ["title", "type", "desc", "short", "genre", "release", "year", "steamId", "releaseDate", "releasePrec"]},
    read: {lbl: "Читалка", verb: "почитать", strip: "Тебе предлагают почитать",
      keep: ["title", "origTitle", "type", "genre", "desc", "publisher", "year", "chTotal", "url", "siteStatus", "score", "kind", "coverUrl"]},
  };
  const SUG_KEEP = SK.kino.keep;
  const sKind = f => f && SK[f._k] ? f._k : f && f.type === "game" ? "game" : "kino";
  const rSame = (a, b) => { const ka = [a.title, a.origTitle].filter(Boolean).map(normT), kb = [b.title, b.origTitle].filter(Boolean).map(normT); return ka.some(k => k && kb.includes(k)); };
  const sSame = (a, b) => { const k = sKind(a); if (k !== sKind(b)) return false; return k === "read" ? rSame(a, b) : sameIt(a, b); };
  const sMine = f => { const k = sKind(f); return k === "read" ? (READS || []).find(r => rSame(r, f)) : MYITEMS.find(i => (k === "game") === isGame(i) && sameIt(i, f)); };
  const sFrHas = (uid, f) => { const k = sKind(f); return k === "read" ? ((FR && FR.reads) || []).some(r => r.uid === uid && rSame(r, f)) : ((FR && FR.items) || []).some(i => i.uid === uid && (k === "game") === isGame(i) && sameIt(i, f)); };
  const sMyLab = (m, k) => !m ? "" : k === "read" ? (RSTAT3.find(x => x[0] === rNorm(m.status)) || [, ""])[1].toLowerCase()
    : isFuture(m) ? "у тебя на будущее" : isSoon(m) ? (k === "game" ? "ждёшь релиз" : "ждёшь премьеру") : k === "game" ? (GSTATUS[gStatus(m.status)] || "").toLowerCase() : kLab(m).l.toLowerCase();
  const sMyRating = (m, k) => !m ? null : k === "read" ? (typeof m.myRating === "number" ? m.myRating : null) : (typeof m.rating === "number" ? m.rating : null);
  const sMeta = f => { const k = sKind(f);
    return (k === "read" ? [RTYPE[f.type] || "Читалка", f.year, f.publisher, genres(f).slice(0, 2).join(", ")] : k === "game" ? ["Игра", f.year || f.release, genres(f).slice(0, 3).join(", ")] : [KTYPES[f.type] || "Фильм", f.year, genres(f).slice(0, 3).join(", ")]).filter(Boolean).join(" · "); };
  const sCoverSrc = f => f.cover ? publicUrl(f.cover) : f.coverUrl || "";
  const sPoster = f => { if (sKind(f) !== "read") return posterHTML(f, {tgt: false, rate: false, badge: false, link: false});
    const src = sCoverSrc(f); return `<div class="poster">${src ? `<img alt="" src="${esc(src)}" referrerpolicy="no-referrer" style="${posStyle(f.coverPos)}" onerror="this.remove()">` : `<div class="ph">${esc(f.title || "")}</div>`}</div>`; };
  // статусы, с которыми можно сохранить к себе
  const sOpts = f => { const k = sKind(f);
    return k === "read" ? [["plan", "В планах", ICON.clock], ["reading", "Читаю", BOOK_I], ["done", "Прочитано", CHECK_I], ["old", "Читал давно", CHECK_I]]
      : k === "game" ? [["future", "Буду проходить", ICON.clock], ["playing", "Играю", ICON.pad], ["done", "Прошёл", ICON.medal], ["old", "Играл давно", ICON.medal], ["dropped", "Дропнул", ICON.blood]]
      : [["future", "На будущее", ICON.clock], ...kOpts(f.type || "movie").flatMap(e => e[0] === "done" ? [e, ["old", "Смотрел давно"]] : [e]).map(([s, l]) => [s, l, s === "done" || s === "old" ? ICON.film : s === "playing" ? ICON.kino : s === "dropped" ? ICON.blood : ICON.clock])]; };
  const sCol = s => ({old: "#c9c9d8", future: "#c7c7d6", plan: "#c7c7d6", reading: "#7cc4ff", playing: "#7cc4ff", done: "#9be15d", paused: "#f2d43a", dropped: "#ff8a86"})[s] || "#c7c7d6";

  let SUG = [], kSugNext = false;
  const sugIn = () => SUG.filter(x => ME && x.to_user === ME.id && x.status === "pending");
  async function loadSug(){
    if (!SB || !ME) return;
    const {data, error} = await SB.from("suggestions").select("*").eq("to_user", ME.id).eq("status", "pending").order("created_at", {ascending: false}).limit(80);
    if (error) return; SUG = data || [];
    if (!FV && ["kino", "games", "read"].includes(route)) render();
  }
  // снимок тайтла для отправки
  function sSnap(src, kind, cover, coverPos){
    const f = {_k: kind}; SK[kind].keep.forEach(k => { if (src[k] != null && src[k] !== "") f[k] = src[k]; });
    if (kind === "game") f.type = "game";
    if (cover){ f.cover = cover; delete f.coverUrl; if (coverPos) f.coverPos = coverPos; }
    const r = kind === "read" ? (rNorm(src.status) !== "plan" ? src.myRating : null) : (src.status !== "future" && src.status !== "soon" ? src.rating : null);
    if (typeof r === "number") f.fromRating = r;
    return f;
  }
  const sugFilm = (src, coverPath, coverPos) => sSnap(src, src.type === "game" ? "game" : "kino", coverPath, coverPos);
  // окно «кому предложить»
  async function suggestSheet(film){
    if (!ME || !SB){ toast("Сначала войди"); return; }
    if (!film || !film.title){ toast("Сначала впиши название"); return; }
    if (!FR) await loadFriends(); if (!REC) await loadRecs();
    const k = sKind(film), others = (FR ? FR.profiles : []).filter(p => p.user_id !== ME.id);
    const already = (REC || []).some(r => r.user_id === ME.id && sSame(r.item || {}, film));
    const myR = typeof film.fromRating === "number" ? film.fromRating : null;
    const s = openSheet(`<div class="sg-top">${sPoster(film)}<div><h3>Предложить ${SK[k].verb}</h3><p class="sub"><b style="color:inherit">${esc(film.title)}</b> · ${esc(sMeta(film))}</p><p class="sub" style="margin-top:6px">Конкретному другу придёт уведомление. «Всем друзьям» — попадёт в окно «Друзья советуют» в Активности, с твоей оценкой.</p></div></div>
      <div class="av-lb">Кому</div>
      <button type="button" class="sg-all" id="sgAll" aria-pressed="false"${already ? " disabled" : ""}><span class="ic">${ICON.people}</span><span class="t"><b>Всем друзьям</b><small>${already ? "ты уже советуешь это" : `в «Друзья советуют»${myR != null ? ` · твоя оценка ${num1(myR)}` : " · без оценки"}`}</small></span><i class="ck"></i></button>
      ${others.length ? `<div class="sg-or">или конкретным</div><div class="ev-pick sg-pick" id="sgPk">${others.map(p => { const h = sFrHas(p.user_id, film); return `<button type="button" data-u="${esc(p.user_id)}" aria-pressed="false"${h ? ' class="had" title="Это уже есть у него"' : ""}>${avaHTML(p)}${esc(p.nick)}${h ? "<small>уже есть</small>" : ""}</button>`; }).join("")}</div>` : ""}
      ${myR == null ? `<div id="sgRw" hidden><div class="av-lb" style="margin-top:12px">Твоя оценка <small style="text-transform:none;letter-spacing:0;opacity:.7">по желанию — её увидят в «Друзья советуют»</small></div>${wheelHTML("sgMyR", null)}</div>` : ""}
      <label class="f" style="margin-top:12px">Пару слов <small style="text-transform:none;letter-spacing:0;opacity:.7">по желанию</small><textarea class="in" id="sgN" rows="2" maxlength="300" placeholder="${k === "game" ? "Залетай в коопе, первые 3 часа потерпи" : k === "read" ? "Рисовка — огонь, с 10 главы не оторваться" : "Зайдёт под пиццу, концовка — разнос"}"></textarea></label>
      <div class="acts"><button class="ib blue" id="sgGo" disabled>Предложить</button><button class="ib" id="sgNo">Отмена</button></div>`, {wide: true});
    const q = x => s.el.querySelector(x), go_ = q("#sgGo"), all = q("#sgAll");
    let wheelOn = false;
    const picked = () => q("#sgPk") ? [...q("#sgPk").querySelectorAll('[aria-pressed="true"]')].map(b => b.dataset.u) : [];
    const toAll = () => all.getAttribute("aria-pressed") === "true";
    const sync = () => { const n = picked().length, a = toAll(); go_.disabled = !n && !a;
      go_.textContent = a && n ? `Всем и ${n} лично` : a ? "Посоветовать всем" : n > 1 ? `Предложить ${n} друзьям` : "Предложить";
      if (q("#sgRw")){ q("#sgRw").hidden = !a; if (a && !wheelOn){ wheelOn = true; wireWheel("sgMyR"); } } };
    all.onclick = () => { all.setAttribute("aria-pressed", !toAll()); sync(); };
    if (q("#sgPk")) q("#sgPk").onclick = e => { const b = e.target.closest("[data-u]"); if (!b) return; b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); sync(); };
    q("#sgNo").onclick = () => s.close();
    go_.onclick = async () => {
      const uids = picked(), a = toAll(); if (!uids.length && !a) return; go_.disabled = true; go_.textContent = "Отправляю…";
      const note = q("#sgN").value.trim() || null, ts = now(), done = [];
      if (a){
        const rating = myR != null ? myR : (wheelOn ? wheelVal("sgMyR") : null);
        const item = {...film}; delete item.fromRating;
        const {error} = await SB.from("recs").insert({id: crypto.randomUUID(), user_id: ME.id, item, rating, note, created_at: ts});
        if (error){ toast("Не отправилось: " + error.message); sync(); return; }
        done.push("в «Друзья советуют»"); loadRecs();
      }
      if (uids.length){
        const rows = uids.map(u => ({id: crypto.randomUUID(), from_user: ME.id, to_user: u, item: film, note, status: "pending", created_at: ts, updated_at: ts}));
        const {error} = await SB.from("suggestions").insert(rows);
        if (error){ toast("Не отправилось: " + error.message); sync(); return; }
        const nt = await SB.from("notifications").insert(rows.map(r => ({user_id: r.to_user, actor: ME.id, kind: "suggest", ref: "sug:" + r.id, body: film.title.slice(0, 140)})));
        if (nt.error) console.warn("suggest notify", nt.error.message);
        done.push(uids.length > 1 ? `${uids.length} ${plural(uids.length, "другу", "друзьям", "друзьям")}` : frNick(uids[0]));
      }
      s.close(); SND.click && SND.click();
      toast((a && !uids.length ? "Посоветовал всем — " : "Отправил: ") + done.join(" и "));
    };
  }
  // из открытой карточки фильма или игры
  async function suggestItem(it){ suggestSheet(sugFilm(it, it.cover || null, it.coverPos || null)); }
  // из формы фильма или игры: собираем то, что заполнено, постер грузим сразу
  async function suggestFromForm(it, body, cover){
    let path = null;
    try { if (!cover.remove){ if (cover.file){ toast("Загружаю постер…"); path = await upload(cover.file); } else path = it.cover || null; } }
    catch(err){ toast(upErr(err)); return; }
    suggestSheet(sugFilm(body, path, cover.remove ? null : cover.pos || it.coverPos || null));
  }
  // из Читалки
  async function suggestRead(r, file){
    let path = r.cover || null;
    try { if (file){ toast("Загружаю постер…"); path = await upload(file); } } catch(err){ toast(upErr(err)); return; }
    suggestSheet(sSnap({...r, coverUrl: path ? null : r.coverUrl}, "read", path, null));
  }
  // сохранить тайтл к себе (из личного предложения или из «Друзья советуют»)
  async function sTake(f, st, rating, via){
    const old = st === "old"; if (old) st = "done";
    const k = sKind(f), body = {}; SK[k].keep.forEach(x => { if (f[x] != null) body[x] = f[x]; });
    let cover = null;
    if (f.cover && assets){ try { const rs = await fetch(publicUrl(f.cover)); if (!rs.ok) throw 0; cover = await upload(await rs.blob()); } catch(e){ logErr("предложение: копия обложки", e); } }
    if (k === "read"){
      const r = {...body, status: st, myRating: rating ?? null, chRead: st === "done" ? (+body.chTotal || 0) : 0, via, createdAt: now()};
      if (st === "done"){ if (old) r.noDate = true; else r.doneAt = today(); }
      if (cover){ r.cover = cover; delete r.coverUrl; }
      const row = await saveRead(r); if (!row) return null;
      return {id: row.id, read: true};
    }
    Object.assign(body, {status: st, createdAt: now(), updatedAt: now(), via});
    if (rating != null) body.rating = rating;
    if (cover){ body.cover = cover; if (f.coverPos) body.coverPos = f.coverPos; }
    if (k === "game"){ if (st === "done" || st === "dropped"){ body.addedDone = true; if (old) body.noDate = true; else { body.date = today(); body.finishedAt = today(); } } if (st === "playing") body.date = today(); }
    else { if (st === "done"){ if (old) body.noDate = true; else body.date = today(); if (isSerT(body.type) && body.epTotal) body.epWatched = body.epTotal; } if (st === "playing") body.date = today(); }
    try { const {id} = await db.collection("items").add(body); return {id}; } catch(_){ toast("Не сохранилось, попробуй ещё раз"); return null; }
  }
  const sTookMsg = (f, st) => { const k = sKind(f); if (st === "old") st = "done";
    return st === "future" || st === "plan" ? `${f.title} — ${k === "read" ? "в планах" : k === "game" ? "в «Список желаемого»" : "в «На будущее»"}` : st === "done" ? `${f.title} — ${k === "game" ? "в пройденных" : k === "read" ? "в прочитанных" : "в просмотренных"}` : `${f.title} — сохранено`; };
  const sAfter = (res, st) => { if (!res) return; if (res.read){ if (route === "read") render(); return; } if (st !== "future") setTimeout(() => openItem(res.id), 150); };

  // полоска в разделе
  function sugStrip(kind){
    const L = sugIn().filter(x => sKind(x.item) === kind); if (!L.length || FV) return "";
    return `<div class="sg-wrap sg-${kind}"><div class="sg-h">${SK[kind].strip}<small>${L.length}</small></div><div class="sg-strip">${L.map(x => { const f = x.item || {};
      return `<button class="sg-c" data-sug="${esc(x.id)}">${sPoster(f)}<span class="t"><span class="who">${avaHTML(profOf(x.from_user), "xs")}<b>${esc(frNick(x.from_user))}</b>${typeof f.fromRating === "number" ? `<i class="${rateCls(f.fromRating)}">${num1(f.fromRating)}</i>` : ""}</span><b class="nm">${esc(f.title || "")}</b><small>${esc(sMeta(f))}</small>${x.note ? `<em>«${esc(x.note)}»</em>` : ""}</span></button>`; }).join("")}</div></div>`;
  }
  // окно «что с этим делать»
  async function sugSheet(id){
    let x = SUG.find(y => y.id === id);
    if (!x){ const {data} = await SB.from("suggestions").select("*").eq("id", id).maybeSingle(); x = data; }
    if (!x){ toast("Предложение не найдено — возможно, его удалили"); return; }
    if (x.status !== "pending"){ toast(x.status === "taken" ? "Это ты уже сохранил" : "От этого ты уже отказался"); return; }
    if (!FR) await loadFriends(); const f = x.item || {}, k = sKind(f); if (k === "read" && !READS) await loadReads();
    const have = sMine(f), who = frNick(x.from_user), opts = sOpts(f);
    let st = opts[0][0];
    const s = openSheet(`<div class="qa-top sg-q">${sPoster(f)}<div><h3>${esc(f.title || "")}</h3>
        <p class="sub">${esc(sMeta(f))}</p>
        <p class="sub sg-from">${avaHTML(profOf(x.from_user), "xs")} <span><b style="color:inherit">${esc(who)}</b> предлагает ${SK[k].verb}${typeof f.fromRating === "number" ? ` · его оценка <b class="${rateCls(f.fromRating)}">${num1(f.fromRating)}</b>` : ""}</span></p>
        ${x.note ? `<p class="sg-note">«${esc(x.note)}»</p>` : ""}</div></div>
      ${f.desc ? `<p class="sub" style="margin:14px 0 0;max-height:140px;overflow:auto;white-space:pre-line">${esc(String(f.desc).slice(0, 900))}</p>` : ""}
      ${have ? `<div class="acts" style="margin-top:16px"><button class="ib full" disabled>Уже есть у тебя · ${esc(sMyLab(have, k))}</button></div><div class="acts" style="margin-top:8px"><button class="ib" data-sgx="hide">Убрать из предложений</button></div>`
      : `<div class="av-lb" style="margin-top:16px">Сохранить к себе как</div><div class="sg-st" id="sgSt">${opts.map(([v, l, ic]) => `<button type="button" data-st="${v}" aria-pressed="${v === st}" style="--c:${sCol(v)}">${ic}${l}</button>`).join("")}</div>
        <div id="sgRw" hidden><div class="av-lb" style="margin-top:14px">Твоя оценка</div>${wheelHTML("sgRate", null)}</div>
        <div class="acts" style="margin-top:16px"><button class="ib blue" id="sgOk">Сохранить себе</button><button class="ib" data-sgx="no">Не интересно</button></div>`}`, {wide: true});
    const q = sel => s.el.querySelector(sel); const pv = q(".qa-top .poster"); if (pv) pv.classList.add("qa-poster");
    let wheelOn = false;
    if (q("#sgSt")) q("#sgSt").onclick = e => { const b = e.target.closest("[data-st]"); if (!b) return; st = b.dataset.st;
      q("#sgSt").querySelectorAll("[data-st]").forEach(y => y.setAttribute("aria-pressed", y.dataset.st === st));
      const first = st === opts[0][0]; q("#sgRw").hidden = first; if (!first && !wheelOn){ wheelOn = true; wireWheel("sgRate"); }
      q("#sgOk").textContent = first ? "Сохранить себе" : "Сохранить"; };
    s.el.addEventListener("click", async e => { const b = e.target.closest("[data-sgx]"); if (!b) return; b.disabled = true;
      const {error} = await SB.from("suggestions").update({status: "declined", updated_at: now()}).eq("id", x.id);
      if (error){ toast("Не получилось: " + error.message); b.disabled = false; return; }
      SUG = SUG.filter(y => y.id !== x.id); s.close(); toast(b.dataset.sgx === "no" ? "Убрал — " + who + " об этом не узнает" : "Убрал из предложений"); render(); });
    if (q("#sgOk")) q("#sgOk").onclick = async () => {
      const btn = q("#sgOk"); btn.disabled = true; btn.textContent = "Сохраняю…";
      const rating = st === opts[0][0] || !wheelOn ? null : wheelVal("sgRate");
      const res = await sTake(f, st, rating, "suggest:" + who);
      if (!res){ btn.disabled = false; btn.textContent = "Сохранить"; return; }
      await SB.from("suggestions").update({status: "taken", updated_at: now()}).eq("id", x.id);
      SB.from("notifications").insert({user_id: x.from_user, actor: ME.id, kind: "suggest_ok", ref: "user:" + ME.id, body: String(f.title || "").slice(0, 140)}).then(() => {});
      SUG = SUG.filter(y => y.id !== x.id); s.close(); toast(sTookMsg(f, st)); render(); sAfter(res, st === "plan" ? "future" : st === "old" ? "done" : st);
    };
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-sug]"); if (!el || !ME) return; e.preventDefault(); sugSheet(el.dataset.sug); });

  // ================= «Друзья советуют» =================
  let REC = null, recLoading = false, recTab = lsGet("nexus_rectab") || "";
  async function loadRecs(){
    if (!SB || !ME || recLoading) return; recLoading = true;
    const {data, error} = await SB.from("recs").select("*").order("created_at", {ascending: false}).limit(300);
    recLoading = false; if (error){ REC = REC || []; return; }
    REC = (data || []).map(r => ({...r, rating: r.rating == null ? null : +r.rating}));
    if (route === "people") renderPeople();
  }
  // один тайтл — одна строка, даже если советуют несколько
  function recGroups(){
    const out = [];
    (REC || []).forEach(r => { const it = r.item || {}; if (!it.title) return;
      const g = out.find(x => sSame(x.item, it)); if (g){ g.recs.push(r); if (!g.item.cover && it.cover) g.item = it; } else out.push({key: r.id, kind: sKind(it), item: it, recs: [r]}); });
    return out;
  }
  const recRow = (g, attr) => { const m = sMine(g.item), rated = g.recs.filter(r => r.rating != null), a = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : null;
    return `<button class="rcc-r${m ? " have" : ""}" ${attr}="${esc(g.key)}">${sPoster(g.item)}<span class="t"><b>${esc(g.item.title)}</b>
      <small class="who">${g.recs.slice(0, 3).map(r => `<span class="w">${avaHTML(profOf(r.user_id), "xs")}${esc(nickOf(r.user_id))}${r.rating != null ? `<i class="${rateCls(r.rating)}">${num1(r.rating)}</i>` : ""}</span>`).join("")}${g.recs.length > 3 ? `<span class="w">+${g.recs.length - 3}</span>` : ""}</small>
      <small class="kd">${esc(g.kind === "read" ? RTYPE[g.item.type] || "Читалка" : g.kind === "game" ? "Игра" : KTYPES[g.item.type] || "Фильм")}${m ? ` · <span class="mine">${esc(sMyLab(m, g.kind))}</span>` : ""}</small></span>${a != null ? `<span class="avg ${rateCls(a)}">${num1(a)}</span>` : ""}</button>`; };
  function recCard(){
    if (!FR) return "";
    if (!REC){ loadRecs(); return `<div class="fb-card rcc"><h3>${ICON.film}Друзья советуют</h3><p class="a-sub" style="margin:0;font-size:13px">Загружаю…</p></div>`; }
    if (!READS) loadReads();
    const all = recGroups(), cnt = k => all.filter(g => g.kind === k).length;
    const tabs = [["", "Всё", all.length], ["kino", "Кино", cnt("kino")], ["game", "Игры", cnt("game")], ["read", "Читалка", cnt("read")]].filter(([k, , n]) => !k || n);
    if (recTab && !cnt(recTab)) recTab = "";
    const G = all.filter(g => !recTab || g.kind === recTab);
    return `<div class="fb-card rcc"><h3>${ICON.film}Друзья советуют<button class="ev-add" data-recnew="1" title="Посоветовать всем" aria-label="Посоветовать всем">+</button></h3>
      ${tabs.length > 2 ? `<div class="rcc-tabs">${tabs.map(([k, l, n]) => `<button type="button" data-rectab="${k}" aria-pressed="${recTab === k}">${l}<small>${n}</small></button>`).join("")}</div>` : ""}
      ${G.length ? `<div class="rcc-l">${G.slice(0, 6).map(g => recRow(g, "data-rec")).join("")}</div>${G.length > 6 ? `<button class="ib full" data-recall="1" style="margin-top:8px">Все ${G.length}</button>` : ""}`
        : `<p class="a-sub" style="margin:0 0 10px;font-size:13px">Зашёл фильм, игра или манга? Посоветуй всем — с оценкой. Друзья заберут к себе в один клик.</p><button class="ib blue bd-set" data-recnew="1">Посоветовать</button>`}</div>`;
  }
  function recSheet(key){
    const g = recGroups().find(x => x.key === key || x.recs.some(r => r.id === key)); if (!g){ toast("Совет не найден"); return; }
    const f = g.item, k = g.kind, m = sMine(f), opts = sOpts(f), mr = sMyRating(m, k);
    const take = k === "read" ? [["plan", "В планы"], ["done", "Только что дочитал"], ["old", "Читал давно"]] : k === "game" ? [["future", "В список желаемого"], ["done", "Только что прошёл"], ["old", "Играл давно"]] : [["future", "Забрать на будущее"], ["done", "Только что посмотрел"], ["old", "Смотрел давно"]];
    const s = openSheet(`<div class="qa-top">${sPoster(f)}<div><h3>${esc(f.title)}</h3><p class="sub">${esc(sMeta(f))}</p>
        ${m ? `<p class="sub" style="margin-top:8px">У тебя: <b style="color:inherit">${esc(sMyLab(m, k))}</b>${mr != null ? ` · твоя оценка <b class="${rateCls(mr)}">${num1(mr)}</b>` : ""}</p>` : ""}</div></div>
      <div class="av-lb" style="margin-top:14px">Советуют</div>
      <div class="rcs-l">${g.recs.map(r => `<div class="rcs-r">${avaHTML(profOf(r.user_id), "sm")}<div class="t"><b>${esc(r.user_id === ME.id ? "Ты" : nickOf(r.user_id))}</b><small>${esc(agoTs(r.created_at))}</small>${r.note ? `<em>«${esc(r.note)}»</em>` : ""}</div>${r.rating != null ? `<span class="rt ${rateCls(r.rating)}">${num1(r.rating)}</span>` : `<span class="rt none">без оценки</span>`}${r.user_id === ME.id ? `<button class="rcs-x" data-recdel="${esc(r.id)}" title="Убрать свой совет" aria-label="Убрать свой совет">×</button>` : ""}</div>`).join("")}</div>
      ${f.desc ? `<p class="sub" style="margin:14px 0 0;max-height:130px;overflow:auto;white-space:pre-line">${esc(String(f.desc).slice(0, 900))}</p>` : ""}
      ${m ? `<div class="acts" style="margin-top:16px"><button class="ib full" data-recopen="1">Открыть у себя</button></div>`
        : `<div class="rcs-take">${take.map(([v, l], i) => `<button class="ib${i ? "" : " blue"}" data-rectake="${v}">${(opts.find(o => o[0] === v) || [, , ""])[2]}${l}</button>`).join("")}</div>`}`, {wide: true});
    const pv = s.el.querySelector(".qa-top .poster"); if (pv) pv.classList.add("qa-poster");
    s.el.addEventListener("click", async e => {
      const d = e.target.closest("[data-recdel]"), t = e.target.closest("[data-rectake]"), o = e.target.closest("[data-recopen]");
      if (o){ s.close(); setTimeout(() => k === "read" ? readSheet(m) : openItem(m.id), 80); return; }
      if (d){ d.disabled = true; const {error} = await SB.from("recs").delete().eq("id", d.dataset.recdel); if (error){ toast("Не получилось: " + error.message); d.disabled = false; return; }
        REC = REC.filter(r => r.id !== d.dataset.recdel); s.close(); toast("Совет убран"); if (route === "people") renderPeople(); return; }
      if (!t) return; s.el.querySelectorAll("[data-rectake]").forEach(x => x.disabled = true);
      const who = g.recs.filter(r => r.user_id !== ME.id).map(r => nickOf(r.user_id)).slice(0, 3).join(", "), st = t.dataset.rectake;
      const res = await sTake(f, st, null, "recs:" + who);
      if (!res){ s.el.querySelectorAll("[data-rectake]").forEach(x => x.disabled = false); return; }
      const dn = st === "done" || st === "old";
      s.close(); toast(sTookMsg(f, st) + (dn ? ", поставь оценку" : "")); if (route === "people") renderPeople();
      if (res.read){ if (dn){ const row = (READS || []).find(r => r.id === res.id); if (row) setTimeout(() => readSheet(row), 150); } }
      else if (dn) setTimeout(() => openItem(res.id), 150);
    });
  }
  // «+»: выбрать со своей полки и посоветовать всем
  function recPick(){
    if (!READS) loadReads();
    let tab = recTab || "kino";
    const lists = () => ({
      kino: MYITEMS.filter(i => !isGame(i) && inLib(i)).map(i => ({it: i, r: i.rating})),
      game: MYITEMS.filter(i => isGame(i) && inLib(i)).map(i => ({it: i, r: i.rating})),
      read: (READS || []).filter(r => rNorm(r.status) !== "plan").map(r => ({it: {...r, _k: "read"}, r: r.myRating})),
    });
    const s = openSheet(`<h3>Посоветовать всем</h3><p class="sub">Выбери со своей полки — уйдёт с твоей оценкой в «Друзья советуют».</p>
      <div class="rcc-tabs rp-tabs" id="rpT">${[["kino", "Кино"], ["game", "Игры"], ["read", "Читалка"]].map(([k, l]) => `<button type="button" data-rpt="${k}" aria-pressed="${k === tab}">${l}</button>`).join("")}</div>
      <input class="in" id="rpQ" placeholder="Поиск по названию" autocomplete="off" style="margin:4px 0 10px">
      <div class="rp-l" id="rpL"></div>`, {wide: true});
    const q = x => s.el.querySelector(x);
    const draw = () => { const t = q("#rpQ").value.trim().toLowerCase();
      const L = lists()[tab].filter(x => !t || [x.it.title, x.it.originalTitle, x.it.origTitle].join(" ").toLowerCase().includes(t))
        .sort((a, b) => (b.r ?? -1) - (a.r ?? -1) || String(b.it.updatedAt || b.it.date || "").localeCompare(String(a.it.updatedAt || a.it.date || ""))).slice(0, 80);
      q("#rpL").innerHTML = L.length ? L.map(({it, r}) => { const was = (REC || []).some(x => x.user_id === ME.id && sSame(x.item || {}, it));
        return `<button class="rp-r" data-rpid="${esc(it.id)}"${was ? " disabled" : ""}>${sPoster(it)}<span class="t"><b>${esc(it.title)}</b><small>${esc(sMeta(it))}${was ? " · уже советуешь" : ""}</small></span>${typeof r === "number" ? `<span class="avg ${rateCls(r)}">${num1(r)}</span>` : ""}</button>`; }).join("")
        : `<p class="sub">${lists()[tab].length ? "Ничего не нашлось." : tab === "read" ? "В Читалке пока нет прочитанного." : "Тут пока пусто."}</p>`; };
    draw(); q("#rpQ").oninput = draw; setTimeout(() => q("#rpQ").focus(), 60);
    q("#rpT").onclick = e => { const b = e.target.closest("[data-rpt]"); if (!b) return; tab = b.dataset.rpt; q("#rpT").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); };
    q("#rpL").onclick = e => { const b = e.target.closest("[data-rpid]"); if (!b) return;
      const snap = tab === "read" ? (() => { const r = (READS || []).find(x => x.id === b.dataset.rpid); return r ? sSnap(r, "read", r.cover || null, null) : null; })()
        : (() => { const it = MYITEMS.find(i => i.id === b.dataset.rpid); return it ? sugFilm(it, it.cover || null, it.coverPos || null) : null; })();
      if (!snap) return; s.close(); setTimeout(() => suggestSheet(snap).then(() => { const a = document.querySelector("#sgAll:not([disabled])"); if (a) a.click(); }), 80); };
  }
  document.addEventListener("click", e => { const el = e.target.closest && e.target.closest("[data-rec],[data-recnew],[data-recall],[data-rectab]"); if (!el || !ME || el.closest(".sh")) return;
    if (el.dataset.rectab != null){ recTab = el.dataset.rectab; lsSet("nexus_rectab", recTab); renderPeople(); return; }
    if (el.dataset.recnew){ recPick(); return; }
    if (el.dataset.rec){ recSheet(el.dataset.rec); return; }
    if (el.dataset.recall){ const G = recGroups().filter(g => !recTab || g.kind === recTab);
      const s = openSheet(`<h3>Друзья советуют</h3><div class="rcc-l">${G.map(g => recRow(g, "data-recg")).join("")}</div>`, {wide: true});
      s.el.addEventListener("click", ev => { const b = ev.target.closest("[data-recg]"); if (b){ s.close(); setTimeout(() => recSheet(b.dataset.recg), 60); } }); }
  });

  // ================= 3.9: импорт с TierMaker, ссылка и картинка тир-листа =================
  const TM_FN = () => `${String(CFG.SUPABASE_URL).replace(/\/$/, "")}/functions/v1/tiermaker`;
  const TM_POOL_MAX = 150;
  const tmProx = u => TM_FN() + "?img=" + encodeURIComponent(u);
  const tmSrc = tl => tl && /^https:\/\/tiermaker\.com\//i.test(tl.source || "") ? ` · <a class="tlv-src" href="${esc(tl.source)}" target="_blank" rel="noopener">с TierMaker</a>` : "";
  // квадрат по центру, с прозрачностью (логотипы на TierMaker часто PNG без фона)
  async function sqWebp(blob, S = 256){
    const u = URL.createObjectURL(blob);
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
      const c = document.createElement("canvas"); c.width = c.height = S; const m = Math.min(img.naturalWidth, img.naturalHeight) || 1;
      c.getContext("2d").drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, S, S);
      return await new Promise(ok => c.toBlob(ok, "image/webp", .86));
    } finally { URL.revokeObjectURL(u); }
  }
  function tmImport(onDone){
    if (!assets){ toast("Сначала войди"); return; }
    const s = openSheet(`<div class="tmi"><div class="tmi-h"><span class="tmi-logo">${ICON.down}</span><div><h3>Импорт с TierMaker</h3><p class="sub">Открой тир-лист на tiermaker.com, скопируй ссылку из адресной строки и вставь сюда. Подойдёт и чужой готовый тир-лист, и пустой шаблон.</p></div></div>
      <form class="tmi-f" id="tmF"><input class="in" id="tmU" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://tiermaker.com/list/…"><button class="ib blue" id="tmGo" type="submit">Загрузить</button></form>
      <div id="tmR"></div></div>`, {wide: true});
    pasteTarget = null;
    const q = x => s.el.querySelector(x), inp = q("#tmU");
    setTimeout(() => inp.focus(), 80);
    let data = null, busy = false, dead = false;
    const c0 = s.close; s.close = () => { dead = true; c0(); };
    const load = async () => {
      const u = inp.value.trim(); if (!u){ inp.focus(); return; } if (busy) return; busy = true;
      q("#tmGo").disabled = true; q("#tmR").innerHTML = `<div class="tmi-wait"><i></i>Читаю тир-лист с TierMaker…</div>`;
      try { const r = await fetch(TM_FN(), {method: "POST", headers: {"Content-Type": "application/json", apikey: CFG.SUPABASE_ANON_KEY}, body: JSON.stringify({url: u})}); data = await r.json(); }
      catch(_){ data = {error: "Сервер не ответил. Проверь интернет и попробуй ещё раз"}; }
      busy = false; if (dead) return; q("#tmGo").disabled = false;
      if (!data || data.error){ q("#tmR").innerHTML = `<p class="tmi-err">${esc((data && data.error) || "Не получилось")}</p>`; data = null; return; }
      preview();
    };
    q("#tmF").onsubmit = e => { e.preventDefault(); load(); };
    inp.addEventListener("paste", () => setTimeout(() => { if (/tiermaker\.com\//i.test(inp.value)) load(); }, 30));
    const preview = () => {
      const d = data, ranked = d.tiers.reduce((n, t) => n + t.items.length, 0) + (d.extra || []).length, poolN = d.pool.length;
      const poolOn = d.kind === "template" || !ranked;
      q("#tmR").innerHTML = `<label class="f tmi-t">Название<input class="in" id="tmT" maxlength="80" value="${esc(d.title)}"></label>
        <div class="tlb sm tmi-b">${d.tiers.map(t => `<div class="tlb-r"><span class="tlb-l" style="--c:${esc(t.c)}">${esc(t.n)}</span><span class="tlb-z">${t.items.slice(0, 40).map(x => `<span class="tlb-i"><img src="${esc(tmProx(x))}" alt="" loading="lazy"></span>`).join("")}${t.items.length > 40 ? `<span class="tlb-i tmi-more">+${t.items.length - 40}</span>` : ""}</span></div>`).join("")}</div>
        ${poolN ? `<label class="tmi-chk"><input type="checkbox" id="tmP" ${poolOn ? "checked" : ""}><span><b>${ranked ? "Ещё и нераспределённые картинки" : "Картинки шаблона"}</b><small>${poolN > TM_POOL_MAX ? `в шаблоне их ${poolN}, возьму первые ${TM_POOL_MAX}` : `${poolN} шт.`} — лягут в «Не распределено», раскидаешь по тирам сам</small></span></label>` : ""}
        <div class="tmi-foot"><span class="tmi-sum" id="tmS"></span><span style="flex:1"></span><button class="ib" id="tmNo">Отмена</button><button class="ib blue" id="tmOk">Перенести в NEXUS</button></div>`;
      const cnt = () => ranked + (q("#tmP") && q("#tmP").checked ? Math.min(poolN, TM_POOL_MAX) : 0);
      const sum = () => { const n = cnt(); q("#tmS").textContent = `${d.tiers.length} ${plural(d.tiers.length, "тир", "тира", "тиров")} · ${n} ${plural(n, "картинка", "картинки", "картинок")}`; };
      sum(); if (q("#tmP")) q("#tmP").onchange = sum;
      q("#tmNo").onclick = () => s.close();
      q("#tmOk").onclick = run;
    };
    const run = async () => {
      const d = data, withPool = !!(q("#tmP") && q("#tmP").checked), title = (q("#tmT").value.trim() || d.title).slice(0, 80);
      const tiers = d.tiers.map(t => ({n: String(t.n).slice(0, 40), c: String(t.c).toLowerCase(), items: []})), pool = [], jobs = [];
      const add = (u, dest) => { const slot = {id: rid(), img: null, t: ""}; dest.push(slot); jobs.push({u, slot}); };
      d.tiers.forEach((t, i) => t.items.forEach(u => add(u, tiers[i].items)));
      (d.extra || []).forEach(u => add(u, pool));
      if (withPool) d.pool.slice(0, TM_POOL_MAX).forEach(u => add(u, pool));
      q("#tmF").hidden = true;
      q("#tmR").innerHTML = `<div class="tmi-prog"><b id="tmPn">Переношу картинки: 0 из ${jobs.length}</b><span class="bar"><i id="tmPb"></i></span><small>Картинки копируются к нам — не пропадут, даже если их удалят с TierMaker</small></div>`;
      let done = 0, fail = 0, i = 0;
      const worker = async () => { while (i < jobs.length && !dead){ const j = jobs[i++];
        try { const r = await fetch(tmProx(j.u)); if (!r.ok) throw 0; const b = await sqWebp(await r.blob()); if (!b) throw 0; j.slot.img = await upload(b); } catch(_){ fail++; }
        done++; const pn = q("#tmPn"); if (pn){ pn.textContent = `Переношу картинки: ${done} из ${jobs.length}`; q("#tmPb").style.width = (done / jobs.length * 100).toFixed(1) + "%"; } } };
      await Promise.all(Array.from({length: Math.min(6, jobs.length)}, worker));
      if (dead) return;
      const keep = a => a.filter(x => x.img); tiers.forEach(t => t.items = keep(t.items));
      const tl = {title, tiers, pool: keep(pool), source: d.source || null};
      c0(); if (fail) toast(`Не загрузилось картинок: ${fail} из ${jobs.length}`);
      (onDone || (x => tlEditor(null, {preset: x})))(tl);
    };
  }

  // ссылка: открывается и у друзей, и у тех, у кого нет аккаунта
  let pendingTl = null;
  const tlLink = id => location.origin + location.pathname + "#tier:" + id;
  async function tlShareLink(tl){
    const url = tlLink(tl.id);
    if (navigator.share && matchMedia("(pointer:coarse)").matches){ try { await navigator.share({title: tl.title, text: `Тир-лист «${tl.title}»`, url}); return; } catch(e){ if (e && e.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); toast("Ссылка скопирована — откроется даже без аккаунта"); }
    catch(_){ prompt("Скопируй ссылку:", url); }
  }
  function openTlLink(){
    const id = pendingTl; if (!id || !ME) return; pendingTl = null;
    history.replaceState(null, "", location.pathname + "#people"); if (route !== "people"){ route = "people"; render(); }
    const op = () => tlById(id) ? tlView(id) : toast("Тир-лист не найден — возможно, его удалили");
    if (FR && tlById(id)) op(); else loadFriends(true).then(op);
  }
  window.addEventListener("hashchange", () => { if (pendingTl && ME) setTimeout(openTlLink, 60); });
  async function guestTier(id){
    const el = $("auth"); el.hidden = false; document.body.classList.add("ov-open", "guest-tl");
    el.innerHTML = `<div class="au-box"><div class="au-logo">NEXUS</div><p class="au-sub" style="margin-bottom:0">Открываю тир-лист…</p></div>`;
    const {data, error} = await SB.rpc("tierlist_public", {p_id: id});
    if (error || !data || !data.tl){ pendingTl = null; authScreen("Тир-лист не найден — возможно, его удалили"); return; }
    const tl = {...data.tl, tiers: Array.isArray(data.tl.tiers) ? data.tl.tiers : [], pool: Array.isArray(data.tl.pool) ? data.tl.pool : []}, a = data.author || {};
    document.title = tl.title + " — NEXUS";
    el.innerHTML = `<div class="tlg"><div class="tlg-top"><span class="au-logo">NEXUS</span><button class="ib blue" id="tgIn">Войти</button></div>
      <div class="tlv-h">${avaHTML(a, "md")}<div><h3>${esc(tl.title)}</h3><p class="sub">${esc(a.nick || "")}${data.root_title ? ` · версия тир-листа «${esc(data.root_title)}»` : ""}${tmSrc(tl)}</p></div></div>
      ${tlBoard(tl)}
      <div class="acts" style="margin-top:14px"><button class="ib blue" id="tgMine">Сделать свою версию</button><button class="ib" id="tgPng">${ICON.img}Скачать картинкой</button></div>
      <p class="sub tlg-note">NEXUS — полка игр, кино и тир-листов для своих. Чтобы ответить своей версией, войди или создай аккаунт: тир-лист откроется сразу после входа.</p></div>`;
    $("tgIn").onclick = $("tgMine").onclick = () => authScreen("Войди — и тир-лист сразу откроется");
    $("tgPng").onclick = () => tlImageSheet(tl, a);
  }

  // картинка: рисуем тир-лист на холсте в духе TierMaker
  const TL_FONT = '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI","Inter",system-ui,sans-serif';
  const tlLum = hex => { const m = String(hex || "").replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i); if (!m) return 1; const [r, g, b] = m.slice(1).map(v => parseInt(v, 16) / 255); return .2126 * r + .7152 * g + .0722 * b; };
  const tlLoadImg = src => new Promise(ok => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  const tlWrap = (x, text, maxW) => { const out = []; let cur = "";
    String(text || "").split(/\s+/).filter(Boolean).forEach(w => { const t = cur ? cur + " " + w : w; if (!cur || x.measureText(t).width <= maxW) cur = t; else { out.push(cur); cur = w; } });
    if (cur) out.push(cur); return out; };
  const tlRR = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  async function tlRender(tl, author){
    const S = 2, W = 1200, P = 32, LW = 150, T = 96, G = 4, headH = 108, footH = 56;
    const tiers = (tl.tiers || []).length ? tl.tiers : [{n: "", c: "#8e8e93", items: tl.pool || []}];
    const cols = Math.max(1, Math.floor((W - P * 2 - LW - G) / (T + G)));
    const rowH = t => Math.max(T + G * 2, Math.ceil((t.items || []).length / cols) * (T + G) + G);
    const H = headH + tiers.reduce((h, t) => h + rowH(t) + G, 0) - G + footH;
    const c = document.createElement("canvas"); c.width = W * S; c.height = H * S;
    const x = c.getContext("2d"); x.scale(S, S);
    x.fillStyle = "#0e0e10"; x.fillRect(0, 0, W, H);
    // шапка
    x.textBaseline = "alphabetic"; x.fillStyle = "#f2f2f7"; x.font = `800 38px ${TL_FONT}`;
    let title = String(tl.title || ""), cut = false; while (title.length > 3 && x.measureText(title + (cut ? "…" : "")).width > W - P * 2){ title = title.slice(0, -1); cut = true; }
    x.fillText(title + (cut ? "…" : ""), P, 60);
    x.fillStyle = "#8e8e93"; x.font = `600 18px ${TL_FONT}`; x.fillText(`${author && author.nick ? author.nick + " · " : ""}тир-лист`, P, 90);
    // картинки грузим разом; без CORS картинка просто пропустится, холст не испортится
    const paths = [...new Set(tiers.flatMap(t => (t.items || []).map(i => i.img)).filter(Boolean))];
    const imgs = new Map(await Promise.all(paths.map(async pth => [pth, await tlLoadImg(publicUrl(pth) + "?nx=png")])));
    let y = headH;
    for (const t of tiers){
      const h = rowH(t), col = t.c || "#8e8e93";
      x.fillStyle = "#1b1b1f"; x.fillRect(P, y, W - P * 2, h);
      x.fillStyle = col; x.fillRect(P, y, LW, h);
      // подпись тира: подбираем размер, чтобы влезла
      x.fillStyle = tlLum(col) > .5 ? "#111" : "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
      let fs = 36, lines = [];
      for (; fs >= 11; fs -= 1){ x.font = `800 ${fs}px ${TL_FONT}`; lines = tlWrap(x, t.n, LW - 18); if (lines.every(l => x.measureText(l).width <= LW - 18) && lines.length * fs * 1.12 <= h - 14) break; }
      const lh = Math.max(fs, 11) * 1.12, y0 = y + h / 2 - (lines.length - 1) * lh / 2;
      lines.forEach((l, k) => x.fillText(l, P + LW / 2, y0 + k * lh, LW - 12));
      (t.items || []).forEach((it, k) => {
        const cx = P + LW + G + (k % cols) * (T + G), cy = y + G + Math.floor(k / cols) * (T + G);
        x.save(); tlRR(x, cx, cy, T, T, 6); x.clip(); x.fillStyle = "#2a2d35"; x.fillRect(cx, cy, T, T);
        const im = imgs.get(it.img); if (im){ const m = Math.min(im.naturalWidth, im.naturalHeight) || 1; x.drawImage(im, (im.naturalWidth - m) / 2, (im.naturalHeight - m) / 2, m, m, cx, cy, T, T); }
        if (it.t){ const g = x.createLinearGradient(0, cy + T - 44, 0, cy + T); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.88)"); x.fillStyle = g; x.fillRect(cx, cy + T - 44, T, 44);
          x.fillStyle = "#fff"; x.font = `700 12px ${TL_FONT}`; x.textAlign = "center"; x.textBaseline = "alphabetic";
          const ls = tlWrap(x, it.t, T - 8).slice(0, 2); ls.forEach((l, q) => x.fillText(l, cx + T / 2, cy + T - 7 - (ls.length - 1 - q) * 14, T - 6)); }
        x.restore(); });
      y += h + G;
    }
    x.textBaseline = "middle"; x.textAlign = "right"; x.fillStyle = "#48484a"; x.font = `800 16px ${TL_FONT}`;
    if ("letterSpacing" in x) x.letterSpacing = "3px";
    x.fillText("NEXUS", W - P, H - footH / 2);
    return await new Promise((ok, no) => { try { c.toBlob(b => b ? ok(b) : no(new Error("пустая картинка")), "image/png"); } catch(e){ no(e); } });
  }
  async function tlImageSheet(tl, author){
    let url = null;
    const s = openSheet(`<h3>Тир-лист картинкой</h3><div class="tlpng"><div class="tmi-wait"><i></i>Рисую картинку…</div></div><div class="acts" id="tpA" style="margin-top:12px"></div>`, {wide: true, onClose: () => { if (url) URL.revokeObjectURL(url); }});
    let blob; try { blob = await tlRender(tl, author); } catch(e){ s.el.querySelector(".tlpng").innerHTML = `<p class="tmi-err">Не получилось нарисовать: ${esc(e.message || e)}</p>`; return; }
    if (s.closed) return;
    url = URL.createObjectURL(blob);
    const name = (String(tl.title || "").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 60) || "tierlist") + ".png", file = new File([blob], name, {type: "image/png"});
    s.el.querySelector(".tlpng").innerHTML = `<img src="${url}" alt="${esc(tl.title)}">`;
    const canShare = !!(navigator.canShare && navigator.canShare({files: [file]}) && matchMedia("(pointer:coarse)").matches), canCopy = !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
    s.el.querySelector("#tpA").innerHTML = `${canShare ? `<button class="ib blue" data-tp="share">Отправить</button>` : ""}<button class="ib${canShare ? "" : " blue"}" data-tp="dl">${ICON.down}Скачать PNG</button>${canCopy ? `<button class="ib" data-tp="copy">${ICON.img}Скопировать</button>` : ""}`;
    s.el.querySelector("#tpA").onclick = async e => { const b = e.target.closest("[data-tp]"); if (!b) return;
      if (b.dataset.tp === "dl"){ const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); return; }
      if (b.dataset.tp === "copy"){ try { await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]); toast("Картинка в буфере — вставь в Telegram через Ctrl+V"); } catch(_){ toast("Браузер не дал скопировать — скачай PNG"); } return; }
      if (b.dataset.tp === "share"){ try { await navigator.share({files: [file], title: tl.title}); } catch(_){ /* ожидаемо: закрыл окно «Поделиться» */ } } };
  }


