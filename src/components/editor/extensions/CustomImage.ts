import { Image } from '@tiptap/extension-image';

export const CustomImage = Image.extend({
    addStorage() {
        return {
            markdown: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                serialize(state: any, node: any) {
                    const alt = node.attrs.alt ?? '';
                    const src = node.attrs.src ?? '';
                    state.write(`![${alt}](<${src}>)`);
                    state.closeBlock(node);
                },
                // Optionally, add parse for markdown import
            }
        };
    },
});