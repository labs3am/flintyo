import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact Flintyo — Get in Touch"
        description="Contact the Flintyo team. Questions about the Donkey card game, bug reports, feedback and partnership enquiries — reach us at info@labs3am.com."
        path="/contact"
      />
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">Contact Flintyo</h1>
          <p className="mt-3 text-muted-foreground">
            Have a question about the Donkey card game, spotted a bug, or want to say hello? We'd
            love to hear from you. Flintyo is made by{" "}
            <a href="https://labs3am.com" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
              Labs3am
            </a>
            .
          </p>

          <section className="mt-8 panel rounded-3xl p-6">
            <h2 className="text-xl font-black">Email us</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The fastest way to reach us is by email. We reply to support and feedback as quickly as
              we can.
            </p>
            <a
              href="mailto:info@labs3am.com"
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" /> info@labs3am.com
            </a>
            <p className="mt-4 text-xs text-muted-foreground">
              For bug reports, please include your browser and device, and (if relevant) the room
              code you were using.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">What should I include?</h2>
            <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
              <li>What happened, and what you expected to happen.</li>
              <li>Your browser (Chrome, Safari, Firefox…) and device (phone, tablet, desktop).</li>
              <li>Which mode: online room, AI, or pass-and-play.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">Other pages</h2>
            <p className="mt-2 text-muted-foreground">
              Before getting in touch, you might find what you need in our{" "}
              <Link to="/rules" className="text-primary font-bold hover:underline">Donkey rules</Link>,{" "}
              <Link to="/about" className="text-primary font-bold hover:underline">about page</Link>,{" "}
              <Link to="/privacy" className="text-primary font-bold hover:underline">privacy policy</Link> or{" "}
              <Link to="/terms" className="text-primary font-bold hover:underline">terms of service</Link>.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
