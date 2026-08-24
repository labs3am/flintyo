import { useEffect, useState } from "react";
import { Download, X, Smartphone, Maximize, Zap, Share2 } from "lucide-react";
import { InstallButton } from "./InstallButton";

function useInstallBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [deferred, setDeferred] = useState<Event | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("flintyo.install-banner");
      setDismissed(raw === "dismissed");
    } catch {
      /* ignore */
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true);

  const isIOS =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const canShow = !standalone && !dismissed && (deferred !== null || isIOS || true);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("flintyo.install-banner", "dismissed");
    } catch {
      /* ignore */
    }
  };

  return { canShow, dismiss, deferred };
}

export function InstallBanner({ className = "" }: { className?: string }) {
  const { canShow, dismiss } = useInstallBanner();
  if (!canShow) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-background p-4 ${className}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black leading-tight">
              Install Flintyo for the best play experience
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Play in fullscreen with no browser bars, smoother card animations, and one-tap access from your home screen.
            </p>
            <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1">
                <Maximize className="h-3 w-3 text-primary" /> Fullscreen table
              </li>
              <li className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-primary" /> Smoother play
              </li>
              <li className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-primary" /> Tap-to-open
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <InstallButton className="btn-primary flex-1 sm:flex-none px-4 py-2.5 text-xs" />
          <button
            onClick={dismiss}
            aria-label="Dismiss install banner"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-surface/60 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function InlineInstallCard() {
  const { canShow, dismiss } = useInstallBanner();
  if (!canShow) return null;

  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black">Play better as an app</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add Flintyo to your home screen for fullscreen cards and faster loading.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid h-7 w-7 place-items-center rounded-full border border-border/70 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <InstallButton className="btn-primary flex-1 px-4 py-2 text-xs" />
      </div>
    </div>
  );
}
