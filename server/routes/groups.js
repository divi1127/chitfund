import express from 'express';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Member from '../models/Member.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Groups: Fetching all groups (requested by ${req.user.userId})`);
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
      const userMember = await Member.findOne({ memberId: req.user.userId });
      if (userMember && userMember.groups) {
        const filtered = groupsWithScheme.filter(g => userMember.groups.includes(g.id));
        return res.json(filtered);
      }
      return res.json([]);
    }

    res.json(groupsWithScheme);
  } catch (error) {
    console.error('❌ Groups: Error fetching:', error.message);
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
    const group = new Group(req.body);
    const savedGroup = await group.save();
    console.log(`✅ Groups: Created group ${savedGroup.name} (${savedGroup.id})`);
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('❌ Groups: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating group: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const existing = await Group.findOne({ id: req.params.id });
    if (!existing) {
      console.error(`❌ Groups: Group not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Group not found' });
    }
    const group = await Group.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    console.log(`✅ Groups: Updated group ${group.name}`);
    res.json(group);
  } catch (error) {
    console.error('❌ Groups: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating group: ' + error.message });
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
