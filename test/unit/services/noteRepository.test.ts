import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Note } from '../../../src/business/domain/Note';
import { NoteRepository } from '../../../src/business/repository/NoteRepository';
import * as fileUtils from '../../../src/utils/fileUtils';

vi.mock('../../../src/utils/fileUtils');
vi.mock('fs');

// Global mocks for fileUtils methods used in tests
beforeAll(() => {
    vi.spyOn(fileUtils, 'getFilenameFromPath').mockImplementation(async (path) => path.split('/').pop());
    vi.spyOn(fileUtils, 'getExtensionFromPath').mockImplementation(async (path) => '.' + path.split('.').pop());
    vi.spyOn(fileUtils, 'joinPaths').mockImplementation(async (...args) => args.join('/'));
    vi.spyOn(fileUtils, 'copyFileToFolder').mockResolvedValue(undefined);
});

describe('GIVEN a NoteRepository', () => {
    let repository: NoteRepository;
    const mockNotesPath = 'mock/notes/path';
    const mockStructurePath = 'mock/structure/path.json';
    const mockFilesPath = 'mock/.files';

    beforeAll(() => {
        repository = new NoteRepository(mockNotesPath, mockStructurePath, mockFilesPath);
    });

    describe('WHEN saving a note tree', () => {
        setupFileOpTest({
            method: (...notes) => repository.saveNoteTree(notes[0] as Note[]),
            fileUtilsMocks: () => vi.spyOn(fileUtils, 'writeFile').mockResolvedValue(undefined),
            args: [[new Note('Test Note'), new Note('Test Note 2')]],
            expected: undefined,
            description: 'adds the note successfully'
        });
        setupFileOpTest({
            method: (...notes) => repository.saveNoteTree(notes[0] as Note[]),
            fileUtilsMocks: () => vi.spyOn(fileUtils, 'writeFile').mockRejectedValue(new Error('Write error')),
            args: [[]],
            throws: 'Write error',
            description: 'throws an error if saving fails'
        });
    });

    describe('WHEN loading a note tree', () => {
        const mockNote = new Note('Test Note', [new Note('Child Note')], '12345678');
        setupFileOpTest({
            method: () => repository.loadNoteTree(),
            fileUtilsMocks: () => {
                vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(true);
                vi.spyOn(fileUtils, 'readTextFile').mockResolvedValue(JSON.stringify([mockNote]));
            },
            args: [],
            expected: [mockNote],
            description: 'loads the note structure successfully'
        });
        setupFileOpTest({
            method: () => repository.loadNoteTree(),
            fileUtilsMocks: () => vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(false),
            args: [],
            throws: 'Note structure file does not exist.',
            description: 'throws an error if the structure file does not exist'
        });
        setupFileOpTest({
            method: () => repository.loadNoteTree(),
            fileUtilsMocks: () => {
                vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(true);
                vi.spyOn(fileUtils, 'readTextFile').mockResolvedValue('{"invalid": "data"}');
            },
            args: [],
            throws: 'Invalid note structure: Expected an array.',
            description: 'throws an error if reading the structure is not an array'
        });
    });

    describe('When renaming a note', () => {
        it('THEN renames the note successfully', async () => {
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValueOnce('mock/notes/path/Old Name').mockResolvedValueOnce('mock/notes/path/New Name');
            vi.spyOn(fileUtils, 'fileExists').mockResolvedValueOnce(true).mockResolvedValueOnce(false);
            vi.spyOn(fileUtils, 'renameFile').mockResolvedValue(undefined);

            await repository.renameNoteFile('Old Name', 'New Name');
            expect(fileUtils.getNotePath).toHaveBeenCalledWith(mockNotesPath, 'Old Name');
            expect(fileUtils.getNotePath).toHaveBeenCalledWith(mockNotesPath, 'New Name');
            expect(fileUtils.renameFile).toHaveBeenCalledWith('mock/notes/path/Old Name', 'mock/notes/path/New Name');
        });

        it('THEN throws an error if the old note does not exist', async () => {
            const oldPath = 'mock/notes/path/Nonexistent Note';
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(oldPath);
            vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(false);

            await expect(repository.renameNoteFile('Nonexistent Note', 'New Name')).rejects.toThrow(`Note file does not exist: ${oldPath}`);
        });

        it('THEN does nothing if the new note already exists', async () => {
            const oldPath = 'mock/notes/path/Old Name';
            const newPath = 'mock/notes/path/Existing Note';
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValueOnce(oldPath).mockResolvedValueOnce(newPath);
            vi.spyOn(fileUtils, 'fileExists').mockResolvedValueOnce(true).mockResolvedValueOnce(true);
            vi.spyOn(fileUtils, 'renameFile').mockResolvedValue(undefined);

            await repository.renameNoteFile('Old Name', 'Existing Note');
            expect(fileUtils.renameFile).not.toHaveBeenCalled();
        });


    });

    describe('WHEN reading a note file', () => {
        let note: Note;
        const mockNotePath = 'mock/notes/path/Test Note.md';
        beforeEach(() => {
            note = new Note('Test Note');
        });
        it('THEN reads the note file successfully', async () => {
            const mockNoteContent = 'This is a test note content.';
            vi.spyOn(fileUtils, 'readTextFile').mockResolvedValue(mockNoteContent);
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(mockNotePath);

            const content = await repository.readNoteContent(note);
            expect(content).toBe(mockNoteContent);
            expect(fileUtils.readTextFile).toHaveBeenCalledWith(mockNotePath);
        });

        it('THEN throws an error if reading the note file fails', async () => {
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(mockNotePath);
            vi.spyOn(fileUtils, 'readTextFile').mockRejectedValue(new Error('Read error'));

            await expect(repository.readNoteContent(note)).rejects.toThrow('Read error');
        });

        it('THEN throws an error if the note file does not exist', async () => {
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(mockNotePath);
            vi.spyOn(fileUtils, 'readTextFile').mockRejectedValue(new Error('File not found'));

            await expect(repository.readNoteContent(note)).rejects.toThrow('File not found');
        });
    });

    describe('WHEN writing a note file', () => {
        let note: Note;
        const mockNotePath = 'mock/notes/path/Test Note.md';
        beforeEach(() => {
            note = new Note('Test Note');
        });
        it('THEN writes the note file successfully', async () => {
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(mockNotePath);
            vi.spyOn(fileUtils, 'writeFile').mockResolvedValueOnce(undefined);

            await expect(repository.writeNoteContent(note, 'New content')).resolves.toBeUndefined();
            expect(fileUtils.writeFile).toHaveBeenCalledWith(mockNotePath, 'New content');
        });

        it('THEN throws an error if writing the note file fails', async () => {
            vi.spyOn(fileUtils, 'getNotePath').mockResolvedValue(mockNotePath);
            vi.spyOn(fileUtils, 'writeFile').mockRejectedValueOnce(new Error('Write error'));

            await expect(repository.writeNoteContent(note, 'New content')).rejects.toThrow('Write error');
        });
    });

    describe('WHEN deleting note files', () => {
        it('THEN deletes the specified note files successfully', async () => {
            const notesToDelete = [new Note('Note 1'), new Note('Note 2')];
            vi.spyOn(fileUtils, 'getNotePath').mockImplementation((_, name) => Promise.resolve(`mock/notes/path/${name}`));
            vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(true);
            vi.spyOn(fileUtils, 'deleteFile').mockResolvedValue(undefined);

            await repository.deleteNoteFiles(notesToDelete);
            expect(fileUtils.deleteFile).toHaveBeenCalledTimes(2);
            expect(fileUtils.deleteFile).toHaveBeenCalledWith('mock/notes/path/Note 1');
            expect(fileUtils.deleteFile).toHaveBeenCalledWith('mock/notes/path/Note 2');
        });

        it('THEN does not throw if a note file does not exist', async () => {
            const notesToDelete = [new Note('Nonexistent Note')];
            vi.spyOn(fileUtils, 'getNotePath').mockImplementation((_, name) => Promise.resolve(`mock/notes/path/${name}`));
            vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(false);
            vi.spyOn(fileUtils, 'deleteFile').mockResolvedValue(undefined);

            await expect(repository.deleteNoteFiles(notesToDelete)).resolves.not.toThrow();
        });
    });

    describe('WHEN saving a file', () => {

        describe('WHEN saving an image file', () => {
            setupSaveFileTest({
                sourcePath: 'mock/source/image.png',
                filename: 'image.png',
                ext: '.png',
                dest: 'mock/notes/path/mock/.files/image.png',
                relPath: 'mock/.files/image.png',
                saveMethod: (src) => repository.saveImage(src)
            });
        });
        describe('WHEN saving a PDF file', () => {
            setupSaveFileTest({
                sourcePath: 'mock/source/file.pdf',
                filename: 'file.pdf',
                ext: '.pdf',
                dest: 'mock/notes/path/mock/.files/file.pdf',
                relPath: 'mock/.files/file.pdf',
                saveMethod: (src) => repository.savePDF(src)
            });
        });
    });

});

// Helper for setup of file operation tests
function setupFileOpTest({
    method,
    fileUtilsMocks,
    args,
    expected,
    throws,
    description
}: {
    method: (...args: unknown[]) => Promise<unknown>,
    fileUtilsMocks: () => void,
    args: unknown[],
    expected?: unknown
    throws?: string,
    description: string
}) {
    it(description, async () => {
        fileUtilsMocks();
        if (throws) {
            await expect(method(...args)).rejects.toThrow(throws);
        } else {
            await expect(method(...args)).resolves.toEqual(expected);
        }
    });
}


// Helper for setup of saveFile tests
function setupSaveFileTest({
    sourcePath,
    filename,
    ext,
    dest,
    relPath,
    saveMethod
}: {
    sourcePath: string,
    filename: string,
    ext: string,
    dest: string,
    relPath: string,
    saveMethod: (src: string) => Promise<string[]>
}) {
    beforeEach(() => {
        const mockJoinPaths = async (...args: string[]) => args.join('/'); vi.spyOn(fileUtils, 'getFilenameFromPath').mockResolvedValue(filename);
        vi.spyOn(fileUtils, 'getExtensionFromPath').mockResolvedValue(ext);
        vi.spyOn(fileUtils, 'joinPaths').mockImplementation(mockJoinPaths);
        vi.spyOn(fileUtils, 'fileExists').mockResolvedValue(false);
        vi.spyOn(fileUtils, 'copyFileToFolder').mockResolvedValue(undefined);
    });
    it('saves the file successfully', async () => {
        const result = await saveMethod(sourcePath);
        expect(fileUtils.getFilenameFromPath).toHaveBeenCalledWith(sourcePath);
        expect(fileUtils.getExtensionFromPath).toHaveBeenCalledWith(sourcePath);
        expect(fileUtils.copyFileToFolder).toHaveBeenCalledWith(sourcePath, dest);
        expect(result).toEqual([relPath, filename.replace(/\.[^/.]+$/, "")]);
    });
    it('handles name collision by generating a random name', async () => {
        vi.spyOn(fileUtils, 'fileExists').mockResolvedValueOnce(true).mockResolvedValueOnce(false);
        const randomBase = 'randomName';
        vi.spyOn(fileUtils, 'getRandomFileName').mockReturnValue(randomBase);
        const result = await saveMethod(sourcePath);
        expect(result[0]).toContain(randomBase);
    });
    it('throws if copy fails', async () => {
        vi.spyOn(fileUtils, 'copyFileToFolder').mockRejectedValueOnce(new Error('Copy error'));
        await expect(saveMethod(sourcePath)).rejects.toThrow('Copy error');
    });
}