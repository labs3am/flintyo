import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./Character";
import { getCharacter } from "@/lib/characters";
import type { ChatMsg } from "@/lib/room";

const QUICK_LINES = [
  "Let's go! 🫏",
  "You're cooked 😈",
  "Nice one 👏",
  "Hurry up ⏳",
  "Not today 💀",
];

export function RoomChat({
  messages,
  meId,
  onSend,
  className,
  compact,
}: {
  messages: ChatMsg[];
  meId: string;
  onSend: (text: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const send = (value: string) => {
    const t = value.trim().slice(0, 120);
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <div className={cn("flex-1 min-h-0 overflow-y-auto space-y-2 pr-1", compact ? "max-h-48" : "max-h-56")}>
        {messages.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-3 text-center">
            Say something — trash talk is part of the game.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.from === meId;
            return (
              <div key={m.id} className={cn("fade-in flex items-end gap-1.5", mine && "flex-row-reverse")}>
                <CharacterAvatar character={getCharacter(m.char)} expression="idle" size={28} />
                <div className={cn("max-w-[75%] min-w-0", mine && "text-right")}>
                  <span className="block text-[10px] text-muted-foreground truncate">{mine ? "You" : m.name}</span>
                  <span
                    className={cn(
                      "inline-block rounded-lg px-2.5 py-1.5 text-[13px] leading-snug break-words",
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-surface border border-border rounded-bl-sm",
                    )}
                  >
                    {m.text}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1 overflow-x-auto overscroll-x-contain [touch-action:pan-x] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2">
        {QUICK_LINES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0 rounded-md border border-border bg-surface-elevated px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary transition"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          aria-label="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(text)}
          maxLength={120}
          placeholder="Message the table…"
          className="flex-1 min-w-0 rounded-md bg-input border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => send(text)}
          aria-label="Send message"
          className="btn-primary px-3 inline-flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
