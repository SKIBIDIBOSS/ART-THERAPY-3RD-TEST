import React, { useState, useEffect, useCallback } from 'react';
import './AdminPanel.css';

const TABS = [
  { id:'overview', label:'Overview', icon:'◈' },
  { id:'users',    label:'Users',    icon:'◉' },
  { id:'sessions', label:'Sessions', icon:'◎' },
  { id:'analytics',label:'Analytics',icon:'◆' },
  { id:'assign',   label:'Assign Logins', icon:'◇' },
];

export default function AdminPanel({ token, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/sessions', { headers })
      ]);
      const [u, s] = await Promise.all([uRes.json(), sRes.json()]);
      setUsers(Array.isArray(u) ? u : []);
      setSessions(Array.isArray(s) ? s : []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleBan = async () => {
    if (!banModal) return;
    await fetch(`/api/admin/users/${banModal.id}/ban`, { method:'PATCH', headers, body: JSON.stringify({ reason: banReason || 'Violation of terms' }) });
    showToast(`${banModal.firstName} has been banned`);
    setBanModal(null); setBanReason(''); fetchData();
  };

  const handleUnban = async (user) => {
    await fetch(`/api/admin/users/${user.id}/unban`, { method:'PATCH', headers });
    showToast(`${user.firstName} has been unbanned`); fetchData();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    await fetch(`/api/admin/users/${deleteModal.id}`, { method:'DELETE', headers });
    showToast('Account deleted'); setDeleteModal(null);
    if (selectedUser?.id === deleteModal.id) setSelectedUser(null);
    fetchData();
  };

  const getInitials = u => `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase();
  const getUserSessions = uid => sessions.filter(s => s.userId === uid);
  const allPre = sessions.map(s=>s.preSurveyScore).filter(Boolean);
  const allPost = sessions.map(s=>s.postSurveyScore).filter(Boolean);
  const avgPre = allPre.length ? (allPre.reduce((a,b)=>a+b,0)/allPre.length).toFixed(1) : '—';
  const avgPost = allPost.length ? (allPost.reduce((a,b)=>a+b,0)/allPost.length).toFixed(1) : '—';
  const improved = sessions.filter(s=>s.postSurveyScore < s.preSurveyScore).length;
  const improvePct = sessions.length ? Math.round((improved/sessions.length)*100) : 0;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#c8a96e" strokeWidth="1"/>
              <circle cx="11" cy="11" r="4" stroke="#c8a96e" strokeWidth="1" opacity="0.5"/>
              <circle cx="11" cy="11" r="1.5" fill="#c8a96e"/>
            </svg>
          </div>
          <div>
            <div className="admin-brand-name">Art Therapy</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t.id} className={`admin-nav-item ${tab===t.id?'active':''}`} onClick={() => { setTab(t.id); setSelectedUser(null); }}>
              <span className="nav-icon">{t.icon}</span>{t.label}
              {t.id==='sessions' && sessions.length>0 && <span className="nav-badge">{sessions.length}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <div style={{ width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#c8a96e,#9b8ec4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'#000',fontWeight:600,flexShrink:0 }}>A</div>
            <div><div style={{ fontSize:'13px',color:'var(--text)' }}>Admin</div><div style={{ fontSize:'11px',color:'var(--text3)' }}>Administrator</div></div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:8, width:'100%', justifyContent:'center' }} onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <main className="admin-main">
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text3)',fontSize:'14px' }}>Loading...</div>
        ) : (
          <>
            {tab==='overview' && <OverviewTab users={users} sessions={sessions} avgPre={avgPre} avgPost={avgPost} improved={improved} improvePct={improvePct} onNav={t => { setTab(t); setSelectedUser(null); }} />}
            {tab==='users' && <UsersTab users={users} sessions={sessions} selectedUser={selectedUser} setSelectedUser={setSelectedUser} onBan={u=>{setBanModal(u);setBanReason('');}} onUnban={handleUnban} onDelete={u=>setDeleteModal(u)} getInitials={getInitials} getUserSessions={getUserSessions} />}
            {tab==='sessions' && <SessionsTab users={users} sessions={sessions} getInitials={getInitials} />}
            {tab==='analytics' && <AnalyticsTab sessions={sessions} avgPre={avgPre} avgPost={avgPost} improved={improved} improvePct={improvePct} />}
            {tab==='assign' && <AssignTab token={token} headers={headers} users={users} onDelete={u=>setDeleteModal(u)} fetchData={fetchData} showToast={showToast} />}
          </>
        )}
      </main>

      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type==='success'?'✓':'✗'} {toast.msg}</div>}

      {banModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-up">
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'26px',marginBottom:'8px' }}>Ban user</h3>
            <p style={{ color:'var(--text2)',fontSize:'14px',marginBottom:'20px' }}>Banning <strong>{banModal.firstName} {banModal.lastName}</strong>. They will lose all access.</p>
            <div className="form-group" style={{ marginBottom:'20px' }}>
              <label className="label">Reason</label>
              <input className="input-field" placeholder="e.g. Violation of terms" value={banReason} onChange={e=>setBanReason(e.target.value)} />
            </div>
            <div style={{ display:'flex',gap:'12px' }}>
              <button className="btn btn-ghost" style={{ flex:1,justifyContent:'center' }} onClick={()=>setBanModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1,justifyContent:'center' }} onClick={handleBan}>Ban account</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-up">
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'26px',marginBottom:'8px' }}>Delete account?</h3>
            <p style={{ color:'var(--text2)',fontSize:'14px',marginBottom:'24px' }}>This permanently deletes <strong>{deleteModal.firstName} {deleteModal.lastName}</strong> and all session data.</p>
            <div style={{ display:'flex',gap:'12px' }}>
              <button className="btn btn-ghost" style={{ flex:1,justifyContent:'center' }} onClick={()=>setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex:1,justifyContent:'center' }} onClick={handleDelete}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ users, sessions, avgPre, avgPost, improved, improvePct, onNav }) {
  const stats = [
    { label:'Total users', value:users.length, color:'#c8a96e', icon:'◉' },
    { label:'Sessions completed', value:sessions.length, color:'#9b8ec4', icon:'◎' },
    { label:'Avg pre-score', value:avgPre, color:'#c47070', icon:'◈' },
    { label:'Avg post-score', value:avgPost, color:'#70c48c', icon:'◆' },
    { label:'Stress improved', value:`${improvePct}%`, color:'#70b8c4', icon:'✦' },
  ];
  return (
    <div className="admin-tab-content">
      <div className="admin-page-header">
        <div><h2 className="admin-page-title">Overview</h2><p className="text-muted text-sm">Live data — updates every 10 seconds</p></div>
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}><div className="live-dot"/><span style={{ fontSize:'12px',color:'var(--accent)' }}>Live</span></div>
      </div>
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ '--c':s.color }}>
            <div className="stat-icon" style={{ color:s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="admin-grid-2">
        <div className="admin-panel-card">
          <h3 className="panel-card-title">Recent sessions</h3>
          {sessions.length===0 ? <p className="text-muted text-sm">No sessions yet</p> : (
            <div className="recent-list">
              {sessions.slice(-5).reverse().map(s => {
                const delta = s.postSurveyScore - s.preSurveyScore;
                return (
                  <div key={s.id} className="recent-item">
                    <div className="recent-avatar">{(s.username?.[0]||'U').toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px',color:'var(--text)' }}>{s.username?.split('@')[0]}</div>
                      <div style={{ fontSize:'11px',color:'var(--text3)' }}>{new Date(s.completedAt).toLocaleString()}</div>
                    </div>
                    <div className={`delta-badge ${delta<0?'good':delta>0?'bad':'neutral'}`}>{delta<0?'↓':delta>0?'↑':'='} {Math.abs(delta)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="admin-panel-card">
          <h3 className="panel-card-title">Quick actions</h3>
          <div className="quick-actions">
            {[
              { label:'Manage users', desc:'View, ban, or delete accounts', tab:'users', color:'#c8a96e' },
              { label:'Session data', desc:'Review user responses', tab:'sessions', color:'#9b8ec4' },
              { label:'Analytics', desc:'Visualize stress trends', tab:'analytics', color:'#70c48c' },
              { label:'Assign login', desc:'Create user accounts', tab:'assign', color:'#c47070' },
            ].map(a => (
              <button key={a.tab} className="quick-action-btn" onClick={() => onNav(a.tab)} style={{ '--c':a.color }}>
                <div style={{ fontWeight:500,fontSize:'13px',color:a.color }}>{a.label}</div>
                <div style={{ fontSize:'11px',color:'var(--text3)',marginTop:2 }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersTab({ users, sessions, selectedUser, setSelectedUser, onBan, onUnban, onDelete, getInitials, getUserSessions }) {
  const [expandedSession, setExpandedSession] = useState(null);

  if (selectedUser) {
    const userSessions = getUserSessions(selectedUser.id);
    return (
      <div className="admin-tab-content">
        <div className="admin-page-header">
          <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(null)}>← Back</button>
            <h2 className="admin-page-title">User Profile</h2>
          </div>
          <div style={{ display:'flex',gap:'8px' }}>
            {selectedUser.banned
              ? <button className="btn btn-ghost btn-sm" onClick={() => { onUnban(selectedUser); setSelectedUser(null); }}>Unban</button>
              : <button className="btn btn-danger btn-sm" onClick={() => onBan(selectedUser)}>Ban user</button>}
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--rose)',borderColor:'rgba(196,112,112,0.3)' }} onClick={() => onDelete(selectedUser)}>Delete</button>
          </div>
        </div>
        <div className="user-profile-grid">
          <div className="admin-panel-card" style={{ textAlign:'center' }}>
            <div className="profile-avatar-lg">{getInitials(selectedUser)}</div>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'26px',fontWeight:300,marginBottom:'4px' }}>{selectedUser.firstName} {selectedUser.lastName}</h3>
            <p className="text-muted text-sm" style={{ marginBottom:'16px' }}>{selectedUser.email}</p>
            {selectedUser.banned && <div className="badge badge-red" style={{ marginBottom:'16px' }}>Banned: {selectedUser.banReason}</div>}
            <div className="profile-info-list">
              {[
                { label:'Email', value: selectedUser.email },
                { label:'Member since', value: new Date(selectedUser.createdAt).toLocaleDateString() },
                { label:'Total sessions', value: userSessions.length },
                { label:'Password', value: selectedUser.tempPassword || '(self-registered)' },
              ].map(r => (
                <div key={r.label} className="profile-info-row">
                  <span className="text-dim text-sm">{r.label}</span>
                  <span style={{ fontSize:'13px',color:'var(--text)',fontFamily:r.label==='Password'?'monospace':'inherit' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-panel-card" style={{ flex:2 }}>
            <h3 className="panel-card-title">Session History ({userSessions.length})</h3>
            {userSessions.length===0 ? <p className="text-muted text-sm">No sessions yet.</p> : (
              <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
                {userSessions.map((s, idx) => (
                  <div key={s.id} className="session-record">
                    <div className="session-record-header" onClick={() => setExpandedSession(expandedSession===s.id?null:s.id)}>
                      <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                        <span style={{ fontSize:'11px',color:'var(--text3)' }}>Session {idx+1}</span>
                        <span style={{ fontSize:'12px',color:'var(--text2)' }}>{new Date(s.completedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                        <div className="score-pill pre">{s.preSurveyScore}</div>
                        <span style={{ color:'var(--text3)',fontSize:'12px' }}>→</span>
                        <div className={`score-pill ${s.postSurveyScore<s.preSurveyScore?'post-good':s.postSurveyScore>s.preSurveyScore?'post-bad':'post-same'}`}>{s.postSurveyScore}</div>
                        <span style={{ fontSize:'10px',color:'var(--text3)' }}>{expandedSession===s.id?'▲':'▼'}</span>
                      </div>
                    </div>
                    {expandedSession===s.id && (
                      <div className="session-record-note">
                        {s.postSurveyNote ? <p style={{ fontSize:'13px',color:'var(--text2)',lineHeight:1.6 }}>{s.postSurveyNote}</p> : <span className="text-dim text-xs">No note provided.</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-page-header">
        <div><h2 className="admin-page-title">Users</h2><p className="text-muted text-sm">{users.length} accounts</p></div>
      </div>
      {users.length===0 ? (
        <div className="empty-state"><div style={{ fontSize:'48px',marginBottom:'16px',opacity:0.3 }}>◉</div><p className="text-muted">No users yet</p></div>
      ) : (
        <div className="admin-panel-card" style={{ padding:0 }}>
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Sessions</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div style={{ display:'flex',alignItems:'center',gap:'10px' }}><div className="table-avatar">{getInitials(u)}</div><span style={{ color:'var(--text)' }}>{u.firstName} {u.lastName}</span></div></td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-purple">{getUserSessions(u.id).length}</span></td>
                  <td>{u.banned ? <span className="badge badge-red">Banned</span> : <span className="badge badge-green">Active</span>}</td>
                  <td style={{ fontSize:'12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex',gap:'6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(u)}>View</button>
                      {u.banned ? <button className="btn btn-ghost btn-sm" onClick={() => onUnban(u)}>Unban</button> : <button className="btn btn-ghost btn-sm" style={{ color:'var(--rose)' }} onClick={() => onBan(u)}>Ban</button>}
                      <button className="btn btn-ghost btn-sm" style={{ color:'var(--rose)' }} onClick={() => onDelete(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function SessionsTab({ users, sessions, getInitials }) {
  const [expandedNote, setExpandedNote] = useState(null);
  const grouped = {};
  sessions.forEach(s => { if (!grouped[s.userId]) grouped[s.userId]=[]; grouped[s.userId].push(s); });

  return (
    <div className="admin-tab-content">
      <div className="admin-page-header"><h2 className="admin-page-title">Sessions</h2><p className="text-muted text-sm">{sessions.length} total</p></div>
      {Object.keys(grouped).length===0 ? (
        <div className="empty-state"><div style={{ fontSize:'48px',marginBottom:'16px',opacity:0.3 }}>◎</div><p className="text-muted">No sessions yet</p></div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
          {Object.entries(grouped).map(([userId, userSessions]) => {
            const user = users.find(u => u.id===userId);
            const initials = user ? `${user.firstName?.[0]}${user.lastName?.[0]}`.toUpperCase() : (userSessions[0]?.username?.[0]||'U').toUpperCase();
            const displayName = user ? `${user.firstName} ${user.lastName}` : userSessions[0]?.username;
            return (
              <div key={userId} className="admin-panel-card">
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                    <div className="session-user-avatar">{initials}</div>
                    <div>
                      <div style={{ fontSize:'15px',color:'var(--text)',fontWeight:500 }}>{displayName}</div>
                      <div style={{ fontSize:'11px',color:'var(--text3)' }}>{userSessions.length} session{userSessions.length>1?'s':''}</div>
                    </div>
                    {userSessions.length>1 && <span className="badge badge-gold">Multiple</span>}
                  </div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
                  {userSessions.map((s,idx) => (
                    <div key={s.id}>
                      <div className="session-row">
                        <div style={{ display:'flex',alignItems:'center',gap:'10px',flex:1 }}>
                          <span style={{ fontSize:'11px',color:'var(--text3)',minWidth:'60px' }}>Session {idx+1}</span>
                          <div className="score-pill pre">{s.preSurveyScore}</div>
                          <span style={{ color:'var(--text3)',fontSize:'12px' }}>→</span>
                          <div className={`score-pill ${s.postSurveyScore<s.preSurveyScore?'post-good':s.postSurveyScore>s.preSurveyScore?'post-bad':'post-same'}`}>{s.postSurveyScore}</div>
                          <span style={{ fontSize:'11px',color:'var(--text3)' }}>{new Date(s.completedAt).toLocaleDateString()}</span>
                        </div>
                        {s.postSurveyNote && <button className="btn btn-ghost btn-sm" onClick={() => setExpandedNote(expandedNote===s.id?null:s.id)}>{expandedNote===s.id?'Hide':'See more'}</button>}
                      </div>
                      {expandedNote===s.id && s.postSurveyNote && (
                        <div className="session-expanded-note">
                          <span className="text-dim text-xs">Note:</span>
                          <p style={{ fontSize:'13px',color:'var(--text2)',marginTop:'4px',lineHeight:1.7 }}>{s.postSurveyNote}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsTab({ sessions, avgPre, avgPost, improved, improvePct }) {
  const preCounts = Array(10).fill(0);
  const postCounts = Array(10).fill(0);
  sessions.forEach(s => {
    if (s.preSurveyScore>=1&&s.preSurveyScore<=10) preCounts[s.preSurveyScore-1]++;
    if (s.postSurveyScore>=1&&s.postSurveyScore<=10) postCounts[s.postSurveyScore-1]++;
  });
  const maxCount = Math.max(...preCounts, ...postCounts, 1);
  const worsened = sessions.filter(s=>s.postSurveyScore>s.preSurveyScore).length;
  const unchanged = sessions.filter(s=>s.postSurveyScore===s.preSurveyScore).length;

  return (
    <div className="admin-tab-content">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Analytics</h2>
        <div style={{ display:'flex',alignItems:'center',gap:'8px' }}><div className="live-dot"/><span style={{ fontSize:'12px',color:'var(--accent)' }}>Live</span></div>
      </div>
      {sessions.length===0 ? (
        <div className="empty-state"><div style={{ fontSize:'48px',marginBottom:'16px',opacity:0.3 }}>◆</div><p className="text-muted">No data yet — sessions will appear here in real time</p></div>
      ) : (
        <>
          <div className="analytics-summary">
            {[
              { label:'Avg Pre-Score', value:avgPre, color:'#c47070', sub:'Before mandala' },
              { label:'Avg Post-Score', value:avgPost, color:'#70c48c', sub:'After mandala' },
              { label:'Improved', value:`${improved}/${sessions.length}`, color:'#9b8ec4', sub:`${improvePct}% of sessions` },
            ].map(s => (
              <div key={s.label} className="analytics-stat" style={{ '--c':s.color }}>
                <div style={{ fontSize:'32px',fontFamily:'var(--font-display)',color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'13px',color:'var(--text)',marginTop:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'11px',color:'var(--text3)',marginTop:'2px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="admin-panel-card" style={{ marginBottom:'20px' }}>
            <h3 className="panel-card-title">Stress Score Distribution — Pre vs Post</h3>
            <div className="chart-legend">
              <div className="legend-item"><div style={{ width:12,height:12,borderRadius:2,background:'#c47070' }}/><span>Before</span></div>
              <div className="legend-item"><div style={{ width:12,height:12,borderRadius:2,background:'#70c48c' }}/><span>After</span></div>
            </div>
            <div className="bar-chart">
              {Array(10).fill(0).map((_,i) => (
                <div key={i} className="bar-group">
                  <div className="bar-pair">
                    <div className="bar bar-pre" style={{ height:`${(preCounts[i]/maxCount)*160}px` }} title={`Pre ${i+1}: ${preCounts[i]}`}/>
                    <div className="bar bar-post" style={{ height:`${(postCounts[i]/maxCount)*160}px` }} title={`Post ${i+1}: ${postCounts[i]}`}/>
                  </div>
                  <div className="bar-label">{i+1}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-panel-card">
            <h3 className="panel-card-title">Session Outcomes</h3>
            <div className="outcomes-grid">
              {[
                { label:'Improved', value:improved, color:'#70c48c', icon:'↓' },
                { label:'Unchanged', value:unchanged, color:'#c8a96e', icon:'=' },
                { label:'Increased', value:worsened, color:'#c47070', icon:'↑' },
              ].map(o => (
                <div key={o.label} className="outcome-card" style={{ '--c':o.color }}>
                  <div style={{ fontSize:'36px',color:o.color,marginBottom:'8px' }}>{o.icon}</div>
                  <div style={{ fontSize:'28px',fontFamily:'var(--font-display)',color:o.color }}>{o.value}</div>
                  <div style={{ fontSize:'12px',color:'var(--text2)',marginTop:'4px' }}>{o.label}</div>
                  <div style={{ fontSize:'11px',color:'var(--text3)',marginTop:'2px' }}>{sessions.length>0?`${Math.round((o.value/sessions.length)*100)}%`:'0%'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Assign ────────────────────────────────────────────────────────────────────
function AssignTab({ headers, users, onDelete, fetchData, showToast }) {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const [result, setResult] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', { method:'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error||'Error','error'); return; }
      setResult(data); fetchData();
      showToast('Login assigned successfully');
      setForm({ firstName:'', lastName:'', email:'', password:'' });
    } catch { showToast('Error creating user','error'); }
  };

  const assignedUsers = users.filter(u => u.tempPassword);

  return (
    <div className="admin-tab-content">
      <div className="admin-page-header"><h2 className="admin-page-title">Assign Logins</h2></div>
      <div className="admin-grid-2">
        <div className="admin-panel-card">
          <h3 className="panel-card-title">Create new login</h3>
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
            <div className="form-row">
              <div className="form-group"><label className="label">First name</label><input className="input-field" placeholder="Jane" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required/></div>
              <div className="form-group"><label className="label">Last name</label><input className="input-field" placeholder="Doe" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required/></div>
            </div>
            <div className="form-group"><label className="label">Email (username)</label><input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required/></div>
            <div className="form-group"><label className="label">Password <span style={{ color:'var(--text3)',textTransform:'none',letterSpacing:'normal' }}>(blank = auto-generate)</span></label><input className="input-field" placeholder="Auto-generated if empty" value={form.password} onChange={e=>set('password',e.target.value)}/></div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent:'center' }}>Assign login →</button>
          </form>
          {result && (
            <div className="assign-result">
              <p style={{ color:'var(--accent)',fontSize:'13px',marginBottom:'12px' }}>✓ Login created</p>
              <div className="assign-creds">
                <div className="cred-row"><span className="text-dim text-xs">Username</span><code>{result.user?.email}</code></div>
                <div className="cred-row"><span className="text-dim text-xs">Password</span><code>{result.assignedPassword}</code></div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop:'12px' }} onClick={()=>setResult(null)}>Dismiss</button>
            </div>
          )}
        </div>
        <div className="admin-panel-card">
          <h3 className="panel-card-title">Assigned accounts ({assignedUsers.length})</h3>
          {assignedUsers.length===0 ? <p className="text-muted text-sm">No assigned accounts yet</p> : (
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {assignedUsers.map(u => (
                <div key={u.id} className="assigned-user-row">
                  <div>
                    <div style={{ fontSize:'13px',color:'var(--text)' }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize:'11px',color:'var(--text3)' }}>{u.email}</div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                    <code style={{ fontSize:'11px',background:'var(--bg2)',padding:'3px 8px',borderRadius:4,color:'var(--accent)',border:'1px solid var(--border)' }}>{u.tempPassword}</code>
                    <button className="btn btn-ghost btn-sm" style={{ color:'var(--rose)',padding:'4px 10px' }} onClick={()=>onDelete(u)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
