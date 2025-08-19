import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../../../src/stores/useSettingsStore';
import { Settings } from '../../../src/services/domain/Settings';

// Mock window.settingsAPI
globalThis.window = Object.create(window);
window.settingsAPI = {
    getSettings: vi.fn(async () => {
        const settings: Settings = {
            rememberLastWorkspace: true,
            rememberLastNote: true,
            focusMode: true,
            subNotesDisplayType: 'DEFAULT'
        };
        return settings;
    }),
    setSettings: vi.fn(async () => { }),
};

describe('GIVEN the useSettingsStore store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    // • store initialization
    describe('WHEN the store is initialized', () => {
        it('THEN settings should have default values', () => {
            const store = useSettingsStore();
            expect(store.settings.rememberLastWorkspace).toBe(false);
            expect(store.settings.focusMode).toBe(false);
        });
    });

    // • init
    describe('WHEN initializing the store', () => {
        it('THEN settings should be loaded from API', async () => {
            const store = useSettingsStore();
            await store.init();
            expect(window.settingsAPI.getSettings).toHaveBeenCalled();
            expect(store.settings.rememberLastWorkspace).toBe(true);
            expect(store.settings.focusMode).toBe(true);
        });
    });

    // • saveSettings
    describe('WHEN saveSettings is called', () => {
        it('THEN settings should be saved via API', async () => {
            const store = useSettingsStore();
            await store.saveSettings();
            expect(window.settingsAPI.setSettings).toHaveBeenCalledWith(store.settings);
        });
    });

    // • updateSetting
    describe('WHEN updateSetting is called', () => {
        it('THEN the specific setting should be updated', () => {
            const store = useSettingsStore();
            store.updateSetting('focusMode', true);
            expect(store.settings.focusMode).toBe(true);
            store.updateSetting('rememberLastWorkspace', true);
            expect(store.settings.rememberLastWorkspace).toBe(true);
        });
    });
});
