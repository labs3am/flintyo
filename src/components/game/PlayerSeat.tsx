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

/** Which edge of the table the seat sits on — drives layout + turn caret direction. */
export type SeatSide = "top" | "left" | "right";

/** Mini fanned card stack — the "tidy pile" read for how many cards a player holds. */
function MiniDeck({ cards }: { cards: number }) {
  const shown = Math.min(cards, 3);
  return (
    <span aria-hidden className="relative inline-block" style={{ width: 24, height: 16 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 h-[14px] w-[10.5px] rounded-[2px] card-back"
          style={{
            left: i * 7,
            zIndex: i,
            transform: `rotate(${(i - (shown - 1) * 0.5) * 14}deg)`,
          }}
        />
      ))}
    </span>
  );
}

export function PlayerSeat({
  seat,
  expression,
  reaction,
  says,
  gained,
  size = 78,
  compact,
  turnKey,
  turnSeconds = 12,
  side = "top",
}: {
  seat: SeatView;
  expression: Expression;
  reaction?: string | null;
  says?: string | null;
  /** Cards just picked up — flashes a "+N" badge. */
  gained?: number | null;
  size?: number;
  compact?: boolean;
  /** Changes whenever a new turn starts — restarts the timer bar. */
  turnKey?: number;
  turnSeconds?: number;
  side?: SeatSide;
}) {
  const character: Character = getCharacter(seat.charId);
  const plates = ["bg-plate-1", "bg-plate-2", "bg-plate-3", "bg-plate-4", "bg-plate-5"];
  const plate = plates[[...seat.name].reduce((a, c) => a + c.charCodeAt(0), 0) % plates.length];
  return (
    <div
      className={cn(
        "relative flex gap-2 rounded-2xl px-2 py-1.5 transition-all duration-300 min-w-0",
        side === "top" && "flex-col items-center",
        side === "left" && "flex-row items-center",
        side === "right" && "flex-row-reverse items-center",
        seat.active ? "seat-turn ring-2 ring-turn" : "bg-black/20 ring-1 ring-border/60",
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

      <div className="flex min-w-0 flex-col items-center gap-0.5">
        <div className={cn("plate flex items-center gap-1 max-w-full min-w-0", seat.isYou ? "bg-primary text-primary-foreground" : plate)}>
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
                "inline-flex items-center gap-1.5 rounded-full border px-1.5 py-[1px] text-[10px] font-black leading-none tabular-nums",
                seat.cards > 16
                  ? "border-destructive/60 bg-destructive/20 text-destructive"
                  : "border-gold/50 bg-black/50 text-gold",
              )}
            >
              <MiniDeck cards={seat.cards} />
              {seat.cards}
            </span>
          </div>
        )}
        {seat.active && !seat.out && (
          <span
            key={`t${turnKey ?? 0}`}
            className="turn-timer h-1 w-12 overflow-hidden rounded-full bg-black/40"
            style={{ ["--turn-dur" as string]: `${turnSeconds}s` }}
          >
            <i />
          </span>
        )}
        {seat.active && !seat.out && side !== "top" && (
          <span
            className={cn("seat-caret", side === "left" ? "seat-caret--right" : "seat-caret--left")}
            aria-hidden
          >
            <i />
          </span>
        )}
      </div>
      {seat.active && !seat.isYou && (
        <span
          className="absolute -bottom-2 text-[9px] font-black tracking-widest text-turn bg-background/90 px-1.5 rounded-full border"
          style={{ borderColor: "var(--turn)" }}
        >
          TURN
        </span>
      )}
    </div>
  );
}
