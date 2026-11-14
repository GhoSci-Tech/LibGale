import { state, saveState, addSealed } from "../core/state.js";
import { t, L } from "../core/i18n.js";
import { C, addBar, addHearts, addPanel, addSprite, addText, setText } from "../core/ui.js";
import { music, sfx } from "../core/audio.js";
import { getBook } from "../data/books.js";
import { createWhesperFx } from "../core/whesperFx.js";

const PLAY_MIN_X = 28;
const PLAY_MAX_X = 596;
const PLAY_MIN_Y = 54;
const PLAY_MAX_Y = 180;
const PLAYER_CENTER_X = 20;
const PLAYER_CENTER_Y = 32;

export function registerBattleScene() {
  scene("battle", (data = {}) => {
    const book = getBook(data.bookId);
    const pal = book.palette;
    const lang = state.lang;
    const fastMode = new URLSearchParams(window.location.search).get("fast") === "1";
    const baseDamage = state.difficulty === "story" ? 1 : book.baseDamage;
    const storySpeed = state.difficulty === "story" ? 0.8 : 1;
    const invulnTime = state.difficulty === "story" ? 1.5 : 1.2;

    debug.timeScale = 1;
    music(`ambient_${book.arena}`, 0.46);

    // ---------------------------------------------------------------------
    // Arena
    // ---------------------------------------------------------------------
    add([
      rect(640, 360, { fill: true }),
      pos(0, 0),
      color(rgb(...pal.bg)),
      z(-100),
      fixed(),
    ]);
    add([
      rect(640, 120, { fill: true }),
      pos(0, 240),
      color(rgb(...pal.bg2)),
      z(-96),
      fixed(),
    ]);
    add([
      rect(640, 2, { fill: true }),
      pos(0, 239),
      color(rgb(...pal.accent)),
      opacity(0.2),
      z(-95),
      fixed(),
    ]);

    // Paper texture / floating page fragments.
    for (let i = 0; i < 20; i += 1) {
      add([
        sprite("page_particle"),
        pos(rand(0, 630), rand(40, 250)),
        scale(rand(0.4, 1.0)),
        opacity(rand(0.05, 0.16)),
        rotate(rand(-30, 30)),
        z(-94),
        fixed(),
      ]);
    }

    // Per-book diorama props.
    if (book.arena === "ashen") {
      addSprite("house", 44, 198, { zValue: -60, scaleValue: 1.2, isFixed: true });
      addSprite("house", 514, 198, { zValue: -60, scaleValue: 1.2, isFixed: true });
      addSprite("well", 206, 224, { zValue: -55, scaleValue: 1.35, isFixed: true });
      add([
        sprite("glow"),
        pos(230, 238),
        color(rgb(...pal.safe)),
        opacity(0.16),
        scale(1.4),
        z(-54),
        fixed(),
      ]);
    } else if (book.arena === "poem") {
      add([
        sprite("glow"),
        pos(518, 56),
        anchor("center"),
        color(rgb(150, 162, 232)),
        opacity(0.1),
        scale(1.1),
        z(-61),
        fixed(),
      ]);
      addSprite("moon_mystic", 486, 24, { zValue: -60, scaleValue: 1.6, isFixed: true });
      addSprite("pillar", 12, 154, { zValue: -58, scaleValue: 1.4, isFixed: true });
      addSprite("pillar", 604, 154, { zValue: -58, scaleValue: 1.4, isFixed: true });
      const lines = ["...the line waits...", "...the room listens...", "...the echo returns...", "..."];
      for (let i = 0; i < lines.length; i += 1) {
        addText(lines[i], 54 + i * 30, 82 + i * 38, {
          size: 8,
          width: 260,
          align: "center",
          colorValue: rgb(...pal.accent),
          zValue: -70,
          opacityValue: 0.16,
        });
      }
      add([
        sprite("glow"),
        pos(320, 226),
        color(rgb(...pal.safe)),
        opacity(0.14),
        scale(1.2),
        z(-54),
        fixed(),
      ]);
    } else {
      addSprite("tower_prop", 450, 154, { zValue: -60, scaleValue: 1.4, isFixed: true });
      addSprite("pagewall_prop", 38, 170, { zValue: -58, scaleValue: 1.3, isFixed: true });
      addSprite("inkblot", 566, 246, { zValue: -56, scaleValue: 1.3, isFixed: true });
      add([
        sprite("glow"),
        pos(506, 180),
        color(rgb(...pal.accent)),
        opacity(0.12),
        scale(1.6),
        z(-55),
        fixed(),
      ]);
    }

    // Vignette and a soft colour wash.
    add([
      rect(640, 360),
      pos(0, 0),
      color(rgb(...pal.bg)),
      opacity(0.1),
      z(-50),
      fixed(),
    ]);
    add([
      sprite("vignette"),
      pos(0, 0),
      opacity(0.8),
      z(80),
      fixed(),
    ]);

    // ---------------------------------------------------------------------
    // Safe zone
    // ---------------------------------------------------------------------
    const safe = { ...book.safeZone };
    let safeBoost = 0;
    const safeGlow = add([
      sprite("glow"),
      pos(safe.x, safe.y),
      anchor("center"),
      color(rgb(...pal.safe)),
      opacity(0.16),
      scale(safe.r / 58),
      z(1),
      fixed(),
    ]);
    const safeRing = add([
      circle(safe.r, { fill: false }),
      pos(safe.x, safe.y),
      color(rgb(...pal.safe)),
      opacity(0.34),
      outline(2, rgb(...pal.safe)),
      z(2),
      fixed(),
    ]);
    const safeLabel = addText(t("ui.safe"), safe.x - 40, safe.y - safe.r - 12, {
      size: 7,
      width: 80,
      align: "center",
      colorValue: rgb(...pal.safe),
      zValue: 3,
      opacityValue: 0.7,
    });
    const stillText = addText(t("battle.stillness"), safe.x - 80, safe.y - safe.r - 24, {
      size: 7,
      width: 92,
      align: "center",
      colorValue: rgb(...pal.danger),
      zValue: 22,
      opacityValue: 0,
    });

    // ---------------------------------------------------------------------
    // Enemy
    // ---------------------------------------------------------------------
    const enemyGlow = add([
      sprite("glow"),
      pos(478, 106),
      anchor("center"),
      color(rgb(...pal.accent)),
      opacity(0.18),
      scale(1.4),
      z(2),
      fixed(),
    ]);
    const bookCover = addSprite(book.rageCover, 398, 62, {
      zValue: 4,
      scaleValue: 1.4,
      isFixed: true,
    });
    const enemyStartY = book.arena === "last" ? 18 : 26;
    const enemy = add([
      sprite(book.enemySprite, { anim: "idle" }),
      pos(452, enemyStartY),
      scale(book.enemyScale),
      z(6),
      fixed(),
    ]);
    // The three sheets are pre-baked facing left by tools/make_enemy_gaze.py,
    // so no runtime flip is needed any more.
    const enemyBase = vec2(enemy.pos.x, enemy.pos.y);
    const bookBase = vec2(bookCover.pos.x, bookCover.pos.y);

    // ---------------------------------------------------------------------
    // Player
    // ---------------------------------------------------------------------
    const player = add([
      sprite("ghost", { anim: "idle" }),
      pos(120, 150),
      scale(2),
      z(20),
      opacity(1),
      fixed(),
    ]);
    const playerFloorLight = add([
      sprite("glow"),
      pos(140, 248),
      anchor("center"),
      color(rgb(210, 196, 178)),
      opacity(0.05),
      scale(0.7),
      z(2),
      fixed(),
    ]);
    const playerShadow = add([
      sprite("ghost_shadow"),
      pos(140, 244),
      anchor("center"),
      scale(0.85),
      opacity(0.6),
      z(3),
      fixed(),
    ]);
    const playerGlow = add([
      sprite("glow"),
      pos(140, 182),
      anchor("center"),
      color(rgb(228, 228, 232)),
      opacity(0.05),
      scale(0.75),
      z(19),
      fixed(),
    ]);
    const shieldRing = add([
      circle(22, { fill: false }),
      pos(140, 182),
      color(rgb(...pal.safe)),
      opacity(0),
      outline(2, rgb(...pal.safe)),
      z(21),
      fixed(),
    ]);
    let moving = false;
    let iframes = 0;
    let phaseTime = 0;
    let phaseCd = 0;
    const whesper = createWhesperFx(player);

    // ---------------------------------------------------------------------
    // HUD
    // ---------------------------------------------------------------------
    addPanel(12, 10, 330, 82, {
      fill: rgb(20, 16, 24),
      radius: 4,
      outlineWidth: 1,
      outlineColor: rgb(93, 77, 74),
      zValue: 100,
      opacityValue: 0.93,
    });
    addText(state.name, 22, 15, {
      size: 10,
      colorValue: C.goldBright,
      zValue: 103,
    });
    const hearts = addHearts(20, 29, state.maxHp);
    let hp = state.maxHp;
    const maxHp = state.maxHp;
    hearts.update(hp, maxHp);

    addText(t("ui.meaningShort"), 210, 15, {
      size: 9,
      colorValue: C.cyan,
      zValue: 103,
    });
    const calmBar = addBar(210, 26, 100, 6, C.cyan, { z: 101 });
    const calmValue = addText("0", 316, 24, {
      size: 9,
      colorValue: C.cyan,
      zValue: 103,
    });
    addText(t("ui.rageShort"), 210, 39, {
      size: 9,
      colorValue: C.red,
      zValue: 103,
    });
    const rageBar = addBar(210, 50, 100, 6, C.red, { z: 101 });
    const rageValue = addText("0", 316, 48, {
      size: 9,
      colorValue: C.red,
      zValue: 103,
    });
    const phaseText = addText("", 20, 64, {
      size: 9,
      colorValue: C.muted,
      zValue: 103,
    });

    addText(L(book.title), 328, 14, {
      size: 12,
      width: 300,
      align: "right",
      colorValue: C.goldBright,
      zValue: 103,
    });
    addText(L(book.enemyName), 328, 31, {
      size: 9,
      width: 300,
      align: "right",
      colorValue: C.muted,
      zValue: 103,
    });
    const turnText = addText(`${t("ui.turn")} 1`, 328, 46, {
      size: 9,
      width: 300,
      align: "right",
      colorValue: C.muted,
      zValue: 103,
    });
    addPanel(168, 92, 304, 17, {
      fill: rgb(15, 12, 18),
      radius: 3,
      zValue: 102,
      opacityValue: 0.56,
    });
    const hintText = addText(t("battle.hintMove"), 0, 96, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 103,
      opacityValue: 0.8,
      shadow: true,
    });

    // ---------------------------------------------------------------------
    // Menu
    // ---------------------------------------------------------------------
    const menuLabels = [t("ui.read"), t("ui.write"), t("ui.listen"), t("ui.retreat")];
    const menuPanels = [];
    const menuTexts = [];
    let menuIndex = 0;
    for (let i = 0; i < 4; i += 1) {
      const panel = addPanel(36 + i * 148, 245, 136, 25, {
        fill: rgb(27, 22, 30),
        radius: 3,
        outlineWidth: 1,
        outlineColor: rgb(93, 77, 74),
        zValue: 110,
        opacityValue: 0.96,
      });
      const label = addText(menuLabels[i], 36 + i * 148, 251, {
        size: 11,
        width: 136,
        align: "center",
        colorValue: C.pale,
        zValue: 112,
      });
      menuPanels.push(panel);
      menuTexts.push(label);
    }

    function refreshMenu() {
      for (let i = 0; i < 4; i += 1) {
        const selected = i === menuIndex;
        menuTexts[i].color = selected ? C.goldBright : C.muted;
        menuTexts[i].text = `${selected ? "> " : "  "}${menuLabels[i]}${selected ? " <" : ""}`;
        menuPanels[i].color = selected ? rgb(57, 44, 39) : rgb(27, 22, 30);
      }
    }
    function showMenu() {
      for (const panel of menuPanels) panel.hidden = false;
      for (const label of menuTexts) label.hidden = false;
      refreshMenu();
    }
    function hideMenu() {
      for (const panel of menuPanels) panel.hidden = true;
      for (const label of menuTexts) label.hidden = true;
    }
    refreshMenu();

    // ---------------------------------------------------------------------
    // Dialogue panel
    // ---------------------------------------------------------------------
    const dlgPanel = addPanel(16, 274, 608, 72, {
      fill: rgb(22, 18, 25),
      radius: 4,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 120,
      opacityValue: 0.97,
    });
    const dlgSpeaker = addText("", 28, 281, {
      size: 9,
      colorValue: C.gold,
      zValue: 122,
    });
    const dlgBody = addText("", 28, 295, {
      size: 11,
      width: 580,
      lineSpacing: 2,
      colorValue: C.pale,
      zValue: 122,
    });
    const dlgPrompt = addText("Z >", 590, 332, {
      size: 9,
      align: "right",
      colorValue: C.muted,
      zValue: 122,
    });

    const dlg = {
      active: false,
      lines: [],
      index: 0,
      chars: 0,
      speed: state.settings.textSpeed,
      speaker: "",
      onDone: null,
    };

    function dlgShow(lines, speaker, onDone = null) {
      const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
      if (!list.length) {
        onDone?.();
        return;
      }
      dlg.active = true;
      dlg.lines = list;
      dlg.index = 0;
      dlg.chars = 0;
      dlg.speed = state.settings.textSpeed;
      dlg.speaker = speaker ?? "";
      dlg.onDone = onDone;
      mode = "dialogue";
      hideMenu();
      hideWord();
      dlgPanel.hidden = false;
      dlgSpeaker.hidden = false;
      dlgBody.hidden = false;
      dlgPrompt.hidden = false;
      setText(dlgSpeaker, dlg.speaker);
      setText(dlgBody, "");
      sfx("sfx_page", 0.18);
    }

    function dlgUpdate() {
      if (!dlg.active) return;
      const full = dlg.lines[dlg.index] ?? "";
      if (dlg.chars < full.length) {
        dlg.chars = Math.min(full.length, dlg.chars + dt() * dlg.speed);
        setText(dlgBody, full.slice(0, Math.floor(dlg.chars)));
      }
    }

    function dlgAdvance() {
      if (!dlg.active) return;
      const full = dlg.lines[dlg.index] ?? "";
      if (dlg.chars < full.length) {
        dlg.chars = full.length;
        setText(dlgBody, full);
        return;
      }
      dlg.index += 1;
      if (dlg.index >= dlg.lines.length) {
        dlg.active = false;
        dlgPrompt.hidden = true;
        const done = dlg.onDone;
        dlg.onDone = null;
        done?.();
      } else {
        dlg.chars = 0;
        setText(dlgBody, "");
        sfx("sfx_page", 0.18);
      }
    }

    function setPanelText(speaker, body) {
      dlg.active = false;
      dlgPrompt.hidden = true;
      dlgPanel.hidden = false;
      dlgSpeaker.hidden = false;
      dlgBody.hidden = false;
      setText(dlgSpeaker, speaker ?? "");
      setText(dlgBody, body ?? "");
    }

    // ---------------------------------------------------------------------
    // Word choice
    // ---------------------------------------------------------------------
    const wordPanel = addPanel(140, 94, 360, 156, {
      fill: rgb(24, 19, 27),
      radius: 4,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 140,
      opacityValue: 0.98,
    });
    const wordTitle = addText(t("ui.write"), 156, 104, {
      size: 11,
      colorValue: C.goldBright,
      zValue: 142,
    });
    const wordSentence = addText("", 156, 122, {
      size: 10.5,
      width: 328,
      lineSpacing: 2,
      colorValue: C.pale,
      zValue: 142,
    });
    const wordOptionTexts = [];
    for (let i = 0; i < 3; i += 1) {
      wordOptionTexts.push(addText("", 166, 164 + i * 21, {
        size: 11,
        width: 300,
        colorValue: C.muted,
        zValue: 142,
      }));
    }
    const wordHint = addText(t("ui.confirm"), 156, 228, {
      size: 9,
      colorValue: C.muted,
      zValue: 142,
    });
    let wordIndex = 0;
    function hideWord() {
      wordPanel.hidden = true;
      wordTitle.hidden = true;
      wordSentence.hidden = true;
      for (const option of wordOptionTexts) option.hidden = true;
      wordHint.hidden = true;
    }
    function refreshWord() {
      const options = L(book.options);
      for (let i = 0; i < 3; i += 1) {
        const selected = i === wordIndex;
        wordOptionTexts[i].text = `${selected ? ">  " : "   "}${options[i] ?? ""}${selected ? "  <" : ""}`;
        wordOptionTexts[i].color = selected ? C.goldBright : C.muted;
      }
    }
    function showWord() {
      mode = "word";
      hideMenu();
      dlgPanel.hidden = true;
      dlgSpeaker.hidden = true;
      dlgBody.hidden = true;
      dlgPrompt.hidden = true;
      wordPanel.hidden = false;
      wordTitle.hidden = false;
      wordSentence.hidden = false;
      for (const option of wordOptionTexts) option.hidden = false;
      wordHint.hidden = false;
      wordIndex = 0;
      setText(wordSentence, L(book.sentence));
      refreshWord();
    }
    function backWord() {
      hideWord();
      mode = "menu";
      showMenu();
      setPanelText(L(book.title), t("battle.yourTurn"));
    }
    hideWord();

    // ---------------------------------------------------------------------
    // Attack bar
    // ---------------------------------------------------------------------
    const attackBarBg = addPanel(16, 270, 608, 4, {
      fill: rgb(44, 35, 39),
      radius: 1,
      zValue: 118,
    });
    const attackBar = add([
      rect(606, 2, { fill: true }),
      pos(17, 271),
      color(rgb(...pal.accent)),
      z(119),
      fixed(),
    ]);
    attackBarBg.hidden = true;
    attackBar.hidden = true;

    // ---------------------------------------------------------------------
    // Battle state
    // ---------------------------------------------------------------------
    let mode = "menu";
    let paused = false;
    let turn = 1;
    let calm = 0;
    let rage = 0;
    let correctWritten = false;
    let clueIndex = 0;
    let shield = false;
    let enraged = false;
    let phaseTwo = false;
    let sealStarted = false;
    let tutorialShown = false;
    let hazards = [];
    let motes = [];
    let pauseIndex = 0;
    let pauseObjs = [];
    let attack = null;
    // Per-attack mote schedule. The old code compared a running timer with a
    // counter that restarted every turn, so motes only ever appeared once.
    let stillT = 0;
    let stillRageT = 0;
    let safeShrink = 0;

    const pauseItems = [
      { id: "resume", label: () => t("ui.resume") },
      { id: "restart", label: () => t("ui.restart") },
      { id: "quit", label: () => t("ui.quitToLibrary") },
    ];

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    function playerCenter() {
      return vec2(player.pos.x + PLAYER_CENTER_X, player.pos.y + PLAYER_CENTER_Y);
    }

    function inSafeZone() {
      const p = playerCenter();
      return Math.hypot(p.x - safe.x, p.y - safe.y) <= safeRadius();
    }

    // The shelter is not a permanent camp: it slowly burns down during an
    // attack and then refills on the player's next turn.
    function safeRadius() {
      return Math.max(20, safe.r * (1 - 0.3 * safeShrink) + safeBoost);
    }

    function updateSafeVisual() {
      const r = safeRadius();
      safeRing.radius = r;
      safeGlow.scale = vec2(r / 58);
      safeRing.opacity = 0.28 + 0.1 * Math.sin(time() * 3);
    }

    function refreshHud() {
      hearts.update(hp, maxHp);
      calmBar.set(calm, 100);
      rageBar.set(rage, 100);
      setText(calmValue, `${Math.round(calm)}`);
      setText(rageValue, `${Math.round(rage)}`);
      setText(turnText, `${t("ui.turn")} ${turn}`);
    }

    function updatePhaseVisual() {
      if (phaseCd <= 0) {
        setText(phaseText, t("battle.phaseReady"));
        phaseText.color = C.cyan;
      } else {
        setText(phaseText, `${t("ui.phase")} ${phaseCd.toFixed(1)}`);
        phaseText.color = C.muted;
      }
    }

    function makeCircleHazard(x, y, r, colorValue, speedX, speedY, kind = "projectile") {
      const obj = add([
        circle(r, { fill: true }),
        pos(x, y),
        color(colorValue),
        opacity(0.9),
        outline(1, rgb(255, 220, 190)),
        z(8),
        fixed(),
      ]);
      const entry = { obj, kind, x, y, r, vx: speedX, vy: speedY, w: r * 2, h: r * 2, ttl: 8, tick: 0 };
      hazards.push(entry);
      return entry;
    }

    function makeRectHazard(x, y, w, h, colorValue, speedX, speedY, kind = "rect") {
      const obj = add([
        rect(w, h, { fill: true }),
        pos(x, y),
        color(colorValue),
        opacity(0.82),
        outline(1, rgb(255, 220, 190)),
        z(8),
        fixed(),
      ]);
      const entry = { obj, kind, x, y, w, h, vx: speedX, vy: speedY, ttl: 8, tick: 0 };
      hazards.push(entry);
      return entry;
    }

    function spawnFalling() {
      const x = rand(40, 600);
      makeCircleHazard(x, -12, 6, rgb(...pal.danger), 0, rand(90, 130) * (enraged ? 1.25 : 1) * storySpeed, "projectile");
    }

    function spawnBookFall() {
      const x = rand(44, 590);
      makeRectHazard(x, -24, 18, 24, rgb(...pal.paper), 0, rand(110, 150) * (enraged ? 1.2 : 1) * storySpeed, "projectile");
    }

    function spawnWall(side = null, speed = null) {
      const chosenSide = side ?? (chance(0.5) ? "left" : "right");
      const gapY = rand(96, 178);
      const gapH = 64;
      const x = chosenSide === "left" ? -18 : 622;
      const vx = (chosenSide === "left" ? 1 : -1) * (speed ?? 128) * (enraged ? 1.2 : 1) * storySpeed;
      if (gapY > 64) makeRectHazard(x, 60, 18, gapY - 60, rgb(...pal.danger), vx, 0, "wall");
      if (gapY + gapH < 246) makeRectHazard(x, gapY + gapH, 18, 246 - (gapY + gapH), rgb(...pal.danger), vx, 0, "wall");
    }

    function spawnAimed() {
      const p = playerCenter();
      const origin = vec2(476, 92);
      const dir = p.sub(origin).unit();
      const speed = (enraged ? 185 : 150) * storySpeed;
      makeCircleHazard(origin.x, origin.y, 5, rgb(...pal.danger), dir.x * speed, dir.y * speed, "projectile");
    }

    function spawnRing(cx = 320, cy = 150, count = 12) {
      const speed = (enraged ? 86 : 70) * storySpeed;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + time() * 0.1;
        makeCircleHazard(cx, cy, 4, rgb(...pal.accent), Math.cos(angle) * speed, Math.sin(angle) * speed, "projectile");
      }
    }

    function spawnInk() {
      const w = rand(62, 100);
      const x = rand(44, 560 - w);
      const entry = makeRectHazard(x, 222, w, 28, rgb(...pal.danger), 0, 0, "zone");
      entry.ttl = 4.2;
      entry.tick = 0;
      entry.obj.opacity = 0.38;
      entry.obj.z = 1;
    }

    // Meaning motes: fragments of the book's own meaning. They always appear
    // outside the shelter, so stepping out of safety is worth it.
    function moteSpot() {
      for (let attempt = 0; attempt < 18; attempt += 1) {
        const angle = rand(0, Math.PI * 2);
        const dist = safe.r + rand(46, 112);
        const x = clamp(safe.x + Math.cos(angle) * dist, 44, 588);
        const y = clamp(safe.y + Math.sin(angle) * dist * 0.7, 96, 202);
        if (Math.hypot(x - safe.x, y - safe.y) < safe.r + 22) continue;
        if (Math.hypot(x - 470, y - 60) < 60) continue; // not on the enemy
        return vec2(x, y);
      }
      return vec2(safe.x + safe.r + 60, clamp(safe.y - 40, 96, 202));
    }

    function spawnMote() {
      const spot = moteSpot();
      const glow = add([
        sprite("glow"),
        pos(spot.x, spot.y),
        anchor("center"),
        color(rgb(255, 238, 188)),
        opacity(0.55),
        scale(0.2),
        z(7),
        fixed(),
      ]);
      const dot = add([
        sprite("page_particle"),
        pos(spot.x, spot.y),
        anchor("center"),
        scale(0.8),
        z(8),
        fixed(),
      ]);
      const ring = add([
        circle(7, { fill: false }),
        pos(spot.x, spot.y),
        color(rgb(255, 236, 186)),
        opacity(0.5),
        outline(1, rgb(255, 236, 186)),
        z(7),
        fixed(),
      ]);
      motes.push({ glow, dot, ring, baseY: spot.y, phase: rand(0, 6) });
    }

    function moteGainFeedback(pos) {
      const label = addText(t("battle.moteGain"), pos.x - 40, pos.y - 18, {
        size: 7,
        width: 80,
        align: "center",
        colorValue: rgb(255, 236, 186),
        zValue: 40,
        opacityValue: 1,
      });
      tween(0, 1, 0.9, (v) => {
        if (!label.exists()) return;
        label.pos.y = pos.y - 18 - 10 * v;
        label.opacity = 1 - v;
      }, easings.linear).onEnd(() => {
        if (label.exists()) label.destroy();
      });
    }

    function clearHazards() {
      for (const hazard of hazards) {
        if (hazard.obj?.exists?.()) hazard.obj.destroy();
      }
      hazards = [];
      for (const mote of motes) {
        if (mote.glow?.exists?.()) mote.glow.destroy();
        if (mote.dot?.exists?.()) mote.dot.destroy();
        if (mote.ring?.exists?.()) mote.ring.destroy();
      }
      motes = [];
    }

    function takeDamage(amount) {
      if (iframes > 0 || phaseTime > 0) return;
      if (inSafeZone()) return;
      let dmg = amount;
      if (shield) {
        dmg = Math.max(1, Math.ceil(dmg / 2));
        shield = false;
        shieldRing.opacity = 0;
        sfx("sfx_hit", 0.4);
      }
      hp = Math.max(0, hp - dmg);
      iframes = invulnTime;
      rage = Math.min(100, rage + 5);
      player.opacity = 0.25;
      wait(0.16, () => {
        if (player.exists()) player.opacity = phaseTime > 0 ? 0.35 : 1;
      });
      if (!state.settings.reduceFlash) shake(6);
      sfx("sfx_hit", 0.75);
      refreshHud();
      if (hp <= 0) gameOver();
    }

    function triggerPhase() {
      if (phaseCd > 0 || phaseTime > 0) return;
      if (mode !== "menu" && mode !== "attack") return;
      phaseTime = 0.35;
      phaseCd = 2.4;
      player.opacity = 0.35;
      sfx("sfx_phase", 0.5);
      whesper.burst(playerCenter());
      add([
        circle(28, { fill: false }),
        pos(playerCenter().x, playerCenter().y),
        color(rgb(220, 222, 228)),
        opacity(0.65),
        outline(2, rgb(220, 222, 228)),
        z(22),
        fixed(),
        lifespan(0.35, { fade: 0.2 }),
      ]);
    }

    // ---------------------------------------------------------------------
    // Attack patterns
    // ---------------------------------------------------------------------
    function setBeat(index) {
      if (!attack) return;
      const beats = phaseTwo && book.phaseTwoBeats ? book.phaseTwoBeats : book.beats;
      const beat = beats[index % beats.length];
      attack.beatIndex = index;
      attack.beatT = 0;
      setPanelText(t("ui.survive"), L(beat.subtitle));
    }

    function canSpawn(key, cooldown) {
      if (!attack) return false;
      const last = attack.last[key] ?? -99;
      if (attack.t - last < cooldown / (enraged ? 1.25 : 1) / storySpeed) return false;
      attack.last[key] = attack.t;
      return true;
    }

    function spawnPattern(pattern) {
      if (!attack) return;
      switch (pattern) {
        case "embers":
          spawnFalling();
          if (enraged && chance(0.5)) spawnFalling();
          break;
        case "walls":
          if (canSpawn("walls", 1.55)) spawnWall();
          if (canSpawn("aimed", 1.1)) spawnAimed();
          break;
        case "aimed":
          if (canSpawn("aimed", 0.9)) spawnAimed();
          if (canSpawn("embers", 0.7)) spawnFalling();
          break;
        case "rings":
          if (canSpawn("rings", 1.6)) spawnRing(rand(200, 440), rand(110, 190), enraged ? 14 : 12);
          break;
        case "waves":
          if (canSpawn("waves", 1.5)) spawnWall(null, 150);
          if (canSpawn("aimed", 1.0)) spawnAimed();
          break;
        case "pagewalls":
          if (canSpawn("walls", 1.3)) spawnWall();
          if (canSpawn("books", 0.9)) spawnBookFall();
          break;
        case "ink":
          if (canSpawn("ink", 2.1)) spawnInk();
          if (canSpawn("embers", 0.65)) spawnFalling();
          break;
        case "spiral":
          if (canSpawn("rings", 1.2)) spawnRing(320, 150, enraged ? 16 : 12);
          if (canSpawn("aimed", 0.75)) spawnAimed();
          break;
        case "all":
          if (canSpawn("walls", 1.35)) spawnWall();
          if (canSpawn("rings", 1.5)) spawnRing(rand(180, 460), rand(110, 190), 12);
          if (canSpawn("ink", 2.3)) spawnInk();
          if (canSpawn("books", 0.8)) spawnBookFall();
          break;
        default:
          spawnFalling();
      }
    }

    function startAttack() {
      if (sealStarted) return;
      if (book.id === "last" && calm >= 50 && !phaseTwo) {
        phaseTwo = true;
        dlgShow([t("battle.phaseTwo")], L(book.title), () => launchAttack());
        return;
      }
      launchAttack();
    }

    function launchAttack() {
      if (sealStarted) return;
      mode = "attack";
      hideMenu();
      hideWord();
      clearHazards();
      attack = {
        t: 0,
        duration: fastMode ? 2.5 : book.duration,
        beatIndex: 0,
        beatT: 0,
        spawnT: 0,
        last: {},
        active: true,
      };
      const duration = attack.duration;
      attack.moteAt = [0.16, 0.46, 0.78].map((f) => f * duration);
      stillT = 0;
      stillRageT = 0;
      safeShrink = 0;
      stillText.opacity = 0;
      const beats = phaseTwo && book.phaseTwoBeats ? book.phaseTwoBeats : book.beats;
      setBeat(0);
      attackBarBg.hidden = false;
      attackBar.hidden = false;
      attackBar.width = 606;
      safeBoost = Math.max(safeBoost, 0);
      updateSafeVisual();
      sfx("sfx_whisper", 0.5);
      player.play("move");
      if (enraged) {
        enemy.color = rgb(255, 126, 126);
        enemyGlow.color = rgb(255, 90, 90);
        enemyGlow.opacity = 0.28;
      }
    }

    function endAttack() {
      if (!attack) return;
      attack.active = false;
      attack = null;
      attackBarBg.hidden = true;
      attackBar.hidden = true;
      clearHazards();
      safeBoost = 0;
      safeShrink = 0;
      stillT = 0;
      stillRageT = 0;
      stillText.opacity = 0;
      shieldRing.opacity = 0;
      updateSafeVisual();
      rage = Math.min(100, rage + 6);
      turn += 1;
      refreshHud();
      if (rage >= 100 && !enraged) {
        enraged = true;
        sfx("sfx_rage", 0.7);
        if (!state.settings.reduceFlash) shake(8);
        dlgShow([L(book.enrageLines)[0]], t("ui.rage"), () => startPlayerTurn());
        return;
      }
      startPlayerTurn();
    }

    function startPlayerTurn() {
      if (sealStarted) return;
      mode = "menu";
      showMenu();
      hideWord();
      dlgPanel.hidden = false;
      dlg.active = false;
      dlgPrompt.hidden = true;
      player.play("idle");
      const intro = !tutorialShown ? (book.order === 1 ? t("tutorial.ashen") : book.order === 2 ? t("tutorial.poem") : t("tutorial.last")) : t("battle.yourTurn");
      tutorialShown = true;
      setPanelText(L(book.title), intro);
      refreshHud();
      updatePhaseVisual();
    }

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------
    function afterAction() {
      if (sealStarted) return;
      if (calm >= 100 && correctWritten) {
        seal();
        return;
      }
      if (calm >= 100 && !correctWritten) {
        calm = 95;
        refreshHud();
        dlgShow([t("ui.notUnderstood")], L(book.title), () => startAttack());
        return;
      }
      startAttack();
    }

    function doRead() {
      if (mode !== "menu") return;
      calm = Math.min(100, calm + 12);
      rage = Math.max(0, rage - 8);
      safeBoost = 25;
      updateSafeVisual();
      const clues = L(book.clues);
      const clue = clues[clueIndex % clues.length];
      clueIndex += 1;
      refreshHud();
      dlgShow([clue], t("ui.clue"), afterAction);
      sfx("sfx_page", 0.45);
    }

    function doListen() {
      if (mode !== "menu") return;
      calm = Math.min(100, calm + 6);
      hp = Math.min(maxHp, hp + 1);
      rage = Math.max(0, rage - 4);
      shield = true;
      shieldRing.opacity = 0.55;
      refreshHud();
      dlgShow([L(book.listenLines)[0]], t("ui.listen"), afterAction);
      sfx("sfx_heal", 0.45);
    }

    function doRetreat() {
      if (mode !== "menu") return;
      dlgShow([t("ui.retreatConfirm")], t("ui.retreat"), () => {
        go("hub", { retreated: true });
      });
    }

    function chooseAction(index) {
      if (mode !== "menu") return;
      sfx("ui_confirm");
      if (index === 0) doRead();
      else if (index === 1) showWord();
      else if (index === 2) doListen();
      else if (index === 3) doRetreat();
    }

    function confirmWord() {
      if (mode !== "word") return;
      const options = L(book.options);
      const chosen = options[wordIndex];
      hideWord();
      if (wordIndex === book.answer) {
        correctWritten = true;
        calm = Math.min(100, calm + 30);
        rage = Math.max(0, rage - 20);
        safeBoost = 40;
        updateSafeVisual();
        refreshHud();
        sfx("sfx_quill", 0.7);
        enemy.color = rgb(180, 240, 220);
        tween(1.1, 0.85, 0.18, (v) => {
          if (enemy.exists()) enemy.scale = vec2(book.enemyScale * v, book.enemyScale * v);
        }, easings.easeOutQuad).onEnd(() => {
          if (enemy.exists()) enemy.scale = vec2(book.enemyScale);
        });
        dlgShow([L(book.correctLines)[0]], L(book.title), afterAction);
      } else {
        calm = Math.max(0, calm - 10);
        rage = Math.min(100, rage + 20);
        safeBoost = -15;
        updateSafeVisual();
        refreshHud();
        sfx("sfx_rage", 0.65);
        if (!state.settings.reduceFlash) shake(5);
        enemy.color = rgb(255, 150, 150);
        dlgShow([`${chosen}: ${L(book.wrongLines)[0]}`], L(book.title), afterAction);
      }
    }

    // ---------------------------------------------------------------------
    // Seal / game over
    // ---------------------------------------------------------------------
    function seal() {
      if (sealStarted) return;
      sealStarted = true;
      mode = "seal";
      clearHazards();
      hideMenu();
      hideWord();
      attackBarBg.hidden = true;
      attackBar.hidden = true;
      safeRing.opacity = 0.6;
      dlgShow([L(book.sealLines)[0]], L(book.title), animateSeal);
      sfx("sfx_seal", 0.55);
    }

    function animateSeal() {
      mode = "seal";
      dlg.active = false;
      dlgPanel.hidden = true;
      dlgSpeaker.hidden = true;
      dlgBody.hidden = true;
      dlgPrompt.hidden = true;
      hintText.hidden = true;
      debug.timeScale = 0.42;
      if (!state.settings.reduceFlash) shake(9);
      sfx("sfx_seal", 0.8);
      const flash = add([
        rect(640, 360),
        pos(0, 0),
        color(rgb(255, 245, 218)),
        opacity(state.settings.reduceFlash ? 0.35 : 0.85),
        z(200),
        fixed(),
      ]);
      tween(0.85, 0, 0.7, (v) => { flash.opacity = v; }, easings.easeOutQuad);
      add([
        sprite("glow"),
        pos(470, 150),
        anchor("center"),
        color(rgb(...pal.safe)),
        opacity(0.7),
        scale(2.5),
        z(150),
        fixed(),
        lifespan(1.2, { fade: 0.8 }),
      ]);
      addText(t("ui.sealedTitle"), 0, 146, {
        size: 30,
        width: 640,
        align: "center",
        colorValue: C.goldBright,
        zValue: 210,
      });
      tween(1, 0.15, 0.7, (v) => {
        enemy.opacity = v;
        bookCover.opacity = v;
        enemyGlow.opacity = v * 0.2;
      }, easings.easeInQuad);
      wait(0.9, () => {
        debug.timeScale = 1;
        addSealed(book.id);
        saveState();
        go("summary", { bookId: book.id, from: "battle" });
      });
    }

    function gameOver() {
      if (mode === "gameover") return;
      mode = "gameover";
      clearHazards();
      hideMenu();
      hideWord();
      attackBarBg.hidden = true;
      attackBar.hidden = true;
      dlgPanel.hidden = true;
      dlgSpeaker.hidden = true;
      dlgBody.hidden = true;
      dlgPrompt.hidden = true;
      hintText.hidden = true;
      sfx("sfx_gameover", 0.7);
      addPanel(120, 110, 400, 140, {
        fill: rgb(20, 14, 18),
        radius: 4,
        outlineWidth: 1,
        outlineColor: C.red,
        zValue: 200,
        opacityValue: 0.97,
      });
      addText(t("ui.gameOver"), 0, 136, {
        size: 18,
        width: 640,
        align: "center",
        colorValue: C.red,
        zValue: 202,
      });
      addText(t("ui.retry"), 0, 194, {
        size: 11,
        width: 640,
        align: "center",
        colorValue: C.pale,
        zValue: 202,
      });
      addText(t("ui.quitBook"), 0, 218, {
        size: 9,
        width: 640,
        align: "center",
        colorValue: C.muted,
        zValue: 202,
      });
    }

    // ---------------------------------------------------------------------
    // Pause
    // ---------------------------------------------------------------------
    function openPause() {
      if (paused || dlg.active || mode === "gameover" || mode === "seal") return;
      paused = true;
      pauseIndex = 0;
      pauseObjs = [];
      pauseObjs.push(addPanel(186, 88, 268, 184, {
        fill: rgb(18, 14, 22),
        radius: 4,
        outlineWidth: 1,
        outlineColor: C.gold,
        zValue: 180,
        opacityValue: 0.98,
      }));
      pauseObjs.push(addText(t("ui.paused"), 0, 104, {
        size: 15,
        width: 640,
        align: "center",
        colorValue: C.goldBright,
        zValue: 182,
      }));
      for (let i = 0; i < pauseItems.length; i += 1) {
        pauseObjs.push(addText("", 0, 148 + i * 25, {
          size: 12,
          width: 640,
          align: "center",
          colorValue: C.pale,
          zValue: 182,
        }));
      }
      pauseObjs.push(addText(t("battle.hintMove"), 0, 250, {
        size: 9,
        width: 640,
        align: "center",
        colorValue: C.muted,
        zValue: 182,
      }));
      refreshPause();
    }
    function refreshPause() {
      const texts = pauseObjs.slice(2, 2 + pauseItems.length);
      for (let i = 0; i < pauseItems.length; i += 1) {
        const selected = i === pauseIndex;
        texts[i].color = selected ? C.goldBright : C.muted;
        texts[i].text = `${selected ? ">  " : "   "}${pauseItems[i].label()}${selected ? "  <" : ""}`;
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
      if (item.id === "restart") { closePause(); go("battle", { bookId: book.id }); }
      if (item.id === "quit") { closePause(); go("hub"); }
    }

    // ---------------------------------------------------------------------
    // Input
    // ---------------------------------------------------------------------
    onKeyPress("shift", triggerPhase);
    onKeyPress("left", () => {
      if (paused) return;
      if (mode === "word") {
        wordIndex = (wordIndex - 1 + 3) % 3;
        sfx("ui_move", 0.4);
        refreshWord();
      } else if (mode === "menu") {
        menuIndex = (menuIndex - 1 + 4) % 4;
        sfx("ui_move", 0.4);
        refreshMenu();
      }
    });
    onKeyPress("right", () => {
      if (paused) return;
      if (mode === "word") {
        wordIndex = (wordIndex + 1) % 3;
        sfx("ui_move", 0.4);
        refreshWord();
      } else if (mode === "menu") {
        menuIndex = (menuIndex + 1) % 4;
        sfx("ui_move", 0.4);
        refreshMenu();
      }
    });
    onKeyPress("up", () => {
      if (paused) {
        pauseIndex = (pauseIndex - 1 + pauseItems.length) % pauseItems.length;
        sfx("ui_move", 0.4);
        refreshPause();
      } else if (mode === "word") {
        wordIndex = (wordIndex - 1 + 3) % 3;
        sfx("ui_move", 0.4);
        refreshWord();
      }
    });
    onKeyPress("down", () => {
      if (paused) {
        pauseIndex = (pauseIndex + 1) % pauseItems.length;
        sfx("ui_move", 0.4);
        refreshPause();
      } else if (mode === "word") {
        wordIndex = (wordIndex + 1) % 3;
        sfx("ui_move", 0.4);
        refreshWord();
      }
    });
    onKeyPress("z", () => {
      if (paused) { choosePause(); return; }
      if (mode === "gameover") { go("battle", { bookId: book.id }); return; }
      if (mode === "dialogue") { dlgAdvance(); return; }
      if (mode === "word") { confirmWord(); return; }
      if (mode === "menu") { chooseAction(menuIndex); return; }
    });
    onKeyPress("enter", () => {
      if (paused) { choosePause(); return; }
      if (mode === "gameover") { go("battle", { bookId: book.id }); return; }
      if (mode === "dialogue") { dlgAdvance(); return; }
      if (mode === "word") { confirmWord(); return; }
      if (mode === "menu") { chooseAction(menuIndex); return; }
    });
    onKeyPress("x", () => {
      if (paused || mode === "gameover") return;
      if (mode === "word") backWord();
    });
    onKeyPress("escape", () => {
      if (paused) { closePause(); return; }
      if (mode === "gameover") { go("hub"); return; }
      if (mode === "dialogue") return;
      if (mode === "word") { backWord(); return; }
      openPause();
    });

    // ---------------------------------------------------------------------
    // Update
    // ---------------------------------------------------------------------
    onUpdate(() => {
      if (paused) return;
      if (dlg.active) dlgUpdate();

      if (iframes > 0) {
        iframes -= dt();
        player.opacity = 0.4 + 0.3 * Math.sin(time() * 32);
      } else if (phaseTime > 0) {
        phaseTime -= dt();
        player.opacity = 0.35;
      } else if (mode !== "seal" && mode !== "gameover") {
        player.opacity = 1;
      }
      if (phaseCd > 0) phaseCd -= dt();
      updatePhaseVisual();

      const canMove = !dlg.active && !paused && (mode === "menu" || mode === "attack");
      if (canMove) {
        let dx = 0;
        let dy = 0;
        if (isKeyDown("a")) dx -= 1;
        if (isKeyDown("d")) dx += 1;
        if (isKeyDown("w")) dy -= 1;
        if (isKeyDown("s")) dy += 1;
        if (mode === "attack") {
          if (isKeyDown("left")) dx -= 1;
          if (isKeyDown("right")) dx += 1;
          if (isKeyDown("up")) dy -= 1;
          if (isKeyDown("down")) dy += 1;
        }
        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy) || 1;
          const speed = 132;
          player.pos.x += (dx / len) * speed * dt();
          player.pos.y += (dy / len) * speed * dt();
          player.pos.x = clamp(player.pos.x, PLAY_MIN_X, PLAY_MAX_X);
          player.pos.y = clamp(player.pos.y, PLAY_MIN_Y, PLAY_MAX_Y);
          if (!moving) {
            moving = true;
            player.play("move");
          }
          player.flipX = dx < 0;
        } else if (moving && mode === "attack") {
          moving = false;
          player.play("idle");
        } else if (moving) {
          moving = false;
          player.play("idle");
        }
      }

      const p = playerCenter();
      playerFloorLight.pos = vec2(p.x, 248);
      playerFloorLight.opacity = 0.04 + 0.018 * Math.sin(time() * 2.1);
      playerShadow.pos = vec2(p.x, 244);
      playerShadow.opacity = 0.55 + 0.05 * Math.sin(time() * 2.4);
      playerGlow.pos = vec2(p.x, p.y + 6);
      playerGlow.opacity = 0.04 + 0.02 * Math.sin(time() * 2.5);
      shieldRing.pos = vec2(p.x, p.y);
      whesper.update(dt(), p, moving);

      // Enemy float
      enemy.pos.y = enemyBase.y + Math.sin(time() * 1.7) * 4;
      bookCover.pos.y = bookBase.y + Math.sin(time() * 1.7 + 0.4) * 4;
      enemyGlow.pos = vec2(478, bookCover.pos.y + 18);

      const safeNow = inSafeZone();
      safeGlow.opacity = safeNow ? 0.28 : 0.14;
      safeGlow.scale = vec2(safeRadius() / 58 * (safeNow ? 1.04 : 1));
      safeRing.opacity = safeNow ? 0.5 : 0.28 + 0.08 * Math.sin(time() * 3);
      safeLabel.pos = vec2(safe.x - 40, safe.y - safeRadius() - 12);
      stillText.pos = vec2(safe.x - 80, safe.y - safeRadius() - 24);

      // Attack script
      if (mode === "attack" && attack && attack.active) {
        attack.t += dt();
        attack.beatT += dt();

        // The shelter burns down while the attack lasts, then refills.
        safeShrink = Math.min(1, attack.t / attack.duration);
        safeRing.radius = safeRadius();

        // Standing still inside the shelter feeds the book's rage.
        if (safeNow) {
          stillT += dt();
          if (stillT > 0.8) {
            stillRageT += dt();
            const interval = 2 / storySpeed;
            if (stillRageT >= interval) {
              stillRageT -= interval;
              rage = Math.min(100, rage + 3);
              refreshHud();
            }
            stillText.opacity = 0.55 + 0.25 * Math.sin(time() * 6);
          }
        } else {
          stillT = 0;
          stillRageT = 0;
          stillText.opacity = Math.max(0, stillText.opacity - dt() * 4);
        }

        const beats = phaseTwo && book.phaseTwoBeats ? book.phaseTwoBeats : book.beats;
        const beatLen = attack.duration / beats.length;
        if (attack.beatT >= beatLen && attack.beatIndex < beats.length - 1) {
          setBeat(attack.beatIndex + 1);
          attack.beatT = 0;
        }
        attack.spawnT -= dt();
        if (attack.spawnT <= 0) {
          const beat = beats[attack.beatIndex % beats.length];
          spawnPattern(beat.pattern);
          attack.spawnT = Math.max(0.26, book.spawnEvery / (enraged ? 1.25 : 1) / storySpeed);
        }
        while (attack.moteAt.length > 0 && attack.t >= attack.moteAt[0]) {
          attack.moteAt.shift();
          spawnMote();
        }
        attackBar.width = Math.max(0, 606 * (1 - attack.t / attack.duration));
        if (attack.t >= attack.duration) {
          endAttack();
        }
      } else {
        stillText.opacity = Math.max(0, stillText.opacity - dt() * 4);
      }

      // Hazards
      for (let i = hazards.length - 1; i >= 0; i -= 1) {
        const h = hazards[i];
        if (!h.obj?.exists?.()) {
          hazards.splice(i, 1);
          continue;
        }
        h.x += h.vx * dt();
        h.y += h.vy * dt();
        h.obj.pos = vec2(h.x, h.y);
        h.ttl -= dt();
        let remove = false;
        if (h.ttl <= 0 || h.x < -80 || h.x > 720 || h.y < -80 || h.y > 320) remove = true;

        if (!remove && !safeNow && iframes <= 0 && phaseTime <= 0) {
          const p2 = playerCenter();
          let hit = false;
          if (h.kind === "projectile" && h.r) {
            hit = Math.hypot(p2.x - h.x, p2.y - h.y) < 10 + h.r;
          } else {
            hit = Math.abs(p2.x - (h.x + h.w / 2)) < 10 + h.w / 2 && Math.abs(p2.y - (h.y + h.h / 2)) < 10 + h.h / 2;
          }
          if (hit) {
            if (h.kind === "zone") {
              if (h.tick <= 0) {
                h.tick = 0.9;
                takeDamage(baseDamage);
              }
            } else {
              takeDamage(baseDamage + (enraged ? 1 : 0));
              remove = true;
            }
          }
        }
        if (h.kind === "zone" && h.tick > 0) h.tick -= dt();
        if (remove) {
          h.obj.destroy();
          hazards.splice(i, 1);
        }
      }

      // Motes
      for (let i = motes.length - 1; i >= 0; i -= 1) {
        const m = motes[i];
        if (!m.glow?.exists?.()) {
          motes.splice(i, 1);
          continue;
        }
        const bobY = m.baseY + Math.sin(time() * 2.2 + m.phase) * 4;
        m.glow.pos.y = bobY;
        m.dot.pos.y = bobY;
        if (m.ring?.exists?.()) {
          m.ring.pos.y = bobY;
          m.ring.opacity = 0.32 + 0.18 * Math.sin(time() * 3 + m.phase);
        }
        m.dot.angle = Math.sin(time() * 1.4 + m.phase) * 8;
        const p2 = playerCenter();
        if (Math.hypot(p2.x - m.glow.pos.x, p2.y - bobY) < 19) {
          calm = Math.min(100, calm + 2);
          refreshHud();
          sfx("sfx_mote", 0.5);
          moteGainFeedback(vec2(m.glow.pos.x, bobY));
          m.glow.destroy();
          m.dot.destroy();
          if (m.ring?.exists?.()) m.ring.destroy();
          motes.splice(i, 1);
        }
      }

      refreshHud();
    });

    // ---------------------------------------------------------------------
    // Start
    // ---------------------------------------------------------------------
    window.__libgaleBattle = {
      get book() { return book.id; },
      get mode() { return mode; },
      get calm() { return calm; },
      get rage() { return rage; },
      get hp() { return hp; },
      get turn() { return turn; },
      get correct() { return correctWritten; },
      get enraged() { return enraged; },
      get phaseTwo() { return phaseTwo; },
      get hazards() { return hazards.length; },
      get menu() { return menuIndex; },
      get motes() { return motes.length; },
      get safeRadius() { return safeRadius(); },
      get stillness() { return stillT; },
    };
    onSceneLeave(() => {
      debug.timeScale = 1;
      delete window.__libgaleBattle;
    });

    refreshHud();
    updateSafeVisual();
    hideMenu();
    hideWord();
    dlgPanel.hidden = true;
    dlgSpeaker.hidden = true;
    dlgBody.hidden = true;
    dlgPrompt.hidden = true;
    dlgShow(
      L(book.intro),
      L(book.title),
      () => {
        startPlayerTurn();
      },
    );
  });
}

