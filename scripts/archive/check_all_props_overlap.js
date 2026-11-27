const fs = require('fs');
const TILE = 32;

const code = fs.readFileSync('test_props_validator.js', 'utf8');
const pMatch = code.match(/const props = \[([\s\S]*?)\];\s*\/\/\s*Validate/);
const existingProps = eval('[' + pMatch[1] + ']');

const wfCode = fs.readFileSync('test_fountain_placements.js', 'utf8');
const wMatch = wfCode.match(/const waterFeatures = \[([\s\S]*?)\];/);
const waterFeatures = eval('[' + wMatch[1] + ']');

let overlaps = [];
waterFeatures.forEach(wf => {
  const wfx1 = wf.x / TILE;
  const wfx2 = (wf.x + (wf.w / 16) * TILE) / TILE;
  const wfy1 = wf.y / TILE;
  const wfy2 = (wf.y + (wf.h / 16) * TILE) / TILE;

  existingProps.forEach((ep, eIdx) => {
    const epx1 = ep.x / TILE;
    const epx2 = (ep.x + (ep.w / 16) * TILE) / TILE;
    const epy1 = ep.y / TILE;
    const epy2 = (ep.y + (ep.h / 16) * TILE) / TILE;

    const overlapX = !(wfx2 < epx1 || wfx1 > epx2);
    const overlapY = !(wfy2 < epy1 || wfy1 > epy2);

    if (overlapX && overlapY) {
      overlaps.push({
        wf: wf.name,
        ep: ep.name,
        eIdx,
        wfBox: [wfx1, wfx2, wfy1, wfy2],
        epBox: [epx1, epx2, epy1, epy2]
      });
    }
  });
});

console.log('Overlaps found:', overlaps.length);
if (overlaps.length > 0) {
  console.log(overlaps);
} else {
  console.log('Zero overlaps between water features and existing props!');
}
