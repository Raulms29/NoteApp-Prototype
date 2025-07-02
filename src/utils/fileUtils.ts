export const getNotePath = async (notesPath: string, noteName: string): Promise<string> => {
    if (!window.fileAPI) {
        throw new Error('fileAPI is not available in the renderer process.');
    }
    return await window.fileAPI.getNotePath(notesPath, noteName);
};

export const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        return await window.fileAPI.fileExists(filePath);
    } catch (error) {
        throw new Error(`Failed to check if file exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const readTextFile = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.readTextFile(filePath);
    } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const readBinaryFile = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.readBinaryFile(filePath);
    } catch (error) {
        throw new Error(`Failed to read binary file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const writeFile = async (filePath: string, content: string): Promise<void> => {
    try {
        await window.fileAPI.writeFile(filePath, content);
    } catch (error) {
        throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const selectFolder = async (): Promise<string | null> => {
    try {
        return await window.fileAPI.selectFolder();
    } catch (error) {
        throw new Error(`Failed to select folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const createFolder = async (path: string): Promise<void> => {
    try {
        await window.fileAPI.createFolder(path);
    } catch (error) {
        throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const folderExists = async (folderPath: string): Promise<boolean> => {
    try {
        return await window.fileAPI.folderExists(folderPath);
    } catch (error) {
        throw new Error(`Failed to check if folder exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const renameFile = async (oldPath: string, newPath: string): Promise<void> => {
    try {
        await window.fileAPI.renameFile(oldPath, newPath);
    } catch (error) {
        throw new Error(`Failed to rename file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const joinPaths = async (...paths: string[]): Promise<string> => {
    return await window.fileAPI.joinPaths(...paths);
};

export function getRandomFileName(): string {
    return Math.random().toString(36).slice(2, 10);
}

export const copyFileToFolder = async (sourcePath: string, destinationFolder: string): Promise<void> => {
    try {
        await window.fileAPI.copyFileToFolder(sourcePath, destinationFolder);
    } catch (error) {
        throw new Error(`Failed to copy file to folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getFilenameFromPath = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.getFilenameFromPath(filePath);
    } catch (error) {
        throw new Error(`Failed to get filename from path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getExtensionFromPath = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.getExtensionFromPath(filePath);
    } catch (error) {
        throw new Error(`Failed to get extension from path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        await window.fileAPI.deleteFile(filePath);
    } catch (error) {
        console.error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
    }
};

export const setWorkspaceRoot = async (rootPath: string): Promise<void> => {
    try {
        await window.workspaceAPI.setWorkspaceRoot(rootPath);
    } catch (error) {
        throw new Error(`Failed to set workspace root: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const downloadFile = (content: Blob, fileName: string): void => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const getTempDir = async (): Promise<string> => {
    try {
        return await window.fileAPI.getTempDir();
    } catch (error) {
        throw new Error(`Failed to get temp directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};