import React, { useState } from 'react';
import './SurveyPage.css';

const STRESS_LABELS = ['','Very calm','Calm','Mildly stressed','Somewhat stressed','Moderately stressed','Stressed','Quite stressed','Very stressed','Highly stressed','Extremely stressed'];
const STRESS_COLORS = { 1:'#70c48c',2:'#8cc470',3:'#c4b870',4:'#c49a70',5:'#c47a70',6:'#c47070',7:'#b86060',8:'#a84848',9:'#983030',10:'#882020' };

export default function SurveyPage({ user, onSubmit, onLogout }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setTimeout(() => onSubmit(selected), 500);
  };

  const display = hovered || selected;

  return (
    <div className="survey-bg">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <header className="survey-topbar">
        <div className="survey-logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#c8a96e" strokeWidth="1"/>
            <circle cx="10" cy="10" r="4" stroke="#c8a96e" strokeWidth="1" opacity="0.5"/>
            <circle cx="10" cy="10" r="1.5" fill="#c8a96e"/>
          </svg>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'16px' }}>Art Therapy</span>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <span style={{ color:'var(--text2)', fontSize:'13px' }}>{user?.firstName} {user?.lastName}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className={`survey-container animate-fade-up ${submitted ? 'exiting' : ''}`}>
        <div className="survey-card card card-glow">
          <div className="survey-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#c8a96e" strokeWidth="1"/>
              <path d="M10 18s2 3 6 3 6-3 6-3" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="1.5" fill="#c8a96e"/>
              <circle cx="20" cy="12" r="1.5" fill="#c8a96e"/>
            </svg>
          </div>
          <h1 className="survey-title">How are you feeling?</h1>
          <p className="survey-sub">
            Rate your stress level right now, on a scale of 1 to 10.<br />
            <span style={{ color:'var(--text3)', fontSize:'13px' }}>1 = least stressed &nbsp;·&nbsp; 10 = most stressed</span>
          </p>

          <div className="scale-container">
            <div className="scale-labels"><span>Calm</span><span>Stressed</span></div>
            <div className="scale-grid">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  className={`scale-btn ${selected === n ? 'selected' : ''}`}
                  style={{ '--color': STRESS_COLORS[n] }}
                  onClick={() => setSelected(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="scale-num">{n}</span>
                  <span className="scale-dot" />
                </button>
              ))}
            </div>
            <div className={`scale-feedback ${display ? 'visible' : ''}`}>
              {display && <>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'26px', color: STRESS_COLORS[display] }}>{display}</span>
                <span style={{ color:'var(--text2)', fontSize:'14px' }}>{STRESS_LABELS[display]}</span>
              </>}
            </div>
          </div>

          <button
            className={`btn btn-primary survey-submit ${!selected ? 'disabled' : ''}`}
            onClick={handleSubmit} disabled={!selected}
          >
            Choose my mandala
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
