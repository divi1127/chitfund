import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  manager: { type: String, required: true },
  phone: { type: String, required: true },
  groups: { type: Number, default: 0 },
  members: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
