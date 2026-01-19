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

    static async restoreDefaults() {
        await $(`//button[contains(@class, 'generic-btn') and contains(@class, 'secondary') and text()='Restore Defaults']`).click();
    }

    static getLatWorkspaceSwitch() {
        return $("//div[contains(@class, 'settings-option')][.//text()[contains(., 'Remember last workspace:')]]//div[@role='switch']");
    }
    
    static getRememberLastNoteSwitch() {
        return $("//div[contains(@class, 'settings-option')][.//text()[contains(., 'Remember last note:')]]//div[@role='switch']");
    }

    static getShowFloatingMenuSwitch() {
        return $("//div[contains(@class, 'settings-option')][.//text()[contains(., 'Show floating menu on empty line:')]]//div[@role='switch']");
    }

    static async selectRememberLastNote(expectedValue: string = 'true') {
        const switchDiv = this.getRememberLastNoteSwitch();
        await switchDiv.click();
        await expect(switchDiv).toHaveAttribute('aria-checked', expectedValue);
    }

    static async selectShowFloatingMenu(expectedValue: string = 'true') {
        const switchDiv = this.getShowFloatingMenuSwitch();
        await switchDiv.click();
        await expect(switchDiv).toHaveAttribute('aria-checked', expectedValue);
    }

    static async selectRememberWorkspace(expectedValue: string = 'true') {
        const switchDiv = this.getLatWorkspaceSwitch();
        await switchDiv.click();
        await expect(switchDiv).toHaveAttribute('aria-checked', expectedValue);
    }

    static async checkNonDefaultValues() {
        expect(!await this.checkDefaultValuesHelper()).toBe(true);
    }

    static async checkDefaultValues() {
        expect(await this.checkDefaultValuesHelper()).toBe(true);
    }

    static async getSubnotesDisplayRadioValue() {
        return await ($('.n-radio-group input[type="radio"]:checked')).getAttribute('value');
    }

    static async checkDefaultValuesHelper() {
        const lastNoteSwitch = this.getRememberLastNoteSwitch();
        const lastWorkspaceSwitch = this.getLatWorkspaceSwitch();
        const showFloatingSwitch = this.getShowFloatingMenuSwitch();
        const subnotesDefaultRadioValue = this.getSubnotesDisplayRadioValue();

        let isDefault = true;

        const lastNoteChecked = await lastNoteSwitch.getAttribute('aria-checked');
        if (lastNoteChecked !== 'false') {
            isDefault = false;
        }

        const lastWorkspaceChecked = await lastWorkspaceSwitch.getAttribute('aria-checked');
        if (lastWorkspaceChecked !== 'false') {
            isDefault = false;
        }

        const showFloatingChecked = await showFloatingSwitch.getAttribute('aria-checked');
        if (showFloatingChecked !== 'true') {
            isDefault = false;
        }

        if (await subnotesDefaultRadioValue !== 'DEFAULT') {
            isDefault = false;
        }

        return isDefault;
    }
}