import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Users: Fetching all users (requested by ${req.user.userId})`);
    const projection = req.user.role === 'super_admin' ? { password: 0 } : { password: 0, plainPassword: 0 };
    const users = await User.find({}, projection);
    res.json(users);
  } catch (error) {
    console.error('❌ Users: Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      console.error(`❌ Users: User not found - ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Users: Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { userId, password, name, email, role, modules, permissions } = req.body;

    if (!userId || !password || !name || !email) {
      console.error('❌ Users: Missing required fields');
      return res.status(400).json({ message: 'User ID, password, name, and email are required' });
    }

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      console.error(`❌ Users: User ID or email already exists - ${userId}`);
      return res.status(400).json({ message: 'User ID or email already exists' });
    }

    const newUser = new User({
      userId,
      password,
      plainPassword: req.body.plainPassword || password,
      name,
      email,
      role: role || 'user',
      modules: modules || [],
      permissions: permissions || []
    });

    await newUser.save();
    console.log(`✅ Users: Created user ${userId} with role ${newUser.role}`);
    res.status(201).json({ message: 'User created successfully', user: { ...newUser.toObject(), password: undefined } });
  } catch (error) {
    console.error('❌ Users: Error creating user:', error.message);
    res.status(500).json({ message: 'Server error creating user: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.error(`❌ Users: User not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role, modules, permissions, status, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (modules) user.modules = modules;
    if (permissions) user.permissions = permissions;
    if (status) user.status = status;
    if (password) user.password = password;
    user.updatedAt = Date.now();

    await user.save();
    console.log(`✅ Users: Updated user ${user.userId}`);
    res.json({ message: 'User updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error('❌ Users: Error updating user:', error.message);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.error(`❌ Users: User not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'super_admin') {
      console.error('❌ Users: Cannot delete super admin');
      return res.status(403).json({ message: 'Cannot delete super admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    console.log(`✅ Users: Deleted user ${user.userId}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Users: Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

export default router;
