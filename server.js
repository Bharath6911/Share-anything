const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Store shared texts
let sharedTexts = []; // This will hold the shared texts
const MAX_TEXTS = 50;
const TEXT_EXPIRATION_TIME = 1800000; // 15 minutes in milliseconds

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle client connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the current shared texts to the newly connected user
  socket.emit('initialSharedTexts', { texts: sharedTexts });

  // Listen for text sharing
  socket.on('shareText', (data) => {
    console.log(`Text received: ${data.text}`);

    // Store the shared text with its timestamp
    const newText = { text: data.text, timestamp: Date.now() };
    sharedTexts.push(newText);

    if (sharedTexts.length > MAX_TEXTS) {
      sharedTexts.shift(); // Remove the oldest text
    }

    // Emit the text to all connected clients
    io.emit('textShared', { text: data.text });

    // Remove texts older than 10 minutes after the timeout
    setTimeout(() => {
      sharedTexts = sharedTexts.filter(item => Date.now() - item.timestamp < TEXT_EXPIRATION_TIME);
      io.emit('expiredTextRemoved', { text: data.text }); // Notify clients of expired text
    }, TEXT_EXPIRATION_TIME);
  });

 // Listen for text deletion
  socket.on('deleteText', (data) => {
    console.log(`Delete request received for text: ${data.text}`);

    // Filter out the deleted text
    sharedTexts = sharedTexts.filter((item) => item.text !== data.text);

    // Notify all clients to remove the deleted text
    io.emit('textDeleted', { text: data.text });
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
