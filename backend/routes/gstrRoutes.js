const express = require('express');
const router = express.Router();
const gstrController = require('../controllers/gstrController');

/**
 * @route   POST /api/report/gstr3b
 * @desc    Generate GSTR-3B report for a specific company, year, and month
 * @access  Public
 */
router.post('/gstr3b', gstrController.generateGstr3bReport);

module.exports = router;