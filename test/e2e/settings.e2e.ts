import POWorkspace from './pageobjects/PO_Workspace';
import PONoteSpace from './pageobjects/PO_NoteSpace';
import POSettings from './pageobjects/PO_Settings';
describe('Settings Testing', () => {


    beforeEach(async () => {
        await POWorkspace.createWorkspace('settings', 'Mock Workspace', 0);
        await POWorkspace.selectWorkspace('Mock Workspace');
    });

    afterEach(async () => {
        await browser.electron.restoreAllMocks();
        await browser.reloadSession();
    });


    it('Should properly open and close Settings', async () => {
        await POSettings.openSettings();
        await POSettings.closeSettings();
    });

    // Works consistently locally (tested on several machines), but gives problems when executed on the CI pipeline
    it.skip('should properly display subnotes when Default is active', async () => {
        // Open settings and select Default subnotes display
        await POSettings.openSettings();
        await POSettings.selectSubnotesDefault();
        await POSettings.closeSettings();

        // Create parent note and 5 child notes
        const parentNote = await PONoteSpace.createNote(0, 'Parent Note');
        await PONoteSpace.createNoteInsideNote(parentNote, 0);
        await PONoteSpace.createNoteInsideNote(parentNote, 1);
        await PONoteSpace.createNoteInsideNote(parentNote, 2);
        await PONoteSpace.createNoteInsideNote(parentNote, 3);
        await PONoteSpace.createNoteInsideNote(parentNote, 4);

        // Check that all notes exist and icons are correct
        await PONoteSpace.selectNote(parentNote);
        // Expect 5 big icons for the 5 child notes
        await expect($$('.note-child-big')).toBeElementsArrayOfSize(5);

        // Add one more child note, which should change the display
        await PONoteSpace.createNoteInsideNote(parentNote, 5);
        // Now, big icons should not be existing
        await expect($('.note-child-big')).not.toBeExisting();

        // Expect 6 small icons for all child notes
        await expect($$('.note-child-small')).toBeElementsArrayOfSize(6);
    });

    // Works consistently locally (tested on several machines), but gives problems when executed on the CI pipeline
    it.skip('should properly display subnotes when Big Only is active', async () => {
        // Open settings and select Big Only subnotes display
        await POSettings.openSettings();
        await POSettings.selectSubnotesBigOnly();
        await POSettings.closeSettings();

        // Create parent note and 5 child notes
        const parentNote = await PONoteSpace.createNote(0, 'Parent Note');
        await PONoteSpace.createNoteInsideNote(parentNote, 0);
        await PONoteSpace.createNoteInsideNote(parentNote, 1);
        await PONoteSpace.createNoteInsideNote(parentNote, 2);

        // Check that all notes exist and icons are correct
        await PONoteSpace.selectNote(parentNote);
        // Expect 5 big icons, no small icons
        await expect($$('.note-child-big')).toBeElementsArrayOfSize(3);
        await expect($('.note-child-small')).not.toBeExisting();

        // Add one more child note, expect 6 big icons
        await PONoteSpace.createNoteInsideNote(parentNote, 3);
        await expect($$('.note-child-big')).toBeElementsArrayOfSize(4);
        await expect($('.note-child-small')).not.toBeExisting();
    });

    // Works consistently locally (tested on several machines), but gives problems when executed on the CI pipeline
    it.skip('should properly display subnotes when Small Only is active', async () => {
        // Open settings and select Small Only subnotes display
        await POSettings.openSettings();
        await POSettings.selectSubnotesSmallOnly();
        await POSettings.closeSettings();

        // Create parent note and 5 child notes
        const parentNote = await PONoteSpace.createNote(0, 'Parent Note');
        await PONoteSpace.createNoteInsideNote(parentNote, 0);
        await PONoteSpace.createNoteInsideNote(parentNote, 1);
        await PONoteSpace.createNoteInsideNote(parentNote, 2);
        await PONoteSpace.createNoteInsideNote(parentNote, 3);
        await PONoteSpace.createNoteInsideNote(parentNote, 4);

        // Check that all notes exist and icons are correct
        await PONoteSpace.selectNote(parentNote);
        // Expect no big icons, 5 small icons
        await expect($('.note-child-big')).not.toBeExisting();
        await expect($$('.note-child-small')).toBeElementsArrayOfSize(5);

        // Add one more child note, expect 6 small icons
        await PONoteSpace.createNoteInsideNote(parentNote, 5);
        await expect($('.note-child-big')).not.toBeExisting();
        await expect($$('.note-child-small')).toBeElementsArrayOfSize(6);
    });

    it('should properly display subnotes when None is active', async () => {
        // Open settings and select None subnotes display
        await POSettings.openSettings();
        await POSettings.selectSubnotesNone();
        await POSettings.closeSettings();

        // Create parent note and 5 child notes
        const parentNote = await PONoteSpace.createNote(0, 'Parent Note');
        await PONoteSpace.createNoteInsideNote(parentNote, 0);
        await PONoteSpace.createNoteInsideNote(parentNote, 1);
        await PONoteSpace.createNoteInsideNote(parentNote, 2);
        await PONoteSpace.createNoteInsideNote(parentNote, 3);
        await PONoteSpace.createNoteInsideNote(parentNote, 4);

        // Check that all notes exist and icons are correct
        await PONoteSpace.selectNote(parentNote);
        // Expect no big or small icons
        await expect($('.note-child-big')).not.toBeExisting();
        await expect($('.note-child-small')).not.toBeExisting();

        // Add one more child note, still expect no icons
        await PONoteSpace.createNoteInsideNote(parentNote, 5);
        await expect($('.note-child-big')).not.toBeExisting();
        await expect($('.note-child-small')).not.toBeExisting();
    });

    it("Should properly restore defaults", async () => {
        // Change settings from defaults
        await POSettings.openSettings();
        await POSettings.selectSubnotesBigOnly();
        await POSettings.selectShowFloatingMenu('false');
        await POSettings.selectRememberWorkspace();
        await POSettings.selectRememberLastNote();
        await POSettings.checkNonDefaultValues();
        await POSettings.closeSettings();

        // Restore defaults and verify
        await POSettings.openSettings();
        await POSettings.restoreDefaults();
        await POSettings.checkDefaultValues();
        await POSettings.closeSettings();

        // Confirm defaults persist
        await POSettings.openSettings();
        await POSettings.checkDefaultValues();
    });
});