import { Link } from "react-router-dom";
import { useState } from "react";
import { Bot, Users, Wifi, Play, BookOpen } from "lucide-react";
import { CharacterAvatar } from "@/components/game/Character";
import { CHARACTERS } from "@/lib/characters";
import { PlayingCard } from "@/components/game/PlayingCard";
import { TutorialDeck, TutorialModal } from "@/components/game/Tutorial";
import type { Card } from "@/lib/bhabhi/engine";

const card = (r: number, s: Card["s"]): Card => ({ id: `${r}${s}`, r, s });

const MODES = [
  {
    icon: Bot,
    title: "Play with AI",
    body: "Five characters with real attitude. Pick easy, normal or hard and see how long you last.",
  },
  {
    icon: Wifi,
    title: "With friends online",
    body: "Create a room, share the code on WhatsApp, everyone plays on their own phone. No signup.",
  },
  {
    icon: Users,
    title: "One phone, pass & play",
    body: "Up to 6 people around one screen. Each hand stays hidden until it's your turn.",
  },
];

export default function Landing() {
  const [tut, setTut] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center -space-x-3 mb-4">
            {CHARACTERS.slice(0, 5).map((c, i) => (
              <CharacterAvatar key={c.id} character={c} expression={i === 2 ? "laughing" : "idle"} size={i === 2 ? 74 : 58} />
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">The card game</p>
          <h1 className="mt-2 text-6xl sm:text-7xl font-black tracking-tight text-gradient">FLINTYO</h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Dump your cards, dodge the pile, and don't be the last one holding. The loser is the Donkey —
            and everybody sees it.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/start" className="btn-primary w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 text-base glow">
              <Play className="h-5 w-5" /> Play now
            </Link>
            <button
              onClick={() => setTut(true)}
              className="btn-ghost w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 text-sm"
            >
              <BookOpen className="h-4 w-4" /> How to play
            </button>
          </div>

          <div className="mt-10 flex items-end justify-center gap-2">
            <PlayingCard card={card(14, "S")} size="lg" className="-rotate-12 translate-y-2" />
            <PlayingCard card={card(13, "H")} size="lg" className="-rotate-3" />
            <PlayingCard card={card(12, "C")} size="lg" className="rotate-3" />
            <PlayingCard card={card(2, "D")} size="lg" className="rotate-12 translate-y-2" />
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-4xl grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <article key={m.title} className="panel rounded-2xl p-4">
              <m.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-2 text-base font-black">{m.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Characters */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-black">Pick your player</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">Ten characters, each with their own table manners.</p>
          <div className="mt-5 grid grid-cols-4 sm:grid-cols-5 gap-2">
            {CHARACTERS.map((c) => (
              <div key={c.id} className="panel rounded-2xl p-2 flex flex-col items-center gap-1">
                <CharacterAvatar character={c} expression="idle" size={54} />
                <span className="text-[11px] font-bold truncate max-w-full">{c.name}</span>
                <span className="text-[9px] text-muted-foreground truncate max-w-full">{c.personality}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-sm panel rounded-3xl p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center">Learn in 30 seconds</p>
          <TutorialDeck />
        </div>
      </section>

      <footer className="border-t border-border/70 px-4 py-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-2 text-center">
          <span className="text-lg font-black tracking-tight text-gradient">FLINTYO</span>
          <p className="text-sm text-muted-foreground">
            From the house of{" "}
            <a href="https://labs3am.com" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
              Labs3am
            </a>
          </p>
          <Link to="/start" className="text-xs text-muted-foreground hover:text-primary">
            Start a game →
          </Link>
          <p className="text-[11px] text-muted-foreground/70">© {new Date().getFullYear()} Labs3am. All rights reserved.</p>
        </div>
      </footer>

      {tut && <TutorialModal onClose={() => setTut(false)} />}
    </main>
  );
}
