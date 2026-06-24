import express from 'express';
import Enquiry from '../models/Enquiry.js';

const router = express.Router();

// Get all enquiries
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create enquiry (Public)
router.post('/', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    const savedEnquiry = await enquiry.save();
    res.status(201).json(savedEnquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update enquiry status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete enquiry
router.delete('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
