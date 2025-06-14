/**
 * TaskManager Class
 * Manages all task operations including CRUD, filtering, sorting, and persistence
 */

class TaskManager {
    /**
     * Creates a new TaskManager instance
     */
    constructor() {
        this.tasks = [];
        this.storageKey = 'qtask_manager_tasks';
        this.observers = [];
        this.loadTasks();
    }

    /**
     * Adds an observer to listen for task changes
     * @param {Function} callback - Callback function to execute on changes
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Removes an observer
     * @param {Function} callback - Callback function to remove
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    /**
     * Notifies all observers of changes
     * @param {string} action - The action that was performed
     * @param {Task} task - The task that was affected
     */
    notifyObservers(action, task = null) {
        this.observers.forEach(callback => {
            try {
                callback(action, task, this.tasks);
            } catch (error) {
                console.error('Error in observer callback:', error);
            }
        });
    }

    /**
     * Adds a new task
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {string} priority - Task priority
     * @param {string} category - Task category
     * @returns {Task} The created task
     * @throws {Error} If task creation fails
     */
    addTask(title, description = '', priority = 'medium', category = 'Personal') {
        try {
            const task = new Task(title, description, priority, category);
            this.tasks.push(task);
            this.saveTasks();
            this.notifyObservers('add', task);
            return task;
        } catch (error) {
            throw new Error(`Failed to create task: ${error.message}`);
        }
    }

    /**
     * Updates an existing task
     * @param {string} taskId - ID of the task to update
     * @param {Object} updates - Object containing updates
     * @returns {Task} The updated task
     * @throws {Error} If task is not found or update fails
     */
    updateTask(taskId, updates) {
        const task = this.getTaskById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        try {
            task.update(updates);
            this.saveTasks();
            this.notifyObservers('update', task);
            return task;
        } catch (error) {
            throw new Error(`Failed to update task: ${error.message}`);
        }
    }

    /**
     * Deletes a task
     * @param {string} taskId - ID of the task to delete
     * @returns {boolean} True if task was deleted
     * @throws {Error} If task is not found
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        const deletedTask = this.tasks.splice(taskIndex, 1)[0];
        this.saveTasks();
        this.notifyObservers('delete', deletedTask);
        return true;
    }

    /**
     * Gets a task by its ID
     * @param {string} taskId - ID of the task to retrieve
     * @returns {Task|null} The task or null if not found
     */
    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Gets all tasks
     * @returns {Task[]} Array of all tasks
     */
    getAllTasks() {
        return [...this.tasks];
    }

    /**
     * Gets tasks filtered by criteria
     * @param {Object} filters - Filter criteria
     * @returns {Task[]} Array of filtered tasks
     */
    getFilteredTasks(filters = {}) {
        return this.tasks.filter(task => {
            // Search filter
            if (filters.search && !task.matchesSearch(filters.search)) {
                return false;
            }

            // Other filters
            return task.matchesFilters(filters);
        });
    }

    /**
     * Gets tasks sorted by specified criteria
     * @param {string} sortBy - Sort criteria
     * @param {string} order - Sort order ('asc' or 'desc')
     * @returns {Task[]} Array of sorted tasks
     */
    getSortedTasks(sortBy = 'created', order = 'desc') {
        const sortedTasks = [...this.tasks];
        
        sortedTasks.sort((a, b) => {
            let result = a.compareTo(b, sortBy);
            return order === 'desc' ? result : -result;
        });

        return sortedTasks;
    }

    /**
     * Gets tasks filtered and sorted
     * @param {Object} filters - Filter criteria
     * @param {string} sortBy - Sort criteria
     * @param {string} order - Sort order
     * @returns {Task[]} Array of filtered and sorted tasks
     */
    getFilteredAndSortedTasks(filters = {}, sortBy = 'created', order = 'desc') {
        let filteredTasks = this.getFilteredTasks(filters);
        
        filteredTasks.sort((a, b) => {
            let result = a.compareTo(b, sortBy);
            return order === 'desc' ? result : -result;
        });

        return filteredTasks;
    }

    /**
     * Toggles task completion status
     * @param {string} taskId - ID of the task to toggle
     * @returns {Task} The updated task
     * @throws {Error} If task is not found
     */
    toggleTaskCompletion(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        task.toggleCompletion();
        this.saveTasks();
        this.notifyObservers('toggle', task);
        return task;
    }

    /**
     * Marks a task as completed
     * @param {string} taskId - ID of the task to complete
     * @returns {Task} The updated task
     */
    completeTask(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        task.markAsCompleted();
        this.saveTasks();
        this.notifyObservers('complete', task);
        return task;
    }

    /**
     * Marks a task as pending
     * @param {string} taskId - ID of the task to mark as pending
     * @returns {Task} The updated task
     */
    uncompleteTask(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        task.markAsPending();
        this.saveTasks();
        this.notifyObservers('uncomplete', task);
        return task;
    }

    /**
     * Gets task statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const highPriority = this.tasks.filter(task => task.priority === 'high').length;
        const mediumPriority = this.tasks.filter(task => task.priority === 'medium').length;
        const lowPriority = this.tasks.filter(task => task.priority === 'low').length;

        // Category statistics
        const categories = {};
        this.tasks.forEach(task => {
            categories[task.category] = (categories[task.category] || 0) + 1;
        });

        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            priority: {
                high: highPriority,
                medium: mediumPriority,
                low: lowPriority
            },
            categories
        };
    }

    /**
     * Gets tasks by category
     * @param {string} category - Category to filter by
     * @returns {Task[]} Array of tasks in the category
     */
    getTasksByCategory(category) {
        return this.tasks.filter(task => task.category === category);
    }

    /**
     * Gets tasks by priority
     * @param {string} priority - Priority to filter by
     * @returns {Task[]} Array of tasks with the priority
     */
    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }

    /**
     * Gets completed tasks
     * @returns {Task[]} Array of completed tasks
     */
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    /**
     * Gets pending tasks
     * @returns {Task[]} Array of pending tasks
     */
    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    /**
     * Searches tasks by query
     * @param {string} query - Search query
     * @returns {Task[]} Array of matching tasks
     */
    searchTasks(query) {
        if (!query || query.trim() === '') {
            return this.getAllTasks();
        }

        return this.tasks.filter(task => task.matchesSearch(query));
    }

    /**
     * Gets unique categories from all tasks
     * @returns {string[]} Array of unique categories
     */
    getCategories() {
        const categories = new Set();
        this.tasks.forEach(task => categories.add(task.category));
        return Array.from(categories).sort();
    }

    /**
     * Clears all completed tasks
     * @returns {number} Number of tasks cleared
     */
    clearCompletedTasks() {
        const completedTasks = this.getCompletedTasks();
        const clearedCount = completedTasks.length;
        
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.notifyObservers('clear_completed', null);
        
        return clearedCount;
    }

    /**
     * Clears all tasks
     * @returns {number} Number of tasks cleared
     */
    clearAllTasks() {
        const clearedCount = this.tasks.length;
        this.tasks = [];
        this.saveTasks();
        this.notifyObservers('clear_all', null);
        return clearedCount;
    }

    /**
     * Duplicates a task
     * @param {string} taskId - ID of the task to duplicate
     * @returns {Task} The duplicated task
     */
    duplicateTask(taskId) {
        const originalTask = this.getTaskById(taskId);
        if (!originalTask) {
            throw new Error('Task not found');
        }

        const duplicatedTask = originalTask.clone();
        duplicatedTask.id = duplicatedTask.generateId();
        duplicatedTask.title = `${originalTask.title} (Copy)`;
        duplicatedTask.completed = false;
        duplicatedTask.createdAt = new Date();
        duplicatedTask.updatedAt = new Date();
        duplicatedTask.completedAt = null;

        this.tasks.push(duplicatedTask);
        this.saveTasks();
        this.notifyObservers('duplicate', duplicatedTask);
        
        return duplicatedTask;
    }

    /**
     * Saves tasks to localStorage
     */
    saveTasks() {
        try {
            const tasksData = this.tasks.map(task => task.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(tasksData));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
            // Could implement alternative storage strategy here
        }
    }

    /**
     * Loads tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(this.storageKey);
            if (savedTasks) {
                const tasksData = JSON.parse(savedTasks);
                this.tasks = tasksData.map(data => Task.fromJSON(data));
            }
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            this.tasks = [];
        }
    }

    /**
     * Exports tasks as JSON
     * @returns {string} JSON string of all tasks
     */
    exportTasks() {
        return JSON.stringify(this.tasks.map(task => task.toJSON()), null, 2);
    }

    /**
     * Imports tasks from JSON
     * @param {string} jsonData - JSON string containing tasks
     * @returns {number} Number of tasks imported
     */
    importTasks(jsonData) {
        try {
            const tasksData = JSON.parse(jsonData);
            const importedTasks = tasksData.map(data => Task.fromJSON(data));
            
            // Add imported tasks to existing tasks
            this.tasks.push(...importedTasks);
            this.saveTasks();
            this.notifyObservers('import', null);
            
            return importedTasks.length;
        } catch (error) {
            throw new Error(`Failed to import tasks: ${error.message}`);
        }
    }

    /**
     * Validates task manager state
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];
        const taskIds = new Set();
        
        this.tasks.forEach((task, index) => {
            // Check for duplicate IDs
            if (taskIds.has(task.id)) {
                errors.push(`Duplicate task ID found: ${task.id}`);
            } else {
                taskIds.add(task.id);
            }
            
            // Validate individual task
            const taskValidation = task.validate();
            if (!taskValidation.isValid) {
                errors.push(`Task ${index + 1}: ${taskValidation.errors.join(', ')}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Gets task manager info
     * @returns {Object} Information about the task manager
     */
    getInfo() {
        const stats = this.getStatistics();
        const validation = this.validate();
        
        return {
            version: '1.0.0',
            totalTasks: stats.total,
            isValid: validation.isValid,
            categories: this.getCategories(),
            lastSaved: localStorage.getItem(this.storageKey) ? 'Available' : 'Not saved',
            statistics: stats
        };
    }
}