import { useEffect, useState } from "react";

const LINES = [
  "Shuffling the deck…",
  "Waking up the donkey…",
  "Hiding the aces…",
  "Counting hooves…",
  "Dealing you a bad hand…",
];

/** Funny bouncing-donkey splash shown while the app boots. */
export function LoadingScreen({ onDone, duration = 1800 }: { onDone?: () => void; duration?: number }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setLine((v) => (v + 1) % LINES.length), 700);
    const t = setTimeout(() => onDone?.(), duration);
    return () => {
      clearInterval(i);
      clearTimeout(t);
    };
  }, [onDone, duration]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="anim-hop">
          <img
            src="/donkey-loader.png"
            alt="Flintyo donkey mascot"
            width={160}
            height={160}
            className="h-40 w-40 object-contain anim-wobble"
          />
        </div>
        <p className="text-2xl font-black tracking-tight text-gradient">FLINTYO</p>
        <p className="text-sm text-muted-foreground min-h-5">{LINES[line]}</p>
        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary anim-float" />
        </div>
      </div>
    </div>
  );
}
