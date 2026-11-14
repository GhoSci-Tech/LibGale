import puppeteer from "puppeteer-core";
import fs from "node:fs";

fs.mkdirSync("screenshots", { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  args: ["--window-size=1280,800", "--window-position=40,40"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const logs = [];
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") logs.push(`[error] ${m.text()}`); });
const focus = async () => { await page.bringToFront(); await page.mouse.click(640, 360); await wait(250); };
const press = async (k, ms = 250) => { await page.keyboard.press(k); await wait(ms); };
const shot = async (name) => { await page.screenshot({ path: `screenshots/${name}` }); console.log("shot", name); };

try {
  await page.goto("http://127.0.0.1:5173/?scene=language", { waitUntil: "networkidle0" });
  await wait(800);
  await focus();
  await shot("final-language.png");

  await page.goto("http://127.0.0.1:5173/?scene=battle&book=ashen&fast=1&lang=en", { waitUntil: "networkidle0" });
  await wait(700);
  await focus();
  for (let i = 0; i < 20; i += 1) {
    const mode = await page.evaluate(() => window.__libgaleBattle?.mode);
    if (mode === "menu") break;
    if (mode === "dialogue") await press("z", 200);
    else await wait(200);
  }
  await shot("final-battle-menu.png");
  await press("ArrowRight");
  await press("z", 350);
  await shot("final-battle-word.png");
  await press("x", 250);
  await press("Escape", 400);
  await shot("final-battle-pause.png");

  await page.goto("http://127.0.0.1:5173/?scene=settings&lang=tr", { waitUntil: "networkidle0" });
  await wait(800);
  await focus();
  await shot("final-settings-tr.png");

  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.setItem("libgale.save.v1", JSON.stringify({
      version: 1, onboarded: true, started: true, lang: "en", name: "Aster",
      difficulty: "normal", sealed: ["ashen", "poem", "last"],
      pages: ["p1", "p2", "p3", "p4", "p5"], anlam: 3, maxHp: 25, interludeSeen: false,
    }));
  });
  await page.goto("http://127.0.0.1:5173/?scene=journal&lang=en", { waitUntil: "networkidle0" });
  await wait(800);
  await focus();
  await shot("final-journal.png");

  await page.goto("http://127.0.0.1:5173/?scene=interlude&lang=en", { waitUntil: "networkidle0" });
  await wait(700);
  await focus();
  for (let i = 0; i < 8; i += 1) await press("z", 250);
  await wait(400);
  await shot("final-interlude-card.png");

  console.log("errors:", logs.join("\n") || "none");
} finally {
  await browser.close();
}
