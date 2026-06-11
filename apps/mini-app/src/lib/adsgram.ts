const SDK_URL = "https://sad.adsgram.ai/js/sad.min.js";

interface AdsgramShowResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdsgramController {
  show(): Promise<AdsgramShowResult>;
}

declare global {
  interface Window {
    Adsgram?: {
      init(params: { blockId: string; debug?: boolean }): AdsgramController;
    };
  }
}

let sdkLoadPromise: Promise<void> | null = null;
let controller: AdsgramController | null = null;

export function getAdsgramBlockId(): string | undefined {
  return import.meta.env.VITE_ADSGRAM_BLOCK_ID?.trim() || undefined;
}

/** Revive UI + engine path; set VITE_ADSGRAM_REVIVE_ENABLED=true to test without Block ID. */
export function isReviveFeatureEnabled(): boolean {
  if (import.meta.env.VITE_ADSGRAM_REVIVE_ENABLED === "true") return true;
  return Boolean(getAdsgramBlockId());
}

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("AdsGram SDK requires a browser"));
  }
  if (window.Adsgram) return Promise.resolve();
  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("AdsGram SDK failed to load"));
      document.head.appendChild(script);
    });
  }
  return sdkLoadPromise;
}

function getController(): Promise<AdsgramController> {
  const blockId = getAdsgramBlockId();
  if (!blockId) {
    return Promise.reject(new Error("VITE_ADSGRAM_BLOCK_ID is not set"));
  }
  return loadSdk().then(() => {
    if (!controller) {
      controller = window.Adsgram!.init({
        blockId,
        debug: import.meta.env.DEV,
      });
    }
    return controller;
  });
}

/**
 * Shows a rewarded ad when Block ID is configured.
 * Resolves immediately when revive is enabled for testing without a Block ID.
 */
export async function showRewardedAd(): Promise<void> {
  const blockId = getAdsgramBlockId();
  if (!blockId) return;

  const ad = await getController();
  const result = await ad.show();
  if (result.error || !result.done) {
    throw new Error(result.description || "AdsGram rewarded ad did not complete");
  }
}
