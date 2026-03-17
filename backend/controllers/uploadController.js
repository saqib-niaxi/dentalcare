const cloudinary = require('cloudinary').v2;

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return cloudinary;
};

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private/Admin
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cl = getCloudinary();
    const result = await new Promise((resolve, reject) => {
      const stream = cl.uploader.upload_stream(
        { folder: 'doctors', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      fileName: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:fileName
// @access  Private/Admin
exports.deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ message: 'File name is required' });
    }

    const cl = getCloudinary();
    const publicId = fileName.startsWith('doctors/') ? fileName : `doctors/${fileName}`;
    await cl.uploader.destroy(publicId);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
};
