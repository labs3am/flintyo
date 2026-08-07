import { cn } from "@/lib/utils";
import { SUIT_SYMBOL, isRed, rankLabel, type Card } from "@/lib/bhabhi/engine";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-14 w-10 text-[11px] rounded-lg",
  md: "h-20 w-14 text-[15px] rounded-xl",
  lg: "h-28 w-20 text-[20px] rounded-2xl",
};

export function PlayingCard({
  card,
  size = "md",
  disabled,
  selected,
  onClick,
  className,
}: {
  card: Card;
  size?: Size;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const red = isRed(card.s);
  const Tag = onClick ? "button" : "div";
  const ink = red ? "text-[oklch(0.55_0.24_25)]" : "text-[oklch(0.22_0.03_280)]";
  return (
    <Tag
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-label={`${rankLabel(card.r)} of ${card.s}`}
      className={cn(
        "card-face relative shrink-0 select-none overflow-hidden",
        sizes[size],
        ink,
        onClick && !disabled && "cursor-pointer hover:-translate-y-3 active:-translate-y-1.5",
        onClick && disabled && "opacity-95 cursor-not-allowed",
        selected && "-translate-y-3 ring-2 ring-primary",
        "transition-transform duration-150",
        className,
      )}
    >
      {/* top row: big rank left, suit right — Donkey Master style */}
      <span className="absolute top-[6%] left-[9%] leading-none font-black">{rankLabel(card.r)}</span>
      <span className="absolute top-[8%] right-[9%] text-[0.72em] leading-none">{SUIT_SYMBOL[card.s]}</span>
      {/* big center pip */}
      <span className="absolute inset-x-0 bottom-[6%] top-[34%] grid place-items-center">
        <span className="text-[2.6em] leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.12)]">
          {SUIT_SYMBOL[card.s]}
        </span>
      </span>
    </Tag>
  );
}


export function CardBack({ size = "sm", className }: { size?: Size; className?: string }) {
  return <div className={cn("card-back shrink-0", sizes[size], className)} />;
}
