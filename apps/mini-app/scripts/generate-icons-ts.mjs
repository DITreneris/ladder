import fs from "node:fs";
import path from "node:path";

const icons = [
  "arrow-up-right-from-square",
  "volume-xmark",
  "chevron-left",
  "ellipsis-vertical",
  "trophy",
  "circle-question",
  "bolt",
  "arrow-left",
  "arrow-right",
  "triangle-exclamation",
  "rotate-right",
  "share",
  "circle-check",
  "play",
  "volume-high",
  "briefcase",
];

const data = {};
for (const name of icons) {
  const file = path.join("node_modules/@fortawesome/fontawesome-free/svgs/solid", `${name}.svg`);
  const svg = fs.readFileSync(file, "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 512 512";
  const d = svg.match(/<path d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`no path for ${name}`);
  data[name] = { viewBox, d };
}

const names = Object.keys(data);
const lines = [
  "/** Inline SVG icons (Font Awesome 6 paths, CC BY 4.0). */",
  "export type IconName =",
  ...names.map((n, i) => `  | "${n}"${i === names.length - 1 ? ";" : ""}`),
  "",
  "type IconDef = { viewBox: string; d: string };",
  "",
  "const ICONS: Record<IconName, IconDef> = {",
  ...names.map((n) => {
    const { viewBox, d } = data[n];
    return `  "${n}": { viewBox: "${viewBox}", d: "${d}" },`;
  }),
  "};",
  "",
  "export function icon(name: IconName, className = \"\"): string {",
  "  const { viewBox, d } = ICONS[name];",
  "  const cls = className ? `cl-icon ${className}` : \"cl-icon\";",
  "  return `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${viewBox}\" aria-hidden=\"true\" class=\"${cls}\" fill=\"currentColor\"><path d=\"${d}\"/></svg>`;",
  "}",
  "",
];

fs.writeFileSync("src/lib/icons.ts", lines.join("\n"));
console.log("Wrote src/lib/icons.ts with", names.length, "icons");
