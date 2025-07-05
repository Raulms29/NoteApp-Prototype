<template>
    <editor-content v-if="editor" :editor="editor as any" />
    <BubbleMenu v-if="editor" :editor="editor as any" @image-upload="handleImageUpload" @pdf-upload="handlePdfUpload" />
    <div class="editor-info" v-if="editor">
        <span>{{ editor.storage?.characterCount?.words() || 0 }} words</span>
        <span>{{ editor.storage?.characterCount?.characters() || 0 }} characters</span>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeMount, onBeforeUnmount } from 'vue';
import { useNotesStore } from '../../stores/useNotesStore';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { Note } from '../../services/domain/Note';
import BubbleMenu from './bubble-menu/BubbleMenu.vue';
import { createEditor } from './createEditor';

const emit = defineEmits(['note-change', 'note-content-update']);
const notesStore = useNotesStore();
const editor = ref<Editor>(null);
const currentNote = ref<Note | null>(null);

function emitNoteChange(previousNote: Note, previousNoteContent: string) {
    emit('note-change', previousNote, previousNoteContent);
}
function emitNoteContentUpdate() {
    emit('note-content-update', editor.value?.getHTML?.());
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
    editor.value = createEditor(notesStore, emitNoteContentUpdate);

    watch(
        () => notesStore.currentNote,
        async (newNote: Note) => {
            if (newNote && editor.value) {
                const content = editor.value.getHTML();
                editor.value.commands.setContent(await notesStore.loadCurrentNoteContent());
                emitNoteChange(currentNote.value as Note, content);
                currentNote.value = newNote;
            }
        },
        { immediate: true }
    );
});

onBeforeUnmount(() => {
    editor.value?.destroy();
});

defineExpose({
    editor,
})
</script>
