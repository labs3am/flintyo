import { Seo } from "@/components/Seo";
import { Link, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Eye } from "lucide-react";
import { GameTable } from "@/components/game/GameTable";
import { LandscapeShell } from "@/components/game/LandscapeShell";
import { Countdown, DonkeyReveal } from "@/components/game/DonkeyReveal";
import { createGame, playCard, type GameState } from "@/lib/bhabhi/engine";
import { chooseCard, botDelay, type Difficulty } from "@/lib/bhabhi/ai";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { applyResult, type Scores } from "@/lib/bhabhi/score";
import { TutorialModal, tutorialSeen, markTutorialSeen } from "@/components/game/Tutorial";
import { useReactions } from "@/hooks/useReactions";
import { EMOJI_REACTIONS } from "@/components/game/ReactionMenu";
import { sfx } from "@/lib/sound";

type Search = { mode: "ai" | "pass"; players: number; name: string; char: string; level: Difficulty };

function buildSeats(mode: "ai" | "pass", players: number, name: string, char: string, level: Difficulty) {
  const pool = CHARACTERS.filter((c) => c.id !== char);
  if (mode === "ai") {
    return [
      { id: "you", name, bot: false, char },
      ...Array.from({ length: players - 1 }, (_, i) => {
        const c = pool[i % pool.length];
        return { id: `bot${i}`, name: c.name, bot: true, char: c.id, level };
      }),
    ];
  }
  return Array.from({ length: players }, (_, i) => {
    const c = i === 0 ? getCharacter(char) : pool[(i - 1) % pool.length];
    return { id: `p${i}`, name: i === 0 ? name : c.name, bot: false, char: c.id };
  });
}

export default function PlayPage() {
  const [params] = useSearchParams();
  const mode: Search["mode"] = params.get("mode") === "pass" ? "pass" : "ai";
  const players = Math.min(6, Math.max(2, Number(params.get("players")) || 4));
  const name = (params.get("name") || "You").slice(0, 14);
  const char = params.get("char") || CHARACTERS[0].id;
  const levelParam = params.get("level");
  const level: Difficulty = levelParam === "easy" || levelParam === "hard" ? levelParam : "normal";
  const [state, setState] = useState<GameState | null>(null);
  const [revealed, setRevealed] = useState(mode === "ai");
  const [counting, setCounting] = useState(true);
  const [scores, setScores] = useState<Scores>({});
  const scoredRef = useRef(false);
  const turnRef = useRef<number>(-1);
  const seqRef = useRef<number>(-1);
  const { bySeat, add } = useReactions();
  const [tut, setTut] = useState(() => !tutorialSeen());
  // Coaching hints only for a brand-new player's first game.
  const [hintsOn] = useState(() => !tutorialSeen());

  const deal = useCallback(() => {
    setState(createGame(buildSeats(mode, players, name, char, level)));
    setRevealed(mode === "ai");
    setCounting(true);
    turnRef.current = -1;
    seqRef.current = -1;
    scoredRef.current = false;
  }, [mode, players, name, char, level]);

  useEffect(() => {
    deal();
  }, [deal]);

  // Bots take their turn on a human-ish delay.
  useEffect(() => {
    if (!state || counting || state.phase === "over") return;
    const current = state.players[state.turn];
    if (!current?.bot) return;
    const t = setTimeout(() => {
      setState((s) => {
        if (!s || s.phase === "over" || !s.players[s.turn].bot) return s;
        const card = chooseCard(s, s.turn, (s.players[s.turn].level as Difficulty) ?? "normal");
        return card ? playCard(s, s.turn, card.id) : s;
      });
    }, botDelay(current.level as Difficulty) + (state.lastTrick ? 1500 : 0));
    return () => clearTimeout(t);
  }, [state, counting]);

  // Sound + occasional cosmetic bot reactions driven by game events.
  useEffect(() => {
    if (!state || state.seq === seqRef.current) return;
    seqRef.current = state.seq;
    const e = state.event;
    if (e.t === "play") sfx.card();
    if (e.t === "trick") sfx.trick();
    if (e.t === "pickup") {
      sfx.pickup();
      state.players.forEach((p, i) => {
        if (!p.bot || i === e.taker || p.out) return;
        if (Math.random() < getCharacter(p.char).expressiveness * 0.5) {
          add(i, EMOJI_REACTIONS[Math.floor(Math.random() * 4)]);
        }
      });
    }
  }, [state, add]);

  // Tally the scoreboard once per finished round.
  useEffect(() => {
    if (!state || state.phase !== "over" || scoredRef.current) return;
    scoredRef.current = true;
    setScores((prev) => applyResult(prev, state));
  }, [state]);

  // Pass & play: hide the hand whenever the device changes hands.
  useEffect(() => {
    if (mode !== "pass" || !state) return;
    if (state.turn !== turnRef.current) {
      turnRef.current = state.turn;
      setRevealed(false);
    }
  }, [state, mode]);

  if (!state) return null;

  const mySeat = mode === "ai" ? 0 : state.turn;
  const handlePlay = (cardId: string) => setState((s) => (s ? playCard(s, mySeat, cardId) : s));

  return (
    <LandscapeShell>
    <main className="h-[100dvh] max-h-[100dvh] w-full max-w-5xl mx-auto overflow-hidden p-2.5 md:p-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2">
      <Seo title="Play Donkey — Flintyo" description="Play a round of Donkey against bots or on one shared phone." path="/play" />
      <header className="shrink-0 px-1 py-0.5 flex items-center justify-between gap-2">
        <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Menu
        </Link>
        <div className="flex min-w-0 flex-col items-center leading-tight">
          <h1 className="text-sm font-bold tracking-[0.2em] text-gradient">
            FLINTYO<span className="sr-only"> — playing the Donkey card game</span>
          </h1>
          {state.players.some((p) => p.bot) && (
            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
              AI · {level}
            </span>
          )}
        </div>
        <button onClick={deal} className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden xs:inline">New </span>Deal
        </button>
      </header>

      <div className="flex-1 min-h-0 relative flex flex-col">
        <GameTable
          state={state}
          mySeat={revealed ? mySeat : null}
          onPlay={handlePlay}
          reactions={bySeat}
          scores={scores}
          onReact={(emoji) => add(mySeat, emoji)}
          hints={hintsOn}
        />

        {counting && <Countdown onDone={() => { setCounting(false); sfx.deal(); }} />}

        {mode === "pass" && !revealed && !counting && state.phase === "playing" && (
          <div className="absolute inset-0 rounded-[2rem] bg-background/95 flex flex-col items-center justify-center gap-3 text-center p-6 fade-in z-30">
            <p className="text-sm text-muted-foreground">Pass the device to</p>
            <p className="text-3xl font-black text-gradient">{state.players[state.turn].name}</p>
            <button onClick={() => setRevealed(true)} className="btn-primary inline-flex items-center gap-2">
              <Eye className="h-4 w-4" /> Show my hand
            </button>
          </div>
        )}

        {state.phase === "over" && !counting && <DonkeyReveal state={state} onRematch={deal} />}

        {tut && (
          <TutorialModal
            onClose={() => {
              markTutorialSeen();
              setTut(false);
            }}
          />
        )}
      </div>
    </main>
    </LandscapeShell>
  );
}
