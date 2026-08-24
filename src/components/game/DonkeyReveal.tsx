import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CharacterAvatar } from "./Character";
import { getCharacter, CHARACTERS } from "@/lib/characters";
import { sfx } from "@/lib/sound";
import type { GameState } from "@/lib/bhabhi/engine";

const DONKEY = CHARACTERS[0];

/**
 * The punchline moment: the losing character slowly realises what happened,
 * the donkey mascot walks in, everybody laughs.
 */
export function DonkeyReveal({
  state,
  onRematch,
  footer,
}: {
  state: GameState;
  onRematch?: () => void;
  footer?: React.ReactNode;
}) {
  const loser = state.loser != null ? state.players[state.loser] : null;
  const winner = state.players.find((p) => p.place === 1) ?? null;
  const [beat, setBeat] = useState(0); // 0 look at card, 1 look around, 2 oh no

  useEffect(() => {
    sfx.donkey();
    const a = setTimeout(() => setBeat(1), 700);
    const b = setTimeout(() => {
      setBeat(2);
      sfx.victory();
    }, 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const loserExpr = beat === 0 ? "confused" : beat === 1 ? "shocked" : "defeat";

  return (
    <div className="absolute inset-0 rounded-[2rem] bg-background/92 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-5 fade-in overflow-y-auto z-40">
      <div className="flex items-end justify-center gap-2">
        {loser && (
          <div className="anim-zoom-focus">
            <CharacterAvatar character={getCharacter(loser.char)} expression={loserExpr} size={128} />
          </div>
        )}
        {beat >= 2 && (
          <div className="anim-slide-in-left">
            <CharacterAvatar character={DONKEY} expression="laughing" size={92} />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-black leading-tight">
        {loser ? (
          <>
            <span className="text-4xl block anim-hop">🫏</span>
            THE DONKEY GOT {loser.name.toUpperCase()}!
          </>
        ) : (
          "Nobody is the Donkey!"
        )}
      </h2>

      {winner && (
        <p className="text-xs text-muted-foreground">
          🏆 <span className="text-primary font-bold">{winner.name}</span> got out first
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
        {state.players
          .filter((p) => p.place)
          .sort((a, b) => (a.place ?? 0) - (b.place ?? 0))
          .map((p) => (
            <span
              key={p.id}
              className="text-[11px] rounded-full border border-border bg-surface/50 px-2.5 py-1 font-semibold"
            >
              #{p.place} {p.name}
            </span>
          ))}
      </div>

      {onRematch && (
        <button onClick={onRematch} className="btn-primary inline-flex items-center gap-2 mt-1">
          <RotateCcw className="h-4 w-4" /> Play again
        </button>
      )}
      {footer}
    </div>
  );
}

export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    sfx.turn();
    if (n === 0) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v - 1), 450);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-background/85 backdrop-blur-sm rounded-[2rem]">
      <div key={n} className="anim-count text-7xl font-black text-gradient">
        {n === 0 ? "GO!" : n}
      </div>
    </div>
  );
}
