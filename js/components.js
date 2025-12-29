// ====================================
// HabitQuest - Components Module
// ====================================

const Components = {
    // Render sidebar
    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">⚔️</span>
                    <span class="logo-text">HabitQuest</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <button class="nav-item active" data-page="dashboard">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">ダッシュボード</span>
                </button>
                <button class="nav-item" data-page="tasks">
                    <span class="nav-icon">📋</span>
                    <span class="nav-text">タスク管理</span>
                </button>
                <button class="nav-item" data-page="habits">
                    <span class="nav-icon">🔄</span>
                    <span class="nav-text">習慣</span>
                </button>
                <button class="nav-item" data-page="timer">
                    <span class="nav-icon">⏱️</span>
                    <span class="nav-text">タイマー</span>
                </button>
                <button class="nav-item" data-page="journal">
                    <span class="nav-icon">📔</span>
                    <span class="nav-text">ジャーナル</span>
                </button>
                <button class="nav-item" data-page="memo">
                    <span class="nav-icon">📝</span>
                    <span class="nav-text">メモ</span>
                </button>
                <button class="nav-item" data-page="calendar">
                    <span class="nav-icon">📅</span>
                    <span class="nav-text">カレンダー</span>
                </button>
                <button class="nav-item" data-page="stats">
                    <span class="nav-icon">📈</span>
                    <span class="nav-text">統計</span>
                </button>
                <button class="nav-item" data-page="settings">
                    <span class="nav-icon">⚙️</span>
                    <span class="nav-text">設定</span>
                </button>
            </nav>

            <div class="sidebar-footer">
                <div class="user-stats">
                    <div class="user-level">
                        <span class="level-badge">Lv.<span id="user-level">1</span></span>
                        <div class="xp-bar">
                            <div class="xp-fill" id="xp-fill" style="width: 0%"></div>
                        </div>
                        <span class="xp-text"><span id="current-xp">0</span>/<span id="next-level-xp">100</span> XP</span>
                    </div>
                    <div class="user-hp">
                        <span class="hp-icon">❤️</span>
                        <div class="hp-bar">
                            <div class="hp-fill" id="hp-fill" style="width: 100%"></div>
                        </div>
                        <span class="hp-text"><span id="current-hp">100</span>/100</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Render header
    renderHeader() {
        const header = document.getElementById('main-header');
        if (!header) return;

        header.innerHTML = `
            <button class="menu-toggle" id="menu-toggle">☰</button>
            <div class="header-center">
                <div class="current-time" id="current-time">00:00:00</div>
                <div class="current-date" id="current-date"></div>
            </div>
            <div class="header-right">
                <div class="quick-stats">
                    <span class="stat-item" title="今日のXP">🌟 <span id="today-xp">0</span></span>
                    <span class="stat-item" title="連続達成">🔥 <span id="streak">0</span>日</span>
                </div>
                <button class="theme-toggle" id="theme-toggle" title="テーマ切替">🌙</button>
            </div>
        `;
    },

    // Render quick memo bar
    renderQuickMemoBar() {
        const bar = document.getElementById('quick-memo-bar');
        if (!bar) return;

        bar.innerHTML = `
            <input type="text" id="quick-memo-input" placeholder="クイックメモ: 思いついたことをすぐメモ..." class="quick-memo-input">
            <button class="quick-memo-add" id="quick-memo-add">+</button>
        `;
    },

    // Render pages container
    renderPages() {
        const container = document.getElementById('page-container');
        if (!container) return;

        container.innerHTML = `
            ${this.renderDashboardPage()}
            ${this.renderTasksPage()}
            ${this.renderHabitsPage()}
            ${this.renderTimerPage()}
            ${this.renderJournalPage()}
            ${this.renderMemoPage()}
            ${this.renderCalendarPage()}
            ${this.renderStatsPage()}
            ${this.renderSettingsPage()}
        `;
    },

    // Dashboard page
    renderDashboardPage() {
        return `
            <section class="page active" id="page-dashboard">
                <div class="page-header">
                    <h1>ダッシュボード</h1>
                </div>
                <div class="dashboard-grid">
                    <div class="dashboard-card today-overview">
                        <h3>📊 今日の概要</h3>
                        <div class="overview-stats">
                            <div class="overview-stat">
                                <span class="stat-value" id="today-tasks-completed">0</span>
                                <span class="stat-label">完了タスク</span>
                            </div>
                            <div class="overview-stat">
                                <span class="stat-value" id="today-tasks-total">0</span>
                                <span class="stat-label">全タスク</span>
                            </div>
                            <div class="overview-stat">
                                <span class="stat-value" id="today-study-time">0:00</span>
                                <span class="stat-label">勉強時間</span>
                            </div>
                            <div class="overview-stat">
                                <span class="stat-value" id="today-pomodoro">0</span>
                                <span class="stat-label">ポモドーロ</span>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-card today-tasks">
                        <h3>📋 本日対応</h3>
                        <div class="task-list" id="today-task-list">
                            <p class="empty-message">本日のタスクはありません</p>
                        </div>
                    </div>
                    <div class="dashboard-card habits-overview">
                        <h3>🔄 今日の習慣</h3>
                        <div class="habit-list" id="today-habit-list">
                            <p class="empty-message">習慣を追加してください</p>
                        </div>
                    </div>
                    <div class="dashboard-card quick-timer">
                        <h3>⏱️ クイックタイマー</h3>
                        <div class="timer-display" id="quick-timer-display">00:00:00</div>
                        <div class="timer-controls">
                            <button class="btn btn-primary" id="quick-timer-start">開始</button>
                            <button class="btn btn-secondary" id="quick-timer-pause">一時停止</button>
                            <button class="btn btn-danger" id="quick-timer-reset">リセット</button>
                        </div>
                    </div>
                    <div class="dashboard-card recent-memos">
                        <h3>📝 最近のメモ</h3>
                        <div class="memo-list" id="recent-memo-list">
                            <p class="empty-message">メモはありません</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    // Tasks page
    renderTasksPage() {
        return `
            <section class="page" id="page-tasks">
                <div class="page-header">
                    <h1>タスク管理</h1>
                    <button class="btn btn-primary" id="add-task-btn">+ 新規タスク</button>
                </div>
                <div class="task-filters">
                    <div class="filter-group">
                        <label>種別:</label>
                        <select id="filter-type">
                            <option value="all">すべて</option>
                            <option value="todo">やること</option>
                            <option value="daily">日課</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>状態:</label>
                        <select id="filter-status">
                            <option value="all">すべて</option>
                            <option value="not-started">未着手</option>
                            <option value="in-progress">進行中</option>
                            <option value="today">本日対応</option>
                            <option value="completed">完了</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>カテゴリー:</label>
                        <select id="filter-category"></select>
                    </div>
                </div>
                <div class="tasks-container">
                    <div class="task-column">
                        <h3 class="column-header">📌 未着手</h3>
                        <div class="task-list" id="task-list-not-started"></div>
                    </div>
                    <div class="task-column">
                        <h3 class="column-header">🔄 進行中</h3>
                        <div class="task-list" id="task-list-in-progress"></div>
                    </div>
                    <div class="task-column">
                        <h3 class="column-header">⚡ 本日対応</h3>
                        <div class="task-list" id="task-list-today"></div>
                    </div>
                </div>
            </section>
        `;
    },

    // Habits page
    renderHabitsPage() {
        return `
            <section class="page" id="page-habits">
                <div class="page-header">
                    <h1>習慣トラッカー</h1>
                    <button class="btn btn-primary" id="add-habit-btn">+ 新規習慣</button>
                </div>
                <div class="habits-container">
                    <div class="habit-section positive-habits">
                        <h3>✅ ポジティブ習慣</h3>
                        <div class="habit-list" id="positive-habits-list"></div>
                    </div>
                    <div class="habit-section negative-habits">
                        <h3>❌ ネガティブ習慣（やめたいこと）</h3>
                        <div class="habit-list" id="negative-habits-list"></div>
                    </div>
                </div>
            </section>
        `;
    },

    // Timer page
    renderTimerPage() {
        return `
            <section class="page" id="page-timer">
                <div class="page-header">
                    <h1>ポモドーロタイマー</h1>
                </div>
                <div class="timer-container">
                    <div class="timer-main">
                        <div class="timer-mode-tabs">
                            <button class="timer-mode active" data-mode="work">作業</button>
                            <button class="timer-mode" data-mode="break">休憩</button>
                            <button class="timer-mode" data-mode="long-break">長休憩</button>
                        </div>
                        <div class="timer-circle">
                            <svg class="timer-svg" viewBox="0 0 200 200">
                                <defs>
                                    <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#6366f1"/>
                                        <stop offset="100%" style="stop-color:#8b5cf6"/>
                                    </linearGradient>
                                </defs>
                                <circle class="timer-bg" cx="100" cy="100" r="90"/>
                                <circle class="timer-progress" id="timer-progress" cx="100" cy="100" r="90"/>
                            </svg>
                            <div class="timer-display-big" id="pomodoro-display">50:00</div>
                        </div>
                        <div class="timer-session-info">
                            <span>セッション: <span id="pomodoro-session">1</span>/4</span>
                        </div>
                        <div class="timer-controls-big">
                            <button class="btn-circle btn-start" id="pomodoro-start">▶</button>
                            <button class="btn-circle btn-pause" id="pomodoro-pause" style="display:none">⏸</button>
                            <button class="btn-circle btn-skip" id="pomodoro-skip">⏭</button>
                            <button class="btn-circle btn-reset" id="pomodoro-reset">↻</button>
                        </div>
                        <div class="current-task-display">
                            <span>現在のタスク: </span>
                            <select id="timer-task-select">
                                <option value="">タスクを選択...</option>
                            </select>
                        </div>
                    </div>
                    <div class="timer-sidebar">
                        <div class="study-record">
                            <h3>📚 本日の勉強記録</h3>
                            <div class="study-stats">
                                <div class="study-stat">
                                    <span class="stat-icon">⏱️</span>
                                    <span class="stat-value" id="total-study-time">0:00:00</span>
                                    <span class="stat-label">勉強時間</span>
                                </div>
                                <div class="study-stat">
                                    <span class="stat-icon">☕</span>
                                    <span class="stat-value" id="total-break-time">0:00:00</span>
                                    <span class="stat-label">休憩時間</span>
                                </div>
                                <div class="study-stat">
                                    <span class="stat-icon">🍅</span>
                                    <span class="stat-value" id="completed-pomodoros">0</span>
                                    <span class="stat-label">完了ポモドーロ</span>
                                </div>
                            </div>
                        </div>
                        <div class="session-log">
                            <h3>📋 セッションログ</h3>
                            <div class="log-list" id="session-log-list">
                                <p class="empty-message">まだセッションがありません</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    // Journal page
    renderJournalPage() {
        return `
            <section class="page" id="page-journal">
                <div class="page-header">
                    <h1>ジャーナル</h1>
                    <div class="journal-date-nav">
                        <button class="btn btn-icon" id="journal-prev">◀</button>
                        <span id="journal-date"></span>
                        <button class="btn btn-icon" id="journal-next">▶</button>
                    </div>
                </div>
                <div class="journal-container">
                    <div class="journal-section">
                        <h3>✅ 今日やったこと</h3>
                        <p class="section-description">今日達成したことを振り返って記録しましょう</p>
                        <div class="journal-tasks">
                            <div class="task-input-row">
                                <input type="text" placeholder="達成したことを追加..." id="journal-task-input" class="styled-input">
                                <button class="btn btn-primary" id="journal-add-task">追加</button>
                            </div>
                            <div class="journal-task-list" id="journal-task-list"></div>
                        </div>
                    </div>
                    <div class="journal-section">
                        <h3>✍️ フリー入力</h3>
                        <div class="journal-timer">
                            <span>ジャーナリングタイマー: </span>
                            <select id="journal-timer-duration" class="styled-select timer-duration-select">
                                <option value="5">5分</option>
                                <option value="10" selected>10分</option>
                                <option value="15">15分</option>
                                <option value="20">20分</option>
                                <option value="30">30分</option>
                            </select>
                            <span id="journal-timer-display" class="timer-display-inline">10:00</span>
                            <button class="btn btn-small btn-primary" id="journal-timer-toggle">開始</button>
                            <button class="btn btn-small btn-secondary" id="journal-timer-reset">リセット</button>
                        </div>
                        <textarea class="journal-textarea styled-textarea" id="journal-freeform" placeholder="今日の振り返り、思ったこと、気づきなど..."></textarea>
                    </div>
                    <div class="journal-section">
                        <h3>🎯 目標・夢</h3>
                        <textarea class="journal-textarea small styled-textarea" id="journal-goals" placeholder="達成したい目標、夢、願望..."></textarea>
                    </div>
                    <div class="journal-section">
                        <h3>😊 今日の気分</h3>
                        <div class="mood-selector">
                            <button class="mood-btn" data-mood="great">😄</button>
                            <button class="mood-btn" data-mood="good">🙂</button>
                            <button class="mood-btn" data-mood="neutral">😐</button>
                            <button class="mood-btn" data-mood="bad">😔</button>
                            <button class="mood-btn" data-mood="terrible">😢</button>
                        </div>
                    </div>
                    <div class="journal-actions">
                        <button class="btn btn-primary" id="save-journal">保存</button>
                    </div>
                </div>
            </section>
        `;
    },

    // Memo page
    renderMemoPage() {
        return `
            <section class="page" id="page-memo">
                <div class="page-header">
                    <h1>メモ</h1>
                    <button class="btn btn-primary" id="add-memo-btn">+ 新規メモ</button>
                </div>
                <div class="memo-container">
                    <div class="memo-section quick-memos">
                        <h3>⚡ クイックメモ</h3>
                        <div class="quick-memo-list" id="quick-memo-list"></div>
                    </div>
                    <div class="memo-section titled-memos">
                        <h3>📄 タイトル付きメモ</h3>
                        <div class="titled-memo-list" id="titled-memo-list"></div>
                    </div>
                </div>
            </section>
        `;
    },

    // Calendar page
    renderCalendarPage() {
        return `
            <section class="page" id="page-calendar">
                <div class="page-header">
                    <h1>カレンダー</h1>
                    <div class="calendar-nav">
                        <button class="btn btn-icon" id="calendar-prev">◀</button>
                        <span id="calendar-month"></span>
                        <button class="btn btn-icon" id="calendar-next">▶</button>
                    </div>
                </div>
                <div class="calendar-container">
                    <div class="calendar-grid">
                        <div class="calendar-header">
                            <span>日</span><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span>
                        </div>
                        <div class="calendar-days" id="calendar-days"></div>
                    </div>
                    <div class="calendar-details" id="calendar-details">
                        <h3>選択した日の記録</h3>
                        <div class="day-details" id="day-details">
                            <p class="empty-message">日付を選択してください</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    // Stats page
    renderStatsPage() {
        return `
            <section class="page" id="page-stats">
                <div class="page-header">
                    <h1>統計・分析</h1>
                </div>
                <div class="stats-container">
                    <div class="stats-card">
                        <h3>📈 総合統計</h3>
                        <div class="stats-summary" id="stats-summary"></div>
                    </div>
                    <div class="stats-card">
                        <h3>⏱️ 勉強時間（直近7日）</h3>
                        <div class="stats-chart" id="study-chart"></div>
                    </div>
                </div>
            </section>
        `;
    },

    // Settings page
    renderSettingsPage() {
        const settings = Storage.getSettings();
        return `
            <section class="page" id="page-settings">
                <div class="page-header">
                    <h1>設定</h1>
                </div>
                <div class="settings-container">
                    <div class="settings-section">
                        <h3>⏱️ ポモドーロ設定</h3>
                        <div class="setting-item">
                            <label>作業時間（分）</label>
                            <input type="number" id="setting-work-time" value="${settings.workTime}" min="1" max="120">
                        </div>
                        <div class="setting-item">
                            <label>休憩時間（分）</label>
                            <input type="number" id="setting-break-time" value="${settings.breakTime}" min="1" max="60">
                        </div>
                        <div class="setting-item">
                            <label>長休憩時間（分）</label>
                            <input type="number" id="setting-long-break-time" value="${settings.longBreakTime}" min="1" max="60">
                        </div>
                        <div class="setting-item">
                            <label>長休憩までのセッション数</label>
                            <input type="number" id="setting-sessions" value="${settings.sessionsBeforeLongBreak}" min="1" max="10">
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>🎮 ゲーミフィケーション設定</h3>
                        <div class="setting-item">
                            <label>タスク完了時の基本XP</label>
                            <input type="number" id="setting-base-xp" value="${settings.baseXP}" min="1" max="100">
                        </div>
                        <div class="setting-item">
                            <label>習慣完了時の基本XP</label>
                            <input type="number" id="setting-habit-xp" value="${settings.habitXP}" min="1" max="50">
                        </div>
                        <div class="setting-item">
                            <label>タスク未完了時のダメージ</label>
                            <input type="number" id="setting-damage" value="${settings.damage}" min="0" max="50">
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>🏷️ カテゴリー管理</h3>
                        <div class="category-list" id="category-list"></div>
                        <div class="category-add">
                            <input type="text" id="new-category-input" placeholder="新しいカテゴリー名">
                            <input type="color" id="new-category-color" value="#6366f1">
                            <button class="btn btn-primary" id="add-category-btn">追加</button>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>🎨 表示設定</h3>
                        <div class="setting-item">
                            <label>ダークモード</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-dark-mode" ${settings.darkMode ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>通知音</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-sound" ${settings.soundEnabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h3>💾 データ管理</h3>
                        <div class="setting-actions">
                            <button class="btn btn-secondary" id="export-data-btn">データエクスポート</button>
                            <button class="btn btn-secondary" id="import-data-btn">データインポート</button>
                            <button class="btn btn-danger" id="reset-data-btn">全データリセット</button>
                        </div>
                        <input type="file" id="import-file-input" accept=".json" style="display:none">
                    </div>
                    <div class="settings-actions">
                        <button class="btn btn-primary" id="save-settings-btn">設定を保存</button>
                    </div>
                </div>
            </section>
        `;
    },

    // Render modals
    renderModals() {
        const container = document.getElementById('modals-container');
        if (!container) return;

        container.innerHTML = `
            ${this.renderTaskModal()}
            ${this.renderHabitModal()}
            ${this.renderMemoModal()}
        `;
    },

    // Task modal
    renderTaskModal() {
        return `
            <div class="modal" id="task-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="task-modal-title">新規タスク</h2>
                        <button class="modal-close" id="task-modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>タスク名 *</label>
                            <input type="text" id="task-name" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>種別</label>
                                <select id="task-type">
                                    <option value="todo">やること</option>
                                    <option value="daily">日課</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>カテゴリー</label>
                                <select id="task-category"></select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>期日</label>
                                <input type="date" id="task-due-date">
                            </div>
                            <div class="form-group">
                                <label>重要度</label>
                                <select id="task-priority">
                                    <option value="low">低</option>
                                    <option value="medium" selected>中</option>
                                    <option value="high">高</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>状態</label>
                                <select id="task-status">
                                    <option value="not-started" selected>未着手</option>
                                    <option value="in-progress">進行中</option>
                                    <option value="today">本日対応</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>備考</label>
                            <textarea id="task-notes" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="task-cancel">キャンセル</button>
                        <button class="btn btn-primary" id="task-save">保存</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Habit modal
    renderHabitModal() {
        return `
            <div class="modal" id="habit-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="habit-modal-title">新規習慣</h2>
                        <button class="modal-close" id="habit-modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>習慣名 *</label>
                            <input type="text" id="habit-name" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>タイプ</label>
                                <select id="habit-type">
                                    <option value="positive">ポジティブ（やりたいこと）</option>
                                    <option value="negative">ネガティブ（やめたいこと）</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>カテゴリー</label>
                                <select id="habit-category"></select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>報酬XP</label>
                                <input type="number" id="habit-reward" value="5" min="1">
                            </div>
                            <div class="form-group">
                                <label>罰則ダメージ</label>
                                <input type="number" id="habit-penalty" value="5" min="0">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="habit-cancel">キャンセル</button>
                        <button class="btn btn-primary" id="habit-save">保存</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Memo modal
    renderMemoModal() {
        return `
            <div class="modal" id="memo-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="memo-modal-title">新規メモ</h2>
                        <button class="modal-close" id="memo-modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>タイトル</label>
                            <input type="text" id="memo-title">
                        </div>
                        <div class="form-group">
                            <label>カテゴリー</label>
                            <select id="memo-category"></select>
                        </div>
                        <div class="form-group">
                            <label>内容</label>
                            <textarea id="memo-content" rows="10"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="memo-cancel">キャンセル</button>
                        <button class="btn btn-primary" id="memo-save">保存</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render level up overlay
    renderLevelUpOverlay() {
        const overlay = document.getElementById('level-up-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h2>Level Up!</h2>
                <p>レベル <span id="new-level">2</span> に到達しました！</p>
            </div>
        `;
    },

    // Initialize all components
    init() {
        this.renderSidebar();
        this.renderHeader();
        this.renderQuickMemoBar();
        this.renderPages();
        this.renderModals();
        this.renderLevelUpOverlay();
    }
};
