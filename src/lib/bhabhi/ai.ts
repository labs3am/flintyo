import { legalCards, type Card, type GameState, type Suit } from "./engine";

export type Difficulty = "easy" | "normal" | "hard";

const SUITS: Suit[] = ["S", "H", "D", "C"];

/** Public card counting: how many cards of each suit are still out there, unseen by us. */
function unseenBySuit(state: GameState, pi: number) {
  const seen = new Map<Suit, Set<number>>(SUITS.map((s) => [s, new Set<number>()]));
  const note = (c: Card) => seen.get(c.s)!.add(c.r);
  state.discard.forEach((x) => note(x.card));
  state.pile.forEach((x) => note(x.card));
  state.players[pi].hand.forEach(note);
  return seen;
}

/** Number of unseen cards of a suit that outrank `r` (i.e. cards opponents could beat us with). */
function higherOutstanding(seen: Map<Suit, Set<number>>, s: Suit, r: number) {
  let n = 0;
  for (let x = r + 1; x <= 14; x++) if (!seen.get(s)!.has(x)) n++;
  return n;
}

function outstanding(seen: Map<Suit, Set<number>>, s: Suit) {
  return 13 - seen.get(s)!.size;
}

/**
 * Bot strategy for Donkey. The bot only ever looks at its own hand and public
 * information (the current pile + everything already discarded).
 *
 * Core principles it plays by:
 *  - You only ever get hurt by holding the highest card of the led suit when
 *    somebody cuts (plays off-suit). So never be the top of the pile unless the
 *    trick is about to close.
 *  - Being void in a suit is powerful: you dump your biggest liability and the
 *    pile lands on someone else.
 *  - High cards are only safe to shed while higher cards are still outstanding.
 */
export function chooseCard(state: GameState, pi: number, level: Difficulty = "normal"): Card | null {
  const options = legalCards(state, pi);
  if (options.length === 0) return null;
  if (options.length === 1) return options[0];

  if (level === "easy") {
    // Loose and forgiving: mostly random, and it happily hangs on to high cards
    // (which is exactly the mistake that gets you stuck with the pile).
    const low = options.filter((c) => c.r <= 9);
    const pool = low.length > 0 && Math.random() < 0.7 ? low : options;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const sloppy = level === "normal" ? 0.2 : 0; // chance of a human-ish imperfect play
  const slip = () => Math.random() < sloppy;

  const seen = unseenBySuit(state, pi);
  const activeOpponents = state.players.filter((p, i) => !p.out && i !== pi).length;
  const lead = state.leadSuit;
  const leading = state.pile.length === 0 || !lead;

  if (leading) {
    const bySuit = new Map<Suit, Card[]>();
    for (const c of options) bySuit.set(c.s, [...(bySuit.get(c.s) ?? []), c]);

    // How likely is it that everybody can follow this suit? If few cards of the
    // suit are left with the opponents, someone is probably void and will cut.
    const cutRisk = (s: Suit) => {
      const out = outstanding(seen, s);
      if (out === 0) return 1; // nobody can follow — guaranteed cut, pile comes back to us
      return Math.max(0, 1 - out / Math.max(1, activeOpponents * 1.6));
    };

    let best: Card | null = null;
    let bestScore = -Infinity;
    for (const c of options) {
      const mine = bySuit.get(c.s)!.length;
      const risk = cutRisk(c.s);
      const higher = higherOutstanding(seen, c.s, c.r);
      // Can we be caught holding the top of this suit?
      const safeFromPile = higher > 0 ? 1 : 0;

      let score = 0;
      // Shedding a big card is worth a lot — but only when somebody can outrank it.
      score += safeFromPile ? (c.r - 2) * 2.2 : -(c.r - 2) * 2.4;
      // Long suits are cheap to lead: opponents are more likely to follow.
      score += mine * 3;
      // Punish leading into a probable cut, hard if we'd be the one picking up.
      score -= risk * (safeFromPile ? 14 : 34);
      // Extra headroom (many higher cards still out) means an even safer lead.
      score += Math.min(higher, 4) * 2.5;
      // Keep a low card back for later leads if we already have safer choices.
      if (c.r <= 5 && mine === 1) score -= 3;

      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (best && !slip()) return best;
    // Fallback / slip: plain "low card from the longest suit".
    let longest: Card[] = [];
    for (const g of bySuit.values()) if (g.length > longest.length) longest = g;
    return (longest.length ? longest : options).reduce((lo, c) => (c.r < lo.r ? c : lo));
  }

  const following = options.filter((c) => c.s === lead);

  if (following.length === 0) {
    // Void: we cut. The pile goes to whoever holds the top of the led suit, so
    // this is our free chance to dump the most dangerous card in hand.
    const danger = (c: Card) => {
      const higher = higherOutstanding(seen, c.s, c.r);
      // A card with nothing above it left is a future pile magnet — dump it now.
      return c.r + (higher === 0 ? 6 : 0) + (outstanding(seen, c.s) <= activeOpponents ? 2 : 0);
    };
    if (slip()) return options.reduce((hi, c) => (c.r > hi.r ? c : hi));
    return options.reduce((hi, c) => (danger(c) > danger(hi) ? c : hi));
  }

  const highOnTable = Math.max(...state.pile.filter((x) => x.card.s === lead).map((x) => x.card.r));
  const lastToAct = state.pile.length + 1 >= state.players.filter((p) => !p.out).length;
  const under = following.filter((c) => c.r < highOnTable);
  const over = following.filter((c) => c.r > highOnTable);

  if (lastToAct) {
    // Closing the trick is free: the pile is discarded, nobody picks it up. So
    // win it with the biggest card we own in the suit and shed a real liability.
    if (over.length > 0 && !slip()) return over.reduce((hi, c) => (c.r > hi.r ? c : hi));
    if (under.length > 0) return under.reduce((hi, c) => (c.r > hi.r ? c : hi));
    return following.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }

  if (under.length > 0) {
    // Stay under the top card: the pile can never land on us this trick.
    // Play as high as we safely can so the dangerous cards leave the hand first.
    return under.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }

  // Forced above the table: play the *lowest* winner so a later player can still
  // overtake us and inherit the risk of the pile.
  if (slip()) return following.reduce((hi, c) => (c.r > hi.r ? c : hi));
  return following.reduce((lo, c) => (c.r < lo.r ? c : lo));
}

/** Reaction timing feels human rather than instant. */
export function botDelay(level: Difficulty = "normal") {
  const base = level === "hard" ? 2000 : level === "easy" ? 1400 : 1700;
  return base + Math.random() * 900;
}

export const BOT_NAMES = ["Ruby", "Milo", "Sable", "Nia", "Kofi", "Vera", "Dash"];
