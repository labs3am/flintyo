import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";

export default function About() {
  return (
    <>
      <Seo
        title="About Flintyo — The Donkey Card Game"
        description="Flintyo is a free browser-based Donkey card game. Play online with friends using a room code, challenge AI opponents, or pass one phone around the table. Made by Labs3am."
        path="/about"
      />
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">About Flintyo</h1>
          <p className="mt-3 text-muted-foreground">
            Flintyo is a free, browser-based version of the Donkey card game. No download, no account,
            no signup — open the page on your phone or computer and start dealing.
          </p>

          <section className="mt-8">
            <h2 className="text-2xl font-black">What is Flintyo?</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo puts the classic shedding card game Donkey online. All 52 cards are dealt out,
              players follow suit when they can, and the last player still holding cards becomes the
              Donkey. It's quick, it's social, and it only takes a five-letter room code to get a
              table going.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Play your way</h2>
            <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
              <li>
                <strong className="text-foreground">Online with friends</strong> — create a room and
                share the code. Up to 6 people join on their own browsers.
              </li>
              <li>
                <strong className="text-foreground">Against the computer</strong> — add 1–5 AI
                players on easy, normal or hard difficulty.
              </li>
              <li>
                <strong className="text-foreground">One phone, pass and play</strong> — every hand
                stays face down until it's your turn to reveal it.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">No accounts, ever</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is designed to be instant. You enter a name, create or join a room, and you're
              playing in seconds. There is no email, no password and no profile to maintain. A room
              lives only for as long as it's being played.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Who makes Flintyo</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is a product from{" "}
              <a
                href="https://labs3am.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-bold hover:underline"
              >
                Labs3am
              </a>
              . Questions, feedback or partnership ideas?{" "}
              <a href="mailto:info@labs3am.com" className="text-primary font-bold hover:underline">
                Email us at info@labs3am.com
              </a>
              .
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link to="/start" className="btn-primary px-8 py-3.5 inline-flex items-center gap-2">
              <Play className="h-5 w-5" /> Play Donkey now
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
