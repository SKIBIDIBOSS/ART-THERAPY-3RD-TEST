import React from 'react';

export default function BannedPage({ onBack }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div className="orb orb-1" />
      <div className="card card-glow animate-fade-up" style={{ maxWidth:'460px', width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'48px', marginBottom:'20px' }}>🚫</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:300, marginBottom:'12px', color:'var(--rose)' }}>Account Suspended</h1>
        <p style={{ color:'var(--text2)', marginBottom:'32px', lineHeight:1.7 }}>Your account has been suspended by an administrator. If you believe this is an error, please contact support.</p>
        <button className="btn btn-ghost" onClick={onBack}>← Back to home</button>
      </div>
    </div>
  );
}
