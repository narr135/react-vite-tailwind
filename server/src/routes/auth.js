const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/register
 * body: { name, email, password }
 */
router.post('/register', [
  body('name').optional().isString().trim().isLength({ min: 1 }).withMessage('Name must not be empty'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required')
], authController.login);

module.exports = router;