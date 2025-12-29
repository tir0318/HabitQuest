import { useStorage } from '../contexts/StorageContext';
import { useToast } from '../contexts/ToastContext';

export function useGamification() {
    const { user, updateUser, settings } = useStorage();
    const { showToast } = useToast();

    const calculateTaskXP = (task) => {
        let xp = settings.baseXP;
        if (task.priority === 'high') xp *= 1.5;
        if (task.priority === 'low') xp *= 0.8;
        return Math.round(xp);
    };

    // More gradual curve: 100, 110, 120, 130...
    const getNextLevelXP = (lvl) => 100 + (lvl - 1) * 10;

    const addXP = (amount) => {
        let newXP = user.xp + amount;
        let newTotalXP = user.totalXP + amount;
        let newLevel = user.level;
        let leveledUp = false;
        let newHp = user.hp;

        while (newXP >= getNextLevelXP(newLevel)) {
            newXP -= getNextLevelXP(newLevel);
            newLevel++;
            leveledUp = true;
            newHp = user.maxHp; // Full recovery on level up
        }

        updateUser({ ...user, xp: newXP, totalXP: newTotalXP, level: newLevel, hp: newHp });

        if (leveledUp) {
            showToast(`レベルアップ！ Lv.${newLevel}`, 'success');
        }
    };

    const subtractXP = (amount) => {
        let newXP = Math.max(0, user.xp - amount);
        let newTotalXP = Math.max(0, user.totalXP - amount);
        updateUser({ ...user, xp: newXP, totalXP: newTotalXP });
        // No toast for subtraction during toggle to avoid spam, or low priority one
    };

    const takeDamage = (amount) => {
        let newHp = Math.max(0, user.hp - amount);
        let newLevel = user.level;

        if (newHp === 0 && newLevel > 1) {
            newLevel -= 1;
            newHp = user.maxHp; // Reset HP on level down
            showToast(`レベルダウン... Lv.${newLevel}`, 'error');
        } else {
            showToast(`ダメージを受けました: -${amount} HP`, 'error');
        }

        updateUser({ ...user, hp: newHp, level: newLevel });
    };

    return { calculateTaskXP, addXP, subtractXP, takeDamage, getNextLevelXP };
}
