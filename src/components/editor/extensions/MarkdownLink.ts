import { Mark, mergeAttributes, InputRule, PasteRule } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { TextSelection } from 'prosemirror-state';
import '@tiptap/extension-link';
import { isAllowedUri } from '../../../utils/urlUtils';

/**
 * Regular expression to match markdown links in the format [text](url).
 * Captures the link text and the URL separately for further processing.
 */
const markdownLinkRegex = /\[([^\]]+)]\((https?:\/\/[^\s()]+(?:\([^\s()]*\)[^\s()]*)*)\)/g;


export const MarkdownLink = Mark.create({
    name: 'link',

    addStorage() {
        return {
            markdown: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                open: (state: any, mark: any) => '[',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                close: (state: any, mark: any) => `](${mark.attrs.href})`,
            }
        };
    },

    /**
     * Adds options for the markdown link mark, including validation logic and default attributes.
     * The `isAllowedUri` function ensures that only URLs with allowed protocols are accepted.
     */
    addOptions() {
        return {
            openOnClick: true,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer',
                class: null as string | null,
            },
            /**
             * Validates if a given URL is allowed..
             */
            isAllowedUri: (url: string) => {
                return isAllowedUri(url);
            },
        };
    },

    /**
     * Defines the attributes for the markdown link mark.
     * These attributes include the link's href, target, rel, and optional CSS class.
     */
    addAttributes() {
        return {
            href: {
                default: null, // The URL of the link.
                parseHTML: (element) => element.getAttribute('href'), // Extracts the href attribute from HTML.
            },
            target: {
                default: this.options.HTMLAttributes.target, // Default target attribute for links.
            },
            rel: {
                default: this.options.HTMLAttributes.rel, // Default rel attribute for links.
            },
            class: {
                default: this.options.HTMLAttributes.class, // Optional CSS class for styling links.
            },
        };
    },

    /**
     * Specifies how the markdown link mark is parsed from HTML.
     * Links with invalid URLs are ignored during parsing.
     */
    parseHTML() {
        return [
            {
                tag: 'a[href]', // Matches anchor tags with an href attribute.
                getAttrs: (dom) => {
                    const href = dom.getAttribute('href');
                    if (!href || !this.options.isAllowedUri(href)) {
                        return false; // Invalid link
                    }
                    return null; // Valid link
                },
            },
        ];
    },

    /**
     * Specifies how the markdown link mark is rendered to HTML.
     * Combines the default HTML attributes with any additional attributes provided.
     */
    renderHTML({ HTMLAttributes }) {
        return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    /**
     * Adds commands for managing the markdown link mark in the editor.
     * These commands include setting, toggling, and unsetting links.
     */
    addCommands() {
        return {
            /**
             * Sets a markdown link mark with the given attributes.
             * Validates the URL before applying the mark to ensure it meets the allowed protocols.
             */
            setLink:
                (attributes) =>
                    ({ chain }) => {
                        const { href } = attributes;
                        if (!this.options.isAllowedUri(href)) {
                            return false; // Invalid URL
                        }
                        return chain().setMark(this.name, attributes).run();
                    },

            /**
             * Toggles a markdown link mark with the given attributes.
             * If the mark is already applied, it will be removed; otherwise, it will be added.
             */
            toggleLink:
                (attributes) =>
                    ({ chain }) => {
                        const { href } = attributes;
                        if (!this.options.isAllowedUri(href)) {
                            return false; // Invalid URL
                        }
                        return chain().toggleMark(this.name, attributes).run();
                    },

            /**
             * Removes the markdown link mark from the selected text.
             */
            unsetLink:
                () =>
                    ({ chain }) => {
                        return chain().unsetMark(this.name).run();
                    },
        };
    },

    /**
     * Adds input rules for the creation of the markdown link marks when typing
     * Typing `[text](url)` will create the link
     */
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

    /**
     * Adds paste rules for the creation of the markdown link marks when typing
     * Pasting `[text](url)` will create the link.
     */
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

    /**
     * Adds ProseMirror plugins for additional markdown link functionality.
     * These plugins handle click and keydown events for links.
     */
    addProseMirrorPlugins() {
        const plugins: Plugin[] = [];

        if (this.options.openOnClick) {
            plugins.push(
                new Plugin({
                    props: {
                        /**
                         * Handles click events on markdown links to open them in the browser, instead of in a 
                         * tab of the application.
                         */
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
                        /**
                         * Handles keydown events so that when spacebar or enter is pressed the link is no longer considered as
                         * selected, so writing can continue normally.
                         */
                        handleKeyDown(view, event) {
                            if (event.key === ' ' || event.key === 'Enter') {
                                const { state, dispatch } = view;
                                const { selection, schema } = state;

                                // Remove the link
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