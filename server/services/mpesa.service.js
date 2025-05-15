const axios = require('axios');
const moment = require('moment');
const { Settings } = require('../models/settings.model');

class MpesaService {
  constructor() {
    this.baseUrl = process.env.MPESA_API_URL;
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passKey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
  }

  /**
   * Get settings from database or use environment variables as fallback
   */
  async getSettings() {
    try {
      const settings = await Settings.findOne({ type: 'mpesa' });
      
      if (settings) {
        return {
          baseUrl: settings.baseUrl || this.baseUrl,
          consumerKey: settings.consumerKey || this.consumerKey,
          consumerSecret: settings.consumerSecret || this.consumerSecret,
          passKey: settings.passKey || this.passKey,
          shortcode: settings.shortcode || this.shortcode,
          callbackUrl: settings.callbackUrl || this.callbackUrl
        };
      }
      
      return {
        baseUrl: this.baseUrl,
        consumerKey: this.consumerKey,
        consumerSecret: this.consumerSecret,
        passKey: this.passKey,
        shortcode: this.shortcode,
        callbackUrl: this.callbackUrl
      };
    } catch (error) {
      console.error('Error fetching M-Pesa settings:', error);
      
      // Fallback to environment variables
      return {
        baseUrl: this.baseUrl,
        consumerKey: this.consumerKey,
        consumerSecret: this.consumerSecret,
        passKey: this.passKey,
        shortcode: this.shortcode,
        callbackUrl: this.callbackUrl
      };
    }
  }

  /**
   * Test connection to M-Pesa API
   * This is the missing method that was referenced in settings.routes.js
   */
  async testConnection() {
    try {
      const settings = await this.getSettings();
      
      // Validate required settings
      if (!settings.baseUrl || !settings.consumerKey || !settings.consumerSecret) {
        throw new Error('Missing required M-Pesa configuration');
      }
      
      const auth = Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${settings.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );
      
      if (response.data && response.data.access_token) {
        return response.data;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error testing M-Pesa connection:', error);
      throw new Error(`M-Pesa connection test failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Get OAuth token for M-Pesa API
   */
  async getAccessToken() {
    try {
      const settings = await this.getSettings();
      
      // Validate required settings
      if (!settings.baseUrl || !settings.consumerKey || !settings.consumerSecret) {
        throw new Error('Missing required M-Pesa configuration');
      }
      
      const auth = Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${settings.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );
      
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw new Error(`M-Pesa authentication failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Generate password for M-Pesa STK push
   */
  async generatePassword() {
    const settings = await this.getSettings();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(
      `${settings.shortcode}${settings.passKey}${timestamp}`
    ).toString('base64');
    
    return {
      password,
      timestamp
    };
  }

  /**
   * Format phone number to required format (2547XXXXXXXX)
   */
  formatPhoneNumber(phone) {
    // Remove any spaces or special characters
    let formatted = phone.replace(/\s+|-|\(|\)|\.|\+/g, '');
    
    // If number starts with 0, replace with 254
    if (formatted.startsWith('0')) {
      formatted = `254${formatted.substring(1)}`;
    }
    
    // If number doesn't have country code, add it
    if (!formatted.startsWith('254')) {
      formatted = `254${formatted}`;
    }
    
    return formatted;
  }

  /**
   * Initiate STK Push for payment
   */
  async initiateSTKPush({ phone, amount, reference, description }) {
    try {
      const settings = await this.getSettings();
      const token = await this.getAccessToken();
      const { password, timestamp } = await this.generatePassword();
      
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Round amount to whole number
      const paymentAmount = Math.round(amount);
      
      const data = {
        BusinessShortCode: settings.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: paymentAmount,
        PartyA: formattedPhone,
        PartyB: settings.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: settings.callbackUrl,
        AccountReference: reference || 'ImaniFdn',
        TransactionDesc: description || 'Donation to Imani Foundation'
      };
      
      const response = await axios.post(
        `${settings.baseUrl}/mpesa/stkpush/v1/processrequest`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error initiating M-Pesa STK push:', error.response?.data || error.message);
      throw new Error(`M-Pesa STK push failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Check status of STK Push transaction
   */
  async checkSTKStatus(checkoutRequestId) {
    try {
      const settings = await this.getSettings();
      const token = await this.getAccessToken();
      const { password, timestamp } = await this.generatePassword();
      
      const data = {
        BusinessShortCode: settings.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };
      
      const response = await axios.post(
        `${settings.baseUrl}/mpesa/stkpushquery/v1/query`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error checking M-Pesa STK status:', error.response?.data || error.message);
      throw new Error(`M-Pesa STK status check failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Get transaction details by receipt number
   */
  async getTransactionByReceiptNumber(receiptNumber) {
    try {
      const settings = await this.getSettings();
      const token = await this.getAccessToken();
      
      const data = {
        Initiator: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'TransactionStatusQuery',
        TransactionID: receiptNumber,
        PartyA: settings.shortcode,
        IdentifierType: '4', // Organization shortcode
        ResultURL: `${process.env.API_BASE_URL}/api/donations/transaction-result`,
        QueueTimeOutURL: `${process.env.API_BASE_URL}/api/donations/transaction-timeout`,
        Remarks: 'Transaction status query',
        Occasion: 'Donation'
      };
      
      const response = await axios.post(
        `${settings.baseUrl}/mpesa/transactionstatus/v1/query`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting transaction details:', error.response?.data || error.message);
      throw new Error(`Transaction details query failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Register C2B URL (for admin setup)
   */
  async registerC2BURL() {
    try {
      const settings = await this.getSettings();
      const token = await this.getAccessToken();
      
      const data = {
        ShortCode: settings.shortcode,
        ResponseType: 'Completed',
        ConfirmationURL: `${process.env.API_BASE_URL}/api/donations/confirmation`,
        ValidationURL: `${process.env.API_BASE_URL}/api/donations/validation`
      };
      
      const response = await axios.post(
        `${settings.baseUrl}/mpesa/c2b/v1/registerurl`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error registering C2B URL:', error.response?.data || error.message);
      throw new Error(`C2B URL registration failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }
  
  /**
   * Register C2B URLs (alias for registerC2BURL)
   * For consistency with settings.routes.js
   */
  async registerC2BUrls() {
    return this.registerC2BURL();
  }
}

module.exports = new MpesaService();