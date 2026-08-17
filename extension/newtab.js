/* M/O/M Sidecar — new tab takeover */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const send = m => chrome.runtime.sendMessage(m);
let state = {}, offset = 0, card;

(async function init() {
  state = await send({ type: 'GET' }) || {};
  $('#clipCt').textContent = (state.swipe || []).length;
  $('#streakTop').textContent = state.streak || 0;
  $('#streakBig').textContent = state.streak || 0;
  $('#dateline').textContent = new Date().toLocaleDateString('en-IN',
    { weekday: 'long', day: 'numeric', month: 'long' });
  render();
})();

function render() {
  card = momCardOfDay(offset);
  const hero = $('#hero');
  hero.style.backgroundImage = `url('${momArt(card.art, card.acc, 41 + offset * 13)}')`;
  hero.innerHTML = `<div class="scrim"></div>
    <span class="chip" style="color:${card.acc}">${card.cat} · ${offset ? 'From the desk' : 'Card of the day'}</span>
    <h1>${card.t}</h1><p>${card.d}</p>`;
  $('#takeTxt').textContent = card.take;

  const voted = (state.votes || {})[card.id];
  const box = $('#vote');
  box.classList.toggle('done', !!voted);
  if (voted) paint(voted, false);
  $('#save').textContent = 'Save to file';
}

$$('#vote .vb').forEach(b => b.onclick = async () => {
  await send({ type: 'VOTE', id: card.id, choice: b.dataset.v });
  state = await send({ type: 'GET' });
  $('#streakTop').textContent = state.streak || 0;
  $('#streakBig').textContent = state.streak || 0;
  paint(b.dataset.v, true);
});

function paint(choice, animate) {
  const box = $('#vote'); box.classList.add('done');
  let pct = momRoom(card.id) + (choice === 'sharp' ? 2 : -2);
  pct = Math.max(6, Math.min(94, pct));
  const s = box.querySelector('.bar .s'), m = box.querySelector('.bar .m');
  const go = () => { s.style.width = pct + '%'; m.style.width = (100 - pct) + '%'; s.querySelector('b').textContent = pct + '%'; };
  animate ? setTimeout(go, 80) : go();
  const mine = choice === 'sharp' ? pct : 100 - pct;
  box.querySelector('.vline').textContent = mine >= 50
    ? `You're with the ${mine}%. Boringly correct.`
    : `You're in the ${mine}%. Brave. We respect it.`;
}

$('#next').onclick = () => { offset++; render(); };
$('#save').onclick = async () => {
  await send({ type: 'CLIP', item: {
    kind: 'story', title: card.t, format: card.cat, brand: 'M/O/M',
    page: 'https://mad-over-marketing.com/', acc: card.acc, art: card.art, ts: Date.now()
  }});
  state = await send({ type: 'GET' });
  $('#clipCt').textContent = (state.swipe || []).length;
  $('#save').textContent = 'Saved ✓';
};

function search() {
  const q = $('#q').value.trim();
  if (q) location.href = 'https://www.google.com/search?q=' + encodeURIComponent(q);
}
$('#goSearch').onclick = search;
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });

setInterval(() => {
  $('#clock').textContent = new Date().toLocaleTimeString('en-GB',
    { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) + ' IST';
}, 1000);
