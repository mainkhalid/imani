const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
const { uploadMultipleFromBuffer } = require('../utils/cloudinary');

// Apply authentication to all upload routes
router.use(authenticate);

// Upload single image to Cloudinary
router.post(
  '/single',
  authorize(['admin', 'volunteer']),
  uploadMiddleware.single('image'),
  async (req, res) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No image file provided' 
        });
      }

      // Upload to Cloudinary using existing utility
      const results = await uploadMultipleFromBuffer([{
        buffer: req.file.buffer
      }]);

      // Return the uploaded image details
      res.status(200).json({
        success: true,
        image: results[0]
      });
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
        error: error.message
      });
    }
  }
);

// Upload multiple images to Cloudinary
router.post(
  '/multiple',
  authorize(['admin', 'volunteer']),
  uploadMiddleware.array('images', 5),
  async (req, res) => {
    try {
      // Check if files exist
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No image files provided' 
        });
      }

      // Format files for Cloudinary upload
      const fileBuffers = req.files.map(file => ({
        buffer: file.buffer
      }));

      // Upload to Cloudinary using existing utility
      const results = await uploadMultipleFromBuffer(fileBuffers);

      // Return the uploaded images details
      res.status(200).json({
        success: true,
        images: results
      });
    } catch (error) {
      console.error('Error uploading images to Cloudinary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images to Cloudinary',
        error: error.message
      });
    }
  }
);

module.exports = router;