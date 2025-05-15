const Donation = require('../models/donation.model');
const { validationResult } = require('express-validator');
const mpesaService = require('../services/mpesa.service');

// Get all donations (admin and user)
exports.getAllDonations = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (search) {
      query.$or = [
        { donor: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { amount: isNaN(search) ? undefined : Number(search) }
      ].filter(Boolean);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }
    
    // If user is not admin, only show their donations
    if (req.user && req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch donations with pagination
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email'); // Populate user details if needed
      
    // Get total count for pagination
    const total = await Donation.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        donations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
};

// Get donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Check if user has permission (admin or donation owner)
    if (req.user.role !== 'admin' && donation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this donation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
};

// Create a new donation
exports.createDonation = async (req, res) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { amount, phone, donor, anonymous, campaign, message } = req.body;
    
    // Create donation record
    const newDonation = new Donation({
      amount,
      phone: phone.replace(/\s/g, ''), // Remove any spaces
      donor: anonymous ? 'Anonymous' : donor,
      anonymous,
      campaign,
      message,
      userId: req.user ? req.user._id : null, // Link to user if logged in
      status: 'pending' // Initial status
    });
    
    await newDonation.save();
    
    // Initiate M-Pesa payment
    const mpesaResponse = await mpesaService.initiateSTKPush({
      phone,
      amount,
      reference: newDonation._id.toString(),
      description: `Donation to Imani Foundation${campaign ? ` - ${campaign}` : ''}`
    });
    
    // Update donation with M-Pesa checkout request ID
    if (mpesaResponse && mpesaResponse.CheckoutRequestID) {
      newDonation.mpesaRequestId = mpesaResponse.CheckoutRequestID;
      await newDonation.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Donation initiated successfully',
      data: {
        donationId: newDonation._id,
        checkoutRequestId: mpesaResponse?.CheckoutRequestID
      }
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation',
      error: error.message
    });
  }
};

// Update donation status (admin only)
exports.updateDonationStatus = async (req, res) => {
  try {
    // Only admins can update donation status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update donation status'
      });
    }
    
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Update donation
    donation.status = status;
    if (notes) donation.adminNotes = notes;
    donation.updatedAt = new Date();
    
    await donation.save();
    
    res.status(200).json({
      success: true,
      message: 'Donation status updated successfully',
      data: donation
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation status',
      error: error.message
    });
  }
};

// Handle M-Pesa callback
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Check if it's a successful transaction
    if (!Body.stkCallback || !Body.stkCallback.CallbackMetadata) {
      console.error('STK Push unsuccessful or canceled', Body.stkCallback);
      
      // Find donation by checkout request ID
      if (Body.stkCallback && Body.stkCallback.CheckoutRequestID) {
        const donation = await Donation.findOne({ 
          mpesaRequestId: Body.stkCallback.CheckoutRequestID 
        });
        
        if (donation) {
          donation.status = 'failed';
          donation.mpesaResponse = JSON.stringify(Body);
          await donation.save();
        }
      }
      
      return res.status(200).json({ success: true });
    }
    
    // Extract transaction details from callback
    const { CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
    
    // Extract metadata items
    const metadataItems = CallbackMetadata.Item;
    const amount = metadataItems.find(item => item.Name === 'Amount')?.Value;
    const mpesaReceiptNumber = metadataItems.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
    const transactionDate = metadataItems.find(item => item.Name === 'TransactionDate')?.Value;
    const phoneNumber = metadataItems.find(item => item.Name === 'PhoneNumber')?.Value;
    
    // Find donation by checkout request ID
    const donation = await Donation.findOne({ mpesaRequestId: CheckoutRequestID });
    
    if (!donation) {
      console.error('Donation not found for checkout request ID:', CheckoutRequestID);
      return res.status(200).json({ success: true });
    }
    
    // Update donation with transaction details
    donation.status = 'completed';
    donation.mpesaReceiptNumber = mpesaReceiptNumber;
    donation.mpesaTransactionDate = transactionDate;
    donation.mpesaResponse = JSON.stringify(Body);
    donation.completedAt = new Date();
    
    await donation.save();
    
    // Send response to M-Pesa
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.status(200).json({ success: true }); // Always respond with success to M-Pesa
  }
};

// Get donation statistics (admin only)
exports.getDonationStats = async (req, res) => {
  try {
    // Only admins can access donation stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access donation statistics'
      });
    }
    
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    // Calculate date range based on period
    switch (period) {
      case 'day':
        dateFilter = { 
          $gte: new Date(now.setHours(0, 0, 0, 0)) 
        };
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { $gte: startOfWeek };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: startOfMonth };
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: startOfYear };
        break;
      case 'all':
        // No date filter
        break;
      default:
        // Default to month
        const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: defaultStartOfMonth };
    }
    
    // Filter completed donations within date range
    const query = { status: 'completed' };
    if (Object.keys(dateFilter).length > 0) {
      query.completedAt = dateFilter;
    }
    
    // Get total donations and amount
    const totalDonations = await Donation.countDocuments(query);
    
    const donationSum = await Donation.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalAmount = donationSum.length > 0 ? donationSum[0].total : 0;
    
    // Get campaign statistics if available
    const campaignStats = await Donation.aggregate([
      { $match: { ...query, campaign: { $exists: true, $ne: null } } },
      { $group: {
          _id: '$campaign',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalDonations,
        totalAmount,
        averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
        campaignStats
      }
    });
  } catch (error) {
    console.error('Error fetching donation statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation statistics',
      error: error.message
    });
  }
};

// Delete donation (admin only)
exports.deleteDonation = async (req, res) => {
  try {
    // Only admins can delete donations
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete donations'
      });
    }
    
    const { id } = req.params;
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Don't allow deletion of completed donations
    if (donation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed donations cannot be deleted'
      });
    }
    
    await Donation.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donation',
      error: error.message
    });
  }
};