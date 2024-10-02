# Git Difference Highlighter

## Project Overview

This project is a **Git Difference Highlighter** that effectively highlights differences between values, such as strings, numbers, or floats. It is versatile and can be integrated into any existing project, particularly in admin dashboards where tracking changes is essential.

The tool is especially useful for **WYSIWYG editors** or any scenario where you need to compare object values. To detect and display differences, the objects must be **JSON-stringified**.

## Key Features

- **Highlights value differences** between objects.
- Compatible with **strings, numbers, floats**, and more.
- Works with content from **WYSIWYG editors** or any comparable data format.
- Easy integration into existing projects, providing administrators with insight into **who changed what**.

## Use Case

This tool is designed to be integrated into projects that require detailed change tracking. A typical use case is in an **admin dashboard**, where administrators can view **who changed specific values**. For example, in a multi-user system, an admin can see which superuser or any authorized user has made modifications to particular data points.

## Integration Instructions

Pass the Values and newValues to the HighlightChanges component. Currently the values are hard coded. Here's  a demo of how to integrate this component: 

- Define a function to check whether a value is an HTML string (such as one from a WYSIWYG editor) or not. If the value is an HTML string, pass it directly; otherwise, convert it to a string using `JSON.stringify` before passing.

```javascript
function isHTMLString(value) {
  const htmlPattern = /<\/?[a-z][\s\S]*>/i; // Matches any opening or closing tag
  return htmlPattern.test(value);
}
``` 
 - Simply then just use this function : 

```javascript 
<HighlightChanges 
  oldValue={isHTMLString(change.oldValue) ? change.oldValue : JSON.stringify(change.oldValue)} 
  newValue={isHTMLString(change.newValue) ? change.newValue : JSON.stringify(change.newValue)} 
/>
```