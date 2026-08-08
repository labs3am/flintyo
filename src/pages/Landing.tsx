import { Link } from "react-router-dom";
import { useState } from "react";
import { Bot, Users, Wifi, Play, BookOpen, Share2, Zap, Trophy, Clock, Smartphone } from "lucide-react";
import { CharacterAvatar } from "@/components/game/Character";
import { CHARACTERS } from "@/lib/characters";
import { LandingDemo } from "@/components/game/LandingDemo";
import { TutorialDeck, TutorialModal } from "@/components/game/Tutorial";
import { PlayingCard } from "@/components/game/PlayingCard";
import { InstallButton } from "@/components/InstallButton";
import { Reveal } from "@/components/Reveal";
import type { Card } from "@/lib/bhabhi/engine";

const MODES = [
  {
    icon: Bot,
    title: "Play with AI",
    body: "Ten characters with real attitude. Easy, normal or hard — the hard bots count cards and hold their aces.",
    tag: "Solo",
  },
  {
    icon: Wifi,
    title: "With friends online",
    body: "Create a room, drop the code on WhatsApp, everyone plays on their own phone. No signup, no download.",
    tag: "2–6 players",
  },
  {
    icon: Users,
    title: "One phone, pass & play",
    body: "Gather around one screen. Each hand stays hidden until the phone reaches you.",
    tag: "Couch mode",
  },
];

const STEPS = [
  { icon: Zap, title: "Follow the suit", body: "Someone leads a card. Match the suit if you can — highest card of the round picks up the whole pile." },
  { icon: Clock, title: "Can't follow? Cut it", body: "Out of that suit? Throw anything. The round dies right there and the leader eats the pile." },
  { icon: Trophy, title: "Empty your hand", body: "Run out of cards and you're safe. Everyone else keeps sweating." },
  { icon: Smartphone, title: "Last one left is the Donkey", body: "One player is always holding cards at the end. That's the Donkey — and the table finds out loudly." },
];

const FLOATERS: { card: Card; cls: string; style: React.CSSProperties }[] = [
  { card: { id: "f1", r: 14, s: "S" }, cls: "anim-float", style: { left: "4%", top: "8%" } },
  { card: { id: "f2", r: 13, s: "H" }, cls: "anim-float-slow", style: { right: "5%", top: "14%" } },
  { card: { id: "f3", r: 7, s: "D" }, cls: "anim-float-slow", style: { left: "8%", bottom: "10%" } },
  { card: { id: "f4", r: 11, s: "C" }, cls: "anim-float", style: { right: "7%", bottom: "6%" } },
];

const STATS = [
  { k: "2–6", v: "players per table" },
  { k: "10", v: "AI characters" },
  { k: "~5 min", v: "a full round" },
  { k: "0", v: "signups needed" },
];

export default function Landing() {
  const [tut, setTut] = useState(false);
  const marquee = [...CHARACTERS, ...CHARACTERS];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pt-10 pb-16">
        {/* floating cards backdrop */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block opacity-40" aria-hidden>
          {FLOATERS.map((f) => (
            <div key={f.card.id} className={`absolute ${f.cls}`} style={f.style}>
              <PlayingCard card={f.card} size="lg" />
            </div>
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex justify-center -space-x-3 mb-4">
            {CHARACTERS.slice(0, 5).map((c, i) => (
              <div key={c.id} className="fade-in" style={{ animationDelay: `${i * 90}ms` }}>
                <CharacterAvatar character={c} expression={i === 2 ? "laughing" : "idle"} size={i === 2 ? 74 : 58} />
              </div>
            ))}
          </div>

          <p className="eyebrow text-primary">From the house of Labs3am</p>
          <h1 className="mt-2 flex justify-center">
            <img
              src="/flintyo-logo.png"
              alt="Flintyo — the multiplayer Donkey card game"
              width={320}
              height={320}
              className="h-44 sm:h-60 w-auto object-contain anim-float-slow"
            />
          </h1>
          <p className="mt-1 text-sm sm:text-base font-bold text-gold uppercase tracking-[0.25em]">
            The Donkey card game
          </p>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Dump your cards, dodge the pile, and don't be the last one holding. The loser is the Donkey —
            and everybody sees it.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/start"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2 text-base anim-glow-pulse"
            >
              <Play className="h-5 w-5" /> Play now
            </Link>
            <button
              onClick={() => setTut(true)}
              className="btn-ghost w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 text-sm"
            >
              <BookOpen className="h-4 w-4" /> How to play
            </button>
            <Link
              to="/rules"
              className="btn-ghost w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 text-sm"
            >
              Full rules
            </Link>
          </div>

          <div className="mt-8">
            <LandingDemo />
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {STATS.map((s, i) => (
              <Reveal key={s.k} delay={i * 70}>
                <div className="panel rounded-2xl px-2 py-3">
                  <div className="text-lg sm:text-xl font-black gradient-gold num">{s.k}</div>
                  <div className="text-[10px] leading-tight text-muted-foreground">{s.v}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-3xl font-black">Three ways to play</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Same game, same rules — pick whoever you want to humiliate.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {MODES.map((m, i) => (
              <Reveal key={m.title} delay={i * 110}>
                <article className="panel rounded-2xl p-5 h-full transition-transform duration-200 hover:-translate-y-1 hover:border-primary">
                  <div className="flex items-center justify-between">
                    <m.icon className="h-6 w-6 text-primary" />
                    <span className="eyebrow text-[9px] text-gold">{m.tag}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How a round works */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-3xl font-black">How a round works</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">Four beats. That's the whole game.</p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="panel rounded-2xl p-5 flex gap-4 h-full">
                  <div className="shrink-0 grid place-items-center h-10 w-10 rounded-xl bg-primary/15 text-primary font-black num">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-black flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-gold" /> {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Characters marquee */}
      <section className="pb-16">
        <div className="px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-black">Pick your player</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Ten characters, each with their own table manners.
            </p>
          </Reveal>
        </div>
        <div className="mt-6 relative overflow-hidden">
          <div className="marquee-track gap-3 px-3">
            {marquee.map((c, i) => (
              <div
                key={`${c.id}-${i}`}
                className="panel rounded-2xl p-3 w-[104px] shrink-0 flex flex-col items-center gap-1"
              >
                <CharacterAvatar character={c} expression="idle" size={54} />
                <span className="text-[11px] font-bold truncate max-w-full">{c.name}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{c.personality}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules deck */}
      <section className="px-4 pb-16">
        <Reveal>
          <div className="mx-auto max-w-sm panel rounded-3xl p-5">
            <p className="eyebrow text-center">Learn in 30 seconds</p>
            <TutorialDeck />
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-16">
        <Reveal>
          <div className="mx-auto max-w-2xl panel rounded-3xl p-8 text-center anim-shine">
            <h2 className="text-3xl sm:text-4xl font-black">Somebody has to be the Donkey.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure it isn't you. Start a table and send the code to the group chat.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/start" className="btn-gold w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2">
                <Play className="h-5 w-5" /> Start a game
              </Link>
              <Link to="/start" className="btn-ghost w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 text-sm">
                <Share2 className="h-4 w-4" /> Create a room code
              </Link>
              <InstallButton />
            </div>

          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/70 px-4 py-10">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-2 text-center">
          <img src="/flintyo-logo.png" alt="Flintyo" width={96} height={96} className="h-16 w-auto object-contain" />
          <p className="text-xs text-muted-foreground">Flintyo is the app. Donkey is the game.</p>
          <p className="text-sm text-muted-foreground">
            From the house of{" "}
            <a href="https://labs3am.com" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
              Labs3am
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link to="/rules" className="text-xs text-muted-foreground hover:text-primary">
              Donkey card game rules
            </Link>
            <Link to="/start" className="text-xs text-muted-foreground hover:text-primary">
              Start a game →
            </Link>
          </div>
          <p className="text-[11px] text-muted-foreground/70">© {new Date().getFullYear()} Labs3am. All rights reserved.</p>
        </div>
      </footer>

      {tut && <TutorialModal onClose={() => setTut(false)} />}
    </main>
  );
}
