/* ────────────────────────────────────────────────────────────
   M/O/M Sidecar — service worker
   Owns: context menu, swipe-file storage, radar state, streaks
   ──────────────────────────────────────────────────────────── */

const DEFAULTS = { swipe: [], radar: false, votes: {}, streak: 0, lastDay: null };

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const seed = {};
  for (const k in DEFAULTS) if (cur[k] === undefined) seed[k] = DEFAULTS[k];
  if (Object.keys(seed).length) await chrome.storage.local.set(seed);

  chrome.contextMenus.create({
    id: 'clip-image',
    title: 'Clip this creative to M/O/M swipe file',
    contexts: ['image', 'video']
  });
  chrome.contextMenus.create({
    id: 'clip-selection',
    title: 'Clip this copy to M/O/M swipe file',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'toggle-radar',
    title: 'Toggle Ad Radar on this page',
    contexts: ['page']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'toggle-radar') return toggleRadar(tab);
  const host = safeHost(info.pageUrl || (tab && tab.url));
  const isCopy = info.menuItemId === 'clip-selection';
  await clip({
    kind: isCopy ? 'copy' : 'creative',
    title: isCopy ? truncate(info.selectionText, 120) : ((tab && tab.title) || host),
    src: info.srcUrl || null,
    page: info.pageUrl || (tab && tab.url) || '',
    brand: host,
    format: info.mediaType === 'video' ? 'Video' : (isCopy ? 'Copy' : 'Image'),
    ts: Date.now()
  });
});

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'toggle-radar') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggleRadar(tab);
});

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  (async () => {
    switch (msg.type) {
      case 'CLIP':   await clip(msg.item); respond({ ok: true, count: await count() }); break;
      case 'GET':    respond(await chrome.storage.local.get(null)); break;
      case 'VOTE':   await vote(msg.id, msg.choice); respond({ ok: true }); break;
      case 'CLEAR':  await chrome.storage.local.set({ swipe: [] }); badge(0); respond({ ok: true }); break;
      case 'RADAR':  await chrome.storage.local.set({ radar: msg.on }); respond({ ok: true }); break;
      case 'REMOVE': {
        const { swipe = [] } = await chrome.storage.local.get('swipe');
        const next = swipe.filter(s => s.id !== msg.id);
        await chrome.storage.local.set({ swipe: next });
        badge(next.length);
        respond({ ok: true });
        break;
      }
      default: respond({ ok: false });
    }
  })();
  return true; // keep the channel open for the async reply
});

async function toggleRadar(tab) {
  const { radar } = await chrome.storage.local.get('radar');
  const on = !radar;
  await chrome.storage.local.set({ radar: on });
  if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: 'RADAR', on }).catch(() => {});
}

async function clip(item) {
  const { swipe = [] } = await chrome.storage.local.get('swipe');
  item.id = 'c' + Date.now() + Math.random().toString(36).slice(2, 6);
  swipe.unshift(item);
  const next = swipe.slice(0, 400);
  await chrome.storage.local.set({ swipe: next });
  badge(next.length);
}

async function count() {
  const { swipe = [] } = await chrome.storage.local.get('swipe');
  return swipe.length;
}

async function vote(id, choice) {
  const { votes = {}, streak = 0, lastDay } = await chrome.storage.local.get(['votes', 'streak', 'lastDay']);
  votes[id] = choice;
  const today = new Date().toDateString();
  let s = streak;
  if (lastDay !== today) s = (lastDay === yesterday()) ? streak + 1 : 1;
  await chrome.storage.local.set({ votes, streak: s, lastDay: today });
}

function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); }
function badge(n) {
  chrome.action.setBadgeText({ text: n ? String(n) : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#5FE3C0' });
}
function safeHost(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'unknown'; } }
function truncate(s, n) { s = (s || '').trim(); return s.length > n ? s.slice(0, n) + '…' : s; }
