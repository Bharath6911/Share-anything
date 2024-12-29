const socket = io(); // Connect to the WebSocket server

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
    data.texts.forEach((item) => {
      const textList = document.getElementById('sharedTexts');
      const listItem = document.createElement('li');
      listItem.textContent = item.text;
      textList.appendChild(listItem);
    });
  });

// Listen for shared texts from the server
socket.on('textShared', (data) => {
  const textList = document.getElementById('sharedTexts');
  const listItem = document.createElement('li');
  listItem.textContent = data.text;
  textList.appendChild(listItem);
});


// Listen for expired texts and remove them from the list
socket.on('expiredTextRemoved', (data) => {
    const textList = document.getElementById('sharedTexts');
    const items = textList.querySelectorAll('li');
    items.forEach((item) => {
      if (item.textContent === data.text) {
        textList.removeChild(item); // Remove expired text from the list
      }
    });
  });