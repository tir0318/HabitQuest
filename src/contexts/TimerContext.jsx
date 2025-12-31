import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStorage } from './StorageContext';
import { useGamification } from '../hooks/useGamification';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const { settings, studyRecords, updateStudyRecords } = useStorage();
    const { addXP } = useGamification();

    const [mode, setMode] = useState('work'); // work, break, long-break
    const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
    const [totalTime, setTotalTime] = useState(settings.workTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [session, setSession] = useState(1);
    const [currentTaskId, setCurrentTaskId] = useState('');

    const intervalRef = useRef(null);
    const isCompletingRef = useRef(false); // Prevent duplicate completion

    // Initialize timer duration based on settings and mode
    useEffect(() => {
        let duration = settings.workTime;
        if (mode === 'break') duration = settings.breakTime;
        if (mode === 'long-break') duration = settings.longBreakTime;

        // Only update totalTime/timeLeft if they are mismatched (e.g. settings changed or mode changed)
        // But be careful not to reset if just navigating back to the page.
        // Actually, since this is now a context, this effect runs when 'mode' or 'settings' changes.
        // We want to update totalTime. If the timer is NOT running, we also reset timeLeft.

        const newTotalSeconds = duration * 60;
        setTotalTime(newTotalSeconds);

        if (!isRunning) {
            // Only reset if we are not running. 
            // Also, if we just mounted, we might want to respect the current state if it was saved?
            // For now, simple logic: if not running, reset to max.
            setTimeLeft(newTotalSeconds);
        }
    }, [mode, settings.workTime, settings.breakTime, settings.longBreakTime]);

    // Timer Tick
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        completeSession();
                        return 0;
                    }
                    return prev - 1;
                });

                // Track accumulated time
                trackTime();
            }, 1000);
        } else {
            console.log("Timer stopped or paused");
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const trackTime = () => {
        const today = new Date().toISOString().split('T')[0];
        const record = studyRecords[today] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] };

        if (mode === 'work') {
            record.studyTime = (record.studyTime || 0) + 1;
        } else {
            record.breakTime = (record.breakTime || 0) + 1;
        }

        // This causes frequent re-renders/writes. Ideally debounced, but for now it's okay for local state responsiveness.
        updateStudyRecords({ ...studyRecords, [today]: record });
    };

    const completeSession = () => {
        // Prevent duplicate execution
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;

        setIsRunning(false);

        const currentMode = mode;
        playAlarm(currentMode);
        showNotification(currentMode);

        const today = new Date().toISOString().split('T')[0];
        const record = { ...(studyRecords[today] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] }) };
        if (!record.sessions) record.sessions = [];

        // Add session log
        record.sessions.push({
            type: currentMode,
            taskId: currentTaskId,
            completedAt: new Date().toISOString()
        });

        let nextMode = 'work';
        let shouldAutoStart = false;

        if (currentMode === 'work') {
            record.pomodoros = (record.pomodoros || 0) + 1;
            addXP(15);

            if (session >= settings.sessionsBeforeLongBreak) {
                nextMode = 'long-break';
                setSession(1);
            } else {
                nextMode = 'break';
                setSession(s => s + 1);
            }

            // Check auto-start break setting
            if (settings.autoStartBreak) {
                shouldAutoStart = true;
            }

        } else {
            // Break or Long Break done
            nextMode = 'work';

            // Check auto-start work setting
            if (settings.autoStartWork) {
                shouldAutoStart = true;
            }
        }

        setMode(nextMode);
        updateStudyRecords({ ...studyRecords, [today]: record });

        if (shouldAutoStart) {
            // Need a slight delay to allow state updates to settle if strictly needed, 
            // but setting isRunning to true here should work for the NEXT tick.
            // However, we just setMode, so the useEffect for mode change will run and reset timeLeft.
            // We need to ensure isRunning becomes true AFTER timeLeft is reset.
            setTimeout(() => {
                setIsRunning(true);
            }, 100);
        }

        // Reset completion flag
        setTimeout(() => {
            isCompletingRef.current = false;
        }, 1000);
    };

    // Web Audio API Alarm
    const playAlarm = (sessionMode) => {
        if (!settings.soundEnabled) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const audioContext = new AudioContext();

            if (sessionMode === 'work') {
                const frequencies = [523, 659, 784];
                frequencies.forEach((freq, i) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.type = 'sine';
                    const startTime = audioContext.currentTime + i * 0.15;
                    oscillator.frequency.setValueAtTime(freq, startTime);
                    gainNode.gain.setValueAtTime(0.3, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                    oscillator.start(startTime);
                    oscillator.stop(startTime + 0.3);
                });
            } else if (sessionMode === 'break') {
                const frequencies = [440, 523];
                frequencies.forEach((freq, i) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.type = 'triangle';
                    const startTime = audioContext.currentTime + i * 0.25;
                    oscillator.frequency.setValueAtTime(freq, startTime);
                    gainNode.gain.setValueAtTime(0.25, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                    oscillator.start(startTime);
                    oscillator.stop(startTime + 0.4);
                });
            } else {
                const frequencies = [330, 392, 494];
                frequencies.forEach((freq, i) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.type = 'sine';
                    const startTime = audioContext.currentTime + i * 0.3;
                    oscillator.frequency.setValueAtTime(freq, startTime);
                    gainNode.gain.setValueAtTime(0.2, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                    oscillator.start(startTime);
                    oscillator.stop(startTime + 0.5);
                });
            }
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    };

    const showNotification = (sessionMode) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            let title, body;
            if (sessionMode === 'work') {
                title = '🍅 作業完了！';
                body = 'お疲れ様！休憩を取りましょう';
            } else if (sessionMode === 'break') {
                title = '☕ 休憩終了！';
                body = '次の作業セッションを始めましょう';
            } else {
                title = '🌴 長休憩終了！';
                body = 'リフレッシュ完了！新しいサイクルを始めましょう';
            }
            new Notification(title, { body, icon: '🍅' });
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setMode('work');
        setSession(1);
        const duration = settings.workTime * 60;
        setTotalTime(duration);
        setTimeLeft(duration);
    };

    const skipSession = () => completeSession();

    // Start a quick custom timer (minutes) - kept for compatibility
    const startQuick = (minutes) => {
        const secs = Math.max(1, Math.floor(minutes * 60));
        setMode('work');
        setTotalTime(secs);
        setTimeLeft(secs);
        setIsRunning(true);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TimerContext.Provider value={{
            mode, setMode,
            timeLeft, totalTime, formatTime,
            isRunning, toggleTimer, resetTimer, skipSession,
            session,
            currentTaskId, setCurrentTaskId,
            startQuick
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    return useContext(TimerContext);
}
