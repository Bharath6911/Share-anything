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
    alert(`You joined room: ${roomName}`);
    document.getElementById('sharedTexts').innerHTML = ''; // Clear previous texts
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
  console.log(`Room: ${room}, Members: ${members}`);
  alert(`Room: ${room}\nMembers online: ${members}`);
});
