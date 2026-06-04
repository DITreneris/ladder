/**
 * Adopt manual OG artwork from docs/assets/Corporate_Ladder_og.png.
 * Usage: npm run adopt:og
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const miniAppRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(miniAppRoot, "../..");
const sourcePath = path.join(repoRoot, "docs", "assets", "Corporate_Ladder_og.png");
const ogOutPath = path.join(miniAppRoot, "public", "og.png");
const githubOutPath = path.join(repoRoot, ".github", "social-preview.png");

const OG_W = 1200;
const OG_H = 630;
const GH_W = 1280;
const GH_H = 640;

function pngDimensions(filePath) {
  const buf = readFileSync(filePath);
  const sig = buf.subarray(0, 8).toString("hex");
  if (sig !== "89504e470d0a1a0a") {
    throw new Error(`Not a PNG: ${filePath}`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const sourceDim = pngDimensions(sourcePath);
console.log(`Source ${path.relative(repoRoot, sourcePath)}: ${sourceDim.width}×${sourceDim.height}`);

await mkdir(path.dirname(ogOutPath), { recursive: true });
await mkdir(path.dirname(githubOutPath), { recursive: true });

const browser = await chromium.launch();

try {
  const sourceBase64 = readFileSync(sourcePath).toString("base64");
  const imgDataUrl = `data:image/png;base64,${sourceBase64}`;

  async function screenshotFit(viewport, outPath, background) {
    const page = await browser.newPage({ viewport });
    await page.setContent(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${viewport.width}px;
      height: ${viewport.height}px;
      background: ${background};
      overflow: hidden;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="${imgDataUrl}" alt="" />
</body>
</html>`,
      { waitUntil: "networkidle" }
    );
    await page.waitForFunction(
      () => {
        const img = document.querySelector("img");
        return Boolean(img && img.complete && img.naturalWidth > 0);
      },
      { timeout: 15000 }
    );
    await page.screenshot({ path: outPath });
    await page.close();
    const outDim = pngDimensions(outPath);
    console.log(
      `Saved ${path.relative(repoRoot, outPath)} (${outDim.width}×${outDim.height})`
    );
  }

  if (sourceDim.width === OG_W && sourceDim.height === OG_H) {
    await copyFile(sourcePath, ogOutPath);
    console.log(`Copied ${path.relative(repoRoot, ogOutPath)} (${OG_W}×${OG_H})`);
  } else {
    await screenshotFit({ width: OG_W, height: OG_H }, ogOutPath, "#ffffff");
  }

  await screenshotFit({ width: GH_W, height: GH_H }, githubOutPath, "#f8fafc");
} finally {
  await browser.close();
}

console.log("OG adopt complete.");
