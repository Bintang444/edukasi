// Efek suara sintetis via Web Audio API — tanpa file eksternal
let ctx;
let muted = false;

export const setMuted = (v) => { muted = v; };
export const isMuted = () => muted;

const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const tone = ({ freq = 440, dur = 0.12, type = "sine", vol = 0.06, delay = 0, slideTo }) => {
  if (muted) return;
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime + delay);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + delay + dur);
    g.gain.setValueAtTime(vol, c.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + dur + 0.02);
  } catch {}
};

export const playClick = () => tone({ freq: 620, dur: 0.06, type: "square", vol: 0.04 });

export const playPop = () => tone({ freq: 380, slideTo: 720, dur: 0.09, type: "sine", vol: 0.05 });

export const playTick = () => tone({ freq: 1400, dur: 0.03, type: "square", vol: 0.03 });

export const playWhoosh = () => tone({ freq: 180, slideTo: 950, dur: 0.7, type: "sawtooth", vol: 0.04 });

export const playFail = () => {
  tone({ freq: 160, dur: 0.22, type: "square", vol: 0.06 });
  tone({ freq: 120, dur: 0.28, type: "square", vol: 0.06, delay: 0.16 });
};

export const playDing = () => {
  tone({ freq: 880, dur: 0.14, type: "sine", vol: 0.07 });
  tone({ freq: 1318, dur: 0.22, type: "sine", vol: 0.06, delay: 0.1 });
};

export const playBeep = () => tone({ freq: 980, dur: 0.05, type: "sine", vol: 0.035 });

export const playFanfare = () => {
  [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.16, type: "triangle", vol: 0.07, delay: i * 0.13 }));
  [784, 1047, 1319].forEach((f) => tone({ freq: f, dur: 0.5, type: "triangle", vol: 0.05, delay: 0.55 }));
};

export const playCash = () => {
  [1568, 2093].forEach((f, i) => tone({ freq: f, dur: 0.3, type: "triangle", vol: 0.05, delay: i * 0.09 }));
};
