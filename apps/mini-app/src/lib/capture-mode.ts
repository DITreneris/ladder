export type MarketingCaptureMode = "home" | "game" | "gameover";

export interface CaptureFlags {
  og: boolean;
  capture: MarketingCaptureMode | null;
}

export function getCaptureFlags(): CaptureFlags {
  if (typeof window === "undefined") {
    return { og: false, capture: null };
  }
  const params = new URLSearchParams(window.location.search);
  const captureParam = params.get("capture");
  const capture =
    captureParam === "home" || captureParam === "game" || captureParam === "gameover"
      ? captureParam
      : null;
  return {
    og: params.get("og") === "1",
    capture,
  };
}
