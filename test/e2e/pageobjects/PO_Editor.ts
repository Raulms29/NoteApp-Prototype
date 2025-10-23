import { $ } from '@wdio/globals';
import POApp from './PO_App';

export default class POEditor extends POApp {

    static async getEditor() {
        return $("div.tiptap.ProseMirror.prose[contenteditable='true']");
    }

    static async clearEditorContents() {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(['Control', 'a']);
        await browser.keys(['Backspace']);
    }

    static async getBubbleMenu() {
        return $('.bubble-menu');
    }

    static async writeAndSelectAll(text: string) {
        await POEditor.write(text);
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(['Control', 'a']);
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
        await POEditor.#assertBold(text);
    }

    static async writeItalic(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`*${text}*`);
        await POEditor.#assertItalic(text);
    }

    static async writeStrike(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`~~${text}~~`);
        await POEditor.#assertStrike(text);
    }

    static async writeBlockquote(text: string) {
        const editor = await POEditor.getEditor();
        await editor.click();
        await browser.keys(`> ${text}`);
        await browser.keys(['Enter']);
        await POEditor.#assertElementText('blockquote', text);
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
        await POEditor.#assertCodeBlock(code);
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

    static async writeBoldBubble(text: string) {
        await POEditor.writeAndSelectAll(text);
        await POEditor.clickBubbleButton('Bold');
        await POEditor.#assertBold(text);
    }

    static async writeItalicBubble(text: string) {
        await POEditor.writeAndSelectAll(text);
        await POEditor.clickBubbleButton('Italic');
        await POEditor.#assertItalic(text);
    }

    static async writeUnderlineBubble(text: string) {
        await POEditor.writeAndSelectAll(text);
        await POEditor.clickBubbleButton('Underline');
        await POEditor.#assertUnderline(text);
    }

    static async writeStrikeBubble(text: string) {
        await POEditor.writeAndSelectAll(text);
        await POEditor.clickBubbleButton('Strike');
        await POEditor.#assertStrike(text);
    }

    static async writeCodeBlockBubble(code: string) {
        await POEditor.writeAndSelectAll(code);
        await POEditor.clickBubbleButton('Code Block');
        await POEditor.#assertCodeBlock(code);
    }

    static async clickBubbleButton(label: string) {
        // Find button by aria-label inside bubble menu
        const menu = await POEditor.getBubbleMenu();
        const btn = menu.$(`.bubble-button span[aria-label="${label}"]`);
        await btn.parentElement().click();
    }

    static async #assertElementText(selector: string, expected: string) {
        const editor = await POEditor.getEditor();
        const el = editor.$(selector);
        await expect(el).toBeExisting();
        await expect(await el.getText()).toBe(expected);
    }

    static async #assertBold(text: string) {
        await POEditor.#assertElementText('strong', text);
    }

    static async #assertItalic(text: string) {
        await POEditor.#assertElementText('em', text);
    }

    static async #assertUnderline(text: string) {
        await POEditor.#assertElementText('u', text);
    }

    static async #assertStrike(text: string) {
        await POEditor.#assertElementText('s', text);
    }

    static async #assertCodeBlock(text: string) {
        await POEditor.#assertElementText('pre code', text);
    }

    static async openAddLinkDialog() {
        const menu = await POEditor.getBubbleMenu();
        const linkBtn = menu.$('.bubble-button:has(span[aria-label="Link"])');
        await linkBtn.click();
    }

    static async setLink(url: string) {
        const dialog = $('.dropdown-container form');
        const input = dialog.$('input[type="url"]');
        await input.setValue(url);
        const setBtn = dialog.$('button[type="submit"]');
        await setBtn.click();
    }

    // Bubble menu: ElementDropdown actions
    static async openBubbleMenuElementDropdown() {
        const menu = await POEditor.getBubbleMenu();
        const dropdownBtn = menu.$('.bubble-button img[alt="Chevron Down"]');
        await dropdownBtn.parentElement().click();
    }

    static async clickBubbleMenuDropdownButtonByText(text: string) {
        await $(`//div[contains(@class,'dropdown-container')]//button[contains(@class,'dropdown-button')][normalize-space(text())='${text}']`).click();
    }

    static async selectBubbleMenuParagraph() {
        await POEditor.clickBubbleMenuDropdownButtonByText('Paragraph');
    }

    static async selectBubbleMenuHeading(level: number) {
        await POEditor.clickBubbleMenuDropdownButtonByText(`Heading ${level}`);
    }

    static async selectBubbleMenuBulletList() {
        await POEditor.clickBubbleMenuDropdownButtonByText('Bullet list');
    }

    static async selectBubbleMenuOrderedList() {
        await POEditor.clickBubbleMenuDropdownButtonByText('Ordered list');
    }

    static async selectBubbleMenuTodoList() {
        await POEditor.clickBubbleMenuDropdownButtonByText('Todo list');
    }
}