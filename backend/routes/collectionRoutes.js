const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// Get all collections
router.get('/collections', collectionController.getAllCollections);

// Get fields from a collection
router.get('/fields', collectionController.getFields);

module.exports = router;