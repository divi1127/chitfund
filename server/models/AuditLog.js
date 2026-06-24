import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
