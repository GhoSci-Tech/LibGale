# Adding a Rage Book

LibGale is built so a new book is mostly **data + an arena recipe**, not a new
battle system. The battle controller, hub pedestals, summary screen and journal
all read from `src/data/books.js`.

## 1. Add the book data

Append an entry to `BOOKS` in `src/data/books.js`:

```js
{
  id: "hollow-map",
  chapter: 2,
  order: 1,
  cover: "book06",              // small library book sprite
  rageCover: "ragebook_ashen",  // 96x72 diorama cover (or a new one)
  arena: "ashen",               // "ashen" | "poem" | "last" | new arena id
  palette: {
    bg: [26, 15, 13],
    bg2: [44, 26, 21],
    accent: [232, 161, 84],
    danger: [226, 90, 64],
    safe: [127, 231, 224],
    paper: [226, 214, 187],
  },
  enemySprite: "imp_idle",
  enemyRun: "imp_run",
  enemyScale: 3,
  title: { en: "The Hollow Map", tr: "Oyuk Harita" },
  subtitle: { en: "A map with no destination", tr: "Hedefi olmayan bir harita" },
  enemyName: { en: "The Cartographer", tr: "Haritacı" },
  intro: {
    en: ["..."],
    tr: ["..."],
  },
  sentence: {
    en: "Every road needs a ___.",
    tr: "Her yolun bir ___ ihtiyacı vardır.",
  },
  options: {
    en: ["Direction", "Ink", "Silence"],
    tr: ["Yön", "Mürekkep", "Sessizlik"],
  },
  answer: 0,
  clues: { en: ["...", "...", "..."], tr: ["...", "...", "..."] },
  listenLines: { en: ["..."], tr: ["..."] },
  wrongLines: { en: ["..."], tr: ["..."] },
  correctLines: { en: ["..."], tr: ["..."] },
  enrageLines: { en: ["..."], tr: ["..."] },
  sealLines: { en: ["..."], tr: ["..."] },
  summary: { en: ["..."], tr: ["..."] },
  beats: [
    { subtitle: { en: "...", tr: "..." }, pattern: "embers" },
    { subtitle: { en: "...", tr: "..." }, pattern: "walls" },
    { subtitle: { en: "...", tr: "..." }, pattern: "aimed" },
  ],
  arenaProps: {
    houses: [76, 548],
    well: 250,
    moon: false,
    pillars: [],
    tower: false,
  },
  safeZone: { x: 250, y: 224, r: 72 },
  duration: 9,
  spawnEvery: 0.46,
  baseDamage: 2,
}
```

### Required fields

- `id` — stable save key.
- `chapter`, `order` — where it appears.
- `title`, `subtitle`, `enemyName`, `intro`, `sentence`, `options`, `clues`,
  `listenLines`, `wrongLines`, `correctLines`, `enrageLines`, `sealLines`,
  `summary` — all `{ en, tr }`.
- `answer` — index into `options` (0-based).
- `beats` — the narrated attack phases. `pattern` is one of the registered
  patterns in `src/scenes/battle.js`.
- `safeZone` — the always-available safe page.
- `duration`, `spawnEvery`, `baseDamage`.

### Optional fields

- `phaseTwoBeats` — used when `book.id === "last"` currently; can be generalized.
- `arenaProps` — decorative placement hints for the arena builder.
- `rageCover` — a generated 96×72 book cover. You can create a new one in
  `tools/prepare_assets.py` with `make_rage_book(...)`.

## 2. Add an arena (optional)

The existing arenas are selected by `book.arena`:

- `ashen` — burnt paper village, well safe page, embers/walls/aimed sparks.
- `poem` — moonlit paper stage, pillars, sound rings/waves.
- `last` — collapsing page tower, page walls, ink and spiral.

If you need a new look, add a branch in `battle.js` where the props are built,
and choose a palette. The hazard system is generic; the arena only needs visual
props plus a safe zone.

## 3. Add patterns (optional)

`spawnPattern(pattern)` handles:

| Pattern | Behavior |
|---|---|
| `embers` | falling embers |
| `walls` | a wall with a gap + aimed projectile |
| `aimed` | aimed projectiles + embers |
| `rings` | radial burst |
| `waves` | faster horizontal walls |
| `pagewalls` | page walls + falling books |
| `ink` | ground ink zones + embers |
| `spiral` | rings + aimed |
| `all` | combined final-boss mix |

To add a pattern, add a `case` and a spawn helper. Use `canSpawn(key, cooldown)`
so a rapid spawn timer does not flood the screen.

## 4. Register it

The hub uses `getChapterBooks(1)`. Once the book is in `BOOKS`, Chapter 1 will
automatically show another pedestal (up to the current layout supports three;
for more, extend the pedestal positions / chapter layout).

The journal lists every book whose id is in `state.sealed`.

## 5. Localisation checklist

- [ ] Every `{ en, tr }` field is filled.
- [ ] The sentence has a `___` blank.
- [ ] The correct option reads naturally in both languages.
- [ ] The summary explains what the book was, why it raged and what changed.
- [ ] The seal line is a satisfying final beat, not a repetition of the summary.

## 6. Asset checklist

- [ ] Rage book cover (or reuse an existing one).
- [ ] Enemy sprite (0x72 CC0 or a new original).
- [ ] Optional arena props.
- [ ] No missing `loadSprite` calls in `src/core/assets.js`.
- [ ] The palette stays within the library's warm/cool contrast.

## 7. Test checklist

- [ ] The pedestal appears and the correct localized title shows.
- [ ] The intro plays; ESC/Z advances.
- [ ] READ reveals three distinct clues.
- [ ] A wrong word raises Rage; the correct word raises Meaning and changes the
      arena.
- [ ] The book can be calmed without the correct word, but cannot be sealed
      until the word is found.
- [ ] The seal opens the summary, and the summary appears in the journal.
- [ ] Reloading the page keeps the seal.
- [ ] Both languages render without missing glyphs.
- [ ] The attack phase is survivable on Normal and forgiving on Story.
