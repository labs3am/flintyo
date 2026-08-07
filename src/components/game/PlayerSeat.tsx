import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./Character";
import { getCharacter, type Expression } from "@/lib/characters";
import type { Character } from "@/lib/characters";

export type SeatView = {
  name: string;
  charId?: string;
  bot?: boolean;
  level?: "easy" | "normal" | "hard";
  cards: number;
  out: boolean;
  place: number | null;
  active: boolean;
  isYou?: boolean;
};

export function PlayerSeat({
  seat,
  expression,
  reaction,
  says,
  gained,
  size = 78,
  compact,
}: {
  seat: SeatView;
  expression: Expression;
  reaction?: string | null;
  says?: string | null;
  /** Cards just picked up — flashes a "+N" badge. */
  gained?: number | null;
  size?: number;
  compact?: boolean;
}) {
  const character: Character = getCharacter(seat.charId);
  const plates = ["bg-plate-1", "bg-plate-2", "bg-plate-3", "bg-plate-4", "bg-plate-5"];
  const plate = plates[[...seat.name].reduce((a, c) => a + c.charCodeAt(0), 0) % plates.length];
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-300 min-w-0",
        seat.active ? "bg-primary/12 ring-1 ring-primary glow" : "bg-black/20 ring-1 ring-border/60",
        seat.out && "opacity-70",
      )}
    >
      {gained ? (
        <span
          key={`g${gained}`}
          className="anim-pop-up absolute -top-3 -right-1 z-20 rounded-full border border-destructive/70 bg-destructive/90 px-1.5 py-0.5 text-[9px] font-black text-destructive-foreground pointer-events-none"
        >
          +{gained}
        </span>
      ) : null}
      {reaction && (
        <span
          key={reaction}
          className="anim-pop-up absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow z-20 pointer-events-none"
        >
          {reaction}
        </span>
      )}
      {says && (
        <span
          key={says}
          className="fade-in absolute -top-7 left-1/2 -translate-x-1/2 z-20 max-w-[9rem] truncate rounded-xl rounded-bl-sm border border-primary/50 bg-popover/95 px-2 py-1 text-[10px] font-medium shadow-lg pointer-events-none"
        >
          {says}
        </span>
      )}

      <div
        className={cn(
          seat.out ? "anim-cheer" : seat.active ? "anim-step" : "anim-sway",
        )}
      >
        <CharacterAvatar
          character={character}
          expression={seat.out ? "happy" : expression}
          size={size}
          emphasized={!!reaction || seat.active}
        />
      </div>

      <div className={cn("plate flex items-center gap-1 max-w-full min-w-0 -mt-2", seat.isYou ? "bg-primary text-primary-foreground" : plate)}>
        <span className="truncate text-[11px] leading-4">{seat.name}</span>
        {seat.bot && <span className="text-[9px] opacity-80 shrink-0">AI</span>}
      </div>
      {seat.out ? (
        <span className="text-[10px] font-bold text-gold leading-none">
          {seat.place ? `SAFE #${seat.place}` : "SAFE"}
        </span>
      ) : (
        <div className="flex items-center gap-1">
          {!compact && (
            <span className="flex gap-[2px]">
              {Array.from({ length: Math.min(seat.cards, 6) }).map((_, i) => (
                <span key={i} className="h-3.5 w-2 rounded-[2px] card-back" />
              ))}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-[1px] text-[10px] font-black leading-none tabular-nums",
              seat.cards > 16
                ? "border-destructive/60 bg-destructive/20 text-destructive"
                : "border-gold/50 bg-black/50 text-gold",
            )}
          >
            <span className="h-2.5 w-[7px] rounded-[1px] card-back" />
            {seat.cards}
          </span>
        </div>

      )}
      {seat.active && !seat.isYou && (
        <span className="absolute -bottom-2 text-[9px] font-black tracking-widest text-primary bg-background/90 px-1.5 rounded-full border border-primary/50">
          TURN
        </span>
      )}
    </div>
  );
}
