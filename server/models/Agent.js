import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  dob: { type: Date },
  aadhaar: { type: String, required: true },
  pan: { type: String },
  photo: { type: String },
  password: { type: String, required: true },
  joined: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  assignedGroups: [{ type: String }],
  customers: [{ type: String }],
  commissionRate: { type: Number, default: 1 },
  totalCommission: { type: Number, default: 0 },
  modules: [{ type: String }],
  permissions: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Agent', agentSchema);
