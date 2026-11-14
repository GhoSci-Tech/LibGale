const SAVE_KEY = "libgale.save.v1";

export const DEFAULT_STATE = {
  version: 1,
  onboarded: false,
  started: false,
  lang: "en",
  name: "Whesper",
  difficulty: "normal",
  settings: {
    music: 0.45,
    sfx: 0.7,
    textSpeed: 42,
    reduceFlash: false,
  },
  sealed: [],
  pages: [],
  anlam: 0,
  maxHp: 20,
  interludeSeen: false,
};

export let state = structuredClone(DEFAULT_STATE);

function mergeDeep(base, incoming) {
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return base;
  }
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (Array.isArray(value)) {
      out[key] = [...value];
    } else if (value && typeof value === "object" && base && typeof base[key] === "object" && base[key] !== null && !Array.isArray(base[key])) {
      out[key] = mergeDeep(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw);
    state = mergeDeep(structuredClone(DEFAULT_STATE), parsed);
  } catch (error) {
    console.warn("Could not load LibGale save:", error);
    state = structuredClone(DEFAULT_STATE);
  }
  return state;
}

export function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save LibGale state:", error);
  }
}

export function resetStory({ keepName = false, keepLanguage = true } = {}) {
  const lang = state.lang;
  const settings = structuredClone(state.settings);
  const difficulty = state.difficulty;
  const name = keepName ? state.name : "Whesper";
  state = {
    ...structuredClone(DEFAULT_STATE),
    lang: keepLanguage ? lang : "en",
    settings,
    difficulty,
    name,
    onboarded: true,
    started: false,
  };
  saveState();
  return state;
}

export function addSealed(bookId) {
  if (!state.sealed.includes(bookId)) {
    state.sealed.push(bookId);
    state.anlam += 1;
    saveState();
  }
}

export function addPage(pageId) {
  if (!state.pages.includes(pageId)) {
    state.pages.push(pageId);
    if (state.pages.length === 5) {
      state.maxHp += 5;
    }
    saveState();
    return true;
  }
  return false;
}

export function hasSealedAllFirstThree(books) {
  return books.every((book) => state.sealed.includes(book.id));
}
