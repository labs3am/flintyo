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
    title: "Against the computer",
    body: "Add 1–5 bots and choose easy, normal or hard. On hard they track which suits you've run out of and hold their high cards back.",
    tag: "1 player",
  },
  {
    icon: Wifi,
    title: "Online with friends",
    body: "Create a table, send the 4-letter room code, and everyone joins from their own phone browser. No account, no app store.",
    tag: "2–6 players",
  },
  {
    icon: Users,
    title: "One phone, pass and play",
    body: "Everyone plays on the same device. Your hand stays face down until you tap to reveal it, so nobody sees your cards.",
    tag: "Same room",
  },
];

const STEPS = [
  { icon: Zap, title: "Deal the whole deck", body: "All 52 cards go out. Hands can be uneven. Whoever holds the Ace of Spades leads first." },
  { icon: Clock, title: "Follow the suit", body: "You must play the led suit if you have it. Highest card of that suit is winning the trick so far." },
  { icon: Trophy, title: "Out of the suit? Throw anything", body: "The round stops there and whoever played the highest card of the led suit picks up the entire pile." },
  { icon: Smartphone, title: "Empty hand = safe", body: "Shed all your cards and you're out. The last player still holding cards is the Donkey." },
];

const FLOATERS: { card: Card; cls: string; style: React.CSSProperties }[] = [
  { card: { id: "f1", r: 14, s: "S" }, cls: "anim-float", style: { left: "4%", top: "8%" } },
  { card: { id: "f2", r: 13, s: "H" }, cls: "anim-float-slow", style: { right: "5%", top: "14%" } },
  { card: { id: "f3", r: 7, s: "D" }, cls: "anim-float-slow", style: { left: "8%", bottom: "10%" } },
  { card: { id: "f4", r: 11, s: "C" }, cls: "anim-float", style: { right: "7%", bottom: "6%" } },
];

const STATS = [
  { k: "2–6", v: "players" },
  { k: "52", v: "card deck" },
  { k: "5–10", v: "min per game" },
  { k: "Free", v: "no account" },
];

const FAQ = [
  {
    q: "What is the Donkey card game?",
    a: "Donkey — known as Bhabhi in India — is a shedding game for 2 to 6 players using one standard 52-card deck. You follow suit when you can, dodge picking up the pile, and try not to be the last player holding cards.",
  },
  {
    q: "Do I need to download anything or sign up?",
    a: "No. Flintyo runs in your phone or desktop browser. There is no account, no email and no download. You can optionally install it to your home screen for offline-style access.",
  },
  {
    q: "How do I play with friends who aren't with me?",
    a: "Tap Play now, choose Online, create a table and share the room code or link (WhatsApp works well). Up to 6 people can join, and you can fill empty seats with bots.",
  },
  {
    q: "How long does a game take?",
    a: "A full game usually runs 5 to 10 minutes depending on how many players are at the table and how often the pile gets picked up.",
  },
  {
    q: "Is it the same as Bhabhi, Get Away or Hazari?",
    a: "Donkey and Bhabhi are the same game under different names. Flintyo uses the common rules: Ace of Spades leads, aces high, no trumps, and the last player with cards loses.",
  },
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
            Flintyo is a free browser version of Donkey (Bhabhi) — the shedding game played with one
            52-card deck. Play 2–6 players online with a room code, on one shared phone, or against bots.
            Last player holding cards is the Donkey.
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
              Same rules in every mode. Pick the one that suits who you're with.
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
            <p className="mt-1 text-center text-sm text-muted-foreground">The full rules, in four steps.</p>
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
              Ten characters to play as. They only change the face at the table, not the rules.
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

      {/* FAQ */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-center text-3xl font-black">Questions people ask</h2>
          </Reveal>
          <div className="mt-6 space-y-3">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="panel rounded-2xl p-4 group">
                  <summary className="cursor-pointer list-none font-bold text-sm flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-primary shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Want the full rulebook, including common house variations?{" "}
            <Link to="/rules" className="text-primary font-bold hover:underline">Read the Donkey rules</Link>.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-16">
        <Reveal>
          <div className="mx-auto max-w-2xl panel rounded-3xl p-8 text-center anim-shine">
            <h2 className="text-3xl sm:text-4xl font-black">Somebody has to be the Donkey.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a table, send the room code to your group chat, and deal in under a minute.
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
