import { cn } from "@/lib/utils";
import { CHARACTERS } from "@/lib/characters";
import { CharacterAvatar } from "./Character";

export function CharacterPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const selected = CHARACTERS.find((c) => c.id === value) ?? CHARACTERS[0];
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-center">
        <h2 className="text-lg font-black tracking-tight">Choose Your Player</h2>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-bold">{selected.name}</span> — {selected.personality} · {selected.tagline}
        </p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {CHARACTERS.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl p-1.5 flex flex-col items-center gap-0.5 border transition-all active:scale-95",
                active
                  ? "border-primary bg-primary/12 glow scale-[1.03]"
                  : "border-border/70 bg-surface-elevated/80 hover:border-primary/50"
              )}
            >
              <CharacterAvatar character={c} expression={active ? "excited" : "idle"} size={52} />
              <span className="text-[10px] font-bold truncate max-w-full">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

