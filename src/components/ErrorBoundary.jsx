import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-fallback" style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'var(--bg-card)',
                    margin: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--danger)'
                }}>
                    <h2 style={{ color: 'var(--danger)' }}>⚠️ 問題が発生しました</h2>
                    <p style={{ marginBottom: '1rem' }}>アプリケーションの一部でエラーが発生しました。</p>
                    <details style={{ marginBottom: '1rem', textAlign: 'left', background: 'rgba(0,0,0,0.1)', padding: '10px' }}>
                        {this.state.error && this.state.error.toString()}
                    </details>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        ページを再読み込み
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
