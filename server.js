const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store room-based shared texts and expiration times
const rooms = {}; // { roomName: { texts: [...], members: [] } }
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware to parse JSON

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle room joining
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = { texts: [], members: [] };
    }

    rooms[roomName].members.push(socket.id);
    console.log(`User joined room: ${roomName}`);

    // Send initial room texts
    socket.emit('initialRoomTexts', { roomName, texts: rooms[roomName].texts });

    // Notify room members of the updated member list
    io.to(roomName).emit('roomMembers', {
      room: roomName,
      members: rooms[roomName].members.length,
    });
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    console.log(`User left room: ${roomName}`);

    rooms[roomName].members = rooms[roomName].members.filter(
      (id) => id !== socket.id
    );

    io.to(roomName).emit('roomMembers', {
      room: roomName,
      members: rooms[roomName].members.length,
    });
  });

  // Handle text sharing
  socket.on('shareText', ({ text, roomName }) => {
    if (roomName && rooms[roomName]) {
      const newText = { text, timestamp: Date.now() };
      rooms[roomName].texts.push(newText);

      if (rooms[roomName].texts.length > MAX_TEXTS) {
        rooms[roomName].texts.shift(); // Remove the oldest text
      }

      io.to(roomName).emit('textShared', { text });

      // Remove the text after expiration time
      setTimeout(() => {
        rooms[roomName].texts = rooms[roomName].texts.filter(
          (item) => Date.now() - item.timestamp < TEXT_EXPIRATION_TIME
        );
        io.to(roomName).emit('expiredTextRemoved', { text });
      }, TEXT_EXPIRATION_TIME);
    }
  });

  // Handle text deletion
  socket.on('deleteText', ({ text, roomName }) => {
    if (roomName && rooms[roomName]) {
      rooms[roomName].texts = rooms[roomName].texts.filter(
        (item) => item.text !== text
      );
      io.to(roomName).emit('textDeleted', { text });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    for (const roomName in rooms) {
      rooms[roomName].members = rooms[roomName].members.filter(
        (id) => id !== socket.id
      );

      io.to(roomName).emit('roomMembers', {
        room: roomName,
        members: rooms[roomName].members.length,
      });
    }
  });
});

// AI Chatbot API Integration
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1',
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ message: response.data[0]?.generated_text || "Sorry, I couldn't process that." });
  } catch (error) {
    console.error('Error:', error.response || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
