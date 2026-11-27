const fs = require('fs');
const TILE = 32;

// Read existing non-water props from build_master_map.js
const bmm = fs.readFileSync('build_master_map.js', 'utf8');
const pMatch = bmm.match(/const outdoorWalkwayProps = \[([\s\S]*?)\];/);
const allProps = eval('[' + pMatch[1] + ']');
const otherProps = allProps.filter(p => !p.name.includes('fountain') && !p.name.includes('pool'));

const valCode = fs.readFileSync('test_enlarged_fountains.js', 'utf8');
const wMatch = valCode.match(/const enlargedWaterFeatures = \[([\s\S]*?)\];/);
const waterFeatures = eval('[' + wMatch[1] + ']');

let overlaps = [];
waterFeatures.forEach(wf => {
  const wfx1 = wf.x / TILE;
  const wfx2 = (wf.x + (wf.w / 16) * TILE) / TILE;
  const wfy1 = wf.y / TILE;
  const wfy2 = (wf.y + (wf.h / 16) * TILE) / TILE;

  otherProps.forEach((ep, eIdx) => {
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
        wfBox: [wfx1.toFixed(1), wfx2.toFixed(1), wfy1.toFixed(1), wfy2.toFixed(1)],
        epBox: [epx1.toFixed(1), epx2.toFixed(1), epy1.toFixed(1), epy2.toFixed(1)],
        eIdx
      });
    }
  });
});

console.log('Overlaps count:', overlaps.length);
if (overlaps.length > 0) {
  console.log(overlaps);
} else {
  console.log('Zero overlaps!');
}
