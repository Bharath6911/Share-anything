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
  }
});

// Handle text form submission
const textForm = document.getElementById('textForm');
textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('textInput');
  const text = input.value.trim();

  if (text) {
    socket.emit('shareText', { text, roomName: currentRoom }); // Emit to server with room info
    input.value = '';
  }
});

// Add text to the shared list
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
    socket.emit('deleteText', { text, roomName: currentRoom });
  });

  listItem.appendChild(pre);
  listItem.appendChild(copyButton);
  listItem.appendChild(deleteButton);

  return listItem;
}

// Listen for shared texts
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = createListItem(data.text);
  textList.appendChild(listItem);
});

// Listen for deleted texts
socket.on('textDeleted', (data) => {
  const textList = document.getElementById('sharedTexts');
  const items = textList.querySelectorAll('li');

  items.forEach((item) => {
    const pre = item.querySelector('pre');
    if (pre && pre.textContent === data.text) {
      textList.removeChild(item);
    }
  });
});

// Listen for room members
socket.on('roomMembers', (data) => {
  const { room, members } = data;
  console.log(`Room: ${room}, Members: ${members}`);
  alert(`Room: ${room}\nMembers: ${members.length}`);
});
