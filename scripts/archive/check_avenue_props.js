const fs = require('fs');
const code = fs.readFileSync('build_master_map.js', 'utf8');
const TILE = 32;

// Check outdoorWalkwayProps
const mProps = code.match(/outdoorWalkwayProps\s*=\s*\[([\s\S]*?)\];/);
const props = eval('[' + mProps[1] + ']');
console.log(`Total outdoor props: ${props.length}`);

// Check which props are in the avenues:
// North Avenue: y: 24..29
console.log('\nProps in North Avenue (y between 24 and 29):');
props.filter(p => p.y >= 24 * TILE && p.y <= 29 * TILE).forEach(p => {
  console.log(`  ${p.name} at x=${(p.x/TILE).toFixed(1)}, y=${(p.y/TILE).toFixed(1)}`);
});

// South Avenue: y: 47..52
console.log('\nProps in South Avenue (y between 47 and 52):');
props.filter(p => p.y >= 47 * TILE && p.y <= 52 * TILE).forEach(p => {
  console.log(`  ${p.name} at x=${(p.x/TILE).toFixed(1)}, y=${(p.y/TILE).toFixed(1)}`);
});

// West Boulevard: x: 35..40
console.log('\nProps in West Boulevard (x between 35 and 40):');
props.filter(p => p.x >= 35 * TILE && p.x <= 40 * TILE).forEach(p => {
  console.log(`  ${p.name} at x=${(p.x/TILE).toFixed(1)}, y=${(p.y/TILE).toFixed(1)}`);
});

// East Boulevard: x: 63..68
console.log('\nProps in East Boulevard (x between 63 and 68):');
props.filter(p => p.x >= 63 * TILE && p.x <= 68 * TILE).forEach(p => {
  console.log(`  ${p.name} at x=${(p.x/TILE).toFixed(1)}, y=${(p.y/TILE).toFixed(1)}`);
});
