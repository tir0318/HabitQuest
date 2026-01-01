import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useTaskOperations } from '../hooks/useTaskOperations';

export default function RoutineResetModal({ onConfirm, onCancel }) {
    const { tasks } = useStorage();
    const { checkTaskOneWay } = useTaskOperations();

    const routines = tasks.filter(t => t.type === 'daily');
    const uncompleted = routines.filter(t => !t.completed);
    const completedToday = routines.filter(t => t.completed);

    const handleCheck = (task) => {
        checkTaskOneWay(task);
    };

    return (
        <div className="modal active" id="routine-reset-modal" style={{ zIndex: 9999 }}>
            <div className="modal-content modal-lg">
                <div className="modal-header">
                    <h2>⏰ 日付が変わりました</h2>
                    {/* Optional: removing close button to force decision? No, keep it for UX safety */}
                    <button className="modal-close" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                        新しい一日が始まりました。日課の進捗をリセットします。<br />
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            ※昨日やり忘れたタスクがあれば、ここでチェックして記録に残せます。
                        </span>
                    </p>

                    {uncompleted.length > 0 ? (
                        <div style={{
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fda4af',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ color: '#be123c', marginTop: 0, fontSize: '18px' }}>
                                ⚠️ 未完了の日課 ({uncompleted.length})
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
                                {uncompleted.map(routine => (
                                    <li key={routine.id} style={{
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheck(routine)}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                marginRight: '10px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <div>
                                            <strong style={{ display: 'block' }}>{routine.name}</strong>
                                            {routine.description && <span style={{ fontSize: '12px', color: '#666' }}>{routine.description}</span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #6ee7b7',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ color: '#047857', marginTop: 0 }}>✅ 昨日の日課はすべて完了！</h3>
                            <p style={{ marginBottom: 0 }}>素晴らしい！気持ちよく一日をスタートしましょう。</p>
                        </div>
                    )}

                    {completedToday.length > 0 && (
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '8px',
                            padding: '15px',
                            marginTop: '20px',
                            opacity: 0.8
                        }}>
                            <h4 style={{ marginTop: 0, color: '#64748b' }}>📋 完了済み ({completedToday.length})</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {completedToday.map(routine => (
                                    <li key={routine.id} style={{
                                        marginBottom: '4px',
                                        color: '#94a3b8',
                                        fontSize: '14px'
                                    }}>
                                        ✓ {routine.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel} style={{ marginRight: 'auto' }}>あとで</button>
                    <button className="btn btn-primary" onClick={onConfirm} style={{ padding: '10px 30px', fontSize: '16px' }}>
                        一日をスタート！
                    </button>
                </div>
            </div>
        </div>
    );
}
