const fs = require('fs');
const code = fs.readFileSync('build_master_map.js', 'utf8');
const TILE = 32;
const m = code.match(/trees\s*=\s*\[([\s\S]*?)\];/);
if (m) {
  const trees = eval('[' + m[1] + ']');
  console.log('Trees with x < 15:');
  trees.filter(t => t.x < 15).forEach(t => console.log(`${t.type} at x=${t.x}, y=${t.y}`));
}
