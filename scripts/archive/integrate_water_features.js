const fs = require('fs');
const path = require('path');

const TILE = 32;

// Load props from test_props_validator.js and adjust the 6 shifted props
const valCode = fs.readFileSync('test_props_validator.js', 'utf8');
const pMatch = valCode.match(/const props = \[([\s\S]*?)\];\s*\/\/\s*Validate/);
let props = eval('[' + pMatch[1] + ']');

// Resolve overlaps with water features:
props.forEach(p => {
  const px = p.x / TILE;
  const py = p.y / TILE;

  // 1. tuft near north grand fountain (was at x: 53.5, y: 4.2)
  if (p.name === 'outdoor_tall_grass_tuft_a' && Math.abs(px - 53.5) < 0.1 && Math.abs(py - 4.2) < 0.1) {
    p.x = 48.0 * TILE;
    p.y = 4.5 * TILE;
  }
  // 2. daisy near south-west grand fountain (was at x: 18.0, y: 72.5)
  if (p.name === 'outdoor_daisy_flowerbed' && Math.abs(px - 18.0) < 0.1 && Math.abs(py - 72.5) < 0.1) {
    p.x = 19.5 * TILE;
    p.y = 72.5 * TILE;
  }
  // 3. tuft near south-west grand fountain (was at x: 14.0, y: 73.0)
  if (p.name === 'outdoor_tall_grass_tuft_a' && Math.abs(px - 14.0) < 0.1 && Math.abs(py - 73.0) < 0.1) {
    p.x = 11.0 * TILE;
    p.y = 72.8 * TILE;
  }
  // 4. daisy near kidney pool (was at x: 84.0, y: 72.5)
  if (p.name === 'outdoor_daisy_flowerbed' && Math.abs(px - 84.0) < 0.1 && Math.abs(py - 72.5) < 0.1) {
    p.x = 88.0 * TILE;
    p.y = 72.5 * TILE;
  }
  // 5. tuft near north-west classic fountain (was at x: 23.5, y: 4.2)
  if (p.name === 'outdoor_tall_grass_tuft_a' && Math.abs(px - 23.5) < 0.1 && Math.abs(py - 4.2) < 0.1) {
    p.x = 21.0 * TILE;
    p.y = 4.2 * TILE;
  }
  // 6. daisy near south classic fountain (was at x: 26.5, y: 72.0)
  if (p.name === 'outdoor_daisy_flowerbed' && Math.abs(px - 26.5) < 0.1 && Math.abs(py - 72.0) < 0.1) {
    p.x = 28.5 * TILE;
    p.y = 72.0 * TILE;
  }
  // 7. daisy near promenade pedestal fountain (was at x: 81.5, y: 21.0)
  if (p.name === 'outdoor_daisy_flowerbed' && Math.abs(px - 81.5) < 0.1 && Math.abs(py - 21.0) < 0.1) {
    p.x = 78.5 * TILE;
    p.y = 21.0 * TILE;
  }
});

// Define water features
const waterFeatures = [
  // 1. Grand Marble Orb Fountain (North Campus Central Centerpiece)
  { name: 'outdoor_fountain_grand_orb', x: 50.0 * TILE, y: 2.2 * TILE, w: 76, h: 49 },
  // 2. Grand Marble Orb Fountain (South-West Cherry Lawn Centerpiece)
  { name: 'outdoor_fountain_grand_orb', x: 13.5 * TILE, y: 72.0 * TILE, w: 76, h: 49 },

  // 3. Kidney Leisure Swimming Pool / Lagoon (South-East Relaxation Lawn below Room 9)
  { name: 'outdoor_water_pool_kidney', x: 84.5 * TILE, y: 71.8 * TILE, w: 66, h: 62 },

  // 4. Classic Round Tiered Stone Fountain (North-West Lawn above Room 5)
  { name: 'outdoor_fountain_tiered_classic', x: 23.5 * TILE, y: 2.5 * TILE, w: 46, h: 46 },
  // 5. Classic Round Tiered Stone Fountain (South-West Perimeter Lawn)
  { name: 'outdoor_fountain_tiered_classic', x: 32.5 * TILE, y: 72.0 * TILE, w: 46, h: 46 },

  // 6. Circular Carved Stone Fountain (West Courtyard Classical Sanctuary beside Zen Pond)
  { name: 'outdoor_fountain_circular_stone', x: 18.5 * TILE, y: 30.2 * TILE, w: 42, h: 39 },
  // 7. Circular Carved Stone Fountain (North-East Lawn above Exec Suites)
  { name: 'outdoor_fountain_circular_stone', x: 82.0 * TILE, y: 2.5 * TILE, w: 42, h: 39 },

  // 8. Ornate Multi-Tiered Pedestal Fountain (Executive Suite Promenade Plaza)
  { name: 'outdoor_fountain_ornate_pedestal', x: 84.2 * TILE, y: 21.0 * TILE, w: 32, h: 34 },
  // 9. Ornate Multi-Tiered Pedestal Fountain (East Courtyard Nook)
  { name: 'outdoor_fountain_ornate_pedestal', x: 64.2 * TILE, y: 44.0 * TILE, w: 32, h: 34 }
];

// Combine all outdoor props
const allOutdoorProps = [...waterFeatures, ...props];
console.log('Total combined outdoor props:', allOutdoorProps.length);

// Generate JavaScript code representation
const propsCode = allOutdoorProps.map(p => {
  let s = `{ name: '${p.name}', x: ${(p.x/TILE).toFixed(1)} * TILE, y: ${(p.y/TILE).toFixed(1)} * TILE, w: ${p.w}, h: ${p.h}`;
  if (p.hasGlow) s += `, hasGlow: true`;
  s += ` }`;
  return s;
}).join(',\n            ');

// Update build_master_map.js
const bmmPath = 'build_master_map.js';
let bmmContent = fs.readFileSync(bmmPath, 'utf8');

const startMarker = 'const outdoorWalkwayProps = [';
const endMarker = '            // 2. Draw sprite\n            drawSprite(p.name, p.x, p.y, p.w, p.h);\n          });\n        }';

const startIdx = bmmContent.indexOf(startMarker);
const endIdx = bmmContent.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('build_master_map markers not found!');
  process.exit(1);
}

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
              // Outer ambient spread
              ctx.fillStyle = 'rgba(10, 25, 35, 0.42)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.90) / 2, (th * 0.40) / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              // Core grounding shadow
              ctx.fillStyle = 'rgba(5, 12, 20, 0.72)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.68) / 2, (th * 0.24) / 2, 0, 0, Math.PI * 2);
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

bmmContent = bmmContent.substring(0, startIdx) + newPropsBlock + bmmContent.substring(endIdx + endMarker.length);
fs.writeFileSync(bmmPath, bmmContent, 'utf8');
console.log('build_master_map.js updated successfully!');

// Now update mapEngine.js to add solid collisions for the water features
const mePath = 'mapEngine.js';
let meContent = fs.readFileSync(mePath, 'utf8');

const solidPropsStart = 'const outdoorSolidProps = [';
const solidPropsEnd = 'outdoorSolidProps.forEach(p => {';

const sStartIdx = meContent.indexOf(solidPropsStart);
const sEndIdx = meContent.indexOf(solidPropsEnd);

if (sStartIdx === -1 || sEndIdx === -1) {
  console.error('mapEngine markers not found!');
  process.exit(1);
}

// Add water features into outdoorSolidProps
const waterColliders = waterFeatures.map(wf => {
  let type = 'fountain';
  if (wf.name.includes('pool')) type = 'pool';
  return `{ type: '${type}', x: ${(wf.x/TILE).toFixed(1)}, y: ${(wf.y/TILE).toFixed(1)}, w: ${wf.w}, h: ${wf.h} }`;
}).join(',\n      ');

const newSolidPropsBlock = `const outdoorSolidProps = [
      // Water Features (Grand Fountains & Leisure Swimming Pool):
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

// Also add 'fountain' and 'pool' collision box handling in outdoorSolidProps.forEach
const meEndLoopMarker = '} else if (p.type === \'pedestal\') {\n        boxes.push({\n          minX: p.x * TILE + tw * 0.15,\n          maxX: p.x * TILE + tw * 0.85,\n          minY: p.y * TILE + th * 0.40,\n          maxY: p.y * TILE + th * 0.98\n        });\n      }';

const meReplacement = `} else if (p.type === 'pedestal') {
        boxes.push({
          minX: p.x * TILE + tw * 0.15,
          maxX: p.x * TILE + tw * 0.85,
          minY: p.y * TILE + th * 0.40,
          maxY: p.y * TILE + th * 0.98
        });
      } else if (p.type === 'fountain') {
        // Solid stone basin/rim collider
        boxes.push({
          minX: p.x * TILE + tw * 0.14,
          maxX: p.x * TILE + tw * 0.86,
          minY: p.y * TILE + th * 0.32,
          maxY: p.y * TILE + th * 0.95
        });
      } else if (p.type === 'pool') {
        // Swimming pool water basin & coping rim
        boxes.push({
          minX: p.x * TILE + tw * 0.10,
          maxX: p.x * TILE + tw * 0.90,
          minY: p.y * TILE + th * 0.12,
          maxY: p.y * TILE + th * 0.92
        });
      }`;

if (meContent.includes(meEndLoopMarker)) {
  meContent = meContent.replace(meEndLoopMarker, meReplacement);
  fs.writeFileSync(mePath, meContent, 'utf8');
  console.log('mapEngine.js updated successfully with fountain & pool colliders!');
} else {
  console.warn('Could not find pedestal block in mapEngine.js!');
  fs.writeFileSync(mePath, meContent, 'utf8');
}
