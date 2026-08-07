import { legalCards, type Card, type GameState, type Suit } from "./engine";

export type Difficulty = "easy" | "normal" | "hard";

/**
 * Bot strategy for Bhabhi / Donkey. The bot only ever looks at its own hand and
 * public information (the current pile + everything already discarded).
 */
export function chooseCard(state: GameState, pi: number, level: Difficulty = "normal"): Card | null {
  const options = legalCards(state, pi);
  if (options.length === 0) return null;

  if (level === "easy") {
    // Loose and forgiving: mostly random, and it happily hangs on to high cards
    // (which is exactly the mistake that gets you stuck with the pile).
    const low = options.filter((c) => c.r <= 9);
    const pool = low.length > 0 && Math.random() < 0.7 ? low : options;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const lead = state.leadSuit;
  const leading = state.pile.length === 0 || !lead;

  // Public knowledge: how many cards of each suit have already been seen.
  const seen = new Map<Suit, number>();
  const note = (c: Card) => seen.set(c.s, (seen.get(c.s) ?? 0) + 1);
  state.discard.forEach((x) => note(x.card));
  state.pile.forEach((x) => note(x.card));
  options.forEach(note);
  const exhausted = (s: Suit) => (seen.get(s) ?? 0) >= 13;

  if (leading) {
    const bySuit = new Map<Suit, Card[]>();
    for (const c of options) bySuit.set(c.s, [...(bySuit.get(c.s) ?? []), c]);

    if (level === "hard") {
      // Leading a suit nobody can follow means the pile comes straight back to us,
      // so avoid dead suits and prefer dumping our dangerous high cards early.
      const singles = options.filter((c) => (bySuit.get(c.s)?.length ?? 0) === 1 && !exhausted(c.s));
      if (singles.length > 0 && Math.random() < 0.5) {
        return singles.reduce((hi, c) => (c.r > hi.r ? c : hi));
      }
    }

    let best: Card[] = [];
    for (const group of bySuit.values()) {
      if (level === "hard" && exhausted(group[0].s) && best.length > 0) continue;
      if (group.length > best.length) best = group;
      else if (group.length === best.length && best.length > 0) {
        const gLow = Math.min(...group.map((c) => c.r));
        const bLow = Math.min(...best.map((c) => c.r));
        if (gLow < bLow) best = group;
      }
    }
    if (best.length === 0) best = options;
    return best.reduce((lo, c) => (c.r < lo.r ? c : lo));
  }

  const following = options.filter((c) => c.s === lead);
  if (following.length === 0) {
    // Void: dump the highest card in hand — hard bots dump the highest card of the
    // suit that is most likely to hurt them later.
    if (level === "hard") {
      const scored = options.map((c) => ({ c, w: c.r + (exhausted(c.s) ? 4 : 0) }));
      return scored.reduce((hi, x) => (x.w > hi.w ? x : hi)).c;
    }
    return options.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }

  const highOnTable = Math.max(...state.pile.filter((x) => x.card.s === lead).map((x) => x.card.r));
  const under = following.filter((c) => c.r < highOnTable);
  const lastToAct = state.pile.length + 1 >= state.players.filter((p) => !p.out).length;

  if (under.length > 0) {
    // Winning the trick as the last actor is free — the pile is discarded.
    if (level === "hard" && lastToAct) {
      const over = following.filter((c) => c.r > highOnTable);
      if (over.length > 0) return over.reduce((hi, c) => (c.r > hi.r ? c : hi));
    }
    return under.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }
  return following.reduce((lo, c) => (c.r < lo.r ? c : lo));
}

/** Reaction timing feels human rather than instant. */
export function botDelay(level: Difficulty = "normal") {
  const base = level === "hard" ? 900 : level === "easy" ? 420 : 650;
  return base + Math.random() * 550;
}

export const BOT_NAMES = ["Ruby", "Milo", "Sable", "Nia", "Kofi", "Vera", "Dash"];
