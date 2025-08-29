import { Editor } from '@tiptap/vue-3';
import EHighlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Markdown } from 'tiptap-markdown';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { MarkdownLink } from './extensions/MarkdownLink';
import { NoteLink } from './extensions/NoteLink';
import { Note } from '../../business/domain/Note';
import { Pdf } from './extensions/PDF';
import { CustomImage } from './extensions/CustomImage';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import type { useNotesStore } from '../../stores/useNotesStore';

export function createEditor(notesStore: ReturnType<typeof useNotesStore>, emitNoteContentUpdate: () => void, editorProps = {}) {
    const editor = new Editor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Underline,
            EHighlight,
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
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Pdf,
        ],
        editorProps: {
            ...editorProps,
            attributes: {
                class: 'prose w-full border-none max-w-none m-0 outline-none h-full overflow-auto',
            },
        },
        content: '',
        onUpdate: () => {
            emitNoteContentUpdate();
        },
    });
    return editor;
}