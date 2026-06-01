let stripEl: HTMLElement | null = null;

export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

function ensureDebugStrip(): HTMLElement | null {
  if (!isDebugMode()) return null;
  if (!stripEl) {
    stripEl = document.getElementById("debugStrip");
  }
  return stripEl;
}

export function debugLog(tag: string, message: string, data?: unknown): void {
  if (!isDebugMode()) return;
  const detail = data !== undefined ? ` ${JSON.stringify(data)}` : "";
  console.log(`[CL ${tag}]`, message, data ?? "");
  const strip = ensureDebugStrip();
  if (strip) {
    strip.textContent = `${tag}: ${message}${detail}`;
    strip.classList.remove("hidden");
  }
}

export function mountDebugStrip(): void {
  if (!isDebugMode()) return;
  const strip = ensureDebugStrip();
  strip?.classList.remove("hidden");
}
