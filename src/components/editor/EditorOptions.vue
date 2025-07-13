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
import ExportService from '../../services/ExportService';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

const props = defineProps<{ editor: Editor }>();
const notesStore = useNotesStore();
const workspaceStore = useWorkspaceStore();
const exportService = new ExportService();

const dropdownOptions = [
    { label: 'Export as Text', key: 'export-text' },
    { label: 'Export as Markdown', key: 'export-markdown' },
    { label: 'Export as HTML', key: 'export-html' },
    { label: 'Export as PDF', key: 'export-pdf' }
];

function handleDropdownSelect(key: string) {
    if (key === 'export-text') {
        exportAsText();
    }
    if (key === 'export-markdown') {
        exportAsMarkdown();
    }
    if (key === 'export-html') {
        exportAsHTML();
    }
    if (key === 'export-pdf') {
        exportAsPDF();
    }
}

function exportAsText() {
    const currentNote = notesStore.currentNote;
    exportService.exportNoteAsText(props.editor, currentNote.name);
}

function exportAsMarkdown() {
    const currentNote = notesStore.currentNote;
    exportService.exportNoteAsMarkdown(props.editor, currentNote.name, workspaceStore.currentWorkspace);
}

function exportAsHTML() {
    const currentNote = notesStore.currentNote;
    exportService.exportNoteAsHTML(props.editor, currentNote.name, workspaceStore.currentWorkspace);
}

function exportAsPDF() {
    const currentNote = notesStore.currentNote;
    exportService.exportNoteAsPDF(props.editor, currentNote.name, workspaceStore.currentWorkspace);
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
