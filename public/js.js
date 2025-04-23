const socket = io('https://share-anything.onrender.com'); // Connect to WebSocket server

let currentRoom = null;

// Handle room form submission
const roomForm = document.getElementById('roomForm');
roomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const roomInput = document.getElementById('roomInput');
  const roomName = roomInput.value.trim();

  if (roomName) {
    currentRoom = roomName;
    socket.emit('joinRoom', roomName); // Notify the server
    document.getElementById('roomStatus').textContent = `You joined room: ${roomName}`;
    document.getElementById('sharedTexts').innerHTML = ''; // Clear previous texts
  }
});

// Handle exit room
const exitRoomButton = document.getElementById('exitRoomButton');
exitRoomButton.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leaveRoom', currentRoom); // Notify the server about leaving the room
    document.getElementById('roomStatus').textContent = `You left room: ${currentRoom}`;
    currentRoom = null;
    document.getElementById('sharedTexts').innerHTML = ''; // Clear the shared texts
  } else {
    document.getElementById('roomStatus').textContent = 'You are not in any room!';
  }
});

// Handle text form submission
const textForm = document.getElementById('textForm');
textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('textInput');
  const text = input.value.trim();

  if (text && currentRoom) {
    socket.emit('shareText', { text, roomName: currentRoom });
    input.value = '';
  }
});

// Create a list item with text, copy, and delete buttons
function createListItem(text) {
  const listItem = document.createElement('li');

  const pre = document.createElement('pre');
  pre.textContent = text;

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.style.marginLeft = '10px';
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    });
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.marginLeft = '10px';
  deleteButton.addEventListener('click', () => {
    if (currentRoom) {
      socket.emit('deleteText', { text, roomName: currentRoom });
    }
  });

  listItem.appendChild(pre);
  listItem.appendChild(copyButton);
  listItem.appendChild(deleteButton);

  return listItem;
}

// Add shared texts to the list
function addSharedTexts(texts) {
  const textList = document.getElementById('sharedTexts');
  texts.forEach((item) => {
    const listItem = createListItem(item.text);
    textList.appendChild(listItem);
  });
}

// Remove a specific text from the list
function removeTextFromList(text) {
  const textList = document.getElementById('sharedTexts');
  const items = textList.querySelectorAll('li');

  items.forEach((item) => {
    const pre = item.querySelector('pre');
    if (pre && pre.textContent === text) {
      textList.removeChild(item);
    }
  });
}

// Socket event listeners
socket.on('initialRoomTexts', (data) => addSharedTexts(data.texts));
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = createListItem(data.text);
  textList.appendChild(listItem);
});
socket.on('textDeleted', (data) => removeTextFromList(data.text));
socket.on('expiredTextRemoved', (data) => removeTextFromList(data.text));

// Listen for room members update
socket.on('roomMembers', (data) => {
  const { room, members } = data;
  document.getElementById('roomStatus').textContent = `Room: ${room}`;
  document.getElementById('memberCount').textContent = `Members online: ${members}`;
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('fileInput');
  if (!fileInput.files.length) {
    alert('Please select a file!');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      alert('✅ File uploaded successfully!');
      loadFiles(); // Refresh file list
    } else {
      alert('❌ Upload failed: ' + result.error);
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('❌ Error uploading file');
  }
});

// Function to load and display uploaded files
async function loadFiles() {
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  try {
    const response = await fetch('/files'); // Fetch file list from server
    const files = await response.json();

    files.forEach(file => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${file.url}" target="_blank">${file.filename}</a> (${file.fileType})`;
      fileList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading files:', err);
  }
}

// Load files on page load
window.onload = loadFiles;

document.getElementById('send-button').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  if (!userInput) return;

  // Display user message
  const chatBox = document.getElementById('chat-box');
  const userMessageDiv = document.createElement('div');
  userMessageDiv.textContent = `User: ${userInput}`;
  chatBox.appendChild(userMessageDiv);

  // Clear input field
  document.getElementById('user-input').value = '';

  // Send message to backend
  try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      const aiMessageDiv = document.createElement('div');
      aiMessageDiv.textContent = `AI: ${data.message}`;
      chatBox.appendChild(aiMessageDiv);
      
      // Scroll to the bottom
      chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
      console.error('Error:', error);
  }
});


document.addEventListener
("contextmenu", function(e) {
e.preventDefault();
}, false)
