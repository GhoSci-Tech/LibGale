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
const focus = async () => {
  await page.bringToFront();
  await page.mouse.click(640, 360);
  await wait(250);
};

try {
  await page.goto("http://127.0.0.1:5173/?scene=name&lang=en", { waitUntil: "networkidle0" });
  await wait(800);
  await focus();
  await page.keyboard.type("Aster", { delay: 100 });
  await wait(300);
  await page.screenshot({ path: "screenshots/name-uppercase.png" });
  await page.keyboard.press("Enter");
  await wait(700);
  console.log("name:", await page.evaluate(() => window.__libgaleState.name), "scene:", await page.evaluate(() => getSceneName()));
  await wait(2200);
  await page.screenshot({ path: "screenshots/name-intro.png" });

  // Seed a custom name and last-page seal, then open the summary.
  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.setItem("libgale.save.v1", JSON.stringify({
      version: 1,
      onboarded: true,
      started: true,
      lang: "en",
      name: "Aster",
      difficulty: "normal",
      sealed: ["ashen", "poem", "last"],
      pages: ["p1", "p2", "p3", "p4"],
      anlam: 3,
      maxHp: 20,
      interludeSeen: false,
    }));
  });
  await page.goto("http://127.0.0.1:5173/?scene=summary&book=last&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await focus();
  await page.screenshot({ path: "screenshots/name-summary-last.png" });

  console.log("errors:", logs.join("\n") || "none");
} finally {
  await browser.close();
}
