import React, { useState, useEffect } from "react";
import "./App.css";
import Layout from "./Layout";

// Define types for the state and data structures
type TableState = {
  activeColumn: number | null;
  isAscending: boolean;
};

type FileInfo = {
  filename: string;
  createdAt: string;
};

type FileContextType = {
  selectedFile: string | null;
  selectFile: (filename: string) => void;
};

// Create a context for managing file-related state
const FileContext = React.createContext<FileContextType | undefined>(undefined);

function App() {
  // State variables for managing CSV data, table states, file list, loading status, and selected file
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [tableStates, setTableStates] = useState<TableState[]>(
    new Array(0) // Initialize an array to store sorting states for each column
  );

  const [filesList, setFilesList] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Effect to run on component mount
  useEffect(() => {
    // Check if there is any saved table state in local storage
    const savedTableStates = localStorage.getItem("tableStates");
    if (savedTableStates) {
      setTableStates(JSON.parse(savedTableStates));
    }

    // Fetch the initial list of uploaded files
    fetchFilesList();
  }, []);

  // Effect to run when the selected file changes
  useEffect(() => {
    // Load the selected file when it changes
    if (selectedFile) {
      setLoading(true);
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

  // Function to save table state to local storage
  const saveTableStateToLocalStorage = (states: TableState[]) => {
    localStorage.setItem("tableStates", JSON.stringify(states));
  };

  // Event handler for file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Upload the file to the server
        const response = await fetch("http://localhost:5173/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("File uploaded successfully");

          // Fetch the updated file list after successful upload
          fetchFilesList();
        } else {
          console.error("Failed to upload file");
          // Handle upload failure, if needed
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle error, if needed
      }
    }
  };

  // Function to fetch the list of uploaded files
  const fetchFilesList = async () => {
    try {
      const response = await fetch("http://localhost:5173/files");
      if (response.ok) {
        const filesList = await response.json();
        console.log("Files List:", filesList);

        // Update the state with the list of uploaded files
        setFilesList(filesList);
      } else {
        console.error("Failed to fetch files list");
      }
    } catch (error) {
      console.error("Error fetching files list:", error);
    }
  };

  // Function to fetch the content of a specific file
  const fetchFileContent = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:5173/files/${filename}`);
      if (response.ok) {
        const fileContent = await response.json();
        console.log("File Content:", fileContent);

        // Update the state with the loaded CSV data
        setCsvData(fileContent);
      } else {
        console.error("Failed to fetch file content");
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to set the selected file
  const selectFile = (filename: string) => {
    setSelectedFile(filename);
  };

  // Function to format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Event handler for column click in the data table
  const handleColumnClick = (columnIndex: number) => {
    setTableStates((prevStates) => {
      const newStates = prevStates.map((state, index) => ({
        activeColumn: index === columnIndex ? columnIndex : null,
        isAscending: index === columnIndex ? !state.isAscending : state.isAscending,
      }));

      saveTableStateToLocalStorage(newStates);

      return newStates;
    });

    setCsvData((prevCsvData) => {
      const sortedData = [...prevCsvData];
      const isAscending = tableStates[columnIndex]?.isAscending ?? true;

      // Exclude the header row from sorting
      const headerRow = sortedData.shift();

      if (!headerRow) {
        // Handle the case where headerRow is undefined
        return sortedData;
      }

      sortedData.sort((rowA, rowB) => {
        let valueA = rowA[columnIndex] || '';
        let valueB = rowB[columnIndex] || '';

        // Remove double quotes for specific columns
        if (headerRow && ["thema_name", "set_name", "subset_name", "indikator_name"].includes(headerRow[columnIndex])) {
          valueA = valueA.replace(/(^"|"$)/g, '');
          valueB = valueB.replace(/(^"|"$)/g, '');
        }

        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
          return (isAscending ? 1 : -1) * (Number(valueA) - Number(valueB));
        } else {
          return (isAscending ? 1 : -1) * valueA.localeCompare(valueB);
        }
      });

      // Add the header row back to the sorted data
      sortedData.unshift(headerRow);

      return sortedData;
    });
  };

  // Event handler for file deletion
  const handleDeleteFile = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:5173/files/${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log(`File ${filename} deleted successfully`);
        // Fetch the updated file list after successful file deletion
        fetchFilesList();
      } else {
        console.error(`Failed to delete file ${filename}`);
        // Handle failure, if needed
      }
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      // Handle error, if needed
    }
  };

  // JSX structure for the entire component
  return (
    <FileContext.Provider value={{ selectedFile, selectFile }}>
      <Layout>
        <article>
          <header>
            <h2>Select CSV data</h2>
          </header>
          <form id="select-data-form">
            <label htmlFor="file-input" className="custom-file-upload">
              <i className="fa fa-file-csv"></i> Select CSV file to explore
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <small id="fileHelp">
              Please upload a CSV file, where the first row is the header. And the values are comma(,) separated.
            </small>
          </form>
        </article>

        <article>
          <header>
            <h2>Uploaded Files</h2>
          </header>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>File Name</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filesList.map((file, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{file.filename}</td>
                  <td>{formatDate(file.createdAt)}</td>
                  <td>
                    <button onClick={() => selectFile(file.filename)}>Select</button>
                    <button onClick={() => handleDeleteFile(file.filename)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article>
          <header>
            <h2>Data Table</h2>
          </header>
          {loading ? (
            <p>Loading...</p>
          ) : (
            csvData.length > 0 && (
              <table>
                <thead>
                  <tr>
                    {csvData[0]?.map((header, index) => (
                      <th
                        key={index}
                        className={`sortable ${
                          tableStates[index]?.activeColumn === index ? "active" : ""
                        } ${tableStates[index]?.isAscending ? "asc" : "desc"}`}
                        onClick={() => handleColumnClick(index)}
                      >
                        {header}
                        <span className="sort-indicator">
                          {/* Display arrows based on sorting direction */}
                          {tableStates[index]?.isAscending ? " ▲" : " ▼"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </article>
      </Layout>
    </FileContext.Provider>
  );
}

export default App;
