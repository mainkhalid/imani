// server/routes/settings.routes.js
const express = require('express');
const router = express.Router();
const { Settings } = require('../models/settings.model');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const mpesaService = require('../services/mpesa.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

// Get General settings
router.get('/general', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'general' });
    
    if (!settings) {
      // Return default settings
      return res.json({
        siteName: process.env.SITE_NAME || 'Imani Foundation',
        siteDescription: process.env.SITE_DESCRIPTION || '',
        contactEmail: process.env.CONTACT_EMAIL || '',
        contactPhone: process.env.CONTACT_PHONE || ''
      });
    }
    
    // Return settings from database
    return res.json({
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      contactEmail: settings.contactEmail || '',
      contactPhone: settings.contactPhone || ''
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({ message: 'Failed to fetch general settings' });
  }
});

// Update General settings
router.post('/general', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { siteName, siteDescription, contactEmail, contactPhone } = req.body;
    
    // Validate required fields
    if (!siteName) {
      return res.status(400).json({ message: 'Site name is required' });
    }
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'general' },
      {
        type: 'general',
        siteName,
        siteDescription,
        contactEmail,
        contactPhone,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'General settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({ message: 'Failed to update general settings' });
  }
});

// Get M-Pesa settings
router.get('/mpesa', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'mpesa' });
    
    if (!settings) {
      // Return default settings from environment variables
      return res.json({
        baseUrl: process.env.MPESA_API_URL || '',
        shortcode: process.env.MPESA_SHORTCODE || '',
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        passKey: process.env.MPESA_PASSKEY || '',
        callbackUrl: process.env.MPESA_CALLBACK_URL || '',
        initiatorName: process.env.MPESA_INITIATOR_NAME || '',
        securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || ''
      });
    }
    
    // Return settings from database
    return res.json({
      baseUrl: settings.baseUrl || '',
      shortcode: settings.shortcode || '',
      consumerKey: settings.consumerKey || '',
      consumerSecret: settings.consumerSecret || '',
      passKey: settings.passKey || '',
      callbackUrl: settings.callbackUrl || '',
      initiatorName: settings.initiatorName || '',
      securityCredential: settings.securityCredential || ''
    });
  } catch (error) {
    console.error('Error fetching M-Pesa settings:', error);
    res.status(500).json({ message: 'Failed to fetch M-Pesa settings' });
  }
});

// Update M-Pesa settings
router.post('/mpesa', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { 
      baseUrl, 
      shortcode, 
      consumerKey, 
      consumerSecret, 
      passKey,
      callbackUrl,
      initiatorName,
      securityCredential
    } = req.body;
    
    // Validate required fields
    if (!baseUrl || !shortcode || !consumerKey || !consumerSecret) {
      return res.status(400).json({ message: 'Missing required M-Pesa configuration fields' });
    }
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'mpesa' },
      {
        type: 'mpesa',
        baseUrl,
        shortcode,
        consumerKey,
        consumerSecret,
        passKey,
        callbackUrl,
        initiatorName,
        securityCredential,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'M-Pesa settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating M-Pesa settings:', error);
    res.status(500).json({ message: 'Failed to update M-Pesa settings' });
  }
});

// Test M-Pesa connection
router.post('/mpesa/test-connection', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Test connection to M-Pesa API by generating an access token
    const result = await mpesaService.testConnection();
    
    res.json({ 
      message: 'M-Pesa connection test successful', 
      accessToken: result.access_token,
      expiresIn: result.expires_in
    });
  } catch (error) {
    console.error('Error testing M-Pesa connection:', error);
    res.status(500).json({ message: 'Failed to connect to M-Pesa API', error: error.message });
  }
});

// Register M-Pesa C2B URLs
router.post('/mpesa/register-urls', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await mpesaService.registerC2BUrls();
    
    res.json({ 
      message: 'M-Pesa C2B URLs registered successfully', 
      result 
    });
  } catch (error) {
    console.error('Error registering C2B URLs:', error);
    res.status(500).json({ message: 'Failed to register C2B URLs', error: error.message });
  }
});

// Get Email settings
router.get('/email', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'email' });
    
    if (!settings) {
      // Return default settings from environment variables
      return res.json({
        emailHost: process.env.EMAIL_HOST || '',
        emailPort: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : '',
        emailUser: process.env.EMAIL_USER || '',
        emailPass: process.env.EMAIL_PASS || '',
        emailFrom: process.env.EMAIL_FROM || ''
      });
    }
    
    // Return settings from database
    return res.json({
      emailHost: settings.emailHost || '',
      emailPort: settings.emailPort || '',
      emailUser: settings.emailUser || '',
      emailPass: settings.emailPass || '',
      emailFrom: settings.emailFrom || ''
    });
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({ message: 'Failed to fetch email settings' });
  }
});

// Update Email settings
router.post('/email', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { emailHost, emailPort, emailUser, emailPass, emailFrom } = req.body;
    
    // Validate required fields
    if (!emailHost || !emailPort || !emailUser || !emailFrom) {
      return res.status(400).json({ message: 'Missing required email configuration fields' });
    }
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'email' },
      {
        type: 'email',
        emailHost,
        emailPort,
        emailUser,
        emailPass,
        emailFrom,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Email settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({ message: 'Failed to update email settings' });
  }
});


router.post('/email/test', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Get the email settings first
    const settings = await Settings.findOne({ type: 'email' });
    
    if (!settings) {
      return res.status(400).json({ message: 'Email settings not configured' });
    }
    
    // Check if email settings are complete
    if (!settings.emailHost || !settings.emailPort || !settings.emailUser || !settings.emailFrom) {
      return res.status(400).json({ message: 'Incomplete email configuration' });
    }
    
    // Send test email using the settings
    const result = await emailService.sendTestEmail(settings);
    
    res.json({ 
      message: 'Test email sent successfully', 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message 
    });
  }
});

// Also fix the email notifications GET endpoint to match email service expectations
router.get('/email-notifications', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'email-notifications' });
    
    if (!settings) {
      // Return default notification settings
      return res.json({
        receiveDonationNotifications: true,
        receiveMonthlyReports: true,
        customSettings: {
          receiveDonationNotifications: true,
          receiveMonthlyReports: true
        }
      });
    }
    
    // Return settings from database with both formats for compatibility
    return res.json({
      receiveDonationNotifications: settings.receiveDonationNotifications !== undefined ? 
        settings.receiveDonationNotifications : true,
      receiveMonthlyReports: settings.receiveMonthlyReports !== undefined ? 
        settings.receiveMonthlyReports : true,
      customSettings: {
        receiveDonationNotifications: settings.receiveDonationNotifications !== undefined ? 
          settings.receiveDonationNotifications : true,
        receiveMonthlyReports: settings.receiveMonthlyReports !== undefined ? 
          settings.receiveMonthlyReports : true
      }
    });
  } catch (error) {
    console.error('Error fetching email notification settings:', error);
    res.status(500).json({ message: 'Failed to fetch email notification settings' });
  }
});

// Update email notification settings
router.post('/email-notifications', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { receiveDonationNotifications, receiveMonthlyReports } = req.body;
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'email-notifications' },
      {
        type: 'email-notifications',
        receiveDonationNotifications,
        receiveMonthlyReports,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Email notification preferences updated successfully', settings });
  } catch (error) {
    console.error('Error updating email notification settings:', error);
    res.status(500).json({ message: 'Failed to update email notification settings' });
  }
});

// Get SMS settings
router.get('/sms', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'sms' });
    
    if (!settings) {
      // Return default settings from environment variables
      return res.json({
        smsApiKey: process.env.SMS_API_KEY || '',
        smsApiUrl: process.env.SMS_API_URL || '',
        smsSenderId: process.env.SMS_SENDER_ID || ''
      });
    }
    
    // Return settings from database
    return res.json({
      smsApiKey: settings.smsApiKey || '',
      smsApiUrl: settings.smsApiUrl || '',
      smsSenderId: settings.smsSenderId || ''
    });
  } catch (error) {
    console.error('Error fetching SMS settings:', error);
    res.status(500).json({ message: 'Failed to fetch SMS settings' });
  }
});

// Update SMS settings
router.post('/sms', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { smsApiKey, smsApiUrl, smsSenderId } = req.body;
    
    // Validate required fields
    if (!smsApiKey || !smsApiUrl) {
      return res.status(400).json({ message: 'SMS API key and URL are required' });
    }
    
    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type: 'sms' },
      {
        type: 'sms',
        smsApiKey,
        smsApiUrl,
        smsSenderId,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'SMS settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating SMS settings:', error);
    res.status(500).json({ message: 'Failed to update SMS settings' });
  }
});

router.post('/sms/test', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Get admin phone number from user object or request body
    const phoneNumber = req.body.phoneNumber || req.user.phone;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required. Please provide it in the request or update your profile.' });
    }
    
    // Get SMS settings
    const settings = await Settings.findOne({ type: 'sms' });
    
    if (!settings || !settings.smsApiKey || !settings.smsApiUrl) {
      return res.status(400).json({ message: 'SMS settings are not properly configured' });
    }
    
    // Send test SMS
    const result = await smsService.sendTestSms(phoneNumber);
    
    res.json({ 
      message: 'Test SMS sent successfully',
      result: result
    });
  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ 
      message: 'Failed to send test SMS', 
      error: error.message 
    });
  }
});

module.exports = router;