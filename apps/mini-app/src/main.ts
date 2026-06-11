/// <reference types="vite/client" />

import { inject } from "@vercel/analytics";
import "./style.css";
import { mountApp } from "./app";
import { initTelegramAnalytics } from "./lib/telegram-analytics";
import { APP_SHELL } from "./template";

try {
  initTelegramAnalytics();
} catch (err) {
  console.warn("[corporate_ladder] Telegram analytics init skipped", err);
}

document.getElementById("app")!.innerHTML = APP_SHELL;
mountApp();

const deferAnalytics = () => inject();
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(deferAnalytics);
} else {
  setTimeout(deferAnalytics, 0);
}
