import "@fortawesome/fontawesome-free/css/all.css";
import "../css/layout.css";
import "@picocss/pico/css/pico.min.css";
import { readCSV, CSV_Data } from "./csv";

// DOM elements
const dataInfoElement = document.getElementById("data-info");
const tableContentElement = document.getElementById("table-content");
const selectedColumnInfoElement = document.getElementById("column-info"); // Added column-info element

// Table state
interface TableState {
  activeColumn: string | null;
  sortOrder: "asc" | "desc" | null;
}

let tableState: TableState = {
  activeColumn: null,
  sortOrder: null,
};
let csvData: CSV_Data = [];
// Event listener for the file input change event
document.getElementById("file-input")?.addEventListener("change", async (event) => {
  try {
    if (event.target instanceof HTMLInputElement) {
      csvData = await readCSV(event); // Assuming readCSV updates csvData
      const numRows = csvData.length.toString();
      const file = event.target.files?.[0];
      const fileSize = file?.size;
      const fileName = file?.name || "";
      const fileType = file?.type || "N/A";

      const htmlContent = generateDataInfoHTML(numRows, fileSize, fileName, fileType);

      if (dataInfoElement) {
        dataInfoElement.innerHTML = htmlContent;
      }
      renderCSVTable(csvData);
    }
  } catch (error) {
    console.error("Error reading CSV:", error);
  }
});

// Function to generate the HTML content for the data-info container
function generateDataInfoHTML(numRows: string, fileSize: number | undefined, fileName: string, fileType: string): string {
  return `
    <div>
      <strong>File Name</strong>
      <div>${fileName}</div>
    </div>
    <div>
      <strong>File Type</strong>
      <div>${fileType}</div>
    </div>
    <div>
      <strong>File Size</strong>
      <div>${fileSize ? `${fileSize} bytes` : "N/A"}</div>
    </div>
    <div>
      <strong>Number of Rows</strong>
      <div>${numRows}</div>
    </div>
  `;
}

// Function to render the CSV data in an HTML table
function renderCSVTable(csvData: CSV_Data) {
  const table = document.createElement("table");

  if (csvData.length === 0) {
    const noDataMessage = document.createElement("p");
    noDataMessage.textContent = "No data available.";
    if (tableContentElement) {
      tableContentElement.innerHTML = '';
      tableContentElement.appendChild(noDataMessage);
    }
    return;
  }

  const headerRow = table.createTHead().insertRow();
  const columnNames = Object.keys(csvData[0] || {});
  columnNames.forEach((columnName) => {
    const th = document.createElement("th");
    th.textContent = columnName;
    th.classList.add("sortable");
    if (tableState.activeColumn === columnName) {
      th.classList.add("active", tableState.sortOrder || "");
    }
    headerRow.appendChild(th);
  });

  const tableBody = table.createTBody();
  csvData.forEach((rowData) => {
    const row = tableBody.insertRow();
    columnNames.forEach((columnName) => {
      const cell = row.insertCell();
      cell.textContent = (rowData as Record<string, unknown>)[columnName]?.toString() || "";
      cell.setAttribute("data-column", columnName);
    });
  });

  if (tableContentElement) {
    tableContentElement.innerHTML = '';
    tableContentElement.appendChild(table);
  }

  // Event listener for table header clicks
  table.querySelector("thead")?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement) {
      const clickedColumn = event.target.textContent;
      if (clickedColumn) {
        if (tableState.activeColumn === clickedColumn) {
          tableState.sortOrder = tableState.sortOrder === "asc" ? "desc" : "asc";
        } else {
          tableState.activeColumn = clickedColumn;
          tableState.sortOrder = "asc";
        }
        sortTableByColumn(clickedColumn, tableState.sortOrder);
        
        // Display selected column info in the card
        displaySelectedColumnInfo(clickedColumn);
      }
    }
  });
}

// Function to display information about the selected column
function displaySelectedColumnInfo(columnName: string) {
  const columnInfo = getColumnInfo(columnName);
  if (selectedColumnInfoElement) {
    selectedColumnInfoElement.innerHTML = `
      <h2>Selected Column Info</h2>
      <div><strong>Selected Column</strong></div>
      <div>${columnName}</div>
      <div><strong>Data Type</strong></div>
      <div>${columnInfo.dataType}</div>
      <div><strong>Different Entries</strong></div>
      <div>${columnInfo.numEntries}</div>
      ${columnInfo.minValue !== undefined ? `<div><strong>Min</strong></div> 
      <div>${columnInfo.minValue}</div>` : ''}
      ${columnInfo.maxValue !== undefined ? `<div><strong>Max</strong></div> 
      <div>${columnInfo.maxValue}</div>` : ''}
    `;
  }
}

// Function to get column information
// Function to get column information
function getColumnInfo(columnName: string) {
  const columnData = Array.from(document.querySelectorAll(`[data-column="${columnName}"]`)).map((cell) => cell.textContent);
  
  // Filter out null values from columnData with type assertion
  const filteredColumnData = columnData.filter((value): value is string => value !== null);

  const dataType = detectColumnType(filteredColumnData);
  let numEntries = 0;
  let minValue: number | undefined;
  let maxValue: number | undefined;

  if (dataType === "string") {
    numEntries = new Set(filteredColumnData).size;
  } else if (dataType === "number") {
    const numberValues = filteredColumnData.map((value) => parseFloat(value)).filter((value) => !isNaN(value));
    numEntries = numberValues.length;
    minValue = Math.min(...numberValues);
    maxValue = Math.max(...numberValues);
  }

  return {
    dataType,
    numEntries,
    minValue,
    maxValue,
  };
}




// Function to detect the data type of a column
function detectColumnType(data: string[]): "string" | "number" {
  const isNumber = (value: string) => !isNaN(parseFloat(value));

  if (data.every(isNumber)) {
    return "number";
  } else {
    return "string";
  }
}

// Function to sort the table by column
function sortTableByColumn(column: string, order: "asc" | "desc") {
  const table = document.querySelector("table");
  if (!table) return;

  const tableBody = table.querySelector("tbody");
  const rows = Array.from(tableBody?.querySelectorAll("tr") || []);

  rows.sort((a, b) => {
    const valueA = a.querySelector(`[data-column="${column}"]`)?.textContent || "";
    const valueB = b.querySelector(`[data-column="${column}"]`)?.textContent || "";

    if (order === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  for (const row of rows) {
    tableBody?.appendChild(row);
  }

  const headerCells = Array.from(table.querySelector("thead")?.querySelectorAll("th") || []);
  headerCells.forEach((cell) => {
    cell.classList.remove("active", "asc", "desc");
  });

  const activeHeader = headerCells.find((cell) => cell.textContent === column);
  if (activeHeader) {
    activeHeader.classList.add("active", order);
  }
}

// Load the table state from localStorage on page load
const savedState = localStorage.getItem("tableState");
if (savedState) {
  tableState = JSON.parse(savedState);
  if (tableState.activeColumn && tableState.sortOrder) {
    sortTableByColumn(tableState.activeColumn, tableState.sortOrder);
    displaySelectedColumnInfo(tableState.activeColumn); // Display info for the last active column
  }
}

// Add an event listener to the filter input
const filterInput = document.getElementById("filter") as HTMLInputElement;

filterInput.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) {
    const filterValue = event.target.value;
    // Create a custom event to inform the table about the filter criteria
    const filterEvent = new CustomEvent("filter-changed", { detail: filterValue });
    document.dispatchEvent(filterEvent);
  }
});
// Update the rendering function to filter and display only matching rows
document.addEventListener("filter-changed", (event) => {
  const filterValue = (event as CustomEvent).detail;

  if (tableState.activeColumn && typeof tableState.activeColumn === "string") {
    const column = tableState.activeColumn;
    const filteredData = csvData.filter((row: Record<string, unknown>) => {
      const cellValue = (row[column]?.toString() || "").toLowerCase(); // Use the nullish coalescing operator
      return cellValue.includes(filterValue.toLowerCase());
    });
    renderCSVTable(filteredData);
  }
});
