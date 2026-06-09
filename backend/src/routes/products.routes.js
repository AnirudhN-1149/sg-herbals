const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/products.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.get('/', ctrl.getAllProducts);
router.get('/:id', ctrl.getProductById);
router.post('/', protect, ctrl.createProduct);
router.put('/:id', protect, ctrl.updateProduct);
router.patch('/:id/toggle', protect, ctrl.toggleProductVisibility);
router.delete('/:id', protect, ctrl.deleteProduct);

module.exports = router;
