const express = require('express');
const router = express.Router();

router.use('/products', require('./products.routes'));
router.use('/orders', require('./orders.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/categories', require('./categories.routes'));

module.exports = router;
