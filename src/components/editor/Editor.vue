<template>
    <div style="position: relative; min-height: 200px;" v-if="!isEditorChanging">
        <editor-content :editor="editor as any" />
        <BubbleMenu v-if="editor" :editor="editor as any" @image-upload="handleImageUpload"
            @pdf-upload="handlePdfUpload" />
        <div class="editor-info" v-if="editor">
            <span>{{ editor.storage?.characterCount?.words() || 0 }} words</span>
            <span>{{ editor.storage?.characterCount?.characters() || 0 }} characters</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeMount, onBeforeUnmount, nextTick } from 'vue';
import { useNotesStore } from '../../stores/useNotesStore';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { Note } from '../../business/domain/Note';
import { createEditor } from './createEditor';
import { EditorView } from '@tiptap/pm/view';

const emit = defineEmits(['note-change', 'note-content-update', 'update:isLoading']);
const notesStore = useNotesStore();
const editor = ref<Editor>(null);
const currentNote = ref<Note | null>(null);
const isEditorChanging = ref(false);

function emitNoteChange(previousNote: Note, previousNoteContent: string) {
    emit('note-change', previousNote, previousNoteContent);
}
function emitNoteContentUpdate() {
    emit('note-content-update', editor.value?.getHTML?.());
}
function emitLoadingState(isLoading: boolean) {
    emit('update:isLoading', isLoading);
}

async function handleImageUpload(filePath: string) {
    console.log('Handling image upload for file:', filePath);
    const [imagePath, imageName] = await notesStore.saveImage(filePath);
    const { state } = editor.value!;
    const { to } = state.selection;
    editor.value!.commands.setTextSelection(to);
    editor.value!.chain().focus().insertContent({ type: 'image', attrs: { src: imagePath, alt: imageName, title: imageName } }).run();
}

async function handlePdfUpload(filePath: string) {
    const [pdfPath, pdfName] = await notesStore.savePDF(filePath);
    const { state } = editor.value!;
    const { to } = state.selection;
    editor.value!.commands.setTextSelection(to);
    editor.value!.chain().focus().insertContent({ type: 'pdf', attrs: { src: pdfPath, title: pdfName } }).run();
}

function getNewEditor(content = '') {
    if (editor.value) {
        editor.value.destroy();
    }
    return createEditor(notesStore, emitNoteContentUpdate, {
        handleKeyDown(view: EditorView, event: KeyboardEvent) {
            if (event.key === 'Tab') {
                // Only insert tab if not inside a list item
                const { state } = view;
                const { $from } = state.selection;
                const parentType = $from.node(-1).type.name;
                if (
                    parentType !== 'listItem' &&
                    parentType !== 'bulletList' &&
                    parentType !== 'orderedList' &&
                    parentType !== 'taskList' &&
                    parentType !== 'taskItem'
                ) {
                    event.preventDefault();
                    view.dispatch(
                        view.state.tr.insertText('\t', view.state.selection.from, view.state.selection.to)
                    );
                    return true;
                }
            }
        }
    }, content);
}

onBeforeMount(() => {
    editor.value = getNewEditor();
    emitLoadingState(false);

    // Watch when the current note changes
    watch(
        () => notesStore.currentNote,
        async (newNote: Note) => {
            if (newNote && editor.value) {
                emitLoadingState(true);

                // Hide everything first
                isEditorChanging.value = true;
                await nextTick();

                // Capture old content before switching
                const content = editor.value.getHTML();

                // Load and set the new content
                const noteContent = await notesStore.loadCurrentNoteContent();
                const newEditor = getNewEditor(noteContent);
                editor.value = newEditor;

                // Handle side effects
                emitNoteChange(currentNote.value as Note, content);
                currentNote.value = newNote;

                // Show everything again
                isEditorChanging.value = false;
                emitLoadingState(false);

                // Focus triggers last to ensure cursor is ready
                if (noteContent.length === 0)
                    editor.value.commands.focus(0, { scrollIntoView: false });
            }
        },
        { immediate: true }
    );
});

onBeforeUnmount(() => {
    editor.value?.destroy();
});
</script>