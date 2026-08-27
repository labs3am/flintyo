import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Flintyo"
        description="Flintyo's privacy policy. We designed Flintyo so you can play without an account. Learn what little data is used, how anonymity works, and your choices."
        path="/privacy"
      />
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective date: 27 August 2026</p>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Our approach</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is built around a simple idea: you should be able to play a card game without
              creating an account, handing over an email, or building a profile. We collect the
              minimum needed to run the game and no more.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Information we use</h2>
            <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
              <li>
                <strong className="text-foreground">Player name and chosen character</strong> — shown
                to other players in your room. This is entered by you and stored on your device.
              </li>
              <li>
                <strong className="text-foreground">Game state</strong> — the cards and moves of an
                active room are held temporarily to let you and your friends play together and are
                not used for any other purpose.
              </li>
              <li>
                <strong className="text-foreground">Anonymous session identifier</strong> — a
                technical, anonymous identifier is used so you can reconnect to a room. It is not an
                account, and it does not contain your name, email or identity.
              </li>
              <li>
                <strong className="text-foreground">Local storage</strong> — preferences such as your
                name, chosen character and sound setting are saved in your browser's local storage
                so the game remembers you on that device.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">No account, no email</h2>
            <p className="mt-2 text-muted-foreground">
              We do not require signup, and we do not ask for your email address to play. We do not
              build advertising profiles, and we do not sell personal information.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Infrastructure</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is hosted on modern cloud infrastructure with transport security (HTTPS). Game
              rooms are ephemeral and are not intended for long-term storage. For more detail on how
              cookies and similar technologies are used, see our{" "}
              <Link to="/cookies" className="text-primary font-bold hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Your choices</h2>
            <p className="mt-2 text-muted-foreground">
              Because the game is anonymous and preference-based, you can clear your saved data at
              any time by clearing your browser's local storage for this site. If you have questions
              or would like more detail about data, contact us at{" "}
              <a href="mailto:info@labs3am.com" className="text-primary font-bold hover:underline">info@labs3am.com</a>.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Changes</h2>
            <p className="mt-2 text-muted-foreground">
              We may update this policy from time to time. The latest version will always be posted
              here with its effective date.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
