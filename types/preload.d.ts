export { };

import { WorkspaceI } from '../src/services/domain/Workspace';

declare global {
    interface Window {
        fileAPI: {
            getNotePath: (notesPath: string, noteName: string) => Promise<string>;
            fileExists: (filePath: string) => Promise<boolean>;
            readFile: (filePath: string) => Promise<string>;
            writeFile: (filePath: string, content: string) => Promise<void>;
            selectFolder: () => Promise<string | null>;
            createFolder: (path: string) => Promise<void>;
            folderExists: (folderPath: string) => Promise<boolean>;
        },
        workspaceAPI: {
            getWorkspaces: () => Promise<WorkspaceI[]>;
            setWorkspaces: (workspaces: WorkspaceI[]) => Promise<void>;
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
