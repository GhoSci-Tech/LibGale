import { state, saveState, resetStory } from "../core/state.js";
import { INTRO, L, setLang, t, getLang } from "../core/i18n.js";
import { C, addPanel, addSprite, addText, setText } from "../core/ui.js";
import { music, sfx } from "../core/audio.js";
import { addLibraryBackdrop } from "./backdrop.js";

function addBackdrop() {
  const bg = addLibraryBackdrop({ showWindow: true });
  add([
    rect(640, 360, { fill: true }),
    pos(0, 0),
    color(rgb(8, 7, 12)),
    opacity(0.46),
    fixed(),
    z(70),
  ]);
  onUpdate(() => bg.update(320, time()));
  return bg;
}

function addFloatingGhost(x, y, scaleValue = 1.7) {
  const ghost = add([
    sprite("ghost", { anim: "idle" }),
    pos(x, y),
    scale(scaleValue),
    z(75),
    fixed(),
  ]);
  add([
    sprite("glow"),
    pos(x, y + 8),
    color(rgb(228, 228, 232)),
    opacity(0.06),
    scale(1.7 * scaleValue),
    z(74),
    fixed(),
  ]);
  return ghost;
}

export function registerOnboardingScenes() {
  scene("language", () => {
    addBackdrop();
    addFloatingGhost(540, 210, 1.7);

    addText("LibGale", 0, 74, { size: 44, width: 640, align: "center", colorValue: C.goldBright });
    addText("A Way Of Tale  ·  Hikayenin Bir Yolu", 0, 126, { size: 11, width: 640, align: "center", colorValue: C.muted });

    addText("Choose your language  ·  Dilini seç", 0, 168, { size: 12, width: 640, align: "center", colorValue: C.pale });

    const options = [
      { label: "English", hint: "You can change this later in Settings.", continue: "Z / Enter — Continue" },
      { label: "Türkçe", hint: "Bunu daha sonra Ayarlar'dan değiştirebilirsin.", continue: "Z / Enter — Devam" },
    ];
    let selected = 0;
    const labels = [];
    for (let i = 0; i < options.length; i += 1) {
      const label = addText(options[i].label, 0, 204 + i * 28, {
        size: 18,
        width: 640,
        align: "center",
        colorValue: i === 0 ? C.goldBright : C.muted,
      });
      labels.push(label);
    }
    const hint = addText(options[0].hint, 0, 272, { size: 10, width: 640, align: "center", colorValue: C.muted });
    const continueHint = addText(options[0].continue, 0, 292, { size: 11, width: 640, align: "center", colorValue: C.pale });
    addText("Default: EN  ·  Varsayılan: EN", 0, 318, { size: 10, width: 640, align: "center", colorValue: C.gold });

    function refresh() {
      for (let i = 0; i < labels.length; i += 1) {
        labels[i].color = i === selected ? C.goldBright : C.muted;
        labels[i].text = `${i === selected ? "›  " : "   "}${options[i].label}${i === selected ? "  ‹" : ""}`;
      }
      setText(hint, options[selected].hint);
      setText(continueHint, options[selected].continue);
    }
    refresh();

    onKeyPress("left", () => { selected = 0; sfx("ui_move", 0.5); refresh(); });
    onKeyPress("right", () => { selected = 1; sfx("ui_move", 0.5); refresh(); });
    onKeyPress("up", () => { selected = 0; sfx("ui_move", 0.5); refresh(); });
    onKeyPress("down", () => { selected = 1; sfx("ui_move", 0.5); refresh(); });
    onKeyPress("z", () => confirm());
    onKeyPress("enter", () => confirm());
    function confirm() {
      sfx("ui_confirm");
      setLang(selected === 0 ? "en" : "tr");
      state.lang = getLang();
      saveState();
      go("name");
    }
  });

  scene("name", () => {
    addBackdrop();
    addFloatingGhost(548, 184, 1.45);

    addPanel(92, 56, 456, 226, {
      fill: C.parchment,
      radius: 4,
      outlineWidth: 2,
      outlineColor: C.gold,
      zValue: 90,
    });
    addPanel(102, 66, 436, 206, {
      fill: rgb(238, 228, 205),
      radius: 2,
      outlineWidth: 1,
      outlineColor: rgb(164, 141, 102),
      zValue: 91,
    });

    addText(t("name.title"), 120, 84, {
      size: 14,
      width: 400,
      colorValue: rgb(49, 39, 33),
      zValue: 95,
    });
    addText(t("name.prompt"), 120, 108, {
      size: 10,
      width: 400,
      colorValue: rgb(96, 78, 61),
      zValue: 95,
    });

    let name = "";
    const nameText = addText(t("ui.namePlaceholder"), 136, 144, {
      size: 24,
      colorValue: rgb(150, 136, 116),
      zValue: 96,
    });
    const caret = add([
      rect(2, 24, { fill: true }),
      pos(136, 144),
      color(rgb(49, 39, 33)),
      z(96),
      fixed(),
    ]);
    let caretTime = 0;

    addText(t("ui.defaultName"), 136, 196, {
      size: 10,
      width: 360,
      colorValue: rgb(122, 99, 73),
      zValue: 95,
    });
    addText(t("ui.nameHint"), 136, 216, {
      size: 9,
      width: 360,
      colorValue: rgb(122, 99, 73),
      zValue: 95,
    });
    addText(getLang() === "tr" ? "ESC — Dil seçimine dön" : "ESC — Back to language", 136, 246, {
      size: 8,
      width: 360,
      colorValue: rgb(122, 99, 73),
      zValue: 95,
    });

    function refreshName() {
      const shown = name || t("ui.namePlaceholder");
      setText(nameText, shown);
      nameText.color = name ? rgb(49, 39, 33) : rgb(150, 136, 116);
      caret.pos.x = 136 + Math.max(0, nameText.width ?? 0) + 2;
    }
    refreshName();

    onUpdate(() => {
      caretTime += dt();
      caret.hidden = Math.floor(caretTime * 2) % 2 === 1;
    });

    // Use the DOM key event so Shift/Caps Lock preserve the actual letter
    // case. KAPLAY's charInput is lowercased, which made custom names look
    // like they could never start with a capital letter.
    const onNameKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (typeof event.key !== "string" || event.key.length !== 1) return;
      if (name.length >= 16) return;
      if (!/[\p{L}\p{N} '_-]/u.test(event.key)) return;
      name += event.key;
      sfx("sfx_quill", 0.3);
      refreshName();
      event.preventDefault();
    };
    window.addEventListener("keydown", onNameKey);
    onSceneLeave(() => window.removeEventListener("keydown", onNameKey));

    onKeyPressRepeat("backspace", () => {
      if (!name.length) return;
      name = name.slice(0, -1);
      sfx("ui_back", 0.35);
      refreshName();
    });
    onKeyPress("enter", () => confirm());
    onKeyPress("escape", () => { sfx("ui_back"); go("language"); });

    function confirm() {
      state.name = name.trim() || "Whesper";
      saveState();
      sfx("ui_confirm");
      go("intro");
    }
  });

  scene("intro", () => {
    addBackdrop();
    const ghost = add([
      sprite("ghost", { anim: "idle" }),
      pos(520, 236),
      scale(1.3),
      z(85),
      fixed(),
    ]);
    add([
      rect(640, 360),
      pos(0, 0),
      color(rgb(5, 5, 9)),
      opacity(0.52),
      fixed(),
      z(78),
    ]);
    add([
      rect(566, 204, { radius: 3, fill: true }),
      pos(37, 88),
      color(rgb(8, 7, 12)),
      opacity(0.28),
      z(80),
      fixed(),
    ]);

    const lines = INTRO[getLang()].map((line) => line.replaceAll("{name}", state.name));
    let lineIndex = 0;
    let charIndex = 0;
    let titleCard = false;
    let finished = false;

    const introText = addText("", 42, 116, {
      size: 15,
      width: 556,
      align: "center",
      lineSpacing: 4,
      colorValue: rgb(245, 238, 220),
      zValue: 95,
    });
    const continueHint = addText(t("ui.showHint"), 0, 318, {
      size: 10,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 95,
    });
    const skipHint = addText(t("ui.skip"), 0, 336, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 95,
    });

    function startLine() {
      charIndex = 0;
      introText.text = "";
    }
    startLine();

    onUpdate(() => {
      if (titleCard || finished) return;
      const full = lines[lineIndex] ?? "";
      if (charIndex < full.length) {
        charIndex = Math.min(full.length, charIndex + dt() * state.settings.textSpeed);
        introText.text = full.slice(0, Math.floor(charIndex));
      }
    });

    function showTitleCard() {
      if (titleCard || finished) return;
      titleCard = true;
      introText.hidden = true;
      continueHint.hidden = true;
      skipHint.hidden = true;
      ghost.opacity = 1;
      addText("LibGale", 0, 104, {
        size: 50,
        width: 640,
        align: "center",
        colorValue: C.goldBright,
        zValue: 96,
      });
      addText(t("game.subtitle"), 0, 160, {
        size: 16,
        width: 640,
        align: "center",
        colorValue: C.pale,
        zValue: 96,
      });
      addText(`${t("ui.chapterOne")} · ${t("ui.chapterOneName")}`, 0, 196, {
        size: 9,
        width: 640,
        align: "center",
        colorValue: C.gold,
        zValue: 96,
      });
      addText(t("ui.showHint"), 0, 318, {
        size: 10,
        width: 640,
        align: "center",
        colorValue: C.muted,
        zValue: 96,
      });
      wait(2.6, () => finish());
    }

    function advance() {
      if (finished) return;
      if (titleCard) {
        finish();
        return;
      }
      const full = lines[lineIndex] ?? "";
      if (charIndex < full.length) {
        charIndex = full.length;
        introText.text = full;
        return;
      }
      lineIndex += 1;
      if (lineIndex >= lines.length) {
        showTitleCard();
      } else {
        sfx("sfx_page", 0.35);
        startLine();
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      state.onboarded = true;
      state.started = true;
      saveState();
      go("hub");
    }

    onKeyPress("z", advance);
    onKeyPress("enter", advance);
    onKeyPress("space", advance);
    onKeyPress("escape", () => showTitleCard());

    music("ambient_hub", 0.5);
  });

  scene("title", () => {
    addBackdrop();
    addFloatingGhost(538, 208, 2.1);

    addText("LibGale", 0, 78, {
      size: 50,
      width: 640,
      align: "center",
      colorValue: C.goldBright,
      zValue: 96,
    });
    addText(t("game.subtitle"), 0, 134, {
      size: 16,
      width: 640,
      align: "center",
      colorValue: C.pale,
      zValue: 96,
    });
    addText(t("ui.controls"), 0, 316, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });
    addText(t("ui.version"), 0, 326, {
      size: 8,
      width: 640,
      align: "center",
      colorValue: rgb(108, 100, 100),
      zValue: 96,
    });

    const items = [];
    if (state.started) items.push({ id: "continue", label: t("ui.continue") });
    items.push({ id: "new", label: t("ui.newGame") });
    items.push({ id: "settings", label: t("ui.settings") });
    items.push({ id: "credits", label: t("ui.credits") });

    let selected = 0;
    const labels = [];
    const baseY = 190;
    for (let i = 0; i < items.length; i += 1) {
      labels.push(
        addText(items[i].label, 0, baseY + i * 24, {
          size: 15,
          width: 640,
          align: "center",
          colorValue: i === 0 ? C.goldBright : C.muted,
          zValue: 96,
        }),
      );
    }
    function refresh() {
      for (let i = 0; i < labels.length; i += 1) {
        labels[i].color = i === selected ? C.goldBright : C.muted;
        labels[i].text = `${i === selected ? "›  " : "   "}${items[i].label}${i === selected ? "  ‹" : ""}`;
      }
    }
    refresh();

    onKeyPress("up", () => { selected = (selected - 1 + items.length) % items.length; sfx("ui_move", 0.4); refresh(); });
    onKeyPress("down", () => { selected = (selected + 1) % items.length; sfx("ui_move", 0.4); refresh(); });
    onKeyPress("z", () => choose());
    onKeyPress("enter", () => choose());
    function choose() {
      const item = items[selected];
      sfx("ui_confirm");
      if (item.id === "continue") go("hub");
      if (item.id === "new") {
        resetStory({ keepName: false, keepLanguage: true });
        go("name");
      }
      if (item.id === "settings") go("settings", { from: "title" });
      if (item.id === "credits") go("credits", { from: "title" });
    }
    music("ambient_hub", 0.42);
  });

  scene("credits", (data = {}) => {
    addBackdrop();
    add([
      rect(640, 360),
      pos(0, 0),
      color(rgb(6, 5, 10)),
      opacity(0.72),
      fixed(),
      z(80),
    ]);
    addText(t("ui.creditsTitle"), 0, 38, {
      size: 24,
      width: 640,
      align: "center",
      colorValue: C.goldBright,
      zValue: 96,
    });
    addText(t("ui.creditsBody"), 28, 82, {
      size: 10,
      width: 584,
      align: "center",
      lineSpacing: 3,
      colorValue: C.pale,
      zValue: 96,
    });
    addText(getLang() === "tr" ? "ESC / Z — Geri" : "ESC / Z — Back", 0, 332, {
      size: 10,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });
    const back = () => {
      sfx("ui_back");
      go(data.from === "hub" ? "hub" : "title");
    };
    onKeyPress("escape", back);
    onKeyPress("z", back);
    music("ambient_hub", 0.3);
  });
}
