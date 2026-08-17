#!/usr/bin/env python3
"""Process the fridge animation frames.
- Union crop across all four frames (same canvas) so the fridge body stays
  aligned while only the door moves -> assets/fridge/*.png
- Also a tight crop of the closed frame for the in-world object.
"""
import os
from PIL import Image
from process_assets import flood_bg, despeckle, soften_edge, solid_bbox

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src')
OUT = os.path.join(ROOT, 'assets', 'fridge')
os.makedirs(OUT, exist_ok=True)

FRAMES = ['fridge-closed', 'fridge-ajar', 'fridge-open-1', 'fridge-open-2']
MAX_H = 360

cleaned, union, size0 = {}, None, None
for name in FRAMES:
    im = Image.open(os.path.join(SRC, f'{name}.png')).convert('RGBA')
    if size0 is None: size0 = im.size
    assert im.size == size0, f'{name}: {im.size} != {size0}'
    im = flood_bg(im)
    im = despeckle(im)
    im = soften_edge(im)
    cleaned[name] = im
    b = solid_bbox(im)
    print(name, 'bbox', b)
    if union is None: union = list(b)
    else:
        union[0]=min(union[0],b[0]); union[1]=min(union[1],b[1])
        union[2]=max(union[2],b[2]); union[3]=max(union[3],b[3])

uw, uh = union[2]-union[0], union[3]-union[1]
s = min(1.0, MAX_H / uh)
print('union', union)
for name, im in cleaned.items():
    fr = im.crop(tuple(union))
    if s < 1.0:
        fr = fr.resize((round(uw*s), round(uh*s)), Image.LANCZOS)
    p = os.path.join(OUT, f'{name}.png')
    fr.save(p, optimize=True)
    print(name, fr.size, f'{os.path.getsize(p)//1024}KB')

# tight closed fridge for the in-world object
im = cleaned['fridge-closed']
tight = im.crop(solid_bbox(im))
tw, th = tight.size
ts = min(1.0, MAX_H / th)
if ts < 1.0:
    tight = tight.resize((round(tw*ts), round(th*ts)), Image.LANCZOS)
p = os.path.join(OUT, 'fridge-world.png')
tight.save(p, optimize=True)
print('fridge-world', tight.size, f'{os.path.getsize(p)//1024}KB')
