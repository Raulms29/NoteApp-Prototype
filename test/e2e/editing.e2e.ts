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

    describe('Bubble Menu', () => {
        describe('Visibility', () => {
            it('Should show the bubble menu when text is selected', async () => {
                await POEditor.writeAndSelectAll('Bubble Test');
                expect(await POEditor.getBubbleMenu()).toBeExisting();
            });
        });

        describe('Formatting', () => {
            it('Should apply bold via bubble menu', async () => {
                await POEditor.writeBoldBubble('Bold Bubble');
            });

            it('Should apply italic via bubble menu', async () => {
                await POEditor.writeItalicBubble('Italic Bubble');
            });

            it('Should apply underline via bubble menu', async () => {
                await POEditor.writeUnderlineBubble('Underline Bubble');
            });

            it('Should apply strike via bubble menu', async () => {
                await POEditor.writeStrikeBubble('Strike Bubble');
            });
        });

        describe('Block Elements', () => {
            it('Should apply code block via bubble menu', async () => {
                await POEditor.writeCodeBlockBubble('Code Bubble');
            });
        });

        describe('Links', () => {
            it('Should open the Add Link dialog and set a valid link', async () => {
                await POEditor.writeAndSelectAll('Link Test');
                await POEditor.openAddLinkDialog();
                await POEditor.setLink('https://example.com');
                const link = (await POEditor.getEditor()).$('a');
                await expect(link).toBeExisting();
                await expect(await link.getAttribute('href')).toBe('https://example.com');
            });
        });

        describe('Dropdown', () => {
            it('Should change to paragraph type', async () => {
                await POEditor.writeAndSelectAll('This is a paragraph.');
                await POEditor.openBubbleMenuElementDropdown();
                await POEditor.selectBubbleMenuParagraph();
                const p = (await POEditor.getEditor()).$('p');
                await expect(p).toBeExisting();
                await expect(await p.getText()).toBe('This is a paragraph.');
            });

            it('Should change to heading levels 1-4', async () => {
                for (let level = 1; level <= 4; level++) {
                    await POEditor.writeAndSelectAll(`This is a heading level ${level}.`);
                    await POEditor.openBubbleMenuElementDropdown();
                    await POEditor.selectBubbleMenuHeading(level);
                    const h = (await POEditor.getEditor()).$(`h${level}`);
                    await expect(h).toBeExisting();
                    await expect(await h.getText()).toBe(`This is a heading level ${level}.`);
                    // Clear editor text for next iteration
                    await POEditor.clearEditorContents();
                }
            });
            it('Should change to bullet list', async () => {
                await POEditor.writeAndSelectAll('This is a bullet list.');
                await POEditor.openBubbleMenuElementDropdown();
                await POEditor.selectBubbleMenuBulletList();
                const ul = (await POEditor.getEditor()).$('ul');
                await expect(ul).toBeExisting();
            });
            it('Should change to ordered list', async () => {
                await POEditor.writeAndSelectAll('This is an ordered list.');
                await POEditor.openBubbleMenuElementDropdown();
                await POEditor.selectBubbleMenuOrderedList();
                const ol = (await POEditor.getEditor()).$('ol');
                await expect(ol).toBeExisting();
            });
            it('Should change to todo list', async () => {
                await POEditor.writeAndSelectAll('This is a todo list.');
                await POEditor.openBubbleMenuElementDropdown();
                await POEditor.selectBubbleMenuTodoList();
                const checkbox = (await POEditor.getEditor()).$('input[type="checkbox"]');
                await expect(checkbox).toBeExisting();
            });
        });
    });
});