import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../contexts/ToastContext';
import MarkdownNote from './MarkdownNote';

export default function TaskCard({ task, onEdit }) {
    const { categories, tasks, updateTasks } = useStorage();
    const { addXP, subtractXP } = useGamification();
    const { showToast } = useToast();

    // Mapping repeat types to labels
    const repeatLabels = { daily: '毎日', weekly: '毎週', monthly: '毎月' };
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    const getRepeatText = () => {
        if (!task.repeat || task.repeat.type === 'none') return null;
        let text = repeatLabels[task.repeat.type];
        if (task.repeat.type === 'weekly' && task.repeat.dayOfWeek?.length > 0) {
            text += ` (${task.repeat.dayOfWeek.map(d => weekDays[d]).join(',')})`;
        } else if (task.repeat.type === 'monthly') {
            text += ` (${task.repeat.dayOfMonth}日)`;
        }
        return text;
    };

    // Map category IDs to full category objects
    const taskCategories = (task.categories || []).map(catId =>
        categories.find(c => c.id === catId)
    ).filter(Boolean);

    // Migration fallback
    if (taskCategories.length === 0 && task.category) {
        const oldCat = categories.find(c => c.id === task.category);
        if (oldCat) taskCategories.push(oldCat);
    }

    const priorityLabels = { low: '低', medium: '中', high: '高' };
    const statusLabels = { 'not-started': '未着手', 'in-progress': '進行中', 'today': '今日' };
    const statusOrder = ['not-started', 'in-progress', 'today'];

    const handleToggle = (e) => {
        e.stopPropagation();
        const isCompleting = !task.completed;
        const xpAmount = 10;

        const updated = tasks.map(t => {
            if (t.id === task.id) {
                return { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : null };
            }
            return t;
        });

        if (isCompleting) {
            addXP(xpAmount);
            showToast(`完了! +${xpAmount}XP`, 'success');
        } else {
            subtractXP(xpAmount);
        }

        updateTasks(updated);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('削除しますか？')) {
            updateTasks(tasks.filter(t => t.id !== task.id));
            showToast('削除しました', 'success');
        }
    };

    const handleStatusCycle = (e) => {
        e.stopPropagation();
        const current = task.status || 'not-started';
        const idx = statusOrder.indexOf(current);
        const next = statusOrder[(idx + 1) % statusOrder.length];

        if (!window.confirm(`ステータスを「${statusLabels[next]}」に変更しますか？`)) return;

        const updated = tasks.map(t => t.id === task.id ? { ...t, status: next } : t);
        updateTasks(updated);
        showToast(`${statusLabels[next]} に変更しました`, 'success');
    };

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`} onClick={() => onEdit(task)}>
            <div className="task-header">
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={handleToggle}></div>
                <div className="task-content-main" style={{ flex: 1 }}>
                    <span className="task-name" style={{ fontWeight: 'bold' }}>{task.name}</span>
                    <div className="task-meta-row" style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', marginTop: '4px' }}>
                        {task.type !== 'daily' && <span className={`task-priority ${task.priority}`}>{priorityLabels[task.priority]}</span>}
                        {task.type === 'daily' && task.repeat && task.repeat.type !== 'none' && (
                            <span className="task-repeat-badge" style={{ color: 'var(--primary-color)' }}>
                                🔄 {getRepeatText()}
                            </span>
                        )}
                        {task.type !== 'daily' && task.dueDate && <span className="task-due">📅 {task.dueDate}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {task.type !== 'daily' && (
                        <button className={`btn btn-small status-btn status-${task.status || 'not-started'}`} onClick={handleStatusCycle} title="ステータス切替">
                            {statusLabels[task.status || 'not-started']}
                        </button>
                    )}
                    <button className="btn btn-small btn-danger delete-task" onClick={handleDelete} title="削除">×</button>
                </div>
            </div>

            {taskCategories.length > 0 && (
                <div className="task-category-tags" style={{ marginTop: '8px' }}>
                    {taskCategories.map(cat => (
                        <span key={cat.id} className="task-category-tag" style={{ backgroundColor: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }}>
                            {cat.icon} {cat.name}
                        </span>
                    ))}
                </div>
            )}

            <MarkdownNote content={task.notes} />
        </div>
    );
}
