const socket = io('https://share-anything.onrender.com'); // Connect to the WebSocket server

// Handle form submission
const form = document.getElementById('textForm');
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const input = document.getElementById('textInput');
  const text = input.value.trim();

  if (text.length > 0) {
    // Emit the text to the server
    socket.emit('shareText', { text });
  }

  // Clear the input field
  input.value = '';
});

// Function to create a list item with delete button
function createListItem(text) {
  const listItem = document.createElement('li');

  const pre = document.createElement('pre');
  pre.textContent = text;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.marginLeft = '10px';

  // Add delete functionality
  deleteButton.addEventListener('click', () => {
    socket.emit('deleteText', { text }); // Notify server to delete the text
  });

  listItem.appendChild(pre);
  listItem.appendChild(deleteButton);
  return listItem;
}

// Listen for initial shared texts from the server
socket.on('initialSharedTexts', (data) => {
  const textList = document.getElementById('sharedTexts');
  data.texts.forEach((item) => {
    const listItem = createListItem(item.text);
    textList.appendChild(listItem);
  });
});

// Listen for shared texts from the server
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = createListItem(data.text);
  textList.appendChild(listItem);
});

// Listen for deleted texts and remove them from the list
socket.on('textDeleted', (data) => {
  const textList = document.getElementById('sharedTexts');
  const items = textList.querySelectorAll('li');

  items.forEach((item) => {
    const pre = item.querySelector('pre');
    if (pre && pre.textContent === data.text) {
      textList.removeChild(item); // Remove the deleted text from the list
    }
  });
});

// Listen for expired texts and remove them from the list
socket.on('expiredTextRemoved', (data) => {
  const textList = document.getElementById('sharedTexts');
  const items = textList.querySelectorAll('li');

  items.forEach((item) => {
    const pre = item.querySelector('pre');
    if (pre && pre.textContent === data.text) {
      textList.removeChild(item); // Remove expired text from the list
    }
  });
});
