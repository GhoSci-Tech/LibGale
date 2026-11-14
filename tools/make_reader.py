"""Build the seated reader: the library armchair with a hooded reader in it.

The creature used to be a separate sprite dropped on top of the chair, which
always read as two PNGs stacked. This tool bakes a single 50x53 sprite.

The reader is drawn small enough to sit *inside* the chair: the backrest, the
armrests and the seat cushion stay visible, and the book rests on the lap just
above the seat edge.

Run from the project root:
    python tools/make_reader.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public" / "assets"
SHOTS = ROOT / "screenshots"

W, H = 50, 53
S = 4  # supersample, then snap to the pixel grid with NEAREST

OUTLINE = (10, 11, 14, 255)
ROBE = (50, 52, 60, 255)
ROBE_DARK = (32, 33, 40, 255)
ROBE_LIGHT = (68, 70, 79, 255)
EYE = (200, 204, 214, 255)
PAGE = (230, 216, 188, 255)
PAGE_DARK = (178, 158, 126, 255)
COVER = (88, 60, 46, 255)


def draw_reader(d: ImageDraw.ImageDraw, bob: int, blink: bool, turn: bool) -> None:
    """Draw the reader in chair-local pixel coordinates, scaled by S."""
    def sc(v):
        return int(round(v * S))

    def rect(x0, y0, x1, y1, colour):
        d.rectangle((sc(x0), sc(y0), sc(x1), sc(y1)), fill=colour)

    def ellipse(x0, y0, x1, y1, colour):
        d.ellipse((sc(x0), sc(y0), sc(x1), sc(y1)), fill=colour)

    oy = bob

    # --- torso ------------------------------------------------------------
    ellipse(18, 19 + oy, 34, 37 + oy, OUTLINE)
    ellipse(19, 20 + oy, 33, 36 + oy, ROBE)
    rect(22, 23 + oy, 23, 35 + oy, ROBE_DARK)
    rect(29, 23 + oy, 30, 35 + oy, ROBE_DARK)
    rect(20, 22 + oy, 21, 33 + oy, ROBE_LIGHT)

    # --- hood -------------------------------------------------------------
    ellipse(20, 9 + oy, 32, 23 + oy, OUTLINE)
    ellipse(21, 10 + oy, 31, 22 + oy, ROBE)
    ellipse(22, 11 + oy, 30, 21 + oy, ROBE_DARK)
    ellipse(20, 10 + oy, 25, 15 + oy, ROBE_LIGHT)
    # hood brim
    rect(20, 10 + oy, 32, 11 + oy, ROBE_DARK)

    # --- eyes -------------------------------------------------------------
    if blink:
        rect(23, 15 + oy, 24, 16 + oy, ROBE_DARK)
        rect(27, 15 + oy, 28, 16 + oy, ROBE_DARK)
    else:
        rect(23, 14 + oy, 24, 17 + oy, EYE)
        rect(27, 14 + oy, 28, 17 + oy, EYE)

    # --- hands holding the book ------------------------------------------
    rect(19, 28 + oy, 21, 31 + oy, OUTLINE)
    rect(30, 28 + oy, 32, 31 + oy, OUTLINE)

    # --- open book on the lap ---------------------------------------------
    left = 21 if not turn else 20
    rect(left - 1, 29 + oy, 32, 36 + oy, OUTLINE)
    rect(left, 30 + oy, 26, 35 + oy, PAGE)
    rect(27, 30 + oy, 31, 35 + oy, PAGE if not turn else PAGE_DARK)
    rect(26, 30 + oy, 27, 35 + oy, PAGE_DARK)
    rect(left, 35 + oy, 31, 36 + oy, COVER)
    rect(left + 1, 32 + oy, 24, 32 + oy, PAGE_DARK)
    if not turn:
        rect(29, 32 + oy, 30, 32 + oy, PAGE_DARK)


def build() -> list[Image.Image]:
    chair = Image.open(PUBLIC / "library" / "props" / "chair.png").convert("RGBA")
    frames = []
    poses = [(0, False, False), (-1, False, False), (0, False, True), (0, True, False)]
    for bob, blink, turn in poses:
        layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        draw_reader(d, bob, blink, turn)
        figure = layer.resize((W, H), Image.NEAREST)

        frame = chair.copy()
        # The reader sits against the left armrest: -4 in chair space, i.e.
        # 6px left of the previous +2 offset.
        frame.alpha_composite(figure, (-4, 0))
        frames.append(frame)
    return frames


def main() -> None:
    frames = build()
    sheet = Image.new("RGBA", (W * len(frames), H), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, (index * W, 0))
    out = PUBLIC / "chars" / "reader_chair.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out)

    SHOTS.mkdir(exist_ok=True)
    zoom = 8
    pad = 12
    preview = Image.new(
        "RGB",
        (W * zoom * len(frames) + pad * (len(frames) + 1), H * zoom + pad * 2),
        (37, 28, 30),
    )
    for index, frame in enumerate(frames):
        big = frame.resize((W * zoom, H * zoom), Image.NEAREST)
        preview.paste(big, (pad + index * (W * zoom + pad), pad), big)
    preview.save(SHOTS / "reader-chair-preview.png")
    print("wrote", out, "and screenshots/reader-chair-preview.png")


if __name__ == "__main__":
    main()
