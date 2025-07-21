const express = require('express');
const router = express.Router();
const Fair = require('../models/Fair');
const Sale = require('../models/Sale');

// GET /api/fairs - Get all fairs
router.get('/', async (req, res) => {
  try {
    const fairs = await Fair.find().sort({ createdAt: -1 });
    res.json(fairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/fairs/end - End current active fair (move before /:id routes)
router.post('/end', async (req, res) => {
  try {
    const activeFair = await Fair.findOneAndUpdate(
      { active: true },
      { active: false },
      { new: true }
    );
    
    if (!activeFair) {
      return res.status(404).json({ error: 'No active fair found' });
    }
    
    res.json({ 
      message: 'Fair ended successfully',
      fair: activeFair
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fairs/active/current - Get currently active fair (move before /:id routes)
router.get('/active/current', async (req, res) => {
  try {
    const activeFair = await Fair.findOne({ active: true });
    res.json(activeFair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fairs/:id - Get single fair
router.get('/:id', async (req, res) => {
  try {
    const fair = await Fair.findById(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    res.json(fair);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/fairs - Create new fair
router.post('/', async (req, res) => {
  try {
    const fair = new Fair(req.body);
    const savedFair = await fair.save();
    res.status(201).json(savedFair);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/fairs/:id - Update fair
router.put('/:id', async (req, res) => {
  try {
    const fair = await Fair.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    res.json(fair);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/fairs/:id - Delete fair
router.delete('/:id', async (req, res) => {
  try {
    const fair = await Fair.findByIdAndDelete(req.params.id);
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    
    // Also delete associated sales
    await Sale.deleteMany({ fairId: req.params.id });
    
    res.json({ message: 'Fair and associated sales deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/fairs/:id/start - Start a fair (make it active)
router.post('/:id/start', async (req, res) => {
  try {
    // First, deactivate all fairs
    await Fair.updateMany({}, { active: false });
    
    // Then activate the selected fair
    const fair = await Fair.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    );
    
    if (!fair) {
      return res.status(404).json({ error: 'Fair not found' });
    }
    
    res.json({ 
      message: 'Fair started successfully',
      fair: fair
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fairs/:id/sales - Get sales for a specific fair
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await Sale.find({ fairId: req.params.id })
      .populate('itemId', 'name category')
      .sort({ saleDate: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fairs/:id/total - Get total sales amount for a fair
router.get('/:id/total', async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $match: { fairId: mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;