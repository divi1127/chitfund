import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    console.log('Login attempt:', { userId, password: '***' });

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId, status: 'active' });

    console.log('User found:', user ? { userId: user.userId, name: user.name, role: user.role } : 'No user found');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For now, simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data without password
    const userData = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      permissions: user.permissions
    };

    console.log('Login successful:', { userId: userData.userId, role: userData.role });
    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint (optional, can be handled client-side)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
