import { useCallback, useEffect, useRef, useState } from "react";

export type ReactionPing = { id: string; seat: number; emoji: string; at: number };

const LIFETIME = 1800;

/** Keeps short-lived reaction bubbles keyed by seat, auto-expiring them. */
export function useReactions(incoming?: ReactionPing[]) {
  const [pings, setPings] = useState<ReactionPing[]>([]);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!incoming?.length) return;
    const fresh = incoming.filter((p) => !seen.current.has(p.id) && Date.now() - p.at < LIFETIME);
    if (fresh.length === 0) return;
    fresh.forEach((p) => seen.current.add(p.id));
    setPings((cur) => [...cur, ...fresh]);
  }, [incoming]);

  useEffect(() => {
    if (pings.length === 0) return;
    const t = setInterval(() => {
      setPings((cur) => cur.filter((p) => Date.now() - p.at < LIFETIME));
    }, 300);
    return () => clearInterval(t);
  }, [pings.length]);

  const add = useCallback((seat: number, emoji: string) => {
    const ping = { id: Math.random().toString(36).slice(2), seat, emoji, at: Date.now() };
    seen.current.add(ping.id);
    setPings((cur) => [...cur, ping]);
    return ping;
  }, []);

  const bySeat: Record<number, string> = {};
  for (const p of pings) bySeat[p.seat] = p.emoji;

  return { bySeat, add };
}
