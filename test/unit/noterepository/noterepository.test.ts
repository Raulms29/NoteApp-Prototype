import { describe, it, expect, vi } from 'vitest';
import { Note } from '../../../src/services/domain/Note';
import { NoteRepository } from '../../../src/services/NoteRepository';
import * as fileUtils from '../../../src/utils/fileUtils';

vi.mock('../../../src/utils/fileUtils');
vi.mock('fs');

describe('GIVEN a NoteRepository', () => {
    let repository: NoteRepository;
    const mockNotesPath = 'mock/notes/path';
    const mockStructurePath = 'mock/structure/path.json';

    beforeAll(() => {
        repository = new NoteRepository(mockNotesPath, mockStructurePath);
    });

    describe('WHEN adding a note', () => {
        it('THEN adds the note successfully', async () => {
            const note = new Note('Test Note');
            const note2 = new Note('Test Note 2');
            vi.spyOn(fileUtils, 'writeFile').mockResolvedValue(undefined);

            await repository.saveNoteTree([note, note2]);
            expect(fileUtils.writeFile).toHaveBeenCalledWith(mockStructurePath, JSON.stringify([note, note2], null, 2));
        });


    });

    describe('WHEN adding a note with descendants', () => {
        it('THEN adds the note with descendants successfully', async () => {
            const childNote = new Note('Child Note');
            const parentNote = new Note('Parent Note', [childNote]);
            const parentNote2 = new Note('Parent Note 2', [new Note('Child Note 2')]);
            vi.spyOn(fileUtils, 'writeFile').mockResolvedValue(undefined);

            await repository.saveNoteTree([parentNote, parentNote2]);

            expect(fileUtils.writeFile).toHaveBeenCalledWith(mockStructurePath, JSON.stringify([parentNote, parentNote2], null, 2));
        });
    });
});
