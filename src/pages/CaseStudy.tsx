import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { CharacterAvatar } from "@/components/game/Character";
import { CHARACTERS } from "@/lib/characters";
import { ArrowLeft, MessageCircle, Zap, Users, Bot, Smartphone, Globe, Flame } from "lucide-react";

const MILESTONES = [
  {
    date: "Early concept",
    title: "A place for hot takes",
    body: "Flintyo started as a social debate app. The plan was anonymous posts called Flints, live Clash debates, and mood-matched Let's Talk chats — all wrapped in a gamified rank system.",
    icon: MessageCircle,
  },
  {
    date: "First pivot",
    title: "From arguments to cards",
    body: "The team kept the anonymous, no-signup spirit but swapped the feed for a table. A classic shedding card game felt like a better fit: quick rounds, real tension, and something friends could actually do together in a browser.",
    icon: Zap,
  },
  {
    date: "Rebuild",
    title: "Donkey becomes the product",
    body: "The entire stack was rewritten around a 52-card deck. The name stayed, but the app became Flintyo — the Donkey card game. Characters became avatars, points became tricks, and live rooms replaced live debates.",
    icon: Flame,
  },
  {
    date: "Today",
    title: "Play anywhere",
    body: "Flintyo now runs AI matches, pass-and-play on one phone, and online rooms with a four-letter code. It is built mobile-first, adapting to portrait and landscape at the table, and deliberately free of accounts.",
    icon: Globe,
  },
];

const DECISIONS = [
  {
    title: "No accounts",
    body: "Every player gets a random LabsID. This removes friction for invite links and keeps the game casual, but it also means the backend has to trust the room state, not user rows.",
  },
  {
    title: "Bots that count cards",
    body: "The AI does not cheat. It tracks which suits opponents are likely out of, dumps dangerous high cards when void, and leads into suits it thinks others still hold. Easy is forgiving; Hard is competitive.",
  },
  {
    title: "Adaptive table",
    body: "The table works in both orientations. Hold the phone upright and the hand spreads across the full width in compact rows, opponents sit in a single row, and the felt always fits the screen — no rotation, no scrolling.",
  },
  {
    title: "Characters, not accounts",
    body: "Ten avatars give the table personality without needing profiles. They laugh, blink, and celebrate, but they never store personal data.",
  },
];

const STATS = [
  { k: "3", v: "ways to play" },
  { k: "10", v: "characters" },
  { k: "0", v: "accounts needed" },
  { k: "~1 min", v: "to start a room" },
];

export default function CaseStudy() {
  return (
    <>
      <Seo
        title="Flintyo Case Study — From Debate App to Donkey Card Game"
        description="How Flintyo evolved from a social debate platform into a free browser version of Donkey. The product decisions, pivots, and lessons behind the game."
        path="/case-study"
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Flintyo Case Study — From Debate App to Donkey Card Game",
          author: { "@type": "Organization", name: "Labs3am" },
          publisher: { "@type": "Organization", name: "Labs3am", url: "https://labs3am.com" },
          datePublished: "2026-08-11",
          url: "https://flintyo.com/case-study",
        }}
      />
      <main className="min-h-screen overflow-hidden">
        {/* Hero */}
        <section className="relative px-4 pt-10 pb-16">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute left-[8%] top-[12%] anim-float">
              <div className="h-24 w-16 rounded-xl card-back rotate-[-12deg]" />
            </div>
            <div className="absolute right-[10%] top-[18%] anim-float-slow">
              <div className="h-24 w-16 rounded-xl card-back rotate-[12deg]" />
            </div>
            <div className="absolute left-[12%] bottom-[10%] anim-float-slow">
              <div className="h-24 w-16 rounded-xl card-back rotate-[6deg]" />
            </div>
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Flintyo
            </Link>

            <p className="eyebrow text-primary mt-6">Case study</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-black leading-[1.05]">
              From debates to <span className="text-gradient">Donkey</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Flintyo began as a social app for anonymous arguments. It became a card game you can start in under a minute. This is the story of that pivot — and the product decisions that survived it.
            </p>

            <div className="mt-6 flex justify-center -space-x-3">
              {CHARACTERS.slice(0, 5).map((c, i) => (
                <div key={c.id} className="fade-in" style={{ animationDelay: `${i * 90}ms` }}>
                  <CharacterAvatar
                    character={c}
                    expression={i === 2 ? "laughing" : "idle"}
                    size={i === 2 ? 70 : 54}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map((s, i) => (
                <Reveal key={s.k} delay={i * 70}>
                  <div className="panel rounded-2xl px-2 py-4 text-center">
                    <div className="text-2xl font-black gradient-gold num">{s.k}</div>
                    <div className="text-[11px] leading-tight text-muted-foreground">{s.v}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-center text-3xl font-black">How Flintyo changed shape</h2>
            </Reveal>
            <div className="mt-8 relative">
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />
              {MILESTONES.map((m, i) => (
                <Reveal key={m.title} delay={i * 100}>
                  <div className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? "sm:flex-row-reverse" : ""}`}>
                    <div className="hidden sm:block sm:w-1/2" />
                    <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10 h-8 w-8 rounded-full bg-card border border-primary grid place-items-center text-primary">
                      <m.icon className="h-4 w-4" />
                    </div>
                    <div className="pl-14 sm:pl-0 sm:w-1/2 panel rounded-2xl p-5">
                      <p className="eyebrow text-gold">{m.date}</p>
                      <h3 className="mt-1 text-lg font-black">{m.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Key decisions */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className="text-center text-3xl font-black">Decisions that mattered</h2>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Four bets that shaped the final product.
              </p>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {DECISIONS.map((d, i) => (
                <Reveal key={d.title} delay={i * 90}>
                  <article className="panel rounded-2xl p-5 h-full transition-transform duration-200 hover:-translate-y-1 hover:border-primary">
                    <h3 className="text-lg font-black flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-primary/15 text-primary grid place-items-center text-xs num">
                        {i + 1}
                      </span>
                      {d.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What stayed, what left */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="panel rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-black text-center">What survived the pivot</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-gold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Kept
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">→</span> Anonymous identity (LabsID)</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> No signup, no download</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> Live, real-time rooms</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> Gamification (points, ranks, reactions)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Bot className="h-4 w-4" /> Replaced
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">→</span> Flints became cards</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> Clashes became tricks</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> Mood chat became table chat</li>
                      <li className="flex gap-2"><span className="text-primary">→</span> Debate moderation became report/exit tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Lessons */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-center text-3xl font-black">Lessons learned</h2>
            </Reveal>
            <div className="mt-6 space-y-3">
              {[
                "A strong mechanic beats a broad feature list. Donkey has one clear loop, which made the UI easier to explain and the AI easier to tune.",
                "Mobile web games must respect the device. Letting the table adapt to how the phone is held removed more confusion than any tutorial could.",
                "Invite links are part of the UX. The share message, room code, and join flow were redesigned as carefully as the deal animation.",
                "Brand and game can share a name. Flintyo is the app; Donkey is the game. That distinction lets the product grow without confusing players.",
              ].map((lesson, i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="panel rounded-2xl p-4 flex gap-4">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-black num">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pt-1">{lesson}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16">
          <Reveal>
            <div className="mx-auto max-w-2xl panel rounded-3xl p-8 text-center anim-shine">
              <h2 className="text-3xl font-black">Try the result</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start a table, send the room code, and see what survived the pivot.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/start" className="btn-primary w-full sm:w-auto px-8 py-3.5 inline-flex items-center justify-center gap-2">
                  <Smartphone className="h-5 w-5" /> Play now
                </Link>
                <Link to="/" className="btn-ghost w-full sm:w-auto px-6 py-3.5 inline-flex items-center justify-center gap-2 text-sm">
                  Back to home
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/70 px-4 py-10">
          <div className="mx-auto max-w-4xl flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">Flintyo is the app. Donkey is the game.</p>
            <p className="text-sm text-muted-foreground">
              From the house of{" "}
              <a href="https://labs3am.com" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                Labs3am
              </a>
            </p>
            <p className="text-[11px] text-muted-foreground/70">© {new Date().getFullYear()} Labs3am. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
