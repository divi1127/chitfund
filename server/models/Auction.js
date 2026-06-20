import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  groupId: { type: String, required: true },
  date: { type: Date, required: true },
  installment: { type: Number, required: true },
  bidAmount: { type: Number },
  winnerId: { type: String },
  baseAmount: { type: Number, required: true },
  dividend: { type: Number },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

export default mongoose.model('Auction', auctionSchema);
