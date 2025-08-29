import { JSONContent } from '@tiptap/vue-3';
import JSZip from 'jszip';
import { downloadFile, getFilenameFromPath, joinPaths, readBinaryFile, fileExists, getExtensionFromPath, writeFile, getTempDir, exportAsPDFReturnFile, exportAsPDF } from '../../utils/fileUtils';
import { Workspace } from '../domain/Workspace';
import HtmlConverter from '../domain/HtmlConverter';
import { Buffer } from 'buffer';
// @ts-expect-error // This import is used to include CSS styles for HTML export
// eslint-disable-next-line import/no-unresolved
import exportCss from '../../styles/export/export.css?raw';
// @ts-expect-error // This import is used to include CSS styles for HTML export
// eslint-disable-next-line import/no-unresolved
import exportCssPDF from '../../styles/export/exportPDF.css?raw';


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

  /**
   * Exports notes as plain text files, either individually or as a zip archive.
   * @param textContent - Array of note contents as plain text.
   * @param noteNames - Array of note names for file naming.
   */
  async exportNotesAsText(textContent: string[], noteNames: string[]): Promise<void> {
    textContent = this.processNotePlainText(textContent);

    if (textContent.length === 1) {
      await this.exportNoteAsText(textContent[0], noteNames[0]);
      return;
    }

    const zip = new JSZip();
    textContent.forEach((text, index) => {
      const fileName = `${noteNames[index]}.txt`;
      zip.file(fileName, text);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteNames[0]}.zip`);

  }

  private async exportNoteAsText(textContent: string, noteName: string): Promise<void> {
    textContent = this.processNotePlainText([textContent])[0];
    const content = new Blob([textContent], { type: 'text/plain' });
    downloadFile(content, `${noteName}.txt`);
  }

  /**
   * Exports notes as Markdown files, including them and embedded files in a zip archive.
   * @param markdownContent - Array of note contents in Markdown format.
   * @param noteNames - Array of note names for file naming.
   * @param markdownJSON - Array of JSONContent for file extraction.
   * @param currentWorkspace - The current workspace instance.
   */
  async exportNoteAsMarkdown(markdownContent: string[], noteNames: string[], markdownJSON: JSONContent[], currentWorkspace: Workspace): Promise<void> {
    const zip = new JSZip();
    markdownContent.forEach((text, index) => {
      const fileName = `${noteNames[index]}.md`;
      zip.file(fileName, text);
    });

    // Recursively process all nodes
    for (let i = 0; i < markdownContent.length; i++) {
      const node = markdownJSON[i];
      await this.lookForFiles(node, zip, currentWorkspace);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteNames[0]}.zip`);
  }

  /**
   * Exports notes as HTML files, including them and embedded files in a zip archive.
   * @param htmlContent - Array of note contents in HTML format.
   * @param noteNames - Array of note names for file naming.
   * @param htmlJSONs - Array of JSONContent for file extraction.
   * @param currentWorkspace - The current workspace instance.
   */
  async exportNotesAsHTML(htmlContent: string[], noteNames: string[], htmlJSONs: JSONContent[], currentWorkspace: Workspace): Promise<void> {
    const zip = new JSZip();
    htmlContent.forEach((html, index) => {
      const fileName = `${noteNames[index]}.html`;
      const convertedHtml = HtmlConverter.convertToHtml(html, noteNames[index], exportCss);
      zip.file(fileName, convertedHtml);
    });

    // Recursively process all nodes
    for (let i = 0; i < htmlContent.length; i++) {
      const node = htmlJSONs[i];
      await this.lookForFiles(node, zip, currentWorkspace);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteNames[0]}.zip`);
  }

  /**
   * Exports notes as PDF files, either individually or as a zip archive.
   * @param htmlContent - Array of note contents in HTML format.
   * @param noteNames - Array of note names for file naming.
   * @param currentWorkspace - The current workspace instance.
   */
  async exportNotesAsPDF(htmlContent: string[], noteNames: string[], currentWorkspace: Workspace): Promise<void> {
    if (htmlContent.length === 1) {
      await this.exportNoteAsPDF(htmlContent[0], noteNames[0], currentWorkspace);
      return;
    }

    const pdfs: Buffer[] = [];
    for (let i = 0; i < htmlContent.length; i++) {

      let html = HtmlConverter.convertToHtml(htmlContent[i], noteNames[i], exportCssPDF);

      // Replace images with base64 data URLs
      html = await this.replaceImagesWithBase64(html, currentWorkspace);

      // Write HTML to a temp file using fileUtils
      const tempFilePath = await this.writeHTMLToTempDir(html, noteNames[i]);

      pdfs.push(await exportAsPDFReturnFile(tempFilePath));
    }

    const zip = new JSZip();
    pdfs.forEach((pdf, index) => {
      const fileName = `${noteNames[index]}.pdf`;
      zip.file(fileName, pdf);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    downloadFile(content, `${noteNames[0]}.zip`);
  }

  private async exportNoteAsPDF(htmlContent: string, noteName: string, currentWorkspace: Workspace): Promise<void> {
    htmlContent = HtmlConverter.convertToHtml(htmlContent, noteName, exportCssPDF);

    // Replace images with base64 data URLs
    htmlContent = await this.replaceImagesWithBase64(htmlContent, currentWorkspace);

    // Write HTML to a temp file using fileUtils
    const tempFilePath = await this.writeHTMLToTempDir(htmlContent, noteName);

    await exportAsPDF(tempFilePath, noteName);
  }

  private async writeHTMLToTempDir(htmlContent: string, noteName: string): Promise<string> {
    const tempDir = await getTempDir();
    const tempFilePath = await joinPaths(tempDir, `${noteName}-${Date.now()}.html`);
    await writeFile(tempFilePath, htmlContent);
    return tempFilePath;
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

  private processNotePlainText(textContent: string[]) {
    textContent = textContent.map((text) => {
      // Replace 3+ consecutive newlines with a single newline
      return text.replace(/\n{3,}/g, '\n');
    });
    return textContent;
  }
}