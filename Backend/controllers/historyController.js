const { Op } = require('sequelize');
const InventoryHistory = require('../models/InventoryHistory');
const Consumable = require('../models/Consumable');

const VALID_CATEGORIES = ['EIM', 'SMAW', 'CSS'];

const getHistory = async (req, res) => {
  try {
    const { category, itemId } = req.query;

    let historyWhere = {};

    if (itemId) {
      const parsed = parseInt(itemId, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        historyWhere.consumableId = parsed;
      }
    } else if (category) {
      const upper = category.toUpperCase();
      if (!VALID_CATEGORIES.includes(upper)) {
        return res.status(400).json({ error: 'Invalid category.' });
      }
      const consumablesInCat = await Consumable.findAll({
        where: { category: upper },
        attributes: ['id'],
      });
      const catIds = consumablesInCat.map((c) => c.id);
      if (catIds.length === 0) {
        return res.json({ logs: [] });
      }
      historyWhere.consumableId = { [Op.in]: catIds };
    }

    const historyRows = await InventoryHistory.findAll({
      where: historyWhere,
      order: [['createdAt', 'DESC']],
      limit: 300,
    });

    const ids = [...new Set(historyRows.map((row) => row.consumableId))];
    const consumables = await Consumable.findAll({
      where: { id: ids },
      attributes: ['id', 'itemName', 'unit'],
    });

    const nameMap = consumables.reduce((acc, item) => {
      acc[item.id] = { itemName: item.itemName, unit: item.unit };
      return acc;
    }, {});

    const logs = historyRows.map((row) => {
      const plain = row.get({ plain: true });
      const consumableData = nameMap[plain.consumableId] || { itemName: 'Unknown Item', unit: 'N/A' };
      return {
        id: plain.id,
        consumableId: plain.consumableId,
        itemName: consumableData.itemName,
        unit: consumableData.unit,
        actionType: plain.actionType,
        quantityChanged: plain.quantityChanged,
        beginningInventory: plain.beginningInventory,
        endingInventory: plain.endingInventory,
        description: plain.description || '',
        course: plain.course || '',
        trainer: plain.trainer || '',
        purpose: plain.purpose || '',
        performedBy: plain.performedBy || 'System',
        location: plain.location || 'main',
        createdAt: plain.createdAt,
      };
    });

    return res.json({ logs });
  } catch (err) {
    console.error('[getHistory]', err);
    return res.status(500).json({ error: 'Failed to fetch history logs.' });
  }
};

module.exports = {
  getHistory,
};
