const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const donationController = require('../controllers/donation.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// Validation middleware
const validateDonation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom(value => value >= 10).withMessage('Minimum donation amount is KSh 10'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(?:254|\+254|0)?(7[0-9]{8})$/).withMessage('Please provide a valid Kenyan phone number'),
  body('donor')
    .if(body('anonymous').not().equals('true'))
    .notEmpty().withMessage('Donor name is required when not anonymous'),
  body('anonymous')
    .optional()
    .isBoolean().withMessage('Anonymous must be a boolean value'),
  body('campaign')
    .optional()
    .isString().withMessage('Campaign must be a string'),
  body('message')
    .optional()
    .isString().withMessage('Message must be a string')
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
];

// Public routes
router.post('/donate', validateDonation, donationController.createDonation);

// M-Pesa callback route - No authentication required as it's called by M-Pesa
router.post('/mpesa-callback', donationController.mpesaCallback);

// Protected routes - require authentication
router.get('/', authenticate, donationController.getAllDonations);
router.get('/stats', authenticate, isAdmin, donationController.getDonationStats);
router.get('/:id', authenticate, donationController.getDonationById);
router.patch('/:id/status', authenticate, isAdmin, donationController.updateDonationStatus);
router.delete('/:id', authenticate, isAdmin, donationController.deleteDonation);

module.exports = router;