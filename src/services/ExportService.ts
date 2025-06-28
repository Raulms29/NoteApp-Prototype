import { Editor, JSONContent } from '@tiptap/vue-3';
import JSZip from 'jszip';
import { downloadFile, getFilenameFromPath, joinPaths, readBinaryFile, readTextFile } from '../utils/fileUtils';
import { Workspace } from './domain/Workspace';
import HtmlConverter from './domain/HtmlConverter';

interface ImageType {
  src: string;
  title?: string;
  alt?: string;
}

interface PdfType {
  src: string;
  title?: string;
}

export default class ExportService {

  exportNoteAsText(editor: Editor, noteName: string): void {
    let textContent = editor.getText();
    // Replace 3+ consecutive newlines with a single newline
    textContent = textContent.replace(/\n{3,}/g, '\n');
    const content = new Blob([textContent], { type: 'text/plain' });
    downloadFile(content, `${noteName}.txt`);
  }

  async exportNoteAsMarkdown(editor: Editor, noteName: string, currentWorkspace: Workspace): Promise<void> {
    const markdownContent = editor.storage.markdown.getMarkdown();
    console.log('JSON', editor.getJSON());

    const zip = new JSZip();
    zip.file(`${noteName}.md`, markdownContent);

    // Recursively process all nodes
    await this.lookForFiles(editor.getJSON(), zip, currentWorkspace);

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteName}.zip`);
  }

  async exportNoteAsHtml(editor: Editor, noteName: string, currentWorkspace: Workspace): Promise<void> {
    let htmlContent = editor.getHTML();
    const htmlStyles = await readTextFile('src/styles/export/export.css');
    htmlContent = HtmlConverter.convertToHtml(htmlContent, noteName, htmlStyles);

    const zip = new JSZip();
    zip.file(`${noteName}.html`, htmlContent);
    // Recursively process all nodes
    await this.lookForFiles(editor.getJSON(), zip, currentWorkspace);

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteName}.zip`);
  }

  private async lookForFiles(node: JSONContent, zip: JSZip, currentWorkspace: Workspace): Promise<void> {
    if (!node) return;
    // Process current node
    const [name, content] = await this.lookForFileOnElement(node, currentWorkspace);
    if (name && content) {
      zip.folder('.files').file(name, content);
    }
    // Recursively process children
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        await this.lookForFiles(child, zip, currentWorkspace);
      }
    }
  }

  private async lookForFileOnElement(element: JSONContent, currentWorkspace: Workspace): Promise<[string, string]> {
    if (element.type === 'image' && element.attrs) {
      const image: ImageType = {
        src: element.attrs.src,
        title: element.attrs.title || '',
        alt: element.attrs.alt || ''
      };
      return await this.getNameAndPath(image.src, currentWorkspace.path);
    }
    if (element.type === 'pdf' && element.attrs) {
      const pdf: PdfType = {
        src: element.attrs.src,
        title: element.attrs.title || null
      };
      return await this.getNameAndPath(pdf.src, currentWorkspace.path);
    }
    return [null, null];
  }

  private async getNameAndPath(filePath: string, currentWorkspaceFilePath: string): Promise<[string, string]> {
    const path = await joinPaths(currentWorkspaceFilePath, filePath);
    const fileContent = await readBinaryFile(path);
    return [await getFilenameFromPath(path), fileContent];
  }
}