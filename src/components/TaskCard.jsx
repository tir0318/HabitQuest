import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../contexts/ToastContext';
import { useTaskOperations } from '../hooks/useTaskOperations';
import MarkdownNote from './MarkdownNote';

export default function TaskCard({ task, onEdit }) {
    const { categories } = useStorage();
    const { toggleTaskCompletion, handleDeleteTask, cycleTaskStatus } = useTaskOperations();

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

    const handleToggle = (e) => {
        e.stopPropagation();
        toggleTaskCompletion(task);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        handleDeleteTask(task);
    };

    const handleStatusCycle = (e) => {
        e.stopPropagation();
        cycleTaskStatus(task);
    };

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`} onClick={() => onEdit(task)}>
            <div className="task-header">
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={handleToggle}></div>
                <div className="task-content-main">
                    <span className="task-name">{task.name}</span>
                    <div className="task-meta-row">
                        {task.type !== 'daily' && <span className={`task-priority ${task.priority}`}>{priorityLabels[task.priority]}</span>}
                        {task.type !== 'daily' && (
                            <button className={`status-badge status-${task.status || 'not-started'}`} onClick={handleStatusCycle} title="ステータス切替">
                                {statusLabels[task.status || 'not-started']}
                            </button>
                        )}
                        {task.type === 'daily' && task.repeat && task.repeat.type !== 'none' && (
                            <span className="task-repeat-badge">
                                🔄 {getRepeatText()}
                            </span>
                        )}
                        {task.type !== 'daily' && task.dueDate && <span className="task-due">📅 {task.dueDate}</span>}
                    </div>
                </div>
                <button className="delete-task-btn" onClick={handleDelete} title="削除">🗑</button>
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
