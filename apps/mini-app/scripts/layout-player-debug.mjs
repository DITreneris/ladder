import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4190";

async function measure(page) {
  return page.evaluate(() => {
    const play = document.getElementById("gamePlayArea");
    const climber = document.getElementById("playerClimber");
    const next = document.querySelector(".next-rung");
    const foot = document.querySelector("[data-rung-slot='0']");
    const pr = play?.getBoundingClientRect();
    const cr = climber?.getBoundingClientRect();
    const nr = next?.getBoundingClientRect();
    const fr = foot?.getBoundingClientRect();
    const nCenter = next?.querySelector(".rung-center")?.getBoundingClientRect();
    return {
      styleBottom: climber?.style.bottom,
      styleLeft: climber?.style.left,
      climberCenterY: cr ? Math.round(cr.top + cr.height / 2 - pr.top) : null,
      footCenterY: fr ? Math.round(fr.top + fr.height / 2 - pr.top) : null,
      nextCenterY: nr ? Math.round(nr.top + nr.height / 2 - pr.top) : null,
      nextRungCenterY: nCenter ? Math.round(nCenter.top + nCenter.height / 2 - pr.top) : null,
      playH: pr?.height,
      hint: document.getElementById("imminentHint")?.textContent,
      score: window.clQa?.snapshot?.()?.climbed,
    };
  });
}

async function main() {
  const viewport = {
    width: Number(process.env.VP_W ?? 390),
    height: Number(process.env.VP_H ?? 844),
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE}/?debug=1&qa=1`, { waitUntil: "load" });
  if (process.env.TG === "1") {
    await page.evaluate(() => document.documentElement.classList.add("cl-in-telegram"));
  }
  await page.evaluate(() => window.startGame());
  await page.click("#gamePlayArea");
  await page.waitForTimeout(400);
  console.log("tap0", JSON.stringify(await measure(page)));
  for (let i = 1; i <= 3; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(350);
    console.log(`tap${i}`, JSON.stringify(await measure(page)));
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
