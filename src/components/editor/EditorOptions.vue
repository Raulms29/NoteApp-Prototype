<template>
    <NDropdown v-if="notesStore.currentNote" class="editor-dropdown" :options="dropdownOptions"
        @select="handleDropdownSelect">
        <template #default>
            <button class="dropdown-trigger-btn" title="More options">
                <DotsHorizontal />
            </button>
        </template>
    </NDropdown>
    <GenericDialog v-if="showDialog" :title="`Export ${notesStore.currentNote?.name}`"
        text="Do you want to include subnotes in the export?">

        <template #content>
            <div>
                Include subnotes in the export:
                <GenericSwitch v-model="includeSubnotes">
                    <template #checked>
                        Yes
                    </template>
                    <template #unchecked>
                        No
                    </template>
                </GenericSwitch>
            </div>
        </template>
        <template #actions>
            <GenericButton variant="secondary" @click="showDialog = false">Cancel</GenericButton>
            <GenericButton variant="primary" @click="exportNotes(includeSubnotes)">Export</GenericButton>
        </template>
    </GenericDialog>
</template>

<script lang="ts" setup>
import GenericSwitch from '../generic/switch/GenericSwitch.vue';
import { NDropdown } from 'naive-ui';
import { useNotesStore } from '../../stores/useNotesStore';
import DotsHorizontal from 'icons/DotsHorizontal.vue';
import { JSONContent } from '@tiptap/vue-3';
import ExportService from '../../business/service/ExportService';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { createEditor } from './createEditor';
import { Note } from '../../business/domain/Note';
import { ref } from 'vue';
import { Workspace } from '../../business/domain/Workspace';

const notesStore = useNotesStore();
const workspaceStore = useWorkspaceStore();
const exportService = new ExportService();
const showDialog = ref(false);

const tempEditor = createEditor(notesStore, () => { })

const emit = defineEmits(['update:isLoading']);

const currentOption = ref<string | null>(null);
const includeSubnotes = ref(false);

const dropdownOptions = [
    { label: 'Export as Text', key: 'export-text' },
    { label: 'Export as Markdown', key: 'export-markdown' },
    { label: 'Export as HTML', key: 'export-html' },
    { label: 'Export as PDF', key: 'export-pdf' }
];

function handleDropdownSelect(key: string) {
    if (dropdownOptions.some(option => option.key === key)) {
        showDialog.value = true;
        currentOption.value = key;
    }
}

function exportNotes(includeSubnotes: boolean) {
    showDialog.value = false;

    if (currentOption.value === 'export-text') {
        wrapWithLoading(exportAsText, includeSubnotes);
    }
    if (currentOption.value === 'export-markdown') {
        wrapWithLoading(exportAsMarkdown, includeSubnotes);
    }
    if (currentOption.value === 'export-html') {
        wrapWithLoading(exportAsHTML, includeSubnotes);
    }
    if (currentOption.value === 'export-pdf') {
        wrapWithLoading(exportAsPDF, includeSubnotes);
    }
}

async function getNotesContent(notes: Note[]): Promise<string[]> {
    const notesContent: string[] = [];
    for (const note of notes) {
        const content = await notesStore.loadNoteContent(note);
        notesContent.push(content);
    }
    return notesContent;
}

function getNotesNames(notes: Note[]): string[] {
    return notes.map(note => note.name);
}

async function exportAsText(includeSubnotes: boolean) {
    const notes: Note[] = getNotes(includeSubnotes);

    const notesText: string[] = [];
    const notesNames: string[] = getNotesNames(notes);
    const notesContent = await getNotesContent(notes);

    for (let i = 0; i < notes.length; i++) {
        const content = notesContent[i];
        tempEditor.commands.setContent(content);
        notesText.push(tempEditor.getText());
    }

    await exportService.exportNotesAsText(notesText, notesNames);
}

async function exportAsMarkdown(includeSubnotes: boolean) {
    const notes = getNotes(includeSubnotes);

    const notesMarkdown: string[] = [];
    const notesJSON: JSONContent[] = [];
    const notesNames = getNotesNames(notes);
    const notesContent = await getNotesContent(notes);

    for (let i = 0; i < notes.length; i++) {
        const content = notesContent[i];
        tempEditor.commands.setContent(content);
        notesMarkdown.push(tempEditor.storage.markdown.getMarkdown());
        notesJSON.push(tempEditor.getJSON());
    }
    await exportService.exportNoteAsMarkdown(notesMarkdown, notesNames, notesJSON, workspaceStore.currentWorkspace as Workspace);
}

async function exportAsHTML(includeSubnotes: boolean) {
    const notes: Note[] = getNotes(includeSubnotes);

    const notesHTML: string[] = [];
    const notesJSON: JSONContent[] = [];
    const notesNames = getNotesNames(notes);
    const notesContent = await getNotesContent(notes);

    for (let i = 0; i < notes.length; i++) {
        const content = notesContent[i];
        tempEditor.commands.setContent(content);
        notesHTML.push(tempEditor.getHTML());
        notesJSON.push(tempEditor.getJSON());
    }

    await exportService.exportNotesAsHTML(notesHTML, notesNames, notesJSON, workspaceStore.currentWorkspace as Workspace);
}

async function exportAsPDF(includeSubnotes: boolean) {
    const notes: Note[] = getNotes(includeSubnotes);
    const notesHTML: string[] = [];
    const notesNames = getNotesNames(notes);
    const notesContent = await getNotesContent(notes);

    for (let i = 0; i < notes.length; i++) {
        const content = notesContent[i];
        tempEditor.commands.setContent(content);
        notesHTML.push(tempEditor.getHTML());
    }

    await exportService.exportNotesAsPDF(notesHTML, notesNames);

}


function emitLoadingState(isLoading: boolean) {
    emit('update:isLoading', isLoading);
}

async function wrapWithLoading(fn: (includeSubnotes: boolean) => Promise<void>, includeSubnotes: boolean) {
    emitLoadingState(true);
    try {
        await fn(includeSubnotes);
    } finally {
        emitLoadingState(false);
    }
}

function getNotes(includeSubnotes: boolean): Note[] {
    const currentNote: Note = notesStore.currentNote as Note;
    let notes: Note[] = [currentNote];
    if (includeSubnotes) {
        notes.push(...currentNote.getDescendants());
    }
    return notes;
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
