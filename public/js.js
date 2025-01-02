const socket = io('https://share-anything.onrender.com'); // Connect to the WebSocket server

// Handle form submission
const form = document.getElementById('textForm');
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const input = document.getElementById('textInput');
  const text = input.value;

  // Emit the text to the server
  socket.emit('shareText', { text });

  // Clear the input field
  input.value = '';
});

// Listen for initial shared texts from the server
socket.on('initialSharedTexts', (data) => {
  const textList = document.getElementById('sharedTexts');
  data.texts.forEach((item) => {
    const listItem = document.createElement('li');

    // Use <pre> for preformatted text to preserve line breaks
    const pre = document.createElement('pre');
    pre.textContent = item.text;

    listItem.appendChild(pre);
    textList.appendChild(listItem);
  });
});

// Listen for shared texts from the server
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = document.createElement('li');

  // Use <pre> for preformatted text to preserve line breaks
  const pre = document.createElement('pre');
  pre.textContent = data.text;

  listItem.appendChild(pre);
  textList.appendChild(listItem);
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
