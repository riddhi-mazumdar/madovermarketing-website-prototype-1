/* M/O/M Sidecar — the deck.
   In production this is a fetch to the M/O/M feed. Here it's local so the
   prototype works fully offline. Same shape either way. */

const MOM_CARDS = [
  { id:'c1', cat:'MEDIA', acc:'#5FE3C0', art:0,
    t:"The 15-second ad that only runs at 2AM",
    d:"A sleep-tech brand bought insomnia. Same film, one daypart, zero prime time — and the cheapest CPMs on the internet.",
    take:"They didn't buy an audience, they bought a mood. Dayparting is the last honest targeting left." },
  { id:'c2', cat:'CAMPAIGN', acc:'#6DEE86', art:1,
    t:"A biscuit brand turned dunking into a sport",
    d:"Officiated rules, a ranking table, and slow-motion replays of soggy collapse.",
    take:"The idea isn't the tournament, it's that they invented a losing condition. Let people fail publicly and they'll play forever." },
  { id:'c3', cat:'CULTURE', acc:'#C9FF6B', art:2,
    t:"Every young brand now sounds like your therapist",
    d:"Softness as strategy: lowercase, gentle, boundaried. Twelve brands, one voice.",
    take:"When empathy becomes a template it's just a font choice. The next winner in this category will be rude." },
  { id:'c4', cat:'INDIA', acc:'#5FE3C0', art:3,
    t:"Regional isn't a discount. It's the whole market.",
    d:"A fintech shipped nine languages before it shipped dark mode. The curve looks like a hockey stick that learned Bhojpuri.",
    take:"Translation is a cost line. Localisation is a creative brief. The winners rewrote the joke, not the copy." },
  { id:'c5', cat:'TECH', acc:'#6DEE86', art:4,
    t:"AI wrote the brief. The intern fixed it.",
    d:"Billable hours moved from writing the draft to arguing with it.",
    take:"The machine gets you to average in four seconds. Nobody has ever bought anything because it was average." },
  { id:'c6', cat:'DESIGN', acc:'#C9FF6B', art:0,
    t:"The logo shrank. The revenue didn't.",
    d:"Another heritage mark flattened into a sans-serif whisper. The internet screamed. The quarterlies did not.",
    take:"Rebrands are judged on the sentence the logo lets you write next. No new sentence? Expensive tidying." },
  { id:'c7', cat:'OOH', acc:'#5FE3C0', art:1,
    t:"Out-of-home is having an out-of-body moment",
    d:"Anamorphic screens everywhere. Half of it was never meant for the street.",
    take:"If it only works through a phone camera, call it social. The pavement deserves better." }
];

/* today's card is deterministic, so the whole room argues about the same thing */
function momCardOfDay(offset = 0) {
  const day = Math.floor(Date.now() / 864e5);
  return MOM_CARDS[(day + offset) % MOM_CARDS.length];
}

/* procedural poster art — every card gets an original, no image assets */
function momArt(recipe, acc, seed) {
  const R = (n = 1) => { seed = (seed * 9301 + 49297) % 233280; return (seed / 233280) * n; };
  const W = 400, H = 300, k = recipe + '' + seed;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="g' + k + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + acc + '" stop-opacity=".95"/><stop offset="1" stop-color="#07090A"/></linearGradient>' +
    '<radialGradient id="r' + k + '"><stop offset="0" stop-color="' + acc + '" stop-opacity=".9"/>' +
    '<stop offset="1" stop-color="' + acc + '" stop-opacity="0"/></radialGradient>' +
    '<filter id="b' + k + '"><feGaussianBlur stdDeviation="22"/></filter></defs>' +
    '<rect width="' + W + '" height="' + H + '" fill="#0A0D0E"/>';

  if (recipe === 0) {
    s += '<circle cx="200" cy="150" r="150" fill="url(#r' + k + ')" opacity=".5"/>';
    for (let i = 0; i < 13; i++)
      s += '<circle cx="200" cy="150" r="' + (24 + i * 15) + '" fill="none" stroke="' + acc +
        '" stroke-opacity="' + (0.6 - i * .04).toFixed(2) + '" stroke-width="1.2" stroke-dasharray="' +
        (R(160) + 30).toFixed(0) + ' ' + (R(70) + 12).toFixed(0) + '" transform="rotate(' + R(360).toFixed(0) + ' 200 150)"/>';
  }
  if (recipe === 1) {
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#g' + k + ')" opacity=".5"/>';
    for (let y = 0; y < 11; y++) for (let x = 0; x < 15; x++) {
      const d = Math.hypot(x - 7, y - 5), r = Math.max(0, 6.6 - d * .62) * (.55 + R(.7));
      if (r > .4) s += '<circle cx="' + (13 + x * 27) + '" cy="' + (14 + y * 27) + '" r="' + r.toFixed(2) +
        '" fill="' + acc + '" opacity="' + (.3 + R(.5)).toFixed(2) + '"/>';
    }
  }
  if (recipe === 2) {
    for (let i = 0; i < 4; i++)
      s += '<ellipse cx="' + R(400).toFixed(0) + '" cy="' + R(300).toFixed(0) + '" rx="' + (60 + R(110)).toFixed(0) +
        '" ry="' + (55 + R(100)).toFixed(0) + '" fill="' + acc + '" opacity="' + (.18 + R(.3)).toFixed(2) +
        '" filter="url(#b' + k + ')"/>';
    for (let i = 0; i < 12; i++)
      s += '<line x1="0" y1="' + (i * 26) + '" x2="400" y2="' + (i * 26 + (R(30) - 15)).toFixed(0) +
        '" stroke="' + acc + '" stroke-opacity=".13" stroke-width=".8"/>';
  }
  if (recipe === 3) {
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#g' + k + ')" opacity=".4"/>';
    for (let i = -6; i < 20; i++)
      s += '<rect x="' + (i * 32) + '" y="-80" width="' + (4 + R(13)).toFixed(1) + '" height="500" fill="' + acc +
        '" opacity="' + (.1 + R(.32)).toFixed(2) + '" transform="rotate(22 200 150)"/>';
    s += '<circle cx="290" cy="80" r="110" fill="url(#r' + k + ')" opacity=".5"/>';
  }
  if (recipe === 4) {
    s += '<circle cx="170" cy="180" r="170" fill="url(#r' + k + ')" opacity=".45"/>';
    for (let i = 0; i < 6; i++) {
      const rx = 44 + i * 34, ry = 18 + i * 19;
      s += '<ellipse cx="200" cy="150" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + acc +
        '" stroke-opacity="' + (.5 - i * .06).toFixed(2) + '" stroke-width="1.1" transform="rotate(' + (-30 + i * 14) + ' 200 150)"/>';
      s += '<circle cx="' + (200 + rx * Math.cos(i * 1.3)).toFixed(0) + '" cy="' + (150 + ry * Math.sin(i * 1.3)).toFixed(0) +
        '" r="' + (2 + R(3)).toFixed(1) + '" fill="' + acc + '"/>';
    }
  }
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#g' + k + ')" opacity=".18" style="mix-blend-mode:overlay"/></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
}

/* a stable "room verdict" per card so the number doesn't jitter */
function momRoom(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 1000;
  return 46 + (h % 45);
}
