import { supabase } from "@/integrations/supabase/client";

// The generated Database types don't include the `rooms` table yet, so use an
// untyped view of the client for room reads/writes.
type RoomRow = { code: string; state: RoomState };
const db = supabase as unknown as {
  from: (table: "rooms") => {
    insert: (v: { code: string; state: unknown }) => Promise<{ error: { message: string } | null }>;
    select: (cols: string) => {
      eq: (col: string, v: string) => { maybeSingle: () => Promise<{ data: RoomRow | null; error: { message: string } | null }> };
    };
    update: (v: { state: unknown }) => {
      eq: (col: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};
import type { GameState } from "@/lib/bhabhi/engine";
import type { ReactionPing } from "@/hooks/useReactions";
import type { Scores } from "@/lib/bhabhi/score";

export type Seat = { id: string; name: string; bot: boolean; char?: string; level?: "easy" | "normal" | "hard" };

export type ChatMsg = { id: string; from: string; name: string; char?: string; text: string; at: number };

export type RoomState = {
  status: "lobby" | "playing";
  hostId: string;
  seats: Seat[];
  game: GameState | null;
  reactions?: ReactionPing[];
  chat?: ChatMsg[];
  /** Player ids that tapped "Ready" in the lobby. */
  ready?: string[];
  /** Cross-round scoreboard keyed by player id. */
  scores?: Scores;
};

const ID_KEY = "donkey.identity.v1";

export type Identity = { id: string; name: string; char?: string };

export function getIdentity(): Identity {
  if (typeof window === "undefined") return { id: "ssr", name: "Player" };
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const fresh: Identity = { id: Math.random().toString(36).slice(2, 10), name: "" };
  localStorage.setItem(ID_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveIdentity(patch: Partial<Identity>) {
  const cur = getIdentity();
  localStorage.setItem(ID_KEY, JSON.stringify({ ...cur, ...patch }));
}

export function setName(name: string) {
  saveIdentity({ name });
}

export const makeCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
};

export async function createRoom(host: Seat): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const state: RoomState = { status: "lobby", hostId: host.id, seats: [host], game: null, reactions: [], chat: [], ready: [host.id] };
    const { error } = await supabase.from("rooms").insert({ code, state: state as never });
    if (!error) return code;
    if (!error.message.includes("duplicate")) throw new Error(error.message);
  }
  throw new Error("Could not create a room. Try again.");
}

export async function fetchRoom(code: string): Promise<RoomState | null> {
  const { data, error } = await supabase.from("rooms").select("state").eq("code", code).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.state as RoomState | undefined) ?? null;
}

export async function saveRoom(code: string, state: RoomState) {
  const { error } = await supabase.from("rooms").update({ state: state as never }).eq("code", code);
  if (error) throw new Error(error.message);
}

/** Read-modify-write helper so concurrent players don't clobber each other's view. */
export async function mutateRoom(code: string, fn: (s: RoomState) => RoomState | null) {
  const current = await fetchRoom(code);
  if (!current) throw new Error("Room not found");
  const next = fn(current);
  if (next) await saveRoom(code, next);
  return next;
}

export function roomLink(code: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/room/${code}`;
}

export function shareMessage(code: string) {
  return `🫏 Come play Donkey with us!\n\nRoom: ${code}\nNo signup. Free to play.\n\n${roomLink(code)}`;
}

export async function shareRoom(code: string) {
  const text = shareMessage(code);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Donkey", text });
      return "shared";
    } catch {
      /* user cancelled — fall through to copy */
    }
  }
  await navigator.clipboard?.writeText(text);
  return "copied";
}

export function whatsappUrl(code: string) {
  return `https://wa.me/?text=${encodeURIComponent(shareMessage(code))}`;
}
