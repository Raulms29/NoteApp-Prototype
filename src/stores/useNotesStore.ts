// src/stores/useNotesStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Note } from '../services/domain/Note'
import { NoteRepository } from '../services/NoteRepository'


export const useNotesStore = defineStore('notes', () => {
    const noteTree = ref<Note[]>()
    const currentNote = ref<Note | null>()
    let repo: NoteRepository

    // Initialize the repository with the workspace path
    function init(workSpacePath: string) {
        repo = new NoteRepository(workSpacePath, `${workSpacePath}/notes.json`)
        // repo.configureRepository(workSpacePath, `${workSpacePath}/notes.json`)
    }

    function updateNoteTree() {
        repo.saveNoteTree(noteTree.value)
    }

    async function loadTree(): Promise<void> {
        noteTree.value = await repo.loadNoteTree()
    }

    function selectNote(note: Note) {
        currentNote.value = note
    }

    function saveCurrentNoteContent(html: string) {
        if (!currentNote.value) throw new Error('No note selected to save content for.')
        repo.writeNoteContent(currentNote.value, html)
    }

    async function loadCurrentNoteContent(): Promise<string> {
        if (!currentNote.value) throw new Error('No note selected to load.')
        return await repo.readNoteContent(currentNote.value)
    }

    function renameNote(note: Note, newTitle: string) {
        repo.renameNoteFile(note, newTitle)
        updateNoteTree()
    }

    function deleteNote(noteToDelete: Note) {
        repo.deleteNoteFile(noteToDelete);

        for (const note of noteTree.value) {
            if (note.hasDescendant(noteToDelete)) {
                note.removeDescendant(noteToDelete);

                break; // Exit the loop once the descendant is removed
            }
        }
        updateNoteTree();
    }

    return {
        noteTree,
        currentNote,
        init,
        loadTree,
        selectNote,
        saveCurrentNoteContent,
        loadCurrentNoteContent,
        renameNote,
        deleteNote,
    }
})
