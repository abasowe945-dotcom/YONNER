  // ================= справочники =================
  const KTYPES = {movie:"Фильм", series:"Сериал", anime:"Аниме"};
  const GSTATUS = {playing:"В процессе", endless:"Онлайн-игра", done:"Пройдено", youtube:"Прошёл на YouTube", dropped:"Дроп"};
  const KSTATUS = {playing:{l:"Смотрю",c:"#7cc4ff"}, done:{l:"Досмотрено",c:"#9be15d"}, played:{l:"Смотрел",c:"#c9c9d8"}, paused:{l:"Отложено",c:"#f2d43a"}, dropped:{l:"Брошено",c:"#ff8a86"}};
  const KORDER = ["playing","done","played","paused","dropped"];
  // 2.1: у фильмов только «Просмотрено» и «Отложено», у сериалов и аниме — «Смотрю» и «Брошено» (досмотренные помечаются сами по сериям)
  const isSerT = t => t === "series" || t === "anime";
  const kOpts = t => isSerT(t) ? [["playing","Смотрю"],["done","Просмотрено"],["dropped","Брошено"]] : [["done","Просмотрено"],["paused","Отложено"]];
  const kNorm = it => { const s = it.status; if (isSerT(it.type)) return s === "dropped" ? "dropped" : s === "done" ? "done" : "playing"; return s === "done" || s === "played" ? "done" : "paused"; };
  const KCOL = {playing:"#7cc4ff", done:"#9be15d", paused:"#f2d43a", dropped:"#ff8a86"};
  const kLab = it => { const n = kNorm(it); return {l: n === "done" ? (isSerT(it.type) ? "Досмотрено" : "Просмотрено") : n === "paused" ? "Отложено" : n === "dropped" ? "Брошено" : "Смотрю", c: KCOL[n]}; };
  const TIERS = [["S","#ff5f57"],["A","#ff9f0a"],["B","#ffd60a"],["C","#30d158"],["D","#64d2ff"]];
  const TAB_ORDER = ["home","games","kino","read","slop","people","events","calendar","more"];
  const ROUTES = {
    home:{w:"wApple",theme:"cal",tab:"home"}, read:{w:"wApple",theme:"cal",tab:"read"}, watch:{w:"wApple",theme:"cal",tab:"people"}, watchcal:{w:"wApple",theme:"cal",tab:"people"},
    games:{w:"wGames",theme:"games",tab:"games"}, "games-future":{w:"wGames",theme:"games",tab:"games"},
    kino:{w:"wKino",theme:"kino",tab:"kino"}, "kino-future":{w:"wKino",theme:"kino",tab:"kino"},
    calendar:{w:"wApple",theme:"cal",tab:"calendar"}, events:{w:"wApple",theme:"cal",tab:"events"},
    slop:{w:"wSlop",theme:"games",tab:"slop"},
    places:{w:"wPlaces",theme:"games",tab:"people"},
    more:{w:"wApple",theme:"cal",tab:"more"}, vacation:{w:"wApple",theme:"cal",tab:"more"}, recap:{w:"wApple",theme:"cal",tab:"more"}, drops:{w:"wApple",theme:"cal",tab:"more"}, money:{w:"wApple",theme:"cal",tab:"more"}, ach:{w:"wApple",theme:"cal",tab:"more"}, patch:{w:"wApple",theme:"cal",tab:"more"}, people:{w:"wApple",theme:"cal",tab:"people"}, user:{w:"wApple",theme:"cal",tab:"people"}, event:{w:"wApple",theme:"cal",tab:"events"}
  };
  const I = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const ICON = {
    games:I('<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.96 3.43l-.73 5.1A2.6 2.6 0 0 0 4.58 16.5c.84 0 1.63-.42 2.1-1.12L8 13.5h8l1.32 1.88c.47.7 1.26 1.12 2.1 1.12a2.6 2.6 0 0 0 2.57-2.97l-.73-5.1A4 4 0 0 0 17.3 5Z"/>'),
    kino:I('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>'),
    soon:I('<path d="M6 2h12M6 22h12"/><path d="M7 2c0 5 10 6 10 10S7 17 7 22M17 2c0 5-10 6-10 10s10 5 10 10"/>'),
    calendar:I('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    people:I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.7.1 4.6 1.8 5 4.9"/>'),
    more:I('<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>'),
    edit:I('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    img:I('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
    x:I('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.6"'),
    dice:I('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="16" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="8" cy="16" r="1.3" fill="currentColor"/><circle cx="16" cy="16" r="1.3" fill="currentColor"/>'),
    tiers:I('<path d="M4 6h16M4 12h11M4 18h6"/>'),
    trophy:I('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    scroll:I('<path d="M8 3h11a2 2 0 0 1 2 2v2h-4"/><path d="M17 7v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2h9"/><path d="M8 3a2 2 0 0 0-2 2v12M10 8h4M10 12h4"/>'),
    skull:I('<path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V20h10v-3.4c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.6" fill="currentColor"/><circle cx="15" cy="11" r="1.6" fill="currentColor"/><path d="M10 20v-2M14 20v-2"/>'),
    plus:I('<path d="M12 5v14M5 12h14"/>'),
    sword:I('<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/>'),
    coin:I('<circle cx="12" cy="12" r="9"/><path d="M10 7h3.5a2.5 2.5 0 0 1 0 5H10V7Zm0 5v5M8.5 14.5h5"/>'),
    star:I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>'),
    palette:I('<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-7.8-9-7.8Z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/>'),
    wall:I('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/>'),
    pad:I('<path d="M7.5 11v3M6 12.5h3M15 12h.01M17.5 13.5h.01"/><path d="M8 7h8a5 5 0 0 1 5 5v1a4 4 0 0 1-7 2.6l-.6-.6h-2.8l-.6.6A4 4 0 0 1 3 13v-1a5 5 0 0 1 5-5Z"/>', 'stroke-width="2.2"'),
    film:I('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 3v18M16 3v18M4 8h4M16 8h4M4 16h4M16 16h4M4 12h16"/>', 'stroke-width="2.2"'),
    clock:I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    medal:'<svg viewBox="0 0 34 40"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#f5c542"/><stop offset="1" stop-color="#b8860b"/></linearGradient></defs><path d="M9 0h7l-3 15H6Z" fill="#d93a3a"/><path d="M25 0h-7l3 15h7Z" fill="#2f6fd6"/><circle cx="17" cy="25" r="12" fill="url(#mg)" stroke="#8a6508" stroke-width="1.2"/><circle cx="17" cy="25" r="8.6" fill="none" stroke="#fff6c8" stroke-opacity=".7" stroke-width="1"/><path d="m17 19 1.8 3.7 4 .6-2.9 2.8.7 4L17 28.2l-3.6 1.9.7-4-2.9-2.8 4-.6Z" fill="#fff6c8"/></svg>',
    blood:'<svg viewBox="0 0 34 40"><g fill="none" stroke="#ff2d20" stroke-width="2.6" stroke-linecap="round"><circle cx="17" cy="15" r="11"/><circle cx="17" cy="15" r="4.5"/><path d="M17 1v6M17 23v6M3 15h6M25 15h6"/></g><circle cx="17" cy="15" r="1.6" fill="#ff2d20"/><path class="drip" d="M12.5 24c0 0-1.4 3-1.4 4.6a1.4 1.4 0 0 0 2.8 0c0-1.6-1.4-4.6-1.4-4.6Z" fill="#c4100a"/><path class="drip d2" d="M20 25c0 0-1.8 4.2-1.8 6.4a1.8 1.8 0 0 0 3.6 0c0-2.2-1.8-6.4-1.8-6.4Z" fill="#c4100a"/><path class="drip d3" d="M24.5 21.5c0 0-1.2 2.6-1.2 3.9a1.2 1.2 0 0 0 2.4 0c0-1.3-1.2-3.9-1.2-3.9Z" fill="#c4100a"/></svg>',
    target:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#ff3b30" stroke-width="2.4"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#ff3b30" stroke-width="2.4"/><circle cx="12" cy="12" r="2.2" fill="#ff3b30"/></svg>',
    search:I('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/>'),
    sun:I('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>'),
    moon:I('<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"/>'),
    down:I('<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'),
    up:I('<path d="M12 20V9M7 13l5-5 5 5M5 4h14"/>'),
    cake:I('<path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.2 1 2.5 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0M12 12V8M12 5.5c-.8-.8-.8-1.8 0-3 .8 1.2.8 2.2 0 3Z"/>'),
    key:I('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M18.5 4.5 21 7"/>'),
    pin:I('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    send:I('<path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4 18-7Z"/>'),
    link:I('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    party:I('<path d="M4 20 9.5 6.5l8 8Z"/><path d="M13 4.5c.5 1.2.2 2.2-1 3M17 8c1.2-.6 2.4-.4 3.2.6M15.5 3.5l.5 1M20.5 12l-1 .3M19 3.5 18 5.5"/>'),
    sound:I('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>')
  };
  const SRC_ICON = {
    steam:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor"><path d="M11.2 19.9 17.4 14.6" stroke-width="4.2" stroke-linecap="round"/><circle cx="21.2" cy="11.2" r="6.4" stroke-width="2.6"/><circle cx="21.2" cy="11.2" r="2.5" fill="currentColor" stroke="none"/><circle cx="9.4" cy="21.6" r="3.9" stroke-width="2.6"/></svg>',
    pirate:'<svg viewBox="0 0 32 32"><path fill="currentColor" d="M2 17.5c2.6-1 4.4-6.5 14-6.5s11.4 5.5 14 6.5c-2.4 2.6-6.8 4-14 4s-11.6-1.4-14-4Z"/><path fill="currentColor" d="M7 15.2C8.4 9.3 11.6 6 16 6s7.6 3.3 9 9.2C22.6 13.6 19.6 13 16 13s-6.6.6-9 2.2Z"/><circle cx="16" cy="13.6" r="3.2" fill="#0b0b0c"/><rect x="14.3" y="16" width="3.4" height="2.4" rx=".6" fill="#0b0b0c"/><circle cx="14.9" cy="13.4" r=".9" fill="currentColor"/><circle cx="17.1" cy="13.4" r=".9" fill="currentColor"/><path d="M11.5 19.6l9-3.2M11.5 16.4l9 3.2" stroke="#0b0b0c" stroke-width="1.3" stroke-linecap="round"/></svg>'
  };
  const SRC_NAME = {steam:"Лицензия", pirate:"Пиратка"};

  // ================= состояние =================
  let items = [], route = "games", prevRoute = null;
  let gF = "", gSrc = "", gSort = "recent", kF = "", kT = "", kSort = "watched", soF = "", drF = "";
  let canWrite = false, db = null, assets = null, pasteTarget = null, openId = null, viewTheme = "games", tierKind = null;
  let calY = new Date().getFullYear(), calM = new Date().getMonth(), recY = new Date().getFullYear();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  // ================= журнал ошибок: всё неожиданное уходит в client_errors, владелец видит в «Ещё» =================
  const NEXUS_VER = ((document.currentScript && /[?&]v=([^&]+)/.exec(document.currentScript.src)) || [])[1] || "?";
  const ERRQ = [], errSeen = new Set(); let errSent = 0;
  function logErr(where, e){
    try {
      const msg = String((e && (e.message || e.error_description || e.msg || e.details)) || e || "без текста").slice(0, 500);
      if (/ResizeObserver loop|^Script error\.?$|AbortError|aborted|NotAllowedError/i.test(msg)) return;
      const key = where + "|" + msg; if (errSeen.has(key) || errSent + ERRQ.length >= 30) return; errSeen.add(key);
      console.warn("[NEXUS]", where, e);
      ERRQ.push({place: String(where).slice(0, 120), msg, stack: String((e && e.stack) || "").slice(0, 2000), url: String(location.hash).slice(0, 200), ua: navigator.userAgent.slice(0, 300), ver: NEXUS_VER});
      flushErr();
    } catch(_){ /* ожидаемо: журнал сам не должен ломать сайт */ }
  }
  async function flushErr(){
    let sb = null, me = null; try { sb = SB; me = ME; } catch(_){ /* ожидаемо: база ещё не подключена */ }
    if (!sb || !me || !ERRQ.length || flushErr.busy) return;
    flushErr.busy = true; const rows = ERRQ.splice(0); errSent += rows.length;
    try { await sb.from("client_errors").insert(rows); } catch(_){ /* ожидаемо: нет сети — ошибка останется в консоли */ }
    flushErr.busy = false;
  }
  // Supabase отдаёт не больше 1000 строк за раз — всё, что может вырасти, грузим пачками.
  // mk() каждый раз строит новый запрос; keys — уникальный ключ таблицы, чтобы пачки не перемешались.
  async function fetchAll(mk, keys = [], page = 1000){
    const out = [];
    for (let from = 0; from < 200000; from += page){
      let q = mk(); keys.forEach(k => { q = q.order(k, {ascending: true}); });
      const r = await q.range(from, from + page - 1);
      if (r.error) return {data: null, error: r.error};
      const d = r.data || []; out.push(...d); if (d.length < page) break;
    }
    return {data: out, error: null};
  }
  // realtime: вписываем пришедшую строку прямо в загруженный список, вместо того чтобы перекачивать всю таблицу.
  // Возвращает false, если вписать нельзя (список ещё не загружен или в событии нет ключа) — тогда зовём полную загрузку.
  function rtPatch(arr, p, keys, {norm, front = false} = {}){
    if (!Array.isArray(arr) || !p) return false;
    const pick = p.eventType === "DELETE" ? p.old : p.new;
    if (!pick || keys.some(k => pick[k] === undefined || pick[k] === null)) return false;
    const i = arr.findIndex(r => keys.every(k => r[k] === pick[k]));
    if (p.eventType === "DELETE"){ if (i >= 0) arr.splice(i, 1); return true; }
    const row = norm ? norm(p.new) : p.new;
    if (i >= 0) arr[i] = {...arr[i], ...row}; else if (front) arr.unshift(row); else arr.push(row);
    return true;
  }
  // откладываем перерисовку, чтобы пачка событий подряд дала одну перерисовку
  const rtLater = (key, fn, ms = 250) => { clearTimeout(rtLater[key]); rtLater[key] = setTimeout(fn, ms); };
  window.addEventListener("error", ev => logErr("window", ev.error || ev.message));
  window.addEventListener("unhandledrejection", ev => logErr("promise", ev.reason));
  const blobUrl = id => publicUrl(id);
  const num1 = n => String(Math.round(n * 10) / 10).replace(".", ",");
  const now = () => new Date().toISOString();

  // ================= помощники по записям =================
  const isGame = it => it.type === "game";
  const isFuture = it => it.status === "future" || it.status === "wish";
  const isSoon = it => it.status === "soon";
  const inLib = it => !isFuture(it) && !isSoon(it);
  const byOrd = (a, b) => (a.ord ?? 1e9) - (b.ord ?? 1e9) || (b._upd || b.updatedAt || "").localeCompare(a._upd || a.updatedAt || "");
  const relOn = it => isSoon(it) || (isFuture(it) && !!it.releaseDate); // релиз в календаре: «Жду» или «На будущее» с датой выхода
  const ofKind = kind => it => kind === "games" ? isGame(it) : !isGame(it);
  const gStatus = s => GSTATUS[s] ? s : (s === "played" ? "done" : s === "paused" ? "dropped" : "playing");
  const kSt = s => KSTATUS[s] || KSTATUS.played;
  const srcOf = it => it.source === "pirate" ? "pirate" : it.source === "steam" ? "steam" : null;
  const rateCls = r => r >= 7.5 ? "green" : r >= 5 ? "yellow" : "red";
  const genres = it => (it.genre || "").split(",").map(s => s.trim()).filter(Boolean);
  const pad = n => String(n).padStart(2, "0");
  const localDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const today = () => localDate(new Date());
  const parseD = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
  const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return localDate(d); };
  const daysTo = s => Math.round((parseD(s) - parseD(today())) / 86400000);
  const itemDate = it => relOn(it) ? (it.releaseDate || null) : isFuture(it) || it.noDate ? null : isSoon(it) ? (it.releaseDate || null) : (!isGame(it) && it.status !== "done" && it.status !== "played") ? null : (it.date || (it.createdAt ? localDate(new Date(it.createdAt)) : null));
  const fmtDate = s => s ? parseD(s).toLocaleDateString("ru-RU", {day:"numeric", month:"long", year:"numeric"}) : null;
  const plural = (n, a, b, c) => { const m = Math.abs(n) % 100, k = m % 10; return m > 10 && m < 20 ? c : k > 1 && k < 5 ? b : k === 1 ? a : c; };
  const kinoDateLabel = () => "Посмотрел";
  const hasActive = it => !!(it.contract && it.contract.state === "active");
  const activeContract = () => items.find(i => isGame(i) && hasActive(i));
  const cHours = c => (c && c.sessions || []).reduce((s, x) => s + (+x.h || 0), 0);
  const review = r => r >= 9.5 ? "Крайне положительная" : r >= 8 ? "Очень положительная" : r >= 7 ? "В основном положительная" : r >= 5 ? "Смешанная" : r >= 3 ? "В основном отрицательная" : "Крайне отрицательная";
  const sorter = key => ({
    recent:(a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""),
    rating:(a,b)=>(b.rating??-1)-(a.rating??-1),
    year:(a,b)=>(b.year||0)-(a.year||0),
    title:(a,b)=>(a.title||"").localeCompare(b.title||"","ru"),
    watched:(a,b)=>String(b.date||"").localeCompare(String(a.date||"")) || String(b.createdAt||"").localeCompare(String(a.createdAt||"")),
    mine:(a,b)=>byOrd(a,b)
  })[key];
  const sortOpts = cur => [["mine","Мой порядок"],["recent","Недавние"],["rating","По оценке"],["year","По дате выхода"],["title","По названию"]].map(([v,l]) => `<option value="${v}"${v===cur?" selected":""}>${l}</option>`).join("");
  const write = (id, patch) => db.doc("items/" + id).update({...patch, updatedAt: now()});

  // ================= постер =================
  const posStyle = p => { p = p || {}; const x = p.x ?? 50, y = p.y ?? 50, s = p.s ?? 1; return `object-position:${x}% ${y}%;transform:scale(${s});transform-origin:${x}% ${y}%`; };
  // 3.8: ссылка на страницу, откуда добавили
  const LINK_I2 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  const srcLink = it => { if (!it) return null; const u = it.srcUrl || it.url; if (u && /^https?:\/\//i.test(u)) return u;
    if (it.steamId && isGame(it)) return `https://store.steampowered.com/app/${encodeURIComponent(it.steamId)}/`;
    if (it.kpId && !isGame(it)) return `https://www.kinopoisk.ru/film/${encodeURIComponent(it.kpId)}/`; return null; };
  const linkName = u => { try { const hst = new URL(u).hostname.replace(/^www\./, ""); return /steam/.test(hst) ? "Steam" : /kinopoisk/.test(hst) ? "Кинопоиск" : /myshows/.test(hst) ? "MyShows" : /mangalib|lib\.social/.test(hst) ? "MangaLib" : /remanga/.test(hst) ? "ReManga" : hst; } catch(_){ return "сайт"; } };
  const linkBadge = it => { const u = srcLink(it); return u ? `<span class="ln" role="link" tabindex="0" data-href="${esc(u)}" title="Открыть на ${esc(linkName(u))}" aria-label="Открыть на ${esc(linkName(u))}">${LINK_I2}</span>` : ""; };
  ["pointerdown", "mousedown", "touchstart"].forEach(t => document.addEventListener(t, e => { if (e.target.closest && e.target.closest(".ln[data-href]")) e.stopPropagation(); }, {capture: true, passive: true}));
  document.addEventListener("click", e => { const l = e.target.closest && e.target.closest(".ln[data-href]"); if (!l) return; e.preventDefault(); e.stopPropagation(); window.open(l.dataset.href, "_blank", "noopener"); }, true);
  document.addEventListener("keydown", e => { const l = e.target.closest && e.target.closest(".ln[data-href]"); if (l && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); e.stopPropagation(); window.open(l.dataset.href, "_blank", "noopener"); } }, true);
  function posterHTML(it, o = {}){
    const img = it.cover ? `<img alt="" src="${blobUrl(it.cover)}" style="${posStyle(it.coverPos)}"${o.eager ? "" : ' loading="lazy" decoding="async"'} onerror="this.remove()">` : ""; // 5.4.1: лениво, иначе большая полка грузит сотни постеров разом
    const ph = it.cover ? "" : `<div class="ph">${esc(it.title)}</div>`;
    let b = "";
    const gs0 = isGame(it) && inLib(it) ? gStatus(it.status) : null;
    if (gs0 === "done" && o.badge !== false) b += `<span class="medal" title="Пройдено">${ICON.medal}</span>`;
    if (gs0 === "dropped" && o.badge !== false) b += `<span class="blood" title="Дроп">${ICON.blood}</span>`;
    if (gs0 === "endless" && o.badge !== false) b += `<span class="medal inf" title="Онлайн-игра">∞</span>`;
    if (!isGame(it) && it.gp && o.badge !== false) b += `<span class="gp-st" title="Guilty pleasure — стыдно признаться, но кайфую">Guilty<br>pleasure</span>`;
    if (o.rate !== false && typeof it.rating === "number") b += `<span class="rb ${rateCls(it.rating)}${isGame(it) ? " bl" : ""}">${num1(it.rating)}</span>`;
    if (isGame(it) && hasActive(it) && o.tgt !== false) b += `<span class="tgt" title="Активный контракт">${ICON.target}</span>`;
    const s = isGame(it) && o.src ? srcOf(it) : null;
    if (s) b += `<span class="src-chip ${s}" title="${SRC_NAME[s]}">${SRC_ICON[s]}</span>`;
    if (o.link !== false && !o.editable) b += linkBadge(it);
    const ed = o.editable ? ` editable" tabindex="0" role="button" aria-label="Изменить обложку` : "";
    const hint = o.editable ? `<span class="edit-hint">${it.cover ? "Изменить обложку" : "Добавить обложку"}</span>` : "";
    return `<div class="poster${ed}"${o.id ? ` id="${o.id}"` : ""}>${ph}${img}${b}${hint}</div>`;
  }
  function gCard(it){
    if (isFuture(it)) return `<button class="s-card" data-fut="${esc(it.id)}">${posterHTML(it, {rate:false})}<div class="t">${esc(it.title)}</div><div class="m genre-l">${esc(genres(it).slice(0,2).join(", ") || "жанр не указан")}</div></button>`;
    const s = gStatus(it.status);
    const sd = staleDays(it);
    return `<button class="s-card st-${s}${sd ? " stale" : ""}" data-id="${esc(it.id)}">${posterHTML(it, {src:true})}<div class="t">${esc(it.title)}</div><div class="m"><span class="s-flag ${s}">${GSTATUS[s]}</span>${sd ? `<span class="stale-c">застой ${sd} дн.</span>` : ""}${(() => { const t = timerInfo(it); return t ? `<span class="tmr${t.running ? " run" : ""}">${ICON.clock}${t.days} дн.</span>` : ""; })()}</div></button>`;
  }
  function kCard(it, o = {}){
    if (isFuture(it)) return `<button class="k-card" data-fut="${esc(it.id)}">${posterHTML(it, {rate:false})}<div class="t">${esc(it.title)}</div><div class="m">${esc([KTYPES[it.type], genres(it)[0]].filter(Boolean).join(" · "))}</div></button>`;
    const st = kLab(it), bits = [it.year, KTYPES[it.type]].filter(Boolean).join(" · ");
    const et = isSeries(it) ? +it.epTotal || 0 : 0, ew = +it.epWatched || 0;
    const ep = et ? `<span class="epbar"><i style="width:${Math.min(100, ew / et * 100)}%"></i></span>${canWrite && it.status === "playing" ? `<span class="ep1" data-ep1="${esc(it.id)}" role="button" aria-label="+1 серия">+1</span>` : ""}` : "";
    const wd = it.date && !it.noDate && ["done", "played"].includes(it.status) ? it.date : null;
    return `<button class="k-card${o.i != null && o.i >= 24 ? " na" : ""}" data-id="${esc(it.id)}"${o.i != null && o.i < 24 ? ` style="--i:${o.i}"` : ""}><div class="kc-p dvd"><span class="dvd-disc" aria-hidden="true"></span><span class="dvd-case">${posterHTML(it)}<span class="dvd-band">DVD</span>${wd ? `<span class="dvd-date" title="Дата просмотра">${fmtShort(wd)}</span>` : ""}</span>${ep}</div><div class="t">${esc(it.title)}</div><div class="m"><span class="k-dot" style="background:${st.c}"></span>${esc(st.l)}${et ? ` · ${ew}/${et} сер.` : ""}${bits ? " · " + esc(bits) : ""}</div></button>`;
  }

  // ================= нижняя панель =================
  function renderTabbar(){
    // 6.0: на ПК — меню слева с группами, на телефоне — пять вкладок снизу
    const tab = (ROUTES[route] || ROUTES.games).tab, ac = activeContract();
    const invN = typeof myInvites === "function" && EV ? myInvites().length : 0;
    const curD = FV ? "people" : route === "places" ? "places" : tab;
    const curM = FV ? "people" : ["games", "kino", "read"].includes(tab) ? "shelf" : ["places", "events"].includes(curD) ? "people" : tab === "calendar" ? "more" : tab;
    const mob = matchMedia("(max-width:900px)").matches, cur = mob ? curM : curD;
    const SHELF_I = I('<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="16" rx="1"/><path d="m17 5 3.5 14.5"/>');
    const DOT = {games: "var(--c-game,#34d1bf)", kino: "var(--c-kino,#a78bfa)", read: "#f5b544"};
    const t = (k, l, cls = "", href = k, ic = ICON[k]) => `<a class="tab ${cls}" href="#${href}" data-tab="${k}" ${cur === k ? 'aria-current="page"' : ""}>${ic}<span>${l}</span>${DOT[k] ? `<i class="sb-dot" style="background:${DOT[k]}"></i>` : ""}${k === "games" && ac ? '<i class="dot"></i>' : ""}${k === "people" && invN ? `<i class="dot n">${invN}</i>` : ""}${k === "events" && invN ? `<i class="dot n">${invN}</i>` : ""}</a>`;
    const tb = $("tabbar"), lens0 = tb.querySelector(".tb-lens"), x0 = lens0 ? lens0.style.transform : "";
    tb.innerHTML = `<i class="tb-lens now" style="transform:${x0}"></i><a class="sb-logo" href="#home">NEXUS</a>` + t("home", "Главная") +
      `<div class="sb-grp">Полка</div>` + t("games", "Игры", "d") + t("kino", "Кино и сериалы", "d") + t("read", "Читалка", "d") + t("shelf", "Полка", "m", "games", SHELF_I) +
      `<div class="sb-grp">Вместе</div>` + t("slop", "СЛОП") + t("people", "Активность") + t("events", "Мероприятия", "d", "events", ICON.party) + t("places", "Заведения", "d", "places", ICON.pin) + t("calendar", "Календарь", "d") +
      `<div class="sb-sp"></div>` + t("more", "Ещё");
    const ms = $("mShelf"); if (ms){ const k = ["games", "kino", "read"].includes(tab) ? tab : ""; ms.innerHTML = [["games", "Игры"], ["kino", "Кино"], ["read", "Читалка"]].map(([h, l]) => `<a href="#${h}"${k === h ? ' aria-current="page"' : ""}>${l}</a>`).join(""); }
    placeLens();
  }
  matchMedia("(max-width:900px)").addEventListener("change", () => renderTabbar());
  function placeLens(){
    const tb = $("tabbar"), lens = tb.querySelector(".tb-lens"), a = tb.querySelector('[aria-current="page"]'); if (!lens) return;
    if (!a){ lens.style.opacity = 0; return; }
    lens.style.opacity = 1;
    void lens.offsetWidth; lens.classList.remove("now");
    lens.style.width = a.offsetWidth + "px"; lens.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  addEventListener("resize", () => { const l = $("tabbar").querySelector(".tb-lens"); if (l){ l.classList.add("now"); placeLens(); } });
  $("tabbar").addEventListener("click", e => { const t = e.target.closest(".tab"); if (!t) return; t.classList.remove("bounce"); void t.offsetWidth; t.classList.add("bounce"); });

  // ================= цена, таймер, релизы, колесо оценки =================
  const KZT_PER_RUB = 5.46; // официальный курс Нацбанка РК на 7 ноября 2026
  const fmtRub = n => Math.round(n).toLocaleString("ru-RU") + " ₽";
  const priceText = it => it.priceFree ? "Бесплатно" : (typeof it.priceRub === "number" ? fmtRub(it.priceRub) : (it.price || null));
  function timerInfo(it){
    if (!isGame(it) || !inLib(it) || !it.createdAt || !it.date) return null;
    const created = localDate(new Date(it.createdAt));
    if (it.date < created) return null; // начал раньше, чем добавил: старая игра, таймер не считаем
    const s = gStatus(it.status), running = s === "playing" || s === "endless";
    if (!running && !it.finishedAt) return null;
    const end = running ? today() : it.finishedAt;
    const days = Math.max(0, Math.round((parseD(end) - parseD(it.date)) / 86400000));
    return {days, running, status: s};
  }
  const MONTHS_NOM = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  const MONTHS_PREP = ["январе","феврале","марте","апреле","мае","июне","июле","августе","сентябре","октябре","ноябре","декабре"];
  // «16 мая. 2024», «26 августа 2019», «16.05.2024», «May 16, 2024», «декабрь 2026», «Q4 2026»
  function toISO(str){
    if (!str) return null; const t = String(str).toLowerCase().replace(/ /g, " ").trim();
    let m = t.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return {d: `${m[1]}-${m[2]}-${m[3]}`, prec: "day"};
    m = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); if (m) return {d: `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`, prec: "day"};
    const RU = ["янв","фев","мар","апр","ма","июн","июл","авг","сен","окт","ноя","дек"], EN = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const mi = w => { if (!w) return -1; let i = EN.findIndex(x => w.startsWith(x)); if (i >= 0) return i; return RU.findIndex(x => w.startsWith(x)); };
    m = t.match(/(\d{1,2})\s+([a-zа-яё]+)\.?,?\s+(\d{4})/); if (m && mi(m[2]) >= 0) return {d: `${m[3]}-${pad(mi(m[2])+1)}-${pad(+m[1])}`, prec: "day"};
    m = t.match(/([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/); if (m && mi(m[1]) >= 0) return {d: `${m[3]}-${pad(mi(m[1])+1)}-${pad(+m[2])}`, prec: "day"};
    m = t.match(/(?:q|кв\.?\s*|квартал\s*)([1-4])\s*(?:квартал\s*)?(\d{4})/) || t.match(/([1-4])\s*(?:-?й\s*)?квартал\S*\s*(\d{4})/);
    if (m) return {d: `${m[2]}-${pad((+m[1]-1)*3+1)}-01`, prec: "quarter"};
    m = t.match(/([a-zа-яё]+)\.?\s+(\d{4})/); if (m && mi(m[1]) >= 0) return {d: `${m[2]}-${pad(mi(m[1])+1)}-01`, prec: "month"};
    m = t.match(/\b((?:19|20)\d{2})\b/); if (m) return {d: `${m[1]}-01-01`, prec: "year"};
    return null;
  }
  const relPrec = it => ["year","quarter","month"].includes(it.releasePrec) ? it.releasePrec : "day";
  const isMonthRel = it => relPrec(it) !== "day";
  const relQ = dt => Math.floor(dt.getMonth() / 3) + 1;
  function relLabel(it){
    const dt = parseD(it.releaseDate), p = relPrec(it);
    return p === "year" ? `${dt.getFullYear()} год` : p === "quarter" ? `Q${relQ(dt)} ${dt.getFullYear()}` : p === "month" ? `${MONTHS_NOM[dt.getMonth()]} ${dt.getFullYear()}` : fmtDate(it.releaseDate);
  }
  const relShort = it => { const dt = parseD(it.releaseDate), p = relPrec(it);
    return p === "year" ? String(dt.getFullYear()) : p === "quarter" ? `Q${relQ(dt)}` : p === "month" ? MONTHS_NOM[dt.getMonth()].slice(0,3) : "РЕЛИЗ"; };
  function relCount(it){
    const d = daysTo(it.releaseDate), dt = parseD(it.releaseDate), now = new Date(), p = relPrec(it);
    const dd = `${d} ${plural(d,"день","дня","дней")}`;
    if (p !== "day"){
      const inYear = dt.getFullYear() === now.getFullYear();
      const inside = p === "year" ? inYear : p === "quarter" ? inYear && relQ(dt) === relQ(now) : inYear && dt.getMonth() === now.getMonth();
      const where = p === "year" ? `в ${dt.getFullYear()}` : p === "quarter" ? `в Q${relQ(dt)} ${dt.getFullYear()}` : `в ${MONTHS_PREP[dt.getMonth()]}`;
      if (inside) return {t: p === "year" ? "в этом году" : p === "quarter" ? "в этом квартале" : "в этом месяце", now: true, big: "~", small: where};
      if (d < 0) return {t: "уже должно выйти", now: true, big: "Вышло?", small: relLabel(it)};
      return {t: `${where} · ≈ ${d} дн.`, big: "≈" + d, small: `${plural(d,"день","дня","дней")}, ${where}`};
    }
    if (d < 0) return {t: "уже вышло", now: true, big: "Вышло", small: `${-d} ${plural(-d,"день","дня","дней")} назад`};
    if (d === 0) return {t: "сегодня", now: true, big: "Сегодня", small: "релиз"};
    return {t: `через ${dd}`, big: d, small: `${plural(d,"день","дня","дней")} до релиза`};
  }
  function releasesPanel(kind){
    if (ME) loadFriends();
    const groups = new Map();
    items.filter(ofKind(kind)).filter(i => relOn(i) && i.releaseDate).forEach(i => groups.set(frKey(i), {it: i, mine: true, uids: [ME ? ME.id : ""]}));
    (FR ? FR.items : []).filter(i => ME && i.uid !== ME.id && ofKind(kind)(i) && relOn(i) && i.releaseDate).forEach(i => {
      const g = groups.get(frKey(i)); if (g){ if (!g.uids.includes(i.uid)) g.uids.push(i.uid); } else groups.set(frKey(i), {it: i, mine: false, uids: [i.uid]}); });
    const list = [...groups.values()].sort((a,b) => a.it.releaseDate.localeCompare(b.it.releaseDate));
    if (!list.length && !canWrite) return "";
    const MON = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    const card = gr => { const it = gr.it, mine = gr.mine, d = daysTo(it.releaseDate), dt = parseD(it.releaseDate), rc = relCount(it);
      const names = gr.uids.map(u => u === (ME && ME.id) ? "ты" : frNick(u));
      const wait = ME && FR && FR.profiles.length > 1 ? `<span class="wait">${avaStack(gr.uids)}<span class="n">${gr.uids.length > 1 ? "ждут" : "ждёт"} ${esc(names.join(", "))}</span></span>` : "";
      const pp = relPrec(it), ddIn = pp === "day" ? `<small>${MON[dt.getMonth()]}</small><b>${dt.getDate()}</b>` : pp === "month" ? `<small>${dt.getFullYear()}</small><b style="font-size:17px;text-transform:uppercase">${MON[dt.getMonth()]}</b>`
        : pp === "quarter" ? `<small>${dt.getFullYear()}</small><b style="font-size:20px">Q${relQ(dt)}</b>` : `<small>год</small><b style="font-size:17px">${dt.getFullYear()}</b>`;
      const hot = pp === "day" && d >= 0 && d <= 3;
      return `<button class="rel${mine ? "" : " fr-rel"}${hot ? " hot" : ""}" ${mine ? `data-soon="${esc(it.id)}"` : `data-fi="${esc(it.uid + "/" + it.id)}"`}><span class="dd${canWrite && mine ? " editable" : ""}" ${canWrite && mine ? `data-reldate="${esc(it.id)}" title="Поменять дату"` : ""}>${ddIn}</span>${posterHTML(it, {rate:false, tgt:false, badge:false})}
        <span style="min-width:0">${hot ? `<span class="hot-b">${d === 0 ? "ВЫХОДИТ СЕГОДНЯ" : d === 1 ? "ВЫХОДИТ ЗАВТРА" : `ОСТАЛОСЬ ${d} ДНЯ`}</span>` : ""}<h4>${esc(it.title)}</h4><div class="g">${esc([kind === "kino" ? KTYPES[it.type] : null, it.genre, dt.getFullYear() !== new Date().getFullYear() ? dt.getFullYear() : null].filter(Boolean).join(" · ") || "дата выхода " + fmtDate(it.releaseDate))}</div>
        <span class="cd${rc.now ? " now" : ""}">${rc.t}</span>${wait}<span class="rel-more" role="button" data-relmore="${esc(mine ? it.id : it.uid + "/" + it.id)}">Подробнее</span></span></button>`; };
    return `<div class="rel-box"><div class="rel-h"><h3>Календарь выходов</h3><small>${list.length ? `${list.length} в ожидании${FR && FR.profiles.length > 1 ? " · твои и друзей" : ""}` : ""}</small>${list.length > 1 ? `<span class="rel-hint">· зажми и крути</span>` : ""}<span style="flex:1"></span>
      ${canWrite ? `<button class="${kind === "games" ? "s-btn dark" : "k-btn sm"}" data-addsoon="${kind}" style="padding:7px 12px;font-size:13px">${ICON.plus}Ждать релиз</button>` : ""}</div>
      ${list.length ? `<div class="rel-list carou" data-carou="1">${list.map(card).join("")}</div>` : `<div class="rel-empty">Добавь ${kind === "games" ? "игру" : "фильм или сериал"} с датой выхода, и тут пойдёт обратный отсчёт.</div>`}</div>`;
  }
  const WHEEL_VALS = [null, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  function wheelHTML(id, v){
    return `<div class="rw-wrap"><div class="rw" id="${id}" data-v="${v ?? ""}"><div class="rw-track"><span class="rw-pad"></span>${WHEEL_VALS.map((x,i) => `<span class="rw-i${x != null && x % 1 ? " half" : ""}" data-i="${i}">${x == null ? "—" : num1(x)}</span>`).join("")}<span class="rw-pad"></span></div><div class="rw-mark"></div></div>
      <div class="rw-out" id="${id}Out"></div></div>`;
  }
  function wireWheel(id, onChange){
    const box = $(id), tr = box.querySelector(".rw-track"), its = [...tr.querySelectorAll(".rw-i")], mark = box.querySelector(".rw-mark"), out = $(id + "Out");
    const W = 60; let cur = -1, ready = false, tmr = 0;
    let lastT = 0;
    const show = i => { if (i === cur) return; cur = i;
      if (ready){ const tn = performance.now(); SND.tick(Math.min(1, 70 / Math.max(16, tn - lastT))); lastT = tn; } const v = WHEEL_VALS[i], c = v == null ? "" : rateCls(v);
      its.forEach((el,k) => { el.className = "rw-i" + (WHEEL_VALS[k] != null && WHEEL_VALS[k] % 1 ? " half" : "") + (k === i ? " on " + c : ""); });
      mark.className = "rw-mark " + c; box.dataset.v = v == null ? "" : v;
      out.innerHTML = v == null ? "Без оценки · тяни влево-вправо" : `<b class="${c}">${num1(v)}</b> из 10 · ${review(v)}`;
      if (onChange && ready){ clearTimeout(tmr); tmr = setTimeout(() => onChange(v), 700); } };
    const idxNow = () => Math.max(0, Math.min(its.length - 1, Math.round(tr.scrollLeft / W)));
    const v0 = box.dataset.v === "" ? null : +box.dataset.v, i0 = Math.max(0, WHEEL_VALS.findIndex(x => x === v0));
    requestAnimationFrame(() => { tr.scrollLeft = i0 * W; show(i0); setTimeout(() => ready = true, 120); });
    let raf = 0; tr.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => show(idxNow())); }, {passive:true});
    its.forEach((el,k) => el.addEventListener("click", () => { if (!moved) tr.scrollTo({left: k * W, behavior: "smooth"}); }));
    tr.addEventListener("wheel", e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)){ e.preventDefault(); tr.scrollBy({left: Math.sign(e.deltaY) * W, behavior: "smooth"}); } }, {passive:false});
    let drag = null, moved = false;
    tr.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; drag = {x: e.clientX, l: tr.scrollLeft}; moved = false; tr.classList.add("drag"); tr.setPointerCapture(e.pointerId); });
    tr.addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 3) moved = true; tr.scrollLeft = drag.l - dx; });
    const up = () => { if (!drag) return; drag = null; tr.classList.remove("drag"); tr.scrollTo({left: idxNow() * W, behavior: "smooth"}); setTimeout(() => moved = false, 50); };
    tr.addEventListener("pointerup", up); tr.addEventListener("pointercancel", up);
  }
  const wheelVal = id => { const v = $(id).dataset.v; return v === "" ? null : +v; };

  // ================= застой, сериалы, деньги, ачивки, тема =================
  const STALE_DAYS = 14;
  function staleDays(it){
    if (!isGame(it) || !inLib(it)) return null;
    const s = gStatus(it.status); if (s !== "playing" && s !== "endless") return null;
    const marks = [it.lastPlayed, it.date, it.createdAt ? localDate(new Date(it.createdAt)) : null, ...((it.contract && it.contract.sessions) || []).map(x => x.d)].filter(Boolean).sort();
    if (!marks.length) return null;
    const d = Math.round((parseD(today()) - parseD(marks[marks.length - 1])) / 86400000);
    return d >= STALE_DAYS ? d : null;
  }
  const isSeries = it => !isGame(it) && (it.type === "series" || it.type === "anime");
  async function epStep(it, delta){
    const total = +it.epTotal || 0, w = Math.max(0, Math.min(total || 9999, (+it.epWatched || 0) + delta));
    if (w === (+it.epWatched || 0)) return;
    const patch = {epWatched: w};
    if (w > 0 && it.status !== "playing" && it.status !== "done") patch.status = "playing";
    const finished = total && w >= total;
    if (finished){ patch.status = "done"; patch.date = today(); patch.noDate = null; patch.now = null; }
    else if (it.status === "done" && delta < 0){ patch.status = "playing"; patch.date = null; }
    try { await write(it.id, patch); toast(finished ? "Сериал досмотрен" : `${w}${total ? " из " + total : ""} серий`); if (finished) confetti(); } catch(e){ toast("Не сохранилось"); }
  }
  // деньги
  const priceOf = it => it.priceFree ? 0 : (typeof it.priceRub === "number" ? it.priceRub : (/₽|руб/i.test(it.price || "") ? (+String(it.price).replace(/\D/g, "") || 0) : 0));
  function moneyStats(Y){
    const g = items.filter(i => isGame(i) && inLib(i) && priceOf(i) > 0 && !i.addedDone && !(i.noDate && ["done", "dropped"].includes(gStatus(i.status))));
    const inY = i => !Y || (itemDate(i) || "").startsWith(Y + "-");
    const paid = g.filter(i => srcOf(i) !== "pirate" && inY(i)), pir = g.filter(i => srcOf(i) === "pirate" && inY(i));
    const sum = a => a.reduce((s, i) => s + priceOf(i), 0);
    let hours = 0; paid.forEach(i => hours += cHours(i.contract));
    return {paid, pir, spent: sum(paid), saved: sum(pir), hours};
  }
  // ачивки
  function achStats(){
    const G = items.filter(i => isGame(i) && inLib(i)), K = items.filter(i => !isGame(i) && inLib(i));
    const st = {};
    st.done = G.filter(i => gStatus(i.status) === "done").length;
    st.drops = G.filter(i => gStatus(i.status) === "dropped").length;
    st.pirate = G.filter(i => srcOf(i) === "pirate").length;
    st.endless = G.filter(i => gStatus(i.status) === "endless").length;
    const cs = items.filter(i => isGame(i) && i.contract).map(i => i.contract);
    st.contracts = cs.length; st.cDone = cs.filter(c => c.state === "done").length;
    let best = 0, run = 0; cs.filter(c => c.state === "done" || c.state === "failed").sort((a,b) => (a.closedAt || "").localeCompare(b.closedAt || "")).forEach(c => { run = c.state === "done" ? run + 1 : 0; best = Math.max(best, run); });
    st.cStreak = best;
    st.hours = cs.reduce((s, c) => s + cHours(c), 0);
    const m = moneyStats(null); st.spent = m.spent; st.saved = m.saved;
    st.viaR = items.filter(i => i.via === "roulette").length; st.viaB = items.filter(i => i.via === "battle").length;
    const rated = items.filter(i => typeof i.rating === "number");
    st.tens = rated.filter(i => i.rating >= 10).length; st.lows = rated.filter(i => i.rating <= 2).length;
    st.tiered = items.filter(i => inLib(i) && i.tier).length;
    st.films = K.filter(i => i.type === "movie" && (i.status === "done" || i.status === "played")).length;
    st.seriesDone = K.filter(i => isSeries(i) && i.status === "done").length;
    st.eps = K.reduce((s, i) => s + (+i.epWatched || 0), 0);
    st.soon = items.filter(isSoon).length; st.future = items.filter(isFuture).length;
    st.fast = G.filter(i => { const t = timerInfo(i); return t && t.status === "done" && t.days < 3; }).length;
    const ym = today().slice(0, 7);
    const doneM = G.filter(i => gStatus(i.status) === "done" && (i.finishedAt || "").startsWith(ym)).length, dropM = G.filter(i => gStatus(i.status) === "dropped" && (i.finishedAt || "").startsWith(ym)).length;
    st.clean = doneM > 0 && dropM === 0 ? 1 : 0;
    return st;
  }
  const ACH = [
    ["first","Первая кровь","Пройди первую игру","done",1,"#30d158"],
    ["done10","Комплитист","10 пройденных игр","done",10,"#30d158"],
    ["done25","Легенда","25 пройденных игр","done",25,"#ffd60a"],
    ["contract1","Подписал кровью","Заключи первый контракт","contracts",1,"#ff3b30"],
    ["contract3","Человек слова","Выполни 3 контракта","cDone",3,"#ff3b30"],
    ["streak","Железная воля","3 контракта подряд без срыва","cStreak",3,"#ff9f0a"],
    ["hours50","Задрот","50 часов в контрактах","hours",50,"#ff9f0a"],
    ["fast","Спидраннер","Пройди игру быстрее чем за 3 дня","fast",1,"#64d2ff"],
    ["clean","Ни шагу назад","Пройденная игра в этом месяце и ни одного дропа","clean",1,"#64d2ff"],
    ["drop10","Беспощадный","Дропни 10 игр","drops",10,"#ff453a"],
    ["endless","Вечный двигатель","Добавь онлайн-игру","endless",1,"#bf5af2"],
    ["pirate5","Йо-хо-хо","5 пиратских игр","pirate",5,"#d6a24a"],
    ["saved5k","Капитан Джек","Сэкономь 5 000 ₽ на пиратке","saved",5000,"#d6a24a"],
    ["spent10k","Меценат","Потрать 10 000 ₽ на игры","spent",10000,"#0a84ff"],
    ["roulette","Рука судьбы","Возьми игру из рулетки","viaR",1,"#ff375f"],
    ["battle","Гладиатор","Возьми победителя битвы","viaB",1,"#ff375f"],
    ["ten","Шедевр","Поставь 10 из 10","tens",1,"#ffd60a"],
    ["hater","Хейтер","Поставь 2 или ниже","lows",1,"#8e8e93"],
    ["tier10","Тир-мастер","Разложи 10 позиций в тир-листе","tiered",10,"#5e5ce6"],
    ["films25","Синефил","Досмотри 25 фильмов","films",25,"#ff9f0a"],
    ["series1","Сериальщик","Досмотри сериал целиком","seriesDone",1,"#ff9f0a"],
    ["marathon","Марафонец","Посмотри 100 серий","eps",100,"#ff9f0a"],
    ["waiting5","Жду не дождусь","5 релизов в ожидании","soon",5,"#30b0c7"],
    ["future20","Бэклог мечты","20 позиций в «На будущее»","future",20,"#30b0c7"]
  ];
  function achList(){ const st = achStats(); return ACH.map(([id,t,d,k,max,c]) => ({id, t, d, c, max, cur: Math.min(max, st[k] || 0), got: (st[k] || 0) >= max})); }
  let achSeen = null, achSaving = false, itemsLoaded = false;
  let lastBackup = null, autoBackup = null, backupBusy = false;
  let viewUid = null, FR = null, frLoading = null, upKind = "games";
  let FV = null, MYITEMS = []; // FV — чью полку смотрим (uid), MYITEMS — свои записи
  async function checkAch(){
    if (!canWrite || !db || achSaving || !itemsLoaded) return;
    const got = achList().filter(a => a.got).map(a => a.id);
    if (!achSeen){
      achSaving = true;
      try { const d = await db.doc("meta/ach").get(); achSeen = new Set(d.exists ? (d.data().unlocked || []) : got);
        if (!d.exists) await db.doc("meta/ach").set({unlocked: [...achSeen]}); } catch(e){ achSaving = false; return; }
      achSaving = false;
    }
    const fresh = got.filter(id => !achSeen.has(id));
    if (!fresh.length) return;
    fresh.forEach(id => achSeen.add(id));
    const a = ACH.find(x => x[0] === fresh[0]);
    toast(`Ачивка: ${a[1]}${fresh.length > 1 ? ` и ещё ${fresh.length - 1}` : ""}`); confetti();
    try { await db.doc("meta/ach").set({unlocked: [...achSeen]}); } catch(e){ logErr("ачивки: сохранение", e); }
  }
  // тема
  const THEME_DEF = {gBg:"#0e0e10", gAcc:"#e9e9ee", kBg:"#1c1c2b", kAcc:"#ffffff", aAcc:"#0a84ff"};
  const THEME_PRESETS = [["Стандарт", THEME_DEF],
    ["Полночь", {gBg:"#0b1220", gAcc:"#7cc4ff", kBg:"#0f1a2e", kAcc:"#9fd3ff", aAcc:"#0a84ff"}],
    ["Кровь", {gBg:"#140a0b", gAcc:"#ff6b5e", kBg:"#1f0f12", kAcc:"#ffb3aa", aAcc:"#ff3b30"}],
    ["Матрица", {gBg:"#07110a", gAcc:"#4ade80", kBg:"#0c1a12", kAcc:"#a7f3c0", aAcc:"#30d158"}],
    ["Неон", {gBg:"#100a1a", gAcc:"#f472b6", kBg:"#1a1030", kAcc:"#c4b5fd", aAcc:"#bf5af2"}],
    ["Песок", {gBg:"#15120d", gAcc:"#e8c48a", kBg:"#221c14", kAcc:"#f5deb3", aAcc:"#ff9f0a"}]];
  let theme = null;
  const fgFor = hex => { const h = hex.replace("#", ""), r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16); return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.6 ? "#111114" : "#ffffff"; };
  function applyTheme(t){
    const el = $("themeVars");
    if (!t){ el.textContent = ""; return; }
    t = {...THEME_DEF, ...t};
    const mix = (c, p, w) => `color-mix(in srgb, ${c} ${p}%, ${w})`;
    el.textContent = `:root:not(#_):not([data-mode="light"]){--s-bg:${t.gBg};--s-top:${mix(t.gBg,70,"#000")};--s-bg2:${mix(t.gBg,94,"#fff")};--s-panel:${mix(t.gBg,91,"#fff")};--s-panel2:${mix(t.gBg,86,"#fff")};--s-line:${mix(t.gBg,81,"#fff")};
      --s-acc:${t.gAcc};--s-accfg:${fgFor(t.gAcc)};--k-bg:${t.kBg};--k-bg2:${mix(t.kBg,90,"#fff")};--k-chip:${mix(t.kBg,72,"#fff")};--k-chip2:${mix(t.kBg,64,"#fff")};--k-line:${mix(t.kBg,82,"#fff")};
      --k-acc:${t.kAcc};--k-accfg:${fgFor(t.kAcc)}}:root:not(#_){--c-ring:${t.aAcc}}`;
  }

  function staleBox(it){
    const d = staleDays(it); if (!d) return "";
    const id = esc(it.id);
    return `<div class="s-stale"><div class="k">${ICON.clock}Застой</div><b>${d} ${plural(d,"день","дня","дней")} без игры</b><p>Либо вернись, либо честно отпусти.</p>
      ${canWrite ? `<div class="s-acts"><button class="s-btn" data-played="${id}">Играл сегодня</button>${hasActive(it) ? "" : `<button class="s-btn red" data-ctopen="${id}">${ICON.target}Контракт</button>`}<button class="s-btn dark" data-sdrop="${id}">Дроп</button></div>` : ""}</div>`;
  }
  function epBlock(it){
    const t = +it.epTotal || 0, w = +it.epWatched || 0, id = esc(it.id);
    if (!t && !canWrite) return "";
    const arr = Array.isArray(it.seasonEps) && it.seasonEps.length && it.seasonEps.every(n => n > 0) ? it.seasonEps.map(Number) : null, pos = arr ? seasonPos(arr, w) : null;
    const bar = arr ? `<div class="ep-segs">${arr.map((n, i) => { const before = arr.slice(0, i).reduce((s, x) => s + x, 0), p = Math.max(0, Math.min(1, (w - before) / n)); return `<i style="--n:${n};--p:${(p * 100).toFixed(1)}%" title="${i + 1} сезон: ${n} ${plural(n,"серия","серии","серий")}"></i>`; }).join("")}</div>`
      : `<div class="ep-bar"><i style="width:${t ? Math.min(100, w / t * 100) : 0}%"></i></div>`;
    return `<div class="ep-box"><div class="lb">Прогресс</div>
      ${t ? `<div class="ep-n"><b>${w}</b> / ${t} ${plural(t,"серия","серии","серий")}${it.seasons ? ` · ${it.seasons} ${plural(it.seasons,"сезон","сезона","сезонов")}` : ""}${pos ? `<span class="ep-pos">${pos}</span>` : ""}</div>${bar}`
        : `<div class="ep-n" style="font-size:15px;color:var(--k-dim)">Укажи число серий через карандаш</div>`}
      ${canWrite ? `<div class="ep-btns"><button class="k-btn sm" data-epm="${id}" ${w ? "" : "disabled"}>−1</button><button class="k-btn white sm" data-epp="${id}">+1 серия</button></div>` : ""}</div>`;
  }

