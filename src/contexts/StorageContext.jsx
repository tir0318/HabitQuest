import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const StorageContext = createContext();

const KEYS = {
    settings: 'habitquest_settings',
    user: 'habitquest_user',
    tasks: 'habitquest_tasks',
    habits: 'habitquest_habits',
    journals: 'habitquest_journals',
    memos: 'habitquest_memos',
    quickMemos: 'habitquest_quick_memos',
    categories: 'habitquest_categories',
    studyRecords: 'habitquest_study_records',
    timerSettings: 'habitquest_timer_settings'
};

const DEFAULTS = {
    settings: {
        workTime: 50,
        breakTime: 10,
        longBreakTime: 20,
        sessionsBeforeLongBreak: 4,
        baseXP: 10,
        habitXP: 5,
        damage: 5,
        darkMode: true,
        soundEnabled: true,
        autoStartWork: false,
        autoStartBreak: false
    },
    user: {
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        totalXP: 0,
        streak: 0,
        lastActiveDate: null
    },
    categories: [
        { id: 'study', name: '勉強', color: '#6366f1', icon: '📚', type: 'both' },
        { id: 'work', name: '仕事', color: '#8b5cf6', icon: '💼', type: 'both' },
        { id: 'exercise', name: '運動', color: '#10b981', icon: '🏃', type: 'both' },
        { id: 'health', name: '健康', color: '#f59e0b', icon: '🍎', type: 'both' },
        { id: 'hobby', name: '趣味', color: '#ec4899', icon: '🎨', type: 'both' },
        { id: 'reading', name: '読書', color: '#3b82f6', icon: '📖', type: 'both' },
        { id: 'personal', name: '個人', color: '#14b8a6', icon: '👤', type: 'both' },
        { id: 'other', name: 'その他', color: '#6b7280', icon: '📌', type: 'both' }
    ],
    tasks: [],
    habits: [],
    journals: {},
    memos: [],
    quickMemos: [],
    studyRecords: {}
};

export function StorageProvider({ children }) {
    const { currentUser } = useAuth();

    // State for each key
    const [settings, setSettings] = useState(DEFAULTS.settings);
    const [user, setUser] = useState(DEFAULTS.user);
    const [tasks, setTasks] = useState(DEFAULTS.tasks);
    const [habits, setHabits] = useState(DEFAULTS.habits);
    const [categories, setCategories] = useState(DEFAULTS.categories);
    const [journals, setJournals] = useState(DEFAULTS.journals);
    const [memos, setMemos] = useState(DEFAULTS.memos);
    const [quickMemos, setQuickMemos] = useState(DEFAULTS.quickMemos);
    const [studyRecords, setStudyRecords] = useState(DEFAULTS.studyRecords);
    const [isLoading, setIsLoading] = useState(true);
    const [showRoutineResetModal, setShowRoutineResetModal] = useState(false);

    const migrateData = (keyShort, value) => {
        if (!value) return value;
        let migratedValue = value;

        if ((keyShort === 'tasks' || keyShort === 'habits') && Array.isArray(migratedValue)) {
            migratedValue = migratedValue.map(item => {
                if (typeof item.category === 'string') {
                    return { ...item, categories: [item.category], category: undefined };
                }
                return item;
            });
        }

        if (keyShort === 'categories' && Array.isArray(migratedValue)) {
            migratedValue = migratedValue.map(cat => ({ ...cat, type: cat.type || 'both' }));
        }

        return migratedValue;
    };

    // Initial load from localStorage
    useEffect(() => {
        const load = (keyShort, setter, defaultVal) => {
            try {
                const stored = localStorage.getItem(KEYS[keyShort]);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setter(migrateData(keyShort, parsed));
                } else {
                    setter(defaultVal);
                }
            } catch (e) {
                console.error(`Failed to load ${keyShort}`, e);
            }
        };

        Object.keys(DEFAULTS).forEach(key => {
            const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
            // This is a bit dynamic, but safer to just list them for readability in a hook
        });

        load('settings', setSettings, DEFAULTS.settings);
        load('user', setUser, DEFAULTS.user);
        load('tasks', setTasks, DEFAULTS.tasks);
        load('habits', setHabits, DEFAULTS.habits);
        load('categories', setCategories, DEFAULTS.categories);
        load('journals', setJournals, DEFAULTS.journals);
        load('memos', setMemos, DEFAULTS.memos);
        load('quickMemos', setQuickMemos, DEFAULTS.quickMemos);
        load('studyRecords', setStudyRecords, DEFAULTS.studyRecords);

        // If not logged in, we are "done" loading local data
        if (!currentUser) setIsLoading(false);
    }, [currentUser]);

    // Sync with Firestore
    useEffect(() => {
        if (!currentUser) return;

        const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                const syncItem = (keyShort, value, setter) => {
                    if (value) {
                        const migratedValue = migrateData(keyShort, value);
                        const strVal = JSON.stringify(migratedValue);
                        const localVal = localStorage.getItem(KEYS[keyShort]);
                        if (strVal !== localVal) {
                            setter(migratedValue);
                            localStorage.setItem(KEYS[keyShort], strVal);
                        }
                    }
                };

                syncItem('settings', data.settings, setSettings);
                syncItem('user', data.user, setUser);
                syncItem('tasks', data.tasks, setTasks);
                syncItem('habits', data.habits, setHabits);
                syncItem('categories', data.categories, setCategories);
                syncItem('journals', data.journals, setJournals);
                syncItem('memos', data.memos, setMemos);
                syncItem('quickMemos', data.quickMemos, setQuickMemos);
                syncItem('studyRecords', data.studyRecords, setStudyRecords);
                setIsLoading(false);

            } else {
                // First time user: Upload local data
                console.log('No cloud data, uploading local defaults...');
                setDoc(doc(db, 'users', currentUser.uid), {
                    settings, user, tasks, habits, categories, journals, memos, quickMemos, studyRecords
                }, { merge: true });
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Sync error:", error);
        });

        return () => unsub();
    }, [currentUser]);

    // Generic update function
    const update = (keyShort, value, setter) => {
        setter(value);
        localStorage.setItem(KEYS[keyShort], JSON.stringify(value));

        if (currentUser) {
            updateDoc(doc(db, 'users', currentUser.uid), {
                [keyShort]: value
            }).catch(e => console.error("Update failed:", e));
        }
    };

    // Daily Reset Logic - now handled by useDailyReset hook
    // We just provide state and updater


    const confirmRoutineReset = () => {
        // Use local date
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        console.log('Resetting daily routines...');

        // Reset daily tasks
        const updatedTasks = tasks.map(t => t.type === 'daily' ? { ...t, completed: false } : t);
        if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
            update('tasks', updatedTasks, setTasks);
        }

        // Reset habit counts
        const updatedHabits = habits.map(h => ({ ...h, todayCount: 0 }));
        if (JSON.stringify(updatedHabits) !== JSON.stringify(habits)) {
            update('habits', updatedHabits, setHabits);
        }

        // Update user lastActiveDate
        update('user', { ...user, lastActiveDate: today }, setUser);

        // Close modal
        setShowRoutineResetModal(false);
    };

    const hardReset = async () => {
        if (!window.confirm('すべてのデータをリセットしますか？この操作は取り消せません。')) return;

        // Reset all states locally
        setSettings(DEFAULTS.settings);
        setUser(DEFAULTS.user);
        setTasks(DEFAULTS.tasks);
        setHabits(DEFAULTS.habits);
        setCategories(DEFAULTS.categories);
        setJournals(DEFAULTS.journals);
        setMemos(DEFAULTS.memos);
        setQuickMemos(DEFAULTS.quickMemos);
        setStudyRecords(DEFAULTS.studyRecords);

        // Clear local storage
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));

        // Clear Firestore if logged in
        if (currentUser) {
            try {
                await setDoc(doc(db, 'users', currentUser.uid), {
                    settings: DEFAULTS.settings,
                    user: DEFAULTS.user,
                    tasks: DEFAULTS.tasks,
                    habits: DEFAULTS.habits,
                    categories: DEFAULTS.categories,
                    journals: DEFAULTS.journals,
                    memos: DEFAULTS.memos,
                    quickMemos: DEFAULTS.quickMemos,
                    studyRecords: DEFAULTS.studyRecords
                });
            } catch (e) {
                console.error("Cloud reset failed", e);
            }
        }

        window.location.reload();
    };

    const value = {
        settings, updateSettings: (v) => update('settings', v, setSettings),
        user, updateUser: (v) => update('user', v, setUser),
        tasks, updateTasks: (v) => update('tasks', v, setTasks),
        habits, updateHabits: (v) => update('habits', v, setHabits),
        categories, updateCategories: (v) => update('categories', v, setCategories),
        journals, updateJournals: (v) => update('journals', v, setJournals),
        memos, updateMemos: (v) => update('memos', v, setMemos),
        quickMemos, updateQuickMemos: (v) => update('quickMemos', v, setQuickMemos),
        studyRecords, updateStudyRecords: (v) => update('studyRecords', v, setStudyRecords),
        hardReset,
        isLoading,
        showRoutineResetModal,
        setShowRoutineResetModal,
        confirmRoutineReset
    };

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(StorageContext);
}
