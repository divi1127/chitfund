import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  category: { type: String, enum: ['general', 'payment', 'commission', 'penalty', 'notification', 'kyc'], default: 'general' },
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('PlatformSettings', platformSettingsSchema);
