import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkspaceStore } from '../../../src/stores/useWorkspaceStore';
import { Workspace } from '../../../src/services/domain/Workspace';

// Mock WorkspaceRepository and fileUtils
const getWorkspaces = vi.fn(async () => []);
const saveWorkspaces = vi.fn(async () => { });
const createWorkspace = vi.fn(async () => { });
vi.mock('../../../src/services/WorkspaceRepository', () => {
    return {
        WorkspaceRepository: vi.fn().mockImplementation(() => ({
            getWorkspaces: getWorkspaces,
            saveWorkspaces: saveWorkspaces,
            createWorkspace: createWorkspace,
        })),
    };
});

vi.mock('../../../src/utils/fileUtils', () => ({
    setWorkspaceRoot: vi.fn(),
}));
vi.mock('../../../src/stores/useNotesStore', () => ({
    useNotesStore: vi.fn(() => ({ init: vi.fn() })),
}));

describe('GIVEN the useWorkspaceStore store', () => {
    const workspaceID = 'abcd1234';
    let store: ReturnType<typeof useWorkspaceStore>;
    let ws: Workspace;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        store = useWorkspaceStore();
        store.init();
        ws = new Workspace('Test', '/test/path', workspaceID);
    });

    // • store initialization
    describe('WHEN the store is initialized', () => {
        it('THEN workspaces should be empty and currentWorkspace null', () => {
            expect(store.workspaces).toEqual([]);
            expect(store.currentWorkspace).toBeNull();
        });
    });

    // • addWorkspace
    describe('WHEN addWorkspace is called', () => {
        it('THEN the workspace should be added', async () => {
            await store.addWorkspace(ws);
            expect(store.workspaces).toContainEqual(ws);
        });
    });

    // • removeWorkspace
    describe('WHEN removeWorkspace is called', () => {
        it('THEN the workspace should be removed', async () => {
            await store.addWorkspace(ws);
            store.removeWorkspace(workspaceID);
            expect(store.workspaces.length).not.toContainEqual(ws);
        });

        it('THEN currentWorkspace should be null if removed', async () => {
            await store.addWorkspace(ws);
            store.selectWorkspace(workspaceID);
            store.removeWorkspace(workspaceID);
            expect(store.currentWorkspace).toBeNull();
        });
    });

    // • selectWorkspace
    describe('WHEN selectWorkspace is called', () => {
        it('THEN currentWorkspace should be set', async () => {
            await store.addWorkspace(ws);
            store.selectWorkspace(workspaceID);
            expect(store.currentWorkspace).toEqual(ws);
        });
        it('THEN it should throw when it does not exist', async () => {
            await store.addWorkspace(ws);
            const id = 'NonExistentID';
            await expect(store.selectWorkspace(id)).rejects.toThrow(`Workspace with id ${id} not found`);
        });
    });

    // • renameWorkspace
    describe('WHEN renameWorkspace is called', () => {
        it('THEN the workspace name should be updated', async () => {
            await store.addWorkspace(ws);
            store.renameWorkspace(workspaceID, 'Renamed');
            expect(store.workspaces[0].name).toBe('Renamed');
        });
    });

    // • validateWorkspace
    describe('WHEN validateWorkspace is called', () => {
        it('THEN it should throw for invalid name', () => {
            expect(() => store.validateWorkspace('', '/some/path')).toThrow();
            expect(() => store.validateWorkspace('a'.repeat(31), '/some/path')).toThrow();
        });
        it('THEN it should throw for empty path', () => {
            expect(() => store.validateWorkspace('Valid', '')).toThrow();
        });
        it('THEN it should throw for duplicate path', async () => {
            await store.addWorkspace(ws);
            expect(() => store.validateWorkspace('Another', '/test/path')).toThrow();
        });
        it('THEN it should not throw for valid workspace', () => {
            expect(() => store.validateWorkspace('Valid', '/unique/path')).not.toThrow();
        });
    });

    // • getCurrentFilesPath
    describe('WHEN getCurrentFilesPath is called', () => {
        it('THEN it should return the .files path for the current workspace', async () => {
            await store.addWorkspace(ws);
            store.selectWorkspace(workspaceID);
            expect(store.getCurrentFilesPath()).toBe('/test/path/.files');
        });
        it('THEN it should return null if no workspace is selected', () => {
            expect(store.getCurrentFilesPath()).toBeNull();
        });
    });

    // • getLastWorkspaceAccesed
    describe('WHEN getLastWorkspaceAccesed is called', () => {
        let ws2: Workspace;
        let ws3: Workspace;

        beforeEach(() => {
            ws2 = new Workspace('WS2', '/path/2');
            ws3 = new Workspace('WS3', '/path/3');
        });

        it('THEN it should return null if there are no workspaces', () => {
            expect(store.getLastWorkspaceAccesed()).toBeNull();
        });

        it('THEN it should return null if no workspace has lastAccessed', async () => {
            await store.addWorkspace(ws);
            await store.addWorkspace(ws2);
            expect(store.getLastWorkspaceAccesed()).toBeNull();
        });

        it('THEN it should return the workspace with the latest lastAccessed date', async () => {
            ws.lastAccessed = new Date('2025-01-01T10:00:00Z');
            ws2.lastAccessed = new Date('2025-01-02T10:00:00Z');
            await store.addWorkspace(ws);
            await store.addWorkspace(ws2);
            expect(store.getLastWorkspaceAccesed()).toEqual(ws2);
        });

        it('THEN it should handle multiple workspaces with different lastAccessed dates', async () => {
            ws.lastAccessed = new Date('2025-01-01T10:00:00Z');
            ws2.lastAccessed = new Date('2025-01-03T10:00:00Z');
            ws3.lastAccessed = new Date('2025-01-02T10:00:00Z');
            await store.addWorkspace(ws);
            await store.addWorkspace(ws2);
            await store.addWorkspace(ws3);
            expect(store.getLastWorkspaceAccesed()).toEqual(ws2);
        });
    });

    // • persistWorkspaces
    describe('WHEN persistWorkspaces is called', () => {
        it('THEN it should work properly', async () => {
            await store.addWorkspace(ws);
            await store.persistWorkspaces();
        });
    });
});
