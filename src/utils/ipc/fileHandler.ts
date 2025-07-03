import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerNoteHandlers(noteFileExtension: string) {
    ipcMain.handle('get-note-path', async (_, notesPath: string, noteName: string) => {
        return path.join(notesPath, noteName + noteFileExtension);
    });
}

export function registerFileHandlers(fileEncoding: BufferEncoding = 'utf-8') {
    ipcMain.handle('dialog:selectFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (result.canceled || result.filePaths.length === 0) return null;
        return result.filePaths[0];
    });

    ipcMain.handle('create-folder', async (_, path: string) => {
        if (!fs.existsSync(path)) {
            await fs.promises.mkdir(path, { recursive: false });
        } else {
            throw new Error(`Folder already exists: ${path}`);
        }
    });

    ipcMain.handle('file-exists', async (_, filePath: string) => {
        return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
    });

    ipcMain.handle('folder-exists', async (_, folderPath: string) => {
        return fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory();
    });

    ipcMain.handle('read-text-file', async (_, filePath: string) => {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        return await fs.promises.readFile(filePath, fileEncoding);
    });

    ipcMain.handle('read-binary-file', async (_, filePath: string) => {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        return await fs.promises.readFile(filePath);
    });

    ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
        await fs.promises.writeFile(filePath, content, fileEncoding);
    });

    ipcMain.handle('rename-file', async (_, oldPath: string, newPath: string) => {
        await fs.promises.rename(oldPath, newPath);
    });

    ipcMain.handle('join-paths', async (_, ...args: string[]) => {
        return path.join(...args);
    });

    ipcMain.handle('copy-file-to-folder', async (_, sourcePath: string, destinationPath: string) => {
        await fs.promises.copyFile(sourcePath, destinationPath);
    });

    ipcMain.handle('get-filename-from-path', async (_, filePath: string) => {
        return path.basename(filePath);
    });

    ipcMain.handle('get-extension-from-path', async (_, filePath: string) => {
        return path.extname(filePath);
    });

    ipcMain.handle('delete-file', async (_, filePath: string) => {
        fs.promises.unlink(filePath);
    });

    ipcMain.handle('get-temp-dir', async () => {
        const tempDir = app.getPath('temp');
        return tempDir;
    });
}