const fs = require('fs');
const TILE = 32;

// 1. Read build_master_map.js
const bmmPath = 'build_master_map.js';
let bmmContent = fs.readFileSync(bmmPath, 'utf8');

const startMarker = 'const outdoorWalkwayProps = [';
const endMarker = '            // 2. Draw sprite\n            drawSprite(p.name, p.x, p.y, p.w, p.h);\n          });\n        }';

const sIdx = bmmContent.indexOf(startMarker);
const eIdx = bmmContent.indexOf(endMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('Markers in build_master_map.js not found!');
  process.exit(1);
}

const curBlock = bmmContent.substring(sIdx, eIdx);
const curPropsMatch = curBlock.match(/const outdoorWalkwayProps = \[([\s\S]*?)\];/);
let allProps = eval('[' + curPropsMatch[1] + ']');

// Update water features
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

// Filter non-water props and apply the 3 minor shifts:
const otherProps = allProps.filter(p => !p.name.includes('fountain') && !p.name.includes('pool'));
otherProps.forEach(p => {
  const px = p.x / TILE;
  const py = p.y / TILE;
  // 1. daisy near pool
  if (p.name === 'outdoor_daisy_flowerbed' && Math.abs(px - 88.0) < 0.2 && Math.abs(py - 72.5) < 0.2) {
    p.x = 90.0 * TILE;
  }
  // 2. tuft near tiered classic fountain south
  if (p.name === 'outdoor_tall_grass_tuft_a' && Math.abs(px - 31.0) < 0.2 && Math.abs(py - 72.5) < 0.2) {
    p.x = 30.0 * TILE;
  }
  // 3. tuft near circular stone fountain north-east
  if (p.name === 'outdoor_tall_grass_tuft_a' && Math.abs(px - 80.5) < 0.2 && Math.abs(py - 4.0) < 0.2) {
    p.x = 79.2 * TILE;
  }
});

const updatedAllProps = [...enlargedWaterFeatures, ...otherProps];

const propsCode = updatedAllProps.map(p => {
  let s = `{ name: '${p.name}', x: ${(p.x/TILE).toFixed(1)} * TILE, y: ${(p.y/TILE).toFixed(1)} * TILE, w: ${p.w}, h: ${p.h}`;
  if (p.hasGlow) s += `, hasGlow: true`;
  s += ` }`;
  return s;
}).join(',\n            ');

const newPropsBlock = `const outdoorWalkwayProps = [
            ${propsCode}
          ];

          outdoorWalkwayProps.forEach(p => {
            const tw = (p.w / 16) * TILE;
            const th = (p.h / 16) * TILE;
            const s = TILE / 16;

            // 1. High-Contrast Multi-Layer Drop Shadows & Enhanced Lighting
            ctx.save();
            // Ensure drop shadow never bleeds into room interiors
            rooms.forEach(r => {
              if (p.x + tw > r.x * TILE && p.x < (r.x + r.w) * TILE && p.y + th >= r.y * TILE - 32 && p.y < r.y * TILE) {
                ctx.beginPath();
                ctx.rect(0, 0, W, r.y * TILE - 6);
                ctx.clip();
              }
            });

            if (p.name === 'outdoor_street_lamppost') {
              // Post base multi-layer drop shadow
              const postBaseX = p.x + tw * 0.36;
              const postBaseY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 13 * s, 6 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 8 * s, 3.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();

              if (p.hasGlow) {
                const lanternGroundX = p.x + tw * 0.72;
                const lanternGroundY = p.y + th - 2 * s;
                const glowGrad = ctx.createRadialGradient(lanternGroundX, lanternGroundY, 3 * s, lanternGroundX, lanternGroundY, 38 * s);
                glowGrad.addColorStop(0, 'rgba(255, 240, 140, 0.48)');
                glowGrad.addColorStop(0.40, 'rgba(255, 220, 110, 0.22)');
                glowGrad.addColorStop(0.75, 'rgba(255, 210, 90, 0.08)');
                glowGrad.addColorStop(1, 'rgba(255, 210, 90, 0.0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(lanternGroundX, lanternGroundY, 38 * s, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (p.name.includes('fountain') || p.name.includes('pool')) {
              // Fountain & Pool Grounding Drop Shadow
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 3 * s;
              ctx.fillStyle = 'rgba(10, 25, 35, 0.45)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.90) / 2, (th * 0.38) / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 12, 20, 0.75)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.68) / 2, (th * 0.22) / 2, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('pillar') || p.name.includes('pedestal')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 15, 30, 0.48)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.88) / 2, 6.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 10, 20, 0.76)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.58) / 2, 4 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('flowerbed')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 3 * s;
              ctx.fillStyle = 'rgba(10, 25, 12, 0.40)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.80) / 2, 8 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(5, 15, 8, 0.65)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.54) / 2, 4.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('grass')) {
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 2 * s;
              ctx.fillStyle = 'rgba(10, 20, 10, 0.42)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.75) / 2, 3.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            // 2. Draw sprite
            drawSprite(p.name, p.x, p.y, p.w, p.h);
          });
        }`;

bmmContent = bmmContent.substring(0, sIdx) + newPropsBlock + bmmContent.substring(eIdx + endMarker.length);
fs.writeFileSync(bmmPath, bmmContent, 'utf8');
console.log('build_master_map.js updated with enlarged fountains!');

// 2. Update mapEngine.js
const mePath = 'mapEngine.js';
let meContent = fs.readFileSync(mePath, 'utf8');

const solidPropsStart = 'const outdoorSolidProps = [';
const solidPropsEnd = 'outdoorSolidProps.forEach(p => {';

const sStartIdx = meContent.indexOf(solidPropsStart);
const sEndIdx = meContent.indexOf(solidPropsEnd);

const waterColliders = enlargedWaterFeatures.map(wf => {
  let type = 'fountain';
  if (wf.name.includes('pool')) type = 'pool';
  return `{ type: '${type}', x: ${(wf.x/TILE).toFixed(1)}, y: ${(wf.y/TILE).toFixed(1)}, w: ${wf.w}, h: ${wf.h} }`;
}).join(',\n      ');

const newSolidPropsBlock = `const outdoorSolidProps = [
      // Enlarged Water Features (Grand Fountains & Leisure Swimming Pool):
      ${waterColliders},

      // Street Lampposts (slender wooden pole base):
      { type: 'lamppost', x: 38.6, y: 24.4, w: 26, h: 40 },
      { type: 'lamppost', x: 63.8, y: 24.4, w: 26, h: 40 },
      { type: 'lamppost', x: 38.6, y: 50.2, w: 26, h: 40 },
      { type: 'lamppost', x: 63.8, y: 50.2, w: 26, h: 40 },
      { type: 'lamppost', x: 45.2, y: 70.4, w: 26, h: 40 },
      { type: 'lamppost', x: 56.8, y: 70.4, w: 26, h: 40 },

      // Ancient Stone Pillars & Pedestals:
      { type: 'pillar', x: 23.5, y: 47.8, w: 16, h: 41 },
      { type: 'pillar', x: 32.5, y: 47.8, w: 16, h: 41 },
      { type: 'pillar', x: 19.5, y: 40.5, w: 16, h: 41 },
      { type: 'pedestal', x: 19.2, y: 42.5, w: 20, h: 13 },
      { type: 'pillar', x: 19.5, y: 44.5, w: 16, h: 31 }
    ];

    `;

meContent = meContent.substring(0, sStartIdx) + newSolidPropsBlock + meContent.substring(sEndIdx);
fs.writeFileSync(mePath, meContent, 'utf8');
console.log('mapEngine.js updated with enlarged fountain colliders!');
