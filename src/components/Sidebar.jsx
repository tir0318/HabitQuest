import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from '../hooks/useGamification';

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useStorage();

    const { getNextLevelXP } = useGamification();
    const nextLevelXp = getNextLevelXP(user.level);
    const xpPercentage = Math.min((user.xp / nextLevelXp) * 100, 100);
    const hpPercentage = (user.hp / (user.maxHp || 100)) * 100;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚔️</span>
                    <span className="logo-text">HabitQuest</span>
                </div>
                {/* Close button for mobile */}
                <button className="btn-icon mobile-only" onClick={onClose} style={{ marginLeft: 'auto', display: isOpen ? 'block' : 'none' }}>✕</button>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">ダッシュボード</span>
                </NavLink>
                <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📌</span>
                    <span className="nav-text">タスク管理</span>
                </NavLink>
                <NavLink to="/routines" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-text">日課管理</span>
                </NavLink>
                <NavLink to="/habits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">🔄</span>
                    <span className="nav-text">習慣</span>
                </NavLink>
                <NavLink to="/timer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">⏱️</span>
                    <span className="nav-text">タイマー</span>
                </NavLink>
                <NavLink to="/journal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📔</span>
                    <span className="nav-text">ジャーナル</span>
                </NavLink>
                <NavLink to="/memo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📝</span>
                    <span className="nav-text">メモ</span>
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">🗓️</span>
                    <span className="nav-text">カレンダー</span>
                </NavLink>
                <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">📈</span>
                    <span className="nav-text">統計</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-text">設定</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-stats">
                    <div className="user-level">
                        <span className="level-badge">Lv.<span>{user.level}</span></span>
                        <div className="xp-bar">
                            <div className="xp-fill" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                        <span className="xp-text"><span>{user.xp}</span>/<span>{nextLevelXp}</span> XP</span>
                    </div>
                    <div className="user-hp">
                        <span className="hp-icon">❤️</span>
                        <div className="hp-bar">
                            <div className="hp-fill" style={{ width: `${hpPercentage}%` }}></div>
                        </div>
                        <span className="hp-text"><span>{user.hp}</span>/<span>{user.maxHp || 100}</span></span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
