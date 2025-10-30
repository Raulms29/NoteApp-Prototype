import path from "path";
import fs from 'fs';
import fsPromises from 'fs/promises';
import { ElectronMock } from '@wdio/electron-types';
import { browser, $, $$ } from '@wdio/globals';
import POApp from "./PO_App";

export default class POWorkspace extends POApp {
    private static mockedShowOpenDialog: ElectronMock;

    static async createWorkspace(testFileName: string, workspaceName = 'My New Workspace', folderNumber: number = 0) {
        const currentFilePath = await this.prepareWorkspaceCreation(folderNumber, testFileName);

        await $('#new-workspace-card').click();
        await expect($('h2')).toHaveText('Create new Workspace');
        await $('#workspace-name').setValue(workspaceName);

        await $('#browse-btn').click();

        expect(this.mockedShowOpenDialog).toHaveBeenCalledTimes(1);
        expect(this.mockedShowOpenDialog).toHaveBeenCalledWith({
            properties: ['openDirectory']
        });

        await expect($('#workspace-location')).toHaveValue(
            currentFilePath
        );

        await $('#create-workspace-btn').click();

        const card = await this.getWorkspaceCardByName(workspaceName);
        await expect(card).toBeExisting();
    }

    static async createWorkspaceExpectError(testFileName: string, message: string, workspaceName = 'My New Workspace', folderNumber: number = 0) {
        const currentFilePath = await this.prepareWorkspaceCreation(folderNumber, testFileName);
        await $('#new-workspace-card').click();
        await expect($('h2')).toHaveText('Create new Workspace');
        await $('#workspace-name').setValue(workspaceName);

        await $('#browse-btn').click();

        expect(this.mockedShowOpenDialog).toHaveBeenCalledTimes(1);
        expect(this.mockedShowOpenDialog).toHaveBeenCalledWith({
            properties: ['openDirectory']
        });

        await expect($('#workspace-location')).toHaveValue(
            currentFilePath
        );
        await $('#create-workspace-btn').click();
        await expect($('.generic-dialog')).toBeExisting();
        await expect($('.generic-dialog-text')).toHaveText(message);
    }


    static async renameWorkspace(oldName: string, newName: string) {
        await $(`//div[contains(@class, 'workspace-name') and text()='${oldName}']/../following-sibling::div[contains(@class, 'workspace-card-dots')]`).click();
        await $("//div[contains(@class, 'menu-item')]//span[text()='Rename']").click();
        const renameInput = $('#rename-workspace-input');
        await expect(renameInput).toBeExisting();
        await expect(renameInput).toHaveValue(oldName);
        await renameInput.setValue(newName);
        await $('.generic-btn.primary').click();
        await expect($(`.workspace-name=${newName}`)).toBeExisting();
    }

    static async renameWorkspaceExpectError(oldName: string, newName: string) {
        await $(`//div[contains(@class, 'workspace-name') and text()='${oldName}']/../following-sibling::div[contains(@class, 'workspace-card-dots')]`).click();
        await $("//div[contains(@class, 'menu-item')]//span[text()='Rename']").click();
        const renameInput = $('#rename-workspace-input');
        await expect(renameInput).toBeExisting();
        await expect(renameInput).toHaveValue(oldName);
        await renameInput.setValue(newName);
        await $('.generic-btn.primary').click();
        const err = $('.generic-error-message');
        await expect(err).toBeExisting();
        await expect(err).toHaveText('Please enter a valid workspace name. It should not exceed 25 characters');
    }

    static async removeWorkspace(workspaceName: string) {
        await $(`//div[contains(@class, 'workspace-name') and text()='${workspaceName}']/../following-sibling::div[contains(@class, 'workspace-card-dots')]`).click();
        await $("//div[contains(@class, 'menu-item')]//span[text()='Delete']").click();
        await $('.generic-btn.danger').click();
        await expect($(`.workspace-name=${workspaceName}`)).not.toBeExisting();
    }

    static async selectWorkspace(workspaceName: string) {
        const targetCard = await this.getWorkspaceCardByName(workspaceName);
        if (targetCard) {
            await targetCard.click();
        }
        await expect($('#workspaceTitle')).toBeExisting();
        await expect($('#workspaceTitle')).toHaveText(workspaceName);
    }

    private static async getWorkspaceCardByName(workspaceName: string) {
        const cards = $$('.workspace-card');
        for (const card of await cards.getElements()) {
            const wsName = await card.$('.workspace-name').getText();
            if (wsName === workspaceName) {
                return card;
            }
        }
        return undefined;
    }

    static async switchWorkspace(workspaceName: string) {
        await $('button[title="Change workspace"]').click();
        await this.selectWorkspace(workspaceName);
        await expect($('#workspaceTitle')).toBeExisting();
        await expect($('#workspaceTitle')).toHaveText(workspaceName);
    }

    private static async prepareWorkspaceCreation(number: number, testName: string) {
        this.mockedShowOpenDialog = await browser.electron.mock('dialog', 'showOpenDialog');

        const currentFilePath = path.join(__dirname, `../resources/${testName}`, `mock-workspace-${number}`);

        await this.mockedShowOpenDialog.mockResolvedValue({
            canceled: false,
            filePaths: [currentFilePath]
        });

        if (currentFilePath) {
            if (fs.existsSync(currentFilePath)) {
                // Empty the folder
                const files = await fsPromises.readdir(currentFilePath);
                for (const file of files) {
                    await fsPromises.rm(path.join(currentFilePath, file), { recursive: true, force: true });
                }
            } else {
                await fsPromises.mkdir(currentFilePath, { recursive: true });
            }
        }
        return currentFilePath;
    }

}