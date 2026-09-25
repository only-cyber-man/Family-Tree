"""Compose App Store screenshots: caption + rounded device capture on brand green.

Usage: python3 store/app-store/compose.py <raw-dir>
Raw captures are simulator screenshots named like iphone-en-1-tree.png / ipad-en-1-tree.png.
Output goes to store/app-store/screenshots/<device>-<lang>/, at the exact sizes App Store Connect accepts.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
FONT = ROOT.parent.parent / "mobile/node_modules/@expo-google-fonts/literata/600SemiBold/Literata_600SemiBold.ttf"
BG = (47, 93, 70)  # #2F5D46, brand green
BG_LIGHT = (58, 110, 84)
INK = (245, 240, 230)  # #F5F0E6
SHADOW_OFFSET = 24

CAPTIONS = {
    "iphone-en-1-tree": "Generations line up by birth year",
    "iphone-en-2-related": "See exactly how you’re related",
    "iphone-en-3-home": "Birthdays and remembrance days, ahead of time",
    "iphone-en-4-dates": "A quiet reminder the day before",
    "iphone-en-5-person": "Every person, every relationship",
    "iphone-pl-1-drzewo": "Pokolenia według roku urodzenia",
    "iphone-pl-2-pokrewienstwo": "Zobacz, jak jesteście spokrewnieni",
    "iphone-pl-3-start": "Urodziny i rocznice zawsze na czas",
    "iphone-pl-4-ustawienia": "Po polsku lub po angielsku, jasny lub ciemny",
    "ipad-en-1-tree": "The whole family on one screen",
    "ipad-en-2-related": "See exactly how you’re related",
    "ipad-en-3-home": "Birthdays and remembrance days, ahead of time",
    "ipad-en-4-dates": "A quiet reminder the day before",
}

# Per device: output size, caption band height, font size, device width share, corner radius.
LAYOUT = {
    "iphone": {"size": (1320, 2868), "band": 600, "font": 100, "scale": 0.74, "radius": 100},
    "ipad": {"size": (2064, 2752), "band": 420, "font": 112, "scale": 0.80, "radius": 60},
}


def background(size):
    """Vertical gradient from a lighter to the brand green."""
    w, h = size
    top = Image.new("RGB", size, BG_LIGHT)
    bottom = Image.new("RGB", size, BG)
    mask = Image.linear_gradient("L").resize(size)
    return Image.composite(bottom, top, mask)


def wrap(draw, text, font, max_width):
    words, lines, line = text.split(), [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *img.size), radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def compose(raw_path, out_path, caption, layout):
    size = layout["size"]
    canvas = background(size).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(FONT), layout["font"])

    lines = wrap(draw, caption, font, size[0] * 0.86)
    line_h = int(layout["font"] * 1.22)
    y = (layout["band"] - line_h * len(lines)) // 2 + int(layout["font"] * 0.15)
    for line in lines:
        draw.text((size[0] / 2, y), line, font=font, fill=INK, anchor="ma")
        y += line_h

    shot = Image.open(raw_path).convert("RGB")
    dw = int(size[0] * layout["scale"])
    dh = int(shot.height * dw / shot.width)
    shot = rounded(shot.resize((dw, dh), Image.LANCZOS), layout["radius"])
    x, top = (size[0] - dw) // 2, layout["band"]
    if top + dh + SHADOW_OFFSET > size[1]:
        sys.exit(f"{raw_path.name}: device image would overflow the {size[0]}x{size[1]} canvas; lower 'scale' or 'band' in LAYOUT")

    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((x, top + SHADOW_OFFSET, x + dw, top + dh + SHADOW_OFFSET), radius=layout["radius"], fill=(0, 0, 0, 110))
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(40)))
    canvas.alpha_composite(shot, (x, top))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, optimize=True)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    raw_dir = Path(sys.argv[1])
    if not FONT.exists():
        sys.exit(f"Font not found: {FONT}\nRun `yarn install` in mobile/ first.")
    missing = [name for name in CAPTIONS if not (raw_dir / f"{name}.png").exists()]
    if missing:
        sys.exit(f"Missing raw captures: {', '.join(missing)}")
    for name, caption in CAPTIONS.items():
        device, lang, rest = name.split("-", 2)
        out = ROOT / "screenshots" / f"{device}-{lang}" / f"{rest}.png"
        compose(raw_dir / f"{name}.png", out, caption, LAYOUT[device])
        print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
