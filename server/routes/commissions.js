import express from 'express';
import Commission from '../models/Commission.js';
import Agent from '../models/Agent.js';
import Group from '../models/Group.js';
import Member from '../models/Member.js';
import Collection from '../models/Collection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      const agent = await Agent.findOne({ userId: req.user.userId });
      if (agent) filter = { agentId: agent.agentId };
    }
    const commissions = await Commission.find(filter).sort({ year: -1, month: -1 });
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching commissions' });
  }
});

router.post('/calculate', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const agents = await Agent.find({ status: 'Active' });
    const results = [];

    for (const agent of agents) {
      const groups = await Group.find({ agentId: agent.agentId, status: 'Active' });

      for (const group of groups) {
        const groupMembers = await Member.find({ groups: group.id });
        const memberIds = groupMembers.map(m => m.memberId);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const collections = await Collection.find({
          memberId: { $in: memberIds },
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['Paid', 'Partially Paid'] }
        });

        const totalCollection = collections.reduce((sum, c) => sum + c.amount, 0);
        const commissionAmount = Math.round(totalCollection * (agent.commissionRate || 1) / 100);

        if (commissionAmount > 0) {
          const existing = await Commission.findOne({
            agentId: agent.agentId,
            groupId: group.id,
            month, year
          });

          if (existing) {
            existing.totalCollection = totalCollection;
            existing.commissionAmount = commissionAmount;
            await existing.save();
            results.push(existing);
          } else {
            const commission = new Commission({
              agentId: agent.agentId,
              agentName: agent.name,
              groupId: group.id,
              groupName: group.name,
              month, year,
              totalCollection,
              commissionRate: agent.commissionRate || 1,
              commissionAmount,
              status: 'Calculated'
            });
            await commission.save();
            results.push(commission);
          }
        }
      }
    }

    res.json({ message: 'Commission calculated successfully', count: results.length, commissions: results });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating commission: ' + error.message });
  }
});

router.put('/:id/pay', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);
    if (!commission) return res.status(404).json({ message: 'Commission not found' });

    commission.status = 'Paid';
    commission.paidDate = new Date();
    await commission.save();

    const agent = await Agent.findOne({ agentId: commission.agentId });
    if (agent) {
      agent.totalCommission = (agent.totalCommission || 0) + commission.commissionAmount;
      await agent.save();
    }

    res.json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Error updating commission' });
  }
});

router.get('/summary/:agentId', authenticate, async (req, res) => {
  try {
    const commissions = await Commission.find({ agentId: req.params.agentId });
    const totalEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalPaid = commissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalPending = commissions.filter(c => c.status !== 'Paid').reduce((sum, c) => sum + c.commissionAmount, 0);

    res.json({ totalEarned, totalPaid, totalPending, count: commissions.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching commission summary' });
  }
});

export default router;
