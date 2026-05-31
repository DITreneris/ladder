/**
 * Verify committed OG PNG dimensions (no regeneration in CI).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const miniAppRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(miniAppRoot, "../..");

function pngDimensions(filePath) {
  const buf = readFileSync(filePath);
  const sig = buf.subarray(0, 8).toString("hex");
  if (sig !== "89504e470d0a1a0a") {
    throw new Error(`Not a PNG: ${filePath}`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function assertSize(filePath, expectedW, expectedH) {
  if (!existsSync(filePath)) {
    console.error(`Missing: ${filePath}`);
    process.exit(1);
  }
  const { width, height } = pngDimensions(filePath);
  if (width !== expectedW || height !== expectedH) {
    console.error(`${filePath}: expected ${expectedW}×${expectedH}, got ${width}×${height}`);
    process.exit(1);
  }
  console.log(`OK ${path.relative(repoRoot, filePath)} (${width}×${height})`);
}

assertSize(path.join(miniAppRoot, "public", "og.png"), 1200, 630);
assertSize(path.join(repoRoot, ".github", "social-preview.png"), 1280, 640);
