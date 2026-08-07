import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Bot, Users, Wifi, LogIn, Loader2, Volume2, VolumeX, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CharacterPicker } from "@/components/game/CharacterPicker";
import { CharacterAvatar } from "@/components/game/Character";
import { CHARACTERS, getCharacter } from "@/lib/characters";
import { createRoom, getIdentity, saveIdentity } from "@/lib/room";
import { setSoundEnabled, soundEnabled } from "@/lib/sound";
import { LevelPicker, type Level } from "@/components/game/LevelPicker";
import { TutorialModal } from "@/components/game/Tutorial";


export default function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [char, setChar] = useState(CHARACTERS[0].id);
  const [bots, setBots] = useState(3);
  const [locals, setLocals] = useState(3);
  const [level, setLevelState] = useState<Level>("normal");
  const [tut, setTut] = useState(false);
  const setLevel = (l: Level) => {
    setLevelState(l);
    try {
      localStorage.setItem("flintyo.level", l);
    } catch {
      /* ignore */
    }
  };
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"ai" | "online" | "pass">("ai");
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const id = getIdentity();
    setName(id.name || "");
    if (id.char) setChar(id.char);
    setSound(soundEnabled());
    try {
      const saved = localStorage.getItem("flintyo.level");
      if (saved === "easy" || saved === "hard" || saved === "normal") setLevelState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const commit = () => {
    const n = name.trim() || "Player";
    saveIdentity({ name: n, char });
    return n;
  };

  const startAi = () =>
    navigate(`/play?mode=ai&players=${bots + 1}&name=${encodeURIComponent(commit())}&char=${char}&level=${level}`);
  const startPass = () =>
    navigate(`/play?mode=pass&players=${locals + 1}&name=${encodeURIComponent(commit())}&char=${char}&level=${level}`);

  const host = async () => {
    setBusy(true);
    try {
      const me = getIdentity();
      const roomCode = await createRoom({ id: me.id, name: commit(), bot: false, char });
      navigate(`/room/${roomCode}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        /rooms|schema|relation|permission/i.test(msg)
          ? "Online rooms aren't set up yet — play vs bots or pass & play for now."
          : msg || "Could not create the room",
      );

    } finally {
      setBusy(false);
    }
  };

  const join = () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return toast.error("Enter the 5-letter room code");
    commit();
    navigate(`/room/${c}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-3">
      <div className="w-full max-w-xl">
        <header className="mb-4 flex items-center justify-between gap-2">
          <Link to="/" className="btn-ghost px-3 py-1.5 inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <div className="text-center leading-tight">
            <h1 className="text-2xl font-black tracking-tight text-gradient">FLINTYO</h1>
            <p className="text-[11px] text-muted-foreground">Who's getting the Donkey?</p>
          </div>
          <button
            onClick={() => {
              const next = !sound;
              setSound(next);
              setSoundEnabled(next);
            }}
            aria-label={sound ? "Mute sound" : "Unmute sound"}
            className="h-9 w-9 grid place-items-center rounded-full border border-border bg-black/25 text-muted-foreground"
          >
            {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </header>

        <div className="panel rounded-3xl p-4 space-y-4">
          <CharacterPicker value={char} onChange={setChar} />

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
            <CharacterAvatar character={getCharacter(char)} expression="happy" size={42} />
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={14}
              placeholder="Your nickname"
              className="w-full rounded-xl bg-input/70 border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/25 border border-border">
            {(
              [
                { k: "ai", label: "Play with AI", icon: Bot },
                { k: "online", label: "With friends", icon: Wifi },
                { k: "pass", label: "One phone", icon: Users },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={cn(
                  "rounded-lg py-2 text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors",
                  tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <LevelPicker value={level} onChange={setLevel} />

          {tab === "ai" && (
            <div className="space-y-3">
              <Counter label="AI opponents" value={bots} setValue={setBots} min={1} max={5} />
              <button onClick={startAi} className="btn-primary w-full">
                Deal me in
              </button>
            </div>
          )}

          {tab === "pass" && (
            <div className="space-y-3">
              <Counter label="Players on this device" value={locals + 1} setValue={(v) => setLocals(v - 1)} min={2} max={6} />
              <p className="text-xs text-muted-foreground">
                Everyone shares one screen — each hand stays hidden until that player taps ready.
              </p>
              <button onClick={startPass} className="btn-primary w-full">
                Start pass & play
              </button>
            </div>
          )}

          {tab === "online" && (
            <div className="space-y-3">
              <button onClick={host} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                Create a room
              </button>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or join <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && join()}
                  placeholder="ROOM CODE"
                  maxLength={5}
                  className="flex-1 rounded-xl bg-input/70 border border-border px-3 py-2.5 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-primary"
                />
                <button onClick={join} className="btn-ghost px-4 inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Join
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                No signup. Share the code (or the WhatsApp link from the lobby) and everyone plays on their own phone.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setTut(true)}
          className="mt-4 btn-ghost w-full py-3 inline-flex items-center justify-center gap-2 text-sm"
        >
          <BookOpen className="h-4 w-4" /> How to play
        </button>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          From the house of{" "}
          <a href="https://labs3am.com" target="_blank" rel="noreferrer" className="text-primary font-semibold">
            Labs3am
          </a>
        </p>
      </div>

      {tut && <TutorialModal onClose={() => setTut(false)} />}
    </main>
  );
}

function Counter({
  label,
  value,
  setValue,
  min,
  max,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-black/20 px-3 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => setValue(Math.max(min, value - 1))} className="btn-step" aria-label="Decrease">
          −
        </button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button onClick={() => setValue(Math.min(max, value + 1))} className="btn-step" aria-label="Increase">
          +
        </button>
      </div>
    </div>
  );
}
