import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MANDALA_DESIGNS, getThemeForStress } from '../utils/mandalaDesigns';
import { buildMandalaRegions, drawMandalaOutlines, hitTestRegion } from '../utils/mandalaRenderer';
import './MandalaPage.css';

const PRESET_COLORS = [
  '#c8a96e','#9b8ec4','#70c48c','#c47070','#70b8c4',
  '#d4a060','#a070c4','#c4d470','#c47090','#70c4b0',
  '#e8b888','#8888e8','#88e8a0','#e88888','#88c8e8',
  '#f0d080','#b090f0','#90f0b0','#f09090','#90d0f0',
];

function MandalaThumb({ design, theme }) {
  const size = 100;
  const cx = size / 2, cy = size / 2, R = size * 0.44;
  const { petals, rings } = design;
  const els = [];
  for (let r = 0; r < Math.min(rings, 4); r++) {
    els.push(<circle key={`r${r}`} cx={cx} cy={cy} r={R * ((r+1) / Math.min(rings,4))} fill="none" stroke={theme.accent} strokeWidth="0.5" opacity={0.3 + r*0.1}/>);
  }
  for (let p = 0; p < petals; p++) {
    const angle = (p / petals) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(angle) * R * 0.7;
    const py = cy + Math.sin(angle) * R * 0.7;
    els.push(<ellipse key={`p${p}`} cx={px} cy={py} rx={R*0.08} ry={R*0.22} fill={theme.accent} opacity={0.25} transform={`rotate(${(p/petals)*360},${px},${py})`}/>);
    els.push(<line key={`l${p}`} x1={cx} y1={cy} x2={cx+Math.cos(angle)*R} y2={cy+Math.sin(angle)*R} stroke={theme.accent} strokeWidth="0.4" opacity={0.15}/>);
  }
  els.push(<circle key="c" cx={cx} cy={cy} r={R*0.07} fill={theme.accent} opacity={0.6}/>);
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{els}</svg>;
}

export default function MandalaPage({ stressLevel, onFinish, onExit }) {
  const theme = getThemeForStress(stressLevel);
  const allDesigns = MANDALA_DESIGNS[stressLevel] || MANDALA_DESIGNS[5];
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [view, setView] = useState('select');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tool, setTool] = useState('fill');
  const [filledMap, setFilledMap] = useState({});
  const [regions, setRegions] = useState([]);
  const [customColor, setCustomColor] = useState('#ffffff');
  const [showExitModal, setShowExitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const regionsRef = useRef([]);
  const filledRef = useRef({});
  filledRef.current = filledMap;
  regionsRef.current = regions;

  const initCanvas = useCallback((design) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cont = containerRef.current;
    const w = Math.min(cont ? cont.clientWidth - 64 : 500, 560);
    canvas.width = w; canvas.height = w;
    const r = buildMandalaRegions(design, w/2, w/2, w * 0.46);
    setRegions(r);
    setFilledMap({});
    return r;
  }, []);

  useEffect(() => {
    if (view === 'draw' && selectedIdx !== null) {
      const design = allDesigns[selectedIdx];
      const r = initCanvas(design);
      if (r) setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) drawMandalaOutlines(canvas.getContext('2d'), r, {}, design);
      }, 50);
    }
  }, [view, selectedIdx, initCanvas, allDesigns]);

  useEffect(() => {
    if (view !== 'draw' || selectedIdx === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawMandalaOutlines(canvas.getContext('2d'), regions, filledMap, allDesigns[selectedIdx]);
  }, [filledMap, regions, view, selectedIdx, allDesigns]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    for (let i = regionsRef.current.length - 1; i >= 0; i--) {
      if (hitTestRegion(regionsRef.current[i], mx, my)) {
        const id = regionsRef.current[i].id;
        setFilledMap(prev => {
          const next = { ...prev };
          if (tool === 'erase') delete next[id]; else next[id] = color;
          return next;
        });
        break;
      }
    }
  }, [tool, color]);

  if (view === 'select') {
    return (
      <div className="mandala-select-bg">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <header className="mandala-topbar">
          <span className="mandala-topbar-title">
            Choose your mandala — stress level <strong style={{ color: theme.accent }}>{stressLevel}</strong>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowExitModal(true)}>✕ Exit</button>
        </header>
        <div className="mandala-select-grid animate-fade-up">
          {allDesigns.map((d, idx) => (
            <button key={d.id} className="mandala-thumb" onClick={() => { setSelectedIdx(idx); setView('draw'); setFilledMap({}); }}>
              <MandalaThumb design={d} theme={theme} />
              <span className="mandala-thumb-name">{d.name}</span>
            </button>
          ))}
        </div>
        {showExitModal && (
          <div className="modal-overlay">
            <div className="modal animate-fade-up">
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'26px', marginBottom:'12px' }}>Leave session?</h3>
              <p className="text-muted" style={{ marginBottom:'28px', fontSize:'14px' }}>Your progress will not be saved.</p>
              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowExitModal(false)}>Stay</button>
                <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={() => { setShowExitModal(false); onExit(); }}>Leave</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const design = allDesigns[selectedIdx];
  return (
    <div className="mandala-draw-bg">
      <header className="draw-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('select')}>← Back</button>
          <span className="text-muted text-sm">{design?.name}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowFinishModal(true)}>Finish ✓</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowExitModal(true)}>✕</button>
        </div>
      </header>

      <div className="draw-layout">
        <aside className="draw-sidebar">
          <div className="tool-section">
            <p className="label">Tool</p>
            <div className="tool-group">
              <button className={`tool-btn ${tool === 'fill' ? 'active' : ''}`} onClick={() => setTool('fill')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12L8 2l3 3-6 6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M12 13c0 1-1.5 1.5-1.5 1.5S9 14 9 13s1.5-2 1.5-2 1.5 1 1.5 2z" fill="currentColor" opacity=".6"/></svg>
                Fill
              </button>
              <button className={`tool-btn ${tool === 'erase' ? 'active' : ''}`} onClick={() => setTool('erase')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Erase
              </button>
            </div>
          </div>

          {tool === 'fill' && (
            <div className="tool-section">
              <p className="label">Color</p>
              <div className="color-grid">
                {PRESET_COLORS.map(c => (
                  <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`} style={{ '--c': c }} onClick={() => setColor(c)} />
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'10px' }}>
                <span className="label" style={{ marginBottom:0 }}>Custom</span>
                <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); }} className="color-picker-input" />
              </div>
              <div className="selected-color-preview" style={{ background: color }}>
                <span>{color}</span>
              </div>
            </div>
          )}

          <div className="tool-section">
            <button className="btn btn-ghost btn-sm w-full" style={{ justifyContent:'center', color:'var(--rose)', borderColor:'rgba(196,112,112,0.3)' }} onClick={() => setShowDeleteModal(true)}>
              Clear all
            </button>
          </div>
        </aside>

        <main className="draw-main" ref={containerRef}>
          <canvas ref={canvasRef} className="mandala-canvas" onClick={handleCanvasClick} style={{ cursor: tool === 'fill' ? 'crosshair' : 'cell' }} />
        </main>
      </div>

      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-up">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'26px', marginBottom:'12px' }}>Leave session?</h3>
            <p className="text-muted" style={{ marginBottom:'28px', fontSize:'14px' }}>Your mandala will not be saved.</p>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowExitModal(false)}>Stay</button>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={() => { setShowExitModal(false); onExit(); }}>Leave</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-up">
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'26px', marginBottom:'12px' }}>Clear everything?</h3>
            <p className="text-muted" style={{ marginBottom:'28px', fontSize:'14px' }}>This cannot be undone.</p>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={() => { setFilledMap({}); setShowDeleteModal(false); }}>Clear all</button>
            </div>
          </div>
        </div>
      )}
      {showFinishModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-up" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎨</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'28px', marginBottom:'10px' }}>Are you finished?</h3>
            <p className="text-muted" style={{ fontSize:'14px', marginBottom:'28px' }}>You'll move on to a short reflection survey.</p>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setShowFinishModal(false)}>Not yet</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => { setShowFinishModal(false); onFinish(); }}>Yes, finish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
