import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const RotatedCtx = createContext(false);

/** True when the table itself is rotated 90° (phone held upright). */
export const useTableRotated = () => useContext(RotatedCtx);

/**
 * The table is designed for landscape. On a small portrait screen we turn the
 * game 90° in place — the way you'd turn a card table, not the room — so the
 * player never has to rotate the phone.
 */
export function LandscapeShell({ children }: { children: ReactNode }) {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const update = () => setPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 900);
    update();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!portrait) return <>{children}</>;

  return (
    <RotatedCtx.Provider value>
      <div className="fixed inset-0 overflow-hidden bg-background">
        <div className="absolute left-1/2 top-1/2 h-[100dvw] w-[100dvh] -translate-x-1/2 -translate-y-1/2 rotate-90 [&>*]:!h-full [&>*]:!max-h-full [&>*]:!min-h-0 [&>*]:!overflow-hidden">
          {children}
        </div>
      </div>
    </RotatedCtx.Provider>
  );
}
