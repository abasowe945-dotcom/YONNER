  // ================= 5.0: заведения Якутска — карта, походы, оценки, блюда =================
  // тёмно-синяя карта с золотыми дорогами — своя тема поверх OpenFreeMap (данные OpenStreetMap)
  const PL_BOUNDS = [[129.22, 61.78], [130.32, 62.22]], PL_CENTER = [129.732, 62.0274];
  function plStyle(){
    const C = {bg: "#0b1a2e", water: "#050e1c", wline: "#163052", land: "#0d1f37", park: "#0f2438", bld: "#13284a", bldL: "#1d3a63", gold: "#f0c24b", gold2: "#d9a93c", dim: "#8a7440", rail: "#5d6e88", txt: "#e8c56a", halo: "#081424"};
    const roadW = (a, b) => ["interpolate", ["exponential", 1.6], ["zoom"], 10, a, 18, b];
    const road = (id, f, w0, w1, color, op = 1, extra = {}) => ({id, type: "line", source: "omt", "source-layer": "transportation", filter: f,
      layout: {"line-cap": "round", "line-join": "round"}, paint: {"line-color": color, "line-width": roadW(w0, w1), "line-opacity": op, ...extra}});
    const cls = list => ["match", ["get", "class"], list, true, false];
    return {
      version: 8, glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      sources: {omt: {type: "vector", url: "https://tiles.openfreemap.org/planet", attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}},
      layers: [
        {id: "bg", type: "background", paint: {"background-color": C.bg}},
        {id: "landcover", type: "fill", source: "omt", "source-layer": "landcover", paint: {"fill-color": C.land, "fill-opacity": .7}},
        {id: "park", type: "fill", source: "omt", "source-layer": "park", paint: {"fill-color": C.park, "fill-opacity": .8}},
        {id: "landuse", type: "fill", source: "omt", "source-layer": "landuse", filter: cls(["residential", "suburb", "neighbourhood"]), paint: {"fill-color": "#0e2140", "fill-opacity": .55}},
        {id: "water", type: "fill", source: "omt", "source-layer": "water", paint: {"fill-color": C.water}},
        {id: "water-edge", type: "line", source: "omt", "source-layer": "water", paint: {"line-color": C.wline, "line-width": ["interpolate", ["linear"], ["zoom"], 10, .6, 16, 1.6]}},
        {id: "waterway", type: "line", source: "omt", "source-layer": "waterway", paint: {"line-color": C.wline, "line-width": ["interpolate", ["linear"], ["zoom"], 10, .5, 16, 2.5]}},
        {id: "aeroway", type: "line", source: "omt", "source-layer": "aeroway", filter: ["==", ["geometry-type"], "LineString"], paint: {"line-color": "#2a4468", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 14]}},
        {id: "building", type: "fill", source: "omt", "source-layer": "building", minzoom: 13, paint: {"fill-color": C.bld, "fill-outline-color": C.bldL, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14.5, .9]}},
        road("path", cls(["path", "track"]), .2, 1.4, C.dim, .35, {"line-dasharray": [2, 2]}),
        road("service", cls(["service"]), .2, 3, C.dim, .5),
        road("minor", cls(["minor"]), .35, 6, C.gold2, .55),
        road("rail", cls(["rail", "transit"]), .5, 2.2, C.rail, .8, {"line-dasharray": [3, 2]}),
        road("tertiary", cls(["tertiary"]), .6, 9, C.gold2, .8),
        road("main-glow", cls(["motorway", "trunk", "primary", "secondary"]), 3, 26, C.gold, .16, {"line-blur": 6}),
        road("secondary", cls(["secondary"]), .9, 11, C.gold, .95),
        road("main", cls(["motorway", "trunk", "primary"]), 1.3, 14, C.gold, 1),
        {id: "road-names", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 14,
          layout: {"symbol-placement": "line", "text-field": ["coalesce", ["get", "name:ru"], ["get", "name"]], "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 14, 10, 18, 13], "text-letter-spacing": .04},
          paint: {"text-color": C.txt, "text-halo-color": C.halo, "text-halo-width": 1.6, "text-opacity": .85}},
        {id: "places", type: "symbol", source: "omt", "source-layer": "place", filter: ["match", ["get", "class"], ["suburb", "village", "hamlet", "town", "neighbourhood", "quarter"], true, false],
          layout: {"text-field": ["upcase", ["coalesce", ["get", "name:ru"], ["get", "name"]]], "text-font": ["Noto Sans Bold"], "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 15, 13], "text-letter-spacing": .18, "text-max-width": 8},
          paint: {"text-color": "#9fb3cf", "text-halo-color": C.halo, "text-halo-width": 1.8}}
      ]
    };
  }
  // старые точки ставились на картинку-постер (904×1280, зум 13.02 вокруг центра) — пересчитываем их в координаты
  const PL_OLD = {z: 13.02, c: [129.732, 62.0274], w: 904, h: 1280};
  const plMercX = (lng, ws) => (lng + 180) / 360 * ws, plMercY = (lat, ws) => (1 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / Math.PI) / 2 * ws;
  const plLegacy = (x, y) => { const ws = 512 * Math.pow(2, PL_OLD.z), X = plMercX(PL_OLD.c[0], ws) + (x - .5) * PL_OLD.w, Y = plMercY(PL_OLD.c[1], ws) + (y - .5) * PL_OLD.h;
    return [+(X / ws * 360 - 180).toFixed(6), +(Math.atan(Math.sinh(Math.PI * (1 - 2 * Y / ws))) * 180 / Math.PI).toFixed(6)]; };
  // обратный пересчёт — запасной путь, пока в базе нет колонок lat/lng (точка должна попасть в рамку постера)
  const plToOld = (lng, lat) => { const ws = 512 * Math.pow(2, PL_OLD.z), x = (plMercX(lng, ws) - plMercX(PL_OLD.c[0], ws)) / PL_OLD.w + .5, y = (plMercY(lat, ws) - plMercY(PL_OLD.c[1], ws)) / PL_OLD.h + .5;
    return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? {x: +x.toFixed(6), y: +y.toFixed(6)} : null; };
  const plLL = p => !p ? null : p.lat != null && p.lng != null ? [+p.lng, +p.lat] : p.x != null && p.y != null ? plLegacy(+p.x, +p.y) : null;
  // запись координат; пока база не обновлена (нет колонок lat/lng) — понятная подсказка
  const plGeoErr = e => /lat|lng|column|PGRST204/i.test(((e && e.message) || "") + ((e && e.code) || "")) ? "Нужно обновить базу: блок 5.2 из schema.sql в Supabase" : null;
  const PLI = {
    bar: I('<path d="M6 5h10v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/><path d="M16 9h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M9.5 9v8M12.5 9v8M6 5c0-1.2 1-2 2.2-2 .6-.6 1.6-1 2.8-1s2.2.4 2.8 1C15 3 16 3.8 16 5"/>'),
    rest: I('<path d="M7 3v7M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 10v11M17.5 3C15.5 5 15 8 15 11h2.5v10"/>'),
    cafe: I('<path d="M4 9h13v4.5A5.5 5.5 0 0 1 11.5 19h-2A5.5 5.5 0 0 1 4 13.5Z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M3 21h16M8.5 3.5c-.7.8-.7 1.7 0 2.5M12.5 3.5c-.7.8-.7 1.7 0 2.5"/>'),
    coffee: I('<path d="M6.5 8h11l-1.4 12.2a1 1 0 0 1-1 .8H8.9a1 1 0 0 1-1-.8Z"/><path d="M5 5.5h14V8H5zM8 3h8M7.2 13h9.6"/>'),
    fast: I('<path d="M4 11a8 6 0 0 1 16 0Z"/><path d="M3 14.5h18M4.5 18h15v.5a2.5 2.5 0 0 1-2.5 2.5H7a2.5 2.5 0 0 1-2.5-2.5Z"/>'),
    club: I('<path d="M9 18V5.5L20 3v12.5"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="15.5" r="3"/>'),
    other: I('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    want: I('<path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.4-2.8 4.3"/><path d="M12 18.2h.01"/>', 'stroke-width="2.8"'),
    map: I('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z"/><path d="M9 4v14M15 6v14"/>'),
    gis: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
    fit: I('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><circle cx="12" cy="12" r="2.5"/>'),
    fly: I('<circle cx="12" cy="12" r="7.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
    cam: I('<path d="M4 8h3l1.6-2.5h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.6"/>'),
    menu: I('<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>')
  };
  const PL_KIND = [["bar", "Бар"], ["rest", "Ресторан"], ["cafe", "Кафе"], ["coffee", "Кофейня"], ["fast", "Фастфуд"], ["club", "Клуб"], ["other", "Другое"]];
  const plKindL = k => (PL_KIND.find(x => x[0] === k) || PL_KIND[6])[1];
  const plKindI = k => PLI[k] || PLI.other;
  // 5.4: шкалы оценки — [поле, название, вес в итоге, подсказка]; любую можно пропустить
  const PL_CRIT = [["taste", "Вкус", 2, "еда и напитки, весит вдвое"], ["service", "Обслуживание", 1, ""], ["vibe", "Атмосфера", 1, "уют, шум, компания"], ["value", "Цена/качество", 1, "стоит ли своих денег"], ["alco", "Алкоголь", 1, ""]];
  const PL_PRICE = ["₽", "₽₽", "₽₽₽"], PL_PRICE_T = ["недорого", "средне", "дорого"];
  const PL_TAGS = ["Большие порции", "Маленькие порции", "Быстро принесли", "Долго ждали", "Уютно", "Громко", "Для компании", "Для свидания", "Живая музыка", "Кальян", "Вежливые", "Хамят", "Чисто", "Грязновато", "Дорого для того, что есть"];
  const PL_FEW = 3; // пока оценок меньше — итог притягивается к среднему по всем местам
  const PL_TABLES = ["places", "place_visits", "place_visit_members", "place_reviews", "place_dishes", "place_dish_rates", "place_wants"];
  let PL = null, plLoading = null, plAgain = false, plErr = null, plSubT = 0, plCam = null, plPlacing = null, plPending = null, plSheet = null, plSeen = null, plLastTap = 0;
  let plCalY = new Date().getFullYear(), plCalM = new Date().getMonth();
  const plS = {q: "", st: "all", r: "all", k: "all", pr: "all", tag: "all", sort: "visit", view: ["cal", "top"].includes(lsGet("nexus_pl_view")) ? lsGet("nexus_pl_view") : "map", sel: null, panel: null};
  const plDraft = {};

  // ---- данные ----
  const plNorm = p => ({...p, menu: Array.isArray(p.menu) ? p.menu.filter(x => typeof x === "string" && x) : [], x: p.x == null ? null : +p.x, y: p.y == null ? null : +p.y, lat: p.lat == null ? null : +p.lat, lng: p.lng == null ? null : +p.lng});
  const plMissing = () => !!(plErr && (/PGRST205|42P01/.test(plErr.code || "") || /schema cache|does not exist|relation/i.test(plErr.message || "")));
  const PL_KEYS = {places: ["id"], place_visits: ["id"], place_visit_members: ["visit_id", "user_id"], place_reviews: ["id"], place_dishes: ["id"], place_dish_rates: ["dish_id", "user_id"], place_wants: ["place_id", "user_id"]};
  async function loadPlaces(force){
    if (!SB || !ME) return null;
    if (plLoading){ if (!force) return plLoading; plAgain = true; return plLoading.then(() => plLoading || PL); }
    plLoading = (async () => {
      try {
        const rs = await Promise.all(PL_TABLES.map(t => fetchAll(() => SB.from(t).select("*"), PL_KEYS[t] || ["id"])));
        if (rs[0].error) throw rs[0].error;
        const ok = r => r && !r.error ? r.data || [] : [];
        PL = {at: Date.now(), places: ok(rs[0]).map(plNorm), visits: ok(rs[1]), vm: ok(rs[2]), rates: ok(rs[3]), dishes: ok(rs[4]), drates: ok(rs[5]), wants: ok(rs[6])}; plErr = null;
      } catch(e){ plErr = e || {message: "ошибка"}; logErr("загрузка заведений", e); }
      plLoading = null; plRefresh();
      if (plAgain){ plAgain = false; loadPlaces(true); }
      return PL;
    })();
    return plLoading;
  }
  const PL_RT = {place_visit_members: ["vm", ["visit_id", "user_id"]], place_reviews: ["rates", ["id"]], place_dish_rates: ["drates", ["dish_id", "user_id"]], place_wants: ["wants", ["place_id", "user_id"]]};
  function subscribePlaces(){
    if (!SB || !ME) return;
    let ch = SB.channel("nexus-places");
    PL_TABLES.forEach(t => { ch = ch.on("postgres_changes", {event: "*", schema: "public", table: t}, p => {
      const pp = PL_RT[t]; if (pp && PL && rtPatch(PL[pp[0]], p, pp[1])) rtLater("pl", plRefresh, 200);
      else { clearTimeout(plSubT); plSubT = setTimeout(() => loadPlaces(true), 350); }
      const n = p.new; if (p.eventType !== "INSERT" || !n || n.user_id === ME.id || route === "places") return;
      if (t === "places") toast(`${frNick(n.user_id)} добавил заведение: ${n.name}`);
    }); });
    ch.subscribe();
  }
  function plRefresh(){
    if (route === "places") renderPlaces();
    else if (route === "people"){ if (actTab === "feed" && !document.querySelector(".sh-wrap")) renderPeople(); else { const c = $("plCard"); if (c) c.outerHTML = placesCard(); } }
    if (plSheet && !plSheet.s.closed) plDrawSheet();
  }
  const plById = id => PL && PL.places.find(p => p.id === id);
  const plVisits = pid => PL.visits.filter(v => v.place_id === pid).sort((a, b) => String(b.day).localeCompare(String(a.day)) || String(b.created_at).localeCompare(String(a.created_at)));
  const plVM = vid => [...new Set(PL.vm.filter(m => m.visit_id === vid).map(m => m.user_id))];
  const plWho = pid => [...new Set(plVisits(pid).flatMap(v => plVM(v.id)))];
  const plBeen = (pid, uid) => plWho(pid).includes(uid || (ME && ME.id));
  // 5.4: оценка — за каждый поход; в итог идёт последняя оценка каждого человека
  const plRevs = pid => PL.rates.filter(r => r.place_id === pid);
  const plRevKey = r => { const v = r.visit_id && PL.visits.find(x => x.id === r.visit_id); return String(v && v.day || String(r.created_at || "").slice(0, 10)) + "|" + String(r.created_at || ""); };
  const plHist = (pid, uid) => plRevs(pid).filter(r => r.user_id === uid).sort((a, b) => plRevKey(b).localeCompare(plRevKey(a)));
  const plRates = pid => { const by = new Map(); plRevs(pid).forEach(r => { const o = by.get(r.user_id); if (!o || plRevKey(r) > plRevKey(o)) by.set(r.user_id, r); }); return [...by.values()]; };
  const plRAvg = r => { let s = 0, w = 0; PL_CRIT.forEach(([k, , wt]) => { const x = r[k]; if (x != null && x !== ""){ s += +x * wt; w += wt; } }); return w ? s / w : null; };
  const plAvgOf = v => v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  const plRaw = pid => plAvgOf(plRates(pid).map(plRAvg).filter(x => x != null));
  const plN = pid => plRates(pid).filter(r => plRAvg(r) != null).length;
  // среднее по всем местам — «точка притяжения» для мест с малым числом оценок
  const plMean = () => { if (plMean.at === PL && plMean.v != null) return plMean.v; const v = plAvgOf(PL.places.map(p => plRaw(p.id)).filter(x => x != null)); plMean.at = PL; plMean.v = v == null ? 7 : v; return plMean.v; };
  const plShrink = (avg, n, c) => avg == null ? null : n >= PL_FEW ? avg : (avg * n + c * (PL_FEW - n)) / PL_FEW;
  const plScore = pid => plShrink(plRaw(pid), plN(pid), plMean());
  const plFew = pid => { const n = plN(pid); return n > 0 && n < PL_FEW; };
  const plCrit = (pid, k) => { const v = plRates(pid).map(r => r[k]).filter(x => x != null && x !== ""); return v.length ? {avg: v.reduce((s, x) => s + +x, 0) / v.length, n: v.length} : null; };
  const plCritMean = k => { const v = PL.rates.map(r => r[k]).filter(x => x != null && x !== "").map(Number); return plAvgOf(v) ?? 7; };
  const plCritRank = (pid, k) => { const c = plCrit(pid, k); return c ? plShrink(c.avg, c.n, plCritMean(k)) : null; };
  const plPrice = pid => { const v = plRates(pid).map(r => +r.price_lvl).filter(x => x >= 1 && x <= 3).sort(); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
  const plBack = pid => { const v = plRates(pid).filter(r => r.back === true || r.back === false); return v.length ? {yes: v.filter(r => r.back).length, n: v.length} : null; };
  const plTagsOf = pid => { const c = new Map(); plRates(pid).forEach(r => (r.tags || []).forEach(t => c.set(t, (c.get(t) || 0) + 1))); return [...c].sort((a, b) => b[1] - a[1]); };
  // хит и провал — лучшее и худшее блюдо по вашим оценкам
  const plHitFlop = pid => { const d = plDishes(pid).map(x => ({d: x, a: plDAvg(x.id)})).filter(x => x.a != null).sort((a, b) => b.a - a.a);
    const hit = d.length && d[0].a >= 7 ? d[0] : null, flop = d.length && d[d.length - 1].a <= 5 && d[d.length - 1] !== hit ? d[d.length - 1] : null; return {hit, flop}; };
  const plLast = pid => { const v = plVisits(pid); return v.length ? v[0].day : null; };
  const plWants = pid => [...new Set(PL.wants.filter(w => w.place_id === pid).map(w => w.user_id))];
  const plIsWant = p => !PL.visits.some(v => v.place_id === p.id);
  const plDishes = pid => PL.dishes.filter(d => d.place_id === pid).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  const plDR = did => PL.drates.filter(r => r.dish_id === did);
  const plDAvg = did => { const v = plDR(did).map(r => +r.score); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const plCls = s => s == null ? "n" : s >= 7.5 ? "g" : s >= 5 ? "y" : "r";
  const plImg = p => p && p.photo ? publicUrl(p.photo) : "";
  const plUrl = u => { u = String(u || "").trim(); if (!u) return ""; if (!/^https?:\/\//i.test(u)) u = "https://" + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes(".") && x.href.length <= 500 ? x.href : ""; } catch(_){ return ""; } };
  const plDay = d => { if (!d) return ""; const x = parseD(String(d).slice(0, 10)); return x.toLocaleDateString("ru-RU", x.getFullYear() !== new Date().getFullYear() ? {day: "numeric", month: "long", year: "numeric"} : {day: "numeric", month: "long"}); };
  const plAgo = d => { const n = -daysTo(String(d).slice(0, 10)); return n === 0 ? "сегодня" : n === 1 ? "вчера" : n < 0 ? "запланировано на " + plDay(d) : n < 21 ? `${n} ${plural(n, "день", "дня", "дней")} назад` : plDay(d); };
  const plEveryone = () => FR ? FR.profiles.map(p => p.user_id) : [];
  const plWide = () => !!(window.matchMedia && matchMedia("(min-width:901px)").matches);
  const plRM = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const plK = s => String(s || "").toLowerCase().replace(/ё/g, "е").trim();
  function plFiltered(){
    let a = PL.places.slice();
    const q = plK(plS.q); if (q) a = a.filter(p => plK(p.name + " " + (p.address || "")).includes(q));
    if (plS.st === "been") a = a.filter(p => !plIsWant(p)); else if (plS.st === "want") a = a.filter(plIsWant); else if (plS.st === "mine") a = a.filter(p => plBeen(p.id));
    if (plS.k !== "all") a = a.filter(p => p.kind === plS.k);
    if (plS.pr !== "all") a = a.filter(p => plPrice(p.id) === +plS.pr);
    if (plS.tag !== "all") a = a.filter(p => plTagsOf(p.id).some(([t]) => t === plS.tag));
    if (plS.r !== "all") a = a.filter(p => { const s = plScore(p.id); return plS.r === "none" ? s == null : s != null && (plS.r === "8" ? s >= 8 : plS.r === "6" ? s >= 6 && s < 8 : s < 6); });
    const byNew = (x, y) => String(y.created_at).localeCompare(String(x.created_at));
    if (plS.sort === "score") a.sort((x, y) => (plScore(y.id) ?? -1) - (plScore(x.id) ?? -1) || byNew(x, y));
    else if (plS.sort === "abc") a.sort((x, y) => x.name.localeCompare(y.name, "ru"));
    else a.sort((x, y) => String(plLast(y.id) || "").localeCompare(String(plLast(x.id) || "")) || byNew(x, y));
    return a;
  }
  // картинку ужимаем до разумного размера, чтобы с телефона грузилось быстро
  async function plUp(file, max = 1600){
    let blob = file;
    try { const im = await createImageBitmap(file), k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      blob = await new Promise(ok => c.toBlob(ok, "image/jpeg", .86)) || file; } catch(_){ /* ожидаемо: не сжалось — грузим как есть */ }
    const type = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(blob.type) ? blob.type : "image/jpeg";
    return (await assets.upload(blob, {type})).id;
  }
  const plFail = (e, what = "Не сохранилось") => { toast(what + (e && e.message ? ": " + e.message : "")); loadPlaces(true); };
  const plReady = () => { if (!ME || !SB){ toast("Сначала войди"); return false; } if (!PL){ toast(plMissing() ? "Сначала нужно обновить базу (schema.sql, блок 5.0)" : "Карта ещё грузится"); return false; } return true; };

  // ---- страница ----
  function plErrHTML(){
    return plMissing() ? `<div class="pl-panel" style="max-width:640px;margin:40px auto"><div class="pl-empty" style="text-align:left"><b>Карта заведений почти готова</b>Осталось один раз обновить базу: Supabase → SQL Editor → вставить блок «5.0: заведения» из файла schema.sql → Run. После этого страница оживёт у всех.</div></div>`
      : `<div class="pl-panel" style="max-width:640px;margin:40px auto"><div class="pl-empty"><b>Не загрузилось</b>${esc((plErr && plErr.message) || "")}<div style="margin-top:14px"><button class="pl-btn" data-plretry="1">Ещё раз</button></div></div></div>`;
  }
  function renderPlaces(){
    const m = $("plMain"); if (!m) return;
    if (!ME){ m.innerHTML = `<div class="pl-empty" style="margin-top:40px"><b>Нужно войти</b></div>`; delete m.dataset.v; return; }
    if (!PL){ m.innerHTML = plErr ? plErrHTML() : `<div class="pl-empty" style="margin-top:60px"><b>Загружаю карту…</b></div>`; delete m.dataset.v; plKill(); if (!plErr) loadPlaces(); return; }
    if (m.dataset.v !== plS.view){
      m.dataset.v = plS.view; plKill();
      m.innerHTML = `<div class="pl-hud">
          <div class="pl-tt"><small><a href="#people" style="color:inherit;text-decoration:none">‹ Активность</a> // Якутск // карта походов</small><h1 data-t="Заведения">Заведения</h1></div>
          <div class="pl-stats" id="plStats"></div>
          <div class="pl-acts"><div class="pl-seg"><button type="button" data-plview="map" aria-pressed="${plS.view === "map"}" aria-label="Карта">${PLI.map}<span>Карта</span></button><button type="button" data-plview="cal" aria-pressed="${plS.view === "cal"}" aria-label="Календарь">${ICON.calendar}<span>Календарь</span></button><button type="button" data-plview="top" aria-pressed="${plS.view === "top"}" aria-label="Топы">${ICON.trophy}<span>Топы</span></button></div><button type="button" class="pl-btn" data-pladd="1">${ICON.plus}Новое место</button></div>
        </div>
        <div class="pl-body">
          ${plS.view === "map" ? `<section class="pl-mapw" id="plMap" aria-label="Карта Якутска: тяни, чтобы двигать, колесо или два пальца — зум">
            <div class="pl-gl" id="plGL"></div><div class="pl-ld" id="plLd"><b>Загружаю карту…</b>Якутск и окрестности</div>
            <div class="pl-fx"></div><i class="pl-crn a"></i><i class="pl-crn b"></i><i class="pl-crn c"></i><i class="pl-crn d"></i>
            <div class="pl-tag">Сектор 14<b>ЯКУТСК</b></div><div class="pl-comp">N</div>
            <div class="pl-zoom"><button type="button" data-plz="in" aria-label="Приблизить">+</button><button type="button" data-plz="out" aria-label="Отдалить">−</button><button type="button" data-plz="fit" aria-label="Показать все места">${PLI.fit}</button></div>
            <div class="pl-geo" id="plGeo">62.0274° N / 129.7320° E</div>
            <div class="pl-leg"><span><i style="background:var(--pl-green)"></i>7,5+</span><span><i style="background:var(--pl-gold)"></i>5–7</span><span><i style="background:var(--pl-red)"></i>до 5</span><span><i style="background:var(--pl-cyan)"></i>хотим</span></div>
            <div id="plBan"></div></section>` : plS.view === "top" ? `<section class="pl-top" id="plTop"></section>` : `<section class="pl-cal" id="plCal"></section>`}
          <aside class="pl-side" id="plSide"></aside>
        </div>`;
      if (!m.dataset.wired){ m.dataset.wired = 1; plWire(m); }
    }
    if (plS.panel && (!plWide() || !plById(plS.panel))) plS.panel = null;
    plDrawStats(); plDrawSide();
    if (plS.view === "map"){ plMapInit(); plDrawMarkers(); plDrawBanner(); } else if (plS.view === "top") plDrawTop(); else plDrawCal();
    if (plPending){ const id = plPending; plPending = null; history.replaceState(null, "", location.pathname + "#places"); if (plById(id)) setTimeout(() => plSelect(id, {fly: true, open: true}), 120); else toast("Это место удалили"); }
  }
  function plDrawStats(){
    const el = $("plStats"); if (!el) return;
    const been = PL.places.filter(p => !plIsWant(p)), sc = been.map(p => plScore(p.id)).filter(x => x != null);
    const avg = sc.length ? sc.reduce((s, x) => s + x, 0) / sc.length : null;
    el.innerHTML = [[been.length, "мест"], [PL.visits.length, plural(PL.visits.length, "поход", "похода", "походов")], [PL.places.length - been.length, "хотим"], [avg == null ? "—" : num1(avg), "средняя"]]
      .map(([v, l]) => `<div class="pl-stat"><b>${v}</b><span>${l}</span></div>`).join("");
  }
  function plDrawSide(){
    const el = $("plSide"); if (!el) return;
    if (plS.panel){ const ae = document.activeElement; if (el.dataset.mode === "d" && ae && el.contains(ae) && ae.matches("input,textarea,select")){ clearTimeout(plDrawSide.t); plDrawSide.t = setTimeout(plDrawSide, 1500); return; }
      el.dataset.mode = "d"; const sy = el.scrollTop; el.innerHTML = `<div class="pl-panel">${plDetailHTML(plById(plS.panel), "side")}</div>`; el.scrollTop = sy; return; }
    if (el.dataset.mode !== "l"){
      el.dataset.mode = "l";
      el.innerHTML = `<div class="pl-panel"><label class="pl-srch">${ICON.search}<input id="plQ" type="search" placeholder="Найти заведение" autocomplete="off" enterkeyhint="search" value="${esc(plS.q)}"></label>
        <div class="pl-chips sc" id="plSt"></div><div class="pl-chips sc" id="plR"></div><div class="pl-chips sc" id="plPr"></div>
        <div class="pl-row"><label for="plK">Тип</label><select class="pl-sel" id="plK"></select><label for="plTag">Ярлык</label><select class="pl-sel" id="plTag"></select><label for="plSort">Порядок</label><select class="pl-sel" id="plSort"><option value="visit">Свежие</option><option value="score">Оценка</option><option value="abc">А–Я</option></select></div></div>
        <div class="pl-panel"><div class="pl-sum" id="plSum"></div><div class="pl-list" id="plList"></div></div>`;
    }
    const cnt = f => PL.places.filter(f).length;
    $("plSt").innerHTML = [["all", "Все", PL.places.length], ["been", "Были", cnt(p => !plIsWant(p))], ["want", "Хотим", cnt(plIsWant)], ["mine", "Где я был", cnt(p => plBeen(p.id))]]
      .map(([k, l, n]) => `<button type="button" class="pl-chip" data-plst="${k}" aria-pressed="${plS.st === k}">${l}<small>${n}</small></button>`).join("");
    $("plR").innerHTML = [["all", "Любая оценка", ""], ["8", "8+", "var(--pl-green)"], ["6", "6–8", "var(--pl-gold)"], ["low", "до 6", "var(--pl-red)"], ["none", "Без оценки", ""]]
      .map(([k, l, c]) => `<button type="button" class="pl-chip" data-plr="${k}" aria-pressed="${plS.r === k}">${c ? `<i style="background:${c}"></i>` : ""}${l}</button>`).join("");
    $("plPr").innerHTML = [["all", "Любой чек"], ...PL_PRICE.map((x, i) => [String(i + 1), x + " " + PL_PRICE_T[i]])].map(([k, l]) => `<button type="button" class="pl-chip" data-plpr="${k}" aria-pressed="${plS.pr === k}">${l}</button>`).join("");
    const tagsAll = [...new Set(PL.rates.flatMap(r => r.tags || []))].sort((a, b) => a.localeCompare(b, "ru"));
    if (plS.tag !== "all" && !tagsAll.includes(plS.tag)) plS.tag = "all";
    $("plTag").innerHTML = `<option value="all">Любой</option>` + tagsAll.map(t => `<option value="${esc(t)}"${plS.tag === t ? " selected" : ""}>${esc(t)}</option>`).join("");
    const kinds = PL_KIND.filter(([k]) => PL.places.some(p => p.kind === k));
    $("plK").innerHTML = `<option value="all">Все</option>` + kinds.map(([k, l]) => `<option value="${k}"${plS.k === k ? " selected" : ""}>${l}</option>`).join("");
    if (plS.k !== "all" && !kinds.some(([k]) => k === plS.k)) plS.k = "all";
    $("plSort").value = plS.sort;
    const list = plFiltered();
    $("plSum").innerHTML = `<span>Найдено <b>${list.length}</b></span>${plS.q || plS.st !== "all" || plS.r !== "all" || plS.k !== "all" || plS.pr !== "all" || plS.tag !== "all" ? `<button type="button" class="pld-back" data-plreset="1">Сбросить</button>` : ""}`;
    $("plList").innerHTML = list.length ? list.map(plLi).join("") : PL.places.length ? `<div class="pl-empty"><b>Ничего не нашлось</b>Попробуй убрать фильтры.</div>`
      : `<div class="pl-empty"><b>Пока пусто</b>Нажми «Новое место», ткни точку на карте — и оцените, где были.</div>`;
  }
  function plLi(p){
    const w = plIsWant(p), s = plScore(p.id), last = plLast(p.id), who = w ? plWants(p.id) : plWho(p.id), pr = plPrice(p.id), bk = plBack(p.id), hf = w ? {} : plHitFlop(p.id);
    return `<button type="button" class="pl-li${plS.sel === p.id ? " sel" : ""}" data-plo="${esc(p.id)}"><span class="pl-th">${p.photo ? `<img alt="" loading="lazy" src="${esc(plImg(p))}" onerror="this.remove()">` : ""}${plKindI(p.kind)}</span>
      <span class="t"><b>${esc(p.name)}</b><small>${esc(plKindL(p.kind))}${pr ? " · " + PL_PRICE[pr - 1] : ""} · ${w ? (who.length ? `хотят ${who.length}` : "хотим сходить") : esc(plAgo(last))}${bk ? ` · вернутся ${bk.yes} из ${bk.n}` : ""}${!plLL(p) ? " · без точки" : ""}</small>${hf.hit ? `<small class="pl-hit">хит: ${esc(hf.hit.d.name)}</small>` : ""}${who.length ? avaStack(who, 4) : ""}</span>
      <span class="pl-sc ${w ? "w" : plCls(s)}${!w && plFew(p.id) ? " few" : ""}"${!w && plFew(p.id) ? ' title="Мало оценок — итог подтянут к среднему по всем местам"' : ""}>${w ? "ХОТИМ" : s == null ? "—" : num1(s)}</span></button>`;
  }
  // ---- живая карта: MapLibre + тайлы OpenFreeMap, только Якутск и окрестности ----
  const PL_LIB = "vendor/maplibre-gl"; // своя копия, без чужого CDN
  let plLibP = null, plMap = null, plTmp = null, plGeoT = 0;
  const plMks = new Map();
  function plLib(){
    if (window.maplibregl) return Promise.resolve();
    if (plLibP) return plLibP;
    plLibP = new Promise((ok, no) => {
      if (!document.querySelector('link[data-ml]')){ const l = document.createElement("link"); l.rel = "stylesheet"; l.href = PL_LIB + ".css"; l.dataset.ml = 1; document.head.appendChild(l); }
      const s = document.createElement("script"); s.src = PL_LIB + ".js"; s.async = true;
      s.onload = () => window.maplibregl ? ok() : no(new Error("lib")); s.onerror = () => { plLibP = null; s.remove(); no(new Error("lib")); }; document.head.appendChild(s);
    });
    return plLibP;
  }
  function plKill(){ if (plMap){ try { plMap.remove(); } catch(_){ /* ожидаемо: карта уже снята */ } } plMap = null; plTmp = null; plMks.clear(); }
  function plMapInit(){
    const el = $("plMap"), host = $("plGL"); if (!el || !host || el.dataset.ml) return; el.dataset.ml = 1;
    const ld = $("plLd");
    plLib().then(() => {
      if (!host.isConnected || plMap) return;
      let m;
      try {
        m = plMap = new maplibregl.Map({container: host, style: plStyle(), center: plCam ? plCam.c : PL_CENTER, zoom: plCam ? plCam.z : 12.4, minZoom: 10, maxZoom: 18.5, maxBounds: PL_BOUNDS,
          dragRotate: false, pitchWithRotate: false, touchPitch: false, attributionControl: {compact: true}, fadeDuration: 120});
      } catch(e){ plMap = null; logErr("карта Якутска", e); if (ld) ld.innerHTML = `<b>Карта не запустилась</b>Похоже, браузер не умеет WebGL. Обнови его или открой с другого устройства.`; return; }
      m.touchZoomRotate.disableRotation(); if (m.keyboard && m.keyboard.disableRotation) m.keyboard.disableRotation();
      m.on("load", () => { m.resize(); el.classList.add("ready"); if (!plCam) plFit(false); plDrawMarkers(); });
      if (window.ResizeObserver) new ResizeObserver(() => { if (plMap === m && host.clientHeight) m.resize(); }).observe(host);
      m.on("moveend", () => { plCam = {c: m.getCenter().toArray(), z: m.getZoom()}; });
      m.on("zoom", () => el.classList.toggle("z2", m.getZoom() >= 14));
      m.on("mousemove", e => { clearTimeout(plGeoT); plGeoT = setTimeout(() => plSetGeo(e.lngLat), 16); });
      m.on("click", e => {
        if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.closest && e.originalEvent.target.closest(".pl-mk")) return;
        if (!plPlacing) return;
        plPlacing.u = +e.lngLat.lng.toFixed(6); plPlacing.v = +e.lngLat.lat.toFixed(6); plSetGeo(e.lngLat); SND.click("soft"); plDrawTmp(); plDrawBanner();
      });
      let errN = 0; m.on("error", () => { if (++errN === 6 && !m.areTilesLoaded()) toast("Карта грузится плохо — проверь интернет или VPN"); });
      el.classList.toggle("z2", m.getZoom() >= 14);
    }).catch(() => { if (ld) ld.innerHTML = `<b>Карта не загрузилась</b>Проверь интернет или включи VPN и обнови страницу.<button type="button" class="pl-btn sm" data-plmapretry="1" style="margin-top:12px">Ещё раз</button>`; delete el.dataset.ml; });
  }
  const plSetGeo = ll => { const g = $("plGeo"); if (!g || !ll || !plMap) return; g.innerHTML = `<b>${ll.lat.toFixed(4)}° N</b> / <b>${ll.lng.toFixed(4)}° E</b> · z${plMap.getZoom().toFixed(1)}`; };
  function plFit(anim){
    if (!plMap) return;
    const pts = plFiltered().map(plLL).filter(Boolean);
    if (!pts.length){ plMap[anim ? "flyTo" : "jumpTo"]({center: PL_CENTER, zoom: 12.4}); return; }
    if (pts.length === 1){ plMap[anim ? "flyTo" : "jumpTo"]({center: pts[0], zoom: 15}); return; }
    const b = pts.reduce((a, p) => [[Math.min(a[0][0], p[0]), Math.min(a[0][1], p[1])], [Math.max(a[1][0], p[0]), Math.max(a[1][1], p[1])]], [[180, 90], [-180, -90]]);
    plMap.fitBounds(b, {padding: {top: 70, bottom: 60, left: 50, right: 70}, maxZoom: 15.5, animate: !!anim, duration: anim ? 900 : 0});
  }
  const plMkHTML = p => { const w = plIsWant(p), s = plScore(p.id), hf = w ? {} : plHitFlop(p.id);
    return `<span class="pl-mk-i" title="${esc(p.name + (hf.hit ? " · хит: " + hf.hit.d.name : "") + (hf.flop ? " · провал: " + hf.flop.d.name : ""))}"><span class="pl-mk-d">${w ? PLI.want : plKindI(p.kind)}</span>${w ? "" : `<span class="pl-mk-s">${s == null ? "?" : num1(s)}</span>`}<span class="pl-mk-n">${esc(p.name)}${hf.hit ? `<small>хит: ${esc(hf.hit.d.name)}</small>` : ""}</span></span>`; };
  function plDrawMarkers(){
    if (!plMap || !PL) return;
    const want = new Map(plFiltered().map(p => [p.id, p]).filter(([, p]) => plLL(p)));
    for (const [id, mk] of plMks) if (!want.has(id)){ mk.remove(); plMks.delete(id); }
    for (const [id, p] of want){
      const w = plIsWant(p), cls = `pl-mk ${w ? "w" + (plWants(id).length > 1 ? " hot" : "") : plCls(plScore(id))}${plS.sel === id ? " sel" : ""}`, html = plMkHTML(p);
      let mk = plMks.get(id);
      if (!mk){
        const el = document.createElement("button"); el.type = "button"; el.dataset.plm = id;
        el.addEventListener("click", e => { e.stopPropagation(); if (plPlacing) return; plSelect(id, {open: true, fly: false}); });
        mk = new maplibregl.Marker({element: el, anchor: "center"}).setLngLat(plLL(p)).addTo(plMap);
        if (plSeen && !plSeen.has(id)) el.classList.add("nw");
        plMks.set(id, mk);
      } else mk.setLngLat(plLL(p));
      const el = mk.getElement(), keepNw = el.classList.contains("nw");
      if (el.dataset.c !== cls){ el.className = cls + (keepNw ? " nw" : ""); el.dataset.c = cls; }
      if (el.dataset.h !== html){ el.innerHTML = html; el.dataset.h = html; }
      el.setAttribute("aria-label", p.name);
    }
    plSeen = new Set(PL.places.map(p => p.id));
    plDrawTmp();
  }
  function plDrawTmp(){
    if (!plMap) return;
    if (!plPlacing || plPlacing.u == null){ if (plTmp){ plTmp.remove(); plTmp = null; } return; }
    if (!plTmp){ const el = document.createElement("span"); el.className = "pl-mk tmp"; el.innerHTML = `<span class="pl-mk-i"><span class="pl-mk-d">${PLI.fly}</span></span>`;
      plTmp = new maplibregl.Marker({element: el, anchor: "center"}).setLngLat([plPlacing.u, plPlacing.v]).addTo(plMap); }
    else plTmp.setLngLat([plPlacing.u, plPlacing.v]);
  }
  function plSelect(id, {fly = true, open = false} = {}){
    const p = plById(id); if (!p) return;
    plS.sel = id;
    document.querySelectorAll(".pl-mk.sel,.pl-li.sel").forEach(x => x.classList.remove("sel"));
    document.querySelectorAll(`[data-plm="${CSS.escape(id)}"],[data-plo="${CSS.escape(id)}"]`).forEach(x => x.classList.add("sel"));
    plMks.forEach((mk, k) => { const el = mk.getElement(); if (el.dataset.c){ el.dataset.c = ""; } });
    const ll = plLL(p);
    if (fly && plMap && ll){ if (!plWide()) $("plMap").scrollIntoView({block: "nearest", behavior: plRM() ? "auto" : "smooth"}); plMap.flyTo({center: ll, zoom: Math.max(plMap.getZoom(), 15), duration: plRM() ? 0 : 1100, essential: true}); }
    if (open){ if (plWide() && route === "places"){ plS.panel = id; plDrawSide(); const sd = $("plSide"); if (sd && sd.getBoundingClientRect().top < 60) sd.scrollIntoView({block: "start", behavior: "smooth"}); } else plOpenSheet(id); }
  }
  // ---- режим «поставить точку» ----
  function plStartPlacing(o){
    if (plS.view !== "map"){ plS.view = "map"; lsSet("nexus_pl_view", "map"); renderPlaces(); }
    plPlacing = {u: o.u ?? null, v: o.v ?? null, ...o}; const el = $("plMap"); if (!el) return;
    el.classList.add("placing"); plDrawBanner(); plDrawMarkers();
    if (plMap && plPlacing.u != null) plMap.flyTo({center: [plPlacing.u, plPlacing.v], zoom: Math.max(plMap.getZoom(), 15)});
    el.scrollIntoView({block: plWide() ? "nearest" : "center", behavior: plRM() ? "auto" : "smooth"});
  }
  function plStopPlacing(){ if (!plPlacing) return; plPlacing = null; const el = $("plMap"); if (el) el.classList.remove("placing"); plDrawBanner(); if (plMap && PL) plDrawMarkers(); }
  function plDrawBanner(){
    const b = $("plBan"); if (!b) return;
    if (!plPlacing){ b.innerHTML = ""; return; }
    const has = plPlacing.u != null;
    b.innerHTML = `<div class="pl-banner" role="status"><span>${has ? "Точка стоит. Тапни ещё раз, чтобы сдвинуть" : esc(plPlacing.title || "Тапни по карте, где заведение")}</span>
      ${has ? `<button type="button" class="pl-btn sm cy on" data-plpok="1">Готово</button>` : plPlacing.skip ? `<button type="button" class="pl-btn sm alt" data-plpskip="1">Без точки</button>` : ""}<button type="button" class="pl-btn sm red" data-plpno="1">Отмена</button></div>`;
  }
  // ---- календарь походов ----
  function plDrawCal(){
    const el = $("plCal"); if (!el) return;
    const first = new Date(plCalY, plCalM, 1), st = (first.getDay() + 6) % 7, dim = new Date(plCalY, plCalM + 1, 0).getDate(), td = today();
    const key = d => `${plCalY}-${pad(plCalM + 1)}-${pad(d)}`;
    const vis = new Set(plFiltered().map(p => p.id));
    const inM = PL.visits.filter(v => String(v.day).startsWith(`${plCalY}-${pad(plCalM + 1)}-`) && plById(v.place_id) && vis.has(v.place_id));
    let g = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map(x => `<span class="dw">${x}</span>`).join("");
    for (let i = 0; i < st; i++) g += `<span class="pl-cd o"></span>`;
    for (let d = 1; d <= dim; d++){ const vs = inM.filter(v => String(v.day).slice(0, 10) === key(d)), ps = [...new Set(vs.map(v => v.place_id))].map(plById);
      const bgp = ps.find(p => p.photo);
      g += ps.length ? `<button type="button" class="pl-cd has${key(d) === td ? " td" : ""}" data-plday="${key(d)}">${bgp ? `<span class="bg"><img alt="" loading="lazy" src="${esc(plImg(bgp))}"></span>` : ""}<span class="n">${d}</span>${ps.map(p => `<span class="v ${plCls(plScore(p.id))}">${esc(p.name)}</span>`).join("")}</button>`
        : `<span class="pl-cd${key(d) === td ? " td" : ""}"><span class="n">${d}</span></span>`; }
    const people = {}; inM.forEach(v => plVM(v.id).forEach(u => people[u] = (people[u] || 0) + 1));
    const top = Object.entries(people).sort((a, b) => b[1] - a[1])[0];
    el.innerHTML = `<div class="pl-cal-h"><button type="button" data-plcal="-1" aria-label="Прошлый месяц">‹</button><b>${MONTHS_NOM[plCalM]} ${plCalY}</b><button type="button" class="tdy" data-plcal="0">Сегодня</button><button type="button" data-plcal="1" aria-label="Следующий месяц">›</button></div>
      <div class="pl-cal-g">${g}</div>
      <div class="pl-cal-sum">${inM.length ? `<span>Походов: <b>${inM.length}</b></span><span>Мест: <b>${new Set(inM.map(v => v.place_id)).size}</b></span>${top ? `<span>Чаще всех: <b>${esc(top[0] === ME.id ? "ты" : frNick(top[0]))}</b> (${top[1]})</span>` : ""}` : `<span>В этом месяце никуда не ходили. Пора исправлять.</span>`}</div>`;
  }
  function plDaySheet(day){
    const ps = [...new Set(PL.visits.filter(v => String(v.day).slice(0, 10) === day).map(v => v.place_id))].map(plById).filter(Boolean);
    if (ps.length === 1){ plSelect(ps[0].id, {fly: false, open: true}); return; }
    const s = openSheet(`<h3>${esc(plDay(day))}</h3><p class="sub">${ps.length} ${plural(ps.length, "место", "места", "мест")} за день</p><div class="pl-list" style="max-height:none">${ps.map(plLi).join("")}</div>`); s.el.classList.add("pl-sh");
    s.el.addEventListener("click", e => { const b = e.target.closest("[data-plo]"); if (b){ s.close(); setTimeout(() => plSelect(b.dataset.plo, {fly: false, open: true}), 200); } });
  }

  // ---- карточка места ----
  const plColor = v => `var(--pl-${{g: "green", y: "gold", r: "red", n: "dim"}[plCls(v)]})`;
  // ряд из 10 кнопок — одинаковый у заведения и у блюд; тап по своей цифре ещё раз — снять
  const plTen = (name, key, v, sm) => `<div class="pld-ten${sm ? " sm" : ""}" style="--c:${v == null ? "var(--pl-gold)" : plColor(v)}">${Array.from({length: 10}, (_, i) => i + 1).map(n => `<button type="button" data-${name}="${esc(key)}:${n}" class="${v === n ? "on" : v != null && n < v ? "lo" : ""}" aria-label="${n}">${n}</button>`).join("")}</div>`;
  const plVisLabel = v => v ? plDay(v.day) : "без похода";
  function plDetailHTML(p, mode){
    if (!p) return `<div class="pl-empty"><b>Место не найдено</b>Возможно, его удалили.</div>`;
    const w = plIsWant(p), s = plScore(p.id), raw = plRaw(p.id), nR = plN(p.id), few = plFew(p.id), vs = plVisits(p.id), been = plBeen(p.id), wants = plWants(p.id), iWant = wants.includes(ME.id), rates = plRates(p.id);
    const url = plUrl(p.gis_url), dr = plDraftOf(p.id), pr = plPrice(p.id), bk = plBack(p.id), tags = plTagsOf(p.id), hf = plHitFlop(p.id);
    const crit = PL_CRIT.map(([k, l, wt]) => { const c = plCrit(p.id, k); return `<span>${l}${wt > 1 ? `<sup>×${wt}</sup>` : ""}</span><span class="pld-bar" style="--c:${c ? plColor(c.avg) : "var(--pl-dim)"}">${c ? `<i style="width:${c.avg * 10}%"></i>` : ""}</span><em class="${c ? plCls(c.avg) : ""}" style="color:${c ? plColor(c.avg) : "var(--pl-dim)"}">${c ? num1(c.avg) : "—"}</em>`; }).join("");
    const summary = [pr ? `<span class="pld-chip">${PL_PRICE[pr - 1]} ${PL_PRICE_T[pr - 1]}</span>` : "", bk ? `<span class="pld-chip ${bk.yes / bk.n >= .6 ? "g" : bk.yes / bk.n < .4 ? "r" : ""}">вернутся ${bk.yes} из ${bk.n}</span>` : "",
      hf.hit ? `<span class="pld-chip g">хит: ${esc(hf.hit.d.name)} ${num1(hf.hit.a)}</span>` : "", hf.flop ? `<span class="pld-chip r">провал: ${esc(hf.flop.d.name)} ${num1(hf.flop.a)}</span>` : ""].join("");
    const tagsH = tags.length ? `<div class="pld-tags">${tags.slice(0, 8).map(([t, n]) => `<span class="pld-tag">${esc(t)}${n > 1 ? `<b>${n}</b>` : ""}</span>`).join("")}</div>` : "";
    const visits = vs.map(v => { const mm = plVM(v.id), me = mm.includes(ME.id);
      return `<div class="pld-v"><span class="d">${esc(plDay(v.day))}<small>${esc(plAgo(v.day))} · ${mm.length} ${plural(mm.length, "человек", "человека", "человек")}</small></span>${mm.length ? avaStack(mm, 6) : ""}
        <button type="button" class="pl-btn sm ${me ? "alt" : "cy"}" data-pla="${me ? "vout" : "vin"}" data-v="${esc(v.id)}">${me ? "Меня не было" : "Я тоже был"}</button>${v.user_id === ME.id ? `<button type="button" class="pl-btn sm red" data-pla="vdel" data-v="${esc(v.id)}" aria-label="Удалить поход" title="Удалить поход">×</button>` : ""}</div>`; }).join("");
    // моя оценка — за конкретный поход
    const myVs = vs.filter(v => plVM(v.id).includes(ME.id));
    const myRate = been ? `${myVs.length > 1 ? `<label class="pld-rv">Оценка за поход<select class="pl-sel" data-plrv="${esc(p.id)}">${myVs.map(v => `<option value="${esc(v.id)}"${v.id === dr.vid ? " selected" : ""}>${esc(plVisLabel(v))}${plRevs(p.id).some(r => r.visit_id === v.id && r.user_id === ME.id) ? " — оценено" : ""}</option>`).join("")}</select></label>` : ""}
        <p class="pld-hint" style="margin:0 0 8px">Любую шкалу можно пропустить: тапни свою цифру ещё раз, чтобы снять.</p>
        ${PL_CRIT.map(([k, l, wt, hint]) => `<div class="pld-pick"><span>${l}${wt > 1 ? ` <sup>×${wt}</sup>` : ""}${hint ? `<br><small style="color:var(--pl-dim);font-size:11px">${hint}</small>` : ""}</span>${plTen("plrate", k, dr[k])}</div>`).join("")}
        <div class="pld-pick"><span>Средний чек</span><div class="pl-seg">${PL_PRICE.map((x, i) => `<button type="button" data-pla="plv" data-n="${i + 1}" aria-pressed="${dr.price_lvl === i + 1}" title="${PL_PRICE_T[i]}">${x}</button>`).join("")}</div></div>
        <div class="pld-pick"><span>Вернулся бы?</span><div class="pl-seg"><button type="button" data-pla="back" data-n="1" aria-pressed="${dr.back === true}">Да</button><button type="button" data-pla="back" data-n="0" aria-pressed="${dr.back === false}">Нет</button></div></div>
        <div class="pld-tagpick">${PL_TAGS.map(t => `<button type="button" class="pld-tag${dr.tags.includes(t) ? " on" : ""}" data-pla="tag" data-t="${esc(t)}" aria-pressed="${dr.tags.includes(t)}">${esc(t)}</button>`).join("")}</div>
        <textarea class="pld-in" id="plCm-${esc(p.id)}" data-plcm="${esc(p.id)}" maxlength="300" placeholder="Пара слов: что понравилось, что бесит">${esc(dr.comment || "")}</textarea>
        <div class="acts" style="margin-top:8px"><button type="button" class="pl-btn" data-pla="rsave">${dr.id ? "Обновить оценку" : "Сохранить оценку"}</button>${dr.id ? `<button type="button" class="pl-btn sm alt" data-pla="rdel">Убрать</button>` : ""}</div>`
      : `<p class="pld-hint">Оценивают те, кто был. Отметься в походе — и сможешь поставить оценку и оценить блюда.</p><div class="acts" style="margin-top:10px"><button type="button" class="pl-btn cy" data-pla="visit">Я был здесь</button></div>`;
    const rlist = rates.slice().sort((a, b) => plRevKey(b).localeCompare(plRevKey(a))).map(r => { const a = plRAvg(r), hist = plHist(p.id, r.user_id).slice(1, 4).filter(x => plRAvg(x) != null);
      const vis = r.visit_id && PL.visits.find(v => v.id === r.visit_id);
      const meta = [r.price_lvl ? PL_PRICE[r.price_lvl - 1] : "", r.back === true ? "вернётся" : r.back === false ? "не вернётся" : "", vis ? "за " + plDay(vis.day) : ""].filter(Boolean).join(" · ");
      return `<div class="pld-rt">${avaHTML(profOf(r.user_id), "sm")}<div class="t"><b>${esc(r.user_id === ME.id ? "Ты" : frNick(r.user_id))}</b>${meta ? `<small class="pld-rm">${esc(meta)}</small>` : ""}
        <div class="nums">${PL_CRIT.map(([k, l]) => r[k] != null ? `<span>${l}<b>${r[k]}</b></span>` : "").join("")}</div>
        ${(r.tags || []).length ? `<div class="pld-tags sm">${r.tags.map(t => `<span class="pld-tag">${esc(t)}</span>`).join("")}</div>` : ""}
        ${r.comment ? `<p>${esc(r.comment)}</p>` : ""}
        ${hist.length ? `<small class="pld-hist">раньше: ${hist.map(x => { const xv = x.visit_id && PL.visits.find(v => v.id === x.visit_id); return `${num1(plRAvg(x))}${xv ? ` (${esc(plDay(xv.day))})` : ""}`; }).join(", ")}${a != null && plRAvg(hist[0]) != null ? (a > plRAvg(hist[0]) + .4 ? " — стало лучше" : a < plRAvg(hist[0]) - .4 ? " — стало хуже" : "") : ""}</small>` : ""}</div><span class="pl-sc ${plCls(a)}">${a == null ? "—" : num1(a)}</span></div>`; }).join("");
    const dishes = plDishes(p.id), dRow = d => { const a = plDAvg(d.id), n = plDR(d.id).length, mine = plDR(d.id).find(r => r.user_id === ME.id);
      const tag = hf.hit && hf.hit.d.id === d.id ? `<span class="pld-chip g sm">хит</span>` : hf.flop && hf.flop.d.id === d.id ? `<span class="pld-chip r sm">провал</span>` : "";
      return `<div class="pld-dish"><span class="t"><b>${esc(d.name)}${tag}</b><small>${n ? `${n} ${plural(n, "оценка", "оценки", "оценок")}` : "без оценок"}${d.user_id !== ME.id ? " · добавил " + esc(frNick(d.user_id)) : ""}</small></span>
        <span class="pl-sc ${plCls(a)}">${a == null ? "—" : num1(a)}</span>${d.user_id === ME.id || p.user_id === ME.id ? `<button type="button" class="rm" data-pla="ddel" data-d="${esc(d.id)}" aria-label="Удалить">×</button>` : ""}
        ${been ? `<div class="pld-dten">${plTen("pldrate", d.id, mine ? +mine.score : null, true)}</div>` : ""}</div>`; };
    const food = dishes.filter(d => d.kind !== "drink"), drink = dishes.filter(d => d.kind === "drink");
    const dk = plDraftOf(p.id).dk || "food";
    return `<div class="pld" data-plpid="${esc(p.id)}">
      ${mode === "side" ? `<button type="button" class="pld-back" data-pla="back">‹ Все заведения</button>` : ""}
      <div class="pld-hero">${p.photo ? `<img alt="" src="${esc(plImg(p))}" onerror="this.remove()">` : ""}<span class="pld-kind${w ? " w" : ""}">${w ? "Хотим сходить" : esc(plKindL(p.kind))}</span><h2>${esc(p.name)}</h2><p>${esc([p.address, vs.length ? `последний поход ${plAgo(vs[0].day)}` : ""].filter(Boolean).join(" · "))}</p>
        <span class="pld-big ${plCls(s)}"><b>${s == null ? "нет оценок" : num1(s)}</b>${s == null ? "" : `<small>${nR} ${plural(nR, "оценка", "оценки", "оценок")}${few ? " · мало" : ""}</small>`}</span></div>
      <div class="pld-acts">
        ${url ? `<a class="pl-btn alt" href="${esc(url)}" target="_blank" rel="noopener">${PLI.gis}2ГИС</a>` : ""}
        <button type="button" class="pl-btn" data-pla="visit">${ICON.calendar}Мы были здесь</button>
        <button type="button" class="pl-btn cy${iWant ? " on" : ""}" data-pla="want">${iWant ? "Хочу ✓" : "Хочу сходить"}</button>
        <button type="button" class="pl-btn alt" data-pla="invite">${ICON.send}Позвать друзей</button>
        ${mode === "sheet" && plLL(p) && route === "places" ? `<button type="button" class="pl-btn alt" data-pla="fly">${PLI.fly}На карте</button>` : ""}
        <button type="button" class="pl-btn alt" data-pla="edit">${ICON.edit}Изменить</button>
      </div>
      ${!plLL(p) ? `<div class="pld-s"><p class="pld-hint">Точки на карте нет.</p><div class="acts" style="margin-top:8px"><button type="button" class="pl-btn sm cy" data-pla="pin">Поставить точку</button></div></div>` : ""}
      ${wants.length ? `<div class="pld-s"><h4>${w ? "Хотят сходить" : "Хотят ещё"}<small>${wants.length}</small></h4><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">${avaStack(wants, 8)}<span class="pld-hint">${esc(wants.map(u => u === ME.id ? "ты" : frNick(u)).join(", "))}</span></div></div>` : ""}
      ${w ? "" : `<div class="pld-s"><h4>Оценки<small>${rates.length ? `по последней оценке каждого · вкус весит вдвое` : "пока никто не оценил"}</small></h4>${summary ? `<div class="pld-sum">${summary}</div>` : ""}<div class="pld-crit">${crit}</div>${tagsH}${few ? `<p class="pld-few">Оценок пока меньше ${PL_FEW}, поэтому итог подтянут к среднему по всем местам. Без поправки было бы ${num1(raw)}.</p>` : ""}</div>`}
      <div class="pld-s"><h4>Походы<small>${vs.length}</small></h4>${vs.length ? `<div class="pld-vis">${visits}</div>` : `<p class="pld-hint">Ещё не ходили. Как сходите — жми «Мы были здесь».</p>`}</div>
      ${w && !been ? "" : `<div class="pld-s"><h4>Моя оценка${dr.vid && myVs.length ? `<small>за ${esc(plVisLabel(myVs.find(v => v.id === dr.vid)))}</small>` : ""}</h4>${myRate}</div>`}
      ${rlist ? `<div class="pld-s"><h4>Кто как оценил<small>${rates.length}</small></h4>${rlist}</div>` : ""}
      <div class="pld-s"><h4>Блюда и напитки<small>${dishes.length}</small></h4>
        ${food.length ? `<div class="pld-dg">Еда</div>${food.map(dRow).join("")}` : ""}${drink.length ? `<div class="pld-dg">Напитки</div>${drink.map(dRow).join("")}` : ""}
        ${dishes.length ? "" : `<p class="pld-hint">Что брали? Добавь — и каждый, кто был, поставит свою оценку.</p>`}
        <div class="pld-add"><input class="pld-in" data-pldn="${esc(p.id)}" maxlength="80" placeholder="Крылья, стаут, борщ…" enterkeyhint="done"><div class="pl-seg"><button type="button" data-pla="dk" data-k="food" aria-pressed="${dk === "food"}">Еда</button><button type="button" data-pla="dk" data-k="drink" aria-pressed="${dk === "drink"}">Пить</button></div><button type="button" class="pl-btn sm" data-pla="dadd" aria-label="Добавить">${ICON.plus}</button></div>
      <div class="pld-s"><h4>Меню<small>${p.menu.length ? `${p.menu.length} фото` : ""}</small></h4><div class="pld-menu">${p.menu.map((m, i) => `<button type="button" data-pla="mopen" data-i="${i}" aria-label="Фото меню ${i + 1}"><img alt="" loading="lazy" src="${esc(publicUrl(m))}" onerror="this.remove()"></button>`).join("")}
        <label>${PLI.cam}Фото меню<input type="file" accept="image/*" multiple hidden data-plmenu="${esc(p.id)}"></label></div></div>
      <p class="pld-meta">Добавил ${esc(p.user_id === ME.id ? "ты" : frNick(p.user_id))} · ${esc(plDay(String(p.created_at).slice(0, 10)))}</p>
    </div>`;
  }
  // черновик моей оценки — за выбранный поход (по умолчанию последний, где я был); новую оценку начинаем с прошлой
  function plDraftOf(pid){
    const cur = plDraft[pid]; if (cur && (!cur.vid || PL.visits.some(v => v.id === cur.vid))) return cur;
    const myVs = plVisits(pid).filter(v => plVM(v.id).includes(ME.id));
    return plDraftFor(pid, myVs.length ? myVs[0].id : null, cur && cur.dk);
  }
  function plDraftFor(pid, vid, dk){
    const mine = plHist(pid, ME.id), r = mine.find(x => vid ? x.visit_id === vid : !x.visit_id) || null, base = r || mine[0] || null;
    const d = {vid, id: r ? r.id : null, dk: dk || "food", comment: r ? r.comment || "" : "", price_lvl: base ? base.price_lvl ?? null : null, back: base ? base.back ?? null : null, tags: base ? [...(base.tags || [])] : []};
    PL_CRIT.forEach(([k]) => { d[k] = base ? base[k] ?? null : null; });
    return plDraft[pid] = d;
  }
  function plOpenSheet(id){
    if (plSheet && !plSheet.s.closed){ plSheet.id = id; plDrawSheet(); plSheet.s.el.scrollTop = 0; return; }
    const s = openSheet(`<div id="plShB"></div>`, {wide: true, onClose: () => { if (plSheet && plSheet.s === s) plSheet = null; }});
    s.el.classList.add("pl-sh"); plSheet = {s, id}; plDrawSheet();
    s.el.addEventListener("click", e => plAct(e, s.el));
    s.el.addEventListener("change", e => plChange(e));
    s.el.addEventListener("input", e => plInput(e));
    s.el.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("[data-pldn]")){ e.preventDefault(); plAddDish(e.target.dataset.pldn, s.el); } });
  }
  function plDrawSheet(){
    if (!plSheet) return; const b = plSheet.s.el.querySelector("#plShB"); if (!b) return;
    const a = document.activeElement; if (a && b.contains(a) && a.matches("input,textarea,select")) { clearTimeout(plDrawSheet.t); plDrawSheet.t = setTimeout(plDrawSheet, 1500); return; }
    const sy = plSheet.s.el.scrollTop; b.innerHTML = plDetailHTML(plById(plSheet.id), "sheet"); plSheet.s.el.scrollTop = sy;
  }
  function plRedraw(){
    if (plS.panel && route === "places"){ const a = document.activeElement, sd = $("plSide"); if (!(a && sd && sd.contains(a) && a.matches("input,textarea,select"))) plDrawSide(); }
    if (plSheet) plDrawSheet();
  }
  const plPidOf = el => { const d = el.closest("[data-plpid]"); return d ? d.dataset.plpid : null; };
  // тап по цифре оценки — меняем только кнопки, без перерисовки
  function plRatePick(btn){
    const [k, n] = btn.dataset.plrate.split(":"), pid = plPidOf(btn), dr = plDraftOf(pid); if (!pid) return;
    dr[k] = dr[k] === +n ? null : +n; dr.dirty = true;
    const box = btn.parentElement, v = dr[k];
    box.style.setProperty("--c", v == null ? "var(--pl-gold)" : plColor(v));
    box.querySelectorAll("button").forEach((b, i) => { b.className = v === i + 1 ? "on" : v != null && i + 1 < v ? "lo" : ""; });
    SND.click("soft");
  }
  const plSegSync = (b, on) => { b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b && on)); SND.click("soft"); };
  // оценка блюда — те же 10 кнопок; тап по своей цифре ещё раз — снять
  async function plDishRate(btn){
    const [did, n] = btn.dataset.pldrate.split(":"), mine = plDR(did).find(r => r.user_id === ME.id), v = mine && +mine.score === +n ? null : +n;
    const box = btn.parentElement; box.style.setProperty("--c", v == null ? "var(--pl-gold)" : plColor(v));
    box.querySelectorAll("button").forEach((b, i) => { b.className = v === i + 1 ? "on" : v != null && i + 1 < v ? "lo" : ""; }); SND.click("soft");
    const {error} = v ? await SB.from("place_dish_rates").upsert({dish_id: did, user_id: ME.id, score: v, updated_at: now()}, {onConflict: "dish_id,user_id"}) : await SB.from("place_dish_rates").delete().eq("dish_id", did).eq("user_id", ME.id);
    if (error){ plFail(error); return; } await loadPlaces(true);
  }
  async function plAct(e, root){
    const t = e.target; if (!t.closest) return;
    const rb = t.closest("[data-plrate]"); if (rb){ plRatePick(rb); return; }
    const db = t.closest("[data-pldrate]"); if (db){ plDishRate(db); return; }
    const b = t.closest("[data-pla]"); if (!b || !root.contains(b)) return;
    const pid = plPidOf(b), p = plById(pid), a = b.dataset.pla; if (!p && a !== "back") return;
    if (a === "back"){ plS.panel = null; plDrawSide(); return; }
    if (a === "fly"){ if (plSheet) plSheet.s.close(); plSelect(pid, {fly: true}); return; }
    if (a === "visit"){ plVisitSheet(pid); return; }
    if (a === "edit"){ plForm(p); return; }
    if (a === "pin"){ if (plSheet) plSheet.s.close(); plMovePin(p); return; }
    if (a === "mopen"){ plLb(pid, +b.dataset.i); return; }
    if (a === "plv"){ const dr = plDraftOf(pid), n = +b.dataset.n; dr.price_lvl = dr.price_lvl === n ? null : n; dr.dirty = true; plSegSync(b, dr.price_lvl === n); return; }
    if (a === "back"){ const dr = plDraftOf(pid), v = b.dataset.n === "1"; dr.back = dr.back === v ? null : v; dr.dirty = true; plSegSync(b, dr.back === v); return; }
    if (a === "tag"){ const dr = plDraftOf(pid), tg = b.dataset.t, on = dr.tags.includes(tg);
      if (!on && dr.tags.length >= 6){ toast("Хватит шести ярлыков"); return; }
      dr.tags = on ? dr.tags.filter(x => x !== tg) : [...dr.tags, tg]; dr.dirty = true; b.classList.toggle("on", !on); b.setAttribute("aria-pressed", !on); SND.click("soft"); return; }
    if (a === "dk"){ plDraftOf(pid).dk = b.dataset.k; b.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); return; }
    if (a === "dadd"){ plAddDish(pid, root); return; }
    b.disabled = true;
    try {
      if (a === "want"){
        const has = plWants(pid).includes(ME.id);
        const {error} = has ? await SB.from("place_wants").delete().eq("place_id", pid).eq("user_id", ME.id) : await SB.from("place_wants").insert({place_id: pid, user_id: ME.id});
        if (error) throw error; if (!has){ toast("Добавил в «Хочу сходить»"); SND.click(); } await loadPlaces(true);
      } else if (a === "invite"){
        const all = plEveryone().filter(u => u !== ME.id); if (!all.length){ toast("Пока некого звать — на сайте только ты"); return; }
        if (!plWants(pid).includes(ME.id)) await SB.from("place_wants").insert({place_id: pid, user_id: ME.id});
        await notify(all, "place_want", "place:" + pid, p.name); toast(`Позвал всех (${all.length}): ${p.name}`); SND.click(); confetti(); await loadPlaces(true);
      } else if (a === "vin" || a === "vout"){
        const vid = b.dataset.v;
        const {error} = a === "vin" ? await SB.from("place_visit_members").insert({visit_id: vid, user_id: ME.id}) : await SB.from("place_visit_members").delete().eq("visit_id", vid).eq("user_id", ME.id);
        if (error) throw error; if (a === "vin") await SB.from("place_wants").delete().eq("place_id", pid).eq("user_id", ME.id); await loadPlaces(true);
      } else if (a === "vdel"){
        if (!confirm("Удалить этот поход? Отметки друзей в нём тоже пропадут.")) return;
        const {error} = await SB.from("place_visits").delete().eq("id", b.dataset.v); if (error) throw error; toast("Поход удалён"); await loadPlaces(true);
      } else if (a === "rsave"){
        const dr = plDraftOf(pid), ta = root.querySelector(`[data-plcm="${CSS.escape(pid)}"]`); if (ta) dr.comment = ta.value;
        const row = {place_id: pid, visit_id: dr.vid || null, user_id: ME.id, price_lvl: dr.price_lvl, back: dr.back, tags: dr.tags.slice(0, 12), comment: (dr.comment || "").trim().slice(0, 300) || null, updated_at: now()};
        PL_CRIT.forEach(([k]) => { row[k] = dr[k]; });
        if (PL_CRIT.every(([k]) => row[k] == null)){ toast("Поставь хотя бы одну оценку"); return; }
        const {error} = dr.id ? await SB.from("place_reviews").update(row).eq("id", dr.id).eq("user_id", ME.id) : await SB.from("place_reviews").insert(row); if (error) throw error;
        dr.dirty = false; toast(dr.id ? "Оценка обновлена" : "Оценка сохранена"); SND.click(); delete plDraft[pid]; await loadPlaces(true); plDraftFor(pid, dr.vid, dr.dk); plRedraw();
      } else if (a === "rdel"){
        const dr = plDraftOf(pid); if (!dr.id || !confirm("Убрать оценку за этот поход?")) return;
        const {error} = await SB.from("place_reviews").delete().eq("id", dr.id).eq("user_id", ME.id); if (error) throw error; delete plDraft[pid]; await loadPlaces(true); plDraftFor(pid, dr.vid, dr.dk); plRedraw();
      } else if (a === "ddel"){
        if (!confirm("Удалить блюдо вместе с оценками?")) return;
        const {error} = await SB.from("place_dishes").delete().eq("id", b.dataset.d); if (error) throw error; await loadPlaces(true);
      }
    } catch(err){ plFail(err); } finally { if (b.isConnected) b.disabled = false; }
  }
  async function plAddDish(pid, root){
    const inp = root.querySelector(`[data-pldn="${CSS.escape(pid)}"]`), name = inp ? inp.value.trim() : ""; if (!name){ toast("Напиши, что брали"); inp && inp.focus(); return; }
    if (plDishes(pid).some(d => plK(d.name) === plK(name))){ toast("Такое уже есть в списке"); return; }
    const kind = plDraftOf(pid).dk || "food";
    const {error} = await SB.from("place_dishes").insert({place_id: pid, user_id: ME.id, name: name.slice(0, 80), kind});
    if (error){ plFail(error); return; } inp.value = ""; inp.blur(); toast(kind === "drink" ? "Напиток добавлен" : "Блюдо добавлено"); await loadPlaces(true);
  }
  async function plChange(e){
    const t = e.target;
    if (t.matches("[data-plrv]")){ const pid = t.dataset.plrv, old = plDraftOf(pid); plDraftFor(pid, t.value, old.dk); t.blur(); plRedraw(); return; }
    if (t.matches("[data-plmenu]")){ const pid = t.dataset.plmenu, fs = [...t.files].filter(f => f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)).slice(0, 12); t.value = "";
      if (!fs.length) return; await plMenuAdd(pid, fs); }
  }
  function plInput(e){ const t = e.target; if (t.matches("[data-plcm]")){ const dr = plDraftOf(t.dataset.plcm); dr.comment = t.value; dr.dirty = true; } }
  async function plMenuAdd(pid, files){
    toast(`Загружаю ${files.length} фото…`);
    try { const ids = []; for (const f of files) ids.push(await plUp(f, 1800));
      await loadPlaces(true); const p = plById(pid); if (!p) return; const next = [...p.menu, ...ids].slice(-40);
      const {error} = await SB.from("places").update({menu: next, updated_at: now()}).eq("id", pid); if (error) throw error;
      toast("Меню обновлено"); await loadPlaces(true);
    } catch(err){ toast(upErr(err)); }
  }
  // просмотр фото меню
  function plLb(pid, i){
    const p = plById(pid); if (!p || !p.menu.length) return; let k = i, sx = null;
    const el = document.createElement("div"); el.className = "pl-lb"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Меню"); document.body.appendChild(el);
    const cur = () => (plById(pid) || p).menu;
    const draw = () => { const m = cur(); if (!m.length){ close(); return; } k = (k + m.length) % m.length; const own = String(m[k]).startsWith(ME.id + "/") || p.user_id === ME.id;
      el.innerHTML = `<img alt="Фото меню" src="${esc(publicUrl(m[k]))}"><button type="button" class="x" aria-label="Закрыть">×</button>${m.length > 1 ? `<button type="button" class="a l" aria-label="Назад">‹</button><button type="button" class="a r" aria-label="Вперёд">›</button>` : ""}<div class="b"><span>${k + 1} / ${m.length}</span>${own ? `<button type="button" class="pl-btn red sm" data-lbdel="1">Удалить</button>` : ""}</div>`; };
    const key = e => { if (e.key === "Escape"){ e.stopPropagation(); e.preventDefault(); close(); } else if (e.key === "ArrowLeft"){ k--; draw(); } else if (e.key === "ArrowRight"){ k++; draw(); } };
    const close = () => { el.remove(); document.removeEventListener("keydown", key, true); };
    el.addEventListener("click", async e => { const t = e.target;
      if (t === el || t.closest(".x")) close(); else if (t.closest(".a.l")){ k--; draw(); } else if (t.closest(".a.r")){ k++; draw(); }
      else if (t.closest("[data-lbdel]")){ if (!confirm("Удалить это фото меню?")) return; const next = cur().filter((_, j) => j !== k);
        const {error} = await SB.from("places").update({menu: next, updated_at: now()}).eq("id", pid); if (error){ plFail(error, "Не удалилось"); return; }
        const pp = plById(pid); if (pp) pp.menu = next; p.menu = next; draw(); loadPlaces(true); } });
    el.addEventListener("touchstart", e => { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, {passive: true});
    el.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50 && cur().length > 1){ k += dx < 0 ? 1 : -1; draw(); } sx = null; }, {passive: true});
    document.addEventListener("keydown", key, true); draw();
  }
  // ---- «мы были здесь»: день и кто был ----
  function plWhoChips(sel){
    const ps = FR ? FR.profiles.map(p => p.user_id === ME.id ? myProf() : p) : [myProf()];
    return ps.sort((a, b) => (b.user_id === ME.id) - (a.user_id === ME.id) || String(a.nick).localeCompare(String(b.nick), "ru"))
      .map(p => `<button type="button" data-plwho="${esc(p.user_id)}" aria-pressed="${sel.has(p.user_id)}">${avaHTML(p, "sm")}${esc(p.user_id === ME.id ? "Я" : p.nick)}</button>`).join("");
  }
  function plVisitSheet(pid){
    const p = plById(pid); if (!p) return; const who = new Set([ME.id]);
    const s = openSheet(`<h3>Мы были здесь</h3><p class="sub">${esc(p.name)}</p>
      <label class="pld-f">Когда<input type="date" class="pld-in" id="plvD" value="${today()}" max="${addDays(today(), 60)}"></label>
      <div class="pld-f">Кто был — отметь друзей<div class="pld-who" id="plvW">${plWhoChips(who)}</div></div>
      <p class="pld-hint">Отмеченным друзьям придёт уведомление. Каждый потом сам может отметиться или убраться из похода.</p>
      <div class="acts" style="margin-top:14px"><button type="button" class="pl-btn" id="plvOk">Отметить поход</button><button type="button" class="pl-btn alt" id="plvNo">Отмена</button></div>`);
    s.el.classList.add("pl-sh"); const q = x => s.el.querySelector(x);
    q("#plvW").onclick = e => { const b = e.target.closest("[data-plwho]"); if (!b) return; const u = b.dataset.plwho; who.has(u) ? who.delete(u) : who.add(u); b.setAttribute("aria-pressed", who.has(u)); };
    q("#plvNo").onclick = () => s.close();
    q("#plvOk").onclick = async () => { const day = q("#plvD").value; if (!/^\d{4}-\d{2}-\d{2}$/.test(day)){ toast("Выбери дату"); return; } if (!who.size){ toast("Отметь хотя бы одного"); return; }
      q("#plvOk").disabled = true;
      try { await plSaveVisit(pid, day, [...who]); s.close(); toast(`Поход отмечен: ${plDay(day)}`); SND.click(); confetti(); }
      catch(err){ plFail(err); } finally { const b = q("#plvOk"); if (b) b.disabled = false; } };
  }
  async function plSaveVisit(pid, day, uids){
    const p = plById(pid); let v = PL.visits.find(x => x.place_id === pid && String(x.day).slice(0, 10) === day);
    if (v && v.user_id !== ME.id) uids = uids.filter(u => u === ME.id || plVM(v.id).includes(u)); // в чужой поход можно добавить только себя
    if (!v){ const r = await SB.from("place_visits").insert({place_id: pid, user_id: ME.id, day}).select().single(); if (r.error) throw r.error; v = r.data; }
    const have = plVM(v.id), add = uids.filter(u => !have.includes(u));
    if (add.length){ const {error} = await SB.from("place_visit_members").insert(add.map(u => ({visit_id: v.id, user_id: u}))); if (error) throw error; }
    if (uids.includes(ME.id)) await SB.from("place_wants").delete().eq("place_id", pid).eq("user_id", ME.id);
    const others = add.filter(u => u !== ME.id); if (others.length) notify(others, "place_visit", "place:" + pid, `${p ? p.name : ""} — ${plDay(day)}`);
    await loadPlaces(true);
  }
  // ---- новое место и правка ----
  function plAdd(){ if (!plReady()) return; plS.panel = null; plStartPlacing({title: "Новое место: тапни по карте, где оно", skip: true, done: (u, v) => plForm(null, {lng: u, lat: v})}); }
  function plMovePin(p){ const ll = plLL(p); plStartPlacing({title: `Новая точка для «${p.name}»: тапни по карте`, u: ll ? ll[0] : null, v: ll ? ll[1] : null, done: async (u, v) => {
    let {error} = await SB.from("places").update({lng: u, lat: v, x: null, y: null, updated_at: now()}).eq("id", p.id);
    if (error && plGeoErr(error)){ const o = plToOld(u, v); if (!o){ toast("Сюда точку можно будет ставить после обновления базы (блок 5.2 в schema.sql)"); return; } ({error} = await SB.from("places").update({...o, updated_at: now()}).eq("id", p.id)); }
    if (error){ plFail(error); return; }
    toast("Точка перенесена"); await loadPlaces(true); plSelect(p.id, {fly: true}); } }); }
  function plForm(p, init = {}){
    const isNew = !p; let file = null, mode = "been", inviteAll = false; const who = new Set([ME.id]);
    const v0 = p || {name: "", kind: "bar", gis_url: "", address: "", photo: null};
    const s = openSheet(`<h3>${isNew ? "Новое место" : "Изменить место"}</h3><p class="sub">${isNew ? (init.lng != null ? "Точка на карте стоит. Осталось пара полей." : "Без точки на карте — её можно поставить потом.") : esc(p.name)}</p>
      <label class="pld-f">Название<input class="pld-in" id="plfN" maxlength="120" value="${esc(v0.name)}" placeholder="Bodies Bar" autocomplete="off"></label>
      <div class="pld-f">Тип<div class="pld-kinds" id="plfK">${PL_KIND.map(([k, l]) => `<button type="button" class="pl-chip" data-k="${k}" aria-pressed="${v0.kind === k}">${l}</button>`).join("")}</div></div>
      ${isNew ? `<div class="pld-f">Статус<div class="pld-two" id="plfS"><button type="button" data-m="been" aria-pressed="true">Уже были</button><button type="button" class="w" data-m="want" aria-pressed="false">Хочу сходить</button></div></div>
        <div id="plfBeen"><label class="pld-f">Когда были<input type="date" class="pld-in" id="plfD" value="${today()}" max="${addDays(today(), 60)}"></label><div class="pld-f">Кто был<div class="pld-who" id="plfW">${plWhoChips(who)}</div></div></div>
        <div id="plfWant" hidden><button type="button" class="pl-chip" id="plfInv" aria-pressed="false" style="margin-bottom:12px">Позвать всех друзей — придёт уведомление</button></div>` : ""}
      <div class="pld-f">Фото заведения<div class="pld-ph" id="plfP" role="button" tabindex="0">${v0.photo ? `<img alt="" src="${esc(plImg(v0))}">` : `<span>Нажми, чтобы выбрать фото<br>или вставь картинку (Ctrl+V)</span>`}</div><input type="file" id="plfF" accept="image/*" hidden></div>
      <label class="pld-f">Ссылка на 2ГИС<input class="pld-in" id="plfG" type="url" inputmode="url" maxlength="500" value="${esc(v0.gis_url || "")}" placeholder="https://2gis.ru/yakutsk/firm/…"></label>
      <label class="pld-f">Адрес (необязательно)<input class="pld-in" id="plfA" maxlength="200" value="${esc(v0.address || "")}" placeholder="пр. Ленина, 1"></label>
      <div class="acts" style="margin-top:14px"><button type="button" class="pl-btn" id="plfOk">${isNew ? "Добавить на карту" : "Сохранить"}</button>${isNew ? "" : `<button type="button" class="pl-btn alt" id="plfPin">${PLI.fly}${p.x == null ? "Поставить точку" : "Переставить точку"}</button>`}<button type="button" class="pl-btn alt" id="plfNo">Отмена</button></div>
      ${!isNew && p.user_id === ME.id ? `<div class="acts" style="margin-top:18px"><button type="button" class="pl-btn red sm" id="plfDel">Удалить место</button></div>` : ""}`);
    s.el.classList.add("pl-sh"); const q = x => s.el.querySelector(x);
    let kind = v0.kind;
    q("#plfK").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; kind = b.dataset.k; q("#plfK").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); };
    if (isNew){
      q("#plfS").onclick = e => { const b = e.target.closest("[data-m]"); if (!b) return; mode = b.dataset.m; q("#plfS").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); q("#plfBeen").hidden = mode !== "been"; q("#plfWant").hidden = mode !== "want"; };
      q("#plfW").onclick = e => { const b = e.target.closest("[data-plwho]"); if (!b) return; const u = b.dataset.plwho; who.has(u) ? who.delete(u) : who.add(u); b.setAttribute("aria-pressed", who.has(u)); };
      q("#plfInv").onclick = () => { inviteAll = !inviteAll; q("#plfInv").setAttribute("aria-pressed", inviteAll); };
      setTimeout(() => { const n = q("#plfN"); if (n && plWide()) n.focus(); }, 80);
    }
    const setFile = f => { if (!f || !(f.type || "").startsWith("image/")) { toast("Нужна картинка"); return; } file = f; q("#plfP").innerHTML = `<img alt="" src="${URL.createObjectURL(f)}">`; };
    pasteTarget = setFile;
    q("#plfP").onclick = () => q("#plfF").click(); q("#plfP").onkeydown = e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); q("#plfF").click(); } };
    q("#plfF").onchange = e => { const f = e.target.files[0]; if (f) setFile(f); e.target.value = ""; };
    bindDrop(q("#plfP"), setFile);
    q("#plfNo").onclick = () => s.close();
    if (q("#plfPin")) q("#plfPin").onclick = () => { s.close(); if (plSheet) plSheet.s.close(); if (route !== "places") go("places"); setTimeout(() => plMovePin(p), route === "places" ? 50 : 400); };
    if (q("#plfDel")) q("#plfDel").onclick = async () => { if (!confirm(`Удалить «${p.name}» со всеми походами, оценками и меню?`)) return;
      const {error} = await SB.from("places").delete().eq("id", p.id); if (error){ plFail(error, "Не удалилось"); return; }
      s.close(); if (plSheet) plSheet.s.close(); if (plS.panel === p.id) plS.panel = null; if (plS.sel === p.id) plS.sel = null; toast("Место удалено"); await loadPlaces(true); };
    q("#plfOk").onclick = async () => {
      const name = q("#plfN").value.trim().replace(/\s+/g, " "); if (!name){ toast("Напиши название"); q("#plfN").focus(); return; }
      const gRaw = q("#plfG").value.trim(), gis = plUrl(gRaw); if (gRaw && !gis){ toast("Ссылка какая-то не такая"); q("#plfG").focus(); return; }
      if (isNew && mode === "been" && !/^\d{4}-\d{2}-\d{2}$/.test(q("#plfD").value)){ toast("Выбери дату похода"); return; }
      const ok = q("#plfOk"); ok.disabled = true; ok.textContent = "Сохраняю…";
      try {
        const photo = file ? await plUp(file, 1400) : (isNew ? null : v0.photo);
        const row = {name: name.slice(0, 120), kind, gis_url: gis || null, address: q("#plfA").value.trim().slice(0, 200) || null, photo};
        let id = p && p.id;
        if (isNew){ let r = await SB.from("places").insert({...row, user_id: ME.id, ...(init.lng != null ? {lng: init.lng, lat: init.lat} : {})}).select().single();
          if (r.error && plGeoErr(r.error) && init.lng != null){ const o = plToOld(init.lng, init.lat); if (!o){ const g = "Сюда точку можно будет ставить после обновления базы (блок 5.2 в schema.sql)"; toast(g); throw {message: g, shown: 1}; } r = await SB.from("places").insert({...row, user_id: ME.id, ...o}).select().single(); }
          if (r.error) throw r.error; id = r.data.id;
          await loadPlaces(true);
          if (mode === "been") await plSaveVisit(id, q("#plfD").value, [...who]);
          else { await SB.from("place_wants").insert({place_id: id, user_id: ME.id}); if (inviteAll) await notify(plEveryone().filter(u => u !== ME.id), "place_want", "place:" + id, row.name); await loadPlaces(true); }
        } else { const {error} = await SB.from("places").update({...row, updated_at: now()}).eq("id", id); if (error) throw error; await loadPlaces(true); }
        s.close(); toast(isNew ? `«${row.name}» на карте` : "Сохранено"); if (isNew){ SND.click(); if (mode === "been") plDraft[id] = null; }
        if (route === "places") plSelect(id, {fly: isNew, open: isNew || !plSheet});
      } catch(err){ ok.disabled = false; ok.textContent = isNew ? "Добавить на карту" : "Сохранить"; if (!(err && err.shown)) toast(err && err.code ? upErr(err) : "Не сохранилось: " + ((err && err.message) || "")); }
    };
  }
  // ---- события страницы ----
  function plWire(m){
    m.addEventListener("click", e => {
      const t = e.target; if (!t.closest) return; let b;
      if ((b = t.closest("[data-plview]"))){ plS.view = b.dataset.plview; lsSet("nexus_pl_view", plS.view); plStopPlacing(); renderPlaces(); return; }
      if (t.closest("[data-pladd]")){ plAdd(); return; }
      if ((b = t.closest("[data-plz]"))){ if (!plMap) return; const z = b.dataset.plz; if (z === "fit") plFit(true); else plMap[z === "in" ? "zoomIn" : "zoomOut"](); return; }
      if (t.closest("[data-plmapretry]")){ plKill(); delete m.dataset.v; renderPlaces(); return; }
      if (t.closest("[data-plretry]")){ plErr = null; loadPlaces(true); renderPlaces(); return; }
      if ((b = t.closest("[data-plst]"))){ plS.st = b.dataset.plst; plUpd(); return; }
      if ((b = t.closest("[data-plr]"))){ plS.r = b.dataset.plr; plUpd(); return; }
      if ((b = t.closest("[data-plpr]"))){ plS.pr = b.dataset.plpr; plUpd(); return; }
      if (t.closest("[data-plreset]")){ plS.q = ""; plS.st = plS.r = plS.k = plS.pr = plS.tag = "all"; const qi = $("plQ"); if (qi) qi.value = ""; plUpd(); return; }
      if ((b = t.closest("[data-plo]"))){ plSelect(b.dataset.plo, {fly: plS.view === "map", open: true}); return; }
      if ((b = t.closest("[data-plcal]"))){ const d = +b.dataset.plcal; if (!d){ plCalY = new Date().getFullYear(); plCalM = new Date().getMonth(); } else { plCalM += d; if (plCalM < 0){ plCalM = 11; plCalY--; } if (plCalM > 11){ plCalM = 0; plCalY++; } } plDrawCal(); return; }
      if ((b = t.closest("[data-plday]"))){ plDaySheet(b.dataset.plday); return; }
      if (t.closest("[data-plpno]")){ const c = plPlacing && plPlacing.cancel; plStopPlacing(); c && c(); return; }
      if (t.closest("[data-plpskip]")){ const d = plPlacing.done; plStopPlacing(); d(null, null); return; }
      if (t.closest("[data-plpok]")){ const {u, v, done} = plPlacing; plStopPlacing(); done(u, v); return; }
      const side = $("plSide"); if (side && side.contains(t)) plAct(e, side);
    });
    m.addEventListener("input", e => { if (e.target.id === "plQ"){ plS.q = e.target.value; clearTimeout(plWire.t); plWire.t = setTimeout(plUpd, 120); } else plInput(e); });
    m.addEventListener("change", e => { const t = e.target; if (t.id === "plK"){ plS.k = t.value; plUpd(); } else if (t.id === "plSort"){ plS.sort = t.value; plUpd(); } else if (t.id === "plTag"){ plS.tag = t.value; plUpd(); } else plChange(e); });
    m.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("[data-pldn]")){ e.preventDefault(); plAddDish(e.target.dataset.pldn, m); } });
  }
  // ---- 5.4: топы компании и расхождения ----
  function plDrawTop(){
    const el = $("plTop"); if (!el || !PL) return;
    const been = plFiltered().filter(p => !plIsWant(p)), rated = been.filter(p => plN(p.id) > 0);
    const row = (p, val, sub, cls) => `<button type="button" class="pl-tr" data-plo="${esc(p.id)}"><span class="pl-th">${p.photo ? `<img alt="" loading="lazy" src="${esc(plImg(p))}" onerror="this.remove()">` : ""}${plKindI(p.kind)}</span><span class="t"><b>${esc(p.name)}</b><small>${sub}</small></span><span class="pl-sc ${cls || plCls(val)}">${val == null ? "—" : num1(val)}</span></button>`;
    const card = (title, list, note) => `<div class="pl-tc"><h3>${title}</h3>${list.length ? list.join("") : `<p class="pld-hint">${note || "Пока не из чего выбрать — нужны оценки."}</p>`}</div>`;
    const nSub = p => { const n = plN(p.id); return `${plKindL(p.kind)} · ${n} ${plural(n, "оценка", "оценки", "оценок")}${plFew(p.id) ? " · мало" : ""}`; };
    const byCrit = (k, dir = -1, take = 3) => been.map(p => ({p, v: plCritRank(p.id, k), c: plCrit(p.id, k)})).filter(x => x.v != null).sort((a, b) => dir * (a.v - b.v)).slice(0, take)
      .map(x => row(x.p, x.c.avg, `${plKindL(x.p.kind)} · ${x.c.n} ${plural(x.c.n, "оценка", "оценки", "оценок")}${x.c.n < PL_FEW ? " · мало" : ""}`));
    const top = rated.slice().sort((a, b) => plScore(b.id) - plScore(a.id));
    const kinds = PL_KIND.map(([k, l]) => { const best = top.find(p => p.kind === k); return best ? row(best, plScore(best.id), `${l} · ${plN(best.id)} ${plural(plN(best.id), "оценка", "оценки", "оценок")}`) : ""; }).filter(Boolean);
    const backs = been.map(p => ({p, b: plBack(p.id)})).filter(x => x.b && x.b.n >= 2).sort((a, b) => b.b.yes / b.b.n - a.b.yes / a.b.n || b.b.n - a.b.n).slice(0, 3)
      .map(x => row(x.p, null, `вернутся ${x.b.yes} из ${x.b.n}`, x.b.yes / x.b.n >= .6 ? "g" : x.b.yes / x.b.n < .4 ? "r" : "y").replace(">—</span>", `>${Math.round(x.b.yes / x.b.n * 100)}%</span>`));
    const shame = rated.length >= 2 ? rated.slice().sort((a, b) => plScore(a.id) - plScore(b.id)).slice(0, 3).filter(p => plScore(p.id) < 6.5).map(p => row(p, plScore(p.id), nSub(p))) : [];
    const shameIds = new Set(rated.slice().sort((a, b) => plScore(a.id) - plScore(b.id)).slice(0, 3).filter(p => plScore(p.id) < 6.5).map(p => p.id));
    const badSvc = been.map(p => ({p, c: plCrit(p.id, "service")})).filter(x => x.c && x.c.avg < 5 && !shameIds.has(x.p.id)).sort((a, b) => a.c.avg - b.c.avg).slice(0, 2)
      .map(x => row(x.p, x.c.avg, `хамят и тормозят · обслуживание ${num1(x.c.avg)}`));
    // расхождения: где ваши оценки разошлись сильнее всего
    const spread = been.map(p => { const rs = plRates(p.id).map(r => ({u: r.user_id, v: plRAvg(r)})).filter(x => x.v != null).sort((a, b) => b.v - a.v); return rs.length >= 2 ? {p, hi: rs[0], lo: rs[rs.length - 1], d: rs[0].v - rs[rs.length - 1].v} : null; })
      .filter(x => x && x.d >= 1.5).sort((a, b) => b.d - a.d).slice(0, 5);
    const nm = u => u === ME.id ? "ты" : frNick(u);
    el.innerHTML = `<div class="pl-tg">
      ${card(`${ICON.trophy} Лучшие места`, top.slice(0, 5).map(p => row(p, plScore(p.id), nSub(p))))}
      ${card("Лучшие по типам", kinds)}
      ${card("Лучшая кухня", byCrit("taste"))}
      ${card("Лучший алкоголь", byCrit("alco"))}
      ${card("Лучшее обслуживание", byCrit("service"))}
      ${card("Лучшая атмосфера", byCrit("vibe"))}
      ${card("Стоит своих денег", byCrit("value"))}
      ${card("Сюда вернутся", backs, "Нужно хотя бы два ответа «Вернулся бы?»")}
      ${card(`${ICON.skull} Позорная доска`, [...shame, ...badSvc], "Пока никто не опозорился")}
      <div class="pl-tc wide"><h3>Расхождения<small>где вы оценили сильнее всего по-разному</small></h3>${spread.length ? spread.map(x => `<button type="button" class="pl-tr" data-plo="${esc(x.p.id)}"><span class="pl-th">${x.p.photo ? `<img alt="" loading="lazy" src="${esc(plImg(x.p))}" onerror="this.remove()">` : ""}${plKindI(x.p.kind)}</span><span class="t"><b>${esc(x.p.name)}</b><small>${esc(nm(x.hi.u))} — <em class="${plCls(x.hi.v)}">${num1(x.hi.v)}</em>, ${esc(nm(x.lo.u))} — <em class="${plCls(x.lo.v)}">${num1(x.lo.v)}</em></small></span><span class="pl-sc y">±${num1(x.d)}</span></button>`).join("") : `<p class="pld-hint">Пока все сходятся во мнениях. Скучно.</p>`}</div>
    </div>`;
  }
  function plUpd(){ plDrawSide(); if (plS.view === "map") plDrawMarkers(); else if (plS.view === "top") plDrawTop(); else plDrawCal(); }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && plPlacing && !sheets.length){ e.preventDefault(); const c = plPlacing.cancel; plStopPlacing(); c && c(); } });
  window.addEventListener("hashchange", () => { if (route !== "places"){ plStopPlacing(); if (plSheet) plSheet.s.close(); } });
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-plgo]"); if (!b) return; e.preventDefault(); go("place:" + b.dataset.plgo); });

  // ---- окошко в «Активности»: последнее место и оценка ----
  function placesCard(){
    const head = `<h3>${ICON.pin} Заведения${PL ? `<small>${PL.places.length}</small>` : ""}<button class="ev-add" data-go="places" title="Открыть карту заведений" aria-label="Открыть карту заведений">›</button></h3>`;
    if (!PL){ if (!plErr) loadPlaces(); return `<div class="fb-card pl-card" id="plCard">${head}<p class="a-sub" style="margin:0;font-size:13px">${plErr ? (plMissing() ? "Карта заведений заработает после обновления базы." : "Не загрузилось.") : "Загружаю…"}</p></div>`; }
    const been = PL.places.filter(p => !plIsWant(p)), want = PL.places.filter(plIsWant);
    const lastV = PL.visits.filter(v => plById(v.place_id) && String(v.day).slice(0, 10) <= today()).sort((a, b) => String(b.day).localeCompare(String(a.day)) || String(b.created_at).localeCompare(String(a.created_at)))[0];
    const p = lastV && plById(lastV.place_id), s = p ? plScore(p.id) : null, mm = lastV ? plVM(lastV.id) : [];
    const last = p ? `<button class="plc-last" data-plgo="${esc(p.id)}" aria-label="Открыть ${esc(p.name)}">${p.photo ? `<img alt="" loading="lazy" src="${esc(plImg(p))}" onerror="this.remove()">` : `<span class="map"></span>`}<span class="k">Последний поход · ${esc(plKindL(p.kind))}</span><b>${esc(p.name)}</b><small>${esc(plAgo(lastV.day))}${mm.length ? ` · ${mm.length} ${plural(mm.length, "человек", "человека", "человек")}` : ""}</small>${mm.length ? avaStack(mm, 6) : ""}<span class="sc ${plCls(s)}">${s == null ? "без оценки" : num1(s)}</span></button>`
      : `<p class="a-sub" style="margin:0 0 10px;font-size:13px">Отмечайте на карте, где были, и ставьте оценки: вкус, обслуживание, атмосфера, цена/качество, алкоголь.</p>`;
    const wl = want.sort((a, b) => plWants(b.id).length - plWants(a.id).length).slice(0, 3)
      .map(w => { const n = plWants(w.id).length; return `<button class="plc-want" data-plgo="${esc(w.id)}"><i></i><span>${esc(w.name)}</span><small>${n ? `хотят ${n}` : "хотим"}</small></button>`; }).join("");
    return `<div class="fb-card pl-card" id="plCard">${head}
      <div class="plc-stat"><span><b>${been.length}</b> ${plural(been.length, "место", "места", "мест")}</span><span><b>${PL.visits.length}</b> ${plural(PL.visits.length, "поход", "похода", "походов")}</span><span><b>${want.length}</b> хотим</span></div>
      ${last}${wl ? `<div style="margin:-2px 0 10px">${wl}</div>` : ""}<button class="ib blue bd-set" data-go="places">Открыть карту</button></div>`;
  }

