import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

export default function LandingPage({ onStart }) {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, particles = [], w, h;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.6 ? '#c8a96e' : '#9b8ec4'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="landing-canvas" />
      <div className="orb orb-1" /><div className="orb orb-2" />

      <header className={`landing-header ${loaded ? 'loaded' : ''}`}>
        <div className="landing-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#c8a96e" strokeWidth="1"/>
            <circle cx="14" cy="14" r="6" stroke="#c8a96e" strokeWidth="1" opacity="0.6"/>
            <circle cx="14" cy="14" r="2" fill="#c8a96e"/>
            <line x1="14" y1="1" x2="14" y2="8" stroke="#c8a96e" strokeWidth="0.8" opacity="0.5"/>
            <line x1="14" y1="20" x2="14" y2="27" stroke="#c8a96e" strokeWidth="0.8" opacity="0.5"/>
            <line x1="1" y1="14" x2="8" y2="14" stroke="#c8a96e" strokeWidth="0.8" opacity="0.5"/>
            <line x1="20" y1="14" x2="27" y2="14" stroke="#c8a96e" strokeWidth="0.8" opacity="0.5"/>
          </svg>
          <span>ArtTherapy</span>
        </div>
        <nav className="landing-nav">
          <a href="#how">How it works</a>
          <button className="btn btn-ghost btn-sm" onClick={onStart}>Sign in</button>
        </nav>
      </header>

      <main className="landing-hero">
        <div className={`hero-eyebrow animate-fade-up delay-1 ${loaded ? '' : 'op0'}`}>
          <span className="badge badge-gold">Developed by Aarav</span>
        </div>
        <h1 className={`hero-title animate-fade-up delay-2 ${loaded ? '' : 'op0'}`}>
          Art Therapy<br /><em>Website</em>
        </h1>
        <p className={`hero-sub animate-fade-up delay-3 ${loaded ? '' : 'op0'}`}>
          A mindful space to explore your emotions through<br />the ancient art of mandala creation.
        </p>
        <div className={`hero-actions animate-fade-up delay-4 ${loaded ? '' : 'op0'}`}>
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            Start now
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a href="#how" className="btn btn-ghost btn-lg">Learn more</a>
        </div>

        <div className="hero-mandala-deco">
          <div className="deco-ring r1" /><div className="deco-ring r2" />
          <div className="deco-ring r3" /><div className="deco-ring r4" />
          <div className="deco-center" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="deco-spoke" style={{ '--deg': `${i * 45}deg` }} />
          ))}
        </div>
      </main>

      <section id="how" className="landing-section">
        <p className="section-label">How it works</p>
        <h2 className="section-title">Three mindful steps</h2>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Check in', desc: 'Rate your current stress level. No judgment, just awareness.' },
            { n: '02', title: 'Create', desc: 'Choose a mandala that resonates and fill it with color and intention.' },
            { n: '03', title: 'Reflect', desc: 'See how your stress changed and celebrate your progress.' }
          ].map(s => (
            <div key={s.n} className="step-card">
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        © 2026 Art Therapy Website — Developed by Aarav
      </footer>
    </div>
  );
}
