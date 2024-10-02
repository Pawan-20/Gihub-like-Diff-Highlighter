import React from "react";
import { diffWordsWithSpace } from "diff";
const newValue = `<p>hello I am a paragraph</p><table style="width: 100%;">
<tbody>
<tr>
<td>Column1</td>
<td>Column2</td>
<td>Column3</td>
</tr>
<tr>
<td>r1c1</td>
<td>r1c2</td>
<td>r1c3</td>
</tr>
<tr>
<td>r2c1</td>
<td>r2c2</td>
<td>r2c3</td>
</tr>
</tbody>
</table>`;

const oldValue = `<table class="table table-striped" style="width: 100%; background-color: #ff0000;">
  <tbody>
    <tr>
      <td>Laws</td>
      <th>Followed By them (true or false)</th>
      <td>teeny tiny column</td>
    </tr>
    <tr>
      <td>Employee Welfare schemes</td>
      <td>true</td>
      <td>test</td>
    </tr>
    <tr>
      <td>Insurance</td>
      <td>false</td>
      <td></td>
    </tr>
    <tr>
      <td>Security</td>
      <td>false</td>
      <td>test</td>
    </tr>
  </tbody>
</table>`;

// Utility function to decode HTML entities -> needed this to remove the &nbsp things
function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

// Utility function to split HTML into chunks (tables and non-tables) ->
// returns an array of objects with type, content, and id properties, so if my editor had one p and one table , it will split it into 2 objects
function splitHtmlIntoChunks(html) {
  const regex = /(<table[\s\S]*?<\/table>)/g;
  const chunks = html.split(regex);
  return chunks
    .map((chunk, index) => ({
      type: chunk.startsWith("<table") ? "table" : "text",
      content: chunk.trim(),
      id: `chunk-${index}`,
    }))
    .filter((chunk) => chunk.content !== "");
}

// Component to highlight changes in text content. This is used for both text and table cells
const TextDiff = ({ oldText, newText }) => {
  const diff = diffWordsWithSpace(
    decodeHTMLEntities(oldText),
    decodeHTMLEntities(newText)
  );

  return (
    <div>
      {diff.map((part, index) => {
        const style = part.added
          ? { backgroundColor: "#d4edda" }
          : part.removed
          ? { backgroundColor: "#f8d7da", textDecoration: "line-through" }
          : {};
        return (
          <span
            key={index}
            style={style}
            dangerouslySetInnerHTML={{ __html: part.value }}
          />
        );
      })}
    </div>
  );
};

// Component to highlight changes in table content
const TableDiff = ({ oldTable, newTable }) => {
  const oldRows = extractRows(oldTable);
  const newRows = extractRows(newTable);
  // oldRows and newRows will be an array containing all the cell's content. Structure will be like this [["content of r1c1","content of r1c2"],["content of r2c1","content of r2c2"]]
  const maxRows = Math.max(oldRows.length, newRows.length);
  const maxCols = Math.max(
    ...oldRows.map((row) => row.length),
    // W.r.t the above line, For example, if oldRows is [[1, 2], [3, 4, 5]], this would produce [2, 3]. ( length of each array in the oldRows)
    ...newRows.map((row) => row.length)
  );

  return (
    <table
      className="table table-striped"
      style={{ width: "100%", backgroundColor: "#ffffff" }}
    >
      <tbody>
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          /* _ gives undefined here. In js we use _ to indicate an unused parameter.
          Array.from : Array.from() creates a new array from an array-like or iterable object if you return something, else it will give an array of undefined.
          so , here we will get an array that will contain maxRows number of elements.

          in other words , it like for(let i=0;i<maxRows;i++) loop only. We will have a nested for loop inside it. 
          */
          <tr key={rowIndex}>
            {Array.from({ length: maxCols }, (_, colIndex) => {
              //  just extracting the content of the each cell in each row
              const oldCellContent =
                oldRows[rowIndex] && oldRows[rowIndex][colIndex]
                  ? oldRows[rowIndex][colIndex]
                  : "";
              const newCellContent =
                newRows[rowIndex] && newRows[rowIndex][colIndex]
                  ? newRows[rowIndex][colIndex]
                  : "";
              const isRemoved =
                !newRows[rowIndex] || !newRows[rowIndex][colIndex];
              const style = isRemoved
                ? { backgroundColor: "#f8d7da", textDecoration: "line-through" }
                : {};

              return (
                <td key={colIndex} style={style}>
                  {isRemoved ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: oldCellContent }}
                    />
                  ) : (
                    // handles a new addition of a cell or any changes in the existing cell's content 
                    <TextDiff
                      oldText={oldCellContent}
                      newText={newCellContent}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Helper function to extract rows from HTML string
function extractRows(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  const rows = dom.querySelectorAll("tr");
  return Array.from(rows).map((row) =>
    Array.from(row.querySelectorAll("td, th")).map((cell) => cell.innerHTML)
  );
}

const HighlightChanges = () => {
  // Render both blocks, then compare and highlight differences
  //  This is the main component
  const oldChunks = splitHtmlIntoChunks(oldValue);
  const newChunks = splitHtmlIntoChunks(newValue);
  // chunks will be array of objects and each object will have type(text or table), content, id as keys

  return (
    <div>
      <h1>Content with Highlighted Changes</h1>
      {/* 
      Here , when we are iterating over newChunks , if we find the same chunk type , we remove it from the oldChunks array so that it is not considered again in the next iteration. So if
      1) oldChunks>newChunks ( implying that a lot of content was removed) : Once we are done iterating over newChunks, oldChunks will contain all the chunks that were removed.
      2) oldChunks<newChunks ( implying that a lot of content was added) : In this case, oldChunks will be empty.
      */}
      {newChunks.map((newChunk, index) => {
        const oldChunk = oldChunks.find(
          (chunk) => chunk.type === newChunk.type
        );
        if (oldChunk) {
          oldChunks.splice(oldChunks.indexOf(oldChunk), 1);
          // If a matching oldChunk was found, this line removes it from the oldChunks array Doing this so as to mark the marked old chunk as processed.
        }
        return (
          <div key={newChunk.id}>
            {newChunk.type === "table" ? (
              <TableDiff
                oldTable={oldChunk ? oldChunk.content : ""}
                newTable={newChunk.content}
              />
            ) : (
              <div style={!oldChunk ? { backgroundColor: "#d4edda" } : {}}>
                <TextDiff
                  oldText={oldChunk ? oldChunk.content : ""}
                  newText={newChunk.content}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* here if anything is left in the oldChunks , it will be displayed as removed content */}
      {oldChunks.map((chunk, index) => (
        <div
          key={`removed-${index}`}
          style={{ backgroundColor: "#f8d7da", textDecoration: "line-through" }}
        >
          <div dangerouslySetInnerHTML={{ __html: chunk.content }} />
        </div>
      ))}
    </div>
  );
};

export default HighlightChanges;
