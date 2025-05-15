const Donation = require('../models/donation.model');
const User = require('../models/user.model');
const Settings = require('../models/settings.model');
const moment = require('moment');

/**
 * Get dashboard data for admin panel
 * @route GET /api/dashboard
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Get date ranges
    const today = moment().startOf('day');
    const startOfWeek = moment().startOf('week');
    const startOfMonth = moment().startOf('month');
    const startOfYear = moment().startOf('year');
    
    // Get donation statistics
    const totalDonations = await Donation.countDocuments();
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const todayDonations = await Donation.countDocuments({
      createdAt: { $gte: today.toDate() }
    });
    
    const todayAmount = await Donation.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: today.toDate() }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today.toDate() }
    });
    
    // Get donation status breakdown
    const donationStatusBreakdown = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get donations by campaign
    const donationsByCampaign = await Donation.aggregate([
      { $match: { campaign: { $ne: null } } },
      { $group: { _id: '$campaign', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get recent donations
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get settings
    const settings = await Settings.findOne();
    
    return res.status(200).json({
      success: true,
      data: {
        totalDonations,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        todayDonations,
        todayAmount: todayAmount.length > 0 ? todayAmount[0].total : 0,
        totalUsers,
        newUsersToday,
        donationStatusBreakdown,
        donationsByCampaign,
        recentDonations,
        settings
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};