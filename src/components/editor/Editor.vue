<template>
    <div style="position: relative; min-height: 200px;">
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
import { ref, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useNotesStore } from '../../stores/useNotesStore';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { Note } from '../../services/domain/Note';
import { createEditor } from './createEditor';
import { EditorView } from '@tiptap/pm/view';

const emit = defineEmits(['note-change', 'note-content-update', 'update:isLoading']);
const notesStore = useNotesStore();
const editor = ref<Editor>(null);
const currentNote = ref<Note | null>(null);
const props = defineProps<{ isLoading: boolean }>();
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

onBeforeMount(() => {
    editor.value = createEditor(notesStore, emitNoteContentUpdate, {
        handleKeyDown(view: EditorView, event: KeyboardEvent) {
            if (event.key === 'Tab') {
                event.preventDefault();
                view.dispatch(
                    view.state.tr.insertText('\t', view.state.selection.from, view.state.selection.to)
                );
                return true;
            }
        }
    });
    emitLoadingState(false);

    // Whatch when the current note changes and update the editor content accordingly
    watch(
        () => notesStore.currentNote,
        async (newNote: Note) => {
            if (newNote && editor.value) {
                emitLoadingState(true);
                const content = editor.value.getHTML();
                const noteContent = await notesStore.loadCurrentNoteContent();
                editor.value.commands.setContent(noteContent);
                emitNoteChange(currentNote.value as Note, content);
                currentNote.value = newNote;
                emitLoadingState(false);
            }
        },
        { immediate: true }
    );
});

onBeforeUnmount(() => {
    editor.value?.destroy();
});
</script>
