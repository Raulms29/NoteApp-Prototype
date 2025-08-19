import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Workspace } from '../services/domain/Workspace';
import { WorkspaceRepository } from '../services/WorkspaceRepository';
import { setWorkspaceRoot } from '../utils/fileUtils';

export const useWorkspaceStore = defineStore('workspace', () => {
    const repo = new WorkspaceRepository();
    const workspaces = ref<Workspace[]>([]);
    const currentWorkspace = ref<Workspace | null>(null);
    const firstWorkspaceAccess = ref<boolean>(true);

    async function init() {
        workspaces.value = await repo.getWorkspaces();
        console.log('Workspaces loaded:', workspaces.value);
    }

    async function addWorkspace(workspace: Workspace) {
        await repo.createWorkspace(workspace);
        workspaces.value = [...workspaces.value, workspace];
        await persistWorkspaces();
    }

    function removeWorkspace(id: string) {
        workspaces.value = workspaces.value.filter(ws => ws.id !== id);
        if (currentWorkspace.value?.id === id) {
            currentWorkspace.value = null;
        }
        persistWorkspaces();
    }

    async function selectWorkspace(id: string) {
        const ws = workspaces.value.find(ws => ws.id === id) ?? null;
        if (!ws) {
            throw new Error(`Workspace with id ${id} not found`);
        }

        currentWorkspace.value = ws;
        setWorkspaceRoot(ws.path);
        ws.lastAccessed = new Date();
        firstWorkspaceAccess.value = false;

        await persistWorkspaces();
        return ws;
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

    function getLastWorkspaceAccesed(): Workspace | null {
        return workspaces.value.reduce((last, ws) => {
            const lastAccesed = ws.lastAccessed;
            if (!lastAccesed) return last;
            if (!last || lastAccesed.getTime() > last.lastAccessed.getTime()) {
                return ws;
            }
            return last;
        }, null) as Workspace | null;
    }

    return {
        workspaces,
        currentWorkspace,
        firstWorkspaceAccess,
        init,
        addWorkspace,
        removeWorkspace,
        selectWorkspace,
        renameWorkspace,
        validateWorkspace,
        persistWorkspaces,
        getCurrentFilesPath,
        getLastWorkspaceAccesed
    };
});