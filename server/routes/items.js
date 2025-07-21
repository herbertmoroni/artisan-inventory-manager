const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Sale = require('../models/Sale');

// GET /api/items - Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ dateAdded: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/items/import/list - Get items marked for import (MOVE BEFORE /:id)
router.get('/import/list', async (req, res) => {
  try {
    const importItems = await Item.find({ nextImport: true });
    res.json(importItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/items/import/clear - Clear all import flags (MOVE BEFORE /:id)
router.post('/import/clear', async (req, res) => {
  try {
    await Item.updateMany(
      { nextImport: true },
      { nextImport: false }
    );
    res.json({ message: 'Import list cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/items/:id - Get single item (MOVE AFTER specific routes)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/items - Create new item
router.post('/', async (req, res) => {
  try {
    const item = new Item(req.body);
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/items/:id/sell - Sell an item
router.post('/:id/sell', async (req, res) => {
  try {
    const { fairId } = req.body;
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.quantity <= 0) {
      return res.status(400).json({ error: 'Item out of stock' });
    }
    
    // Decrease quantity
    item.quantity -= 1;
    await item.save();
    
    // Create sale record if fairId provided
    if (fairId) {
      const sale = new Sale({
        itemId: item._id,
        fairId: fairId,
        itemName: item.name,
        category: item.category,
        price: item.price
      });
      await sale.save();
    }
    
    res.json({ 
      message: 'Item sold successfully',
      item: item,
      remainingQuantity: item.quantity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;