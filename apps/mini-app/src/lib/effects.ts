import type { DeathType } from "../game/types";

const MAX_PARTICLES = 8;
let activeParticles = 0;

export function respectsReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function triggerNearMissWince(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("near-miss-wince");
  void el.offsetWidth;
  el.classList.add("near-miss-wince");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("near-miss-wince"),
    { once: true }
  );
}

export function triggerClimbPop(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("climb-pop");
  void el.offsetWidth;
  el.classList.add("climb-pop");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("climb-pop"),
    { once: true }
  );
}

export function triggerShake(el: HTMLElement, onComplete?: () => void): void {
  if (respectsReducedMotion()) {
    onComplete?.();
    return;
  }
  el.classList.remove("shake-element");
  void el.offsetWidth;
  el.classList.add("shake-element");

  const finish = () => {
    el.classList.remove("shake-element");
    onComplete?.();
  };

  el.addEventListener("animationend", finish, { once: true });
  setTimeout(finish, 500);
}

export function spawnFloatingParticles(parent: HTMLElement, emoji: string, count = 4): void {
  if (respectsReducedMotion()) return;

  const spawnCount = Math.min(count, MAX_PARTICLES - activeParticles);
  if (spawnCount <= 0) return;

  const rect = parent.getBoundingClientRect();
  const container = parent.offsetParent instanceof HTMLElement ? parent.offsetParent : parent;

  for (let i = 0; i < spawnCount; i++) {
    activeParticles++;
    const particle = document.createElement("span");
    particle.className = "float-particle";
    particle.textContent = emoji;
    particle.style.left = `${rect.width / 2 + (Math.random() - 0.5) * 40}px`;
    particle.style.top = `${rect.height / 2}px`;
    particle.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 48}px`);
    container.style.position = container.style.position || "relative";
    container.appendChild(particle);

    particle.addEventListener(
      "animationend",
      () => {
        particle.remove();
        activeParticles = Math.max(0, activeParticles - 1);
      },
      { once: true }
    );
  }
}

export function flashBurnoutStress(on: boolean): void {
  const gameScreen = document.getElementById("gameScreen");
  const viewport = document.querySelector(".cl-viewport");
  gameScreen?.classList.toggle("burnout-stress", on);
  viewport?.classList.toggle("burnout-stress", on);
}

export function triggerDeathFlash(): void {
  const flash = document.getElementById("deathFlash");
  if (!flash || respectsReducedMotion()) return;
  flash.classList.remove("death-flash");
  void flash.offsetWidth;
  flash.classList.add("death-flash");
  flash.addEventListener(
    "animationend",
    () => flash.classList.remove("death-flash"),
    { once: true }
  );
}

const DEATH_EMOJI: Record<DeathType, string> = {
  meeting: "💥",
  reorg: "🌀",
  burnout: "📉",
  badge_gate: "🪪",
  foliage: "🪴",
  energy: "😵",
  sprint: "🏁",
};

export function triggerDeathEmoji(deathType: DeathType, onComplete?: () => void): void {
  const el = document.getElementById("playerActionEmoji");
  if (!el) {
    onComplete?.();
    return;
  }

  el.textContent = DEATH_EMOJI[deathType];
  el.classList.remove("idle-bob");

  if (respectsReducedMotion()) {
    onComplete?.();
    return;
  }

  setTimeout(() => onComplete?.(), 350);
}

export function triggerRankPop(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("rank-pop");
  void el.offsetWidth;
  el.classList.add("rank-pop");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("rank-pop"),
    { once: true }
  );
}

export function triggerPromoConfetti(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("promo-confetti");
  void el.offsetWidth;
  el.classList.add("promo-confetti");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("promo-confetti"),
    { once: true }
  );
}

export function triggerCoffeePickup(badge: HTMLElement, onComplete?: () => void): void {
  const finish = () => {
    badge.remove();
    onComplete?.();
  };
  if (respectsReducedMotion()) {
    finish();
    return;
  }
  badge.classList.remove("coffee-pickup");
  void badge.offsetWidth;
  badge.classList.add("coffee-pickup");
  badge.addEventListener(
    "animationend",
    () => {
      badge.classList.remove("coffee-pickup");
      finish();
    },
    { once: true }
  );
}

export function triggerMeterFlash(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("meter-flash");
  void el.offsetWidth;
  el.classList.add("meter-flash");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("meter-flash"),
    { once: true }
  );
}

export function triggerRungAdvance(container: HTMLElement): void {
  if (respectsReducedMotion()) return;
  container.classList.remove("rung-advance");
  void container.offsetWidth;
  container.classList.add("rung-advance");
  container.addEventListener(
    "animationend",
    () => container.classList.remove("rung-advance"),
    { once: true }
  );
}

export function applyReorgSlide(badge: HTMLElement, toSide: "left" | "right"): void {
  if (respectsReducedMotion()) return;
  badge.classList.remove("reorg-slide-left", "reorg-slide-right", "reorg-warning");
  void badge.offsetWidth;
  badge.classList.add(toSide === "left" ? "reorg-slide-left" : "reorg-slide-right");
}

export function triggerReorgTelegraph(
  badge: HTMLElement,
  _toSide: "left" | "right",
  onSlide: () => void
): void {
  if (respectsReducedMotion()) {
    onSlide();
    return;
  }

  badge.classList.remove("reorg-warning");
  void badge.offsetWidth;
  badge.classList.add("reorg-warning");

  setTimeout(() => {
    onSlide();
    badge.classList.remove("reorg-warning");
  }, 150);
}

export function triggerPromoStamp(overlay: HTMLElement): void {
  const stamp = overlay.querySelector(".promo-stamp");
  if (!stamp || respectsReducedMotion()) return;
  stamp.classList.remove("promo-stamp-in");
  void (stamp as HTMLElement).offsetWidth;
  stamp.classList.add("promo-stamp-in");
}

export function triggerDeathCauseHold(el: HTMLElement): void {
  if (respectsReducedMotion()) return;
  el.classList.remove("death-cause-hold");
  void el.offsetWidth;
  el.classList.add("death-cause-hold");
  el.addEventListener(
    "animationend",
    () => el.classList.remove("death-cause-hold"),
    { once: true }
  );
}
