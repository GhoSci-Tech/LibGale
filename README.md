# LibGale: A Way Of Tale

**LibGale: Hikayenin Bir Yolu**

A small atmospheric puzzle-RPG about books that were not read enough, and a
librarian who has no body but has a purpose.

**▶ Play in the browser: [libgale.surge.sh](https://libgale.surge.sh)**

Keyboard required, desktop recommended. Click the canvas once if the browser
has not given it focus yet.

> The library is quiet. Not empty—quiet. The kind of quiet that has been
> waiting for years.
>
> You remember these books, these shelves—but not yourself. Or perhaps you
> don't want to. You don't know whether you have a vessel. But you know you
> have a purpose.

---

## Current build

This repository contains **Chapter One: The First Three**:

- A grounded, world-space library hub with a proper night window, small
  lecterns for normal-sized Rage Books, reading tables, a tiny silent reader,
  loose pages placed on real surfaces, and no floating furniture.
- Three complete Rage Books: **The Ashen Tale**, **The Silent Poem** and
  **The Last Page**.
- A turn-based battle system that does **not** use an Undertale-style box.
  Each book opens into its own paper-diorama arena.
- Book summaries, a journal, a language/name/difficulty flow, and a
  Chapter Two teaser.
- A data-driven book registry so more books can be added without touching the
  battle controller. See [`docs/BOOKS.md`](docs/BOOKS.md).

Chapter Two, the protagonist's full story and the final archive are
intentionally not written yet.

---

## Run it

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Click once on
the game if the browser has not focused the canvas, then use the keyboard.

Production build:

```bash
npm run build
npm run preview
```

The only runtime dependencies are **KAPLAY 3001.x** and **Vite**. No other
engine, physics library or visual editor is used.

---

## Controls

### First-run flow

1. Choose **English** or **Türkçe**. Default: **EN**.
2. Write a name. Leave it empty to use **Whesper**.
3. Watch the waking intro.
4. The title card fades into the library.

Language and name can be changed later from Settings / the pause menu.

### Library

| Key | Action |
|---|---|
| `WASD` / arrow keys | Float through the library |
| `Z` / `Enter` | Interact / advance dialogue |
| `ESC` | Pause |

### Battle

| Key | Action |
|---|---|
| `WASD` | Float in the diorama |
| `←` / `→` | Choose READ / WRITE / LISTEN / RETREAT |
| `Z` / `Enter` | Confirm / advance dialogue |
| `Shift` | **Phase** — brief intangibility + cooldown |
| `ESC` | Pause |

READ reveals a clue, raises Meaning and lowers Rage. WRITE asks you to complete
the book's sentence with one of three words. LISTEN creates a shield and a small
heal. RETREAT leaves the book unfinished.

The correct word is required to seal a book. Calming a book without understanding
it leaves it at 95 Meaning and the book asks you to find the word.

### Settings and journal

- Settings: language, difficulty (**Normal / Story**), music, SFX, text speed,
  reduced flashing.
- Journal: sealed books and their restored summaries, plus loose-page notes.
- **Story** difficulty reduces damage to 1, slows hazards and increases
  invulnerability time.

---

## The first three books

| Book | Missing meaning | What it teaches |
|---|---|---|
| **The Ashen Tale / Kül Masalı** | **Hope / Umut** | Movement, READ/WRITE, safe zone, embers, phase |
| **The Silent Poem / Sessiz Şiir** | **Echo / Yankı** | LISTEN/shield, sound rings, silence zones, timing |
| **The Last Page / Son Sayfa** | **End / Biter** | Combining everything, Rage phase, boss phase, collapsing arena |

The first three are designed as a tutorial arc. Contextual lines appear on the
first turn of each book. The hub NPC, **Margin / Kenar**, gives hints before and
after each seal.

---

## Numbered mechanics

1. **Spectral float movement** — a 20×32 grayscale ghost with a wispy tail,
   gray eyes, black inner shading and a floor shadow; no gravity, free drift
   through the hub.
2. **Camera and parallax exploration** — a 1280×360 library hall with far,
   mid, foreground and dust layers.
3. **Pedestal interaction** — each Rage Book is a living object with its own
   cover, label, glow and sealed state.
4. **Loose pages** — five collectible margin notes; all five grant +5 max HP.
5. **Turn-based battle loop** — menu → action → book's story attack → repeat.
6. **READ** — reveals a clue, adds Meaning, reduces Rage, highlights the safe
   page.
7. **WRITE** — three-word sentence puzzle; the correct word is required to seal
   the book.
8. **LISTEN** — shield, small heal, small Meaning gain and a hint.
9. **RETREAT** — leave the book unfinished and return to the library.
10. **Themed diorama arenas** — no box; the entire book world is the arena,
    with paper houses, wells, moons, page towers and ink.
11. **Rage / Hırs** — a second meter; wrong words and hits raise it. At 100 the
    book enrages, hazards speed up and damage rises.
12. **Real-time survival beats** — each attack phase is a short narrated
    sequence of hazards, safe zones and telegraphs.
13. **Phase shift** — a short intangible dash with a cooldown, used to pass
    through danger.
14. **Meaning motes** — optional risk/reward pickups during attack phases.
15. **Boss phase** — The Last Page changes its beat script and hazard mix at
    50 Meaning.
16. **Seal, summary and journal** — sealing a book opens a restored-story page
    and records it in the journal.
17. **Language, name, difficulty and save** — English/Turkish, default
    Whesper, Normal/Story, localStorage save.
18. **Chapter One interlude** — after three seals the archive door opens a
    crack and begins Whesper's story.

---

## Project structure

```text
src/
  main.js                 # KAPLAY init, routing, scene registration
  core/
    assets.js             # every sprite and sound in one manifest
    state.js              # save state, pages, seals, settings
    i18n.js               # English/Turkish strings and intro text
    ui.js                 # panels, bars, hearts, text helpers
    dialogue.js           # typewriter dialogue box
    audio.js              # music/SFX manager
  data/
    books.js              # the three books, pages, NPC and archive text
  scenes/
    onboarding.js         # language, name, intro, title, credits
    backdrop.js           # parallax title/menu backdrop
    hubRoom.js            # grounded, world-space library room
    hub.js                # library hub
    battle.js             # generic battle controller + arenas
    support.js            # settings, journal, summary, interlude
  tools/
    prepare_assets.py     # copy/rename assets + generate ghost/FX/props
    generate_audio.py     # original ambient loops and SFX
    smoke.mjs             # visual smoke test
    logic_flow.mjs        # battle-flow regression test
  public/assets/          # assets used by the game
docs/
  BOOKS.md                # how to add a new book
  STORY.md                # lore and chapter notes
  ASSET_MANIFEST.md       # generated list of files
CREDITS.md
```

---

## Adding another book

The short version: add a data entry in `src/data/books.js`, add an arena module
or reuse an existing arena recipe, register it, and add localized text. The hub
pedestal, journal, summary screen and battle controller pick it up automatically.
See [`docs/BOOKS.md`](docs/BOOKS.md) for the schema and checklist.

---

## Credits and licenses

- **Engine:** [KAPLAY](https://kaplayjs.com) 3001.x — MIT.
- **Library art:** *Metroidvania Library Asset Pack* by **YP** (itch.io).
  Free for personal and commercial use; the asset pack itself may not be
  redistributed. It is embedded here as part of the game, not as a stand-alone
  asset pack. See the original page for the full license text.
- **Dungeon characters and hearts:** *16x16 DungeonTileset II* by **0x72** —
  **CC0**. Used for the Ink Imp, Whisper Wraith, Last Page, Margin, hearts,
  doors and coins.
- **UI sounds:** **Kenney UI Audio** — **CC0**.
- **Original assets:** Whesper's 20×32 grayscale ghost sheets, the small
  reader creature, paper-diorama props (rage books, houses, well, moon, tower,
  page walls, ink), glow/vignette/dust/page textures, ambient loops and SFX
  are original and generated for this project.
- **Font:** **Pixelify Sans** (Google Fonts, SIL Open Font License). It gives
  the game a pixel look while staying readable at 9–15 px. The license file is
  included at `public/assets/fonts/OFL.txt`.
- The UI uses a high-density framebuffer (`pixelDensity: 2`) so text stays
  crisp without changing the 640×360 layout.

See [`CREDITS.md`](CREDITS.md) for the full list and links.

## License

- **Code** (JavaScript, level data and the Python build tools): **MIT** — see
  [`LICENSE`](LICENSE).
- **Original LibGale material** (the Whesper sprite, the battle manifestations,
  the seated reader, diorama props and FX, the ambient loops and SFX, and the
  story text): made for this project, credited in [`CREDITS.md`](CREDITS.md).
- **Third-party assets** keep their own licenses and are **not** relicensed by
  MIT: the Metroidvania Library Asset Pack, the 0x72 DungeonTileset II, Kenney
  UI audio and Pixelify Sans (SIL OFL). Details and links are in
  [`CREDITS.md`](CREDITS.md).
- The original asset **ZIP archives are not redistributed** in this repository;
  `tools/prepare_assets.py` expects them locally and only the processed art the
  game actually loads is committed.

---

## QA / development tools

```bash
python tools/prepare_assets.py   # copy and generate art/FX
python tools/generate_audio.py   # regenerate original audio
node tools/smoke.mjs             # headed Chrome screenshots of the main screens
node tools/logic_flow.mjs        # drives the battle flow and checks all three seals
node tools/name_test.mjs         # uppercase name + {name} propagation
node tools/hub_test.mjs          # page pickups, silent reader and book intro
node tools/final_visuals.mjs     # language, battle menu/word/pause, journal, interlude
```

Debug URLs:

- `?scene=language`, `?scene=name`, `?scene=intro`, `?scene=title`
- `?scene=hub`
- `?scene=battle&book=ashen|poem|last&fast=1`
- `?scene=summary&book=ashen`
- `?scene=journal`, `?scene=settings`, `?scene=interlude`, `?scene=credits`
- `?lang=tr` switches the debug scene language.

`fast=1` shortens the attack phase for testing only.

---

## Known limitations / next steps

- Chapter Two, the protagonist's history and the archive finale are not written
  yet. The interlude is the current stopping point.
- The Rage Books' arenas use procedural paper props; more painted props can be
  added without changing the controller.
- The journal currently shows sealed books; a future version can add unread
  books, page notes per book and a replay/reread mode.
- The game is keyboard-first. Gamepad support can be added through KAPLAY's
  button API.
