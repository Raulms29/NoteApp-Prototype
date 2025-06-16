// src/stores/useNotesStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Note } from '../services/domain/Note';
import { NoteRepository } from '../services/NoteRepository';
import { WorkspaceI } from '../services/domain/Workspace';


export const useNotesStore = defineStore('notes', () => {
    const notes = ref<Note[]>();
    const currentNote = ref<Note | null>(null);
    let repo: NoteRepository;

    // Initialize the repository with the workspace path
    function init(workspace: WorkspaceI) {
        repo = new NoteRepository(workspace.path, `${workspace.path}/.notes/notes.json`);
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

    async function renameNote(note: Note, newName: string) {
        const oldName = note.getFullName();
        // Update the note's name
        note.name = newName;
        // Rename the file
        console.log(`Renaming note from ${oldName} to ${note.getFullName()}`);
        await repo.renameNoteFile(oldName, note.getFullName());
        updateNoteTree();
    }

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

    function deleteNote(noteToDelete: Note) {
        if (!noteToDelete) {
            throw new Error('No note provided to delete.');
        }

        // Remove the note from the notes tree
        const removed = removeNoteFromTree(noteToDelete);
        if (!removed) {
            throw new Error(`Note with ID ${noteToDelete.id} not found in the note tree.`);
        }

        // Delete the note file
        repo.deleteNoteFile(noteToDelete);
        // Update the note tree after deletion
        updateNoteTree();
    }

    function moveNoteTo(noteToMove: Note, targetNote: Note) {
        // Perform note removal from the tree
        preMoveNote(noteToMove);

        console.log(`Moving note ${noteToMove.getFullName()} to ${targetNote.getFullName()}`);
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
        init,
        loadTree,
        selectNote,
        saveCurrentNoteContent,
        loadCurrentNoteContent,
        renameNote,
        deleteNote,
        moveNoteTo,
        moveNoteBefore,
        moveNoteAfter,
    };
});
