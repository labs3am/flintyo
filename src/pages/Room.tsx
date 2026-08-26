import { Seo } from "@/components/Seo";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, Check, Copy, Loader2, LogOut, MessageSquare, Play, Share2, Users, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { GameTable } from "@/components/game/GameTable";
import { LandscapeShell } from "@/components/game/LandscapeShell";
import { Countdown, DonkeyReveal } from "@/components/game/DonkeyReveal";
import { CharacterAvatar } from "@/components/game/Character";
import { createGame, playCard } from "@/lib/bhabhi/engine";
import { chooseCard, botDelay, type Difficulty } from "@/lib/bhabhi/ai";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { RoomChat } from "@/components/game/RoomChat";
import { fetchRoom, getIdentity, leaveRoom, mutateRoom, saveIdentity, shareRoom, subscribeRoom, whatsappUrl, type ChatMsg, type RoomState } from "@/lib/room";
import { applyResult } from "@/lib/bhabhi/score";
import { ScoreBoard } from "@/components/game/ScoreBoard";
import { useReactions } from "@/hooks/useReactions";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { LevelPicker, LEVEL_LABEL, type Level } from "@/components/game/LevelPicker";

export default function RoomPage() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [me, setMe] = useState(() => getIdentity());
  const [nameDraft, setNameDraft] = useState(() => getIdentity().name ?? "");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [counting, setCounting] = useState(false);
  const joinedRef = useRef(false);
  const seqRef = useRef(-1);
  const startedRef = useRef(false);
  const scoredRef = useRef(-1);
  const [chatOpen, setChatOpen] = useState(false);
  const [seenChat, setSeenChat] = useState(0);
  const [tick, setTick] = useState(0);
  const [botLevel, setBotLevel] = useState<Level>(() => {
    try {
      const v = localStorage.getItem("flintyo.level");
      return v === "easy" || v === "hard" ? v : "normal";
    } catch {
      return "normal";
    }
  });
  const { bySeat, add } = useReactions(room?.reactions);

  const refresh = useCallback(async () => {
    try {
      const r = await fetchRoom(code);
      if (!r) {
        setError("That room doesn't exist (or expired).");
        return;
      }
      setRoom(r);
      setStale(false);
    } catch {
      setStale(true);
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Join the room once, then subscribe to live updates.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      try {
        const next = await mutateRoom(code, (s) => {
          if (s.seats.some((x) => x.id === me.id)) return null;
          if (s.status === "playing") return null;
          if (s.seats.length >= 6) return null;
          const taken = new Set(s.seats.map((x) => x.char));
          const char = me.char && !taken.has(me.char)
            ? me.char
            : (CHARACTERS.find((c) => !taken.has(c.id)) ?? CHARACTERS[0]).id;
          return { ...s, seats: [...s.seats, { id: me.id, name: me.name || "Player", bot: false, char }] };
        });
        if (alive && next) setRoom(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not join");
      }
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [code, me.id, me.name, me.char, refresh]);

  useEffect(() => {
    const off = subscribeRoom(code, (next) => {
      setRoom(next);
      setStale(false);
      setLoading(false);
    });
    const poll = setInterval(refresh, 2500);
    return () => {
      off();
      clearInterval(poll);
    };
  }, [code, refresh]);

  // Leaving the tab / closing the app frees the seat.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void leaveRoom(code, me.id, me.name);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [code, me.id, me.name]);

  const leave = async () => {
    await leaveRoom(code, me.id, me.name);
    navigate("/");
  };

  // Show the "someone left" banner once.
  const noticeRef = useRef(0);
  useEffect(() => {
    const n = room?.notice;
    if (!n || n.at === noticeRef.current) return;
    noticeRef.current = n.at;
    if (Date.now() - n.at < 15000) toast.info(n.text);
  }, [room?.notice]);

  const isHost = room?.hostId === me.id;
  const mySeat = room?.game ? room.game.players.findIndex((p) => p.id === me.id) : -1;

  const push = async (fn: (s: RoomState) => RoomState | null) => {
    // Optimistic: paint locally first so play feels instant, then persist.
    setRoom((cur) => (cur ? (fn(cur) ?? cur) : cur));
    try {
      const next = await mutateRoom(code, fn);
      if (next) setRoom(next);
      setStale(false);
    } catch {
      setStale(true);
      void refresh();
    }
  };


  const addBot = () =>
    push((s) => {
      if (s.seats.length >= 6) return null;
      const taken = new Set(s.seats.map((x) => x.char));
      const c = CHARACTERS.find((x) => !taken.has(x.id)) ?? CHARACTERS[0];
      return {
        ...s,
        seats: [...s.seats, { id: `bot-${Math.random().toString(36).slice(2, 6)}`, name: c.name, bot: true, char: c.id, level: botLevel }],
      };
    });

  const changeBotLevel = (l: Level) => {
    setBotLevel(l);
    try {
      localStorage.setItem("flintyo.level", l);
    } catch {
      /* ignore */
    }
    void push((s) =>
      s.seats.some((x) => x.bot)
        ? { ...s, seats: s.seats.map((x) => (x.bot ? { ...x, level: l } : x)) }
        : null,
    );
  };

  const start = () =>
    push((s) => (s.seats.length < 2 ? null : { ...s, status: "playing", game: createGame(s.seats), reactions: [] }));

  const rematch = () => push((s) => ({ ...s, status: "playing", game: createGame(s.seats), reactions: [] }));

  const play = (cardId: string) =>
    push((s) => (s.game && mySeat >= 0 ? { ...s, game: playCard(s.game, mySeat, cardId) } : null));

  const react = (emoji: string) => {
    if (mySeat < 0) return;
    const ping = add(mySeat, emoji);
    void push((s) => ({
      ...s,
      reactions: [...(s.reactions ?? []).filter((r) => Date.now() - r.at < 4000), ping].slice(-8),
    }));
  };

  const sendChat = (text: string) => {
    const msg: ChatMsg = {
      id: Math.random().toString(36).slice(2),
      from: me.id,
      name: me.name || "Player",
      char: room?.seats.find((x) => x.id === me.id)?.char,
      text,
      at: Date.now(),
    };
    void push((s) => ({ ...s, chat: [...(s.chat ?? []), msg].slice(-40) }));
  };

  const toggleReady = () =>
    push((s) => {
      const cur = s.ready ?? [];
      return { ...s, ready: cur.includes(me.id) ? cur.filter((x) => x !== me.id) : [...cur, me.id] };
    });

  const saveName = () => {
    const name = nameDraft.trim().slice(0, 14);
    if (!name) return;
    saveIdentity({ name });
    setMe((m) => ({ ...m, name }));
    void push((s) => ({ ...s, seats: s.seats.map((x) => (x.id === me.id ? { ...x, name } : x)) }));
    toast.success("Name saved");
  };


  // Keep speech bubbles ticking so they expire.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatOpen) setSeenChat(room?.chat?.length ?? 0);
  }, [chatOpen, room?.chat?.length]);

  // The host device drives the bots.
  useEffect(() => {
    const game = room?.game;
    if (!isHost || !game || game.phase === "over") return;
    if (!game.players[game.turn]?.bot) return;
    const seq = game.seq;
    const level = (game.players[game.turn].level as Difficulty) ?? "normal";
    const t = setTimeout(() => {
      void push((s) => {
        if (!s.game || s.game.seq !== seq || s.game.phase === "over" || !s.game.players[s.game.turn].bot) return null;
        const card = chooseCard(s.game, s.game.turn, (s.game.players[s.game.turn].level as Difficulty) ?? "normal");
        return card ? { ...s, game: playCard(s.game, s.game.turn, card.id) } : null;
      });
    }, botDelay(level) + (game.lastTrick ? 900 : 0));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.game?.seq, room?.game?.turn, isHost]);

  // The host records the result once each round ends.
  useEffect(() => {
    const game = room?.game;
    if (!isHost || !game || game.phase !== "over") return;
    if (scoredRef.current === game.seq) return;
    scoredRef.current = game.seq;
    void push((s) => (s.game && s.game.phase === "over" ? { ...s, scores: applyResult(s.scores ?? {}, s.game) } : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.game?.phase, room?.game?.seq, isHost]);

  // Sound cues on state change.
  useEffect(() => {
    const game = room?.game;
    if (!game || game.seq === seqRef.current) return;
    seqRef.current = game.seq;
    if (game.event.t === "play") sfx.card();
    if (game.event.t === "trick") sfx.trick();
    if (game.event.t === "pickup") sfx.pickup();
  }, [room?.game]);

  // Kick off the ready countdown the first time the game appears.
  useEffect(() => {
    if (room?.status === "playing" && room.game && !startedRef.current) {
      startedRef.current = true;
      setCounting(true);
    }
    if (room?.status === "lobby") startedRef.current = false;
  }, [room?.status, room?.game]);

  const chat = room?.chat ?? [];
  const unread = chatOpen ? 0 : Math.max(0, chat.length - seenChat);

  const says: Record<number, string> = {};
  if (room?.game) {
    void tick;
    for (const m of chat) {
      if (Date.now() - m.at > 6000) continue;
      const seat = room.game.players.findIndex((p) => p.id === m.from);
      if (seat >= 0) says[seat] = m.text;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center">
        <div className="panel rounded-2xl p-6 space-y-3">
          <p className="text-lg font-bold">{error ?? "Room unavailable"}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to menu
          </button>
        </div>
      </main>
    );
  }

  const game = room.game;
  const humans = room.seats.filter((s) => !s.bot).length;
  const readyCount = room.seats.filter((s) => !s.bot && ((room.ready ?? []).includes(s.id) || s.id === room.hostId)).length;
  const iAmReady = (room.ready ?? []).includes(me.id) || isHost;

  return (
    <LandscapeShell>
    <main
      className={cn(
        "w-full max-w-5xl mx-auto overflow-x-hidden p-2.5 md:p-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2",
        room.status === "playing" && game
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden"
          : "min-h-screen",
      )}
    >
      <Seo title="Donkey Room — Flintyo" description="Join a Flintyo Donkey room with a room code and play with friends online." path={`/room/${code}`} />
      <h1 className="sr-only">Flintyo game room {code} — play the Donkey card game online</h1>
      <header className="shrink-0 px-1 py-1 flex items-center justify-between gap-2">
        <button onClick={leave} className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Leave
        </button>

        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              toast.success("Room code copied");
            } catch {
              toast.info(`Room code: ${code}`);
            }
          }}
          className="inline-flex items-center gap-2 text-lg font-black tracking-[0.35em] text-gradient"
          title="Copy room code"
        >
          {code} <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {room.seats.length}
        </span>
      </header>

      {stale && (
        <p className="text-center text-[11px] text-primary anim-pulse-soft">Trying to reconnect…</p>
      )}

      {room.status === "lobby" || !game ? (
        <div className="panel rounded-3xl p-5 space-y-4 max-w-md w-full mx-auto mt-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Room code</p>
            <p className="text-5xl font-black tracking-[0.3em] text-gradient mt-1">{code}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                const r = await shareRoom(code);
                if (r === "shared") toast.success("Invite shared");
                else if (r === "copied") toast.success("Invite copied");
                else toast.info(`Share this room code: ${code}`);
              }}
              className="btn-ghost py-2.5 inline-flex items-center justify-center gap-2 text-xs"
            >
              <Share2 className="h-4 w-4" /> Share room
            </button>
            <a
              href={whatsappUrl(code)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost py-2.5 inline-flex items-center justify-center gap-2 text-xs"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="player-name" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Your name
            </label>
            <div className="flex gap-2">
              <input
                id="player-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="Enter your name"
                maxLength={14}
                className="flex-1 min-w-0 rounded-xl border border-border/70 bg-surface/60 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={saveName}
                disabled={!nameDraft.trim() || nameDraft.trim() === me.name}
                className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>

          {room.seats.length <= 1 && (
            <p className="text-center text-xs text-muted-foreground rounded-2xl border border-dashed border-border/70 py-3 px-2">
              No one else is in this room yet — share the code or add an AI player.
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">

            {room.seats.map((s) => (
              <div key={s.id} className="fade-in flex flex-col items-center gap-1 rounded-2xl border border-border/70 bg-surface/50 py-2">
                <CharacterAvatar character={getCharacter(s.char)} expression="idle" size={58} />
                <span className="text-[11px] font-bold truncate max-w-full px-1">{s.name}</span>
                <span className="text-[9px] text-muted-foreground">
                  {s.bot
                    ? `AI · ${LEVEL_LABEL[(s.level as Level) ?? "normal"]}`
                    : s.id === room.hostId
                      ? "HOST"
                      : (room.ready ?? []).includes(s.id)
                        ? "READY"
                        : s.id === me.id
                          ? "YOU"
                          : "WAITING"}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {isHost && <LevelPicker value={botLevel} onChange={changeBotLevel} />}
            {isHost && (
              <button onClick={addBot} className="btn-ghost w-full py-2.5 inline-flex items-center justify-center gap-2 text-xs">
                <Bot className="h-4 w-4" /> Add AI player
              </button>
            )}
            <button
              onClick={isHost ? start : toggleReady}
              disabled={isHost && room.seats.length < 2}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 py-3 text-base",
                isHost ? "btn-primary disabled:opacity-40" : iAmReady ? "btn-ghost" : "btn-primary",
              )}
            >
              {isHost ? (
                <>
                  <Play className="h-5 w-5" />
                  {room.seats.length < 2 ? "Waiting for players…" : `Start game · ${readyCount}/${humans} ready`}
                </>
              ) : iAmReady ? (
                <>
                  <Check className="h-5 w-5" /> Ready — waiting for host
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" /> I'm ready
                </>
              )}
            </button>
            {!isHost && (
              <p className="text-center text-[11px] text-muted-foreground">
                {readyCount}/{humans} players ready · the host deals when everyone's in.
              </p>
            )}
          </div>

          {room && Object.keys(room.scores ?? {}).length > 0 && (
            <ScoreBoard scores={room.scores} players={room.seats.map((x) => ({ id: x.id, name: x.name }))} />
          )}

          <div className="border-t border-border/70 pt-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Table chat</p>
            <RoomChat messages={chat} meId={me.id} onSend={sendChat} compact />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative flex flex-col">
          <GameTable
            state={game}
            mySeat={mySeat >= 0 ? mySeat : null}
            onPlay={play}
            reactions={bySeat}
            onReact={mySeat >= 0 ? react : undefined}
            says={says}
            scores={room?.scores}
            waitingLabel={mySeat < 0 ? "Spectating this round" : undefined}
          />

          <button
            onClick={() => {
              if (window.confirm("Exit the game and leave this room?")) void leave();
            }}
            aria-label="Exit game"
            className="fixed top-3 right-3 z-30 h-11 rounded-full px-3 inline-flex items-center gap-1.5 border border-border bg-surface-elevated text-foreground/90 text-xs font-semibold active:scale-95 transition"
          >
            <LogOut className="h-4 w-4" /> Exit
          </button>



          <button
            onClick={() => {
              setChatOpen((o) => !o);
              setSeenChat(chat.length);
            }}
            aria-label="Table chat"
            className="fixed bottom-4 left-4 z-30 h-11 w-11 rounded-full grid place-items-center border border-border bg-surface-elevated active:scale-95 transition"
          >
            {chatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black grid place-items-center">
                {unread}
              </span>
            )}
          </button>
          {chatOpen && (
            <div className="fixed bottom-20 left-4 right-4 md:right-auto md:w-80 z-30 panel rounded-2xl p-3 fade-in">
              <RoomChat messages={chat} meId={me.id} onSend={sendChat} compact />
            </div>
          )}
          {counting && <Countdown onDone={() => { setCounting(false); sfx.deal(); }} />}
          {game.phase === "over" && !counting && (
            <DonkeyReveal
              state={game}
              onRematch={isHost ? rematch : undefined}
              footer={
                !isHost ? (
                  <p className="text-xs text-muted-foreground">Waiting for the host to start a rematch…</p>
                ) : null
              }
            />
          )}
        </div>
      )}
    </main>
    </LandscapeShell>
  );
}
