const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const File = require('../models/File');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'pdf', 'txt', 'log', 'json']
  }
});

const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const upload = hasCloudinaryCredentials ? multer({ storage }) : null;

const router = express.Router();

router.post('/', async (req, res, next) => {
  if (!upload) {
    return res.status(503).json({
      error: 'Cloudinary credentials are not configured in this environment.',
    });
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    try {
      const file = new File({ 
        filename: req.file.filename, 
        url: req.file.path,
        fileType: req.file.mimetype
      });
      await file.save();
      res.json({ message: '✅ File uploaded successfully', file });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;
