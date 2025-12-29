import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="loading-screen" style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            gap: '20px'
        }}>
            <div className="loading-logo" style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>
                ⚔️
            </div>
            <div className="loading-bar-container" style={{
                width: '200px',
                height: '4px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
            }}>
                <div className="loading-bar-fill" style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--accent-gradient)',
                    animation: 'loadingProgress 1.5s infinite ease-in-out'
                }}></div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '1px' }}>LOADING QUEST...</p>

            <style>{`
                @keyframes loadingProgress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
}
