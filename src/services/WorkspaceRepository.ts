import { Workspace, WorkspaceI } from "./domain/Workspace";
import * as fileUtils from '../utils/fileUtils';

export class WorkspaceRepository {

    async saveWorkspaces(workspaces: WorkspaceI[]): Promise<void> {
        await window.workspaceAPI.setWorkspaces(
            workspaces.map(ws => ({
                id: ws.id,
                name: ws.name,
                path: ws.path
            }))
        );
    }

    async getWorkspaces(): Promise<Workspace[]> {
        const workspacesRaw = await window.workspaceAPI.getWorkspaces();
        console.log('Retrieved workspaces:', workspacesRaw);
        return workspacesRaw.map((ws: WorkspaceI) => new Workspace(ws.name, ws.path, ws.id));
    }

    async createWorkspace(workspace: Workspace) {
        const notesFolder = await workspace.notesStructurePath();
        const structureFile = await workspace.notesStructureFilePath();
        const filesFolder = workspace.filesPath();

        // Only create the folders and file if they do not exist
        if (!await fileUtils.folderExists(notesFolder)) {
            await fileUtils.createFolder(notesFolder);
        }
        if (!await fileUtils.fileExists(structureFile)) {
            await fileUtils.writeFile(structureFile, JSON.stringify([]));
        }
        if (!await fileUtils.folderExists(filesFolder)) {
            await fileUtils.createFolder(filesFolder);
        }
    }
}