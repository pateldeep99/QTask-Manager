/**
 * Task Class
 * Represents an task with all its properties and methods
 */

class Task {
    /**
     * Creates a new Task instance
     * @param {string} title - The task title
     * @param {string} description - The task description
     * @param {string} priority - The task priority (low, medium, high)
     * @param {string} category - The task category
     */
    constructor(title, description = '', priority = 'medium', category = 'Personal') {
        this.id = this.generateId();
        this.title = this.validateTitle(title);
        this.description = description;
        this.priority = this.validatePriority(priority);
        this.category = this.validateCategory(category);
        this.completed = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.completedAt = null;
    }

    /**
     * Generates a unique ID for the task
     * @returns {string} Unique task ID
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validates the task title
     * @param {string} title - The title to validate
     * @returns {string} Valid title
     * @throws {Error} If title is invalid
     */
    validateTitle(title) {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw new Error('Task title is required and cannot be empty');
        }
        if (title.trim().length > 100) {
            throw new Error('Task title cannot exceed 100 characters');
        }
        return title.trim();
    }

    /**
     * Validates the task priority
     * @param {string} priority - The priority to validate
     * @returns {string} Valid priority
     */
    validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return 'medium'; // Default priority
        }
        return priority;
    }

    /**
     * Validates the task category
     * @param {string} category - The category to validate
     * @returns {string} Valid category
     */
    validateCategory(category) {
        const validCategories = ['Personal', 'Work', 'Urgent', 'Education', 'Health'];
        if (!validCategories.includes(category)) {
            return 'Personal'; // Default category
        }
        return category;
    }

    /**
     * Updates the task properties
     * @param {Object} updates - Object containing properties to update
     * @returns {Task} Returns this task for method chaining
     */
    update(updates) {
        if (updates.title !== undefined) {
            this.title = this.validateTitle(updates.title);
        }
        if (updates.description !== undefined) {
            this.description = updates.description;
        }
        if (updates.priority !== undefined) {
            this.priority = this.validatePriority(updates.priority);
        }
        if (updates.category !== undefined) {
            this.category = this.validateCategory(updates.category);
        }
        
        this.updatedAt = new Date();
        return this;
    }

    /**
     * Marks the task as completed
     * @returns {Task} Returns this task for method chaining
     */
    markAsCompleted() {
        if (!this.completed) {
            this.completed = true;
            this.completedAt = new Date();
            this.updatedAt = new Date();
        }
        return this;
    }

    /**
     * Marks the task as pending (uncompleted)
     * @returns {Task} Returns this task for method chaining
     */
    markAsPending() {
        if (this.completed) {
            this.completed = false;
            this.completedAt = null;
            this.updatedAt = new Date();
        }
        return this;
    }

    /**
     * Toggles the completion status of the task
     * @returns {Task} Returns this task for method chaining
     */
    toggleCompletion() {
        if (this.completed) {
            this.markAsPending();
        } else {
            this.markAsCompleted();
        }
        return this;
    }

    /**
     * Checks if the task matches the search query
     * @param {string} query - The search query
     * @returns {boolean} True if task matches the query
     */
    matchesSearch(query) {
        if (!query || query.trim() === '') {
            return true;
        }
        
        const searchTerm = query.toLowerCase().trim();
        return (
            this.title.toLowerCase().includes(searchTerm) ||
            this.description.toLowerCase().includes(searchTerm) ||
            this.category.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Checks if the task matches the given filters
     * @param {Object} filters - Object containing filter criteria
     * @returns {boolean} True if task matches all filters
     */
    matchesFilters(filters) {
        // Category filter
        if (filters.category && filters.category !== '' && this.category !== filters.category) {
            return false;
        }

        // Priority filter
        if (filters.priority && filters.priority !== '' && this.priority !== filters.priority) {
            return false;
        }

        // Status filter
        if (filters.status && filters.status !== '') {
            if (filters.status === 'completed' && !this.completed) {
                return false;
            }
            if (filters.status === 'pending' && this.completed) {
                return false;
            }
        }

        return true;
    }

    /**
     * Gets the priority level as a number for sorting
     * @returns {number} Priority level (1=high, 2=medium, 3=low)
     */
    getPriorityLevel() {
        const priorityLevels = {
            'high': 1,
            'medium': 2,
            'low': 3
        };
        return priorityLevels[this.priority] || 2;
    }

    /**
     * Gets the task age in days
     * @returns {number} Number of days since task creation
     */
    getAgeInDays() {
        const now = new Date();
        const diffTime = Math.abs(now - this.createdAt);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Formats a date for display
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Gets a formatted creation date
     * @returns {string} Formatted creation date
     */
    getFormattedCreatedDate() {
        return this.formatDate(this.createdAt);
    }

    /**
     * Gets a formatted completion date
     * @returns {string} Formatted completion date or empty string
     */
    getFormattedCompletedDate() {
        return this.completedAt ? this.formatDate(this.completedAt) : '';
    }

    /**
     * Gets a relative time string (e.g., "2 hours ago")
     * @param {Date} date - The date to get relative time for
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        if (!date) return '';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date);
    }

    /**
     * Gets relative time for task creation
     * @returns {string} Relative creation time
     */
    getRelativeCreatedTime() {
        return this.getRelativeTime(this.createdAt);
    }

    /**
     * Checks if the task is high priority
     * @returns {boolean} True if task is high priority
     */
    isHighPriority() {
        return this.priority === 'high';
    }

    /**
     * Checks if the task is overdue (for future enhancement)
     * @returns {boolean} Currently always returns false
     */
    isOverdue() {
        // This could be enhanced to include due dates
        return false;
    }

    /**
     * Gets a summary of the task
     * @returns {string} Task summary
     */
    getSummary() {
        const status = this.completed ? 'Completed' : 'Pending';
        const age = this.getAgeInDays();
        return `${this.title} - ${status} (${this.priority} priority, ${age} days old)`;
    }

    /**
     * Converts the task to a plain object for storage
     * @returns {Object} Plain object representation of the task
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            priority: this.priority,
            category: this.category,
            completed: this.completed,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            completedAt: this.completedAt ? this.completedAt.toISOString() : null
        };
    }

    /**
     * Creates a Task instance from a plain object
     * @param {Object} data - Plain object with task data
     * @returns {Task} New Task instance
     */
    static fromJSON(data) {
        const task = new Task(data.title, data.description, data.priority, data.category);
        task.id = data.id;
        task.completed = data.completed || false;
        task.createdAt = new Date(data.createdAt);
        task.updatedAt = new Date(data.updatedAt);
        task.completedAt = data.completedAt ? new Date(data.completedAt) : null;
        return task;
    }

    /**
     * Creates a copy of the task
     * @returns {Task} New Task instance that is a copy of this task
     */
    clone() {
        return Task.fromJSON(this.toJSON());
    }

    /**
     * Compares this task with another task for sorting
     * @param {Task} otherTask - The task to compare with
     * @param {string} sortBy - The property to sort by
     * @returns {number} Comparison result (-1, 0, 1)
     */
    compareTo(otherTask, sortBy = 'created') {
        switch (sortBy) {
            case 'priority':
                return this.getPriorityLevel() - otherTask.getPriorityLevel();
            case 'title':
                return this.title.localeCompare(otherTask.title);
            case 'category':
                return this.category.localeCompare(otherTask.category);
            case 'completed':
                return this.completed === otherTask.completed ? 0 : (this.completed ? 1 : -1);
            case 'created':
            default:
                return otherTask.createdAt - this.createdAt; // Newest first
        }
    }

    /**
     * Gets the CSS class for the priority badge
     * @returns {string} CSS class name
     */
    getPriorityClass() {
        return `priority-${this.priority}`;
    }

    /**
     * Gets an emoji representation of the priority
     * @returns {string} Priority emoji
     */
    getPriorityEmoji() {
        const emojis = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return emojis[this.priority] || '⚪';
    }

    /**
     * Gets an emoji representation of the category
     * @returns {string} Category emoji
     */
    getCategoryEmoji() {
        const emojis = {
            'Personal': '👤',
            'Work': '💼',
            'Urgent': '🚨',
            'Education': '📚',
            'Health': '🏥'
        };
        return emojis[this.category] || '📝';
    }

    /**
     * Validates the entire task object
     * @returns {Object} Validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];

        try {
            this.validateTitle(this.title);
        } catch (error) {
            errors.push(error.message);
        }

        if (this.description && this.description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}