let audioCtx: AudioContext | null = null;

const ctx = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
};

const tone = (freq: number, dur: number, type: OscillatorType = "sine", vol = 0.25, delay = 0) => {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.02);
  } catch {}
};

export type SoundType =
  | "chess-move"
  | "chess-capture"
  | "chess-check"
  | "chess-checkmate"
  | "ludo-dice"
  | "ludo-move"
  | "ludo-capture"
  | "ludo-home";

export const playSound = (type: SoundType): void => {
  switch (type) {
    case "chess-move":
      tone(900, 0.07, "square", 0.12);
      break;
    case "chess-capture":
      tone(500, 0.08, "sawtooth", 0.2);
      tone(280, 0.25, "sine", 0.1, 0.06);
      break;
    case "chess-check":
      tone(700, 0.12, "square", 0.22);
      tone(950, 0.12, "square", 0.18, 0.1);
      break;
    case "chess-checkmate":
      [440, 554, 659, 880].forEach((f, i) => tone(f, 0.35, "sine", 0.28, i * 0.17));
      break;
    case "ludo-dice":
      for (let i = 0; i < 9; i++) {
        tone(180 + Math.random() * 320, 0.04, "square", 0.14, i * 0.048);
      }
      break;
    case "ludo-move":
      tone(660, 0.07, "sine", 0.18);
      tone(880, 0.05, "sine", 0.12, 0.05);
      break;
    case "ludo-capture":
      tone(140, 0.28, "sawtooth", 0.32);
      tone(90, 0.45, "sine", 0.18, 0.1);
      break;
    case "ludo-home":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "sine", 0.28, i * 0.11));
      break;
  }
};
