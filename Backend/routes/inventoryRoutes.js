const router = require('express').Router();
const {
  getInventory,
  getInventoryByCategory,
  addConsumable,
  updateConsumable,
  updateStock,
  checkoutConsumable,
  archiveItem,
  restoreItem,
  deleteItem,
} = require('../controllers/inventoryController');
// Checkout a consumable (deducts stock, logs destination, notes, user)
// POST /api/inventory/:id/checkout
router.post('/:id/checkout', checkoutConsumable);

// ┌──────────────────────────────────────────────────────────┐
// │  Base path: /api/inventory  (mounted in server.js)       │
// └──────────────────────────────────────────────────────────┘

// Dashboard: all tracks grouped  →  { tracks: { iem, smaw, css } }
router.get('/', getInventory);

// Single track: items for a category  →  { items: [...] }
// :category is lowercase from the frontend ('iem', 'smaw', 'css')
router.get('/:category', getInventoryByCategory);

// Create a new consumable
router.post('/', addConsumable);

// Update an existing consumable
router.put('/:id', updateConsumable);

// Archive an item (soft delete)
router.patch('/:id/archive', archiveItem);

// Restore an archived item
router.patch('/:id/restore', restoreItem);

// Stock-in / stock-out for a specific item
// Body: { type: 'in' | 'out', amount: number }
router.patch('/:id/stock', updateStock);

// Remove an item
router.delete('/:id', deleteItem);

module.exports = router;
