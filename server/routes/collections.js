import express from 'express';
import Collection from '../models/Collection.js';
import Invoice from '../models/Invoice.js';
import Member from '../models/Member.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateReceiptNo } from '../utils/idGenerator.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Collections: Fetching all collections (requested by ${req.user.userId})`);
    const collections = await Collection.find();

    if (req.user.role === 'user') {
      const userMember = await Member.findOne({ memberId: req.user.userId });
      if (!userMember) return res.json([]);
      const filtered = collections.filter(c => c.memberId === userMember.id || c.memberId === userMember.memberId);
      return res.json(filtered);
    }

    res.json(collections);
  } catch (error) {
    console.error('❌ Collections: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching collections' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findOne({ id: req.params.id });
    if (!collection) {
      console.error(`❌ Collections: Not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    console.error('❌ Collections: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching collection' });
  }
});

router.get('/monthly/:year/:month', authenticate, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const collections = await Collection.find({
      date: { $gte: startDate, $lte: endDate }
    });
    const invoices = await Invoice.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const totalCollected = collections.reduce((s, c) => s + (c.amount || 0), 0);
    const totalInvoiced = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);

    console.log(`📋 Collections: Monthly report for ${year}-${month}: ₹${totalCollected}`);
    res.json({ year, month, collections, invoices, totalCollected, totalInvoiced });
  } catch (error) {
    console.error('❌ Collections: Error monthly report:', error.message);
    res.status(500).json({ message: 'Server error generating monthly report' });
  }
});

router.post('/', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const data = { ...req.body };
    const receiptNo = await generateReceiptNo();

    const collectionData = {
      ...data,
      id: data.id || 'C' + Date.now().toString().slice(-6),
      receiptNo: receiptNo,
      amount: Number(data.amount),
      installment: Number(data.installment),
      status: 'Paid'
    };

    const collection = new Collection(collectionData);
    const savedCollection = await collection.save();
    console.log(`✅ Collections: Created collection ${receiptNo} for ₹${collectionData.amount}`);

    const member = await Member.findOne({ id: data.memberId });
    const group = await Group.findOne({ id: data.groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;

    const invoiceNo = 'INV' + new Date().getFullYear() + String(Date.now()).slice(-5);
    const invoiceData = {
      invoiceNumber: invoiceNo,
      receiptNumber: receiptNo,
      date: data.date || new Date(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      branch: 'Main Branch',
      collectedBy: req.user.name,
      memberId: member?.memberId || data.memberId,
      memberName: member?.name || '',
      memberMobile: member?.phone || '',
      memberAddress: member?.address || '',
      memberAadhar: member?.aadhaar || '',
      chitName: scheme?.name || '',
      chitGroup: group?.name || '',
      chitNumber: `CHIT-${scheme?.amount || ''}-001`,
      totalChitValue: scheme?.amount || 0,
      monthlyAmount: scheme?.monthlyInstallment || 0,
      duration: scheme?.duration || 0,
      currentMonth: data.installment || 1,
      dueDate: data.date || new Date(),
      installmentAmount: Number(data.amount),
      lateFine: 0,
      discount: 0,
      previousDue: 0,
      totalPayable: Number(data.amount),
      amountPaid: Number(data.amount),
      balance: 0,
      paymentMethod: data.mode || 'Cash',
      referenceNumber: data.referenceNumber || '',
      paidInstallments: 1,
      remainingInstallments: (scheme?.duration || 0) - (data.installment || 1),
      totalPaid: Number(data.amount),
      remainingAmount: (scheme?.amount || 0) - Number(data.amount),
      status: 'Paid',
      remarks: 'Payment via collection'
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    console.log(`✅ Collections: Auto-created invoice ${invoiceNo} for collection ${receiptNo}`);

    res.status(201).json(savedCollection);
  } catch (error) {
    console.error('❌ Collections: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating collection: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!collection) {
      console.error(`❌ Collections: Not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Collection not found' });
    }
    console.log(`✅ Collections: Updated collection ${collection.receiptNo}`);
    res.json(collection);
  } catch (error) {
    console.error('❌ Collections: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating collection: ' + error.message });
  }
});

// ── Member self-payment (user portal) ──────────────────────────────────────
router.post('/member-payment', authenticate, async (req, res) => {
  try {
    const data = req.body;
    const receiptNo = await generateReceiptNo();
    const member = await Member.findOne({ id: data.memberId });
    const group = await Group.findOne({ id: data.groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;

    // Prevent duplicate payment for same month
    const existing = await Collection.findOne({
      memberId: data.memberId,
      groupId: data.groupId,
      installment: Number(data.installment),
      status: { $in: ['Paid', 'Pending'] }
    });
    if (existing) {
      return res.status(400).json({ message: `Month ${data.installment} already has a ${existing.status.toLowerCase()} payment.` });
    }

    const collection = await Collection.create({
      id: 'C' + Date.now().toString().slice(-8),
      memberId: data.memberId,
      groupId: data.groupId,
      amount: Number(data.amount),
      installment: Number(data.installment),
      mode: data.mode,
      date: data.date || new Date(),
      status: data.status || 'Pending',
      receiptNo,
      upiRef: data.upiRef || '',
      upiProof: data.upiProof || '',
    });

    // Auto-create invoice only for UPI (Paid) payments
    if (data.status === 'Paid') {
      const invoiceNo = 'INV' + new Date().getFullYear() + String(Date.now()).slice(-5);
      await Invoice.create({
        invoiceNumber: invoiceNo,
        receiptNumber: receiptNo,
        date: data.date || new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        branch: 'Main Branch',
        collectedBy: member?.name || 'Self',
        memberId: member?.memberId || data.memberId,
        memberName: member?.name || '',
        memberMobile: member?.phone || '',
        memberAddress: member?.address || '',
        memberAadhar: member?.aadhaar || '',
        chitName: scheme?.name || '',
        chitGroup: group?.name || '',
        chitNumber: `CHIT-${scheme?.amount || ''}-001`,
        totalChitValue: scheme?.amount || 0,
        monthlyAmount: Number(data.amount),
        duration: scheme?.duration || 0,
        currentMonth: Number(data.installment),
        dueDate: data.date || new Date(),
        installmentAmount: Number(data.amount),
        lateFine: 0, discount: 0, previousDue: 0,
        totalPayable: Number(data.amount),
        amountPaid: Number(data.amount),
        balance: 0,
        paymentMethod: data.mode,
        referenceNumber: data.upiRef || '',
        paidInstallments: Number(data.installment),
        remainingInstallments: (scheme?.duration || 0) - Number(data.installment),
        totalPaid: Number(data.amount),
        remainingAmount: (scheme?.amount || 0) - Number(data.amount),
        status: 'Paid',
        remarks: 'Self-payment via UPI'
      });
      console.log(`✅ Member self-payment: ${receiptNo} ₹${data.amount} Month ${data.installment} [Paid]`);
    } else {
      console.log(`⏳ Cash payment pending: ${receiptNo} ₹${data.amount} Month ${data.installment} [Pending]`);
    }

    res.status(201).json(collection);
  } catch (error) {
    console.error('❌ member-payment error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// ── Admin approve cash payment ──────────────────────────────────────────────
router.put('/:id/approve', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { id: req.params.id, status: 'Pending' },
      { status: 'Paid' },
      { new: true }
    );
    if (!collection) return res.status(404).json({ message: 'Pending collection not found' });

    const receiptNo = collection.receiptNo;
    const member = await Member.findOne({ id: collection.memberId });
    const group = await Group.findOne({ id: collection.groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;
    const invoiceNo = 'INV' + new Date().getFullYear() + String(Date.now()).slice(-5);

    await Invoice.create({
      invoiceNumber: invoiceNo,
      receiptNumber: receiptNo,
      date: collection.date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      branch: 'Main Branch',
      collectedBy: req.user.name,
      memberId: member?.memberId || collection.memberId,
      memberName: member?.name || '',
      memberMobile: member?.phone || '',
      memberAddress: member?.address || '',
      memberAadhar: member?.aadhaar || '',
      chitName: scheme?.name || '',
      chitGroup: group?.name || '',
      totalChitValue: scheme?.amount || 0,
      monthlyAmount: collection.amount,
      duration: scheme?.duration || 0,
      currentMonth: collection.installment,
      installmentAmount: collection.amount,
      lateFine: 0, discount: 0, previousDue: 0,
      totalPayable: collection.amount,
      amountPaid: collection.amount,
      balance: 0,
      paymentMethod: 'Cash',
      remainingInstallments: (scheme?.duration || 0) - collection.installment,
      totalPaid: collection.amount,
      remainingAmount: (scheme?.amount || 0) - collection.amount,
      status: 'Paid',
      remarks: 'Cash payment approved by admin'
    });

    console.log(`✅ Cash approved: ${receiptNo} by ${req.user.userId}`);
    res.json(collection);
  } catch (error) {
    console.error('❌ approve error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ id: req.params.id });
    if (!collection) {
      console.error(`❌ Collections: Not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Collection not found' });
    }
    console.log(`✅ Collections: Deleted collection ${collection.receiptNo}`);
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('❌ Collections: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting collection' });
  }
});

export default router;
