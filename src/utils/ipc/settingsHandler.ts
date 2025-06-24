import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Settings } from '../../services/domain/Settings';

export type SettingsSchema = Settings;

const defaults: SettingsSchema = {
    rememberLastWorkspace: false,
    focusMode: false,
};

const settingsStore = new Store<SettingsSchema>({
    name: 'settings',
    defaults: defaults,
});

export function registerSettingsHandlers() {
    ipcMain.handle('get-settings', () => {
        return settingsStore.get('settings', defaults);
    });

    ipcMain.handle('set-settings', (_event, settings) => {
        settingsStore.store = settings;
    });

    ipcMain.handle('update-setting', (_event, key, value) => {
        settingsStore.set(key, value);
    });
}
