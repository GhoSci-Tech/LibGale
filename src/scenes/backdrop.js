import { C } from "../core/ui.js";

// A hand-composed library wall used by the title and the hub. It is drawn in
// screen space (fixed) and moved manually, which gives us full control over
// the parallax layers without fighting the camera.
export function addLibraryBackdrop({ dustCount = 34, showWindow = true } = {}) {
  const farTiles = [];
  for (let i = -1; i <= 4; i += 1) {
    farTiles.push(
      add([
        sprite("loop1"),
        pos(i * 256, 0),
        color(rgb(116, 132, 148)),
        opacity(0.52),
        z(-95),
        fixed(),
      ]),
    );
  }
  add([
    rect(640, 360, { fill: true }),
    pos(0, 0),
    color(rgb(12, 10, 18)),
    opacity(0.44),
    z(-94),
    fixed(),
  ]);

  // Mid-ground: alternating bookcases with rows of books.
  const shelves = [];
  const bases = [-180, 100, 380, 700, 980, 1260];
  for (const base of bases) {
    const shelf = add([
      sprite("bookcase2"),
      pos(base, 0),
      opacity(0.82),
      color(rgb(150, 135, 150)),
      z(-72),
      fixed(),
    ]);
    shelves.push({ obj: shelf, base, factor: 0.3 });
    for (let row = 0; row < 5; row += 1) {
      const books = add([
        sprite(row % 2 === 0 ? "row1" : "row2"),
        pos(base + 21, 28 + row * 57),
        opacity(0.78),
        color(rgb(145, 135, 165)),
        z(-71),
        fixed(),
      ]);
      shelves.push({ obj: books, base: base + 21, factor: 0.3 });
    }
  }
  add([
    rect(640, 360, { fill: true }),
    pos(0, 0),
    color(rgb(8, 6, 12)),
    opacity(0.24),
    z(-45),
    fixed(),
  ]);

  // Window, curtains, chandelier, paintings.
  const decor = [];
  if (showWindow) {
    decor.push({ obj: add([sprite("window"), pos(398, 4), opacity(0.82), z(-80), fixed()]), base: 398, factor: 0.18 });
    decor.push({ obj: add([sprite("curtain1"), pos(372, 0), opacity(0.94), z(-79), fixed()]), base: 372, factor: 0.18 });
    decor.push({ obj: add([sprite("curtain3"), pos(620, 0), opacity(0.94), z(-79), fixed()]), base: 620, factor: 0.18 });
  }
  add([sprite("glow"), pos(456, 20), color(rgb(150, 210, 220)), opacity(0.12), scale(2.4), z(-78), fixed()]);
  decor.push({ obj: add([sprite("chandelier"), pos(176, -8), z(-66), fixed()]), base: 176, factor: 0.12 });
  decor.push({ obj: add([sprite("clock"), pos(844, 238), z(-65), fixed()]), base: 844, factor: 0.22 });
  decor.push({ obj: add([sprite("painting1"), pos(790, 92), z(-67), fixed()]), base: 790, factor: 0.2 });
  decor.push({ obj: add([sprite("painting2"), pos(872, 96), z(-67), fixed()]), base: 872, factor: 0.2 });
  decor.push({ obj: add([sprite("painting3"), pos(940, 92), z(-67), fixed()]), base: 940, factor: 0.2 });
  decor.push({ obj: add([sprite("plant1"), pos(642, 286), z(-64), fixed()]), base: 642, factor: 0.26 });
  decor.push({ obj: add([sprite("plant2"), pos(250, 286), z(-64), fixed()]), base: 250, factor: 0.26 });
  decor.push({ obj: add([sprite("spiral"), pos(-84, -218), opacity(0.7), z(-73), fixed()]), base: -84, factor: 0.1 });

  // Floor.
  add([
    rect(640, 58, { fill: true }),
    pos(0, 318),
    color(rgb(30, 23, 28)),
    z(-40),
    fixed(),
  ]);
  add([
    rect(640, 2, { fill: true }),
    pos(0, 317),
    color(C.gold),
    opacity(0.18),
    z(-39),
    fixed(),
  ]);

  // Dust motes.
  const dust = [];
  for (let i = 0; i < dustCount; i += 1) {
    const particle = add([
      sprite("dust"),
      pos(rand(0, 640), rand(0, 350)),
      scale(rand(0.5, 1.2)),
      opacity(rand(0.15, 0.55)),
      z(40),
      fixed(),
    ]);
    dust.push({
      obj: particle,
      x: particle.pos.x,
      y: particle.pos.y,
      speed: rand(4, 13),
      drift: rand(-4, 4),
      phase: rand(0, Math.PI * 2),
    });
  }

  add([
    sprite("vignette"),
    pos(0, 0),
    opacity(0.86),
    z(82),
    fixed(),
  ]);

  function wrap(value, min, max) {
    const span = max - min;
    let v = value;
    while (v < min) v += span;
    while (v > max) v -= span;
    return v;
  }

  function update(camX = 320, time = 0) {
    for (let i = 0; i < farTiles.length; i += 1) {
      farTiles[i].pos.x = -256 + i * 256 - ((camX * 0.08) % 256);
    }
    for (const item of shelves) {
      item.obj.pos.x = wrap(item.base - camX * item.factor, -400, 1320);
    }
    for (const item of decor) {
      item.obj.pos.x = item.base - camX * item.factor;
    }
    for (const mote of dust) {
      mote.y -= mote.speed * dt();
      mote.x += Math.sin(time * 0.7 + mote.phase) * mote.drift * dt();
      if (mote.y < -8) {
        mote.y = 366;
        mote.x = rand(0, 640);
      }
      mote.obj.pos = vec2(mote.x, mote.y);
      mote.obj.opacity = 0.18 + 0.3 * (0.5 + 0.5 * Math.sin(time * 1.5 + mote.phase));
    }
  }

  return { update, farTiles, shelves, decor, dust };
}
