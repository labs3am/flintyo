import { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function useInstallState() {
  const [deferred, setDeferred] = useState<Prompt | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as Prompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true);

  const isIOS =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return { deferred, setDeferred, standalone, isIOS };
}

/** Triggers the native install prompt (Android/desktop). */
function NativeInstall({
  deferred,
  onDone,
}: {
  deferred: Prompt;
  onDone: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary mb-3">
        <Download className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black">Install Flintyo for better play</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Fullscreen cards, no browser chrome, and one-tap access from your home screen.
      </p>
      <button
        onClick={async () => {
          await deferred.prompt();
          onDone();
        }}
        className="mt-5 btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3"
      >
        <Download className="h-4 w-4" /> Install now
      </button>
    </div>
  );
}

/** iOS Share → Add to Home Screen instructions. */
function IOSInstall() {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary mb-3">
        <Share2 className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black">Add Flintyo to Home Screen</h3>
      <ol className="mt-4 text-left text-sm text-muted-foreground space-y-3">
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">1</span>
          <span>Tap the <strong>Share</strong> button in Safari's toolbar.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">2</span>
          <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">3</span>
          <span>Tap <strong>Add</strong> in the top corner.</span>
        </li>
      </ol>
    </div>
  );
}

/** Fallback tip for browsers without a native install prompt. */
function FallbackInstall() {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary mb-3">
        <PlusSquare className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black">Add Flintyo to your home screen</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Open your browser menu and choose <strong>Add to Home Screen</strong> or <strong>Install app</strong>.
      </p>
    </div>
  );
}

function InstallModal({ onClose }: { onClose: () => void }) {
  const { deferred, setDeferred, isIOS } = useInstallState();

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 backdrop-blur p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="panel relative w-full max-w-sm rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {deferred ? (
          <NativeInstall deferred={deferred} onDone={() => { setDeferred(null); onClose(); }} />
        ) : isIOS ? (
          <IOSInstall />
        ) : (
          <FallbackInstall />
        )}
      </div>
    </div>
  );
}

/** Home-screen install button. Opens a popup with platform-specific instructions. */
export function InstallButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { standalone } = useInstallState();

  if (standalone) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm ${className}`}
      >
        <Download className="h-4 w-4" /> Install app
      </button>
      {open && <InstallModal onClose={() => setOpen(false)} />}
    </>
  );
}
