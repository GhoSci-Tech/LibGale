import { C, addPanel, addText, setText } from "./ui.js";
import { state } from "./state.js";
import { t } from "./i18n.js";
import { sfx } from "./audio.js";

// A small fixed-position dialogue box used by the hub and the interlude.
// Battle uses its own layout, but the typing model is the same.
export function createDialogueBox({ x = 16, y = 274, w = 608, h = 74 } = {}) {
  const panel = addPanel(x, y, w, h, {
    fill: rgb(22, 18, 25),
    radius: 4,
    outlineWidth: 1,
    outlineColor: C.gold,
    zValue: 120,
  });
  panel.opacity = 0.97;
  const speaker = addText("", x + 12, y + 7, {
    size: 9,
    colorValue: C.gold,
    zValue: 122,
  });
  const body = addText("", x + 12, y + 21, {
    size: 11,
    width: w - 24,
    lineSpacing: 2,
    colorValue: C.pale,
    zValue: 122,
  });
  const prompt = addText("Z ▶", x + w - 34, y + h - 16, {
    size: 9,
    colorValue: C.muted,
    zValue: 122,
  });
  const line = add([
    rect(w - 24, 1),
    pos(x + 12, y + 17),
    color(C.gold),
    opacity(0.25),
    z(121),
    fixed(),
  ]);

  let active = false;
  let lines = [];
  let lineIndex = 0;
  let chars = 0;
  let onDone = null;
  let speed = state.settings.textSpeed;

  function setVisible(value) {
    panel.hidden = !value;
    speaker.hidden = !value;
    body.hidden = !value;
    prompt.hidden = !value;
    line.hidden = !value;
  }
  setVisible(false);

  function show(nextLines, opts = {}) {
    lines = (Array.isArray(nextLines) ? nextLines : [nextLines]).filter(Boolean);
    if (!lines.length) {
      opts.onDone?.();
      return;
    }
    active = true;
    lineIndex = 0;
    chars = 0;
    onDone = opts.onDone ?? null;
    speed = opts.speed ?? state.settings.textSpeed;
    setText(speaker, opts.speaker ?? "");
    setText(body, "");
    setVisible(true);
  }

  function finishLine() {
    if (!active) return;
    const text = lines[lineIndex] ?? "";
    chars = text.length;
    setText(body, text);
  }

  function advance() {
    if (!active) return;
    const text = lines[lineIndex] ?? "";
    if (chars < text.length) {
      finishLine();
      return;
    }
    lineIndex += 1;
    if (lineIndex >= lines.length) {
      hide();
      const done = onDone;
      onDone = null;
      done?.();
      return;
    }
    chars = 0;
    setText(body, "");
    sfx("sfx_page", 0.22);
  }

  function hide() {
    active = false;
    setVisible(false);
    setText(body, "");
  }

  function update() {
    if (!active) return;
    const text = lines[lineIndex] ?? "";
    if (chars < text.length) {
      chars = Math.min(text.length, chars + dt() * speed);
      setText(body, text.slice(0, Math.floor(chars)));
    }
  }

  return {
    show,
    advance,
    hide,
    update,
    isOpen: () => active,
    get active() { return active; },
    destroy() {
      panel.destroy();
      speaker.destroy();
      body.destroy();
      prompt.destroy();
      line.destroy();
    },
  };
}
