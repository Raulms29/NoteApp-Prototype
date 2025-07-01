// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
console.log('Preload script is being loaded...');

import { contextBridge, ipcRenderer } from 'electron';
import { WorkspaceI } from './services/domain/Workspace';

contextBridge.exposeInMainWorld('fileAPI', {
    // This needs to be done since the filesystem cannot be accessed directly from the renderer process
    getNotePath: (notesPath: string, noteName: string) =>
        ipcRenderer.invoke('get-note-path', notesPath, noteName),
    fileExists: (filePath: string) =>
        ipcRenderer.invoke('file-exists', filePath),
    readTextFile: (filePath: string) =>
        ipcRenderer.invoke('read-text-file', filePath),
    readBinaryFile: (filePath: string) =>
        ipcRenderer.invoke('read-binary-file', filePath),
    writeFile: (filePath: string, content: string) =>
        ipcRenderer.invoke('write-file', filePath, content),
    selectFolder: async () =>
        await ipcRenderer.invoke('dialog:selectFolder'),
    createFolder: (path: string) =>
        ipcRenderer.invoke('create-folder', path),
    folderExists: (folderPath: string) =>
        ipcRenderer.invoke('folder-exists', folderPath),
    renameFile: (oldPath: string, newPath: string) =>
        ipcRenderer.invoke('rename-file', oldPath, newPath),
    joinPaths: (...args: string[]) => ipcRenderer.invoke('join-paths', ...args),
    copyFileToFolder: (sourcePath: string, destinationFolder: string) =>
        ipcRenderer.invoke('copy-file-to-folder', sourcePath, destinationFolder),
    getFilenameFromPath: (filePath: string) =>
        ipcRenderer.invoke('get-filename-from-path', filePath),
    getExtensionFromPath: (filePath: string) =>
        ipcRenderer.invoke('get-extension-from-path', filePath),
    deleteFile: (filePath: string) =>
        ipcRenderer.invoke('delete-file', filePath),
});

contextBridge.exposeInMainWorld('workspaceAPI', {
    getWorkspaces: () =>
        ipcRenderer.invoke('get-workspaces'),
    setWorkspaces: (workspaces: WorkspaceI[]) =>
        ipcRenderer.invoke('set-workspaces', workspaces),
    setWorkspaceRoot: (rootPath: string) =>
        ipcRenderer.invoke('set-workspace-root', rootPath),
});

contextBridge.exposeInMainWorld('windowAPI', {
    setResizable: (resizable: boolean) =>
        ipcRenderer.invoke('set-resizable', resizable),
    maximizeWindow: () =>
        ipcRenderer.invoke('maximize-window'),
    unmaximizeWindow: () =>
        ipcRenderer.invoke('unmaximize-window'),
    minimizeWindow: () =>
        ipcRenderer.invoke('minimize-window'),
    changeWindowSize: (height: number, width: number) =>
        ipcRenderer.invoke('change-window-size', height, width),
    isMaximized: () =>
        ipcRenderer.invoke('is-maximized'),
});

contextBridge.exposeInMainWorld('settingsAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSettings: (settings: { theme: string; language: string }) => ipcRenderer.invoke('set-settings', settings),
    updateSetting: (key: string, value: string) => ipcRenderer.invoke('update-setting', key, value),
});

contextBridge.exposeInMainWorld('exportAPI', {
    exportAsPDF: (htmlContent: string, fileName: string) =>
        ipcRenderer.invoke('export-as-pdf', htmlContent, fileName),
});

console.log('Preload script loaded successfully');

