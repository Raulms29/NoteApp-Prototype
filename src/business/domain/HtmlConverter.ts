export default class HtmlConverter {


    /**
     * Converts note content and metadata to a complete HTML document string.
     * @param HTMLContent - The HTML string representing the note's content.
     * @param title - The title of the note, used in the document title and header.
     * @param styles - Optional CSS styles to include in the document.
     * @returns A string containing the full HTML document.
     */
    static convertToHtml(HTMLContent: string, title: string, styles?: string): string {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>${styles || ''}</style>
        </head>
        <body>
        <article class="note">
        <header class="note-name">${title}</header>
            ${HTMLContent}
        </article>
        </body>
        </html>`;
        return html;
    }
}