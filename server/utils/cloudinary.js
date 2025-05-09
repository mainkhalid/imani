// server/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload multiple images from buffer
exports.uploadMultipleFromBuffer = async (files) => {
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });
  });

  const results = await Promise.all(uploadPromises);
  return results.map(result => ({
    public_id: result.public_id,
    url: result.secure_url
  }));
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

module.exports.cloudinary = cloudinary;