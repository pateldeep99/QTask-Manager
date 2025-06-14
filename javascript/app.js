/**
 * Main Application
 * Handles UI interactions, DOM manipulation, and application state
 */

class QTaskApp {
    constructor() {
        this.taskManager = new TaskManager();
        this.currentEditingTask = null;
        this.currentFilters = {
            search: '',
            category: '',
            priority: '',
            status: ''
        };
        this.currentSort = 'created';
        
        this.initializeApp();
    }

    /**
     * Initializes the application
     */
    initializeApp() {
        this.setupEventListeners();
        this.setupTaskManagerObserver();
        this.loadTheme();
        this.renderTasks();
        this.updateStatistics();
        this.showWelcomeMessage();
    }

    /**
     * Sets up all event listeners
     */
    setupEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Search functionality
        document.getElementById('searchBox').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.renderTasks();
        });

        // Filter functionality
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.renderTasks();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            this.renderTasks();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.renderTasks();
        });

        // Sort functionality
        document.getElementById('sortTasks').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Cancel edit button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Modal functionality
        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.handleModalConfirm();
        });

        document.getElementById('cancelModalBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.hideModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Sets up task manager observer to react to changes
     */
    setupTaskManagerObserver() {
        this.taskManager.addObserver((action, task) => {
            this.handleTaskManagerUpdate(action, task);
        });
    }

    /**
     * Handles task manager updates
     * @param {string} action - The action that was performed
     * @param {Task} task - The task that was affected
     */
    handleTaskManagerUpdate(action, task) {
        this.renderTasks();
        this.updateStatistics();

        // Show notifications for high priority tasks
        if (task && task.isHighPriority()) {
            switch (action) {
                case 'add':
                    this.showNotification('High Priority Task Added!', 
                        `Task "${task.title}" has been added with high priority.`, 'warning');
                    break;
                case 'update':
                    this.showNotification('High Priority Task Updated!', 
                        `Task "${task.title}" has been updated.`, 'warning');
                    break;
                case 'complete':
                    this.showNotification('High Priority Task Completed!', 
                        `Great job! You completed "${task.title}".`, 'success');
                    break;
            }
        } else if (task) {
            // Show general notifications
            switch (action) {
                case 'add':
                    this.showNotification('Task Added', 
                        `Task "${task.title}" has been added successfully.`, 'success');
                    break;
                case 'complete':
                    this.showNotification('Task Completed', 
                        `Task "${task.title}" has been completed.`, 'success');
                    break;
                case 'delete':
                    this.showNotification('Task Deleted', 
                        `Task "${task.title}" has been deleted.`, 'error');
                    break;
            }
        }
    }

    /**
     * Handles form submission for adding/updating tasks
     */
    handleFormSubmit() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        try {
            if (this.currentEditingTask) {
                // Update existing task
                this.taskManager.updateTask(this.currentEditingTask.id, formData);
                this.showNotification('Task Updated', 'Task has been updated successfully.', 'success');
                this.cancelEdit();
            } else {
                // Add new task
                this.taskManager.addTask(
                    formData.title,
                    formData.description,
                    formData.priority,
                    formData.category
                );
                this.clearForm();
            }
        } catch (error) {
            this.showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Gets form data from the task form
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value
        };
    }

    /**
     * Validates form data
     * @param {Object} formData - Form data to validate
     * @returns {boolean} True if valid
     */
    validateFormData(formData) {
        if (!formData.title) {
            this.showNotification('Validation Error', 'Task title is required.', 'error');
            document.getElementById('taskTitle').focus();
            return false;
        }

        if (formData.title.length > 100) {
            this.showNotification('Validation Error', 'Task title cannot exceed 100 characters.', 'error');
            document.getElementById('taskTitle').focus();
            return false;
        }

        if (formData.description.length > 500) {
            this.showNotification('Validation Error', 'Task description cannot exceed 500 characters.', 'error');
            document.getElementById('taskDescription').focus();
            return false;
        }

        return true;
    }

    /**
     * Clears the task form
     */
    clearForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskTitle').focus();
    }

    /**
     * Renders all tasks in the UI
     */
    renderTasks() {
        const tasks = this.taskManager.getFilteredAndSortedTasks(
            this.currentFilters,
            this.currentSort,
            'desc'
        );

        const taskGrid = document.getElementById('taskGrid');
        const emptyState = document.getElementById('emptyState');

        if (tasks.length === 0) {
            taskGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            taskGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            taskGrid.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
        }
    }

    /**
     * Creates HTML for a task card
     * @param {Task} task - The task to create a card for
     * @returns {string} HTML string
     */
    createTaskCard(task) {
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="priority-indicator ${task.getPriorityClass()}"></div>
                
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-category">${task.getCategoryEmoji()} ${task.category}</span>
                </div>

                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}

                <div class="task-meta">
                    <div class="task-priority">
                        <span class="priority-badge ${task.priority}">${task.getPriorityEmoji()} ${task.priority.toUpperCase()}</span>
                    </div>
                    <div class="task-date">
                        Created: ${task.getRelativeCreatedTime()}
                    </div>
                </div>

                <div class="task-status">
                    <span class="status-indicator ${task.completed ? 'status-completed' : 'status-pending'}"></span>
                    <span>${task.completed ? 'Completed' : 'Pending'}</span>
                    ${task.completed ? `<small> - ${task.getRelativeTime(task.completedAt)}</small>` : ''}
                </div>

                <div class="task-actions">
                    <button class="btn btn-success btn-small" onclick="app.toggleTaskCompletion('${task.id}')">
                        ${task.completed ? '↶ Undo' : '✓ Complete'}
                    </button>
                    <button class="btn btn-primary btn-small" onclick="app.editTask('${task.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-warning btn-small" onclick="app.duplicateTask('${task.id}')">
                        📋 Duplicate
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteTask('${task.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Updates task statistics in the UI
     */
    updateStatistics() {
        const stats = this.taskManager.getStatistics();
        
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('highPriorityTasks').textContent = stats.priority.high;
    }

    /**
     * Toggles task completion status
     * @param {string} taskId - ID of the task to toggle
     */
    toggleTaskCompletion(taskId) {
        try {
            this.taskManager.toggleTaskCompletion(taskId);
        } catch (error) {
            this.showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Edits a task
     * @param {string} taskId - ID of the task to edit
     */
    editTask(taskId) {
        const task = this.taskManager.getTaskById(taskId);
        if (!task) {
            this.showNotification('Error', 'Task not found.', 'error');
            return;
        }

        this.currentEditingTask = task;
        
        // Populate form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;

        // Update form UI
        document.getElementById('formTitle').textContent = 'Edit Task';
        document.getElementById('submitBtn').textContent = 'Update Task';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('taskTitle').focus();
    }

    /**
     * Cancels task editing
     */
    cancelEdit() {
        this.currentEditingTask = null;
        this.clearForm();
        
        // Reset form UI
        document.getElementById('formTitle').textContent = 'Add New Task';
        document.getElementById('submitBtn').textContent = 'Add Task';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    /**
     * Duplicates a task
     * @param {string} taskId - ID of the task to duplicate
     */
    duplicateTask(taskId) {
        try {
            this.taskManager.duplicateTask(taskId);
        } catch (error) {
            this.showNotification('Error', error.message, 'error');
        }
    }

    /**
     * Deletes a task with confirmation
     * @param {string} taskId - ID of the task to delete
     */
    deleteTask(taskId) {
        const task = this.taskManager.getTaskById(taskId);
        if (!task) {
            this.showNotification('Error', 'Task not found.', 'error');
            return;
        }

        this.showModal(
            `Are you sure you want to delete the task "${task.title}"?`,
            () => {
                try {
                    this.taskManager.deleteTask(taskId);
                } catch (error) {
                    this.showNotification('Error', error.message, 'error');
                }
            }
        );
    }

    /**
     * Shows a notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error)
     */
    showNotification(title, message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${this.escapeHtml(title)}</div>
            <div class="notification-message">${this.escapeHtml(message)}</div>
        `;

        container.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    /**
     * Shows a confirmation modal
     * @param {string} message - Modal message
     * @param {Function} onConfirm - Callback for confirmation
     */
    showModal(message, onConfirm) {
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modalOverlay').style.display = 'flex';
        this.modalConfirmCallback = onConfirm;
    }

    /**
     * Hides the confirmation modal
     */
    hideModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        this.modalConfirmCallback = null;
    }

    /**
     * Handles modal confirmation
     */
    handleModalConfirm() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
        }
        this.hideModal();
    }

    /**
     * Toggles between light and dark theme
     */
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙 Dark Mode';
            localStorage.setItem('qtask_theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('qtask_theme', 'dark');
        }
    }

    /**
     * Loads the saved theme
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('qtask_theme');
        const themeToggle = document.getElementById('themeToggle');
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
        } else {
            themeToggle.textContent = '🌙 Dark Mode';
        }
    }

    /**
     * Handles keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New task (focus on title input)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('taskTitle').focus();
        }

        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchBox').focus();
        }

        // Escape: Cancel edit or close modal
        if (e.key === 'Escape') {
            if (document.getElementById('modalOverlay').style.display === 'flex') {
                this.hideModal();
            } else if (this.currentEditingTask) {
                this.cancelEdit();
            }
        }

        // Ctrl/Cmd + Enter: Submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const form = document.getElementById('taskForm');
            if (document.activeElement && form.contains(document.activeElement)) {
                e.preventDefault();
                this.handleFormSubmit();
            }
        }
    }

    /**
     * Shows welcome message for new users
     */
    showWelcomeMessage() {
        if (this.taskManager.getAllTasks().length === 0) {
            setTimeout(() => {
                this.showNotification(
                    'Welcome to QTask Manager! 🎉',
                    'Start by creating your first task. Use Ctrl+N to quickly add a new task.',
                    'success'
                );
            }, 1000);
        }
    }

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Exports tasks to JSON file
     */
    exportTasks() {
        try {
            const tasksJson = this.taskManager.exportTasks();
            const blob = new Blob([tasksJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `qtask-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Export Successful', 'Tasks have been exported successfully.', 'success');
        } catch (error) {
            this.showNotification('Export Failed', error.message, 'error');
        }
    }

    /**
     * Imports tasks from JSON file
     * @param {File} file - File to import
     */
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedCount = this.taskManager.importTasks(e.target.result);
                this.showNotification('Import Successful', 
                    `Successfully imported ${importedCount} tasks.`, 'success');
            } catch (error) {
                this.showNotification('Import Failed', error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Clears all completed tasks
     */
    clearCompletedTasks() {
        const completedCount = this.taskManager.getCompletedTasks().length;
        if (completedCount === 0) {
            this.showNotification('No Tasks to Clear', 'There are no completed tasks to clear.', 'warning');
            return;
        }

        this.showModal(
            `Are you sure you want to clear all ${completedCount} completed tasks?`,
            () => {
                const clearedCount = this.taskManager.clearCompletedTasks();
                this.showNotification('Tasks Cleared', 
                    `Successfully cleared ${clearedCount} completed tasks.`, 'success');
            }
        );
    }

    /**
     * Gets app statistics for debugging
     * @returns {Object} App statistics
     */
    getAppStats() {
        return {
            version: '1.0.0',
            taskManager: this.taskManager.getInfo(),
            currentFilters: this.currentFilters,
            currentSort: this.currentSort,
            isEditing: !!this.currentEditingTask,
            theme: document.body.getAttribute('data-theme') || 'light'
        };
    }
}

// Initialize the application when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new QTaskApp();
    
    // Make app globally accessible for debugging
    window.app = app;
    
    // Add some sample tasks for demonstration (only if no tasks exist)

});

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This would register a service worker for offline functionality
        // Implementation would go here for PWA features
    });
}