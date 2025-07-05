import ExportService from '../../../src/services/ExportService';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Editor } from '@tiptap/vue-3';
import { Workspace } from '../../../src/services/domain/Workspace';
import * as fileUtils from '../../../src/utils/fileUtils';
import { createEditor } from '../../../src/components/editor/createEditor';
import { useNotesStore } from '../../../src/stores/useNotesStore';

vi.mock('../../../src/utils/fileUtils', () => ({
    downloadFile: vi.fn(),
    getFilenameFromPath: vi.fn(() => 'mocked-file.ext'),
    joinPaths: vi.fn((...args) => args.join('/')),
    readBinaryFile: vi.fn(() => 'mock content'),
    fileExists: vi.fn(() => true),
    getExtensionFromPath: vi.fn(() => 'png'),
    writeFile: vi.fn(),
    getTempDir: vi.fn(),
    exportAsPDF: vi.fn(),
}));

const mockDownloadFile = vi.fn();
vi.spyOn(fileUtils, 'downloadFile').mockImplementation(mockDownloadFile);

const mockExportAsPDF = vi.fn();
vi.spyOn(fileUtils, 'exportAsPDF').mockImplementation(mockExportAsPDF);

const mockDir = '/mock/temp/dir';
const mockGetTempDir = vi.fn(async () => mockDir);
vi.spyOn(fileUtils, 'getTempDir').mockImplementation(mockGetTempDir);


const service: ExportService = new ExportService();
let editor: Editor;
let workspace: Workspace;
// Mock useNotesStore
vi.mock('../../../src/stores/useNotesStore', () => ({
    useNotesStore: vi.fn(() => ({
        getNoteById: vi.fn(),
        selectNote: vi.fn(),
        createNote: vi.fn(),
        getNoteByName: vi.fn(),
        saveImage: vi.fn(),
        savePDF: vi.fn(),
        loadCurrentNoteContent: vi.fn(() => ''),
        currentNote: null,
    })),
}));

// Mock global fetch to prevent network errors in tests
globalThis.fetch = vi.fn(() => Promise.resolve(new Response('', { status: 200, statusText: 'OK' })));

describe('GIVEN an ExportService', () => {


    beforeEach(() => {
        mockDownloadFile.mockClear();
        mockExportAsPDF.mockClear();
        mockGetTempDir.mockClear();
        editor = createEditor(useNotesStore(), () => { });
        workspace = new Workspace('Mock', '/mock/path', 'mockid12');
    });

    describe('WHEN exporting as text', () => {
        it('THEN it calls downloadFile with .txt', () => {
            testExportAsText('Hello\n\n\nWorld!', 'TestNote');
        });
    });

    describe('WHEN exporting as HTML', () => {
        it('THEN exports correctly', async () => {
            await testExportAsHTML('<p>Hello</p><p>World!</p>', 'TestNote');
        });
        it('THEN exports correctly with images', async () => {
            await testExportAsHTML('<p>Hello</p><img src=".files/test-image.jpg" alt="Test Image">  <img src=".files/test-image.png" title="Test Image"><p>World!</p>', 'TestNoteWithImage');
        });
        it('THEN exports correctly with pdfs', async () => {
            await testExportAsHTML('<p>Hello</p><div src=".files/msowevze.pdf" data-type="pdf" contenteditable="false"><iframe src=".files/msowevze.pdf" width="100%" height="1095px"></iframe></div><p>World!</p>', 'TestNoteWithPDF');
        });
    });

    describe('WHEN exporting as Markdown', () => {
        it('THEN it exports correctly', async () => {
            await testExportAsMarkdown('# Hello\n\nWorld!', 'TestNote');
        });
    });

    describe('WHEN exporting as PDF', () => {
        it('THEN it exports correctly', async () => {
            await testExportAsPDF('<p>Hello</p><p>World!</p>', 'TestNote');
        });
        it('THEN exports correctly with images', async () => {
            await testExportAsPDF('<p>Hello</p><img src=".files/test-image.png" alt="Test Image"> <p>World!</p>', 'TestNoteWithImage');
        });
        it('THEN exports correctly with pdfs', async () => {
            await testExportAsPDF('<p>Hello</p><div src=".files/msowevze.pdf" title="msowevze" data-type="pdf" contenteditable="false"><iframe src=".files/msowevze.pdf" width="100%" height="1095px"></iframe></div><p>World!</p>', 'TestNoteWithPDF');
        });
    });
});


// Helper for text export
function testExportAsText(content: string, noteName: string) {
    editor.commands.setContent(content);
    service.exportNoteAsText(editor, noteName);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [, filename] = mockDownloadFile.mock.calls[0];
    expect(filename).toBe(`${noteName}.txt`);
}

// Helper for HTML export
async function testExportAsHTML(content: string, noteName: string) {
    editor.commands.setContent(content);
    await service.exportNoteAsHTML(editor, noteName, workspace);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [blob, filename] = mockDownloadFile.mock.calls[0];
    expect(filename).toBe(`${noteName}.zip`);
    expect(blob).toBeInstanceOf(Blob);
}

// Helper for Markdown export
async function testExportAsMarkdown(content: string, noteName: string) {
    editor.commands.setContent(content);
    await service.exportNoteAsMarkdown(editor, noteName, workspace);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [blob, filename] = mockDownloadFile.mock.calls[0];
    expect(filename).toBe(`${noteName}.zip`);
    expect(blob).toBeInstanceOf(Blob);
}

// Helper for PDF export
async function testExportAsPDF(content: string, noteName: string) {
    editor.commands.setContent(content);
    await service.exportNoteAsPDF(editor, noteName, workspace);
    expect(mockGetTempDir).toHaveBeenCalled();
    expect(mockExportAsPDF).toHaveBeenCalled();
    const [path, notename] = mockExportAsPDF.mock.calls[0];
    expect(notename).toBe(noteName);
    expect(path).toContain(mockDir);
    expect(path).toContain(`${noteName}-`);
}
