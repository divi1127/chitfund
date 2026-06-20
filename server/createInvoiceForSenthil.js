import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Member from './models/Member.js';
import Invoice from './models/Invoice.js';

dotenv.config();

const createInvoiceForSenthil = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find member Senthil
    const member = await Member.findOne({ email: 'senthill25@gmail.com' });
    if (!member) {
      console.log('Member not found');
      process.exit(1);
    }

    console.log('Member found:', member.memberId, member.name);

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ memberId: member.memberId, status: 'Due' });
    if (existingInvoice) {
      console.log('Invoice already exists:', existingInvoice.invoiceNumber);
      console.log('Due Date:', existingInvoice.dueDate);
      console.log('Amount:', existingInvoice.totalPayable);
      process.exit(0);
    }

    // Generate invoice number
    const invoiceNumber = `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    // Set due date to 5th of next month
    const dueDate = new Date();
    dueDate.setDate(5);
    dueDate.setMonth(dueDate.getMonth() + 1);

    // Create invoice with correct monthly installment (₹2,000 for Silver Chit – 50K)
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      receiptNumber: `RCP-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      branch: "Madurai Branch",
      collectedBy: "System",
      memberId: member.memberId,
      memberName: member.name,
      memberMobile: member.phone,
      memberAddress: member.address,
      memberAadhar: member.aadhaar,
      chitName: "Silver Chit – 50K",
      chitGroup: "Beta",
      chitNumber: "CHIT-50K-001",
      totalChitValue: 50000,
      monthlyAmount: 2000,
      duration: 25,
      currentMonth: 3,
      dueDate: dueDate,
      installmentAmount: 2000,
      lateFine: 0,
      discount: 0,
      previousDue: 0,
      totalPayable: 2000,
      amountPaid: 0,
      balance: 2000,
      paymentMethod: 'Pending',
      referenceNumber: '',
      paidInstallments: 2,
      remainingInstallments: 23,
      totalPaid: 4000,
      remainingAmount: 46000,
      status: 'Due',
      remarks: 'Monthly installment due',
      date: new Date(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      qrCodeData: JSON.stringify({
        invoiceNumber: invoiceNumber,
        memberId: member.memberId,
        paymentDate: new Date().toISOString(),
        amountPaid: 2000,
        verificationUrl: `http://localhost:5000/api/invoices/verify/${invoiceNumber}`
      }),
      verificationUrl: `http://localhost:5000/api/invoices/verify/${invoiceNumber}`
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    console.log('Invoice created successfully');
    console.log('Invoice Number:', invoice.invoiceNumber);
    console.log('Due Date:', invoice.dueDate.toLocaleDateString());
    console.log('Amount Due:', invoice.totalPayable);
    console.log('Status:', invoice.status);

    process.exit(0);
  } catch (error) {
    console.error('Error creating invoice:', error);
    process.exit(1);
  }
};

createInvoiceForSenthil();
