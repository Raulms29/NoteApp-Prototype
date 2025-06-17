import { Note, RawNote } from "./domain/Note";
import fs from 'fs';
import { fileExists, getNotePath, readFile, writeFile, renameFile } from "../utils/fileUtils";

export class NoteRepository {

    private notesPath: string;
    private structurePath: string;

    constructor(notesPath: string, structurePath: string) {
        this.configureRepository(notesPath, structurePath);
    }

    configureRepository(notesPath: string, structurePath: string) {
        this.notesPath = notesPath;
        this.structurePath = structurePath;
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
            if (!this.isValidNote(item)) {
                throw new Error(`Invalid note structure for item: ${JSON.stringify(item)}`);
            }

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
        // TODO revise if this is needed
        if (!Array.isArray(notes) || !notes.every(this.isValidNote)) {
            throw new Error("Invalid note structure provided for saving.");
        }

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
    async deleteNoteFile(note: Note): Promise<void> {
        const filePath = await getNotePath(this.notesPath, note.name);
        if (fileExists(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            throw new Error(`Note file does not exist: ${filePath}`);
        }
    }

    /**
    * Validates if an object matches the Note structure..
    * Should be moved to utils???
    */
    private isValidNote(note: unknown): boolean {
        // TODO
        return note !== undefined; // Placeholder for actual validation logic
    }
}