export type Expression =
  | "idle"
  | "thinking"
  | "happy"
  | "excited"
  | "confused"
  | "suspicious"
  | "angry"
  | "sad"
  | "laughing"
  | "shocked"
  | "embarrassed"
  | "victory"
  | "defeat";

export type Species = "donkey" | "human" | "monkey" | "cat" | "bear" | "robot" | "fox" | "frog";

export type Accessory = "shades" | "hood" | "headphones" | "cap" | "visor" | "none" | "beanie" | "chain";

export type Character = {
  id: string;
  name: string;
  species: Species;
  accessory: Accessory;
  /** oklch fur/skin colour */
  skin: string;
  /** outfit / jacket colour */
  outfit: string;
  /** accent used for accessories + glow */
  accent: string;
  personality: string;
  tagline: string;
  /** 0..1 — how often this character reacts on its own (AI expressiveness) */
  expressiveness: number;
};

export const CHARACTERS: Character[] = [
  {
    id: "donny",
    name: "Donny",
    species: "donkey",
    accessory: "shades",
    skin: "oklch(0.72 0.05 250)",
    outfit: "oklch(0.55 0.16 25)",
    accent: "oklch(0.85 0.16 90)",
    personality: "Confident · Cocky",
    tagline: "Never the Donkey. Allegedly.",
    expressiveness: 0.9,
  },
  {
    id: "bunty",
    name: "Bunty",
    species: "human",
    accessory: "hood",
    skin: "oklch(0.74 0.07 60)",
    outfit: "oklch(0.52 0.15 265)",
    accent: "oklch(0.80 0.16 150)",
    personality: "Chaotic · Competitive",
    tagline: "Plays first, thinks never.",
    expressiveness: 0.85,
  },
  {
    id: "mira",
    name: "Mira",
    species: "human",
    accessory: "headphones",
    skin: "oklch(0.78 0.06 55)",
    outfit: "oklch(0.45 0.12 300)",
    accent: "oklch(0.78 0.17 330)",
    personality: "Calm · Sarcastic",
    tagline: "Already knows how this ends.",
    expressiveness: 0.4,
  },
  {
    id: "chiku",
    name: "Chiku",
    species: "monkey",
    accessory: "cap",
    skin: "oklch(0.65 0.08 60)",
    outfit: "oklch(0.62 0.17 145)",
    accent: "oklch(0.85 0.17 80)",
    personality: "Hyperactive · Funny",
    tagline: "Cannot sit still. Ever.",
    expressiveness: 1,
  },
  {
    id: "raju",
    name: "Raju",
    species: "human",
    accessory: "beanie",
    skin: "oklch(0.66 0.08 55)",
    outfit: "oklch(0.55 0.13 200)",
    accent: "oklch(0.80 0.14 200)",
    personality: "Chill · Lucky",
    tagline: "Wins without noticing.",
    expressiveness: 0.5,
  },
  {
    id: "kali",
    name: "Kali",
    species: "cat",
    accessory: "chain",
    skin: "oklch(0.38 0.02 280)",
    outfit: "oklch(0.32 0.04 300)",
    accent: "oklch(0.82 0.18 190)",
    personality: "Quiet · Competitive",
    tagline: "Watching. Always watching.",
    expressiveness: 0.35,
  },
  {
    id: "rocky",
    name: "Rocky",
    species: "bear",
    accessory: "none",
    skin: "oklch(0.55 0.06 60)",
    outfit: "oklch(0.42 0.10 30)",
    accent: "oklch(0.75 0.14 40)",
    personality: "Serious · Bad at losing",
    tagline: "Table flip risk: high.",
    expressiveness: 0.25,
  },
  {
    id: "pixel",
    name: "Pixel",
    species: "robot",
    accessory: "visor",
    skin: "oklch(0.72 0.02 250)",
    outfit: "oklch(0.40 0.06 250)",
    accent: "oklch(0.85 0.19 195)",
    personality: "Emotionless… until it isn't",
    tagline: "Calculating. Beep.",
    expressiveness: 0.3,
  },
  {
    id: "juno",
    name: "Juno",
    species: "fox",
    accessory: "shades",
    skin: "oklch(0.68 0.15 55)",
    outfit: "oklch(0.48 0.11 320)",
    accent: "oklch(0.85 0.15 60)",
    personality: "Sly · Charming",
    tagline: "That card was definitely for you.",
    expressiveness: 0.75,
  },
  {
    id: "tofu",
    name: "Tofu",
    species: "frog",
    accessory: "cap",
    skin: "oklch(0.72 0.14 145)",
    outfit: "oklch(0.50 0.10 250)",
    accent: "oklch(0.88 0.16 130)",
    personality: "Awkward · Sweet",
    tagline: "Apologises before winning.",
    expressiveness: 0.65,
  },
];

export const DEFAULT_CHARACTER = CHARACTERS[0]!;

export function getCharacter(id: string | undefined | null): Character {
  return CHARACTERS.find((c) => c.id === id) ?? DEFAULT_CHARACTER;
}

/** Deterministic character for a bot seat so it stays stable across renders. */
export function characterForIndex(i: number): Character {
  return CHARACTERS[i % CHARACTERS.length]!;
}
