const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Store room-based shared texts and files
const rooms = {}; // { roomName: { texts: [], files: [], members: [] } }
const MAX_FILES = 20;
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes in milliseconds

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = { texts: [], files: [], members: [] };
    }

    rooms[roomName].members.push(socket.id);

    socket.emit('initialRoomData', {
      roomName,
      texts: rooms[roomName].texts,
      files: rooms[roomName].files,
    });

    io.to(roomName).emit('roomMembers', {
      room: roomName,
      members: rooms[roomName].members.length,
    });
  });

  socket.on('shareText', ({ text, roomName }) => {
    if (roomName && rooms[roomName]) {
      const newText = { text, timestamp: Date.now() };
      rooms[roomName].texts.push(newText);

      if (rooms[roomName].texts.length > MAX_TEXTS) {
        rooms[roomName].texts.shift();
      }

      io.to(roomName).emit('textShared', { text });

      setTimeout(() => {
        rooms[roomName].texts = rooms[roomName].texts.filter(
          (item) => Date.now() - item.timestamp < TEXT_EXPIRATION_TIME
        );
        io.to(roomName).emit('expiredTextRemoved', { text });
      }, TEXT_EXPIRATION_TIME);
    }
  });

  socket.on('shareFile', ({ fileName, filePath, roomName }) => {
    if (roomName && rooms[roomName]) {
      const newFile = { fileName, filePath };
      rooms[roomName].files.push(newFile);

      if (rooms[roomName].files.length > MAX_FILES) {
        const removedFile = rooms[roomName].files.shift();
        fs.unlinkSync(path.join(uploadsDir, removedFile.filePath));
      }

      io.to(roomName).emit('fileShared', newFile);
    }
  });

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

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
