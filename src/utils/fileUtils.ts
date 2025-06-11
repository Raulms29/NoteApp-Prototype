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

export const readFile = async (filePath: string): Promise<string> => {
    try {
        return await window.fileAPI.readFile(filePath);
    } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
