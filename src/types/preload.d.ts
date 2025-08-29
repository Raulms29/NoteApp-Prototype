export { };

import { WorkspaceI } from '../business/domain/Workspace';
import { Settings } from '../business/domain/Settings';

/**
 * Type definitions for the preload scripts used in the application
 * This file declares global types and APIs exposed to the renderer process via preload.
 */
declare global {
    interface Window {
        fileAPI: {
            copyFileToFolder(sourcePath: string, destinationFolder: string): Promise<void>;
            getNotePath: (notesPath: string, noteName: string) => Promise<string>;
            fileExists: (filePath: string) => Promise<boolean>;
            readTextFile: (filePath: string) => Promise<string>;
            readBinaryFile: (filePath: string) => Promise<string>;
            renameFile(oldPath: string, newPath: string): Promise<void>;
            writeFile: (filePath: string, content: string) => Promise<void>;
            writeFileBinary: (filePath: string, content: string) => Promise<void>;
            selectFolder: () => Promise<string | null>;
            createFolder: (path: string) => Promise<void>;
            folderExists: (folderPath: string) => Promise<boolean>;
            joinPaths: (...args: string[]) => string;
            getFilenameFromPath: (filePath: string) => Promise<string>;
            getExtensionFromPath: (filePath: string) => Promise<string>;
            deleteFile: (filePath: string) => Promise<void>;
            getTempDir: () => Promise<string>;
        },
        workspaceAPI: {
            getWorkspaces: () => Promise<WorkspaceI[]>;
            setWorkspaces: (workspaces: WorkspaceI[]) => Promise<void>;
            setWorkspaceRoot: (rootPath: string) => Promise<void>;
        },
        windowAPI: {
            setResizable: (resizable: boolean) => Promise<void>;
            maximizeWindow: () => Promise<void>;
            unmaximizeWindow: () => Promise<void>;
            minimizeWindow: () => Promise<void>;
            changeWindowSize: (height = 800, width = 600) => Promise<void>;
            isMaximized: () => Promise<boolean>;
        },
        settingsAPI: {
            getSettings: () => Promise<Settings>;
            setSettings: (settings: Settings) => Promise<void>;
        },
        exportAPI: {
            exportAsPDF(tempHTMLFilePath: string, fileName: string): Promise<void>;
            exportAsPDFReturnFile(tempHTMLFilePath: string): Promise<Buffer>;
        }
    }
}
