// ─── POST /api/inventory/:id/checkout ───────────────────────────────────────
// Body: { quantity, destination, notes, user }
const checkoutConsumable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { quantity, destination, notes, user } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }
  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive integer.' });
  }
  if (!destination || !user) {
    return res.status(400).json({ error: 'destination and user are required.' });
  }

  try {
    const item = await Consumable.findOne({ where: { id, ...ACTIVE_WHERE } });
    if (!item) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }
    if (item.quantity < parsedQty) {
      return res.status(400).json({ error: `Insufficient stock. Only ${item.quantity} available.` });
    }
    item.quantity -= parsedQty;
    await item.save();

    await logHistory({
      consumableId: item.id,
      actionType: 'Checkout',
      quantityChanged: -parsedQty,
      description: `Destination: ${destination}${notes ? ' | Notes: ' + notes : ''}`,
      performedBy: user,
    });

    return res.json(formatItem(item));
  } catch (err) {
    console.error('[checkoutConsumable]', err);
    return res.status(500).json({ error: 'Failed to checkout consumable.' });
  }
};
const Consumable = require('../models/Consumable');
const InventoryHistory = require('../models/InventoryHistory');

const VALID_CATEGORIES = ['IEM', 'SMAW', 'CSS'];
const ACTIVE_WHERE = { isArchived: false };

/**
 * Strips timestamps and returns only the fields the frontend needs.
 * Guarantees the shape: { id, itemName, category, quantity, unit, reorderLevel }
 */
const formatItem = (instance) => {
  const { id, itemName, category, quantity, unit, reorderLevel } = instance.get({ plain: true });
  return { id, itemName, category, quantity, unit, reorderLevel };
};

const parsePayload = ({ itemName, category, quantity, unit, reorderLevel }) => ({
  itemName: String(itemName).trim(),
  category: String(category).toUpperCase(),
  quantity: quantity !== undefined ? parseInt(quantity, 10) : 0,
  unit: String(unit).trim(),
  reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel, 10) : 10,
});

const logHistory = async ({ consumableId, actionType, quantityChanged, description, performedBy }) => {
  await InventoryHistory.create({
    consumableId,
    actionType,
    quantityChanged,
    description: description || null,
    performedBy: performedBy || 'System',
  });
};

// ─── GET /api/inventory ────────────────────────────────────────────────────────
// Returns { tracks: { iem: [...], smaw: [...], css: [...] } }
// Used by the Dashboard page to show totals and low-stock alerts.
const getInventory = async (req, res) => {
  const queryCategory = req.query.category?.toUpperCase();
  const archivedOnly = String(req.query.archived || '').toLowerCase() === 'true';

  if (queryCategory && !VALID_CATEGORIES.includes(queryCategory)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  try {
    const where = { isArchived: archivedOnly };
    if (queryCategory) {
      where.category = queryCategory;
    }

    const rows = await Consumable.findAll({ where, order: [['itemName', 'ASC']] });

    if (queryCategory) {
      return res.json({ items: rows.map(formatItem) });
    }

    const tracks = { iem: [], smaw: [], css: [] };
    for (const row of rows) {
      const key = row.category.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(tracks, key)) {
        tracks[key].push(formatItem(row));
      }
    }

    return res.json({ tracks });
  } catch (err) {
    console.error('[getInventory]', err);
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
};

// ─── GET /api/inventory/:category ─────────────────────────────────────────────
// Returns { items: [...] }
// Used by the IEM, SMAW, and CSS inventory pages.
// :category is lowercase from the frontend ('iem', 'smaw', 'css').
const getInventoryByCategory = async (req, res) => {
  const upperCategory = req.params.category.toUpperCase();
  const archivedOnly = String(req.query.archived || '').toLowerCase() === 'true';

  if (!VALID_CATEGORIES.includes(upperCategory)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  try {
    const rows = await Consumable.findAll({
      where: { category: upperCategory, isArchived: archivedOnly },
      order: [['itemName', 'ASC']],
    });

    return res.json({ items: rows.map(formatItem) });
  } catch (err) {
    console.error('[getInventoryByCategory]', err);
    return res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
};

// ─── POST /api/inventory ───────────────────────────────────────────────────────
// Body: { itemName, category, quantity?, unit, reorderLevel? }
// Returns the newly created consumable.
const addConsumable = async (req, res) => {
  const { itemName, category, quantity, unit, reorderLevel } = req.body;

  if (!itemName || !category || !unit) {
    return res.status(400).json({ error: 'itemName, category, and unit are required.' });
  }

  const upperCategory = String(category).toUpperCase();
  if (!VALID_CATEGORIES.includes(upperCategory)) {
    return res.status(400).json({
      error: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  try {
    const item = await Consumable.create(parsePayload({
      itemName,
      category: upperCategory,
      quantity,
      unit,
      reorderLevel,
    }));

    await logHistory({
      consumableId: item.id,
      actionType: 'Stock In',
      quantityChanged: item.quantity,
      description: 'Initial stock from new consumable creation.',
      performedBy: req.body.performedBy,
    });

    return res.status(201).json(formatItem(item));
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(' ') });
    }
    console.error('[addConsumable]', err);
    return res.status(500).json({ error: 'Failed to add consumable.' });
  }
};

// ─── PUT /api/inventory/:id ───────────────────────────────────────────────────
// Body: { itemName, category, quantity, unit, reorderLevel }
const updateConsumable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { itemName, category, quantity, unit, reorderLevel } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }

  if (!itemName || !category || !unit) {
    return res.status(400).json({ error: 'itemName, category, and unit are required.' });
  }

  const upperCategory = String(category).toUpperCase();
  if (!VALID_CATEGORIES.includes(upperCategory)) {
    return res.status(400).json({
      error: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    });
  }

  try {
    const item = await Consumable.findOne({ where: { id, ...ACTIVE_WHERE } });
    if (!item) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    const previousQuantity = item.quantity;

    const payload = parsePayload({
      itemName,
      category: upperCategory,
      quantity,
      unit,
      reorderLevel,
    });

    Object.assign(item, payload);
    await item.save();

    const delta = item.quantity - previousQuantity;
    const actionType = delta > 0 ? 'Stock In' : delta < 0 ? 'Stock Out' : 'Update';

    await logHistory({
      consumableId: item.id,
      actionType,
      quantityChanged: delta,
      description: actionType === 'Update' ? 'Item details updated.' : 'Quantity adjusted through item update.',
      performedBy: req.body.performedBy,
    });

    return res.json(formatItem(item));
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(' ') });
    }
    console.error('[updateConsumable]', err);
    return res.status(500).json({ error: 'Failed to update consumable.' });
  }
};

// ─── PATCH /api/inventory/:id/stock ───────────────────────────────────────────
// Body: { type: 'in' | 'out', amount: number }
// Returns the updated consumable.
const updateStock = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { type, amount } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }

  if (!['in', 'out'].includes(type)) {
    return res.status(400).json({ error: "type must be 'in' or 'out'." });
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive integer.' });
  }

  try {
    const item = await Consumable.findOne({ where: { id, ...ACTIVE_WHERE } });
    if (!item) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    const newQuantity =
      type === 'in' ? item.quantity + parsedAmount : item.quantity - parsedAmount;

    if (newQuantity < 0) {
      return res.status(400).json({
        error: `Insufficient stock. Cannot deduct ${parsedAmount} from current quantity of ${item.quantity}.`,
      });
    }

    item.quantity = newQuantity;
    await item.save();

    await logHistory({
      consumableId: item.id,
      actionType: type === 'in' ? 'Stock In' : 'Stock Out',
      quantityChanged: type === 'in' ? parsedAmount : -parsedAmount,
      description: req.body.description || null,
      performedBy: req.body.performedBy,
    });

    return res.json(formatItem(item));
  } catch (err) {
    console.error('[updateStock]', err);
    return res.status(500).json({ error: 'Failed to update stock.' });
  }
};

// ─── PATCH /api/inventory/:id/archive ─────────────────────────────────────────
const archiveItem = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }

  try {
    const item = await Consumable.findOne({ where: { id, ...ACTIVE_WHERE } });
    if (!item) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    item.isArchived = true;
    await item.save();

    await logHistory({
      consumableId: item.id,
      actionType: 'Archive',
      quantityChanged: 0,
      description: 'Item archived from inventory list.',
      performedBy: req.body?.performedBy,
    });

    return res.json({ message: 'Item archived successfully.', id });
  } catch (err) {
    console.error('[archiveItem]', err);
    return res.status(500).json({ error: 'Failed to archive item.' });
  }
};

// ─── PATCH /api/inventory/:id/restore ─────────────────────────────────────────
const restoreItem = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }

  try {
    const item = await Consumable.findOne({ where: { id, isArchived: true } });
    if (!item) {
      return res.status(404).json({ error: 'Archived consumable not found.' });
    }

    item.isArchived = false;
    await item.save();

    await logHistory({
      consumableId: item.id,
      actionType: 'Update',
      quantityChanged: 0,
      description: 'Item restored from archive.',
      performedBy: req.body?.performedBy,
    });

    return res.json({ message: 'Item restored successfully.', id });
  } catch (err) {
    console.error('[restoreItem]', err);
    return res.status(500).json({ error: 'Failed to restore item.' });
  }
};

// ─── DELETE /api/inventory/:id ─────────────────────────────────────────────────
// Returns { message, id } on success.
const deleteItem = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a valid integer.' });
  }

  try {
    const item = await Consumable.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Consumable not found.' });
    }

    await item.destroy();
    return res.json({ message: 'Item deleted successfully.', id });
  } catch (err) {
    console.error('[deleteItem]', err);
    return res.status(500).json({ error: 'Failed to delete item.' });
  }
};

module.exports = {
  getInventory,
  getInventoryByCategory,
  addConsumable,
  updateConsumable,
  updateStock,
  checkoutConsumable,
  archiveItem,
  restoreItem,
  deleteItem,
};
