import mongoose from 'mongoose';

const prizePaymentSchema = new mongoose.Schema({
  voucherNo: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  date: { type: Date },
  method: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'], default: 'Bank Transfer' },
  referenceNo: { type: String, default: '' },
  proof: { type: String, default: '' },
  notes: { type: String, default: '' },
  processedBy: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }
}, { _id: false });

const auctionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conductId: { type: String, default: '' },
  groupId: { type: String, required: true },
  schemeId: { type: String, default: '' },
  date: { type: Date, required: true },
  month: { type: Number, default: 1 },
  installment: { type: Number, required: true },
  bidAmount: { type: Number },
  winnerId: { type: String },
  baseAmount: { type: Number, required: true },
  dividend: { type: Number },
  memberIds: [{ type: String }],
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  prizePayment: { type: prizePaymentSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model('Auction', auctionSchema);
