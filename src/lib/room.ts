import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
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

/* ------------------------------------------------------------------ *
 * Rooms over Supabase Realtime broadcast — no database table needed.
 * Every connected player keeps a copy of the room state; updates are
 * broadcast with a monotonic version and the highest version wins.
 * A player joining an existing room asks the channel for the state.
 * ------------------------------------------------------------------ */

type Entry = {
  ch: RealtimeChannel;
  v: number;
  state: RoomState | null;
  subs: Set<(s: RoomState) => void>;
  ready: Promise<void>;
};

const rooms = new Map<string, Entry>();

function connect(code: string): Entry {
  const existing = rooms.get(code);
  if (existing) return existing;

  const ch = supabase.channel(`room:${code}`, { config: { broadcast: { self: false } } });
  const entry: Entry = { ch, v: 0, state: null, subs: new Set(), ready: Promise.resolve() };

  ch.on("broadcast", { event: "state" }, ({ payload }) => {
    const p = payload as { v: number; state: RoomState };
    if (!p?.state || p.v <= entry.v) return;
    entry.v = p.v;
    entry.state = p.state;
    entry.subs.forEach((f) => f(p.state));
  });

  ch.on("broadcast", { event: "req" }, () => {
    if (entry.state) void ch.send({ type: "broadcast", event: "state", payload: { v: entry.v, state: entry.state } });
  });

  entry.ready = new Promise<void>((resolve) => {
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") resolve();
    });
  });

  rooms.set(code, entry);
  return entry;
}

export function subscribeRoom(code: string, cb: (s: RoomState) => void) {
  const entry = connect(code);
  entry.subs.add(cb);
  return () => {
    entry.subs.delete(cb);
  };
}

export async function createRoom(host: Seat): Promise<string> {
  const code = makeCode();
  const entry = connect(code);
  await entry.ready;
  entry.v = 1;
  entry.state = { status: "lobby", hostId: host.id, seats: [host], game: null, reactions: [], chat: [], ready: [host.id] };
  await entry.ch.send({ type: "broadcast", event: "state", payload: { v: entry.v, state: entry.state } });
  return code;
}

export async function fetchRoom(code: string): Promise<RoomState | null> {
  const entry = connect(code);
  await entry.ready;
  if (entry.state) return entry.state;

  await entry.ch.send({ type: "broadcast", event: "req", payload: {} });
  const deadline = Date.now() + 2500;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 120));
    if (entry.state) return entry.state;
  }
  return null;
}

export async function saveRoom(code: string, state: RoomState) {
  const entry = connect(code);
  await entry.ready;
  entry.v += 1;
  entry.state = state;
  entry.subs.forEach((f) => f(state));
  await entry.ch.send({ type: "broadcast", event: "state", payload: { v: entry.v, state } });
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
