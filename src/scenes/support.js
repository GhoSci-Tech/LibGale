import { state, saveState } from "../core/state.js";
import { t, L, setLang, getLang } from "../core/i18n.js";
import { C, addPanel, addSprite, addText, setText } from "../core/ui.js";
import { music, refreshMusicVolume, sfx } from "../core/audio.js";
import { BOOKS, getBook } from "../data/books.js";
import { addLibraryBackdrop } from "./backdrop.js";

function darkBackdrop(alpha = 0.62) {
  const bg = addLibraryBackdrop({ showWindow: true });
  add([
    rect(640, 360),
    pos(0, 0),
    color(rgb(7, 6, 11)),
    opacity(alpha),
    fixed(),
    z(80),
  ]);
  onUpdate(() => bg.update(320, time()));
  return bg;
}

export function registerSupportScenes() {
  scene("settings", (data = {}) => {
    music("ambient_hub", 0.25);
    darkBackdrop(0.68);
    const from = data.from === "hub" ? "hub" : "title";
    let selected = data.selected ?? 0;

    addPanel(68, 34, 504, 292, {
      fill: rgb(20, 16, 24),
      radius: 5,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 94,
      opacityValue: 0.97,
    });
    addText(t("ui.settings"), 0, 48, {
      size: 22,
      width: 640,
      align: "center",
      colorValue: C.goldBright,
      zValue: 96,
    });
    addText(t("ui.settingsHint"), 0, 306, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });

    const items = [
      {
        id: "language",
        label: () => t("ui.language"),
        value: () => (state.lang === "en" ? t("ui.langEnglish") : t("ui.langTurkish")),
        adjust: (dir) => {
          setLang(state.lang === "en" ? "tr" : "en");
          saveState();
          go("settings", { from, selected });
        },
      },
      {
        id: "difficulty",
        label: () => t("ui.difficulty"),
        value: () => (state.difficulty === "story" ? t("ui.story") : t("ui.normal")),
        adjust: () => {
          state.difficulty = state.difficulty === "story" ? "normal" : "story";
          saveState();
          refreshValues();
        },
        help: () => (state.difficulty === "story" ? t("ui.difficultyStory") : t("ui.difficultyNormal")),
      },
      {
        id: "music",
        label: () => t("ui.music"),
        value: () => `${Math.round(state.settings.music * 100)}%`,
        adjust: (dir) => {
          state.settings.music = clamp(Math.round((state.settings.music + dir * 0.1) * 10) / 10, 0, 1);
          refreshMusicVolume();
          saveState();
          refreshValues();
        },
      },
      {
        id: "sfx",
        label: () => t("ui.sfx"),
        value: () => `${Math.round(state.settings.sfx * 100)}%`,
        adjust: (dir) => {
          state.settings.sfx = clamp(Math.round((state.settings.sfx + dir * 0.1) * 10) / 10, 0, 1);
          saveState();
          refreshValues();
          sfx("ui_click", 0.6);
        },
      },
      {
        id: "speed",
        label: () => t("ui.textSpeed"),
        value: () => `${Math.round(state.settings.textSpeed)}`,
        adjust: (dir) => {
          state.settings.textSpeed = clamp(state.settings.textSpeed + dir * 6, 18, 90);
          saveState();
          refreshValues();
        },
      },
      {
        id: "flash",
        label: () => t("ui.reduceFlash"),
        value: () => (state.settings.reduceFlash ? t("ui.on") : t("ui.off")),
        adjust: () => {
          state.settings.reduceFlash = !state.settings.reduceFlash;
          saveState();
          refreshValues();
        },
      },
      { id: "back", label: () => t("ui.back"), value: () => "", adjust: () => goBack() },
    ];

    const labels = [];
    const values = [];
    for (let i = 0; i < items.length; i += 1) {
      labels.push(addText("", 100, 92 + i * 27, {
        size: 11,
        width: 220,
        colorValue: C.pale,
        zValue: 96,
      }));
      values.push(addText("", 330, 92 + i * 27, {
        size: 11,
        width: 200,
        align: "right",
        colorValue: C.gold,
        zValue: 96,
      }));
    }
    const help = addText("", 0, 282, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });

    function refreshValues() {
      for (let i = 0; i < items.length; i += 1) {
        const isSelected = i === selected;
        labels[i].text = `${isSelected ? "›  " : "   "}${items[i].label()}`;
        labels[i].color = isSelected ? C.goldBright : C.pale;
        values[i].text = items[i].value();
        values[i].color = isSelected ? C.goldBright : C.muted;
      }
      const item = items[selected];
      setText(help, item.help ? item.help() : "");
    }
    refreshValues();

    function goBack() {
      sfx("ui_back");
      go(from === "hub" ? "hub" : "title");
    }

    function activate() {
      const item = items[selected];
      if (item.id === "back") {
        goBack();
        return;
      }
      sfx("ui_confirm");
      item.adjust(1);
    }

    onKeyPress("up", () => {
      selected = (selected - 1 + items.length) % items.length;
      sfx("ui_move", 0.4);
      refreshValues();
    });
    onKeyPress("down", () => {
      selected = (selected + 1) % items.length;
      sfx("ui_move", 0.4);
      refreshValues();
    });
    onKeyPress("left", () => {
      const item = items[selected];
      if (!item.adjust || item.id === "back") return;
      sfx("ui_move", 0.4);
      item.adjust(-1);
    });
    onKeyPress("right", () => {
      const item = items[selected];
      if (!item.adjust || item.id === "back") return;
      sfx("ui_move", 0.4);
      item.adjust(1);
    });
    onKeyPress("z", activate);
    onKeyPress("enter", activate);
    onKeyPress("escape", goBack);
  });

  scene("journal", () => {
    music("ambient_hub", 0.3);
    darkBackdrop(0.7);
    addPanel(60, 28, 520, 300, {
      fill: rgb(31, 25, 27),
      radius: 4,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 94,
      opacityValue: 0.97,
    });
    addText(t("ui.journal"), 0, 40, {
      size: 22,
      width: 640,
      align: "center",
      colorValue: C.goldBright,
      zValue: 96,
    });
    addText(t("ui.journalHint"), 0, 316, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });

    const sealedBooks = BOOKS.filter((book) => state.sealed.includes(book.id));
    let selected = 0;
    const entries = [];
    const startY = 82;
    for (let i = 0; i < sealedBooks.length; i += 1) {
      const book = sealedBooks[i];
      const title = addText("", 94, startY + i * 38, {
        size: 13,
        width: 390,
        colorValue: i === 0 ? C.goldBright : C.pale,
        zValue: 96,
      });
      const sub = addText("", 112, startY + i * 38 + 16, {
        size: 9,
        width: 390,
        colorValue: C.muted,
        zValue: 96,
      });
      entries.push({ book, title, sub });
    }

    const unwrittenY = startY + sealedBooks.length * 38;
    if (unwrittenY < 246) {
      addText(`???  ${t("ui.unwrittenName")}`, 94, unwrittenY, {
        size: 13,
        width: 390,
        colorValue: rgb(105, 95, 95),
        zValue: 96,
      });
      addText(t("ui.chapterTwoSoon"), 112, unwrittenY + 16, {
        size: 9,
        width: 390,
        colorValue: rgb(95, 87, 87),
        zValue: 96,
      });
    }

    if (!sealedBooks.length) {
      addText(t("ui.journalEmpty"), 100, 120, {
        size: 11,
        width: 440,
        colorValue: C.muted,
        zValue: 96,
      });
    } else {
      addText(`${state.pages.length}/5 ${t("ui.pages")}  ·  ${state.anlam} ${t("ui.meaningShort")}`, 94, 274, {
        size: 9,
        width: 440,
        colorValue: C.muted,
        zValue: 96,
      });
    }
    if (state.sealed.length >= 3) {
      addText(t("ui.journalFirstThree"), 94, 288, {
        size: 8,
        width: 440,
        colorValue: C.gold,
        zValue: 96,
      });
    }

    function refresh() {
      for (let i = 0; i < entries.length; i += 1) {
        const selectedRow = i === selected;
        entries[i].title.text = `${selectedRow ? "›  " : "   "}${L(entries[i].book.title)}`;
        entries[i].title.color = selectedRow ? C.goldBright : C.pale;
        entries[i].sub.text = L(entries[i].book.subtitle);
      }
    }
    refresh();

    onKeyPress("up", () => {
      if (!entries.length) return;
      selected = (selected - 1 + entries.length) % entries.length;
      sfx("ui_move", 0.4);
      refresh();
    });
    onKeyPress("down", () => {
      if (!entries.length) return;
      selected = (selected + 1) % entries.length;
      sfx("ui_move", 0.4);
      refresh();
    });
    onKeyPress("z", () => {
      if (!entries.length) return;
      sfx("ui_confirm");
      go("summary", { bookId: entries[selected].book.id, from: "journal" });
    });
    onKeyPress("enter", () => {
      if (!entries.length) return;
      sfx("ui_confirm");
      go("summary", { bookId: entries[selected].book.id, from: "journal" });
    });
    onKeyPress("escape", () => { sfx("ui_back"); go("hub"); });
  });

  scene("summary", (data = {}) => {
    debug.timeScale = 1;
    music("ambient_hub", 0.24);
    const book = getBook(data.bookId);
    darkBackdrop(0.74);
    addPanel(52, 24, 536, 310, {
      fill: rgb(33, 27, 25),
      radius: 4,
      outlineWidth: 1,
      outlineColor: C.gold,
      zValue: 94,
      opacityValue: 0.98,
    });
    addSprite(book.rageCover, 78, 42, { zValue: 96, scaleValue: 1 });
    addText(L(book.title), 194, 44, {
      size: 19,
      width: 360,
      colorValue: C.goldBright,
      zValue: 96,
    });
    addText(L(book.subtitle), 194, 68, {
      size: 10,
      width: 360,
      colorValue: C.muted,
      zValue: 96,
    });
    addText(t("ui.bookRestored"), 194, 86, {
      size: 9,
      width: 360,
      colorValue: C.cyan,
      zValue: 96,
    });
    addText(L(book.summary).join("\n\n"), 82, 116, {
      size: 10.5,
      width: 476,
      lineSpacing: 4,
      colorValue: C.pale,
      zValue: 96,
    });
    addText(t("ui.summaryHint"), 0, 300, {
      size: 9,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });
    addText(t("ui.placeOnShelf"), 0, 318, {
      size: 10,
      width: 640,
      align: "center",
      colorValue: C.gold,
      zValue: 96,
    });

    function back() {
      sfx("sfx_page", 0.35);
      if (data.from === "journal") go("journal");
      else go("hub", { justSealed: book.id });
    }
    onKeyPress("z", back);
    onKeyPress("enter", back);
    onKeyPress("escape", back);
  });

  scene("interlude", () => {
    music("ambient_last", 0.4);
    darkBackdrop(0.8);
    addText("LibGale", 0, 36, {
      size: 24,
      width: 640,
      align: "center",
      colorValue: C.goldBright,
      zValue: 96,
    });
    const lines = [t("ui.interlude1"), t("ui.interlude2"), t("ui.interlude3")];
    let index = 0;
    let chars = 0;
    let card = false;
    const body = addText("", 62, 108, {
      size: 14,
      width: 516,
      align: "center",
      lineSpacing: 4,
      colorValue: C.pale,
      zValue: 96,
    });
    const hint = addText(t("ui.showHint"), 0, 326, {
      size: 10,
      width: 640,
      align: "center",
      colorValue: C.muted,
      zValue: 96,
    });

    function start() {
      chars = 0;
      body.text = "";
    }
    start();

    onUpdate(() => {
      if (card) return;
      const full = lines[index] ?? "";
      if (chars < full.length) {
        chars = Math.min(full.length, chars + dt() * state.settings.textSpeed);
        body.text = full.slice(0, Math.floor(chars));
      }
    });

    function advance() {
      if (card) {
        state.interludeSeen = true;
        saveState();
        go("hub");
        return;
      }
      const full = lines[index] ?? "";
      if (chars < full.length) {
        chars = full.length;
        body.text = full;
        return;
      }
      index += 1;
      if (index >= lines.length) {
        card = true;
        body.hidden = true;
        hint.hidden = true;
        state.interludeSeen = true;
        saveState();
        sfx("sfx_door", 0.7);
        addText(t("ui.chapterTwo"), 0, 126, {
          size: 14,
          width: 640,
          align: "center",
          colorValue: C.gold,
          zValue: 96,
        });
        addText(t("ui.chapterTwoName"), 0, 150, {
          size: 28,
          width: 640,
          align: "center",
          colorValue: C.goldBright,
          zValue: 96,
        });
        addText(t("ui.chapterTwoSoon"), 0, 210, {
          size: 11,
          width: 640,
          align: "center",
          colorValue: C.muted,
          zValue: 96,
        });
        addText(t("ui.continueChapter"), 0, 326, {
          size: 10,
          width: 640,
          align: "center",
          colorValue: C.pale,
          zValue: 96,
        });
      } else {
        sfx("sfx_page", 0.3);
        start();
      }
    }

    onKeyPress("z", advance);
    onKeyPress("enter", advance);
    onKeyPress("escape", advance);
  });
}
