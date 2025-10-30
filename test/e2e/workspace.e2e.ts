import { browser } from '@wdio/globals';
import POWorkspace from './pageobjects/PO_Workspace';
describe('Workspace Testing', () => {

    afterEach(async () => {
        await browser.electron.restoreAllMocks();
        await browser.reloadSession();
    });

    it('Should properly create a Workspace', async () => {
        expect(await browser.getTitle()).toBe('Note App');

        await POWorkspace.createWorkspace('workspace', 'Mock Workspace', 0);
    });

    it('Should properly rename a Workspace', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-2', 1);
        await POWorkspace.renameWorkspace('Mock Workspace-2', 'Renamed Workspace');
    });

    it('Should give an error when renaming a Workspace to an invalid name', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-2', 2);
        await POWorkspace.renameWorkspaceExpectError('Mock Workspace-2', '_VERY_LONG_WORKSPACE_NAME_');
    });

    it('Should properly delete a Workspace', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-3', 3);
        await POWorkspace.removeWorkspace('Mock Workspace-3');
    });

    it('Should properly select a Workspace', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-4', 4);
        await POWorkspace.selectWorkspace('Mock Workspace-4');
    });

    it('Should give an error when creating a Workspace with a duplicate path', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-5', 5);
        await POWorkspace.createWorkspaceExpectError('workspace', "A workspace already exists in this location", 'Mock Workspace-5', 5);
    });

    it('Should give an error when creating a Workspace with an invalid name', async () => {
        await POWorkspace.createWorkspaceExpectError('workspace', "Please enter a valid workspace name. It should not exceed 25 characters", '_VERY_LONG_WORKSPACE_NAME_', 8);
    });

    it('Should change workspace appropiately', async () => {
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-6', 6);
        await POWorkspace.createWorkspace('workspace', 'Mock Workspace-7', 7);
        await POWorkspace.selectWorkspace('Mock Workspace-6');
        await POWorkspace.switchWorkspace('Mock Workspace-7');
    });
});