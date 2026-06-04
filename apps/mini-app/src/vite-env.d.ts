/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BOT_USERNAME: string;
  readonly VITE_PROMPT_ANATOMY_URL?: string;
  /** TON Builders SDK token (Analytics Keys). Omit locally to skip TG analytics. */
  readonly VITE_TELEGRAM_ANALYTICS_TOKEN?: string;
  /** Defaults to corporate_ladder — must match TON Builders Identifier exactly. */
  readonly VITE_TELEGRAM_ANALYTICS_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
