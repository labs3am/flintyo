import type { Card } from "@/lib/bhabhi/engine";

/** Crisp vector suit glyphs — far more legible than unicode text pips. */
const PATHS: Record<Card["s"], string> = {
  S: "M50 6C50 6 20 32 20 52c0 12 9 21 20 21 5 0 9-2 12-5-1 11-5 18-11 23h38c-6-5-10-12-11-23 3 3 7 5 12 5 11 0 20-9 20-21C100 32 50 6 50 6z",
  H: "M50 91C50 91 8 62 8 36 8 21 19 10 32 10c8 0 15 4 18 11 3-7 10-11 18-11 13 0 24 11 24 26 0 26-42 55-42 55z",
  D: "M50 4 90 50 50 96 10 50z",
  C: "M50 6c-11 0-20 9-20 20 0 4 1 7 3 10-3-2-7-3-11-3-11 0-20 9-20 20s9 20 20 20c8 0 15-4 18-11-1 10-6 20-13 29h46c-7-9-12-19-13-29 3 7 10 11 18 11 11 0 20-9 20-20s-9-20-20-20c-4 0-8 1-11 3 2-3 3-6 3-10 0-11-9-20-20-20z",
};

export function Suit({
  suit,
  className,
  style,
}: {
  suit: Card["s"];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d={PATHS[suit]} />
    </svg>
  );
}
