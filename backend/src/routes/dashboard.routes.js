const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');

const router = express.Router();

router.route('/stats').get(getStats);

module.exports = router;
