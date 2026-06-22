import express from 'express';
import KYC from '../models/KYC.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'user') {
      if (!req.user.userId) return res.json([]);
      filter.memberId = req.user.userId;
    }
    if (req.user.role === 'sub_admin' && req.user.branch) {
      filter.branch = req.user.branch;
    }
    const kycRecords = await KYC.find(filter).sort({ submittedAt: -1 });
    res.json(kycRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: 'KYC record not found' });
    if (req.user.role === 'user' && kyc.memberId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { memberId, memberName, aadhaarNumber, panNumber, aadhaarDoc, panDoc, photoDoc, addressProof } = req.body;
    if (!memberId || !memberName) {
      return res.status(400).json({ message: 'Member ID and name are required' });
    }
    const existing = await KYC.findOne({ memberId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'A pending KYC application already exists for this member' });
    }
    const kyc = new KYC({ memberId, memberName, aadhaarNumber, panNumber, aadhaarDoc, panDoc, photoDoc, addressProof });
    await kyc.save();
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action: 'KYC_SUBMIT', resource: 'KYC', resourceId: kyc._id, details: { memberId }, ipAddress: req.ip });
    res.status(201).json(kyc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/review', authenticateToken, requireRole('super_admin', 'sub_admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: 'KYC record not found' });
    if (kyc.status !== 'pending') {
      return res.status(400).json({ message: 'KYC has already been reviewed' });
    }
    kyc.status = status;
    kyc.reviewedBy = req.user.userId;
    kyc.reviewedAt = new Date();
    kyc.updatedAt = new Date();
    if (status === 'rejected' && rejectionReason) {
      kyc.rejectionReason = rejectionReason;
    }
    await kyc.save();
    const action = status === 'approved' ? 'KYC_APPROVE' : 'KYC_REJECT';
    await logAudit({ userId: req.user.userId, userName: req.user.name, userRole: req.user.role, action, resource: 'KYC', resourceId: kyc._id, details: { memberId: kyc.memberId, status }, ipAddress: req.ip });
    res.json(kyc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/stats/summary', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const total = await KYC.countDocuments();
    const pending = await KYC.countDocuments({ status: 'pending' });
    const approved = await KYC.countDocuments({ status: 'approved' });
    const rejected = await KYC.countDocuments({ status: 'rejected' });
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
