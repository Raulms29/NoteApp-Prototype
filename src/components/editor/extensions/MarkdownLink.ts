import { Mark, mergeAttributes, InputRule, PasteRule } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { TextSelection } from 'prosemirror-state';
import '@tiptap/extension-link';

const markdownLinkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+(?:\([^\s)]+\)[^\s)]*)*)\)/g;

export const MarkdownLink = Mark.create({
    name: 'markdownLink',

    addOptions() {
        return {
            openOnClick: true,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer',
                class: null as string | null,
            },
            isAllowedUri: (url: string) => {
                const allowedProtocols = ['http', 'https', 'mailto'];
                return allowedProtocols.some((protocol) => url.startsWith(`${protocol}:`));
            },
        };
    },

    addAttributes() {
        return {
            href: {
                default: null,
                parseHTML: (element) => element.getAttribute('href'),
            },
            target: {
                default: this.options.HTMLAttributes.target,
            },
            rel: {
                default: this.options.HTMLAttributes.rel,
            },
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'a[href]',
                getAttrs: (dom) => {
                    const href = (dom as HTMLElement).getAttribute('href');
                    if (!href || !this.options.isAllowedUri(href)) {
                        return false; // Invalid link
                    }
                    return null;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setLink:
                (attributes) =>
                    ({ chain }) => {
                        const { href } = attributes;
                        if (!this.options.isAllowedUri(href)) {
                            return false;
                        }
                        return chain().setMark(this.name, attributes).run();
                    },

            toggleLink:
                (attributes) =>
                    ({ chain }) => {
                        const { href } = attributes;
                        if (!this.options.isAllowedUri(href)) {
                            return false;
                        }
                        return chain().toggleMark(this.name, attributes).run();
                    },

            unsetLink:
                () =>
                    ({ chain }) => {
                        return chain().unsetMark(this.name).run();
                    },
        };
    },

    addInputRules() {
        return [
            new InputRule({
                find: markdownLinkRegex,
                handler: ({ match, state, range }) => {
                    const [, text, href] = match;

                    const { tr } = state;
                    const mark = this.type.create({ href });

                    // Replace the matched text with a new text node and apply the mark
                    tr.replaceWith(
                        range.from,
                        range.to,
                        state.schema.text(text, [mark])
                    );

                    // Finalize the transaction to prevent the mark from extending
                    tr.removeStoredMark(this.type);

                    // Calculate the new position after the replacement
                    const newPos = range.from + text.length;

                    // Set the selection after the inserted link
                    tr.setSelection(TextSelection.create(tr.doc, newPos));

                    // Dispatch the transaction
                    state.apply(tr);
                },
            }),
        ];
    },

    addPasteRules() {
        return [
            new PasteRule({
                find: markdownLinkRegex,
                handler: ({ match, state, range }) => {
                    const [, text, href] = match;

                    const { tr } = state;
                    const mark = this.type.create({ href });

                    // Replace the matched text with a new text node and apply the mark
                    tr.replaceWith(
                        range.from,
                        range.to,
                        state.schema.text(text, [mark])
                    );

                    // Finalize the transaction to prevent the mark from extending
                    // tr.removeStoredMark(this.type);

                    // Calculate the new position after the replacement
                    const newPos = range.from + text.length;

                    // Set the selection after the inserted link
                    tr.setSelection(TextSelection.create(tr.doc, newPos));

                    // Dispatch the transaction
                    state.apply(tr);
                },
            }),
        ];
    },

    addProseMirrorPlugins() {
        const plugins: Plugin[] = [];

        if (this.options.openOnClick) {
            plugins.push(
                new Plugin({
                    props: {
                        handleClick: (view, pos) => {
                            const resolvedPos = view.state.doc.resolve(pos);
                            const marks = resolvedPos.marks(); // Get marks at the position
                            const mark = marks.find((mark) => mark.type.name === this.name);

                            if (mark?.attrs?.href) {
                                window.open(mark.attrs.href, '_blank');
                                return true; // Prevent further handling by the editor
                            }

                            return false;
                        },
                        handleKeyDown(view, event) {
                            if (event.key === ' ' || event.key === 'Enter') {
                                const { state, dispatch } = view;
                                const { selection, schema } = state;

                                // Remove the link mark when spacebar is pressed
                                if (selection.empty) {
                                    const { $from } = selection;
                                    const linkMark = schema.marks.markdownLink;
                                    if (linkMark && $from.marks().some(mark => mark.type === linkMark)) {
                                        dispatch(state.tr.removeStoredMark(linkMark));
                                    }
                                }
                            }
                            return false;
                        },
                    },
                })
            );
        }

        return plugins;
    },
});