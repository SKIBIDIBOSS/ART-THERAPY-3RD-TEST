import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SurveyPage from './pages/SurveyPage';
import MandalaPage from './pages/MandalaPage';
import PostSurveyPage from './pages/PostSurveyPage';
import ResultPage from './pages/ResultPage';
import AdminPanel from './pages/AdminPanel';
import BannedPage from './pages/BannedPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [preSurveyScore, setPreSurveyScore] = useState(null);
  const [postSurveyScore, setPostSurveyScore] = useState(null);
  const [postNote, setPostNote] = useState('');
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('at_token');
    const savedUser = localStorage.getItem('at_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setPage(JSON.parse(savedUser).role === 'admin' ? 'admin' : 'survey');
    }
  }, []);

  const navigate = (newPage) => {
    setTransition(true);
    setTimeout(() => { setPage(newPage); setTransition(false); }, 300);
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('at_token', userToken);
    localStorage.setItem('at_user', JSON.stringify(userData));
    navigate(userData.role === 'admin' ? 'admin' : 'survey');
  };

  const handleLogout = () => {
    setUser(null); setToken(null);
    setPreSurveyScore(null); setPostSurveyScore(null);
    localStorage.removeItem('at_token');
    localStorage.removeItem('at_user');
    navigate('landing');
  };

  const startMandala = (score) => { setPreSurveyScore(score); navigate('mandala'); };
  const finishMandala = () => navigate('postsurvey');

  const submitPostSurvey = async (score, note) => {
    setPostSurveyScore(score);
    setPostNote(note);
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preSurveyScore, postSurveyScore: score, postSurveyNote: note, stressLevel: preSurveyScore })
      });
    } catch (e) { console.error(e); }
    navigate('result');
  };

  const doAnother = () => {
    setPreSurveyScore(null); setPostSurveyScore(null); setPostNote('');
    navigate('survey');
  };

  const goHome = () => {
    setPreSurveyScore(null); setPostSurveyScore(null); setPostNote('');
    navigate('survey');
  };

  const pages = {
    landing: <LandingPage onStart={() => navigate('login')} />,
    login: <LoginPage onLogin={handleLogin} onBack={() => navigate('landing')} />,
    survey: user ? <SurveyPage user={user} onSubmit={startMandala} onLogout={handleLogout} /> : null,
    mandala: user ? <MandalaPage stressLevel={preSurveyScore} onFinish={finishMandala} onExit={() => navigate('survey')} /> : null,
    postsurvey: user ? <PostSurveyPage onSubmit={submitPostSurvey} /> : null,
    result: user ? <ResultPage pre={preSurveyScore} post={postSurveyScore} onDoAnother={doAnother} onDone={goHome} /> : null,
    admin: user?.role === 'admin' ? <AdminPanel token={token} onLogout={handleLogout} /> : null,
    banned: <BannedPage onBack={() => navigate('landing')} />
  };

  return (
    <div className={`app-root ${transition ? 'page-exit' : 'page-enter'}`}>
      {pages[page] || pages['landing']}
    </div>
  );
}
