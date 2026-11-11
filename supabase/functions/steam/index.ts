// NEXUS: данные игры из Steam по appid (название, описание, жанры, метки, дата, цена, вертикальная обложка)
// 4.4: ещё скриншоты и трейлер — для карточек СЛОПа
// 3.0: игры, которые не продаются в РФ (Ubisoft, Sony и т.п.), больше не дают 404 —
// пробуем регионы ru → kz → us → без региона, а если API молчит совсем, разбираем саму страницу магазина.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "Accept-Language": "ru-RU,ru;q=0.9", "Cookie": "birthtime=631152001; lastagecheckage=1-0-1990; wants_mature_content=1; Steam_Language=russian" };

function b64(buf: Uint8Array) {
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}
const decode = (t: string) => t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").trim();
const strip = (t: string) => decode(t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

// deno-lint-ignore no-explicit-any
async function details(appid: string, cc: string | null): Promise<any> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=russian${cc ? `&cc=${cc}` : ""}`, { headers: UA });
      if (r.status === 429) { await new Promise((ok) => setTimeout(ok, 700)); continue; }
      if (!r.ok) return null;
      const j = await r.json();
      return j?.[appid]?.success ? j[appid].data : null;
    } catch (_) { return null; }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { appid } = await req.json();
    const id = String(appid || "");
    if (!/^\d{1,10}$/.test(id)) return json({ error: "это не ссылка на игру" });

    // 1) API магазина: сначала Россия, потом Казахстан, США и без региона
    // deno-lint-ignore no-explicit-any
    let d: any = null, region: string | null = null;
    for (const cc of ["ru", "kz", "us", null]) { d = await details(id, cc); if (d) { region = cc; break; } }

    // 2) страница магазина: метки, а если API не ответил — название, описание и дата прямо из HTML
    let tags: string[] = [], page = "";
    try {
      const p = await fetch(`https://store.steampowered.com/app/${id}/?l=russian`, { headers: UA, redirect: "follow" });
      if (p.ok) page = await p.text();
    } catch (_) { /* страница не обязательна */ }
    if (page) tags = [...page.matchAll(/class="app_tag"[^>]*>([^<]+)</g)].map((m) => decode(m[1])).filter((t) => t && t !== "+").slice(0, 12);

    if (!d && page && /apphub_AppName|game_description_snippet/.test(page)) {
      const pick = (re: RegExp) => { const m = page.match(re); return m ? strip(m[1]) : ""; };
      const genres = [...(page.match(/<b>Жанр:<\/b>([\s\S]*?)<br>/) || ["", ""])[1].matchAll(/>([^<]+)<\/a>/g)].map((m) => decode(m[1]));
      d = {
        name: pick(/<div[^>]*id="appHubAppName"[^>]*>([\s\S]*?)<\/div>/) || pick(/<div class="apphub_AppName"[^>]*>([\s\S]*?)<\/div>/) || pick(/<title>([\s\S]*?)( в Steam)?<\/title>/),
        short_description: pick(/<div class="game_description_snippet"[^>]*>([\s\S]*?)<\/div>/),
        genres: genres.map((g) => ({ description: g })),
        release_date: { date: pick(/<div class="date">([\s\S]*?)<\/div>/) },
        is_free: /Бесплатно|Free to Play/i.test(pick(/<div class="game_purchase_price price"[^>]*>([\s\S]*?)<\/div>/)),
      };
      region = "page";
    }
    if (!d) return json({ error: "Steam не знает такой игры или закрыл её страницу" });

    // цена: рубли, если игра продаётся в РФ, иначе тенге
    let price = region === "ru" ? d.price_overview || null : null;
    let priceKz = region === "kz" ? d.price_overview || null : null;
    if (!d.is_free && !price && !priceKz) { const k = await details(id, "kz"); priceKz = k?.price_overview || null; }

    // вертикальная обложка 600x900, если есть
    let cover: string | null = null, coverType: string | null = null;
    const urls = [
      `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`,
      `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900_2x.jpg`,
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u, { headers: { "User-Agent": UA["User-Agent"] } });
        const ct = r.headers.get("content-type") || "";
        if (r.ok && ct.startsWith("image/")) { cover = b64(new Uint8Array(await r.arrayBuffer())); coverType = ct; break; }
      } catch (_) { /* пробуем следующий */ }
    }

    // 4.5: у новых игр постер лежит по адресу с хешем — спрашиваем его у магазина
    if (!cover) {
      try {
        const input = encodeURIComponent(JSON.stringify({ ids: [{ appid: Number(id) }], context: { language: "russian", country_code: "US" }, data_request: { include_assets: true } }));
        const r = await fetch(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=${input}`, { headers: { "User-Agent": UA["User-Agent"] } });
        if (r.ok) {
          const a = (await r.json())?.response?.store_items?.[0]?.assets;
          const fmt = a?.asset_url_format;
          for (const file of [a?.library_capsule_2x, a?.library_capsule]) {
            if (!fmt || !file || cover) continue;
            const c = await fetch("https://shared.akamai.steamstatic.com/store_item_assets/" + String(fmt).replace("${FILENAME}", file), { headers: { "User-Agent": UA["User-Agent"] } });
            const ct = c.headers.get("content-type") || "";
            if (c.ok && ct.startsWith("image/")) { cover = b64(new Uint8Array(await c.arrayBuffer())); coverType = ct; }
          }
        }
      } catch (_) { /* постер не обязателен */ }
    }

    return json({
      appid: id,
      region,
      name: d.name,
      short: d.short_description ? strip(d.short_description) : "",
      genres: (d.genres || []).map((g: { description: string }) => g.description),
      categories: (d.categories || []).map((c: { description: string }) => c.description),
      tags,
      release: d.release_date || null,
      is_free: !!d.is_free,
      price,
      priceKz,
      developers: d.developers || [],
      header: d.header_image || null,
      cover, coverType,
      screenshots: (d.screenshots || []).slice(0, 10).map((x: { path_full?: string; path_thumbnail?: string }) => x.path_full || x.path_thumbnail).filter(Boolean),
      // deno-lint-ignore no-explicit-any
      movies: (d.movies || []).slice(0, 3).map((m: any) => ({ name: m.name || "", thumb: m.thumbnail || null, mp4: m.mp4?.max || m.mp4?.["480"] || null, webm: m.webm?.max || m.webm?.["480"] || null, hls: m.hls_h264 || null })),
      coming_soon: !!(d.release_date && d.release_date.coming_soon),
    });
  } catch (e) {
    return json({ error: String(e) });
  }
});
