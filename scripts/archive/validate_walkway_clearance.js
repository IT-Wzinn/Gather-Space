const fs = require('fs');
const TILE = 32;

const code = fs.readFileSync('build_master_map.js', 'utf8');

// Extract walkways
const wMatch = code.match(/const walkways = \[([\s\S]*?)\];/);
if (!wMatch) {
  console.error('Could not find walkways');
  process.exit(1);
}
const walkways = eval('[' + wMatch[1] + ']');

// Extract outdoorTrees
const tMatch = code.match(/const outdoorTrees = \[([\s\S]*?)\];/);
if (!tMatch) {
  console.error('Could not find outdoorTrees');
  process.exit(1);
}
const outdoorTrees = eval('[' + tMatch[1] + ']');

// Extract outdoorWalkwayProps
const pMatch = code.match(/const outdoorWalkwayProps = \[([\s\S]*?)\];/);
if (!pMatch) {
  console.error('Could not find outdoorWalkwayProps');
  process.exit(1);
}
const outdoorWalkwayProps = eval('[' + pMatch[1] + ']');

console.log(`Loaded ${walkways.length} walkways, ${outdoorTrees.length} trees, ${outdoorWalkwayProps.length} props.`);

let treeCollisions = [];
outdoorTrees.forEach((t, i) => {
  const tw = (t.w / 16) * TILE;
  const th = (t.h / 16) * TILE;
  const tx1 = t.x;
  const tx2 = t.x + tw;
  const ty1 = t.y;
  const ty2 = t.y + th;

  walkways.forEach((w, wi) => {
    const wx1 = w.x;
    const wx2 = w.x + w.w;
    const wy1 = w.y;
    const wy2 = w.y + w.h;

    // Check box overlap
    if (tx1 < wx2 && tx2 > wx1 && ty1 < wy2 && ty2 > wy1) {
      const overlapW = Math.min(tx2, wx2) - Math.max(tx1, wx1);
      const overlapH = Math.min(ty2, wy2) - Math.max(ty1, wy1);
      treeCollisions.push(`Tree #${i} (${t.name}) at x:${t.x/TILE}, y:${t.y/TILE} overlaps Walkway #${wi}: overlap ${overlapW}x${overlapH} px`);
    }
  });
});

console.log('--- TREE OVERLAPS WITH WALKWAYS ---');
if (treeCollisions.length === 0) {
  console.log('NONE! All trees are 100% clear of all walkways!');
} else {
  treeCollisions.forEach(c => console.log(c));
}

let propCollisions = [];
outdoorWalkwayProps.forEach((p, i) => {
  const pw = (p.w / 16) * TILE;
  const ph = (p.h / 16) * TILE;
  const px1 = p.x;
  const px2 = p.x + pw;
  const py1 = p.y;
  const py2 = p.y + ph;

  walkways.forEach((w, wi) => {
    const wx1 = w.x;
    const wx2 = w.x + w.w;
    const wy1 = w.y;
    const wy2 = w.y + w.h;

    // Check box overlap
    if (px1 < wx2 && px2 > wx1 && py1 < wy2 && py2 > wy1) {
      const overlapW = Math.min(px2, wx2) - Math.max(px1, wx1);
      const overlapH = Math.min(py2, wy2) - Math.max(py1, wy1);
      propCollisions.push(`Prop #${i} (${p.name}) at x:${(p.x/TILE).toFixed(2)}, y:${(p.y/TILE).toFixed(2)} overlaps Walkway #${wi}: overlap ${overlapW.toFixed(1)}x${overlapH.toFixed(1)} px`);
    }
  });
});

console.log('--- PROP OVERLAPS WITH WALKWAYS ---');
if (propCollisions.length === 0) {
  console.log('NONE! All props are 100% clear of all walkways!');
} else {
  propCollisions.forEach(c => console.log(c));
}
