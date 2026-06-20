import express from 'express';
import Auction from '../models/Auction.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findOne({ id: req.params.id });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const auction = new Auction(req.body);
    const savedAuction = await auction.save();
    res.status(201).json(savedAuction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const auction = await Auction.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
