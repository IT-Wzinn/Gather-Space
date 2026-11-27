const fs = require('fs');
const code = fs.readFileSync('build_master_map.js', 'utf8');
const TILE_SIZE = 32;
const m = code.match(/const ROOMS = \[([\s\S]*?)\];/);
const rooms = eval('[' + m[1] + ']');
console.log(rooms.map(r => `Room ${r.num}: doors=${JSON.stringify(r.doors || r.door)}`).join('\n'));
