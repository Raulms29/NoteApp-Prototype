import { Note } from "./domain/Note";
import fs from 'fs';
import { fileExists, getNotePath, readFile, writeFile } from "../utils/fileUtils";

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
        if (!fileExists(this.structurePath)) throw new Error("Note structure file does not exist.");

        const json = await readFile(this.structurePath);
        const data = JSON.parse(json);

        // Validate the structure of the parsed data
        if (!Array.isArray(data) || !data.every(this.isValidNote)) {
            throw new Error("Invalid note structure in JSON file.");
        }

        return data as Note[];
    }

    renameNoteFile(note: Note, newTitle: string) {
        const oldFilePath = getNotePath(this.notesPath, note.name);
        const newFilePath = getNotePath(this.notesPath, newTitle);

        if (!fileExists(oldFilePath)) {
            throw new Error(`Note file does not exist: ${oldFilePath}`);
        }

        if (fileExists(newFilePath)) {
            throw new Error(`A note with the name "${newTitle}" already exists.`);
        }

        fs.renameSync(oldFilePath, newFilePath);
        note.name = newTitle; // Update the note's name in memory
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
        const filePath = getNotePath(this.notesPath, note.name);
        return await readFile(filePath);
    }

    /**
     * Saves the HTML content of a specific note.
     */
    async writeNoteContent(note: Note, content: string): Promise<void> {
        const filePath = getNotePath(this.notesPath, note.name);
        await writeFile(filePath, content);
    }

    /**
     * Deletes a specific note file.
     */
    deleteNoteFile(note: Note): void {
        const filePath = getNotePath(this.notesPath, note.name);
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