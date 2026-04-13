const router = require('express').Router();
const { getHistory, updateInventoryHistory } = require('../controllers/historyController');

router.get('/', getHistory);
router.put('/:id', updateInventoryHistory);

module.exports = router;
