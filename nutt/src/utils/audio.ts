/**
 * Experiência sonora 100% sintetizada (Web Audio). Nunca inicia sozinha: o AudioContext
 * só é criado no clique do botão "Ativar experiência sonora".
 * Tudo é propositalmente baixo: textura, não trilha.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = false;

const getNoise = (c: AudioContext) => {
  if (noiseBuffer) return noiseBuffer;
  const len = c.sampleRate * 2;
  noiseBuffer = c.createBuffer(1, len, c.sampleRate);
  const d = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuffer;
};

function startAmbient(c: AudioContext, out: AudioNode) {
  // Ruído marrom filtrado + pad grave respirando: "sala escura com calor".
  const src = c.createBufferSource();
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
  }
  src.buffer = buf;
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.16, c.currentTime + 3);

  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 140;
  lfo.connect(lfoGain).connect(lp.frequency);

  const pad = c.createOscillator();
  pad.type = 'sine';
  pad.frequency.value = 55;
  const padGain = c.createGain();
  padGain.gain.value = 0.035;

  src.connect(lp).connect(g).connect(out);
  pad.connect(padGain).connect(g);
  src.start();
  lfo.start();
  pad.start();
  return {
    stop: () => {
      const t = c.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.6);
      setTimeout(() => {
        src.stop();
        lfo.stop();
        pad.stop();
      }, 700);
    },
  };
}

export const audio = {
  get enabled() {
    return enabled;
  },
  async enable() {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
    }
    await ctx.resume();
    enabled = true;
    ambient = startAmbient(ctx, master!);
  },
  disable() {
    enabled = false;
    ambient?.stop();
    ambient = null;
  },
  /** Crunch: dezenas de micro-fraturas + corpo grave. `power` 0–1. */
  crunch(power = 1) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const now = c.currentTime + 0.005;
    const noise = getNoise(c);
    const bits = Math.round(14 + power * 18);
    for (let i = 0; i < bits; i++) {
      const t = now + Math.pow(Math.random(), 1.8) * (0.09 + power * 0.14);
      const s = c.createBufferSource();
      s.buffer = noise;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1400 + Math.random() * 5200;
      bp.Q.value = 0.9 + Math.random() * 2.5;
      const g = c.createGain();
      const peak = (0.25 + Math.random() * 0.6) * (0.5 + power * 0.5);
      const dur = 0.008 + Math.random() * 0.03;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bp).connect(g).connect(master);
      s.start(t, Math.random() * 1.5, dur + 0.02);
    }
    // corpo: "thump" abafado do grão cedendo
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, now);
    o.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, now);
    og.gain.exponentialRampToValueAtTime(0.35 * power, now + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    o.connect(og).connect(master);
    o.start(now);
    o.stop(now + 0.2);
  },
  /** Transição: sopro filtrado subindo. */
  whoosh(strength = 0.6) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const now = c.currentTime;
    const s = c.createBufferSource();
    s.buffer = getNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(260, now);
    bp.frequency.exponentialRampToValueAtTime(1800, now + 0.7);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12 * strength, now + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    s.connect(bp).connect(g).connect(master);
    s.start(now, Math.random());
    s.stop(now + 1);
  },
  /** Seleção de sabor / ingrediente: toque cristalino muito curto. */
  tick(pitch = 1) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const now = c.currentTime;
    [1, 2.76].forEach((m, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = 880 * pitch * m;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(i ? 0.012 : 0.04, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + (i ? 0.18 : 0.45));
      o.connect(g).connect(master!);
      o.start(now);
      o.stop(now + 0.5);
    });
  },
};
