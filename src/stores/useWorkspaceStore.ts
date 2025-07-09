import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Workspace } from '../services/domain/Workspace';
import { WorkspaceRepository } from '../services/WorkspaceRepository';
import { useNotesStore } from './useNotesStore';
import { setWorkspaceRoot } from '../utils/fileUtils';

export const useWorkspaceStore = defineStore('workspace', () => {
    const repo = new WorkspaceRepository();
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);
    const notesStore = useNotesStore();

    async function init() {
        workspaces.value = await repo.getWorkspaces();
    }

    function addWorkspace(workspace: Workspace) {
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
        const ws = workspaces.value.find(ws => ws.id === id) ?? null;
        if (!ws) {
            throw new Error(`Workspace with id ${id} not found`);
        }
        currentWorkspace.value = ws;
        setWorkspaceRoot(ws.path);
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
        await repo.saveWorkspaces(workspaces.value);
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

    /**
     * Returns the current files path for the selected workspace.
     */
    function getCurrentFilesPath(): string | null {
        if (!currentWorkspace.value) return null;
        return `${currentWorkspace.value.path}/.files`;
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
        persistWorkspaces,
        getCurrentFilesPath
    };
});