import express from 'express';
import Member from '../models/Member.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single member
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create member
router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body);
    const savedMember = await member.save();

    // TEMPORARY DEVELOPMENT MODE: Immediate Invoice Generation
    if (req.body.group && req.body.scheme) {
      try {
        const group = await Group.findOne({ name: req.body.group });
        const scheme = await Scheme.findOne({ name: req.body.scheme });

        if (group && scheme) {
          const generateInvoiceNumber = () => {
            const date = new Date();
            const year = date.getFullYear();
            const random = Math.floor(Math.random() * 9000) + 1000;
            return `INV-${year}-${random}`;
          };

          const generateReceiptNumber = () => {
            const random = Math.floor(Math.random() * 9000) + 1000;
            return `RCPT-${random}`;
          };

          const invoiceData = {
            invoiceNumber: generateInvoiceNumber(),
            receiptNumber: generateReceiptNumber(),
            date: new Date(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            branch: 'Main Branch', // Default
            collectedBy: 'System',
            
            // Member Details
            memberId: savedMember.memberId,
            memberName: savedMember.name,
            memberMobile: savedMember.mobile || savedMember.phone,
            memberAddress: savedMember.address,
            
            // Chit Details
            chitName: scheme.name,
            chitGroup: group.name,
            chitNumber: '1', // Initial
            totalChitValue: scheme.amount,
            monthlyAmount: scheme.monthlyInstallment,
            duration: scheme.duration,
            currentMonth: 1,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), // Due in 10 days
            
            // Payment Details
            installmentAmount: scheme.monthlyInstallment,
            lateFine: 0,
            discount: 0,
            previousDue: 0,
            totalPayable: scheme.monthlyInstallment,
            amountPaid: 0,
            balance: scheme.monthlyInstallment,
            paymentMethod: 'Pending',
            
            // Account Status
            paidInstallments: 0,
            remainingInstallments: scheme.duration,
            totalPaid: 0,
            remainingAmount: scheme.amount,
            
            // Invoice Status
            status: 'Pending'
          };

          const invoice = new Invoice(invoiceData);
          await invoice.save();
          console.log('Temporary development invoice created for member:', savedMember.memberId);
        }
      } catch (invError) {
        console.error('Error creating development invoice:', invError);
        // Don't fail the member creation if invoice fails in dev mode
      }
    }

    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ id: req.params.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
