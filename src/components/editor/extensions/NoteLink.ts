import { Mark, mergeAttributes, InputRule, PasteRule, ExtendedRegExpMatchArray, Range, Editor } from '@tiptap/core';
import { MarkType, Node, Mark as ProseMirrorMark } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Note } from '../../../services/domain/Note';

const nonExistingId = '_______NonExistingID_______';

// Regex to match [[NoteName]]
const noteLinkRegex = /\[\[([^\]]{1,32})\]\]/g;

export const NoteLink = Mark.create({
    name: 'noteLink',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'note-link',
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onSelectNote: (noteId: string): void => {
                return;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onNonExistingId: async (noteName: string): Promise<void> => {
                return;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getNoteIdFromName: () => (noteName: string): string => {
                return '';
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getNoteFromId: (noteId: string): Note => {
                return null;
            }
        };
    },

    addAttributes() {
        return {
            noteId: {
                default: null,
                parseHTML: element => element.getAttribute('data-note-id'),
                renderHTML: attributes => {
                    return attributes.noteId ? { 'data-note-id': attributes.noteId } : {};
                },
            },
            noteName: {
                default: null,
                parseHTML: element => element.getAttribute('data-note-name'),
                renderHTML: attributes => {
                    return attributes.noteName ? { 'data-note-name': attributes.noteName } : {};
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-note-id][data-note-name]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0
        ];
    },

    addInputRules() {
        return [
            new InputRule({
                find: noteLinkRegex,
                handler: ({ match, state, range }) => replaceWithNoteLink({ match, state, range, type: this.type, options: this.options }),
            }),
        ];
    },

    addPasteRules() {
        return [
            new PasteRule({
                find: noteLinkRegex,
                handler: ({ match, state, range }) => replaceWithNoteLink({ match, state, range, type: this.type, options: this.options }),
            }),
        ];
    },

    addProseMirrorPlugins() {
        const plugins: Plugin[] = [];
        plugins.push(
            new Plugin({
                props: {
                    handleClick: (view, pos) => {
                        const resolvedPos = view.state.doc.resolve(pos);
                        const marks = resolvedPos.marks();
                        const mark = marks.find((mark) => mark.type.name === this.name);

                        if (mark?.attrs) {
                            if (mark.attrs?.noteId === nonExistingId || this.options.getNoteFromId(mark.attrs.noteId) === null) {
                                this.options.onNonExistingId(mark.attrs.noteName).then(() => {
                                    const newId = this.options.getNoteIdFromName(mark.attrs.noteName);
                                    // Update the mark in the document
                                    updateNoteLinkMark(this.editor, mark.attrs.noteName, newId, mark.attrs.noteId);
                                    this.options.onSelectNote(newId);
                                });
                                return true;
                            }
                            else {
                                this.options.onSelectNote(mark.attrs.noteId);
                                return true;
                            }
                        }
                    },

                    handleKeyDown(view, event) {
                        if (event.key === ' ' || event.key === 'Enter') {
                            const { state, dispatch } = view;
                            const { selection, schema } = state;
                            if (selection.empty) {
                                const { $from } = selection;
                                const noteLinkMark = schema.marks.noteLink;
                                if (noteLinkMark && $from.marks().some(mark => mark.type === noteLinkMark)) {
                                    dispatch(state.tr.removeStoredMark(noteLinkMark));
                                }
                            }
                        }
                        return false;
                    },
                },
            })
        );
        return plugins;
    },
});


type NoteLinkOptions = {
    onSelectNote: (noteId: string) => void;
    onNonExistingId: (noteName: string) => Promise<void>;
    getNoteIdFromName: (noteName: string) => string;
};

// Helper function to replace matched text with a note link mark
function replaceWithNoteLink({ match, state, range, type, options }: { match: ExtendedRegExpMatchArray, state: EditorState, range: Range, type: MarkType, options: NoteLinkOptions }) {
    let [, noteName] = match;
    noteName = noteName.trim();
    const { tr } = state;

    const noteId = options.getNoteIdFromName(noteName) ?? nonExistingId;

    const mark = type.create({ noteName: noteName, noteId: noteId });
    tr.replaceWith(
        range.from,
        range.to,
        state.schema.text(noteName, [mark])
    );

    // Calculate the new position after the replacement
    const newPos = range.from + noteName.length;

    // Set the selection after the inserted link
    tr.setSelection(TextSelection.create(tr.doc, newPos));

    state.apply(tr);
}

/**
 * Updates all NoteLink marks with a given note name to have a new noteId.
 * Call this after async note creation.
 */
function updateNoteLinkMark(editor: Editor, noteName: string, newNoteId: string, previousNoteId: string) {
    const { state, view } = editor;
    const { tr, doc, schema } = state;
    const markType = schema.marks.noteLink;

    doc.descendants((node: Node, pos: number) => {
        if (!node.isText) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.marks.forEach((mark: ProseMirrorMark) => {
            if (
                mark.type === markType &&
                mark.attrs.noteName === noteName &&
                mark.attrs.noteId === previousNoteId
            ) {
                // Remove old mark
                tr.removeMark(pos, pos + node.nodeSize, markType);
                // Add new mark with updated noteId
                tr.addMark(
                    pos,
                    pos + node.nodeSize,
                    markType.create({ noteName, noteId: newNoteId })
                );
            }
        });
    });

    if (tr.docChanged) {
        view.dispatch(tr);
    }
}