let audioCtx: AudioContext | null = null;
let isMuted = false;
let bgm: HTMLAudioElement | null = null;

type BgmMode = "off" | "home" | "run";

let bgmMode: BgmMode = "off";
let animFrameId: number | null = null;
let rampStartedAt = 0;
let rampDurationMs = 0;
let rampFromVol = 0;
let rampToVol = 0;

const BGM_URL = "/audio/bgm-streso-chorus.mp3";
const BGM_VOLUME_HOME = 0.14;
const BGM_VOLUME_RUN_QUIET = 0.04;
const BGM_VOLUME_RUN_FULL = 0.14;
const BGM_FADE_MS = 500;
const BGM_RAMP_MS = 12_000;

function initAudio(): void {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
}

function initBgm(): HTMLAudioElement {
  if (!bgm) {
    bgm = new Audio(BGM_URL);
    bgm.loop = true;
    bgm.volume = BGM_VOLUME_HOME;
    bgm.preload = "auto";
  }
  return bgm;
}

function cancelBgmAnim(): void {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function animateVolume(from: number, to: number, durationMs: number, onDone?: () => void): void {
  cancelBgmAnim();
  const el = initBgm();
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    el.volume = from + (to - from) * t;
    if (t < 1) {
      animFrameId = requestAnimationFrame(step);
    } else {
      animFrameId = null;
      el.volume = to;
      onDone?.();
    }
  };
  animFrameId = requestAnimationFrame(step);
}

function startRamp(from: number, to: number, durationMs: number): void {
  cancelBgmAnim();
  rampStartedAt = performance.now();
  rampDurationMs = durationMs;
  rampFromVol = from;
  rampToVol = to;
  const el = initBgm();
  const step = (now: number) => {
    const t = Math.min(1, (now - rampStartedAt) / rampDurationMs);
    el.volume = rampFromVol + (rampToVol - rampFromVol) * t;
    if (t < 1) {
      animFrameId = requestAnimationFrame(step);
    } else {
      animFrameId = null;
      el.volume = rampToVol;
      rampDurationMs = 0;
    }
  };
  animFrameId = requestAnimationFrame(step);
}

function resumeRampIfNeeded(): void {
  if (bgmMode !== "run" || !bgm || rampDurationMs <= 0) return;
  const elapsed = performance.now() - rampStartedAt;
  if (elapsed >= rampDurationMs) {
    bgm.volume = rampToVol;
    rampDurationMs = 0;
    return;
  }
  startRamp(bgm.volume, rampToVol, rampDurationMs - elapsed);
}

function playBgmIfAllowed(): void {
  if (isMuted || bgmMode === "off") return;
  void initBgm().play().catch(() => {
    /* iOS/Telegram gesture policy */
  });
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
    if (muted) {
      cancelBgmAnim();
      bgm?.pause();
      return;
    }
    if (bgmMode === "home") {
      const el = initBgm();
      el.volume = BGM_VOLUME_HOME;
      void el.play().catch(() => {
        /* iOS/Telegram gesture policy */
      });
    } else if (bgmMode === "run") {
      const el = initBgm();
      void el.play().catch(() => {
        /* iOS/Telegram gesture policy */
      });
      resumeRampIfNeeded();
    }
  },
  isMuted(): boolean {
    return isMuted;
  },
  startHomeBgm(): void {
    cancelBgmAnim();
    rampDurationMs = 0;
    bgmMode = "home";
    const el = initBgm();
    el.volume = BGM_VOLUME_HOME;
    playBgmIfAllowed();
  },
  fadeOutForRun(): void {
    cancelBgmAnim();
    rampDurationMs = 0;
    const el = initBgm();
    if (bgmMode === "off" || el.paused) {
      bgmMode = "off";
      el.pause();
      return;
    }
    const from = el.volume;
    animateVolume(from, 0, BGM_FADE_MS, () => {
      el.pause();
      bgmMode = "off";
    });
  },
  startManagerBgmRamp(): void {
    cancelBgmAnim();
    bgmMode = "run";
    const el = initBgm();
    el.currentTime = 0;
    el.volume = BGM_VOLUME_RUN_QUIET;
    if (isMuted) {
      rampStartedAt = performance.now();
      rampDurationMs = BGM_RAMP_MS;
      rampFromVol = BGM_VOLUME_RUN_QUIET;
      rampToVol = BGM_VOLUME_RUN_FULL;
      return;
    }
    void el.play().catch(() => {
      /* iOS/Telegram gesture policy */
    });
    startRamp(BGM_VOLUME_RUN_QUIET, BGM_VOLUME_RUN_FULL, BGM_RAMP_MS);
  },
  stopBgm(): void {
    cancelBgmAnim();
    bgmMode = "off";
    rampDurationMs = 0;
    if (!bgm) return;
    bgm.pause();
    bgm.currentTime = 0;
    bgm.volume = BGM_VOLUME_HOME;
  },
  tap(score: number): void {
    playTone(440 + score * 4, "sine", 0.15);
  },
  coffee(): void {
    playTone(880, "sine", 0.1);
    setTimeout(() => playTone(1200, "sine", 0.15), 50);
  },
  gameOver(): void {
    this.stopBgm();
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
  heartbeat(): void {
    playTone(180, "triangle", 0.08);
    setTimeout(() => playTone(160, "triangle", 0.06), 120);
  },
  unmuteTest(): void {
    playTone(440, "sine", 0.1);
  },
};
