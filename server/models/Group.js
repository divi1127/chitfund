import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  schemeId: { type: String, required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  currentInstallment: { type: Number, default: 1 },
  members: [{ type: String }],
  agentId: { type: String },
  maxMembers: { type: Number, default: 10 }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
