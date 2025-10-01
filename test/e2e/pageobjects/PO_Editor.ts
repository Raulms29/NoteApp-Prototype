import { $ } from '@wdio/globals';
import POApp from './PO_App';

export default class POEditor extends POApp {

    static async getEditor() {
        return $("div.tiptap.ProseMirror.prose[contenteditable='true']");
    }

    static async write(text: string, expectedElementAfterWrite = 'p', expectedTextAfterWrite = text) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(text);
        await expect(editor.$(`${expectedElementAfterWrite}=${expectedTextAfterWrite}`)).toBeExisting();
    }

    static async undo() {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(['Control', 'z']);
    }

    static async redo() {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(['Control', 'y']);
    }


}