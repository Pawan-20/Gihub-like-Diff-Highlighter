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

To compare and highlight differences between objects, make sure to **JSON.stringify** the objects before running the comparison. The tool will then highlight all value changes between the two data sets.
