import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  aadhaarNumber: { type: String },
  panNumber: { type: String },
  aadhaarDoc: { type: String },
  panDoc: { type: String },
  photoDoc: { type: String },
  addressProof: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

kycSchema.index({ memberId: 1 });
kycSchema.index({ status: 1 });

export default mongoose.model('KYC', kycSchema);
