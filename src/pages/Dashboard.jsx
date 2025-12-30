import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import TaskCard from '../components/TaskCard';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../lib/dateUtils';

export default function Dashboard() {
    const { tasks, user, habits, memos, quickMemos } = useStorage();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    // Routines (Daily tasks)
    const todayRoutines = tasks.filter(t => t.type === 'daily' && !t.completed);
    // Real Tasks (Todo)
    const activeTasks = tasks.filter(t =>
        t.type === 'todo' &&
        !t.completed &&
        (t.status === 'today' || t.priority === 'high' || (t.dueDate && t.dueDate === today))
    );

    // Calculate completed today
    const completedToday = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(today)).length;

    const nextLevelXP = 100 + (user.level - 1) * 10;
    const xpPercent = Math.min(100, (user.xp / nextLevelXP) * 100);

    return (
        <section className="page active" id="page-dashboard">

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
                            <span className="stat-value">{todayRoutines.length + activeTasks.length}</span>
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

                <div className="dashboard-card today-routines">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>♻️ 今日の日課</h3>
                        <button className="btn btn-text btn-small" onClick={() => navigate('/routines')}>管理 ➔</button>
                    </div>
                    <div className="task-list">
                        {todayRoutines.length === 0 ? <p className="empty-message">本日の日課はありません</p> :
                            todayRoutines.slice(0, 5).map(task =>
                                <TaskCard key={task.id} task={task} onEdit={() => navigate('/routines')} />
                            )
                        }
                    </div>
                </div>

                <div className="dashboard-card today-tasks">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>📋 優先タスク</h3>
                        <button className="btn btn-text btn-small" onClick={() => navigate('/tasks')}>管理 ➔</button>
                    </div>
                    <div className="task-list">
                        {activeTasks.length === 0 ? <p className="empty-message">本日対応のタスクはありません</p> :
                            activeTasks.slice(0, 5).map(task =>
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
                                        <div className="memo-date">{formatDateTime(m.createdAt)}</div>
                                    </div>
                                ))}
                                {memos.slice(0, 2).map(m => (
                                    <div key={m.id} className="memo-item-small">
                                        <div className="memo-title" style={{ fontWeight: 'bold' }}>{m.title || '無題'}</div>
                                        <div className="memo-date">{formatDateTime(m.updatedAt)}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>


            </div>
        </section>
    );
}

// QuickTimerWidget removed: use Timer page QuickTimer instead.
