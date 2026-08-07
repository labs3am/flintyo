import type { GameState } from "./engine";

export type ScoreRow = { points: number; donkeys: number; rounds: number };
export type Scores = Record<string, ScoreRow>;

const blank = (): ScoreRow => ({ points: 0, donkeys: 0, rounds: 0 });

/**
 * Scoring: survive a round (don't end up the Donkey) = 1 point.
 * Finishing early is rewarded — first out gets a bonus point.
 */
export function applyResult(scores: Scores, state: GameState): Scores {
  const next: Scores = { ...scores };
  state.players.forEach((p) => {
    const row = { ...(next[p.id] ?? blank()) };
    row.rounds += 1;
    if (state.loser != null && state.players[state.loser].id === p.id) {
      row.donkeys += 1;
    } else {
      row.points += 1;
      if (p.place === 1) row.points += 1;
    }
    next[p.id] = row;
  });
  return next;
}

export function scoreOf(scores: Scores | undefined, id: string): ScoreRow {
  return scores?.[id] ?? blank();
}

export function ranked(scores: Scores | undefined, players: { id: string; name: string }[]) {
  return players
    .map((p) => ({ ...p, ...scoreOf(scores, p.id) }))
    .sort((a, b) => b.points - a.points || a.donkeys - b.donkeys);
}
