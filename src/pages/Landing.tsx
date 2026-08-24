import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Play, BookOpen } from "lucide-react";
import { CharacterAvatar } from "@/components/game/Character";
import { CHARACTERS } from "@/lib/characters";
import { LandingDemo } from "@/components/game/LandingDemo";
import { TutorialDeck, TutorialModal } from "@/components/game/Tutorial";
import { PlayingCard } from "@/components/game/PlayingCard";
import { InstallButton } from "@/components/InstallButton";
import { InstallBanner } from "@/components/InstallBanner";
import { Reveal } from "@/components/Reveal";

const MODES = [
  {
    title: "Against the computer",
    body: "Add 1–5 bots on easy, normal or hard.",
    tag: "1 player",
  },
  {
    title: "Online with friends",
    body: "Share the room code — everyone joins from their own browser.",
    tag: "2–6 players",
  },
  {
    title: "One phone, pass and play",
    body: "Hands stay face down until you tap to reveal.",
    tag: "Same room",
  },
];

const STEPS = [
  { title: "Deal the whole deck", body: "All 52 cards go out. Whoever holds the Ace of Spades leads." },
  { title: "Follow the suit", body: "Must play the led suit if you have it. Highest card wins the trick so far." },
  { title: "Out of the suit? Throw anything", body: "The pile goes to whoever played highest of the led suit." },
  { title: "Empty hand = safe", body: "Last player still holding cards is the Donkey." },
];

const FAQ = [
  {
    q: "What is the Donkey card game?",
    a: "Donkey is a shedding game for 2 to 6 players using one standard 52-card deck. You follow suit when you can, dodge picking up the pile, and try not to be the last player holding cards.",
  },
  {
    q: "Do I need to download anything or sign up?",
    a: "No. Flintyo runs in your phone or desktop browser. There is no account, no email and no download. You can optionally install it to your home screen for offline-style access.",
  },
  {
    q: "How do I play with friends who aren't with me?",
    a: "Tap Play now, choose Online, create a table and share the room code or link (WhatsApp works well). Up to 6 people can join, and you can fill empty seats with bots.",
  },
];


export default function Landing() {
  const [tut, setTut] = useState(false);
  
  return (
    <>
      <Seo
        title="Flintyo — Play Donkey Online With Friends & AI"
        description="Play Donkey free in your browser. 2-6 players online with a room code, one shared phone, or bots. Last one holding cards is the Donkey."
        path="/"
        schema={[{"@context": "https://schema.org", "@type": "Game", "name": "Donkey", "url": "https://flintyo.com/", "numberOfPlayers": {"@type": "QuantitativeValue", "minValue": 2, "maxValue": 6}}, {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What is the Donkey card game?", "acceptedAnswer": {"@type": "Answer", "text": "Donkey is a shedding game for 2 to 6 players using one standard 52-card deck. You follow suit when you can, dodge picking up the pile, and try not to be the last player holding cards."}}, {"@type": "Question", "name": "Do I need to download anything or sign up?", "acceptedAnswer": {"@type": "Answer", "text": "No. Flintyo runs in your phone or desktop browser. There is no account, no email and no download."}}, {"@type": "Question", "name": "How do I play with friends who aren't with me?", "acceptedAnswer": {"@type": "Answer", "text": "Create a table and share the room code or link. Up to 6 people can join, and you can fill empty seats with bots."}}]}]}
      />
    <main className="min-h-screen overflow-hidden">
      {/* Hero — asymmetric: words left, the game right */}
      <section className="relative px-4 pt-12 pb-16 sm:pt-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Words */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-highlight">
              The Donkey card game
            </p>
            <h1 className="mt-2">
              <img
                src="/flintyo-logo.png"
                alt="Flintyo"
                width={320}
                height={320}
                className="h-24 w-auto object-contain sm:h-28"
              />
              <span className="sr-only">Flintyo — play the Donkey card game online</span>
            </h1>
            <p className="mt-4 text-xl font-semibold leading-snug">
              Play Donkey with friends, strangers, or AI.
            </p>
            <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">
              Free in your browser. 2–6 players, one 52-card deck, five minutes.
              Last one holding cards is the Donkey.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/start"
                className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base"
              >
                <Play className="h-5 w-5" /> Play now
              </Link>
              <button
                onClick={() => setTut(true)}
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5"
              >
                <BookOpen className="h-4 w-4" /> How to play
              </button>
              <span className="w-full text-xs text-muted-foreground sm:w-auto">
                Free · no account · no download
              </span>
            </div>

            <div className="mt-9 hidden lg:block">
              <LandingDemo />
            </div>
          </div>

          {/* The game: characters around a live table */}
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-md select-none">
              {/* felt */}
              <div className="felt absolute inset-x-8 inset-y-12 rounded-[1.75rem] shadow-elegant" />

              {/* mid-trick cards */}
              <div className="absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-1/2 -space-x-7">
                {[
                  { id: "t1", r: 12, s: "S" as const },
                  { id: "t2", r: 7, s: "H" as const },
                  { id: "t3", r: 3, s: "D" as const },
                ].map((c, i) => (
                  <div
                    key={c.id}
                    className="fade-in"
                    style={{ transform: `rotate(${(i - 1) * 8}deg)`, animationDelay: `${350 + i * 150}ms` }}
                  >
                    <PlayingCard card={c} size="md" />
                  </div>
                ))}
              </div>

              {/* characters around the table */}
              <div className="absolute -top-3 left-8">
                <CharacterAvatar character={CHARACTERS[1]} expression="laughing" size={86} />
              </div>
              <div className="absolute right-2 top-1/4">
                <CharacterAvatar character={CHARACTERS[2]} expression="thinking" size={78} />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <CharacterAvatar character={CHARACTERS[0]} expression="happy" size={104} emphasized />
              </div>
            </div>
          </Reveal>

          {/* Demo stays available on small screens, under the composition */}
          <div className="lg:hidden">
            <LandingDemo />
          </div>
        </div>
      </section>

      {/* Install prompt */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-3xl">
          <InstallBanner />
        </div>
      </section>

      {/* Modes — one editorial strip, no cards */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-2xl font-bold">Three ways to play</h2>
          </Reveal>
          <Reveal>
            <div className="mt-4 grid divide-y divide-border rounded-xl border border-border bg-surface sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              {MODES.map((m) => (
                <div key={m.title} className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-highlight">{m.tag}</p>
                  <h3 className="mt-1.5 font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* How a round works — numbered lines, no boxes */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-2xl font-bold">How a round works</h2>
          </Reveal>
          <ol className="mt-4 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <li className="flex gap-3">
                  <span className="num shrink-0 text-lg font-bold leading-snug text-violet">{i + 1}</span>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">{s.title}. </span>
                    <span className="text-muted-foreground">{s.body}</span>
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Characters */}
      <section className="pb-16">
        <div className="px-4">
          <Reveal>
            <h2 className="text-center text-3xl font-black">Pick your player</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Ten characters to play as. They only change the face at the table, not the rules.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 px-4">
            {CHARACTERS.map((c) => (
              <div
                key={c.id}
                className="panel flex w-[104px] flex-col items-center gap-1 rounded-xl p-3"
              >
                <CharacterAvatar character={c} expression="idle" size={54} />
                <span className="max-w-full truncate text-xs font-bold">{c.name}</span>
                <span className="min-h-[26px] text-center text-[10px] leading-tight text-muted-foreground">
                  {c.personality}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
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
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface-elevated p-8 text-center shadow-1">
            <CharacterAvatar character={CHARACTERS[0]} expression="laughing" size={72} />
            <h2 className="mt-3 text-3xl font-bold">Somebody has to be the Donkey.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start a table, send the room code to your group chat, and deal in under a minute.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/start"
                className="btn-primary inline-flex w-full items-center justify-center gap-2 px-8 py-3.5 sm:w-auto"
              >
                <Play className="h-5 w-5" /> Start a game
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
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/rules" className="text-xs text-muted-foreground hover:text-primary">
              Donkey card game rules
            </Link>
            <Link to="/case-study" className="text-xs text-muted-foreground hover:text-primary">
              Case study
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
    </>
  );
}
