<template>
    <editor-content :editor="editor" />
</template>

<script>
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { Markdown } from 'tiptap-markdown';
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

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
        EditorContent,
    },

    data() {
        return {
            editor: null,
        }
    },

    mounted() {
        this.editor = new Editor({
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                }),
                Highlight,
                Typography,
                Markdown,
                TaskList.configure({
                    nested: true,
                }),
                TaskItem.configure({
                    nested: true,
                }),
                CodeBlockLowlight.configure({
                    lowlight: createLowlight(common),
                }),
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
`;

import '../styles/editor/task-list.css'
import '../styles/editor/atom-one-light.css'
</script>

<style scoped></style>
