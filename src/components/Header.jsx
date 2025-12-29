import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStorage } from '../contexts/StorageContext';
import SearchModal from './SearchModal';

export default function Header({ onToggleMenu }) {
    const { currentUser, login, logout } = useAuth();
    const { settings, updateSettings, user } = useStorage();
    const [time, setTime] = useState(new Date());
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        const newMode = !settings.darkMode;
        updateSettings({ ...settings, darkMode: newMode });
    };

    // Apply theme effect
    useEffect(() => {
        if (settings.darkMode) {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'light');
        }
    }, [settings.darkMode]);

    // Format date time
    const timeStr = time.toLocaleTimeString('ja-JP', { hour12: false });
    const dateStr = time.toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    return (
        <>
            <header className="main-header" id="main-header">
                <button className="menu-toggle" id="menu-toggle" onClick={onToggleMenu}>☰</button>
                <div className="header-center">
                    {/* Search Button (Mobile/Desktop) */}
                    <button className="btn btn-icon" onClick={() => setSearchOpen(true)} title="検索">
                        🔍
                    </button>
                </div>
                <div className="header-right">
                    <div className="quick-stats">
                        <span className="stat-item" title="今日のXP">🌟 <span>{/* TODO: Today XP */}</span></span>
                        <span className="stat-item" title="連続達成">🔥 <span>{user.streak}</span>日</span>
                    </div>

                    <div className="auth-container" style={{ marginRight: '1rem' }}>
                        {currentUser ? (
                            <div className="auth-user" onClick={logout} title="ログアウト" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                {currentUser.photoURL ?
                                    <img src={currentUser.photoURL} className="user-avatar" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} /> :
                                    <span className="user-initial" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4f46e5', borderRadius: '50%', color: 'white' }}>{currentUser.email[0].toUpperCase()}</span>
                                }
                            </div>
                        ) : (
                            <button className="btn btn-small btn-primary" onClick={login}>
                                Googleログイン
                            </button>
                        )}
                    </div>

                    <button className="theme-toggle" onClick={toggleTheme} title="テーマ切替">
                        {settings.darkMode ? '🌙' : '☀️'}
                    </button>
                </div>
            </header>
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
