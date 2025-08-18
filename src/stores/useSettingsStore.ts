import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '../services/domain/Settings';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        rememberLastWorkspace: false,
        rememberLastNote: false,
        focusMode: false,
        subNotesDisplayType: 'DEFAULT'
    });

    const subNotesOptions = [
        { value: 'DEFAULT', label: 'Default' },
        { value: 'BIG_ONLY', label: 'Big Only' },
        { value: 'SMALL_ONLY', label: 'Small Only' },
        { value: 'NONE', label: 'None' }
    ];

    const numberSubnotesBigDefault = 5;

    function init() {
        loadSettings();
    }

    async function loadSettings() {
        settings.value = await window.settingsAPI.getSettings();
    }

    async function saveSettings() {
        await window.settingsAPI.setSettings({
            rememberLastWorkspace: settings.value.rememberLastWorkspace,
            rememberLastNote: settings.value.rememberLastNote,
            focusMode: false,
            subNotesDisplayType: settings.value.subNotesDisplayType
        });
    }

    async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        settings.value[key] = value;
    }



    return {
        settings,
        subNotesOptions,
        numberSubnotesBigDefault,
        init,
        loadSettings,
        saveSettings,
        updateSetting,
    };
});
