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


    describe('Basic Editor Actions', () => {
        it('Should properly write a heading on a Note', async () => {
            await POEditor.write('# This is a test note.\n', 'h1', 'This is a test note.');
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

    describe('Formatting', () => {
        it('Should apply bold using markdown', async () => {
            await POEditor.writeBold('Bold Test');
        });

        it('Should apply italic using markdown', async () => {
            await POEditor.writeItalic('Italic Test');
        });

        // TODO must be done viua BubbleMenu
        // it('Should apply underline using bubble menu button', async () => {
        //     await POEditor.writeUnderline('Underline Test');
        // });

        it('Should apply strike using bubble menu button', async () => {
            await POEditor.writeStrike('Strike Test');
        });
    });

    describe('Block Elements', () => {
        it('Should create blockquote using markdown', async () => {
            await POEditor.writeBlockquote('A quoted line');
        });

        it('Should create bullet list using markdown', async () => {
            await POEditor.writeBulletList(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
        });

        it('Should create ordered list using markdown', async () => {
            await POEditor.writeOrderedList(['First', 'Second', 'Third', 'Fourth']);
        });

        it('Should create code block using markdown', async () => {
            await POEditor.writeCodeBlock('console.log("hi");', 'js');
        });

        it('Should create task list using markdown', async () => {
            await POEditor.writeTaskList(['Task A', 'Task B']);
        });
    });

    describe('Links', () => {
        it('Should create links using markdown', async () => {
            await POEditor.writeLink('My Link', 'https://example.com');
        });
    });
});