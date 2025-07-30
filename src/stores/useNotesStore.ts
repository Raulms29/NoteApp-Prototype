// src/stores/useNotesStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Note } from '../services/domain/Note';
import { NoteRepository } from '../services/NoteRepository';
import { Workspace } from '../services/domain/Workspace';


export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>();
    const currentNote = ref<Note | null>(null);
    let repo: NoteRepository;

    // Initialize the repository
    async function init(workspace: Workspace) {
        repo = new NoteRepository(
            workspace.path,
            await workspace.notesStructureFilePath(),
            workspace.filesFolder
        );
        loadTree();
    }

    function updateNoteTree() {
        repo.saveNoteTree(notes.value);
    }

    async function loadTree(): Promise<void> {
        notes.value = await repo.loadNoteTree();
    }

    function selectNote(note: Note) {
        const existingNote = getNoteById(note.id);
        console.log(`Selecting note: ${note.name}`);
        if (!existingNote) {
            currentNote.value = null;
        }
        else {
            currentNote.value = note;
        }
    }

    async function saveNoteContent(note: Note, html: string) {
        if (!currentNote.value) throw new Error('No note selected to save content for.');
        await repo.writeNoteContent(note, html);
    }

    async function loadCurrentNoteContent(): Promise<string> {
        if (!currentNote.value) throw new Error('No note selected to load.');
        return await repo.readNoteContent(currentNote.value as Note);
    }

    async function loadNoteContent(note: Note): Promise<string> {
        if (!note) throw new Error('No note provided to load content for.');
        return await repo.readNoteContent(note);
    }

    async function renameNote(note: Note, newName: string) {
        if (getNoteByName(newName) !== null) {
            throw new Error(`A note with the name "${newName}" already exists.`);
        }
        const oldName = note.name;
        // Update the note's name
        note.name = newName;
        // Rename the file
        await repo.renameNoteFile(oldName, note.name);
        updateNoteTree();
    }

    function deleteNote(noteToDelete: Note) {
        if (!noteToDelete) {
            throw new Error('No note provided to delete.');
        }

        // Remove the note from the notes tree
        const removed = removeNoteFromTree(noteToDelete);
        if (!removed) {
            throw new Error(`Note with ID ${noteToDelete.id} not found in the note tree.`);
        }

        const descendants = noteToDelete.getDescendants();

        // Delete the note file
        repo.deleteNoteFiles([noteToDelete, ...descendants]);
        if (currentNote.value?.id === noteToDelete.id) {
            currentNote.value = null; // Clear current note if it was the one deleted
        }
        // Update the note tree after deletion
        updateNoteTree();
    }

    function moveNoteTo(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Add the note to the new parent
        targetNote.addChild(noteToMove);

        updateNoteTree();
    }

    function moveNoteBefore(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Insert the note before the target note
        insertInPosition(notes.value, noteToMove, targetNote, (i) => i);

        updateNoteTree();
    }

    function moveNoteAfter(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        // Insert the note after the target note
        insertInPosition(notes.value, noteToMove, targetNote, (i) => i + 1);

        updateNoteTree();
    }

    async function createNote(newName = 'New Note', parent?: Note): Promise<Note> {
        newName = newName.trim();

        function getNewNoteName(): string {
            let index = 1;
            let newNoteName = newName;
            const notesFlat = flattenNotes(notes.value);
            while (notesFlat.some(n => n.name === newNoteName)) {
                newNoteName = `${newName} ${index++}`;
            }
            return newNoteName;
        }

        const newNote = new Note(getNewNoteName());
        const parentTree = getNoteById(parent?.id);

        if (parentTree != null) {
            parentTree.addChild(newNote);
        }
        else {
            notes.value.push(newNote);
        }

        await repo.writeNoteContent(newNote, ''); // Initialize with empty content

        updateNoteTree();
        return newNote;
    }

    function reset() {
        notes.value = [];
        currentNote.value = null;
        repo = null;
    }

    function getNoteByName(name: string): Note {
        if (!notes.value) return null;
        const flatNotes = flattenNotes(notes.value);
        return flatNotes.find(note => note.name === name) || null;
    }

    function getNoteById(id: string): Note {
        if (!notes.value) return null;
        const flatNotes = flattenNotes(notes.value);
        return flatNotes.find(note => note.id === id) || null;
    }

    /**
     * Saves an image by copying it from a source path to the files folder and returns the new filename.
     */
    async function saveImage(sourcePath: string): Promise<string[]> {
        const [filePath, fileName] = await repo.saveImage(sourcePath);
        const filePathC = preparePath(filePath);

        return [filePathC, fileName];
    }

    async function savePDF(sourcePath: string): Promise<string[]> {
        const [filePath, fileName] = await repo.savePDF(sourcePath);
        const filePathC = preparePath(filePath);

        return [filePathC, fileName];
    }

    function getNoteBreadcrumb(note: Note): Note[] {
        if (!note) {
            throw new Error('No note provided to get breadcrumb for.');
        }
        const path: Note[] = [];
        if (!notes.value || !findBreadCrumb(notes.value, note.id, path)) {
            throw new Error('Note not found in the note tree.');
        }

        return path;
    }

    // --- PRIVATE/HELPER FUNCTIONS ---
    function removeNoteFromTree(noteToDelete: Note): boolean {
        let removed = false;
        for (const note of notes.value) {
            if (note.hasDescendant(noteToDelete)) {
                removed = note.removeDescendant(noteToDelete);
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

    function flattenNotes(notes: Note[]): Note[] {
        const result: Note[] = [];

        for (const note of notes) {
            result.push(note);
            if (note.children && note.children.length > 0) {
                result.push(...flattenNotes(note.children));
            }
        }
        return result;
    }

    function preparePath(path: string): string {
        // Ensure the path uses forward slashes and remove leading slash if present
        let cleanedPath = path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
        cleanedPath = cleanedPath.startsWith('/') ? cleanedPath.slice(1) : cleanedPath; // Remove leading slash if present
        return cleanedPath;
    }

    function findBreadCrumb(currentNotes: Note[], targetId: string, path: Note[]): boolean {
        for (const n of currentNotes) {
            path.push(n);
            if (n.id === targetId) {
                return true;
            }
            if (n.children && n.children.length > 0) {
                if (findBreadCrumb(n.children, targetId, path)) {
                    return true;
                }
            }
            path.pop();
        }
        return false;
    }

    return {
        noteTree: notes,
        currentNote,
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
        getNoteBreadcrumb
    };
});
