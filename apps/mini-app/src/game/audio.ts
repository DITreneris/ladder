let audioCtx: AudioContext | null = null;
let isMuted = false;

function initAudio(): void {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
}

function playTone(freq: number, type: OscillatorType, duration: number): void {
  if (isMuted || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    /* audio blocked */
  }
}

export const audio = {
  init(): void {
    initAudio();
  },
  setMuted(muted: boolean): void {
    isMuted = muted;
  },
  isMuted(): boolean {
    return isMuted;
  },
  tap(score: number): void {
    playTone(440 + score * 4, "sine", 0.15);
  },
  coffee(): void {
    playTone(880, "sine", 0.1);
    setTimeout(() => playTone(1200, "sine", 0.15), 50);
  },
  gameOver(): void {
    playTone(220, "triangle", 0.3);
    setTimeout(() => playTone(150, "sawtooth", 0.4), 150);
  },
  promo(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, "triangle", 0.25), idx * 120);
    });
  },
  nav(): void {
    playTone(600, "sine", 0.05);
  },
  stress(): void {
    playTone(400, "triangle", 0.05);
  },
  reorg(): void {
    playTone(300, "sine", 0.04);
  },
  unmuteTest(): void {
    playTone(440, "sine", 0.1);
  },
};
