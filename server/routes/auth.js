import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import Member from '../models/Member.js';
import { generateToken } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    console.log(` Login attempt: userId=${userId}`);

    const user = await User.findOne({ userId, status: 'active' });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    let extraData = {};

    if (user.role === 'agent') {
      const agent = await Agent.findOne({ agentId: user.userId });
      if (agent) {
        extraData = {
          agentId: agent.agentId,
          phone: agent.phone,
          adminId: agent.adminId,
          customers: agent.customers || [],
          totalCommission: agent.totalCommission || 0,
          branch: agent.branch
        };
      }
    }

    if (user.role === 'customer') {
      const customer = await Member.findOne({ memberId: user.userId });
      if (customer) {
        extraData = {
          memberId: customer.memberId,
          phone: customer.phone,
          agentId: customer.agentId,
          groups: customer.groups || [],
          address: customer.address,
          aadhaar: customer.aadhaar
        };
      }
    }

    const userData = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      permissions: user.permissions,
      branch: user.branch || extraData.branch,
      token,
      ...extraData
    };

    await logAudit({ userId: user.userId, userName: user.name, userRole: user.role, action: 'LOGIN', resource: 'Auth', status: 'success', ipAddress: req.ip });

    res.json({ user: userData });
  } catch (error) {
    console.error(' Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/agent-login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Agent ID and password are required' });
    }

    console.log(` Agent login attempt: userId=${userId}`);
    if (!userId.startsWith('20') || !userId.includes('AG')) {
      return res.status(401).json({ message: 'Invalid Agent ID format' });
    }

    const agent = await Agent.findOne({ agentId: userId, status: 'Active' });
    if (!agent) {
      return res.status(401).json({ message: 'Agent not found or inactive' });
    }

    if (agent.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Agent account not properly configured' });
    }

    const token = generateToken(user);

    const userData = {
      id: user._id,
      userId: user.userId,
      name: agent.name,
      email: user.email,
      role: 'agent',
      modules: user.modules || ['dashboard', 'members', 'schemes', 'groups', 'collections', 'profile', 'commissions', 'notifications'],
      permissions: user.permissions || ['create', 'view', 'edit'],
      branch: agent.branch || '',
      agentId: agent.agentId,
      phone: agent.phone,
      customers: agent.customers || [],
      totalCommission: agent.totalCommission || 0,
      token
    };

    res.json({ user: userData });
  } catch (error) {
    console.error(' Agent login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/customer-login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Customer ID and password are required' });
    }

    console.log(` Customer login attempt: userId=${userId}`);
    if (!userId.startsWith('20') || !userId.includes('CM')) {
      return res.status(401).json({ message: 'Invalid Customer ID format' });
    }

    const customer = await Member.findOne({ memberId: userId, status: 'Active' });
    if (!customer) {
      return res.status(401).json({ message: 'Customer not found or inactive' });
    }

    if (customer.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Customer account not properly configured' });
    }

    const token = generateToken(user);

    const userData = {
      id: user._id,
      userId: user.userId,
      name: customer.name,
      email: user.email,
      role: 'customer',
      modules: user.modules || ['dashboard', 'schemes', 'payments', 'invoices', 'receipts', 'auctions', 'profile', 'notifications', 'support'],
      permissions: user.permissions || ['view'],
      memberId: customer.memberId,
      phone: customer.phone,
      agentId: customer.agentId,
      groups: customer.groups || [],
      address: customer.address,
      aadhaar: customer.aadhaar,
      token
    };

    res.json({ user: userData });
  } catch (error) {
    console.error(' Customer login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'User ID, current password, and new password are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.plainPassword = '';
    await user.save();

    if (user.role === 'agent') {
      await Agent.findOneAndUpdate({ agentId: userId }, { password: newPassword });
    }
    if (user.role === 'customer') {
      await Member.findOneAndUpdate({ memberId: userId }, { password: newPassword });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(' Change password error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
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
