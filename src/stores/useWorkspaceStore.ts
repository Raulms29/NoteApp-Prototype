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

    /**
     * Initializes the workspace store.
     */
    async function init() {
        workspaces.value = await repo.getWorkspaces();
        console.log('Workspaces loaded:', workspaces.value);
    }

    /**
     * Adds a new workspace.
     * @param workspace - The workspace to add.
     * @returns The newly created Workspace instance.
     */
    async function addWorkspace(name: string, location: string): Promise<Workspace> {
        const workspace = new Workspace(name, location);
        await repo.createWorkspace(workspace);
        workspaces.value = [...workspaces.value, workspace];
        await persistWorkspaces();
        return workspace;
    }

    /**
     * Removes a workspace by its ID.
     * @param id - The ID of the workspace to remove.
     */
    function removeWorkspace(id: string) {
        workspaces.value = workspaces.value.filter(ws => ws.id !== id);
        if (currentWorkspace.value?.id === id) {
            currentWorkspace.value = null;
        }
        persistWorkspaces();
    }

    /**
     * Selects a workspace.
     * @param id - The ID of the workspace to select.
     * @returns The selected Workspace instance.
     */
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

    /**
     * Renames a workspace provided its ID.
     * @param id - The ID of the workspace to rename.
     * @param newName - The new name for the workspace.
     */
    function renameWorkspace(id: string, newName: string) {
        const index = workspaces.value.findIndex(ws => ws.id === id);
        if (index !== -1) {
            workspaces.value[index].name = newName;
        }
        persistWorkspaces();
    }

    /**
     * Persists the current list of workspaces.
     */
    async function persistWorkspaces() {
        await repo.saveWorkspaces(workspaces.value);
    }

    /**
     * Validates the workspace name and path before creation.
     * @param name - The name of the workspace.
     * @param path - The file system path of the workspace.
     */
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
     * @returns The path to the files folder or null if no workspace is selected.
     */
    function getCurrentFilesPath(): string | null {
        if (!currentWorkspace.value) return null;
        return `${currentWorkspace.value.path}/.files`;
    }

    /**
     * Returns the most recently accessed workspace.
     * @returns The most recently accessed Workspace instance or null if none found.
     */
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
        /**
         * Indicates if this is the first workspace access in the session.
         */
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