import express from 'express';
import User from '../models/User.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = express.Router();

const ALL_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "user_management"];
const ALL_PERMISSIONS = ["create", "edit", "delete", "view"];
const DEFAULT_MEMBER_PASSWORD = 'chitfund@123';

router.get('/config', (req, res) => {
  res.json({ defaultMemberPassword: DEFAULT_MEMBER_PASSWORD });
});

router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      console.error('❌ Login: Missing credentials');
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    console.log(`🔐 Login attempt: userId=${userId}`);

    const user = await User.findOne({ userId, status: 'active' });

    if (!user) {
      console.error(`❌ Login: User not found or inactive - ${userId}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error(`❌ Login: Wrong password for ${userId}`);
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
      mustChangePassword: user.mustChangePassword || false,
      token
    };

    console.log(`✅ Login successful: ${userId} (${user.role})`);
    res.json({ user: userData });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      console.error('❌ Change Password: Missing required fields');
      return res.status(400).json({ message: 'User ID, current password, and new password are required' });
    }

    if (newPassword.length < 6) {
      console.error('❌ Change Password: New password too short');
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    console.log(`🔐 Change password attempt: ${userId}`);

    const user = await User.findOne({ userId });
    if (!user) {
      console.error(`❌ Change Password: User not found - ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.error(`❌ Change Password: Current password incorrect for ${userId}`);
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.plainPassword = newPassword;
    user.mustChangePassword = false;
    user.updatedAt = Date.now();
    await user.save();

    console.log(`✅ Change Password: Successfully changed for ${userId}`);
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('❌ Change Password error:', error.message);
    res.status(500).json({ message: 'Server error. Could not change password.' });
  }
});

router.post('/auth-change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      console.error('❌ Auth Change Password: Missing required fields');
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      console.error('❌ Auth Change Password: New password too short');
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      console.error(`❌ Auth Change Password: User not found - ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.error(`❌ Auth Change Password: Current password incorrect for ${userId}`);
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.plainPassword = newPassword;
    user.mustChangePassword = false;
    user.updatedAt = Date.now();
    await user.save();

    console.log(`✅ Auth Change Password: Successfully changed for ${userId}`);
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('❌ Auth Change Password error:', error.message);
    res.status(500).json({ message: 'Server error. Could not change password.' });
  }
});

router.post('/init', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ userId: 'ADMIN001' });
    if (existingAdmin) {
      console.log('ℹ️ Init: Super admin already exists, skipping initialization');
      return res.json({ message: 'System already initialized', initialized: true });
    }

    const superAdmin = new User({
      userId: 'ADMIN001',
      password: 'admin123',
      plainPassword: 'admin123',
      name: 'Super Admin',
      email: 'admin@hrchits.com',
      role: 'super_admin',
      modules: ALL_MODULES,
      permissions: ALL_PERMISSIONS,
      status: 'active',
      mustChangePassword: false
    });
    await superAdmin.save();
    console.log('✅ Init: Super admin created - ADMIN001 / admin123');

    res.json({
      message: 'System initialized successfully',
      initialized: true,
      admin: { userId: 'ADMIN001', role: 'super_admin' }
    });
  } catch (error) {
    console.error('❌ Init error:', error.message);
    res.status(500).json({ message: 'Failed to initialize system: ' + error.message });
  }
});

export default router;
export { DEFAULT_MEMBER_PASSWORD };
