import { $ } from '@wdio/globals';
import POApp from './PO_App';

export default class POSettings extends POApp {


    static async openSettings() {
        await $('button[title="Settings"]').click();
        await expect($('.generic-dialog-title')).toHaveText('Settings');
    }

    static async closeSettings() {
        await $(`//button[contains(@class, 'generic-btn') and contains(@class, 'primary') and text()='OK']`).click();
        await expect($('.generic-dialog-title')).not.toBeExisting();
    }

    static async selectSubnotesDefault() {
        await $("//div[@class='n-radio__label' and text()='Default']").click();
    }

    static async selectSubnotesBigOnly() {
        await $("//div[@class='n-radio__label' and text()='Big Only']").click();
    }

    static async selectSubnotesSmallOnly() {
        await $("//div[@class='n-radio__label' and text()='Small Only']").click();
    }

    static async selectSubnotesNone() {
        await $("//div[@class='n-radio__label' and text()='None']").click();
    }
}