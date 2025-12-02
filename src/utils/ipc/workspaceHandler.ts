import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Workspace, WorkspaceI } from '../../business/domain/Workspace';

export type WorkspacesSchema = {
    workspaces: Workspace[];
};

/**
 * Electron store instance for persisting workspace data.
 */
const workspaceStore = new Store<WorkspacesSchema>({
    name: 'workspaces',
    defaults: { workspaces: [] },
});

export function registerWorkspaceHandlers() {
    // Handles retrieving the list of workspaces from the store.
    ipcMain.handle('get-workspaces', () => {
        return workspaceStore.get('workspaces', []).map(ws =>
        ({
            name: ws.name,
            path: ws.path,
            id: ws.id,
            lastAccessed: ws.lastAccessed ? new Date(ws.lastAccessed) : null
        }));
    });

    // Handles saving the list of workspaces to the store.
    ipcMain.handle('set-workspaces', (_event, workspaces: WorkspaceI[]) => {
        workspaceStore.set('workspaces', workspaces.map((ws: WorkspaceI) =>
        ({
            name: ws.name,
            path: ws.path,
            id: ws.id,
            lastAccessed: ws.lastAccessed
        })));
    });
}
