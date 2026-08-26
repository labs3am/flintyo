import { useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard, CardBack } from "./PlayingCard";
import type { Card } from "@/lib/bhabhi/engine";

const c = (r: number, s: Card["s"]): Card => ({ id: `${r}${s}`, r, s });

const SLIDES: { title: string; body: string; art: JSX.Element }[] = [
  {
    title: "Everyone gets the whole deck",
    body: "All 52 cards are dealt out. Whoever holds the Ace of Spades leads the very first card.",
    art: (
      <div className="flex items-end gap-1.5">
        <CardBack size="md" className="-rotate-6" />
        <PlayingCard card={c(14, "S")} size="lg" />
        <CardBack size="md" className="rotate-6" />
      </div>
    ),
  },
  {
    title: "Follow the suit",
    body: "If a heart is led and you hold hearts, you must play a heart. No hearts? Then you can throw anything.",
    art: (
      <div className="flex items-end gap-1.5">
        <PlayingCard card={c(9, "H")} size="md" />
        <PlayingCard card={c(12, "H")} size="lg" />
        <PlayingCard card={c(5, "H")} size="md" />
      </div>
    ),
  },
  {
    title: "Highest card wins the trick",
    body: "When everyone follows suit, the highest card takes the pile and it's thrown away. Nobody gets hurt.",
    art: (
      <div className="flex items-end gap-1.5">
        <PlayingCard card={c(4, "C")} size="md" className="opacity-60" />
        <PlayingCard card={c(13, "C")} size="lg" className="ring-2 ring-primary" />
        <PlayingCard card={c(7, "C")} size="md" className="opacity-60" />
      </div>
    ),
  },
  {
    title: "Can't follow? Someone picks up",
    body: "If a player is out of the led suit, the highest card of that suit collects the whole pile. Empty your hand to escape — the last player still holding cards is the Donkey.",
    art: (
      <div className="flex items-end gap-1.5">
        <PlayingCard card={c(11, "D")} size="md" />
        <PlayingCard card={c(2, "S")} size="md" className="rotate-6" />
        <span className="text-4xl">🫏</span>
      </div>
    ),
  },
];

export function TutorialDeck({ onDone, className }: { onDone?: () => void; className?: string }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div className={cn("w-full", className)}>
      <div className="grid place-items-center h-40">{s.art}</div>
      <h3 className="mt-3 text-center text-lg font-black">{s.title}</h3>
      <p className="mt-1 text-center text-sm text-muted-foreground min-h-[3.5rem]">{s.body}</p>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            aria-label={`Step ${n + 1}`}
            onClick={() => setI(n)}
            className={cn("h-1.5 rounded-full transition-all", n === i ? "w-6 bg-primary" : "w-1.5 bg-border")}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="btn-ghost px-3 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <button
          onClick={() => (last ? onDone?.() : setI((n) => n + 1))}
          className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
        >
          {last ? "Got it" : "Next"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TutorialModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4 fade-in" onClick={onClose}>
      <div className="panel relative w-full max-w-sm rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full border border-border text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">How to play</p>
        <TutorialDeck onDone={onClose} />
      </div>
    </div>
  );
}
