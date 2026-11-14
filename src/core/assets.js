// Every sprite and sound the game uses is declared here. Keeping the list in
// one place makes missing-asset bugs obvious and makes new books easy to add.
export function loadAssets() {
  // --- fonts --------------------------------------------------------------
  loadFont("pixel", "assets/fonts/PixelifySans.ttf");

  // --- original character -------------------------------------------------
  loadSprite("ghost_shadow", "assets/chars/ghost_shadow.png");
  loadSprite("creature", "assets/chars/creature.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 3 } },
  });
  loadSprite("reader_chair", "assets/chars/reader_chair.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 2.2 } },
  });
  loadSprite("ghost", "assets/chars/ghost.png", {
    sliceX: 15,
    anims: {
      idle: { from: 0, to: 5, loop: true, speed: 6 },
      move: { from: 6, to: 9, loop: true, speed: 10 },
      cast: { from: 10, to: 13, loop: true, speed: 8 },
      hurt: 14,
    },
  });
  // --- 0x72 DungeonTileset II (CC0) ---------------------------------------
  loadSprite("imp_idle", "assets/characters/imp_idle.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 7 } },
  });
  loadSprite("imp_run", "assets/characters/imp_run.png", {
    sliceX: 4,
    anims: { run: { from: 0, to: 3, loop: true, speed: 10 } },
  });
  loadSprite("necro_idle", "assets/characters/necro_idle.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 6 } },
  });
  loadSprite("necro_run", "assets/characters/necro_run.png", {
    sliceX: 4,
    anims: { run: { from: 0, to: 3, loop: true, speed: 9 } },
  });
  loadSprite("demon_idle", "assets/characters/demon_idle.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 6 } },
  });
  loadSprite("demon_run", "assets/characters/demon_run.png", {
    sliceX: 4,
    anims: { run: { from: 0, to: 3, loop: true, speed: 9 } },
  });
  loadSprite("chort_idle", "assets/characters/chort_idle.png", {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true, speed: 7 } },
  });
  loadSprite("chort_run", "assets/characters/chort_run.png", {
    sliceX: 4,
    anims: { run: { from: 0, to: 3, loop: true, speed: 10 } },
  });
  loadSprite("heart_full", "assets/ui/heart_full.png");
  loadSprite("heart_half", "assets/ui/heart_half.png");
  loadSprite("heart_empty", "assets/ui/heart_empty.png");
  loadSprite("door_closed", "assets/ui/door_closed.png");
  loadSprite("door_open", "assets/ui/door_open.png");
  loadSprite("coin", "assets/ui/coin.png", {
    sliceX: 3,
    anims: { spin: { from: 0, to: 2, loop: true, speed: 8 } },
  });

  // --- library ------------------------------------------------------------
  loadSprite("loop1", "assets/library/bg/loop1.png");
  loadSprite("loop2", "assets/library/bg/loop2.png");
  loadSprite("window", "assets/library/bg/window.png");
  loadSprite("bg_door", "assets/library/bg/door.png");
  loadSprite("wall", "assets/library/bg/wall.png");

  loadSprite("bookcase1", "assets/library/props/bookcase1.png");
  loadSprite("bookcase2", "assets/library/props/bookcase2.png");
  loadSprite("bookcase3", "assets/library/props/bookcase3.png");
  loadSprite("curtain1", "assets/library/props/curtain1.png");
  loadSprite("curtain2", "assets/library/props/curtain2.png");
  loadSprite("curtain3", "assets/library/props/curtain3.png");
  loadSprite("stairs1", "assets/library/props/stairs1.png");
  loadSprite("upstair3", "assets/library/props/upstair3.png");
  loadSprite("spiral", "assets/library/props/spiral.png");
  loadSprite("railing", "assets/library/props/railing.png");
  loadSprite("platform", "assets/library/props/platform.png");
  loadSprite("tower", "assets/library/props/tower.png");
  loadSprite("chandelier", "assets/library/props/chandelier.png");
  loadSprite("plant1", "assets/library/props/plant1.png");
  loadSprite("plant2", "assets/library/props/plant2.png");
  loadSprite("desk", "assets/library/props/desk.png");
  loadSprite("bench", "assets/library/props/bench.png");
  loadSprite("chair", "assets/library/props/chair.png");
  loadSprite("ladder", "assets/library/props/ladder.png");
  loadSprite("coatrack", "assets/library/props/coatrack.png");
  loadSprite("clock", "assets/library/props/clock.png");
  loadSprite("painting1", "assets/library/props/painting1.png");
  loadSprite("painting2", "assets/library/props/painting2.png");
  loadSprite("painting3", "assets/library/props/painting3.png");


  loadSprite("row1", "assets/library/books/row1.png");
  loadSprite("row2", "assets/library/books/row2.png");
  loadSprite("bookrow_back", "assets/library/books/back.png");
  loadSprite("bookrow_front", "assets/library/books/front.png");
  for (let i = 1; i <= 12; i += 1) {
    loadSprite(`book${String(i).padStart(2, "0")}`, `assets/library/books/book${String(i).padStart(2, "0")}.png`);
  }

  loadSprite("tile1", "assets/library/tiles/tile1.png");
  loadSprite("tile8", "assets/library/tiles/tile8.png");
  loadSprite("tile9", "assets/library/tiles/tile9.png");
  loadSprite("tile10", "assets/library/tiles/tile10.png");
  loadSprite("tile11", "assets/library/tiles/tile11.png");

  // --- custom FX / props --------------------------------------------------
  loadSprite("glow", "assets/fx/glow.png");
  loadSprite("vignette", "assets/fx/vignette.png");
  loadSprite("dust", "assets/fx/dust.png");
  loadSprite("page_particle", "assets/fx/page.png");
  loadSprite("glyph", "assets/fx/glyph.png", { sliceX: 4 });
  loadSprite("paper", "assets/fx/paper.png");
  loadSprite("ragebook_ashen", "assets/props/ragebook_ashen.png");
  loadSprite("ragebook_poem", "assets/props/ragebook_poem.png");
  loadSprite("ragebook_last", "assets/props/ragebook_last.png");
  loadSprite("ragebook_ashen_small", "assets/props/ragebook_ashen_small.png");
  loadSprite("ragebook_poem_small", "assets/props/ragebook_poem_small.png");
  loadSprite("ragebook_last_small", "assets/props/ragebook_last_small.png");
  loadSprite("lectern", "assets/props/lectern.png");
  loadSprite("wall_clock", "assets/props/wall_clock.png");
  loadSprite("seal", "assets/props/seal.png");
  loadSprite("window_night", "assets/props/window_night.png");
  loadSprite("house", "assets/props/house.png");
  loadSprite("well", "assets/props/well.png");
  loadSprite("moon_mystic", "assets/props/moon_mystic.png");
  loadSprite("moon", "assets/props/moon.png");
  loadSprite("tower_prop", "assets/props/tower.png");
  loadSprite("pillar", "assets/props/pillar.png");
  loadSprite("pagewall_prop", "assets/props/pagewall.png");
  loadSprite("inkblot", "assets/props/inkblot.png");

  // --- audio --------------------------------------------------------------
  loadSound("ambient_hub", "assets/audio/ambient_hub.wav");
  loadSound("ambient_ashen", "assets/audio/ambient_ashen.wav");
  loadSound("ambient_poem", "assets/audio/ambient_poem.wav");
  loadSound("ambient_last", "assets/audio/ambient_last.wav");
  loadSound("sfx_page", "assets/audio/page.wav");
  loadSound("sfx_quill", "assets/audio/quill.wav");
  loadSound("sfx_hit", "assets/audio/hit.wav");
  loadSound("sfx_heal", "assets/audio/heal.wav");
  loadSound("sfx_seal", "assets/audio/seal.wav");
  loadSound("sfx_rage", "assets/audio/rage.wav");
  loadSound("sfx_phase", "assets/audio/phase.wav");
  loadSound("sfx_door", "assets/audio/door.wav");
  loadSound("sfx_gameover", "assets/audio/gameover.wav");
  loadSound("sfx_whisper", "assets/audio/whisper.wav");
  loadSound("sfx_mote", "assets/audio/mote.wav");
  loadSound("sfx_breath", "assets/audio/breath.wav");
  loadSound("ui_click", "assets/audio/kenney_click1.wav");
  loadSound("ui_move", "assets/audio/kenney_rollover1.wav");
  loadSound("ui_confirm", "assets/audio/kenney_switch1.wav");
  loadSound("ui_back", "assets/audio/kenney_switch2.wav");
}
