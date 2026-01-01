import { renderHook, act } from '@testing-library/react';
import { useDailyReset } from '../hooks/useDailyReset';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as StorageContext from '../contexts/StorageContext';

// Mock context
vi.mock('../contexts/StorageContext', () => ({
    useStorage: vi.fn()
}));

describe('useDailyReset', () => {
    let mockSetShowRoutineResetModal;
    let mockUpdateUser;
    let mockUser;

    beforeEach(() => {
        vi.useFakeTimers();
        mockSetShowRoutineResetModal = vi.fn();
        mockUpdateUser = vi.fn();
        mockUser = { lastActiveDate: '2023-01-01' };

        vi.spyOn(StorageContext, 'useStorage').mockReturnValue({
            user: mockUser,
            updateUser: mockUpdateUser,
            setShowRoutineResetModal: mockSetShowRoutineResetModal,
            isLoading: false
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does nothing if dates match', () => {
        // Set system time to match lastActiveDate
        vi.setSystemTime(new Date('2023-01-01T12:00:00'));

        renderHook(() => useDailyReset());

        expect(mockSetShowRoutineResetModal).not.toHaveBeenCalled();
    });

    it('triggers modal if date changed (new day)', () => {
        // Set system time to next day (noon UTC to be safe)
        vi.setSystemTime(new Date('2023-01-02T12:00:00Z'));

        renderHook(() => useDailyReset());

        expect(mockSetShowRoutineResetModal).toHaveBeenCalledWith(true);
    });

    it('updates lastActiveDate if it is missing (first run)', () => {
        vi.setSystemTime(new Date('2023-01-01T12:00:00'));
        mockUser.lastActiveDate = null; // simulate missing

        renderHook(() => useDailyReset());

        expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
            lastActiveDate: '2023-01-01'
        }));
    });
});
