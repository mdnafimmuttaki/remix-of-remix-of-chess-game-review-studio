export type SoundKind = "move" | "capture" | "check" | "castle" | "promote" | "end";

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain = 0.15) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.02);
}

function knock(start: number, gain: number, freq = 180) {
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * 0.06);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq * 6;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

export function playSound(kind: SoundKind) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    switch (kind) {
      case "move":
        knock(0, 0.9);
        break;
      case "capture":
        knock(0, 1.2, 260);
        knock(0.05, 0.7, 200);
        break;
      case "castle":
        knock(0, 0.8);
        knock(0.09, 0.8);
        break;
      case "check":
        knock(0, 0.8);
        tone(880, 0, 0.18, "triangle", 0.08);
        break;
      case "promote":
        knock(0, 0.8);
        tone(660, 0, 0.12, "sine", 0.1);
        tone(990, 0.1, 0.18, "sine", 0.1);
        break;
      case "end":
        tone(523, 0, 0.2, "sine", 0.12);
        tone(392, 0.18, 0.35, "sine", 0.12);
        break;
    }
  } catch {
    /* audio unavailable */
  }
}
