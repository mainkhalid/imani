// server/routes/visitation.routes.js
const express = require('express');
const router = express.Router();
const visitationController = require('../controllers/visitation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// Apply authentication to all visitation routes
router.use(authenticate);

// Create new visitation with optional images
router.post(
  '/',
  authorize(['admin', 'user']), // Adjust roles as needed
  uploadMiddleware.array('images', 5),
  visitationController.createVisitation
);

// Get all visitations (with optional filters)
router.get(
  '/',
  authorize(['admin', 'user']),
  visitationController.getVisitations
);

// Get specific visitation by ID
router.get(
  '/:id',
  authorize(['admin', 'user']),
  visitationController.getVisitation
);

// Update visitation
router.put(
  '/:id',
  authorize(['admin', 'user']),
  visitationController.updateVisitation
);

// Delete visitation
router.delete(
  '/:id',
  authorize(['admin']), // Only admin can delete
  visitationController.deleteVisitation
);

// Upload images for visitation (separate endpoint if needed)
router.post(
  '/:id/images',
  authorize(['admin', 'user']),
  uploadMiddleware.array('images', 5),
  visitationController.uploadImages
);

// Get images for visitation
router.get(
  '/:id/images',
  authorize(['admin', 'user']),
  visitationController.getVisitationImages
);

module.exports = router;