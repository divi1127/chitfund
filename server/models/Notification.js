import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  recipientType: { type: String, enum: ['all', 'super_admin', 'sub_admin', 'user', 'specific'], default: 'all' },
  recipientIds: [{ type: String }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: String }],
  link: { type: String }
});

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ 'recipientIds': 1 });

export default mongoose.model('Notification', notificationSchema);
