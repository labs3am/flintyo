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
    <span className="flex items-start gap-[0.12em] leading-none">
      <span className="font-black leading-[0.85] text-[1.5em] tracking-tighter">{label}</span>
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
      <span className="absolute top-[3%] left-[8%]">{corner}</span>
      <span className="absolute top-[6%] right-[8%]">
        <Suit suit={card.s} className="w-[0.95em]" />
      </span>

      {/* big glossy centre symbol */}
      <span className="absolute inset-x-[10%] bottom-[6%] top-[34%] block">
        {face ? (
          <span className="absolute inset-0 grid place-items-center">
            <Suit suit={card.s} className="w-[85%] opacity-25" />
            <span className="absolute text-[2.4em] font-black leading-none tracking-tighter">{face}</span>
          </span>
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <span className="relative block w-[88%]">
              <Suit suit={card.s} className="w-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]" />
              <Suit
                suit={card.s}
                className="absolute inset-0 w-full text-white opacity-30 [clip-path:inset(0_0_58%_0)]"
              />
            </span>
            {card.r >= 2 && card.r <= 10 && (
              <span className="absolute bottom-[2%] right-[2%] text-[0.85em] font-black leading-none text-white/85 mix-blend-overlay">
                {label}
              </span>
            )}
          </span>
        )}
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
