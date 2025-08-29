
import { SettingsRepository } from "../repository/SettingsRepository";
import { Settings } from "../domain/Settings";


/**
 * Service class for managing application settings.
 * Provides methods to load and save settings.
 */
export class SettingsService {
    repo: SettingsRepository;

    constructor() {
        this.repo = new SettingsRepository();
    }

    /**
     * Loads the application settings from the repository.
     * @returns {Promise<Settings>} The loaded settings object.
     */
    async loadSettings(): Promise<Settings> {
        return await this.repo.getSettings();
    }

    /**
     * Saves the provided settings.
     * @param {Settings} settings - The settings object to save.
     * @returns {Promise<void>}
     */
    async saveSettings(settings: Settings): Promise<void> {
        await this.repo.saveSettings(settings);
    }
}