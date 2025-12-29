import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';
import { useGamification } from '../hooks/useGamification';

export default function Settings() {
    const { settings, updateSettings, user, updateUser } = useStorage();
    const { showToast } = useToast();
    // const { auth } = useAuth(); // If we want to show auth info details

    const handleSettingChange = (key, value) => {
        // Validation could be added here
        updateSettings({ ...settings, [key]: value });
        showToast('設定を保存しました', 'success');
    };

    const handleUserChange = (key, value) => {
        updateUser({ ...user, [key]: value });
        showToast('ユーザー情報を更新しました', 'success');
    };

    const { hardReset } = useStorage();

    const resetData = () => {
        hardReset();
    };

    return (
        <section className="page active" id="page-settings">
            <div className="page-header">
                <h1>設定</h1>
            </div>

            <div className="settings-container">
                <div className="settings-section">
                    <h3>👤 ユーザー設定</h3>
                    <div className="form-group">
                        <label>ユーザー名</label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => handleUserChange('name', e.target.value)}
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>⏱️ タイマー設定</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>作業時間 (分)</label>
                            <input
                                type="number"
                                value={settings.workTime}
                                onChange={(e) => handleSettingChange('workTime', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label>休憩時間 (分)</label>
                            <input
                                type="number"
                                value={settings.breakTime}
                                onChange={(e) => handleSettingChange('breakTime', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label>長休憩時間 (分)</label>
                            <input
                                type="number"
                                value={settings.longBreakTime}
                                onChange={(e) => handleSettingChange('longBreakTime', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>長休憩までのセッション数</label>
                        <input
                            type="number"
                            value={settings.sessionsBeforeLongBreak}
                            onChange={(e) => handleSettingChange('sessionsBeforeLongBreak', parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🎮 ゲーミフィケーション設定</h3>
                    <div className="form-group">
                        <label>基本獲得XP (タスク完了時)</label>
                        <input
                            type="number"
                            value={settings.baseXP}
                            onChange={(e) => handleSettingChange('baseXP', parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>📂 カテゴリー管理</h3>
                    <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        カテゴリーがどこに表示されるか設定します。
                    </p>
                    <div className="category-list-settings">
                        {useStorage().categories.map(cat => (
                            <div key={cat.id} className="category-setting-item" style={{ borderLeft: `4px solid ${cat.color}` }}>
                                <div className="cat-info-basic">
                                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                                    <strong>{cat.name}</strong>
                                </div>
                                <div className="cat-type-select">
                                    <select
                                        value={cat.type || 'both'}
                                        onChange={(e) => {
                                            const { categories, updateCategories } = useStorage();
                                            const updated = categories.map(c => c.id === cat.id ? { ...c, type: e.target.value } : c);
                                            updateCategories(updated);
                                            showToast('カテゴリー設定を更新しました', 'success');
                                        }}
                                    >
                                        <option value="both">すべて (タスク & 日課)</option>
                                        <option value="todo">タスク専用</option>
                                        <option value="routine">日課専用</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🔔 通知・サウンド</h3>
                    <div className="settings-flex-row">
                        <div className="checkbox-group" onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}>
                            <input
                                type="checkbox"
                                id="soundEnabled"
                                checked={settings.soundEnabled}
                                onChange={() => { }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor="soundEnabled">効果音を有効にする</label>
                        </div>
                        {/* We could add another setting here like 'vibrationEnabled' to make it more 'horizontal' */}
                    </div>
                </div>

                <div className="settings-section danger-zone">
                    <h3>⚠️ データ管理 (バックアップ & 復元)</h3>
                    <div className="backup-restore-grid">
                        <div className="data-action-card">
                            <h4>📥 バックアップ</h4>
                            <p>現在のすべてのデータをJSON形式で保存します。</p>
                            <button className="btn btn-secondary w-100" onClick={() => {
                                const data = JSON.stringify(localStorage, null, 2);
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `habitquest-backup-${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                                showToast('データをエクスポートしました', 'success');
                            }}>
                                ファイルとして保存
                            </button>
                        </div>

                        <div className="data-action-card">
                            <h4>📤 復元 (インポート)</h4>
                            <p>保存したバックアップファイルからデータを復元します。</p>
                            <div className="import-wrapper">
                                <label className="btn btn-secondary w-100" htmlFor="import-file">
                                    ファイルを選択
                                </label>
                                <input type="file" id="import-file" accept=".json" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        try {
                                            const data = JSON.parse(ev.target.result);
                                            Object.keys(data).forEach(key => {
                                                localStorage.setItem(key, data[key]);
                                            });
                                            alert('復元が完了しました。ページを再読み込みします。');
                                            window.location.reload();
                                        } catch (err) {
                                            alert('ファイルの読み込みに失敗しました');
                                        }
                                    };
                                    reader.readAsText(file);
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className="reset-section" style={{ marginTop: '30px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                        <h4>🛑 全データリセット</h4>
                        <p style={{ marginBottom: '15px' }}>ローカルデータを完全に削除して初期状態に戻します。クラウド同期が有効な場合、最新データが再適用されます。</p>
                        <button className="btn btn-danger" onClick={resetData}>データをリセット</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
