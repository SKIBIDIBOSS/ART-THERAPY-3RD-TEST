import React, { useEffect, useState } from 'react';
import './ResultPage.css';

export default function ResultPage({ pre, post, onDoAnother, onDone }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const decreased = post < pre;

  return (
    <div className={`result-bg ${visible ? 'visible' : ''}`}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="result-card card card-glow animate-fade-up">
        {decreased ? (
          <>
            <span className="result-icon">🌸</span>
            <h1 className="result-title">Wonderful progress!</h1>
            <p className="result-message">
              You reduced your stress from{' '}
              <strong style={{ color:'#c47070', fontFamily:'var(--font-display)', fontSize:'22px' }}>{pre}</strong>
              {' '}down to{' '}
              <strong style={{ color:'#70c48c', fontFamily:'var(--font-display)', fontSize:'22px' }}>{post}</strong>.
              That's a meaningful shift.
            </p>
            <div className="result-score-bar">
              <div className="score-bar-track"><div className="score-bar-before" style={{ width:`${pre*10}%` }}><span>{pre}</span></div></div>
              <span className="score-bar-arrow">→</span>
              <div className="score-bar-track"><div className="score-bar-after" style={{ width:`${post*10}%` }}><span>{post}</span></div></div>
            </div>
            <p style={{ color:'var(--text2)', fontSize:'14px', marginBottom:'32px', lineHeight:1.7 }}>
              Art therapy worked for you today. Creativity has a wonderful way of processing what words can't.
            </p>
            <div className="result-actions">
              <button className="btn btn-ghost" onClick={onDone}>I'm done for now</button>
              <button className="btn btn-primary" onClick={onDoAnother}>Do another mandala ✦</button>
            </div>
          </>
        ) : (
          <>
            <span className="result-icon">{post === pre ? '💙' : '🌧️'}</span>
            <h1 className="result-title">{post === pre ? "That's okay" : "Oh, that's okay too"}</h1>
            <p className="result-message">
              {post === pre
                ? `Your stress stayed at ${pre}. Sometimes staying steady is still strength.`
                : `Your stress went from ${pre} to ${post}. Creativity doesn't always reduce stress right away — and that's completely okay.`}
            </p>
            <p style={{ color:'var(--text2)', fontSize:'14px', marginBottom:'32px', lineHeight:1.7 }}>
              Would you like to try another mandala?
            </p>
            <div className="result-actions">
              <button className="btn btn-ghost" onClick={onDone}>No, I'm done</button>
              <button className="btn btn-primary" onClick={onDoAnother}>Yes, try again ✦</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
