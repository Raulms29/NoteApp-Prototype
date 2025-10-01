import POWorkspace from './pageobjects/PO_Workspace';
import PONoteSpace from './pageobjects/PO_NoteSpace';
describe('Note Testing', () => {

    beforeEach(async () => {
        await POWorkspace.createWorkspace('note', 'Mock Workspace', 0);
        await POWorkspace.selectWorkspace('Mock Workspace');
    });

    afterEach(async () => {
        await browser.electron.restoreAllMocks();
        await browser.reloadSession();
    });

    it('Should properly create a Note', async () => {
        await PONoteSpace.createNote();
    });
    it('Should properly create a Note inside another Note', async () => {
        const createdNote = await PONoteSpace.createNote(0, "Parent Note");
        await PONoteSpace.createNoteInsideNote(createdNote, 0);
    });

    it('Should properly rename a Note', async () => {
        const noteName = await PONoteSpace.createNote();
        await PONoteSpace.renameNote(noteName, 'Renamed Note');
    });
    it('Should properly delete a Note', async () => {
        const noteName = await PONoteSpace.createNote();
        await PONoteSpace.deleteNote(noteName);
    });

    it('Should properly move a Note inside another Note', async () => {
        let level = 0;
        const parentNote = await PONoteSpace.createNote(0, "Parent Note");
        const childNote = await PONoteSpace.createNote(0, "Child Note");
        await PONoteSpace.moveNoteInsideAnotherNote(childNote, parentNote, level++);
    });

    // making several drag and drop operations may lead to inconsistent results
    // This test will work in most cases, but could fail for no apparent reason
    it.skip('Should properly move a Note inside another Note with several levels', async () => {
        let level = 0;
        const parentNote = await PONoteSpace.createNote(0, "Parent Note");
        const childNote = await PONoteSpace.createNote(0, "Child Note");
        const grandchildNote = await PONoteSpace.createNote(0, "Grandchild Note");
        const greatGrandchildNote = await PONoteSpace.createNote(0, "Great Grandchild Note");
        await PONoteSpace.moveNoteInsideAnotherNote(childNote, parentNote, level++);
        await PONoteSpace.moveNoteInsideAnotherNote(grandchildNote, childNote, level++);
        await PONoteSpace.moveNoteInsideAnotherNote(greatGrandchildNote, grandchildNote, level++);
    });

    it('Should properly search Notes', async () => {
        await PONoteSpace.createNote(0, "First Note");
        await PONoteSpace.createNote(0, "Second Note");
        await PONoteSpace.createNote(0, "Third Note");
        await PONoteSpace.createNote(0, "Fourth Note");
        await PONoteSpace.createNote(0, "Fifth Note");
        await PONoteSpace.searchNote(1, "First");
        await PONoteSpace.searchNote(2, "d");
        await PONoteSpace.searchNote(5, "Note");
        await PONoteSpace.searchNote(0, "NonExistingNote");
    });
});