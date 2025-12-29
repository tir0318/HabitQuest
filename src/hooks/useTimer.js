import { useState, useEffect, useRef } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { useGamification } from './useGamification';

export function useTimer() {
    const { settings, studyRecords, updateStudyRecords } = useStorage();
    const { addXP } = useGamification();

    const [mode, setMode] = useState('work'); // work, break, long-break
    const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
    const [totalTime, setTotalTime] = useState(settings.workTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [session, setSession] = useState(1);
    const [currentTaskId, setCurrentTaskId] = useState('');

    const intervalRef = useRef(null);

    // Initialize timer duration based on settings and mode
    useEffect(() => {
        let duration = settings.workTime;
        if (mode === 'break') duration = settings.breakTime;
        if (mode === 'long-break') duration = settings.longBreakTime;

        // If not running, reset time to new setting duration
        if (!isRunning) {
            setTotalTime(duration * 60);
            setTimeLeft(duration * 60);
        }
    }, [mode, settings, isRunning]);

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

        updateStudyRecords({ ...studyRecords, [today]: record });
    };

    const completeSession = () => {
        setIsRunning(false);
        playAlarm();
        showNotification();

        const today = new Date().toISOString().split('T')[0];
        const record = studyRecords[today] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] };

        if (mode === 'work') {
            record.pomodoros = (record.pomodoros || 0) + 1;
            addXP(15);
            addSessionLog(record, 'work');

            if (session >= settings.sessionsBeforeLongBreak) {
                setMode('long-break');
                setSession(1);
            } else {
                setMode('break');
                setSession(s => s + 1);
            }
        } else {
            addSessionLog(record, mode);
            setMode('work');
        }
        updateStudyRecords({ ...studyRecords, [today]: record });
    };

    const addSessionLog = (record, type) => {
        if (!record.sessions) record.sessions = [];
        record.sessions.push({
            type,
            taskId: currentTaskId,
            completedAt: new Date().toISOString()
        });
    };

    // Web Audio API Alarm (Replicating legacy behavior)
    const playAlarm = () => {
        if (!settings.soundEnabled) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const audioContext = new AudioContext();

            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Beep sound (A5 approx 880Hz)
                const startTime = audioContext.currentTime + i * 0.3;
                oscillator.frequency.setValueAtTime(880, startTime);

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            }
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    };

    const showNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = mode === 'work' ? '作業完了！' : '休憩終了！';
            new Notification(title, { body: '次のセッションを始めましょう', icon: '🍅' });
        }
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setMode('work');
        setSession(1);
        setTotalTime(settings.workTime * 60);
        setTimeLeft(settings.workTime * 60);
    };

    const skipSession = () => completeSession();

    // Helper format
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Permissions
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return {
        mode, setMode,
        timeLeft, totalTime, formatTime,
        isRunning, toggleTimer, resetTimer, skipSession,
        session,
        currentTaskId, setCurrentTaskId,
    };
}
