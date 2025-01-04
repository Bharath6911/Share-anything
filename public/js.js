const socket = io('https://share-anything.onrender.com'); // Connect to the server
let currentRoom = null;

const roomForm = document.getElementById('roomForm');
roomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const roomInput = document.getElementById('roomInput');
  const roomName = roomInput.value.trim();

  if (roomName) {
    currentRoom = roomName;
    socket.emit('joinRoom', roomName);
    alert(`You joined room: ${roomName}`);
    document.getElementById('sharedTexts').innerHTML = '';
    document.getElementById('sharedFiles').innerHTML = '';
  }
});

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

const fileForm = document.getElementById('fileForm');
fileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file && currentRoom) {
    const formData = new FormData();
    formData.append('file', file);

    fetch(`/upload?room=${currentRoom}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('File shared successfully!');
        } else {
          alert('File upload failed.');
        }
      })
      .catch((error) => console.error('Error uploading file:', error));
  }
});

// Update UI with shared texts
socket.on('initialRoomData', ({ texts, files }) => {
  addSharedTexts(texts);
  addSharedFiles(files);
});

socket.on('textShared', ({ text }) => {
  addSharedTexts([{ text }]);
});

socket.on('fileShared', (file) => {
  addSharedFiles([file]);
});

// Functions for rendering files
function addSharedFiles(files) {
  const fileList = document.getElementById('sharedFiles');
  files.forEach(({ fileName, filePath }) => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = filePath;
    link.textContent = fileName;
    link.target = '_blank';
    listItem.appendChild(link);
    fileList.appendChild(listItem);
  });
}
