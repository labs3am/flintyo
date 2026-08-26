/** AI difficulty levels — shared by the picker, the in-game chip and the room. */
export type Level = "easy" | "normal" | "hard";

export const LEVEL_LABEL: Record<Level, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};