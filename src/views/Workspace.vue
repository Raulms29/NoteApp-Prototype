<template>
    <header class="flex items-center justify-center mb-4">
        <div class="flex items-center mb-4 mt-6">
            <div class="logo">📓</div>
            <h1 class="text-7xl font-bold mb-0">Notes App</h1>
        </div>
    </header>
    <main class="workspace-list">
        <div class="workspaces">
            <WorkspaceCard v-for="workspace of workspaceStore.workspaces" :workspace="workspace as WorkspaceI"
                @selectWorkspace="selectWorkspace" @renameWorkspace="renameWorkspace"
                @removeWorkspace="removeWorkspace" />
        </div>
        <NewWorkspaceCard @click="newWorkspace" />
        <GenericErrorMessage v-if="errorMessage" :message="errorMessage" />
    </main>
</template>

<script lang="ts" setup>

import { useRouter } from 'vue-router';
import { WorkspaceI } from '../services/domain/Workspace';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';
import { onMounted, ref } from 'vue';
import { useSettingsStore } from '../stores//useSettingsStore';

const router = useRouter();

const workspaceStore = useWorkspaceStore();
const errorMessage = ref<string>(null);
const settingsStore = useSettingsStore();

async function selectWorkspace(workspace: WorkspaceI) {
    await workspaceStore.selectWorkspace(workspace.id);
    resizeWindowAndNavigate();
}

function resizeWindowAndNavigate() {
    window.windowAPI.setResizable(true)
    window.windowAPI.maximizeWindow();
    router.replace({ name: 'noteSpace' });
}

function newWorkspace() {
    router.replace({ name: 'newWorkspace' });
}

function renameWorkspace(workspace: WorkspaceI, newName: string) {
    try {
        workspaceStore.renameWorkspace(workspace.id, newName);
    } catch (e) {
        errorMessage.value = e.message;
        setTimeout(() => {
            errorMessage.value = null;
        }, 3000);
        return;
    }
}

function removeWorkspace(workspace: WorkspaceI) {
    workspaceStore.removeWorkspace(workspace.id);
}

async function setWindowSize() {
    const isMaximized = await window.windowAPI.isMaximized();
    if (isMaximized) {
        await window.windowAPI.unmaximizeWindow();
    }
    await window.windowAPI.changeWindowSize(600, 800);
    await window.windowAPI.setResizable(false);
}
onMounted(async () => {
    await workspaceStore.init();
    const lastWorkspaceAccesed = workspaceStore.getLastWorkspaceAccesed();
    if (workspaceStore.firstWorkspaceAccess && settingsStore.settings.rememberLastWorkspace && lastWorkspaceAccesed !== null) {
        selectWorkspace(lastWorkspaceAccesed);
    }
    else {
        setWindowSize();
        workspaceStore.firstWorkspaceAccess = false;
    }
})


</script>

<style scoped>
.logo {
    font-size: 64px;
    margin-right: 0.75rem;
}

.workspace-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: 100%;
}

.workspaces {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 50%;
    align-items: center;
    justify-content: flex-start;
    overflow-y: auto;
    padding: 1rem 1rem;
    max-height: 55vh;
}
</style>