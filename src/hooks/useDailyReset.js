import { useEffect } from 'react';
import { useStorage } from '../contexts/StorageContext';

export function useDailyReset() {
    const { user, updateUser, setShowRoutineResetModal, isLoading } = useStorage();

    useEffect(() => {
        if (isLoading) return;

        const checkDate = () => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;

            if (user.lastActiveDate && user.lastActiveDate !== today) {
                console.log('New day detected, showing routine reset modal...');
                setShowRoutineResetModal(true);
            } else if (!user.lastActiveDate) {
                updateUser({ ...user, lastActiveDate: today });
            }
        };

        checkDate(); // Check on mount

        const interval = setInterval(checkDate, 60000); // Check every minute

        // Also check when window regains focus (user comes back to tab)
        window.addEventListener('focus', checkDate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkDate);
        };
    }, [user.lastActiveDate, isLoading, setShowRoutineResetModal, updateUser]);
}
