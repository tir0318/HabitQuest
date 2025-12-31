import React from 'react';

export default function RoutineResetModal({ tasks, onConfirm, onCancel }) {
    const routines = tasks.filter(t => t.type === 'daily');
    const uncompleted = routines.filter(t => !t.completed);

    return (
        <div className="modal active" id="routine-reset-modal">
            <div className="modal-content modal-lg">
                <div className="modal-header">
                    <h2>⏰ 午前0時になりました</h2>
                    <button className="modal-close" onClick={onCancel}>&times;</button>
                </div>
                <div className="modal-body">
                    <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                        日課がリセットされます。チェック漏れがないか確認してください。
                    </p>

                    {uncompleted.length > 0 && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            border: '2px solid #ef4444',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ 未完了の日課</h3>
                            <ul style={{ marginLeft: '20px' }}>
                                {uncompleted.map(routine => (
                                    <li key={routine.id} style={{ marginBottom: '8px' }}>
                                        <strong>{routine.name}</strong>
                                        {routine.description && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>{routine.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {uncompleted.length === 0 && (
                        <div style={{
                            backgroundColor: '#dcfce7',
                            border: '2px solid #16a34a',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ color: '#15803d', marginTop: 0 }}>✅ すべての日課が完了しました！</h3>
                            <p style={{ marginBottom: 0 }}>素晴らしい！新しい日課をリセットします。</p>
                        </div>
                    )}

                    <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '2px dashed #3b82f6',
                        borderRadius: '8px',
                        padding: '15px',
                        marginTop: '20px'
                    }}>
                        <h4 style={{ marginTop: 0 }}>📋 本日の日課一覧</h4>
                        <ul style={{ marginLeft: '20px' }}>
                            {routines.map(routine => (
                                <li key={routine.id} style={{
                                    marginBottom: '8px',
                                    textDecoration: routine.completed ? 'line-through' : 'none',
                                    color: routine.completed ? '#999' : 'inherit'
                                }}>
                                    {routine.completed ? '✓' : '○'} {routine.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
                    <button className="btn btn-primary" onClick={onConfirm}>日課をリセット</button>
                </div>
            </div>
        </div>
    );
}
