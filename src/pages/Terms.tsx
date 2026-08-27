import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service — Flintyo"
        description="The terms of service for using Flintyo, the free browser-based Donkey card game. Read about your use of the service, acceptable use and liability."
        path="/terms"
      />
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gradient">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective date: 27 August 2026</p>

          <section className="mt-8">
            <h2 className="text-2xl font-black">1. Agreement</h2>
            <p className="mt-2 text-muted-foreground">
              By accessing or using Flintyo ("the Service"), operated by Labs3am, you agree to be
              bound by these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">2. The Service</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is a free, browser-based multiplayer version of the Donkey card game. It is
              provided "as is" and "as available" for entertainment purposes. You may play games
              against AI opponents, in online rooms with other players, or in local pass-and-play
              mode. The Service is free to use and no account is required.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">3. Acceptable use</h2>
            <p className="mt-2 text-muted-foreground">You agree not to:</p>
            <ul className="mt-2 space-y-2 text-muted-foreground list-disc pl-5">
              <li>Use the Service in any way that is unlawful, harmful or disruptive to others.</li>
              <li>Attempt to disrupt, overload, or gain unauthorised access to Flintyo, its servers, or other players' data.</li>
              <li>Use automated tools to spam rooms, messages, or otherwise interfere with other players' experience.</li>
              <li>Impersonate another player or misrepresent your identity.</li>
              <li>Harass, abuse, or target other players through the Service.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">4. No warranty</h2>
            <p className="mt-2 text-muted-foreground">
              To the maximum extent permitted by law, the Service is provided without warranties of
              any kind, whether express or implied, including but not limited to implied warranties
              of merchantability and fitness for a particular purpose. We do not guarantee that the
              Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">5. Limitation of liability</h2>
            <p className="mt-2 text-muted-foreground">
              Flintyo is an entertainment product. To the maximum extent permitted by law, Labs3am
              and its operators shall not be liable for any indirect, incidental, special,
              consequential or punitive damages, or any loss of data, arising from your use of the
              Service.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">6. Changes to these terms</h2>
            <p className="mt-2 text-muted-foreground">
              We may update these Terms from time to time. The latest version will always be posted
              on this page with its effective date. Continued use of the Service after changes
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-black">7. Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:info@labs3am.com" className="text-primary font-bold hover:underline">info@labs3am.com</a>.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
