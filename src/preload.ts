// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
console.log('Preload script is being loaded...');

import { contextBridge, shell, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('fileAPI', {
    openExternal: (url: string) => shell.openExternal(url),
    // This needs to be done since the filesystem cannot be accessed directly from the renderer process
    getNotePath: (notesPath: string, noteName: string) =>
        ipcRenderer.invoke('get-note-path', notesPath, noteName),
    fileExists: (filePath: string) =>
        ipcRenderer.invoke('file-exists', filePath),
    readFile: (filePath: string) =>
        ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath: string, content: string) =>
        ipcRenderer.invoke('write-file', filePath, content),
});

console.log('Preload script loaded successfully');

