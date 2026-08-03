import mongoose from 'mongoose';

const landSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  image:       { type: String, default: '' },
  address:     { type: String, required: true },
  amount:      { type: Number, required: true },
  location:    { type: String, required: true },
  area:        { type: String, default: '' },
  type:        { type: String, default: 'Residential Plot' },
  badge:       { type: String, default: 'DTCP Approved' },
  description: { type: String, default: '' },
  phone:       { type: String, default: '' },
  status:      { type: String, enum: ['active', 'sold', 'inactive'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Land', landSchema);
