const fs = require('fs');
const code = fs.readFileSync('build_master_map.js', 'utf8');
const TILE = 32;
const m = code.match(/outdoorWalkwayProps\s*=\s*\[([\s\S]*?)\];/);
const props = eval('[' + m[1] + ']');
console.log('Props with x < 10*TILE:');
props.filter(p => p.x < 10 * TILE).forEach(p => {
  console.log(`${p.name} at x=${(p.x/TILE).toFixed(1)}, y=${(p.y/TILE).toFixed(1)}`);
});
