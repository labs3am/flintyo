export type Suit = "S" | "H" | "D" | "C";

export type Card = { id: string; r: number; s: Suit };

export type Player = {
  id: string;
  name: string;
  bot: boolean;
  /** character id from src/lib/characters */
  char?: string;
  /** ai difficulty for bot seats */
  level?: "easy" | "normal" | "hard";
  hand: Card[];
  out: boolean;
  place: number | null;
};

export type PlayedCard = { p: number; card: Card };

/** Structured description of the last thing that happened — drives character reactions. */
export type GameEvent =
  | { t: "deal" }
  | { t: "play"; actor: number }
  | { t: "trick"; winner: number }
  | { t: "pickup"; taker: number; cutter: number; n: number }
  | { t: "over"; loser: number | null };

export type GameState = {
  players: Player[];
  pile: PlayedCard[];
  /** Every card that has left play this round (completed tricks), oldest first. */
  discard: PlayedCard[];
  leadSuit: Suit | null;
  turn: number;
  leader: number;
  phase: "playing" | "over";
  loser: number | null;
  lastEvent: string;
  event: GameEvent;
  /** Snapshot of the cards on the table when the last trick resolved (so everyone can see them). */
  lastTrick: { cards: PlayedCard[]; kind: "trick" | "pickup"; who: number } | null;
  /** seats that went safe on the most recent resolution */
  justOut: number[];
  log: string[];
  seq: number;
};

export const SUITS: Suit[] = ["S", "H", "D", "C"];
export const SUIT_SYMBOL: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
export const SUIT_NAME: Record<Suit, string> = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" };
export const isRed = (s: Suit) => s === "H" || s === "D";

export function rankLabel(r: number): string {
  if (r === 14) return "A";
  if (r === 13) return "K";
  if (r === 12) return "Q";
  if (r === 11) return "J";
  return String(r);
}

export const cardLabel = (c: Card) => `${rankLabel(c.r)}${SUIT_SYMBOL[c.s]}`;

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (let r = 2; r <= 14; r++) deck.push({ id: `${r}${s}`, r, s });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sortHand(hand: Card[]): Card[] {
  const order: Record<Suit, number> = { S: 0, H: 1, C: 2, D: 3 };
  return [...hand].sort((a, b) => (order[a.s] - order[b.s]) || a.r - b.r);
}

export type SeatSpec = {
  id: string;
  name: string;
  bot: boolean;
  char?: string;
  level?: "easy" | "normal" | "hard";
};

export function createGame(seats: SeatSpec[]): GameState {
  const deck = shuffle(buildDeck());
  const players: Player[] = seats.map((s) => ({ ...s, hand: [], out: false, place: null }));
  deck.forEach((card, i) => players[i % players.length].hand.push(card));
  players.forEach((p) => (p.hand = sortHand(p.hand)));

  const starter = players.findIndex((p) => p.hand.some((c) => c.id === "14S"));
  const turn = starter >= 0 ? starter : 0;

  return {
    players,
    pile: [],
    discard: [],
    leadSuit: null,
    turn,
    leader: turn,
    phase: "playing",
    loser: null,
    lastEvent: `${players[turn].name} holds the Ace of Spades and leads.`,
    event: { t: "deal" },
    lastTrick: null,
    justOut: [],
    log: [],
    seq: 0,
  };
}

export function activeCount(s: GameState): number {
  return s.players.filter((p) => !p.out).length;
}

function nextActive(s: GameState, from: number): number {
  const n = s.players.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step) % n;
    if (!s.players[i].out) return i;
  }
  return from;
}

export function legalCards(s: GameState, pi: number): Card[] {
  const p = s.players[pi];
  if (s.phase === "over" || p.out || s.turn !== pi) return [];
  if (s.pile.length === 0 || !s.leadSuit) return p.hand;
  const follow = p.hand.filter((c) => c.s === s.leadSuit);
  return follow.length > 0 ? follow : p.hand;
}

function highestOfLead(pile: PlayedCard[], lead: Suit): PlayedCard {
  return pile
    .filter((x) => x.card.s === lead)
    .reduce((best, x) => (x.card.r > best.card.r ? x : best));
}

function settleOuts(s: GameState): boolean {
  let placed = s.players.filter((p) => p.out).length;
  s.justOut = [];
  s.players.forEach((p, i) => {
    if (!p.out && p.hand.length === 0) {
      p.out = true;
      p.place = ++placed;
      s.justOut.push(i);
      s.log.unshift(`${p.name} is safe (finished #${p.place}).`);
    }
  });
  if (activeCount(s) <= 1) {
    const last = s.players.findIndex((p) => !p.out);
    s.phase = "over";
    s.loser = last >= 0 ? last : null;
    s.lastEvent = last >= 0 ? `${s.players[last].name} is the Donkey! 🫏` : "Everyone got out — nobody is the Donkey!";
    s.event = { t: "over", loser: s.loser };
    s.log.unshift(s.lastEvent);
    return true;
  }
  return false;
}

export function playCard(state: GameState, pi: number, cardId: string): GameState {
  const s: GameState = structuredClone(state);
  if (s.phase === "over" || s.turn !== pi) return state;

  const player = s.players[pi];
  const idx = player.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return state;
  const legal = legalCards(state, pi).some((c) => c.id === cardId);
  if (!legal) return state;

  const [card] = player.hand.splice(idx, 1);
  if (s.pile.length === 0) s.lastTrick = null;
  s.pile.push({ p: pi, card });
  s.seq++;
  s.justOut = [];
  if (s.pile.length === 1) s.leadSuit = card.s;
  const lead = s.leadSuit!;

  const cutRound = s.pile.length > 1 && card.s !== lead;
  const everyonePlayed = nextActive(s, pi) === s.leader && s.pile.length > 1;

  if (cutRound) {
    const taker = highestOfLead(s.pile, lead);
    const takerP = s.players[taker.p];
    const n = s.pile.length;
    takerP.hand = sortHand([...takerP.hand, ...s.pile.map((x) => x.card)]);
    s.log.unshift(
      `${player.name} had no ${SUIT_NAME[lead].toLowerCase()} — ${takerP.name} picks up ${n} cards.`,
    );
    s.lastEvent = `${takerP.name} picks up the pile (${n} cards).`;
    s.event = { t: "pickup", taker: taker.p, cutter: pi, n };
    s.lastTrick = { cards: s.pile, kind: "pickup", who: taker.p };
    s.pile = [];
    s.leadSuit = null;
    const over1 = settleOuts(s);
    if (!over1) {
      s.leader = takerP.out ? nextActive(s, taker.p) : taker.p;
      s.turn = s.leader;
    }
    return s;
  }

  if (everyonePlayed) {
    const winner = highestOfLead(s.pile, lead);
    const winP = s.players[winner.p];
    s.log.unshift(`${winP.name} took the trick with ${cardLabel(winner.card)} — pile discarded.`);
    s.lastEvent = `${winP.name} wins the trick with ${cardLabel(winner.card)}.`;
    s.event = { t: "trick", winner: winner.p };
    s.lastTrick = { cards: s.pile, kind: "trick", who: winner.p };
    s.discard = [...s.discard, ...s.pile];
    s.pile = [];
    s.leadSuit = null;
    const over2 = settleOuts(s);
    if (!over2) {
      s.leader = winP.out ? nextActive(s, winner.p) : winner.p;
      s.turn = s.leader;
    }
    return s;
  }

  s.turn = nextActive(s, pi);
  s.lastTrick = null;
  s.lastEvent = `${player.name} played ${cardLabel(card)}.`;
  s.event = { t: "play", actor: pi };
  return s;
}
