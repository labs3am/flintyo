import { Maximize2, Minimize2 } from "lucide-react";
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
  hints = false,
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
  /** Show beginner coaching (dimmed illegal cards + tips) for the first few turns only. */
  hints?: boolean;
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
  // Coaching fades out after the player's first few turns.
  const [myTurns, setMyTurns] = useState(0);
  const lastCounted = useRef<number>(-1);
  useEffect(() => {
    if (!hints || !myTurn) return;
    if (lastCounted.current === state.seq) return;
    lastCounted.current = state.seq;
    setMyTurns((n) => n + 1);
  }, [hints, myTurn, state.seq]);
  const coaching = hints && myTurns <= 3;
  
  

  useEffect(() => {
    if (state.event.t !== "pickup") return;
    const g = { seat: state.event.taker, n: state.event.n, seq: state.seq };
    setGained(g);
    const t = window.setTimeout(() => setGained((x) => (x && x.seq === g.seq ? null : x)), 2200);
    return () => window.clearTimeout(t);
  }, [state.seq, state.event]);

  // Everyone gets a beat to see the cards that just resolved before they vanish.
  const [reveal, setReveal] = useState<GameState["lastTrick"]>(null);
  useEffect(() => {
    if (!state.lastTrick) {
      setReveal(null);
      return;
    }
    setReveal(state.lastTrick);
    const t = window.setTimeout(() => setReveal(null), 1800);
    return () => window.clearTimeout(t);
  }, [state.seq, state.lastTrick]);

  // Fullscreen + UNO-ish parallax tilt of the table.
  // Native fullscreen is blocked inside some embeds (e.g. the editor preview iframe),
  // so we always keep a CSS "immersive" fallback that fills the viewport.
  const [full, setFull] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const on = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const exitFull = () => {
    setFull(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  const toggleFull = () => {
    const el = rootRef.current;
    if (full) {
      exitFull();
      return;
    }
    setFull(true);
    const req =
      el?.requestFullscreen ??
      (el as unknown as { webkitRequestFullscreen?: () => Promise<void> })?.webkitRequestFullscreen;
    req?.call(el).catch(() => {});
  };
  // Escape always gets you out, even when native fullscreen was blocked.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!full) {
      setTilt({ x: 0, y: 0 });
      return;
    }
    const clamp = (v: number) => Math.max(-9, Math.min(9, v));
    const onOrient = (e: DeviceOrientationEvent) =>
      setTilt({ x: clamp(((e.beta ?? 0) - 35) * 0.25), y: clamp((e.gamma ?? 0) * 0.25) });
    const onMove = (e: PointerEvent) =>
      setTilt({
        x: clamp((0.5 - e.clientY / window.innerHeight) * 16),
        y: clamp((e.clientX / window.innerWidth - 0.5) * 16),
      });
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onMove);
    };
  }, [full]);


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

  // ---- hand fitting: every card visible, no horizontal scrolling ----------
  const handRef = useRef<HTMLDivElement>(null);
  const [handW, setHandW] = useState(0);
  const [shortScreen, setShortScreen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-height: 520px)");
    const on = () => setShortScreen(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    const el = handRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHandW(el.clientWidth));
    ro.observe(el);
    setHandW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const myCards = me ? sortHand(me.hand) : [];
  const cardSize = shortScreen ? "md" : "lg";
  const CARD_W = shortScreen ? 64 : 80;
  const step =
    myCards.length > 1 && handW > 0
      ? Math.min(CARD_W + 8, Math.max(18, (handW - CARD_W - 8) / (myCards.length - 1)))
      : CARD_W + 8;



  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex min-h-0 w-full max-w-full overflow-hidden flex-col gap-2",
        full
          ? "fixed inset-0 z-50 h-[100dvh] bg-background p-2 pb-3"
          : "flex-1",
      )}
    >
      {/* Exit lives outside the tilted arena so it's always tappable in full screen */}
      {full && (
        <button
          type="button"
          onClick={exitFull}
          aria-label="Exit full screen"
          className="absolute top-2 right-2 z-[60] inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-primary-foreground shadow-lg transition active:scale-95 [touch-action:manipulation]"
        >
          <Minimize2 className="h-3.5 w-3.5" /> Exit
        </button>
      )}


      {/* Opponents row keeps a little headroom for speech bubbles */}

      <div className="flex shrink-0 flex-nowrap items-end justify-center gap-1 w-full max-w-full overflow-visible">
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
            turnKey={state.seq}
            size={(shortScreen ? 0.58 : 1) * (others.length > 4 ? 40 : others.length > 3 ? 46 : 56)}
            compact
          />
        ))}
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        className={cn(
          "felt relative flex-1 min-h-0 overflow-hidden rounded-[2rem] border p-3 pt-9 [@media(max-height:520px)]:p-2 [@media(max-height:520px)]:pt-7 [@media(max-height:520px)]:gap-1 flex flex-col items-center justify-center gap-2 transition-all duration-200",
          dropReady
            ? "border-primary ring-2 ring-primary/70 scale-[1.01]"
            : drag
              ? "border-primary/50 border-dashed"
              : "border-border/60",
        )}
        style={
          full
            ? {
                transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 220ms ease-out",
                transformStyle: "preserve-3d",
              }
            : undefined
        }
      >
        {!full && (
          <button
            type="button"
            onClick={toggleFull}
            aria-label="Enter full screen"
            className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 rounded-full border border-border bg-black/50 px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-foreground/80 transition active:scale-95 [touch-action:manipulation]"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full
          </button>
        )}

        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground [@media(max-height:520px)]:hidden">
          {state.leadSuit ? `${SUIT_NAME[state.leadSuit]} led` : "New trick"}
        </div>

        <div className="flex items-end justify-center gap-1.5 flex-wrap overflow-hidden">
          {state.pile.length === 0 ? (
            reveal ? (
              reveal.cards.map(({ p, card }) => (
                <div key={card.id} className="flex flex-col items-center gap-1">
                  <PlayingCard
                    card={card}
                    size={shortScreen ? "sm" : "md"}
                    className={cn(
                      "transition",
                      reveal.who === p ? "ring-2 ring-gold" : "opacity-70",
                    )}
                  />
                  <span className="text-[9px] text-muted-foreground max-w-[4rem] truncate">
                    {state.players[p].name}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <CardBack size={shortScreen ? "sm" : "md"} className="opacity-40" />
                <span>Waiting for the lead card…</span>
              </div>
            )
          ) : (
            state.pile.map(({ p, card }) => (
              <div key={card.id} className="anim-deal flex flex-col items-center gap-1">
                <PlayingCard card={card} size={shortScreen ? "sm" : "md"} />
                <span className="text-[9px] text-muted-foreground max-w-[4rem] truncate">
                  {state.players[p].name}
                </span>
              </div>
            ))
          )}
        </div>
        {reveal && state.pile.length === 0 && (
          <span className="rounded-full border border-gold/50 bg-black/50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-gold">
            {reveal.kind === "pickup"
              ? `${state.players[reveal.who].name} picks these up`
              : `${state.players[reveal.who].name} takes the trick`}
          </span>
        )}
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
      <div className="panel shrink-0 rounded-2xl p-2 [@media(max-height:520px)]:p-1 flex items-center gap-2">
        <div className="flex shrink-0 flex-col items-center gap-0.5 max-w-[6.5rem]">

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
              turnKey={state.seq}
              size={shortScreen ? 42 : 52}
              compact
            />
          )}
          <p
            className={cn(
              "text-center text-[10px] font-semibold leading-tight",
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

        <div className="flex min-w-0 flex-1 flex-col">
        <div
          ref={handRef}
          className="relative flex w-full justify-center overflow-visible pb-1 pt-3 [@media(max-height:520px)]:pt-2 px-1 [touch-action:none]"
        >

          {me && myCards.length > 0 ? (
            myCards.map((c, idx, arr) => {
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
                    "relative shrink-0 select-none will-change-transform touch-none transition-[margin] duration-200",
                    dragging && "z-50",
                  )}
                  style={{
                    marginLeft: idx === 0 ? 0 : step - CARD_W + (newSuit ? 6 : 0),
                    zIndex: dragging ? 50 : idx,
                    ...(dragging
                      ? {
                          transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0) scale(1.08) rotate(${Math.max(-8, Math.min(8, drag.dx * 0.05))}deg)`,
                          transition: "none",
                          filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.55))",
                        }
                      : snapBack === c.id
                        ? { transform: "translate3d(0,0,0)", transition: "transform 280ms cubic-bezier(.22,1,.36,1)" }
                        : null),
                  }}
                >
                  <PlayingCard
                    card={c}
                    size={cardSize}
                    disabled={!myTurn}
                    dimmed={coaching && myTurn && !playable.has(c.id)}
                    className={cn(
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

        {coaching && myTurn && me && me.hand.length > 0 && (
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {state.leadSuit && me.hand.some((c) => c.s === state.leadSuit)
              ? `Follow ${SUIT_NAME[state.leadSuit].toLowerCase()} — the other cards are locked`
              : state.leadSuit
                ? `No ${SUIT_NAME[state.leadSuit].toLowerCase()} — play anything, you'll take the pile`
                : "You lead — drag a card up to the table, or tap it"}
          </p>
        )}
        </div>

      </div>

    </div>
  );
}
