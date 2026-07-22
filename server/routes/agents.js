import express from 'express';
import Agent from '../models/Agent.js';
import Member from '../models/Member.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Commission from '../models/Commission.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateAgentId, generatePasswordFromDob } from '../utils/idGenerator.js';

const router = express.Router();

const AGENT_MODULES = ['dashboard', 'members', 'schemes', 'groups', 'collections', 'profile'];

router.get('/', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agents' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const agent = await Agent.findOne({ agentId: req.params.id });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agent' });
  }
});

router.post('/', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { name, phone, email, address, aadhaar, pan, dob } = req.body;

    if (!name || !phone || !address || !aadhaar) {
      return res.status(400).json({ message: 'Name, phone, address, and aadhaar are required' });
    }

    const agentId = await generateAgentId();
    const autoPassword = dob ? generatePasswordFromDob(dob) : 'welcome@2026';

    const agentData = {
      agentId,
      userId: agentId,
      name, phone,
      email: email || '',
      address, aadhaar,
      pan: pan || '',
      dob: dob || null,
      password: autoPassword,
      modules: AGENT_MODULES,
      permissions: ['create', 'view']
    };

    const agent = new Agent(agentData);
    const savedAgent = await agent.save();

    const existingUser = await User.findOne({ userId: agentId });
    if (!existingUser) {
      const newUser = new User({
        userId: agentId,
        plainPassword: autoPassword,
        name, email: email || `${agentId}@nvschit.com`,
        password: autoPassword,
        role: 'user',
        modules: AGENT_MODULES,
        permissions: ['create', 'view']
      });
      await newUser.save();
    }

    res.status(201).json(savedAgent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating agent: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const existing = await Agent.findOne({ agentId: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Agent not found' });

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.agentId;

    const agent = await Agent.findOneAndUpdate({ agentId: req.params.id }, updateData, { new: true });
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating agent: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({ agentId: req.params.id });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    await User.findOneAndDelete({ userId: agent.agentId });
    await Member.updateMany({ agentId: agent.agentId }, { $set: { agentId: null } });

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting agent' });
  }
});

router.get('/:id/customers', authenticate, async (req, res) => {
  try {
    const customers = await Member.find({ agentId: req.params.id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agent customers' });
  }
});

router.get('/:id/commissions', authenticate, async (req, res) => {
  try {
    const commissions = await Commission.find({ agentId: req.params.id }).sort({ year: -1, month: -1 });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching commissions' });
  }
});

router.get('/:id/groups', authenticate, async (req, res) => {
  try {
    const groups = await Group.find({ agentId: req.params.id });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agent groups' });
  }
});

export default router;
