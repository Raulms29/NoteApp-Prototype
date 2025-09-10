import { ElectronMock } from '@wdio/electron-types';
import { browser, $ } from '@wdio/globals';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

let mockedShowOpenDialog: ElectronMock;
let currentFilePath: string;
describe('Electron Testing', () => {

    beforeEach(async () => {
        await browser.electron.restoreAllMocks();

        // Mock the dialog API
        mockedShowOpenDialog = await browser.electron.mock('dialog', 'showOpenDialog');
    });

    it('Should properly create a Workspace', async () => {
        expect(await browser.getTitle()).toBe('Note App');

        createWorkspace('Mock Workspace', 0);
    });
});


async function createWorkspace(workspaceName = 'My New Workspace', number: number = 0) {
    currentFilePath = path.join(__dirname, 'resources', `mock-workspace-${number}`);

    await mockedShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [currentFilePath]
    });

    if (currentFilePath) {
        if (!fs.existsSync(currentFilePath)) {
            await fsPromises.mkdir(currentFilePath, { recursive: true });
        } else {
            // Empty the folder
            const files = await fsPromises.readdir(currentFilePath);
            for (const file of files) {
                await fsPromises.rm(path.join(currentFilePath, file), { recursive: true, force: true });
            }
        }
    }

    await $('#new-workspace-card').click();
    await expect($('h2')).toHaveText('Create new Workspace');
    await $('#workspace-name').setValue(workspaceName);

    await $('#browse-btn').click();

    expect(mockedShowOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockedShowOpenDialog).toHaveBeenCalledWith({
        properties: ['openDirectory']
    });

    await expect($('#workspace-location')).toHaveValue(
        currentFilePath
    );

    await $('#create-workspace-btn').click();

    await expect($(`.workspace-card`)).toBeExisting();
}