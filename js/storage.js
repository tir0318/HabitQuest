// ====================================
// HabitQuest - Storage Module
// ====================================

const Storage = {
    currentUid: null,
    unsubscribe: null,

    keys: {
        settings: 'habitquest_settings',
        user: 'habitquest_user',
        tasks: 'habitquest_tasks',
        habits: 'habitquest_habits',
        journals: 'habitquest_journals',
        memos: 'habitquest_memos',
        quickMemos: 'habitquest_quick_memos',
        categories: 'habitquest_categories',
        studyRecords: 'habitquest_study_records',
        timerSettings: 'habitquest_timer_settings'
    },

    // Default settings
    defaultSettings: {
        workTime: 50,
        breakTime: 10,
        longBreakTime: 20,
        sessionsBeforeLongBreak: 4,
        baseXP: 10,
        habitXP: 5,
        damage: 5,
        darkMode: true,
        soundEnabled: true
    },

    defaultUser: {
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        totalXP: 0,
        streak: 0,
        lastActiveDate: null
    },

    defaultCategories: [
        { id: 'study', name: '勉強', color: '#6366f1', icon: '📚' },
        { id: 'work', name: '仕事', color: '#8b5cf6', icon: '💼' },
        { id: 'exercise', name: '運動', color: '#10b981', icon: '🏃' },
        { id: 'health', name: '健康', color: '#f59e0b', icon: '🍎' },
        { id: 'hobby', name: '趣味', color: '#ec4899', icon: '🎨' },
        { id: 'reading', name: '読書', color: '#3b82f6', icon: '📖' },
        { id: 'personal', name: '個人', color: '#14b8a6', icon: '👤' },
        { id: 'other', name: 'その他', color: '#6b7280', icon: '📌' }
    ],

    // Initialize synchronization
    initSync(uid) {
        if (this.currentUid === uid) return;
        this.currentUid = uid;

        // Unsubscribe previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        console.log('Starting Firestore sync for user:', uid);

        // Listen for realtime updates
        this.unsubscribe = db.collection('users').doc(uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();

                    // Update local storage with cloud data (merge strategy: cloud wins)
                    // But we want to preserve local only keys if not present in cloud to avoid wiping
                    let hasUpdates = false;

                    Object.keys(this.keys).forEach(shortKey => {
                        const localKey = this.keys[shortKey];
                        if (data[shortKey]) {
                            const currentLocal = localStorage.getItem(localKey);
                            const cloudValue = JSON.stringify(data[shortKey]);

                            // Only update if different
                            if (currentLocal !== cloudValue) {
                                localStorage.setItem(localKey, cloudValue);
                                hasUpdates = true;
                            }
                        }
                    });

                    if (hasUpdates) {
                        console.log('Received updates from cloud, refreshing UI...');
                        // Reload app data to reflect changes
                        // We rely on simple page reload or re-render for now
                        //Ideally we should use events, but for now simple refresh is safest
                        // However, auto-reloading might interrupt user, so we should trigger re-renders
                        this.triggerReRender();
                    }
                } else {
                    // First time user or no data in cloud: Upload local data
                    console.log('No cloud data found, uploading local data...');
                    this.uploadAllToCloud();
                }
            }, (error) => {
                console.error('Sync error:', error);
            });
    },

    // Upload all local data to cloud
    uploadAllToCloud() {
        if (!this.currentUid) return;

        const allData = {};
        Object.keys(this.keys).forEach(shortKey => {
            allData[shortKey] = this.get(this.keys[shortKey]);
        });

        db.collection('users').doc(this.currentUid).set(allData, { merge: true })
            .then(() => console.log('Initial upload complete'))
            .catch(err => console.error('Upload failed:', err));
    },

    // Sync a specific key to cloud
    syncToCloud(localKey, value) {
        if (!this.currentUid) return;

        // Find short key
        const shortKey = Object.keys(this.keys).find(k => this.keys[k] === localKey);
        if (!shortKey) return;

        db.collection('users').doc(this.currentUid).update({
            [shortKey]: value
        }).catch(err => {
            // If document doesn't exist yet
            if (err.code === 'not-found') {
                this.uploadAllToCloud();
            } else {
                console.error('Sync update failed:', err);
            }
        });
    },

    // Trigger re-render of active components
    triggerReRender() {
        // Simple re-render of key components if they exist
        if (typeof App !== 'undefined') {
            App.renderDashboard();
            App.renderTasks();
            App.renderHabits();
            App.renderCalendar();
            App.renderStats();
            if (typeof Gamification !== 'undefined') Gamification.updateUI();
        }
    },

    // Get data with fallback
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    // Set data
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Sync to cloud
            this.syncToCloud(key, value);
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // Remove data
    remove(key) {
        try {
            localStorage.removeItem(key);
            // We generally don't delete field from cloud to prevent accidental data loss
            // If needed: this.syncToCloud(key, null) or fieldValue.delete()
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    // Get settings
    getSettings() {
        return this.get(this.keys.settings, this.defaultSettings);
    },

    // Save settings
    saveSettings(settings) {
        return this.set(this.keys.settings, { ...this.defaultSettings, ...settings });
    },

    // Get user data
    getUser() {
        return this.get(this.keys.user, this.defaultUser);
    },

    // Save user data
    saveUser(user) {
        return this.set(this.keys.user, user);
    },

    // Get tasks
    getTasks() {
        return this.get(this.keys.tasks, []);
    },

    // Save tasks
    saveTasks(tasks) {
        return this.set(this.keys.tasks, tasks);
    },

    // Get habits
    getHabits() {
        return this.get(this.keys.habits, []);
    },

    // Save habits
    saveHabits(habits) {
        return this.set(this.keys.habits, habits);
    },

    // Get journals
    getJournals() {
        return this.get(this.keys.journals, {});
    },

    // Save journals
    saveJournals(journals) {
        return this.set(this.keys.journals, journals);
    },

    // Get journal for specific date
    getJournal(date) {
        const journals = this.getJournals();
        return journals[date] || null;
    },

    // Save journal for specific date
    saveJournal(date, journal) {
        const journals = this.getJournals();
        journals[date] = journal;
        return this.saveJournals(journals);
    },

    // Get memos
    getMemos() {
        return this.get(this.keys.memos, []);
    },

    // Save memos
    saveMemos(memos) {
        return this.set(this.keys.memos, memos);
    },

    // Get quick memos
    getQuickMemos() {
        return this.get(this.keys.quickMemos, []);
    },

    // Save quick memos
    saveQuickMemos(memos) {
        return this.set(this.keys.quickMemos, memos);
    },

    // Get categories
    getCategories() {
        return this.get(this.keys.categories, this.defaultCategories);
    },

    // Save categories
    saveCategories(categories) {
        return this.set(this.keys.categories, categories);
    },

    // Get study records
    getStudyRecords() {
        return this.get(this.keys.studyRecords, {});
    },

    // Save study records
    saveStudyRecords(records) {
        return this.set(this.keys.studyRecords, records);
    },

    // Get study record for specific date
    getStudyRecord(date) {
        const records = this.getStudyRecords();
        return records[date] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] };
    },

    // Save study record for specific date
    saveStudyRecord(date, record) {
        const records = this.getStudyRecords();
        records[date] = record;
        return this.saveStudyRecords(records);
    },

    // Get timer settings
    getTimerSettings() {
        const settings = this.getSettings();
        return {
            workTime: settings.workTime,
            breakTime: settings.breakTime,
            longBreakTime: settings.longBreakTime,
            sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak
        };
    },

    // Export all data
    exportData() {
        const data = {};
        Object.keys(this.keys).forEach(key => {
            data[key] = this.get(this.keys[key]);
        });
        return data;
    },

    // Import data
    importData(data) {
        try {
            Object.keys(data).forEach(key => {
                if (this.keys[key]) {
                    this.set(this.keys[key], data[key]);
                }
            });
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    // Reset all data
    resetAll() {
        Object.values(this.keys).forEach(key => {
            this.remove(key);
        });
    },

    // Initialize storage with defaults if empty
    initialize() {
        if (!this.get(this.keys.settings)) {
            this.set(this.keys.settings, this.defaultSettings);
        }
        if (!this.get(this.keys.user)) {
            this.set(this.keys.user, this.defaultUser);
        }
        if (!this.get(this.keys.categories)) {
            this.set(this.keys.categories, this.defaultCategories);
        }
    }
};

// Initialize storage on load
Storage.initialize();
