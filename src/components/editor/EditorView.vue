<template>
    <div class="editor-wrapper">
        <div class="options">
            <button class="focus-mode-icon-btn" @click.stop="toggleFocusMode" v-if="notesStore.currentNote"
                :title="settingsStore.settings.focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'">
                <BullseyeIcon v-if="!settingsStore.settings.focusMode" :size="20" />
                <BullseyeArrowIcon v-else :size="20" />
            </button>

            <EditorOptions v-if="notesStore.currentNote && editor" :editor="editor.editor" />
        </div>

        <div class="editor-container" v-if="notesStore.currentNote">
            <div class="note-name">
                <GenericErrorMessage v-if="renameError" :message="renameError" />

                <input v-model="noteName" @focusout="handleNoteRename" class="note-name-input" spellcheck="true"
                    autocapitalize="on" @focus="isFocused = true" @blur="isFocused = false" />
                <span class="note-name-underline" :class="{ active: isFocused }"></span>
            </div>

            <Editor ref="editor" @note-change="handleNoteChange" @note-content-update="handleNoteContentChange" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useNotesStore } from '../../stores/useNotesStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Note } from '../../services/domain/Note';
import { ref } from 'vue';
import debounce from 'debounce';
import BullseyeIcon from 'icons/Bullseye.vue';
import BullseyeArrowIcon from 'icons/BullseyeArrow.vue';
import Editor from './Editor.vue';

const notesStore = useNotesStore();
const settingsStore = useSettingsStore();
const editor = ref<typeof Editor | null>(null);

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

    // Reset the editor scroll position to the top
    const el = document.getElementById('editorPane');
    el.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

function handleNoteContentChange(content: string) {
    debouncedSave(content);
}

function toggleFocusMode() {
    settingsStore.updateSetting('focusMode', !settingsStore.settings.focusMode);
}

import '../../styles/editor.css';
</script>

<style scoped>
.editor-wrapper {
    position: relative;
}

.options {
    position: fixed;
    top: 0.75rem;
    right: 1.5rem;
    display: flex;
    background: transparent;
    gap: 0.25rem;
}

.focus-mode-icon-btn {
    z-index: 10;
    background: var(--background-color, #fff);
    color: var(--primary-color, #007bff);
    border: none;
    outline: none;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    transition: background 0.2s, color 0.2s;
}

.focus-mode-icon-btn:hover {
    background: var(--primary-color, #007bff);
    color: #fff;
}

.focus-mode-icon-btn svg {
    display: block;
}

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