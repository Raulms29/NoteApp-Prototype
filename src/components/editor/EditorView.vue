<template>
    <div class="editor-wrapper">
        <div class="editor-container">
            <div class="note-title-underline-wrapper">
                <input v-if="notesStore.currentNote" v-model="noteName" @focusout="handleNoteRename"
                    class="note-title-input" spellcheck="true" autocapitalize="on" @focus="isFocused = true"
                    @blur="isFocused = false" />
                <span class="note-title-underline" :class="{ active: isFocused }"></span>
            </div>
            <div class="editor-pane" v-if="notesStore.currentNote">
                <Editor @note-change="handleNoteChange" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useNotesStore } from '../../stores/useNotesStore';
import { Note } from '../../services/domain/Note';
import { ref } from 'vue';
const notesStore = useNotesStore();

const noteName = ref<string>(notesStore.currentNote ? notesStore.currentNote.name : '');
const isFocused = ref(false);

function handleNoteRename() {
    noteName.value = noteName.value.trim();
    if (noteName.value === notesStore.currentNote?.name) {
        return;
    }
    notesStore.renameNote(notesStore.currentNote as Note, noteName.value);
}

function handleNoteChange() {
    if (notesStore.currentNote) {
        noteName.value = notesStore.currentNote.name;
    }
    else {
        noteName.value = '';
    }
};

import '../../styles/editor.css';
</script>

<style scoped>
.note-title-underline-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.note-title-input {
    border: none;
    outline: none;
    width: 100%;
    font-size: 3rem;
    font-weight: bold;
    background: transparent;
    padding-bottom: 4px;
}

.note-title-underline {
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

.note-title-underline.active {
    transform: scaleX(1);
}
</style>