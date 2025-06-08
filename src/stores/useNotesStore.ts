// src/stores/useNotesStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Note } from '../services/domain/Note';
import { NoteRepository } from '../services/NoteRepository';


export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>();
    const currentNote = ref<Note | null>(null);
    let repo: NoteRepository;

    // Initialize the repository with the workspace path
    function init(workSpacePath: string) {
        repo = new NoteRepository(workSpacePath, `${workSpacePath}/.notes/notes.json`);
        loadTree();
    }

    function updateNoteTree() {
        repo.saveNoteTree(notes.value);
    }

    async function loadTree(): Promise<void> {
        notes.value = await repo.loadNoteTree();
    }

    function selectNote(note: Note) {
        console.log(`Selecting note: ${note.getFullName()}`);
        currentNote.value = note;
    }

    function saveCurrentNoteContent(html: string) {
        if (!currentNote.value) throw new Error('No note selected to save content for.');
        repo.writeNoteContent(currentNote.value as Note, html);
    }

    async function loadCurrentNoteContent(): Promise<string> {
        if (!currentNote.value) throw new Error('No note selected to load.');
        return await repo.readNoteContent(currentNote.value as Note);
    }

    function renameNote(note: Note, newName: string) {
        const oldName = note.getFullName();
        // Update the note's name
        note.name = newName;
        // Rename the file
        repo.renameNoteFile(oldName, note.getFullName());
        updateNoteTree();
    }

    function deleteNote(noteToDelete: Note) {
        if (!noteToDelete) {
            throw new Error('No note provided to delete.');
        }

        // Remove the note from the notes tree
        let removed = false;

        // Delete the note from the current note tree
        for (const note of notes.value) {
            if (note.hasDescendant(noteToDelete)) {
                removed = note.removeDescendant(noteToDelete);
                break;
            }
        }

        if (!removed) {
            throw new Error(`Note with ID ${noteToDelete.id} not found in the note tree.`);
        }

        // Delete the note file
        repo.deleteNoteFile(noteToDelete);
        // Update the note tree after deletion
        updateNoteTree();
    }

    return {
        noteTree: notes,
        currentNote,
        init,
        loadTree,
        selectNote,
        saveCurrentNoteContent,
        loadCurrentNoteContent,
        renameNote,
        deleteNote,
    };
});
