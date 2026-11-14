"""Bake the three battle manifestations as left-facing originals.

The 0x72 sprites are drawn facing the camera, so mirroring them can never make
them look at Whesper: the eye stays on the far side of the face. These are
hand-drawn replacements in the same palette and the same frame sizes, so the
battle layout does not move by a single pixel.

Design rules (fear comes from silhouette, not from big eyes):
  * small slanted glowing eyes with a hard brow, never round white blobs,
  * angular, low, hunched bodies with spikes / claws / teeth,
  * nothing drawn outside the 1px safe margin, so horns and tails never clip.

Run from the project root:
    python tools/make_enemies.py            # write the sheets
    python tools/make_enemies.py --preview  # previews under screenshots/
"""

from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public" / "assets"
SHOTS = ROOT / "screenshots"

S = 4  # supersample; the final sheet is snapped with NEAREST

OUTLINE = (28, 28, 30, 255)
RED = (198, 62, 48, 255)
RED_DARK = (128, 34, 40, 255)
RED_SHADE = (154, 46, 44, 255)
HORN = (78, 38, 62, 255)
HORN_DARK = (52, 24, 44, 255)
EYE = (255, 246, 214, 255)
PUPIL = (24, 18, 20, 255)

ROBE = (66, 38, 64, 255)
ROBE_DARK = (34, 20, 34, 255)
ROBE_LIGHT = (96, 58, 90, 255)
CAVITY = (16, 11, 18, 255)

CREAM = (240, 232, 214, 255)
CREAM_DARK = (186, 170, 144, 255)
COVER = (118, 32, 44, 255)
COVER_DARK = (78, 22, 30, 255)


def make_canvas(w, h):
    layer = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    return layer, ImageDraw.Draw(layer)


def finish(layer, w, h):
    """Add a 1px dark outline around the silhouette, then snap to pixels."""
    alpha = layer.split()[3]
    grown = alpha.filter(ImageFilter.MaxFilter(2 * S + 1))
    out = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    out.paste(OUTLINE, (0, 0), grown)
    out.alpha_composite(layer)
    return out.resize((w, h), Image.NEAREST)


def ell(d, x0, y0, x1, y1, colour):
    d.ellipse((x0 * S, y0 * S, x1 * S, y1 * S), fill=colour)


def poly(d, points, colour):
    d.polygon([(x * S, y * S) for x, y in points], fill=colour)


def box(d, x0, y0, x1, y1, colour):
    d.rectangle((x0 * S, y0 * S, x1 * S, y1 * S), fill=colour)


# ---------------------------------------------------------------------------
# Ink Imp: 16x16, low crouched gremlin with a needle-toothed jaw.
# ---------------------------------------------------------------------------
def draw_imp(d, oy, blink, twitch):
    # tail, tucked close so it never leaves the frame
    poly(
        d,
        [
            (12.6, 11.2 + oy),
            (13.8, 9.4 + oy + twitch * 0.5),
            (14.2, 7.8 + oy + twitch),
            (13.5, 8.2 + oy + twitch),
            (12.9, 9.8 + oy),
        ],
        RED_DARK,
    )
    # rear body, angular
    poly(
        d,
        [
            (6.6, 7.0 + oy),
            (13.4, 6.6 + oy),
            (14.2, 9.4 + oy),
            (14.0, 14.0 + oy),
            (5.6, 14.2 + oy),
        ],
        RED,
    )
    # spine ridge
    poly(d, [(9.6, 7.0 + oy), (10.3, 4.8 + oy), (11.0, 6.9 + oy)], RED)
    poly(d, [(12.0, 6.8 + oy), (12.9, 4.6 + oy), (13.5, 6.9 + oy)], RED)
    poly(d, [(10.6, 9.2 + oy), (14.0, 8.8 + oy), (13.8, 12.4 + oy), (10.4, 12.6 + oy)], RED_SHADE)
    # head, wedge-shaped and low
    poly(
        d,
        [
            (2.4, 5.4 + oy),
            (5.0, 4.6 + oy),
            (7.8, 5.4 + oy),
            (8.4, 7.6 + oy),
            (7.6, 10.2 + oy),
            (4.6, 11.4 + oy),
            (2.2, 9.8 + oy),
        ],
        RED,
    )
    # jaw
    poly(d, [(2.2, 9.2 + oy), (5.2, 9.8 + oy), (4.8, 11.6 + oy), (2.4, 11.0 + oy)], RED)
    poly(d, [(2.4, 9.6 + oy), (5.0, 10.1 + oy), (4.7, 11.0 + oy), (2.6, 10.4 + oy)], CAVITY)
    poly(d, [(2.8, 9.8 + oy), (3.4, 9.9 + oy), (3.1, 10.9 + oy)], EYE)
    poly(d, [(4.0, 10.0 + oy), (4.5, 10.1 + oy), (4.3, 11.0 + oy)], EYE)
    # eye: dark socket with a single burning point
    poly(d, [(2.8, 5.8 + oy), (5.8, 5.6 + oy), (6.0, 8.2 + oy), (3.0, 8.6 + oy)], CAVITY)
    if blink:
        box(d, 3.2, 7.0 + oy, 4.0, 7.5 + oy, (120, 104, 80, 255))
    else:
        box(d, 3.2, 6.5 + oy, 4.0, 8.2 + oy, EYE)
    # horns swept back, fully inside
    poly(d, [(5.6, 5.2 + oy), (7.6, 2.6 + oy), (8.6, 3.4 + oy), (6.8, 5.8 + oy)], HORN)
    poly(d, [(7.4, 5.4 + oy), (10.0, 3.2 + oy), (10.8, 4.2 + oy), (8.2, 6.2 + oy)], HORN_DARK)
    # clawed arm
    poly(d, [(2.0, 11.0 + oy), (3.6, 10.6 + oy), (3.8, 12.4 + oy), (2.2, 12.6 + oy)], RED)
    poly(d, [(2.0, 12.4 + oy), (2.6, 13.0 + oy), (2.4, 13.4 + oy), (1.8, 12.8 + oy)], RED_DARK)
    # legs with claws
    poly(d, [(5.6, 13.8 + oy), (8.2, 13.8 + oy), (8.4, 14.6 + oy), (5.4, 14.6 + oy)], RED_DARK)
    poly(d, [(9.8, 13.8 + oy), (12.6, 13.8 + oy), (12.8, 14.6 + oy), (9.6, 14.6 + oy)], RED_DARK)
    box(d, 5.6, 14.2 + oy, 6.1, 14.6 + oy, PUPIL)
    box(d, 9.8, 14.2 + oy, 10.3, 14.6 + oy, PUPIL)


# ---------------------------------------------------------------------------
# Whisper Wraith: 16x20, hooded, hollow, one vertical slit of light.
# ---------------------------------------------------------------------------
def draw_wraith(d, oy, blink, sway):
    # robe, angular and leaning forward
    poly(
        d,
        [
            (4.8, 9.4 + oy),
            (10.6, 10.8 + oy),
            (12.6 + sway, 15.0 + oy),
            (13.4 + sway, 17.8 + oy),
            (2.0 - sway, 17.8 + oy),
            (3.2, 13.0 + oy),
        ],
        ROBE,
    )
    # ragged hem
    for hx, drop in ((2.2, 0.7), (4.4, 0.3), (6.6, 0.8), (8.8, 0.2), (11.0, 0.6)):
        poly(
            d,
            [
                (hx, 17.6 + oy),
                (hx + 1.2, 17.6 + oy),
                (hx + 0.6, 17.6 + oy + drop),
            ],
            ROBE,
        )
    # folds
    poly(d, [(8.8, 11.6 + oy), (11.4 + sway, 17.6 + oy), (8.4, 17.6 + oy)], ROBE_DARK)
    poly(d, [(3.6, 12.0 + oy), (2.6 - sway, 17.6 + oy), (4.8, 17.6 + oy)], ROBE_LIGHT)
    # hood
    poly(
        d,
        [
            (5.0, 2.0 + oy),
            (8.6, 3.0 + oy),
            (10.4, 8.6 + oy),
            (9.0, 11.4 + oy),
            (3.6, 10.6 + oy),
            (3.4, 4.6 + oy),
        ],
        ROBE,
    )
    ell(d, 3.2, 2.8 + oy, 10.4, 11.0 + oy, ROBE)
    # rim light on the near side
    poly(d, [(3.2, 4.4 + oy), (4.2, 3.0 + oy), (5.2, 2.2 + oy), (5.6, 3.2 + oy), (4.0, 5.8 + oy)], ROBE_LIGHT)
    # hollow cavity, nearly black
    ell(d, 3.2, 5.2 + oy, 7.6, 10.4 + oy, CAVITY)
    poly(d, [(2.6, 5.4 + oy), (3.4, 6.8 + oy), (2.6, 9.8 + oy), (2.0, 7.8 + oy)], ROBE)
    # single slit eye burning inside the hollow
    if blink:
        box(d, 4.2, 7.2 + oy, 4.9, 7.8 + oy, (110, 96, 116, 255))
    else:
        box(d, 4.1, 6.6 + oy, 4.9, 9.2 + oy, EYE)
    # long thin fingers on the near edge
    for i, fy in enumerate((9.6, 10.8, 12.0)):
        poly(d, [(2.6, fy + oy), (1.4, fy + 1.4 + oy), (2.0, fy + 1.8 + oy), (3.0, fy + 0.8 + oy)], ROBE_LIGHT)
    # wisps
    poly(d, [(10.2, 5.4 + oy), (12.4 + sway, 4.4 + oy), (11.8 + sway, 7.0 + oy)], ROBE_LIGHT)
    poly(d, [(10.8, 8.6 + oy), (13.6 + sway, 9.0 + oy), (12.2 + sway, 10.8 + oy)], ROBE)


# ---------------------------------------------------------------------------
# The Last Page: 32x36, a book whose jaw is the monster. No loose paper.
# ---------------------------------------------------------------------------
def draw_last(d, oy, blink, flutter):
    # spine
    poly(
        d,
        [
            (25.4, 4.6 + oy),
            (30.2, 5.4 + oy),
            (29.8, 32.4 + oy),
            (25.8, 32.6 + oy),
        ],
        COVER,
    )
    box(d, 27.0, 7.0 + oy, 28.0, 31.4 + oy, COVER_DARK)
    # metal clasps on the spine
    box(d, 26.6, 11.0 + oy, 29.4, 13.0 + oy, (150, 120, 74, 255))
    box(d, 26.6, 24.0 + oy, 29.4, 26.0 + oy, (150, 120, 74, 255))
    # lower jaw
    poly(
        d,
        [
            (3.6, 22.6 + oy),
            (25.8, 20.8 + oy),
            (26.0, 32.2 + oy),
            (4.6, 33.2 + oy),
        ],
        COVER,
    )
    poly(
        d,
        [
            (4.6, 26.6 + oy),
            (25.8, 25.0 + oy),
            (25.8, 32.0 + oy),
            (5.2, 32.8 + oy),
        ],
        COVER_DARK,
    )
    # upper cover, torn front corner
    poly(
        d,
        [
            (1.4, 9.4 + oy),
            (25.6, 6.8 + oy),
            (26.0, 19.6 + oy),
            (16.0, 21.0 + oy),
            (14.6, 19.6 + oy),
            (2.2, 21.6 + oy),
        ],
        RED,
    )
    poly(
        d,
        [
            (17.6, 8.0 + oy),
            (25.6, 7.2 + oy),
            (25.8, 19.6 + oy),
            (17.6, 20.4 + oy),
        ],
        RED_SHADE,
    )
    # hard brow over the eye
    poly(d, [(5.6, 11.2 + oy), (10.6, 10.6 + oy), (10.6, 11.6 + oy), (5.6, 12.2 + oy)], PUPIL)
    # dark socket with one burning point
    poly(d, [(5.6, 12.6 + oy), (10.2, 12.1 + oy), (10.2, 17.0 + oy), (5.6, 17.5 + oy)], CAVITY)
    if blink:
        box(d, 6.6, 14.4 + oy, 7.4, 15.0 + oy, (120, 104, 80, 255))
    else:
        box(d, 6.6, 13.8 + oy, 7.4, 16.2 + oy, EYE)
    # throat
    box(d, 2.8, 20.6 + oy, 26.0, 23.4 + oy, CAVITY)
    # long interlocking teeth
    for i in range(8):
        x = 3.8 + i * 2.8
        poly(d, [(x, 20.6 + oy), (x + 1.5, 20.6 + oy), (x + 0.7, 23.6 + oy)], CREAM)
    for i in range(7):
        x = 5.2 + i * 2.8
        poly(d, [(x, 23.4 + oy), (x + 1.5, 23.4 + oy), (x + 0.7, 20.4 + oy)], CREAM_DARK)
    # claw feet
    poly(d, [(6.0, 31.6 + oy), (9.2, 31.6 + oy), (7.6, 34.6 + oy)], COVER_DARK)
    poly(d, [(18.6, 31.0 + oy), (21.8, 31.0 + oy), (20.2, 34.0 + oy)], COVER_DARK)


SPECS = {
    "imp_idle": (16, 16, draw_imp),
    "necro_idle": (16, 20, draw_wraith),
    "demon_idle": (32, 36, draw_last),
}


def build(name, w, h, fn):
    sheet = Image.new("RGBA", (w * 4, h), (0, 0, 0, 0))
    raw = []
    poses = [(0, False, 0), (-1, False, 1), (0, True, 0), (0, False, -1)]
    for index, (oy, blink, extra) in enumerate(poses):
        layer, d = make_canvas(w, h)
        fn(d, oy, blink, extra)
        bbox = layer.getbbox()
        raw.append(tuple(v / S for v in bbox) if bbox else None)
        frame = finish(layer, w, h)
        sheet.alpha_composite(frame, (index * w, 0))
    return sheet, raw


def check(name, raw, w, h):
    bad = []
    for index, bbox in enumerate(raw):
        if not bbox:
            continue
        x0, y0, x1, y1 = bbox
        if x0 < 1.0 or y0 < 1.0 or x1 > w - 1.0 or y1 > h - 1.0:
            bad.append((index, tuple(round(v, 1) for v in bbox)))
    if bad:
        for index, bbox in bad:
            print(f"WARN {name} frame {index} needs more margin: {bbox} in {w}x{h}")
    else:
        print(f"ok   {name}: every frame keeps its 1px margin")


def preview(sheets):
    SHOTS.mkdir(exist_ok=True)
    zoom = 10
    pad = 16
    width = max(s.width for _, s in sheets.items()) * zoom + pad * 2
    height = sum(s.height * zoom + pad * 2 + 22 for _, s in sheets.items())
    canvas = Image.new("RGB", (width, height), (24, 20, 30))
    d = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 16)
    except Exception:
        font = ImageFont.load_default()
    y = pad
    for name, sheet in sheets.items():
        d.text((pad, y), name, font=font, fill=(236, 226, 200))
        y += 22
        big = sheet.resize((sheet.width * zoom, sheet.height * zoom), Image.NEAREST)
        canvas.paste(big, (pad, y), big)
        y += sheet.height * zoom + pad * 2
    canvas.save(SHOTS / "enemies-preview.png")


def main():
    sheets = {}
    for name, (w, h, fn) in SPECS.items():
        sheet, raw = build(name, w, h, fn)
        sheets[name] = sheet
        check(name, raw, w, h)
    if "--preview" in sys.argv:
        preview(sheets)
        print("preview written")
        return
    out_dir = PUBLIC / "characters"
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, sheet in sheets.items():
        sheet.save(out_dir / f"{name}.png")
        print("wrote", name)


if __name__ == "__main__":
    main()
