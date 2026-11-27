const fs = require('fs');
const TILE = 32;
const TILE_SIZE = 32;

const code = fs.readFileSync('build_master_map.js', 'utf8');
const rMatch = code.match(/const ROOMS = \[([\s\S]*?)\n\];/);
const rooms = eval('[' + rMatch[1] + ']');

// Enlarged water features (~1.25x - 1.35x larger)
const enlargedWaterFeatures = [
  // 1. Grand Marble Orb Fountain (North Campus Central Centerpiece: tw=192px=6 tiles, th=124px=3.875 tiles)
  { name: 'outdoor_fountain_grand_orb', x: 49.4 * TILE, y: 1.8 * TILE, w: 96, h: 62 },
  // 2. Grand Marble Orb Fountain (South-West Cherry Lawn Centerpiece)
  { name: 'outdoor_fountain_grand_orb', x: 12.8 * TILE, y: 71.5 * TILE, w: 96, h: 62 },

  // 3. Kidney Leisure Swimming Pool / Lagoon (South-East Relaxation Lawn: tw=152px=4.75 tiles, th=142px=4.44 tiles)
  { name: 'outdoor_water_pool_kidney', x: 84.5 * TILE, y: 71.5 * TILE, w: 76, h: 71 },

  // 4. Classic Round Tiered Stone Fountain (North-West Lawn above Room 5: tw=120px=3.75 tiles, th=120px=3.75 tiles)
  { name: 'outdoor_fountain_tiered_classic', x: 23.0 * TILE, y: 2.0 * TILE, w: 60, h: 60 },
  // 5. Classic Round Tiered Stone Fountain (South-West Perimeter Lawn)
  { name: 'outdoor_fountain_tiered_classic', x: 32.0 * TILE, y: 71.5 * TILE, w: 60, h: 60 },

  // 6. Circular Carved Stone Fountain (West Courtyard Classical Sanctuary: tw=96px=3.0 tiles, th=90px=2.81 tiles)
  { name: 'outdoor_fountain_circular_stone', x: 18.0 * TILE, y: 30.0 * TILE, w: 48, h: 45 },
  // 7. Circular Carved Stone Fountain (North-East Lawn above Exec Suites: tw=108px=3.375 tiles, th=100px=3.125 tiles)
  { name: 'outdoor_fountain_circular_stone', x: 81.5 * TILE, y: 2.0 * TILE, w: 54, h: 50 },

  // 8. Ornate Multi-Tiered Pedestal Fountain (Executive Suite Promenade Plaza: tw=84px=2.625 tiles, th=88px=2.75 tiles)
  { name: 'outdoor_fountain_ornate_pedestal', x: 84.0 * TILE, y: 20.6 * TILE, w: 42, h: 44 },
  // 9. Ornate Multi-Tiered Pedestal Fountain (East Courtyard Nook)
  { name: 'outdoor_fountain_ornate_pedestal', x: 64.0 * TILE, y: 43.5 * TILE, w: 42, h: 44 }
];

let errors = [];
enlargedWaterFeatures.forEach((wf, idx) => {
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

console.log('Enlarged water features count:', enlargedWaterFeatures.length);
if (errors.length > 0) {
  console.log('Validation Errors:', errors);
} else {
  console.log('ALL ENLARGED WATER FEATURES VALID! Zero door or room interior overlaps.');
}
