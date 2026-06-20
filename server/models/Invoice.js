import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  branch: { type: String, required: true },
  collectedBy: { type: String, required: true },
  
  // Member Details
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  memberMobile: { type: String, required: true },
  memberAddress: { type: String },
  memberAadhar: { type: String },
  
  // Chit Details
  chitName: { type: String, required: true },
  chitGroup: { type: String, required: true },
  chitNumber: { type: String, required: true },
  totalChitValue: { type: Number, required: true },
  monthlyAmount: { type: Number, required: true },
  duration: { type: Number, required: true },
  currentMonth: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  
  // Payment Details
  installmentAmount: { type: Number, required: true },
  lateFine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  previousDue: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  balance: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank', 'Cheque', 'Pending'], required: true },
  referenceNumber: { type: String },
  
  // Account Status
  paidInstallments: { type: Number, required: true },
  remainingInstallments: { type: Number, required: true },
  totalPaid: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  
  // Invoice Status
  status: { type: String, enum: ['Paid', 'Partially Paid', 'Due', 'Cancelled', 'Pending'], default: 'Paid' },
  remarks: { type: String },
  
  // Verification
  qrCodeData: { type: String },
  verificationUrl: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invoice', invoiceSchema);
