import express from 'express';
import Scheme from '../models/Scheme.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ id: req.params.id });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    const savedScheme = await scheme.save();
    res.status(201).json(savedScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json(scheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
