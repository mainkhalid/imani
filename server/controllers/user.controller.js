const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'user',
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { username, email, role, active } = req.body;

    // Find user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;

    // If password is provided, update it
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Toggle user active status (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};