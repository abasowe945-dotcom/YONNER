// NEXUS service worker: сайт открывается без сети с последними данными, уведомления на телефоне.
// Правило кэша: сам сайт — сначала сеть (новая версия видна сразу), без сети — из кэша;
// шрифты и библиотеки — из кэша; картинки берёт обычный кэш браузера (они хранятся год);
// чтение из базы (GET к Supabase) — сначала сеть, без сети — последний ответ (полка видна офлайн);
// вход, запись и realtime — только сеть. При выходе из аккаунта кэш данных стирается.
// АВАРИЙНЫЙ ВЫКЛЮЧАТЕЛЬ: поставь KILL = true и закоммить — service worker удалится у всех при следующем заходе.
const KILL = false;
const VERSION = "6.1";
const SITE = "nexus-site", LIBS = "nexus-libs", DATA = "nexus-data";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  if (KILL){
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({type: "window"})) c.navigate(c.url);
    return;
  }
  for (const k of await caches.keys()) if (![SITE, LIBS, DATA].includes(k)) await caches.delete(k);
  await self.clients.claim();
})()));

const LIB_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net", "unpkg.com", "cdnjs.cloudflare.com"];

self.addEventListener("fetch", e => {
  if (KILL) return;
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin){
    if (u.pathname.endsWith("/sw.js")) return;
    e.respondWith(networkFirst(req)); return;
  }
  if (u.hostname.endsWith(".supabase.co") && u.pathname.startsWith("/rest/v1/")){ e.respondWith(dataFirst(req)); return; }
  // всё остальное (вход, запись, realtime, картинки, карта) — мимо service worker
  if (LIB_HOSTS.includes(u.hostname)) e.respondWith(cacheFirst(req, LIBS));
});

async function networkFirst(req){
  const c = await caches.open(SITE);
  try {
    // таймаут только для самой страницы: если она пришла из кэша, то и скрипты возьмутся из кэша той же версии
    const r = req.mode === "navigate" ? await fetchTimeout(req, 6000) : await fetch(req);
    if (r && r.ok) c.put(stripSearch(req), r.clone()).catch(() => {}); // ожидаемо: кончилось место
    return r;
  } catch (err){
    const hit = await c.match(stripSearch(req)) || (req.mode === "navigate" ? await c.match(new URL("./index.html", self.registration.scope).href) || await c.match(self.registration.scope) : null);
    if (hit) return hit;
    throw err;
  }
}
async function dataFirst(req){
  const c = await caches.open(DATA);
  try {
    const r = await fetchTimeout(req, 10000);
    if (r && r.ok) c.put(req, r.clone()).catch(() => {}); // ожидаемо: кончилось место
    return r;
  } catch (err){
    const hit = await c.match(req);
    if (hit){ const h = new Headers(hit.headers); h.set("x-nexus-offline", "1"); return new Response(await hit.blob(), {status: hit.status, headers: h}); }
    throw err;
  }
}
// ?v= меняется с каждой версией — храним по пути без него, чтобы офлайн нашлась последняя копия
const stripSearch = req => { const u = new URL(req.url); if (u.origin === location.origin) u.search = ""; return u.href; };

async function cacheFirst(req, name){
  const c = await caches.open(name);
  const hit = await c.match(req); if (hit) return hit;
  const r = await fetch(req);
  if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()).catch(() => {}); // ожидаемо: кончилось место — просто не кэшируем
  return r;
}
function fetchTimeout(req, ms){ return new Promise((ok, bad) => { const t = setTimeout(() => bad(new Error("timeout")), ms); fetch(req).then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); bad(e); }); }); }

// клик по уведомлению: открыть сайт и сказать странице, что нажали
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const tag = e.notification.tag || "";
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    const w = list[0];
    if (w){ await w.focus(); w.postMessage({nexusNote: tag}); }
    else await self.clients.openWindow(self.registration.scope);
  })());
});
