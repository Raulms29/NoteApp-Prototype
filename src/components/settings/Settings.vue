<template>
    <GenericDialog title="Settings">
        <template #content>

            <div class="settings-option">
                Remember last workspace:
                <GenericSwitch v-model="rememberLastWorkspace" :checked-text="''" :unchecked-text="''" />
            </div>

        </template>
        <template #actions>
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

async function handleClose() {
    await settingsStore.saveSettings();
    emit('close');
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