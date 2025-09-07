import { Settings } from "../../business/domain/Settings";

export class SettingsRepository {


    /**
     * Retrieves the application settings using the settings API.
     * @returns A promise that resolves to a Settings instance.
     */
    async getSettings(): Promise<Settings> {
        return await window.settingsAPI.getSettings();
    }

    /**
     * Saves the provided settings using the settings API.
     * @param settings - The Settings object to save.
     */
    async saveSettings(settings: Settings): Promise<void> {
        await window.settingsAPI.setSettings({
            rememberLastWorkspace: settings.rememberLastWorkspace,
            rememberLastNote: settings.rememberLastNote,
            focusMode: settings.focusMode,
            subNotesDisplayType: settings.subNotesDisplayType
        });
    }

}