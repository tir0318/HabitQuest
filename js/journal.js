// ====================================
// HabitQuest - Journal Module
// ====================================

const Journal = {
    currentDate: null,
    timerState: {
        duration: 10 * 60, // Default 10 minutes in seconds
        remaining: 10 * 60,
        isRunning: false,
        interval: null
    },

    // Initialize journal
    init() {
        this.currentDate = new Date().toISOString().split('T')[0];
        this.timerState.duration = 10 * 60;
        this.timerState.remaining = 10 * 60;
        this.load();
        this.bindEvents();
        this.updateTimerDisplay();
    },

    // Format date for display
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return date.toLocaleDateString('ja-JP', options);
    },

    // Load journal for current date
    load() {
        const journal = Storage.getJournal(this.currentDate);

        // Update date display
        const dateEl = document.getElementById('journal-date');
        if (dateEl) {
            dateEl.textContent = this.formatDate(this.currentDate);
        }

        // Load freeform
        const freeform = document.getElementById('journal-freeform');
        if (freeform) {
            freeform.value = journal?.freeform || '';
        }

        // Load goals
        const goals = document.getElementById('journal-goals');
        if (goals) {
            goals.value = journal?.goals || '';
        }

        // Load mood
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
            if (journal?.mood === btn.dataset.mood) {
                btn.classList.add('active');
            }
        });

        // Load accomplishments
        this.renderAccomplishments();
    },

    // Save journal
    save() {
        const freeform = document.getElementById('journal-freeform')?.value || '';
        const goals = document.getElementById('journal-goals')?.value || '';
        const activeMood = document.querySelector('.mood-btn.active');
        const mood = activeMood?.dataset.mood || null;

        const existingJournal = Storage.getJournal(this.currentDate) || {};

        const journal = {
            ...existingJournal,
            freeform,
            goals,
            mood,
            updatedAt: new Date().toISOString()
        };

        Storage.saveJournal(this.currentDate, journal);
        App.showToast('ジャーナルを保存しました', 'success');
    },

    // Navigate to previous day
    prevDay() {
        const date = new Date(this.currentDate);
        date.setDate(date.getDate() - 1);
        this.currentDate = date.toISOString().split('T')[0];
        this.load();
    },

    // Navigate to next day
    nextDay() {
        const today = new Date().toISOString().split('T')[0];
        if (this.currentDate >= today) return;

        const date = new Date(this.currentDate);
        date.setDate(date.getDate() + 1);
        this.currentDate = date.toISOString().split('T')[0];
        this.load();
    },

    // Add accomplishment to journal
    addAccomplishment(name) {
        if (!name.trim()) return;

        const journal = Storage.getJournal(this.currentDate) || {};
        if (!journal.accomplishments) journal.accomplishments = [];

        journal.accomplishments.push({
            id: 'acc_' + Date.now(),
            name: name.trim(),
            completed: true
        });

        Storage.saveJournal(this.currentDate, journal);
        this.renderAccomplishments();
    },

    // Delete accomplishment from journal
    deleteAccomplishment(id) {
        const journal = Storage.getJournal(this.currentDate);
        if (!journal?.accomplishments) return;

        journal.accomplishments = journal.accomplishments.filter(t => t.id !== id);
        Storage.saveJournal(this.currentDate, journal);
        this.renderAccomplishments();
    },

    // Render accomplishments
    renderAccomplishments() {
        const container = document.getElementById('journal-task-list');
        if (!container) return;

        const journal = Storage.getJournal(this.currentDate);
        const accomplishments = journal?.accomplishments || [];

        if (accomplishments.length === 0) {
            container.innerHTML = '<p class="empty-message">今日やったことを記録しましょう</p>';
            return;
        }

        container.innerHTML = accomplishments.map(item => `
            <div class="journal-task-item completed">
                <span class="task-done-icon">✓</span>
                <span class="task-name">${this.escapeHtml(item.name)}</span>
                <button class="btn btn-small btn-danger" onclick="Journal.deleteAccomplishment('${item.id}')">×</button>
            </div>
        `).join('');
    },

    // Journaling timer - Countdown
    startTimer() {
        if (this.timerState.isRunning) return;
        if (this.timerState.remaining <= 0) {
            this.resetTimer();
        }

        this.timerState.isRunning = true;
        this.timerState.interval = setInterval(() => {
            this.timerState.remaining--;
            this.updateTimerDisplay();

            if (this.timerState.remaining <= 0) {
                this.timerComplete();
            }
        }, 1000);

        const btn = document.getElementById('journal-timer-toggle');
        if (btn) btn.textContent = '停止';
    },

    stopTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerState.interval);

        const btn = document.getElementById('journal-timer-toggle');
        if (btn) btn.textContent = '開始';
    },

    resetTimer() {
        this.stopTimer();
        this.timerState.remaining = this.timerState.duration;
        this.updateTimerDisplay();
    },

    timerComplete() {
        this.stopTimer();
        App.showToast('ジャーナリングタイマーが終了しました！', 'success');
        // Play a sound if enabled
        const settings = Storage.getSettings();
        if (settings.soundEnabled) {
            this.playAlarm();
        }
    },

    playAlarm() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
    },

    toggleTimer() {
        if (this.timerState.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    },

    setTimerDuration(minutes) {
        const mins = parseInt(minutes);
        if (isNaN(mins) || mins < 1) return;

        this.timerState.duration = mins * 60;
        this.timerState.remaining = mins * 60;
        this.updateTimerDisplay();
    },

    updateTimerDisplay() {
        const display = document.getElementById('journal-timer-display');
        if (!display) return;

        const m = Math.floor(this.timerState.remaining / 60);
        const s = this.timerState.remaining % 60;
        display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Bind events
    bindEvents() {
        // Navigation
        const prevBtn = document.getElementById('journal-prev');
        const nextBtn = document.getElementById('journal-next');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevDay());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextDay());

        // Add accomplishment
        const addBtn = document.getElementById('journal-add-task');
        const input = document.getElementById('journal-task-input');
        if (addBtn && input) {
            addBtn.addEventListener('click', () => {
                this.addAccomplishment(input.value);
                input.value = '';
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addAccomplishment(input.value);
                    input.value = '';
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('save-journal');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        // Timer toggle
        const timerToggle = document.getElementById('journal-timer-toggle');
        if (timerToggle) {
            timerToggle.addEventListener('click', () => this.toggleTimer());
        }

        // Timer reset
        const timerReset = document.getElementById('journal-timer-reset');
        if (timerReset) {
            timerReset.addEventListener('click', () => this.resetTimer());
        }

        // Timer duration setting
        const timerDuration = document.getElementById('journal-timer-duration');
        if (timerDuration) {
            timerDuration.addEventListener('change', (e) => this.setTimerDuration(e.target.value));
        }

        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Auto-save on blur
        const freeform = document.getElementById('journal-freeform');
        const goals = document.getElementById('journal-goals');
        if (freeform) freeform.addEventListener('blur', () => this.save());
        if (goals) goals.addEventListener('blur', () => this.save());
    }
};
