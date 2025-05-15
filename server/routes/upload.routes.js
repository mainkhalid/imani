// routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const { uploadMultipleFromBuffer } = require('../utils/cloudinary');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Single image upload route
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Upload single file
    const uploadResult = await uploadMultipleFromBuffer([req.file]);
    
    res.status(200).json({
      success: true,
      uploadedImages: uploadResult,
      image: uploadResult[0]
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Multiple image upload route
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    // Upload multiple files
    const uploadResults = await uploadMultipleFromBuffer(req.files);
    
    res.status(200).json({
      success: true,
      uploadedImages: uploadResults
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;