import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId, status: 'active' });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    const userData = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      permissions: user.permissions,
      branch: user.branch,
      token
    };

    await logAudit({ userId: user.userId, userName: user.name, userRole: user.role, action: 'LOGIN', resource: 'Auth', status: 'success', ipAddress: req.ip });

    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const jwt = (await import('jsonwebtoken')).default;
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role, modules: user.modules, permissions: user.permissions, branch: user.branch } });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

export default router;
