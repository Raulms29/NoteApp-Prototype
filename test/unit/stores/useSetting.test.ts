import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';

// Mock window.settingsAPI
globalThis.window = Object.create(window);
window.settingsAPI = {
    getSettings: vi.fn(async () => ({ rememberLastWorkspace: true, focusMode: true })),
    setSettings: vi.fn(async () => { }),
    updateSetting: vi.fn(async () => { }),
};

describe('GIVEN the useSettingsStore store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('WHEN the store is initialized', () => {
        it('THEN settings should have default values', () => {
            const store = useSettingsStore();
            expect(store.settings.rememberLastWorkspace).toBe(false);
            expect(store.settings.focusMode).toBe(false);
        });
    });

    describe('WHEN loadSettings is called', () => {
        it('THEN settings should be loaded from API', async () => {
            const store = useSettingsStore();
            await store.loadSettings();
            expect(window.settingsAPI.getSettings).toHaveBeenCalled();
            expect(store.settings.rememberLastWorkspace).toBe(true);
            expect(store.settings.focusMode).toBe(true);
        });
    });

    describe('WHEN saveSettings is called', () => {
        it('THEN settings should be saved via API', async () => {
            const store = useSettingsStore();
            await store.saveSettings();
            expect(window.settingsAPI.setSettings).toHaveBeenCalledWith(store.settings);
        });
    });

    describe('WHEN updateSetting is called', () => {
        it('THEN the setting should be updated in state and API', async () => {
            const store = useSettingsStore();
            await store.updateSetting('focusMode', true);
            expect(store.settings.focusMode).toBe(true);
            expect(window.settingsAPI.updateSetting).toHaveBeenCalledWith('focusMode', true);
        });
    });
});
