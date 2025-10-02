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

    static async writeBold(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`**${text}**`);
        await expect(editor.$('strong')).toBeExisting();
        await expect(editor.$('strong')).toHaveText(text);
    }

    static async writeItalic(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`*${text}*`);
        await expect(editor.$('em')).toBeExisting();
        await expect(editor.$('em')).toHaveText(text);
    }

    static async writeStrike(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`~~${text}~~`);
        await expect(editor.$('s')).toBeExisting();
        await expect(editor.$('s')).toHaveText(text);
    }

    static async writeBlockquote(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`> ${text}`);
        await browser.keys(['Enter']);
        await expect(editor.$('blockquote')).toBeExisting();
        await expect(editor.$('blockquote')).toHaveText(text);
    }

    static async writeBulletList(items: string[]) {
        const editor = await POEditor.getEditor();
        await editor.click();
        for (let i = 0; i < items.length; i++) {
            if (i === 0) {
                await browser.keys(`- ${items[i]}`);
            } else {
                await browser.keys(`${items[i]}`);
            }
            if (i < items.length - 1) {
                await browser.keys(['Enter']);
            }
        }
        const listItems = editor.$$('ul>li');
        await expect(listItems).toBeElementsArrayOfSize(items.length);
        for (let i = 0; i < items.length; i++) {
            await expect(listItems[i]).toHaveText(items[i]);
        }
    }

    static async writeOrderedList(items: string[]) {
        const editor = await POEditor.getEditor();
        await editor.click();
        for (let i = 0; i < items.length; i++) {
            if (i === 0) {
                await browser.keys(`1. ${items[i]}`);
            } else {
                await browser.keys(`${items[i]}`);
            }
            if (i < items.length - 1) {
                await browser.keys(['Enter']);
            }
        }
        const listItems = editor.$$('ol>li');
        await expect(listItems).toBeElementsArrayOfSize(items.length);
        for (let i = 0; i < items.length; i++) {
            await expect(listItems[i]).toHaveText(items[i]);
        }
    }

    static async writeCodeBlock(code: string, lang = 'js') {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys('```' + lang);
        await browser.keys(['Enter']);
        await browser.keys(code);
        const codeBlock = editor.$('pre code');
        await expect(codeBlock).toBeExisting();
        await expect(codeBlock).toHaveText(code);
    }

    static async writeTaskList(items: string[]) {
        const editor = await POEditor.getEditor();
        await editor.click();
        for (let i = 0; i < items.length; i++) {
            if (i === 0) {
                await browser.keys(`[] ${items[i]}`);
            } else {
                await browser.keys(`${items[i]}`);
            }
            if (i < items.length - 1) {
                await browser.keys(['Enter']);
            }
        }
        const checkboxes = editor.$$('input[type="checkbox"]');
        await expect(checkboxes).toBeElementsArrayOfSize(items.length);
    }

    static async writeLink(text: string, url: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`[${text}](${url})`);
        await browser.keys(['Enter']);
        const link = editor.$('a');
        await expect(link).toBeExisting();
        await expect(link).toHaveText(text);
        await expect(link).toHaveAttribute('href', url);
    }


}