"""Trace the solid brand artwork, excluding the PNG's raster glow.
Usage: python scripts/vectorize-logo.py path/to/Logo.png
Requires Pillow and numpy. Outputs real paths, never embedded bitmap data.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

pixels = np.array(Image.open(sys.argv[1]).convert('RGBA'))
r, g, b, a = (pixels[:, :, i] for i in range(4))
orange = (a >= 240) & (r > 180) & (g < 160) & (b < 105)
cream = (a >= 240) & (r > 210) & (g > 180) & (b > 110)

def simplify(points, tolerance=1.0):
    if len(points) < 3:
        return points
    start, end = np.array(points[0]), np.array(points[-1])
    delta = end - start
    values = np.array(points)
    distances = np.abs(delta[0] * (start[1] - values[:, 1]) - (start[0] - values[:, 0]) * delta[1]) / max(np.linalg.norm(delta), 1)
    index = int(distances.argmax())
    if distances[index] > tolerance:
        return simplify(points[:index+1], tolerance)[:-1] + simplify(points[index:], tolerance)
    return [points[0], points[-1]]

def trace(mask):
    mask = np.array(Image.fromarray(mask.astype('uint8')*255).filter(ImageFilter.MedianFilter(5))) > 0
    edges = {}
    def add(start, end):
        edges.setdefault(start, []).append(end)
    padded = np.pad(mask, 1)
    for ys, xs, direction in [( *np.where(mask & ~padded[:-2,1:-1]), 'top'), (*np.where(mask & ~padded[2:,1:-1]), 'bottom'), (*np.where(mask & ~padded[1:-1,:-2]), 'left'), (*np.where(mask & ~padded[1:-1,2:]), 'right')]:
        for y, x in zip(ys.tolist(), xs.tolist()):
            if direction == 'top': add((x,y),(x+1,y))
            elif direction == 'right': add((x+1,y),(x+1,y+1))
            elif direction == 'bottom': add((x+1,y+1),(x,y+1))
            else: add((x,y+1),(x,y))
    paths = []
    while edges:
        start = next(iter(edges)); point = start; points = [start]
        while point in edges:
            target = edges[point].pop()
            if not edges[point]: del edges[point]
            point = target
            if point == start: break
            points.append(point)
        if len(points) < 60: continue
        area = abs(sum(p[0]*q[1]-q[0]*p[1] for p,q in zip(points,points[1:]+points[:1])))/2
        if area < 100: continue
        middle = len(points)//2
        points = simplify(points[:middle+1])[:-1]+simplify(points[middle:]+points[:1])[:-1]
        # Slight corner rounding removes pixel stair steps without changing the outline.
        previous = points[-1]; segments = []
        for index,p in enumerate(points):
            nxt = points[(index+1)%len(points)]
            enter = (p[0]*.82+previous[0]*.18,p[1]*.82+previous[1]*.18)
            leave = (p[0]*.82+nxt[0]*.18,p[1]*.82+nxt[1]*.18)
            segments.append(('M' if index==0 else 'L')+f'{enter[0]:.1f} {enter[1]:.1f}Q{p[0]} {p[1]} {leave[0]:.1f} {leave[1]:.1f}')
            previous = p
        paths.append(''.join(segments)+'Z')
    return ''.join(paths)

symbol = orange.copy(); symbol[875:,:] = False
wordmark = orange.copy(); wordmark[:875,:] = False
paths = {'symbol': trace(symbol), 'accent': trace(cream), 'wordmark': trace(wordmark)}
root = Path(__file__).resolve().parent.parent
(root/'src/assets/logoPaths.json').write_text(json.dumps(paths,separators=(',',':')),encoding='utf-8')
def svg(viewbox, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" aria-label="ShapeUp"><style>:root{{--logo-primary:#c84c2b;--logo-accent:#544237;--logo-wordmark:#211a17}}@media(prefers-color-scheme:dark){{:root{{--logo-primary:#e06c43;--logo-accent:#f3dfaa;--logo-wordmark:#f3eae5}}}}</style>{body}</svg>'
def path(key,color):
    return f'<path fill="var(--logo-{color})" fill-rule="evenodd" d="{paths[key]}"/>'
mark = path('accent','accent')+path('symbol','primary')
(root/'src/assets/Logo.svg').write_text(svg('80 80 1120 1110',mark+path('wordmark','wordmark')),encoding='utf-8')
(root/'public/favicon.svg').write_text(svg('110 80 1030 800',mark),encoding='utf-8')
print({key:len(value) for key,value in paths.items()})
