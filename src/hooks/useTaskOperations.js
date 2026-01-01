import { useStorage } from '../contexts/StorageContext';
import { useGamification } from './useGamification';
import { useToast } from '../contexts/ToastContext';

export function useTaskOperations() {
    const { tasks, updateTasks } = useStorage();
    const { addXP, subtractXP, calculateTaskXP } = useGamification();
    const { showToast } = useToast();

    // Helper to calculate XP if not provided (default fallback logic duplicated from hook/component currently)
    // Refactoring note: Ideally calculateTaskXP should be used, but let's stick to current logic first
    const getXPAmount = (task) => {
        // logic currently inside TaskCard is hardcoded to 10 or derived. 
        // TaskCard uses: const xpAmount = 10;
        return 10;
    };

    const toggleTaskCompletion = (task) => {
        const isCompleting = !task.completed;
        const xpAmount = getXPAmount(task);

        const updated = tasks.map(t => {
            if (t.id === task.id) {
                return { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : null };
            }
            return t;
        });

        if (isCompleting) {
            addXP(xpAmount);
            showToast(`完了! +${xpAmount}XP`, 'success');
        } else {
            subtractXP(xpAmount);
        }

        updateTasks(updated);
    };

    const handleDeleteTask = (task) => {
        if (window.confirm('削除しますか？')) {
            updateTasks(tasks.filter(t => t.id !== task.id));
            showToast('削除しました', 'success');
        }
    };

    const cycleTaskStatus = (task) => {
        const statusOrder = ['not-started', 'in-progress', 'today'];
        const statusLabels = { 'not-started': '未着手', 'in-progress': '進行中', 'today': '今日' };

        const current = task.status || 'not-started';
        const idx = statusOrder.indexOf(current);
        const next = statusOrder[(idx + 1) % statusOrder.length];

        const updated = tasks.map(t => t.id === task.id ? { ...t, status: next } : t);
        updateTasks(updated);
        showToast(`${statusLabels[next]} に変更しました`, 'success');
    };

    // Special method for "Silent Check" (used in Reset Modal where we don't toggle back and forth, just check)
    const checkTaskOneWay = (task) => {
        if (task.completed) return; // Already done

        const xpAmount = getXPAmount(task);
        addXP(xpAmount);

        const updated = tasks.map(t =>
            t.id === task.id
                ? { ...t, completed: true, completedAt: new Date().toISOString() }
                : t
        );
        updateTasks(updated);
        showToast(`昨日の分を完了！ +${xpAmount}XP`, 'success');
    };

    return { toggleTaskCompletion, handleDeleteTask, cycleTaskStatus, checkTaskOneWay };
}
