<template>
    <editor-content :editor="editor" />
    <BubbleMenu v-if="editor" :editor="editor"></BubbleMenu>
    <!-- <button @click="saveEditorContent" class="save-button">Save Content</button>
    <button @click="loadEditorContent" class="load-button">Load Content</button> -->
</template>

<script lang="ts">
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
    components: {
        EditorContent: EditorContent,
    },

    data() {
        return {
            editor: Editor,
        }
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
            ],
            editorProps: {
                attributes: {
                    class: 'prose w-full border-none max-w-none m-0 outline-none',
                },
            },
            content: content,
        })
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

    //     loadEditorContent() {
    //         const input = document.createElement('input');
    //         input.type = 'file';
    //         input.accept = 'text/html';
    //         input.addEventListener('change', (event) => {
    //             const file = (event.target as HTMLInputElement).files?.[0];
    //             if (file) {
    //                 const reader = new FileReader();
    //                 reader.onload = () => {
    //                     if (this.editor) {
    //                         this.editor.commands.setContent(reader.result as string);
    //                     }
    //                 };
    //                 reader.readAsText(file);
    //             }
    //         });
    //         input.click();
    //     },
    // },
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

import '../../styles/editor.css';
</script>

<style scoped>
.save-button,
.load-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.save-button:hover,
.load-button:hover {
    background-color: #0056b3;
}
</style>
