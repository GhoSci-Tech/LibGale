import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  // Headless keeps the regression deterministic: a occluded headed window can
  // throttle the game loop and drop input events.
  headless: "new",
  protocolTimeout: 120000,
  args: ["--window-size=1000,700", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 650 });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.stack || e.message}`));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.clear());
await page.goto("http://127.0.0.1:5173/?scene=hub&lang=en", { waitUntil: "networkidle0" });
await wait(700);
await page.bringToFront();
await page.mouse.click(500, 320);
await wait(300);

async function info() {
  return page.evaluate(() => ({
    scene: window.getSceneName?.(),
    battle: window.__libgaleBattle ? {
      book: window.__libgaleBattle.book,
      mode: window.__libgaleBattle.mode,
      calm: Math.round(window.__libgaleBattle.calm),
      rage: Math.round(window.__libgaleBattle.rage),
      hp: window.__libgaleBattle.hp,
      turn: window.__libgaleBattle.turn,
      correct: window.__libgaleBattle.correct,
      phaseTwo: window.__libgaleBattle.phaseTwo,
      hazards: window.__libgaleBattle.hazards,
      menu: window.__libgaleBattle.menu,
    } : null,
    state: window.__libgaleState ? {
      sealed: [...window.__libgaleState.sealed],
      anlam: window.__libgaleState.anlam,
      maxHp: window.__libgaleState.maxHp,
    } : null,
  }));
}

async function press(key, delay = 140) {
  await page.keyboard.press(key);
  await wait(delay);
}

async function moveToSafe() {
  await page.keyboard.down("d");
  await wait(1350);
  await page.keyboard.up("d");
  await page.keyboard.down("s");
  await wait(550);
  await page.keyboard.up("s");
  await wait(200);
}

async function clearBattle(bookId) {
  await page.goto(`http://127.0.0.1:5173/?scene=battle&book=${bookId}&fast=1&lang=en`, { waitUntil: "networkidle0" });
  await wait(700);
  await page.bringToFront();
  await page.mouse.click(500, 320);
  await wait(300);
  let moved = false;
  let lastLog = "";
  const start = Date.now();
  while (Date.now() - start < 150000) {
    const i = await info();
    if (i.scene === "summary") {
      console.log("summary reached", bookId, i.state);
      return i;
    }
    if (i.scene !== "battle" || !i.battle) {
      console.log("left battle", i);
      return i;
    }
    const b = i.battle;
    const line = `${b.mode} calm=${b.calm} rage=${b.rage} hp=${b.hp} turn=${b.turn} correct=${b.correct} p2=${b.phaseTwo} hz=${b.hazards}`;
    if (line !== lastLog) {
      console.log(bookId, line);
      lastLog = line;
    }
    if (b.mode === "gameover") {
      console.log("GAME OVER", bookId);
      await press("z", 500);
      continue;
    }
    if (b.mode === "dialogue") {
      await press("z");
      continue;
    }
    if (b.mode === "word") {
      await press("z");
      continue;
    }
    if (b.mode === "menu") {
      if (!moved) {
        await moveToSafe();
        moved = true;
        continue;
      }
      // Reset the menu cursor to READ, then move right to the wanted action.
      for (let i = 0; i < b.menu; i += 1) await press("ArrowLeft", 60);
      let target = 0;
      // Three reads, then keep writing the true word until the book is sealed.
      if (b.calm >= 36) target = 1;
      for (let i = 0; i < target; i += 1) await press("ArrowRight", 60);
      await press("z");
      continue;
    }
    if (b.mode === "attack" || b.mode === "seal") {
      await wait(250);
      continue;
    }
    await wait(200);
  }
  console.log("TIMEOUT", bookId, await info());
  return null;
}

try {
  for (const book of ["ashen", "poem", "last"]) {
    const result = await clearBattle(book);
    console.log("RESULT", book, result?.scene, result?.state);
    if (result?.scene === "summary") {
      await press("z", 700);
      console.log("back to", (await info()).scene);
    }
  }
  const final = await info();
  console.log("FINAL", JSON.stringify(final, null, 2));
  console.log("--- logs ---");
  console.log(logs.filter((l) => l.includes("error") || l.includes("Error") || l.includes("pageerror")).join("\n") || "(no errors)");
} finally {
  await browser.close();
}
