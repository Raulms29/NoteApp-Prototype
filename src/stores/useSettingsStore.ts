import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '../services/domain/Settings';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        rememberLastWorkspace: false,
        focusMode: false,
    });

    async function loadSettings() {
        settings.value = await window.settingsAPI.getSettings();
    }

    async function saveSettings() {
        await window.settingsAPI.setSettings(settings.value);
    }

    async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        settings.value[key] = value;
        await window.settingsAPI.updateSetting(key, value);
    }

    return {
        settings,
        loadSettings,
        saveSettings,
        updateSetting,
    };
});
