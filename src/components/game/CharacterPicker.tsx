import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
        <h2 className="text-base font-semibold">Choose your player</h2>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{selected.name}</span> — {selected.personality} ·{" "}
          {selected.tagline}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {CHARACTERS.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              aria-pressed={active}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-colors",
                active
                  ? "border-primary bg-surface-elevated ring-2 ring-primary"
                  : "border-border bg-surface hover:border-ink-faint",
              )}
            >
              {active && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </span>
              )}
              <CharacterAvatar character={c} expression={active ? "excited" : "idle"} size={52} />
              <span className="max-w-full truncate text-[11px] font-semibold">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

