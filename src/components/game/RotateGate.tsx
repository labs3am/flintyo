import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

/**
 * The table is designed for landscape. On small portrait screens we ask the
 * player to rotate (and try the Screen Orientation lock where supported)
 * instead of letting the layout squash into a scrolling mess.
 */
export function RotateGate() {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const update = () => setPortrait(mq.matches && window.innerWidth < 900);
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const tryLock = () => {
    const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    so?.lock?.("landscape").catch(() => {});
  };

  if (!portrait) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-background/97 px-8 text-center backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <RotateCw className="h-12 w-12 animate-spin text-primary [animation-duration:2.6s]" />
        <h2 className="text-lg font-black tracking-[0.2em] text-gradient">ROTATE YOUR PHONE</h2>
        <p className="max-w-xs text-xs text-muted-foreground">
          Donkey is played in landscape so you can see every card in your hand and all the players at once.
        </p>
        <button onClick={tryLock} className="btn-primary text-xs">
          Rotate to landscape
        </button>
      </div>
    </div>
  );
}
