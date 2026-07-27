import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  memberId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  aadhaar: { type: String, required: true },
  pan: { type: String },
  dob: { type: Date },
  photo: { type: String },
  kycProof: { type: String },
  password: { type: String, required: true },
  joined: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
  groups: [{ type: String }],
  agentId: { type: String },
  modules: [{ type: String }],
  permissions: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
