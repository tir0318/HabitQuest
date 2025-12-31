import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function Tasks() {
    const { tasks, categories } = useStorage();
    const [filterStatus, setFilterStatus] = useState('all');
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

    // Filter Logic
    // Filter Logic: Only 'todo' type
    const todoTasks = tasks.filter(task => task.type === 'todo');

    const filteredTasks = todoTasks.filter(task => {
        if (filterCategory !== 'all' && !(task.categories || []).includes(filterCategory)) return false;

        if (filterStatus !== 'all') {
            if (filterStatus === 'completed') {
                if (!task.completed) return false;
            } else {
                if (task.completed) return false;
                if (task.status !== filterStatus) return false;
            }
        }

        return true;
    });

    const notStarted = filteredTasks.filter(t => t.status === 'not-started' && !t.completed);
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress' && !t.completed);
    const today = filteredTasks.filter(t => t.status === 'today' && !t.completed);

    return (
        <section className="page active" id="page-tasks">
            <div className="page-header">
                <button className="btn btn-primary btn-large" onClick={openCreateModal}>+ 新規追加</button>
            </div>

            <div className="task-filters">
                <div className="filter-group">
                    <label>状態:</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">すべて</option>
                        <option value="not-started">未着手</option>
                        <option value="in-progress">進行中</option>
                        <option value="today">本日対応</option>
                        <option value="completed">完了</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>カテゴリー:</label>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="all">すべて</option>
                        {categories.filter(c => c.type === 'todo' || c.type === 'both').map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="tasks-container">
                <div className="task-column">
                    <h3 className="column-header">📌 未着手</h3>
                    <div className="task-list">
                        {notStarted.length === 0 ? <p className="empty-message">タスクはありません</p> :
                            notStarted.map(task => <TaskCard key={task.id} task={task} onEdit={openEditModal} />)
                        }
                    </div>
                </div>
                <div className="task-column">
                    <h3 className="column-header">🔄 進行中</h3>
                    <div className="task-list">
                        {inProgress.length === 0 ? <p className="empty-message">タスクはありません</p> :
                            inProgress.map(task => <TaskCard key={task.id} task={task} onEdit={openEditModal} />)
                        }
                    </div>
                </div>
                <div className="task-column">
                    <h3 className="column-header">⚡ 本日対応</h3>
                    <div className="task-list">
                        {today.length === 0 ? <p className="empty-message">タスクはありません</p> :
                            today.map(task => <TaskCard key={task.id} task={task} onEdit={openEditModal} />)
                        }
                    </div>
                </div>
            </div>

            {isModalOpen && <TaskModal task={editingTask} initialType="todo" onClose={() => setIsModalOpen(false)} />}
        </section>
    );
}
