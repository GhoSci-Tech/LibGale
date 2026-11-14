// UI helpers. Colours are lazy getters because KAPLAY's globals only exist
// after kaplay() has been called in main.js.
export const C = {
  get ink() { return rgb(10, 8, 14); },
  get inkSoft() { return rgb(18, 14, 23); },
  get panel() { return rgb(27, 22, 30); },
  get panelLight() { return rgb(43, 35, 43); },
  get parchment() { return rgb(226, 214, 187); },
  get pale() { return rgb(236, 228, 210); },
  get muted() { return rgb(160, 150, 138); },
  get gold() { return rgb(214, 178, 104); },
  get goldBright() { return rgb(255, 222, 152); },
  get cyan() { return rgb(127, 231, 224); },
  get red() { return rgb(226, 112, 112); },
  get green() { return rgb(143, 214, 164); },
  get purple() { return rgb(183, 156, 230); },
  get amber() { return rgb(232, 161, 84); },
  get black() { return rgb(0, 0, 0); },
  get white() { return rgb(255, 255, 255); },
};

export function addText(str, x, y, opts = {}) {
  const {
    size = 11,
    width,
    align = "left",
    colorValue = C.pale,
    zValue = 102,
    isFixed = true,
    lineSpacing = 1,
    opacityValue,
    font = "pixel",
    shadow = false,
    minSize = 9,
  } = opts;
  const fontSize = Math.max(minSize, size);
  let shadowObj = null;
  if (shadow) {
    const shadowComps = [
      text(str, { size: fontSize, width, align, font, lineSpacing }),
      pos(x + 1, y + 1),
      color(rgb(0, 0, 0)),
      opacity(0.58),
      z(zValue - 1),
    ];
    if (isFixed) shadowComps.push(fixed());
    shadowObj = add(shadowComps);
  }
  const comps = [
    text(str, { size: fontSize, width, align, font, lineSpacing }),
    pos(x, y),
    color(colorValue),
    z(zValue),
  ];
  if (isFixed) comps.push(fixed());
  if (opacityValue !== undefined) comps.push(opacity(opacityValue));
  const obj = add(comps);
  if (shadowObj) {
    obj._shadow = shadowObj;
    obj._shadowText = str;
  }
  return obj;
}

export function addPanel(x, y, w, h, opts = {}) {
  const {
    fill = C.panel,
    radius = 4,
    outlineWidth = 0,
    outlineColor = C.gold,
    zValue = 100,
    opacityValue = 1,
    isFixed = true,
  } = opts;
  const comps = [
    rect(w, h, { radius, fill: true }),
    pos(x, y),
    color(fill),
    opacity(opacityValue),
    z(zValue),
  ];
  if (isFixed) comps.push(fixed());
  if (outlineWidth > 0) {
    comps.push(outline(outlineWidth, outlineColor));
  }
  return add(comps);
}

export function addSprite(name, x, y, opts = {}) {
  const {
    zValue = 1,
    isFixed = false,
    scaleValue = 1,
    opacityValue = 1,
    colorValue,
    anchorValue,
  } = opts;
  const comps = [
    sprite(name),
    pos(x, y),
    scale(scaleValue),
    opacity(opacityValue),
    z(zValue),
  ];
  if (isFixed) comps.push(fixed());
  if (colorValue) comps.push(color(colorValue));
  if (anchorValue) comps.push(anchor(anchorValue));
  return add(comps);
}

export function setText(obj, value) {
  if (!obj) return;
  if (obj.text !== value) obj.text = value;
  if (obj._shadow && obj._shadow.text !== value) {
    obj._shadow.text = value;
  }
}

export function addBar(x, y, w, h, fillColor, opts = {}) {
  const bg = addPanel(x, y, w, h, {
    fill: opts.bg ?? C.inkSoft,
    radius: 2,
    zValue: opts.z ?? 101,
    isFixed: true,
  });
  const fill = add([
    rect(w - 2, h - 2, { radius: 1, fill: true }),
    pos(x + 1, y + 1),
    color(fillColor),
    z((opts.z ?? 101) + 1),
    fixed(),
  ]);
  const api = {
    bg,
    fill,
    set(value, max = 100) {
      const pct = Math.max(0, Math.min(1, value / (max || 1)));
      fill.width = Math.max(0, (w - 2) * pct);
    },
    setColor(colorValue) {
      fill.color = colorValue;
    },
    hide() {
      bg.hidden = true;
      fill.hidden = true;
    },
    show() {
      bg.hidden = false;
      fill.hidden = false;
    },
  };
  return api;
}

export function addHearts(x, y, maxHp) {
  const hearts = [];
  const count = 15;
  for (let i = 0; i < count; i += 1) {
    const heart = add([
      sprite("heart_full"),
      pos(x + i * 14, y),
      scale(0.8),
      z(103),
      fixed(),
    ]);
    heart.hidden = true;
    hearts.push(heart);
  }
  return {
    hearts,
    update(hp, currentMax = maxHp) {
      const shown = Math.ceil(currentMax / 2);
      for (let i = 0; i < hearts.length; i += 1) {
        const heart = hearts[i];
        heart.hidden = i >= shown;
        if (heart.hidden) continue;
        const remainder = hp - i * 2;
        if (remainder >= 2) heart.sprite = "heart_full";
        else if (remainder === 1) heart.sprite = "heart_half";
        else heart.sprite = "heart_empty";
      }
    },
  };
}

export function addCaret(x, y, opts = {}) {
  const caret = add([
    rect(2, opts.height ?? 14, { fill: true }),
    pos(x, y),
    color(opts.colorValue ?? C.gold),
    z(opts.z ?? 103),
  ]);
  if (opts.isFixed !== false) caret.use(fixed());
  let timer = 0;
  onUpdate(() => {
    timer += dt();
    caret.hidden = Math.floor(timer * 2) % 2 === 1;
  });
  return caret;
}

export function clearChildren(obj) {
  if (!obj) return;
  for (const child of [...obj.children]) child.destroy();
}

export function screenFade(colorValue = C.black, duration = 0.35, onDone) {
  const overlay = add([
    rect(width(), height()),
    pos(0, 0),
    color(colorValue),
    opacity(0),
    fixed(),
    z(300),
  ]);
  tween(0, 1, duration, (v) => { overlay.opacity = v; }, easings.easeInQuad).onEnd(() => {
    onDone?.();
    tween(1, 0, duration, (v) => { overlay.opacity = v; }, easings.easeOutQuad).onEnd(() => overlay.destroy());
  });
  return overlay;
}

export function drawPanelText(label, value, x, y, opts = {}) {
  const l = addText(label, x, y, { size: opts.size ?? 8, colorValue: opts.labelColor ?? C.muted, zValue: opts.z ?? 103 });
  const v = addText(value, x, y + (opts.gap ?? 10), { size: opts.valueSize ?? 11, colorValue: opts.valueColor ?? C.pale, zValue: opts.z ?? 103 });
  return { label: l, value: v };
}
