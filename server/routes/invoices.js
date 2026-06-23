import express from 'express';
import Invoice from '../models/Invoice.js';
import Member from '../models/Member.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateInvoiceNo, generateReceiptNo } from '../utils/idGenerator.js';
import Collection from '../models/Collection.js';

const COMPANY = {
  name: 'HR Chits Enterprises',
  address: '12, Anna Salai, T. Nagar, Chennai – 600 017, Tamil Nadu',
  phone: '+91 44 2815 6789',
  email: 'info@hrchits.com',
  gstin: '33AABCS1234A1ZQ',
  website: 'www.hrchits.com'
};

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Invoices: Fetching all invoices (requested by ${req.user.userId})`);
    
    if (req.user.role === 'user') {
      const invoices = await Invoice.find({ memberId: req.user.userId }).sort({ createdAt: -1 });
      return res.json(invoices);
    }
    
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('❌ Invoices: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
});

router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find({ memberId: req.params.memberId }).sort({ createdAt: -1 });
    console.log(`📋 Invoices: Fetched ${invoices.length} invoices for member ${req.params.memberId}`);
    res.json(invoices);
  } catch (error) {
    console.error('❌ Invoices: Error fetching member invoices:', error.message);
    res.status(500).json({ message: 'Server error fetching member invoices' });
  }
});

router.get('/history/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;
    const invoices = await Invoice.find({ memberId }).sort({ createdAt: -1 });
    const member = await Member.findOne({ memberId });
    const groups = await Group.find();
    const schemes = await Scheme.find();

    const history = invoices.map(inv => {
      const g = groups.find(gr => gr.name === inv.chitGroup);
      const s = schemes.find(sch => sch.name === inv.chitName);
      return {
        ...inv.toObject(),
        group: g,
        scheme: s,
        schemeAmount: s?.amount || 0,
        paidAmount: inv.amountPaid || 0
      };
    });

    console.log(`📋 Invoices: History fetched for ${memberId} - ${history.length} records`);
    res.json({ member, invoices: history });
  } catch (error) {
    console.error('❌ Invoices: Error fetching history:', error.message);
    res.status(500).json({ message: 'Server error fetching invoice history' });
  }
});

router.get('/accounting/:year/:month', authenticate, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const invoices = await Invoice.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const members = await Member.find();
    const groups = await Group.find();
    const schemes = await Scheme.find();

    const accountingData = invoices.map(inv => {
      const member = members.find(m => m.memberId === inv.memberId);
      const group = groups.find(g => g.name === inv.chitGroup);
      const scheme = schemes.find(s => s.name === inv.chitName);
      return {
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        memberName: inv.memberName,
        memberId: inv.memberId,
        group: inv.chitGroup,
        scheme: inv.chitName,
        schemeAmount: scheme?.amount || 0,
        paidAmount: inv.amountPaid || 0,
        status: inv.status,
        paymentMethod: inv.paymentMethod
      };
    });

    const totals = {
      totalSchemeAmount: accountingData.reduce((s, d) => s + d.schemeAmount, 0),
      totalPaidAmount: accountingData.reduce((s, d) => s + d.paidAmount, 0),
      totalInvoices: accountingData.length
    };

    console.log(`📋 Invoices: Accounting data for ${year}-${month}: ${accountingData.length} records, ₹${totals.totalPaidAmount}`);
    res.json({ year, month, data: accountingData, totals });
  } catch (error) {
    console.error('❌ Invoices: Error fetching accounting:', error.message);
    res.status(500).json({ message: 'Server error fetching accounting data' });
  }
});

router.get('/years', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find().select('date').sort({ date: 1 });
    const years = [...new Set(invoices.map(inv => new Date(inv.date).getFullYear()))];
    res.json(years);
  } catch (error) {
    console.error('❌ Invoices: Error fetching years:', error.message);
    res.status(500).json({ message: 'Server error fetching years' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      console.error(`❌ Invoices: Not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('❌ Invoices: Error fetching invoice:', error.message);
    res.status(500).json({ message: 'Server error fetching invoice' });
  }
});

router.post('/', authenticate, authorize('super_admin', 'sub_admin', 'user'), async (req, res) => {
  try {
    const invNo = req.body.invoiceNumber || await generateInvoiceNo();
    const invoiceData = {
      ...req.body,
      invoiceNumber: invNo,
      receiptNumber: req.body.receiptNumber || '',
      date: req.body.date || new Date(),
      time: req.body.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: req.body.qrCodeData || JSON.stringify({
        invoiceNumber: invNo,
        memberId: req.body.memberId,
        paymentDate: new Date().toISOString(),
        amountPaid: req.body.amountPaid,
        verificationUrl: `${req.protocol}://${req.get('host')}/api/invoices/verify/${invNo}`
      }),
      verificationUrl: req.body.verificationUrl || `${req.protocol}://${req.get('host')}/api/invoices/verify/${invNo}`
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    console.log(`✅ Invoices: Created invoice ${invNo} for ${invoiceData.memberName}`);
    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('❌ Invoices: Error creating:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      console.error(`❌ Invoices: Not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Invoice not found' });
    }

    Object.assign(invoice, req.body);
    invoice.updatedAt = Date.now();
    await invoice.save();
    console.log(`✅ Invoices: Updated invoice ${invoice.invoiceNumber}`);
    res.json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    console.error('❌ Invoices: Error updating:', error.message);
    res.status(500).json({ message: 'Server error updating invoice' });
  }
});

router.patch('/:id/approve', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      console.error(`❌ Invoices: Not found for approval - ${req.params.id}`);
      return res.status(404).json({ message: 'Invoice not found' });
    }
    invoice.status = 'Paid';
    invoice.remarks = 'Approved by ' + req.user.userId;
    invoice.updatedAt = Date.now();
    await invoice.save();
    console.log(`✅ Invoices: Approved payment ${invoice.invoiceNumber} by ${req.user.userId}`);

    // Auto-create Collection entry
    const group = await Group.findOne({ name: invoice.chitGroup });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;
    const receiptNo = await generateReceiptNo();
    const collection = new Collection({
      id: 'C' + Date.now().toString().slice(-6),
      memberId: invoice.memberId,
      groupId: group?.id || '',
      amount: invoice.amountPaid || invoice.totalPayable,
      date: new Date(),
      installment: invoice.currentMonth || 1,
      mode: invoice.paymentMethod === 'UPI' || invoice.paymentMethod === 'Bank Transfer' || invoice.paymentMethod === 'Online' ? invoice.paymentMethod : 'Cash',
      status: 'Paid',
      receiptNo: receiptNo,
      cumulativeAmount: invoice.totalPaid || invoice.amountPaid || 0,
      totalSchemeValue: scheme?.amount || invoice.totalChitValue || 0
    });
    await collection.save();
    console.log(`✅ Invoices: Auto-created collection ${receiptNo} for approved invoice ${invoice.invoiceNumber}`);

    res.json({ message: 'Payment approved successfully', invoice });
  } catch (error) {
    console.error('❌ Invoices: Approval error:', error.message);
    res.status(500).json({ message: 'Server error approving payment' });
  }
});

router.patch('/:id/reject', authenticate, authorize('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      console.error(`❌ Invoices: Not found for rejection - ${req.params.id}`);
      return res.status(404).json({ message: 'Invoice not found' });
    }
    invoice.status = 'Rejected';
    invoice.paymentNote = reason || 'Payment rejected by admin';
    invoice.updatedAt = Date.now();
    await invoice.save();
    console.log(`✅ Invoices: Rejected payment ${invoice.invoiceNumber} by ${req.user.userId} - ${reason}`);
    res.json({ message: 'Payment rejected', invoice });
  } catch (error) {
    console.error('❌ Invoices: Rejection error:', error.message);
    res.status(500).json({ message: 'Server error rejecting payment' });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      console.error(`❌ Invoices: Not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Invoice not found' });
    }
    console.log(`✅ Invoices: Deleted invoice ${invoice.invoiceNumber}`);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('❌ Invoices: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting invoice' });
  }
});

router.get('/verify/:invoiceNumber', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ verified: true, invoice });
  } catch (error) {
    console.error('❌ Invoices: Verify error:', error.message);
    res.status(500).json({ message: 'Server error verifying invoice' });
  }
});

router.post('/:id/send-whatsapp', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    console.log(`📱 Invoices: WhatsApp share requested for ${invoice.invoiceNumber}`);
    const message = `🧾 *Payment Receipt - ${COMPANY.name}*\n\nInvoice No: ${invoice.invoiceNumber}\nReceipt No: ${invoice.receiptNumber}\nDate: ${new Date(invoice.date).toLocaleDateString()}\nAmount: ₹${invoice.amountPaid.toLocaleString()}\nPayment Mode: ${invoice.paymentMethod}\n\nThank you for your payment!`;

    console.log('📱 WhatsApp message:', message);
    res.json({ message: 'WhatsApp receipt sent successfully', phoneNumber: invoice.memberMobile });
  } catch (error) {
    console.error('❌ Invoices: WhatsApp error:', error.message);
    res.status(500).json({ message: 'Server error sending WhatsApp' });
  }
});

router.post('/:id/send-email', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    console.log(`📧 Invoices: Email share requested for ${invoice.invoiceNumber}`);
    const subject = `Payment Receipt - ${invoice.invoiceNumber} - ${COMPANY.name}`;
    const body = `Dear ${invoice.memberName},\n\nThank you for your payment.\n\nInvoice: ${invoice.invoiceNumber}\nReceipt: ${invoice.receiptNumber}\nAmount: ₹${invoice.amountPaid.toLocaleString()}\nDate: ${new Date(invoice.date).toLocaleDateString()}\n\nRegards,\n${COMPANY.name}`;

    console.log('📧 Email body:', body);
    res.json({ message: 'Email receipt sent successfully', email: invoice.memberEmail, subject });
  } catch (error) {
    console.error('❌ Invoices: Email error:', error.message);
    res.status(500).json({ message: 'Server error sending email' });
  }
});

export default router;
