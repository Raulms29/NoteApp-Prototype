import path from "path";
import fs from "fs";

const noteFileExtension = '.html'; // Adjust this if your notes use a different file extension
const fileEncoding = 'utf-8'; // Assuming the notes are UTF-8 encoded

export const getNotePath = (notesPath: string, noteName: string): string => {
    return path.join(notesPath, noteName + noteFileExtension); // Assuming the note files are HTML files, this may need to be adjusted
}

export const fileExists = (filePath: string): boolean => {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        throw new Error(`Failed to check if file exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const readFile = async (filePath: string): Promise<string> => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
    }
    try {
        return await fs.promises.readFile(filePath, fileEncoding); // Assuming the file is UTF-8 encoded
    }
    catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const writeFile = async (filePath: string, content: string): Promise<void> => {
    try {
        await fs.promises.writeFile(filePath, content, fileEncoding); // Assuming the file is UTF-8 encoded
    } catch (error) {
        throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}