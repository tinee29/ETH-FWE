# Interactive HTML with TS

This task involves creating a data explorer application where users can upload a CSV file and explore its data. The application is built using **TypeScript** for DOM manipulation and state management, with **HTML** and **CSS** for the user interface.

## What the Code Implements

- **File Upload and Data Display**: Users can upload a CSV file, and the application displays file details (name, size, number of rows) and the data in an HTML table.
- **Interactive Table**: The table supports sorting by column (ascending/descending) and filtering based on user input.
- **Column Information**: Displays details about the selected column, including data type, number of unique entries, and min/max values for numeric columns.
- **State Persistence**: The table state (active column, sort order) is persisted across page reloads.

---

# Local Testing

## Run Container for Local Testing

```bash
docker build -t my-webapp .

docker run -it --rm -p 5173:5173 my-webapp
