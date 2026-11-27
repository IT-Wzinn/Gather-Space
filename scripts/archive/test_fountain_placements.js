const fs = require('fs');
const TILE = 32;
const TILE_SIZE = 32;

const code = fs.readFileSync('build_master_map.js', 'utf8');
const rMatch = code.match(/const ROOMS = \[([\s\S]*?)\n\];/);
const rooms = eval('[' + rMatch[1] + ']');

const waterFeatures = [
  // 1. Grand Marble Orb Fountain (North Campus Central Centerpiece)
  { name: 'outdoor_fountain_grand_orb', x: 50.0 * TILE, y: 2.2 * TILE, w: 76, h: 49 },
  // 2. Grand Marble Orb Fountain (South-West Cherry Lawn Centerpiece)
  { name: 'outdoor_fountain_grand_orb', x: 13.5 * TILE, y: 72.0 * TILE, w: 76, h: 49 },

  // 3. Kidney Leisure Swimming Pool / Lagoon (South-East Relaxation Lawn below Room 9)
  { name: 'outdoor_water_pool_kidney', x: 82.5 * TILE, y: 71.8 * TILE, w: 66, h: 62 },

  // 4. Classic Round Tiered Stone Fountain (North-West Lawn above Room 5)
  { name: 'outdoor_fountain_tiered_classic', x: 23.5 * TILE, y: 2.5 * TILE, w: 46, h: 46 },
  // 5. Classic Round Tiered Stone Fountain (South-West Perimeter Lawn)
  { name: 'outdoor_fountain_tiered_classic', x: 24.5 * TILE, y: 72.0 * TILE, w: 46, h: 46 },

  // 6. Circular Carved Stone Fountain (West Courtyard Classical Sanctuary beside Zen Pond)
  { name: 'outdoor_fountain_circular_stone', x: 18.5 * TILE, y: 30.2 * TILE, w: 42, h: 39 },
  // 7. Circular Carved Stone Fountain (North-East Lawn above Exec Suites)
  { name: 'outdoor_fountain_circular_stone', x: 82.0 * TILE, y: 2.5 * TILE, w: 42, h: 39 },

  // 8. Ornate Multi-Tiered Pedestal Fountain (Executive Suite Promenade Plaza)
  { name: 'outdoor_fountain_ornate_pedestal', x: 82.5 * TILE, y: 21.0 * TILE, w: 32, h: 34 },
  // 9. Ornate Multi-Tiered Pedestal Fountain (East Courtyard Nook)
  { name: 'outdoor_fountain_ornate_pedestal', x: 64.2 * TILE, y: 44.0 * TILE, w: 32, h: 34 }
];

let errors = [];
waterFeatures.forEach((wf, idx) => {
  const px = wf.x / TILE;
  const py = wf.y / TILE;
  const pw = wf.w / 16;
  const ph = wf.h / 16;

  rooms.forEach(r => {
    // Check if inside room
    if (px >= r.x && (px + pw) <= (r.x + r.w) && py >= r.y && (py + ph) <= (r.y + r.h)) {
      errors.push(`Feature ${idx} (${wf.name}) inside Room ${r.num}`);
    }

    // Check door clearance
    const doors = r.doors || (r.door ? [r.door] : []);
    doors.forEach(d => {
      const dx1 = d.x;
      const dx2 = d.x + d.w;
      const dy1 = d.y - 0.5;
      const dy2 = d.y + 1.0;
      if (!(px + pw < dx1 || px > dx2 || py + ph < dy1 || py > dy2)) {
        errors.push(`Feature ${idx} (${wf.name}) overlaps Door of Room ${r.num}: x=${px}, y=${py}, door=x:${dx1}..${dx2}, y:${d.y}`);
      }
    });
  });
});

console.log('Water features checked:', waterFeatures.length);
if (errors.length > 0) {
  console.log('Errors:', errors);
} else {
  console.log('ALL WATER FEATURES VALID! No door or room interior overlaps.');
}
