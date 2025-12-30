import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function Routines() {
    const { tasks, categories } = useStorage();
    const [filterCompleted, setFilterCompleted] = useState('all'); // all, active, completed
    const [filterCategory, setFilterCategory] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const openCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    // Filter Logic: Only 'daily' type
    const routines = tasks.filter(task => task.type === 'daily');

    const filteredRoutines = routines.filter(task => {
        if (filterCategory !== 'all' && !(task.categories || []).includes(filterCategory)) return false;

        if (filterCompleted === 'active' && task.completed) return false;
        if (filterCompleted === 'completed' && !task.completed) return false;

        return true;
    });

    const activeRoutines = filteredRoutines.filter(t => !t.completed);
    const completedRoutines = filteredRoutines.filter(t => t.completed);

    const routineCategories = categories.filter(cat => cat.type === 'routine' || cat.type === 'both');

    return (
        <section className="page active" id="page-routines">


            <div className="task-filters">
                <div className="filter-group">
                    <label>状態:</label>
                    <select value={filterCompleted} onChange={e => setFilterCompleted(e.target.value)}>
                        <option value="all">すべて</option>
                        <option value="active">未完了</option>
                        <option value="completed">完了済み</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>カテゴリー:</label>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="all">すべて</option>
                        {routineCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="tasks-container routines-grid">
                <div className="task-column">
                    <h3 className="column-header">📋 未完了</h3>
                    <div className="task-list">
                        {activeRoutines.length === 0 ? <p className="empty-message">未完了の日課はありません</p> :
                            activeRoutines.map(task => <TaskCard key={task.id} task={task} onEdit={openEditModal} />)
                        }
                    </div>
                </div>
                <div className="task-column">
                    <h3 className="column-header">✅ 完了</h3>
                    <div className="task-list">
                        {completedRoutines.length === 0 ? <p className="empty-message">完了した日課はありません</p> :
                            completedRoutines.map(task => <TaskCard key={task.id} task={task} onEdit={openEditModal} />)
                        }
                    </div>
                </div>
            </div>

            {isModalOpen && <TaskModal task={editingTask} initialType="daily" onClose={() => setIsModalOpen(false)} />}
        </section>
    );
}
