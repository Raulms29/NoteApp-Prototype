import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerNoteHandlers(noteFileExtension: string, fileEncoding: BufferEncoding = 'utf-8') {
    ipcMain.handle('get-note-path', (_, notesPath: string, noteName: string) => {
        return path.join(notesPath, noteName + noteFileExtension);
    });

    ipcMain.handle('file-exists', (_, filePath: string) => {
        return fs.existsSync(filePath);
    });

    ipcMain.handle('read-file', async (_, filePath: string) => {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        return await fs.promises.readFile(filePath, fileEncoding);
    });

    ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
        await fs.promises.writeFile(filePath, content, fileEncoding);
    });
}