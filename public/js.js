const socket = io('https://share-anything.onrender.com'); // Connect to the WebSocket server

// Handle form submission
const form = document.getElementById('textForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('textInput');
  const text = input.value.trim();

  if (text.length > 0) {
    socket.emit('shareText', { text }); // Emit text to the server
  }

  input.value = ''; // Clear the input field
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
    }).catch((err) => console.error('Failed to copy text: ', err));
  });

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.marginLeft = '10px';
  deleteButton.addEventListener('click', () => {
    socket.emit('deleteText', { text }); // Notify server to delete text
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
socket.on('initialSharedTexts', (data) => addSharedTexts(data.texts));
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = createListItem(data.text);
  textList.appendChild(listItem);
});
socket.on('textDeleted', (data) => removeTextFromList(data.text));
socket.on('expiredTextRemoved', (data) => removeTextFromList(data.text));
