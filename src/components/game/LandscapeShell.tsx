import { useEffect, useState, type ReactNode } from "react";
import { RotateCw, Smartphone } from "lucide-react";

const KEY = "flintyo.rotateMode";

/**
 * The table is designed for landscape. On a small portrait screen the player can
 * either physically rotate the phone, or keep holding it upright and let us
 * rotate the game itself 90° (the way you'd turn a card table, not the room).
 */
export function LandscapeShell({ children }: { children: ReactNode }) {
  const [portrait, setPortrait] = useState(false);
  const [rotated, setRotated] = useState(() => localStorage.getItem(KEY) === "1");

  useEffect(() => {
    const update = () =>
      setPortrait(window.matchMedia("(orientation: portrait)").matches && window.innerWidth < 900);
    update();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const setMode = (on: boolean) => {
    localStorage.setItem(KEY, on ? "1" : "0");
    setRotated(on);
  };

  const tryLock = () => {
    const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    so?.lock?.("landscape").catch(() => {});
  };

  if (!portrait) return <>{children}</>;

  if (rotated) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-background">
        <div
          className="absolute left-1/2 top-1/2 h-[100dvw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 rotate-90 [&>*]:!h-full [&>*]:!max-h-full"
        >
          {children}
        </div>
        <button
          onClick={() => setMode(false)}
          aria-label="Exit rotated view"
          className="absolute bottom-2 left-2 z-[90] rounded-full bg-card/80 p-2 text-muted-foreground backdrop-blur"
        >
          <Smartphone className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[80] grid place-items-center bg-background/97 px-8 text-center backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <RotateCw className="h-12 w-12 animate-spin text-primary [animation-duration:2.6s]" />
          <h2 className="text-lg font-black tracking-[0.2em] text-gradient">PLAY IN LANDSCAPE</h2>
          <p className="max-w-xs text-xs text-muted-foreground">
            Donkey needs the wider view so you can see every card in your hand and all the players at once.
          </p>
          <button onClick={tryLock} className="btn-primary text-xs">
            Rotate my phone
          </button>
          <button onClick={() => setMode(true)} className="btn-ghost px-4 py-2 text-xs">
            Keep phone upright — turn the table instead
          </button>
        </div>
      </div>
    </>
  );
}
