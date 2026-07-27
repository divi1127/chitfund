import express from 'express';
import Collection from '../models/Collection.js';
import Invoice from '../models/Invoice.js';
import Member from '../models/Member.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Agent from '../models/Agent.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateReceiptNo } from '../utils/idGenerator.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Collections: Fetching all collections (requested by ${req.user.userId})`);
    const collections = await Collection.find();

    if (req.user.role === 'agent') {
      const agent = await Agent.findOne({ userId: req.user.userId });
      if (agent) {
        const agentCustomers = await Member.find({ agentId: agent.agentId });
        const customerIds = agentCustomers.map(m => m.memberId);
        const filtered = collections.filter(c => customerIds.includes(c.memberId));
        return res.json(filtered);
      }
      return res.json([]);
    }
    if (req.user.role === 'customer') {
      const userMember = await Member.findOne({ memberId: req.user.userId });
      if (userMember) {
        const filtered = collections.filter(c => c.memberId === userMember.memberId);
        return res.json(filtered);
      }
      return res.json([]);
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

router.post('/', authenticate, authorize('super_admin', 'admin', 'agent'), async (req, res) => {
  try {
    const data = { ...req.body };
    const receiptNo = await generateReceiptNo();

    const fullAmount = data.fullInstallmentAmount || Number(data.amount);
    const paidAmount = Number(data.amount);
    const pendingBal = Math.max(0, fullAmount - paidAmount);

    const collectionData = {
      ...data,
      id: data.id || 'C' + Date.now().toString().slice(-6),
      receiptNo,
      amount: paidAmount,
      installment: Number(data.installment),
      status: pendingBal > 0 ? 'Partially Paid' : 'Paid',
      fullInstallmentAmount: fullAmount,
      pendingBalance: pendingBal
    };

    if (pendingBal > 0) {
      collectionData.partialPayments = [{
        amount: paidAmount,
        date: data.date || new Date(),
        mode: data.mode || 'Cash',
        receiptNo
      }];
    }

    const collection = new Collection(collectionData);
    const savedCollection = await collection.save();

    const member = await Member.findOne({ $or: [{ id: data.memberId }, { memberId: data.memberId }] });
    const group = await Group.findOne({ id: data.groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;

    const invoiceNo = 'INV' + new Date().getFullYear() + String(Date.now()).slice(-5);
    const invoiceData = {
      invoiceNumber: invoiceNo,
      receiptNumber: receiptNo,
      date: data.date || new Date(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      branch: 'Madurai HQ',
      collectedBy: req.user.name,
      memberId: member?.memberId || data.memberId,
      memberName: member?.name || '',
      memberMobile: member?.phone || '',
      memberAddress: member?.address || '',
      memberAadhar: member?.aadhaar || '',
      chitName: scheme?.name || '',
      chitGroup: group?.name || '',
      chitNumber: `CHIT-${scheme?.amount || ''}`,
      totalChitValue: scheme?.amount || 0,
      monthlyAmount: scheme?.monthlyInstallment || 0,
      duration: scheme?.duration || 0,
      currentMonth: data.installment || 1,
      dueDate: data.date || new Date(),
      installmentAmount: fullAmount,
      lateFine: 0,
      discount: 0,
      previousDue: 0,
      totalPayable: fullAmount,
      amountPaid: paidAmount,
      balance: pendingBal,
      paymentMethod: data.mode || 'Cash',
      referenceNumber: data.referenceNumber || '',
      paidInstallments: pendingBal > 0 ? 0 : 1,
      remainingInstallments: (scheme?.duration || 0) - (data.installment || 1),
      totalPaid: paidAmount,
      remainingAmount: (scheme?.amount || 0) - paidAmount,
      status: pendingBal > 0 ? 'Partially Paid' : 'Paid',
      remarks: pendingBal > 0 ? `Partial payment: ₹${paidAmount} paid, ₹${pendingBal} due` : 'Payment via collection'
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json(savedCollection);
  } catch (error) {
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

// ── Partial Payment ──────────────────────────────────────────────────────
router.post('/partial-payment', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
  try {
    const { collectionId, amount, date, mode } = req.body;
    if (!collectionId || !amount) {
      return res.status(400).json({ message: 'Collection ID and amount are required' });
    }

    const collection = await Collection.findOne({ id: collectionId });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const partialReceipt = await generateReceiptNo();
    const newPendingBal = Math.max(0, collection.pendingBalance - Number(amount));

    collection.partialPayments.push({
      amount: Number(amount),
      date: date || new Date(),
      mode: mode || 'Cash',
      receiptNo: partialReceipt
    });

    collection.amount += Number(amount);
    collection.pendingBalance = newPendingBal;
    collection.status = newPendingBal > 0 ? 'Partially Paid' : 'Paid';

    if (newPendingBal === 0) {
      collection.fullInstallmentAmount = collection.amount;
    }

    await collection.save();
    res.json(collection);
  } catch (error) {
    res.status(400).json({ message: 'Error processing partial payment: ' + error.message });
  }
});

// ── Member self-payment (user portal) ──────────────────────────────────────
router.post('/member-payment', authenticate, async (req, res) => {
  try {
    const data = req.body;
    const member = await Member.findOne({ id: data.memberId }) || await Member.findOne({ memberId: data.memberId });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    
    // Fetch max divisions setting
    const maxDivisionsSetting = await PlatformSettings.findOne({ key: 'maxPaymentDivisions' });
    const maxDivisions = maxDivisionsSetting ? Number(maxDivisionsSetting.value) : 10;
    
    // Check if collection already exists for this month
    let collection = await Collection.findOne({
      memberId: member.memberId,
      groupId: data.groupId,
      installment: Number(data.installment)
    });
    
    const paidAmount = Number(data.amount);
    const partialReceipt = await generateReceiptNo();
    const partialPaymentData = {
      amount: paidAmount,
      date: data.date || new Date(),
      mode: data.mode,
      receiptNo: partialReceipt,
      proof: data.paymentProof || data.upiProof || '',
      status: 'Pending'
    };

    if (collection) {
      // Validate max divisions
      if (collection.partialPayments.length >= maxDivisions) {
         return res.status(400).json({ message: `Maximum partial transactions (${maxDivisions}) reached for this month.` });
      }
      
      // We don't increase collection's 'amount' or decrease 'pendingBalance' yet because it's pending approval
      collection.partialPayments.push(partialPaymentData);
      
      // If collection was fully paid, but they are adding more? That shouldn't happen if UI restricts it.
      await collection.save();
      console.log(`⏳ Partial payment added: ${partialReceipt} ₹${paidAmount} Month ${data.installment}`);
      return res.status(201).json(collection);
    }
    
    // No collection exists, create one
    const receiptNo = await generateReceiptNo();
    const invoice = await Invoice.findOne({ invoiceNumber: data.invoiceNumber });
    const fullAmount = invoice ? invoice.installmentAmount : paidAmount;

    collection = await Collection.create({
      id: 'C' + Date.now().toString().slice(-8),
      invoiceNumber: data.invoiceNumber || '',
      memberId: member.memberId,
      groupId: data.groupId,
      amount: 0, // 0 because it is pending approval
      installment: Number(data.installment),
      mode: data.mode,
      date: data.date || new Date(),
      status: 'Pending',
      receiptNo,
      fullInstallmentAmount: fullAmount,
      pendingBalance: fullAmount,
      partialPayments: [partialPaymentData]
    });
    
    console.log(`⏳ New partial collection created: ${receiptNo} with partial ${partialReceipt} ₹${paidAmount} Month ${data.installment}`);
    res.status(201).json(collection);
  } catch (error) {
    console.error('❌ member-payment error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// ── Admin approve cash payment ──────────────────────────────────────────────
router.put('/:id/approve', authenticate, authorize('super_admin', 'admin'), async (req, res) => {
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

// ── Admin approve partial payment with proof ─────────────────────────────────
router.put('/:id/approve-partial/:receiptNo', authenticate, authorize('super_admin', 'admin', 'agent'), async (req, res) => {
  try {
    const { id, receiptNo } = req.params;
    const collection = await Collection.findOne({ id });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    const partialIndex = collection.partialPayments.findIndex(p => p.receiptNo === receiptNo);
    if (partialIndex === -1) return res.status(404).json({ message: 'Partial payment not found' });
    if (collection.partialPayments[partialIndex].status === 'Paid') {
      return res.status(400).json({ message: 'Already approved' });
    }

    const amountPaid = collection.partialPayments[partialIndex].amount;
    
    // Update collection
    collection.partialPayments[partialIndex].status = 'Paid';
    collection.amount += amountPaid;
    collection.pendingBalance = Math.max(0, collection.fullInstallmentAmount - collection.amount);
    collection.status = collection.pendingBalance > 0 ? 'Partially Paid' : 'Paid';
    await collection.save();
    
    // Update invoice
    const invoice = await Invoice.findOne({ invoiceNumber: collection.invoiceNumber });
    if (invoice) {
       invoice.amountPaid += amountPaid;
       invoice.balance = Math.max(0, invoice.totalPayable - invoice.amountPaid);
       invoice.status = invoice.balance > 0 ? 'Partially Paid' : 'Paid';
       // We can record receipt numbers or partial payment notes in remarks
       invoice.remarks = `Last partial payment: ${receiptNo} approved. Total Paid: ₹${invoice.amountPaid}`;
       await invoice.save();
    }

    console.log(`✅ Partial payment approved: ${receiptNo} by ${req.user.userId}`);
    res.json(collection);
  } catch (error) {
    console.error('❌ approve-partial error:', error.message);
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
