import { browser } from '@wdio/globals';
import POWorkspace from './pageobjects/PO_Workspace';
describe('Workspace Testing', () => {

    afterEach(async () => {
        await browser.electron.restoreAllMocks();
        await browser.reloadSession();
    });

    it('Should properly create a Workspace', async () => {
        expect(await browser.getTitle()).toBe('Note App');

        await POWorkspace.createWorkspace('Mock Workspace', 0);
    });

    it('Should properly rename a Workspace', async () => {
        await POWorkspace.createWorkspace('Mock Workspace-2', 1);
        await POWorkspace.renameWorkspace('Mock Workspace-2', 'Renamed Workspace');
    });

    it('Should properly delete a Workspace', async () => {
        await POWorkspace.createWorkspace('Mock Workspace-3', 2);
        await POWorkspace.removeWorkspace('Mock Workspace-3');
    });

    it('Should properly select a Workspace', async () => {
        await POWorkspace.createWorkspace('Mock Workspace-4', 3);
        await POWorkspace.selectWorkspace('Mock Workspace-4');
    });

    it('Should give an error when creating a Workspace with a duplicate path', async () => {
        await POWorkspace.createWorkspace('Mock Workspace-5', 4);
        await POWorkspace.createWorkspaceExpectError('Mock Workspace-5', 4);
    });

    it('Should change workspace appropiately', async () => {
        await POWorkspace.createWorkspace('Mock Workspace-6', 5);
        await POWorkspace.createWorkspace('Mock Workspace-7', 6);
        await POWorkspace.selectWorkspace('Mock Workspace-6');
        await POWorkspace.switchWorkspace('Mock Workspace-7');
    });
});