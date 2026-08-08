import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Home-screen install button. Shows the native prompt on Android/desktop, tips on iOS. */
export function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<Prompt | null>(null);
  const [tip, setTip] = useState(false);

  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true);

  const isIOS =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as Prompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || (!deferred && !isIOS)) return null;

  return (
    <div className={className}>
      <button
        onClick={async () => {
          if (deferred) {
            await deferred.prompt();
            setDeferred(null);
          } else {
            setTip((t) => !t);
          }
        }}
        className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
      >
        <Download className="h-4 w-4" /> Install app
      </button>
      {tip && (
        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
          On iPhone: tap the Share button in Safari, then “Add to Home Screen”.
        </p>
      )}
    </div>
  );
}
