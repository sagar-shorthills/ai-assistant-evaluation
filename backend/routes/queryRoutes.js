const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Execute query with optional GST calculation
router.post('/query', queryController.executeQueryWithGST);

// Export data in requested format
router.post('/export', queryController.exportData);

// Generate receipt for specific document
router.post('/receipt/:collection/:documentId', queryController.generateReceipt);

module.exports = router;