
📋 QTask Manager

A feature-rich task management web application built entirely with vanilla JavaScript, showcasing clean code architecture and modern web development practices.

📖 Project Overview
QTask Manager is a fully functional web-based task tracker that demonstrates:
- JavaScript fundamentals
- Object-Oriented Programming
- Responsive Web Design
- Pure DOM Manipulation — No external frameworks

It’s an all-in-one solution for managing your daily tasks in a structured and interactive way.

✨ Key Features

Core Functionality
- CRUD Operations – Add, edit, delete, and manage tasks
- Emoji-Based Categories:
  👤 Personal  💼 Work  🚨 Urgent  🎓 Education  💚 Health
- Priority Levels – Visual highlights for Low, Medium, High
- Completion Tracking – Mark tasks complete with strike-through

Advanced Features
- Real-Time Filtering by category and status
- Smart Search – Search tasks by title or description
- Notification System – Alerts for high-priority tasks
- Dark/Light Theme Toggle – Remembers your preference
- Responsive Design – Mobile to desktop compatibility
- Local Storage – Keeps your data even after refreshing
- Input Validation – Clean data and user feedback
- Confirmation Modals – User-friendly action confirmations

🛠 Technologies Used
- HTML5 – Semantic, accessible markup
- CSS3 – Flexbox, Grid, animations, media queries
- Vanilla JavaScript (ES6+) – Modern syntax and best practices
- Local Storage API – For persistent data
- No Libraries or Frameworks – 100% custom code

🏗 Architecture & Code Structure

Object-Oriented Design
- Task class – Defines individual task properties and methods
- TaskManager class – Central logic for managing all tasks

Key Concepts Demonstrated
- Event-Driven Architecture
- Dynamic DOM Manipulation
- Form Validation & Error Handling
- State Management with LocalStorage

🚀 Getting Started

Prerequisites
- A modern browser (Chrome, Firefox, Edge, Safari)

Installation
1. git clone https://github.com/pateldeep999/QTask-Manager.git
2. cd QTask-Manager

Launch the App
Option 1 – Open index.html directly in your browser
Option 2 – Use a local server:
   # Python 3
   python -m http.server 8000
   # Node.js (with live-server installed)
   npx live-server

Then open: http://localhost:8000

💡 Usage Guide

Adding a Task
1. Click “Add Task”
2. Enter details: Title, Description, Category, Priority
3. Click “Save” to add it to your task list

Managing Tasks
- Edit – Click the edit icon
- Delete – Click delete icon (with confirmation)
- Complete – Check the box to mark complete
- Filter – By category or status
- Search – Find tasks by keywords

Customization
- Toggle between Light and Dark themes
- Categories are color-coded
- High-priority tasks are highlighted

📚 Learning Outcomes
- JavaScript (ES6+), OOP, DOM APIs
- Event Handling & State Management
- Responsive, Mobile-First Design
- LocalStorage for data persistence
- Clean, maintainable code structure

📱 Responsive Design
Optimized for:
- Mobile (320px+)
- Tablets (768px+)
- Desktops (1024px+)

