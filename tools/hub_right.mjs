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
await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
await page.evaluate(() => {
  localStorage.setItem("libgale.save.v1", JSON.stringify({
    version: 1, onboarded: true, started: true, lang: "en", name: "Aster",
    difficulty: "normal", sealed: [], pages: ["p1", "p2", "p3", "p4", "p5"],
    anlam: 0, maxHp: 25, interludeSeen: false,
  }));
});
await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
await wait(900);
await page.bringToFront();
await page.mouse.click(640, 360);
await wait(250);
await page.keyboard.down("d");
await wait(6200);
await page.keyboard.up("d");
await wait(500);
await page.screenshot({ path: "screenshots/hub-right-wall.png" });
console.log("shot");
await browser.close();
