const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Store shared texts per room
let rooms = {}; // Example structure: { roomName: [{ text, timestamp }] }
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes in milliseconds

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle client connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room
  socket.on('joinRoom', (data) => {
    const room = data.room;
    socket.join(room);
    console.log(`User joined room: ${room}`);

    // Initialize room if not exists
    if (!rooms[room]) rooms[room] = [];

    // Send existing texts in the room
    socket.emit('initialSharedTexts', { texts: rooms[room] });
  });

  // Listen for text sharing
  socket.on('shareText', (data) => {
    const { text, room } = data;
    console.log(`Text received in room ${room}: ${text}`);

    const newText = { text, timestamp: Date.now() };

    if (rooms[room]) {
      rooms[room].push(newText);

      // Limit number of texts per room
      if (rooms[room].length > MAX_TEXTS) rooms[room].shift();

      // Emit text to all clients in the room
      io.to(room).emit('textShared', { text });
    }

    // Remove expired texts
    setTimeout(() => {
      if (rooms[room]) {
        rooms[room] = rooms[room].filter(
          (item) => Date.now() - item.timestamp < TEXT_EXPIRATION_TIME
        );
      }
    }, TEXT_EXPIRATION_TIME);
  });

  // Handle text deletion
  socket.on('deleteText', (data) => {
    const { text, room } = data;
    console.log(`Delete request for text "${text}" in room: ${room}`);

    if (rooms[room]) {
      rooms[room] = rooms[room].filter((item) => item.text !== text);
      io.to(room).emit('textDeleted', { text });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
