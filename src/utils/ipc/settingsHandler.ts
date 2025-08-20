import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Settings } from '../../services/domain/Settings';

export type SettingsSchema = Settings;

/**
 * Default settings schema for the application.
 */
const defaults: SettingsSchema = {
    rememberLastWorkspace: false,
    rememberLastNote: false,
    focusMode: false,
    subNotesDisplayType: 'DEFAULT',
};

/**
 * Electron store instance for persisting application settings.
 */
const settingsStore = new Store<SettingsSchema>({
    name: 'settings',
    defaults: defaults,
});

export function registerSettingsHandlers() {
    // Handles retrieving the application settings from the store.
    ipcMain.handle('get-settings', () => {
        return settingsStore.get('settings', defaults);
    });

    // Handles saving the application settings to the store.
    ipcMain.handle('set-settings', (_event, settings: SettingsSchema) => {
        settingsStore.set('settings', settings);
    });
}
