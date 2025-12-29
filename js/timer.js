// ====================================
// HabitQuest - Timer Module
// ====================================

const Timer = {
    state: {
        mode: 'work', // work, break, long-break
        timeLeft: 50 * 60, // seconds
        totalTime: 50 * 60,
        isRunning: false,
        session: 1,
        interval: null,
        currentTask: null,
        todayStudyTime: 0,
        todayBreakTime: 0,
        completedPomodoros: 0,
        sessionStartTime: null
    },

    // Initialize timer
    init() {
        const settings = Storage.getTimerSettings();
        this.state.timeLeft = settings.workTime * 60;
        this.state.totalTime = settings.workTime * 60;
        this.loadTodayRecord();
        this.updateDisplay();
        this.bindEvents();
    },

    // Load today's record
    loadTodayRecord() {
        const today = new Date().toISOString().split('T')[0];
        const record = Storage.getStudyRecord(today);
        this.state.todayStudyTime = record.studyTime || 0;
        this.state.todayBreakTime = record.breakTime || 0;
        this.state.completedPomodoros = record.pomodoros || 0;
    },

    // Save today's record
    saveTodayRecord() {
        const today = new Date().toISOString().split('T')[0];
        const record = Storage.getStudyRecord(today);
        record.studyTime = this.state.todayStudyTime;
        record.breakTime = this.state.todayBreakTime;
        record.pomodoros = this.state.completedPomodoros;
        Storage.saveStudyRecord(today, record);
    },

    // Format time
    formatTime(seconds, includeHours = false) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (includeHours || h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Start timer
    start() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.sessionStartTime = Date.now();

        this.state.interval = setInterval(() => {
            this.tick();
        }, 1000);

        this.updateControls();
    },

    // Pause timer
    pause() {
        if (!this.state.isRunning) return;

        this.state.isRunning = false;
        clearInterval(this.state.interval);
        this.state.interval = null;

        // Save elapsed time
        if (this.state.sessionStartTime) {
            const elapsed = Math.floor((Date.now() - this.state.sessionStartTime) / 1000);
            if (this.state.mode === 'work') {
                this.state.todayStudyTime += elapsed;
            } else {
                this.state.todayBreakTime += elapsed;
            }
            this.saveTodayRecord();
            this.state.sessionStartTime = null;
        }

        this.updateControls();
    },

    // Timer tick
    tick() {
        this.state.timeLeft--;

        // Update accumulated time
        if (this.state.mode === 'work') {
            this.state.todayStudyTime++;
        } else {
            this.state.todayBreakTime++;
        }

        // Save every 30 seconds
        if (this.state.timeLeft % 30 === 0) {
            this.saveTodayRecord();
        }

        this.updateDisplay();
        this.updateProgress();

        if (this.state.timeLeft <= 0) {
            this.complete();
        }
    },

    // Complete current session
    complete() {
        this.pause();
        this.playAlarm();
        this.showNotification();

        const settings = Storage.getTimerSettings();

        if (this.state.mode === 'work') {
            this.state.completedPomodoros++;
            this.addSessionLog('work');

            // Add XP for completed pomodoro
            Gamification.addXP(15);

            // Check if long break is needed
            if (this.state.session >= settings.sessionsBeforeLongBreak) {
                this.setMode('long-break');
                this.state.session = 1;
            } else {
                this.setMode('break');
                this.state.session++;
            }
        } else {
            this.addSessionLog(this.state.mode);
            this.setMode('work');
        }

        this.saveTodayRecord();
        this.updateStats();
    },

    // Set timer mode
    setMode(mode) {
        const settings = Storage.getTimerSettings();
        this.state.mode = mode;

        switch (mode) {
            case 'work':
                this.state.timeLeft = settings.workTime * 60;
                this.state.totalTime = settings.workTime * 60;
                break;
            case 'break':
                this.state.timeLeft = settings.breakTime * 60;
                this.state.totalTime = settings.breakTime * 60;
                break;
            case 'long-break':
                this.state.timeLeft = settings.longBreakTime * 60;
                this.state.totalTime = settings.longBreakTime * 60;
                break;
        }

        this.updateDisplay();
        this.updateProgress();
        this.updateModeButtons();
    },

    // Skip current session
    skip() {
        this.pause();
        this.complete();
    },

    // Reset timer
    reset() {
        this.pause();
        const settings = Storage.getTimerSettings();
        this.state.mode = 'work';
        this.state.timeLeft = settings.workTime * 60;
        this.state.totalTime = settings.workTime * 60;
        this.state.session = 1;
        this.updateDisplay();
        this.updateProgress();
        this.updateModeButtons();
    },

    // Update display
    updateDisplay() {
        const display = document.getElementById('pomodoro-display');
        if (display) {
            display.textContent = this.formatTime(this.state.timeLeft);
        }

        const session = document.getElementById('pomodoro-session');
        if (session) {
            const settings = Storage.getTimerSettings();
            session.textContent = this.state.session;
        }
    },

    // Update progress circle
    updateProgress() {
        const progress = document.getElementById('timer-progress');
        if (!progress) return;

        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - this.state.timeLeft / this.state.totalTime);
        progress.style.strokeDashoffset = offset;
    },

    // Update controls
    updateControls() {
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');

        if (startBtn && pauseBtn) {
            if (this.state.isRunning) {
                startBtn.style.display = 'none';
                pauseBtn.style.display = 'flex';
            } else {
                startBtn.style.display = 'flex';
                pauseBtn.style.display = 'none';
            }
        }
    },

    // Update mode buttons
    updateModeButtons() {
        document.querySelectorAll('.timer-mode').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.state.mode) {
                btn.classList.add('active');
            }
        });
    },

    // Update stats display
    updateStats() {
        const studyTime = document.getElementById('total-study-time');
        if (studyTime) {
            studyTime.textContent = this.formatTime(this.state.todayStudyTime, true);
        }

        const breakTime = document.getElementById('total-break-time');
        if (breakTime) {
            breakTime.textContent = this.formatTime(this.state.todayBreakTime, true);
        }

        const pomodoros = document.getElementById('completed-pomodoros');
        if (pomodoros) {
            pomodoros.textContent = this.state.completedPomodoros;
        }

        // Dashboard quick stats
        const todayStudy = document.getElementById('today-study-time');
        if (todayStudy) {
            const hours = Math.floor(this.state.todayStudyTime / 3600);
            const mins = Math.floor((this.state.todayStudyTime % 3600) / 60);
            todayStudy.textContent = `${hours}:${mins.toString().padStart(2, '0')}`;
        }

        const todayPomodoro = document.getElementById('today-pomodoro');
        if (todayPomodoro) {
            todayPomodoro.textContent = this.state.completedPomodoros;
        }
    },

    // Add session log
    addSessionLog(type) {
        const today = new Date().toISOString().split('T')[0];
        const record = Storage.getStudyRecord(today);

        if (!record.sessions) record.sessions = [];

        record.sessions.push({
            type: type,
            task: this.state.currentTask,
            completedAt: new Date().toISOString()
        });

        Storage.saveStudyRecord(today, record);
        this.renderSessionLog();
    },

    // Render session log
    renderSessionLog() {
        const container = document.getElementById('session-log-list');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const record = Storage.getStudyRecord(today);
        const sessions = record.sessions || [];

        if (sessions.length === 0) {
            container.innerHTML = '<p class="empty-message">まだセッションがありません</p>';
            return;
        }

        container.innerHTML = sessions.slice(-10).reverse().map(session => {
            const time = new Date(session.completedAt).toLocaleTimeString('ja-JP');
            const typeLabel = session.type === 'work' ? '🍅 作業' :
                session.type === 'break' ? '☕ 休憩' : '🌴 長休憩';
            return `
                <div class="log-item">
                    <span class="log-type">${typeLabel}</span>
                    <span class="log-time">${time}</span>
                </div>
            `;
        }).join('');
    },

    // Play alarm sound
    playAlarm() {
        const settings = Storage.getSettings();
        if (!settings.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + i * 0.3);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.3 + 0.2);

                oscillator.start(audioContext.currentTime + i * 0.3);
                oscillator.stop(audioContext.currentTime + i * 0.3 + 0.2);
            }
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    // Show notification
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = this.state.mode === 'work' ? '作業完了！' : '休憩終了！';
            const body = this.state.mode === 'work' ? '休憩を取りましょう' : '次のセッションを始めましょう';
            new Notification(title, { body, icon: '🍅' });
        }
    },

    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    // Bind events
    bindEvents() {
        const startBtn = document.getElementById('pomodoro-start');
        const pauseBtn = document.getElementById('pomodoro-pause');
        const skipBtn = document.getElementById('pomodoro-skip');
        const resetBtn = document.getElementById('pomodoro-reset');

        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skip());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

        // Mode buttons
        document.querySelectorAll('.timer-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.state.isRunning) {
                    if (confirm('タイマーを停止してモードを切り替えますか？')) {
                        this.pause();
                        this.setMode(btn.dataset.mode);
                    }
                } else {
                    this.setMode(btn.dataset.mode);
                }
            });
        });

        // Task select
        const taskSelect = document.getElementById('timer-task-select');
        if (taskSelect) {
            taskSelect.addEventListener('change', (e) => {
                this.state.currentTask = e.target.value || null;
            });
        }

        // Request notification permission
        this.requestNotificationPermission();
    },

    // Update task select options
    updateTaskOptions() {
        const select = document.getElementById('timer-task-select');
        if (!select) return;

        const tasks = Tasks.getIncomplete();
        select.innerHTML = '<option value="">タスクを選択...</option>';

        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            select.appendChild(option);
        });
    }
};

// Quick Timer for Dashboard
const QuickTimer = {
    state: {
        time: 0,
        isRunning: false,
        interval: null
    },

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    start() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.state.interval = setInterval(() => {
            this.state.time++;
            this.updateDisplay();
        }, 1000);
    },

    pause() {
        this.state.isRunning = false;
        clearInterval(this.state.interval);
    },

    reset() {
        this.pause();
        this.state.time = 0;
        this.updateDisplay();
    },

    updateDisplay() {
        const display = document.getElementById('quick-timer-display');
        if (display) {
            display.textContent = this.formatTime(this.state.time);
        }
    },

    init() {
        const startBtn = document.getElementById('quick-timer-start');
        const pauseBtn = document.getElementById('quick-timer-pause');
        const resetBtn = document.getElementById('quick-timer-reset');

        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    }
};
