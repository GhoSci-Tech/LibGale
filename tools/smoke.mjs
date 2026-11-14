import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://127.0.0.1:5173/";
const OUT = path.resolve("screenshots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  args: [
    "--window-size=1280,800",
    "--window-position=40,40",
    "--disable-dev-shm-usage",
    "--no-sandbox",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[pageerror] ${err.stack || err.message}`));
page.on("requestfailed", (req) => logs.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));
page.on("response", (res) => { if (res.status() >= 400) logs.push(`[http ${res.status()}] ${res.url()}`); });

async function shot(name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log("shot", name);
}
async function scene() {
  return page.evaluate(() => (typeof window.getSceneName === "function" ? window.getSceneName() : "?"));
}
async function press(key, wait = 120) {
  await page.keyboard.press(key);
  await new Promise((r) => setTimeout(r, wait));
}
async function hold(key, ms) {
  await page.keyboard.down(key);
  await new Promise((r) => setTimeout(r, ms));
  await page.keyboard.up(key);
}
async function focusGame() {
  await page.bringToFront();
  await page.mouse.click(640, 360);
  await new Promise((r) => setTimeout(r, 250));
}

try {
  await page.goto(BASE + "?scene=language", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await focusGame();
  console.log("scene:", await scene());
  await shot("01-language.png");

  await press("Enter", 500);
  console.log("scene after language:", await scene());
  await shot("02-name.png");

  await page.keyboard.type("Aster");
  await new Promise((r) => setTimeout(r, 300));
  await press("Enter", 800);
  console.log("scene after name:", await scene());
  await shot("03-intro.png");

  await press("Escape", 1000);
  await shot("04-titlecard.png");
  await press("z", 1200);
  console.log("scene after intro:", await scene());
  await shot("05-hub.png");

  await hold("d", 900);
  await new Promise((r) => setTimeout(r, 400));
  await shot("06-hub-moved.png");

  await page.goto(BASE + "?scene=battle&book=ashen&lang=en", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await focusGame();
  console.log("battle scene:", await scene());
  await shot("07-battle-intro.png");
  await press("z", 400);
  await press("z", 400);
  await press("z", 400);
  await press("z", 800);
  console.log("battle after intro:", await scene());
  await shot("08-battle-menu.png");

  await press("z", 900); // READ
  await shot("09-battle-read.png");
  await press("z", 400);
  await press("z", 400);
  await shot("10-battle-attack.png");
  await hold("a", 700);
  await hold("w", 300);
  await shot("11-battle-attack-moved.png");

  await page.goto(BASE + "?scene=hub&lang=tr", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));
  await focusGame();
  await shot("12-hub-tr.png");

  await page.goto(BASE + "?scene=settings&lang=tr", { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  await focusGame();
  await shot("13-settings-tr.png");

  console.log("--- logs ---");
  console.log(logs.join("\n") || "(none)");
} finally {
  await browser.close();
}
