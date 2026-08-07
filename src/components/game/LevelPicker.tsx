import { cn } from "@/lib/utils";

export type Level = "easy" | "normal" | "hard";

export const LEVEL_LABEL: Record<Level, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

const BLURB: Record<Level, string> = {
  easy: "Plays loose and forgiving — good for learning.",
  normal: "Plays it safe and rarely wastes a high card.",
  hard: "Counts the suits and dumps its high cards on you.",
};

export function LevelPicker({
  value,
  onChange,
  className,
}: {
  value: Level;
  onChange: (l: Level) => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-black/20 px-3 py-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">AI difficulty</span>
        <div className="flex gap-1 rounded-lg bg-black/25 p-0.5">
          {(["easy", "normal", "hard"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onChange(l)}
              aria-pressed={value === l}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-bold transition active:scale-95",
                value === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {LEVEL_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{BLURB[value]}</p>
    </div>
  );
}

/** Compact in-game chip that cycles difficulty. */
export function LevelChip({ value, onChange }: { value: Level; onChange?: (l: Level) => void }) {
  const order: Level[] = ["easy", "normal", "hard"];
  const next = () => onChange?.(order[(order.indexOf(value) + 1) % order.length]);
  const Tag = onChange ? "button" : "span";
  return (
    <Tag
      onClick={onChange ? next : undefined}
      title={onChange ? "Tap to change AI difficulty" : undefined}
      className={cn(
        "rounded-full border border-border bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
        value === "hard" ? "text-primary" : value === "easy" ? "text-muted-foreground" : "text-gold",
        onChange && "active:scale-95 transition",
      )}
    >
      AI · {LEVEL_LABEL[value]}
    </Tag>
  );
}
