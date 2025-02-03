const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
require('dotenv').config();

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configure file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'share-anything',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'gif', 'mp4', 'mp3', 'pdf', 'txt']
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const validTypes = /\.(jpg|jpeg|png|gif|mp4|mp3|pdf|txt)$/i;
    if (!file.originalname.match(validTypes)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Room data structure
const rooms = {};
const MAX_TEXTS = 50;
const TEXT_EXPIRATION = 900000; // 15 minutes

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    if (!rooms[roomName]) rooms[roomName] = { texts: [], members: new Set() };
    rooms[roomName].members.add(socket.id);
    
    socket.emit('initialData', {
      texts: rooms[roomName].texts,
      files: rooms[roomName].files || []
    });
    
    updateRoomMembers(roomName);
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    if (rooms[roomName]) {
      rooms[roomName].members.delete(socket.id);
      updateRoomMembers(roomName);
    }
  });

  socket.on('shareText', ({ text, roomName }) => {
    if (rooms[roomName]) {
      const newText = { 
        text: sanitizeText(text), 
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      rooms[roomName].texts.push(newText);
      if (rooms[roomName].texts.length > MAX_TEXTS) rooms[roomName].texts.shift();
      
      io.to(roomName).emit('newText', newText);
      scheduleTextExpiration(roomName, newText.id);
    }
  });

  socket.on('deleteText', ({ textId, roomName }) => {
    if (rooms[roomName]) {
      rooms[roomName].texts = rooms[roomName].texts.filter(t => t.id !== textId);
      io.to(roomName).emit('textDeleted', textId);
    }
  });

  socket.on('disconnect', () => {
    Object.keys(rooms).forEach(roomName => {
      if (rooms[roomName].members.has(socket.id)) {
        rooms[roomName].members.delete(socket.id);
        updateRoomMembers(roomName);
      }
    });
  });
});

// File Upload Endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    
    const result = {
      url: req.file.path,
      filename: req.file.originalname,
      fileType: req.file.resource_type,
      id: Math.random().toString(36).substr(2, 9)
    };

    // Broadcast to room
    if (req.body.roomName && rooms[req.body.roomName]) {
      io.to(req.body.roomName).emit('newFile', result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B',
      { inputs: sanitizeText(req.body.message) },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    res.json({ message: sanitizeText(response.data[0]?.generated_text) });
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// Helper Functions
function updateRoomMembers(roomName) {
  io.to(roomName).emit('roomUpdate', {
    memberCount: rooms[roomName].members.size
  });
}

function scheduleTextExpiration(roomName, textId) {
  setTimeout(() => {
    if (rooms[roomName]) {
      rooms[roomName].texts = rooms[roomName].texts.filter(t => t.id !== textId);
      io.to(roomName).emit('textExpired', textId);
    }
  }, TEXT_EXPIRATION);
}

function sanitizeText(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
