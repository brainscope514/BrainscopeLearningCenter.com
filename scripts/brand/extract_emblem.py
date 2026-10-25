"""Extracts the Brainscope emblem (ring + head, without the dark wordmark) from the transparent master logo.

Usage: python3 -I scripts/brand/extract_emblem.py <logo-with-alpha> <out-dir>
Writes: emblem.png (trimmed) and emblem-square-1024.png (centred on a transparent square, for icons).
Requires Pillow + numpy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
img = Image.open(src).convert("RGBA")
alpha = np.array(img)[:, :, 3]
rows = (alpha > 20).sum(axis=1)

# The wordmark sits below the emblem, separated by a band of fully transparent rows.
h = len(rows)
cut = h
for y in range(int(h * 0.5), h - 4):
    if rows[y : y + 4].sum() == 0:
        cut = y
        break

emblem = img.crop((0, 0, img.width, cut))
emblem = emblem.crop(emblem.getbbox())
emblem.save(out / "emblem.png", optimize=True)

side = int(max(emblem.size) * 1.08)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2), emblem)
square.resize((1024, 1024), Image.LANCZOS).save(out / "emblem-square-1024.png", optimize=True)
print(f"emblem {emblem.size[0]}x{emblem.size[1]} (cut at row {cut})")
