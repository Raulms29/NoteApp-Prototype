import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Workspace, WorkspaceI } from '../../services/domain/Workspace';

export type WorkspacesSchema = {
    workspaces: Workspace[];
};

const workspaceStore = new Store<WorkspacesSchema>({
    name: 'workspaces',
    defaults: { workspaces: [] },
});

export function registerWorkspaceHandlers() {

    ipcMain.handle('get-workspaces', () => {
        return workspaceStore.get('workspaces', []).map(ws => ({ name: ws.name, path: ws.path, id: ws.id, lastAccesed: ws.lastAccesed ? new Date(ws.lastAccesed) : null }));
    });

    ipcMain.handle('set-workspaces', (_event, workspaces) => {
        workspaceStore.set('workspaces', workspaces.map((ws: WorkspaceI) => ({ name: ws.name, path: ws.path, id: ws.id, lastAccesed: ws.lastAccesed })));
    });
}
