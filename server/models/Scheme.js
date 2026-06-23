import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },
  members: { type: Number, required: true },
  monthlyInstallment: { type: Number, required: true },
  auctionAmount: { type: Number, default: 0 },
  monthlyAmounts: [{
    month: { type: Number, required: true },
    amount: { type: Number, required: true },
    auctionAmount: { type: Number, default: 0 }
  }],
  commission: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Scheme', schemeSchema);
