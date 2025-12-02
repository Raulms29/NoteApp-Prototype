import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useGlobalError } from '../../../src/stores/useGlobalError';


describe('GIVEN the useGlobalError store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    // • store initialization
    describe('WHEN the store is initialized', () => {
        it('THEN globalError should be null by default', () => {
            const store = useGlobalError();
            expect(store.globalError).toBeNull();
        });
    });

    // • setError
    describe('WHEN setError is called with an Error object', () => {
        it('THEN globalError should be set to the error message', () => {
            const store = useGlobalError();
            store.setError(new Error('Error message'));
            expect(store.globalError).toBe('Error message');
        });
    });

    // • clearError
    describe('WHEN the error is cleared', () => {
        it('THEN globalError should be null', () => {
            const store = useGlobalError();
            store.setError(new Error('Error message'));
            store.clearError();
            expect(store.globalError).toBeNull();
        });
    });
});
