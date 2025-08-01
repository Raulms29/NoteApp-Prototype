import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Settings } from '../services/domain/Settings';
// import { useWorkspaceStore } from './useWorkspaceStore';

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        rememberLastWorkspace: false,
        focusMode: false,
    });

    // const workspaceStore = useWorkspaceStore();

    // const currentWorkspace = workspaceStore.currentWorkspace;

    function init() {
        loadSettings();
    }

    async function loadSettings() {
        settings.value = await window.settingsAPI.getSettings();
    }

    async function saveSettings() {
        await window.settingsAPI.setSettings({ rememberLastWorkspace: settings.value.rememberLastWorkspace, focusMode: false });
    }

    async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        settings.value[key] = value;
    }

    return {
        settings,
        init,
        loadSettings,
        saveSettings,
        updateSetting,
    };
});
