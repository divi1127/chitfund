import express from 'express';
import Member from '../models/Member.js';
import Agent from '../models/Agent.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Invoice from '../models/Invoice.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateCustomerId, generatePasswordFromDob, generateInvoiceNo } from '../utils/idGenerator.js';

const router = express.Router();

const CUSTOMER_MODULES = ['dashboard', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'];

router.get('/', authenticate, async (req, res) => {
  try {
    const members = await Member.find();
    
    if (req.user.role === 'user') {
      const agent = await Agent.findOne({ userId: req.user.userId });
      if (agent) {
        const filtered = members.filter(m => m.agentId === agent.agentId);
        return res.json(filtered);
      }
      const filtered = members.filter(m => m.memberId === req.user.userId);
      return res.json(filtered);
    }
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching members' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const member = await Member.findOne({ $or: [{ id: req.params.id }, { memberId: req.params.id }] });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching member' });
  }
});

router.post('/', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { name, phone, email, address, aadhaar, pan, dob, photo, groupId, agentId } = req.body;

    if (!name || !phone || !address || !aadhaar) {
      return res.status(400).json({ message: 'Name, phone, address, and aadhaar are required' });
    }

    if (agentId) {
      const agent = await Agent.findOne({ agentId });
      if (!agent) return res.status(400).json({ message: 'Agent not found' });
      if (agent.customers && agent.customers.length >= 9) {
        return res.status(400).json({ message: 'Agent has reached maximum customer limit (9)' });
      }
    }

    if (agentId) {
      const agentGroupCount = await Group.countDocuments({ agentId, status: 'Active' });
      if (agentGroupCount >= 50) {
        return res.status(400).json({ message: 'Agent has reached maximum limit of 50 chit groups' });
      }
    }

    if (groupId) {
      const group = await Group.findOne({ id: groupId });
      if (group && group.members && group.members.length >= (group.maxMembers || 10)) {
        return res.status(400).json({ message: `Group has reached maximum member limit of ${group.maxMembers || 10}` });
      }
    }

    const existingMemberByEmail = await Member.findOne({ email });
    if (existingMemberByEmail && existingMemberByEmail.groups.length >= 2) {
      return res.status(400).json({ message: 'Customer can join a maximum of 2 chit schemes' });
    }

    const memberId = await generateCustomerId();
    const autoPassword = dob ? generatePasswordFromDob(dob) : generatePasswordFromDob();

    const memberData = {
      id: 'C' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(-3),
      memberId,
      userId: memberId,
      name, phone,
      email: email || '',
      address, aadhaar,
      pan: pan || '',
      dob: dob || null,
      photo: photo || '',
      password: autoPassword,
      status: 'Active',
      groups: groupId ? [groupId] : [],
      agentId: agentId || null,
      modules: CUSTOMER_MODULES,
      permissions: ['view']
    };

    const member = new Member(memberData);
    const savedMember = await member.save();

    const existingUser = await User.findOne({ userId: memberId });
    if (!existingUser) {
      const newUser = new User({
        userId: memberId,
        plainPassword: autoPassword,
        name,
        email: email || `${memberId}@nvschit.com`,
        password: autoPassword,
        role: 'user',
        modules: CUSTOMER_MODULES,
        permissions: ['view']
      });
      await newUser.save();
    }

    if (agentId) {
      await Agent.findOneAndUpdate({ agentId }, { $addToSet: { customers: memberId } });
    }

    if (groupId) {
      await Group.findOneAndUpdate({ id: groupId }, { $addToSet: { members: memberId } });
      
      try {
        const memberGroup = await Group.findOne({ id: groupId });
        const memberScheme = memberGroup ? await Scheme.findOne({ id: memberGroup.schemeId }) : null;

        if (memberScheme && memberGroup) {
          const invoiceNo = await generateInvoiceNo();
          const dueDate = new Date();
          dueDate.setDate(5);
          dueDate.setMonth(dueDate.getMonth() + 1);

          const invoiceData = {
            invoiceNumber: invoiceNo,
            receiptNumber: '',
            branch: 'Madurai HQ',
            collectedBy: req.user.name,
            memberId,
            memberName: name,
            memberMobile: phone,
            memberAddress: address || '',
            memberAadhar: aadhaar || '',
            chitName: memberScheme.name,
            chitGroup: memberGroup.name,
            chitNumber: `CHIT-${memberScheme.amount}`,
            totalChitValue: memberScheme.amount,
            monthlyAmount: memberScheme.monthlyInstallment,
            duration: memberScheme.duration,
            currentMonth: memberGroup.currentInstallment || 1,
            dueDate,
            installmentAmount: memberScheme.monthlyInstallment,
            lateFine: 0,
            discount: 0,
            previousDue: 0,
            totalPayable: memberScheme.monthlyInstallment,
            amountPaid: 0,
            balance: memberScheme.monthlyInstallment,
            paymentMethod: 'Pending',
            paidInstallments: 0,
            remainingInstallments: memberScheme.duration,
            totalPaid: 0,
            remainingAmount: memberScheme.amount,
            status: 'Pending',
            remarks: 'First installment'
          };

          const invoice = new Invoice(invoiceData);
          await invoice.save();
        }
      } catch (invError) {
        console.error('Invoice creation error:', invError.message);
      }
    }

    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: 'Error creating customer: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const existing = await Member.findOne({ $or: [{ id: req.params.id }, { memberId: req.params.id }] });
    if (!existing) return res.status(404).json({ message: 'Member not found' });

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.memberId;
    delete updateData.userId;

    const member = await Member.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { memberId: req.params.id }] },
      updateData,
      { new: true }
    );
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error updating member: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ $or: [{ id: req.params.id }, { memberId: req.params.id }] });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await User.findOneAndDelete({ userId: member.memberId });
    if (member.agentId) {
      await Agent.findOneAndUpdate({ agentId: member.agentId }, { $pull: { customers: member.memberId } });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting member' });
  }
});

router.get('/history/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;
    const invoices = await Invoice.find({ memberId }).sort({ createdAt: -1 });
    const member = await Member.findOne({ memberId });
    res.json({ member, invoices });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching member history' });
  }
});

router.get('/by-agent/:agentId', authenticate, async (req, res) => {
  try {
    const members = await Member.find({ agentId: req.params.agentId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching agent members' });
  }
});

export default router;
