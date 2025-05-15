const cloudinary = require('cloudinary').v2;


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload multiple files to Cloudinary from buffers
 * @param {Array} files - Array of files to upload
 * @returns {Promise<Array>} - Array of uploaded image objects
 */
const uploadMultipleFromBuffer = async (files) => {
  try {
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'visitation_images', 
            // Optional transformations or additional upload options
            transformation: [
              { width: 800, crop: "limit" }, // Optional: resize large images
              { quality: "auto" } // Optional: auto-optimize quality
            ]
          }, 
          (error, result) => {
            if (error) reject(error);
            else resolve({
              public_id: result.public_id,
              url: result.secure_url, // Ensure secure_url is used
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height
            });
          }
        ).end(file.buffer);
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload images to Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadMultipleFromBuffer
};