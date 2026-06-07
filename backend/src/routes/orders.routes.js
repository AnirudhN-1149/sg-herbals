const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orders.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', ctrl.createOrder);          // Public: customer places order
router.get('/', protect, ctrl.getAllOrders); // Admin only
router.get('/:id', protect, ctrl.getOrderById);
router.patch('/:id/status', protect, ctrl.updateOrderStatus);
router.delete('/:id', protect, ctrl.deleteOrder);

module.exports = router;
