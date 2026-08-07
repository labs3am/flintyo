# Flintyo — polish pass

## How it feels to play right now

The game itself is solid: dealing, trick logic, pickup, bots, rooms and live sync all work. What's missing is the wrapper around it.

- The first screen is a settings form, not a landing page. Nothing tells a new visitor what the game is or why to play before they must pick a character and a mode.
- Rules are hidden in a collapsed "How to play" line. A first-timer plays a whole round without knowing why they suddenly picked up 6 cards.
- The AI difficulty control only exists in the AI tab. Online-room bots are hard-coded to "normal" and there is no way to see or change difficulty once a game starts — so the setting feels like it does nothing.
- Cards are plain white rectangles: no rank in both corners, no face-card art, no back design, weak feedback on a legal vs illegal play.
- Sharing works but is bare: the WhatsApp message is plain text and the link has no preview image or title, so an invite looks like spam in a chat.
- Branding says "Donkey" everywhere and there is no Labs3am attribution.

## What gets built

### 1. Landing page (new)
Charcoal & Ember palette (#1a1a1a / #2d2d2d / #4a4a4a with #e85d3a accent), applied as design tokens.

- Hero: Flintyo wordmark, one-line pitch, the character line-up, one primary "Play now" button and a secondary "How to play".
- Three short sections: play modes (AI / friends online / one phone), the characters, and a 4-slide illustrated rules explainer.
- Footer: "From the house of Labs3am" with a link, plus a quiet link back to the game.
- The current setup form moves to a `/play` setup sheet reached from "Play now" — the landing page stays a landing page.
- SEO: real title, description, OG and Twitter tags for Flintyo.

### 2. Rename Donkey → Flintyo
App name, page titles, hero, meta tags, share messages and the favicon/manifest text all become Flintyo. The in-game loser stays "the Donkey" (your choice), so the reveal screen keeps its punchline.

### 3. UI + cards
- Redesign `PlayingCard`: rank in both corners, larger suit pip, proper face-card treatment for J/Q/K/A, a patterned card back, and clearer states — playable cards lift, illegal taps shake, the winning card of a trick flashes.
- Consistent surfaces: one panel style, one radius scale, one shadow, all from tokens.
- Table polish: clearer "led suit" marker, softer pickup animation, and the turn ring made obvious on small screens.

### 4. Gameplay
- Difficulty fix (below).
- Show whose turn it is with a countdown ring so the pace is readable.
- "New deal" keeps scores; add an explicit "End match" that shows final standings.
- Small feedback pass: distinct sounds for play / trick won / pickup / you're out.

### 5. Tutorial (both formats)
- 4 swipeable illustrated slides on the landing page and from the setup sheet: deal and Ace of Spades, follow suit, highest wins, can't follow means someone picks up.
- First-game coaching: on a player's first match, non-playable cards dim with a one-line reason, and a short toast explains the first pickup. Dismissible, remembered in local storage.

### 6. Sharing
- Richer WhatsApp text: game name, room code, tappable join link, short "tap to join, no signup" line.
- Copy-link and native-share paths both carry the same message; existing clipboard fallback stays.
- Add an OG preview image so the invite link renders as a card in WhatsApp and iMessage.
- A "Share" button in the results screen too ("I dodged the Donkey — beat that").

### 7. AI difficulty fix
- Move the picker so it applies to every mode with bots, including the online lobby (currently hard-coded to normal there).
- Show the active difficulty as a badge in-game, and allow changing it between deals.
- Make the levels actually feel different: easy plays near-random and rarely dumps high cards, normal plays safe, hard tracks which suits are exhausted, times its high cards to dump on the last actor, and thinks slightly longer.

## Technical notes

- Landing page as a new route at `/`; existing setup UI extracted from `src/pages/Index.tsx` into a setup component used by the play flow.
- Palette swapped in `src/index.css` / `tailwind.config.ts` as HSL tokens; components keep using semantic tokens only.
- Difficulty: add a level control to the room lobby writing `level` into each bot seat in `src/lib/room.ts`; strengthen `src/lib/bhabhi/ai.ts` per level; surface level in `GameTable`.
- Share message and `whatsappUrl` updated in `src/lib/room.ts`; OG image generated into `src/assets` and referenced from `index.html`.
- Tutorial slides as a small self-contained component with a `localStorage` seen-flag.
