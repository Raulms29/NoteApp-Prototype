import { BrowserWindow, dialog, ipcMain } from "electron";
import fs from 'fs';
import fsPromises from 'fs/promises';

export function registerExportHandlers() {
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