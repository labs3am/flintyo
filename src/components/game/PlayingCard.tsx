import { cn } from "@/lib/utils";
import { SUIT_SYMBOL, isRed, rankLabel, type Card } from "@/lib/bhabhi/engine";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-14 w-10 text-[11px] rounded-lg",
  md: "h-20 w-14 text-[15px] rounded-xl",
  lg: "h-28 w-20 text-[20px] rounded-2xl",
};

const FACE: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };

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
  const ink = red ? "text-[oklch(0.55_0.24_25)]" : "text-[oklch(0.22_0.03_280)]";
  const label = rankLabel(card.r);
  const pip = SUIT_SYMBOL[card.s];
  const face = FACE[card.r];

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
      <span className="absolute top-[5%] left-[8%] flex flex-col items-center leading-none">
        <span className="font-black leading-none">{label}</span>
        <span className="text-[0.6em] leading-none">{pip}</span>
      </span>
      {/* corner index — bottom-right, mirrored like a real card */}
      <span className="absolute bottom-[5%] right-[8%] flex flex-col items-center leading-none rotate-180">
        <span className="font-black leading-none">{label}</span>
        <span className="text-[0.6em] leading-none">{pip}</span>
      </span>

      {/* centre */}
      <span className="absolute inset-0 grid place-items-center">
        {face ? (
          <span className="relative grid place-items-center">
            <span className="text-[2.35em] leading-none opacity-15">{pip}</span>
            <span className="absolute text-[1.35em] font-black leading-none tracking-tight">{face}</span>
          </span>
        ) : (
          <span className="text-[2.35em] leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">{pip}</span>
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
