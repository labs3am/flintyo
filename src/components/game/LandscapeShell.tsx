import { useEffect, useState, type ReactNode } from "react";
import { PortraitCtx, RotatedCtx } from "@/lib/orientation";

/**
 * No rotation, no dvw/dvh hacks: the table simply adapts to the current
 * orientation. Portrait phones get a compact layout (smaller cards, opponents
 * on a top strip, everything inside the viewport). Landscape and desktop keep
 * the familiar full-size table. Works on iOS Safari without clipping.
 */
export function LandscapeShell({ children }: { children: ReactNode }) {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const update = () => setPortrait(window.innerHeight > window.innerWidth);
    update();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <PortraitCtx.Provider value={portrait}>
      <RotatedCtx.Provider value={false}>{children}</RotatedCtx.Provider>
    </PortraitCtx.Provider>
  );
}
