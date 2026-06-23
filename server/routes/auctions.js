import express from 'express';
import Auction from '../models/Auction.js';
import Group from '../models/Group.js';
import Scheme from '../models/Scheme.js';
import Member from '../models/Member.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateAuctionConductId } from '../utils/idGenerator.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    console.log(`📋 Auctions: Fetching all auctions (requested by ${req.user.userId})`);
    const auctions = await Auction.find();
    const groups = await Group.find();
    const schemes = await Scheme.find();

    const auctionsWithDetails = auctions.map(a => {
      const g = groups.find(gr => gr.id === a.groupId);
      const s = schemes.find(sch => sch.id === (a.schemeId || g?.schemeId));
      return {
        ...a.toObject(),
        groupName: g?.name || '',
        schemeName: s?.name || '',
        schemeAmount: s?.amount || 0,
        monthlyInstallment: s?.monthlyInstallment || 0,
        totalInstallments: s?.duration || 0
      };
    });

    res.json(auctionsWithDetails);
  } catch (error) {
    console.error('❌ Auctions: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching auctions' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const auction = await Auction.findOne({ id: req.params.id });
    if (!auction) {
      console.error(`❌ Auctions: Not found - ${req.params.id}`);
      return res.status(404).json({ message: 'Auction not found' });
    }
    res.json(auction);
  } catch (error) {
    console.error('❌ Auctions: Error fetching:', error.message);
    res.status(500).json({ message: 'Server error fetching auction' });
  }
});

router.get('/group/:groupId', authenticate, async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findOne({ id: groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;
    const members = group ? await Member.find({ id: { $in: group.members || [] } }) : [];

    console.log(`📋 Auctions: Fetched group ${groupId} details for auction setup`);
    res.json({
      group,
      scheme,
      members,
      auctionAmount: scheme?.auctionAmount || scheme?.amount || 0,
      totalInstallments: scheme?.duration || 0
    });
  } catch (error) {
    console.error('❌ Auctions: Error fetching group details:', error.message);
    res.status(500).json({ message: 'Server error fetching group details' });
  }
});

router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const data = { ...req.body };
    const conductId = await generateAuctionConductId();

    const group = await Group.findOne({ id: data.groupId });
    const scheme = group ? await Scheme.findOne({ id: group.schemeId }) : null;

    const auctionData = {
      ...data,
      id: data.id || conductId,
      conductId: conductId,
      schemeId: scheme?.id || data.schemeId || '',
      baseAmount: Number(data.baseAmount),
      installment: Number(data.installment),
      memberIds: group?.members || [],
      status: 'Scheduled'
    };

    const auction = new Auction(auctionData);
    const savedAuction = await auction.save();
    console.log(`✅ Auctions: Created auction ${conductId} for group ${data.groupId}`);
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error('❌ Auctions: Error creating:', error.message);
    res.status(400).json({ message: 'Error creating auction: ' + error.message });
  }
});

router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const existing = await Auction.findOne({ id: req.params.id });
    if (!existing) {
      console.error(`❌ Auctions: Not found for update - ${req.params.id}`);
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (req.body.status === 'Completed' && !existing.conductId) {
      const conductId = await generateAuctionConductId();
      req.body.conductId = conductId;
    }

    const auction = await Auction.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    console.log(`✅ Auctions: Updated auction ${existing.id} - status: ${auction.status}`);
    res.json(auction);
  } catch (error) {
    console.error('❌ Auctions: Error updating:', error.message);
    res.status(400).json({ message: 'Error updating auction: ' + error.message });
  }
});

router.delete('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const auction = await Auction.findOneAndDelete({ id: req.params.id });
    if (!auction) {
      console.error(`❌ Auctions: Not found for delete - ${req.params.id}`);
      return res.status(404).json({ message: 'Auction not found' });
    }
    console.log(`✅ Auctions: Deleted auction ${auction.id}`);
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('❌ Auctions: Error deleting:', error.message);
    res.status(500).json({ message: 'Server error deleting auction' });
  }
});

export default router;
