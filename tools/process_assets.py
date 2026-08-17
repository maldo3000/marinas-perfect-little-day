#!/usr/bin/env python3
"""Cut game sprites from the source key art: flood-fill the white background
to transparent (from the edges, so white clothing survives), trim, downscale."""
import os
from collections import deque
from PIL import Image

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "art-src")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets")
os.makedirs(OUT, exist_ok=True)

JOBS = [
    ('Marina.png',           'marina.png',     560),
    ('douglas-lobster.png',  'douglas.png',    360),
    ('nespresso.png',        'nespresso.png',  360),
    ('yellow-watermelon.png','watermelon.png', 360),
    ('birthday-cake.png',    'cake.png',       360),
]

def is_bg(px, thresh=235):
    r, g, b, a = px
    if a < 10:
        return True
    return r >= thresh and g >= thresh and b >= thresh

def flood_bg(im, thresh=235):
    w, h = im.size
    p = im.load()
    seen = [[False]*w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h-1):
            if is_bg(p[x, y], thresh) and not seen[y][x]:
                seen[y][x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w-1):
            if is_bg(p[x, y], thresh) and not seen[y][x]:
                seen[y][x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        p[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and is_bg(p[nx, ny], thresh):
                seen[ny][nx] = True; q.append((nx, ny))
    return im

def soften_edge(im):
    """Feather leftover white halo: make near-white pixels adjacent to
    transparency slightly transparent."""
    w, h = im.size
    p = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = p[x, y]
            if a == 0:
                continue
            if r > 225 and g > 225 and b > 225:
                near_hole = False
                for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                    if 0 <= nx < w and 0 <= ny < h and p[nx, ny][3] == 0:
                        near_hole = True; break
                if near_hole:
                    p[x, y] = (r, g, b, 140)
    return im

def despeckle(im, rounds=3):
    """Clear isolated near-white specks the flood fill couldn't reach."""
    w, h = im.size
    for _ in range(rounds):
        p = im.load()
        clears = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = p[x, y]
                if a == 0 or min(r, g, b) < 215:
                    continue
                holes = 0
                for nx in (x-1, x, x+1):
                    for ny in (y-1, y, y+1):
                        if nx == x and ny == y:
                            continue
                        if not (0 <= nx < w and 0 <= ny < h) or p[nx, ny][3] == 0:
                            holes += 1
                if holes >= 5:
                    clears.append((x, y))
        if not clears:
            break
        for x, y in clears:
            p[x, y] = (0, 0, 0, 0)
    return im

def solid_bbox(im, min_alpha=40, min_blob=200):
    """Union bbox of connected components with >= min_blob pixels.
    Drops stray noise while keeping separate real elements (e.g. the plumbob)."""
    w, h = im.size
    a = im.split()[3].load()
    seen = [[False]*w for _ in range(h)]
    best = None
    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or a[sx, sy] < min_alpha:
                continue
            q = deque([(sx, sy)])
            seen[sy][sx] = True
            count = 0
            x0, y0, x1, y1 = sx, sy, sx, sy
            while q:
                x, y = q.popleft()
                count += 1
                x0 = min(x0, x); x1 = max(x1, x)
                y0 = min(y0, y); y1 = max(y1, y)
                for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and a[nx, ny] >= min_alpha:
                        seen[ny][nx] = True; q.append((nx, ny))
            if count >= min_blob:
                if best is None:
                    best = [x0, y0, x1, y1]
                else:
                    best[0] = min(best[0], x0); best[1] = min(best[1], y0)
                    best[2] = max(best[2], x1); best[3] = max(best[3], y1)
    if best is None:
        return im.getbbox()
    return (best[0], best[1], best[2]+1, best[3]+1)

for src_name, out_name, max_dim in JOBS:
    im = Image.open(os.path.join(SRC, src_name)).convert('RGBA')
    im = flood_bg(im)
    im = despeckle(im)
    im = soften_edge(im)
    box = solid_bbox(im)
    im = im.crop(box)
    w, h = im.size
    s = min(1.0, max_dim / max(w, h))
    if s < 1.0:
        im = im.resize((round(w*s), round(h*s)), Image.LANCZOS)
    out_path = os.path.join(OUT, out_name)
    im.save(out_path, optimize=True)
    print(out_name, im.size, f'{os.path.getsize(out_path)//1024}KB')

# head crop for the in-game walker (face + hair, from below the plumbob to the chin)
marina = Image.open(os.path.join(OUT, 'marina.png')).convert('RGBA')
mw, mh = marina.size
head = marina.crop((0, int(mh*0.095), mw, int(mh*0.345)))
head = head.crop(head.getbbox())
head_path = os.path.join(OUT, 'marina-head.png')
head.save(head_path, optimize=True)
print('marina-head.png', head.size, f'{os.path.getsize(head_path)//1024}KB')
