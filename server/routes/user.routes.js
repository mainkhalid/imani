const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin only routes - need both authentication and admin role
router.get('/', isAdmin, userController.getAllUsers);
router.get('/:id', isAdmin, userController.getUserById);

router.post(
  '/',
  isAdmin,
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .trim(),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  ],
  userController.createUser
);

router.put(
  '/:id',
  isAdmin,
  [
    body('username')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .trim(),
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
  ],
  userController.updateUser
);

router.delete('/:id', isAdmin, userController.deleteUser);
router.patch('/:id/toggle-status', isAdmin, userController.toggleUserStatus);

module.exports = router;