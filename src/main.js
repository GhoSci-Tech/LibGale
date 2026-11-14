import kaplay from "kaplay";
import { loadAssets } from "./core/assets.js";
import { loadState, state } from "./core/state.js";
import { setLang } from "./core/i18n.js";
import { registerOnboardingScenes } from "./scenes/onboarding.js";
import { registerHubScene } from "./scenes/hub.js";
import { registerBattleScene } from "./scenes/battle.js";
import { registerSupportScenes } from "./scenes/support.js";

kaplay({
  width: 640,
  height: 360,
  letterbox: true,
  background: [10, 8, 14],
  crisp: true,
  pixelDensity: 2,
  debug: false,
  root: document.getElementById("app"),
});

setGravity(0);
loadAssets();

registerOnboardingScenes();
registerHubScene();
registerBattleScene();
registerSupportScenes();

loadState();
setLang(state.lang);
window.__libgaleState = state;

const appCanvas = document.querySelector("#app canvas");
if (appCanvas) {
  window.addEventListener("pointerdown", () => {
    appCanvas.focus();
    try {
      window.audioCtx?.resume?.();
    } catch {
      // ignore
    }
  }, { once: true });
}

function routeDebug(params) {
  const sceneName = params.get("scene");
  const lang = params.get("lang");
  if (lang) {
    setLang(lang);
    state.lang = lang;
  }
  state.onboarded = true;
  state.started = true;
  const book = params.get("book") || "ashen";

  if (sceneName === "language") go("language");
  else if (sceneName === "name") go("name");
  else if (sceneName === "intro") go("intro");
  else if (sceneName === "title") go("title");
  else if (sceneName === "hub") go("hub");
  else if (sceneName === "battle") go("battle", { bookId: book });
  else if (sceneName === "summary") go("summary", { bookId: book, from: "journal" });
  else if (sceneName === "journal") go("journal");
  else if (sceneName === "settings") go("settings", { from: "title" });
  else if (sceneName === "interlude") go("interlude");
  else if (sceneName === "credits") go("credits", { from: "title" });
  else go("title");
}

onLoad(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("scene")) {
    routeDebug(params);
    return;
  }
  if (!state.onboarded) {
    go("language");
  } else {
    go("title");
  }
});
