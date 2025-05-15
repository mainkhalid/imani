const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const mpesaService = require('../services/mpesa.service');

// Test M-Pesa connection
router.get('/mpesa/test-connection', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Test the connection by attempting to get an access token
    const token = await mpesaService.getAccessToken();
    
    res.json({
      success: true,
      message: 'M-Pesa connection successful',
      token: token ? 'Valid access token received' : 'No token received'
    });
  } catch (error) {
    console.error('Error testing M-Pesa connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to M-Pesa API',
      error: error.message
    });
  }
});

// Register C2B URLs
router.post('/register-urls', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await mpesaService.registerC2BURL();
    res.json({
      message: 'M-Pesa callback URLs registered successfully',
      result
    });
  } catch (error) {
    console.error('Error registering M-Pesa C2B URLs:', error);
    res.status(500).json({
      message: 'Failed to register M-Pesa callback URLs',
      error: error.message
    });
  }
});

// Initiate STK Push
router.post('/stk-push', authenticate, async (req, res) => {
  try {
    const { phone, amount, reference, description } = req.body;
    
    // Validate required fields
    if (!phone || !amount) {
      return res.status(400).json({ message: 'Phone number and amount are required' });
    }
    
    const result = await mpesaService.initiateSTKPush({
      phone,
      amount,
      reference: reference || `DON-${Date.now()}`,
      description: description || 'Donation to Imani Foundation'
    });
    
    res.json({
      message: 'STK push initiated successfully',
      checkoutRequestID: result.CheckoutRequestID,
      responseCode: result.ResponseCode,
      customerMessage: result.CustomerMessage
    });
  } catch (error) {
    console.error('Error initiating STK push:', error);
    res.status(500).json({
      message: 'Failed to initiate STK push',
      error: error.message
    });
  }
});

// Check STK Push status
router.get('/stk-status/:checkoutRequestId', authenticate, async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'Checkout Request ID is required' });
    }
    
    const result = await mpesaService.checkSTKStatus(checkoutRequestId);
    
    res.json({
      message: 'STK status retrieved successfully',
      result
    });
  } catch (error) {
    console.error('Error checking STK status:', error);
    res.status(500).json({
      message: 'Failed to check STK status',
      error: error.message
    });
  }
});

// Callback URL for STK Push
router.post('/callback', async (req, res) => {
  try {
    // Log the callback data
    console.log('M-Pesa Callback Data:', JSON.stringify(req.body));
    
    // Process the callback data as needed
    // This would typically update a donation record in your database
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
});

// Validation URL for C2B
router.post('/validation', (req, res) => {
  console.log('M-Pesa Validation Request:', JSON.stringify(req.body));
  // You can add validation logic here if needed
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Confirmation URL for C2B
router.post('/confirmation', async (req, res) => {
  try {
    console.log('M-Pesa Confirmation Data:', JSON.stringify(req.body));
    
    // Process the confirmation data
    // This would typically create or update a donation record
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Error processing M-Pesa confirmation:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Error processing confirmation' });
  }
});

module.exports = router;