// Whesper's presence effect. Three quiet layers keep the player from reading
// as a mouse cursor without turning the screen into a firework:
//
//   1. a soft, breathing aura behind the body,
//   2. black/white ash that drifts up around the hem,
//   3. short afterimages while moving.
//
// Shift Faz additionally tears a few short page/letter shards out of the air
// for a quarter of a second. That burst is opt-in (battle only) so the hub
// stays calm.

export function createWhesperFx(player) {
  const ash = [];
  const particles = [];
  const ghosts = [];
  let ashT = 0;
  let ghostT = 0;

  const aura = add([
    sprite("glow"),
    pos(player.pos.x + 20, player.pos.y + 30),
    anchor("center"),
    color(rgb(222, 226, 236)),
    opacity(0.05),
    scale(0.42),
    z(player.z - 1),
  ]);

  const halo = add([
    circle(9, { fill: false }),
    pos(player.pos.x + 20, player.pos.y + 30),
    color(rgb(226, 230, 240)),
    opacity(0.1),
    outline(1, rgb(226, 230, 240)),
    z(player.z - 1),
  ]);

  function spawnAsh() {
    const white = Math.random() < 0.72;
    const dot = add([
      rect(1, 1, { fill: true }),
      pos(0, 0),
      color(white ? rgb(240, 240, 246) : rgb(132, 132, 148)),
      opacity(0),
      z(player.z + 1),
    ]);
    ash.push({
      obj: dot,
      ang: Math.random() * Math.PI * 2,
      rad: 13 + Math.random() * 12,
      rise: 3 + Math.random() * 5,
      life: 1.2 + Math.random() * 1.4,
      age: Math.random() * 1.2,
      spin: (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.8),
      white,
    });
  }

  for (let i = 0; i < 8; i += 1) spawnAsh();

  function spawnGhost() {
    if (!player.exists()) return;
    const ghost = add([
      sprite("ghost", { frame: 0 }),
      pos(player.pos.x, player.pos.y),
      scale(player.scale.x, player.scale.y),
      color(rgb(176, 180, 190)),
      opacity(0.2),
      z(player.z - 1),
    ]);
    ghost.flipX = Boolean(player.flipX);
    ghosts.push({ obj: ghost, life: 0.26, max: 0.26 });
    if (ghosts.length > 4) {
      const old = ghosts.shift();
      if (old.obj?.exists?.()) old.obj.destroy();
    }
  }

  function shard(center, kind) {
    const angle = Math.random() * Math.PI * 2;
    const speed = kind === "glyph" ? 46 + Math.random() * 40 : 30 + Math.random() * 44;
    const obj =
      kind === "glyph"
        ? add([
            sprite("glyph", { frame: Math.floor(Math.random() * 4) }),
            pos(center.x, center.y),
            anchor("center"),
            scale(0.9),
            color(rgb(232, 236, 255)),
            opacity(0.95),
            z(60),
          ])
        : add([
            sprite("page_particle"),
            pos(center.x, center.y),
            anchor("center"),
            scale(0.55),
            color(rgb(238, 234, 224)),
            opacity(0.9),
            z(60),
          ]);
    particles.push({
      obj,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 12,
      spin: (Math.random() - 0.5) * 220,
      life: kind === "glyph" ? 0.42 : 0.62,
      max: kind === "glyph" ? 0.42 : 0.62,
      gravity: kind === "glyph" ? 0 : 26,
      kind,
    });
  }

  function tear(center) {
    for (let i = 0; i < 4; i += 1) {
      const height = 18 + Math.random() * 26;
      const obj = add([
        rect(1, height, { fill: true }),
        pos(center.x + (Math.random() - 0.5) * 26, center.y - height / 2 + (Math.random() - 0.5) * 26),
        color(rgb(236, 238, 252)),
        opacity(0.75),
        z(61),
      ]);
      particles.push({
        obj,
        vx: (Math.random() - 0.5) * 10,
        vy: -18,
        spin: 0,
        life: 0.16 + Math.random() * 0.08,
        max: 0.24,
        gravity: 0,
        kind: "tear",
      });
    }
  }

  return {
    // center: the player's visual centre in world space.
    update(dt, center, moving) {
      aura.pos = vec2(center.x, center.y + 8);
      aura.opacity = 0.045 + 0.018 * Math.sin(time() * 2.3);
      aura.scale = vec2(0.4 + 0.03 * Math.sin(time() * 1.7));
      halo.pos = vec2(center.x, center.y + 8);
      halo.opacity = 0.07 + 0.04 * Math.sin(time() * 1.9);

      ashT += dt;
      if (ashT > 1.7) {
        ashT = 0;
        if (ash.length < 12) spawnAsh();
      }
      for (let i = ash.length - 1; i >= 0; i -= 1) {
        const a = ash[i];
        a.age += dt;
        a.ang += a.spin * dt;
        if (a.age >= a.life || !a.obj?.exists?.()) {
          if (a.obj?.exists?.()) a.obj.destroy();
          ash.splice(i, 1);
          if (ash.length < 8) spawnAsh();
          continue;
        }
        const t = a.age / a.life;
        const rad = a.rad * (1 - t * 0.35);
        a.obj.pos = vec2(
          center.x + Math.cos(a.ang) * rad,
          center.y + 10 + Math.sin(a.ang) * rad * 0.7 - a.rise * a.age,
        );
        a.obj.opacity = Math.sin(t * Math.PI) * (a.white ? 0.75 : 0.45);
      }

      if (moving) {
        ghostT += dt;
        if (ghostT > 0.085) {
          ghostT = 0;
          spawnGhost();
        }
      } else {
        ghostT = 0;
      }
      for (let i = ghosts.length - 1; i >= 0; i -= 1) {
        const g = ghosts[i];
        g.life -= dt;
        if (g.life <= 0 || !g.obj?.exists?.()) {
          if (g.obj?.exists?.()) g.obj.destroy();
          ghosts.splice(i, 1);
          continue;
        }
        g.obj.opacity = 0.2 * (g.life / g.max);
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0 || !p.obj?.exists?.()) {
          if (p.obj?.exists?.()) p.obj.destroy();
          particles.splice(i, 1);
          continue;
        }
        p.vy += p.gravity * dt;
        p.obj.pos.x += p.vx * dt;
        p.obj.pos.y += p.vy * dt;
        if (p.spin) p.obj.angle += p.spin * dt;
        p.obj.opacity = Math.max(0, p.life / p.max);
      }
    },

    // Reality tearing: Shift Faz only.
    burst(center) {
      tear(center);
      for (let i = 0; i < 9; i += 1) shard(center, "page");
      for (let i = 0; i < 7; i += 1) shard(center, "glyph");
    },

    destroy() {
      for (const a of ash) if (a.obj?.exists?.()) a.obj.destroy();
      for (const g of ghosts) if (g.obj?.exists?.()) g.obj.destroy();
      for (const p of particles) if (p.obj?.exists?.()) p.obj.destroy();
      if (aura.exists()) aura.destroy();
      if (halo.exists()) halo.destroy();
    },
  };
}
