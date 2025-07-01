import { BrowserWindow, dialog, ipcMain } from "electron";
import fs from 'fs';

export function registerExportHandlers() {
    ipcMain.handle('export-as-pdf', async (_, htmlContent: string, fileName: string) => {
        // Replace images with base64 data URLs before rendering
        const win = new BrowserWindow({
            show: false, // Hidden window
        });

        await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

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

        win.destroy();
    });
}
