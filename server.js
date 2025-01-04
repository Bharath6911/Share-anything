const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Store shared texts and room information
let sharedTexts = []; // For global sharing
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of users in rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle room joining
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    rooms[roomName].push(socket.id);
    console.log(`User joined room: ${roomName}`);

    // Notify the user of the room members
    io.to(roomName).emit('roomMembers', {
      room: roomName,
      members: rooms[roomName].map((id) => id), // Replace with usernames if available
    });
  });

  // Handle text sharing
  socket.on('shareText', ({ text, roomName }) => {
    const newText = { text, timestamp: Date.now() };

    if (roomName) {
      // Room-specific sharing
      io.to(roomName).emit('textShared', { text });
    } else {
      // Global sharing
      sharedTexts.push(newText);
      if (sharedTexts.length > MAX_TEXTS) sharedTexts.shift(); // Remove oldest text
      io.emit('textShared', { text });
    }
  });

  // Handle text deletion
  socket.on('deleteText', ({ text, roomName }) => {
    if (roomName) {
      io.to(roomName).emit('textDeleted', { text });
    } else {
      sharedTexts = sharedTexts.filter((item) => item.text !== text);
      io.emit('textDeleted', { text });
    }
  });

  // Notify on user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    for (const room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
      io.to(room).emit('roomMembers', {
        room,
        members: rooms[room],
      });
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
