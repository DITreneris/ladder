import { hapticImpact, openExternalLink } from "./telegram";

export const PROMPT_ANATOMY_URL =
  import.meta.env.VITE_PROMPT_ANATOMY_URL ?? "https://www.promptanatomy.app";

export const PROMPT_ANATOMY_LOGO = "/branding/prompt-anatomy-logo.png";

export function getPromptAnatomyShareLine(): string {
  return `Built with Prompt Anatomy — ${PROMPT_ANATOMY_URL}`;
}

export function openPromptAnatomy(): void {
  hapticImpact("light");
  openExternalLink(PROMPT_ANATOMY_URL);
}
