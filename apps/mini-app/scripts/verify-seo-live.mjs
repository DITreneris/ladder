/**
 * HTTP smoke for SEO/GEO shell assets on a running preview or production host.
 * Usage: PREVIEW_URL=http://127.0.0.1:4173 npm run verify:seo:live
 */
const base = (process.env.PREVIEW_URL ?? "http://127.0.0.1:4173").replace(/\/$/, "");

const BOT_URL = "https://t.me/corporateladder_bot";
const CANON_URL = "https://www.promptanatomy.lol/";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`OK ${message}`);
}

async function fetchText(path) {
  const url = `${base}${path}`;
  const res = await fetch(url);
  const body = await res.text();
  if (!res.ok) {
    fail(`${path} returned ${res.status} (expected 200)`);
  }
  return body;
}

try {
  const sitemap = await fetchText("/sitemap.xml");
  if (!sitemap.includes("<urlset")) fail("sitemap.xml missing <urlset");
  if (!sitemap.includes(CANON_URL)) fail("sitemap.xml missing canonical URL");
  ok("sitemap.xml");

  const robots = await fetchText("/robots.txt");
  if (!robots.includes("Sitemap: https://www.promptanatomy.lol/sitemap.xml")) {
    fail("robots.txt missing Sitemap directive");
  }
  ok("robots.txt");

  const llms = await fetchText("/llms.txt");
  if (!llms.includes("# Corporate Ladder")) fail("llms.txt missing heading");
  if (!llms.includes(BOT_URL)) fail("llms.txt missing bot URL");
  ok("llms.txt");

  console.log(`All live SEO checks passed (${base}).`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
