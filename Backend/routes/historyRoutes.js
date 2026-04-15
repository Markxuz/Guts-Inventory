const router = require('express').Router();
const { getHistory, updateInventoryHistory, recalculateAndSyncInventory } = require('../controllers/historyController');

router.get('/', getHistory);
router.put('/:id', updateInventoryHistory);
router.post('/:consumableId/recalculate', recalculateAndSyncInventory);

module.exports = router;
