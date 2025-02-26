import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import ViteExpress from "vite-express";

// Create an Express application
const app = express();

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/my-uploads',
    filename: function (_req, file, callback) {
      // Set the filename to the original name of the uploaded file
      callback(null, file.originalname);
    },
  }),
});

// Example route that returns a simple JSON message
app.get("/hello", async function (_req, res) {
  res.status(200).json({ message: "Hello World!" });
});

// Route to handle file uploads
app.post("/upload", upload.single('file'), function (_req, res) {
  // Respond with a JSON message indicating successful file upload
  res.status(200).json({ message: "File uploaded successfully" });
});

// Route to get information about all uploaded files
app.get("/files", async function (_req, res) {
  try {
    // Read the list of files in the '/tmp/my-uploads' directory
    const files = await fs.readdir('/tmp/my-uploads');
    // Get details (filename, size, and creation time) for each file
    const fileDetails = await Promise.all(files.map(async (file) => {
      const stat = await fs.stat(path.join('/tmp/my-uploads', file));
      return {
        filename: file,
        size: stat.size,
        createdAt: stat.birthtime,
      };
    }));
    // Respond with the list of file details as JSON
    res.status(200).json(fileDetails);
  } catch (error) {
    // Handle errors and respond with a 500 Internal Server Error
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get the content of a specific file
app.get("/files/:filename", async function (req, res) {
  const filename = req.params.filename;
  const filePath = path.join('/tmp/my-uploads', filename);

  try {
    // Read the content of the specified file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // Parse the CSV content into a 2D array
    const parsedCsv = parseCsv(fileContent);
    // Respond with the parsed CSV data as JSON
    res.status(200).json(parsedCsv);
  } catch (error) {
    // Handle errors and respond with a 500 Internal Server Error
    console.error(`Error fetching content of file ${filename}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a specific file
app.delete("/files/:filename", async function (req, res) {
  const filename = req.params.filename;
  const filePath = path.join('/tmp/my-uploads', filename);

  try {
    // Delete the specified file
    await fs.unlink(filePath);
    // Respond with a JSON message indicating successful file deletion
    res.status(200).json({ message: `File ${filename} deleted successfully` });
  } catch (error) {
    // Handle errors and respond with a 500 Internal Server Error
    console.error(`Error deleting file ${filename}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to parse CSV content into a 2D array
const parseCsv = (csvContent: string): string[][] => {
  return csvContent.split('\n').map(row => row.split(','));
};

// Start the server and listen on port 5173
ViteExpress.listen(app, 5173, () =>
  console.log("Server is listening on http://localhost:5173"),
);
