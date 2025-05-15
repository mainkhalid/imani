const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['general', 'mpesa', 'email', 'sms'],
      unique: true,
    },
    // General settings
    siteName: {
      type: String,
    },
    siteDescription: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    
    // M-Pesa settings
    baseUrl: {
      type: String,
    },
    consumerKey: {
      type: String,
    },
    consumerSecret: {
      type: String,
    },
    passKey: {
      type: String,
    },
    shortcode: {
      type: String,
    },
    callbackUrl: {
      type: String,
    },
    
    // Email settings
    emailHost: {
      type: String,
    },
    emailPort: {
      type: Number,
    },
    emailUser: {
      type: String,
    },
    emailPass: {
      type: String,
    },
    emailFrom: {
      type: String,
    },
    
    // SMS settings
    smsApiKey: {
      type: String,
    },
    smsApiUrl: {
      type: String,
    },
    smsSenderId: {
      type: String,
    },
    
    // Additional custom settings as JSON
    customSettings: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);



const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { Settings };