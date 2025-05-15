const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    campaign: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    transactionId: {
      type: String,
      sparse: true, // Allow null but enforce uniqueness when present
    },
    mpesaRequestId: {
      type: String,
      sparse: true,
    },
    mpesaReceiptNumber: {
      type: String,
      sparse: true,
    },
    mpesaTransactionDate: {
      type: String,
      sparse: true,
    },
    mpesaResponse: {
      type: String, // Store JSON response as string
    },
    paymentMethod: {
      type: String,
      default: 'mpesa',
    },
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ donor: 'text', phone: 'text' });
donationSchema.index({ mpesaRequestId: 1 });
donationSchema.index({ campaign: 1 });
donationSchema.index({ userId: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;