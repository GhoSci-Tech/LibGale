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
const hold = async (key, ms) => { await page.keyboard.down(key); await wait(ms); await page.keyboard.up(key); await wait(150); };
const press = async (key, ms = 250) => { await page.keyboard.press(key); await wait(ms); };

try {
  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
  await wait(900);
  await focus();
  await page.screenshot({ path: "screenshots/hub-new-start.png" });

  // Move to the desk page (p2) and collect it.
  await hold("a", 700);
  await wait(400);
  console.log("pages after desk:", await page.evaluate(() => window.__libgaleState.pages));
  await page.screenshot({ path: "screenshots/hub-page-note.png" });
  await press("z");
  await press("z");

  // Move to the little reader.
  await hold("d", 1900);
  await press("z");
  await page.screenshot({ path: "screenshots/hub-creature-dialogue.png" });
  await press("z");
  await press("z");

  // Move to the first lectern and open its intro.
  await hold("d", 1600);
  await press("z");
  await page.screenshot({ path: "screenshots/hub-book-intro.png" });

  console.log("pages:", await page.evaluate(() => window.__libgaleState.pages));
  console.log("errors:", logs.join("\n") || "none");
} finally {
  await browser.close();
}
