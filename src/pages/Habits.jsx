import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../contexts/ToastContext';
import HabitModal from '../components/HabitModal';

// Helper Component for Habit Card
function HabitCard({ habit, onEdit, onTrack, onDelete, categories }) {
    const taskCategories = (habit.categories || []).map(catId =>
        categories.find(c => c.id === catId)
    ).filter(Boolean);

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="habit-card" onClick={() => onEdit(habit)}>
            <div className="habit-actions">
                {habit.type === 'positive' ? (
                    <button className="habit-btn positive" onClick={(e) => { e.stopPropagation(); onTrack(habit, true); }}>+</button>
                ) : (
                    <button className="habit-btn negative" onClick={(e) => { e.stopPropagation(); onTrack(habit, false); }}>−</button>
                )}
            </div>
            <div className="habit-info">
                <span className="habit-name">{habit.name}</span>
                <div className="task-category-tags">
                    {taskCategories.map(cat => (
                        <span key={cat.id} className="task-category-tag" style={{ backgroundColor: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }}>
                            {cat.icon} {cat.name}
                        </span>
                    ))}
                </div>
                <span className="habit-streak">今日: {habit.lastTracked === today ? habit.todayCount : 0}回</span>
            </div>
            <span className="habit-count">{habit.type === 'positive' ? '+' : '-'}{habit.type === 'positive' ? habit.reward || 5 : habit.penalty || 5} XP</span>
            <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }} title="削除">×</button>
        </div>
    );
}

export default function Habits() {
    const { habits, updateHabits, categories } = useStorage();
    const { addXP, takeDamage } = useGamification();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    const openCreateModal = () => {
        setEditingHabit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleTrack = (habit, isPositive) => {
        const today = new Date().toISOString().split('T')[0];
        const newCount = (habit.lastTracked === today ? (habit.todayCount || 0) : 0) + 1;

        const updated = habits.map(h => h.id === habit.id ? { ...h, todayCount: newCount, lastTracked: today } : h);
        updateHabits(updated);

        if (isPositive) {
            const xp = habit.reward || 5;
            addXP(xp);
            showToast(`習慣達成! +${xp}XP`, 'success');
        } else {
            const dmg = habit.penalty || 5;
            takeDamage(dmg);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('削除しますか？')) {
            updateHabits(habits.filter(h => h.id !== id));
            showToast('削除しました', 'success');
        }
    };

    const positive = habits.filter(h => h.type === 'positive');
    const negative = habits.filter(h => h.type === 'negative');

    return (
        <section className="page active" id="page-habits">
            <div className="page-header">
                <h1>習慣トラッカー</h1>
                <button className="btn btn-primary" onClick={openCreateModal}>+ 新規習慣</button>
            </div>
            <div className="habits-container">
                <div className="habit-section positive-habits">
                    <h3>✅ ポジティブ習慣</h3>
                    <div className="habit-list">
                        {positive.length === 0 ? <p className="empty-message">習慣を追加してください</p> :
                            positive.map(h => (
                                <HabitCard
                                    key={h.id}
                                    habit={h}
                                    onEdit={openEditModal}
                                    onTrack={handleTrack}
                                    onDelete={handleDelete}
                                    categories={categories}
                                />
                            ))}
                    </div>
                </div>
                <div className="habit-section negative-habits">
                    <h3>❌ ネガティブ習慣</h3>
                    <div className="habit-list">
                        {negative.length === 0 ? <p className="empty-message">習慣を追加してください</p> :
                            negative.map(h => (
                                <HabitCard
                                    key={h.id}
                                    habit={h}
                                    onEdit={openEditModal}
                                    onTrack={handleTrack}
                                    onDelete={handleDelete}
                                    categories={categories}
                                />
                            ))}
                    </div>
                </div>
            </div>

            {isModalOpen && <HabitModal habit={editingHabit} onClose={() => setIsModalOpen(false)} />}
        </section>
    );
}
