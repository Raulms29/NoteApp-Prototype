import { Workspace } from "../domain/Workspace";
import { WorkspaceRepository } from "../../persistence/repository/WorkspaceRepository";

export class WorkspaceService {


    private readonly repo: WorkspaceRepository;

    constructor() {
        this.repo = new WorkspaceRepository();
    }

    async getWorkspaces(): Promise<Workspace[]> {
        return await this.repo.getWorkspaces();
    }

    async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
        await this.repo.saveWorkspaces(workspaces);

    }

    async createWorkspace(name: string, location: string): Promise<Workspace> {
        const workspace = new Workspace(name, location);
        await this.repo.createWorkspace(workspace);
        return workspace;
    }

    async setWorkspaceRoot(path: string) {
        await this.repo.setWorkspaceRoot(path);
    }

    /**
     * Validates the workspace name and path before creation.
     * @param name - The name of the workspace.
     * @param path - The file system path of the workspace.
     */
    validateWorkspace(name: string, path: string, workspaces: Workspace[]): void {
        if (!name || name.trim() === '' || name.length > 30) {
            throw new Error('Please enter a valid workspace name. It should not exceed 30 characters.');
        }
        if (!path || path.trim() === '') {
            throw new Error('Workspace location cannot be empty');
        }
        if (workspaces.some(ws => ws.path === path)) {
            throw new Error('A workspace already exists in this location');
        }
    }
}