import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("screenshots");
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  args: ["--window-size=1280,800", "--window-position=40,40"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

async function shot(name) {
  await page.bringToFront();
  await page.mouse.click(640, 360);
  await wait(250);
  await page.screenshot({ path: path.join(OUT, name) });
  console.log("shot", name);
}

try {
  await page.goto("http://127.0.0.1:5173/?scene=title&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-title-en.png");

  await page.goto("http://127.0.0.1:5173/?scene=summary&book=ashen&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-summary-ashen.png");

  await page.goto("http://127.0.0.1:5173/?scene=interlude&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-interlude-start.png");

  // Seed a sealed book, then open the journal.
  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.setItem("libgale.save.v1", JSON.stringify({
      version: 1,
      onboarded: true,
      started: true,
      lang: "en",
      name: "Whesper",
      difficulty: "normal",
      sealed: ["ashen", "poem"],
      pages: ["p1", "p2"],
      anlam: 2,
      maxHp: 20,
      interludeSeen: false,
    }));
  });
  await page.goto("http://127.0.0.1:5173/?scene=journal&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-journal.png");

  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=tr", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-hub-tr-seeded.png");

  await page.goto("http://127.0.0.1:5173/?scene=battle&book=last&fast=1&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await shot("v-battle-last-intro.png");

  console.log(logs.filter((l) => l.includes("error") || l.includes("Error") || l.includes("http")).join("\n") || "no errors");
} finally {
  await browser.close();
}
