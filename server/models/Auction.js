import mongoose from 'mongoose';

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
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

export default mongoose.model('Auction', auctionSchema);
