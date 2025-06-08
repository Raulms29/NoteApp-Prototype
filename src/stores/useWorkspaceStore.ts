import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Workspace, WorkspaceI } from '../services/domain/Workspace';

export const useWorkspaceStore = defineStore('workspace', () => {
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);

    function addWorkspace(workspace: WorkspaceI) {
        workspaces.value.push(new Workspace(workspace));
    }

    function removeWorkspace(id: string) {
        workspaces.value = workspaces.value.filter(ws => ws.id !== id);
        if (currentWorkspace.value?.id === id) {
            currentWorkspace.value = null;
        }
    }

    function selectWorkspace(id: string) {
        const ws = workspaces.value.find(ws => ws.id === id) || null;
        currentWorkspace.value = ws;
    }

    function renameWorkspace(id: string, newName: string) {
        const idx = workspaces.value.findIndex(ws => ws.id === id);
        if (idx !== -1) {
            workspaces.value[idx].name = newName;
        }
    }

    // Optionally, persist workspaces to disk or localStorage here

    return {
        workspaces,
        currentWorkspace,
        addWorkspace,
        removeWorkspace,
        selectWorkspace,
        renameWorkspace,
    };
});
