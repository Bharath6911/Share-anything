# **Share-Anything**

**Live demonstration:** [Go to Share-Anything](https://share-anything.onrender.com/)

---

## **About the Project**

Share-Anything is a simple and efficient web service designed to facilitate seamless sharing of files, texts, and other content. The service is hosted on Render.com, chosen for its affordability, user-friendly interface, and free-tier hosting capabilities.

The project leverages **Node.js** for the back-end to handle communication and data management, enabling real-time sharing of content across multiple browsers in the same room.

---

## **Features**

### **Room-Based Communication:**
- Users can join specific rooms and share content with up to 10 people simultaneously.
- Real-time updates and interactions with other members in the same room.

### **File Upload and Sharing:**
- Upload and share files such as images, documents, and other media with integrated support for **Cloudinary** to store and serve files.
- Support for **Multer** for file handling in the back-end.

### **Text Sharing and Management:**
- Share and manage texts within rooms with options to copy, delete, or view them.
- Real-time updates to show new texts and deletions as they happen.

### **User-Friendly Interface:**
- Designed with a simple and easy-to-use interface, allowing users to quickly engage in communication and content sharing.

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

This project was created as a learning experience to understand:

1. **Communication Protocols:** How data is transferred efficiently between users in real time using WebSockets.
2. **Static Web Integration:** How static web pages can be seamlessly combined with Node.js modules for back-end functionality.
3. **Cloud Storage Integration:** How Cloudinary and Multer can be used for managing and serving files uploaded by users.

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

- **Scalability:** Improve room handling to support more than 10 users in a room.
- **Authentication:** Implement user authentication for better control over file and text sharing.
- **File Type Support:** Add support for more file types beyond images (e.g., audio, video).

---

Feel free to suggest any improvements or report issues!

---
