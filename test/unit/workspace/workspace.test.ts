import { vi } from 'vitest';
import { Workspace } from '../../../src/services/domain/Workspace';

vi.mock('../../../src/utils/fileUtils', () => ({
    joinPaths: async (...args: string[]) => args.join('/'),
}));

describe('GIVEN a Workspace', () => {
    it('THEN initializes with correct name, path, and 8-char ID', () => {
        const ws = new Workspace('Test Workspace', '/some/path', '12345678');
        expect(ws.name).toBe('Test Workspace');
        expect(ws.path).toBe('/some/path');
        expect(ws.id).toBe('12345678');
    });

    it('THEN generates a random 8-char ID if not provided', () => {
        const ws = new Workspace('Test Workspace', '/some/path');
        expect(ws.id).toHaveLength(8);
    });

    it('THEN trims and validates name and ID', () => {
        const ws = new Workspace('   Name   ', '/p', '   87654321   ');
        expect(ws.name).toBe('Name');
        expect(ws.id).toBe('87654321');
    });

    it('THEN throws error for empty name', () => {
        expect(() => new Workspace('', '/p', '12345678')).toThrowError('Workspace name cannot be empty');
    });

    it('THEN throws error for name > 25 chars', () => {
        const longName = 'a'.repeat(26);
        expect(() => new Workspace(longName, '/p', '12345678')).toThrowError('Workspace name cannot exceed 25 characters');
    });

    it('THEN throws error for ID not 8 chars', () => {
        expect(() => new Workspace('Name', '/p', '1234567')).toThrowError('Workspace ID must be exactly 8 characters long');
        expect(() => new Workspace('Name', '/p', '123456789')).toThrowError('Workspace ID must be exactly 8 characters long');
    });

    it('THEN filesFolder returns .files', () => {
        const ws = new Workspace('Name', '/p', '12345678');
        expect(ws.filesFolder).toBe('.files');
    });

    it('THEN notesStructurePath and notesStructureFilePath resolve correctly', async () => {
        const ws = new Workspace('Name', '/base', '12345678');
        const notesPath = await ws.notesStructurePath();
        const notesFile = await ws.notesStructureFilePath();
        expect(notesPath).toContain('/base');
        expect(notesPath).toContain('.notes');
        expect(notesFile).toContain('notes.json');
    });
});
