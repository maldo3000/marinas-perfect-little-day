/* =========================================================
   Marina's Perfect Little Day 💚
   A tiny Sims-style birthday game.
   ========================================================= */
'use strict';

/* ---------- Canvas / scaling ---------- */
const TILE = 24;
const GRID_W = 15, GRID_H = 22;          // apartment grid
const HUD_H = 90;
const VW = GRID_W * TILE;                 // 360
const VH = GRID_H * TILE + HUD_H;         // 588
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1, dpr = 1;

function fit() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  const ww = window.innerWidth, wh = window.innerHeight;
  scale = Math.min(ww / VW, wh / VH);
  canvas.style.width = (VW * scale) + 'px';
  canvas.style.height = (VH * scale) + 'px';
  canvas.width = Math.round(VW * scale * dpr);
  canvas.height = Math.round(VH * scale * dpr);
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
fit();
setTimeout(fit, 100); setTimeout(fit, 500);

/* ---------- Palette ---------- */
const C = {
  // modern Toronto condo: concrete + light oak + gray appliances
  wallTop:'#5f5f6a', wallFace:'#a6a6b0', wallShade:'#8e8e99', wallLine:'#96969f',
  floorA:'#d7c7a3', floorB:'#cfbf9b', floorLine:'#c0b08a',
  kitchenA:'#cbcbd2', kitchenB:'#c0c0c8',
  rug:'#e2b7bd', rugDark:'#d2a2a9', rugLight:'#efd0d4',
  gymMat:'#9db8a7', gymMatDark:'#8aa896',
  night:'#141021',
  text:'#fffdf5', textDim:'#cbc3dd',
  green:'#3ec93e', greenDark:'#249424', greenLight:'#8af08a',
  pink:'#ff7ba9', gold:'#ffd45e',
};

/* =========================================================
   Pixel sprite engine: strings -> colored rects
   ========================================================= */
function makeSprite(rows, map, px = 1) {
  const h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w * px; c.height = h * px;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch === '.' || ch === ' ') continue;
    g.fillStyle = map[ch] || '#f0f';
    g.fillRect(x * px, y * px, px, px);
  }
  return c;
}
function flipSprite(spr) {
  const c = document.createElement('canvas');
  c.width = spr.width; c.height = spr.height;
  const g = c.getContext('2d');
  g.translate(spr.width, 0); g.scale(-1, 1);
  g.drawImage(spr, 0, 0);
  return c;
}

/* ---------- Marina sprite (16x24) ---------- */
const M_MAP = {
  h:'#6f4426', H:'#8a5a33', L:'#a06b3e',      // hair
  s:'#f2c9a8', S:'#e3b18d',                   // skin
  e:'#3c6fb2',                                 // eyes
  m:'#d98a80',                                 // mouth
  w:'#f7f3ec', d:'#ddd5c8', D:'#c9bfae',      // white knit
  b:'#2a2530',                                 // bag
  f:'#efe9df',                                 // flats
  n:'#e8c66a',                                 // necklace
};
// facing down, frame A (standing)
const MARINA_DOWN_A = [
'....hhhhhhh.....',
'...hHHHHHHHh....',
'..hHHHHHHHHHh...',
'..hHHssssHHLh...',
'..hHssssssHLh...',
'..hHsessesHLh...',
'..hhsssssshLh...',
'..hhssmssshh....',
'...h.ssss.h.....',
'....wwnnww......',
'...wwwwwwww.....',
'..wwwwwwwwww....',
'..wdwwwwwwdw....',
'..sdwwwwwwds....',
'..sdwwwwwwds....',
'...dwwwwwwd.....',
'...wwwwwwww.....',
'...wwwddwww.....',
'...www..www.....',
'...www..www.....',
'...www..www.....',
'...dww..wwd.....',
'...ff....ff.....',
'................',
];
// facing down, frame B (walk: legs offset)
const MARINA_DOWN_B = [
'....hhhhhhh.....',
'...hHHHHHHHh....',
'..hHHHHHHHHHh...',
'..hHHssssHHLh...',
'..hHssssssHLh...',
'..hHsessesHLh...',
'..hhsssssshLh...',
'..hhssmssshh....',
'...h.ssss.h.....',
'....wwnnww......',
'...wwwwwwww.....',
'..wwwwwwwwww....',
'..wdwwwwwwdw....',
'..sdwwwwwwds....',
'..sdwwwwwwds....',
'...dwwwwwwd.....',
'...wwwwwwww.....',
'...wwwddwww.....',
'...www..www.....',
'...ww....www....',
'..www....ww.....',
'..dw......wd....',
'..ff......ff....',
'................',
];
const MARINA_UP_A = [
'....hhhhhhh.....',
'...hHHHHHHHh....',
'..hHHHHHHHHHh...',
'..hHHHHHHHHHh...',
'..hHHHHHHHHLh...',
'..hHHHHHHHHLh...',
'..hhHHHHHHhLh...',
'..hhHHHHHHhh....',
'...hhHHHHhh.....',
'....wwwwww......',
'...wwwwwwww.....',
'..wwwwwwwwww....',
'..wdwwwwwwdw....',
'..sdwwwwwwds....',
'..sdwwwwwwds....',
'...dwwwwwwd.....',
'...wwwwwwww.....',
'...wwwddwww.....',
'...www..www.....',
'...www..www.....',
'...www..www.....',
'...dww..wwd.....',
'...ff....ff.....',
'................',
];
const MARINA_UP_B = MARINA_UP_A.map((r,i)=> (i>=18 ? MARINA_DOWN_B[i] : r));
const MARINA_SIDE_A = [
'....hhhhhh......',
'...hHHHHHHh.....',
'..hHHHHHHHHh....',
'..hHHHssssih....',
'..hHHssssssh....',
'..hHHsseessh....',
'..hhHssssss.....',
'..hhHsssms......',
'...hhssss.......',
'....wwwww.......',
'...wwwwwww......',
'..bwwwwwwww.....',
'..bdwwwwwwd.....',
'..bbwwwwwws.....',
'..bbwwwwwws.....',
'...bwwwwwwd.....',
'...bbwwwww......',
'...wwwddww......',
'....www.ww......',
'....www.ww......',
'....www.ww......',
'....dww.wd......',
'....ff..ff......',
'................',
];
const MARINA_SIDE_B = [
'....hhhhhh......',
'...hHHHHHHh.....',
'..hHHHHHHHHh....',
'..hHHHssssih....',
'..hHHssssssh....',
'..hHHsseessh....',
'..hhHssssss.....',
'..hhHsssms......',
'...hhssss.......',
'....wwwww.......',
'...wwwwwww......',
'..bwwwwwwww.....',
'..bdwwwwwwd.....',
'..bbwwwwwws.....',
'..bbwwwwwws.....',
'...bwwwwwwd.....',
'...bbwwwww......',
'...wwwddww......',
'....wwwww.......',
'...www..ww......',
'...ww...www.....',
'...fd....wd.....',
'.........ff.....',
'................',
];
// jumping-jack "X pose": arms raised, legs apart (20x24)
const MARINA_JACK_UP = [
'....................',
'.ss..............ss.',
'.ww..............ww.',
'.ww...hhhhhhh....ww.',
'.ww..hHHHHHHHh...ww.',
'..wwhHHHHHHHHHh.ww..',
'..wwhHHssssHHLh.ww..',
'...whHssssssHLh.w...',
'...whHsessesHLhw....',
'....hhsssssshLh.....',
'....hhssmssshh......',
'.....h.ssss.h.......',
'......wwnnww........',
'.....wwwwwwwww......',
'....wwwwwwwwwww.....',
'....wdwwwwwwwdw.....',
'.....dwwwwwwwd......',
'.....wwwwwwwww......',
'.....wwwddwww.......',
'....www....www......',
'...www......www.....',
'...www......www.....',
'..dww........wwd....',
'..ff..........ff....',
];
M_MAP.i = M_MAP.s;
const SPR = {
  down:[makeSprite(MARINA_DOWN_A,M_MAP), makeSprite(MARINA_DOWN_B,M_MAP)],
  up:[makeSprite(MARINA_UP_A,M_MAP), makeSprite(MARINA_UP_B,M_MAP)],
  right:[makeSprite(MARINA_SIDE_A,M_MAP), makeSprite(MARINA_SIDE_B,M_MAP)],
  jack:makeSprite(MARINA_JACK_UP,M_MAP),
};
SPR.left = [flipSprite(SPR.right[0]), flipSprite(SPR.right[1])];

/* ---------- Hi-res key art (real assets, loaded async) ---------- */
const ART = {};
const ART_SRC = window.MARINA_ASSETS || {
  marina:'assets/marina.png', douglas:'assets/douglas.png',
  nespresso:'assets/nespresso.png', watermelon:'assets/watermelon.png',
  head:'assets/marina-head.png',
  cake:'assets/cake.png',
  bg:'assets/apartment-bg.jpg',
  menuBg:'assets/menu-bg.jpg',
  gymRack:'assets/gym/rack.png',
  gymMat:'assets/gym/mat.png',
  gymTread:'assets/gym/treadmill.png',
  tapBtn:'assets/tap-to-start.png',
  finaleBg:'assets/finale-bg.jpg',
  hud:'assets/hud.jpg',
  plumbobArt:'assets/plumbob.png',
  aspText:'assets/aspiration.png',
  wIdle:'assets/walk/marina-idle.png',
  wDown1:'assets/walk/marina-walk-down-1.png', wDown2:'assets/walk/marina-walk-down-2.png',
  wUp1:'assets/walk/marina-walk-up-1.png',     wUp2:'assets/walk/marina-walk-up-2.png',
  wSide1:'assets/walk/marina-walk-side-1.png', wSide2:'assets/walk/marina-walk-side-2.png',
  wSideIdle:'assets/walk/marina-idle-side.png',
  wSidePass:'assets/walk/marina-walk-side-pass.png',
  wSideSwing:'assets/walk/marina-walk-side-swing.png',
  wSidePush:'assets/walk/marina-walk-side-push.png',
  fridgeWorld:'assets/fridge/fridge-world.png',
  frShut:'assets/fridge/fridge-closed.png', frAjar:'assets/fridge/fridge-ajar.png',
  frOpen1:'assets/fridge/fridge-open-1.png', frOpen2:'assets/fridge/fridge-open-2.png',
};
const CACHE_BUST = (!window.MARINA_ASSETS && window.DEV_CACHE_BUST) ? '?v='+window.DEV_CACHE_BUST : '';
for (const k in ART_SRC) {
  if (k === 'music') continue;   // audio, not an image
  const im = new Image();
  im.onload = () => { ART[k] = im; };
  im.src = ART_SRC[k] + CACHE_BUST;
}
// draw key art centered at (cx,cy) scaled to targetH; false if not loaded yet
function drawArt(key, cx, cy, targetH, flip) {
  const im = ART[key]; if (!im) return false;
  const w = im.width * (targetH / im.height);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (flip) {
    ctx.save();
    ctx.translate(Math.round(cx), 0); ctx.scale(-1, 1);
    ctx.drawImage(im, Math.round(-w/2), Math.round(cy - targetH/2), Math.round(w), Math.round(targetH));
    ctx.restore();
  } else {
    ctx.drawImage(im, Math.round(cx - w/2), Math.round(cy - targetH/2), Math.round(w), Math.round(targetH));
  }
  ctx.imageSmoothingEnabled = false;
  return true;
}

// draw key art scaled to targetH, anchored bottom-center at (cx, bottomY);
// feet-anchoring keeps the walk frames aligned despite per-frame crop drift
function drawArtBottom(key, cx, bottomY, targetH, flip) {
  const im = ART[key]; if (!im) return false;
  return drawArt(key, cx, bottomY - targetH/2, targetH, flip);
}
// pick the current walk frame; null if walk art not loaded yet
const SIDE_CYCLE = ['wSide1','wSidePush','wSidePass','wSide2','wSideSwing','wSidePass'];
function sideHasCycle() { return ART.wSidePass && ART.wSideSwing && ART.wSidePush; }
function walkFrame(facing, moving, animT) {
  if (!ART.wIdle || !ART.wDown1 || !ART.wSide1 || !ART.wUp1) return null;
  const f = Math.floor(animT*6)%2;
  switch (facing) {
    case 'down':  return moving ? (f? 'wDown2':'wDown1') : 'wIdle';
    case 'up':    return moving ? (f? 'wUp2':'wUp1') : 'wUp1';
    case 'right':
    case 'left': {
      if (!moving) return ART.wSideIdle ? 'wSideIdle' : 'wSide1';
      if (sideHasCycle()) return SIDE_CYCLE[Math.floor(animT*10)%SIDE_CYCLE.length];
      return f? 'wSide2':'wSide1';
    }
  }
  return 'wIdle';
}

/* ---------- Douglas the lobster plush (20x12) ---------- */
const DOUG_MAP = { r:'#e33434', R:'#f25555', d:'#b32020', e:'#1b1b1b', w:'#ffffff', p:'#f78787' };
const DOUGLAS = makeSprite([
'......RRRRR..rrr....',
'..RR.RRRRRRR.rrrr...',
'.RRRRRRRRRRRR.rrr...',
'RRRRRReRRReRR..rr...',
'RRRRRReRRReRRR.rrr..',
'.RRRRRRRRRRRRR.rrr..',
'.RRRRRRppRRRRRRrrr..',
'RRRRRdRRRRdRRRRrr...',
'RRRRRddddddRRRRr....',
'.RRRR.dddd.RRRR.....',
'..RR........RR......',
'....................',
], DOUG_MAP);

/* ---------- Yellow watermelon slice (14x10) ---------- */
const MELON_MAP = { g:'#2e7d32', G:'#66bb4a', y:'#ffd93b', Y:'#ffe873', s:'#5d4022', w:'#f7f2df' };
const MELON = makeSprite([
'.....yyyy.....',
'...yyYYYYyy...',
'..yYYsYYsYYy..',
'.yYYYYYYYYYYy.',
'.yYsYYYYsYYYy.',
'wyyYYYsYYYyyw.',
'wwyyyyyyyyyww.',
'.GwwwwwwwwwG..',
'.gGGGGGGGGGg..',
'..gggggggg....',
], MELON_MAP);

/* ---------- Nespresso machine (12x14) ---------- */
const NESP_MAP = { k:'#17171c', K:'#2c2c35', G:'#4a4a58', s:'#c9ced8', S:'#9aa0ad', c:'#fdf8ec', o:'#e8a13c', m:'#8d8d99' };
const NESPRESSO = makeSprite([
'..kkkkkkk...',
'.kKKKKKKkss.',
'.kKGKKKKkss.',
'.kkkKKKKkss.',
'..kkKKKKkss.',
'.kmkKKKKkss.',
'....KKKKkss.',
'.cc.KKKKkss.',
'cocckKKKkss.',
'ccccKKKKkss.',
'.kkkkkkkkss.',
'.kSSSSSSks..',
'.kkkkkkkkk..',
'............',
], NESP_MAP);

/* ---------- Plumbob (9x12) ---------- */
const PLUMB_MAP = { g:'#249424', G:'#3ec93e', L:'#8af08a', l:'#c8ffc8' };
const PLUMBOB = makeSprite([
'....G....',
'...GLG...',
'..GLlLG..',
'.GLlllLG.',
'.GLllLLG.',
'..GLLLg..',
'..gGLGg..',
'...gGg...',
'...gGg...',
'....g....',
'.........',
'.........',
], PLUMB_MAP);

/* ---------- Cake (16x14) ---------- */
const CAKE_MAP = { p:'#f7a8c1', P:'#fbc6d7', w:'#fff6f8', c:'#e98aa8', y:'#ffd45e', o:'#ff9d3c', b:'#8a4b2d', f:'#ff5d8f' };
const CAKE = makeSprite([
'....y..y..y.....',
'....o..o..o.....',
'....w..w..w.....',
'....w..w..w.....',
'..wwwwwwwwww....',
'..wPPPPPPPPw....',
'..PPPPPPPPPP....',
'..cPcPcPcPcP....',
'.wwwwwwwwwwww...',
'.wPPPPPPPPPPw...',
'.PPPPPPPPPPPP...',
'.cPccPccPccPP...',
'.PPPPPPPPPPPP...',
'.bbbbbbbbbbbb...',
], CAKE_MAP);

/* =========================================================
   Apartment map
   0 floor wood, 1 wall, 2 rug, 3 kitchen tile, 4 gym mat
   ========================================================= */
const W=1, F=0, R=2, K=3, G=4;
const MAP = [];
(function buildMap(){
  for (let y=0;y<GRID_H;y++){ MAP[y]=[]; for(let x=0;x<GRID_W;x++){
    let t=F;
    if (x===0||x===GRID_W-1||y===0||y===GRID_H-1) t=W;
    MAP[y][x]=t;
  }}
  // painted-background layout: window band is deep (row 1) and the left wall is thick (col 1)
  for (let x=1;x<GRID_W-1;x++) MAP[1][x]=W;
  for (let y=1;y<GRID_H-1;y++) MAP[y][1]=W;
  // fallback-only floor zones (invisible when the painted background is loaded)
  for (let y=2;y<=8;y++) for (let x=9;x<GRID_W-1;x++) MAP[y][x]=K;
  for (let y=10;y<=15;y++) for (let x=9;x<GRID_W-1;x++) MAP[y][x]=G;
  // living room rug
  for (let y=15;y<=18;y++) for (let x=2;x<=6;x++) MAP[y][x]=R;
})();

/* Solid map for furniture (marked when objects placed) */
const SOLID = [];
for (let y=0;y<GRID_H;y++){ SOLID[y]=[]; for(let x=0;x<GRID_W;x++) SOLID[y][x] = MAP[y][x]===W; }

/* =========================================================
   Game state
   ========================================================= */
const TASKS = [
  { id:'douglas',  name:'Pet Douglas',          moodlet:'Comforted',   icon:'🦞' },
  { id:'espresso', name:'Make an Espresso',     moodlet:'Caffeinated', icon:'☕' },
  { id:'melon',    name:'Eat Yellow Watermelon',moodlet:'Little Treat',icon:'🍉' },
  { id:'journal',  name:'Write in Her Journal', moodlet:'Clear Mind',  icon:'📓' },
  { id:'nap',      name:'Take a Nap',           moodlet:'Cozy',        icon:'💤' },
  { id:'gym',      name:'Go to the Gym',        moodlet:'Strong Girl', icon:'💪' },
];
const state = {
  scene:'menu',          // menu | game | aspiration | birthday
  done:{},               // taskId -> true
  t:0,                   // global time (s)
  sceneT:0,
  particles:[],
  toasts:[],
  confetti:[],
  tasksOpen:false,
  musicOn:false, musicPrompt:false, musicVol:2,
  pendingJingle:0,
  napFade:0,
  interaction:null,      // {task, obj, t, dur}
  finaleStep:0,
};
try {
  const saved = JSON.parse(localStorage.getItem('marina-day') || '{}');
  if (saved && typeof saved === 'object') state.done = saved.done || {};
} catch(e){}
function saveGame(){ try{ localStorage.setItem('marina-day', JSON.stringify({done:state.done})); }catch(e){} }
function doneCount(){ return TASKS.filter(t=>state.done[t.id]).length; }

/* =========================================================
   Objects (furniture + interactables)
   ========================================================= */
function px(gx){ return gx*TILE; }
function py(gy){ return gy*TILE + HUD_H; }

// Positions match the painted background (art-src/apartment-bg.png).
// bg:true = the furniture is part of the painted background; the game only
// draws hint markers (and any live overlays) for it.
const OBJECTS = [
  // ---- sleep nook (top left) ----
  { id:'bed', x:2, y:2, w:3, h:6, solid:true, task:'nap', bg:true,
    stand:{x:5,y:5}, face:'left', label:'Take a Nap', dur:4.5 },
  { id:'shelfTop', x:5, y:2, w:4, h:2, solid:true, bg:true },
  // ---- kitchen (top right) ----
  { id:'kcounter', x:9, y:2, w:5, h:3, solid:true, bg:true },
  { id:'kcabinet', x:12, y:5, w:2, h:2, solid:true, bg:true },
  { id:'nespresso', x:12, y:3, w:1, h:1, solid:false, task:'espresso',
    stand:{x:11,y:5}, face:'up', label:'Make Espresso', dur:5 },
  { id:'fridge', x:13, y:7, w:1, h:2, solid:true, task:'melon',
    stand:{x:12,y:8}, face:'right', label:'Eat Watermelon', dur:5 },
  // ---- centre bookshelf (with the little stereo on top) ----
  { id:'bookshelf', x:6, y:10, w:3, h:2, solid:true, bg:true },
  { id:'stereo', x:7, y:10, w:1, h:1, solid:false },
  // ---- gym (right middle, on the painted mat) ----
  { id:'gymRackObj', x:10, y:11, w:4, h:1, solid:true },
  { id:'gymMatObj', x:10, y:13, w:1, h:4, solid:false },
  { id:'gymTreadObj', x:12, y:12, w:2, h:4, solid:true, task:'gym',
    stand:{x:11,y:14}, face:'right', label:'Work Out', dur:5 },
  // ---- journal desk (left wall) ----
  { id:'deskL', x:1, y:13, w:1, h:3, solid:true, task:'journal', bg:true,
    stand:{x:2,y:14}, face:'left', label:'Write in Journal', dur:3.5 },
  // ---- living area (bottom) ----
  { id:'douglasObj', x:4, y:17, w:1, h:1, solid:false, task:'douglas',
    stand:{x:4,y:18}, face:'up', label:'Pet Douglas', dur:4.5 },
  { id:'plantBR', x:13, y:20, w:1, h:1, solid:true, bg:true },
];
for (const o of OBJECTS) {
  if (o.solid) for (let yy=o.y; yy<o.y+o.h; yy++) for (let xx=o.x; xx<o.x+o.w; xx++)
    if (yy>=0&&yy<GRID_H&&xx>=0&&xx<GRID_W) SOLID[yy][xx]=true;
}
function taskObj(taskId){ return OBJECTS.find(o=>o.task===taskId); }

/* =========================================================
   Player
   ========================================================= */
const player = {
  gx:7, gy:13,          // grid pos (float px pos derived)
  x:7*TILE+TILE/2, y:13*TILE+TILE/2,
  path:[], facing:'down', moving:false, animT:0,
  speed:78,             // px/sec
  hidden:false,
  pending:null,         // task to run at path end
};

/* ---------- BFS pathfinding ---------- */
function findPath(sx, sy, tx, ty) {
  if (sx===tx && sy===ty) return [];
  const prev = {}, q=[[sx,sy]], seen=new Set([sx+','+sy]);
  while (q.length) {
    const [cx,cy]=q.shift();
    for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx=cx+dx, ny=cy+dy;
      if (nx<0||ny<0||nx>=GRID_W||ny>=GRID_H) continue;
      if (SOLID[ny][nx]) continue;
      const k=nx+','+ny;
      if (seen.has(k)) continue;
      seen.add(k); prev[k]=[cx,cy];
      if (nx===tx&&ny===ty) {
        const path=[[nx,ny]];
        let cur=prev[k];
        while (cur && !(cur[0]===sx&&cur[1]===sy)) { path.unshift(cur); cur=prev[cur[0]+','+cur[1]]; }
        return path;
      }
      q.push([nx,ny]);
    }
  }
  return null;
}

let tapMarker = null; // {x,y,t}
function walkTo(tx, ty, thenTask) {
  if (state.interaction) return;
  const sx = Math.floor(player.x / TILE), sy = Math.floor(player.y / TILE);
  const path = findPath(sx, sy, tx, ty);
  if (path === null) return;
  player.path = path;
  player.pending = thenTask || null;
  if (path.length === 0 && thenTask) startInteraction(thenTask);
  tapMarker = {x:tx, y:ty, t:0};
}

/* =========================================================
   Interactions
   ========================================================= */
function startInteraction(taskId) {
  const obj = taskObj(taskId);
  const task = TASKS.find(t=>t.id===taskId);
  player.facing = obj.face;
  player.moving = false;
  state.musicPrompt = false;
  state.interaction = { task, obj, t:0, dur:obj.dur, lastFrame:0, lastTick:0 };
  if (['nap','gym','douglas','espresso','melon'].includes(taskId)) player.hidden = true;
}
function finishInteraction() {
  const it = state.interaction;
  state.interaction = null;
  player.hidden = false;
  if (!state.done[it.task.id]) {
    state.done[it.task.id] = true;
    saveGame();
    addToast('+ ' + it.task.moodlet, it.task.icon);
    chime();
  } else {
    addToast(it.task.moodlet + ' (again!)', it.task.icon);
    chime();
  }
  burst(player.x, py(0)+player.y - 30, C.green);
  if (doneCount() === TASKS.length) {
    setTimeout(()=>{ setScene('aspiration'); fanfare(); }, 900);
  }
}

/* ---------- toasts (moodlet popups) ---------- */
function addToast(text, icon) { state.toasts.push({text, icon, t:0}); }

/* ---------- particles ---------- */
function burst(x, y, color) {
  for (let i=0;i<14;i++) state.particles.push({
    x, y, vx:(Math.random()-0.5)*90, vy:-Math.random()*90-25,
    t:0, life:0.8+Math.random()*0.5, color, kind:'spark'
  });
}
function floatSym(x, y, sym) {
  state.particles.push({ x:x+(Math.random()-0.5)*16, y, vx:(Math.random()-0.5)*8, vy:-26, t:0, life:1.4, sym, kind:'sym' });
}

/* =========================================================
   Audio (tiny WebAudio synth)
   ========================================================= */
let AC = null;
/* One mixer for everything: effects and music share a single AudioContext, so
   the browser can't duck one against the other. Effects also sidechain the
   music down for a moment so they always cut through. */
let SFX = null, MUSIC_GAIN = null, musicSrc = null;
function audio() {
  if (!AC) {
    try {
      AC = new (window.AudioContext||window.webkitAudioContext)();
      SFX = AC.createGain(); SFX.gain.value = 2.2;
      SFX.connect(AC.destination);
      MUSIC_GAIN = AC.createGain(); MUSIC_GAIN.gain.value = musicVolume();
      MUSIC_GAIN.connect(AC.destination);
    } catch(e){}
    // iOS: play through the media channel so the silent switch doesn't mute effects
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch(e){}
  }
  if (AC && AC.state==='suspended') AC.resume();
  return AC;
}
// route the <audio> element into our graph (once), so one gain rules the music
function wireMusic() {
  const ac = audio();
  if (!ac || !music || musicSrc || !MUSIC_GAIN) return;
  try {
    musicSrc = ac.createMediaElementSource(music);
    musicSrc.connect(MUSIC_GAIN);
    music.volume = 1;                 // level now lives on MUSIC_GAIN
    MUSIC_GAIN.gain.value = musicVolume();
  } catch(e) { /* fall back to element volume */ }
}
// briefly dip the music so a sound effect is never buried
function duck(depth = 0.3, hold = 0.22) {
  if (!AC || !MUSIC_GAIN || !state.musicOn) return;
  const g = MUSIC_GAIN.gain, now = AC.currentTime, base = musicVolume();
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(base*depth, now + 0.05);
  g.setValueAtTime(base*depth, now + 0.05 + hold);
  g.linearRampToValueAtTime(base, now + 0.05 + hold + 0.3);
}
function beep(freq, t0, dur, vol, type) {
  const ac = audio(); if (!ac) return;
  const go = () => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type||'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, ac.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t0 + dur);
    o.connect(g); g.connect(SFX || ac.destination);
    o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.05);
  };
  // never schedule against a frozen clock: on the very first tap the context
  // may still be waking up — play the note the moment it's actually running
  if (ac.state === 'running') go();
  else ac.resume().then(go).catch(()=>{});
}
function chime(){ duck(); beep(660,0,0.12,0.12); beep(880,0.09,0.16,0.12); beep(1320,0.18,0.25,0.10); }
/* soft, slow breathing while she naps */
function snore() {
  const ac = audio(); if (!ac) return;
  const go = () => {
    duck(0.45, 0.6);
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(68, t);
    o.frequency.linearRampToValueAtTime(104, t+0.5);
    o.frequency.linearRampToValueAtTime(62, t+1.15);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.17, t+0.45);
    g.gain.linearRampToValueAtTime(0.0001, t+1.2);
    o.connect(g); g.connect(SFX || ac.destination);
    o.start(t); o.stop(t+1.25);
    beep(1750, 0.15, 0.5, 0.012, 'sine');    // faint airy 'zzz' on top
  };
  if (ac.state === 'running') go();
  else ac.resume().then(go).catch(()=>{});
}
/* cheerful little flourish when the day begins */
function startJingle() {
  duck(0.25, 0.5);
  [523.25, 659.25, 783.99, 1046.5].forEach((f,i) => {
    beep(f, i*0.085, 0.30, 0.13, 'triangle');
    beep(f*2, i*0.085, 0.16, 0.04, 'sine');
  });
  beep(1318.5, 0.34, 0.55, 0.11, 'triangle');
  beep(659.25, 0.34, 0.55, 0.06, 'sine');
}

/* ---------- music (optional, via the little stereo) ---------- */
const MUSIC_SRC = (window.MARINA_ASSETS && window.MARINA_ASSETS.music) || 'assets/music.m4a';
let music = null;
function setMusic(on) {
  if (on) {
    if (!music) {
      music = new Audio();
      music.crossOrigin = 'anonymous';   // must precede src for the graph hookup
      music.src = MUSIC_SRC;
      music.loop = true;
      music.volume = musicVolume();
    }
    wireMusic();
    if (music.paused) music.play().catch(()=>{});
    state.musicOn = true;
    applyMusicVolume();
    addToast('music on', '🎵');
  } else {
    if (music) music.pause();
    state.musicOn = false;
    addToast('music off', '🔇');
  }
  chime();
}
function applyMusicVolume() {
  if (MUSIC_GAIN && musicSrc) {
    // clear any in-flight duck ramp so the new level takes effect cleanly
    if (AC) MUSIC_GAIN.gain.cancelScheduledValues(AC.currentTime);
    MUSIC_GAIN.gain.value = musicVolume();
  } else if (music) music.volume = musicVolume();
}
function stopMusic() {
  if (music && !music.paused) music.pause();
  state.musicOn = false;
}
// music sits *under* the effects: level 1–5 maps to a gentle 0.08–0.40
function musicVolume() { return 0.08 + (state.musicVol-1)/4 * 0.32; }
/* little on/off + volume popup shown above the stereo */
function musicPopRect() {
  const w = 140, h = 88;
  const cx = px(7)+12;
  return { x0: cx-w/2, y0: py(10)-h-14, w, h, cx };
}
// tap zones inside the popup, so drawing and hit-testing can't drift apart
function musicZones() {
  const {x0, y0, w} = musicPopRect();
  return {
    on:    {x: x0+10,  y: y0+24, w: 55, h: 20},
    off:   {x: x0+75,  y: y0+24, w: 55, h: 20},
    minus: {x: x0+10,  y: y0+54, w: 26, h: 24},
    plus:  {x: x0+104, y: y0+54, w: 26, h: 24},
    pips:  {x: x0+42,  y: y0+54, w: 56, h: 24},
  };
}
const inZone = (z, x, y) => x>=z.x && x<=z.x+z.w && y>=z.y && y<=z.y+z.h;
function drawMusicPrompt() {
  const {x0, y0, w, h, cx} = musicPopRect();
  rect(x0-2, y0-2, w+4, h+4, '#141021');
  rect(x0, y0, w, h, '#241c36');
  rect(x0, y0, w, 3, '#f28cbe');
  rect(cx-4, y0+h, 8, 5, '#241c36');                       // nub pointing at the stereo
  text('♪ music?', cx, y0+13, 10, '#f2b8d8', 'center', true);
  const z = musicZones(), onSel = state.musicOn;
  // on / off
  rect(z.on.x, z.on.y, z.on.w, z.on.h, onSel ? '#1e3a1e' : '#3a3350');
  ctx.strokeStyle = onSel ? C.green : '#4d4570'; ctx.lineWidth = 1.5;
  ctx.strokeRect(z.on.x+0.5, z.on.y+0.5, z.on.w-1, z.on.h-1);
  text('on', z.on.x+z.on.w/2, z.on.y+10, 10, onSel ? C.greenLight : C.text, 'center', true);
  rect(z.off.x, z.off.y, z.off.w, z.off.h, !onSel ? '#3a2430' : '#3a3350');
  ctx.strokeStyle = !onSel ? '#f28cbe' : '#4d4570';
  ctx.strokeRect(z.off.x+0.5, z.off.y+0.5, z.off.w-1, z.off.h-1);
  text('off', z.off.x+z.off.w/2, z.off.y+10, 10, !onSel ? '#f2b8d8' : C.text, 'center', true);
  // volume: clear − and + buttons with a five-pip level readout
  const stepBtn = (zz, label, enabled) => {
    rect(zz.x, zz.y, zz.w, zz.h, enabled ? '#3a3350' : '#2a2440');
    ctx.strokeStyle = enabled ? '#f28cbe' : '#3a3350'; ctx.lineWidth = 1.5;
    ctx.strokeRect(zz.x+0.5, zz.y+0.5, zz.w-1, zz.h-1);
    text(label, zz.x+zz.w/2, zz.y+zz.h/2, 15, enabled ? '#f2b8d8' : '#544c72', 'center', true);
  };
  stepBtn(z.minus, '−', state.musicVol > 1);
  stepBtn(z.plus,  '+', state.musicVol < 5);
  for (let i=0;i<5;i++) {
    const lit = i < state.musicVol;
    rect(z.pips.x+i*11, z.pips.y+7, 8, 10, lit ? C.green : '#3a3350');
    if (lit) rect(z.pips.x+i*11, z.pips.y+7, 8, 3, C.greenLight);
  }
}
function fanfare(){ [523,659,784,1047].forEach((f,i)=>beep(f,i*0.12,0.3,0.13)); }
function birthdayJingle() {
  // Happy Birthday melody (public domain)
  const N = {C:523.25, D:587.33, E:659.25, F:698.46, G:783.99, A:880, Bb:932.33, C2:1046.5};
  const seq = [
    [N.C,.25],[N.C,.25],[N.D,.5],[N.C,.5],[N.F,.5],[N.E,1],
    [N.C,.25],[N.C,.25],[N.D,.5],[N.C,.5],[N.G,.5],[N.F,1],
    [N.C,.25],[N.C,.25],[N.C2,.5],[N.A,.5],[N.F,.5],[N.E,.5],[N.D,1],
    [N.Bb,.25],[N.Bb,.25],[N.A,.5],[N.F,.5],[N.G,.5],[N.F,1.4],
  ];
  let t = 0.15; const beat = 0.42;
  for (const [f,d] of seq) { beep(f, t, d*beat*0.95, 0.14, 'triangle'); beep(f/2, t, d*beat*0.95, 0.05, 'sine'); t += d*beat; }
}

/* =========================================================
   Input
   ========================================================= */
canvas.addEventListener('pointerdown', (e) => {
  audio();
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / scale;
  const y = (e.clientY - r.top) / scale;
  handleTap(x, y);
});
// Bulletproof audio unlock: browsers disagree on which gesture counts, so we
// try them all, and play a one-sample silent buffer inside the gesture — the
// canonical trick that flips iOS's audio hardware to "on".
function unlockAudio() {
  const ac = audio(); if (!ac || ac.state === 'running') return;
  ac.resume().catch(()=>{});
  try {
    const s = ac.createBufferSource();
    s.buffer = ac.createBuffer(1, 1, 22050);
    s.connect(ac.destination); s.start(0);
  } catch(e){}
}
['pointerdown','pointerup','touchstart','touchend','click','keydown'].forEach(ev =>
  window.addEventListener(ev, unlockAudio, {passive:true}));

/* ---------- keyboard (desktop): WASD/arrows to move, E/Space to interact ---------- */
const KEYS = {};
function keyDir(key) {
  switch (key) {
    case 'w': case 'W': case 'ArrowUp': return 'up';
    case 's': case 'S': case 'ArrowDown': return 'down';
    case 'a': case 'A': case 'ArrowLeft': return 'left';
    case 'd': case 'D': case 'ArrowRight': return 'right';
  }
  return null;
}
window.addEventListener('keydown', (e) => {
  const dir = keyDir(e.key);
  const isInteract = e.key===' ' || e.key==='e' || e.key==='E' || e.key==='Enter';
  if (!dir && !isInteract) return;
  e.preventDefault();
  audio();
  if (state.scene !== 'game') {
    if (state.scene==='menu') { setScene('game'); state.pendingJingle = performance.now(); }
    else if (state.scene==='aspiration' && state.sceneT>1.2) { setScene('birthday'); birthdayJingle(); }
    else if (state.scene==='birthday' && state.sceneT>2) burstConfetti(24);
    return;
  }
  if (dir) KEYS[dir] = true;
  if (isInteract) tryInteractKey();
});
window.addEventListener('keyup', (e) => {
  const dir = keyDir(e.key);
  if (dir) KEYS[dir] = false;
});
window.addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; });

function collides(cx, cy, r) {
  for (const [ox,oy] of [[-r,-r],[r,-r],[-r,r],[r,r]]) {
    const tx = Math.floor((cx+ox)/TILE), ty = Math.floor((cy+oy)/TILE);
    if (tx<0||ty<0||tx>=GRID_W||ty>=GRID_H||SOLID[ty][tx]) return true;
  }
  return false;
}
function keyboardMove(dt) {
  let dx=0, dy=0;
  if (KEYS.up) dy-=1; if (KEYS.down) dy+=1;
  if (KEYS.left) dx-=1; if (KEYS.right) dx+=1;
  if (!dx && !dy) return false;
  const len = Math.hypot(dx,dy); dx/=len; dy/=len;
  state.musicPrompt = false;
  const step = player.speed*dt;
  if (dx) player.facing = dx>0 ? 'right' : 'left';
  else player.facing = dy>0 ? 'down' : 'up';
  const r = 6;
  const nx = player.x + dx*step;
  if (!collides(nx, player.y, r)) player.x = nx;
  const ny = player.y + dy*step;
  if (!collides(player.x, ny, r)) player.y = ny;
  player.moving = true; player.animT += dt;
  return true;
}
// E/Space: interact with the nearest task object within one tile
function tryInteractKey() {
  if (state.interaction || state.tasksOpen) return;
  const ptx = Math.floor(player.x/TILE), pty = Math.floor(player.y/TILE);
  let best=null, bestD=99;
  for (const o of OBJECTS) {
    if (!o.task) continue;
    const ddx = Math.max(o.x-ptx, 0, ptx-(o.x+o.w-1));
    const ddy = Math.max(o.y-pty, 0, pty-(o.y+o.h-1));
    const d = Math.max(ddx, ddy);
    if (d<=1 && d<bestD) { best=o; bestD=d; }
  }
  if (best) { player.path=[]; player.pending=null; startInteraction(best.task); return; }
  // no task nearby — maybe the stereo
  const st = OBJECTS.find(o=>o.id==='stereo');
  if (st && Math.abs(st.x-ptx)<=1 && Math.abs(st.y-pty)<=2) {
    player.facing = 'up'; state.musicPrompt = true;
  }
}

function handleTap(x, y) {
  if (state.scene === 'menu') {
    const onReset = ART.menuBg ? (y < 42 && x > VW-112)
                               : (y > VH-40 && x > VW/2-70 && x < VW/2+70);
    if (doneCount()>0 && onReset) {
      state.done = {}; saveGame(); stopMusic(); chime(); return;
    }
    setScene('game'); state.pendingJingle = performance.now(); unlockAudio(); return;
  }
  if (state.scene === 'aspiration') {
    if (state.sceneT > 1.2) { setScene('birthday'); birthdayJingle(); }
    return;
  }
  if (state.scene === 'birthday') {
    // reset pill takes priority over the confetti tap
    if (state.sceneT > 2 && y > VH-31 && y < VH-5 && x > VW/2-40 && x < VW/2+40) {
      state.done = {}; saveGame(); stopMusic();
      player.path = []; player.pending = null;
      setScene('menu'); chime();
      return;
    }
    if (state.sceneT > 2) burstConfetti(24);
    return;
  }
  // ----- game scene -----
  if (state.interaction) return;
  // music popup: pick on/off (closes), or tap a volume bar (stays open)
  if (state.musicPrompt) {
    const z = musicZones();
    // − / + step the volume and keep the popup open
    if (inZone(z.minus, x, y) || inZone(z.plus, x, y)) {
      const dir = inZone(z.plus, x, y) ? 1 : -1;
      const nv = Math.min(5, Math.max(1, state.musicVol + dir));
      if (nv !== state.musicVol) {
        state.musicVol = nv;
        applyMusicVolume();
        beep(320 + nv*110, 0, 0.08, 0.10);
      }
      return;
    }
    if (inZone(z.on, x, y)) setMusic(true);
    else if (inZone(z.off, x, y)) setMusic(false);
    state.musicPrompt = false;
    return;
  }
  // tasks panel toggle (top-right button)
  if (y < HUD_H && x > VW-52) { state.tasksOpen = !state.tasksOpen; return; }
  if (state.tasksOpen) {
    state.tasksOpen = false;
    return;
  }
  if (y < HUD_H) return;
  // doormat reset pill: wipe the day and go back to the title screen
  if (y > VH-31 && y < VH-5 && x > VW/2-40 && x < VW/2+40) {
    state.done = {}; saveGame(); stopMusic();
    player.path = []; player.pending = null;
    setScene('menu'); chime();
    return;
  }
  const gx = Math.floor(x / TILE), gy = Math.floor((y - HUD_H) / TILE);
  if (gx<0||gy<0||gx>=GRID_W||gy>=GRID_H) return;
  // stereo: open the music popup right away, no walking needed
  const st = OBJECTS.find(o=>o.id==='stereo');
  if (st && gx>=st.x-1 && gx<=st.x+1 && gy>=st.y-1 && gy<=st.y+1) {
    state.musicPrompt = true;
    return;
  }
  // did we tap an interactable (generous hitbox)?
  for (const o of OBJECTS) {
    if (!o.task) continue;
    if (gx>=o.x-0 && gx<o.x+o.w && gy>=o.y && gy<o.y+o.h) {
      walkTo(o.stand.x, o.stand.y, o.task);
      return;
    }
  }
  if (!SOLID[gy][gx]) walkTo(gx, gy, null);
  else {
    // tap on wall/furniture: find nearest walkable neighbor
    for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx=gx+dx, ny=gy+dy;
      if (nx>=0&&ny>=0&&nx<GRID_W&&ny<GRID_H&&!SOLID[ny][nx]) { walkTo(nx,ny,null); return; }
    }
  }
}

function setScene(s) {
  state.scene = s; state.sceneT = 0;
  // the finale belongs to the birthday song — hush the stereo
  if (s==='birthday') { stopMusic(); state.confetti=[]; burstConfetti(80); }
}

/* =========================================================
   Update
   ========================================================= */
let last = performance.now();
function update(dt) {
  state.t += dt; state.sceneT += dt;
  // particles
  for (const p of state.particles) {
    p.t += dt; p.x += p.vx*dt; p.y += p.vy*dt;
    if (p.kind==='spark') p.vy += 160*dt;
  }
  state.particles = state.particles.filter(p=>p.t<p.life);
  for (const t of state.toasts) t.t += dt;
  state.toasts = state.toasts.filter(t=>t.t<2.6);
  if (tapMarker) { tapMarker.t += dt; if (tapMarker.t>0.7) tapMarker=null; }

  if (state.scene==='game') {
    updatePlayer(dt);
    // drifting notes from the stereo while the music plays
    if (state.musicOn && Math.random() < dt*1.4)
      floatSym(px(7)+12+(Math.random()-0.5)*12, py(10)+2, '♪');
    updateInteraction(dt);
  }
  if (state.scene==='birthday') {
    for (const c of state.confetti) {
      c.t += dt; c.y += c.vy*dt; c.x += c.vx*dt + Math.sin(c.t*4+c.ph)*18*dt;
      c.rot += c.vr*dt;
      if (c.y > VH+10) { c.y=-10; c.x=Math.random()*VW; }
    }
  }
}

function updatePlayer(dt) {
  if (state.interaction) { player.animT += dt; return; }
  if (keyboardMove(dt)) { player.path=[]; player.pending=null; tapMarker=null; return; }
  if (player.path.length) {
    const [tx,ty] = player.path[0];
    const cx = tx*TILE+TILE/2, cy = ty*TILE+TILE/2;
    const dx = cx-player.x, dy = cy-player.y;
    const dist = Math.hypot(dx,dy);
    const step = player.speed*dt;
    if (Math.abs(dx)>Math.abs(dy)) player.facing = dx>0?'right':'left';
    else if (Math.abs(dy)>0.01) player.facing = dy>0?'down':'up';
    if (dist <= step) {
      player.x=cx; player.y=cy; player.path.shift();
      if (!player.path.length) {
        player.moving=false;
        if (player.pending) {
          const t = player.pending; player.pending = null;
          startInteraction(t);
        }
      }
    } else {
      player.x += dx/dist*step; player.y += dy/dist*step;
      player.moving=true; player.animT+=dt;
    }
  } else player.moving=false;
}

function updateInteraction(dt) {
  const it = state.interaction; if (!it) return;
  it.t += dt;
  const ox = it.obj.x*TILE + it.obj.w*TILE/2;
  const oy = py(it.obj.y) + it.obj.h*TILE/2;
  // per-task ambient particles (world-level; modal tasks do their own effects)
  if (Math.random() < dt*4) {
    switch (it.task.id) {
      case 'journal': floatSym(ox, oy-12, '✎'); break;
      case 'nap': floatSym(px(3)+12, py(2)+12, 'z'); break;
    }
  }
  // cutscene sound ticks
  if (it.task.id==='gym') {
    const frame = Math.floor(it.t*6)%2;
    if (frame !== it.lastFrame) {
      it.lastFrame = frame;
      beep(frame? 660:520, 0, 0.05, 0.04, 'square');
    }
  } else if (it.task.id==='douglas') {
    if (it.t - it.lastTick > 0.6) { it.lastTick = it.t; beep(1180, 0, 0.08, 0.03, 'sine'); }
  } else if (it.task.id==='espresso') {
    const pp = it.t/it.dur;
    if (pp>0.25 && pp<0.75 && it.t - it.lastTick > 0.14) {
      it.lastTick = it.t; beep(90+Math.random()*40, 0, 0.1, 0.025, 'sawtooth');
    }
  } else if (it.task.id==='nap') {
    // slow breathing, one cycle at a time
    if (it.t - it.lastTick > 1.7 && it.t < it.dur-0.8) { it.lastTick = it.t; snore(); }
  } else if (it.task.id==='melon') {
    const bite = Math.floor(it.t*2)%2;
    if (bite !== it.lastFrame && it.t/it.dur > 0.35) {
      it.lastFrame = bite;
      if (bite) beep(300, 0, 0.05, 0.04, 'square');
    }
  }
  if (it.task.id==='nap') state.napFade = Math.min(1, it.t<it.dur-1 ? it.t*1.2 : (it.dur-it.t));
  else state.napFade = 0;
  if (it.t >= it.dur) { state.napFade=0; finishInteraction(); }
}

/* =========================================================
   Drawing helpers
   ========================================================= */
function rect(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(x,y,w,h); }
function text(str,x,y,size,color,align,bold){
  ctx.fillStyle=color; ctx.textAlign=align||'left'; ctx.textBaseline='middle';
  ctx.font=(bold?'bold ':'')+size+'px "Courier New", monospace';
  ctx.fillText(str,x,y);
}
function outlineText(str,x,y,size,color,outline,align){
  ctx.textAlign=align||'center'; ctx.textBaseline='middle';
  ctx.font='bold '+size+'px "Courier New", monospace';
  ctx.fillStyle=outline;
  for (const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2],[-1,-1],[1,1],[-1,1],[1,-1]]) ctx.fillText(str,x+dx,y+dy);
  ctx.fillStyle=color; ctx.fillText(str,x,y);
}
function drawSpriteC(spr, cx, cy, s) {
  s = s||1;
  ctx.drawImage(spr, Math.round(cx - spr.width*s/2), Math.round(cy - spr.height*s/2), spr.width*s, spr.height*s);
}

/* =========================================================
   Draw apartment
   ========================================================= */
function drawFloor() {
  if (ART.bg) {
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(ART.bg, 0, HUD_H, VW, GRID_H*TILE);
    ctx.imageSmoothingEnabled = false;
    return;
  }
  for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) {
    const t = MAP[y][x], X=px(x), Y=py(y);
    if (t===W) {
      rect(X,Y,TILE,TILE,C.wallFace);
      rect(X,Y,TILE,6,C.wallTop);
      rect(X,Y+TILE-3,TILE,3,C.wallShade);
      rect(X,Y+6,1,TILE-6,C.wallLine);
    } else if (t===K) {
      rect(X,Y,TILE,TILE,(x+y)%2? C.kitchenA:C.kitchenB);
      ctx.strokeStyle='rgba(160,150,130,0.25)'; ctx.lineWidth=1;
      ctx.strokeRect(X+0.5,Y+0.5,TILE-1,TILE-1);
    } else if (t===G) {
      rect(X,Y,TILE,TILE,(x+y)%2? C.gymMat:C.gymMatDark);
    } else if (t===R) {
      rect(X,Y,TILE,TILE,C.rug);
      if ((x+y)%2) rect(X+8,Y+8,8,8,C.rugLight);
    } else {
      rect(X,Y,TILE,TILE,(x+y)%2? C.floorA:C.floorB);
      rect(X,Y+TILE-1,TILE,1,C.floorLine);
    }
  }
  // rug border
  ctx.strokeStyle=C.rugDark; ctx.lineWidth=2;
  ctx.strokeRect(px(2)+1, py(15)+1, 5*TILE-2, 4*TILE-2);
  // concrete speckle on walls
  for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) {
    if (MAP[y][x]!==W) continue;
    if ((x*31+y*17)%4===0) rect(px(x)+2+((x*13)%18), py(y)+8+((y*11+x*5)%12), 2, 2, 'rgba(70,70,82,0.28)');
    if ((x*23+y*29)%5===0) rect(px(x)+3+((x*7+y*3)%16), py(y)+9+((y*17)%10), 1, 1, 'rgba(240,240,244,0.35)');
  }
  drawSkylineWindow();
}
// floor-to-ceiling glass along the top wall: Toronto at dusk-lite
function drawSkylineWindow() {
  const wx0 = px(2)+2, wx1 = px(13)-2, wy0 = py(0)+3, wh = 18;
  rect(wx0, wy0, wx1-wx0, wh, '#aee0f2');
  rect(wx0, wy0, wx1-wx0, 4, '#d3f1fa');
  // skyline silhouette
  const bhs = [7,10,5,12,8,4,9,6,11,5,8,7];
  for (let i=0;i<bhs.length;i++) {
    const bx = wx0 + 4 + i*22;
    if (bx+12 > wx1-4) break;
    rect(bx, wy0+wh-bhs[i], 12, bhs[i], '#7b8598');
    // lit windows
    if (i%2===0) rect(bx+3, wy0+wh-bhs[i]+2, 2, 2, '#ffe9a8');
    if (i%3===0) rect(bx+7, wy0+wh-bhs[i]+4, 2, 2, '#ffe9a8');
  }
  // CN Tower
  const tx = Math.round((wx0+wx1)/2);
  rect(tx-1, wy0+2, 2, wh-4, '#69707f');
  rect(tx-3, wy0+7, 6, 4, '#69707f');
  rect(tx-2, wy0+8, 1, 1, '#ffe9a8');
  // mullions + frame
  ctx.strokeStyle='#55555f'; ctx.lineWidth=2;
  ctx.strokeRect(wx0, wy0, wx1-wx0, wh);
  ctx.fillStyle='rgba(85,85,95,0.8)';
  for (let mx=wx0+TILE*2; mx<wx1; mx+=TILE*2) ctx.fillRect(mx, wy0, 1.5, wh);
}

function drawObjects() {
  const bgMode = !!ART.bg;
  for (const o of OBJECTS) {
    const X=px(o.x), Y=py(o.y), Wp=o.w*TILE, Hp=o.h*TILE;
    // painted-background furniture: skip the drawn version, keep live overlays
    const skipDraw = bgMode && o.bg && o.id !== 'bed';
    if (!skipDraw) switch(o.id) {
      case 'bed': {
        if (bgMode) {
          // Marina tucked in on the painted bed's pillow
          if (state.interaction && state.interaction.task.id==='nap')
            drawArt('head', X+26, Y+20, 22);
          break;
        }
        rect(X+2,Y+2,Wp-4,Hp-4,'#8a8e98');                       // platform frame
        rect(X+4,Y+4,Wp-8,Hp-8,'#eef0f2');                       // mattress
        rect(X+4,Y+4,Wp-8,20,'#f8f9fb');                          // pillow zone
        rect(X+8,Y+7,Wp-16,12,'#fff');                            // pillow
        rect(X+4,Y+26,Wp-8,Hp-32,'#a9b6c4');                      // gray-blue duvet
        rect(X+4,Y+26,Wp-8,5,'#93a2b2');
        for (let i=0;i<3;i++) rect(X+8+i*18,Y+40,10,10,'#c2cdd8'); // quilt squares
        if (state.interaction && state.interaction.task.id==='nap') {
          if (!drawArt('head', X+Wp/2, Y+15, 22)) {
            rect(X+8,Y+20,Wp-16,26,'#8a5a33');
            rect(X+14,Y+30,Wp-28,10,'#f2c9a8');
          }
        }
        break; }
      case 'nespresso': {
        if (!drawArt('nespresso', X+TILE/2, Y+TILE/2, 34))
          ctx.drawImage(NESPRESSO, X+TILE/2-12, Y-8, 24, 28);
        break; }
      case 'fridge': {
        if (!drawArtBottom('fridgeWorld', X+Wp/2, Y+Hp-1, 60)) {
          rect(X+2,Y,Wp-4,Hp-2,'#c3c7ce');                        // stainless fallback
          rect(X+2,Y,Wp-4,4,'#d8dbe1');
          rect(X+2,Y+18,Wp-4,2,'#9aa0a9');
          rect(X+4,Y+8,2,8,'#6d737d'); rect(X+4,Y+24,2,10,'#6d737d');
          rect(X+11,Y+26,5,5,'#e2b7bd');
        }
        break; }
      case 'douglasObj': {
        const bob = Math.sin(state.t*2.4)*1.5;
        if (!drawArt('douglas', X+TILE/2, Y+TILE/2+bob, 26))
          ctx.drawImage(DOUGLAS, X-4, Y+4+bob, 32, 19);
        break; }
      case 'stereo': {
        const S = X-1, Sy = Y+2;
        rect(S, Sy, 26, 15, '#2c2c35');                            // boombox body
        rect(S+1, Sy+1, 24, 3, '#3d3d48');                         // top vent
        rect(S+2, Sy+5, 8, 8, '#565664');                          // left speaker
        rect(S+5, Sy+8, 2, 2, '#8af08a');
        rect(S+16, Sy+5, 8, 8, '#565664');                         // right speaker
        rect(S+19, Sy+8, 2, 2, '#8af08a');
        rect(S+12, Sy+6, 2, 6, state.musicOn ? '#8af08a' : '#e2506a'); // power light
        if (state.musicOn) {
          // dancing equalizer bars
          for (let i=0;i<5;i++) {
            const hh = 3 + Math.abs(Math.sin(state.t*6+i*1.3))*7;
            rect(S+3+i*4.5, Sy-2-hh, 2.5, hh, i%2? C.greenLight : '#f2b8d8');
          }
        } else if (!state.musicPrompt) {
          // fading hint so she knows the stereo is tappable
          const fade = (Math.sin(state.t*1.6)+1)/2;
          ctx.globalAlpha = 0.25 + fade*0.75;
          outlineText('♪ tap for music', S+13, Sy-11, 9, '#ffe9a8', 'rgba(20,16,33,0.85)');
          ctx.globalAlpha = 1;
        }
        break; }
      // ---- crude fallbacks, only visible if the painted background fails ----
      case 'shelfTop': case 'kcounter': case 'kcabinet': {
        rect(X,Y,Wp,Hp,'#7d818a'); rect(X,Y,Wp,6,'#d7d9de');
        break; }
      case 'bookshelf': case 'gymShelf': case 'deskL': {
        rect(X+2,Y+2,Wp-4,Hp-4,'#a97b4d');
        break; }
      case 'gymRackObj': {
        if (!drawArt('gymRack', X+Wp/2, Y+TILE+2, 44)) {
          rect(X+8,Y+10,Wp-16,6,'#6d6d7c');
          for (let i=0;i<4;i++) rect(X+12+i*18,Y+6,8,12,'#3b3b46');
        }
        break; }
      case 'gymMatObj': {
        if (!drawArt('gymMat', X+TILE/2+4, Y+Hp/2-12, 60))
          rect(X+2,Y+4,TILE-4,Hp-8,'#d2a2a9');
        break; }
      case 'gymTreadObj': {
        if (!drawArt('gymTread', X+Wp/2, Y+Hp/2, 88))
          rect(X+4,Y+4,Wp-8,Hp-8,'#3b3b46');
        break; }
      case 'plantBR': {
        rect(X+7,Y+12,10,9,'#b06f49'); rect(X+5,Y+2,14,11,'#7fb069');
        break; }
    }
    // interactable hint
    if (o.task && !state.done[o.task] && !state.interaction) {
      const bx = X + o.w*TILE/2, by = Y - 6 + Math.sin(state.t*3+o.x)*2;
      drawSpriteC(PLUMBOB, bx, by, 1.2);
    }
    if (o.task && state.done[o.task]) {
      const bx = X + o.w*TILE - 6, by = Y + 2;
      text('✔', bx, by+4, 11, C.green, 'center', true);
    }
  }
}

function drawPlayer() {
  if (player.hidden) return;
  const f = player.moving ? (Math.floor(player.animT*7)%2) : 0;
  const cx = player.x, cy = py(0)+player.y;
  // shadow
  ctx.fillStyle='rgba(30,20,40,0.22)';
  ctx.beginPath(); ctx.ellipse(cx, cy+14, 9, 3.5, 0, 0, Math.PI*2); ctx.fill();
  let plumbY = cy - 34;
  const wf = walkFrame(player.facing, player.moving, player.animT);
  if (wf) {
    const H = 46;
    const bounce = player.moving ? (Math.floor(player.animT*6)%2 ? -1 : 0) : 0;
    drawArtBottom(wf, cx, cy + 16 + bounce, H, player.facing==='left');
    plumbY = cy + 16 - H - 8;
  } else {
    drawSpriteC(SPR[player.facing][f], cx, cy-6, 1.5);
  }
  // plumbob above head
  const bobY = plumbY + Math.sin(state.t*3)*2;
  drawSpriteC(PLUMBOB, cx, bobY, 1.3);
  // interaction bubble
  const it = state.interaction;
  if (it) {
    const p = Math.min(1, it.t/it.dur);
    if (it.task.id==='melon') {
      const mb = Math.sin(state.t*5)*2;
      drawArt('watermelon', cx+16, cy-30+mb, 26) || drawSpriteC(MELON, cx+16, cy-30+mb, 2);
    }
    const bx = cx, byy = cy - 48;
    rect(bx-20, byy-8, 40, 10, 'rgba(20,16,33,0.75)');
    rect(bx-18, byy-6, 36, 6, '#3a3350');
    rect(bx-18, byy-6, 36*p, 6, C.green);
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const a = 1 - p.t/p.life;
    if (p.kind==='spark') {
      ctx.globalAlpha = a;
      rect(p.x-2, p.y-2, 4, 4, p.color);
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = Math.min(1, a*1.6);
      text(p.sym, p.x, p.y, 13, p.sym==='♥'?C.pink:(p.sym==='z'?'#9db4e8':C.gold), 'center', true);
      ctx.globalAlpha = 1;
    }
  }
  if (tapMarker) {
    const a = 1 - tapMarker.t/0.7;
    ctx.globalAlpha = a;
    ctx.strokeStyle = C.green; ctx.lineWidth = 2;
    const r = 4 + tapMarker.t*18;
    ctx.strokeRect(px(tapMarker.x)+TILE/2-r/2, py(tapMarker.y)+TILE/2-r/2, r, r);
    ctx.globalAlpha = 1;
  }
}

/* =========================================================
   HUD
   ========================================================= */
function drawHUD() {
  const n = doneCount();
  if (ART.hud) {
    // painted HUD frame: title is baked in; we add the diamond, bar and count
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(ART.hud, 0, 0, VW, HUD_H);
    ctx.imageSmoothingEnabled = false;
    drawArt('plumbobArt', 174, 19 + Math.sin(state.t*2.5)*1.5, 22);
    // happiness segments, measured to the frame's inner slot (x 33-341.5, y 39-60.5)
    const bx=35, by=41, bw=305, bh=18;
    const segW = bw/6;
    ctx.save();
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.clip(); }
    if (n===6) { ctx.shadowColor='rgba(96,224,96,0.9)'; ctx.shadowBlur=10; }
    for (let i=0;i<n;i++) {
      rect(bx+i*segW+2, by+2, segW-4, bh-4, C.green);
      rect(bx+i*segW+2, by+2, segW-4, 4, C.greenLight);
    }
    ctx.restore();
    // count in the lower slot
    text(n+'/6 HAPPY', 44, 75, 10, n===6? C.greenLight : '#f2b8d8', 'left', true);
  } else {
    rect(0,0,VW,HUD_H,'#241c36');
    rect(0,HUD_H-2,VW,2,'#141021');
    drawSpriteC(PLUMBOB, 18, 26, 2);
    text("MARINA'S DAY", 34, 16, 11, C.textDim, 'left', true);
    const bx=34, by=26, bw=VW-34-64, bh=14;
    rect(bx-2,by-2,bw+4,bh+4,'#141021');
    rect(bx,by,bw,bh,'#3a3350');
    const segW = bw/6;
    for (let i=0;i<n;i++) {
      rect(bx+i*segW+1, by+1, segW-2, bh-2, C.green);
      rect(bx+i*segW+1, by+1, segW-2, 4, C.greenLight);
    }
    for (let i=1;i<6;i++) rect(bx+i*segW, by, 1, bh, '#141021');
    text(n+'/6 HAPPY', bx, by+24, 10, n===6?C.greenLight:C.textDim, 'left', true);
    rect(VW-50, 10, 40, 40, '#3a3350');
    rect(VW-50, 10, 40, 4, '#4d4570');
    text('☰', VW-30, 30, 22, C.text, 'center', true);
  }
  // toasts
  let ty = HUD_H + 16;
  for (const t of state.toasts) {
    const a = t.t<0.25 ? t.t/0.25 : (t.t>2.1 ? (2.6-t.t)/0.5 : 1);
    ctx.globalAlpha = Math.max(0,a);
    const tw = (t.text.length+3)*9 + 16;
    rect(VW/2-tw/2, ty-12, tw, 24, 'rgba(20,16,33,0.85)');
    rect(VW/2-tw/2, ty-12, tw, 3, C.green);
    text(t.icon+' '+t.text, VW/2, ty+1, 12, C.greenLight, 'center', true);
    ctx.globalAlpha = 1;
    ty += 30;
  }
}

function drawTasksPanel() {
  if (!state.tasksOpen) return;
  ctx.fillStyle='rgba(20,16,33,0.82)'; ctx.fillRect(0,0,VW,VH);
  const pw=300, ph=320, pxx=VW/2-pw/2, pyy=110;
  rect(pxx,pyy,pw,ph,'#241c36');
  rect(pxx,pyy,pw,6,C.green);
  outlineText('TO-DO: PERFECT DAY', VW/2, pyy+30, 15, C.text, '#141021');
  TASKS.forEach((t,i)=>{
    const yy = pyy+64+i*40;
    const done = !!state.done[t.id];
    rect(pxx+16, yy-13, 26, 26, done? '#1e3a1e' : '#3a3350');
    if (done) text('✔', pxx+29, yy+1, 15, C.green, 'center', true);
    text(t.icon, pxx+56, yy, 14, C.text, 'left');
    text(t.name, pxx+80, yy, 11.5, done? '#7c7295' : C.text, 'left', true);
  });
  text('tap anywhere to close', VW/2, pyy+ph-16, 10, C.textDim, 'center');
}

/* =========================================================
   Scenes
   ========================================================= */
function drawMenu() {
  rect(0,0,VW,VH,'#1b1526');
  if (ART.menuBg) {
    const bob = Math.sin(state.t*2)*4;
    // cover-fit, offset so both the logo and the baked footer stay visible
    const im = ART.menuBg;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, 0, -18, VW, VW * im.height / im.width);
    ctx.imageSmoothingEnabled = false;
    // twinkle field
    for (let i=0;i<16;i++) {
      const sxp = 14+((i*97)%332), syp = 36+((i*211)%520);
      const tw = Math.abs(Math.sin(state.t*1.6 + i*1.7));
      if (tw < 0.25) continue;
      ctx.globalAlpha = tw*0.85;
      const r = 1.5+tw*2.5;
      const col = i%3===0 ? '#ffd9ec' : (i%3===1 ? '#fff6c9' : '#ffffff');
      rect(sxp-r, syp-0.75, r*2, 1.5, col);
      rect(sxp-0.75, syp-r, 1.5, r*2, col);
      ctx.globalAlpha = 1;
    }
    // the four little joys, floating around Marina, with a brand-pink glow
    const glowDraw = (phase, fn) => {
      ctx.save();
      ctx.shadowColor = 'rgba(255,123,169,0.85)';
      ctx.shadowBlur = 13 + Math.sin(state.t*2.2 + phase)*5;
      fn();
      ctx.restore();
    };
    glowDraw(0,   () => drawArt('douglas', 58, 314+bob, 58) || ctx.drawImage(DOUGLAS, 34, 300+bob, 60, 36));
    glowDraw(1.6, () => drawArt('watermelon', VW-56, 298-bob, 54) || drawSpriteC(MELON, VW-56, 298-bob, 2));
    glowDraw(3.1, () => drawArt('nespresso', 60, 452-bob*0.8, 62) || ctx.drawImage(NESPRESSO, 40, 430, 48, 56));
    glowDraw(4.7, () => drawArt('cake', VW-58, 448+bob*0.8, 58) || ctx.drawImage(CAKE, VW-84, 424, 56, 49));
    // prompts: pulsing TAP TO START button (subpixel draw for a smooth pulse)
    if (ART.tapBtn) {
      const btn = ART.tapBtn;
      const pulse = 1 + Math.sin(state.t*1.8)*0.025;
      const bw = 170*pulse, bh = btn.height/btn.width*bw;
      ctx.save();
      ctx.shadowColor = 'rgba(96,224,96,0.9)';
      ctx.shadowBlur = 16 + Math.sin(state.t*1.8)*6;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(btn, VW/2-bw/2, 514-bh/2, bw, bh);
      ctx.restore();
      ctx.imageSmoothingEnabled = false;
    } else if (Math.sin(state.t*4) > -0.3) {
      outlineText('▶ TAP TO START ◀', VW/2, 518, 14, C.greenLight, '#141021');
    }
    const n = doneCount();
    if (n>0) {
      rect(VW-106, 12, 94, 22, 'rgba(20,16,33,0.72)');
      text('reset day '+n+'/6', VW-59, 23, 10, C.text, 'center', true);
    }
    return;
  }
  // ---- fallback menu (no hero art) ----
  for (let i=0;i<8;i++) {
    ctx.globalAlpha = 0.05;
    rect(0, i*80 + Math.sin(state.t*0.6+i)*6, VW, 40, i%2? C.pink : C.green);
    ctx.globalAlpha = 1;
  }
  // floating sprites
  const bob = Math.sin(state.t*2)*4;
  drawArt('douglas', 62, 146+bob, 42) || ctx.drawImage(DOUGLAS, 34, 120+bob, 60, 36);
  drawArt('watermelon', VW-62, 166-bob, 44) || ctx.drawImage(MELON, VW-84, 110-bob, 56, 40);
  drawArt('nespresso', VW-58, 452+bob*0.7, 52) || ctx.drawImage(NESPRESSO, VW-76, 420+bob*0.7, 48, 56);
  drawArt('cake', 58, 458-bob*0.7, 52) || ctx.drawImage(CAKE, 30, 434-bob*0.7, 56, 49);
  // Marina (real art includes her plumbob)
  if (!drawArt('marina', VW/2, 296 + Math.sin(state.t*2.6)*3, 252)) {
    drawSpriteC(PLUMBOB, VW/2, 216 + Math.sin(state.t*2.6)*5, 4);
    drawSpriteC(SPR.down[0], VW/2, 300, 4.5);
  }
  // title
  outlineText("MARINA'S", VW/2, 84, 30, C.pink, '#141021');
  outlineText('PERFECT LITTLE DAY', VW/2, 116, 19, C.text, '#141021');
  // start
  if (Math.sin(state.t*4) > -0.3) outlineText('▶ TAP TO START ◀', VW/2, 452, 15, C.greenLight, '#141021');
  text('a tiny birthday game, made with 💚', VW/2, 500, 11, C.textDim, 'center');
  const n = doneCount();
  if (n>0) {
    text('progress saved: '+n+'/6', VW/2, 526, 10, C.textDim, 'center');
    rect(VW/2-70, VH-38, 140, 24, '#3a3350');
    text('reset day', VW/2, VH-26, 11, C.text, 'center', true);
  }
}

function drawAspiration() {
  drawGameWorld();
  ctx.fillStyle='rgba(20,16,33,0.88)'; ctx.fillRect(0,0,VW,VH);
  const s = Math.min(1, state.sceneT/0.6);
  if (ART.aspText && ART.plumbobArt) {
    // painted aspiration card: big diamond + text art, popping in together
    ctx.save();
    ctx.translate(VW/2, VH/2 - 40);
    ctx.scale(s, s);
    ctx.translate(-VW/2, -(VH/2 - 40));
    drawArt('plumbobArt', VW/2, VH/2 - 130 + Math.sin(state.t*2.5)*5, 92);
    drawArt('aspText', VW/2, VH/2 - 14, 78);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(VW/2, VH/2 - 60);
    ctx.scale(s, s);
    drawSpriteC(PLUMBOB, 0, -60 + Math.sin(state.t*3)*4, 5);
    outlineText('✦ ASPIRATION COMPLETE ✦', 0, 20, 17, C.gold, '#141021');
    ctx.restore();
    if (state.sceneT > 0.7) {
      outlineText('Marina is officially having a', VW/2, VH/2+4, 13, C.text, '#141021');
      outlineText('Perfect Little Day', VW/2, VH/2+30, 20, C.greenLight, '#141021');
    }
  }
  if (state.sceneT > 1.4 && Math.sin(state.t*4)>-0.3) {
    outlineText('tap for your reward…', VW/2, VH/2+120, 13, C.pink, '#141021');
  }
}

function burstConfetti(n) {
  const cols=['#ff7ba9','#ffd45e','#8af08a','#9fd4e8','#c9a8f2','#ff9d3c'];
  for (let i=0;i<n;i++) state.confetti.push({
    x:Math.random()*VW, y:-10-Math.random()*VH*0.5,
    vx:(Math.random()-0.5)*20, vy:40+Math.random()*60,
    rot:Math.random()*Math.PI, vr:(Math.random()-0.5)*6,
    w:4+Math.random()*4, h:6+Math.random()*5,
    color:cols[i%cols.length], t:Math.random()*10, ph:Math.random()*6,
  });
}

function drawBirthday() {
  rect(0,0,VW,VH,'#241c36');
  if (ART.finaleBg) {
    // painted congrats card, fading in; confetti rains on top
    const im = ART.finaleBg;
    ctx.globalAlpha = Math.min(1, state.sceneT/0.6);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, 0, -18, VW, VW * im.height / im.width);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    for (const c of state.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle=c.color; ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
      ctx.restore();
    }
    if (state.sceneT>2 && Math.sin(state.t*3)>0)
      outlineText('(tap for more confetti)', VW/2, VH/2, 12, '#ffffff', 'rgba(20,16,33,0.85)');
    if (state.sceneT>2) drawResetPill();
    return;
  }
  // soft radial glow
  const grd = ctx.createRadialGradient(VW/2, VH/2-40, 30, VW/2, VH/2-40, 320);
  grd.addColorStop(0,'rgba(255,212,94,0.18)'); grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grd; ctx.fillRect(0,0,VW,VH);
  // balloons
  for (let i=0;i<6;i++) {
    const bx = 30 + i*(VW-60)/5;
    const byy = 90 + Math.sin(state.t*1.4+i*1.1)*10 + (i%2?18:0);
    const col = ['#ff7ba9','#8af08a','#ffd45e','#9fd4e8','#c9a8f2','#ff9d3c'][i];
    ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(bx, byy+14); ctx.lineTo(bx, byy+52); ctx.stroke();
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(bx, byy, 11, 14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(bx-4, byy-5, 3, 4, 0, 0, Math.PI*2); ctx.fill();
  }
  // text
  const pop = Math.min(1, state.sceneT/0.5);
  ctx.save();
  ctx.translate(VW/2, 0); ctx.scale(pop,pop); ctx.translate(-VW/2, 0);
  outlineText('HAPPY', VW/2, 196, 40, C.pink, '#141021');
  outlineText('BIRTHDAY', VW/2, 240, 40, C.gold, '#141021');
  outlineText('MARINA!', VW/2, 286, 40, C.greenLight, '#141021');
  ctx.restore();
  // Marina + Douglas + cake
  const bob = Math.sin(state.t*2.5)*3;
  if (!drawArt('marina', VW/2-72, 390+bob*0.5, 136)) {
    drawSpriteC(SPR.down[0], VW/2-72, 400+bob*0.5, 3.5);
    drawSpriteC(PLUMBOB, VW/2-72, 356+bob*0.5, 2);
  }
  if (!drawArt('cake', VW/2+2, 398+bob, 70)) {
    ctx.drawImage(CAKE, VW/2-28, 372+bob, 64, 56);
    // candle flames flicker (pixel fallback only — the art has its own)
    for (const fx of [VW/2-28+18, VW/2-28+30, VW/2-28+42]) {
      const fl = Math.sin(state.t*11+fx)*1.5;
      rect(fx-2, 366+bob+fl, 5, 6, '#ffd45e');
      rect(fx-1, 364+bob+fl, 3, 3, '#fff2c0');
    }
  }
  if (!drawArt('douglas', VW/2+70, 412-bob, 44))
    ctx.drawImage(DOUGLAS, VW/2+38, 396-bob, 70, 42);
  if (state.sceneT > 1.6) {
    outlineText('You did it — a Perfect Little Day.', VW/2, 470, 12, C.text, '#141021');
    outlineText('Douglas says happy birthday too. 🦞', VW/2, 494, 12, C.text, '#141021');
    outlineText('I love you! — Josh 💚', VW/2, 526, 14, C.pink, '#141021');
  }
  // confetti on top
  for (const c of state.confetti) {
    ctx.save();
    ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.fillStyle=c.color; ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
    ctx.restore();
  }
  if (state.sceneT>2 && Math.sin(state.t*3)>0) outlineText('(tap for more confetti)', VW/2, VH/2, 12, '#ffffff', 'rgba(20,16,33,0.85)');
  if (state.sceneT>2) drawResetPill();
}

/* =========================================================
   Main draw
   ========================================================= */
/* =========================================================
   Cutscene modals (gym / douglas / espresso / melon)
   ========================================================= */
const MODAL_TASKS = ['gym','douglas','espresso','melon'];
const MODAL_META = {
  gym:      { title:'✦ WORK IT, MARINA! ✦' },
  douglas:  { title:'♥ DOUGLAS TIME ♥' },
  espresso: { title:"☕ ESPRESSO O'CLOCK" },
  melon:    { title:'✦ LITTLE TREAT ✦' },
};

// concrete wall band shared by scenes
function modalWall(x0, y0, pw, h, color, top) {
  rect(x0, y0, pw, h, color||'#a6a6b0');
  rect(x0, y0, pw, 8, top||'#5f5f6a');
  for (let i=0;i<26;i++) rect(x0+((i*37)%(pw-8))+4, y0+14+((i*53)%(h-22)), 2, 2, 'rgba(70,70,82,0.25)');
}
// Marina standing, feet at (fx, fy); s matches the old pixel scale (height ≈ 27*s)
function modalMarina(fx, fy, s, facing, lean) {
  const H = 27*s;
  ctx.fillStyle='rgba(30,20,40,0.28)';
  ctx.beginPath(); ctx.ellipse(fx, fy+3, 8*s, 2.2*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.save();
  if (lean) { ctx.translate(fx, fy); ctx.rotate(lean); ctx.translate(-fx, -fy); }
  const key = (facing==='left'||facing==='right') ? (ART.wSideIdle? 'wSideIdle':'wSide1')
            : (facing==='up'? 'wUp1':'wIdle');
  if (!drawArtBottom(key, fx, fy, H, facing==='left'))
    drawSpriteC(SPR[facing||'down'][0], fx, fy-12*s, s);
  ctx.restore();
  return fy - H; // top of head
}

function sceneGym(it, x0, y0, pw, ph, cx) {
  modalWall(x0, y0, pw, 140);
  // mirror
  rect(x0+16, y0+26, 118, 92, '#a8d4e4');
  rect(x0+16, y0+26, 118, 6, '#cdeef8');
  ctx.strokeStyle='#55555f'; ctx.lineWidth=3;
  ctx.strokeRect(x0+16, y0+26, 118, 92);
  ctx.globalAlpha=0.35;
  rect(x0+34, y0+32, 10, 80, '#e8f7fc');
  rect(x0+52, y0+32, 4, 80, '#e8f7fc');
  ctx.globalAlpha=1;
  // motivational poster
  rect(x0+218, y0+30, 62, 78, '#f2cc8f');
  rect(x0+218, y0+30, 62, 6, '#d9ab5f');
  text('💪', x0+249, y0+62, 20, C.text, 'center');
  text('STRONG', x0+249, y0+88, 9, '#8a5a33', 'center', true);
  // dumbbell rack
  rect(x0+18, y0+150, 60, 6, '#6d6d7c');
  for (let i=0;i<3;i++) rect(x0+24+i*18, y0+142, 8, 14, '#3b3b46');
  // floor mats
  for (let yy=0; yy<((ph-140)/20|0)+1; yy++) for (let xx=0; xx<pw/20; xx++)
    rect(x0+xx*20, y0+140+yy*20, 20, Math.min(20, ph-140-yy*20), (xx+yy)%2? C.gymMat:C.gymMatDark);
  // water bottle
  rect(x0+252, y0+206, 10, 22, '#7fb8d4'); rect(x0+254, y0+200, 6, 6, '#3b6f8c');
  // treadmill run (side-profile walk frames make a natural jog)
  const frame = Math.floor(it.t*6)%2;
  const jx = cx, feet = y0+250;
  // treadmill: base + scrolling belt + front console (she faces right)
  rect(x0+58, feet+2, 184, 16, '#2c2c35');
  rect(x0+64, feet+4, 172, 9, '#4a4a58');
  const beltOff = Math.floor((it.t*90)%14);
  for (let sx=x0+64+beltOff-14; sx<x0+234; sx+=14) if (sx>=x0+64) rect(sx, feet+4, 2, 9, '#2c2c35');
  rect(x0+230, feet-64, 8, 70, '#3b3b46');
  rect(x0+204, feet-64, 34, 6, '#565664');
  rect(x0+232, feet-58, 4, 3, '#8af08a');
  ctx.fillStyle='rgba(30,20,40,0.28)';
  ctx.beginPath(); ctx.ellipse(jx, feet+8, 28, 6, 0, 0, Math.PI*2); ctx.fill();
  const RUN_CYCLE = ['wSide1','wSidePass','wSide2','wSideSwing'];
  const ridx = Math.floor(it.t*8)%4;
  const bounce = (sideHasCycle() ? ridx%2 : frame) ? -3 : 0;
  const runKey = (ART.wSide1 && ART.wSide2)
    ? (sideHasCycle() ? RUN_CYCLE[ridx] : (frame? 'wSide2':'wSide1')) : null;
  if (runKey) {
    drawArtBottom(runKey, jx, feet+8+bounce, 96);
    drawSpriteC(PLUMBOB, jx, feet+8+bounce-108, 1.8);
  } else {
    if (frame) drawSpriteC(SPR.jack, jx, feet-48+bounce, 4);
    else drawSpriteC(SPR.down[0], jx, feet-48, 4);
    drawSpriteC(PLUMBOB, jx, feet-114+bounce, 1.6);
  }
  // sweat drops
  for (let i=0;i<3;i++) {
    const tt = (it.t*1.4 + i*0.37) % 1;
    const sx = jx + (i%2? 42:-42) + (i-1)*6;
    ctx.globalAlpha = Math.max(0, 0.9-tt);
    rect(sx, feet-92+tt*46, 4, 7, '#8fdcf4');
    ctx.globalAlpha = 1;
  }
  return 'cardio! steps × ' + Math.floor(it.t*3);
}

function sceneDouglas(it, x0, y0, pw, ph, cx) {
  modalWall(x0, y0, pw, 130);
  // framed photo of the two of them (hearts)
  rect(x0+30, y0+34, 54, 44, '#b59670');
  rect(x0+34, y0+38, 46, 36, '#f4efe6');
  text('♥', x0+57, y0+56, 16, C.pink, 'center', true);
  // shelf with plant
  rect(x0+206, y0+58, 66, 6, '#b59670');
  rect(x0+222, y0+40, 14, 18, '#7fb069'); rect(x0+226, y0+34, 6, 8, '#95c283');
  // rug floor
  for (let yy=0; yy<((ph-130)/20|0)+1; yy++) for (let xx=0; xx<pw/20; xx++)
    rect(x0+xx*20, y0+130+yy*20, 20, Math.min(20, ph-130-yy*20), (xx+yy)%2? C.rug:C.rugDark);
  rect(x0+20, y0+146, pw-40, 4, C.rugLight);
  // Douglas, very pettable
  const bob = Math.sin(it.t*3.2)*3;
  const dx = cx+52, dy = y0+232;
  ctx.fillStyle='rgba(30,20,40,0.25)';
  ctx.beginPath(); ctx.ellipse(dx, dy+34, 52, 9, 0, 0, Math.PI*2); ctx.fill();
  if (!drawArt('douglas', dx, dy+bob*0.4, 96))
    ctx.drawImage(DOUGLAS, dx-60, dy-30, 120, 72);
  // Marina leaning in to pet
  const lean = 0.10 + Math.sin(it.t*4)*0.06;
  modalMarina(cx-70, y0+266, 3.4, 'right', lean);
  // petting hand
  const hy = dy - 46 + Math.sin(it.t*4)*7;
  rect(dx-34, hy, 12, 8, '#f2c9a8');
  rect(dx-32, hy+2, 8, 4, '#e3b18d');
  // hearts rising off Douglas
  for (let i=0;i<3;i++) {
    const tt = (it.t*0.8 + i*0.33) % 1;
    ctx.globalAlpha = Math.max(0, 1-tt*1.2);
    text('♥', dx-20+i*22 + Math.sin(tt*6+i)*5, dy-58 - tt*46, 13+i*2, C.pink, 'center', true);
    ctx.globalAlpha = 1;
  }
  return 'pet pet pet…';
}

function sceneEspresso(it, x0, y0, pw, ph, cx) {
  const p = it.t/it.dur;
  modalWall(x0, y0, pw, 120);
  // backsplash tiles
  for (let yy=0; yy<3; yy++) for (let xx=0; xx<pw/20; xx++)
    rect(x0+xx*20+1, y0+120+yy*16+1, 18, 14, (xx+yy)%2? '#cbcbd2':'#c0c0c8');
  // quartz counter
  rect(x0, y0+168, pw, 10, '#d7d9de');
  rect(x0, y0+178, pw, 6, '#b3b6bd');
  // gray cabinets below
  rect(x0, y0+184, pw, ph-184, '#7d818a');
  rect(x0+pw/2-1, y0+196, 2, 20, '#5d616a');
  rect(x0+40, y0+196, 2, 20, '#5d616a'); rect(x0+pw-42, y0+196, 2, 20, '#5d616a');
  // the machine, hero size, sitting on the counter
  const mh = 128, mcx = cx-30, mBottom = y0+170;
  if (!drawArt('nespresso', mcx, mBottom-mh/2, mh))
    ctx.drawImage(NESPRESSO, mcx-40, mBottom-96, 80, 96);
  // pour: stream from spout into the art's cup (tuned to the art's proportions)
  const mw = mh*(317/360);
  const spoutX = mcx - mw/2 + mw*0.27;
  const spoutY = mBottom - mh + mh*0.50;
  const cupTop = mBottom - mh + mh*0.68;
  if (p>0.25 && p<0.78) {
    ctx.globalAlpha = 0.9;
    rect(spoutX-1.5, spoutY, 3, cupTop-spoutY, '#7a4a26');
    rect(spoutX-0.5, spoutY, 1, cupTop-spoutY, '#a06b3e');
    ctx.globalAlpha = 1;
  }
  // steam wisps
  if (p>0.35) for (let i=0;i<3;i++) {
    const tt = (it.t*0.7 + i*0.3) % 1;
    ctx.globalAlpha = Math.max(0, 0.5-tt*0.5);
    ctx.fillStyle = '#f4f4f8';
    ctx.beginPath();
    ctx.arc(spoutX-4+i*5 + Math.sin(tt*7+i*2)*4, cupTop-8 - tt*34, 3+tt*3, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // machine status light
  rect(mcx+mw/2-14, mBottom-mh+16, 5, 5, p<0.25 ? (Math.floor(it.t*4)%2? '#ffd45e':'#6d6d7c') : '#3ec93e');
  // Marina waiting eagerly
  const bob2 = Math.sin(it.t*2.2)*2;
  modalMarina(cx+78, y0+250+bob2*0.4, 3.2, 'left');
  if (p>=0.78) text('☕ ready!', cx+78, y0+140, 12, C.gold, 'center', true);
  return p<0.25 ? 'warming up…' : p<0.78 ? 'brewing the good stuff…' : 'mmm. caffeinated.';
}

function sceneMelon(it, x0, y0, pw, ph, cx) {
  const p = it.t/it.dur;
  modalWall(x0, y0, pw, 130);
  // kitchen floor tiles
  for (let yy=0; yy<((ph-130)/20|0)+1; yy++) for (let xx=0; xx<pw/20; xx++)
    rect(x0+xx*20, y0+130+yy*20, 20, Math.min(20, ph-130-yy*20), (xx+yy)%2? C.kitchenA:C.kitchenB);
  // fridge animation: closed -> ajar -> open (sparkling melon) -> ajar -> closed
  const fcx = x0+92, fb = y0+278;
  let fkey;
  if (p < 0.10)      fkey = 'frShut';
  else if (p < 0.22) fkey = 'frAjar';
  else if (p < 0.55) fkey = (Math.floor(it.t*3)%2) ? 'frOpen2' : 'frOpen1';
  else if (p < 0.65) fkey = 'frAjar';
  else               fkey = 'frShut';
  if (!drawArtBottom(fkey, fcx, fb, 205)) {
    rect(fcx-36, fb-170, 72, 170, '#c3c7ce');
    rect(fcx-32, fb-164, 64, 160, p>0.22&&p<0.55 ? '#eef0f3' : '#c3c7ce');
    if (p>0.22 && p<0.55) drawArt('watermelon', fcx, fb-100, 30) || drawSpriteC(MELON, fcx, fb-100, 2);
  }
  // door-creak sound cue moments are handled by the tick in updateInteraction
  // Marina snacking
  const mfx = cx+70, mfy = y0+262;
  const chomp = Math.sin(it.t*4);
  modalMarina(mfx, mfy, 3.4, 'left', p>=0.55 ? -0.03+chomp*0.02 : 0);
  if (p >= 0.55) {
    // melon travels to her mouth and shrinks as it gets eaten
    const eat = Math.min(1, (p-0.55)/0.4);
    const mh2 = 38 - eat*16;
    const mx = mfx - 24 + chomp*3, my = mfy - 62 + chomp*4;
    drawArt('watermelon', mx, my, mh2) || drawSpriteC(MELON, mx, my, 2);
    if (chomp > 0.6) outlineText('nom!', mx-6, my-26, 12, C.gold, '#141021');
    // seeds drop
    for (let i=0;i<2;i++) {
      const tt = (it.t*1.1 + i*0.5) % 1;
      ctx.globalAlpha = Math.max(0, 0.8-tt);
      rect(mx-6+i*10, my+14+tt*40, 3, 3, '#5d4022');
      ctx.globalAlpha = 1;
    }
  }
  return p<0.22 ? 'raiding the fridge…' : p<0.55 ? '✨ ooh… the good melon ✨' : 'nom nom nom…';
}

function drawCutsceneModal(it) {
  const p = Math.min(1, it.t/it.dur);
  const s = Math.min(1, it.t/0.25);
  ctx.fillStyle='rgba(20,16,33,0.78)'; ctx.fillRect(0,0,VW,VH);
  const pw=300, ph=310, cx=VW/2, cy=315;
  const x0=cx-pw/2, y0=cy-ph/2;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  rect(x0-5, y0-5, pw+10, ph+10, '#141021');
  let caption = '';
  switch (it.task.id) {
    case 'gym':      caption = sceneGym(it, x0, y0, pw, ph, cx); break;
    case 'douglas':  caption = sceneDouglas(it, x0, y0, pw, ph, cx); break;
    case 'espresso': caption = sceneEspresso(it, x0, y0, pw, ph, cx); break;
    case 'melon':    caption = sceneMelon(it, x0, y0, pw, ph, cx); break;
  }
  outlineText(MODAL_META[it.task.id].title, cx, y0-16, 15, C.gold, '#141021');
  rect(x0, y0+ph-46, pw, 46, 'rgba(20,16,33,0.55)');
  text(caption, cx, y0+ph-34, 12, C.text, 'center', true);
  rect(x0+20, y0+ph-24, pw-40, 12, '#141021');
  rect(x0+22, y0+ph-22, pw-44, 8, '#3a3350');
  rect(x0+22, y0+ph-22, (pw-44)*p, 8, C.green);
  ctx.restore();
}

function drawGameWorld() {
  drawFloor();
  drawObjects();
  drawPlayer();
  drawParticles();
  // cutscene modals
  if (state.interaction && MODAL_TASKS.includes(state.interaction.task.id))
    drawCutsceneModal(state.interaction);
  // nap fade
  if (state.napFade>0) {
    ctx.fillStyle='rgba(10,8,20,'+(state.napFade*0.85)+')';
    ctx.fillRect(0,HUD_H,VW,VH-HUD_H);
    if (state.napFade>0.5) outlineText('z z z …', VW/2, VH/2, 18, '#9db4e8', '#141021');
  }
  if (state.musicPrompt) drawMusicPrompt();
  drawHUD();
  drawResetPill();
  drawTasksPanel();
}

// small reset pill; on the game screen it lands on the doormat below the door
function drawResetPill() {
  rect(VW/2-34, VH-25, 68, 16, 'rgba(20,16,33,0.78)');
  ctx.strokeStyle='rgba(242,140,190,0.8)'; ctx.lineWidth=1;
  ctx.strokeRect(VW/2-33.5, VH-24.5, 67, 15);
  text('↺ reset', VW/2, VH-17, 8.5, '#f2b8d8', 'center', true);
}

function frame(now) {
  const dt = Math.min(0.05, (now-last)/1000); last = now;
  // the start-of-day flourish is owed from tap-to-start: play it the moment
  // the audio context is actually awake (iOS wakes it just after the tap)
  if (state.pendingJingle) {
    if (AC && AC.state === 'running') { state.pendingJingle = 0; startJingle(); }
    else if (now - state.pendingJingle > 2500) state.pendingJingle = 0;  // too late to feel connected — skip it
  }
  update(dt);
  ctx.clearRect(0,0,VW,VH);
  rect(0,0,VW,VH,'#1b1526');
  switch (state.scene) {
    case 'menu': drawMenu(); break;
    case 'game': drawGameWorld(); break;
    case 'aspiration': drawAspiration(); break;
    case 'birthday': drawBirthday(); break;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
