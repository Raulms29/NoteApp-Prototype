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
