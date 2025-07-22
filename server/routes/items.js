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
    console.log(`📦 Found ${importItems.length} items marked for import`);
    res.json(importItems);
  } catch (error) {
    console.error('❌ Error fetching import items:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/items/import/clear - Clear all import flags (MOVE BEFORE /:id)
router.post('/import/clear', async (req, res) => {
  try {
    console.log('🧹 Clearing all import flags...');
    const result = await Item.updateMany(
      { nextImport: true },
      { nextImport: false }
    );
    console.log(`✅ Cleared import flags from ${result.modifiedCount} items`);
    res.json({ 
      message: 'Import list cleared successfully',
      clearedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error clearing import flags:', error);
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
    console.log(`✅ Item created: ${savedItem.name}`);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('❌ Error creating item:', error);
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
    console.log(`✅ Item updated: ${item.name}`);
    res.json(item);
  } catch (error) {
    console.error('❌ Error updating item:', error);
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
    console.log(`✅ Item deleted: ${item.name}`);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting item:', error);
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
      console.log(`💰 Sale recorded: ${item.name} for $${item.price} at fair ${fairId}`);
    }
    
    console.log(`🛒 Item sold: ${item.name}, remaining quantity: ${item.quantity}`);
    res.json({ 
      message: 'Item sold successfully',
      item: item,
      remainingQuantity: item.quantity
    });
  } catch (error) {
    console.error('❌ Error selling item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;