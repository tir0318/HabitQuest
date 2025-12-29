import React, { useState, useEffect, useRef } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, onClose }) {
    const { tasks, memos, quickMemos } = useStorage();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ tasks: [], memos: [] });
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ tasks: [], memos: [] });
            return;
        }

        const lowerQuery = query.toLowerCase();

        const filteredTasks = tasks.filter(t =>
            t.name.toLowerCase().includes(lowerQuery) ||
            (t.description && t.description.toLowerCase().includes(lowerQuery))
        );

        const filteredMemos = [
            ...memos.filter(m =>
                (m.title && m.title.toLowerCase().includes(lowerQuery)) ||
                (m.content && m.content.toLowerCase().includes(lowerQuery))
            ),
            ...quickMemos.filter(m =>
                m.content && m.content.toLowerCase().includes(lowerQuery)
            ).map(m => ({ ...m, title: 'クイックメモ' }))
        ];

        setResults({ tasks: filteredTasks, memos: filteredMemos });

    }, [query, tasks, memos, quickMemos]);

    if (!isOpen) return null;

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
            <div className="modal-content search-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🔍 検索</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <input
                        ref={inputRef}
                        type="text"
                        className="styled-input w-100"
                        placeholder="タスク、メモを検索..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />

                    <div className="search-results">
                        {query && results.tasks.length === 0 && results.memos.length === 0 && (
                            <p className="empty-message">見つかりませんでした</p>
                        )}

                        {results.tasks.length > 0 && (
                            <div className="result-section">
                                <h4>📋 タスク ({results.tasks.length})</h4>
                                <div className="result-list">
                                    {results.tasks.map(task => (
                                        <div key={task.id} className="result-item" onClick={() => handleNavigate('/tasks')}>
                                            <span className="task-name">{task.name}</span>
                                            <span className={`task-badge ${task.completed ? 'completed' : 'active'}`}>
                                                {task.completed ? '完了' : '未完了'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.memos.length > 0 && (
                            <div className="result-section">
                                <h4>📝 メモ ({results.memos.length})</h4>
                                <div className="result-list">
                                    {results.memos.map(memo => (
                                        <div key={memo.id} className="result-item" onClick={() => handleNavigate('/memo')}>
                                            <div className="memo-title">{memo.title || '無題'}</div>
                                            <div className="memo-preview">
                                                {memo.content.replace(/<[^>]+>/g, '')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
