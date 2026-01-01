import { renderHook, act } from '@testing-library/react';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as StorageContext from '../contexts/StorageContext';
import * as GamificationHook from '../hooks/useGamification';
import * as ToastContext from '../contexts/ToastContext';

// Mock generic hooks
vi.mock('../contexts/StorageContext', () => ({
    useStorage: vi.fn()
}));
vi.mock('../hooks/useGamification', () => ({
    useGamification: vi.fn()
}));
vi.mock('../contexts/ToastContext', () => ({
    useToast: vi.fn()
}));

describe('useTaskOperations', () => {
    let mockTasks;
    let mockUpdateTasks;
    let mockAddXP;
    let mockSubtractXP;
    let mockShowToast;

    beforeEach(() => {
        mockTasks = [
            { id: '1', name: 'Task 1', completed: false, priority: 'medium' },
            { id: '2', name: 'Task 2', completed: true, xp: 10 }
        ];
        mockUpdateTasks = vi.fn();
        mockAddXP = vi.fn();
        mockSubtractXP = vi.fn();
        mockShowToast = vi.fn();

        vi.spyOn(StorageContext, 'useStorage').mockReturnValue({
            tasks: mockTasks,
            updateTasks: mockUpdateTasks,
            categories: []
        });

        vi.spyOn(GamificationHook, 'useGamification').mockReturnValue({
            addXP: mockAddXP,
            subtractXP: mockSubtractXP,
            calculateTaskXP: () => 10
        });

        vi.spyOn(ToastContext, 'useToast').mockReturnValue({
            showToast: mockShowToast
        });
    });

    it('toggles task from incomplete to completed', () => {
        const { result } = renderHook(() => useTaskOperations());

        act(() => {
            result.current.toggleTaskCompletion(mockTasks[0]);
        });

        expect(mockAddXP).toHaveBeenCalledWith(10);
        expect(mockUpdateTasks).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ id: '1', completed: true })
        ]));
        expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('完了'), 'success');
    });

    it('toggles task from completed to incomplete', () => {
        const { result } = renderHook(() => useTaskOperations());

        act(() => {
            result.current.toggleTaskCompletion(mockTasks[1]);
        });

        expect(mockSubtractXP).toHaveBeenCalledWith(10);
        expect(mockUpdateTasks).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ id: '2', completed: false })
        ]));
    });

    it('deletes a task', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { result } = renderHook(() => useTaskOperations());

        act(() => {
            result.current.handleDeleteTask(mockTasks[0]);
        });

        expect(mockUpdateTasks).toHaveBeenCalledWith(
            expect.not.arrayContaining([expect.objectContaining({ id: '1' })])
        );
        expect(mockUpdateTasks).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ id: '2' })])
        );
        confirmSpy.mockRestore();
    });
});
