import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('super_admin', 'sub_admin'), async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'sub_admin') {
      filter = { role: 'user', $or: [{ branch: req.user.branch }, { assignedBranch: req.user.branch }] };
    }
    const users = await User.find(filter, '-password');
    res.json(users);
  } catch (error) {
    console.error('❌ Users: Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.role === 'user' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'sub_admin' && user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Users: Error fetching user:', error.message);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

router.post('/', authenticateToken, requireRole('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { userId, password, name, email, phone, role, modules, permissions, branch, assignedBranch } = req.body;

    if (!userId || !password || !name || !email) {
      console.error('❌ Users: Missing required fields');
      return res.status(400).json({ message: 'User ID, password, name, and email are required' });
    }

    if (req.user.role === 'sub_admin' && (role === 'super_admin' || role === 'sub_admin')) {
      return res.status(403).json({ message: 'Sub Admins cannot create admin accounts' });
    }

    if (req.user.role === 'sub_admin') {
      const userBranch = req.user.branch || req.user.assignedBranch;
      if (assignedBranch && assignedBranch !== userBranch) {
        return res.status(403).json({ message: 'You can only assign users to your branch' });
      }
    }

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      console.error(`❌ Users: User ID or email already exists - ${userId}`);
      return res.status(400).json({ message: 'User ID or email already exists' });
    }

    const newUser = new User({
      userId, password, name, email, phone,
      role: role || 'user',
      modules: modules || [],
      permissions: permissions || [],
      branch: branch || assignedBranch,
      assignedBranch: assignedBranch || branch
    });

    await newUser.save();
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'USER_CREATE', resource: 'User', resourceId: newUser._id, details: { userId, name, role: newUser.role }, ipAddress: req.ip });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('❌ Users: Error creating user:', error.message);
    res.status(500).json({ message: 'Server error creating user: ' + error.message });
  }
});

router.put('/:id', authenticateToken, requireRole('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role === 'sub_admin' && user.role !== 'user') {
      return res.status(403).json({ message: 'Sub Admins can only edit regular users' });
    }

    const { name, email, phone, role, modules, permissions, status, branch, assignedBranch, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role && req.user.role === 'super_admin') updateData.role = role;
    if (modules) updateData.modules = modules;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;
    if (branch && req.user.role === 'super_admin') updateData.branch = branch;
    if (assignedBranch && req.user.role === 'super_admin') updateData.assignedBranch = assignedBranch;
    if (password) updateData.password = password;
    updateData.updatedAt = Date.now();

    if (req.user.role === 'sub_admin' && updateData.branch) {
      const userBranch = req.user.branch || req.user.assignedBranch;
      if (updateData.branch !== userBranch) {
        return res.status(403).json({ message: 'You can only assign users to your branch' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'USER_UPDATE', resource: 'User', resourceId: user._id, details: { userId: user.userId, updates: Object.keys(updateData) }, ipAddress: req.ip });
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('❌ Users: Error updating user:', error.message);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

router.delete('/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot delete a Super Admin account' });
    }
    await User.findByIdAndDelete(req.params.id);
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'USER_DELETE', resource: 'User', resourceId: user._id, details: { userId: user.userId, name: user.name, role: user.role }, ipAddress: req.ip });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Users: Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

export default router;
