<template>
    <editor-content :editor="editor" />
    <BubbleMenu v-if="editor" :editor="editor" @image-upload="handleImageUpload" @pdf-upload="handlePdfUpload">
    </BubbleMenu>

    <div class="editor-info">
        <span>{{ editor?.storage?.characterCount?.words() || 0 }} words</span>
        <span>{{ editor?.storage?.characterCount?.characters() || 0 }} characters</span>
    </div>
</template>

<script lang="ts">
import { watch } from 'vue';
import { useNotesStore } from '../../stores/useNotesStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { Markdown } from 'tiptap-markdown';
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { MarkdownLink } from './extensions/MarkdownLink';
import { NoteLink } from './extensions/NoteLink';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count';
import { Note } from '../../services/domain/Note';
import Image from '@tiptap/extension-image';
import { Pdf } from './extensions/PDF';
import { title } from 'process';

export default {
    emits: [
        'note-change',
        'note-content-update'
    ],
    components: {
        EditorContent: EditorContent,
    },

    data(): { editor: any, notesStore: ReturnType<typeof useNotesStore>, workspaceStore: ReturnType<typeof useWorkspaceStore>, currentNote: Note, imageUrl: string } {
        return {
            editor: null,
            notesStore: useNotesStore(),
            workspaceStore: useWorkspaceStore(),
            currentNote: null,
            imageUrl: '',
        }
    },

    methods: {
        emitNoteChange(previousNote: Note, previousNoteContent: string) {
            this.$emit('note-change', previousNote, previousNoteContent);
        },
        emitNoteContentUpdate() {
            this.$emit('note-content-update', this.editor?.getHTML?.());
        },
        /**
         * Handles image upload from BubbleMenu. Receives the file path, saves the image, and inserts it into the editor.
         */
        async handleImageUpload(filePath: string) {
            const [imagePath, imageName] = await this.notesStore.saveImage(filePath);
            // Insert image after the current selection
            const { state } = this.editor;
            const { to } = state.selection;
            // Move the cursor to the end of the selection
            this.editor.commands.setTextSelection(to);
            // Insert the image at the new cursor position
            this.editor.chain().focus().insertContent({ type: 'image', attrs: { src: imagePath, alt: imageName } }).run();
        },
        /**
         * Handles PDF upload from BubbleMenu. Receives the file path, saves the PDF, and inserts it into the editor.
         */
        async handlePdfUpload(filePath: string) {
            const [pdfPath, pdfName] = await this.notesStore.savePDF(filePath);
            const { state } = this.editor;
            const { to } = state.selection;
            this.editor.commands.setTextSelection(to);
            this.editor.chain().focus().insertContent({ type: 'pdf', attrs: { src: pdfPath, alt: pdfName } }).run();
        },
    },

    beforeMount() {
        this.editor = new Editor({
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                }),
                Underline,
                Highlight,
                Typography,
                Markdown.configure({
                    linkify: false,
                    transformCopiedText: true,
                    transformPastedText: true,
                }),
                TaskList.configure({
                }),
                TaskItem.configure({
                    nested: true,
                }),
                CodeBlockLowlight.configure({
                    lowlight: createLowlight(common),
                }),
                MarkdownLink,
                BubbleMenuExtension,
                CharacterCount,
                NoteLink.configure({
                    onSelectNote: (noteID: string) => {
                        const note = this.notesStore.getNoteById(noteID);
                        this.notesStore.selectNote(note);
                    },
                    onNonExistingId: async (noteName: string) => {
                        await this.notesStore.createNote(noteName);
                    },
                    getNoteIdFromName: (noteName: string): string => {
                        return this.notesStore.getNoteByName(noteName)?.id || null;
                    },
                    getNoteFromId: (noteId: string): Note => {
                        return this.notesStore.getNoteById(noteId);
                    },
                }),
                Image.configure({
                    inline: true,
                    allowBase64: true,
                    HTMLAttributes: {
                        class: 'max-w-full h-auto',
                    },
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
                this.emitNoteContentUpdate();
            },
        });

        // Load the content of the current note
        watch(
            () => this.notesStore.currentNote, // Reactive property from the store
            async (newNote) => {
                console.log('Current note changed:', newNote.name);
                if (newNote && this.editor) {
                    const content = this.editor.getHTML();
                    this.editor.commands.setContent(await this.notesStore.loadCurrentNoteContent());
                    this.emitNoteChange(this.currentNote, content);
                    this.currentNote = newNote;
                }
            },
            { immediate: true, } // Load the content immediately if a note is already selected
        );
    },

    beforeUnmount() {
        this.editor.destroy()
    },
}
</script>

<style scoped></style>
