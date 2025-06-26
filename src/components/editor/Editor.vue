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
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { Markdown } from 'tiptap-markdown';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { MarkdownLink } from './extensions/MarkdownLink';
import { NoteLink } from './extensions/NoteLink';
import { Note } from '../../services/domain/Note';
import { Pdf } from './extensions/PDF';
import { CustomImage } from './extensions/CustomImage';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';

import BubbleMenu from './BubbleMenu.vue';

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
    editor.value!.chain().focus().insertContent({ type: 'image', attrs: { src: imagePath, alt: imageName } }).run();
}

async function handlePdfUpload(filePath: string) {
    const [pdfPath, pdfName] = await notesStore.savePDF(filePath);
    const { state } = editor.value!;
    const { to } = state.selection;
    editor.value!.commands.setTextSelection(to);
    editor.value!.chain().focus().insertContent({ type: 'pdf', attrs: { src: pdfPath, title: pdfName } }).run();
}

onBeforeMount(() => {
    editor.value = new Editor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Underline,
            Highlight,
            Typography,
            Markdown.configure({
                linkify: false,
                transformCopiedText: true,
                transformPastedText: true,
            }),
            TaskList.configure({}),
            TaskItem.configure({ nested: true }),
            CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
            MarkdownLink,
            BubbleMenuExtension,
            CharacterCount,
            NoteLink.configure({
                onSelectNote: (noteID: string) => {
                    const note = notesStore.getNoteById(noteID);
                    notesStore.selectNote(note);
                },
                onNonExistingId: async (noteName: string) => {
                    await notesStore.createNote(noteName);
                },
                getNoteIdFromName: (noteName: string): string => {
                    return notesStore.getNoteByName(noteName)?.id || null;
                },
                getNoteFromId: (noteId: string): Note => {
                    return notesStore.getNoteById(noteId);
                },
            }),
            CustomImage.configure({
                inline: false,
                allowBase64: true,
            }),
            Pdf,
        ],
        editorProps: {
            attributes: {
                class: 'prose w-full border-none max-w-none m-0 outline-none h-full overflow-auto',
            },
        },
        content: '',
        onUpdate: () => {
            emitNoteContentUpdate();
        },
    });

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

<style scoped></style>
