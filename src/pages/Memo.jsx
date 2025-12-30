import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';
import { formatDateTime } from '../lib/dateUtils';

// Simple Modal specific to Memo
function MemoModal({ memo, onClose, onSave, categories }) {
    const [title, setTitle] = useState(memo ? memo.title || '' : '');
    const [content, setContent] = useState(memo ? memo.content || '' : '');
    const [category, setCategory] = useState(memo ? memo.category || 'other' : 'other');

    const handleSave = () => {
        onSave({ title, content, category });
        onClose();
    };

    return (
        <div className="modal active" id="memo-modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{memo ? 'メモを編集' : '新規メモ'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>タイトル</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>カテゴリー</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>内容</label>
                        <textarea rows="10" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
                    <button className="btn btn-primary" onClick={handleSave}>保存</button>
                </div>
            </div>
        </div>
    );
}

export default function Memo() {
    const { memos, quickMemos, categories, updateMemos, updateQuickMemos } = useStorage();
    const { showToast } = useToast();

    // Quick Memo State handled via global QuickMemoBar mostly, but here we view them.
    // Wait, the QuickMemoBar uses DOM ID 'quick-memo-input'. We should probably integrate that logic here or use Context.
    // For now let's just implement the viewing/deleting logic properly.

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMemo, setEditingMemo] = useState(null);

    const deleteQuickMemo = (id) => {
        if (window.confirm('削除しますか？')) {
            updateQuickMemos(quickMemos.filter(m => m.id !== id));
            showToast('削除しました', 'success');
        }
    };

    const deleteMemo = (id) => {
        if (window.confirm('削除しますか？')) {
            updateMemos(memos.filter(m => m.id !== id));
            showToast('削除しました', 'success');
        }
    };

    const handleSaveMemo = (data) => {
        if (!data.content.trim()) {
            showToast('内容を入力してください', 'error');
            return;
        }

        if (editingMemo) {
            // Update
            const updated = memos.map(m => m.id === editingMemo.id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m);
            updateMemos(updated);
            showToast('更新しました', 'success');
        } else {
            // Create
            const newMemo = {
                id: 'memo_' + Date.now(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            updateMemos([newMemo, ...memos]);
            showToast('作成しました', 'success');
        }
    };

    const openEditModal = (memo) => {
        setEditingMemo(memo);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingMemo(null);
        setIsModalOpen(true);
    };

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat?.name || 'その他';
    };

    const formatDate = (dateStr) => {
        return formatDateTime(dateStr);
    };

    const shareMemo = async (memo) => {
        const text = memo.title ? `${memo.title}\n\n${memo.content}` : memo.content;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: memo.title || 'HabitQuest Memo',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Sharing failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(text);
                showToast('クリップボードに表示をコピーしました', 'success');
            } catch (err) {
                showToast('共有に失敗しました', 'error');
            }
        }
    };

    return (
        <section className="page active" id="page-memo">

            <div className="memo-container">
                <div className="memo-section quick-memos">
                    <h3>⚡ クイックメモ</h3>
                    <div className="quick-memo-list">
                        {quickMemos.length === 0 ? <p className="empty-message">クイックメモはありません</p> :
                            quickMemos.map(memo => (
                                <div key={memo.id} className="memo-item quick-memo">
                                    <div className="memo-content" dangerouslySetInnerHTML={{ __html: memo.content }}></div>
                                    <div className="memo-item-header">
                                        <span className="memo-date">{formatDate(memo.createdAt)}</span>
                                        <div className="memo-actions">
                                            <button className="btn btn-icon btn-small" onClick={() => shareMemo(memo)} title="共有">📤</button>
                                            <button className="btn btn-icon btn-small btn-danger" onClick={() => deleteQuickMemo(memo.id)}>🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="memo-section titled-memos">
                    <h3>📄 タイトル付きメモ</h3>
                    <div className="titled-memo-list">
                        {memos.length === 0 ? <p className="empty-message">メモはありません</p> :
                            memos.map(memo => (
                                <div key={memo.id} className="memo-item titled-memo">
                                    <div className="memo-item-header">
                                        <span className="memo-title">{memo.title || '無題'}</span>
                                        <span className="memo-date">{formatDate(memo.updatedAt)}</span>
                                    </div>
                                    <div className="task-category">{getCategoryName(memo.category)}</div>
                                    <div className="memo-content">{memo.content && memo.content.length > 100 ? memo.content.substring(0, 100) + '...' : memo.content}</div>
                                    <div className="memo-actions">
                                        <button className="btn btn-icon btn-small" onClick={() => shareMemo(memo)} title="共有">📤</button>
                                        <button className="btn btn-icon btn-small btn-secondary" onClick={() => openEditModal(memo)}>✏️</button>
                                        <button className="btn btn-icon btn-small btn-danger" onClick={() => deleteMemo(memo.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <MemoModal
                    memo={editingMemo}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveMemo}
                    categories={categories}
                />
            )}
        </section>
    );
}
