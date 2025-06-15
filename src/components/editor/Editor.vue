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
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count';


// Markdown.configure({
//     html: false,                  // Allow HTML input/output
//     tightLists: true,            // No <p> inside <li> in markdown output
//     tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight
//     bulletListMarker: '-',       // <li> prefix in markdown output
//     linkify: true,              // Create links from "https://..." text
//     breaks: false,               // New lines (\n) in markdown input are converted to <br>
//     transformPastedText: true,  // Allow to paste markdown text in the editor
//     transformCopiedText: true,  // Copied text is transformed to markdown
// })

export default {
    emits: ['note-change'],
    components: {
        EditorContent: EditorContent,
    },

    data(): { editor: any, notesStore: ReturnType<typeof useNotesStore> } {
        return {
            editor: null,
            notesStore: useNotesStore(),
        }
    },

    methods: {
        emitNoteChange() {
            this.$emit('note-change', this.editor?.getJSON?.());
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
            ],
            editorProps: {
                attributes: {
                    class: 'prose w-full border-none max-w-none m-0 outline-none h-full overflow-auto',
                },
            },
            content: '',
        });

        // Load the content of the current note
        watch(
            () => this.notesStore.currentNote, // Reactive property from the store
            async (newNote) => {
                console.log('Current note changed:', newNote);
                if (newNote && this.editor) {
                    this.editor.commands.setContent(await this.notesStore.loadCurrentNoteContent());
                    this.emitNoteChange();
                }
            },
            { immediate: true } // Load the content immediately if a note is already selected
        );
    },

    beforeUnmount() {
        this.editor.destroy()
    },

    // methods: {
    //     saveEditorContent() {
    //         if (this.editor) {
    //             const htmlContent = this.editor.getHTML();
    //             const blob = new Blob([htmlContent], { type: 'text/html' });
    //             const link = document.createElement('a');
    //             link.href = URL.createObjectURL(blob);
    //             link.download = 'editor-content.html';
    //             link.click();
    //             URL.revokeObjectURL(link.href);
    //         }
    //     },
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
