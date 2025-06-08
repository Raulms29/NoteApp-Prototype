export { };

declare global {
    interface Window {
        fileAPI: {
            getNotePath: (notesPath: string, noteName: string) => Promise<string>;
            fileExists: (filePath: string) => Promise<boolean>;
            readFile: (filePath: string) => Promise<string>;
            writeFile: (filePath: string, content: string) => Promise<void>;
        };
    }
}
