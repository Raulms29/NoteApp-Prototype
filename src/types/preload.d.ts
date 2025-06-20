export { };

import { WorkspaceI } from '../services/domain/Workspace';

declare global {
    interface Window {
        fileAPI: {
            copyFileToFolder(sourcePath: string, destinationFolder: string): Promise<void>;
            getNotePath: (notesPath: string, noteName: string) => Promise<string>;
            fileExists: (filePath: string) => Promise<boolean>;
            readFile: (filePath: string) => Promise<string>;
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
        }
    }
}
