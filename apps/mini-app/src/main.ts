/// <reference types="vite/client" />

import { inject } from "@vercel/analytics";
import "./style.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import { mountApp } from "./app";
import { APP_SHELL } from "./template";

inject();

document.getElementById("app")!.innerHTML = APP_SHELL;
mountApp();