import express from 'express';
import Member from '../models/Member.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Invoice from '../models/Invoice.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateSchemeMemberId, generateMemberPassword, generateInvoiceNo } from '../utils/idGenerator.js';

const router = express.Router();

const MEMBER_MODULES = ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'];

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Members: Fetching members (requested by ${req.user.userId})`);
    const members = await Member.find();
    
    if (req.user.role === 'user') {
      const filtered = members.filter(m => m.memberId === req.user.userId || m.email === req.user.email);
      console.log(`📋 Members: Filtered for user ${req.user.userId} - ${filtered.length} results`);
      return res.json(filtered);
    }
    
    res.json(members);
  } catch (error) {
    console.error('❌ Members: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching members' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id });
    if (!member) {
      console.error(`❌ Members: Member not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('❌ Members: Error fetching member:', error.message);
    res.status(500).json({ message: 'Server error fetching member' });
  }
});

router.post('/', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { name, phone, email, address, aadhaar, pan, groupId } = req.body;

    if (!name || !phone || !address || !aadhaar || !pan) {
      console.error('❌ Members: Missing required fields');
      return res.status(400).json({ message: 'Name, phone, address, aadhaar, and pan are required' });
    }

    let schemeName = '';
    if (groupId) {
      const memberGroup = await Group.findOne({ id: groupId });
      if (memberGroup) {
        const memberScheme = await Scheme.findOne({ id: memberGroup.schemeId });
        if (memberScheme) schemeName = memberScheme.name;
      }
    }

    const memberId = await generateSchemeMemberId(schemeName);
    const autoPassword = generateMemberPassword();
    const memberData = {
      id: 'M' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(-3),
      memberId: memberId,
      userId: memberId,
      name,
      phone,
      email: email || '',
      address,
      aadhaar,
      pan,
      password: autoPassword,
      joined: new Date().toISOString().split('T')[0],
      status: 'Active',
      groups: groupId ? [groupId] : [],
      modules: MEMBER_MODULES,
      permissions: ['view']
    };

    const member = new Member(memberData);
    const savedMember = await member.save();
    console.log(`✅ Members: Created member ${memberId} - ${name}`);

      const userData = {
        userId: memberId,
        plainPassword: autoPassword,
        name,
        email: email || `${memberId}@hrchits.com`,
        password: autoPassword,
        role: 'user',
        modules: MEMBER_MODULES,
        permissions: ['view'],
        mustChangePassword: true
      };

    const existingUser = await User.findOne({ userId: memberId });
    if (!existingUser) {
      const newUser = new User(userData);
      await newUser.save();
      console.log(`✅ Members: Created user account for ${memberId}`);
    }

    if (groupId) {
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
            branch: 'Main Branch',
            collectedBy: req.user.name,
            memberId: memberId,
            memberName: name,
            memberMobile: phone,
            memberAddress: address || '',
            memberAadhar: aadhaar || '',
            chitName: memberScheme.name,
            chitGroup: memberGroup.name,
            chitNumber: `CHIT-${memberScheme.amount}-001`,
            totalChitValue: memberScheme.amount,
            monthlyAmount: memberScheme.monthlyInstallment,
            duration: memberScheme.duration,
            currentMonth: memberGroup.currentInstallment || 1,
            dueDate: dueDate,
            installmentAmount: memberScheme.monthlyInstallment,
            lateFine: 0,
            discount: 0,
            previousDue: 0,
            totalPayable: memberScheme.monthlyInstallment,
            amountPaid: 0,
            balance: memberScheme.monthlyInstallment,
            paymentMethod: 'Pending',
            referenceNumber: '',
            paidInstallments: 0,
            remainingInstallments: memberScheme.duration,
            totalPaid: 0,
            remainingAmount: memberScheme.amount,
            status: 'Pending',
            remarks: 'First installment'
          };

          const invoice = new Invoice(invoiceData);
          await invoice.save();
          console.log(`✅ Members: Auto-created invoice ${invoiceNo} for ${memberId}`);
        }
      } catch (invError) {
        console.error(`❌ Members: Invoice creation error for ${memberId}:`, invError.message);
      }
    }

    res.status(201).json(savedMember);
  } catch (error) {
    console.error('❌ Members: Error creating member:', error.message);
    res.status(400).json({ message: 'Error creating member: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const existing = await Member.findOne({ id: req.params.id });
    if (!existing) {
      console.error(`❌ Members: Member not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Member not found' });
    }

    const updateData = { ...req.body };
    delete updateData.password;

    const member = await Member.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
    console.log(`✅ Members: Updated member ${member.memberId}`);
    res.json(member);
  } catch (error) {
    console.error('❌ Members: Error updating member:', error.message);
    res.status(400).json({ message: 'Error updating member: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ id: req.params.id });
    if (!member) {
      console.error(`❌ Members: Member not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Member not found' });
    }

    await User.findOneAndDelete({ userId: member.memberId });
    console.log(`✅ Members: Deleted member ${member.memberId} and associated user`);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('❌ Members: Error deleting member:', error.message);
    res.status(500).json({ message: 'Server error deleting member' });
  }
});

router.get('/history/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;
    const invoices = await Invoice.find({ memberId }).sort({ createdAt: -1 });
    const member = await Member.findOne({ memberId });

    console.log(`📋 Members: History fetched for ${memberId} - ${invoices.length} invoices`);
    res.json({ member, invoices });
  } catch (error) {
    console.error('❌ Members: Error fetching member history:', error.message);
    res.status(500).json({ message: 'Server error fetching member history' });
  }
});

export default router;
