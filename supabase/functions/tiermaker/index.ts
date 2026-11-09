// NEXUS: импорт тир-листов с TierMaker + прокси их картинок
// POST {url}  → {title, kind, tiers: [{n, c, items: [imgUrl]}], pool: [imgUrl]}
// GET ?img=…  → картинка с tiermaker.com (с CORS, чтобы сайт мог её обрезать и сохранить)
const CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS"};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), {status, headers: {...CORS, "Content-Type": "application/json; charset=utf-8"}});
// палитра TierMaker: в коде списка цвет хранится номером из неё
const COLORS = ["#FF7F7F", "#FFBF7F", "#FFDF7F", "#FFFF7F", "#BFFF7F", "#7FFF7F", "#7FFFFF", "#7FBFFF", "#7F7FFF", "#FF7FFF", "#BF7FBF", "#3B3B3B", "#858585", "#CFCFCF", "#F7F7F7"];
const HOST = /^(www\.)?tiermaker\.com$/i;

const decode = (s: string) => String(s || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16))).replace(/\s+/g, " ").trim();
const jsStr = (s: string) => { try { return JSON.parse('"' + s + '"'); } catch { return s; } };

async function parse(raw: string) {
  let u: URL;
  try { u = new URL(String(raw || "").trim().replace(/^(?!https?:)/i, "https://")); } catch { return {error: "Это не похоже на ссылку"}; }
  if (!HOST.test(u.hostname)) return {error: "Нужна ссылка с tiermaker.com"};
  if (!/^\/(list|create)\//i.test(u.pathname)) return {error: "Нужна ссылка на тир-лист (tiermaker.com/list/…) или на шаблон (tiermaker.com/create/…)"};
  u.protocol = "https:"; u.hostname = "tiermaker.com"; u.hash = "";
  const r = await fetch(u.toString(), {headers: {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9"}, redirect: "follow"});
  const html = await r.text();
  if (r.status === 404) return {error: "Такого тир-листа на TierMaker нет — проверь ссылку"};
  if (!r.ok || /cf-chl|Just a moment|challenge-platform/i.test(html.slice(0, 4000)) && !/initList/.test(html)) return {error: `TierMaker не пустил (код ${r.status}). Попробуй ещё раз через минуту`};

  const base = (html.match(/baseTierImagePath\s*=\s*["']([^"']+)["']/) || [])[1] || "";
  const dle = (html.match(/dateLastEdited\s*=\s*["']([^"']*)["']/) || [])[1] || "";
  const init = (html.match(/initList\(([\s\S]{0,20000}?)\)\s*[;\n]/) || [])[1];
  const args = init ? [...init.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => jsStr(m[1])) : [];
  const code = args[0] || "", category = args[1] || (u.pathname.split("/").filter(Boolean)[u.pathname.startsWith("/list/") ? 2 : 1] || ""), variation = args[2] || "";
  if (!category) return {error: "Не нашёл на странице тир-лист"};

  let title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s*-\s*TierMaker\s*$/i, "");
  const cm = title.match(/^Create a (.+?) Tier List$/i); if (cm) title = cm[1];
  title = title.slice(0, 80) || "Тир-лист с TierMaker";

  // все картинки шаблона: [категория, файл1, файл2…] или объекты {id, src} у вариаций
  const api = `https://tiermaker.com/api/?type=templates-v2&id=${encodeURIComponent(category)}&lastEdited=${encodeURIComponent(dle)}&variation=${encodeURIComponent(variation)}`;
  const ar = await fetch(api, {headers: {"User-Agent": UA, "Accept": "application/json,*/*", "Referer": u.toString()}});
  let arr: unknown[] = [];
  try { arr = JSON.parse(await ar.text()); } catch { /* пусто */ }
  if (!Array.isArray(arr) || !arr.length) return {error: "TierMaker не отдал картинки этого шаблона"};
  const pics = new Map<string, string>();
  arr.forEach((el: any, i) => {
    if (typeof el === "string"){ if (i === 0) return; pics.set(String(i), el); } // [0] — служебное (категория или папка)
    else if (el && typeof el === "object" && el.src != null) pics.set(String(el.id ?? i), String(el.src));
  });
  const full = (src: string) => /tiermaker\.com\//i.test(src) ? (/^https?:/i.test(src) ? src : "https://" + src.replace(/^\/+/, ""))
    : `https://tiermaker.com${base.startsWith("/") ? "" : "/"}${base.replace(/\/+$/, "")}/${src.replace(/^\/+/, "")}`;

  const used = new Set<string>(), tiers: {n: string, c: string, items: string[]}[] = [];
  const rows = code.split("==").slice(1).map(x => x.split("|"));
  if (rows.length){
    rows.forEach((p, i) => {
      const ci = p[1] === "-1" || p[1] == null || isNaN(+p[1]) ? i : +p[1];
      const items: string[] = [];
      p.slice(2).forEach(id => { const s = pics.get(id); if (s && !used.has(id)){ used.add(id); items.push(full(s)); } });
      tiers.push({n: decode(p[0]).slice(0, 40) || "?", c: COLORS[ci] || COLORS[i % COLORS.length], items});
    });
  } else {
    // шаблон без расстановки: берём тиры со страницы, картинки — в нераспределённые
    const labels = [...html.matchAll(/class="label"[^>]*>([\s\S]*?)<\/span>/g)].map(m => decode(m[1])).filter(Boolean);
    (labels.length ? labels : ["S", "A", "B", "C", "D"]).forEach((n, i) => tiers.push({n: n.slice(0, 40), c: COLORS[i % COLORS.length], items: []}));
  }
  const pool = [...pics].filter(([id]) => !used.has(id)).sort((a, b) => +a[0] - +b[0]).map(([, s]) => full(s));
  return {title, kind: rows.length ? "list" : "template", source: u.toString(), tiers: tiers.slice(0, 20), extra: tiers.slice(20).flatMap(t => t.items), pool};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers: CORS});
  const url = new URL(req.url);
  const img = url.searchParams.get("img");
  if (img) {
    let t: URL; try { t = new URL(img); } catch { return new Response("bad", {status: 400, headers: CORS}); }
    if (!HOST.test(t.hostname) || t.protocol !== "https:" || !t.pathname.startsWith("/images/")) return new Response("host", {status: 403, headers: CORS});
    const r = await fetch(t, {headers: {"User-Agent": UA, "Referer": "https://tiermaker.com/", "Accept": "image/avif,image/webp,image/*"}});
    if (!r.ok) return new Response("upstream " + r.status, {status: 502, headers: CORS});
    return new Response(r.body, {headers: {...CORS, "Content-Type": r.headers.get("Content-Type") || "image/jpeg", "Cache-Control": "public, max-age=604800"}});
  }
  if (req.method !== "POST") return json({error: "POST"}, 405);
  try {
    const b = await req.json();
    return json(await parse(b.url));
  } catch (e) { return json({error: "TierMaker не ответил: " + String(e && (e as Error).message || e)}); }
});
