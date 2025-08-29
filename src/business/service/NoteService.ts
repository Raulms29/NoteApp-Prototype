import { Note } from "../domain/Note";
import { NoteRepository } from "../repository/NoteRepository";


/**
 * Service class for managing notes and related file operations.
 * Provides methods for CRUD operations, file handling, and other utilities.
 */
export class NoteService {

    repo: NoteRepository;


    /**
     * Constructs a new NoteService and configures its data source.
     * @param notesPath - Path to the notes folder.
     * @param structurePath - Path to the notes structure file.
     * @param filesPath - Path to the files folder.
     */
    constructor(notesPath: string, structurePath: string, filesPath: string) {
        this.configureDataSource(notesPath, structurePath, filesPath);
    }


    /**
     * Configures the repository data source for notes and files.
     * @param notesPath - Path to the notes folder.
     * @param structurePath - Path to the notes structure file.
     * @param filesPath - Path to the files folder.
     */
    private configureDataSource(notesPath: string, structurePath: string, filesPath: string) {
        this.repo = new NoteRepository(notesPath, structurePath, filesPath);
    }


    /**
     * Saves the note tree structure.
     * @param notes - Array of Note objects representing the tree.
     */
    async saveNoteTree(notes: Note[]) {
        await this.repo.saveNoteTree(notes);
    }


    /**
     * Loads the note tree structure.
     * @returns A promise resolving to an array of Note objects.
     */
    async loadNoteTree(): Promise<Note[]> {
        return await this.repo.loadNoteTree();
    }


    /**
     * Retrieves the content of a given note.
     * @param note - The Note object to read content from.
     * @returns A promise resolving to the note's HTML content as a string.
     */
    async readNoteContent(note: Note): Promise<string> {
        return await this.repo.readNoteContent(note);
    }


    /**
     * Writes HTML content of a given note.
     * @param note - The Note object to write content to.
     * @param content - The HTML content to save.
     */
    async writeNoteContent(note: Note, content: string): Promise<void> {
        await this.repo.writeNoteContent(note, content);
    }


    /**
     * Renames a note and its associated file.
     * @param note - The Note object to rename.
     * @param newName - The new name for the note.
     */
    async renameNote(note: Note, newName: string) {
        const oldName = note.name;
        // Update the note's name
        note.name = newName;
        // Rename the file
        await this.repo.renameNoteFile(oldName, note.name);
    }


    /**
     * Deletes several notes provided as parameter.
     * @param notes - Array of Note objects to delete.
     */
    async deleteNotes(notes: Note[]): Promise<void> {
        await this.repo.deleteNoteFiles(notes);
    }


    /**
     * Saves the image and returns its filename and path.
     * @param sourcePath - The source path of the image file.
     * @returns An array containing the cleaned file path and file name.
     */
    async saveImage(sourcePath: string) {
        const [filePath, fileName] = await this.repo.saveImage(sourcePath);
        console.log(`Image saved to: ${filePath}, Name: ${fileName}`);
        const filePathC = this.preparePath(filePath);

        return [filePathC, fileName];
    }


    /**
     * Saves a PDF and returns its filename and
     * @param sourcePath - The source path of the PDF file.
     * @returns An array containing the cleaned file path and file name.
     */
    async savePDF(sourcePath: string) {
        const [filePath, fileName] = await this.repo.savePDF(sourcePath);
        const filePathC = this.preparePath(filePath);

        return [filePathC, fileName];
    }

    private preparePath(path: string): string {
        // Ensure the path uses forward slashes and remove leading slash if present
        let cleanedPath = path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
        cleanedPath = cleanedPath.startsWith('/') ? cleanedPath.slice(1) : cleanedPath; // Remove leading slash if present
        return cleanedPath;
    }


    /**
     * Flattens a tree of notes into a single array.
     * @param notes - Array of Note objects representing the tree.
     * @returns A flat array of all Note objects in the tree.
     */
    static flattenNotes(notes: Note[]): Note[] {
        const result: Note[] = [];
        for (const note of notes) {
            result.push(note);
            if (note.children && note.children.length > 0) {
                result.push(...this.flattenNotes(note.children));
            }
        }
        return result;
    }


    /**
     * Finds the breadcrumb path for a note in the tree.
     * @param currentNotes - Array of current Note objects to search.
     * @param targetId - The ID of the target note.
     * @param path - Array to store the breadcrumb path.
     * @returns True if the note is found, false otherwise.
     */
    static findBreadCrumb(currentNotes: Note[], targetId: string, path: Note[]): boolean {
        for (const n of currentNotes) {
            path.push(n);
            if (n.id === targetId) {
                return true;
            }
            if (n.children && n.children.length > 0) {
                if (this.findBreadCrumb(n.children, targetId, path)) {
                    return true;
                }
            }
            path.pop();
        }
        return false;
    }
}