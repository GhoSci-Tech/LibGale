# Credits & Licenses

LibGale is a small game project made for learning and game-jam practice.

- The **source code** is released under the **MIT license** (see `LICENSE`).
- The **original LibGale art, audio and story text** are credited below and are
  not covered by third-party licenses.
- **Third-party assets** keep their own licenses. They are listed here with
  links so attribution travels with the project, and they are not relicensed by
  MIT. The asset ZIP archives themselves are not redistributed in this
  repository; only the processed files the game loads are committed.

## Engine

**KAPLAY 3001.x**
- https://kaplayjs.com
- License: MIT
- Used as the only game engine and physics layer.

## Library environment

**Metroidvania Library Asset Pack** by **YP**
- https://yprimo01.itch.io/metroidvania-library-asset-pack
- The pack is free for personal and commercial use. The author asks that the
  asset pack itself is not redistributed as a stand-alone asset pack. In this
  project the art is embedded as part of a game, which is the intended use.
- Used for: library backgrounds, bookcases, curtains, window, chandelier,
  desk, chair, clock, paintings, stairs, book rows and the book-hand prop.

## Dungeon characters and UI

**16x16 DungeonTileset II** by **0x72 (Robert Norenberg)**
- https://0x72.itch.io/dungeontileset-ii
- License: **CC0 1.0**
- Used for: Margin (chort), hearts, coin, archive door and the pixel UI accents.
- The three battle manifestations (Ink Imp, Whisper Wraith, The Last Page) are
  **original LibGale art** drawn for this project by `tools/make_enemies.py`,
  using the 0x72 palette as a visual reference only. They are not modified
  0x72 sprites.

## UI sounds

**Kenney UI Audio** by **Kenney**
- https://kenney.nl/assets/ui-audio
- License: **CC0 1.0**
- Used for: click, rollover and switch sounds.

## Original assets generated for LibGale

The following are original works generated from code by `tools/prepare_assets.py`,
`tools/make_enemies.py`, `tools/make_reader.py` and `tools/generate_audio.py`:

- Whesper's 20×32 ghost sprite sheets (idle, move, cast, hurt, combined
  sheet, floor shadow).
- The three battle manifestations: Ink Imp (16×16), Whisper Wraith (16×20) and
  The Last Page (32×36), each a four-frame left-facing sheet.
- The seated reader in the armchair at the hub table.
- Paper-diorama props: Rage Book covers, burnt houses, well, moon, page tower,
  pillar, page wall and ink blot.
- FX: glow, vignette, dust, page particle, letter glyphs and paper texture.
- Ambient loops: hub, Ashen Tale, Silent Poem, Last Page.
- SFX: page, quill, hit, heal, seal, rage, phase, door, game over, whisper,
  meaning mote, breath.

These are released as CC0-style original material for the purposes of this
project. No generative image model was used for the pixel art; the props and
ghost are drawn with Python/Pillow.

## Fonts

**Pixelify Sans** by **Stefie Justprince**
- https://fonts.google.com/specimen/Pixelify+Sans
- License: **SIL Open Font License 1.1**
- The license text is included at `public/assets/fonts/OFL.txt`.
- Used for all in-game UI, dialogue, titles and credits. It supports Turkish
  characters and keeps the pixel aesthetic while remaining readable.

## Tools used during development

- Node.js, npm, Vite
- Python 3 + Pillow (asset generation)
- Puppeteer Core + installed Chrome (smoke tests)
- Python `wave` module (original audio generation)

## Source note

The asset pack ZIP and 0x72 ZIP are kept in the project only as source material
for the asset preparation script. They are not required to play the built game;
the processed assets under `public/assets/` are what the game loads.
