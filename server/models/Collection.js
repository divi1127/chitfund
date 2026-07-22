import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  memberId: { type: String, required: true },
  groupId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  installment: { type: Number, required: true },
  mode: { type: String, enum: ['Cash', 'Online', 'Cheque', 'DD', 'UPI', 'Bank Transfer'], required: true },
  status: { type: String, enum: ['Paid', 'Partially Paid', 'Pending'], default: 'Pending' },
  receiptNo: { type: String },
  upiRef: { type: String, default: '' },
  upiProof: { type: String, default: '' },
  cumulativeAmount: { type: Number, default: 0 },
  totalSchemeValue: { type: Number, default: 0 },
  fullInstallmentAmount: { type: Number },
  pendingBalance: { type: Number, default: 0 },
  partialPayments: [{
    amount: { type: Number },
    date: { type: Date },
    mode: { type: String },
    receiptNo: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);
