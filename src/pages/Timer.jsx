import React from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useStorage } from '../contexts/StorageContext';

export default function Timer() {
    const {
        mode, setMode, timeLeft, totalTime, formatTime,
        isRunning, toggleTimer, resetTimer, skipSession,
        session, currentTaskId, setCurrentTaskId
    } = useTimer();

    const { tasks, studyRecords } = useStorage();

    // Calculate progress for SVG circle
    // r=90 => circumference = 2 * PI * 90 ≈ 565.48
    const circumference = 2 * Math.PI * 90;
    const progressOffset = circumference * (1 - timeLeft / totalTime);

    const today = new Date().toISOString().split('T')[0];
    const record = studyRecords[today] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] };

    const formatDuration = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Filter incomplete tasks for dropdown
    const incompleteTasks = tasks.filter(t => !t.completed);

    return (
        <section className="page active" id="page-timer">

            <div className="timer-container">
                <div className="timer-main">
                    <div className="timer-mode-tabs">
                        <button className={`timer-mode ${mode === 'work' ? 'active' : ''}`} onClick={() => setMode('work')}>作業</button>
                        <button className={`timer-mode ${mode === 'break' ? 'active' : ''}`} onClick={() => setMode('break')}>休憩</button>
                        <button className={`timer-mode ${mode === 'long-break' ? 'active' : ''}`} onClick={() => setMode('long-break')}>長休憩</button>
                    </div>

                    <div className="timer-circle">
                        <svg className="timer-svg" viewBox="0 0 200 200">
                            <defs>
                                <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                                    <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                                </linearGradient>
                            </defs>
                            <circle className="timer-bg" cx="100" cy="100" r="90" />
                            <circle
                                className="timer-progress"
                                cx="100" cy="100" r="90"
                                style={{ strokeDashoffset: progressOffset }}
                            />
                        </svg>
                        <div className="timer-display-big">{formatTime(timeLeft)}</div>
                    </div>

                    <div className="timer-session-info">
                        <span>セッション: <span>{session}</span>/4</span>
                    </div>

                    <div className="timer-controls-big">
                        <button className={`btn-circle ${isRunning ? 'btn-pause' : 'btn-start'}`} onClick={toggleTimer}>
                            {isRunning ? '⏸' : '▶'}
                        </button>
                        <button className="btn-circle btn-skip" onClick={skipSession}>⏭</button>
                        <button className="btn-circle btn-reset" onClick={resetTimer}>↻</button>
                    </div>

                    <div className="current-task-display">
                        <span>現在のタスク: </span>
                        <select value={currentTaskId} onChange={(e) => setCurrentTaskId(e.target.value)}>
                            <option value="">タスクを選択...</option>
                            {incompleteTasks.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="timer-sidebar">
                    <div className="study-record">
                        <h3>📚 本日の勉強記録</h3>
                        <div className="study-stats">
                            <div className="study-stat">
                                <span className="stat-icon">⏱️</span>
                                <span className="stat-value">{formatDuration(record.studyTime || 0)}</span>
                                <span className="stat-label">勉強時間</span>
                            </div>
                            <div className="study-stat">
                                <span className="stat-icon">☕</span>
                                <span className="stat-value">{formatDuration(record.breakTime || 0)}</span>
                                <span className="stat-label">休憩時間</span>
                            </div>
                            <div className="study-stat">
                                <span className="stat-icon">🍅</span>
                                <span className="stat-value">{record.pomodoros || 0}</span>
                                <span className="stat-label">完了ポモドーロ</span>
                            </div>
                        </div>
                    </div>
                    <div className="session-log">
                        <h3>📋 セッションログ</h3>
                        <div className="log-list">
                            {(!record.sessions || record.sessions.length === 0) ?
                                <p className="empty-message">まだセッションがありません</p> :
                                [...record.sessions].reverse().slice(0, 10).map((log, idx) => {
                                    const time = new Date(log.completedAt).toLocaleTimeString('ja-JP');
                                    const typeLabel = log.type === 'work' ? '🍅 作業' : log.type === 'break' ? '☕ 休憩' : '🌴 長休憩';
                                    return (
                                        <div key={idx} className="log-item">
                                            <span className="log-type">{typeLabel}</span>
                                            <span className="log-time">{time}</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
