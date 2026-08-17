#!/usr/bin/env python3
"""Process Marina's walk-cycle frames: per-frame background removal and trim.
The game draws every frame scaled to one display height and anchored at the
feet (bottom-center), which normalizes the generator's scale drift."""
import os
from PIL import Image
from process_assets import flood_bg, despeckle, soften_edge, solid_bbox

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src')
OUT = os.path.join(ROOT, 'assets', 'walk')
os.makedirs(OUT, exist_ok=True)

FRAMES = ['marina-idle', 'marina-walk-down-1', 'marina-walk-down-2',
          'marina-walk-up-1', 'marina-walk-up-2',
          'marina-walk-side-1', 'marina-walk-side-2',
          'marina-idle-side', 'marina-walk-side-pass',
          'marina-walk-side-swing', 'marina-walk-side-push']
MAX_H = 384

for name in FRAMES:
    im = Image.open(os.path.join(SRC, f'{name}.png')).convert('RGBA')
    im = flood_bg(im)
    im = despeckle(im)
    im = soften_edge(im)
    im = im.crop(solid_bbox(im))
    w, h = im.size
    s = min(1.0, MAX_H / h)
    if s < 1.0:
        im = im.resize((round(w*s), round(h*s)), Image.LANCZOS)
    out_path = os.path.join(OUT, f'{name}.png')
    im.save(out_path, optimize=True)
    print(name, im.size, f'{os.path.getsize(out_path)//1024}KB')
