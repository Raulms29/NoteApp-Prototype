import { ipcMain } from 'electron';
import Store from 'electron-store';
import { Workspace } from '../../services/domain/Workspace';

type WorkspaceSchema = {
    workspaces: Workspace[];
};

const workspaceStore = new Store<WorkspaceSchema>({
    name: 'workspaces',
    defaults: { workspaces: [] },
});

export function registerWorkspaceHandlers() {

    ipcMain.handle('get-workspaces', () => {
        return workspaceStore.get('workspaces', []);
    });

    ipcMain.handle('set-workspaces', (_event, workspaces) => {
        workspaceStore.set('workspaces', workspaces);
        return true;
    });
}
