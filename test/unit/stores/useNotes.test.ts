import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotesStore } from '../../../src/stores/useNotesStore';
import { Workspace } from '../../../src/services/domain/Workspace';
import { Note } from '../../../src/services/domain/Note';
import * as fileUtils from '../../../src/utils/fileUtils';

const mockWriteNoteContent = vi.fn();
const mockLoadNoteTree = vi.fn(async () => [testNote]);
const mockReadNoteContent = vi.fn();
const mockSaveNoteTree = vi.fn();
const mockDeleteNoteFiles = vi.fn();
const mockRenameNoteFile = vi.fn();
const mockSaveImage = vi.fn();
const mockSavePDF = vi.fn();

vi.mock('../../../src/services/NoteRepository', () => ({
    NoteRepository: vi.fn().mockImplementation(() => ({
        writeNoteContent: mockWriteNoteContent,
        loadNoteTree: mockLoadNoteTree,
        readNoteContent: mockReadNoteContent,
        saveNoteTree: mockSaveNoteTree,
        deleteNoteFiles: mockDeleteNoteFiles,
        renameNoteFile: mockRenameNoteFile,
        saveImage: mockSaveImage,
        savePDF: mockSavePDF,
    })),
}));

vi.mock('../../../src/utils/fileUtils');
beforeAll(() => {
    vi.spyOn(fileUtils, 'joinPaths').mockImplementation(async (...args) => args.join('/'));
});

const noteID = '12345678';
const testNoteName = 'Note1';
let testNote: Note;

describe('GIVEN the useNotesStore store', () => {
    let store: ReturnType<typeof useNotesStore>;
    let workspace: Workspace;

    beforeEach(async () => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        store = useNotesStore();
        workspace = new Workspace('Test Workspace', '/test/path');
        testNote = new Note(testNoteName, [], noteID);
        await store.init(workspace);
    });

    // • init (reset)
    it('THEN it should reset', async () => {
        store.selectNote(testNote);
        await store.createNote('AnotherNote');
        store.reset();
        expect(store.noteTree).toEqual([]);
        expect(store.currentNote).toBeNull();
        await expect(store.createNote('ShouldFail')).rejects.toThrow();
    });

    // • loadTree
    describe('WHEN loadTree is called', () => {
        it('THEN it should set notes.value to the result of repo.loadNoteTree', async () => {
            const notes = [testNote];
            await store.loadTree();
            expect(store.noteTree).toEqual(notes);
        });
    });

    // • selectNote
    describe('WHEN selectNote is called', () => {
        it('THEN it should set currentNote to the given note', () => {
            store.selectNote(testNote);
            expect(store.currentNote).toEqual(testNote);
        });
        it('THEN it should set currentNote to null if note does not exist', () => {
            const nonExistentNote = new Note('NonExistent', [], '99999999');
            store.selectNote(nonExistentNote);
            expect(store.currentNote).toBeNull();
        });
    });

    // • saveNoteContent
    describe('WHEN saveNoteContent is called', () => {
        const html = '<p>Test</p>';
        it('THEN it save correctly', async () => {
            store.selectNote(testNote);
            await store.saveNoteContent(testNote, html);
            expect(mockWriteNoteContent).toHaveBeenCalledWith(testNote, html);
        });
        it('THEN it should throw if no note is selected', async () => {
            await expect(store.saveNoteContent(testNote, html)).rejects.toThrow('No note selected to save content for.');
        });
    });

    // • loadCurrentNoteContent
    describe('WHEN loadCurrentNoteContent is called', () => {
        it('THEN it should return the content for the current note', async () => {
            store.selectNote(testNote);
            mockReadNoteContent.mockResolvedValueOnce('note content');
            const content = await store.loadCurrentNoteContent();
            expect(mockReadNoteContent).toHaveBeenCalledWith(testNote);
            expect(content).toBe('note content');
        });
        it('THEN it should throw if no note is selected', async () => {
            await expect(store.loadCurrentNoteContent()).rejects.toThrow('No note selected to load.');
        });
    });

    // • loadNoteContent
    describe('WHEN loadNoteContent is called', () => {
        it('THEN it should return the note content for a valid note', async () => {
            mockReadNoteContent.mockResolvedValueOnce('note content');
            const content = await store.loadNoteContent(testNote);
            expect(mockReadNoteContent).toHaveBeenCalledWith(testNote);
            expect(content).toBe('note content');
        });
        it('THEN it should throw if no note is provided', async () => {
            await expect(store.loadNoteContent(null)).rejects.toThrow('No note provided to load content for.');
        });
    });

    // • createNote
    describe('WHEN createNote is called', () => {
        it('THEN it should create a note', async () => {
            const note = await store.createNote('RootNote');
            expect(store.noteTree.some(n => n.name === 'RootNote')).toBe(true);
            expect(mockWriteNoteContent).toHaveBeenCalledWith(note, '');
        });
        it('THEN it should create a child note under the given parent', async () => {
            const parent = await store.createNote('Parent');
            const child = await store.createNote('Child', parent);
            expect(parent.children).toContain(child);
            expect(child.name).toBe('Child');
            expect(mockWriteNoteContent).toHaveBeenCalledWith(child, '');
        });
        it('THEN it should create a note with a unique name if duplicate exists', async () => {
            await store.createNote('DupNote');
            const note2 = await store.createNote('DupNote');
            expect(note2.name).toBe('DupNote 1');
            expect(mockWriteNoteContent).toHaveBeenCalledWith(note2, '');
        });
    });

    // • renameNote
    describe('WHEN renameNote is called', () => {
        it('THEN it should rename the note and call repo.renameNoteFile and updateNoteTree', async () => {
            const note = await store.createNote('OldName');
            await store.renameNote(note, 'NewName');
            expect(note.name).toBe('NewName');
            expect(mockRenameNoteFile).toHaveBeenCalledWith('OldName', 'NewName');
            expect(mockSaveNoteTree).toHaveBeenCalled();
        });
        it('THEN it should throw if a note with the new name already exists', async () => {
            const note = await store.createNote('TempNote');
            await store.createNote('NewName');
            await expect(store.renameNote(note, 'NewName')).rejects.toThrow('A note with the name "NewName" already exists.');
        });
    });

    // • deleteNote
    describe('WHEN deleteNote is called', () => {
        it('THEN it should remove a root note, call repo.deleteNoteFiles, and update the tree', async () => {
            store.selectNote(testNote);
            mockDeleteNoteFiles.mockClear();
            store.deleteNote(testNote);
            expect(store.noteTree).not.toContain(testNote);
            expect(mockDeleteNoteFiles).toHaveBeenCalledWith([testNote]);
            expect(mockSaveNoteTree).toHaveBeenCalled();
            expect(store.currentNote).toBeNull();
        });

        it('THEN it should remove a child note and call repo.deleteNoteFiles', async () => {
            const child = await store.createNote('Child', testNote);
            expect(testNote.children).toContain(child);
            store.deleteNote(child);
            expect(testNote.children).not.toContain(child);
            expect(mockDeleteNoteFiles).toHaveBeenCalledWith([child]);
            expect(mockSaveNoteTree).toHaveBeenCalled();
        });

        it('THEN it should throw if the note is not in the tree', () => {
            const id = 'nointree';
            const note = new Note('NotInTree', [], id);
            expect(() => store.deleteNote(note)).toThrow(`Note with ID ${id} not found in the note tree.`);
        });

        it('THEN it should throw if no note is provided', () => {
            expect(() => store.deleteNote(null)).toThrow('No note provided to delete.');
        });
    });

    // • moveNoteTo, moveNoteBefore, moveNoteAfter
    describe('WHEN moving notes', () => {
        function findNoteIndexById(arr: Note[], id: string) {
            return arr.findIndex(n => n.id == id);
        }

        it('THEN it should throw if trying to move a note that does not exist', () => {
            const nonExistentNote = new Note('NotInTree', [], 'notinid1');
            const target = new Note('Target', [], 'target01');
            expect(() => store.moveNoteTo(nonExistentNote, target)).toThrow('Note with ID notinid1 not found in the note tree.');
        });
        it('THEN it should throw if trying to move a null note', () => {
            const target = new Note('Target', [], 'target01');
            expect(() => store.moveNoteTo(null, target)).toThrow('No note provided to move.');
        });

        describe('moveNoteTo', () => {
            it('THEN it should move a note as a child of testNote', async () => {
                const noteToMove = await store.createNote('ToMove');
                store.moveNoteTo(noteToMove, testNote);
                expect(testNote.children).toContain(noteToMove);
                expect(store.noteTree).not.toContain(noteToMove);
                expect(store.getNoteByName(noteToMove.name)).toEqual(noteToMove);
            });
            it('THEN it should move a note as a child of a subnote', async () => {
                const subParent = await store.createNote('SubParent', testNote);
                const noteToMove = await store.createNote('ToMove');
                store.moveNoteTo(noteToMove, subParent);
                expect(subParent.children).toContain(noteToMove);
                expect(store.noteTree).not.toContain(noteToMove);
            });
        });

        describe('moveNoteBefore', () => {
            it('THEN it should move a note before testNote in the root', async () => {
                const noteToMove = await store.createNote('ToMove');
                store.moveNoteBefore(noteToMove, testNote);
                const idxTest = findNoteIndexById(store.noteTree, testNote.id);
                const idxToMove = findNoteIndexById(store.noteTree, noteToMove.id);
                expect(idxToMove).toBe(idxTest - 1);
            });
            it('THEN it should move a note before a subnote', async () => {
                const subParent = await store.createNote('SubParent', testNote);
                const noteToMove = await store.createNote('ToMove');
                store.moveNoteBefore(noteToMove, subParent);
                const idxSubParent = findNoteIndexById(testNote.children, subParent.id);
                const idxToMove = findNoteIndexById(testNote.children, noteToMove.id);
                expect(idxToMove).toBe(idxSubParent - 1);
            });
        });

        describe('moveNoteAfter', () => {
            it('THEN it should move a note after testNote in the root', async () => {
                const noteToMove = await store.createNote('ToMove');
                store.moveNoteAfter(testNote, noteToMove);
                const idxTest = findNoteIndexById(store.noteTree, testNote.id);
                const idxToMove = findNoteIndexById(store.noteTree, noteToMove.id);
                expect(idxTest).toBe(idxToMove + 1);
            });
            it('THEN it should move a note after a subnote', async () => {
                const parent = await store.createNote('Parent');
                const subParent = await store.createNote('SubParent', parent);
                const noteToMove = await store.createNote('ToMove');
                expect(store.getNoteById(parent.id)).toStrictEqual(parent);
                store.moveNoteAfter(noteToMove, subParent);
                const idxSubParent = findNoteIndexById(parent.children, subParent.id);
                const idxToMove = findNoteIndexById(parent.children, noteToMove.id);
                expect(idxToMove).toBe(idxSubParent + 1);
            });
        });
    });

    // getNoteByName and getNoteById are used in other tests

    // • saveImage
    describe('WHEN saveImage is called', () => {
        it('THEN it should call repo.saveImage and return the correct path and filename', async () => {
            mockSaveImage.mockResolvedValueOnce(['some/path/image.png', 'image.png']);
            const [filePath, fileName] = await store.saveImage('source/path/image.png');
            expect(mockSaveImage).toHaveBeenCalledWith('source/path/image.png');
            expect(filePath).toBe('some/path/image.png');
            expect(fileName).toBe('image.png');
        });
    });

    // • savePDF
    describe('WHEN savePDF is called', () => {
        it('THEN it should call repo.savePDF and return the correct path and filename', async () => {
            mockSavePDF.mockResolvedValueOnce(['some/path/file.pdf', 'file.pdf']);
            const [filePath, fileName] = await store.savePDF('source/path/file.pdf');
            expect(mockSavePDF).toHaveBeenCalledWith('source/path/file.pdf');
            expect(filePath).toBe('some/path/file.pdf');
            expect(fileName).toBe('file.pdf');
        });
    });

    // • getNoteBreadcrumb
    describe('WHEN getNoteBreadcrumb is called', () => {
        it('THEN it should return the correct breadcrumb path', async () => {
            const parent = await store.createNote('Parent');
            const child = await store.createNote('Child', parent);
            const grandchild = await store.createNote('Grandchild', child);
            const path = store.getNoteBreadcrumb(grandchild);
            expect(path.map(n => n.name)).toEqual(['Parent', 'Child', 'Grandchild']);
        });
        it('THEN it should throw if note is not provided', () => {
            expect(() => store.getNoteBreadcrumb(null)).toThrow('No note provided to get breadcrumb for.');
        });
        it('THEN it should throw if note is not in the tree', () => {
            const fakeNote = new Note('Fake', []);
            expect(() => store.getNoteBreadcrumb(fakeNote)).toThrow('Note not found in the note tree.');
        });
    });

    // • getLastNoteAccesed
    describe('WHEN getLastNoteAccesed is called', () => {
        it('THEN it should return the most recently accessed note', async () => {
            const note1 = await store.createNote('Note1');
            const note2 = await store.createNote('Note2');
            note1.lastAccessed = new Date('2025-01-01T10:00:00Z');
            note2.lastAccessed = new Date('2025-01-02T10:00:00Z');
            const last = store.getLastNoteAccesed();
            expect(last).toEqual(note2);
        });
        it('THEN it should return null if no notes have lastAccessed', async () => {
            await store.createNote('Note1');
            await store.createNote('Note2');
            const last = store.getLastNoteAccesed();
            expect(last).toBeNull();
        });
        it('THEN it should return null if noteTree is empty', () => {
            store.reset();
            const last = store.getLastNoteAccesed();
            expect(last).toBeNull();
        });
    });
});
