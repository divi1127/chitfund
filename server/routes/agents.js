import express from 'express';
import Agent from '../models/Agent.js';
import Member from '../models/Member.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Collection from '../models/Collection.js';
import Commission from '../models/Commission.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateAgentId, generatePasswordFromDob } from '../utils/idGenerator.js';
import { notifyAllAdmins } from '../utils/notify.js';

const router = express.Router();

const AGENT_MODULES = ['dashboard', 'members', 'schemes', 'groups', 'collections', 'profile'];

router.get('/', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agents' });
  }
});

// ── Agent Summary with Filters ─────────────────────────────────────────────
router.get('/summary/filter', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { year, schemeId, groupId } = req.query;
    const agents = await Agent.find();
    const members = await Member.find();
    const groups = await Group.find();
    const schemes = await Scheme.find();
    const collections = await Collection.find();
    const commissions = await Commission.find();

    let filteredGroups = groups;
    if (groupId) filteredGroups = filteredGroups.filter(g => g.id === groupId);
    if (schemeId) filteredGroups = filteredGroups.filter(g => g.schemeId === schemeId);

    const availableYears = [...new Set(Array.isArray(collections) ? collections.map(c => new Date(c.date).getFullYear()) : [])].sort();

    const result = agents.map(agent => {
      const agentCustomers = members.filter(m => m.agentId === agent.agentId);
      let agentGroups = groups.filter(g => g.agentId === agent.agentId);
      if (groupId) agentGroups = agentGroups.filter(g => g.id === groupId);
      if (schemeId) agentGroups = agentGroups.filter(g => g.schemeId === schemeId);

      const customerIds = agentCustomers.map(m => m.memberId);
      let agentCollections = collections.filter(c => customerIds.includes(c.memberId));

      if (year) {
        const y = parseInt(year);
        agentCollections = agentCollections.filter(c => {
          const d = new Date(c.date);
          return d.getFullYear() === y;
        });
      }
      if (groupId) agentCollections = agentCollections.filter(c => c.groupId === groupId);

      const totalPaid = agentCollections.filter(c => c.status === 'Paid').reduce((s, c) => s + (c.amount || 0), 0);
      const totalPending = agentCollections.filter(c => c.status === 'Pending' || c.status === 'Partially Paid').reduce((s, c) => s + ((c.pendingBalance || 0) || (c.fullInstallmentAmount || 0) - (c.amount || 0)), 0);

      const totalDue = agentCustomers.reduce((sum, m) => {
        const memberGroups = groups.filter(g => m.groups?.includes(g.id));
        return sum + memberGroups.reduce((gs, g) => {
          const scheme = schemes.find(s => s.id === g.schemeId);
          const memberColls = collections.filter(c => c.memberId === m.memberId && c.groupId === g.id);
          const paidMonths = new Set(memberColls.map(c => c.installment)).size;
          const due = (scheme?.duration || 0) - paidMonths;
          const monthAmt = scheme?.monthlyAmounts?.[0]?.amount || 0;
          return gs + Math.max(0, due) * monthAmt;
        }, 0);
      }, 0);

      let agentCommissions = commissions.filter(c => c.agentId === agent.agentId);
      if (year) agentCommissions = agentCommissions.filter(c => c.year === parseInt(year));
      if (groupId) agentCommissions = agentCommissions.filter(c => c.groupId === groupId);

      const totalCommission = agentCommissions.reduce((s, c) => s + (c.commissionAmount || 0), 0);
      const paidCommission = agentCommissions.filter(c => c.status === 'Paid').reduce((s, c) => s + (c.commissionAmount || 0), 0);

      const joinedChits = agentGroups.map(g => {
        const scheme = schemes.find(s => s.id === g.schemeId);
        const groupMembers = agentCustomers.filter(m => m.groups?.includes(g.id));
        const groupColls = collections.filter(c => c.groupId === g.id && customerIds.includes(c.memberId));
        const groupPaid = groupColls.filter(c => c.status === 'Paid').reduce((s, c) => s + (c.amount || 0), 0);
        return {
          groupId: g.id, groupName: g.name,
          schemeName: scheme?.name || '', schemeAmount: scheme?.amount || 0,
          monthlyInstallment: scheme?.monthlyAmounts?.[0]?.amount || 0,
          memberCount: groupMembers.length, totalPaid: groupPaid,
          startDate: g.startDate, status: g.status,
        };
      });

      return {
        agentId: agent.agentId, name: agent.name, phone: agent.phone,
        photo: agent.photo, status: agent.status,
        customerCount: agentCustomers.length, joinedChitCount: agentGroups.length,
        totalPaid, totalPending, totalDue,
        totalCommission, paidCommission,
        pendingCommission: totalCommission - paidCommission,
        joinedChits,
      };
    });

    res.json({ agents: result, availableYears });
  } catch (error) {
    console.error('❌ Agent summary error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
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

router.post('/', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { name, phone, email, address, aadhaar, pan, dob, photo } = req.body;

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
      photo: photo || '',
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
        role: 'agent',
        modules: AGENT_MODULES,
        permissions: ['create', 'view']
      });
      await newUser.save();
    }

    await notifyAllAdmins('New Agent Created', `Agent ${savedAgent.name} (${savedAgent.agentId}) has been added to the system.`, 'success');

    res.status(201).json(savedAgent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating agent: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
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

router.delete('/:id', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
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

// Reset agent password to their DOB (DDMMYYYY)
router.put('/:id/reset-password', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const agent = await Agent.findOne({ agentId: req.params.id });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    const newPassword = agent.dob ? generatePasswordFromDob(agent.dob) : 'welcome@2026';

    // Update Agent record (plaintext — compared directly in agent-login)
    await Agent.findOneAndUpdate({ agentId: req.params.id }, { password: newPassword });

    // Update the linked User record so main /login also works
    const userRecord = await User.findOne({ userId: req.params.id });
    if (userRecord) {
      userRecord.password = newPassword;
      userRecord.plainPassword = newPassword;
      await userRecord.save(); // triggers bcrypt pre-save hook
    }

    res.json({ message: 'Password reset to DOB successfully', newPassword });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password: ' + error.message });
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
