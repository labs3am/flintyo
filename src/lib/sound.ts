/** Tiny WebAudio blips — no assets, no dependency on sound to understand play. */
const KEY = "donkey.sound.v1";

let ctx: AudioContext | null = null;

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) !== "off";
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.06, delay = 0) {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  card: () => tone(420, 0.09, "triangle", 0.05),
  deal: () => [0, 1, 2, 3].forEach((i) => tone(320 + i * 40, 0.07, "triangle", 0.04, i * 0.07)),
  turn: () => tone(660, 0.12, "sine", 0.05),
  pickup: () => {
    tone(240, 0.18, "sawtooth", 0.045);
    tone(180, 0.24, "sawtooth", 0.04, 0.08);
  },
  trick: () => {
    tone(520, 0.1, "sine", 0.05);
    tone(700, 0.12, "sine", 0.045, 0.08);
  },
  reaction: () => tone(880, 0.07, "square", 0.035),
  foul: () => {
    tone(180, 0.12, "square", 0.05);
    tone(120, 0.18, "square", 0.05, 0.09);
  },
  donkey: () => {
    tone(300, 0.22, "sawtooth", 0.06);
    tone(200, 0.3, "sawtooth", 0.06, 0.18);
    tone(140, 0.45, "sawtooth", 0.05, 0.4);
  },
  victory: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", 0.05, i * 0.1)),
};
