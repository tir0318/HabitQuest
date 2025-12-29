import React, { useState, useEffect } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';

export default function TaskModal({ task, initialType = 'todo', onClose }) {
    const { categories, tasks, updateTasks } = useStorage();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        type: initialType,
        categories: [],
        dueDate: '',
        priority: 'medium',
        status: 'not-started',
        notes: ''
    });

    useEffect(() => {
        if (task) {
            setFormData({
                name: task.name,
                type: task.type || initialType,
                categories: task.categories || (task.category ? [task.category] : []),
                dueDate: task.dueDate || '',
                priority: task.priority || 'medium',
                status: task.status || 'not-started',
                notes: task.notes || ''
            });
        }
    }, [task, initialType]);

    const handleCategoryToggle = (catId) => {
        setFormData(prev => {
            const current = prev.categories || [];
            if (current.includes(catId)) {
                return { ...prev, categories: current.filter(id => id !== catId) };
            } else {
                return { ...prev, categories: [...current, catId] };
            }
        });
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            showToast('名称を入力してください', 'error');
            return;
        }

        try {
            if (task) {
                // Update
                const updated = tasks.map(t => t.id === task.id ? { ...t, ...formData } : t);
                updateTasks(updated);
                showToast('更新しました', 'success');
            } else {
                // Create
                const newTask = {
                    id: 'task_' + Date.now(),
                    ...formData,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                updateTasks([...tasks, newTask]);
                showToast('追加しました', 'success');
            }
        } catch (err) {
            console.error("Save failed", err);
            showToast('保存に失敗しました', 'error');
        } finally {
            onClose();
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.type === 'both' || cat.type === formData.type
    );

    return (
        <div className="modal active" id="task-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{task ? (formData.type === 'daily' ? '日課を編集' : 'タスクを編集') : (formData.type === 'daily' ? '新規日課' : '新規タスク')}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>名称 *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label>カテゴリー (複数選択可)</label>
                        <div className="category-selection-grid">
                            {filteredCategories.map(cat => (
                                <label key={cat.id} className={`category-checkbox-label ${formData.categories.includes(cat.id) ? 'checked' : ''}`} style={{ '--cat-color': cat.color }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(cat.id)}
                                        onChange={() => handleCategoryToggle(cat.id)}
                                    />
                                    <span className="cat-icon">{cat.icon}</span>
                                    <span className="cat-name">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>期日</label>
                            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>重要度</label>
                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </select>
                        </div>
                    </div>
                    {formData.type !== 'daily' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>状態</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="not-started">未着手</option>
                                    <option value="in-progress">進行中</option>
                                    <option value="today">本日対応</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>備考</label>
                        <textarea rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>保存</button>
                </div>
            </div>
        </div>
    );
}
