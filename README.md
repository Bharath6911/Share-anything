# **Incident Room**

**Live demonstration:** [Go to Incident Room](https://share-anything.onrender.com/)

---

## **About the Project**

Incident Room is a lightweight collaboration tool for cloud and operations teams. It keeps one incident in one room so logs, screenshots, short updates, and handoff notes stay grouped together.

The project leverages **Node.js** for the back-end, **Socket.IO** for real-time room updates, and free-tier cloud services so it stays useful without a paid stack.

---

## **Features**

### **Room-Based Communication:**
- Users join a named incident room and coordinate in real time.
- Real-time updates keep everyone aligned on the same incident timeline.

### **File Upload and Sharing:**
- Upload logs, screenshots, PDFs, and other incident evidence with **Cloudinary**.
- Support for **Multer** and **multer-storage-cloudinary** in the back-end.

### **Text Sharing and Management:**
- Share and manage incident updates with copy and delete actions.
- Real-time updates show new notes and deletions as they happen.

### **User-Friendly Interface:**
- Designed with a clean incident-response workflow so it feels closer to a real cloud-ops tool.

---

## **Tech Stack**

- **Front-End:** Static Web Pages (HTML, CSS, JavaScript)
- **Back-End:** Node.js with Express.js
- **File Storage:** Cloudinary (for file uploads)
- **File Handling:** Multer with Multer-Storage-Cloudinary
- **Database:** MongoDB (for storing shared content metadata)
- **Hosting:** Render.com (for deployment)

---

## **Why We Built This**

This project was created to explore:

1. **Incident collaboration:** How teams can coordinate around one room during outages or handoffs.
2. **Real-time communication:** How WebSockets can keep room state synchronized.
3. **Free-tier cloud integration:** How Cloudinary, MongoDB Atlas, Render, and Hugging Face can power a useful demo without paid infrastructure.

---

## **Setup and Installation**

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Bharath6911/Share-anything.git
   cd Share-anything
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add your MongoDB and Cloudinary credentials.(You can't use my credentials because i did not buy the mangoDB altas or cloudinary)
   ```plaintext
   MONGODB_URI=your_mongodb_connection_string
   CLOUD_NAME=your_cloud_name
   CLOUD_API_KEY=your_api_key
   CLOUD_API_SECRET=your_api_secret
   ```

4. Start the application:
   ```bash
   npm start
   ```

The app will be running locally at `http://localhost:3000`.

---

## **Future Improvements**

- **Incident summaries:** Auto-generate a short summary when the room closes.
- **Better room lifecycle:** Add archived incidents and search.
- **Authentication:** Add lightweight sign-in for private incident rooms.
- **File handling:** Add cleaner previews for screenshots and logs.

---

Feel free to suggest any improvements or report issues!

---
