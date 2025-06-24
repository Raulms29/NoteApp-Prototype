import { Node, mergeAttributes } from '@tiptap/core';

export interface PdfOptions {
    HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pdf: {
            insertPdf: (options: { src: string; title?: string }) => ReturnType
        }
    }
}

export const Pdf = Node.create<PdfOptions>({
    name: 'pdf',

    group: 'block',

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            src: {
                default: null,
            },
            title: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="pdf"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'pdf',
            }),
            [
                'iframe',
                {
                    src: HTMLAttributes.src,
                    width: '100%',
                    height: '1095px',
                },
            ],
        ];
    },
});
