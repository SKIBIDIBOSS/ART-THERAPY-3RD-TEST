import React, { useState } from 'react';

const LABELS = ['','Very calm','Calm','Mildly stressed','Somewhat stressed','Moderately stressed','Stressed','Quite stressed','Very stressed','Highly stressed','Extremely stressed'];
const COLORS = { 1:'#70c48c',2:'#8cc470',3:'#c4b870',4:'#c49a70',5:'#c47a70',6:'#c47070',7:'#b86060',8:'#a84848',9:'#983030',10:'#882020' };

export default function PostSurveyPage({ onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const display = hovered || selected;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitting(true);
    setTimeout(() => onSubmit(selected, note), 400);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="card card-glow animate-fade-up" style={{ maxWidth:'540px', width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ width:64,height:64,borderRadius:'50%',background:'rgba(155,142,196,0.1)',border:'1px solid rgba(155,142,196,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',animation:'glow-pulse 4s ease-in-out infinite' }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="13" stroke="#9b8ec4" strokeWidth="1"/>
            <path d="M8 18s2 3 7 3 7-3 7-3" stroke="#9b8ec4" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="11" r="1.5" fill="#9b8ec4"/>
            <circle cx="19" cy="11" r="1.5" fill="#9b8ec4"/>
          </svg>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:300, marginBottom:'10px' }}>How do you feel now?</h1>
        <p style={{ color:'var(--text2)', marginBottom:'36px', fontSize:'14px' }}>After drawing your mandala, rate your current stress level.</p>

        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'14px' }}>
            <span>Calm</span><span>Stressed</span>
          </div>
          <div style={{ display:'flex', gap:'6px', justifyContent:'center', flexWrap:'wrap' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setSelected(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(null)}
                style={{
                  width:48, height:64, borderRadius:'10px',
                  background: selected === n ? `rgba(0,0,0,0.2)` : 'var(--surface2)',
                  border: `1.5px solid ${selected === n || hovered === n ? COLORS[n] : 'var(--border)'}`,
                  color: selected === n || hovered === n ? COLORS[n] : 'var(--text2)',
                  cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'20px',
                  transform: selected === n ? 'translateY(-6px) scale(1.05)' : hovered === n ? 'translateY(-3px)' : 'none',
                  transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)'
                }}
              >{n}</button>
            ))}
          </div>
          <div style={{ height:36, display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:14, opacity: display ? 1 : 0, transition:'opacity 0.3s' }}>
            {display && <>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'26px', color: COLORS[display] }}>{display}</span>
              <span style={{ color:'var(--text2)', fontSize:'14px' }}>{LABELS[display]}</span>
            </>}
          </div>
        </div>

        <div style={{ marginBottom:'28px', textAlign:'left' }}>
          <label className="label">Additional thoughts <span style={{ color:'var(--text3)', fontWeight:400, textTransform:'none', letterSpacing:'normal' }}>(optional)</span></label>
          <textarea className="input-field" placeholder="How was the experience? Any feelings or observations..." rows={3} value={note} onChange={e => setNote(e.target.value)} style={{ resize:'vertical', fontFamily:'var(--font-body)' }} />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={!selected || submitting} style={{ width:'100%', justifyContent:'center', opacity: !selected ? 0.4 : 1 }}>
          {submitting ? 'Saving...' : 'See my results →'}
        </button>
      </div>
    </div>
  );
}
