import { cn } from "@/lib/utils";
import { SUIT_SYMBOL, isRed, rankLabel, type Card } from "@/lib/bhabhi/engine";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-16 w-11 text-[13px] rounded-lg",
  md: "h-22 w-16 text-[17px] rounded-xl",
  lg: "h-28 w-20 text-[21px] rounded-2xl",
};

const FACE: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };

/** Classic pip layouts — [xPercent, yPercent, flipped] per rank. */
const PIPS: Record<number, [number, number][]> = {
  2: [[50, 22], [50, 78]],
  3: [[50, 22], [50, 50], [50, 78]],
  4: [[30, 22], [70, 22], [30, 78], [70, 78]],
  5: [[30, 22], [70, 22], [50, 50], [30, 78], [70, 78]],
  6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
  7: [[30, 22], [70, 22], [50, 36], [30, 50], [70, 50], [30, 78], [70, 78]],
  8: [[30, 22], [70, 22], [50, 36], [30, 50], [70, 50], [50, 64], [30, 78], [70, 78]],
  9: [[30, 20], [70, 20], [30, 40], [70, 40], [50, 50], [30, 60], [70, 60], [30, 80], [70, 80]],
  10: [[30, 18], [70, 18], [50, 30], [30, 40], [70, 40], [30, 60], [70, 60], [50, 70], [30, 82], [70, 82]],
};

export function PlayingCard({
  card,
  size = "md",
  disabled,
  dimmed,
  selected,
  highlight,
  onClick,
  className,
}: {
  card: Card;
  size?: Size;
  disabled?: boolean;
  /** legal-move coaching: greys the card out without hiding it */
  dimmed?: boolean;
  selected?: boolean;
  /** winning card of a trick */
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const red = isRed(card.s);
  const Tag = onClick ? "button" : "div";
  const ink = red ? "text-[oklch(0.50_0.25_27)]" : "text-[oklch(0.18_0.02_280)]";
  const label = rankLabel(card.r);
  const pip = SUIT_SYMBOL[card.s];
  const face = FACE[card.r];
  const pips = PIPS[card.r];

  return (
    <Tag
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-label={`${label} of ${card.s}`}
      className={cn(
        "card-face relative shrink-0 select-none overflow-hidden",
        sizes[size],
        ink,
        onClick && !disabled && "cursor-pointer hover:-translate-y-3 active:-translate-y-1.5",
        onClick && disabled && "cursor-not-allowed",
        dimmed && "opacity-45 saturate-50",
        selected && "-translate-y-3 ring-2 ring-primary",
        highlight && "ring-2 ring-primary shadow-glow",
        "transition-all duration-150",
        className,
      )}
    >
      {/* corner index — top-left */}
      <span className="absolute top-[4%] left-[7%] flex flex-col items-center leading-none">
        <span className="font-black leading-[0.9] text-[1.05em]">{label}</span>
        <span className="text-[0.85em] leading-none">{pip}</span>
      </span>
      {/* corner index — bottom-right, mirrored like a real card */}
      <span className="absolute bottom-[4%] right-[7%] flex flex-col items-center leading-none rotate-180">
        <span className="font-black leading-[0.9] text-[1.05em]">{label}</span>
        <span className="text-[0.85em] leading-none">{pip}</span>
      </span>

      {/* centre — real pip layout for number cards, big letter for faces/ace */}
      <span className="absolute inset-y-[9%] left-[26%] right-[26%]">
        {face ? (
          card.r === 14 ? (
            <span className="absolute inset-0 grid place-items-center">
              <span className="text-[2.6em] leading-none">{pip}</span>
            </span>
          ) : (
            <span className="absolute inset-0 grid place-items-center">
              <span className="text-[2.3em] leading-none opacity-15">{pip}</span>
              <span className="absolute text-[1.5em] font-black leading-none tracking-tight">{face}</span>
            </span>
          )
        ) : pips ? (
          pips.map(([x, y], i) => (
            <span
              key={i}
              className="absolute text-[0.95em] leading-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%)${y > 55 ? " rotate(180deg)" : ""}`,
              }}
            >
              {pip}
            </span>
          ))
        ) : null}
      </span>
    </Tag>
  );
}

export function CardBack({ size = "sm", className }: { size?: Size; className?: string }) {
  return (
    <div className={cn("card-back relative shrink-0 overflow-hidden grid place-items-center", sizes[size], className)}>
      <span className="text-[0.85em] font-black tracking-[0.1em] text-[oklch(0.95_0.05_70)] opacity-80">F</span>
    </div>
  );
}
