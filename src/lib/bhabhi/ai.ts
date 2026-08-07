import { legalCards, type Card, type GameState, type Suit } from "./engine";

export type Difficulty = "easy" | "normal" | "hard";

/**
 * Bot strategy for Bhabhi / Donkey. The bot only ever looks at its own hand and
 * the public pile — it never peeks at hidden information.
 */
export function chooseCard(state: GameState, pi: number, level: Difficulty = "normal"): Card | null {
  const options = legalCards(state, pi);
  if (options.length === 0) return null;

  if (level === "easy") return options[Math.floor(Math.random() * options.length)];

  const lead = state.leadSuit;
  const leading = state.pile.length === 0 || !lead;

  if (leading) {
    const counts = new Map<Suit, Card[]>();
    for (const c of options) counts.set(c.s, [...(counts.get(c.s) ?? []), c]);
    let best: Card[] = [];
    for (const group of counts.values()) {
      if (group.length > best.length) best = group;
      else if (group.length === best.length && best.length > 0) {
        const gLow = Math.min(...group.map((c) => c.r));
        const bLow = Math.min(...best.map((c) => c.r));
        if (gLow < bLow) best = group;
      }
    }
    if (level === "hard") {
      // Prefer leading a suit where we also hold high cards we want to dump early,
      // but still play the lowest of the chosen suit.
      const singles = options.filter((c) => options.filter((o) => o.s === c.s).length === 1);
      if (singles.length > 0 && Math.random() < 0.35) {
        return singles.reduce((hi, c) => (c.r > hi.r ? c : hi));
      }
    }
    return best.reduce((lo, c) => (c.r < lo.r ? c : lo));
  }

  const following = options.filter((c) => c.s === lead);
  if (following.length === 0) {
    // Void: dump the highest card in hand.
    return options.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }

  const highOnTable = Math.max(...state.pile.filter((x) => x.card.s === lead).map((x) => x.card.r));
  const under = following.filter((c) => c.r < highOnTable);
  const lastToAct = state.pile.length + 1 >= state.players.filter((p) => !p.out).length;

  if (under.length > 0) {
    // Hard bots happily win a trick when they are last to act (pile is discarded).
    if (level === "hard" && lastToAct) {
      const over = following.filter((c) => c.r > highOnTable);
      if (over.length > 0) return over.reduce((lo, c) => (c.r < lo.r ? c : lo));
    }
    return under.reduce((hi, c) => (c.r > hi.r ? c : hi));
  }
  return following.reduce((lo, c) => (c.r < lo.r ? c : lo));
}

/** Reaction timing feels human rather than instant. */
export function botDelay(level: Difficulty = "normal") {
  const base = level === "hard" ? 750 : level === "easy" ? 500 : 650;
  return base + Math.random() * 550;
}

export const BOT_NAMES = ["Ruby", "Milo", "Sable", "Nia", "Kofi", "Vera", "Dash"];
