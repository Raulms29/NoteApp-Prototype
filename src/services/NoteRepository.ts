import { Note, RawNote } from "./domain/Note";
import { fileExists, getNotePath, readFile, writeFile, renameFile, getRandomFileName, joinPaths, getFilenameFromPath, getExtensionFromPath, copyFileToFolder, deleteFile } from "../utils/fileUtils";

export class NoteRepository {

    private notesPath: string;
    private structurePath: string;
    private filesPath: string;

    constructor(notesPath: string, structurePath: string, filesPath: string) {
        this.configureRepository(notesPath, structurePath, filesPath);
    }

    configureRepository(notesPath: string, structurePath: string, filesPath: string) {
        this.notesPath = notesPath;
        this.structurePath = structurePath;
        this.filesPath = filesPath;
    }

    /**
     * Loads the note structure from the JSON file.
     */
    async loadNoteTree(): Promise<Note[]> {
        if (!await fileExists(this.structurePath)) {
            throw new Error("Note structure file does not exist.");
        }

        const json = await readFile(this.structurePath);
        const data = JSON.parse(json);

        // Validate the structure of the parsed data
        if (!Array.isArray(data)) {
            throw new Error("Invalid note structure: Expected an array.");
        }

        // Recursively create Note objects from the raw data
        const createNote = (item: RawNote): Note => {

            // Recursively map children to Note objects
            const children = item._children
                ? item._children.map((child: RawNote) => createNote(child))
                : [];

            return new Note(
                item._name,
                children,
                item._id,
                new Date(item._createdAt)
            );
        };

        const notes: Note[] = data.map(createNote);

        return notes;
    }

    async renameNoteFile(oldName: string, newName: string) {
        const oldFilePath = await getNotePath(this.notesPath, oldName.trim());
        const newFilePath = await getNotePath(this.notesPath, newName.trim());

        if (!await fileExists(oldFilePath)) {
            throw new Error(`Note file does not exist: ${oldFilePath}`);
        }

        if (await fileExists(newFilePath)) {
            return; // If the new file already exists, do nothing
        }

        await renameFile(oldFilePath, newFilePath);
    }

    /**
    * Saves the note structure to the JSON file.
    * @param notes The note structure to save.
    */
    async saveNoteTree(notes: Note[]): Promise<void> {
        try {
            const json = JSON.stringify(notes, null, 2);
            await writeFile(this.structurePath, json);
        } catch (error) {
            throw new Error(`Failed to save note structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
    * Reads the HTML content of a specific note.
    */
    async readNoteContent(note: Note): Promise<string> {
        const filePath = await getNotePath(this.notesPath, note.name);
        return await readFile(filePath);
    }

    /**
     * Saves the HTML content of a specific note.
     */
    async writeNoteContent(note: Note | null, content: string): Promise<void> {
        const filePath = await getNotePath(this.notesPath, note.name);
        await writeFile(filePath, content);
    }

    /**
     * Deletes a specific note file.
     */
    async deleteNoteFiles(notes: Note[]): Promise<void> {
        for (const note of notes) {
            const filePath = await getNotePath(this.notesPath, note.name);
            if (await fileExists(filePath)) {
                await deleteFile(filePath);
            }
        }
    }

    /**
     * Saves an image by copying it from a source path to the files folder and returns the new filename.
     * Handles name collisions by generating a random name using getRandomFileName.
     * The actual copy is delegated to fileAPI.copyImageToFolder.
     */
    async saveImage(sourcePath: string): Promise<string> {
        console.log('Reached NoteRepository.saveImage');
        let filename = await getFilenameFromPath(sourcePath);
        const ext = await getExtensionFromPath(sourcePath);
        let destination = await joinPaths(this.notesPath, this.filesPath, filename);

        // Check for name collisions and generate random name if needed
        while (await fileExists(destination)) {
            const randomBase = getRandomFileName();
            console.log(`File name collision detected: ${filename} already exists. Generating a new name.`);
            console.log(`Random base name: ${randomBase}`);
            filename = `${randomBase}${ext}`;
            destination = await joinPaths(this.notesPath, this.filesPath, filename);
        }

        console.log('Files path:', this.filesPath);
        console.log(`Source path: ${sourcePath}`);
        console.log(`Destination path: ${destination}`);

        // Delegate the copy to fileUtils
        await copyFileToFolder(sourcePath, destination);

        return await joinPaths(this.filesPath, filename); // Return the full path of the saved image
    }
}