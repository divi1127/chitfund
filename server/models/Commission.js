import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  agentName: { type: String, required: true },
  groupId: { type: String, required: true },
  groupName: { type: String },
  schemeId: { type: String },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalCollection: { type: Number, required: true },
  commissionRate: { type: Number, default: 1 },
  commissionAmount: { type: Number, required: true },
  status: { type: String, enum: ['Calculated', 'Paid', 'Pending'], default: 'Calculated' },
  paidDate: { type: Date },
  calculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

commissionSchema.index({ agentId: 1, groupId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Commission', commissionSchema);
