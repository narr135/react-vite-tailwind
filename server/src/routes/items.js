const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');
const { requireAuth } = require('../middlewares/authMiddleware');

/**
 * GET /api/items
 * Query params: page, limit, q
 */
router.get('/', itemsController.getItems);

/**
 * GET /api/items/:id
 */
router.get('/:id', itemsController.getItemById);

/**
 * POST /api/items
 * Protected
 * body: { title, description, price, imageUrl, tags }
 */
router.post('/', requireAuth, itemsController.createItem);

module.exports = router;