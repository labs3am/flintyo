import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Character, Expression } from "@/lib/characters";

type EyeStyle = "open" | "wide" | "squint" | "smile" | "angry" | "sad" | "closed" | "swirl";

type Face = {
  eyes: EyeStyle;
  /** pupil offset in viewBox units */
  look: [number, number];
  mouth: string;
  brow: number;
  blush?: boolean;
  sweat?: boolean;
  tears?: boolean;
  bounce?: "idle" | "shake" | "hop" | "wobble" | "freeze";
};

const FACES: Record<Expression, Face> = {
  idle: { eyes: "open", look: [0, 0], mouth: "M 42 66 Q 50 71 58 66", brow: 0, bounce: "idle" },
  thinking: { eyes: "squint", look: [3, -2], mouth: "M 43 68 Q 50 65 57 69", brow: -3, bounce: "idle" },
  happy: { eyes: "smile", look: [0, 0], mouth: "M 40 64 Q 50 75 60 64", brow: 1, blush: true, bounce: "hop" },
  excited: { eyes: "wide", look: [0, -1], mouth: "M 40 63 Q 50 79 60 63", brow: 2, blush: true, bounce: "hop" },
  confused: { eyes: "open", look: [-3, 1], mouth: "M 42 69 Q 47 64 51 69 Q 55 74 58 68", brow: -4, bounce: "wobble" },
  suspicious: { eyes: "squint", look: [4, 0], mouth: "M 43 69 L 57 67", brow: -5, bounce: "idle" },
  angry: { eyes: "angry", look: [0, 1], mouth: "M 41 72 Q 50 62 59 72", brow: -7, bounce: "shake" },
  sad: { eyes: "sad", look: [0, 2], mouth: "M 42 72 Q 50 65 58 72", brow: 5, tears: true, bounce: "idle" },
  laughing: { eyes: "smile", look: [0, 0], mouth: "M 39 63 Q 50 80 61 63 Q 50 70 39 63", brow: 2, blush: true, bounce: "hop" },
  shocked: { eyes: "wide", look: [0, 0], mouth: "M 50 70 m -7 0 a 7 8 0 1 0 14 0 a 7 8 0 1 0 -14 0", brow: 6, sweat: true, bounce: "shake" },
  embarrassed: { eyes: "closed", look: [0, 0], mouth: "M 43 70 Q 50 66 57 70", brow: 4, blush: true, sweat: true, bounce: "wobble" },
  victory: { eyes: "smile", look: [0, 0], mouth: "M 39 62 Q 50 80 61 62", brow: 2, blush: true, bounce: "hop" },
  defeat: { eyes: "swirl", look: [0, 0], mouth: "M 42 73 Q 50 64 58 73", brow: 6, tears: true, bounce: "freeze" },
};

const BOUNCE: Record<NonNullable<Face["bounce"]>, string> = {
  idle: "anim-idle",
  shake: "anim-shake",
  hop: "anim-hop",
  wobble: "anim-wobble",
  freeze: "",
};

function Ears({ c }: { c: Character }) {
  const s = c.skin;
  switch (c.species) {
    case "donkey":
      return (
        <g>
          <ellipse cx="30" cy="14" rx="7" ry="18" fill={s} transform="rotate(-14 30 22)" />
          <ellipse cx="70" cy="14" rx="7" ry="18" fill={s} transform="rotate(14 70 22)" />
          <ellipse cx="30" cy="16" rx="3" ry="11" fill="oklch(0.82 0.06 20)" transform="rotate(-14 30 24)" />
          <ellipse cx="70" cy="16" rx="3" ry="11" fill="oklch(0.82 0.06 20)" transform="rotate(14 70 24)" />
        </g>
      );
    case "monkey":
      return (
        <g>
          <circle cx="24" cy="45" r="10" fill={s} />
          <circle cx="76" cy="45" r="10" fill={s} />
          <circle cx="24" cy="45" r="5" fill="oklch(0.82 0.07 50)" />
          <circle cx="76" cy="45" r="5" fill="oklch(0.82 0.07 50)" />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M 30 32 L 28 12 L 46 24 Z" fill={s} />
          <path d="M 70 32 L 72 12 L 54 24 Z" fill={s} />
          <path d="M 33 29 L 32 19 L 42 25 Z" fill="oklch(0.72 0.10 20)" />
          <path d="M 67 29 L 68 19 L 58 25 Z" fill="oklch(0.72 0.10 20)" />
        </g>
      );
    case "fox":
      return (
        <g>
          <path d="M 28 34 L 24 10 L 48 24 Z" fill={s} />
          <path d="M 72 34 L 76 10 L 52 24 Z" fill={s} />
          <path d="M 32 30 L 30 18 L 42 26 Z" fill="oklch(0.30 0.02 300)" />
          <path d="M 68 30 L 70 18 L 58 26 Z" fill="oklch(0.30 0.02 300)" />
        </g>
      );
    case "bear":
      return (
        <g>
          <circle cx="26" cy="26" r="11" fill={s} />
          <circle cx="74" cy="26" r="11" fill={s} />
          <circle cx="26" cy="26" r="5.5" fill="oklch(0.75 0.06 55)" />
          <circle cx="74" cy="26" r="5.5" fill="oklch(0.75 0.06 55)" />
        </g>
      );
    case "frog":
      return (
        <g>
          <circle cx="32" cy="26" r="11" fill={s} />
          <circle cx="68" cy="26" r="11" fill={s} />
        </g>
      );
    case "robot":
      return (
        <g>
          <rect x="20" y="42" width="7" height="16" rx="3" fill={c.outfit} />
          <rect x="73" y="42" width="7" height="16" rx="3" fill={c.outfit} />
          <line x1="50" y1="18" x2="50" y2="8" stroke={c.accent} strokeWidth="3" />
          <circle cx="50" cy="6" r="4" fill={c.accent} className="anim-blink-dot" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx="26" cy="52" rx="5" ry="7" fill={s} />
          <ellipse cx="74" cy="52" rx="5" ry="7" fill={s} />
        </g>
      );
  }
}

function Hair({ c }: { c: Character }) {
  if (c.species !== "human") return null;
  const hair = c.id === "mira" ? "oklch(0.28 0.05 300)" : "oklch(0.25 0.02 60)";
  if (c.id === "mira") {
    return (
      <g>
        <path d="M 26 50 Q 24 20 50 20 Q 76 20 74 50 L 74 40 Q 50 30 26 40 Z" fill={hair} />
        <path d="M 24 46 Q 20 66 24 78 L 32 78 Q 28 62 30 46 Z" fill={hair} />
        <path d="M 76 46 Q 80 66 76 78 L 68 78 Q 72 62 70 46 Z" fill={hair} />
      </g>
    );
  }
  return <path d="M 27 46 Q 26 18 50 18 Q 74 18 73 46 Q 62 32 50 34 Q 38 32 27 46 Z" fill={hair} />;
}

function Accessory({ c }: { c: Character; expr: Expression }) {
  switch (c.accessory) {
    case "shades":
      return (
        <g>
          <rect x="28" y="44" width="19" height="12" rx="5" fill="oklch(0.18 0.01 260)" />
          <rect x="53" y="44" width="19" height="12" rx="5" fill="oklch(0.18 0.01 260)" />
          <rect x="46" y="48" width="8" height="3" fill="oklch(0.18 0.01 260)" />
          <rect x="31" y="46" width="6" height="3" rx="1.5" fill="oklch(1 0 0 / 0.35)" />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M 22 50 Q 22 18 50 18 Q 78 18 78 50" stroke={c.accent} strokeWidth="6" fill="none" strokeLinecap="round" />
          <rect x="14" y="44" width="14" height="20" rx="7" fill={c.accent} />
          <rect x="72" y="44" width="14" height="20" rx="7" fill={c.accent} />
        </g>
      );
    case "hood":
      return (
        <path
          d="M 18 84 Q 12 40 50 34 Q 88 40 82 84 L 74 84 Q 78 48 50 44 Q 22 48 26 84 Z"
          fill={c.outfit}
        />
      );
    case "cap":
      return (
        <g>
          <path d="M 26 40 Q 28 16 50 16 Q 72 16 74 40 Z" fill={c.accent} />
          <path d="M 24 40 Q 44 34 76 40 Q 78 46 68 46 L 24 45 Z" fill={c.outfit} />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M 26 42 Q 26 18 50 18 Q 74 18 74 42 Z" fill={c.accent} />
          <rect x="24" y="38" width="52" height="8" rx="4" fill={c.outfit} />
        </g>
      );
    case "visor":
      return (
        <g>
          <rect x="24" y="42" width="52" height="16" rx="8" fill="oklch(0.20 0.02 250)" />
          <rect x="28" y="47" width="44" height="6" rx="3" fill={c.accent} className="anim-scan" />
        </g>
      );
    case "chain":
      return (
        <g>
          <path d="M 34 88 Q 50 98 66 88" stroke={c.accent} strokeWidth="3" fill="none" />
          <circle cx="50" cy="95" r="3.5" fill={c.accent} />
        </g>
      );
    default:
      return null;
  }
}

function Eyes({ face, c }: { face: Face; c: Character }) {
  const [dx, dy] = face.look;
  const dark = "oklch(0.18 0.01 260)";
  const eye = (cx: number, mirror: number) => {
    switch (face.eyes) {
      case "smile":
        return (
          <path
            d={`M ${cx - 7} 53 Q ${cx} 45 ${cx + 7} 53`}
            stroke={dark}
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "closed":
        return (
          <path
            d={`M ${cx - 7} 51 Q ${cx} 57 ${cx + 7} 51`}
            stroke={dark}
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "swirl":
        return (
          <path
            d={`M ${cx} 51 m -6 0 a 6 6 0 1 1 4 5.6 a 3.5 3.5 0 1 1 2.4 -4`}
            stroke={dark}
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
        );
      default: {
        const rx = face.eyes === "wide" ? 8 : face.eyes === "squint" ? 7 : 7;
        const ry = face.eyes === "wide" ? 9 : face.eyes === "squint" ? 3.4 : 7.5;
        const pr = face.eyes === "wide" ? 3.4 : 3.6;
        return (
          <g>
            <ellipse cx={cx} cy="51" rx={rx} ry={ry} fill="oklch(0.99 0.005 100)" />
            <circle cx={cx + dx * mirror} cy={51 + dy} r={pr} fill={dark} />
            <circle cx={cx + dx * mirror - 1.2} cy={49 + dy} r="1.1" fill="oklch(1 0 0 / 0.9)" />
          </g>
        );
      }
    }
  };
  return (
    <g className="anim-blink">
      {eye(38, 1)}
      {eye(62, 1)}
      {/* brows */}
      <path
        d={`M 31 ${41 - face.brow * 0.5} L 45 ${41 + face.brow}`}
        stroke={dark}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity={c.species === "robot" ? 0 : 0.85}
      />
      <path
        d={`M 69 ${41 - face.brow * 0.5} L 55 ${41 + face.brow}`}
        stroke={dark}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity={c.species === "robot" ? 0 : 0.85}
      />
    </g>
  );
}

function Snout({ c }: { c: Character }) {
  switch (c.species) {
    case "donkey":
      return (
        <g>
          <ellipse cx="50" cy="70" rx="17" ry="13" fill="oklch(0.86 0.03 250)" />
          <ellipse cx="44" cy="66" rx="2.4" ry="3.4" fill="oklch(0.35 0.02 260)" />
          <ellipse cx="56" cy="66" rx="2.4" ry="3.4" fill="oklch(0.35 0.02 260)" />
        </g>
      );
    case "cat":
    case "fox":
      return (
        <g>
          <path d="M 50 62 l -4 3 l 4 3 l 4 -3 z" fill="oklch(0.65 0.13 20)" />
          <line x1="26" y1="64" x2="40" y2="66" stroke="oklch(0.95 0 0 / 0.6)" strokeWidth="1.2" />
          <line x1="74" y1="64" x2="60" y2="66" stroke="oklch(0.95 0 0 / 0.6)" strokeWidth="1.2" />
        </g>
      );
    case "bear":
    case "monkey":
      return (
        <g>
          <ellipse cx="50" cy="68" rx="14" ry="11" fill="oklch(0.84 0.05 60)" />
          <ellipse cx="50" cy="62" rx="4" ry="3" fill="oklch(0.35 0.03 40)" />
        </g>
      );
    default:
      return <ellipse cx="50" cy="61" rx="2.6" ry="2" fill="oklch(0.40 0.03 40)" opacity="0.5" />;
  }
}

export type CharacterAvatarProps = {
  character: Character;
  expression?: Expression;
  size?: number;
  className?: string;
  /** temporarily scale up for a reaction beat */
  emphasized?: boolean;
};

export const CharacterAvatar = memo(function CharacterAvatar({
  character: c,
  expression = "idle",
  size = 84,
  className,
  emphasized,
}: CharacterAvatarProps) {
  const face = FACES[expression];
  const headShape =
    c.species === "robot" ? (
      <rect x="20" y="22" width="60" height="58" rx="16" fill={c.skin} />
    ) : c.species === "donkey" ? (
      <ellipse cx="50" cy="52" rx="30" ry="32" fill={c.skin} />
    ) : c.species === "frog" ? (
      <ellipse cx="50" cy="56" rx="32" ry="28" fill={c.skin} />
    ) : (
      <ellipse cx="50" cy="52" rx="29" ry="31" fill={c.skin} />
    );

  return (
    <div
      className={cn(
        "relative shrink-0 transition-transform duration-300 ease-out",
        emphasized && "scale-[1.18]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 104" width={size} height={size} className={cn(BOUNCE[face.bounce ?? "idle"])}>
        {/* body */}
        <path d="M 18 104 Q 20 82 50 80 Q 80 82 82 104 Z" fill={c.outfit} />
        <path d="M 42 80 h 16 v 8 h -16 z" fill={c.skin} />
        <Ears c={c} />
        {headShape}
        <Hair c={c} />
        <Snout c={c} />
        <Eyes face={face} c={c} />
        <path d={face.mouth} stroke="oklch(0.20 0.02 40)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {face.blush && (
          <g opacity="0.55">
            <ellipse cx="30" cy="63" rx="6" ry="3.6" fill="oklch(0.72 0.16 20)" />
            <ellipse cx="70" cy="63" rx="6" ry="3.6" fill="oklch(0.72 0.16 20)" />
          </g>
        )}
        {face.sweat && (
          <path d="M 78 34 q 5 8 0 11 q -5 -3 0 -11" fill="oklch(0.80 0.12 230)" className="anim-drip" />
        )}
        {face.tears && (
          <g fill="oklch(0.80 0.12 230)" className="anim-drip">
            <ellipse cx="34" cy="62" rx="2.4" ry="4" />
            <ellipse cx="66" cy="62" rx="2.4" ry="4" />
          </g>
        )}
        <Accessory c={c} expr={expression} />
      </svg>
    </div>
  );
});
