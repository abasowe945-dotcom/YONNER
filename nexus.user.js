// ==UserScript==
// @name         NEXUS — оформление с backgrounds.gallery
// @namespace    nexus
// @version      2.2
// @description  Кнопка «В NEXUS» на рамках, аватарах, мини-профилях, стикерах, стартап-мувиках и фонах. Открывает NEXUS, там выбираешь, куда поставить.
// @match        https://backgrounds.gallery/*
// @downloadURL  https://abasowe945-dotcom.github.io/YONNER/nexus.user.js
// @updateURL    https://abasowe945-dotcom.github.io/YONNER/nexus.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  // Адрес NEXUS.
  // (меню Tampermonkey → «NEXUS: адрес сайта», чтобы поменять)
  const DEFAULT_NEXUS = 'https://abasowe945-dotcom.github.io/YONNER/';

  GM_registerMenuCommand('NEXUS: адрес сайта', () => {
    const v = prompt('Адрес NEXUS (как в адресной строке, когда открыт сайт):', GM_getValue('nexus', DEFAULT_NEXUS));
    if (v) GM_setValue('nexus', v.trim());
  });

  function nexusUrl() {
    let v = GM_getValue('nexus', DEFAULT_NEXUS);
    if (!v) {
      v = (prompt('Один раз: вставь адрес NEXUS (скопируй из адресной строки, когда открыт сайт)') || '').trim();
      if (v) GM_setValue('nexus', v);
    }
    return v;
  }

  const LINK = /^\/(item|animated|backgrounds)\/\d+\/\d+/;

  function open(itemUrl) {
    const base = nexusUrl();
    if (!base) return;
    const u = new URL(base, location.href);
    u.searchParams.set('bgimport', itemUrl.split('?')[0]);
    window.open(u.toString(), '_blank');
  }

  function btn(itemUrl, floating) {
    const b = document.createElement('button');
    b.textContent = '+ В NEXUS';
    b.dataset.nexus = '1';
    Object.assign(b.style, {
      background: '#6c2bd9', color: '#fff', border: 'none', borderRadius: '6px',
      padding: floating ? '4px 8px' : '10px 16px', font: '600 12px/1.2 sans-serif',
      cursor: 'pointer', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,.4)',
    });
    if (floating) Object.assign(b.style, { position: 'absolute', top: '6px', left: '6px' });
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); open(itemUrl); });
    return b;
  }

  // страница одного предмета или фона
  function onPage() {
    if (!LINK.test(location.pathname) || document.querySelector('[data-nexus-main]')) return;
    const b = btn(location.href, false);
    b.dataset.nexusMain = '1';
    Object.assign(b.style, { position: 'fixed', right: '20px', bottom: '20px', fontSize: '14px' });
    document.body.appendChild(b);
  }

  // карточки в каталогах (все разделы)
  function onCards() {
    document.querySelectorAll('a[href*="/item/"], a[href*="/backgrounds/"], a[href*="/animated/"]').forEach((a) => {
      if (a.querySelector('[data-nexus]')) return;
      let path;
      try { path = new URL(a.href).pathname; } catch { return; }
      if (!LINK.test(path) || !a.querySelector('img, video, [role="img"], [style*="background-image"]')) return;
      if (getComputedStyle(a).position === 'static') a.style.position = 'relative';
      a.appendChild(btn(a.href, true));
    });
  }

  const run = () => { onPage(); onCards(); };
  run();
  new MutationObserver(() => { clearTimeout(run.t); run.t = setTimeout(run, 300); })
    .observe(document.body, { childList: true, subtree: true });
})();
