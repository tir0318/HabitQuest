import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';

export default function QuickMemoBar() {
    const [input, setInput] = useState('');
    const { quickMemos, updateQuickMemos } = useStorage();
    const { showToast } = useToast();

    const handleAdd = () => {
        if (!input.trim()) return;

        const newMemo = {
            id: 'memo_' + Date.now(),
            content: input.trim(),
            createdAt: new Date().toISOString()
        };

        updateQuickMemos([newMemo, ...quickMemos]);
        setInput('');
        showToast('メモを追加しました', 'success');
    };

    return (
        <div className="quick-memo-bar" id="quick-memo-bar">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="クイックメモ: 思いついたことをすぐメモ..."
                className="quick-memo-input"
            />
            <button className="quick-memo-add" onClick={handleAdd}>+</button>
        </div>
    );
}
