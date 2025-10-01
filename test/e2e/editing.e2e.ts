import POWorkspace from './pageobjects/PO_Workspace';
import PONoteSpace from './pageobjects/PO_NoteSpace';
import POEditor from './pageobjects/PO_Editor';
describe('Editor Testing', () => {

    beforeEach(async () => {
        await POWorkspace.createWorkspace('editing', 'Mock Workspace', 0);
        await POWorkspace.selectWorkspace('Mock Workspace');
        await PONoteSpace.createNote();
    });

    afterEach(async () => {
        await browser.electron.restoreAllMocks();
        await browser.reloadSession();
    });

    // TODO Test all the editor features and extensions

    it('Should properly write on a Note', async () => {
        await POEditor.write('# This is a test note.', 'h1', "This is a test note.");
    });

    it('Should properly undo and redo writing on a Note', async () => {
        await POEditor.write('This is a test note.');
        await POEditor.undo();
        await expect((await POEditor.getEditor()).$(`p=This is a test note.`)).not.toBeExisting();
        await POEditor.redo();
        await expect((await POEditor.getEditor()).$(`p=This is a test note.`)).toBeExisting();
    });

    it('Should properly activate and deactivate focusMode', async () => {
        await PONoteSpace.activateFocusMode();
        await PONoteSpace.deactivateFocusMode();
    });
});