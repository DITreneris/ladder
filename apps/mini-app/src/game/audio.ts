let audioCtx: AudioContext | null = null;
let isMuted = false;
let bgm: HTMLAudioElement | null = null;

type BgmMode = "off" | "run";

let bgmMode: BgmMode = "off";
let animFrameId: number | null = null;
let rampStartedAt = 0;
let rampDurationMs = 0;
let rampFromVol = 0;
let rampToVol = 0;

let humOsc: OscillatorNode | null = null;
let humGain: GainNode | null = null;

const BGM_URL = "/audio/bgm-streso-chorus.mp3";
const BGM_VOLUME_RUN_QUIET = 0.04;
const BGM_VOLUME_RUN_FULL = 0.14;
const BGM_VOLUME_EXEC_BOARD = 0.17;
const BGM_VOLUME_EXEC_ANGEL = 0.20;
const BGM_RAMP_MS = 12_000;
const BGM_EXEC_RAMP_MS = 8_000;
const HUM_FREQ_HZ = 55;
const HUM_GAIN_BOARD = 0.015;
const HUM_GAIN_ANGEL = 0.022;

function initAudio(): void {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
}

function initBgm(): HTMLAudioElement {
  if (!bgm) {
    bgm = new Audio(BGM_URL);
    bgm.loop = true;
    bgm.volume = BGM_VOLUME_RUN_QUIET;
    bgm.preload = "none";
  }
  return bgm;
}

function cancelBgmAnim(): void {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

function stopExecutiveHum(): void {
  if (humOsc) {
    try {
      humOsc.stop();
    } catch {
      /* already stopped */
    }
    humOsc.disconnect();
    humOsc = null;
  }
  if (humGain) {
    humGain.disconnect();
    humGain = null;
  }
}

function startExecutiveHum(gainLevel: number): void {
  if (isMuted || !audioCtx) return;
  stopExecutiveHum();
  try {
    humOsc = audioCtx.createOscillator();
    humGain = audioCtx.createGain();
    humOsc.type = "sine";
    humOsc.frequency.setValueAtTime(HUM_FREQ_HZ, audioCtx.currentTime);
    humGain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
    humOsc.connect(humGain);
    humGain.connect(audioCtx.destination);
    humOsc.start();
  } catch {
    stopExecutiveHum();
  }
}

function setExecutiveHumGain(gainLevel: number): void {
  if (!humGain || !audioCtx || isMuted) return;
  humGain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
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
      stopExecutiveHum();
      bgm?.pause();
      return;
    }
    if (bgmMode === "run") {
      const el = initBgm();
      void el.play().catch(() => {
        /* iOS/Telegram gesture policy */
      });
      resumeRampIfNeeded();
      if (humOsc && humGain) {
        const level = humGain.gain.value;
        setExecutiveHumGain(level);
      }
    }
  },
  isMuted(): boolean {
    return isMuted;
  },
  prepareBgmForRun(): void {
    const el = initBgm();
    el.preload = "auto";
    el.load();
  },
  startManagerBgmRamp(): void {
    cancelBgmAnim();
    stopExecutiveHum();
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
  intensifyExecutiveBgm(tier: "board" | "angel"): void {
    if (bgmMode !== "run") return;
    const targetVol = tier === "board" ? BGM_VOLUME_EXEC_BOARD : BGM_VOLUME_EXEC_ANGEL;
    const humLevel = tier === "board" ? HUM_GAIN_BOARD : HUM_GAIN_ANGEL;
    const el = initBgm();
    const fromVol = el.volume;
    if (isMuted) {
      rampStartedAt = performance.now();
      rampDurationMs = BGM_EXEC_RAMP_MS;
      rampFromVol = fromVol;
      rampToVol = targetVol;
      return;
    }
    startRamp(fromVol, targetVol, BGM_EXEC_RAMP_MS);
    if (tier === "board") {
      startExecutiveHum(humLevel);
    } else if (humOsc) {
      setExecutiveHumGain(humLevel);
    } else {
      startExecutiveHum(humLevel);
    }
  },
  stopBgm(): void {
    cancelBgmAnim();
    stopExecutiveHum();
    bgmMode = "off";
    rampDurationMs = 0;
    if (!bgm) return;
    bgm.pause();
    bgm.currentTime = 0;
    bgm.volume = BGM_VOLUME_RUN_QUIET;
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

/** @internal test hook */
export function __getBgmElementForTest(): HTMLAudioElement | null {
  return bgm;
}

/** @internal test hook */
export function __resetBgmForTest(): void {
  stopExecutiveHum();
  bgm = null;
  bgmMode = "off";
}

/** @internal test hook */
export function __getBgmModeForTest(): BgmMode {
  return bgmMode;
}

/** @internal test hook */
export function __setBgmModeForTest(mode: BgmMode): void {
  bgmMode = mode;
}

/** @internal test hook */
export function __getRampTargetForTest(): number {
  return rampToVol;
}
