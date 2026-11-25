// NEXUS: прокси к Supabase через Yandex Cloud Functions, чтобы сайт открывался в России без VPN.
// Браузер ходит на адрес функции (сервер Яндекса в России), а функция уже сама — в Supabase.
// Адрес вызова: https://functions.yandexcloud.net/<id функции>?p=<путь в Supabase, например /rest/v1/items?select=*>
// Среда: Node.js 18 или новее. Точка входа: index.handler. Память: 128 МБ. Таймаут: 30 с.
// Дополнительные настройки: включить «Одновременные вызовы экземпляра функции» и поставить 16 (иначе запросы идут по одному и сайт не успевает загрузиться).
const zlib = require("zlib");

const UPSTREAM = process.env.UPSTREAM || "https://dtlcqupalwrlcwyzrptq.supabase.co";
// с каких сайтов можно звать прокси (остальным браузер не отдаст ответ)
const ORIGINS = ["https://abasowe945-dotcom.github.io", "http://localhost:8080", "http://127.0.0.1:8080"];
// только эти разделы Supabase, больше ничего через прокси не пускаем
const PATHS = /^\/(rest|auth|storage|functions)\/v1\//;
// заголовки запроса, которые не передаём дальше
const DROP_REQ = new Set(["host", "origin", "referer", "cookie", "content-length", "accept-encoding", "connection", "x-forwarded-for", "x-forwarded-proto", "x-real-ip", "x-request-id", "x-trace-id", "x-envoy-external-address", "x-serverless-gateway-id", "uber-trace-id"]);
// заголовки ответа, которые не отдаём браузеру
const DROP_RES = new Set(["content-encoding", "content-length", "transfer-encoding", "connection", "set-cookie", "server", "via", "alt-svc", "strict-transport-security", "report-to", "nel"]);

function cors(origin, reqHeaders){
  const o = ORIGINS.includes(origin) ? origin : ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": o, "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, HEAD, OPTIONS",
    // что браузер просит в предзапросе, то и разрешаем (supabase-js добавляет свои заголовки, например x-supabase-api-version)
    "Access-Control-Allow-Headers": reqHeaders || "authorization, apikey, content-type, x-client-info, x-supabase-api-version, prefer, range, range-unit, accept-profile, content-profile, x-upsert, cache-control, accept",
    "Access-Control-Expose-Headers": "content-range, content-type, x-total-count, preference-applied, etag, location",
    "Access-Control-Max-Age": "86400"
  };
}

module.exports.handler = async function (event) {
  const H = {}; for (const [k, v] of Object.entries(event.headers || {})) H[k.toLowerCase()] = v;
  const method = (event.httpMethod || "GET").toUpperCase(), base = cors(H.origin || "", H["access-control-request-headers"]);
  if (method === "OPTIONS") return {statusCode: 204, headers: base, body: ""};

  const p = (event.queryStringParameters || {}).p || "";
  if (!PATHS.test(p)) return {statusCode: 400, headers: base, body: "bad path"};

  const headers = {}; for (const [k, v] of Object.entries(H)) if (!DROP_REQ.has(k) && !k.startsWith("x-yc-") && !k.startsWith("x-forwarded")) headers[k] = v;
  let body;
  if (!["GET", "HEAD"].includes(method) && event.body) body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;

  let r;
  try { r = await fetch(UPSTREAM + p, {method, headers, body, redirect: "manual"}); }
  catch (e) { return {statusCode: 502, headers: base, body: "upstream: " + (e && e.message)}; }

  const out = {...base};
  r.headers.forEach((v, k) => { if (!DROP_RES.has(k) && !k.startsWith("access-control-") && !k.startsWith("cf-") && !k.startsWith("sb-")) out[k] = v; });
  let buf = Buffer.from(await r.arrayBuffer());
  const type = String(r.headers.get("content-type") || "");
  // текст жмём сами: ответы базы большие, а провайдеру меньше работы
  if (buf.length > 1024 && /json|text|javascript/.test(type) && /gzip/.test(H["accept-encoding"] || "")){ buf = zlib.gzipSync(buf); out["Content-Encoding"] = "gzip"; }
  return {statusCode: r.status, headers: out, body: buf.toString("base64"), isBase64Encoded: true};
};
