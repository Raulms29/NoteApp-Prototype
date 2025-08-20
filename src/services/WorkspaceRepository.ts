import { Workspace, WorkspaceI } from "./domain/Workspace";
import * as fileUtils from '../utils/fileUtils';

export class WorkspaceRepository {

    /**
     * Saves the list of workspaces using the workspace API.
     * @param workspaces - Array of workspace objects to save.
     */
    async saveWorkspaces(workspaces: WorkspaceI[]): Promise<void> {
        await window.workspaceAPI.setWorkspaces(
            // This is needed to avoid an error when sending non-serializable data through IPC
            workspaces.map(ws => ({
                id: ws.id,
                name: ws.name,
                path: ws.path,
                lastAccessed: ws.lastAccessed
            })));
    }

    /**
     * Retrieves the list of workspaces from the workspace API.
     * @returns A promise that resolves to an array of Workspace instances.
     */
    async getWorkspaces(): Promise<Workspace[]> {
        const workspacesRaw = await window.workspaceAPI.getWorkspaces();
        return workspacesRaw.map((ws: WorkspaceI) => new Workspace(ws.name, ws.path, ws.id, ws.lastAccessed));
    }

    /**
     * Creates the necessary folders and files for a new workspace if they do not exist.
     * @param workspace - The workspace instance to initialize.
     */
    async createWorkspace(workspace: Workspace) {
        const notesFolder = await workspace.notesStructurePath();
        const structureFile = await workspace.notesStructureFilePath();
        const filesFolder = await workspace.filesFolderPath();

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