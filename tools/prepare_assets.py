"""Prepare LibGale's asset folder.

This script is intentionally boring: it copies the files we actually use,
renames them into stable paths, generates the original ghost / paper-diorama
props / FX, and downloads the small CC0 Kenney UI sounds.

Run from the project root:
    python tools/prepare_assets.py
"""

from __future__ import annotations

import io
import math
import os
import random
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets"
LIB_ZIP = ROOT / "Metroidvania Library Asset Pack.zip"
X72_ZIP = ROOT / "tools" / "vendor" / "0x72.zip"
KENNEY_BASE = "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/"


def ensure(*paths: Path) -> None:
    for path in paths:
        path.mkdir(parents=True, exist_ok=True)


def copy_from_zip(zip_path: Path, mapping: dict[str, str], prefix: str = "") -> None:
    if not zip_path.exists():
        print(f"[skip] missing zip: {zip_path}")
        return
    with zipfile.ZipFile(zip_path) as zf:
        names = set(zf.namelist())
        for src, dst in mapping.items():
            key = prefix + src
            if key not in names:
                print(f"[warn] missing {key}")
                continue
            target = PUBLIC / dst
            ensure(target.parent)
            target.write_bytes(zf.read(key))


def copy_library() -> None:
    mapping = {
        # backgrounds
        "spin off/BG 2/loop background_1.png": "library/bg/loop1.png",
        "spin off/BG 2/loop background_2.png": "library/bg/loop2.png",
        "spin off/BG 2/external room_3.png": "library/bg/window.png",
        "spin off/BG 2/external room_4.png": "library/bg/door.png",
        "spin off/BG 2/external room_1.png": "library/bg/wall.png",
        # shelves / architecture
        "spin off/BG 1/bookcase_1.png": "library/props/bookcase1.png",
        "spin off/BG 1/bookcase_2.png": "library/props/bookcase2.png",
        "spin off/BG 1/bookcase_3.png": "library/props/bookcase3.png",
        "spin off/BG 1/curtain_1.png": "library/props/curtain1.png",
        "spin off/BG 1/curtain_2.png": "library/props/curtain2.png",
        "spin off/BG 1/curtain_3.png": "library/props/curtain3.png",
        "spin off/BG 1/stairs_1.png": "library/props/stairs1.png",
        "spin off/BG 1/upstair_3.png": "library/props/upstair3.png",
        "spin off/BG 2/spiral staircase.png": "library/props/spiral.png",
        "spin off/BG 2/second floor_5.png": "library/props/railing.png",
        "spin off/BG 2/transport platform_1.png": "library/props/platform.png",
        "spin off/bookcase tower/bookcase tower.png": "library/props/tower.png",
        # decor
        "spin off/BG 2/stuff_1.png": "library/props/chandelier.png",
        "spin off/BG 2/stuff_2.png": "library/props/plant1.png",
        "spin off/BG 2/stuff_3.png": "library/props/plant2.png",
        "spin off/BG 2/stuff_4.png": "library/props/desk.png",
        "spin off/BG 2/stuff_5.png": "library/props/bench.png",
        "spin off/BG 2/stuff_7.png": "library/props/chair.png",
        "spin off/BG 2/stuff_8.png": "library/props/ladder.png",
        "spin off/BG 2/stuff_9.png": "library/props/coatrack.png",
        "spin off/BG 2/stuff_10.png": "library/props/clock.png",
        "spin off/BG 2/stuff_12.png": "library/props/painting1.png",
        "spin off/BG 2/stuff_13.png": "library/props/painting2.png",
        "spin off/BG 2/stuff_14.png": "library/props/painting3.png",
        "spin off/Books/Books hand.png": "library/props/bookhand.png",
        # books
        "spin off/Books/Books 1.png": "library/books/row1.png",
        "spin off/Books/Books 2.png": "library/books/row2.png",
        "spin off/BG 2/Books back.png": "library/books/back.png",
        "spin off/BG 2/Books front .png": "library/books/front.png",
        "spin off/Books/Book_1.png": "library/books/book01.png",
        "spin off/Books/Book_2.png": "library/books/book02.png",
        "spin off/Books/Book_3.png": "library/books/book03.png",
        "spin off/Books/Book_4.png": "library/books/book04.png",
        "spin off/Books/Book_5.png": "library/books/book05.png",
        "spin off/Books/Book_6.png": "library/books/book06.png",
        "spin off/Books/Book_7.png": "library/books/book07.png",
        "spin off/Books/Book_8.png": "library/books/book08.png",
        "spin off/Books/Book_9.png": "library/books/book09.png",
        "spin off/Books/Book_10.png": "library/books/book10.png",
        "spin off/Books/Book_11.png": "library/books/book11.png",
        "spin off/Books/Book_12.png": "library/books/book12.png",
        # a few 32px tiles for page borders / floor
        "spin off/tiles/tiles_1.png": "library/tiles/tile1.png",
        "spin off/tiles/tiles_8.png": "library/tiles/tile8.png",
        "spin off/tiles/tiles_9.png": "library/tiles/tile9.png",
        "spin off/tiles/tiles_10.png": "library/tiles/tile10.png",
        "spin off/tiles/tiles_11.png": "library/tiles/tile11.png",
    }
    copy_from_zip(LIB_ZIP, mapping)


def copy_x72() -> None:
    mapping = {
        # The three battle manifestations are original left-facing art made by
        # tools/make_enemies.py, so the 0x72 idle sheets must not overwrite
        # them. Their run sprites are unused but kept for reference.
        "monsters/imp_run_anim.png": "characters/imp_run.png",
        "monsters/necromancer_run_anim.png": "characters/necro_run.png",
        "monsters/big_demon_run_anim.png": "characters/demon_run.png",
        "monsters/chort_idle_anim.png": "characters/chort_idle.png",
        "monsters/chort_run_anim.png": "characters/chort_run.png",
        "ui/ui_heart_full.png": "ui/heart_full.png",
        "ui/ui_heart_half.png": "ui/heart_half.png",
        "ui/ui_heart_empty.png": "ui/heart_empty.png",
        "dungeon-doors/doors_leaf_closed.png": "ui/door_closed.png",
        "dungeon-doors/doors_leaf_open.png": "ui/door_open.png",
        "treasure/coin_anim.png": "ui/coin.png",
    }
    copy_from_zip(X72_ZIP, mapping)


def copy_kenney() -> None:
    sounds = {
        "click1.wav": "audio/kenney_click1.wav",
        "rollover1.wav": "audio/kenney_rollover1.wav",
        "switch1.wav": "audio/kenney_switch1.wav",
        "switch2.wav": "audio/kenney_switch2.wav",
        "mouseclick1.wav": "audio/kenney_mouseclick1.wav",
    }
    for src, dst in sounds.items():
        target = PUBLIC / dst
        if target.exists():
            continue
        ensure(target.parent)
        try:
            with urllib.request.urlopen(KENNEY_BASE + src, timeout=30) as response:
                target.write_bytes(response.read())
            print(f"[ok] kenney {src}")
        except Exception as exc:  # pragma: no cover - network fallback
            print(f"[warn] could not download {src}: {exc}")


# ---------------------------------------------------------------------------
# Original pixel art
# ---------------------------------------------------------------------------

GHOST_OUTLINE = (11, 15, 24, 255)
GHOST_LIGHT = (218, 242, 247, 255)
GHOST_MID = (159, 201, 214, 255)
GHOST_SHADE = (106, 153, 170, 255)
GHOST_EYE = (15, 31, 39, 255)
GHOST_GLOW = (127, 231, 224, 255)
GHOST_RED = (226, 112, 112, 255)


def ghost_frame(kind: str, index: int, size: tuple[int, int] = (20, 32)) -> Image.Image:
    """Draw a 20x32 grayscale ghost at 4x, then downsample to crisp pixels."""
    S = 4
    w, h = size[0] * S, size[1] * S
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    bob = [0, -1, 0, 1][index % 4] * S
    lean = 0
    if kind == "move":
        lean = [-1, -2, 1, 2][index % 4] * S
    elif kind == "cast":
        lean = [0, -1, 0, 1][index % 4] * S

    cx = 10 * S + lean
    top = 4 * S + bob
    head = (cx - 5 * S, top, cx + 5 * S, top + 10 * S)
    body_top = top + 7 * S
    body_bottom = 23 * S
    body = (cx - 5 * S, body_top, cx + 5 * S, body_bottom)

    def silhouette(offset: int = 0) -> Image.Image:
        mask = Image.new("L", (w, h), 0)
        md = ImageDraw.Draw(mask)
        md.ellipse(
            (head[0] - offset, head[1] - offset, head[2] + offset, head[3] + offset),
            fill=255,
        )
        sway = [0, 2, -2, 1][index % 4] * S
        # One continuous body that tapers into a long, wavy ghost tail.
        body_poly = [
            (body[0] - offset, body[1]),
            (body[2] + offset, body[1]),
            (body[2] + offset, 18 * S),
            (body[2] - 1 * S + sway, 21 * S),
            (body[2] + 2 * S + sway, 25 * S),
            (body[2] - 1 * S + sway, 28 * S),
            (cx + 4 * S + sway, 31 * S),
            (cx - 1 * S + sway, 29 * S),
            (body[0] + 1 * S + sway, 26 * S),
            (body[0] + 2 * S + sway, 23 * S),
            (body[0] - offset, 18 * S),
        ]
        md.polygon(body_poly, fill=255)
        if kind == "cast":
            md.ellipse((cx - 8 * S, 12 * S, cx - 5 * S, 15 * S), fill=255)
            md.ellipse((cx + 5 * S, 12 * S, cx + 8 * S, 15 * S), fill=255)
        return mask

    outline = silhouette(1)
    outline = outline.filter(ImageFilter.MaxFilter(9))
    img.paste((8, 9, 11, 255), (0, 0), outline)

    body_mask = silhouette(0)
    img.paste((242, 242, 244, 255), (0, 0), body_mask)

    # Left-side and lower shading: black/gray "reflection" inside the body.
    shade_mask = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(shade_mask)
    sd.rectangle((cx - 5 * S, top + 2 * S, cx - 2 * S, 22 * S), fill=255)
    sd.rectangle((cx - 4 * S, 22 * S, cx + 4 * S, 23 * S), fill=255)
    shade_mask = Image.composite(shade_mask, Image.new("L", (w, h), 0), body_mask)
    img.paste((154, 155, 161, 255), (0, 0), shade_mask)

    deep_mask = Image.new("L", (w, h), 0)
    dd = ImageDraw.Draw(deep_mask)
    dd.rectangle((cx + 3 * S, top + 5 * S, cx + 5 * S, 22 * S), fill=255)
    dd.polygon([(cx - 3 * S, 24 * S), (cx + 3 * S, 24 * S), (cx, 30 * S)], fill=255)
    deep_mask = Image.composite(deep_mask, Image.new("L", (w, h), 0), body_mask)
    img.paste((92, 94, 100, 255), (0, 0), deep_mask)

    # Highlight
    hi_mask = Image.new("L", (w, h), 0)
    hd = ImageDraw.Draw(hi_mask)
    hd.ellipse((cx - 4 * S, top + 1 * S, cx - 1 * S, top + 4 * S), fill=255)
    hd.ellipse((cx + 1 * S, top + 2 * S, cx + 3 * S, top + 3 * S), fill=255)
    hi_mask = Image.composite(hi_mask, Image.new("L", (w, h), 0), body_mask)
    img.paste((255, 255, 255, 255), (0, 0), hi_mask)

    if kind == "hurt":
        for ex in (cx - 3 * S, cx + 1 * S):
            d.line((ex, top + 4 * S, ex + 2 * S, top + 6 * S), fill=(40, 42, 47, 255), width=S)
            d.line((ex + 2 * S, top + 4 * S, ex, top + 6 * S), fill=(40, 42, 47, 255), width=S)
        tint = Image.new("RGBA", (w, h), (70, 72, 76, 85))
        img.alpha_composite(Image.composite(tint, Image.new("RGBA", (w, h), (0, 0, 0, 0)), body_mask))
    else:
        for ex in (cx - 3 * S, cx + 1 * S):
            d.rectangle((ex, top + 3 * S, ex + 3 * S, top + 6 * S), fill=(102, 106, 112, 255))
            d.rectangle((ex + S // 2, top + 3 * S + S // 2, ex + 2 * S, top + 5 * S), fill=(23, 25, 29, 255))
            d.rectangle((ex + S // 4, top + 3 * S + S // 4, ex + S, top + 4 * S), fill=(225, 228, 233, 235))
        d.line((cx - 1 * S, top + 7 * S, cx + 1 * S, top + 7 * S), fill=(92, 94, 100, 255), width=S)
        if kind == "cast":
            orb_x = cx + 8 * S
            orb_y = 12 * S
            d.ellipse((orb_x - 2 * S, orb_y - 2 * S, orb_x + 2 * S, orb_y + 2 * S), fill=(208, 210, 216, 255))
            d.ellipse((orb_x - S, orb_y - S, orb_x + S, orb_y + S), fill=(255, 255, 255, 255))

    return img.resize(size, Image.NEAREST)


def make_ghost_sheet(kind: str, path: Path) -> None:
    frames = [ghost_frame(kind, i) for i in range(4)]
    sheet = Image.new("RGBA", (20 * 4, 32), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, (i * 20, 0))
    ensure(path.parent)
    sheet.save(path)

def make_glow(path: Path, size: int = 128) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            dist = math.hypot(x - c, y - c) / (size * 0.5)
            a = max(0.0, 1.0 - dist)
            a = a * a * 255
            px[x, y] = (255, 255, 255, int(a))
    ensure(path.parent)
    img.save(path)


def make_vignette(path: Path, w: int = 640, h: int = 360) -> None:
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    cx, cy = w / 2, h / 2
    for y in range(h):
        for x in range(w):
            nx = (x - cx) / (w * 0.62)
            ny = (y - cy) / (h * 0.62)
            dist = min(1.0, math.hypot(nx, ny))
            a = int(max(0.0, dist - 0.35) / 0.65 * 190)
            px[x, y] = (4, 3, 8, a)
    ensure(path.parent)
    img.save(path)


def make_paper(path: Path, w: int = 64, h: int = 64) -> None:
    rng = random.Random(7)
    img = Image.new("RGBA", (w, h), (226, 214, 187, 255))
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-10, 8)
            px[x, y] = (max(0, min(255, 226 + n)), max(0, min(255, 214 + n)), max(0, min(255, 187 + n)), 255)
    d = ImageDraw.Draw(img)
    for _ in range(18):
        x = rng.randint(0, w - 1)
        y = rng.randint(0, h - 1)
        d.line((x, y, min(w - 1, x + rng.randint(1, 7)), y + rng.randint(-1, 1)), fill=(196, 181, 151, 90))
    ensure(path.parent)
    img.save(path)


def make_rage_book(path: Path, cover, border, rune, kind: str) -> None:
    img = Image.new("RGBA", (96, 72), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # page block
    d.rectangle((18, 12, 89, 67), fill=(214, 200, 172, 255), outline=(74, 57, 48, 255))
    for i in range(9):
        y = 17 + i * 5
        d.line((22, y, 86, y), fill=(170, 151, 121, 120))
    # cover
    d.rectangle((11, 7, 84, 63), fill=(*cover, 255), outline=(15, 10, 14, 255))
    d.rectangle((16, 12, 80, 58), outline=(*border, 255))
    # spine
    d.rectangle((5, 5, 18, 68), fill=(*cover, 255), outline=(15, 10, 14, 255))
    d.line((9, 10, 9, 63), fill=(*border, 220))
    d.line((13, 10, 13, 63), fill=(*border, 220))
    for y in (14, 28, 42, 56):
        d.rectangle((6, y, 17, y + 2), fill=(*border, 200))
    # page edges
    d.line((84, 14, 91, 14), fill=(*border, 180))
    d.line((84, 60, 91, 60), fill=(*border, 180))
    # corner ornaments
    for cx, cy in ((20, 16), (76, 16), (20, 54), (76, 54)):
        d.rectangle((cx - 2, cy - 2, cx + 2, cy + 2), fill=(*border, 255))
    # rune
    if kind == "ashen":
        d.polygon([(48, 22), (55, 36), (48, 50), (41, 36)], fill=(*rune, 230))
        d.polygon([(48, 28), (52, 36), (48, 44), (44, 36)], fill=(255, 235, 180, 255))
    elif kind == "poem":
        for r in (7, 12, 17):
            d.arc((48 - r, 36 - r, 48 + r, 36 + r), 200, 340, fill=(*rune, 230), width=2)
        d.ellipse((46, 34, 50, 38), fill=(*rune, 255))
    else:
        d.ellipse((37, 27, 59, 45), fill=(*rune, 210), outline=(*border, 255))
        d.ellipse((45, 32, 51, 40), fill=(20, 8, 14, 255))
        d.ellipse((47, 34, 49, 37), fill=(255, 230, 170, 255))
    # faint highlight
    d.line((20, 10, 76, 10), fill=(255, 255, 255, 35))
    img.save(path)


def make_props() -> None:
    make_lectern(PUBLIC / "props" / "lectern.png")
    make_wall_clock(PUBLIC / "props" / "wall_clock.png")
    make_seal(PUBLIC / "props" / "seal.png")
    make_moon_mystic(PUBLIC / "props" / "moon_mystic.png")
    make_window(PUBLIC / "props" / "window_night.png")
    make_creature_sheet(PUBLIC / "chars" / "creature.png")
    make_rage_book(
        PUBLIC / "props" / "ragebook_ashen.png",
        cover=(58, 28, 24),
        border=(220, 162, 86),
        rune=(255, 146, 68),
        kind="ashen",
    )
    make_rage_book(
        PUBLIC / "props" / "ragebook_poem.png",
        cover=(24, 35, 51),
        border=(159, 216, 224),
        rune=(127, 231, 224),
        kind="poem",
    )
    make_rage_book(
        PUBLIC / "props" / "ragebook_last.png",
        cover=(32, 15, 23),
        border=(214, 178, 104),
        rune=(255, 104, 104),
        kind="last",
    )

    for name in ("ragebook_ashen", "ragebook_poem", "ragebook_last"):
        im = Image.open(PUBLIC / "props" / f"{name}.png").convert("RGBA")
        im.resize((48, 36), Image.NEAREST).save(PUBLIC / "props" / f"{name}_small.png")

    # house: a paper-cut burnt cottage
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((10, 30, 54, 60), fill=(42, 31, 33, 255))
    d.polygon([(6, 31), (32, 10), (58, 31)], fill=(55, 36, 33, 255))
    d.rectangle((10, 30, 54, 33), fill=(93, 53, 39, 255))
    for wx in (19, 38):
        d.rectangle((wx, 38, wx + 8, 46), fill=(234, 162, 76, 255))
        d.rectangle((wx + 1, 39, wx + 7, 45), fill=(255, 204, 120, 255))
    d.line((10, 30, 10, 60), fill=(12, 9, 12, 255), width=2)
    d.line((54, 30, 54, 60), fill=(12, 9, 12, 255), width=2)
    d.line((10, 60, 54, 60), fill=(12, 9, 12, 255), width=2)
    # burnt roof edge
    for x in range(8, 57, 5):
        d.line((x, 30 - (x - 8) // 3, x + 2, 27 - (x - 8) // 3), fill=(17, 12, 14, 255))
    ensure(PUBLIC / "props")
    img.save(PUBLIC / "props" / "house.png")

    # well
    img = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((6, 24, 42, 44), fill=(45, 42, 49, 255))
    d.ellipse((10, 27, 38, 40), fill=(20, 29, 39, 255))
    d.ellipse((14, 30, 34, 37), fill=(79, 196, 190, 180))
    d.ellipse((17, 31, 29, 35), fill=(181, 247, 238, 220))
    d.rectangle((8, 20, 40, 28), fill=(66, 58, 62, 255))
    d.line((8, 20, 40, 20), fill=(105, 91, 84, 255))
    img.save(PUBLIC / "props" / "well.png")

    # moon
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((8, 8, 56, 56), fill=(202, 227, 224, 230))
    d.ellipse((14, 15, 24, 24), fill=(170, 202, 203, 190))
    d.ellipse((35, 29, 47, 40), fill=(170, 202, 203, 160))
    d.ellipse((23, 41, 29, 46), fill=(170, 202, 203, 150))
    img.save(PUBLIC / "props" / "moon.png")

    # page tower
    img = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rng = random.Random(3)
    for i in range(10):
        y = 92 - i * 9
        w = 22 + i * 4
        x = 32 - w // 2 + rng.randint(-2, 2)
        d.rectangle((x, y - 7, x + w, y), fill=(226, 214, 187, 235), outline=(92, 72, 60, 255))
        d.line((x + 2, y - 5, x + w - 2, y - 5), fill=(150, 132, 105, 140))
    img.save(PUBLIC / "props" / "tower.png")

    # pillar
    img = Image.new("RGBA", (24, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((6, 10, 18, 90), fill=(66, 53, 52, 255), outline=(19, 15, 18, 255))
    d.rectangle((3, 4, 21, 12), fill=(92, 73, 66, 255), outline=(19, 15, 18, 255))
    d.rectangle((3, 88, 21, 96), fill=(92, 73, 66, 255), outline=(19, 15, 18, 255))
    img.save(PUBLIC / "props" / "pillar.png")

    # page wall
    img = Image.new("RGBA", (32, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(12):
        y = i * 8
        d.rectangle((2, y, 30, y + 7), fill=(222, 208, 178, 245), outline=(86, 67, 56, 255))
        d.line((5, y + 3, 27, y + 3), fill=(151, 132, 104, 120))
    img.save(PUBLIC / "props" / "pagewall.png")

    # ink blot
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((2, 8, 30, 30), fill=(14, 12, 20, 235))
    d.ellipse((8, 2, 24, 18), fill=(14, 12, 20, 235))
    d.ellipse((18, 6, 31, 18), fill=(14, 12, 20, 220))
    img.save(PUBLIC / "props" / "inkblot.png")


def make_small_fx() -> None:
    # dust: 6x6 soft dot
    img = Image.new("RGBA", (6, 6), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((1, 1, 4, 4), fill=(255, 244, 198, 150))
    d.ellipse((2, 2, 3, 3), fill=(255, 255, 230, 220))
    ensure(PUBLIC / "fx")
    img.save(PUBLIC / "fx" / "dust.png")

    # page particle
    img = Image.new("RGBA", (10, 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((1, 1, 8, 6), fill=(232, 220, 193, 235), outline=(118, 96, 76, 255))
    d.line((2, 3, 7, 3), fill=(165, 144, 112, 160))
    d.line((2, 5, 6, 5), fill=(165, 144, 112, 160))
    img.save(PUBLIC / "fx" / "page.png")

    # glyph: four 6x6 letter/rune shards for the Shift Faz burst
    glyphs = [
        ["..##..", ".#..#.", ".#..#.", "....#.", "...#..", "..#..."],
        ["..#...", ".#.#..", ".#.#..", ".###..", ".#.#..", ".#.#.."],
        ["..##..", ".#....", ".#....", ".#.##.", ".#..#.", "..##.."],
        ["...#..", "..##..", ".#.#..", "#..#..", "....#.", ".....#"],
    ]
    sheet = Image.new("RGBA", (6 * 4, 6), (0, 0, 0, 0))
    for index, rows in enumerate(glyphs):
        for y, row in enumerate(rows):
            for x, char in enumerate(row):
                if char == "#":
                    sheet.putpixel((index * 6 + x, y), (236, 238, 252, 255))
    sheet.save(PUBLIC / "fx" / "glyph.png")


def make_ghost_shadow(path: Path) -> None:
    img = Image.new("RGBA", (52, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((4, 4, 48, 14), fill=(0, 0, 0, 110))
    d.ellipse((12, 6, 40, 13), fill=(0, 0, 0, 80))
    ensure(path.parent)
    img.save(path)


def make_lectern(path: Path) -> None:
    img = Image.new("RGBA", (40, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # base + stem + slanted top
    d.rectangle((5, 41, 35, 47), fill=(42, 30, 27, 255), outline=(14, 10, 13, 255))
    d.rectangle((17, 20, 23, 42), fill=(56, 39, 33, 255), outline=(14, 10, 13, 255))
    d.polygon([(5, 20), (35, 20), (31, 8), (9, 8)], fill=(74, 51, 39, 255), outline=(14, 10, 13, 255))
    d.rectangle((8, 9, 32, 12), fill=(121, 84, 54, 255))
    d.rectangle((8, 18, 32, 21), fill=(121, 84, 54, 255))
    d.line((8, 22, 32, 22), fill=(214, 178, 104, 90))
    ensure(path.parent)
    img.save(path)


def make_seal(path: Path) -> None:
    """A wax-and-gold archive seal, 24x24. Three of these ring the door."""
    size = 24
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = 11
    # gold rim
    d.ellipse((1, 1, 21, 21), fill=(46, 30, 34, 255), outline=(172, 134, 74, 255), width=2)
    # deep crimson wax
    d.ellipse((4, 4, 18, 18), fill=(102, 30, 42, 255), outline=(134, 48, 58, 255))
    # radial notches
    for step in range(0, 360, 45):
        angle = math.radians(step)
        x = cx + math.cos(angle) * 9
        y = cy + math.sin(angle) * 9
        d.point((round(x), round(y)), fill=(226, 194, 128, 255))
    # rune: a small book spine with two cross strokes
    d.line((cx, 6, cx, 16), fill=(240, 214, 156, 255))
    d.line((cx - 3, 8, cx + 3, 8), fill=(240, 214, 156, 255))
    d.line((cx - 2, 12, cx + 2, 12), fill=(240, 214, 156, 255))
    d.point((cx, 5), fill=(255, 244, 210, 255))
    ensure(path.parent)
    img.save(path)


def make_wall_clock(path: Path) -> None:
    img = Image.new("RGBA", (32, 42), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((3, 4, 29, 38), fill=(55, 38, 32), outline=(12, 9, 13, 255))
    d.rectangle((6, 7, 26, 35), fill=(28, 20, 22), outline=(105, 76, 58, 255))
    d.ellipse((8, 9, 24, 31), fill=(222, 214, 188), outline=(74, 55, 43, 255))
    d.ellipse((10, 11, 22, 29), fill=(238, 231, 208))
    # hands
    d.line((16, 20, 16, 13), fill=(40, 36, 34, 255), width=1)
    d.line((16, 20, 21, 23), fill=(40, 36, 34, 255), width=1)
    d.rectangle((15, 19, 17, 21), fill=(120, 82, 48, 255))
    d.rectangle((3, 1, 29, 5), fill=(63, 43, 35), outline=(12, 9, 13, 255))
    d.rectangle((13, 37, 19, 41), fill=(63, 43, 35), outline=(12, 9, 13, 255))
    ensure(path.parent)
    img.save(path)


def make_moon_mystic(path: Path) -> None:
    """Eclipse Moon: a dark disc with a thin silver crescent and a rune halo.

    It is a separate sprite so the window glass stays clean and the moon can
    pulse, while the hub and the poem arena share the same design.
    """
    size = 48
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = 24

    # faint outer halo
    for step, alpha in ((22, 14), (20, 20)):
        d.ellipse((cx - step, cy - step, cx + step, cy + step), fill=(112, 124, 186, alpha))
    d.ellipse((cx - 18, cy - 18, cx + 18, cy + 18), outline=(126, 138, 206, 110))

    # dark disc
    d.ellipse((cx - 15, cy - 15, cx + 15, cy + 15), fill=(18, 20, 42, 255), outline=(84, 94, 152, 255))
    d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=(26, 28, 56, 255))

    # thin silver crescent on the player's side, bitten out of the dark disc
    d.ellipse((cx - 13, cy - 12, cx + 9, cy + 12), fill=(236, 239, 248, 255))
    d.ellipse((cx - 5, cy - 13, cx + 17, cy + 11), fill=(26, 28, 56, 255))
    d.arc((cx - 13, cy - 12, cx + 9, cy + 12), 130, 235, fill=(255, 255, 255, 235), width=1)

    # rune marks on the halo
    for angle, mark in ((205, "dot"), (250, "bar"), (305, "dot"), (20, "bar")):
        a = math.radians(angle)
        x = cx + math.cos(a) * 18
        y = cy + math.sin(a) * 18
        if mark == "dot":
            d.rectangle((round(x), round(y), round(x) + 1, round(y) + 1), fill=(214, 190, 130, 210))
        else:
            d.line((round(x) - 1, round(y), round(x) + 1, round(y)), fill=(214, 190, 130, 200))

    # drifting paper crumbs
    d.rectangle((36, 9, 37, 10), fill=(226, 220, 206, 170))
    d.rectangle((8, 33, 9, 34), fill=(226, 220, 206, 140))
    ensure(path.parent)
    img.save(path)


def make_window(path: Path) -> None:
    img = Image.new("RGBA", (180, 240), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # outer wooden frame
    d.rectangle((6, 8, 174, 232), fill=(44, 31, 29, 255), outline=(12, 9, 13, 255))
    d.rectangle((16, 18, 164, 214), fill=(15, 24, 39, 255), outline=(100, 72, 58, 255))
    # night gradient (the moon is a separate sprite so it can pulse)
    for y in range(18, 214):
        a = (y - 18) / 196
        d.line((17, y, 163, y), fill=(int(15 + 18 * a), int(24 + 28 * a), int(39 + 34 * a), 255))
    for sx, sy in ((40, 50), (56, 90), (138, 110), (30, 140), (145, 160), (75, 170)):
        d.rectangle((sx, sy, sx + 2, sy + 2), fill=(220, 230, 220, 190))
    # mullions
    d.line((90, 18, 90, 214), fill=(74, 52, 42, 255), width=5)
    d.line((16, 112, 164, 112), fill=(74, 52, 42, 255), width=5)
    # sill
    d.rectangle((2, 226, 178, 236), fill=(66, 46, 39, 255), outline=(12, 9, 13, 255))
    # curtains baked in, so alignment can never look broken
    d.polygon([(2, 8), (30, 8), (24, 210), (10, 224), (2, 224)], fill=(66, 24, 32, 245))
    d.polygon([(178, 8), (150, 8), (156, 210), (170, 224), (178, 224)], fill=(66, 24, 32, 245))
    d.line((24, 8, 18, 216), fill=(105, 43, 53, 200), width=2)
    d.line((156, 8, 162, 216), fill=(105, 43, 53, 200), width=2)
    ensure(path.parent)
    img.save(path)


def make_creature_sheet(path: Path) -> None:
    sheet = Image.new("RGBA", (20 * 4, 24), (0, 0, 0, 0))
    for frame in range(4):
        img = Image.new("RGBA", (20, 24), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        bob = [0, -1, 0, 1][frame]
        blink = frame == 2
        # hunched little reader, dark gray with pale eyes
        d.ellipse((4, 8 + bob, 16, 22 + bob), fill=(49, 51, 56, 255), outline=(10, 11, 14, 255))
        d.ellipse((6, 4 + bob, 14, 12 + bob), fill=(63, 65, 70, 255), outline=(10, 11, 14, 255))
        d.rectangle((2, 17 + bob, 8, 22 + bob), fill=(35, 37, 42, 255), outline=(10, 11, 14, 255))
        d.rectangle((12, 17 + bob, 18, 22 + bob), fill=(35, 37, 42, 255), outline=(10, 11, 14, 255))
        if blink:
            d.line((7, 8 + bob, 9, 8 + bob), fill=(190, 195, 200, 255))
            d.line((11, 8 + bob, 13, 8 + bob), fill=(190, 195, 200, 255))
        else:
            d.rectangle((7, 7 + bob, 8, 9 + bob), fill=(196, 201, 206, 255))
            d.rectangle((12, 7 + bob, 13, 9 + bob), fill=(196, 201, 206, 255))
        # a tiny book on its lap
        d.rectangle((8, 15 + bob, 15, 19 + bob), fill=(188, 176, 148, 255), outline=(74, 57, 48, 255))
        d.line((9, 17 + bob, 14, 17 + bob), fill=(120, 102, 80, 150))
        sheet.alpha_composite(img, (frame * 20, 0))
    ensure(path.parent)
    sheet.save(path)


def make_custom_assets() -> None:
    # Whesper's approved A4 sheet is generated by tools/make_whesper.py.
    # This script must not overwrite it with the old placeholder ghost.
    make_ghost_shadow(PUBLIC / "chars" / "ghost_shadow.png")
    make_glow(PUBLIC / "fx" / "glow.png")
    make_vignette(PUBLIC / "fx" / "vignette.png")
    make_paper(PUBLIC / "fx" / "paper.png")
    make_small_fx()
    make_props()


def write_manifest() -> None:
    lines = ["# Asset Manifest", "", "Generated by `tools/prepare_assets.py`.", ""]
    for path in sorted(PUBLIC.rglob("*")):
        if path.is_file():
            lines.append(f"- `{path.relative_to(PUBLIC).as_posix()}` ({path.stat().st_size} bytes)")
    (ROOT / "docs").mkdir(exist_ok=True)
    (ROOT / "docs" / "ASSET_MANIFEST.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ensure(
        PUBLIC / "library",
        PUBLIC / "characters",
        PUBLIC / "chars",
        PUBLIC / "ui",
        PUBLIC / "fx",
        PUBLIC / "props",
        PUBLIC / "audio",
    )
    copy_library()
    copy_x72()
    copy_kenney()
    make_custom_assets()
    write_manifest()
    print("Assets ready:", PUBLIC)


if __name__ == "__main__":
    main()
