export default class HtmlConverter {


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