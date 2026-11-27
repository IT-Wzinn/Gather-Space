const TILE = 32;
const TILE_SIZE = 32;
const fs = require('fs');

const code = fs.readFileSync('build_master_map.js', 'utf8');
const rMatch = code.match(/const ROOMS = \[([\s\S]*?)\n\];/);
const rooms = eval('[' + rMatch[1] + ']');

const props = [
  // --- A. STREET LAMPPOSTS (Curbside Corner Placement & Main Entrance Portals) ---
  { name: 'outdoor_street_lamppost', x: 38.6 * TILE, y: 24.4 * TILE, w: 26, h: 40, hasGlow: true },
  { name: 'outdoor_street_lamppost', x: 63.8 * TILE, y: 24.4 * TILE, w: 26, h: 40, hasGlow: true },
  { name: 'outdoor_street_lamppost', x: 38.6 * TILE, y: 50.2 * TILE, w: 26, h: 40, hasGlow: true },
  { name: 'outdoor_street_lamppost', x: 63.8 * TILE, y: 50.2 * TILE, w: 26, h: 40, hasGlow: true },
  { name: 'outdoor_street_lamppost', x: 45.2 * TILE, y: 70.4 * TILE, w: 26, h: 40, hasGlow: true },
  { name: 'outdoor_street_lamppost', x: 56.8 * TILE, y: 70.4 * TILE, w: 26, h: 40, hasGlow: true },

  // --- B. ANCIENT STONE PILLARS & PEDESTALS ---
  { name: 'outdoor_ancient_pillar_intact', x: 23.5 * TILE, y: 47.8 * TILE, w: 16, h: 41 },
  { name: 'outdoor_ancient_pillar_intact', x: 32.5 * TILE, y: 47.8 * TILE, w: 16, h: 41 },
  { name: 'outdoor_ancient_pillar_cracked', x: 19.5 * TILE, y: 40.5 * TILE, w: 16, h: 41 },
  { name: 'outdoor_ancient_pedestal', x: 19.2 * TILE, y: 42.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_ancient_pillar_ruin', x: 19.5 * TILE, y: 44.5 * TILE, w: 16, h: 31 },

  // --- C. DAISY FLOWERBEDS (Blooming White Daisies scattered across campus) ---
  // Zone 1: North Perimeter (Campus Top Lawn)
  { name: 'outdoor_daisy_flowerbed', x: 18.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
  { name: 'outdoor_daisy_flowerbed', x: 28.5 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
  { name: 'outdoor_daisy_flowerbed', x: 47.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
  { name: 'outdoor_daisy_flowerbed', x: 63.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
  { name: 'outdoor_daisy_flowerbed', x: 75.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },
  { name: 'outdoor_daisy_flowerbed', x: 89.0 * TILE, y: 3.8 * TILE, w: 36, h: 25 },

  // Zone 2: North Avenue Promenade (Promenades around Central Lounge, Pantry, Cafeteria, Exec Suites)
  { name: 'outdoor_daisy_flowerbed', x: 14.5 * TILE, y: 24.2 * TILE, w: 36, h: 25 }, // south wall Room 5
  { name: 'outdoor_daisy_flowerbed', x: 27.0 * TILE, y: 24.2 * TILE, w: 36, h: 25 }, // south wall Room 5 (existing)
  { name: 'outdoor_daisy_flowerbed', x: 33.0 * TILE, y: 27.4 * TILE, w: 36, h: 25 }, // north of Zen Garden
  { name: 'outdoor_daisy_flowerbed', x: 43.5 * TILE, y: 27.6 * TILE, w: 36, h: 25 }, // north wall Central Lounge
  { name: 'outdoor_daisy_flowerbed', x: 57.0 * TILE, y: 27.6 * TILE, w: 36, h: 25 }, // north wall Central Lounge east
  { name: 'outdoor_daisy_flowerbed', x: 59.5 * TILE, y: 24.2 * TILE, w: 36, h: 25 }, // south wall Cafeteria
  { name: 'outdoor_daisy_flowerbed', x: 81.5 * TILE, y: 21.0 * TILE, w: 36, h: 25 }, // Exec suite promenade A
  { name: 'outdoor_daisy_flowerbed', x: 78.0 * TILE, y: 38.0 * TILE, w: 36, h: 25 }, // Exec suite promenade B west
  { name: 'outdoor_daisy_flowerbed', x: 85.5 * TILE, y: 38.0 * TILE, w: 36, h: 25 }, // Exec suite promenade B east

  // Zone 3: South Avenue Boulevard (Walkways between Workspace, Zen Garden, Central Lounge, Reception, Library)
  { name: 'outdoor_daisy_flowerbed', x: 13.5 * TILE, y: 51.2 * TILE, w: 36, h: 25 }, // north wall Workspace
  { name: 'outdoor_daisy_flowerbed', x: 22.5 * TILE, y: 51.2 * TILE, w: 36, h: 25 }, // north wall Workspace east
  { name: 'outdoor_daisy_flowerbed', x: 44.5 * TILE, y: 47.2 * TILE, w: 36, h: 25 }, // south wall Central Lounge west
  { name: 'outdoor_daisy_flowerbed', x: 58.5 * TILE, y: 47.2 * TILE, w: 36, h: 25 }, // south wall Central Lounge east
  { name: 'outdoor_daisy_flowerbed', x: 55.0 * TILE, y: 51.2 * TILE, w: 36, h: 25 }, // north wall Reception (right of door)
  { name: 'outdoor_daisy_flowerbed', x: 74.0 * TILE, y: 55.2 * TILE, w: 36, h: 25 }, // north wall Quiet Lounge west
  { name: 'outdoor_daisy_flowerbed', x: 88.0 * TILE, y: 55.2 * TILE, w: 36, h: 25 }, // north wall Quiet Lounge east

  // Zone 4: South Perimeter & Main Entrance Plaza
  { name: 'outdoor_daisy_flowerbed', x: 8.5 * TILE, y: 72.0 * TILE, w: 36, h: 25 },  // near bottom-west cherry tree
  { name: 'outdoor_daisy_flowerbed', x: 18.0 * TILE, y: 72.5 * TILE, w: 36, h: 25 }, // south perimeter lawn west
  { name: 'outdoor_daisy_flowerbed', x: 26.5 * TILE, y: 72.0 * TILE, w: 36, h: 25 }, // south perimeter lawn west
  { name: 'outdoor_daisy_flowerbed', x: 42.5 * TILE, y: 71.0 * TILE, w: 36, h: 25 }, // Main Entrance west facade
  { name: 'outdoor_daisy_flowerbed', x: 60.5 * TILE, y: 71.0 * TILE, w: 36, h: 25 }, // Main Entrance east facade
  { name: 'outdoor_daisy_flowerbed', x: 73.0 * TILE, y: 72.0 * TILE, w: 36, h: 25 }, // south perimeter lawn east
  { name: 'outdoor_daisy_flowerbed', x: 84.0 * TILE, y: 72.5 * TILE, w: 36, h: 25 }, // near bottom-east cherry tree
  { name: 'outdoor_daisy_flowerbed', x: 94.0 * TILE, y: 72.0 * TILE, w: 36, h: 25 }, // bottom-east corner

  // Zone 5 & 6: Exterior West/East Lawns & Vertical Courtyards
  { name: 'outdoor_daisy_flowerbed', x: 3.5 * TILE, y: 16.5 * TILE, w: 36, h: 25 },  // West perimeter top
  { name: 'outdoor_daisy_flowerbed', x: 3.5 * TILE, y: 38.0 * TILE, w: 36, h: 25 },  // West perimeter mid
  { name: 'outdoor_daisy_flowerbed', x: 3.5 * TILE, y: 62.0 * TILE, w: 36, h: 25 },  // West perimeter bottom
  { name: 'outdoor_daisy_flowerbed', x: 100.5 * TILE, y: 15.5 * TILE, w: 36, h: 25 },// East perimeter top
  { name: 'outdoor_daisy_flowerbed', x: 100.5 * TILE, y: 46.5 * TILE, w: 36, h: 25 },// East perimeter mid
  { name: 'outdoor_daisy_flowerbed', x: 100.5 * TILE, y: 68.0 * TILE, w: 36, h: 25 },// East perimeter bottom
  { name: 'outdoor_daisy_flowerbed', x: 18.0 * TILE, y: 42.5 * TILE, w: 36, h: 25 }, // Classical Ruins garden
  { name: 'outdoor_daisy_flowerbed', x: 37.0 * TILE, y: 31.5 * TILE, w: 36, h: 25 }, // West courtyard (near Zen garden)
  { name: 'outdoor_daisy_flowerbed', x: 37.0 * TILE, y: 65.5 * TILE, w: 36, h: 25 }, // Reception west wall
  { name: 'outdoor_daisy_flowerbed', x: 64.5 * TILE, y: 31.5 * TILE, w: 36, h: 25 }, // East courtyard (near Central Lounge)
  { name: 'outdoor_daisy_flowerbed', x: 64.5 * TILE, y: 63.5 * TILE, w: 36, h: 25 }, // Reception east wall

  // --- D. WILD TALL GRASS TUFTS (Natural accents, corners, curbs, tree bases) ---
  // Zone 1: North Perimeter (Campus Top Lawn)
  { name: 'outdoor_tall_grass_tuft_a', x: 13.8 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 23.5 * TILE, y: 4.2 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 33.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 41.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 53.5 * TILE, y: 4.2 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 66.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 80.5 * TILE, y: 4.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 94.0 * TILE, y: 4.0 * TILE, w: 20, h: 13 },

  // Zone 2: North Avenue Promenade
  { name: 'outdoor_tall_grass_tuft_a', x: 15.5 * TILE, y: 24.6 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 37.2 * TILE, y: 24.6 * TILE, w: 20, h: 13 }, // near lamppost
  { name: 'outdoor_tall_grass_tuft_b', x: 65.5 * TILE, y: 24.6 * TILE, w: 18, h: 13 }, // near lamppost
  { name: 'outdoor_tall_grass_tuft_a', x: 45.0 * TILE, y: 27.8 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 61.5 * TILE, y: 27.8 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 70.5 * TILE, y: 21.2 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 94.5 * TILE, y: 21.2 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 82.5 * TILE, y: 38.2 * TILE, w: 20, h: 13 },

  // Zone 3: South Avenue Boulevard
  { name: 'outdoor_tall_grass_tuft_a', x: 10.5 * TILE, y: 51.3 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 19.5 * TILE, y: 51.3 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_b', x: 34.0 * TILE, y: 48.0 * TILE, w: 18, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 37.2 * TILE, y: 50.4 * TILE, w: 20, h: 13 }, // near lamppost
  { name: 'outdoor_tall_grass_tuft_a', x: 40.8 * TILE, y: 51.2 * TILE, w: 20, h: 13 }, // near cherry tree
  { name: 'outdoor_tall_grass_tuft_a', x: 59.0 * TILE, y: 51.3 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_b', x: 65.5 * TILE, y: 50.4 * TILE, w: 18, h: 13 }, // near lamppost
  { name: 'outdoor_tall_grass_tuft_a', x: 71.0 * TILE, y: 55.3 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 77.5 * TILE, y: 55.3 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 95.0 * TILE, y: 55.3 * TILE, w: 20, h: 13 },

  // Zone 4: South Perimeter & Main Entrance
  { name: 'outdoor_tall_grass_tuft_a', x: 4.5 * TILE, y: 72.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 14.0 * TILE, y: 73.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 22.0 * TILE, y: 72.8 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 31.0 * TILE, y: 72.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 47.5 * TILE, y: 71.2 * TILE, w: 20, h: 13 }, // Main entrance west curb
  { name: 'outdoor_tall_grass_tuft_a', x: 54.5 * TILE, y: 71.2 * TILE, w: 20, h: 13 }, // Main entrance east curb
  { name: 'outdoor_tall_grass_tuft_a', x: 68.5 * TILE, y: 72.8 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 77.0 * TILE, y: 73.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 89.5 * TILE, y: 72.8 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 99.5 * TILE, y: 72.5 * TILE, w: 20, h: 13 },

  // Zone 5 & 6: Lawns & Courtyards
  { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 12.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 34.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 4.8 * TILE, y: 56.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 101.5 * TILE, y: 11.0 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 101.5 * TILE, y: 40.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 101.5 * TILE, y: 63.5 * TILE, w: 20, h: 13 },
  { name: 'outdoor_tall_grass_tuft_a', x: 18.2 * TILE, y: 37.5 * TILE, w: 20, h: 13 }, // Classical ruins
  { name: 'outdoor_tall_grass_tuft_a', x: 38.2 * TILE, y: 38.5 * TILE, w: 20, h: 13 }, // West corridor
  { name: 'outdoor_tall_grass_tuft_a', x: 38.2 * TILE, y: 58.0 * TILE, w: 20, h: 13 }, // Reception west wall
  { name: 'outdoor_tall_grass_tuft_a', x: 64.0 * TILE, y: 38.5 * TILE, w: 20, h: 13 }, // East corridor
  { name: 'outdoor_tall_grass_tuft_a', x: 64.0 * TILE, y: 58.5 * TILE, w: 20, h: 13 }, // Reception east wall

  // Wild grass rows along long wall bases
  { name: 'outdoor_wild_grass_row', x: 12.0 * TILE, y: 24.2 * TILE, w: 42, h: 11 },
  { name: 'outdoor_wild_grass_row', x: 59.5 * TILE, y: 51.3 * TILE, w: 42, h: 11 },
  { name: 'outdoor_wild_grass_row', x: 86.0 * TILE, y: 55.3 * TILE, w: 42, h: 11 }
];

// Validate props against room interiors and doors
let errors = [];
props.forEach((p, idx) => {
  const px = p.x / TILE;
  const py = p.y / TILE;
  const pw = p.w / 16;
  const ph = p.h / 16;

  rooms.forEach(r => {
    // Check if inside room interior:
    if (px >= r.x + 0.5 && (px + pw) <= (r.x + r.w - 0.5) && py >= r.y + 0.5 && (py + ph) <= (r.y + r.h - 0.5)) {
      errors.push(`Prop ${idx} (${p.name}) inside Room ${r.num}: x=${px}, y=${py}`);
    }

    // Check if overlapping doors:
    const doors = r.doors || (r.door ? [r.door] : []);
    doors.forEach(d => {
      // door box
      const dx1 = d.x;
      const dx2 = d.x + d.w;
      const dy1 = d.y - 0.5;
      const dy2 = d.y + 1.0;
      if (!(px + pw < dx1 || px > dx2 || py + ph < dy1 || py > dy2)) {
        errors.push(`Prop ${idx} (${p.name}) overlaps Door of Room ${r.num}: x=${px}, y=${py}, door=x:${dx1}..${dx2}, y:${d.y}`);
      }
    });
  });
});

console.log('Validation completed. Total props:', props.length);
console.log('Daisy flowerbeds count:', props.filter(p => p.name === 'outdoor_daisy_flowerbed').length);
console.log('Grass tufts count:', props.filter(p => p.name.includes('tuft')).length);
if (errors.length > 0) {
  console.log('Errors found:', errors);
} else {
  console.log('ALL PROPS VALID! Zero collisions with room interiors or doors.');
}
