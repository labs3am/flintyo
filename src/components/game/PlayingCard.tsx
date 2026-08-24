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
  // One tasteful centered suit keeps the card clean and instantly readable.
  const pipW = size === "sm" ? "w-[2em]" : size === "md" ? "w-[2.6em]" : "w-[3.2em]";
  

  const corner = (
    <span className="flex items-start gap-[0.12em] leading-none">
      <span className="font-black leading-[0.85] text-[1.5em] tracking-tighter">{label}</span>
      <Suit suit={card.s} className="mt-[0.08em] w-[0.8em] shrink-0" />
    </span>
  );

  return (
    <Tag
            type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-label={`${label} of ${card.s}`}
      className={cn(
        "card-face relative shrink-0 select-none overflow-hidden",
        sizes[size],
        ink,
                onClick && !disabled &&
          "cursor-pointer hover:-translate-y-3 active:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        onClick && disabled && "cursor-not-allowed",
        dimmed && "opacity-45 saturate-50",
        selected && "-translate-y-3 ring-2 ring-primary",
        highlight && "ring-2 ring-primary shadow-glow",
        "transition-all duration-fast ease-out",
        className,
      )}
    >
      <span className="absolute top-[3%] left-[8%]">{corner}</span>
      <span aria-hidden className="absolute bottom-[3%] right-[8%] rotate-180 opacity-60">{corner}</span>

      {/* one clean centered suit (or a face letter) */}
      <span className="absolute inset-0 grid place-items-center pointer-events-none">
        {face ? (
          <span className="relative text-[2.4em] font-black leading-none tracking-tighter drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
            {face}
          </span>
        ) : (
          <Suit suit={card.s} className={pipW} />
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
