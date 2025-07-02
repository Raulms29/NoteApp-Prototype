import { Editor, JSONContent } from '@tiptap/vue-3';
import JSZip from 'jszip';
import { downloadFile, getFilenameFromPath, joinPaths, readBinaryFile, readTextFile, fileExists, getExtensionFromPath, writeFile, deleteFile, getTempDir } from '../utils/fileUtils';
import { Workspace } from './domain/Workspace';
import HtmlConverter from './domain/HtmlConverter';
import { Buffer } from 'buffer';

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

  async exportNoteAsPDF(editor: Editor, noteName: string, currentWorkspace: Workspace): Promise<void> {
    let htmlContent = editor.getHTML();
    const htmlStyles = await readTextFile('src/styles/export/exportPDF.css');

    htmlContent = HtmlConverter.convertToHtml(htmlContent, noteName, htmlStyles);

    // Replace images with base64 data URLs
    htmlContent = await this.replaceImagesWithBase64(htmlContent, currentWorkspace);

    // Write HTML to a temp file using fileUtils
    const tempDir = await getTempDir();
    const tempFilePath = await joinPaths(tempDir, `${noteName}-${Date.now()}.html`);
    await writeFile(tempFilePath, htmlContent);

    try {
      await window.exportAPI.exportAsPDF(tempFilePath, noteName);
    } finally {
      // Clean up temp file
      await deleteFile(tempFilePath).catch(() => { });
    }
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
        title: element.attrs.title ?? '',
        alt: element.attrs.alt ?? ''
      };
      return await this.getNameAndPath(image.src, currentWorkspace.path);
    }
    if (element.type === 'pdf' && element.attrs) {
      const pdf: PdfType = {
        src: element.attrs.src,
        title: element.attrs.title ?? null
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

  private async replaceImagesWithBase64(htmlContent: string, currentWorkspace: Workspace): Promise<string> {
    const baseDir = currentWorkspace.path;
    const filesPath = currentWorkspace.filesFolder;

    // Regex to match <img> tags and capture the src attribute
    const imgTagRegex = /<img\s+[^>]*?\bsrc=["']([^"'<>]{1,1024})["'][^>]*?>/gi;

    const matches = [...htmlContent.matchAll(imgTagRegex)];

    let newHtml = htmlContent;

    // Iterate over all matches and replace the src with base64 data URL
    for (const match of matches) {
      const imgTag = match[0];
      const src = match[1];
      if (src.startsWith(filesPath)) {
        const imgPath = await joinPaths(baseDir, src);
        if (await fileExists(imgPath)) {
          const ext = (await getExtensionFromPath(imgPath)).slice(1).toLowerCase();
          // Handle 'jpg' as 'jpeg', correct MIME type for data URLs
          const mime = ext === 'jpg' ? 'jpeg' : ext;
          // Read the binary data from the file
          const data = await readBinaryFile(imgPath);
          // Convert binary data to base64
          const base64 = Buffer.from(data, 'binary').toString('base64');
          // Create the data URL
          const dataUrl = `data:image/${mime};base64,${base64}`;
          // Replace the tag
          const newImgTag = imgTag.replace(src, dataUrl);
          newHtml = newHtml.replace(imgTag, newImgTag);
        }
      }
    }
    return newHtml;
  }
}