// NEXUS: перенос списков из MyShows и MangaLib + прокси обложек
const CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS"};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const IMG_HOSTS: Record<string, string> = {"cover.imglib.info": "https://mangalib.me/", "media.myshows.me": "https://myshows.me/", "avatars.mds.yandex.net": "https://www.kinopoisk.ru/", "st.kp.yandex.net": "https://www.kinopoisk.ru/"};
const LIB_H = {"Site-Id": "1", "User-Agent": UA, "Accept": "application/json", "Referer": "https://mangalib.me/", "Origin": "https://mangalib.me"};
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), {status, headers: {...CORS, "Content-Type": "application/json; charset=utf-8"}});

async function myshows(raw: string) {
  const login = String(raw || "").trim().replace(/^https?:\/\/(\w+\.)?myshows\.me\//i, "").replace(/^(m|my|profile)\//i, "").split(/[/?#]/)[0].replace(/^@/, "");
  if (!login) return {error: "Впиши ник или ссылку на профиль MyShows"};
  const rpc = async (method: string) => { const r = await fetch("https://api.myshows.me/v2/rpc/", {method: "POST", headers: {"Content-Type": "application/json", "User-Agent": UA}, body: JSON.stringify({jsonrpc: "2.0", method, params: {login}, id: 1})}); return r.json(); };
  const [p, s] = await Promise.all([rpc("profile.Get"), rpc("profile.Shows")]);
  if (p && p.error) return {error: /not found/i.test(JSON.stringify(p.error)) ? `Профиль «${login}» на MyShows не найден` : "MyShows не ответил"};
  const ST: Record<string, string> = {watching: "playing", finished: "done", later: "future", cancelled: "dropped"};
  const items = ((s && s.result) || []).filter((e: any) => e && e.show && ST[e.watchStatus]).map((e: any) => {
    const sh = e.show, img = sh.image ? String(sh.image).replace("/shows/small/", "/shows/normal/") : null;
    return {ext: "ms:" + sh.id, title: sh.title || sh.titleOriginal, orig: sh.titleOriginal && sh.titleOriginal !== sh.title ? sh.titleOriginal : null, year: sh.year || null,
      type: sh.category === "anime" ? "anime" : "series", status: ST[e.watchStatus], rating: e.rating > 0 ? e.rating * 2 : null,
      epW: e.watchedEpisodes ?? null, epT: e.totalEpisodes || null, cover: img};
  });
  return {who: (p && p.result && p.result.user && p.result.user.login) || login, items};
}

async function mangalib(raw: string) {
  const m = String(raw || "").match(/user\/(\d+)/) || String(raw || "").trim().match(/^(\d{2,12})$/);
  if (!m) return {error: "Нужна ссылка на профиль вида mangalib.me/ru/user/1234567"};
  const uid = m[1];
  const u = await fetch(`https://api.cdnlibs.org/api/user/${uid}`, {headers: LIB_H}).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!u || !u.data) return {error: "Профиль MangaLib не найден"};
  const folders = await fetch(`https://api.cdnlibs.org/api/bookmarks/folder/${uid}`, {headers: LIB_H}).then(r => r.ok ? r.json() : null).catch(() => null);
  const fl: any[] = (folders && folders.data) || [];
  const fname: Record<number, string> = {}; fl.forEach((f: any) => fname[f.id] = f.name);
  const ids = fl.length ? fl.filter((f: any) => +f.count > 0 && !(f.id >= 21 && f.id <= 27)).map((f: any) => +f.id) : [1, 2, 3, 4, 5];
  const out: any[] = [], seen = new Set<string>(); let hidden = false;
  for (const st of ids) {
    for (let page = 1; page <= 40; page++) {
      const r = await fetch(`https://api.cdnlibs.org/api/bookmarks?user_id=${uid}&status=${st}&page=${page}`, {headers: LIB_H});
      if (r.status === 403 || r.status === 401) { hidden = true; break; }
      if (!r.ok) break;
      const d = await r.json(); const list = (d && d.data) || [];
      for (const e of list) {
        const md = e.media || {}; const k = "ml:" + md.id;
        const status = st === 1 ? "reading" : st === 4 ? "done" : st === 3 ? "dropped" : st === 5 ? "done" : "plan";
        const tl = String((md.type && md.type.label) || "");
        if (seen.has(k)) { if (st === 5) { const x = out.find(o => o.ext === k); if (x) x.fav = true; } continue; }
        seen.add(k);
        out.push({ext: k, title: md.rus_name || md.name || md.eng_name, orig: md.eng_name || (md.rus_name && md.name !== md.rus_name ? md.name : null),
          type: /комикс/i.test(tl) ? "comic" : "manga", kind: tl, status, fav: st === 5, folder: fname[st] || null,
          rating: e.rating > 0 ? +e.rating : null, chRead: e.meta && e.meta.item_number ? +e.meta.item_number : null,
          chTotal: md.items_count && md.items_count.uploaded ? +md.items_count.uploaded : null,
          url: md.slug_url ? `https://mangalib.me/ru/manga/${md.slug_url}` : null,
          cover: (md.cover && (md.cover.default || md.cover.md || md.cover.thumbnail)) || null});
      }
      if (!d.meta || !d.meta.next_page_url || !list.length) break;
    }
  }
  if (!out.length && hidden) return {error: "Закладки этого профиля скрыты — открой их в настройках приватности MangaLib"};
  if (!out.length) return {error: "Закладок не нашёл — возможно, они скрыты в настройках приватности MangaLib"};
  return {who: u.data.username, items: out};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers: CORS});
  const url = new URL(req.url);
  const img = url.searchParams.get("img");
  if (img) {
    let t: URL; try { t = new URL(img); } catch { return new Response("bad", {status: 400, headers: CORS}); }
    const ref = IMG_HOSTS[t.hostname]; if (!ref || t.protocol !== "https:") return new Response("host", {status: 403, headers: CORS});
    const r = await fetch(t, {headers: {"User-Agent": UA, "Referer": ref, "Accept": "image/avif,image/webp,image/*"}});
    if (!r.ok) return new Response("upstream " + r.status, {status: 502, headers: CORS});
    return new Response(r.body, {headers: {...CORS, "Content-Type": r.headers.get("Content-Type") || "image/jpeg", "Cache-Control": "public, max-age=604800"}});
  }
  if (req.method !== "POST") return json({error: "POST"}, 405);
  try {
    const b = await req.json();
    if (b.src === "myshows") return json(await myshows(b.q));
    if (b.src === "mangalib") return json(await mangalib(b.q));
    return json({error: "Неизвестный источник"}, 400);
  } catch (e) { return json({error: "Сервис не ответил: " + String(e && (e as Error).message || e)}, 200); }
});
