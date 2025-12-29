// ====================================
// HabitQuest - Main App Module
// ====================================

const App = {
    currentPage: 'dashboard',
    editingTask: null,
    editingHabit: null,

    // Initialize app
    init() {
        // Render components
        Components.init();

        // Apply theme
        this.applyTheme();

        // Start clock
        this.startClock();

        // Check for daily reset (dailies and habits)
        this.checkDailyReset();

        // Update task statuses
        Tasks.updateStatuses();

        // Initialize modules
        if (typeof Auth !== 'undefined') Auth.init();
        Gamification.init();
        Timer.init();
        QuickTimer.init();
        Journal.init();
        Memo.init();

        // Bind events
        this.bindEvents();

        // Render initial data
        this.renderDashboard();
        this.renderTasks();
        this.renderHabits();
        this.renderCategories();
        this.renderCalendar();
        this.renderStats();

        console.log('HabitQuest initialized!');
    },

    // Check and perform daily reset for dailies and habits
    checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        const lastReset = localStorage.getItem('hq_last_reset_date');

        if (lastReset !== today) {
            // Reset daily tasks
            Tasks.resetDailyTasks();

            // Reset habit daily counts
            const habits = Storage.getHabits();
            habits.forEach(habit => {
                habit.todayCount = 0;
            });
            Storage.saveHabits(habits);

            // Save today as last reset date
            localStorage.setItem('hq_last_reset_date', today);

            console.log('Daily reset performed');
        }
    },

    // Start clock
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('ja-JP', { hour12: false });
            const dateStr = now.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            const timeEl = document.getElementById('current-time');
            const dateEl = document.getElementById('current-date');

            if (timeEl) timeEl.textContent = timeStr;
            if (dateEl) dateEl.textContent = dateStr;
        };

        updateClock();
        setInterval(updateClock, 1000);
    },

    // Apply theme
    applyTheme() {
        const settings = Storage.getSettings();
        if (settings.darkMode) {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'light');
        }

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.textContent = settings.darkMode ? '🌙' : '☀️';
        }
    },

    // Toggle theme
    toggleTheme() {
        const settings = Storage.getSettings();
        settings.darkMode = !settings.darkMode;
        Storage.saveSettings(settings);
        this.applyTheme();
    },

    // Navigate to page
    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show selected page
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) pageEl.classList.add('active');

        const navEl = document.querySelector(`[data-page="${page}"]`);
        if (navEl) navEl.classList.add('active');

        this.currentPage = page;

        // Page-specific initialization
        if (page === 'timer') {
            Timer.updateTaskOptions();
            Timer.updateStats();
            Timer.renderSessionLog();
        } else if (page === 'journal') {
            Journal.load();
        } else if (page === 'memo') {
            Memo.renderQuickMemos();
            Memo.renderMemos();
        } else if (page === 'calendar') {
            this.renderCalendar();
        } else if (page === 'stats') {
            this.renderStats();
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-fadeOut');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Render dashboard
    renderDashboard() {
        const stats = Tasks.getStats();

        // Update overview stats
        const completedEl = document.getElementById('today-tasks-completed');
        const totalEl = document.getElementById('today-tasks-total');

        if (completedEl) completedEl.textContent = stats.todayCompleted;
        if (totalEl) totalEl.textContent = stats.todayTotal;

        // Update XP
        const xpEl = document.getElementById('today-xp');
        if (xpEl) xpEl.textContent = Gamification.getTodayXP();

        // Render today's tasks
        const todayTasks = Tasks.getTodayTasks();
        const taskList = document.getElementById('today-task-list');

        if (taskList) {
            if (todayTasks.length === 0) {
                taskList.innerHTML = '<p class="empty-message">本日のタスクはありません</p>';
            } else {
                taskList.innerHTML = todayTasks.slice(0, 5).map(task => this.renderTaskCard(task)).join('');
            }
        }

        // Render habits
        this.renderTodayHabits();

        // Render recent memos
        Memo.renderRecentMemos();

        // Update timer stats
        Timer.updateStats();
    },

    // Render tasks page
    renderTasks() {
        const tasks = Tasks.getAll();
        const filters = {
            type: document.getElementById('filter-type')?.value || 'all',
            status: document.getElementById('filter-status')?.value || 'all',
            category: document.getElementById('filter-category')?.value || 'all'
        };

        const filtered = Tasks.filter(tasks, filters);

        // Group by status
        const notStarted = filtered.filter(t => t.status === 'not-started' && !t.completed);
        const inProgress = filtered.filter(t => t.status === 'in-progress' && !t.completed);
        const today = filtered.filter(t => t.status === 'today' && !t.completed);

        // Render columns
        const renderColumn = (containerId, tasks) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (tasks.length === 0) {
                container.innerHTML = '<p class="empty-message">タスクはありません</p>';
            } else {
                container.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');
            }
        };

        renderColumn('task-list-not-started', notStarted);
        renderColumn('task-list-in-progress', inProgress);
        renderColumn('task-list-today', today);

        // Update filter category options
        this.updateCategoryFilter();
    },

    // Render task card
    renderTaskCard(task) {
        const categories = Storage.getCategories();
        const category = categories.find(c => c.id === task.category);
        const priorityLabels = { low: '低', medium: '中', high: '高' };
        const statusLabels = { 'not-started': '未着手', 'in-progress': '進行中', 'today': '本日対応' };

        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-header">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="App.toggleTask('${task.id}', this)"></div>
                    <span class="task-name">${this.escapeHtml(task.name)}</span>
                    <span class="task-priority ${task.priority}">${priorityLabels[task.priority]}</span>
                </div>
                <div class="task-meta">
                    ${category ? `<span class="task-category" style="border-left: 3px solid ${category.color}">${category.name}</span>` : ''}
                    ${task.dueDate ? `<span class="task-due">📅 ${task.dueDate}</span>` : ''}
                    <span class="task-xp">+${Gamification.calculateTaskXP(task)} XP</span>
                </div>
                <div class="task-status-row" style="margin-top: 8px;">
                    <label style="font-size: 12px; color: var(--text-secondary);">状態: </label>
                    <select class="task-status-select" onchange="App.changeTaskStatus('${task.id}', this.value)">
                        <option value="not-started" ${task.status === 'not-started' && !task.completed ? 'selected' : ''}>未着手</option>
                        <option value="in-progress" ${task.status === 'in-progress' && !task.completed ? 'selected' : ''}>進行中</option>
                        <option value="today" ${task.status === 'today' && !task.completed ? 'selected' : ''}>本日対応</option>
                        <option value="completed" ${task.completed ? 'selected' : ''}>✓ 完了</option>
                    </select>
                </div>
                <div class="task-actions" style="margin-top: 8px;">
                    <button class="btn btn-small btn-secondary" onclick="App.editTask('${task.id}')">編集</button>
                    <button class="btn btn-small btn-danger" onclick="App.deleteTask('${task.id}')">削除</button>
                </div>
            </div>
        `;
    },

    // Toggle task
    toggleTask(id, element) {
        Tasks.toggle(id, element);
        this.renderTasks();
        this.renderDashboard();
    },

    // Change task status
    changeTaskStatus(id, newStatus) {
        if (newStatus === 'completed') {
            // Use the complete function to properly handle XP
            Tasks.complete(id);
        } else {
            // If changing from completed to another status, use uncomplete first
            const task = Tasks.getById(id);
            if (task && task.completed) {
                Tasks.uncomplete(id);
            }
            Tasks.update(id, { status: newStatus });
        }
        this.renderTasks();
        this.renderDashboard();
        this.showToast('タスクの状態を変更しました', 'success');
    },

    // Edit task
    editTask(id) {
        const task = Tasks.getById(id);
        if (!task) return;

        this.editingTask = task;

        document.getElementById('task-modal-title').textContent = 'タスクを編集';
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-type').value = task.type;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status || 'not-started';
        document.getElementById('task-notes').value = task.notes || '';

        this.updateModalCategories('task-category');
        document.getElementById('task-modal').classList.add('active');
    },

    // Delete task
    deleteTask(id) {
        if (confirm('このタスクを削除しますか？')) {
            Tasks.delete(id);
            this.renderTasks();
            this.renderDashboard();
            this.showToast('タスクを削除しました', 'success');
        }
    },

    // Open task modal
    openTaskModal() {
        this.editingTask = null;

        document.getElementById('task-modal-title').textContent = '新規タスク';
        document.getElementById('task-name').value = '';
        document.getElementById('task-type').value = 'todo';
        document.getElementById('task-category').value = 'study';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-status').value = 'not-started';
        document.getElementById('task-notes').value = '';

        this.updateModalCategories('task-category');
        document.getElementById('task-modal').classList.add('active');
    },

    // Save task from modal
    saveTask() {
        const name = document.getElementById('task-name').value.trim();
        if (!name) {
            this.showToast('タスク名を入力してください', 'error');
            return;
        }

        const taskData = {
            name,
            type: document.getElementById('task-type').value,
            category: document.getElementById('task-category').value,
            dueDate: document.getElementById('task-due-date').value || null,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            notes: document.getElementById('task-notes').value
        };

        if (this.editingTask) {
            Tasks.update(this.editingTask.id, taskData);
            this.showToast('タスクを更新しました', 'success');
        } else {
            Tasks.create(taskData);
            this.showToast('タスクを追加しました', 'success');
        }

        this.closeTaskModal();
        this.renderTasks();
        this.renderDashboard();
    },

    // Close task modal
    closeTaskModal() {
        document.getElementById('task-modal').classList.remove('active');
        this.editingTask = null;
    },

    // Render habits
    renderHabits() {
        const habits = Storage.getHabits();

        const positive = habits.filter(h => h.type === 'positive');
        const negative = habits.filter(h => h.type === 'negative');

        const renderHabitList = (containerId, habits, isPositive) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (habits.length === 0) {
                container.innerHTML = '<p class="empty-message">習慣を追加してください</p>';
                return;
            }

            container.innerHTML = habits.map(habit => `
                <div class="habit-card" data-id="${habit.id}">
                    <div class="habit-actions">
                        ${isPositive ? `
                            <button class="habit-btn positive" onclick="App.trackHabit('${habit.id}', true)">+</button>
                        ` : `
                            <button class="habit-btn negative" onclick="App.trackHabit('${habit.id}', false)">−</button>
                        `}
                    </div>
                    <div class="habit-info">
                        <span class="habit-name">${this.escapeHtml(habit.name)}</span>
                        <span class="habit-streak">今日: ${habit.todayCount || 0}回</span>
                    </div>
                    <span class="habit-count">${isPositive ? '+' : '-'}${habit.reward || 5} XP</span>
                    <button class="btn btn-small btn-danger" onclick="App.deleteHabit('${habit.id}')">×</button>
                </div>
            `).join('');
        };

        renderHabitList('positive-habits-list', positive, true);
        renderHabitList('negative-habits-list', negative, false);
    },

    // Render today's habits
    renderTodayHabits() {
        const habits = Storage.getHabits();
        const container = document.getElementById('today-habit-list');

        if (!container) return;

        if (habits.length === 0) {
            container.innerHTML = '<p class="empty-message">習慣を追加してください</p>';
            return;
        }

        container.innerHTML = habits.slice(0, 5).map(habit => `
            <div class="habit-card-small">
                <span class="habit-name">${this.escapeHtml(habit.name)}</span>
                <span class="habit-count">${habit.todayCount || 0}回</span>
            </div>
        `).join('');
    },

    // Track habit
    trackHabit(id, isPositive) {
        const habits = Storage.getHabits();
        const habit = habits.find(h => h.id === id);

        if (!habit) return;

        // Reset if new day
        const today = new Date().toISOString().split('T')[0];
        if (habit.lastTracked !== today) {
            habit.todayCount = 0;
        }

        habit.todayCount = (habit.todayCount || 0) + 1;
        habit.lastTracked = today;

        Storage.saveHabits(habits);

        // Add XP or damage
        if (isPositive) {
            Gamification.addXP(habit.reward || 5);
        } else {
            Gamification.takeDamage(habit.penalty || 5);
        }

        this.renderHabits();
        this.renderTodayHabits();
    },

    // Open habit modal
    openHabitModal() {
        this.editingHabit = null;

        document.getElementById('habit-modal-title').textContent = '新規習慣';
        document.getElementById('habit-name').value = '';
        document.getElementById('habit-type').value = 'positive';
        document.getElementById('habit-category').value = 'personal';
        document.getElementById('habit-reward').value = 5;
        document.getElementById('habit-penalty').value = 5;

        this.updateModalCategories('habit-category');
        document.getElementById('habit-modal').classList.add('active');
    },

    // Save habit
    saveHabit() {
        const name = document.getElementById('habit-name').value.trim();
        if (!name) {
            this.showToast('習慣名を入力してください', 'error');
            return;
        }

        const habits = Storage.getHabits();
        const habit = {
            id: 'habit_' + Date.now(),
            name,
            type: document.getElementById('habit-type').value,
            category: document.getElementById('habit-category').value,
            reward: parseInt(document.getElementById('habit-reward').value) || 5,
            penalty: parseInt(document.getElementById('habit-penalty').value) || 5,
            todayCount: 0,
            createdAt: new Date().toISOString()
        };

        habits.push(habit);
        Storage.saveHabits(habits);

        this.closeHabitModal();
        this.renderHabits();
        this.showToast('習慣を追加しました', 'success');
    },

    // Delete habit
    deleteHabit(id) {
        if (confirm('この習慣を削除しますか？')) {
            const habits = Storage.getHabits().filter(h => h.id !== id);
            Storage.saveHabits(habits);
            this.renderHabits();
            this.showToast('習慣を削除しました', 'success');
        }
    },

    // Close habit modal
    closeHabitModal() {
        document.getElementById('habit-modal').classList.remove('active');
        this.editingHabit = null;
    },

    // Render categories
    renderCategories() {
        const categories = Storage.getCategories();
        const container = document.getElementById('category-list');

        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <div class="category-tag">
                <span class="category-color" style="background: ${cat.color}"></span>
                <span>${cat.name}</span>
                <button class="category-delete" onclick="App.deleteCategory('${cat.id}')">×</button>
            </div>
        `).join('');
    },

    // Add category
    addCategory() {
        const name = document.getElementById('new-category-input').value.trim();
        const color = document.getElementById('new-category-color').value;

        if (!name) {
            this.showToast('カテゴリー名を入力してください', 'error');
            return;
        }

        const categories = Storage.getCategories();
        const id = name.toLowerCase().replace(/\s+/g, '-');

        if (categories.find(c => c.id === id)) {
            this.showToast('このカテゴリーは既に存在します', 'error');
            return;
        }

        categories.push({ id, name, color, icon: '📌' });
        Storage.saveCategories(categories);

        document.getElementById('new-category-input').value = '';
        this.renderCategories();
        this.showToast('カテゴリーを追加しました', 'success');
    },

    // Delete category
    deleteCategory(id) {
        const defaultIds = ['study', 'work', 'exercise', 'health', 'hobby', 'reading', 'personal', 'other'];

        if (defaultIds.includes(id)) {
            this.showToast('デフォルトカテゴリーは削除できません', 'error');
            return;
        }

        if (confirm('このカテゴリーを削除しますか？')) {
            const categories = Storage.getCategories().filter(c => c.id !== id);
            Storage.saveCategories(categories);
            this.renderCategories();
            this.showToast('カテゴリーを削除しました', 'success');
        }
    },

    // Update category filter
    updateCategoryFilter() {
        const select = document.getElementById('filter-category');
        if (!select) return;

        const categories = Storage.getCategories();
        select.innerHTML = '<option value="all">すべて</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    },

    // Update modal categories
    updateModalCategories(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const categories = Storage.getCategories();
        select.innerHTML = categories.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    },

    // Render calendar
    renderCalendar() {
        const now = new Date();
        if (this.calendarYear === undefined || this.calendarYear === null) this.calendarYear = now.getFullYear();
        if (this.calendarMonth === undefined || this.calendarMonth === null) this.calendarMonth = now.getMonth();

        const monthLabel = document.getElementById('calendar-month');
        if (monthLabel) {
            monthLabel.textContent = `${this.calendarYear}年${this.calendarMonth + 1}月`;
        }

        const container = document.getElementById('calendar-days');
        if (!container) return;

        const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
        const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const today = new Date().toISOString().split('T')[0];
        const studyRecords = Storage.getStudyRecords();

        let html = '';

        // Empty cells for days before first day
        for (let i = 0; i < startDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const hasRecord = studyRecords[dateStr] && studyRecords[dateStr].studyTime > 0;

            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasRecord ? 'has-record' : ''}" 
                     onclick="App.selectCalendarDay('${dateStr}')">
                    ${day}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    // Navigate calendar
    prevMonth() {
        this.calendarMonth--;
        if (this.calendarMonth < 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
        }
        this.renderCalendar();
    },

    nextMonth() {
        // Fix: Ensure proper month increment
        if (this.calendarMonth >= 11) {
            this.calendarMonth = 0;
            this.calendarYear = this.calendarYear + 1;
        } else {
            this.calendarMonth = this.calendarMonth + 1;
        }
        this.renderCalendar();
    },

    // Select calendar day
    selectCalendarDay(dateStr) {
        const details = document.getElementById('day-details');
        if (!details) return;

        const record = Storage.getStudyRecord(dateStr);
        const journal = Storage.getJournal(dateStr);

        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${h}時間${m}分`;
        };

        let html = `<h4>${dateStr}</h4>`;

        if (record.studyTime > 0 || record.pomodoros > 0) {
            html += `
                <div class="day-stat">
                    <span>勉強時間:</span>
                    <span>${formatTime(record.studyTime || 0)}</span>
                </div>
                <div class="day-stat">
                    <span>休憩時間:</span>
                    <span>${formatTime(record.breakTime || 0)}</span>
                </div>
                <div class="day-stat">
                    <span>ポモドーロ:</span>
                    <span>${record.pomodoros || 0}回</span>
                </div>
            `;
        }

        if (journal?.mood) {
            const moodEmojis = { great: '😄', good: '🙂', neutral: '😐', bad: '😔', terrible: '😢' };
            html += `<div class="day-stat"><span>気分:</span><span>${moodEmojis[journal.mood]}</span></div>`;
        }

        if (!record.studyTime && !journal) {
            html += '<p class="empty-message">この日の記録はありません</p>';
        }

        details.innerHTML = html;
    },

    // Render stats
    renderStats() {
        const summary = document.getElementById('stats-summary');
        if (!summary) return;

        const user = Storage.getUser();
        const tasks = Tasks.getStats();
        const studyRecords = Storage.getStudyRecords();

        // Calculate total study time
        let totalStudyTime = 0;
        Object.values(studyRecords).forEach(record => {
            totalStudyTime += record.studyTime || 0;
        });

        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `${h}時間${m}分`;
        };

        summary.innerHTML = `
            <div class="overview-stats">
                <div class="overview-stat">
                    <span class="stat-value">${user.level}</span>
                    <span class="stat-label">レベル</span>
                </div>
                <div class="overview-stat">
                    <span class="stat-value">${user.totalXP}</span>
                    <span class="stat-label">総獲得XP</span>
                </div>
                <div class="overview-stat">
                    <span class="stat-value">${tasks.completed}</span>
                    <span class="stat-label">完了タスク</span>
                </div>
                <div class="overview-stat">
                    <span class="stat-value">${formatTime(totalStudyTime)}</span>
                    <span class="stat-label">総勉強時間</span>
                </div>
            </div>
        `;

        // Render study time chart
        this.renderStudyChart();
    },

    // Render study chart
    renderStudyChart() {
        const container = document.getElementById('study-chart');
        if (!container) return;

        const studyRecords = Storage.getStudyRecords();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const record = studyRecords[dateStr] || { studyTime: 0 };
            days.push({
                date: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
                time: record.studyTime || 0
            });
        }

        const maxTime = Math.max(...days.map(d => d.time), 3600);

        container.innerHTML = `
            <div class="chart-bars">
                ${days.map(day => `
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="height: ${(day.time / maxTime) * 100}%"></div>
                        <span class="chart-label">${day.date}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Save settings
    saveSettings() {
        const settings = {
            workTime: parseInt(document.getElementById('setting-work-time').value) || 50,
            breakTime: parseInt(document.getElementById('setting-break-time').value) || 10,
            longBreakTime: parseInt(document.getElementById('setting-long-break-time').value) || 20,
            sessionsBeforeLongBreak: parseInt(document.getElementById('setting-sessions').value) || 4,
            baseXP: parseInt(document.getElementById('setting-base-xp').value) || 10,
            habitXP: parseInt(document.getElementById('setting-habit-xp').value) || 5,
            damage: parseInt(document.getElementById('setting-damage').value) || 5,
            darkMode: document.getElementById('setting-dark-mode').checked,
            soundEnabled: document.getElementById('setting-sound').checked
        };

        Storage.saveSettings(settings);
        this.applyTheme();
        Timer.reset();
        this.showToast('設定を保存しました', 'success');
    },

    // Export data
    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `habitquest-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showToast('データをエクスポートしました', 'success');
    },

    // Import data
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Storage.importData(data);
                this.showToast('データをインポートしました。ページを再読み込みします。', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                this.showToast('データのインポートに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    },

    // Reset data
    resetData() {
        if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
            Storage.resetAll();
            this.showToast('データをリセットしました。ページを再読み込みします。', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },

    // Bind events
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Menu toggle (mobile)
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Task modal
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) addTaskBtn.addEventListener('click', () => this.openTaskModal());

        const taskModalClose = document.getElementById('task-modal-close');
        if (taskModalClose) taskModalClose.addEventListener('click', () => this.closeTaskModal());

        const taskCancel = document.getElementById('task-cancel');
        if (taskCancel) taskCancel.addEventListener('click', () => this.closeTaskModal());

        const taskSave = document.getElementById('task-save');
        if (taskSave) taskSave.addEventListener('click', () => this.saveTask());

        // Habit modal
        const addHabitBtn = document.getElementById('add-habit-btn');
        if (addHabitBtn) addHabitBtn.addEventListener('click', () => this.openHabitModal());

        const habitModalClose = document.getElementById('habit-modal-close');
        if (habitModalClose) habitModalClose.addEventListener('click', () => this.closeHabitModal());

        const habitCancel = document.getElementById('habit-cancel');
        if (habitCancel) habitCancel.addEventListener('click', () => this.closeHabitModal());

        const habitSave = document.getElementById('habit-save');
        if (habitSave) habitSave.addEventListener('click', () => this.saveHabit());

        // Filters
        ['filter-type', 'filter-status', 'filter-category'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.renderTasks());
        });

        // Calendar navigation
        const calPrev = document.getElementById('calendar-prev');
        const calNext = document.getElementById('calendar-next');
        if (calPrev) calPrev.addEventListener('click', () => this.prevMonth());
        if (calNext) calNext.addEventListener('click', () => this.nextMonth());

        // Settings
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => this.addCategory());

        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

        const importBtn = document.getElementById('import-data-btn');
        const importInput = document.getElementById('import-file-input');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => {
                if (e.target.files[0]) this.importData(e.target.files[0]);
            });
        }

        const resetBtn = document.getElementById('reset-data-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetData());

        // Memo quick add
        Memo.bindEvents();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
