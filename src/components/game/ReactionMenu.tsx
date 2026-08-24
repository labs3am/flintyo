import { useEffect, useRef, useState } from "react";
import { Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/sound";

export const EMOJI_REACTIONS = ["😂", "😈", "👀", "😱", "😭", "🔥", "💀", "🤡", "👏", "🫏"];

export const ACTION_REACTIONS = [
  { key: "LAUGH", emoji: "😂", label: "Laugh" },
  { key: "MOCK", emoji: "🤪", label: "Mock" },
  { key: "SHOCK", emoji: "😱", label: "Shock" },
  { key: "HIT", emoji: "🍅", label: "Hit" },
  { key: "GG", emoji: "🤝", label: "GG" },
];

const COOLDOWN_MS = 2500;
const HIT_COOLDOWN_MS = 5000;

export function ReactionMenu({ onSend }: { onSend: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [until, setUntil] = useState(0);
  const [, tick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => tick((n) => n + 1), 250);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const cooling = Date.now() < until;
  const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));

  const send = (emoji: string, heavy = false) => {
    if (Date.now() < until) return;
    sfx.reaction();
    onSend(emoji);
    setUntil(Date.now() + (heavy ? HIT_COOLDOWN_MS : COOLDOWN_MS));
    setOpen(false);
  };

  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-[15rem] panel rounded-2xl p-2 fade-in z-30">
          <div className="grid grid-cols-5 gap-1">
            {EMOJI_REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => send(e)}
                disabled={cooling}
                className="text-xl h-9 rounded-lg hover:bg-primary/15 active:scale-90 transition disabled:opacity-40"
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1 border-t border-border/70 pt-1.5">
            {ACTION_REACTIONS.map((a) => (
              <button
                key={a.key}
                onClick={() => send(a.emoji, a.key === "HIT")}
                disabled={cooling}
                className="rounded-lg py-1 text-[9px] font-bold tracking-wide hover:bg-primary/15 active:scale-90 transition disabled:opacity-40"
              >
                <span className="block text-base leading-none">{a.emoji}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Reactions"
        className={cn(
          "h-11 w-11 rounded-full grid place-items-center border border-border bg-surface-elevated transition active:scale-90",
          open && "border-primary text-primary",
          cooling && "opacity-60",
        )}
      >
        {open ? <X className="h-5 w-5" /> : cooling ? <span className="text-xs font-bold">{remaining}</span> : <Smile className="h-5 w-5" />}
      </button>
    </div>
  );
}
