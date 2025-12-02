import { BrowserWindow, dialog, ipcMain } from "electron";
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';

export function registerExportHandlers() {
    /**
     * Handles exporting an HTML file as a PDF and returns the PDF buffer.
     */
    ipcMain.handle('export-as-pdf-return-file', async (_, tempHTMLFilePath: string) => {
        const win = new BrowserWindow({
            show: false, // Hidden window
        });
        try {
            await win.loadFile(tempHTMLFilePath);
            const pdfBuffer = await win.webContents.printToPDF({
                printBackground: true,
                pageSize: 'A4',
            });
            // Clean up temp file and window
            await fsPromises.unlink(tempHTMLFilePath).catch(() => { });
            win.destroy();
            // Return the PDF buffer directly
            return pdfBuffer;
        } catch (err) {
            win.destroy();
            throw err;
        }
    });
    /**
     * Handles exporting an HTML file as a PDF and saves it to disk.
     */
    ipcMain.handle('export-as-pdf', async (_, tempHTMLFilePath: string, fileName: string) => {
        const win = new BrowserWindow({
            show: false, // Hidden window
        });

        try {
            await win.loadFile(tempHTMLFilePath);

            const pdfBuffer = await win.webContents.printToPDF({
                printBackground: true,
                pageSize: 'A4',
            });

            const { filePath } = await dialog.showSaveDialog({
                title: 'Save Note as PDF',
                defaultPath: `${fileName}.pdf`,
                filters: [{ name: 'PDF File', extensions: ['pdf'] }],
            });

            if (filePath) {
                fs.writeFileSync(filePath, pdfBuffer);
            }
        } finally {
            // Clean up temp file and window
            await fsPromises.unlink(tempHTMLFilePath).catch(() => { });
            win.destroy();
        }
    });
}