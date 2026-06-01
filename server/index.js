const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'arttherapy_secret_2024';

app.use(cors());
app.use(express.json());

let users = [];
let sessions = [];

const adminUser = {
  id: 'admin',
  username: 'Admin',
  password: bcrypt.hashSync('Admin123', 10),
  role: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@arttherapy.com',
  banned: false,
  banReason: null,
  createdAt: new Date().toISOString()
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'Admin') {
    const match = await bcrypt.compare(password, adminUser.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({
      token: generateToken(adminUser),
      user: { id: 'admin', role: 'admin', username: 'Admin', firstName: 'Admin' }
    });
  }
  const user = users.find(u => u.username === username || u.email === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.banned) return res.status(403).json({ error: 'banned', reason: user.banReason });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({
    token: generateToken(user),
    user: { id: user.id, role: 'user', username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash('default123', 10);
  const newUser = {
    id: uuidv4(), username: email, email, firstName, lastName,
    password: hashed, tempPassword: null,
    role: 'user', banned: false, banReason: null,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.json({
    token: generateToken(newUser),
    user: { id: newUser.id, role: 'user', username: newUser.username, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }
  });
});

// ── Sessions ──────────────────────────────────────────────────────────────────
app.post('/api/sessions', authMiddleware, (req, res) => {
  const { preSurveyScore, postSurveyScore, postSurveyNote, stressLevel } = req.body;
  const session = {
    id: uuidv4(), userId: req.user.id, username: req.user.username,
    preSurveyScore, postSurveyScore, postSurveyNote: postSurveyNote || null,
    stressLevel, completedAt: new Date().toISOString()
  };
  sessions.push(session);
  res.json({ success: true, session });
});

app.get('/api/sessions/me', authMiddleware, (req, res) => {
  res.json(sessions.filter(s => s.userId === req.user.id));
});

// ── Admin ─────────────────────────────────────────────────────────────────────
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  res.json(users.map(u => ({
    id: u.id, username: u.username, email: u.email,
    firstName: u.firstName, lastName: u.lastName,
    banned: u.banned, banReason: u.banReason,
    createdAt: u.createdAt, tempPassword: u.tempPassword
  })));
});

app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email) return res.status(400).json({ error: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  const assignedPassword = password || Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(assignedPassword, 10);
  const newUser = {
    id: uuidv4(), username: email, email, firstName, lastName,
    password: hashed, tempPassword: assignedPassword,
    role: 'user', banned: false, banReason: null,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.json({ success: true, user: { ...newUser, password: undefined }, assignedPassword });
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  sessions = sessions.filter(s => s.userId !== req.params.id);
  res.json({ success: true });
});

app.patch('/api/admin/users/:id/ban', authMiddleware, adminMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.banned = true;
  user.banReason = req.body.reason || 'Banned by admin';
  res.json({ success: true });
});

app.patch('/api/admin/users/:id/unban', authMiddleware, adminMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.banned = false;
  user.banReason = null;
  res.json({ success: true });
});

app.get('/api/admin/sessions', authMiddleware, adminMiddleware, (req, res) => {
  res.json(sessions);
});

// ── Serve React ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
