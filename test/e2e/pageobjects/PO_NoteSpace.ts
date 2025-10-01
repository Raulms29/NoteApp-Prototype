import { $ } from '@wdio/globals';
import POApp from './PO_App';

export default class PONoteSpace extends POApp {

    static async createNote(numberRepeatedNewNotes: number = 0, noteName?: string) {
        const tempNoteName = `New Note${numberRepeatedNewNotes === 0 ? '' : ' ' + numberRepeatedNewNotes}`;
        await $('button[title="New Note"]').click();
        await expect($('.note-name-input')).toHaveValue(tempNoteName);
        this.checkNoteExists(tempNoteName);
        if (noteName) {
            console.log('Renaming note to', noteName);
            await this.renameNote(tempNoteName, noteName);
            return noteName;
        }
        return tempNoteName;
    }

    static async createNoteInsideNote(noteNameParent: string, numberRepeatedNewNotes: number = 0) {
        const noteName = `New Note${numberRepeatedNewNotes === 0 ? '' : ' ' + numberRepeatedNewNotes}`;
        const button = $(`//span[contains(@class, 'truncate') and text()='${noteNameParent}']/following-sibling::*[contains(@class, 'sidebar-action-btn')]`);
        await button.moveTo();
        await button.click();
        await $("//div[contains(@class, 'n-popover-shared') and contains(@class, 'n-dropdown')]//div[text()='New Note']").click();
        this.checkNoteExists(noteName);
        return noteName;
    }

    private static async checkNoteExists(noteName: string) {
        await expect($('.n-breadcrumb-item__link')).toHaveText(noteName);
        await expect($(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${noteName}']]`)).toBeExisting();
    }

    private static async checkNoteDoesNotExist(noteName: string) {
        await expect($(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${noteName}']]`)).not.toBeExisting();
    }

    static async selectNote(noteName: string) {
        const xPath = `//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${noteName}']]`;
        await expect($(xPath)).toBeExisting();
        await $(xPath).click();
    }

    static async renameNote(oldName: string, newName: string) {
        await this.selectNote(oldName);
        const noteNameInputSelector = `.note-name-input`;
        const noteNameInput = $(noteNameInputSelector);
        await expect(noteNameInput).toHaveValue(oldName);
        await this.setInputValueAndLoseFocus(noteNameInputSelector, newName);
        await expect($('.note-name-input')).toHaveValue(newName);
        this.checkNoteExists(newName);
    }

    static async deleteNote(noteName: string) {
        const button = $(`//span[contains(@class, 'truncate') and text()='${noteName}']/following-sibling::*[contains(@class, 'sidebar-action-btn')]`);
        await button.moveTo();
        await button.click();
        await $("//div[contains(@class, 'n-popover-shared') and contains(@class, 'n-dropdown')]//div[text()='Delete']").click();
        await this.checkNoteDoesNotExist(noteName);
    }

    static async moveNoteInsideAnotherNote(sourceNote: string, targetNote: string, parentLevel: number = 0) {
        // SonarQube gives an error here, but the code is correct, await needs to be used on this selectors
        // for the test to behave consistently. It's an issue with the type returned by the selectors.
        // sonarqube-ignore-start
        let sourceNode = await $(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${sourceNote}']]`);
        let targetNode = await $(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${targetNote}']]`);

        await sourceNode.dragAndDrop(targetNode);

        await targetNode.$(`.//span[@data-switcher='true' and contains(@class, 'n-tree-node-switcher')]`).click();

        // Reselect the elements to ensure the DOM has updated
        sourceNode = await $(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${sourceNote}']]`);
        targetNode = await $(`//div[contains(@class, 'n-tree-node-wrapper')][.//*[text()='${targetNote}']]`);

        await expect(targetNode).toBeExisting();
        await expect(sourceNode).toBeExisting();

        const indents = sourceNode.$$(`.//div[contains(@class, 'n-tree-node-indent')]`);
        await expect(indents).toBeElementsArrayOfSize(parentLevel + 1);
        // sonarqube-ignore-end
    }


    static async searchNote(expectedNumberResults: number, searchText: string) {
        await $('button[title="Search"]').click();
        await POApp.setInputValue(`input.n-input__input-el[placeholder="Search"]`, searchText);
        await expect($$(`//div[contains(@class, 'n-tree-node-wrapper')]`)).toBeElementsArrayOfSize(expectedNumberResults);
        await $('button[title="Search"]').click();
    }

    static async activateFocusMode() {
        await $('button.focus-mode-icon-btn[title="Enter Focus Mode"]').click();
        const splitpanes = $('.splitpanes.splitpanes--vertical.split-theme');
        const children = splitpanes.$$(':scope > *');
        await expect(children).toBeElementsArrayOfSize(1);
        const style = await children[0].getAttribute('style');
        expect(style).toContain('width: 100%');
        // It must contain a child with id editorPane
        await expect(children[0].$('#editorPane')).toBeExisting();
    }

    static async deactivateFocusMode() {
        await $('button.focus-mode-icon-btn[title="Exit Focus Mode"]').click();
        const splitpanes = $('.splitpanes.splitpanes--vertical.split-theme');
        const children = splitpanes.$$(':scope > *');
        // There must be three children because of the separator between the two panes
        await expect(children).toBeElementsArrayOfSize(3);
    }
}

