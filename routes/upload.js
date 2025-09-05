const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

// Upload single image
router.post('/upload-single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    res.json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images
router.post('/upload-multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadedImages = req.files.map(file => ({
      imageUrl: file.path,
      publicId: file.filename
    }));

    res.json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

// Delete image from Cloudinary
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { cloudinary } = require('../config/cloudinary');
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        error: 'Image not found or already deleted' 
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

module.exports = router;
