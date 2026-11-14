import { state } from "./state.js";

let currentMusic = null;
let currentName = null;

export function music(name, volume = 0.5) {
  if (currentName === name && currentMusic) {
    return;
  }
  stopMusic();
  currentName = name;
  try {
    currentMusic = play(name, {
      loop: true,
      volume: volume * state.settings.music,
    });
  } catch (error) {
    console.warn("Music could not start:", name, error);
  }
}

export function stopMusic() {
  if (currentMusic) {
    try {
      currentMusic.stop();
    } catch {
      // ignore
    }
  }
  currentMusic = null;
  currentName = null;
}

export function refreshMusicVolume() {
  if (currentMusic) {
    try {
      currentMusic.volume = 0.5 * state.settings.music;
    } catch {
      // ignore
    }
  }
}

export function sfx(name, volume = 0.8) {
  try {
    play(name, { volume: volume * state.settings.sfx });
  } catch (error) {
    console.warn("SFX could not play:", name, error);
  }
}
