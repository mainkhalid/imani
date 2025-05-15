// server/services/sms.service.js
const axios = require('axios');

/**
 * Send a test SMS to verify SMS settings
 * @param {Object} settings - SMS settings
 * @returns {Promise} - Result of sending the SMS
 */
const sendTestSms = async (phoneNumber) => {
  try {
    // First, fetch SMS settings from database
    const { Settings } = require('../models/settings.model');
    const settings = await Settings.findOne({ type: 'sms' });
    
    if (!settings || !settings.smsApiKey || !settings.smsApiUrl) {
      throw new Error('SMS settings are not properly configured');
    }
    
    // Now use the settings to send the SMS
    const response = await axios({
      method: 'POST',
      url: settings.smsApiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.smsApiKey}`
      },
      data: {
        to: phoneNumber,
        from: settings.smsSenderId || 'Imani',
        message: 'This is a test SMS from Imani Foundation. If you received this, your SMS configuration is working!'
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`SMS provider returned status code ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error.response) {
      throw new Error(`SMS provider error: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
};
const sendTestSMS = async (settings) => {
  try {
    // Implementation will vary based on your SMS provider
    // This example uses a generic REST API approach
    const response = await axios({
      method: 'POST',
      url: settings.smsApiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.smsApiKey}`
      },
      data: {
        to: process.env.ADMIN_PHONE || '', // You might want to set this in environment vars or pass as parameter
        from: settings.smsSenderId,
        message: 'This is a test SMS from Imani Foundation. If you received this, your SMS configuration is working!'
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`SMS provider returned status code ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error.response) {
      throw new Error(`SMS provider error: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Send donation confirmation SMS to donor
 * @param {Object} settings - SMS settings
 * @param {Object} donation - Donation data
 * @returns {Promise} - Result of sending the SMS
 */
const sendDonationConfirmation = async (settings, donation) => {
  if (!settings || !donation || !donation.phone) {
    throw new Error('SMS settings, donation data, or phone number is missing');
  }

  try {
    const message = `Thank you for your donation of ${donation.amount} ${donation.currency} to Imani Foundation. Your support helps us make a difference! Reference: ${donation.reference}`;
    
    const response = await axios({
      method: 'POST',
      url: settings.smsApiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.smsApiKey}`
      },
      data: {
        to: donation.phone,
        from: settings.smsSenderId,
        message: message
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`SMS provider returned status code ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending donation confirmation SMS:', error);
    if (error.response) {
      throw new Error(`SMS provider error: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
};

/**
 * Send campaign update SMS to donors
 * @param {Object} settings - SMS settings
 * @param {Array} recipients - Array of phone numbers
 * @param {String} message - Message to send
 * @returns {Promise} - Result of sending the SMS
 */
const sendCampaignUpdate = async (settings, recipients, message) => {
  if (!settings || !recipients || !recipients.length || !message) {
    throw new Error('SMS settings, recipients, or message is missing');
  }

  try {
    // Some SMS providers support bulk sending - this implementation may vary
    const response = await axios({
      method: 'POST',
      url: settings.smsApiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.smsApiKey}`
      },
      data: {
        to: recipients,
        from: settings.smsSenderId,
        message: message
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`SMS provider returned status code ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending campaign update SMS:', error);
    if (error.response) {
      throw new Error(`SMS provider error: ${error.response.data.message || error.response.statusText}`);
    }
    throw error;
  }
};

module.exports = {
  sendTestSms,
  sendTestSMS,
  sendDonationConfirmation,
  sendCampaignUpdate
};