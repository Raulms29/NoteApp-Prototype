<template>
    <editor-content :editor="editor" />
    <BubbleMenu v-if="editor" :editor="editor"></BubbleMenu>

    <div class="editor-info">
        <span>{{ editor.storage.characterCount.words() }} words</span>
        <span>{{ editor.storage.characterCount.characters() }} characters</span>
    </div>
</template>

<script lang="ts">
import { watch } from 'vue';
import { useNotesStore } from '../../stores/useNotesStore';
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

export default {
    emits: [
        'note-change',
        'note-content-update'
    ],
    components: {
        EditorContent: EditorContent,
    },

    data(): { editor: any, notesStore: ReturnType<typeof useNotesStore>, currentNote: Note } {
        return {
            editor: null,
            notesStore: useNotesStore(),
            currentNote: null,
        }
    },

    methods: {
        emitNoteChange(previousNote: Note, previousNoteContent: string) {
            this.$emit('note-change', previousNote, previousNoteContent);
        },
        emitNoteContentUpdate() {
            this.$emit('note-content-update', this.editor?.getHTML?.());
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
                        console.log('Creating new note:', noteName);
                        await this.notesStore.createNote(noteName);
                    },
                    getNoteIdFromName: (noteName: string): string => {
                        return this.notesStore.getNoteByName(noteName)?.id || null;
                    },
                    getNoteFromId: (noteId: string): Note => {
                        return this.notesStore.getNoteById(noteId);
                    },
                }),
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

const content = `
# A Heading

### Another Smaller Heading

This is just a Test Note, containing some Markdown elements:

- **Task Lists**
  - [ ] Pending Task 1
  - [ ] Pending Task 2
  - [x] Completed Task

- **Some Java Code**
\`\`\`java
public static void main(String[] args) {
    String hello = "Hello World!";
    System.out.println(hello);
}
\`\`\`
- **A Quote**

> "This is an example of a blockquote in Markdown."
> 
> — Unknown Author

1. Item 1
2. Item 2
3. Item 3

This is a [link](https://example.com) in Markdown.
`;

</script>

<style scoped></style>
