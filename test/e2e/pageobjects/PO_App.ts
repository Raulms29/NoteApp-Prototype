import { fail } from 'assert';

export default class POApp {

    static async setInputValueAndLoseFocus(inputElementSelector: string, newValue: string) {
        const noteNameInput = $(inputElementSelector);
        await noteNameInput.click();
        await this.setInputValue(inputElementSelector, newValue);
        await $('body').click();
    }

    static async setInputValue(inputElementSelector: string, newValue: string) {
        await browser.execute((selector, value) => {
            const input = document.querySelector(selector);
            if (input) {
                (input as HTMLInputElement).value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            else {
                fail(`Input element with selector ${selector} not found.`);
            }
        }, inputElementSelector, newValue);
    }
}