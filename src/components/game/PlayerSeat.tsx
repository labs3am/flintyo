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
  return (
    <div
      className={cn(
        "relative flex gap-2 min-w-0 transition-all duration-300",
        side === "top" && "flex-col items-center",
        side === "left" && "flex-row items-center",
        side === "right" && "flex-row-reverse items-center",
        seat.out ? "opacity-55 saturate-[0.6]" : seat.active ? "opacity-100" : "opacity-85",
      )}
    >
      {gained ? (
        <span
          key={`g${gained}`}
          className="anim-pop-up pointer-events-none absolute -top-3 right-0 z-20 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground"
        >
          +{gained}
        </span>
      ) : null}
      {reaction && (
        <span
          key={reaction}
          className="anim-pop-up pointer-events-none absolute -top-6 left-1/2 z-20 -translate-x-1/2 text-2xl drop-shadow"
        >
          {reaction}
        </span>
      )}
      {says && (
        <span
          key={says}
          className="fade-in pointer-events-none absolute -top-7 left-1/2 z-20 max-w-[9rem] truncate rounded-md bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-lg"
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

      {/* Character-first info: name over count, no containers. */}
      <div className="flex min-w-0 flex-col items-center gap-0.5">
        <span className="max-w-full truncate text-[13px] font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {seat.name}
          {seat.bot && <span className="ml-1 text-[10px] font-medium text-ink-faint">AI</span>}
        </span>
        {seat.out ? (
          <span className="text-[11px] font-semibold leading-none text-highlight">
            {seat.place ? `SAFE #${seat.place}` : "SAFE"}
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-semibold leading-none tabular-nums",
              seat.cards > 16 ? "text-danger" : "text-ink-muted",
            )}
          >
            {!compact && <MiniDeck cards={seat.cards} />}
            {seat.cards}
          </span>
        )}
        {seat.active && !seat.out && (
          <span
            key={`t${turnKey ?? 0}`}
            aria-label={`${turnSeconds} second turn timer`}
            className="turn-timer mt-1 h-[3px] w-12 overflow-hidden rounded-full bg-white/10"
            style={{ ["--turn-dur" as string]: `${turnSeconds}s` }}
          >
            <i />
          </span>
        )}
      </div>

      {seat.active && !seat.out && side !== "top" && (
        <span
          className={cn("seat-caret", side === "left" ? "seat-caret--right" : "seat-caret--left")}
          aria-hidden
        >
          <i />
        </span>
      )}
    </div>
  );
}
