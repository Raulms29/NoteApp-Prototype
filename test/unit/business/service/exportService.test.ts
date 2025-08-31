import ExportService from '../../../../src/business/service/ExportService';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Editor, JSONContent } from '@tiptap/vue-3';
import { Workspace } from '../../../../src/business/domain/Workspace';
import * as fileUtils from '../../../../src/utils/fileUtils';
import { createEditor } from '../../../../src/components/editor/createEditor';
import { useNotesStore } from '../../../../src/stores/useNotesStore';
import { fail } from 'assert';

vi.mock('../../../../src/utils/fileUtils', () => ({
    downloadFile: vi.fn(),
    getFilenameFromPath: vi.fn(() => 'mocked-file.ext'),
    joinPaths: vi.fn((...args) => args.join('/')),
    readBinaryFile: vi.fn(() => 'mock content'),
    fileExists: vi.fn(() => true),
    getExtensionFromPath: vi.fn(() => 'png'),
    writeFile: vi.fn(),
    getTempDir: vi.fn(),
    exportAsPDF: vi.fn(),
    exportAsPDFReturnFile: vi.fn(() => Promise.resolve(Buffer.from('mocked PDF content'))),
}));

const mockDownloadFile = vi.fn();
vi.spyOn(fileUtils, 'downloadFile').mockImplementation(mockDownloadFile);

const mockExportAsPDF = vi.fn();
vi.spyOn(fileUtils, 'exportAsPDF').mockImplementation(mockExportAsPDF);

const mockExportAsPDFReturnFile = vi.fn();
vi.spyOn(fileUtils, 'exportAsPDFReturnFile').mockImplementation(mockExportAsPDFReturnFile);

const mockDir = '/mock/temp/dir';
const mockGetTempDir = vi.fn(async () => mockDir);
vi.spyOn(fileUtils, 'getTempDir').mockImplementation(mockGetTempDir);


const service: ExportService = new ExportService();
let editor: Editor;
let workspace: Workspace;
// Mock useNotesStore
vi.mock('../../../../src/stores/useNotesStore', () => ({
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
        it('THEN it calls downloadFile with .txt', async () => {
            await testExportAsText(['Hello\n\n\nWorld!'], ['TestNote']);
        });
        it('THEN it calls downloadFile with .txt for multiple notes', async () => {
            await testExportAsText(['Note1 Content', 'Note2 Content'], ['Note1', 'Note2']);
        });
    });

    describe('WHEN exporting as HTML', () => {
        it('THEN exports correctly', async () => {
            await testExportAsHTML(['<p>Hello</p><p>World!</p>'], ['TestNote']);
        });
        it('THEN exports correctly for multiple notes', async () => {
            await testExportAsHTML(['<p>Note1</p>', '<p>Note2</p>'], ['Note1', 'Note2']);
        });
        it('THEN exports correctly with images', async () => {
            await testExportAsHTML(['<p>Hello</p><img src=".files/test-image.jpg" alt="Test Image">  <img src=".files/test-image.png" title="Test Image"><p>World!</p>'], ['TestNoteWithImage']);
        });
        it('THEN exports correctly with pdfs', async () => {
            await testExportAsHTML(['<p>Hello</p><div src=".files/msowevze.pdf" data-type="pdf" contenteditable="false"><iframe src=".files/msowevze.pdf" width="100%" height="1095px"></iframe></div><p>World!</p>'], ['TestNoteWithPDF']);
        });
    });

    describe('WHEN exporting as Markdown', () => {
        it('THEN it exports correctly', async () => {
            await testExportAsMarkdown(['# Hello\n\nWorld!'], ['TestNote']);
        });
        it('THEN it exports correctly for multiple notes', async () => {
            await testExportAsMarkdown(['# Note1', '# Note2'], ['Note1', 'Note2']);

        });
    });

    describe('WHEN exporting as PDF', () => {
        it('THEN it exports correctly', async () => {
            await testExportAsPDF(['<p>Hello</p><p>World!</p>'], ['TestNote']);
        });
        it('THEN it exports correctly for multiple notes', async () => {
            await testExportAsPDF(['<p>Note1</p>', '<p>Note2</p>'], ['Note1', 'Note2']);
        });
        it('THEN exports correctly with images', async () => {
            await testExportAsPDF(['<p>Hello</p><img src=".files/test-image.png" alt="Test Image"> <p>World!</p>'], ['TestNoteWithImage']);
        });
        it('THEN exports correctly with pdfs', async () => {
            await testExportAsPDF(['<p>Hello</p><div src=".files/msowevze.pdf" title="msowevze" data-type="pdf" contenteditable="false"><iframe src=".files/msowevze.pdf" width="100%" height="1095px"></iframe></div><p>World!</p>'], ['TestNoteWithPDF']);
        });
    });
});


// Helper for text export
async function testExportAsText(content: string[], noteName: string[]) {
    await service.exportNotesAsText(content, noteName);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [, filename] = mockDownloadFile.mock.calls[0];
    if (content.length === 1) {
        expect(filename).toBe(`${noteName[0]}.txt`);
    }
    else if (content.length > 1) {
        expect(filename).toBe(`${noteName[0]}.zip`);
    }
    else {
        fail();
    }
}

// Helper for HTML export
async function testExportAsHTML(content: string[], noteName: string[]) {
    const jsonContent = getJSONFromContent(content, editor);
    await service.exportNotesAsHTML(content, noteName, jsonContent, workspace);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [blob, filename] = mockDownloadFile.mock.calls[0];
    expect(filename).toBe(`${noteName[0]}.zip`);
    expect(blob).toBeInstanceOf(Blob);
}

// Helper for Markdown export
async function testExportAsMarkdown(content: string[], noteName: string[]) {
    const jsonContent = getJSONFromContent(content, editor);
    await service.exportNoteAsMarkdown(content, noteName, jsonContent, workspace);
    expect(mockDownloadFile).toHaveBeenCalled();
    const [blob, filename] = mockDownloadFile.mock.calls[0];
    expect(filename).toBe(`${noteName[0]}.zip`);
    expect(blob).toBeInstanceOf(Blob);
}

// Helper for PDF export
async function testExportAsPDF(content: string[], noteName: string[]) {
    await service.exportNotesAsPDF(content, noteName, workspace);
    expect(mockGetTempDir).toHaveBeenCalled();

    if (content.length === 1) {
        const [path, notename] = mockExportAsPDF.mock.calls[0];

        expect(mockExportAsPDF).toHaveBeenCalled();
        expect(notename).toBe(noteName[0]);
        expect(path).toContain(mockDir);
        expect(path).toContain(`${noteName[0]}-`);
    }
    else {
        expect(mockExportAsPDFReturnFile).toHaveBeenCalledTimes(content.length);
        expect(mockDownloadFile).toHaveBeenCalled();
        const [blob, filename] = mockDownloadFile.mock.calls[0];
        expect(filename).toBe(`${noteName[0]}.zip`);
        expect(blob).toBeInstanceOf(Blob);
    }


}

function getJSONFromContent(content: string[], editor: Editor): JSONContent[] {
    const jsonContent: JSONContent[] = [];
    content.forEach((text) => {
        editor.commands.setContent(text);
        jsonContent.push(editor.getJSON());
    });
    return jsonContent;
}
