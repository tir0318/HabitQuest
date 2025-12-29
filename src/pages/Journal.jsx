import React, { useState, useEffect, useRef } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';

export default function Journal() {
    const { journals, updateJournals, settings } = useStorage();
    const { showToast } = useToast();

    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

    // Derived state for the current journal entry
    const currentJournal = journals[currentDate] || { freeform: '', goals: '', mood: null, accomplishments: [] };

    // Local editable state (to avoid saving on every keystroke, although reactive updates are fine, 
    // let's stick to explicit save or blur for performance if text is long)
    const [freeform, setFreeform] = useState(currentJournal.freeform || '');
    const [goals, setGoals] = useState(currentJournal.goals || '');
    const [mood, setMood] = useState(currentJournal.mood || null);

    // Sync local state when date changes
    useEffect(() => {
        const journal = journals[currentDate] || {};
        setFreeform(journal.freeform || '');
        setGoals(journal.goals || '');
        setMood(journal.mood || null);
    }, [currentDate, journals]);

    const saveJournal = () => {
        updateJournals({
            ...journals,
            [currentDate]: {
                ...currentJournal,
                freeform,
                goals,
                mood,
                updatedAt: new Date().toISOString()
            }
        });
        showToast('保存しました', 'success');
    };

    const changeDate = (offset) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + offset);
        const newDate = date.toISOString().split('T')[0];

        // Don't go into future (optional rule, but good for journal)
        if (offset > 0 && newDate > new Date().toISOString().split('T')[0]) return;

        setCurrentDate(newDate);
    };

    // Timer Logic
    const [timerDuration, setTimerDuration] = useState(10); // minutes
    const [timeLeft, setTimeLeft] = useState(10 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerInterval = useRef(null);

    useEffect(() => {
        if (isTimerRunning) {
            timerInterval.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        showToast('ジャーナリング時間終了！', 'success');
                        // play sound
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerInterval.current);
        }
        return () => clearInterval(timerInterval.current);
    }, [isTimerRunning]);

    const toggleTimer = () => {
        if (!isTimerRunning && timeLeft === 0) setTimeLeft(timerDuration * 60);
        setIsTimerRunning(!isTimerRunning);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimeLeft(timerDuration * 60);
    };

    const handleTimerDurationChange = (e) => {
        const val = parseInt(e.target.value);
        setTimerDuration(val);
        setTimeLeft(val * 60);
    };

    // Accomplishments
    const [newAcc, setNewAcc] = useState('');
    const addAccomplishment = () => {
        if (!newAcc.trim()) return;
        const newEntry = {
            id: 'acc_' + Date.now(),
            name: newAcc.trim(),
            completed: true
        };

        const updatedJournal = {
            ...currentJournal,
            accomplishments: [...(currentJournal.accomplishments || []), newEntry]
        };

        updateJournals({ ...journals, [currentDate]: updatedJournal });
        setNewAcc('');
    };

    const deleteAccomplishment = (id) => {
        const updatedJournal = {
            ...currentJournal,
            accomplishments: currentJournal.accomplishments.filter(a => a.id !== id)
        };
        updateJournals({ ...journals, [currentDate]: updatedJournal });
    };

    return (
        <section className="page active" id="page-journal">
            <div className="page-header">
                <h1>ジャーナル</h1>
                <div className="journal-date-nav">
                    <button className="btn btn-icon" onClick={() => changeDate(-1)}>◀</button>
                    <span id="journal-date">{new Date(currentDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
                    <button className="btn btn-icon" onClick={() => changeDate(1)}>▶</button>
                </div>
            </div>

            <div className="journal-container">
                <div className="journal-section">
                    <h3>✅ 今日やったこと</h3>
                    <p className="section-description">今日達成したことを振り返って記録しましょう</p>
                    <div className="journal-tasks">
                        <div className="task-input-row">
                            <input
                                type="text"
                                placeholder="達成したことを追加..."
                                className="styled-input"
                                value={newAcc}
                                onChange={(e) => setNewAcc(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addAccomplishment()}
                            />
                            <button className="btn btn-primary" onClick={addAccomplishment}>追加</button>
                        </div>
                        <div className="journal-task-list">
                            {(currentJournal.accomplishments || []).map(acc => (
                                <div key={acc.id} className="journal-task-item completed">
                                    <span className="task-done-icon">✓</span>
                                    <span className="task-name">{acc.name}</span>
                                    <button className="btn btn-small btn-danger" onClick={() => deleteAccomplishment(acc.id)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="journal-section">
                    <h3>✍️ フリー入力</h3>
                    <div className="journal-timer">
                        <span>ジャーナリングタイマー: </span>
                        <select className="styled-select timer-duration-select" value={timerDuration} onChange={handleTimerDurationChange}>
                            <option value="5">5分</option>
                            <option value="10">10分</option>
                            <option value="15">15分</option>
                            <option value="20">20分</option>
                            <option value="30">30分</option>
                        </select>
                        <span className="timer-display-inline">
                            {Math.floor(timeLeft / 60).toString().padStart(2, 0)}:{(timeLeft % 60).toString().padStart(2, 0)}
                        </span>
                        <button className="btn btn-small btn-primary" onClick={toggleTimer}>
                            {isTimerRunning ? '停止' : '開始'}
                        </button>
                        <button className="btn btn-small btn-secondary" onClick={resetTimer}>リセット</button>
                    </div>
                    <textarea
                        className="journal-textarea styled-textarea"
                        placeholder="今日の振り返り、思ったこと、気づきなど..."
                        value={freeform}
                        onChange={(e) => setFreeform(e.target.value)}
                        onBlur={saveJournal}
                    ></textarea>
                </div>

                <div className="journal-section">
                    <h3>🎯 目標・夢</h3>
                    <textarea
                        className="journal-textarea small styled-textarea"
                        placeholder="達成したい目標、夢、願望..."
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        onBlur={saveJournal}
                    ></textarea>
                </div>

                <div className="journal-section">
                    <h3>😊 今日の気分</h3>
                    <div className="mood-selector">
                        {['great', 'good', 'neutral', 'bad', 'terrible'].map(m => (
                            <button
                                key={m}
                                className={`mood-btn ${mood === m ? 'active' : ''}`}
                                onClick={() => setMood(m)}
                            >
                                {m === 'great' ? '😄' : m === 'good' ? '🙂' : m === 'neutral' ? '😐' : m === 'bad' ? '😔' : '😢'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="journal-actions">
                    <button className="btn btn-primary" onClick={saveJournal}>保存</button>
                </div>
            </div>
        </section>
    );
}
