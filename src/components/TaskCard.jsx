import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../contexts/ToastContext';

export default function TaskCard({ task, onEdit }) {
    const { categories, tasks, updateTasks } = useStorage();
    const { addXP, subtractXP } = useGamification();
    const { showToast } = useToast();

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

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`} onClick={() => onEdit(task)}>
            <div className="task-header">
                <div className={`task-checkbox ${task.completed ? 'checked' : ''}`} onClick={handleToggle}></div>
                <span className="task-name">{task.name}</span>
                {task.type !== 'daily' && <span className={`task-priority ${task.priority}`}>{priorityLabels[task.priority]}</span>}
            </div>
            {taskCategories.length > 0 && (
                <div className="task-category-tags">
                    {taskCategories.map(cat => (
                        <span key={cat.id} className="task-category-tag" style={{ backgroundColor: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }}>
                            {cat.icon} {cat.name}
                        </span>
                    ))}
                </div>
            )}
            <div className="task-meta">
                {task.type !== 'daily' && task.dueDate && <span className="task-due">📅 {task.dueDate}</span>}
            </div>
            <button className="btn btn-small btn-danger delete-task" onClick={handleDelete} title="削除">×</button>
        </div>
    );
}
