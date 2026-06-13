/**
 * Verify SEO/GEO shell assets (no network; static file checks).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const miniAppRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(miniAppRoot, "../..");

const BOT_URL = "https://t.me/corporateladder_bot";
const BOT_HANDLE = "CorporateLadder_bot";
const CANON_DESCRIPTION =
  `Corporate Ladder is a satirical office climb in Telegram. Dodge meetings, survive the org chart. Tap left or right each rung. Play free via @${BOT_HANDLE}.`;
const CANON_URL = "https://www.promptanatomy.lol/";
const BLOG_STACK_URL =
  "https://www.promptanatomy.blog/articles/how-to-build-a-telegram-game-stack/";
const BLOG_SOFT_LAUNCH_URL =
  "https://www.promptanatomy.blog/articles/corporate-ladder-soft-launch/";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK ${message}`);
}

function readRequired(relativePath) {
  const fullPath = path.join(miniAppRoot, relativePath);
  if (!existsSync(fullPath)) {
    fail(`Missing: ${path.relative(repoRoot, fullPath)}`);
  }
  return readFileSync(fullPath, "utf8");
}

for (const relativePath of [
  "public/sitemap.xml",
  "public/llms.txt",
  "public/robots.txt",
]) {
  readRequired(relativePath);
  ok(path.relative(repoRoot, path.join(miniAppRoot, relativePath)));
}

const robots = readRequired("public/robots.txt");
if (!robots.includes("User-agent: Twitterbot")) {
  fail("robots.txt must allow Twitterbot (X card previews)");
}
if (!/User-agent:\s*\*\s*\nDisallow:\s*\n/m.test(robots)) {
  fail("robots.txt must use empty Disallow for User-agent: * (crawler-compatible allow-all)");
}
if (!robots.includes("Sitemap: https://www.promptanatomy.lol/sitemap.xml")) {
  fail("robots.txt must reference sitemap.xml");
}
ok("robots.txt policy");

const sitemap = readRequired("public/sitemap.xml");
if (!sitemap.includes(CANON_URL)) {
  fail("sitemap.xml must contain canonical URL");
}
if (!sitemap.includes("<urlset")) {
  fail("sitemap.xml must be valid urlset XML");
}
if (!sitemap.includes("llms.txt")) {
  fail("sitemap.xml must list llms.txt for AI/GEO discovery");
}
ok("sitemap.xml");

const llms = readRequired("public/llms.txt");
if (!llms.includes("# Corporate Ladder")) {
  fail("llms.txt must contain # Corporate Ladder heading");
}
if (!llms.includes("> Corporate Ladder is a satirical")) {
  fail("llms.txt must contain blockquote summary");
}
if (!llms.includes(BOT_URL)) {
  fail("llms.txt must link to Telegram bot");
}
if (!llms.includes(`@${BOT_HANDLE}`)) {
  fail("llms.txt must reference canonical bot handle");
}
if (!llms.includes(BLOG_STACK_URL)) {
  fail("llms.txt must link to blog Telegram Game Stack article (GEO canonical)");
}
if (!llms.includes(BLOG_SOFT_LAUNCH_URL)) {
  fail("llms.txt must link to blog Corporate Ladder Soft Launch article");
}
if (!llms.includes("2026-06-15")) {
  fail("llms.txt must state soft-launch date for AI citation accuracy");
}
ok("llms.txt");

const indexHtml = readRequired("index.html");
if (!indexHtml.includes('rel="canonical"')) {
  fail("index.html must include canonical link");
}
if (!indexHtml.includes("application/ld+json")) {
  fail("index.html must include JSON-LD");
}
if (!indexHtml.includes(CANON_DESCRIPTION)) {
  fail("index.html must include canon description");
}
if (!indexHtml.includes(BOT_URL)) {
  fail("index.html JSON-LD/noscript must use canonical bot URL");
}
if (!indexHtml.includes("PlayAction")) {
  fail("index.html JSON-LD must include PlayAction entry point");
}
if (!indexHtml.includes("subjectOf")) {
  fail("index.html JSON-LD must include subjectOf blog articles for GEO");
}
if (!indexHtml.includes(BLOG_STACK_URL)) {
  fail("index.html JSON-LD must reference blog stack article URL");
}
if (!indexHtml.includes("<noscript>")) {
  fail("index.html must include noscript fallback");
}
ok("index.html SEO shell");

console.log("All SEO checks passed.");
