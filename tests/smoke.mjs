// Смоук-тест NEXUS: открывает сайт в Chrome на подменной базе и проверяет, что ни одна страница не падает с ошибкой.
// Запуск: node tests/smoke.mjs  (нужен пакет playwright; в GitHub Actions ставится автоматически)
import fs from "node:fs"; import path from "node:path"; import {fileURLToPath} from "node:url"; import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pw; try { pw = require("playwright"); } catch { pw = require(process.env.PW_PATH || "playwright-core"); }
const fs_index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const ORIGIN = "https://nexus.test", BASE = ORIGIN + "/YONNER/";
const MIME = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".webp": "image/webp"};
const UID = "00000000-0000-0000-0000-000000000001", FUID = "00000000-0000-0000-0000-000000000002";
const now = new Date().toISOString();
function fixtures(nItemsFriend) {
  const items = []; for (let i = 0; i < nItemsFriend; i++) items.push({id: "f" + i, user_id: FUID, data: {title: "Игра " + i, kind: "game", status: "done", added: now}, updated_at: now});
  return {
    profiles: [{user_id: UID, nick: "TESTER", created_at: now}, {user_id: FUID, nick: "FRIEND", created_at: now}],
    public_items: items, is_nexus_admin: true,
    // живая лента: всё от друга, свежее
    events: [{id: "e1", owner: FUID, title: "Шашлыки", created_at: now, kind: "meet"}],
    event_members: [{event_id: "e1", user_id: UID, status: "going", updated_at: now}],
    event_posts: [{id: "ep1", event_id: "e1", user_id: FUID, body: "Беру мангал", created_at: now}],
    event_post_likes: [],
    wall_posts: [{id: "w1", user_id: UID, body: "Мой пост", created_at: now}],
    wall_comments: [{id: "wc1", post_id: "w1", user_id: FUID, body: "Годно", created_at: now}],
    wall_reactions: [{post_id: "w1", user_id: FUID, kind: "fire", created_at: now}], wall_comment_likes: [],
    feedback: [{id: "f1", user_id: FUID, body: "Сделайте тёмную тему темнее", created_at: now}],
    feedback_comments: [{id: "fc1", feedback_id: "f1", user_id: FUID, body: "и ещё", created_at: now}], feedback_votes: [], feedback_comment_likes: [],
    slop_games: [{id: "g1", user_id: UID, title: "Lethal Company", created_at: now, genres: [], screenshots: []}],
    slop_plans: [{id: "sp1", game_id: "g1", user_id: FUID, day: "2026-12-01", created_at: now}], slop_plan_members: [], slop_tiers: [{game_id: "g1", tier: 0, updated_by: FUID, updated_at: now}],
    tierlists: [{id: "t1", user_id: UID, title: "Лучшие шутеры", tiers: [], pool: [], created_at: now}], tierlist_likes: [{tierlist_id: "t1", user_id: FUID, created_at: now}],
    places: [{id: "pl1", user_id: FUID, name: "Тамерлан", created_at: now}], place_visits: [], place_visit_members: [],
    place_ratings: [{place_id: "pl1", user_id: FUID, taste: 5, updated_at: now}], place_dishes: [], place_dish_rates: [], place_wants: [], items: [{id: "m1", user_id: UID, data: {title: "Моя игра", kind: "game", status: "playing", added: now}}],
  };
}
const routes = ["#home", "#games", "#games-future", "#kino", "#kino-future", "#read", "#slop", "#places", "#people", "#more", "#calendar", "#vacation", "#patch", "#user:" + FUID];
async function run() {
  const exe = process.env.CHROME_PATH || undefined;
  const browser = await pw.chromium.launch({executablePath: exe, args: ["--no-sandbox"]});
  const fails = [];
  async function page(session, fx, label) {
    const ctx = await browser.newContext({serviceWorkers: "block"}); const p = await ctx.newPage();
    const errs = []; p.on("pageerror", e => errs.push("pageerror: " + e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) errs.push("console: " + m.text()); });
    await ctx.route("**/*", async r => {
      const u = new URL(r.request().url());
      if (u.origin === ORIGIN) { let f = decodeURIComponent(u.pathname.replace(/^\/YONNER\//, "")) || "index.html"; const fp = path.join(ROOT, f);
        if (fs.existsSync(fp) && fs.statSync(fp).isFile()) return r.fulfill({status: 200, body: fs.readFileSync(fp), contentType: MIME[path.extname(f)] || "application/octet-stream"});
        return r.fulfill({status: 404, body: ""}); }
      if (/supabase-js/.test(u.pathname)) return r.fulfill({status: 200, contentType: "text/javascript", body: fs.readFileSync(path.join(ROOT, "tests/mock-supabase.js"))});
      return r.fulfill({status: 200, contentType: /\.css/.test(u.pathname) || u.host.includes("fonts") ? "text/css" : "text/javascript", body: ""});
    });
    await p.addInitScript(([s, fx]) => { window.__SESSION = s; window.__FX = fx; try { localStorage.setItem("nexus_patch_seen", "9999"); localStorage.setItem("nexus_patch_pop", "9999"); } catch (e) {} }, [session, fx]);
    await p.goto(BASE + "index.html#games"); await p.waitForTimeout(1500);
    return {p, ctx, errs, label};
  }
  // 1. гость: экран входа
  { const {p, ctx, errs} = await page(null, {}, "guest");
    const authShown = await p.evaluate(() => !document.getElementById("auth").hidden);
    if (!authShown) fails.push("гость: не показан экран входа"); errs.forEach(e => fails.push("гость: " + e)); await ctx.close(); }
  // 2. вошедший: обходим все разделы
  { const sess = {user: {id: UID, email: "t@t.t"}, access_token: "x"};
    const {p, ctx, errs} = await page(sess, fixtures(1500), "user");
    const ver = await p.evaluate(() => NEXUS_VER), want = (/js\/01-core\.js\?v=([^"&]+)/.exec(fs_index) || [])[1];
    if (ver !== want) fails.push(`версия сайта не считалась: ${ver} вместо ${want}`);
    // при входе на полку игр не должно грузиться всё сразу
    const early = await p.evaluate(() => window.__SBLOG.length); console.log("запросов при входе (первые 1.5 с):", early);
    if (early > 30) fails.push(`при входе сразу ${early} запросов — ленивая загрузка не работает`);
    await p.waitForTimeout(4000);
    // realtime: лайк под постом мероприятия вписывается на месте, без перезагрузки таблиц
    const rt = await p.evaluate(async () => { const before = window.__SBLOG.length; const n0 = EV ? EV.likes.length : -1;
      window.__RTEMIT("event_post_likes", {eventType: "INSERT", new: {post_id: "p1", user_id: "u9"}, old: {}});
      await new Promise(r => setTimeout(r, 600)); return {extra: window.__SBLOG.slice(before).filter(x => /^event/.test(x.name)).length, grew: (EV ? EV.likes.length : -1) - n0}; });
    if (rt.extra || rt.grew !== 1) fails.push(`realtime: лайк не вписался на месте (${JSON.stringify(rt)})`);
    // живая лента: комменты, лайки, встречи, заведения, книга жалоб, тир-листы
    const feed = await p.evaluate(async () => { location.hash = "#people"; await new Promise(r => setTimeout(r, 800)); actTab = "feed"; renderPeople(); await new Promise(r => setTimeout(r, 300));
      return FGROUPS.flatMap(g => g.ev).map(e => e.verb + " " + (e.title || "")).join("\n"); });
    for (const w of ["написал на встрече", "прокомментировал твой пост", "написал в книгу жалоб", "запланировал катку", "лайкнул твой тир-лист", "добавил заведение", "оценил", "отреагировал на твой пост", "общий тир-лист"])
      if (!feed.includes(w)) fails.push(`живая лента: нет «${w}»`);
    if (process.env.DEBUG) console.log(feed);
    const jump = await p.evaluate(async () => { const b = document.createElement("button"); b.dataset.actref = "place:pl1"; document.body.appendChild(b); b.click(); b.remove(); await new Promise(r => setTimeout(r, 500)); return location.hash; });
    if (!/place/.test(jump)) fails.push("живая лента: клик по заведению не открыл его (" + jump + ")");
    for (const r of routes) { await p.evaluate(h => { location.hash = h; }, r); await p.waitForTimeout(400); }
    const fr = await p.evaluate(fid => { try { return typeof frItems === "function" ? frItems(fid).length : -1; } catch (e) { return -2; } }, FUID);
    if (fr !== 1500) fails.push(`полка друга: загружено ${fr} из 1500 записей`);
    const log = await p.evaluate(() => window.__SBLOG.length); console.log("запросов к базе за сессию:", log);
    // журнал ошибок: ошибка уходит в client_errors, окно журнала открывается
    const sent = await p.evaluate(async () => { logErr("тест", new Error("проверка журнала")); await new Promise(r => setTimeout(r, 300)); return window.__SBLOG.some(x => x.name === "client_errors" && x.ops.includes("insert")); });
    if (!sent) fails.push("журнал ошибок: ошибка не отправилась в базу");
    await p.evaluate(() => { location.hash = "#more"; }); await p.waitForTimeout(400);
    const tile = await p.evaluate(async () => { document.querySelector('[data-fold="site"]').click(); await new Promise(r => setTimeout(r, 600)); const b = document.querySelector("[data-errlog]"); if (!b) return false; b.click(); await new Promise(r => setTimeout(r, 400)); return !!document.getElementById("elList"); });
    if (!tile) fails.push("журнал ошибок: нет плитки или окна у владельца");
    errs.forEach(e => fails.push("вошедший: " + e)); await ctx.close(); }
  await browser.close();
  if (fails.length) { console.error("ПРОВАЛ:\n - " + [...new Set(fails)].join("\n - ")); process.exit(1); }
  console.log("OK: все разделы открылись без ошибок");
}
run().catch(e => { console.error(e); process.exit(1); });
