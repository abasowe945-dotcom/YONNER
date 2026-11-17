// Фейковый supabase-js для локальных тестов NEXUS: всё в памяти, сеть не нужна.
(() => {
  const ME = "00000000-0000-4000-8000-000000000001";
  const U2 = "00000000-0000-4000-8000-000000000002", U3 = "00000000-0000-4000-8000-000000000003", U4 = "00000000-0000-4000-8000-000000000004";
  const iso = d => new Date(d).toISOString();
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const uuid = () => crypto.randomUUID();
  const NO = new Set((window.__MOCK_MISSING || "").split(",").filter(Boolean));
  const T = {
    profiles: [
      {user_id: ME, nick: "DEADPOOLYKT", ava_animal: "fox", ava_color: "#ff9f0a", pid: 1, created_at: iso(Date.now() - 9e9)},
      {user_id: U2, nick: "Мичил", ava_animal: "bear", ava_color: "#5e5ce6", pid: 2, birthday: "0004-11-20", created_at: iso(Date.now() - 8e9)},
      {user_id: U3, nick: "Вождь", ava_animal: "wolf", ava_color: "#30d158", pid: 3, created_at: iso(Date.now() - 7e9)},
      {user_id: U4, nick: "Кабан", ava_animal: "boar", ava_color: "#ff375f", pid: 4, created_at: iso(Date.now() - 6e9)}
    ],
    items: [
      {id: "g1", user_id: ME, data: {type: "game", title: "Ghost of Tsushima", status: "done", rating: 9.5, date: day(-20), createdAt: iso(Date.now() - 3e9), updatedAt: iso(Date.now() - 3e9)}, updated_at: iso(Date.now() - 3e9)},
      {id: "g2", user_id: ME, data: {type: "game", title: "Arena Breakout", status: "playing", date: day(-3), createdAt: iso(Date.now() - 2e8), updatedAt: iso(Date.now() - 2e8)}, updated_at: iso(Date.now() - 2e8)},
      {id: "a1", user_id: ME, data: {type: "anime", title: "Кайдзю номер 8", status: "done", rating: 7, date: day(-5), createdAt: iso(Date.now() - 4e8), updatedAt: iso(Date.now() - 4e8)}, updated_at: iso(Date.now() - 4e8)},
      {id: "k1", user_id: U2, data: {type: "movie", title: "Дюна", status: "done", rating: 8, date: day(-2), createdAt: iso(Date.now() - 1e8), updatedAt: iso(Date.now() - 1e8)}, updated_at: iso(Date.now() - 1e8)}
    ],
    meta: [], reads: [
      {id: "r1", user_id: ME, data: {title: "Берсерк", type: "manga", status: "reading", chRead: 40, chTotal: 370, createdAt: iso(Date.now() - 5e9), updatedAt: iso(Date.now() - 5e8)}, updated_at: iso(Date.now() - 5e8)},
      {id: "r2", user_id: ME, data: {title: "Старый дроп", type: "manga", status: "dropped", createdAt: iso(Date.now() - 6e9), updatedAt: iso(Date.now() - 6e9)}, updated_at: iso(Date.now() - 6e9)},
      {id: "r3", user_id: ME, data: {title: "Ванпанчмен", type: "manga", status: "plan", createdAt: iso(Date.now() - 3e9), updatedAt: iso(Date.now() - 3e9)}, updated_at: iso(Date.now() - 3e9)}], showcases: [], tierlists: [], events: [], event_members: [], event_posts: [], event_post_likes: [],
    wall_posts: [], wall_comments: [], wall_reactions: [], wall_comment_likes: [], notifications: [], suggestions: [], recs: [],
    slop_games: [], slop_marks: [], slop_status: [], slop_comments: [], slop_plans: [], slop_plan_members: [], slop_tiers: [], slop_polls: [], slop_poll_votes: [],
    tierlist_likes: [], vacations: [], feedback: [], feedback_votes: [], feedback_comments: [], feedback_comment_likes: [],
    places: [], place_visits: [], place_visit_members: [], place_ratings: [], place_dishes: [], place_dish_rates: [], place_wants: []
  };
  if (!window.__MOCK_EMPTY_PLACES){
    const p1 = uuid(), p2 = uuid(), p3 = uuid(), p4 = uuid();
    T.places.push(
      {id: p1, user_id: ME, name: "Bodies Bar", kind: "bar", x: .47, y: .52, photo: null, menu: [], gis_url: "https://2gis.ru/yakutsk/firm/70000001000000001", address: "ул. Ленина, 1", note: "", created_at: iso(Date.now() - 5e9), updated_at: iso(Date.now() - 5e9)},
      {id: p2, user_id: U2, name: "Тамерлан", kind: "rest", x: .36, y: .6, photo: null, menu: [], gis_url: null, address: null, note: "", created_at: iso(Date.now() - 4e9), updated_at: iso(Date.now() - 4e9)},
      {id: p3, user_id: U3, name: "Пивной двор с очень длинным названием для проверки", kind: "bar", x: .62, y: .4, photo: null, menu: [], gis_url: null, created_at: iso(Date.now() - 3e9), updated_at: iso(Date.now() - 3e9)},
      {id: p4, user_id: U4, name: "Новый крафт", kind: "bar", x: .55, y: .3, photo: null, menu: [], gis_url: null, created_at: iso(Date.now() - 1e9), updated_at: iso(Date.now() - 1e9)}
    );
    const v1 = uuid(), v2 = uuid(), v3 = uuid();
    T.place_visits.push({id: v1, place_id: p1, user_id: ME, day: day(-3), created_at: iso(Date.now() - 2e8)}, {id: v2, place_id: p2, user_id: U2, day: day(-12), created_at: iso(Date.now() - 1e9)}, {id: v3, place_id: p3, user_id: U3, day: day(-30), created_at: iso(Date.now() - 2.5e9)});
    T.place_visit_members.push({visit_id: v1, user_id: ME}, {visit_id: v1, user_id: U2}, {visit_id: v1, user_id: U3}, {visit_id: v2, user_id: U2}, {visit_id: v2, user_id: ME}, {visit_id: v3, user_id: U3});
    T.place_ratings.push({place_id: p1, user_id: U2, interior: 9, price: 6, taste: 8, beer: 9, comment: "Музло огонь", updated_at: iso(Date.now() - 1e8)},
      {place_id: p2, user_id: U2, interior: 7, price: 5, taste: 9, beer: null, comment: null, updated_at: iso(Date.now() - 9e8)},
      {place_id: p3, user_id: U3, interior: 3, price: 4, taste: 4, beer: 5, comment: "Ну такое", updated_at: iso(Date.now() - 2e9)});
    const d1 = uuid(); T.place_dishes.push({id: d1, place_id: p1, user_id: U2, name: "Крылья BBQ", kind: "food", created_at: iso(Date.now() - 1e8)}, {id: uuid(), place_id: p1, user_id: U2, name: "Стаут", kind: "drink", created_at: iso(Date.now() - 1e8)});
    T.place_dish_rates.push({dish_id: d1, user_id: U2, score: 8, updated_at: iso(Date.now() - 1e8)});
    T.place_wants.push({place_id: p4, user_id: U4, created_at: iso(Date.now() - 1e9)}, {place_id: p4, user_id: U2, created_at: iso(Date.now() - 5e8)});
  }
  window.__T = T; window.__LOG = [];
  const PK = {place_ratings: ["place_id", "user_id"], place_dish_rates: ["dish_id", "user_id"], place_wants: ["place_id", "user_id"], place_visit_members: ["visit_id", "user_id"], profiles: ["user_id"], meta: ["user_id", "key"], vacations: ["user_id", "year"], slop_status: ["game_id", "user_id"], event_members: ["event_id", "user_id"]};
  const listeners = [];
  const emit = (table, eventType, row, old) => listeners.forEach(l => { if (l.table === table) setTimeout(() => l.fn({eventType, new: row, old: old || row}), 30); });
  const missErr = t => ({code: "PGRST205", message: `Could not find the table 'public.${t}' in the schema cache`});
  function builder(table){
    const st = {op: "select", filters: [], order: null, limit: null, single: false, maybe: false, rows: null, patch: null, ret: false, range: null};
    const apply = arr => arr.filter(r => st.filters.every(f => f(r)));
    const run = () => {
      window.__LOG.push({table, op: st.op, rows: st.rows, patch: st.patch});
      if (NO.has(table) || !(table in T)) return {data: null, error: missErr(table)};
      const t = T[table]; let out;
      if (st.op === "insert" || st.op === "upsert"){
        const rows = (Array.isArray(st.rows) ? st.rows : [st.rows]).map(r => ({...r}));
        out = rows.map(r => {
          if (!("user_id" in r) && table !== "place_dish_rates") r.user_id = ME;
          if (table === "place_dish_rates" && !r.user_id) r.user_id = ME;
          const now = new Date().toISOString(); if (!r.created_at) r.created_at = now; if (!r.updated_at && /places|ratings|rates/.test(table)) r.updated_at = now;
          const pk = PK[table]; let ex = null;
          if (pk) ex = t.find(x => pk.every(k => x[k] === r[k])); else { if (!r.id) r.id = uuid(); ex = t.find(x => x.id === r.id); }
          if (ex){ if (st.op === "insert") return {__dup: true}; Object.assign(ex, r); emit(table, "UPDATE", ex); return ex; }
          if (table === "places"){ r.menu = r.menu || []; }
          t.push(r); emit(table, "INSERT", r); return r;
        });
        if (out.some(x => x.__dup)) return {data: null, error: {code: "23505", message: "duplicate key"}};
      } else if (st.op === "update"){
        out = apply(t); out.forEach(r => { Object.assign(r, st.patch); emit(table, "UPDATE", r); });
      } else if (st.op === "delete"){
        out = apply(t); out.forEach(r => { t.splice(t.indexOf(r), 1); emit(table, "DELETE", r, r); });
        if (table === "places") out.forEach(p => { ["place_visits", "place_ratings", "place_dishes", "place_wants"].forEach(k => T[k] = T[k].filter(x => x.place_id !== p.id)); });
        if (table === "place_visits") out.forEach(v => { T.place_visit_members = T.place_visit_members.filter(m => m.visit_id !== v.id); });
      } else {
        out = apply(t).map(r => ({...r}));
        if (st.order){ const [c, asc] = st.order; out.sort((a, b) => String(a[c] ?? "").localeCompare(String(b[c] ?? "")) * (asc ? 1 : -1)); }
        if (st.range) out = out.slice(st.range[0], st.range[1] + 1);
        if (st.limit != null) out = out.slice(0, st.limit);
      }
      out = JSON.parse(JSON.stringify(out || []));
      if (st.single || st.maybe){ if (!out.length) return st.maybe ? {data: null, error: null} : {data: null, error: {code: "PGRST116", message: "no rows"}}; return {data: out[0], error: null}; }
      return {data: (st.op === "select" || st.ret) ? out : null, error: null};
    };
    const b = new Proxy({}, {get(_, k){
      if (k === "then") return (ok, no) => new Promise(r => setTimeout(r, 15)).then(run).then(ok, no);
      if (k === "select") return () => { if (st.op !== "select") st.ret = true; return b; };
      if (k === "insert") return rows => { st.op = "insert"; st.rows = rows; return b; };
      if (k === "upsert") return rows => { st.op = "upsert"; st.rows = rows; return b; };
      if (k === "update") return p => { st.op = "update"; st.patch = p; return b; };
      if (k === "delete") return () => { st.op = "delete"; return b; };
      if (k === "eq") return (c, v) => { st.filters.push(r => r[c] === v); return b; };
      if (k === "neq") return (c, v) => { st.filters.push(r => r[c] !== v); return b; };
      if (k === "in") return (c, v) => { st.filters.push(r => v.includes(r[c])); return b; };
      if (k === "gte") return (c, v) => { st.filters.push(r => r[c] >= v); return b; };
      if (k === "lte") return (c, v) => { st.filters.push(r => r[c] <= v); return b; };
      if (k === "order") return (c, o) => { st.order = [c, !(o && o.ascending === false)]; return b; };
      if (k === "limit") return n => { st.limit = n; return b; };
      if (k === "range") return (a, z) => { st.range = [a, z]; return b; };
      if (k === "single") return () => { st.single = true; return b; };
      if (k === "maybeSingle") return () => { st.maybe = true; return b; };
      return () => b;
    }});
    return b;
  }
  const user = {id: ME, email: "me@test.local"};
  const client = {
    from: builder,
    rpc: async (fn) => { await new Promise(r => setTimeout(r, 10)); if (fn === "public_items") return {data: T.items.map(r => ({...r})), error: null}; return {data: null, error: {message: "no rpc"}}; },
    channel(){ const ch = {on(_, opt, fn){ listeners.push({table: opt.table, fn}); return ch; }, subscribe(){ return ch; }, unsubscribe(){}}; return ch; },
    removeChannel(){},
    auth: {getSession: async () => ({data: {session: {user}}}), onAuthStateChange(){ return {data: {subscription: {unsubscribe(){}}}}; }, getUser: async () => ({data: {user}}), signOut: async () => ({}), updateUser: async () => ({error: null})},
    storage: {from(){ return {upload: async (path) => { window.__LOG.push({upload: path}); return {data: {path}, error: null}; }, remove: async () => ({error: null}), getPublicUrl: p => ({data: {publicUrl: "https://mock.supabase.co/storage/v1/object/public/media/" + p}})}; }},
    functions: {invoke: async () => ({data: null, error: {message: "offline"}})}
  };
  window.supabase = {createClient: () => client};
})();
