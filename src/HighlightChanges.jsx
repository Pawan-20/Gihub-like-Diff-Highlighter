import React ,{ useState }  from "react";
import { diffWordsWithSpace } from "diff";
import * as _ from "underscore";


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

function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value; 
}
function splitHtmlIntoChunks(html) {
  if (_.isEmpty(html)) return [];
  const regex = /(<table[\s\S]*?<\/table>)/g;
  const chunks = html.split(regex);
    //divides the html string into different tags. so if your html value contains <p>...<p><table></table>, the  resultant array will look like so : [<p>..</p>, <table>...</table>] ( this regex stops at the first closing </table> tag.)
    // Breakdown of regex : look for the opening table tag , then [\s\S] is  the key part that allows matching any character, including both spaces (\s) and non-spaces (\S).  *?: The *? is a lazy quantifier, meaning it will try to match as few characters as possible while still finding a match for the pattern. By making it lazy (*?), it ensures that the match will stop at the first </table> it finds, thus allowing the regex to work correctly for multiple tables in the input. All the non-table parts will remain as they are.
  return chunks
    .map((chunk, index) => ({
      type: chunk.startsWith("<table") ? "table" : "text",
      content: chunk.trim(),
      id: `chunk-${index}`,
    }))
    .filter((chunk) => chunk.content !== "");
    // This function thus returns an array of objects example : [{type: 'text', content: '<p><strong>Some Text</strong></p>', id: 'chunk-0'},{..}]
}

const TextDiff = ({ oldText, newText }) => {
  const oldDecoded = oldText ? decodeHTMLEntities(oldText) : "";
  const newDecoded = newText ? decodeHTMLEntities(newText) : "";
  const diff = diffWordsWithSpace(oldDecoded, newDecoded);
  
  // diff will be an array of objects. eg : [{count: 6, added: false, removed: false, value: 'Mar 2014'}] ( unchanged content )

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

const TableDiff = ({ oldTable, newTable }) => {
  const oldRows = extractRows(oldTable || "");
  const newRows = extractRows(newTable || "");
  // oldRows and newRows will be 2-d Arrays. All the content of cells be stored as a string in an array.
  // example : [['c1r1','c2r1','c3r1'],['c1r2','c2r2','c3r2']]
  const maxRows = Math.max(oldRows.length, newRows.length);
  const maxCols = Math.max(
    ...oldRows.map((row) => row.length),
    ...newRows.map((row) => row.length)
  );
  //max rows and cols are needed to highlight the new rows or new columns added/removed Math.max([1,2,3,4])=>4. here the spreader operator is being used to merge the two arrays and create a single array.

  // State to track expanded sections
  const [expandedGroups, setExpandedGroups] = useState({});

  // Function to toggle expanding or collapsing unchanged rows for a specific group
  const toggleExpand = (groupId) => {
    setExpandedGroups((prevState) => ({
      ...prevState,
      [groupId]: !prevState[groupId], // Each toggle has a groupId. If open , it is set to true
    }));
  };

  let unchangedRowStart = null; //If there’s a block of unchanged rows, this variable helps in rendering a single toggle button for that block. Now we change it's value only when when we encounter a changed row. So if 2 rows, in a table of three rows are not changed we will keep the variable's value to 1 ( first row ). then when we go to the third changed row , we reset the unchangedStart's value. using the current row's index ( i.e third row , we can caluclate how many rows are unchanged ). 


  const rowsToRender = []; //Holds the rows and toggle buttons that will be rendered. This is the array of JSX elements.

  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const oldRow = oldRows[rowIndex] || [];
    const newRow = newRows[rowIndex] || [];
    const hasChanges = JSON.stringify(oldRow) !== JSON.stringify(newRow);

    // Note : This if-else block won't handle the scneario for a table which has unchanged rows in the end. That is handled by the other seperate block.
    if (!hasChanges) {
      // If rows are unchanged, start the streak. Notice that once the value is assigned , we do not change it until me meet a row that has changed content in it.  
      if (unchangedRowStart === null) unchangedRowStart = rowIndex; // This if condition only tracks the start of  unchanged row streak.
    } else {
      // If we have a block of unchanged rows, render the toggle , calculate the number of unchanged rows and reset the unchangedRows value back to null ( marking the end of the streak ) 
      if (unchangedRowStart !== null) {
        const groupId = `unchanged-${unchangedRowStart}-${rowIndex}`; // each toggle will have a group ID. This was done to fix a bug where if multiple toggles were there in a table , toggling one toggle , effected the rest of the toggles.

        // pushing a single row here containing our toggle ( so column width is spanned to the max cols)
        rowsToRender.push(
          <tr key={`toggle-${unchangedRowStart}`}>
            <td colSpan={maxCols} style={{ cursor: "pointer", color: "blue" }}>
              {!expandedGroups[groupId] ? (
                <span onClick={() => toggleExpand(groupId)}>
                  ▶ Click to show {rowIndex - unchangedRowStart} unchanged rows
                </span>
              ) : (
                <span onClick={() => toggleExpand(groupId)}>
                  ▼ Hide unchanged rows
                </span>
              )}
            </td>
          </tr>
        );

        // If expanded, render all the unchanged rows. ( two loops , we're rendering cells in a row , then repeating this for rowIndex-unchangedRowStart rows )

        if (expandedGroups[groupId]) {
          for (let i = unchangedRowStart; i < rowIndex; i++) {
            rowsToRender.push(
              <tr key={i}>
                {Array.from({ length: maxCols }, (_, colIndex) => (
                  <td key={colIndex}>
                    <span
                      dangerouslySetInnerHTML={{ __html: oldRows[i][colIndex] || "" }}
                    />
                  </td>
                ))}
              </tr>
            );
          }
        }

        // Reset unchanged row start
        unchangedRowStart = null;
      }

      // Render the changed row
      rowsToRender.push(
        <tr key={rowIndex}>
          {Array.from({ length: maxCols }, (_, colIndex) => {
            const oldCellContent = oldRow[colIndex] || "";
            const newCellContent = newRow[colIndex] || "";
            const isRemoved = !newRow[colIndex];

            const style = isRemoved
              ? { backgroundColor: "#f8d7da", textDecoration: "line-through" }
              : {};

            return (
              <td key={colIndex} style={style}>
                {isRemoved ? (
                  <span dangerouslySetInnerHTML={{ __html: oldCellContent }} />
                ) : (
                  <TextDiff oldText={oldCellContent} newText={newCellContent} />
                )}
              </td>
            );
          })}
        </tr>
      );
    }
  }

  // to handle the edge case where there are unchanged rows in the end. The above code handles till we find a changed row. ( when we find a changed row , we reset unchangedRowStart), so the code never reaches inside this if block. however if say the second last row is unchanged. so in the second last row we change unchangedRowStart to secondLastRow's index. 

  //After the loop has ended but the streak is still on : 
  if (unchangedRowStart !== null) {
    const groupId = `unchanged-${unchangedRowStart}-end`;
    rowsToRender.push(
      <tr key={`toggle-${unchangedRowStart}-end`}>
        <td colSpan={maxCols} style={{ cursor: "pointer", color: "blue" }}>
          {!expandedGroups[groupId] ? (
            <span onClick={() => toggleExpand(groupId)}>
              ▶ Click to show {maxRows - unchangedRowStart} unchanged rows
            </span>
          ) : (
            <span onClick={() => toggleExpand(groupId)}>▼ Hide unchanged rows</span>
          )}
        </td>
      </tr>
    );

    if (expandedGroups[groupId]) {
      for (let i = unchangedRowStart; i < maxRows; i++) {
        rowsToRender.push(
          <tr key={i}>
            {Array.from({ length: maxCols }, (_, colIndex) => (
              <td key={colIndex}>
                <span dangerouslySetInnerHTML={{ __html: oldRows[i][colIndex] || "" }} />
              </td>
            ))}
          </tr>
        );
      }
    }
  }

  return (
    <table className="table table-striped" style={{ width: "100%" }}>
      <tbody>{rowsToRender}</tbody>
    </table>
  );
};

function extractRows(html) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  const rows = dom.querySelectorAll("tr");
  return Array.from(rows).map((row) =>
    Array.from(row.querySelectorAll("td, th")).map((cell) => cell.innerHTML)
  );
}

const HighlightChanges = () => {
  const oldChunks = splitHtmlIntoChunks((oldValue));
  const newChunks = splitHtmlIntoChunks((newValue));

  // State to store which sections are collapsed or expanded
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  // Toggle the visibility of unchanged content
  const toggleExpandSection = (id) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleExpandRow = (rowIndex) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [rowIndex]: !prevState[rowIndex],
    }));
  };

  return (
    <div>
      <h1>Content with Highlighted Changes</h1>
      {newChunks.map((newChunk, index) => {
        const oldChunk = oldChunks.find((chunk) => chunk.type === newChunk.type);
        // If oldChunk is not found , it will be undefined.
        if (oldChunk) {
          // remove that chunk from the oldChunks array. This is done to achieve two things : 1) optimization 2) in the end only removed chunks/content will be in the oldChunks array
          oldChunks.splice(oldChunks.indexOf(oldChunk), 1);
        }

        const isCollapsed = !expandedSections[newChunk.id];

        return (
          <div key={newChunk.id}>
            {newChunk.type === "table" ? (
              <TableDiff
                oldTable={oldChunk ? oldChunk.content : ""}
                newTable={newChunk.content}
                expandedSections={expandedRows}
                toggleExpand={toggleExpandRow}
              />
            ) : (
              // when size of newChunk > oldChunk , some oldChunk will be undefined implying that the content is new.
              <div style={!oldChunk ? { backgroundColor: "#d4edda" } : {}}>
                {/* If content is unchanged, show a button to toggle its visibility */}
                {oldChunk && !_.isEqual(oldChunk.content, newChunk.content) ? (
                  <TextDiff
                    oldText={oldChunk.content}
                    newText={newChunk.content}
                  />
                ) : (
                  <div>
                    {!isCollapsed ? (
                      <TextDiff
                        oldText={oldChunk ? oldChunk.content : ""}
                        newText={newChunk.content}
                      />
                    ) : (
                      <div style={{ cursor: "pointer", color: "blue", marginLeft:"12px" }}>
                        <span onClick={() => toggleExpandSection(newChunk.id)}>
                          ▶ Click to show unchanged content
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

 {/* Once the above loop is done  , only the removed chunks in the oldChunks array will remain. just show them with a red background color */}
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