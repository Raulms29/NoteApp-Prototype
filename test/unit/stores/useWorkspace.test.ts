import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkspaceStore } from '../../../src/stores/useWorkspaceStore';

// Mock WorkspaceRepository and fileUtils
const getWorkspaces = vi.fn(async () => []);
const saveWorkspaces = vi.fn(async () => { });
const createWorkspace = vi.fn(async () => { });
const setWorkspaceRoot = vi.fn(async () => { });
vi.mock('../../../src/persistence/repository/WorkspaceRepository', () => {
    return {
        WorkspaceRepository: vi.fn().mockImplementation(() => ({
            getWorkspaces: getWorkspaces,
            saveWorkspaces: saveWorkspaces,
            createWorkspace: createWorkspace,
            setWorkspaceRoot: setWorkspaceRoot
        })),
    };
});

describe('GIVEN the useWorkspaceStore store', () => {
    let store: ReturnType<typeof useWorkspaceStore>;
    let wsName: string;
    let wsPath: string;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        store = useWorkspaceStore();
        store.init();
        wsName = 'Test';
        wsPath = '/test/path';
    });

    // • store initialization
    describe('WHEN the store is initialized', () => {
        it('THEN workspaces should be empty and currentWorkspace null', () => {
            expect(store.workspaces).toEqual([]);
            expect(store.currentWorkspace).toBeNull();
            expect(getWorkspaces).toHaveBeenCalled();
        });
    });

    // • addWorkspace
    describe('WHEN addWorkspace is called', () => {
        it('THEN the workspace should be added', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            expect(store.workspaces).toContainEqual(ws);
            expect(createWorkspace).toHaveBeenCalledWith(ws);
        });
    });

    // • removeWorkspace
    describe('WHEN removeWorkspace is called', () => {
        it('THEN the workspace should be removed', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            store.removeWorkspace(ws.id);
            expect(store.workspaces.length).not.toContainEqual(ws);
            expect(saveWorkspaces).toHaveBeenCalled();
        });

        it('THEN currentWorkspace should be null if removed', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            store.selectWorkspace(ws.id);
            store.removeWorkspace(ws.id);
            expect(store.currentWorkspace).toBeNull();
            expect(saveWorkspaces).toHaveBeenCalled();
        });
    });

    // • selectWorkspace
    describe('WHEN selectWorkspace is called', () => {
        it('THEN currentWorkspace should be set', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            store.selectWorkspace(ws.id);
            expect(store.currentWorkspace).toEqual(ws);
        });
        it('THEN it should throw when it does not exist', async () => {
            await store.addWorkspace(wsName, wsPath);
            const id = 'NonExistentID';
            await expect(store.selectWorkspace(id)).rejects.toThrow(`Workspace with id ${id} not found`);
        });
    });

    // • renameWorkspace
    describe('WHEN renameWorkspace is called', () => {
        it('THEN the workspace name should be updated', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            store.renameWorkspace(ws.id, 'Renamed');
            expect(store.workspaces[0].name).toBe('Renamed');
            expect(saveWorkspaces).toHaveBeenCalled();
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
            await store.addWorkspace(wsName, wsPath);
            expect(() => store.validateWorkspace('Another', wsPath)).toThrow();
        });
        it('THEN it should not throw for valid workspace', () => {
            expect(() => store.validateWorkspace('Valid', '/unique/path')).not.toThrow();
        });
    });

    // • getLastWorkspaceAccesed
    describe('WHEN getLastWorkspaceAccesed is called', () => {
        let ws2Name: string;
        let ws2Path: string;
        let ws3Name: string;
        let ws3Path: string;

        beforeEach(() => {
            wsName = 'Test';
            wsPath = '/test/path';
            ws2Name = 'WS2';
            ws2Path = '/path/2';
            ws3Name = 'WS3';
            ws3Path = '/path/3';
        });

        it('THEN it should return null if there are no workspaces', () => {
            expect(store.getLastWorkspaceAccesed()).toBeNull();
        });

        it('THEN it should return null if no workspace has lastAccessed', async () => {
            await store.addWorkspace(wsName, wsPath);
            await store.addWorkspace(ws2Name, ws2Path);
            expect(store.getLastWorkspaceAccesed()).toBeNull();
        });

        it('THEN it should return the workspace with the latest lastAccessed date', async () => {

            const ws = await store.addWorkspace(wsName, wsPath);
            const ws2 = await store.addWorkspace(ws2Name, ws2Path);

            ws.lastAccessed = new Date('2025-01-01T10:00:00Z');
            ws2.lastAccessed = new Date('2025-01-02T10:00:00Z');

            expect(store.getLastWorkspaceAccesed()).toEqual(store.workspaces[1]);
        });

        it('THEN it should handle multiple workspaces with different lastAccessed dates', async () => {
            const ws = await store.addWorkspace(wsName, wsPath);
            const ws2 = await store.addWorkspace(ws2Name, ws2Path);
            const ws3 = await store.addWorkspace(ws3Name, ws3Path);

            ws.lastAccessed = new Date('2025-01-01T10:00:00Z');
            ws2.lastAccessed = new Date('2025-01-03T10:00:00Z');
            ws3.lastAccessed = new Date('2025-01-02T10:00:00Z');

            expect(store.getLastWorkspaceAccesed()).toEqual(store.workspaces[1]);
        });
    });

    // • persistWorkspaces
    describe('WHEN persistWorkspaces is called', () => {
        it('THEN it should work properly', async () => {
            await store.addWorkspace(wsName, wsPath);
            await store.persistWorkspaces();
            expect(saveWorkspaces).toHaveBeenCalled();
        });
    });
});
