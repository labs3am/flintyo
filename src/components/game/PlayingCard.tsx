import { cn } from "@/lib/utils";
import { isRed, rankLabel, type Card } from "@/lib/bhabhi/engine";
import { Suit } from "./Suit";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-16 w-11 text-[13px] rounded-lg",
  md: "h-[5.5rem] w-16 text-[17px] rounded-xl",
  lg: "h-28 w-20 text-[21px] rounded-2xl",
};

const FACE: Record<number, string> = { 11: "J", 12: "Q", 13: "K" };

/** Classic pip layouts — [xPercent, yPercent] within the central column. */
const PIPS: Record<number, [number, number][]> = {
  2: [[50, 8], [50, 92]],
  3: [[50, 8], [50, 50], [50, 92]],
  4: [[22, 8], [78, 8], [22, 92], [78, 92]],
  5: [[22, 8], [78, 8], [50, 50], [22, 92], [78, 92]],
  6: [[22, 8], [78, 8], [22, 50], [78, 50], [22, 92], [78, 92]],
  7: [[22, 8], [78, 8], [50, 29], [22, 50], [78, 50], [22, 92], [78, 92]],
  8: [[22, 8], [78, 8], [50, 29], [22, 50], [78, 50], [50, 71], [22, 92], [78, 92]],
  9: [[22, 8], [78, 8], [22, 36], [78, 36], [50, 50], [22, 64], [78, 64], [22, 92], [78, 92]],
  10: [[22, 8], [78, 8], [50, 22], [22, 36], [78, 36], [22, 64], [78, 64], [50, 78], [22, 92], [78, 92]],
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
  const ink = red ? "text-[oklch(0.50_0.26_27)]" : "text-[oklch(0.16_0.02_280)]";
  const label = rankLabel(card.r);
  const face = FACE[card.r];
  const pips = PIPS[card.r];

  const corner = (
    <span className="flex flex-col items-center leading-none">
      <span className="font-black leading-[0.88] text-[1.15em] tracking-tighter">{label}</span>
      <Suit suit={card.s} className="mt-[0.08em] w-[0.62em]" />
    </span>
  );

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
      <span className="absolute top-[4%] left-[7%]">{corner}</span>
      <span className="absolute bottom-[4%] right-[7%] rotate-180">{corner}</span>

      {/* centre */}
      <span className="absolute inset-y-[10%] left-[27%] right-[27%] block">
        {card.r === 14 ? (
          <Suit suit={card.s} className="absolute left-1/2 top-1/2 w-[2.1em] -translate-x-1/2 -translate-y-1/2" />
        ) : face ? (
          <span className="absolute inset-0 grid place-items-center">
            <Suit suit={card.s} className="w-[2em] opacity-[0.18]" />
            <span className="absolute text-[1.75em] font-black leading-none tracking-tighter">{face}</span>
          </span>
        ) : pips ? (
          pips.map(([x, y], i) => (
            <Suit
              key={i}
              suit={card.s}
              className="absolute w-[0.8em]"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%)${y > 55 ? " rotate(180deg)" : ""}`,
              }}
            />
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
