import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '../business/domain/Settings';
import { SettingsService } from '../business/service/SettingsService';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        rememberLastWorkspace: false,
        rememberLastNote: false,
        focusMode: false,
        subNotesDisplayType: 'DEFAULT',
        showFloatingMenu: true
    });

    const subNotesOptions = [
        { value: 'DEFAULT', label: 'Default' },
        { value: 'BIG_ONLY', label: 'Big Only' },
        { value: 'SMALL_ONLY', label: 'Small Only' },
        { value: 'NONE', label: 'None' }
    ];

    const numberSubnotesBigDefault = 5;

    const settingsService = new SettingsService();

    /**
     * Initializes the settings store by loading settings from the API.
     */
    async function init() {
        await loadSettings();
    }

    async function loadSettings() {
        settings.value = await settingsService.loadSettings();
    }

    /**
     * Saves the current settings to the API.
     */
    async function saveSettings() {
        await settingsService.saveSettings({
            rememberLastWorkspace: settings.value.rememberLastWorkspace,
            rememberLastNote: settings.value.rememberLastNote,
            focusMode: false,
            subNotesDisplayType: settings.value.subNotesDisplayType,
            showFloatingMenu: settings.value.showFloatingMenu
        });
    }

    /**
     * Updates a specific setting in the store without persisting the changes.
     * @param key - The key of the setting to update.
     * @param value - The new value for the setting.
     */
    async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        settings.value[key] = value;
    }

    function restoreDefaultSettings() {
        settings.value = {
            rememberLastWorkspace: false,
            rememberLastNote: false,
            focusMode: false,
            subNotesDisplayType: 'DEFAULT',
            showFloatingMenu: true
        };
    }

    return {
        /**
         * The current settings object.
         */
        settings,
        /**
         * Options for displaying sub-notes in the UI.
         */
        subNotesOptions,
        /**
         * Default number of big sub-notes to display.
         */
        numberSubnotesBigDefault,
        init,
        saveSettings,
        updateSetting,
        restoreDefaultSettings
    };
});
