const express = require('express');
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, bulkUpdateInventory } = require('../controllers/inventory.controller');

const router = express.Router();

router.route('/')
  .get(getInventory)
  .post(createInventoryItem)
  .put(bulkUpdateInventory); // Bulk update for the admin UI save button

router.route('/:id')
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

module.exports = router;
