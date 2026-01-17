<template>
    <GenericDialog title="Settings">
        <template #content>

            <div class="settings-option">
                Remember last workspace:
                <GenericSwitch v-model="rememberLastWorkspace" :checked-text="''" :unchecked-text="''" />
            </div>
            <div class="settings-option">
                Remember last note:
                <GenericSwitch v-model="rememberLastNote" :checked-text="''" :unchecked-text="''" />
            </div>
            <div class="settings-option">
                Show floating menu on empty line:
                <GenericSwitch v-model="showFloatingMenu" :checked-text="''" :unchecked-text="''" />
            </div>
            <div class="settings-option">
                <span class="mr-3">Subnotes display:
                </span>
                <n-radio-group v-model:value="subNotesOption" name="subnotes-display-group" style="
                        --n-button-border-color: #1976d2;
                        --n-button-border-color-active: #1976d2;
                        --n-button-box-shadow-focus: 0;
                        --n-button-color-active: #e3f2fd;
                        --n-button-text-color: #1976d2;
                        --n-button-text-color-hover: #1565c0;
                        --n-button-text-color-active: #1565c0;
                        --n-height: 34px;
                    ">
                    <n-radio-button v-for="option in settingsStore.subNotesOptions" :key="option.value"
                        :value="option.value" :label="option.label" />
                </n-radio-group>
            </div>
        </template>
        <template #actions>
            <GenericButton variant="secondary" @click="handleRestoreDefaults">Restore Defaults</GenericButton>
            <GenericButton variant="primary" @click="handleClose">OK</GenericButton>
        </template>

    </GenericDialog>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { useSettingsStore } from '../../stores/useSettingsStore';
const settingsStore = useSettingsStore();


const emit = defineEmits(['close']);

const rememberLastWorkspace = computed({
    get: () => settingsStore.settings.rememberLastWorkspace,
    set: (value: boolean) => {
        settingsStore.updateSetting('rememberLastWorkspace', value);
    }
});

const rememberLastNote = computed({
    get: () => settingsStore.settings.rememberLastNote,
    set: (value: boolean) => {
        settingsStore.updateSetting('rememberLastNote', value);
    }
});

const subNotesOption = computed({
    get: () => settingsStore.settings.subNotesDisplayType,
    set: (value: string) => {
        settingsStore.updateSetting('subNotesDisplayType', value as 'DEFAULT' | 'BIG_ONLY' | 'SMALL_ONLY' | 'NONE');
    }
});

const showFloatingMenu = computed({
    get: () => settingsStore.settings.showFloatingMenu,
    set: (value: boolean) => {
        settingsStore.updateSetting('showFloatingMenu', value);
    }
});

async function handleClose() {
    await settingsStore.saveSettings();
    emit('close');
}

async function handleRestoreDefaults() {
    settingsStore.restoreDefaultSettings();
}
</script>

<style scoped>
.settings-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    font-size: 1.05rem;
    transition: background 0.2s;
}

.settings-option:hover {
    background: #eef1f4;
}

.settings-option label {
    font-weight: 500;
    color: #333;
}
</style>