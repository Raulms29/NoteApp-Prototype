import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceRepository } from '../../../src/business/repository/WorkspaceRepository';
import { Workspace } from '../../../src/business/domain/Workspace';
import * as fileUtils from '../../../src/utils/fileUtils';

// Mock the electron store API
const mockSetWorkspaces = vi.fn();
const mockGetWorkspaces = vi.fn();

beforeAll(() => {
    global.window = Object.create(window || {});
    window.workspaceAPI = {
        setWorkspaces: mockSetWorkspaces,
        getWorkspaces: mockGetWorkspaces,
        setWorkspaceRoot: vi.fn(),
    };
    vi.spyOn(fileUtils, 'joinPaths').mockImplementation(async (...args: string[]) => args.join('/'));
});

describe('WorkspaceRepository', () => {
    let repo: WorkspaceRepository;
    beforeEach(() => {
        repo = new WorkspaceRepository();
        mockSetWorkspaces.mockReset();
        mockGetWorkspaces.mockReset();
    });

    it('saves workspaces using the API', async () => {
        const workspaces = [new Workspace('WS1', '/path/1', 'abc12345',)];
        await repo.saveWorkspaces(workspaces);
        expect(mockSetWorkspaces).toHaveBeenCalledWith([
            { id: workspaces[0].id, name: workspaces[0].name, path: workspaces[0].path, lastAccessed: workspaces[0].lastAccessed, }
        ]);
    });

    it('gets workspaces using the API', async () => {
        mockGetWorkspaces.mockResolvedValue([
            { id: 'abc12345', name: 'WS1', path: '/path/1' }
        ]);
        const result = await repo.getWorkspaces();
        expect(result[0]).toBeInstanceOf(Workspace);
        expect(result[0].id).toBe('abc12345');
        expect(result[0].name).toBe('WS1');
        expect(result[0].path).toBe('/path/1');
    });

    it('creates workspace structure if not exists', async () => {
        const repo = new WorkspaceRepository();
        const workspace = new Workspace('WS2', '/path/2', 'def67890');

        // Mock file/folder utils
        const mockFolderExists = vi.spyOn(fileUtils, 'folderExists').mockImplementation(async () => false);
        const mockFileExists = vi.spyOn(fileUtils, 'fileExists').mockImplementation(async () => false);
        const mockCreateFolder = vi.spyOn(fileUtils, 'createFolder').mockImplementation(async () => { });
        const mockWriteFile = vi.spyOn(fileUtils, 'writeFile').mockImplementation(async () => { });

        await repo.createWorkspace(workspace);

        // Should check and create notes folder
        expect(mockFolderExists).toHaveBeenCalledWith('/path/2/.notes');
        expect(mockCreateFolder).toHaveBeenCalledWith('/path/2/.notes');
        // Should check and create notes.json
        expect(mockFileExists).toHaveBeenCalledWith('/path/2/.notes/notes.json');
        expect(mockWriteFile).toHaveBeenCalledWith('/path/2/.notes/notes.json', JSON.stringify([]));
        // Should check and create .files folder
        expect(mockFolderExists).toHaveBeenCalledWith('/path/2/.notes');
        expect(mockCreateFolder).toHaveBeenCalledWith('/path/2/.notes');
    });

    it('sets workspace root using the API', async () => {
        const testPath = '/test/root/path';
        const mockSetWorkspaceRoot = vi.spyOn(fileUtils, 'setWorkspaceRoot').mockImplementation(async () => { });
        await repo.setWorkspaceRoot(testPath);
        expect(mockSetWorkspaceRoot).toHaveBeenCalledWith(testPath);
    });
});
