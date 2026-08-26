import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** True when the viewport is held in portrait orientation (taller than wide). */
const PortraitCtx = createContext(false);

/**
 * The table is never physically rotated any more. This context is kept so the
 * game adapts natively to whatever way the phone is held instead of forcing a
 * 90° turn (which used to leave the player's cards clipped on iOS Safari).
 */
const RotatedCtx = createContext(false);

/** True when the table itself is rotated 90° — always false in the new design. */
export const useTableRotated = () => useContext(RotatedCtx);

/** True when the phone is upright; children use it to shrink the table layout. */
export const useIsPortrait = () => useContext(PortraitCtx);

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
