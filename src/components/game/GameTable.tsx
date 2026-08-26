import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import { CardBack, PlayingCard } from "./PlayingCard";
import { PlayerSeat } from "./PlayerSeat";
import { ReactionMenu } from "./ReactionMenu";
import { expressionFor } from "@/lib/bhabhi/mood";
import { sfx } from "@/lib/sound";
import { legalCards, sortHand, SUIT_NAME, type GameState } from "@/lib/bhabhi/engine";
import { ScoreBoard } from "./ScoreBoard";
import { useIsPortrait, useTableRotated } from "@/lib/orientation";
import type { Scores } from "@/lib/bhabhi/score";
import type { SeatSide } from "./PlayerSeat";

/**
 * Where each opponent sits around the table, expressed as anchor points over
 * the table area. `x`/`y` are percentages; `side` picks the PlayerSeat layout.
 * - Narrow screens: all opponents along a tidy top strip (evenly spread).
 * - Wide screens: opponents truly surround the felt (top corners + left/right
 *   flanks for 5-6 player games).
 */
type SeatSlot = { x: number; y: number; side: SeatSide };
function seatSlots(count: number, wide: boolean): SeatSlot[] {
  if (!wide) {
    return Array.from({ length: count }, (_, i) => ({
      x: (100 / (count + 1)) * (i + 1),
      y: 0,
      side: "top" as const,
    }));
  }
  switch (count) {
    case 1:
      return [{ x: 50, y: 0, side: "top" }];
    case 2:
      return [
        { x: 26, y: 0, side: "top" },
        { x: 74, y: 0, side: "top" },
      ];
    case 3:
      return [
        { x: 14, y: 0, side: "top" },
        { x: 50, y: 0, side: "top" },
        { x: 86, y: 0, side: "top" },
      ];
    case 4:
      return [
        { x: 15, y: 0, side: "top" },
        { x: 85, y: 0, side: "top" },
        { x: 3, y: 42, side: "left" },
        { x: 97, y: 42, side: "right" },
      ];
    default:
      return [
        { x: 13, y: 0, side: "top" },
        { x: 50, y: 0, side: "top" },
        { x: 87, y: 0, side: "top" },
        { x: 3, y: 42, side: "left" },
        { x: 97, y: 42, side: "right" },
      ];
  }
}

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
  // Respect the OS reduced-motion preference: disable the snap-back animation.
  const [reduced, setReduced] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
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
  const portrait = useIsPortrait();
  const rotated = useTableRotated(); // always false — the table never physically rotates
  const [tightScreen, setTightScreen] = useState(false);
  const [wideScreen, setWideScreen] = useState(false);
  useEffect(() => {
    const on = () => {
      setTightScreen(window.innerHeight <= 560);
      // Compact screens (phones — short in either orientation) keep all the
      // opponents along a tidy top strip; only wide desktop gets flanks.
      setWideScreen(window.innerWidth >= 768 && window.innerHeight >= 480);
    };
    on();
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  const shortScreen = tightScreen || portrait;
  const sm = (cls: string) => (shortScreen ? cls : "");

  // ---- seat layout: opponents surround the table --------------------------
  // Wide screens seat opponents around the felt (top corners + flanks for big
  // games); narrow/rotated-phone screens keep everyone as a tidy top strip.
  const opponentCount = others.length;
  const surround = wideScreen;
  const slots = seatSlots(opponentCount, surround);
  const opponentSize = shortScreen ? 36 : opponentCount >= 5 ? 44 : opponentCount >= 4 ? 50 : 54;
  const flankSize = Math.round(opponentSize * 1.15);
  useEffect(() => {
    const el = handRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHandW(el.clientWidth));
    ro.observe(el);
    setHandW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const myCards = me ? sortHand(me.hand) : [];
  // Portrait gets smaller cards + a tighter fan so the whole hand stays on
  // screen in one or two rows; landscape phones keep a readable medium; desktop
  // keeps the full-size cards.
  const cardSize = shortScreen ? (portrait ? "sm" : "md") : "lg";
  const CARD_W = shortScreen ? (portrait ? 44 : 64) : 80;
  // Never squeeze a card down to an unreadable sliver — wrap into a second row instead.
  const MIN_STEP = shortScreen ? (portrait ? 26 : 34) : 34;
  const perRowCap =
    handW > 0 ? Math.max(1, Math.floor((handW - CARD_W - 8) / MIN_STEP) + 1) : myCards.length;
  const rows = myCards.length > perRowCap ? 2 : 1;
  const perRow = Math.ceil(myCards.length / rows) || 1;
  const handRows = Array.from({ length: rows }, (_, r) => myCards.slice(r * perRow, (r + 1) * perRow));
  const step =
    perRow > 1 && handW > 0
      ? Math.min(CARD_W + 8, Math.max(MIN_STEP, (handW - CARD_W - 8) / (perRow - 1)))
      : CARD_W + 8;



  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex min-h-0 w-full max-w-full overflow-hidden flex-col gap-2",
        full
          ? "fixed inset-0 z-50 h-[100dvh] bg-background p-2 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.4rem,env(safe-area-inset-top))] pb-[max(0.625rem,env(safe-area-inset-bottom))]"
          : "flex-1",
      )}
    >
      {/* Exit lives outside the tilted arena so it's always tappable in full screen */}
      {full && (
        <button
          type="button"
          onClick={exitFull}
          aria-label="Exit full screen"
          className="absolute top-2 right-2 z-[60] inline-flex items-center gap-1.5 rounded-lg border border-violet bg-violet px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg transition active:scale-95 [touch-action:manipulation] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Minimize2 className="h-3.5 w-3.5" /> Exit
        </button>
      )}


      {/* Opponent seats — surround the felt on wide screens, strip on narrow */}
      <div
        className={cn(
          "relative min-h-0",
          surround ? "flex-1 w-full" : "w-full shrink-0 flex flex-col gap-2",
        )}
      >
        {surround ? (
          others.map(({ p, i }, idx) => {
            const slot = slots[idx];
            const style: CSSProperties =
              slot.side === "top"
                ? { left: `${slot.x}%`, top: 2, transform: "translateX(-50%)" }
                : slot.side === "left"
                  ? { left: 4, top: `${slot.y}%`, transform: "translateY(-50%)" }
                  : { right: 4, top: `${slot.y}%`, transform: "translateY(-50%)" };
            return (
              <div key={p.id} className="absolute z-20" style={style}>
                <PlayerSeat
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
                  size={slot.side === "top" ? opponentSize : flankSize}
                  side={slot.side}
                  compact
                />
              </div>
            );
          })
        ) : (
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 w-full max-w-full overflow-visible">
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
                size={opponentSize}
                side="top"
                compact
              />
            ))}
          </div>
        )}

        {/* Arena */}
      <div
        ref={arenaRef}
        className={cn(
          "felt arena-vignette overflow-hidden rounded-[1.6rem] border flex flex-col items-center justify-center transition-all duration-200",
          surround ? "absolute inset-x-2 bottom-2 top-[112px]" : "relative flex-1 min-h-0",
          shortScreen ? "p-2 pt-7 gap-1" : "p-3 pt-9 gap-2",
          dropReady
            ? "border-primary ring-2 ring-primary/70 scale-[1.01]"
            : drag
              ? "border-primary/50 border-dashed"
              : "border-white/[0.05]",
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
            className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-ink-muted transition hover:text-foreground active:scale-95 [touch-action:manipulation] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full
          </button>
        )}

        <div className={cn("text-xs font-medium text-muted-foreground", sm("hidden"))}>
          {state.leadSuit ? `${SUIT_NAME[state.leadSuit]} led` : "New trick"}
        </div>

        <div className="flex w-full min-w-0 max-w-full flex-col items-center justify-center gap-0.5 pt-1">
        <div className="flex items-end justify-center gap-1.5 flex-wrap overflow-visible">
          {state.pile.length === 0 ? (
            reveal ? (
              reveal.cards.map(({ p, card }, idx, arr) => (
                <div key={card.id} className="flex flex-col items-center gap-1" style={{ zIndex: idx }}>
                  <div
                    className="transition-transform"
                    style={{ transform: `rotate(${(idx - (arr.length - 1) / 2) * 6}deg) translateY(${-Math.abs(idx - (arr.length - 1) / 2) * 4}px)` }}
                  >
                    <PlayingCard
                      card={card}
                      size={shortScreen ? "sm" : "md"}
                      className={cn(
                        "transition",
                        reveal.who === p ? "ring-2 ring-highlight" : "opacity-75",
                      )}
                    />
                  </div>
                  <span className={cn("text-[11px] text-muted-foreground max-w-[4.5rem] truncate", sm("hidden"))}>
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
            state.pile.map(({ p, card }, idx, arr) => (
              <div
                key={card.id}
                className="anim-deal flex flex-col items-center gap-1"
                style={{ animationDelay: `${idx * 90}ms`, zIndex: idx }}
              >
                <div
                  className="transition-transform"
                  style={{ transform: `rotate(${(idx - (arr.length - 1) / 2) * 6}deg) translateY(${-Math.abs(idx - (arr.length - 1) / 2) * 4}px)` }}
                >
                  <PlayingCard card={card} size={shortScreen ? "sm" : "md"} />
                </div>
                <span className={cn("text-[11px] text-muted-foreground max-w-[4.5rem] truncate", sm("hidden"))}>
                  {state.players[p].name}
                </span>
              </div>
            ))
          )}
        </div>
        {reveal && state.pile.length === 0 && (
          <span className="rounded-md border border-border bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-highlight">
            {reveal.kind === "pickup"
              ? `${state.players[reveal.who].name} picks these up`
              : `${state.players[reveal.who].name} takes the trick`}
          </span>
        )}
        <p className={cn("text-center text-foreground/90 px-2", shortScreen ? "text-[10px] min-h-0" : "text-xs min-h-[1rem]")}>{state.lastEvent}</p>
      </div>

        {/* Live standings */}
        <p className="pointer-events-none absolute top-3 left-3 z-10 text-[10px] font-semibold tracking-[0.14em] text-ink-faint">
          {alive} IN
        </p>

        {/* Scores toggle */}
        <button
          onClick={() => setTab((t) => (t === "scores" ? null : "scores"))}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition [touch-action:manipulation] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            tab === "scores" ? "text-primary" : "text-ink-muted hover:text-foreground",
          )}
        >
          Scores
        </button>


        {/* Turn indicator — one integrated lead, not a boxed badge */}
        <div className="pointer-events-none absolute left-1/2 top-1.5 z-10 -translate-x-1/2 text-center">
          {state.phase === "over" ? (
            <span className="font-game text-[0.85rem] tracking-[0.16em] text-ink-muted">ROUND OVER</span>
          ) : myTurn ? (
            <span className="inline-flex items-center gap-2 font-game text-[1rem] tracking-[0.08em] text-turn">
              <span className="h-1.5 w-1.5 rounded-full bg-turn" />
              YOUR TURN
            </span>
          ) : (
            <span className="font-game text-[0.9rem] font-bold tracking-[0.02em] text-ink-muted">
              {turnName}’s turn
            </span>
          )}
        </div>


        {drag && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center z-10">
            <span
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-bold backdrop-blur-none transition-colors",
                dropReady
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated text-muted-foreground",
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
      </div>

      {tab === "scores" && (
        <div className="absolute inset-x-3 top-12 z-30 fade-in" onClick={() => setTab(null)}>
          <ScoreBoard scores={scores} players={state.players.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
      )}


      {/* You */}
      <div className={cn("relative shrink-0", shortScreen ? "px-1 pb-0.5" : "px-2 pb-1")}>
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
          className={cn("relative flex w-full flex-col items-center gap-1 overflow-visible pb-1 px-1 [touch-action:none]", shortScreen ? "pt-2" : "pt-3")}
        >
          {me && myCards.length > 0 ? (
            handRows.map((row, rowIdx) => (
              <div key={rowIdx} className="relative flex justify-center overflow-visible">
                {row.map((c, idx, arr) => {
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
                              // When the table is rotated the pointer's screen axes are swapped.
                              transform: `translate3d(${rotated ? drag.dy : drag.dx}px, ${rotated ? -drag.dx : drag.dy}px, 0) scale(1.08)`,
                              transition: "none",
                              filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.55))",
                            }
                          : snapBack === c.id
                                                        ? {
                                transform: "translate3d(0,0,0)",
                                transition: reduced
                                  ? "transform 0.001ms"
                                  : "transform 280ms cubic-bezier(.22,1,.36,1)",
                              }
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
                })}
              </div>
            ))
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
