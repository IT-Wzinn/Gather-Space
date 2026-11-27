const fs = require('fs');

const bmmPath = 'build_master_map.js';
let content = fs.readFileSync(bmmPath, 'utf8');

const startMarker = 'const outdoorWalkwayProps = [';
const endMarker = '            // 2. Draw sprite\n            drawSprite(p.name, p.x, p.y, p.w, p.h);\n          });\n        }';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

// Read the validated props array from test_props_validator.js:
const valCode = fs.readFileSync('test_props_validator.js', 'utf8');
const pMatch = valCode.match(/const props = \[([\s\S]*?)\];\s*\/\/\s*Validate/);
if (!pMatch) {
  console.error('Props array not found in test_props_validator.js!');
  process.exit(1);
}

const propsStr = pMatch[1].trim();

const newBlock = `const outdoorWalkwayProps = [
            ${propsStr}
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
              // Layer 1: Ambient spread
              ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 13 * s, 6 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              // Layer 2: Deep grounding core
              ctx.fillStyle = 'rgba(5, 10, 20, 0.75)';
              ctx.beginPath();
              ctx.ellipse(postBaseX, postBaseY, 8 * s, 3.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();

              // Enhanced warm ambient circular glow beneath the lantern
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
            } else if (p.name.includes('pillar') || p.name.includes('pedestal')) {
              // Multi-layer stone pillar grounding drop shadow
              const shadowX = p.x + tw / 2;
              const shadowY = p.y + th - 2 * s;
              // Layer 1: Soft stone spread
              ctx.fillStyle = 'rgba(10, 15, 30, 0.48)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY, (tw * 0.88) / 2, 6.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              // Layer 2: Deep grounding weight
              ctx.fillStyle = 'rgba(5, 10, 20, 0.76)';
              ctx.beginPath();
              ctx.ellipse(shadowX, shadowY + 1 * s, (tw * 0.58) / 2, 4 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.name.includes('flowerbed')) {
              // Multi-layer grounding shadow under flowerbed
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
              // Contact shadow under grass tufts
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

content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + endMarker.length);
fs.writeFileSync(bmmPath, content, 'utf8');
console.log('Successfully applied scattered decorations to build_master_map.js!');
