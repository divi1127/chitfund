import express from 'express';
import Group from '../models/Group.js';
import Agent from '../models/Agent.js';
import Scheme from '../models/Scheme.js';
import Member from '../models/Member.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const groups = await Group.find();
    const schemes = await Scheme.find();

    const groupsWithScheme = groups.map(g => {
      const scheme = schemes.find(s => s.id === g.schemeId);
      return {
        ...g.toObject(),
        schemeName: scheme?.name || 'Unknown',
        totalInstallments: scheme?.duration || 0,
        schemeAmount: scheme?.amount || 0,
        schemeMonthlyInstallment: scheme?.monthlyInstallment || 0
      };
    });

    if (req.user.role === 'user') {
      const agent = await Agent.findOne({ userId: req.user.userId });
      if (agent) {
        const filtered = groupsWithScheme.filter(g => g.agentId === agent.agentId);
        return res.json(filtered);
      }
      const userMember = await Member.findOne({ memberId: req.user.userId });
      if (userMember && userMember.groups) {
        const filtered = groupsWithScheme.filter(g => userMember.groups.includes(g.id));
        return res.json(filtered);
      }
      return res.json([]);
    }

    res.json(groupsWithScheme);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching groups' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const group = await Group.findOne({ id: req.params.id });
    if (!group) {
      console.error(`❌ Groups: Group not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Group not found' });
    }
    const scheme = await Scheme.findOne({ id: group.schemeId });
    res.json({ ...group.toObject(), totalInstallments: scheme?.duration || 0 });
  } catch (error) {
    console.error('❌ Groups: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching group' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { agentId } = req.body;

    if (agentId) {
      const agentGroupCount = await Group.countDocuments({ agentId, status: 'Active' });
      if (agentGroupCount >= 50) {
        return res.status(400).json({ message: 'Agent has reached maximum limit of 50 chit groups' });
      }
    }

    const scheme = await Scheme.findOne({ id: req.body.schemeId });
    const groupData = {
      ...req.body,
      maxMembers: scheme?.members || 10
    };

    const group = new Group(groupData);
    const savedGroup = await group.save();

    if (agentId) {
      await Agent.findOneAndUpdate({ agentId }, { $addToSet: { assignedGroups: savedGroup.id } });
    }

    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: 'Error creating group: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const existing = await Group.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Group not found' });

    const { members, agentId } = req.body;

    if (members && members.length > (existing.maxMembers || 10)) {
      return res.status(400).json({ message: `Group can have a maximum of ${existing.maxMembers || 10} members` });
    }

    if (agentId && agentId !== existing.agentId) {
      const agentGroupCount = await Group.countDocuments({ agentId, status: 'Active' });
      if (agentGroupCount >= 50) {
        return res.status(400).json({ message: 'Agent has reached maximum limit of 50 chit groups' });
      }
    }

    const group = await Group.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: 'Error updating group: ' + error.message });
  }
});

router.post('/:id/add-member', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'Member ID is required' });

    const group = await Group.findOne({ id: req.params.id });
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members && group.members.length >= (group.maxMembers || 10)) {
      return res.status(400).json({ message: `Group has reached maximum member limit of ${group.maxMembers || 10}` });
    }

    const member = await Member.findOne({ memberId });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (member.groups && member.groups.length >= 2) {
      return res.status(400).json({ message: 'Customer can join a maximum of 2 chit schemes' });
    }

    if (group.members && group.members.includes(memberId)) {
      return res.status(400).json({ message: 'Member is already in this group' });
    }

    group.members.push(memberId);
    await group.save();

    if (!member.groups.includes(group.id)) {
      member.groups.push(group.id);
      await member.save();
    }

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: 'Error adding member to group: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ id: req.params.id });
    if (!group) {
      console.error(`❌ Groups: Group not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Group not found' });
    }
    console.log(`✅ Groups: Deleted group ${group.name}`);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('❌ Groups: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting group' });
  }
});

export default router;
