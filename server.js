const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Store room-based shared texts and expiration times
const rooms = {}; // { roomName: { texts: [...], members: [] } }
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes in milliseconds

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

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

    // Notify the user with current room texts
    socket.emit('initialRoomTexts', { roomName, texts: rooms[roomName].texts });

    // Notify room members of the updated member list
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

      // Remove the text after the expiration time
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

      // Notify room members of the updated member list
      io.to(roomName).emit('roomMembers', {
        room: roomName,
        members: rooms[roomName].members.length,
      });
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
