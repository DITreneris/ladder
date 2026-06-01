/**
 * Capture OG link-preview images (1200×630 + GitHub 1280×640).
 * Usage: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *        npm run capture:og
 */
import { chromium } from "playwright";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const miniAppRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(miniAppRoot, "../..");
const cacheDir = path.join(miniAppRoot, "public", "og-cache");
const distCacheDir = path.join(miniAppRoot, "dist", "og-cache");
const cropPath = path.join(cacheDir, "gameplay-crop.png");
const distCropPath = path.join(distCacheDir, "gameplay-crop.png");
const ogOutPath = path.join(miniAppRoot, "public", "og.png");
const githubOutPath = path.join(repoRoot, ".github", "social-preview.png");
const previewUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";

await mkdir(cacheDir, { recursive: true });
await mkdir(distCacheDir, { recursive: true });
await mkdir(path.dirname(githubOutPath), { recursive: true });

const browser = await chromium.launch();

try {
  const cropPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await cropPage.goto(`${previewUrl}/?capture=game`, { waitUntil: "networkidle" });
  await cropPage.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, {
    timeout: 15000,
  });
  await cropPage.waitForSelector("#gameContentColumn");
  await cropPage.locator("#gameContentColumn").screenshot({ path: cropPath });
  await copyFile(cropPath, distCropPath);
  await cropPage.close();
  console.log(`Saved ${path.relative(repoRoot, cropPath)}`);

  async function captureComposite(viewport, outPath, variant) {
    const page = await browser.newPage({ viewport });
    const query = variant ? `?variant=${variant}` : "";
    await page.goto(`${previewUrl}/og-preview.html${query}`, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => {
        const img = document.getElementById("ogGameplayCrop");
        return img && img.complete && img.naturalWidth > 0;
      },
      { timeout: 15000 }
    );
    await page.locator("#ogCanvas").screenshot({ path: outPath });
    await page.close();
    console.log(`Saved ${path.relative(repoRoot, outPath)} (${viewport.width}×${viewport.height})`);
  }

  await captureComposite({ width: 1200, height: 630 }, ogOutPath);
  await captureComposite({ width: 1280, height: 640 }, githubOutPath, "github");
} finally {
  await browser.close();
}

console.log("OG capture complete.");
