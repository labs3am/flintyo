import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Cookies() {
  return (
    <>
      <Seo
        title="Cookie Policy — Flintyo"
        description="How Flintyo uses cookies and local storage. Flintyo keeps cookies to a minimum and can be played without an account."
        path="/cookies"
      />
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">Cookie Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective date: 27 August 2026</p>

          <section className="mt-8">
            <h2 className="text-2xl font-black">The short version</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is designed to keep cookies and tracking to a minimum. We do not use cookies
              for advertising, and you don't need an account to play.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Local storage</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo stores small amounts of data in your browser's local storage. This is used to
              remember preferences such as your player name, chosen character, sound setting and
              tutorial status, and to keep an anonymous identifier so you can reconnect to a room.
              Local storage stays on your device and can be cleared at any time from your browser
              settings.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Anonymous session identifier</h2>
            <p className="mt-2 text-muted-foreground">
              To let you rejoin an active game after a refresh, Flintyo issues a technical,
              anonymous session identifier. It is random, is not tied to your identity, and expires.
              It is not a cookie used for advertising or cross-site tracking.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Essential functionality</h2>
            <p className="mt-2 text-muted-foreground">
              The cookies and local storage we use are generally functional — that is, they are
              needed for the game to work (for example, remembering your settings). Disabling them
              may affect your game experience, and the game may be reset between visits.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Managing cookies</h2>
            <p className="mt-2 text-muted-foreground">
              You can clear Flintyo data at any time through your browser's settings. For questions
              about this policy, contact{" "}
              <a href="mailto:info@labs3am.com" className="text-primary font-bold hover:underline">info@labs3am.com</a>.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
