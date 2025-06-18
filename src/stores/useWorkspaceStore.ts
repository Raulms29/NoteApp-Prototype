import { defineStore } from 'pinia';
import { ref } from 'vue';
import { WorkspaceI } from '../services/domain/Workspace';
import { WorkspaceRepository } from '../services/WorkspaceRepository';
import { useNotesStore } from './useNotesStore';

export const useWorkspaceStore = defineStore('workspace', () => {
    const repo = new WorkspaceRepository();
    const workspaces = ref<WorkspaceI[]>([]);
    const currentWorkspace = ref<WorkspaceI | null>(null);
    const notesStore = useNotesStore();

    async function init() {
        workspaces.value = await repo.getWorkspaces();
    }

    function addWorkspace(workspace: WorkspaceI) {
        repo.createWorkspace(workspace);
        workspaces.value = [...workspaces.value, workspace];
        persistWorkspaces();
    }

    function removeWorkspace(id: string) {
        workspaces.value = workspaces.value.filter(ws => ws.id !== id);
        if (currentWorkspace.value?.id === id) {
            currentWorkspace.value = null;
        }
        persistWorkspaces();
    }

    function selectWorkspace(id: string) {
        const ws = workspaces.value.find(ws => ws.id === id) || null;
        currentWorkspace.value = ws;
        notesStore.init(ws);
    }

    function renameWorkspace(id: string, newName: string) {
        const index = workspaces.value.findIndex(ws => ws.id === id);
        if (index !== -1) {
            workspaces.value[index].name = newName;
        }
        persistWorkspaces();
    }

    async function persistWorkspaces() {
        try {
            await repo.saveWorkspaces(workspaces.value);
        }
        catch (error) {
            throw new Error(`Failed to persist workspaces: ${error}`);
        }
    }

    function validateWorkspace(name: string, path: string): void {
        if (!name || name.trim() === '' || name.length > 30) {
            throw new Error('Please enter a valid workspace name. It should not exceed 30 characters.');
        }
        if (!path || path.trim() === '') {
            throw new Error('Workspace location cannot be empty');
        }
        if (workspaces.value.some(ws => ws.path === path)) {
            throw new Error('A workspace already exists in this location');
        }
    }

    return {
        workspaces,
        currentWorkspace,
        init,
        addWorkspace,
        removeWorkspace,
        selectWorkspace,
        renameWorkspace,
        validateWorkspace,
        persistWorkspaces
    };
});