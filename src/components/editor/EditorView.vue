<template>
    <div class="editor-wrapper">
        <div class="editor-container" v-if="notesStore.currentNote">
            <div class="note-name">
                <GenericErrorMessage v-if="renameError" :message="renameError" />

                <input v-model="noteName" @focusout="handleNoteRename" class="note-name-input" spellcheck="true"
                    autocapitalize="on" @focus="isFocused = true" @blur="isFocused = false" />
                <span class="note-name-underline" :class="{ active: isFocused }"></span>
            </div>

            <Editor @note-change="handleNoteChange" @note-content-update="handleNoteContentChange" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useNotesStore } from '../../stores/useNotesStore';
import { Note } from '../../services/domain/Note';
import { ref } from 'vue';
import debounce from 'debounce';

const notesStore = useNotesStore();

const noteName = ref<string>(notesStore.currentNote ? notesStore.currentNote.name : '');
const isFocused = ref(false);
const renameError = ref<string | null>(null);

const debouncedSave = debounce(async (content: string) => {
    notesStore.saveNoteContent(notesStore.currentNote as Note, content);
}, 500);

async function handleNoteRename() {
    noteName.value = noteName.value.trim();
    if (noteName.value != notesStore.currentNote.name) {
        try {
            await notesStore.renameNote(notesStore.currentNote as Note, noteName.value);
        } catch (e) {
            renameError.value = e.message;
            setTimeout(() => { renameError.value = null; }, 3000);
        }
    }
}

async function handleNoteChange(previousNote: Note, previousNoteContent: string) {
    if (previousNote != null) {
        debouncedSave.clear();
        await notesStore.saveNoteContent(previousNote, previousNoteContent);
    }
    noteName.value = notesStore.currentNote.name;
};

function handleNoteContentChange(content: string) {
    debouncedSave(content);
}

import '../../styles/editor.css';
</script>

<style scoped>
.note-name {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.generic-error-message {
    position: absolute;
    top: -2.25rem;
    left: 0;
    right: 0;
}

.note-name-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 3rem;
    font-weight: bold;
    background: transparent;
    padding-bottom: 4px;
}

.note-name-underline {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    width: 100%;
    background-color: var(--sidebar-text-separator-color);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    pointer-events: none;
}

.note-name-underline.active {
    transform: scaleX(1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-0.625rem);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>