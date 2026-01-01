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

    // Performance Optimization: Buffer time in ref and save periodically
    const unsavedSecondsRef = useRef(0);
    const studyRecordsRef = useRef(studyRecords);

    // Keep ref in sync
    useEffect(() => {
        studyRecordsRef.current = studyRecords;
    }, [studyRecords]);

    // Update timer duration when settings or mode change
    useEffect(() => {
        let duration = settings.workTime;
        if (mode === 'break') duration = settings.breakTime;
        if (mode === 'long-break') duration = settings.longBreakTime;

        const newTotalSeconds = duration * 60;
        setTotalTime(newTotalSeconds);

        if (!isRunning) {
            setTimeLeft(newTotalSeconds);
        }
    }, [mode, settings.workTime, settings.breakTime, settings.longBreakTime]);

    // Timer Tick
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        completeSession(); // This will eventually trigger saving remaining time
                        return 0;
                    }
                    return prev - 1;
                });

                // Accumulate unsaved time
                unsavedSecondsRef.current += 1;

                // Remove intermediate saving to avoid stale state race conditions.
                // We save only on pause/stop/complete.
            }, 1000);
        } else {
            // Timer paused or stopped
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Cleanup: Save progress when effect cleans up (pause, stop, unmount)
        // Note: strict dependencies ensures this runs when isRunning changes or mode changes
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // We must save any pending time when stopping/pausing
            // However, we need to be careful not to save double if completeSession calls it.
            // But saving 0 is harmless.
            if (unsavedSecondsRef.current > 0) {
                saveProgress();
            }
        };
    }, [isRunning, mode]); // Add mode to dependency to flush time if mode changes mid-run (rare but safe)

    const saveProgress = () => {
        if (unsavedSecondsRef.current === 0) return;

        const secondsToAdd = unsavedSecondsRef.current;
        unsavedSecondsRef.current = 0; // Reset immediately

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // strict read from ref to get latest state
        const currentRecords = studyRecordsRef.current;
        const record = currentRecords[dateStr] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] };

        let newRecord = { ...record };
        if (mode === 'work') {
            newRecord.studyTime = (record.studyTime || 0) + secondsToAdd;
        } else {
            newRecord.breakTime = (record.breakTime || 0) + secondsToAdd;
        }

        console.log(`Saving progress: +${secondsToAdd}s to ${year}-${month}-${day} (${mode})`);

        const updatedRecords = { ...currentRecords, [dateStr]: newRecord };
        // CRITICAL: Optimistic update
        studyRecordsRef.current = updatedRecords;

        updateStudyRecords(updatedRecords);
    };

    // Removed trackTime as it is replaced by saveProgress logic above

    const completeSession = () => {
        // Prevent duplicate execution
        if (isCompletingRef.current) return;
        isCompletingRef.current = true;

        // Capture pending seconds immediately
        const secondsToAdd = unsavedSecondsRef.current;
        unsavedSecondsRef.current = 0;

        setIsRunning(false);

        const currentMode = mode;
        playAlarm(currentMode);
        showNotification(currentMode);

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Read latest records
        const currentRecords = studyRecordsRef.current;
        const record = { ...(currentRecords[dateStr] || { studyTime: 0, breakTime: 0, pomodoros: 0, sessions: [] }) };

        // 1. Add pending time to the record
        if (currentMode === 'work') {
            record.studyTime = (record.studyTime || 0) + secondsToAdd;
        } else {
            record.breakTime = (record.breakTime || 0) + secondsToAdd;
        }
        console.log(`Session Complete: +${secondsToAdd}s to ${dateStr} (${currentMode})`);

        if (!record.sessions) record.sessions = [];

        // 2. Add session log
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

        // Single atomic update for both time and session
        const finalRecords = { ...currentRecords, [dateStr]: record };

        // CRITICAL: Optimistic update of ref to prevent stale reads if cleanup fires or rapid updates occur
        studyRecordsRef.current = finalRecords;

        updateStudyRecords(finalRecords);

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
