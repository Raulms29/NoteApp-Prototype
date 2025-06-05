import { $, browser, expect } from '@wdio/globals';

describe('Electron Testing', () => {
    it('should print application title', async () => {
        console.log('Hello', await browser.getTitle(), 'application!');

        // await expect($('h1')).toHaveText('💖 Hello World!');
        // await expect($('#test')).toBeExisting();
    });
});