export function buildMandalaRegions(design, cx, cy, radius) {
  const regions = [];
  const { petals, rings, hasInnerPetals, hasDots, hasTriangles, hasDiamond, hasHexagon, innerPetals } = design;

  // Center
  regions.push({ id: 'center', type: 'circle', x: cx, y: cy, r: radius * 0.06 });

  // Annular ring sectors
  for (let r = 0; r < rings; r++) {
    const outerR = radius * (0.15 + (r + 1) * (0.75 / rings));
    const innerR = radius * (0.15 + r * (0.75 / rings));
    for (let p = 0; p < petals; p++) {
      const startAngle = (p / petals) * Math.PI * 2 - Math.PI / 2;
      const endAngle   = ((p + 1) / petals) * Math.PI * 2 - Math.PI / 2;
      regions.push({ id: `ring-${r}-p-${p}`, type: 'annular-sector', cx, cy, innerR, outerR, startAngle, endAngle });
    }
  }

  // Outer petals
  const outerR = radius * 0.93;
  const petalLen = radius * 0.16;
  for (let p = 0; p < petals; p++) {
    const angle = (p / petals) * Math.PI * 2 - Math.PI / 2;
    regions.push({
      id: `op-${p}`, type: 'petal',
      cx: cx + Math.cos(angle) * (outerR - petalLen / 2),
      cy: cy + Math.sin(angle) * (outerR - petalLen / 2),
      angle, petalW: petalLen * 0.4, petalH: petalLen
    });
  }

  // Inner petals
  if (hasInnerPetals && innerPetals > 0) {
    const ipR = radius * 0.33;
    const ipLen = radius * 0.09;
    for (let p = 0; p < innerPetals; p++) {
      const angle = (p / innerPetals) * Math.PI * 2 - Math.PI / 2 + Math.PI / innerPetals;
      regions.push({
        id: `ip-${p}`, type: 'petal',
        cx: cx + Math.cos(angle) * ipR,
        cy: cy + Math.sin(angle) * ipR,
        angle, petalW: ipLen * 0.5, petalH: ipLen
      });
    }
  }

  // Triangles
  if (hasTriangles) {
    const tR = radius * 0.53;
    const tCount = Math.min(petals, 12);
    for (let p = 0; p < tCount; p++) {
      const a = (p / tCount) * Math.PI * 2 - Math.PI / 2;
      const tip = { x: cx + Math.cos(a) * tR, y: cy + Math.sin(a) * tR };
      const b1  = { x: cx + Math.cos(a + Math.PI / tCount) * tR * 0.6, y: cy + Math.sin(a + Math.PI / tCount) * tR * 0.6 };
      const b2  = { x: cx + Math.cos(a - Math.PI / tCount) * tR * 0.6, y: cy + Math.sin(a - Math.PI / tCount) * tR * 0.6 };
      regions.push({ id: `tri-${p}`, type: 'polygon', points: [tip, b1, b2] });
    }
  }

  // Diamonds
  if (hasDiamond) {
    const dR = radius * 0.70;
    const dCount = Math.min(petals, 8);
    for (let p = 0; p < dCount; p++) {
      const a = (p / dCount) * Math.PI * 2 - Math.PI / 2;
      const dx = cx + Math.cos(a) * dR;
      const dy = cy + Math.sin(a) * dR;
      const ds = radius * 0.055;
      regions.push({
        id: `di-${p}`, type: 'polygon', points: [
          { x: dx + Math.cos(a) * ds,               y: dy + Math.sin(a) * ds },
          { x: dx + Math.cos(a + Math.PI/2) * ds * .6, y: dy + Math.sin(a + Math.PI/2) * ds * .6 },
          { x: dx - Math.cos(a) * ds,               y: dy - Math.sin(a) * ds },
          { x: dx + Math.cos(a - Math.PI/2) * ds * .6, y: dy + Math.sin(a - Math.PI/2) * ds * .6 }
        ]
      });
    }
  }

  // Dots
  if (hasDots) {
    [0.27, 0.50, 0.73].forEach((frac, ri) => {
      const dotR = radius * frac;
      const offset = ri % 2 === 1 ? Math.PI / petals : 0;
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * Math.PI * 2 + offset;
        regions.push({ id: `dot-${ri}-${p}`, type: 'circle', x: cx + Math.cos(a) * dotR, y: cy + Math.sin(a) * dotR, r: radius * 0.024 });
      }
    });
  }

  // Hexagon
  if (hasHexagon) {
    const hR = radius * 0.11;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: cx + Math.cos(a) * hR, y: cy + Math.sin(a) * hR });
    }
    regions.push({ id: 'hex', type: 'polygon', points: pts });
  }

  return regions;
}

function getPath(region) {
  const path = new Path2D();
  if (region.type === 'circle') {
    path.arc(region.x, region.y, region.r, 0, Math.PI * 2);
  } else if (region.type === 'annular-sector') {
    const { cx, cy, innerR, outerR, startAngle, endAngle } = region;
    path.arc(cx, cy, outerR, startAngle, endAngle);
    path.arc(cx, cy, innerR, endAngle, startAngle, true);
    path.closePath();
  } else if (region.type === 'petal') {
    path.ellipse(region.cx, region.cy, region.petalW / 2, region.petalH / 2, region.angle + Math.PI / 2, 0, Math.PI * 2);
  } else if (region.type === 'polygon') {
    const pts = region.points;
    if (!pts || pts.length < 3) return null;
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
    path.closePath();
  }
  return path;
}

export function drawMandalaOutlines(ctx, regions, filledMap, design) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const { petals } = design;
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;

  // Guide lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 0.5;
  for (let p = 0; p < petals * 2; p++) {
    const angle = (p / (petals * 2)) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * ctx.canvas.width, cy + Math.sin(angle) * ctx.canvas.width);
    ctx.stroke();
  }
  ctx.restore();

  regions.forEach(region => {
    const fill = filledMap[region.id];
    const path = getPath(region);
    if (!path) return;
    ctx.save();
    ctx.fillStyle = fill || 'rgba(255,255,255,0.025)';
    ctx.strokeStyle = fill ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();
  });
}

export function hitTestRegion(region, mx, my) {
  const path = getPath(region);
  if (!path) return false;
  const off = document.createElement('canvas');
  off.width = off.height = 2000;
  return off.getContext('2d').isPointInPath(path, mx, my);
}
