const express = require('express');
// const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin only routes - need both authentication and admin role
// router.get('/', isAdmin, dashboardController.getDashboardData);

module.exports = router;