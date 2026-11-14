import { addSprite } from "../core/ui.js";

// World-space library room used by the hub. Every prop is grounded on the
// same floor line (y = 300), so the camera can pan without the "floating
// furniture" problem of the old fixed-screen backdrop.
export function buildHubRoom() {
  // Far fixed background (only visible in the tiny gaps between bookcases).
  add([
    rect(640, 360, { fill: true }),
    pos(0, 0),
    color(rgb(9, 8, 13)),
    z(-140),
    fixed(),
  ]);
  add([
    rect(640, 360, { fill: true }),
    pos(0, 0),
    color(rgb(25, 20, 30)),
    opacity(0.7),
    z(-139),
    fixed(),
  ]);

  // World wall.
  add([
    rect(1280, 300, { fill: true }),
    pos(0, 0),
    color(rgb(37, 28, 30)),
    z(-120),
  ]);
  add([
    rect(1280, 8, { fill: true }),
    pos(0, 292),
    color(rgb(22, 16, 19)),
    z(-119),
  ]);

  // Back-wall bookcases. Each frame, back panel, shelf board and row share
  // the same floor and inner width, so the books never float or overflow.
  const shelfXs = [-80, 100, 540, 1240];
  for (const x of shelfXs) {
    addSprite("bookcase2", x, -20, { zValue: -80 });
    for (let row = 0; row < 5; row += 1) {
      const rowY = 28 + row * 57;
      // recessed dark interior
      add([
        rect(190, 50, { fill: true }),
        pos(x + 15, rowY - 4),
        color(rgb(19, 15, 18)),
        z(-79.8),
      ]);
      // actual shelf board under the books
      add([
        rect(192, 5, { fill: true }),
        pos(x + 14, rowY + 24),
        color(rgb(83, 55, 38)),
        z(-79.5),
      ]);
      add([
        rect(192, 1, { fill: true }),
        pos(x + 14, rowY + 24),
        color(rgb(163, 122, 70)),
        opacity(0.5),
        z(-79.4),
      ]);
      addSprite(row % 2 === 0 ? "row1" : "row2", x + 30, rowY, {
        zValue: -79,
        scaleValue: 0.85,
        opacityValue: 0.86,
        colorValue: rgb(155, 143, 165),
      });
    }
    add([
      rect(221, 8, { fill: true }),
      pos(x, 292),
      color(rgb(30, 22, 24)),
      z(-78),
    ]);
  }

  // A real blank wall section for paintings and the wall clock.
  add([
    rect(321, 300, { fill: true }),
    pos(761, 0),
    color(rgb(32, 24, 27)),
    z(-119),
  ]);
  add([
    rect(321, 8, { fill: true }),
    pos(761, 292),
    color(rgb(22, 16, 19)),
    z(-118),
  ]);

  // Proper night window with baked-in frame, moon and curtains.
  addSprite("window_night", 336, 36, { zValue: -70 });
  // The Eclipse Moon hangs in the top-right pane as its own sprite so it can
  // pulse independently of the glass.
  const moonGlow = add([
    sprite("glow"),
    pos(464, 100),
    anchor("center"),
    color(rgb(150, 162, 232)),
    opacity(0.1),
    scale(0.5),
    z(-69.8),
  ]);
  addSprite("moon_mystic", 464, 100, {
    zValue: -69.5,
    anchorValue: "center",
    scaleValue: 1,
  });
  add([
    sprite("glow"),
    pos(426, 170),
    color(rgb(180, 210, 218)),
    opacity(0.13),
    scale(2.6),
    z(-69),
  ]);
  add([
    rect(190, 30, { fill: true }),
    pos(330, 276),
    color(rgb(160, 190, 205)),
    opacity(0.045),
    z(-38),
  ]);

  // Wall decor: a real wall clock and two paintings on the blank wall.
  addSprite("wall_clock", 950, 64, { zValue: -68 });
  addSprite("painting1", 800, 82, { zValue: -69 });
  addSprite("painting2", 852, 86, { zValue: -69 });
  addSprite("chandelier", 206, -14, { zValue: -66 });

  // Archive door frame and door.
  add([
    rect(148, 150, { radius: 4, fill: true }),
    pos(1082, 150),
    color(rgb(20, 16, 20)),
    z(-74),
  ]);
  addSprite("door_closed", 1092, 168, { zValue: -67, scaleValue: 4 });
  add([
    rect(170, 8, { fill: true }),
    pos(1070, 294),
    color(rgb(46, 34, 34)),
    z(-66),
  ]);

  // Floor and rug.
  add([
    rect(1280, 60, { fill: true }),
    pos(0, 300),
    color(rgb(58, 42, 40)),
    z(-40),
  ]);
  add([
    rect(1280, 3, { fill: true }),
    pos(0, 298),
    color(rgb(214, 178, 104)),
    opacity(0.18),
    z(-39),
  ]);
  add([
    rect(660, 26, { radius: 3, fill: true }),
    pos(310, 300),
    color(rgb(72, 34, 40)),
    opacity(0.32),
    z(-38),
  ]);

  // Dust motes in screen space; they make the air feel alive.
  const dust = [];
  for (let i = 0; i < 32; i += 1) {
    const obj = add([
      sprite("dust"),
      pos(rand(0, 640), rand(0, 350)),
      scale(rand(0.4, 1.2)),
      opacity(rand(0.12, 0.45)),
      z(40),
      fixed(),
    ]);
    dust.push({ obj, x: obj.pos.x, y: obj.pos.y, speed: rand(4, 12), drift: rand(-3, 3), phase: rand(0, 6) });
  }

  add([
    sprite("vignette"),
    pos(0, 0),
    opacity(0.82),
    z(82),
    fixed(),
  ]);

  function update(camX = 320, t = 0) {
    moonGlow.opacity = 0.07 + 0.04 * Math.sin(t * 1.1);
    moonGlow.scale = vec2(0.46 + 0.02 * Math.sin(t * 0.9));
    for (const mote of dust) {
      mote.y -= mote.speed * dt();
      mote.x += Math.sin(t * 0.7 + mote.phase) * mote.drift * dt();
      if (mote.y < -8) {
        mote.y = 366;
        mote.x = rand(0, 640);
      }
      mote.obj.pos = vec2(mote.x, mote.y);
      mote.obj.opacity = 0.14 + 0.26 * (0.5 + 0.5 * Math.sin(t * 1.4 + mote.phase));
    }
  }

  return { update };
}
