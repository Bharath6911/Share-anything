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
    allowed_formats: ['jpg', 'png', 'mp3', 'mp4', 'pdf']
  }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = new File({ 
      filename: req.file.filename, 
      url: req.file.path,
      fileType: req.file.mimetype
    });
    await file.save();
    res.json({ message: '✅ File uploaded successfully', file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
