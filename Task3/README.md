# React & Backend

This task involves extending the data explorer application by integrating a backend for file storage and real-time updates. The frontend is built using **React**, while the backend is implemented with **Express.js** and **Node.js**. The application allows users to upload CSV files, view their content, and interact with the data in real-time.

## What the Code Implements

- **File Upload and Storage**: Users can upload CSV files, which are stored on the server.
- **File Listing**: The application displays a list of uploaded files, including their names and upload timestamps.
- **Data Table**: Users can select a file to view its content in an interactive table with sorting functionality.
- **Real-Time Updates**: The application uses **Server-Sent Events (SSE)** to update the UI in real-time when files are uploaded or deleted.
- **Loading Indicators**: A loading indicator is shown while data is being fetched or processed.

---

## Client Side

All client-side files are located in the `src/client` directory.

## Server Side

All server-side files are located in the `src/server` directory.

# Local Testing

## Run Container for Local Testing

```bash
docker build -t my-webapp .

docker run -it --rm -p 5173:5173 my-webapp
