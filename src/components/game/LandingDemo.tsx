import { useEffect, useState } from "react";
import { PlayingCard } from "./PlayingCard";
import type { Card } from "@/lib/bhabhi/engine";

const c = (r: number, s: Card["s"]): Card => ({ id: `${r}${s}`, r, s });

/** A looping "real table" demo: four cards get played, the highest one takes the pile. */
const ROUNDS: { cards: Card[]; takerIdx: number }[] = [
  { cards: [c(7, "H"), c(11, "H"), c(4, "H"), c(13, "H")], takerIdx: 3 },
  { cards: [c(9, "S"), c(3, "S"), c(14, "S"), c(6, "S")], takerIdx: 2 },
  { cards: [c(5, "D"), c(12, "D"), c(8, "D"), c(2, "D")], takerIdx: 1 },
];

/** Where each of the 4 seats sits around the table (percent offsets from center). */
const SEATS = [
  { x: 0, y: 62, rot: -4 },
  { x: -104, y: 0, rot: -9 },
  { x: 0, y: -62, rot: 5 },
  { x: 104, y: 0, rot: 9 },
];

export function LandingDemo() {
  const [round, setRound] = useState(0);
  // played = how many cards are on the table this round; -1 marks the "collect" beat
  const [played, setPlayed] = useState(0);
  const [collect, setCollect] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    setPlayed(0);
    setCollect(false);
    for (let i = 1; i <= 4; i++) timers.push(window.setTimeout(() => setPlayed(i), 400 * i));
    timers.push(window.setTimeout(() => setCollect(true), 2200));
    timers.push(window.setTimeout(() => setRound((r) => (r + 1) % ROUNDS.length), 3400));
    return () => timers.forEach(clearTimeout);
  }, [round]);

  const { cards, takerIdx } = ROUNDS[round];
  const taker = SEATS[takerIdx];

  return (
    <div className="relative mx-auto h-[260px] w-full max-w-sm select-none" aria-hidden>
      {/* table felt */}
      <div className="absolute inset-x-6 inset-y-4 rounded-[2rem] border border-border/70 bg-card/40 shadow-[inset_0_0_60px_rgba(0,0,0,0.45)]" />

      {cards.map((card, i) => {
        const seat = SEATS[i];
        const isOut = played > i;
        const style: React.CSSProperties = collect
          ? {
              transform: `translate(calc(-50% + ${taker.x * 0.9}px), calc(-50% + ${taker.y * 0.9}px)) rotate(${taker.rot}deg) scale(0.7)`,
              opacity: 0,
              transition: "transform 700ms cubic-bezier(.4,0,.2,1), opacity 700ms ease-in",
              transitionDelay: `${i * 45}ms`,
            }
          : isOut
            ? {
                transform: `translate(calc(-50% + ${(i - 1.5) * 26}px), calc(-50% + ${(i % 2 ? 1 : -1) * 8}px)) rotate(${(i - 1.5) * 7}deg)`,
                opacity: 1,
                transition: "transform 420ms cubic-bezier(.2,.8,.3,1), opacity 220ms ease-out",
              }
            : {
                transform: `translate(calc(-50% + ${seat.x}px), calc(-50% + ${seat.y}px)) rotate(${seat.rot}deg) scale(0.9)`,
                opacity: 0.35,
                transition: "transform 420ms cubic-bezier(.2,.8,.3,1), opacity 220ms ease-out",
              };
        return (
          <div key={card.id} className="absolute left-1/2 top-1/2" style={{ ...style, zIndex: 10 + i }}>
            <PlayingCard card={card} size="lg" />
          </div>
        );
      })}

      {/* score / pickup callout */}
      {collect && (
        <div
          className="absolute left-1/2 top-1/2 anim-pop-up text-sm font-black text-primary drop-shadow"
          style={{ marginLeft: taker.x * 0.9, marginTop: taker.y * 0.9 }}
        >
          +4 cards
        </div>
      )}
    </div>
  );
}
