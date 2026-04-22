import { useEffect, useState } from "react";

const Rebuilding = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-sans">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rotate-45 bg-white" />
          <span className="text-sm font-semibold tracking-tight">Flintyo</span>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono">{time} UTC</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Status: Rebuilding
        </div>

        <h1 className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-7xl">
          Flintyo is rebuilding.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
          We're crafting something better. A faster, sharper place for anonymous
          thoughts and honest debate. Back online soon.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="mailto:hello@flintyo.com"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            Get notified
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
          <a
            href="https://flintyo.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition-all hover:bg-white/10"
          >
            Learn more
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-xs text-white/40 md:flex-row md:px-10">
        <span>© {new Date().getFullYear()} Flintyo</span>
        <span className="font-mono">v0.0.1 — maintenance</span>
      </footer>
    </div>
  );
};

export default Rebuilding;
