import { renderHook, act } from '@testing-library/react';
import { useGamification } from '../hooks/useGamification';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as StorageContext from '../contexts/StorageContext';
import * as ToastContext from '../contexts/ToastContext';

// Mock contexts
vi.mock('../contexts/StorageContext', () => ({
    useStorage: vi.fn()
}));
vi.mock('../contexts/ToastContext', () => ({
    useToast: vi.fn()
}));

describe('useGamification', () => {
    let mockUpdateUser;
    let mockShowToast;
    let mockUser;
    let mockSettings;

    beforeEach(() => {
        mockUpdateUser = vi.fn();
        mockShowToast = vi.fn();
        mockUser = {
            level: 1,
            xp: 0,
            hp: 100,
            maxHp: 100,
            totalXP: 0
        };
        mockSettings = {
            baseXP: 10
        };

        vi.spyOn(StorageContext, 'useStorage').mockReturnValue({
            user: mockUser,
            updateUser: mockUpdateUser,
            settings: mockSettings
        });

        vi.spyOn(ToastContext, 'useToast').mockReturnValue({
            showToast: mockShowToast
        });
    });

    it('calculates task XP correctly based on priority', () => {
        const { result } = renderHook(() => useGamification());
        const normalXP = result.current.calculateTaskXP({ priority: 'medium' });
        const highXP = result.current.calculateTaskXP({ priority: 'high' });
        const lowXP = result.current.calculateTaskXP({ priority: 'low' });

        expect(normalXP).toBe(10);
        expect(highXP).toBe(15); // 10 * 1.5
        expect(lowXP).toBe(8);   // 10 * 0.8
    });

    it('adds XP and updates user state', () => {
        const { result } = renderHook(() => useGamification());

        act(() => {
            result.current.addXP(50);
        });

        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            xp: 50,
            totalXP: 50
        }));
    });

    it('handles level up logic (XP threshold)', () => {
        const { result } = renderHook(() => useGamification());
        // Level 1 -> Level 2 requires 100 XP (100 + (1-1)*10)

        act(() => {
            result.current.addXP(110);
        });

        // XP should carry over: 110 - 100 = 10
        // Level should be 2
        // HP should recover to max
        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            level: 2,
            xp: 10,
            hp: 100
        }));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('レベルアップ'), 'success');
    });

    it('takes damage and reduces HP', () => {
        const { result } = renderHook(() => useGamification());

        act(() => {
            result.current.takeDamage(20);
        });

        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            hp: 80
        }));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('ダメージ'), 'error');
    });

    it('handles level down on 0 HP', () => {
        mockUser.level = 2;
        mockUser.hp = 10;

        const { result } = renderHook(() => useGamification());

        act(() => {
            result.current.takeDamage(20); // Overkill
        });

        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            level: 1,
            hp: 100 // Reset HP
        }));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('レベルダウン'), 'error');
    });
});
