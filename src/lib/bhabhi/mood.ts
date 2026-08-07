import type { Expression } from "@/lib/characters";
import type { GameState } from "./engine";

/**
 * Maps the current game state to the expression a given seat should be wearing.
 * Pure UI-facing derivation — the engine stays free of presentation concerns.
 */
export function expressionFor(state: GameState, seat: number): Expression {
  const p = state.players[seat];
  if (!p) return "idle";

  if (state.phase === "over") {
    if (state.loser === seat) return "defeat";
    return p.place === 1 ? "victory" : "laughing";
  }

  const e = state.event;

  if (e.t === "pickup") {
    if (e.taker === seat) return e.n >= 4 ? "shocked" : "sad";
    if (e.cutter === seat) return "suspicious";
    return "laughing";
  }

  if (e.t === "trick") {
    if (state.justOut.includes(seat)) return "excited";
    if (e.winner === seat) return "confused";
    return "happy";
  }

  if (state.justOut.includes(seat)) return "excited";

  if (e.t === "play" && e.actor === seat) return "happy";

  if (state.turn === seat) return "thinking";

  // Someone is one card away from being stuck with everything.
  const active = state.players.filter((x) => !x.out);
  if (active.length === 2 && !p.out) return "suspicious";

  const cards = p.hand.length;
  if (p.out) return "happy";
  if (cards >= 12) return "sad";
  if (cards <= 2) return "excited";
  return "idle";
}
