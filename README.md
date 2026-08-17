# M/O/M — prototype

An unofficial concept rebuild of Mad Over Marketing's web presence, plus a companion browser extension.

**The premise:** the existing site reports the news. It doesn't have a view, a ritual, or a reason to open tomorrow. So this build adds all three.

---

## The three moves

**1. The news has an opinion.**
Every card flips. Front = what happened. Back = M/O/M's take. The take is the product; the news is the excuse. Their Instagram already works this way — the site doesn't.

**2. The reader is in the room.**
Every card asks *Sharp or Meh*, shows the split, and tells you whether you're with the room or the weirdo. Voting turns a reader into a participant, and a participant comes back to see if they were right.

**3. There's a 9AM.**
Pick your beats → the reel re-orders → the brief is three stories and one question. Ritual beats reach. A daily habit is worth more than a viral week.

---

## Files

```
index.html              the site — single file, no build step, no dependencies
extension/
  manifest.json         MV3
  background.js         service worker: storage, context menu, streaks
  content.js/.css       Ad Radar — finds ad slots on any page
  popup.html/.js        today's card + your swipe file
  newtab.html/.js       new tab takeover
  cards.js              the deck + procedural art generator
  sidecar.css           shared shell
  icons/                generated M/O/M mark
```

## Run the site

Open `index.html`. That's it. Things worth clicking:

- **Hero** — cursor moves the light. The last word swaps on a timer.
- **The Reel** — vertical snap-scroll. Tap a card to flip it. Arrow keys work. The whole room changes colour per story.
- **Rail** — flip / save to swipe file / copy the take to clipboard.
- **Your 9AM** — toggle beats, watch the reel re-order and the brief rebuild.
- **Sidecar** — auto-demos when it scrolls into view. Radar outlines the ad slots, clip flies them into the drawer.
- **Swipe File** (top right) — everything you saved this session.

## Install the extension

1. `chrome://extensions` → Developer mode on
2. Load unpacked → pick the `extension/` folder
3. Open any content site → **Alt+Shift+M**, or right-click → Toggle Ad Radar

What it actually does:
- **Ad Radar** detects ad slots via ad-network selectors and IAB size matching, outlines them, and labels format + dimensions
- **Clip** any unit, image, video or selected copy into your swipe file
- **New tab** = one card, one verdict, a streak counter, and a working search bar
- **Export** the swipe file to JSON

## Ship to GitHub Pages

```bash
git init && git add . && git commit -m "M/O/M prototype"
git branch -M main
git remote add origin https://github.com/<you>/mom-prototype.git
git push -u origin main
```
Settings → Pages → Source: `main` / root. Live in about a minute. `extension/` is ignored by Pages and stays available as a download.

---

## What's real vs. mocked

| Real | Mocked |
|---|---|
| All interactions, transitions, reel mechanics | Story copy — plausible adland placeholders, not reported news |
| Extension logic, storage, ad detection | Vote percentages — seeded numbers, no backend |
| Procedural poster art (SVG, generated per story) | The fake publisher page in the Sidecar demo |

Two things to know before you show it:

- **Session state.** The site keeps your votes and swipe file in memory, so a refresh resets it. That's deliberate for the prototype. When you host it, swap the `swipe` array and `votes` object for `localStorage` — about four lines.
- **The copy is invented.** Swap the `STORIES` array in `index.html` (and `MOM_CARDS` in `cards.js`) for a real feed and nothing else changes. Don't demo the current headlines as if they're M/O/M's actual reporting.

## The honest caveats

The vote counts are the weakest link — they're seeded, and a real version needs a backend or the numbers become a lie the first time two people compare screens. Same for the streak: it's local, so it's a personal ritual, not a leaderboard.

And this is unofficial. It uses M/O/M's name and brand colours to make the argument concrete. If it ever goes past a demo, that's a conversation to have with them first.

---

*Not affiliated with Mad Over Marketing. Built as a concept.*
