import express from 'express';
import Invoice from '../models/Invoice.js';
import Collection from '../models/Collection.js';
import Member from '../models/Member.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/years', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find().select('date').sort({ date: 1 });
    const invoiceYears = [...new Set(invoices.map(inv => new Date(inv.date).getFullYear()))];

    const collections = await Collection.find().select('date').sort({ date: 1 });
    const collectionYears = [...new Set(collections.map(c => new Date(c.date).getFullYear()))];

    const years = [...new Set([...invoiceYears, ...collectionYears])].sort();
    console.log(`📋 Accounting: Available years - ${years.join(', ')}`);
    res.json(years);
  } catch (error) {
    console.error('❌ Accounting: Error fetching years:', error.message);
    res.status(500).json({ message: 'Server error fetching years' });
  }
});

router.get('/months/:year', authenticate, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const invoices = await Invoice.find({
      date: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    }).select('date');

    const months = [...new Set(invoices.map(inv => new Date(inv.date).getMonth() + 1))].sort();
    console.log(`📋 Accounting: Available months for ${year} - ${months.join(', ')}`);
    res.json(months);
  } catch (error) {
    console.error('❌ Accounting: Error fetching months:', error.message);
    res.status(500).json({ message: 'Server error fetching months' });
  }
});

router.get('/:year/:month', authenticate, async (req, res) => {
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

    const data = invoices.map(inv => {
      const member = members.find(m => m.memberId === inv.memberId);
      const group = groups.find(g => g.name === inv.chitGroup);
      const scheme = schemes.find(s => s.name === inv.chitName);
      return {
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        memberName: inv.memberName,
        memberId: inv.memberId,
        phone: member?.phone || inv.memberMobile || '',
        group: inv.chitGroup,
        groupId: group?.id || '',
        scheme: inv.chitName,
        schemeAmount: scheme?.amount || 0,
        paidAmount: inv.amountPaid || 0,
        status: inv.status,
        paymentMethod: inv.paymentMethod
      };
    });

    const totals = {
      totalSchemeAmount: data.reduce((s, d) => s + d.schemeAmount, 0),
      totalPaidAmount: data.reduce((s, d) => s + d.paidAmount, 0),
      totalMembers: data.length
    };

    console.log(`📋 Accounting: Data for ${year}-${month}: ${data.length} records, ₹${totals.totalPaidAmount}`);
    res.json({ year: parseInt(year), month: parseInt(month), data, totals });
  } catch (error) {
    console.error('❌ Accounting: Error fetching data:', error.message);
    res.status(500).json({ message: 'Server error fetching accounting data' });
  }
});

router.get('/summary/:year', authenticate, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const invoices = await Invoice.find({
        date: { $gte: startDate, $lte: endDate }
      });

      const totalPaid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
      monthlyData.push({ month, totalPaid, totalInvoices: invoices.length });
    }

    const yearTotal = monthlyData.reduce((s, m) => s + m.totalPaid, 0);
    console.log(`📋 Accounting: Year summary for ${year}: ₹${yearTotal}`);
    res.json({ year, monthlyData, yearTotal });
  } catch (error) {
    console.error('❌ Accounting: Error fetching year summary:', error.message);
    res.status(500).json({ message: 'Server error fetching year summary' });
  }
});

export default router;
