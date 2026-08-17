/* ────────────────────────────────────────────────────────────
   M/O/M Sidecar — Ad Radar
   Heuristically finds ad slots on any page, outlines them,
   and drops a one-click "clip to swipe file" affordance.
   ──────────────────────────────────────────────────────────── */
(() => {
  if (window.__momSidecar) return;
  window.__momSidecar = true;

  let on = false;
  const marked = new WeakSet();

  /* how you spot an ad without an ad server */
  const SEL = [
    'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
    'iframe[id^="google_ads"]', 'iframe[src*="adservice"]', 'iframe[src*="/ads/"]',
    'ins.adsbygoogle', '[id^="div-gpt-ad"]', '[data-google-query-id]',
    '[class*="advert" i]', '[class*="ad-slot" i]', '[class*="ad-unit" i]',
    '[class*="sponsored" i]', '[data-ad-slot]', '[aria-label*="advertisement" i]'
  ].join(',');

  const IAB = [
    [728, 90, 'Leaderboard'], [300, 250, 'MPU / Medium Rectangle'], [300, 600, 'Half Page'],
    [320, 50, 'Mobile Banner'], [970, 250, 'Billboard'], [160, 600, 'Skyscraper'],
    [336, 280, 'Large Rectangle'], [320, 100, 'Large Mobile Banner']
  ];

  function formatOf(el) {
    const r = el.getBoundingClientRect();
    let best = null, bestD = 1e9;
    for (const [w, h, name] of IAB) {
      const d = Math.abs(r.width - w) + Math.abs(r.height - h);
      if (d < bestD) { bestD = d; best = name; }
    }
    if (bestD < 90) return best;
    if (r.width > r.height * 3) return 'Banner';
    if (r.height > r.width * 1.4) return 'Vertical unit';
    return 'Display unit';
  }

  function candidates() {
    const out = new Set();
    document.querySelectorAll(SEL).forEach(e => out.add(e));
    document.querySelectorAll('iframe').forEach(f => {
      const r = f.getBoundingClientRect();
      if (r.width < 90 || r.height < 40) return;
      if (IAB.some(([w, h]) => Math.abs(r.width - w) < 24 && Math.abs(r.height - h) < 24)) out.add(f);
    });
    return [...out].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 60 && r.height > 30;
    });
  }

  function mark(el) {
    if (marked.has(el)) return;
    marked.add(el);
    el.classList.add('mom-radar-hit');

    const wrap = document.createElement('div');
    wrap.className = 'mom-radar-chrome';
    const r = el.getBoundingClientRect();
    place(wrap, r);
    wrap.innerHTML =
      '<span class="mom-tag">' + formatOf(el) + ' · ' + Math.round(r.width) + '×' + Math.round(r.height) + '</span>' +
      '<button class="mom-clip" type="button">Clip</button>';

    wrap.querySelector('.mom-clip').addEventListener('click', (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      const img = el.querySelector && el.querySelector('img');
      chrome.runtime.sendMessage({
        type: 'CLIP',
        item: {
          kind: 'creative',
          title: document.title || location.hostname,
          src: (img && img.src) || (el.tagName === 'IFRAME' ? el.src : null),
          page: location.href,
          brand: location.hostname.replace(/^www\./, ''),
          format: formatOf(el),
          size: Math.round(r.width) + '×' + Math.round(r.height),
          ts: Date.now()
        }
      });
      const b = ev.currentTarget;
      b.textContent = 'Clipped ✓'; b.classList.add('done');
      setTimeout(() => { b.textContent = 'Clip'; b.classList.remove('done'); }, 1600);
    });

    document.body.appendChild(wrap);
    el.__momChrome = wrap;
  }

  function place(node, r) {
    node.style.top = (r.top + scrollY) + 'px';
    node.style.left = (r.left + scrollX) + 'px';
    node.style.width = r.width + 'px';
    node.style.height = r.height + 'px';
  }

  function reposition() {
    document.querySelectorAll('.mom-radar-hit').forEach(el => {
      if (el.__momChrome) place(el.__momChrome, el.getBoundingClientRect());
    });
  }

  function sweep() {
    if (!on) return;
    candidates().forEach(mark);
    const c = document.querySelectorAll('.mom-radar-hit').length;
    hud('Ad Radar · ' + c + ' unit' + (c === 1 ? '' : 's') + ' on this page');
  }

  function hud(text) {
    let h = document.querySelector('.mom-hud');
    if (!h) { h = document.createElement('div'); h.className = 'mom-hud'; document.body.appendChild(h); }
    h.textContent = text;
    h.classList.add('show');
    clearTimeout(h.__t);
    h.__t = setTimeout(() => h.classList.remove('show'), 2800);
  }

  function enable(v) {
    on = v;
    document.documentElement.classList.toggle('mom-radar-on', v);
    if (v) {
      const s = document.createElement('div');
      s.className = 'mom-scan';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
      sweep();
    } else {
      document.querySelectorAll('.mom-radar-chrome').forEach(n => n.remove());
      document.querySelectorAll('.mom-radar-hit').forEach(n => {
        n.classList.remove('mom-radar-hit');
        delete n.__momChrome;
      });
      hud('Ad Radar off');
    }
  }

  chrome.runtime.onMessage.addListener((m) => { if (m.type === 'RADAR') enable(m.on); });
  chrome.storage.local.get('radar').then(({ radar }) => { if (radar) enable(true); });

  addEventListener('scroll', () => { if (on) reposition(); }, { passive: true });
  addEventListener('resize', () => { if (on) reposition(); });
  new MutationObserver(() => { if (on) sweep(); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => { if (on) sweep(); }, 2500);
})();
