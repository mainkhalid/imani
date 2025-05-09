// server/controllers/visitation.controller.js
const Visitation = require('../models/visitation.model');
const { uploadMultipleFromBuffer } = require('../utils/cloudinary');

exports.createVisitation = async (req, res) => {
  try {
    const { homeName, visitDate, numberOfChildren, status, notes, budget } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadMultipleFromBuffer(req.files);
    }

    const visitation = new Visitation({
      homeName,
      visitDate,
      numberOfChildren,
      status,
      notes,
      budget,
      images,
      createdBy: req.user._id
    });

    await visitation.save();

    res.status(201).json({
      success: true,
      data: visitation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getVisitations = async (req, res) => {
  try {
    // Add filtering options if needed
    const visitations = await Visitation.find({ createdBy: req.user._id })
      .sort({ visitDate: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: visitations.length,
      data: visitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Added missing controller methods
exports.getVisitation = async (req, res) => {
  try {
    const visitation = await Visitation.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!visitation) {
      return res.status(404).json({
        success: false,
        message: 'Visitation not found'
      });
    }

    // Check if user is authorized to view this visitation
    if (visitation.createdBy._id.toString() !== req.user._id.toString() && 
        !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this visitation'
      });
    }

    res.status(200).json({
      success: true,
      data: visitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateVisitation = async (req, res) => {
  try {
    const { homeName, visitDate, numberOfChildren, status, notes, budget } = req.body;
    
    // Find visitation
    let visitation = await Visitation.findById(req.params.id);
    
    if (!visitation) {
      return res.status(404).json({
        success: false,
        message: 'Visitation not found'
      });
    }
    
    // Check if user is authorized to update this visitation
    if (visitation.createdBy.toString() !== req.user._id.toString() && 
        !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this visitation'
      });
    }
    
    // Update visitation
    visitation = await Visitation.findByIdAndUpdate(
      req.params.id,
      {
        homeName,
        visitDate,
        numberOfChildren,
        status,
        notes,
        budget
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: visitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteVisitation = async (req, res) => {
  try {
    const visitation = await Visitation.findById(req.params.id);
    
    if (!visitation) {
      return res.status(404).json({
        success: false,
        message: 'Visitation not found'
      });
    }
    
    // Check if user is admin (only admins can delete as per route definition)
    await Visitation.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Visitation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const images = await uploadMultipleFromBuffer(req.files);
    
    // Update visitation with new images
    const visitation = await Visitation.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: images } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Added missing method for retrieving images
exports.getVisitationImages = async (req, res) => {
  try {
    const visitation = await Visitation.findById(req.params.id);
    
    if (!visitation) {
      return res.status(404).json({
        success: false,
        message: 'Visitation not found'
      });
    }
    
    // Check if user is authorized to view this visitation
    if (visitation.createdBy.toString() !== req.user._id.toString() && 
        !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this visitation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: visitation.images || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};