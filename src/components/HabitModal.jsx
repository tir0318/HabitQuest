import React, { useState, useEffect } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';

export default function HabitModal({ habit, onClose }) {
    const { categories, habits, updateHabits } = useStorage();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        type: 'positive',
        categories: [],
        reward: 5,
        penalty: 5,
    });

    useEffect(() => {
        if (habit) {
            setFormData({
                name: habit.name,
                type: habit.type || 'positive',
                categories: habit.categories || (habit.category ? [habit.category] : []),
                reward: habit.reward || 5,
                penalty: habit.penalty || 5,
            });
        }
    }, [habit]);

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
            showToast('習慣名を入力してください', 'error');
            return;
        }

        if (habit) {
            // Update
            const updated = habits.map(h => h.id === habit.id ? { ...h, ...formData } : h);
            updateHabits(updated);
            showToast('習慣を更新しました', 'success');
        } else {
            // Create
            const newHabit = {
                id: 'habit_' + Date.now(),
                ...formData,
                todayCount: 0,
                lastTracked: null,
                createdAt: new Date().toISOString()
            };
            updateHabits([...habits, newHabit]);
            showToast('習慣を追加しました', 'success');
        }
        onClose();
    };

    return (
        <div className="modal active" id="habit-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{habit ? '習慣を編集' : '新規習慣'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>習慣名 *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label>タイプ</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="positive">ポジティブ (+)</option>
                            <option value="negative">ネガティブ (-)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>カテゴリー (複数選択可)</label>
                        <div className="category-selection-grid">
                            {categories.map(cat => (
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
                            <label>{formData.type === 'positive' ? '獲得XP' : 'ダメージ (HP)'}</label>
                            <input
                                type="number"
                                value={formData.type === 'positive' ? formData.reward : formData.penalty}
                                onChange={e => setFormData({ ...formData, [formData.type === 'positive' ? 'reward' : 'penalty']: parseInt(e.target.value) })}
                            />
                        </div>
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
