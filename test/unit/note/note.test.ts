import { Note } from '../../../src/services/domain/Note';

describe('GIVEN a Note', () => {
    describe('WHEN it has no children', () => {
        it('THEN initializes with an 8-char ID', () => {
            const note = new Note('Test Note', [], '00000001');

            expect(note.id).toBe('00000001');
            expect(note.name).toBe('Test Note');
            expect(note.children).toHaveLength(0);
            expect(note.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('THEN initializes without ID', () => {
            const note = new Note('Test Note', []);

            expect(note.id).toHaveLength(8);
            expect(note.name).toBe('Test Note');
            expect(note.children).toHaveLength(0);
            expect(note.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('THEN trims the ID', () => {
            const trimmedNote = new Note('Trimmed ID Note', [], '   00000003   ');
            expect(trimmedNote.id).toBe('00000003');
        });

        it('THEN throws error when empty ID', () => {
            expect(() => new Note('Empty ID Note', [], '')).toThrowError('Note ID must be exactly 8 characters long');
        });

        it('THEN throws error for invalid ID', () => {
            expect(() => new Note('Invalid ID Note', [], 'invalid/id')).toThrowError('Note ID cannot contain any of these characters: \\ / : * ? " < > |');
        });

        it('THEN throws error for short/long ID', () => {
            expect(() => new Note('Short ID Note', [], '1234567')).toThrowError('Note ID must be exactly 8 characters long');
            expect(() => new Note('Long ID Note', [], '123456789')).toThrowError('Note ID must be exactly 8 characters long');
        });

        it('THEN throws error for empty name', () => {
            expect(() => new Note('', [], '00000001')).toThrowError('Note name cannot be empty.');
        });

        it('THEN throws error for long name', () => {
            const longName = 'a'.repeat(31);
            expect(() => new Note(longName, [], '00000001')).toThrowError('Note name cannot exceed 30 characters.');
        });
    });

    describe('WHEN adding a child', () => {
        let note: Note;
        beforeEach(() => {
            note = new Note('Parent Note', [], '00000001');
        });

        it('THEN adds child with padded ID', () => {
            const childNote = new Note('Child Note', [], '00000002');
            note.addChild(childNote);

            expect(note.children).toHaveLength(1);
            expect(note.children[0].id).toBe('00000002');
            expect(note.children[0].name).toBe('Child Note');
        });

        it('THEN throws error for duplicate child', () => {
            const childNote = new Note('Child Note', [], '00000002');
            note.addChild(childNote);

            expect(() => note.addChild(childNote)).toThrowError(`Child with ID ${childNote.id} already exists in this note.`);
        });

        it('THEN throws error for self-child', () => {
            expect(() => note.addChild(note)).toThrowError(`Cannot add a note as a child of itself.`);
        });
    });

    describe('WHEN it has children', () => {

        let note: Note;
        beforeEach(() => {
            const childNote = new Note('Child Note', [], '00000002');
            const grandChildNote = new Note('Grandchild Note', [], '00000010');
            childNote.addChild(grandChildNote);
            note = new Note('Parent Note', [childNote], '00000001');
        });

        it('THEN initializes with 1 child', () => {
            expect(note.id).toBe('00000001');
            expect(note.name).toBe('Parent Note');
            expect(note.children).toHaveLength(1);
            expect(note.children[0].id).toBe('00000002');
        });

        it('THEN checks descendant by ID', () => {
            expect(note.hasDescendantByID('00000003')).toBe(false);
            expect(note.hasDescendantByID('00000001')).toBe(false);
            expect(note.hasDescendantByID(`00000002`)).toBe(true);
        });

        it('THEN adds second child', () => {
            const newChild = new Note('New Child Note', [], '00000003');
            note.addChild(newChild);
            expect(note.children).toHaveLength(2);
            expect(note.hasDescendantByID('00000003')).toBe(true);
            expect(note.hasDescendant(newChild)).toBe(true);
        });

        it('THEN removes child', () => {
            const childNote = note.children[0];
            expect(note.removeChild(childNote)).toBe(true);
            expect(note.children).toHaveLength(0);
            expect(note.hasDescendant(childNote)).toBe(false);
        });

        it('THEN removes descendant', () => {
            const childNote = note.children[0];
            const grandChildNote = childNote.children[0];
            expect(note.removeDescendant(grandChildNote)).toBe(true);
            expect(note.hasDescendant(grandChildNote)).toBe(false);
            expect(childNote.children).toHaveLength(0);
            expect(note.hasDescendant(childNote)).toBe(true);
        });
    });
});
