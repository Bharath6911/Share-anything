// Add DOMPurify script in your HTML first: <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js"></script>

const socket = io('https://share-anything.onrender.com', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000
});

// Security sanitization
const sanitizeConfig = { ALLOWED_TAGS: [], ALLOWED_ATTR: [] };
const sanitizeInput = (input) => DOMPurify.sanitize(input, sanitizeConfig);

let currentRoom = null;

// DOM Elements
const elements = {
  roomForm: document.getElementById('roomForm'),
  roomInput: document.getElementById('roomInput'),
  roomStatus: document.getElementById('roomStatus'),
  exitRoomButton: document.getElementById('exitRoomButton'),
  textForm: document.getElementById('textForm'),
  textInput: document.getElementById('textInput'),
  sharedTexts: document.getElementById('sharedTexts'),
  uploadForm: document.getElementById('uploadForm'),
  fileInput: document.getElementById('fileInput'),
  fileList: document.getElementById('fileList'),
  sendButton: document.getElementById('send-button'),
  userInput: document.getElementById('user-input'),
  chatBox: document.getElementById('chat-box'),
  memberCount: document.getElementById('memberCount')
};

// WebSocket Handlers
const socketHandlers = {
  connect_error: (err) => {
    console.error('Connection Error:', err);
    alert('Realtime features unavailable. Please refresh!');
  },
  initialRoomTexts: (data) => updateTextList(data.texts),
  textShared: (data) => addTextToList(data.text),
  textDeleted: (data) => removeTextFromList(data.text),
  expiredTextRemoved: (data) => removeTextFromList(data.text),
  roomMembers: (data) => updateRoomStatus(data),
  fileShared: (data) => addFileToList(data)
};

// Event Listeners
const setupEventListeners = () => {
  elements.roomForm.addEventListener('submit', handleRoomJoin);
  elements.exitRoomButton.addEventListener('click', handleRoomExit);
  elements.textForm.addEventListener('submit', handleTextSubmit);
  elements.uploadForm.addEventListener('submit', handleFileUpload);
  elements.sendButton.addEventListener('click', handleChatMessage);
  window.addEventListener('beforeunload', handlePageUnload);
};

// Core Functions
const handleRoomJoin = (e) => {
  e.preventDefault();
  const roomName = sanitizeInput(elements.roomInput.value.trim());
  if (!roomName) return;

  currentRoom = roomName;
  socket.emit('joinRoom', roomName);
  elements.roomStatus.textContent = `Joined: ${roomName}`;
  elements.sharedTexts.innerHTML = '';
};

const handleRoomExit = () => {
  if (!currentRoom) return;
  socket.emit('leaveRoom', currentRoom);
  elements.roomStatus.textContent = `Left: ${currentRoom}`;
  currentRoom = null;
  elements.sharedTexts.innerHTML = '';
};

const handleTextSubmit = (e) => {
  e.preventDefault();
  const text = sanitizeInput(elements.textInput.value.trim());
  if (!text || !currentRoom) return;

  socket.emit('shareText', { text, roomName: currentRoom });
  elements.textInput.value = '';
};

const handleFileUpload = async (e) => {
  e.preventDefault();
  if (!elements.fileInput.files.length) return;

  const formData = new FormData();
  formData.append('file', elements.fileInput.files[0]);

  try {
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    response.ok ? loadFiles() : alert(`Upload failed: ${result.error}`);
  } catch (err) {
    console.error('Upload error:', err);
    alert('File upload failed!');
  }
};

const handleChatMessage = async () => {
  const message = sanitizeInput(elements.userInput.value.trim());
  if (!message) return;

  appendMessage(`User: ${message}`);
  elements.userInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    appendMessage(`AI: ${data.message}`);
  } catch (error) {
    console.error('Chat error:', error);
  }
};

// Helper Functions
const createListItem = (text) => {
  const li = document.createElement('li');
  li.innerHTML = `
    <pre>${text}</pre>
    <button class="copy-btn">Copy</button>
    <button class="delete-btn">Delete</button>
  `;

  li.querySelector('.copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => alert('Copied!'));
  });

  li.querySelector('.delete-btn').addEventListener('click', () => {
    if (currentRoom) socket.emit('deleteText', { text, roomName: currentRoom });
  });

  return li;
};

const updateTextList = (texts) => {
  elements.sharedTexts.innerHTML = '';
  texts.forEach(text => elements.sharedTexts.appendChild(createListItem(text)));
};

const addTextToList = (text) => {
  elements.sharedTexts.appendChild(createListItem(text));
};

const removeTextFromList = (targetText) => {
  [...elements.sharedTexts.children].forEach(li => {
    if (li.querySelector('pre').textContent === targetText) li.remove();
  });
};

const updateRoomStatus = ({ room, members }) => {
  elements.roomStatus.textContent = `Room: ${room}`;
  elements.memberCount.textContent = `Online: ${members}`;
};

const appendMessage = (message) => {
  const div = document.createElement('div');
  div.textContent = message;
  elements.chatBox.appendChild(div);
  elements.chatBox.scrollTop = elements.chatBox.scrollHeight;
};

const loadFiles = async () => {
  try {
    const response = await fetch('/files');
    const files = await response.json();
    elements.fileList.innerHTML = files.map(file => `
      <li>
        <a href="${file.url}" target="_blank">${file.filename}</a>
        <span>(${file.fileType})</span>
      </li>
    `).join('');
  } catch (err) {
    console.error('File load error:', err);
  }
};

const handlePageUnload = () => {
  if (currentRoom) socket.emit('leaveRoom', currentRoom);
};

// Initialize
Object.entries(socketHandlers).forEach(([event, handler]) => {
  socket.on(event, handler);
});

window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadFiles();
});
