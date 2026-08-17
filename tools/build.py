#!/usr/bin/env python3
"""Build dist/marina-day.html: single self-contained file with game.js and
all key art inlined as data URIs."""
import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ['marina', 'douglas', 'nespresso', 'watermelon', 'head', 'cake',
          'wIdle', 'wDown1', 'wDown2', 'wUp1', 'wUp2', 'wSide1', 'wSide2',
          'fridgeWorld', 'frShut', 'frAjar', 'frOpen1', 'frOpen2',
          'wSideIdle', 'wSidePass', 'wSideSwing', 'wSidePush']
ASSETS.extend(['bg', 'menuBg', 'gymRack', 'gymMat', 'gymTread', 'tapBtn', 'finaleBg', 'hud', 'plumbobArt', 'aspText', 'music'])
FILES = {
    'bg': 'apartment-bg.jpg',
    'menuBg': 'menu-bg.jpg',
    'gymRack': 'gym/rack.png',
    'gymMat': 'gym/mat.png',
    'gymTread': 'gym/treadmill.png',
    'tapBtn': 'tap-to-start.png',
    'finaleBg': 'finale-bg.jpg',
    'hud': 'hud.jpg',
    'plumbobArt': 'plumbob.png',
    'aspText': 'aspiration.png',
    'music': 'music.m4a',
    'wSideIdle': 'walk/marina-idle-side.png',
    'wSidePass': 'walk/marina-walk-side-pass.png',
    'wSideSwing': 'walk/marina-walk-side-swing.png',
    'wSidePush': 'walk/marina-walk-side-push.png',
    'fridgeWorld': 'fridge/fridge-world.png',
    'frShut': 'fridge/fridge-closed.png', 'frAjar': 'fridge/fridge-ajar.png',
    'frOpen1': 'fridge/fridge-open-1.png', 'frOpen2': 'fridge/fridge-open-2.png',
    'head': 'marina-head.png',
    'wIdle': 'walk/marina-idle.png',
    'wDown1': 'walk/marina-walk-down-1.png', 'wDown2': 'walk/marina-walk-down-2.png',
    'wUp1': 'walk/marina-walk-up-1.png',     'wUp2': 'walk/marina-walk-up-2.png',
    'wSide1': 'walk/marina-walk-side-1.png', 'wSide2': 'walk/marina-walk-side-2.png',
}

uris = {}
for name in ASSETS:
    path = ROOT / 'assets' / FILES.get(name, f'{name}.png')
    mime = ('image/jpeg' if path.suffix.lower() in ('.jpg', '.jpeg')
            else 'audio/mp4' if path.suffix.lower() == '.m4a' else 'image/png')
    uris[name] = f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()

assets_js = 'window.MARINA_ASSETS = {\n' + ',\n'.join(
    f'  {k}: "{v}"' for k, v in uris.items()) + '\n};\n'

game_js = (ROOT / 'game.js').read_text(encoding='utf-8')

html = f'''<meta charset="utf-8">
<title>Marina's Perfect Little Day</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }}
  html, body {{ height:100%; overflow:hidden; background:#1b1526; touch-action:none; overscroll-behavior:none; -webkit-user-select:none; user-select:none; font-family:"Courier New",monospace; }}
  #wrap {{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:#1b1526; touch-action:none; }}
  canvas {{ image-rendering:pixelated; image-rendering:crisp-edges; display:block; }}
</style>
<div id="wrap"><canvas id="game"></canvas></div>
<script>
{assets_js}
{game_js}
</script>
'''

out = ROOT / 'dist' / 'marina-day.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'{out} ({out.stat().st_size // 1024}KB)')
