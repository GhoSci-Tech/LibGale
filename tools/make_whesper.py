from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 20, 32
S = 4
OUTLINE = (7, 8, 10, 255)
LIGHT = (244, 244, 246, 255)
HILITE = (255, 255, 255, 255)
SHADE = (167, 168, 174, 255)
DEEP = (108, 110, 117, 255)
TIP = (23, 24, 28, 255)
EYE = (112, 116, 122, 255)
PUPIL = (16, 17, 20, 255)
GLINT = (230, 232, 236, 235)


def frame(kind, idx):
    im = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if kind == "idle":
        bob = [0, -1, 0, 1, 0, -1][idx % 6]
        sway = [0, 2, -2, 1, -1, 2][idx % 6]
    elif kind == "move":
        bob = [0, -1, 0, 1][idx % 4]
        sway = [2, 3, -1, 1][idx % 4]
    elif kind == "cast":
        bob = [0, -1, 0, 1][idx % 4]
        sway = [0, 1, -1, 0][idx % 4]
    else:
        bob = 0
        sway = 0
    lean = 0
    if kind == "move":
        lean = [-1, -2, 1, 2][idx % 4]
    elif kind == "cast":
        lean = [0, -1, 0, 1][idx % 4]
    ox = lean * S
    oy = bob * S
    cx = 40 + ox

    def silhouette(offset=0):
        mask = Image.new("L", (W * S, H * S), 0)
        md = ImageDraw.Draw(mask)
        # large rounded head
        md.ellipse((cx - 26 - offset, 6 + oy - offset, cx + 26 + offset, 46 + oy + offset), fill=255)
        md.polygon([(cx - 8 - offset, 8 + oy), (cx, 0 + oy - offset), (cx + 8 + offset, 8 + oy)], fill=255)
        # narrow neck -> bell-shaped sheet body
        md.polygon([
            (cx - 16 - offset, 38 + oy),
            (cx + 16 + offset, 38 + oy),
            (cx + 24 + offset, 84 + oy),
            (cx - 24 - offset, 84 + oy),
        ], fill=255)
        # wavy hem: three rounded lobes
        md.ellipse((cx - 28 - offset, 74 + oy, cx - 8 + offset, 98 + oy), fill=255)
        md.ellipse((cx - 12 - offset, 80 + oy, cx + 8 + offset, 104 + oy), fill=255)
        md.ellipse((cx + 6 - offset, 74 + oy, cx + 28 + offset, 96 + oy), fill=255)
        # thick curled genie wisp, integrated with the right hem
        md.polygon([
            (cx + 8 - offset, 94 + oy),
            (cx + 16 + offset, 94 + oy),
            (cx + 23 + offset + sway * S, 102 + oy),
            (cx + 24 + offset + sway * S, 110 + oy),
            (cx + 19 + offset + sway * S, 118 + oy),
            (cx + 14 + offset + sway * S, 113 + oy),
            (cx + 11 + offset + sway * S, 104 + oy),
            (cx + 7 + offset, 100 + oy),
        ], fill=255)
        return mask

    outline = silhouette(1).filter(ImageFilter.MaxFilter(9))
    im.paste(OUTLINE, (0, 0), outline)
    body = silhouette(0)
    im.paste(LIGHT, (0, 0), body)

    shade = Image.new("L", (W * S, H * S), 0)
    sd = ImageDraw.Draw(shade)
    sd.rectangle((cx - 26, 12 + oy, cx - 10, 84 + oy), fill=255)
    sd.ellipse((cx - 22, 78 + oy, cx - 2, 98 + oy), fill=255)
    sd.polygon([(cx + 8, 96 + oy), (cx + 13, 96 + oy), (cx + 16, 111 + oy), (cx + 10, 103 + oy)], fill=255)
    shade = Image.composite(shade, Image.new("L", (W * S, H * S), 0), body)
    im.paste(SHADE, (0, 0), shade)

    deep = Image.new("L", (W * S, H * S), 0)
    dd = ImageDraw.Draw(deep)
    dd.rectangle((cx + 18, 46 + oy, cx + 22, 82 + oy), fill=255)
    dd.polygon([
        (cx + 18 + sway * S, 106 + oy),
        (cx + 24 + sway * S, 110 + oy),
        (cx + 19 + sway * S, 118 + oy),
        (cx + 14 + sway * S, 113 + oy),
    ], fill=255)
    deep = Image.composite(deep, Image.new("L", (W * S, H * S), 0), body)
    im.paste(DEEP, (0, 0), deep)

    hi = Image.new("L", (W * S, H * S), 0)
    hd = ImageDraw.Draw(hi)
    hd.ellipse((cx - 17, 12 + oy, cx - 5, 24 + oy), fill=255)
    hd.ellipse((cx - 3, 9 + oy, cx + 4, 14 + oy), fill=255)
    hi = Image.composite(hi, Image.new("L", (W * S, H * S), 0), body)
    im.paste(HILITE, (0, 0), hi)

    if kind == "hurt":
        for ex in (cx - 15, cx + 5):
            d.line((ex, 23 + oy, ex + 10, 33 + oy), fill=(52, 54, 59, 255), width=S)
            d.line((ex + 10, 23 + oy, ex, 33 + oy), fill=(52, 54, 59, 255), width=S)
    else:
        for ex in (cx - 15, cx + 5):
            d.ellipse((ex, 21 + oy, ex + 10, 33 + oy), fill=EYE)
            d.ellipse((ex + 4, 25 + oy, ex + 9, 32 + oy), fill=PUPIL)
            d.rectangle((ex + 4, 24 + oy, ex + 6, 26 + oy), fill=GLINT)
        d.line((cx - 2, 38 + oy, cx + 2, 38 + oy), fill=DEEP, width=S)

    if kind == "cast":
        ox2 = cx + 20 if lean >= 0 else cx - 20
        d.ellipse((ox2 - 4, 40 + oy, ox2 + 4, 48 + oy), fill=(214, 216, 220, 255))
        d.ellipse((ox2 - 2, 42 + oy, ox2 + 2, 46 + oy), fill=(250, 250, 252, 255))

    tip = Image.new("L", (W * S, H * S), 0)
    td = ImageDraw.Draw(tip)
    td.polygon([
        (cx + 19 + sway * S, 110 + oy),
        (cx + 24 + sway * S, 110 + oy),
        (cx + 19 + sway * S, 118 + oy),
        (cx + 15 + sway * S, 114 + oy),
    ], fill=255)
    tip = Image.composite(tip, Image.new("L", (W * S, H * S), 0), body)
    im.paste(TIP, (0, 0), tip)

    return im.resize((W, H), Image.NEAREST)


frames = []
for i in range(6):
    frames.append(("idle", i, frame("idle", i)))
for i in range(4):
    frames.append(("move", i, frame("move", i)))
for i in range(4):
    frames.append(("cast", i, frame("cast", i)))
frames.append(("hurt", 0, frame("hurt", 0)))

sheet = Image.new("RGBA", (W * len(frames), H), (0, 0, 0, 0))
for i, (_, _, f) in enumerate(frames):
    sheet.alpha_composite(f, (i * W, 0))
os.makedirs("public/assets/chars", exist_ok=True)
sheet.save("public/assets/chars/ghost.png")
os.makedirs("screenshots", exist_ok=True)
sheet.save("screenshots/whesper-A4-sheet.png")

scale = 8
pad = 14
labelh = 24
cols = 6
rows = (len(frames) + cols - 1) // cols
cellw = W * scale + pad
cellh = H * scale + labelh + pad
preview = Image.new("RGB", (cols * cellw, rows * cellh + 70), (28, 25, 32))
d = ImageDraw.Draw(preview)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 16)
    small = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 13)
except Exception:
    font = ImageFont.load_default()
    small = font
d.text((16, 12), "WHESPER - CONCEPT A4: sheet ghost, bell body, thick curled wisp", font=font, fill=(236, 228, 210))
for i, (k, j, f) in enumerate(frames):
    big = f.resize((W * scale, H * scale), Image.NEAREST)
    x = (i % cols) * cellw + pad // 2
    y = (i // cols) * cellh + 60
    preview.paste(big, (x, y))
    d.text((x, y + H * scale + 3), f"{k} {j}", font=small, fill=(180, 174, 160))
hero = frames[0][2].resize((W * 10, H * 10), Image.NEAREST)
preview.paste(hero, (preview.width - hero.width - 20, 60))
d.text((preview.width - hero.width - 20, 60 + hero.height + 3), "idle 0 @10x", font=small, fill=(180, 174, 160))
preview.save("screenshots/whesper-A4-preview.png")
print("saved", preview.size)
