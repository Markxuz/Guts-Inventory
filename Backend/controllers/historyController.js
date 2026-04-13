const { Op } = require('sequelize');
const InventoryHistory = require('../models/InventoryHistory');
const Consumable = require('../models/Consumable');

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

const updateInventoryHistory = async (req, res) => {
  const t = await InventoryHistory.sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantityChanged, description, course, trainer, purpose } = req.body;

    // Validate input
    if (quantityChanged === undefined || quantityChanged === null) {
      return res.status(400).json({ error: 'quantityChanged is required' });
    }

    // Find the record
    const record = await InventoryHistory.findByPk(id, { transaction: t });
    if (!record) {
      await t.rollback();
      return res.status(404).json({ error: 'History record not found' });
    }

    // Calculate the old difference to detect change
    const oldQuantityChanged = record.quantityChanged;
    const quantityDifference = quantityChanged - oldQuantityChanged;

    // Recalculate ending inventory: beginningInventory + Purchase - Consumption
    // quantityChanged = Purchase (positive) or Consumption (negative)
    const newEndingInventory = record.beginningInventory + quantityChanged;

    // Validate ending inventory is not negative
    if (newEndingInventory < 0) {
      await t.rollback();
      return res.status(400).json({ 
        error: 'Consumption cannot exceed beginning inventory plus purchases',
        details: `Beginning Inv: ${record.beginningInventory}, Quantity Changed: ${quantityChanged}`
      });
    }

    // Get the consumable info to find its name for course inventory lookup
    const consumable = await Consumable.findByPk(record.consumableId, { transaction: t });
    if (!consumable) {
      await t.rollback();
      return res.status(404).json({ error: 'Consumable not found' });
    }

    // AUTO-UPDATE: Handle Stock In (Purchase) - update main consumable quantity
    let stockUpdateAmount = 0;
    if (record.actionType === 'Stock In' && quantityDifference !== 0) {
      stockUpdateAmount = quantityDifference;
      
      const newMainQuantity = consumable.quantity + stockUpdateAmount;
      await consumable.update({
        quantity: Math.max(0, newMainQuantity),
        quantityMain: Math.max(0, (consumable.quantityMain || 0) + stockUpdateAmount),
      }, { transaction: t });

      console.log(`[Stock Update] Added ${stockUpdateAmount} units to ${consumable.itemName} main inventory`);
    }

    // AUTO-REPLENISHMENT: If this is a Stock Out (negative quantityChanged) with a change, update course inventory
    let replenishmentAdjustment = 0;
    if (record.actionType === 'Stock Out' && quantityDifference !== 0 && record.course) {
      const courseConsumable = await Consumable.findOne({
        where: {
          itemName: consumable.itemName,
          category: record.course.toUpperCase(),
        },
        transaction: t
      });

      if (courseConsumable) {
        // For Stock Out edits: if consumption changed by X, replenishment adjustment is -X
        // Example 1: consumption -21 → -20 (less consumed), quantityDifference = +1, adjustment = -1 (remove from training)
        // Example 2: consumption -20 → -21 (more consumed), quantityDifference = -1, adjustment = +1 (add to training)
        replenishmentAdjustment = -quantityDifference;
        
        const newQuantity = courseConsumable.quantity + replenishmentAdjustment;
        
        // Update quantity field based on location
        // When editing main (location='main'), we update the training consumable's quantityAnnex
        // When editing annex (location='annex'), we update the main consumable's quantityMain
        const updateData = {
          quantity: Math.max(0, newQuantity),
        };
        
        if (record.location === 'main') {
          // Editing main inventory → update training consumable's quantityAnnex
          updateData.quantityAnnex = Math.max(0, (courseConsumable.quantityAnnex || 0) + replenishmentAdjustment);
        } else {
          // Editing training inventory → update main consumable's quantityMain
          updateData.quantityMain = Math.max(0, (courseConsumable.quantityMain || 0) + replenishmentAdjustment);
        }
        
        await courseConsumable.update(updateData, { transaction: t });

        const direction = replenishmentAdjustment > 0 ? 'Added' : 'Removed';
        const amount = Math.abs(replenishmentAdjustment);
        console.log(`[Auto-Replenishment] ${direction} ${amount} units to/from ${courseConsumable.itemName} (${record.course})`);
      }
    }

    // Update the edited history record
    await record.update({
      quantityChanged: quantityChanged,
      endingInventory: newEndingInventory,
      description: description || record.description,
      course: course || record.course,
      trainer: trainer || record.trainer,
      purpose: purpose || record.purpose,
    }, { transaction: t });

    // CASCADING RECALCULATION: Find all subsequent records for this consumable
    const subsequentRecords = await InventoryHistory.findAll({
      where: {
        consumableId: record.consumableId,
        createdAt: { [Op.gt]: record.createdAt },
        actionType: { [Op.in]: ['Stock In', 'Stock Out'] }, // Only cascade for these types
      },
      order: [['createdAt', 'ASC']],
      transaction: t,
    });

    let cascadeCount = 0;
    let lastEndingInventory = newEndingInventory;

    // Recalculate each subsequent record's beginning and ending inventory
    for (const subRecord of subsequentRecords) {
      const newBeginning = lastEndingInventory;
      const newEnding = newBeginning + subRecord.quantityChanged;

      // Validate that the cascaded ending inventory is not negative
      if (newEnding < 0) {
        await t.rollback();
        return res.status(400).json({
          error: 'Edit creates negative inventory in subsequent transaction',
          details: `Record ID ${subRecord.id} would have ending inventory of ${newEnding}`,
        });
      }

      await subRecord.update({
        beginningInventory: newBeginning,
        endingInventory: newEnding,
      }, { transaction: t });

      lastEndingInventory = newEnding;
      cascadeCount++;
    }

    // Update Consumable.quantity to match the final ending inventory
    await consumable.update({
      quantity: Math.max(0, lastEndingInventory),
      quantityMain: Math.max(0, lastEndingInventory),
    }, { transaction: t });

    console.log(`[Cascade Recalculation] Updated ${cascadeCount} subsequent records. Final quantity: ${lastEndingInventory}`);

    // Commit transaction
    await t.commit();

    // Return updated record with cascade info
    const updated = record.get({ plain: true });
    return res.json({
      success: true,
      message: 'History record updated successfully',
      data: {
        id: updated.id,
        quantityChanged: updated.quantityChanged,
        endingInventory: updated.endingInventory,
        description: updated.description,
        course: updated.course,
        trainer: updated.trainer,
        purpose: updated.purpose,
        stockUpdateAmount: stockUpdateAmount !== 0 ? stockUpdateAmount : Math.abs(quantityDifference),
        replenishmentAdjustment: replenishmentAdjustment,
        cascadeCount: cascadeCount,
        finalQuantity: lastEndingInventory,
        affectedRecordIds: subsequentRecords.map(r => r.id),
      }
    });
  } catch (err) {
    await t.rollback();
    console.error('[updateInventoryHistory]', err);
    return res.status(500).json({ error: 'Failed to update history record.' });
  }
};

module.exports = {
  getHistory,
  updateInventoryHistory,
};
