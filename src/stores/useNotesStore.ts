import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Note } from '../business/domain/Note';
import { Workspace } from '../business/domain/Workspace';
import { NoteService } from '../business/service/NoteService';

/**
 * Pinia store for managing notes in the application
 */
export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>();
    const currentNote = ref<Note | null>(null);
    const firstNoteAccess = ref<boolean>(true);
    let noteService: NoteService;

    /**
     * Initializes the note store for the given workspace and loads the note tree.
     * @param workspace - The workspace to initialize the store
     */
    async function init(workspace: Workspace) {
        noteService = new NoteService(
            workspace.path,
            await workspace.notesStructureFilePath(),
            workspace.filesFolder
        );
        await loadTree();
    }

    function updateNoteTree() {
        noteService.saveNoteTree(notes.value);
    }

    /**
     * Loads the note tree from the repository into the store.
     */
    async function loadTree(): Promise<void> {
        notes.value = await noteService.loadNoteTree();
    }

    /**
     * Selects a note from the note tree.
     * @param note - The note to select.
     */
    async function selectNote(note: Note) {
        const existingNote = getNoteById(note.id);
        console.log(`Selecting note: ${note.name}`);
        if (existingNote) {
            note.lastAccessed = new Date();
            currentNote.value = note;
        }
        else {
            currentNote.value = null;
        }
        updateNoteTree();
    }

    /**
     * Saves the HTML content for the specified note.
     * @param note - The note to save content for.
     * @param html - The HTML content to save.
     */
    async function saveNoteContent(note: Note, html: string) {
        if (!currentNote.value) throw new Error('No note selected to save content for.');
        await noteService.writeNoteContent(note, html);
    }

    /**
     * Loads the HTML content of the currently selected note.
     * @returns The HTML content as a string.
     */
    async function loadCurrentNoteContent(): Promise<string> {
        if (!currentNote.value) throw new Error('No note selected to load.');
        return await loadNoteContent(currentNote.value as Note);
    }

    /**
     * Loads the HTML content of the specified note.
     * @param note - The note to load content for.
     * @returns The HTML content as a string.
     */
    async function loadNoteContent(note: Note): Promise<string> {
        if (!note) throw new Error('No note provided to load content for.');
        return await noteService.readNoteContent(note);
    }

    /**
     * Creates a new note with the given name and parent (if provided)
     * @param newName - The name for the new note.
     * @param parent - The parent note to add the new note to (optional).
     * @returns The newly created Note instance.
     */
    async function createNote(newName = 'New Note', parent?: Note): Promise<Note> {
        newName = newName.trim();

        function getNewNoteName(): string {
            let index = 1;
            let newNoteName = newName;
            const notesFlat = NoteService.flattenNotes(notes.value);
            while (notesFlat.some(n => n.name === newNoteName)) {
                newNoteName = `${newName} ${index++}`;
            }
            return newNoteName;
        }

        const newNote = new Note(getNewNoteName());
        const parentTree = getNoteById(parent?.id);

        if (parentTree === null) {
            notes.value.push(newNote);
        }
        else {
            parentTree.addChild(newNote);
        }

        await noteService.writeNoteContent(newNote, ''); // Initialize with empty content

        updateNoteTree();
        return newNote;
    }

    /**
     * Renames the specified note and updates the note tree and file.
     * @param note - The note to rename.
     * @param newName - The new name for the note.
     */
    async function renameNote(note: Note, newName: string) {
        if (getNoteByName(newName) !== null) {
            throw new Error(`A note with the name "${newName}" already exists.`);
        }
        await noteService.renameNote(note, newName);
        updateNoteTree();
    }

    /**
     * Deletes the specified note and its descendants from the note tree and files.
     * @param noteToDelete - The note to delete.
     */
    function deleteNote(noteToDelete: Note) {
        if (!noteToDelete) {
            throw new Error('No note provided to delete.');
        }

        // Remove the note from the notes tree
        const removed = removeNoteFromTree(noteToDelete);
        if (!removed) {
            throw new Error(`Note with ID ${noteToDelete.id} not found in the note tree.`);
        }

        const descendants = noteToDelete.getNoteDescendants();

        // Delete the note file
        noteService.deleteNotes([noteToDelete, ...descendants]);
        if (currentNote.value?.id === noteToDelete.id) {
            currentNote.value = null; // Clear current note if it was the one deleted
        }
        // Update the note tree after deletion
        updateNoteTree();
    }

    /**
     * Moves a note to be a child of another note.
     * @param noteToMove - The note to move.
     * @param targetNote - The target parent note.
     */
    function moveNoteTo(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Add the note to the new parent
        targetNote.addChild(noteToMove);

        updateNoteTree();
    }

    /**
     * Moves a note before another note in the note tree.
     * @param noteToMove - The note to move.
     * @param targetNote - The target note to move before.
     */
    function moveNoteBefore(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Insert the note before the target note
        insertInPosition(notes.value, noteToMove, targetNote, (i) => i);

        updateNoteTree();
    }

    /**
     * Moves a note after another note in the note tree.
     * @param noteToMove - The note to move.
     * @param targetNote - The target note to move after.
     */
    function moveNoteAfter(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Insert the note after the target note
        insertInPosition(notes.value, noteToMove, targetNote, (i) => i + 1);

        updateNoteTree();
    }

    /**
     * Resets the notes store, clearing all currently stored information
     */
    function reset() {
        notes.value = [];
        currentNote.value = null;
        noteService = null;
    }

    /**
     * Finds a note by its name.
     * @param name - The name of the note to find.
     * @returns The found Note instance or null if not found.
     */
    function getNoteByName(name: string): Note {
        if (!notes.value) return null;
        const flatNotes = NoteService.flattenNotes(notes.value);
        return flatNotes.find(note => note.name === name) || null;
    }

    /**
     * Finds a note by its ID.
     * @param id - The ID of the note to find.
     * @returns The found Note instance or null if not found.
     */
    function getNoteById(id: string): Note {
        if (!notes.value) return null;
        const flatNotes = NoteService.flattenNotes(notes.value);
        return flatNotes.find(note => note.id === id) || null;
    }

    /**
     * Saves an image to the files folder and returns its path and name.
     * @param sourcePath - The source path of the image file.
     * @returns An array containing the cleaned file path and file name.
     */
    async function saveImage(sourcePath: string): Promise<string[]> {
        return await noteService.saveImage(sourcePath);
    }

    /**
     * Saves a PDF to the files folder and returns its path and name.
     * @param sourcePath - The source path of the PDF file.
     * @returns An array containing the cleaned file path and file name.
     */
    async function savePDF(sourcePath: string): Promise<string[]> {
        return await noteService.savePDF(sourcePath);
    }

    /**
     * Gets the breadcrumb path for a given note in the note tree.
     * @param note - The note to get the breadcrumb for.
     * @returns An array of Note instances representing the path.
     */
    function getNoteBreadcrumb(note: Note): Note[] {
        if (!note) {
            throw new Error('No note provided to get breadcrumb for.');
        }
        const path: Note[] = [];
        if (!notes.value || !NoteService.findBreadCrumb(notes.value, note.id, path)) {
            throw new Error('Note not found in the note tree.');
        }

        return path;
    }

    /**
     * Returns the most recently accessed note (by lastAccessed property).
     * @returns The most recently accessed Note instance or null if none found.
     */
    function getLastNoteAccesed(): Note | null {
        const allNotes = NoteService.flattenNotes(notes.value ?? []);
        return allNotes.reduce((last, note) => {
            const lastAccesed = note.lastAccessed;
            if (!lastAccesed) return last;
            if (!last || lastAccesed.getTime() > (last.lastAccessed?.getTime?.() ?? 0)) {
                return note;
            }
            return last;
        }, null);
    }

    // --- PRIVATE/HELPER FUNCTIONS ---
    function removeNoteFromTree(noteToDelete: Note): boolean {
        let removed = false;
        for (const note of notes.value) {
            if (note.hasNoteDescendant(noteToDelete)) {
                removed = note.removeDescendantNote(noteToDelete);
                break;
            }
            if (note.id === noteToDelete.id) {
                notes.value.splice(notes.value.indexOf(note), 1);
                removed = true;
                break;
            }
        }
        return removed;
    }

    function insertInPosition(tree: Note[], noteToMove: Note, targetNote: Note, getPosition: (i: number) => number): boolean {
        for (let i = 0; i < tree.length; i++) {
            if (tree[i].id === targetNote.id) {
                tree.splice(getPosition(i), 0, noteToMove);
                return true;
            }
            if (tree[i].children && insertInPosition(tree[i].children, noteToMove, targetNote, getPosition)) {
                return true;
            }
        }
        return false;
    }

    function preMoveNote(noteToMove: Note): void {
        if (!noteToMove) {
            throw new Error('No note provided to move.');
        }
        const removed = removeNoteFromTree(noteToMove);
        if (!removed) {
            throw new Error(`Note with ID ${noteToMove.id} not found in the note tree.`);
        }
    }



    return {
        noteTree: notes,
        currentNote,
        /** True if no note has been accessed yet, false otherwise */
        firstNoteAccess,
        init,
        loadTree,
        selectNote,
        saveNoteContent,
        loadCurrentNoteContent,
        loadNoteContent,
        createNote,
        renameNote,
        deleteNote,
        moveNoteTo,
        moveNoteBefore,
        moveNoteAfter,
        reset,
        getNoteByName,
        getNoteById,
        saveImage,
        savePDF,
        getNoteBreadcrumb,
        getLastNoteAccesed
    };
});
