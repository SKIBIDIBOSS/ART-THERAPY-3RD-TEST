export const MANDALA_THEMES = {
  calm:     { colors: ['#70c48c','#8cc470','#a0d090','#c4d870','#70c4b0'], accent: '#70c48c' },
  mild:     { colors: ['#c4b870','#d4a870','#c49a70','#d4c070','#b8a860'], accent: '#c4b870' },
  moderate: { colors: ['#c47a70','#c47050','#d46060','#b85050','#c48070'], accent: '#c47a70' },
  high:     { colors: ['#9b8ec4','#8070b8','#a090d0','#7060a8','#b0a0d8'], accent: '#9b8ec4' },
  extreme:  { colors: ['#c47070','#a04040','#882020','#d06060','#b04848'], accent: '#c47070' }
};

export function getThemeForStress(level) {
  if (level <= 2) return MANDALA_THEMES.calm;
  if (level <= 4) return MANDALA_THEMES.mild;
  if (level <= 6) return MANDALA_THEMES.moderate;
  if (level <= 8) return MANDALA_THEMES.high;
  return MANDALA_THEMES.extreme;
}

const STYLE_NAMES = [
  'Lotus','Spiral','Geometric','Floral','Star','Wave','Crystal','Sunburst',
  'Web','Radiant','Sacred','Harmony','Balance','Peace','Bloom','Cosmos',
  'Infinity','Zenith','Serenity','Clarity','Tranquil','Ethereal'
];
const PETALS_OPTIONS = [4,5,6,7,8,9,10,12,16,20,24];

function generateDesigns(stressLevel) {
  const designs = [];
  for (let i = 0; i < 22; i++) {
    const seed = stressLevel * 100 + i;
    designs.push({
      id: `${stressLevel}-${i}`,
      name: `${STYLE_NAMES[i % STYLE_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}`,
      petals: PETALS_OPTIONS[(seed * 7 + i * 3) % PETALS_OPTIONS.length],
      rings: Math.min(2 + Math.floor(stressLevel / 2) + (i % 3), 8),
      hasInnerPetals: (seed + i) % 3 === 0,
      hasSpiral: (seed + i) % 4 === 0,
      hasDots: (seed + i) % 2 === 0,
      hasTriangles: stressLevel >= 5 && (seed + i) % 3 === 1,
      hasDiamond: stressLevel >= 7 && (seed + i) % 2 === 1,
      hasHexagon: stressLevel >= 3 && (seed + i) % 5 === 0,
      innerPetals: (seed + i) % 3 === 0 ? Math.max(4, PETALS_OPTIONS[(seed * 7 + i * 3) % PETALS_OPTIONS.length] - 2) : 0,
      seed,
      complexity: stressLevel + (i % 3)
    });
  }
  return designs;
}

export const MANDALA_DESIGNS = {};
for (let i = 1; i <= 10; i++) MANDALA_DESIGNS[i] = generateDesigns(i);
