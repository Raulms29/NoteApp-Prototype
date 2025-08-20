/**
 * Gets the full path for a note file.
 */
export const getNotePath = async (notesPath: string, noteName: string): Promise<string> => {
    if (!window.fileAPI) {
        throw new Error('fileAPI is not available in the renderer process.');
    }
    return await window.fileAPI.getNotePath(notesPath, noteName);
};

/**
 * Checks if a file exists at the given path.
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        return await window.fileAPI.fileExists(filePath);
    } catch (error) {
        throw new Error(`Failed to check if file exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Reads a text file and returns its content as a string.
 */
export const readTextFile = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.readTextFile(filePath);
    } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Reads a binary file and returns its content as a string.
 */
export const readBinaryFile = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.readBinaryFile(filePath);
    } catch (error) {
        throw new Error(`Failed to read binary file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Writes content to a file at the given path.
 */
export const writeFile = async (filePath: string, content: string): Promise<void> => {
    try {
        await window.fileAPI.writeFile(filePath, content);
    } catch (error) {
        throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Opens a folder selection dialog and returns the selected path.
 */
export const selectFolder = async (): Promise<string | null> => {
    try {
        return await window.fileAPI.selectFolder();
    } catch (error) {
        throw new Error(`Failed to select folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Creates a folder at the specified path.
 */
export const createFolder = async (path: string): Promise<void> => {
    try {
        await window.fileAPI.createFolder(path);
    } catch (error) {
        throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Checks if a folder exists at the given path.
 */
export const folderExists = async (folderPath: string): Promise<boolean> => {
    try {
        return await window.fileAPI.folderExists(folderPath);
    } catch (error) {
        throw new Error(`Failed to check if folder exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Renames a file from oldPath to newPath.
 */
export const renameFile = async (oldPath: string, newPath: string): Promise<void> => {
    try {
        await window.fileAPI.renameFile(oldPath, newPath);
    } catch (error) {
        throw new Error(`Failed to rename file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Joins multiple path segments into a single path.
 */
export const joinPaths = async (...paths: string[]): Promise<string> => {
    return window.fileAPI.joinPaths(...paths);
};

/**
 * Generates a random file name string.
 */
export function getRandomFileName(): string {
    return Math.random().toString(36).slice(2, 10);
}

/**
 * Copies a file to the specified destination folder.
 */
export const copyFileToFolder = async (sourcePath: string, destinationFolder: string): Promise<void> => {
    try {
        await window.fileAPI.copyFileToFolder(sourcePath, destinationFolder);
    } catch (error) {
        throw new Error(`Failed to copy file to folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Gets the file name from a file path.
 */
export const getFilenameFromPath = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.getFilenameFromPath(filePath);
    } catch (error) {
        throw new Error(`Failed to get filename from path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Gets the file extension from a file path.
 */
export const getExtensionFromPath = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.getExtensionFromPath(filePath);
    } catch (error) {
        throw new Error(`Failed to get extension from path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Deletes a file at the given path.
 */
export const deleteFile = async (filePath: string): Promise<void> => {
    try {
        await window.fileAPI.deleteFile(filePath);
    } catch (error) {
        console.error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
    }
};

/**
 * Triggers a download of a file with the given content and name.
 */
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

/**
 * Exports an HTML file as a PDF with the given file name.
 */
export const exportAsPDF = async (tempHTMLFilePath: string, fileName: string): Promise<void> => {
    try {
        await window.exportAPI.exportAsPDF(tempHTMLFilePath, fileName);
    } catch (error) {
        throw new Error(`Failed to export as PDF: ${error instanceof Error ? error.message :
            'Unknown error'}`);
    }
};

/**
 * Exports an HTML file as a PDF and returns the PDF as a Buffer.
 */
export const exportAsPDFReturnFile = async (tempHTMLFilePath: string): Promise<Buffer> => {
    try {
        return await window.exportAPI.exportAsPDFReturnFile(tempHTMLFilePath);
    } catch (error) {
        throw new Error(`Failed to export as PDF and return file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Gets the path to the temporary directory.
 */
export const getTempDir = async (): Promise<string> => {
    try {
        return await window.fileAPI.getTempDir();
    } catch (error) {
        throw new Error(`Failed to get temp directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Sets the root path for the workspace.
 */
export const setWorkspaceRoot = async (rootPath: string): Promise<void> => {
    try {
        await window.workspaceAPI.setWorkspaceRoot(rootPath);
    } catch (error) {
        throw new Error(`Failed to set workspace root: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};