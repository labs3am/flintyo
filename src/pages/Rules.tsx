import { Link } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { TutorialDeck } from "@/components/game/Tutorial";

export default function Rules() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">
          Donkey card game rules
        </h1>
        <p className="mt-3 text-muted-foreground">
          Donkey — also called Bhabhi — is a simple shedding card game for 2–6 players with a
          standard 52-card deck. Empty your hand and you're safe. The last player still holding
          cards is the Donkey.
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-black">Setup and dealing</h2>
          <p className="mt-2 text-muted-foreground">
            Shuffle a full 52-card deck and deal every card out between the players. Hands may be
            slightly uneven — that's fine. Whoever holds the Ace of Spades leads the first card.
            Aces are high; 2 is the lowest card.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">How a round is played</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
            <li>The leader plays any card. That card's suit is the led suit.</li>
            <li>Every other player must follow suit if they hold a card of that suit.</li>
            <li>
              If everyone follows suit, the highest card of the suit wins the trick, the pile is
              discarded, and that player leads next.
            </li>
            <li>
              If a player cannot follow suit, they may throw any card. The round stops immediately
              and the player who played the highest card of the led suit picks up the whole pile,
              adding it to their hand. They lead the next round.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">How to win — and who is the Donkey</h2>
          <p className="mt-2 text-muted-foreground">
            The moment your hand is empty you're out and safe. Play continues between the remaining
            players. The last player still holding cards loses the game and is the Donkey. There's
            no scoring in the classic game — the only prize is not being the Donkey.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">Common variations</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
            <li>Some tables let any player lead the first card instead of the Ace of Spades.</li>
            <li>
              Some play that identical ranks cancel out, or that a player may not throw off a suit
              while they still hold it — always agree before dealing.
            </li>
            <li>Playing multiple rounds, the Donkey collects a letter: D-O-N-K-E-Y.</li>
          </ul>
        </section>

        <section className="mt-8 panel rounded-3xl p-5">
          <h2 className="text-xl font-black text-center">Learn it in 30 seconds</h2>
          <TutorialDeck />
        </section>

        <div className="mt-8 text-center">
          <Link to="/start" className="btn-primary px-8 py-3.5 inline-flex items-center gap-2">
            <Play className="h-5 w-5" /> Play Donkey now
          </Link>
        </div>
      </div>
    </main>
  );
}
