import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import TaskCard from '../components/TaskCard';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { tasks, user, habits, memos, quickMemos } = useStorage();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => (t.status === 'today' || t.type === 'daily') && !t.completed); // Active items
    // Calculate completed today
    const completedToday = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(today)).length;

    // XP gain today? Complex to track without history, maybe just use user.xp for now or 0
    // Original app calculated explicitly.

    const nextLevelXP = 100 + (user.level - 1) * 10;
    const xpPercent = Math.min(100, (user.xp / nextLevelXP) * 100);

    return (
        <section className="page active" id="page-dashboard">
            <div className="page-header">
                <h1>ダッシュボード</h1>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card today-overview">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>📊 今日の概要</h3>
                        <div className="mini-level-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Lv.{user.level} (あと {nextLevelXP - user.xp} XP)
                        </div>
                    </div>
                    <div className="overview-stats">
                        <div className="overview-stat">
                            <span className="stat-value">{completedToday}</span>
                            <span className="stat-label">完了</span>
                        </div>
                        <div className="overview-stat">
                            <span className="stat-value">{todayTasks.length}</span>
                            <span className="stat-label">未完了</span>
                        </div>
                        <div className="overview-stat">
                            <span className="stat-value">{user.streak}</span>
                            <span className="stat-label">継続日数</span>
                        </div>
                    </div>
                    <div className="xp-bar" style={{ marginTop: '20px', height: '6px' }}>
                        <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
                    </div>
                </div>

                <div className="dashboard-card today-tasks">
                    <h3>📋 優先タスク</h3>
                    <div className="task-list">
                        {todayTasks.length === 0 ? <p className="empty-message">本日の予定はありません</p> :
                            todayTasks.slice(0, 5).map(task =>
                                <TaskCard key={task.id} task={task} onEdit={() => navigate('/tasks')} />
                            )
                        }
                    </div>
                </div>

                <div className="dashboard-card habits-overview">
                    <h3>🔄 継続中の習慣</h3>
                    <div className="habit-list">
                        {habits.length === 0 ? <p className="empty-message">習慣を始めてみましょう</p> :
                            habits.slice(0, 3).map(h => (
                                <div key={h.id} className="habit-card-small">
                                    <span className="habit-name">{h.icon} {h.name}</span>
                                    <span className="habit-count">{h.lastTracked === today ? h.todayCount : 0} 回</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="dashboard-card memo-widget">
                    <h3>📝 最近のメモ</h3>
                    <div className="memo-list-small">
                        {quickMemos.length === 0 && memos.length === 0 ? (
                            <p className="empty-message">メモはありません</p>
                        ) : (
                            <>
                                {quickMemos.slice(0, 3).map(m => (
                                    <div key={m.id} className="memo-item-small">
                                        <div className="memo-content" dangerouslySetInnerHTML={{ __html: m.content.length > 50 ? m.content.substring(0, 50) + '...' : m.content }}></div>
                                        <div className="memo-date">{new Date(m.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                ))}
                                {memos.slice(0, 2).map(m => (
                                    <div key={m.id} className="memo-item-small">
                                        <div className="memo-title" style={{ fontWeight: 'bold' }}>{m.title || '無題'}</div>
                                        <div className="memo-date">{new Date(m.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="dashboard-card timer-widget">
                    <h3>⏱ クイックタイマー</h3>
                    <QuickTimerWidget />
                </div>
            </div>
        </section>
    );
}

// Internal Quick Timer Component
function QuickTimerWidget() {
    const [time, setTime] = React.useState(0);
    const [isRunning, setIsRunning] = React.useState(false);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="quick-timer-container">
            <div className="timer-display" style={{ textAlign: 'center' }}>
                {formatTime(time)}
            </div>
            <div className="timer-controls" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                    className={`btn ${!isRunning ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? '停止' : '開始'}
                </button>
                <button className="btn btn-danger" onClick={() => { setIsRunning(false); setTime(0); }}>リセット</button>
            </div>
        </div>
    );
}
