/* M/O/M Sidecar — popup */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const send = m => chrome.runtime.sendMessage(m);
let state = {};

init();
async function init() {
  state = (await send({ type: 'GET' })) || {};
  $('#tog').classList.toggle('on', !!state.radar);
  $('#streak').textContent = state.streak || 0;
  renderToday();
  renderFile();
}

$$('.tab').forEach(t => t.onclick = () => {
  $$('.tab').forEach(x => x.classList.remove('on'));
  $$('.pane').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  $('#' + t.dataset.p).classList.add('on');
});

$('#tog').onclick = async () => {
  const on = !$('#tog').classList.contains('on');
  $('#tog').classList.toggle('on', on);
  await send({ type: 'RADAR', on });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: 'RADAR', on }).catch(() => {});
};

function renderToday() {
  const c = momCardOfDay();
  const voted = (state.votes || {})[c.id];
  $('#today').innerHTML =
    '<div class="card" style="background-image:url(\'' + momArt(c.art, c.acc, 41) + '\')">' +
      '<div class="scrim"></div>' +
      '<span class="chip" style="color:' + c.acc + '">' + c.cat + ' · Card of the day</span>' +
      '<h3>' + c.t + '</h3><p>' + c.d + '</p></div>' +
    '<div class="takebox"><b>M/O/M\'s take</b><p>' + c.take + '</p></div>' +
    '<div class="vote ' + (voted ? 'done' : '') + '" id="vote">' +
      '<div class="vote-btns">' +
        '<button class="vb sharp" data-v="sharp">Sharp</button>' +
        '<button class="vb meh" data-v="meh">Meh</button></div>' +
      '<div class="vote-res"><div class="bar"><i class="s">Sharp <b style="margin-left:5px"></b></i>' +
      '<i class="m">Meh</i></div><div class="vline"></div></div></div>' +
    '<div class="actions"><button class="mini" id="saveCard">Save to file</button>' +
    '<button class="mini" id="openSite">Open M/O/M ↗</button></div>';

  if (voted) paint(c, voted, false);

  $$('#vote .vb').forEach(b => b.onclick = async () => {
    await send({ type: 'VOTE', id: c.id, choice: b.dataset.v });
    state = await send({ type: 'GET' });
    $('#streak').textContent = state.streak || 0;
    paint(c, b.dataset.v, true);
  });
  $('#saveCard').onclick = async () => {
    await send({ type: 'CLIP', item: {
      kind: 'story', title: c.t, format: c.cat, brand: 'M/O/M',
      page: 'https://mad-over-marketing.com/', acc: c.acc, art: c.art, ts: Date.now()
    }});
    $('#saveCard').textContent = 'Saved ✓';
    state = await send({ type: 'GET' });
    renderFile();
  };
  $('#openSite').onclick = () => chrome.tabs.create({ url: 'https://mad-over-marketing.com/' });
}

function paint(c, choice, animate) {
  const box = $('#vote');
  box.classList.add('done');
  let pct = momRoom(c.id) + (choice === 'sharp' ? 2 : -2);
  pct = Math.max(6, Math.min(94, pct));
  const s = box.querySelector('.bar .s'), m = box.querySelector('.bar .m');
  const go = () => {
    s.style.width = pct + '%';
    m.style.width = (100 - pct) + '%';
    s.querySelector('b').textContent = pct + '%';
  };
  animate ? setTimeout(go, 60) : go();
  const mine = choice === 'sharp' ? pct : 100 - pct;
  box.querySelector('.vline').textContent = mine >= 50
    ? "You're with the " + mine + '%. Boringly correct.'
    : "You're in the " + mine + '%. Brave. We respect it.';
}

function renderFile() {
  const swipe = state.swipe || [];
  $('#count').textContent = swipe.length;
  $('#grid').innerHTML = swipe.length ? swipe.map(s => {
    const img = s.src || momArt(s.art == null ? 2 : s.art, s.acc || '#5FE3C0', (s.title || 'x').length * 7 + 3);
    return '<div class="clip" style="background-image:url(\'' + img + '\')">' +
      '<span class="fmt">' + esc(s.format || 'Clip') + '</span>' +
      '<button class="x" data-x="' + s.id + '" title="Remove">×</button>' +
      '<div class="ttl">' + esc(trim(s.title, 64)) + '</div></div>';
  }).join('') : '<div class="empty">Swipe file is empty.<br>Turn on Ad Radar and clip<br>the first thing that annoys you.</div>';

  $$('#grid .x').forEach(b => b.onclick = async () => {
    await send({ type: 'REMOVE', id: b.dataset.x });
    state = await send({ type: 'GET' });
    renderFile();
  });
}

$('#export').onclick = () => {
  const blob = new Blob([JSON.stringify(state.swipe || [], null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  if (chrome.downloads) chrome.downloads.download({ url, filename: 'mom-swipe-file-' + Date.now() + '.json' });
  else chrome.tabs.create({ url });
};

const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const trim = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
