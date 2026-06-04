/// <reference types="vite/client" />

import { inject } from "@vercel/analytics";
import "./style.css";
import { mountApp } from "./app";
import { initTelegramAnalytics } from "./lib/telegram-analytics";
import { APP_SHELL } from "./template";

initTelegramAnalytics();

document.getElementById("app")!.innerHTML = APP_SHELL;
mountApp();

const deferAnalytics = () => inject();
if (typeof requestIdleCallback === "function") {
  requestIdleCallback(deferAnalytics);
} else {
  setTimeout(deferAnalytics, 0);
}
