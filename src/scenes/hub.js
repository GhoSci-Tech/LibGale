import { state, addPage } from "../core/state.js";
import { t, L, getLang } from "../core/i18n.js";
import { C, addHearts, addPanel, addSprite, addText, setText } from "../core/ui.js";
import { music, sfx } from "../core/audio.js";
import { createDialogueBox } from "../core/dialogue.js";
import {
  BOOKS,
  PAGES,
  MARGIN_LINES,
  ARCHIVE_LINES,
  getChapterBooks,
} from "../data/books.js";
import { buildHubRoom } from "./hubRoom.js";
import { createWhesperFx } from "../core/whesperFx.js";

const FLOOR_Y = 300;
const PLAYER_W = 20;
const PLAYER_H = 32;
const PLAYER_SCALE = 2;
const CENTER_X = (PLAYER_W * PLAYER_SCALE) / 2;
const CENTER_Y = (PLAYER_H * PLAYER_SCALE) / 2;
const ROOM_MIN_X = 30;
const ROOM_MAX_X = 1240;
const ROOM_MIN_Y = 54;
const ROOM_MAX_Y = 224;

function worldPlate(x, y, w, h, zValue = 4, opacityValue = 0.8) {
  return add([
    rect(w, h, { radius: 2, fill: true }),
    pos(x, y),
    color(rgb(18, 14, 19)),
    opacity(opacityValue),
    z(zValue),
  ]);
}

export function registerHubScene() {
  scene("hub", (data = {}) => {
    debug.timeScale = 1;
    music("ambient_hub", 0.42);

    const room = buildHubRoom();
    let paused = false;
    let pauseIndex = 0;
    let pauseObjs = [];
    let toastTimer = 0;
    let nearest = null;
    let pageObjs = [];
    let camX = 320;
    const interactables = [];

    const dialogue = createDialogueBox();

    // --- player -----------------------------------------------------------
    const player = add([
      sprite("ghost", { anim: "idle" }),
      pos(180, 196),
      scale(PLAYER_SCALE),
      z(20),
      "player",
    ]);
    const floorLight = add([
      sprite("glow"),
      pos(180 + CENTER_X, FLOOR_Y + 4),
      anchor("center"),
      color(rgb(210, 196, 178)),
      opacity(0.06),
      scale(0.8),
      z(5),
    ]);
    const shadow = add([
      sprite("ghost_shadow"),
      pos(180 + CENTER_X, FLOOR_Y),
      anchor("center"),
      scale(0.9),
      opacity(0.68),
      z(6),
    ]);
    const playerGlow = add([
      sprite("glow"),
      pos(180 + CENTER_X, 196 + CENTER_Y),
      anchor("center"),
      color(rgb(232, 232, 236)),
      opacity(0.055),
      scale(0.75),
      z(19),
    ]);
    let moving = false;
    let facing = 1;
    const whesper = createWhesperFx(player);

    // --- reading desk + ledger -------------------------------------------
    // The desk sprite already carries its own book stack and lamp, so no
    // extra floating props here.
    addSprite("desk", 58, 248, { zValue: 2 });
    addSprite("chair", 124, 247, { zValue: 1 });
    add([
      sprite("glow"),
      pos(96, 268),
      anchor("center"),
      color(rgb(232, 161, 84)),
      opacity(0.12),
      scale(1.5),
      z(1),
    ]);
    worldPlate(32, 272, 112, 15, 4, 0.72);
    addText(t("ui.journal"), 36, 275, {
      size: 9,
      width: 104,
      align: "center",
      colorValue: C.gold,
      isFixed: false,
      zValue: 5,
    });

    // --- Margin ----------------------------------------------------------
    const npc = add([
      sprite("chort_idle", { anim: "idle" }),
      pos(204, 238),
      scale(2),
      z(5),
      color(rgb(126, 211, 202)),
    ]);
    // A proper little stool, moved to the right of the desk/chair cluster.
    add([
      rect(32, 7, { fill: true }),
      pos(206, 286),
      color(rgb(66, 47, 38)),
      z(4),
    ]);
    add([
      rect(32, 1, { fill: true }),
      pos(206, 286),
      color(rgb(120, 86, 55)),
      opacity(0.7),
      z(5),
    ]);
    add([rect(4, 7, { fill: true }), pos(209, 293), color(rgb(42, 30, 28)), z(3)]);
    add([rect(4, 7, { fill: true }), pos(231, 293), color(rgb(42, 30, 28)), z(3)]);
    worldPlate(178, 214, 96, 16, 5, 0.76);
    addText(t("ui.npcName"), 182, 217, {
      size: 9,
      width: 88,
      align: "center",
      colorValue: C.cyan,
      isFixed: false,
      zValue: 6,
    });

    // --- table with the silent reader ------------------------------------
    addSprite("bench", 280, 262, { zValue: 6, scaleValue: 1.3 });
    // One sprite: the reader is seated inside the armchair, so the silhouette
    // reads as a single object instead of two stacked PNGs.
    const chair = add([
      sprite("reader_chair", { anim: "idle" }),
      pos(418, 232),
      z(4),
    ]);
    chair.play("idle");
    const creature = chair;
    addSprite("book05", 294, 242, { zValue: 7, scaleValue: 2 });
    // The chair and its reader drift together above the floor, held up by a
    // dim gold shimmer.
    const chairAura = add([
      sprite("glow"),
      pos(444, 284),
      anchor("center"),
      color(rgb(232, 190, 104)),
      opacity(0.1),
      scale(0.34),
      z(3),
    ]);
    const drifters = [];
    let chairEmit = 0;
    let bookEmit = 0;

    function drift(x, y, colour, zValue = 6, opts = {}) {
      const size = opts.size ?? 2;
      const obj = add(
        opts.soft
          ? [
              sprite("glow"),
              pos(x, y),
              anchor("center"),
              color(colour),
              opacity(0.35),
              scale(size * 0.03),
              z(zValue),
            ]
          : [
              rect(size, size, { fill: true }),
              pos(x, y),
              anchor("center"),
              color(colour),
              opacity(0.35),
              z(zValue),
            ],
      );
      drifters.push({
        obj,
        vx: (Math.random() - 0.5) * 7,
        vy: -(opts.rise ?? 9 + Math.random() * 11),
        life: opts.life ?? 1.1 + Math.random() * 0.9,
        max: opts.life ?? 1.4,
        peak: opts.peak ?? 0.3 + Math.random() * 0.2,
      });
    }

    // --- reading tables ---------------------------------------------------
    addSprite("bench", 880, 262, { zValue: 5, scaleValue: 1.3 });
    addSprite("chair", 906, 247, { zValue: 3 });
    add([
      sprite("glow"),
      pos(940, 268),
      anchor("center"),
      color(rgb(214, 178, 104)),
      opacity(0.08),
      scale(1.1),
      z(4),
    ]);

    // --- three lecterns ---------------------------------------------------
    const chapterBooks = getChapterBooks(1);
    const lecternX = [520, 660, 800];
    const floatingBooks = [];
    for (let i = 0; i < chapterBooks.length; i += 1) {
      const book = chapterBooks[i];
      const x = lecternX[i] ?? 470 + i * 150;
      addSprite("lectern", x - 20, 252, { zValue: 3 });
      const sealed = state.sealed.includes(book.id);
      add([
        sprite("glow"),
        pos(x, 234),
        anchor("center"),
        color(sealed ? rgb(255, 222, 152) : rgb(232, 161, 84)),
        opacity(sealed ? 0.2 : 0.1),
        scale(sealed ? 1.1 : 0.9),
        z(2),
      ]);
      const bookSprite = addSprite(`${book.rageCover}_small`, x - 24, 216, {
        zValue: 5,
        colorValue: sealed ? rgb(255, 238, 190) : undefined,
      });
      floatingBooks.push({ obj: bookSprite, baseY: 216, phase: i * 1.7, x, sealed });
      worldPlate(x - 65, 282, 130, 15, 6, 0.78);
      const label = addText(
        `${L(book.title)}${sealed ? ` · ${t("ui.sealed")}` : ""}`,
        x - 62,
        285,
        {
          size: 9,
          width: 124,
          align: "center",
          colorValue: sealed ? C.goldBright : C.gold,
          isFixed: false,
          zValue: 7,
        },
      );
      interactables.push({
        type: "book",
        book,
        x,
        y: 228,
        r: 62,
        label: L(book.title),
        _label: label,
      });
    }

    // --- archive door ----------------------------------------------------
    // The three seals form a triangle on the door itself, inside a rune ring.
    const archiveSeals = [];
    const sealCentre = { x: 1156, y: 212 };
    const sealSpots = [
      { x: 1156, y: 186 },
      { x: 1126, y: 230 },
      { x: 1186, y: 230 },
    ];
    const runeRing = add([
      circle(38, { fill: false }),
      pos(sealCentre.x, sealCentre.y),
      color(rgb(214, 178, 104)),
      opacity(0.16),
      outline(1, rgb(214, 178, 104)),
      z(2),
    ]);
    for (let i = 0; i < 3; i += 1) {
      const spot = sealSpots[i];
      const halo = add([
        sprite("glow"),
        pos(spot.x, spot.y),
        anchor("center"),
        color(rgb(255, 214, 132)),
        opacity(0),
        scale(0.24),
        z(3),
      ]);
      const seal = add([
        sprite("seal"),
        pos(spot.x, spot.y),
        anchor("center"),
        scale(1.1),
        opacity(0.9),
        color(state.sealed.length > i ? rgb(255, 238, 190) : rgb(96, 88, 98)),
        z(4),
      ]);
      archiveSeals.push({ seal, halo, baseY: spot.y, phase: i * 1.4, sealed: state.sealed.length > i });
    }
    worldPlate(1090, 140, 190, 17, 6, 0.8);
    addText(t("ui.archiveName"), 1094, 143, {
      size: 9,
      width: 182,
      align: "center",
      colorValue: state.sealed.length >= 3 ? C.goldBright : C.muted,
      isFixed: false,
      zValue: 7,
    });
    interactables.push({
      type: "archive",
      x: 1156,
      y: 222,
      r: 70,
      label: t("ui.archiveName"),
    });

    // --- unwritten stand --------------------------------------------------
    addSprite("lectern", 1010, 252, { zValue: 3 });
    addSprite("book12", 998, 228, { zValue: 5, scaleValue: 2, opacityValue: 0.55 });
    addText("?", 1012, 212, {
      size: 18,
      colorValue: C.muted,
      isFixed: false,
      zValue: 6,
    });
    worldPlate(980, 282, 100, 15, 6, 0.65);
    addText(t("ui.unwrittenName"), 982, 285, {
      size: 9,
      width: 96,
      align: "center",
      colorValue: C.muted,
      isFixed: false,
      zValue: 7,
    });
    interactables.push({
      type: "unwritten",
      x: 1030,
      y: 242,
      r: 48,
      label: t("ui.unwrittenName"),
    });

    // --- loose pages, placed on real surfaces ----------------------------
    for (const page of PAGES) {
      if (state.pages.includes(page.id)) continue;
      const glow = add([
        sprite("glow"),
        pos(page.x + 2, page.y + 1),
        anchor("center"),
        color(rgb(255, 244, 198)),
        opacity(0.16),
        scale(0.3),
        z(8),
      ]);
      const obj = add([
        sprite("page_particle"),
        pos(page.x - 5, page.y - 4),
        scale(1.35),
        z(9),
      ]);
      pageObjs.push({ page, obj, glow, x: page.x, y: page.y, baseY: page.y, phase: rand(0, 6) });
    }

    // --- HUD --------------------------------------------------------------
    addPanel(12, 10, 288, 62, {
      fill: rgb(20, 16, 24),
      radius: 4,
      outlineWidth: 1,
      outlineColor: rgb(100, 82, 76),
      zValue: 100,
      opacityValue: 0.93,
    });
    addText(state.name, 22, 16, {
      size: 10,
      colorValue: C.goldBright,
      zValue: 103,
    });
    const hearts = addHearts(20, 30, state.maxHp);
    hearts.update(state.maxHp, state.maxHp);
    const meaningText = addText(`${t("ui.meaningShort")} ${state.anlam}`, 210, 30, {
      size: 9,
      colorValue: C.cyan,
      zValue: 103,
    });
    const pagesText = addText(`${t("ui.pages")} ${state.pages.length}/5`, 210, 45, {
      size: 9,
      colorValue: C.pale,
      zValue: 103,
    });
    addPanel(308, 10, 320, 22, {
      fill: rgb(20, 16, 24),
      radius: 4,
      outlineWidth: 1,
      outlineColor: rgb(100, 82, 76),
      zValue: 100,
      opacityValue: 0.87,
    });
    const objective = addText("", 316, 16, {
      size: 9,
      width: 304,
      align: "right",
      colorValue: C.pale,
      zValue: 103,
    });

    const prompt = addText("", 0, 338, {
      size: 10,
      width: 640,
      align: "center",
      colorValue: C.pale,
      zValue: 110,
      shadow: true,
    });
    prompt.hidden = true;

    const toastPanel = addPanel(152, 78, 336, 38, {
      fill: rgb(28, 22, 30),
      radius: 4,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 128,
      opacityValue: 0.96,
    });
    const toastText = addText("", 162, 86, {
      size: 9,
      width: 316,
      align: "center",
      lineSpacing: 2,
      colorValue: C.pale,
      zValue: 130,
    });
    toastPanel.hidden = true;
    toastText.hidden = true;

    function showToast(message) {
      setText(toastText, message);
      toastPanel.hidden = false;
      toastText.hidden = false;
      toastTimer = 2.8;
    }

    function updateHud() {
      hearts.update(state.maxHp, state.maxHp);
      setText(meaningText, `${t("ui.meaningShort")} ${state.anlam}`);
      setText(pagesText, `${t("ui.pages")} ${state.pages.length}/5`);
      if (state.interludeSeen) setText(objective, t("ui.objectiveChapter"));
      else if (state.sealed.length >= 3) setText(objective, t("ui.objectiveArchive"));
      else setText(objective, t("ui.objectiveSeal"));
    }
    updateHud();

    // --- pause ------------------------------------------------------------
    const pauseItems = [
      { id: "resume", label: () => t("ui.resume") },
      { id: "journal", label: () => t("ui.journal") },
      { id: "settings", label: () => t("ui.settings") },
      { id: "title", label: () => t("ui.quitToTitle") },
    ];
    function openPause() {
      if (paused || dialogue.isOpen()) return;
      paused = true;
      pauseIndex = 0;
      pauseObjs = [];
      pauseObjs.push(addPanel(186, 78, 268, 202, {
        fill: rgb(18, 14, 22),
        radius: 4,
        outlineWidth: 1,
        outlineColor: C.gold,
        zValue: 150,
        opacityValue: 0.98,
      }));
      pauseObjs.push(addText(t("ui.paused"), 0, 94, {
        size: 15,
        width: 640,
        align: "center",
        colorValue: C.goldBright,
        zValue: 152,
      }));
      for (let i = 0; i < pauseItems.length; i += 1) {
        pauseObjs.push(addText("", 0, 134 + i * 25, {
          size: 12,
          width: 640,
          align: "center",
          colorValue: C.pale,
          zValue: 152,
        }));
      }
      pauseObjs.push(addText(t("ui.controls"), 0, 250, {
        size: 9,
        width: 640,
        align: "center",
        colorValue: C.muted,
        zValue: 152,
      }));
      refreshPause();
    }
    function refreshPause() {
      const texts = pauseObjs.slice(2, 2 + pauseItems.length);
      for (let i = 0; i < pauseItems.length; i += 1) {
        const selected = i === pauseIndex;
        texts[i].color = selected ? C.goldBright : C.muted;
        texts[i].text = `${selected ? "›  " : "   "}${pauseItems[i].label()}${selected ? "  ‹" : ""}`;
      }
    }
    function closePause() {
      paused = false;
      for (const obj of pauseObjs) obj.destroy();
      pauseObjs = [];
    }
    function choosePause() {
      const item = pauseItems[pauseIndex];
      sfx("ui_confirm");
      if (item.id === "resume") closePause();
      if (item.id === "journal") { closePause(); go("journal"); }
      if (item.id === "settings") { closePause(); go("settings", { from: "hub" }); }
      if (item.id === "title") { closePause(); go("title"); }
    }

    // --- interactions -----------------------------------------------------
    function showBook(book) {
      if (state.sealed.includes(book.id)) {
        dialogue.show(
          [getLang() === "tr"
            ? "Bu kitap mühürlü. Hikâyesi Günlük'te seni bekliyor."
            : "This book is sealed. Its story is waiting in the Journal."],
          { speaker: L(book.title) },
        );
        return;
      }
      const lines = [...L(book.intro)];
      if (book.order === 1) lines.push(t("tutorial.ashen"));
      if (book.order === 2) lines.push(t("tutorial.poem"));
      if (book.order === 3) lines.push(t("tutorial.last"));
      dialogue.show(lines, {
        speaker: L(book.title),
        onDone: () => go("battle", { bookId: book.id }),
      });
    }

    function showNpc() {
      let lines = MARGIN_LINES.beforeFirst;
      if (state.sealed.length === 1) lines = MARGIN_LINES.afterAshen;
      if (state.sealed.length === 2) lines = MARGIN_LINES.afterPoem;
      if (state.sealed.length >= 3) lines = MARGIN_LINES.afterAll;
      dialogue.show(L(lines), { speaker: t("ui.npcName") });
    }

    function showArchive() {
      if (state.interludeSeen) {
        dialogue.show(L(ARCHIVE_LINES.afterInterlude), { speaker: t("ui.archiveName") });
        return;
      }
      if (state.sealed.length >= 3) {
        dialogue.show(L(ARCHIVE_LINES.unlocked), {
          speaker: t("ui.archiveName"),
          onDone: () => { sfx("sfx_door"); go("interlude"); },
        });
        return;
      }
      dialogue.show(L(ARCHIVE_LINES.locked), { speaker: t("ui.archiveName") });
    }

    function showCreature() {
      sfx("sfx_whisper", 0.18);
      tween(1, 1.05, 0.18, (v) => { if (creature.exists()) creature.scale = vec2(v); }, easings.easeOutQuad)
        .onEnd(() => {
          tween(1.05, 1, 0.3, (v) => { if (creature.exists()) creature.scale = vec2(v); }, easings.easeInOutQuad);
        });
      dialogue.show(["..."], { speaker: "" });
    }

    // The clock on the wall has stopped. When the player pushes it, the thing
    // behind the dial breathes once, then a second thought arrives.
    let clockBusy = false;
    function clockBreath() {
      const puff = add([
        sprite("glow"),
        pos(967, 112),
        anchor("center"),
        color(rgb(214, 222, 236)),
        opacity(0.3),
        scale(0.34),
      ]);
      tween(0.3, 0, 1.6, (v) => {
        if (puff.exists()) puff.opacity = v * 0.8;
      }, easings.linear).onEnd(() => {
        if (puff.exists()) puff.destroy();
      });
      // two fat puffs so the breath reads at a glance
      for (let i = 0; i < 2; i += 1) {
        wait(i * 0.12, () => {
          drift(958 + Math.random() * 16, 110, rgb(226, 232, 244), 8, {
            rise: 7,
            life: 2.2,
            peak: 0.5,
            size: 7.2,
            soft: true,
          });
        });
      }
      for (let i = 0; i < 22; i += 1) {
        wait(i * 0.04, () => {
          drift(
            952 + Math.random() * 30,
            108 + Math.random() * 8,
            rgb(214, 222, 238),
            8,
            {
              rise: 11 + Math.random() * 12,
              life: 1.8 + Math.random() * 0.9,
              peak: 0.55,
              size: 4.6 + Math.random() * 1.6,
              soft: true,
            },
          );
        });
      }
    }

    function showClock() {
      if (clockBusy) return;
      dialogue.show([t("ui.clockLine1")], {
        speaker: t("ui.clockName"),
        onDone: () => {
          clockBusy = true;
          clockBreath();
          sfx("sfx_breath", 0.5);
          wait(1.35, () => {
            clockBusy = false;
            dialogue.show([t("ui.clockLine2")], { speaker: t("ui.clockName") });
          });
        },
      });
    }

    function interact() {
      if (!nearest) return;
      sfx("ui_confirm");
      if (nearest.type === "book") showBook(nearest.book);
      else if (nearest.type === "npc") showNpc();
      else if (nearest.type === "journal") go("journal");
      else if (nearest.type === "archive") showArchive();
      else if (nearest.type === "creature") showCreature();
      else if (nearest.type === "clock") showClock();
      else if (nearest.type === "unwritten") dialogue.show([t("ui.unwritten")], { speaker: t("ui.unwrittenName") });
    }

    onKeyPress("z", () => {
      if (paused) { choosePause(); return; }
      if (dialogue.isOpen()) { dialogue.advance(); return; }
      interact();
    });
    onKeyPress("enter", () => {
      if (paused) { choosePause(); return; }
      if (dialogue.isOpen()) { dialogue.advance(); return; }
      interact();
    });
    onKeyPress("escape", () => {
      if (dialogue.isOpen()) return;
      if (paused) closePause();
      else openPause();
    });
    onKeyPress("up", () => {
      if (!paused) return;
      pauseIndex = (pauseIndex - 1 + pauseItems.length) % pauseItems.length;
      sfx("ui_move", 0.4);
      refreshPause();
    });
    onKeyPress("down", () => {
      if (!paused) return;
      pauseIndex = (pauseIndex + 1) % pauseItems.length;
      sfx("ui_move", 0.4);
      refreshPause();
    });

    // --- update -----------------------------------------------------------
    onUpdate(() => {
      dialogue.update();

      if (!paused && !dialogue.isOpen() && !clockBusy) {
        let dx = 0;
        let dy = 0;
        if (isKeyDown("a") || isKeyDown("left")) dx -= 1;
        if (isKeyDown("d") || isKeyDown("right")) dx += 1;
        if (isKeyDown("w") || isKeyDown("up")) dy -= 1;
        if (isKeyDown("s") || isKeyDown("down")) dy += 1;
        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy) || 1;
          const speed = 120;
          player.pos.x += (dx / len) * speed * dt();
          player.pos.y += (dy / len) * speed * dt();
          player.pos.x = clamp(player.pos.x, ROOM_MIN_X, ROOM_MAX_X);
          player.pos.y = clamp(player.pos.y, ROOM_MIN_Y, ROOM_MAX_Y);
          if (!moving) {
            moving = true;
            player.play("move");
          }
          if (dx !== 0) facing = dx;
          player.flipX = facing < 0;
        } else if (moving) {
          moving = false;
          player.play("idle");
        }
      }

      const px = player.pos.x + CENTER_X;
      const py = player.pos.y + CENTER_Y;
      camX = lerp(camX, clamp(px, 320, 960), 0.08);
      setCamPos(vec2(camX, 180));
      room.update(camX, time());

      floorLight.pos = vec2(px, FLOOR_Y + 4);
      floorLight.opacity = 0.045 + 0.018 * Math.sin(time() * 2.1);
      shadow.pos = vec2(px, FLOOR_Y);
      shadow.opacity = 0.62 + 0.05 * Math.sin(time() * 2.2);
      playerGlow.pos = vec2(px, py + 8);
      playerGlow.opacity = 0.045 + 0.02 * Math.sin(time() * 2.3);
      whesper.update(dt(), vec2(px, py), moving);

      npc.pos.y = 238;

      // Floating furniture: the chair and its silent reader share one slow bob.
      const bob = Math.sin(time() * 1.35) * 2.2;
      chair.pos.y = 232 + bob;
      chairAura.pos = vec2(444, 286 + bob * 0.35);
      chairAura.opacity = 0.085 + 0.03 * Math.sin(time() * 2.1);
      chairAura.scale = vec2(0.32 + 0.02 * Math.sin(time() * 1.6));

      chairEmit += dt();
      if (chairEmit > 0.1) {
        chairEmit = 0;
        drift(420 + Math.random() * 46, 289 + bob * 0.3, rgb(246, 210, 132), 8, {
          rise: 9 + Math.random() * 9,
          life: 0.9 + Math.random() * 0.6,
          peak: 0.5,
          size: 2,
        });
      }

      // Rage books hover over their lecterns with a thin grey ash.
      for (const fb of floatingBooks) {
        fb.obj.pos.y = fb.baseY + Math.sin(time() * 1.15 + fb.phase) * 2.4;
      }
      bookEmit += dt();
      if (bookEmit > 0.2) {
        bookEmit = 0;
        for (const fb of floatingBooks) {
          drift(fb.x - 22 + Math.random() * 24, 250, rgb(214, 210, 222), 7, {
            rise: 7 + Math.random() * 8,
            life: 1.1 + Math.random() * 0.7,
            peak: 0.42,
            size: 2,
          });
        }
      }

      for (let i = drifters.length - 1; i >= 0; i -= 1) {
        const d = drifters[i];
        d.life -= dt();
        if (d.life <= 0 || !d.obj?.exists?.()) {
          if (d.obj?.exists?.()) d.obj.destroy();
          drifters.splice(i, 1);
          continue;
        }
        d.obj.pos.x += d.vx * dt();
        d.obj.pos.y += d.vy * dt();
        const fade = 1 - d.life / d.max;
        d.obj.opacity = Math.sin(Math.min(1, fade) * Math.PI) * d.peak;
      }

      // Seals breathe; sealed ones carry a gold halo.
      for (const entry of archiveSeals) {
        const sealed = entry.sealed || state.sealed.length >= 3;
        entry.seal.pos.y = entry.baseY + Math.sin(time() * 1.4 + entry.phase) * 1.2;
        entry.seal.opacity = sealed ? 0.92 + 0.08 * Math.sin(time() * 3 + entry.phase) : 0.72;
        entry.halo.pos = vec2(entry.seal.pos.x, entry.seal.pos.y);
        entry.halo.opacity = sealed ? 0.16 + 0.06 * Math.sin(time() * 2.4 + entry.phase) : 0;
      }
      runeRing.opacity = 0.1 + 0.04 * Math.sin(time() * 1.8) + (state.sealed.length / 3) * 0.12;

      nearest = null;
      let best = Infinity;
      for (const item of interactables) {
        const d = Math.hypot(px - item.x, py - item.y);
        if (d < item.r && d < best) {
          best = d;
          nearest = item;
        }
      }
      if (!paused && !dialogue.isOpen() && !clockBusy && nearest) {
        prompt.hidden = false;
        setText(prompt, `Z — ${nearest.label}`);
      } else {
        prompt.hidden = true;
      }

      for (let i = pageObjs.length - 1; i >= 0; i -= 1) {
        const entry = pageObjs[i];
        entry.obj.pos.y = entry.baseY + Math.sin(time() * 2 + entry.phase) * 2;
        entry.glow.pos.y = entry.obj.pos.y + 4;
        const d = Math.hypot(px - entry.x, py - entry.y);
        if (d < 28) {
          const added = addPage(entry.page.id);
          if (added) {
            sfx("sfx_mote", 0.8);
            updateHud();
            const noteLines = [L(entry.page.note)];
            if (state.pages.length === 5) noteLines.push(t("ui.allPages"));
            dialogue.show(noteLines, { speaker: t("ui.newPage") });
            showToast(`${t("ui.newPage")} ${state.pages.length}/5`);
          }
          entry.obj.destroy();
          entry.glow.destroy();
          pageObjs.splice(i, 1);
        }
      }

      if (toastTimer > 0) {
        toastTimer -= dt();
        if (toastTimer <= 0) {
          toastPanel.hidden = true;
          toastText.hidden = true;
        }
      }
    });

    // NPC / creature interactables.
    interactables.push({ type: "npc", x: 222, y: 242, r: 54, label: t("ui.npcName") });
    interactables.push({ type: "journal", x: 96, y: 248, r: 54, label: t("ui.journal") });
    interactables.push({ type: "creature", x: 440, y: 248, r: 56, label: "..." });
    interactables.push({ type: "clock", x: 966, y: 118, r: 58, label: t("ui.clockName") });

    if (data.justSealed) {
      const book = BOOKS.find((b) => b.id === data.justSealed);
      if (book) showToast(`${L(book.title)} ${t("ui.bookSealed")}`);
      updateHud();
    }
    if (data.retreated) showToast(t("ui.retreatBook"));
    if (state.sealed.length >= 3) {
      for (const entry of archiveSeals) entry.seal.color = rgb(255, 242, 206);
    }

    // Small debug surface for the visual QA scripts.
    window.__libgaleHub = {
      get player() { return { x: player.pos.x, y: player.pos.y }; },
      get nearest() { return nearest?.type ?? null; },
      get paused() { return paused; },
      get dialogueOpen() { return dialogue.isOpen(); },
      get clockBusy() { return clockBusy; },
    };
  });
}
