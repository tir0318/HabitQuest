// ====================================
// HabitQuest - Gamification Module
// ====================================

const Gamification = {
    // XP required for each level (exponential growth)
    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    // Calculate total XP needed to reach a level
    getTotalXPForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.getXPForLevel(i);
        }
        return total;
    },

    // Add XP and handle level up
    addXP(amount, sourceElement = null) {
        const user = Storage.getUser();
        user.xp += amount;
        user.totalXP += amount;

        // Show XP gain animation
        if (sourceElement) {
            this.showXPGain(amount, sourceElement);
        }

        // Check for level up
        while (user.xp >= this.getXPForLevel(user.level)) {
            user.xp -= this.getXPForLevel(user.level);
            user.level++;
            user.maxHp += 10;
            user.hp = Math.min(user.hp + 20, user.maxHp);
            this.showLevelUp(user.level);
        }

        Storage.saveUser(user);
        this.updateUI();
        return user;
    },

    // Take damage
    takeDamage(amount) {
        const user = Storage.getUser();
        user.hp = Math.max(0, user.hp - amount);

        // Add shake effect
        document.querySelector('.hp-bar')?.classList.add('damage-effect');
        setTimeout(() => {
            document.querySelector('.hp-bar')?.classList.remove('damage-effect');
        }, 500);

        Storage.saveUser(user);
        this.updateUI();
        return user;
    },

    // Heal HP
    heal(amount) {
        const user = Storage.getUser();
        user.hp = Math.min(user.maxHp, user.hp + amount);
        Storage.saveUser(user);
        this.updateUI();
        return user;
    },

    // Deduct XP (for uncompleting tasks - prevents cheating)
    deductXP(amount) {
        const user = Storage.getUser();
        user.xp = Math.max(0, user.xp - amount);
        user.totalXP = Math.max(0, user.totalXP - amount);

        Storage.saveUser(user);
        this.updateUI();
        return user;
    },

    // Update streak
    updateStreak() {
        const user = Storage.getUser();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (user.lastActiveDate === yesterday) {
            user.streak++;
        } else if (user.lastActiveDate !== today) {
            user.streak = 1;
        }

        user.lastActiveDate = today;
        Storage.saveUser(user);
        this.updateUI();
        return user;
    },

    // Calculate XP for task completion
    calculateTaskXP(task) {
        const settings = Storage.getSettings();
        let baseXP = task.rewardXP || settings.baseXP;

        // Priority multiplier
        const multipliers = {
            low: 0.8,
            medium: 1.0,
            high: 1.5
        };
        baseXP *= multipliers[task.priority] || 1;

        // Streak bonus (5% per day, max 50%)
        const user = Storage.getUser();
        const streakBonus = Math.min(user.streak * 0.05, 0.5);
        baseXP *= (1 + streakBonus);

        return Math.round(baseXP);
    },

    // Calculate damage for missed task
    calculateTaskDamage(task) {
        const settings = Storage.getSettings();
        let damage = task.penalty || settings.damage;

        // Priority multiplier
        const multipliers = {
            low: 0.5,
            medium: 1.0,
            high: 2.0
        };
        damage *= multipliers[task.priority] || 1;

        return Math.round(damage);
    },

    // Show XP gain animation
    showXPGain(amount, element) {
        const rect = element.getBoundingClientRect();
        const xpEl = document.createElement('div');
        xpEl.className = 'xp-gain';
        xpEl.textContent = `+${amount} XP`;
        xpEl.style.left = `${rect.left + rect.width / 2}px`;
        xpEl.style.top = `${rect.top}px`;
        document.body.appendChild(xpEl);

        setTimeout(() => xpEl.remove(), 1500);
    },

    // Show level up animation
    showLevelUp(level) {
        const overlay = document.getElementById('level-up-overlay');
        const levelSpan = document.getElementById('new-level');

        if (overlay && levelSpan) {
            levelSpan.textContent = level;
            overlay.classList.add('active');

            // Play sound if enabled
            const settings = Storage.getSettings();
            if (settings.soundEnabled) {
                this.playLevelUpSound();
            }

            setTimeout(() => {
                overlay.classList.remove('active');
            }, 3000);
        }
    },

    // Play level up sound
    playLevelUpSound() {
        // Using Web Audio API for simple sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    // Play complete sound
    playCompleteSound() {
        const settings = Storage.getSettings();
        if (!settings.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    // Update UI elements
    updateUI() {
        const user = Storage.getUser();
        const xpForNextLevel = this.getXPForLevel(user.level);
        const xpPercent = (user.xp / xpForNextLevel) * 100;
        const hpPercent = (user.hp / user.maxHp) * 100;

        // Update level
        const levelEl = document.getElementById('user-level');
        if (levelEl) levelEl.textContent = user.level;

        // Update XP bar
        const xpFill = document.getElementById('xp-fill');
        if (xpFill) xpFill.style.width = `${xpPercent}%`;

        const currentXP = document.getElementById('current-xp');
        if (currentXP) currentXP.textContent = user.xp;

        const nextLevelXP = document.getElementById('next-level-xp');
        if (nextLevelXP) nextLevelXP.textContent = xpForNextLevel;

        // Update HP bar
        const hpFill = document.getElementById('hp-fill');
        if (hpFill) hpFill.style.width = `${hpPercent}%`;

        const currentHP = document.getElementById('current-hp');
        if (currentHP) currentHP.textContent = user.hp;

        // Update streak
        const streakEl = document.getElementById('streak');
        if (streakEl) streakEl.textContent = user.streak;
    },

    // Get today's XP
    getTodayXP() {
        const today = new Date().toISOString().split('T')[0];
        const tasks = Storage.getTasks();
        let totalXP = 0;

        tasks.forEach(task => {
            if (task.completedAt && task.completedAt.startsWith(today)) {
                totalXP += this.calculateTaskXP(task);
            }
        });

        return totalXP;
    },

    // Initialize
    init() {
        this.updateStreak();
        this.updateUI();
    }
};
