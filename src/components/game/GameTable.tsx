import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import { CardBack, PlayingCard } from "./PlayingCard";
import { PlayerSeat } from "./PlayerSeat";
import { ReactionMenu } from "./ReactionMenu";
import { expressionFor } from "@/lib/bhabhi/mood";
import { sfx } from "@/lib/sound";
import { legalCards, sortHand, SUIT_NAME, type GameState } from "@/lib/bhabhi/engine";
import { ScoreBoard } from "./ScoreBoard";
import type { Scores } from "@/lib/bhabhi/score";

export function GameTable({
  state,
  mySeat,
  onPlay,
  onReact,
  reactions = {},
  says = {},
  scores,
  waitingLabel,
}: {
  state: GameState;
  mySeat: number | null;
  onPlay: (cardId: string) => void;
  onReact?: (emoji: string) => void;
  reactions?: Record<number, string>;
  /** Latest chat line per seat, shown as a speech bubble. */
  says?: Record<number, string>;
  /** Cross-round scoreboard, keyed by player id. */
  scores?: Scores;
  waitingLabel?: string;
}) {
  const me = mySeat != null ? state.players[mySeat] : null;
  const myTurn = mySeat != null && state.turn === mySeat && state.phase === "playing";
  const playable = useMemo(
    () => new Set((mySeat != null ? legalCards(state, mySeat) : []).map((c) => c.id)),
    [state, mySeat],
  );
  const [foul, setFoul] = useState<{ id: string; at: number } | null>(null);
  const [tab, setTab] = useState<"scores" | null>(null);
  const [gained, setGained] = useState<{ seat: number; n: number; seq: number } | null>(null);
  

  useEffect(() => {
    if (state.event.t !== "pickup") return;
    const g = { seat: state.event.taker, n: state.event.n, seq: state.seq };
    setGained(g);
    const t = window.setTimeout(() => setGained((x) => (x && x.seq === g.seq ? null : x)), 2200);
    return () => window.clearTimeout(t);
  }, [state.seq, state.event]);

  const others = state.players.map((p, i) => ({ p, i })).filter(({ i }) => i !== mySeat);
  const turnName = state.players[state.turn]?.name ?? "";
  const alive = state.players.filter((p) => !p.out).length;

  const tryPlay = (cardId: string) => {
    if (!myTurn) return;
    if (playable.has(cardId)) {
      setFoul(null);
      onPlay(cardId);
      return;
    }
    sfx.foul();
    setFoul({ id: cardId, at: Date.now() });
    window.setTimeout(() => setFoul((f) => (f && f.id === cardId ? null : f)), 1600);
  };

  // ---- drag-to-play -------------------------------------------------------
  const arenaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const draggedRef = useRef(0);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; over: boolean } | null>(null);
  const [snapBack, setSnapBack] = useState<string | null>(null);

  const overArena = (x: number, y: number) => {
    const r = arenaRef.current?.getBoundingClientRect();
    return !!r && x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 32 && y <= r.bottom + 40;
  };

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if (!myTurn) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { id, x: e.clientX, y: e.clientY, moved: false };
    setSnapBack(null);
    setDrag({ id, dx: 0, dy: 0, over: false });
  };

  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    d.moved = true;
    setDrag({ id: d.id, dx, dy, over: overArena(e.clientX, e.clientY) });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    const dropped = d.moved && overArena(e.clientX, e.clientY);
    setDrag(null);
    if (!d.moved) return;
    draggedRef.current = Date.now();
    if (dropped) {
      tryPlay(d.id);
      return;
    }
    setSnapBack(d.id);
    window.setTimeout(() => setSnapBack((s) => (s === d.id ? null : s)), 280);
  };

  const dropReady = !!drag && drag.over;

  return (
    <div className="relative flex flex-1 min-h-0 w-full max-w-full overflow-hidden flex-col gap-2">
      {/* Opponents row keeps a little headroom for speech bubbles */}
      <div className="flex shrink-0 flex-nowrap justify-center gap-1.5 w-full max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {others.map(({ p, i }) => (
          <PlayerSeat
            key={p.id}
            seat={{
              name: p.name,
              charId: p.char,
              bot: p.bot,
              cards: p.hand.length,
              out: p.out,
              place: p.place,
              active: state.turn === i && state.phase === "playing",
            }}
            expression={expressionFor(state, i)}
            reaction={reactions[i]}
            says={says[i]}
            gained={gained?.seat === i ? gained.n : null}
            size={others.length > 3 ? 46 : 58}
            compact
          />
        ))}
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        className={cn(
          "felt relative flex-1 min-h-0 overflow-hidden rounded-[2rem] border p-3 pt-9 flex flex-col items-center justify-center gap-2 transition-all duration-200",
          dropReady
            ? "border-primary ring-2 ring-primary/70 scale-[1.01]"
            : drag
              ? "border-primary/50 border-dashed"
              : "border-border/60",
        )}
      >
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {state.leadSuit ? `${SUIT_NAME[state.leadSuit]} led` : "New trick"}
        </div>
        <div className="flex items-end justify-center gap-1.5 flex-wrap overflow-hidden">
          {state.pile.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <CardBack size="md" className="opacity-40" />
              <span>Waiting for the lead card…</span>
            </div>
          ) : (
            state.pile.map(({ p, card }) => (
              <div key={card.id} className="anim-deal flex flex-col items-center gap-1">
                <PlayingCard card={card} size="md" />
                <span className="text-[9px] text-muted-foreground max-w-[4rem] truncate">
                  {state.players[p].name}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-center text-foreground/90 min-h-[1rem] px-2">{state.lastEvent}</p>

        {/* Live standings */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-full text-[9px] font-black tracking-[0.15em] bg-black/40 border border-border text-gold">
            {alive} IN
          </span>
        </div>

        {/* Scores toggle */}
        <button
          onClick={() => setTab((t) => (t === "scores" ? null : "scores"))}
          className={cn(
            "absolute top-3 right-3 z-20 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] transition active:scale-95 [touch-action:manipulation]",
            tab === "scores" ? "border-primary bg-primary/20 text-primary" : "border-border bg-black/40 text-foreground/80",
          )}
        >
          Scores
        </button>


        {/* Turn banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border",
              myTurn
                ? "bg-primary text-primary-foreground border-primary anim-pulse-soft"
                : "bg-black/40 text-muted-foreground border-border",
            )}
          >
            {state.phase === "over" ? "ROUND OVER" : myTurn ? "YOUR TURN" : `${turnName.toUpperCase()}'S TURN`}
          </span>
        </div>


        {drag && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center z-10">
            <span
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur transition-colors",
                dropReady
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-black/60 text-muted-foreground",
              )}
            >
              {dropReady ? "Release to play" : "Drop here"}
            </span>
          </div>
        )}

        {onReact && (
          <div className="absolute bottom-3 right-3">
            <ReactionMenu onSend={onReact} />
          </div>
        )}
      </div>

      {tab === "scores" && (
        <div className="absolute inset-x-3 top-12 z-30 fade-in" onClick={() => setTab(null)}>
          <ScoreBoard scores={scores} players={state.players.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
      )}


      {/* You */}
      <div className="panel shrink-0 rounded-2xl p-2">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">

          {me && (
            <PlayerSeat
              seat={{
                name: me.name,
                charId: me.char,
                cards: me.hand.length,
                out: me.out,
                place: me.place,
                active: myTurn,
                isYou: true,
              }}
              expression={mySeat != null ? expressionFor(state, mySeat) : "idle"}
              gained={gained && gained.seat === mySeat ? gained.n : null}
            reaction={mySeat != null ? reactions[mySeat] : null}
              says={mySeat != null ? says[mySeat] : null}
              size={52}
              compact
            />
          )}
          <p
            className={cn(
              "text-[11px] font-semibold min-w-0",
              foul ? "text-destructive" : myTurn ? "text-primary" : "text-muted-foreground",
            )}
          >
            {foul
              ? "Foul! Wrong card."
              : state.phase === "over"
                ? "Round over"
                : myTurn
                  ? state.pile.length === 0
                    ? "You lead"
                    : "Your move"
                  : (waitingLabel ?? `Waiting for ${turnName}…`)}
          </p>

        </div>
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain [touch-action:pan-x] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2 pt-4 px-1 snap-x snap-mandatory">
          {me && me.hand.length > 0 ? (
            sortHand(me.hand).map((c, idx, arr) => {
              const newSuit = idx > 0 && arr[idx - 1].s !== c.s;
              const dragging = drag?.id === c.id;
              return (
                <div
                  key={c.id}
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={(e) => startDrag(e, c.id)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className={cn(
                    "shrink-0 snap-start select-none p-1 -m-1 will-change-transform",
                    newSuit && "ml-3",
                    dragging ? "relative z-40 touch-none" : "[touch-action:pan-x]",
                  )}
                  style={
                    dragging
                      ? {
                          transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0) scale(1.08) rotate(${Math.max(-8, Math.min(8, drag.dx * 0.05))}deg)`,
                          transition: "none",
                          filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.55))",
                        }
                      : snapBack === c.id
                        ? { transform: "translate3d(0,0,0)", transition: "transform 280ms cubic-bezier(.22,1,.36,1)" }
                        : undefined
                  }
                >
                  <PlayingCard
                    card={c}
                    size="lg"
                    disabled={!myTurn}
                    className={cn(
                      "min-h-[5.75rem] min-w-[4rem]",
                      foul?.id === c.id && "anim-foul ring-2 ring-destructive",
                      dragging && dropReady && "ring-2 ring-primary",
                    )}
                    onClick={() => {
                      if (Date.now() - draggedRef.current < 350) return;
                      tryPlay(c.id);
                    }}
                  />
                </div>
              );
            })
          ) : (
            <span className="text-sm text-muted-foreground py-6">No cards left — you're safe! 🎉</span>
          )}
        </div>
        {myTurn && me && me.hand.length > 0 && (
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Drag a card up to the table — or tap it
          </p>
        )}

      </div>
    </div>
  );
}
