// Подменная база для автотестов: ведёт себя как supabase-js, но ничего не отправляет в настоящий Supabase.
// Данные берёт из window.__FX (таблица -> массив строк), как настоящий сервер отдаёт максимум 1000 строк за раз.
(function () {
  const FX = () => window.__FX || {};
  const LOG = (window.__SBLOG = window.__SBLOG || []);
  const MAX = 1000;
  function builder(kind, name, args) {
    const q = {kind, name, ops: [], rangeA: null, rangeB: null, lim: null, single: null};
    const p = new Proxy({}, {
      get(_, k) {
        if (k === "then") return (ok, bad) => run().then(ok, bad);
        if (k === "range") return (a, b) => { q.rangeA = a; q.rangeB = b; q.ops.push("range"); return p; };
        if (k === "limit") return n => { q.lim = n; q.ops.push("limit"); return p; };
        if (k === "single" || k === "maybeSingle") return () => { q.single = k; return p; };
        if (k === "eq") return (c, v) => { q.ops.push(["eq", c, v]); return p; };
        return () => { q.ops.push(String(k)); return p; };
      }
    });
    async function run() {
      LOG.push({kind, name, ops: q.ops.map(o => Array.isArray(o) ? o[0] : o), at: performance.now()});
      if (q.ops.some(o => ["insert", "update", "upsert", "delete"].includes(o))) return {data: null, error: null};
      const raw = FX()[name]; if (raw !== undefined && !Array.isArray(raw)) return {data: raw, error: null};
      let rows = (raw || []).slice();
      for (const o of q.ops) if (Array.isArray(o) && o[0] === "eq") rows = rows.filter(r => r[o[1]] === undefined || r[o[1]] === o[2]);
      if (q.rangeA !== null) rows = rows.slice(q.rangeA, Math.min(q.rangeB + 1, q.rangeA + MAX));
      else rows = rows.slice(0, Math.min(q.lim || MAX, MAX));
      if (q.single) return {data: rows[0] || null, error: null};
      return {data: rows, error: null, count: rows.length};
    }
    return p;
  }
  const chan = () => { const c = {on: () => c, subscribe: () => c, unsubscribe: () => {}}; return c; };
  window.supabase = {
    createClient() {
      const s = window.__SESSION || null;
      return {
        from: t => builder("from", t),
        rpc: (n, a) => builder("rpc", n, a),
        channel: chan, removeChannel() {}, removeAllChannels() {},
        storage: {from: () => ({upload: async p => ({data: {path: p}, error: null}), remove: async () => ({data: [], error: null}), getPublicUrl: p => ({data: {publicUrl: p}})})},
        auth: {
          getSession: async () => ({data: {session: s}}),
          onAuthStateChange: () => ({data: {subscription: {unsubscribe() {}}}}),
          signInWithPassword: async () => ({data: {session: s}, error: null}), signUp: async () => ({data: {}, error: null}),
          signOut: async () => ({error: null}), resetPasswordForEmail: async () => ({error: null}), updateUser: async () => ({error: null})
        }
      };
    }
  };
})();
