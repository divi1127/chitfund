import express from 'express';
import Invoice from '../models/Invoice.js';

const COMPANY = {
  name: 'Chit Fund Management',
  address: '123 Business Street, Madurai',
  phone: '+91 9876543210',
  email: 'info@chitfund.com',
  gstin: '33AAAAA0000A1Z5',
  website: 'www.chitfund.com'
};

const router = express.Router();

// Generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${random}`;
};

// Generate receipt number
const generateReceiptNumber = () => {
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `RCPT-${random}`;
};

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get invoices by member ID
router.get('/member/:memberId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ memberId: req.params.memberId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching member invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    console.log(`Received status: '${req.body.status}' (Length: ${req.body.status?.length})`);
    const invNo = req.body.invoiceNumber || generateInvoiceNumber();
    const invoiceData = {
      ...req.body,
      invoiceNumber: invNo,
      receiptNumber: req.body.receiptNumber || generateReceiptNumber(),
      date: req.body.date || new Date(),
      time: req.body.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: req.body.qrCodeData || JSON.stringify({
        invoiceNumber: invNo,
        memberId: req.body.memberId,
        paymentDate: new Date().toISOString(),
        amountPaid: req.body.amountPaid,
        verificationUrl: `http://localhost:5000/api/invoices/verify/${invNo}`
      }),
      verificationUrl: req.body.verificationUrl || `http://localhost:5000/api/invoices/verify/${invNo}`
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    import('fs').then(fs => fs.writeFileSync('error_log.txt', String(error.message) + '\\n' + String(error.stack)));
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    Object.assign(invoice, req.body);
    invoice.updatedAt = Date.now();
    await invoice.save();
    res.json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify invoice
router.get('/verify/:invoiceNumber', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ verified: true, invoice });
  } catch (error) {
    console.error('Error verifying invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily collection report
router.get('/reports/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const invoices = await Invoice.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const total = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const cash = invoices.filter(inv => inv.paymentMethod === 'Cash').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const upi = invoices.filter(inv => inv.paymentMethod === 'UPI').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const bank = invoices.filter(inv => inv.paymentMethod === 'Bank').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const cheque = invoices.filter(inv => inv.paymentMethod === 'Cheque').reduce((sum, inv) => sum + inv.amountPaid, 0);

    res.json({
      date: today,
      totalInvoices: invoices.length,
      totalAmount: total,
      paymentMethods: { cash, upi, bank, cheque },
      invoices
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly collection report
router.get('/reports/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const invoices = await Invoice.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const total = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const fine = invoices.reduce((sum, inv) => sum + inv.lateFine, 0);

    res.json({
      year,
      month,
      totalInvoices: invoices.length,
      totalAmount: total,
      totalFine: fine,
      invoices
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send WhatsApp receipt
router.post('/:id/send-whatsapp', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // In production, integrate with WhatsApp Business API
    // For now, just return success
    const whatsappMessage = `
🧾 *Payment Receipt - ${COMPANY.name}*

Invoice No: ${invoice.invoiceNumber}
Receipt No: ${invoice.receiptNumber}
Date: ${new Date(invoice.date).toLocaleDateString()}
Amount: ₹${invoice.amountPaid.toLocaleString()}
Payment Mode: ${invoice.paymentMethod}

Thank you for your payment!
    `.trim();

    console.log('WhatsApp message to send:', whatsappMessage);
    
    res.json({ 
      message: 'WhatsApp receipt sent successfully',
      phoneNumber: invoice.memberMobile,
      message: whatsappMessage
    });
  } catch (error) {
    console.error('Error sending WhatsApp receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Email receipt
router.post('/:id/send-email', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // In production, integrate with email service like Nodemailer
    // For now, just return success
    const emailSubject = `Payment Receipt - ${invoice.invoiceNumber} - ${COMPANY.name}`;
    const emailBody = `
Dear ${invoice.memberName},

Thank you for your payment. Here are your payment details:

Invoice Number: ${invoice.invoiceNumber}
Receipt Number: ${invoice.receiptNumber}
Date: ${new Date(invoice.date).toLocaleDateString()}
Amount: ₹${invoice.amountPaid.toLocaleString()}
Payment Mode: ${invoice.paymentMethod}

If you have any questions, please contact us at ${COMPANY.email}.

Best regards,
${COMPANY.name}
    `.trim();

    console.log('Email to send:', { to: invoice.memberEmail, subject: emailSubject, body: emailBody });
    
    res.json({ 
      message: 'Email receipt sent successfully',
      email: invoice.memberEmail,
      subject: emailSubject
    });
  } catch (error) {
    console.error('Error sending email receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
