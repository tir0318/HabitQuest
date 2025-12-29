// ====================================
// HabitQuest - Tasks Module
// ====================================

const Tasks = {
    // Generate unique ID
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get all tasks
    getAll() {
        return Storage.getTasks();
    },

    // Get task by ID
    getById(id) {
        const tasks = this.getAll();
        return tasks.find(t => t.id === id);
    },

    // Create new task
    create(taskData) {
        const tasks = this.getAll();
        const task = {
            id: this.generateId(),
            name: taskData.name,
            type: taskData.type || 'todo', // todo, daily
            category: taskData.category || 'other',
            status: taskData.status || 'not-started', // not-started, in-progress, today, completed
            priority: taskData.priority || 'medium', // low, medium, high
            dueDate: taskData.dueDate || null,
            notes: taskData.notes || '',
            rewardXP: taskData.rewardXP || null,
            penalty: taskData.penalty || null,
            repeatDays: taskData.repeatDays || [], // For daily tasks
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(task);
        Storage.saveTasks(tasks);
        return task;
    },

    // Update task
    update(id, updates) {
        const tasks = this.getAll();
        const index = tasks.findIndex(t => t.id === id);

        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            Storage.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },

    // Delete task
    delete(id) {
        const tasks = this.getAll();
        const filtered = tasks.filter(t => t.id !== id);
        Storage.saveTasks(filtered);
        return true;
    },

    // Complete task
    complete(id, element = null) {
        const task = this.getById(id);
        if (!task) return null;

        // Prevent re-completing already completed task
        if (task.completed) return task;

        // Calculate XP before completing
        const xp = Gamification.calculateTaskXP(task);

        const updates = {
            completed: true,
            completedAt: new Date().toISOString(),
            status: 'completed',
            earnedXP: xp // Store earned XP for potential reversal
        };

        this.update(id, updates);

        // Add XP
        Gamification.addXP(xp, element);
        Gamification.playCompleteSound();

        return { ...task, ...updates };
    },

    // Uncomplete task - deduct XP to prevent cheating
    uncomplete(id) {
        const task = this.getById(id);
        if (!task) return null;

        // Only deduct XP if task was previously completed
        if (task.completed && task.earnedXP) {
            Gamification.deductXP(task.earnedXP);
        }

        return this.update(id, {
            completed: false,
            completedAt: null,
            status: 'in-progress',
            earnedXP: 0 // Reset earned XP
        });
    },

    // Toggle task completion
    toggle(id, element = null) {
        const task = this.getById(id);
        if (!task) return null;

        if (task.completed) {
            return this.uncomplete(id);
        } else {
            return this.complete(id, element);
        }
    },

    // Update task statuses based on date
    updateStatuses() {
        const tasks = this.getAll();
        const today = new Date().toISOString().split('T')[0];

        tasks.forEach(task => {
            if (task.completed) return;

            // Auto-change to 'today' if due date is today
            if (task.dueDate === today && task.status !== 'today') {
                task.status = 'today';
                task.updatedAt = new Date().toISOString();
            }
        });

        Storage.saveTasks(tasks);
    },

    // Get tasks by status
    getByStatus(status) {
        const tasks = this.getAll();
        if (status === 'all') return tasks;
        return tasks.filter(t => t.status === status);
    },

    // Get tasks by category
    getByCategory(category) {
        const tasks = this.getAll();
        if (category === 'all') return tasks;
        return tasks.filter(t => t.category === category);
    },

    // Get tasks by type
    getByType(type) {
        const tasks = this.getAll();
        if (type === 'all') return tasks;
        return tasks.filter(t => t.type === type);
    },

    // Get today's tasks
    getTodayTasks() {
        const tasks = this.getAll();
        const today = new Date().toISOString().split('T')[0];

        return tasks.filter(task => {
            // Tasks due today
            if (task.dueDate === today) return true;
            // Tasks marked as 'today'
            if (task.status === 'today') return true;
            // Daily tasks for today's day
            if (task.type === 'daily' && task.repeatDays) {
                const todayDay = new Date().getDay();
                return task.repeatDays.includes(todayDay);
            }
            return false;
        });
    },

    // Get incomplete tasks
    getIncomplete() {
        return this.getAll().filter(t => !t.completed);
    },

    // Get completed tasks
    getCompleted() {
        return this.getAll().filter(t => t.completed);
    },

    // Get overdue tasks
    getOverdue() {
        const tasks = this.getAll();
        const today = new Date().toISOString().split('T')[0];

        return tasks.filter(task => {
            if (task.completed) return false;
            if (!task.dueDate) return false;
            return task.dueDate < today;
        });
    },

    // Apply penalties for overdue tasks (called daily)
    applyOverduePenalties() {
        const overdue = this.getOverdue();

        overdue.forEach(task => {
            const damage = Gamification.calculateTaskDamage(task);
            Gamification.takeDamage(damage);
        });
    },

    // Reset daily tasks (called at midnight)
    resetDailyTasks() {
        const tasks = this.getAll();
        const today = new Date().getDay();

        tasks.forEach(task => {
            if (task.type === 'daily' && task.repeatDays && task.repeatDays.includes(today)) {
                if (task.completed) {
                    task.completed = false;
                    task.completedAt = null;
                    task.status = 'not-started';
                }
            }
        });

        Storage.saveTasks(tasks);
    },

    // Get task statistics
    getStats() {
        const tasks = this.getAll();
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => t.completedAt?.startsWith(today) || t.dueDate === today || t.status === 'today');

        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            incomplete: tasks.filter(t => !t.completed).length,
            todayTotal: todayTasks.length,
            todayCompleted: todayTasks.filter(t => t.completed).length
        };
    },

    // Filter tasks
    filter(tasks, filters) {
        let result = [...tasks];

        if (filters.type && filters.type !== 'all') {
            result = result.filter(t => t.type === filters.type);
        }

        if (filters.status && filters.status !== 'all') {
            result = result.filter(t => t.status === filters.status);
        }

        if (filters.category && filters.category !== 'all') {
            result = result.filter(t => t.category === filters.category);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(search) ||
                t.notes.toLowerCase().includes(search)
            );
        }

        return result;
    },

    // Sort tasks
    sort(tasks, sortBy = 'dueDate', order = 'asc') {
        return [...tasks].sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'dueDate':
                    aVal = a.dueDate || '9999-99-99';
                    bVal = b.dueDate || '9999-99-99';
                    break;
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    aVal = priorityOrder[a.priority];
                    bVal = priorityOrder[b.priority];
                    break;
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'createdAt':
                    aVal = a.createdAt;
                    bVal = b.createdAt;
                    break;
                default:
                    aVal = a[sortBy];
                    bVal = b[sortBy];
            }

            if (order === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }
};
