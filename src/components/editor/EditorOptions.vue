<template>
    <NDropdown v-if="notesStore.currentNote" class="editor-dropdown" :options="dropdownOptions"
        @select="handleDropdownSelect">
        <template #default>
            <button class="dropdown-trigger-btn" title="More options">
                <DotsHorizontal />
            </button>
        </template>
    </NDropdown>
</template>

<script lang="ts" setup>
import { NDropdown } from 'naive-ui';
import { useNotesStore } from '../../stores/useNotesStore';
import DotsHorizontal from 'icons/DotsHorizontal.vue';
import { Editor } from '@tiptap/vue-3';
import { exportNoteAsText, exportNoteAsMarkdown } from '../../services/ExportService';

const props = defineProps<{ editor: Editor }>();
const notesStore = useNotesStore();

const dropdownOptions = [
    { label: 'Export as Text', key: 'export-text' },
    { label: 'Export as Markdown', key: 'export-markdown' },
];

function handleDropdownSelect(key: string) {
    if (key === 'export-text') {
        exportAsText();
    }
    if (key === 'export-markdown') {
        exportAsMarkdown();
    }
}

console.log('EditorOptions component initialized.', props.editor);

function exportAsText() {
    const currentNote = notesStore.currentNote;
    exportNoteAsText(props.editor, currentNote.name);
}

function exportAsMarkdown() {
    const currentNote = notesStore.currentNote;
    exportNoteAsMarkdown(props.editor, currentNote.name);
}
</script>

<style scoped>
.editor-dropdown {
    position: absolute;
    top: 18px;
    right: 72px;
    z-index: 10;
}

.dropdown-trigger-btn {
    background: var(--background-color, #fff);
    color: var(--primary-color, #007bff);
    border: none;
    outline: none;
    border-radius: 6px;
    padding: 4px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.dropdown-trigger-btn:hover {
    background: var(--primary-color, #007bff);
    color: #fff;
}
</style>
