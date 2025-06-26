import { Editor } from '@tiptap/vue-3';

export function exportNoteAsText(editor: Editor, noteName: string): void {
    let textContent = editor.getText();

    console.log('HTML', editor.getHTML());
    console.log('Text', textContent);
    console.log('JSON', editor.getJSON());
    console.log('Markdown', editor.storage.markdown.getMarkdown());
    // Replace 3+ consecutive newlines with a single newline
    textContent = textContent.replace(/\n{3,}/g, '\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create the file and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportNoteAsMarkdown(editor: Editor, noteName: string): void {
    const markdownContent = editor.storage.markdown.getMarkdown();
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    console.log(editor.storage.markdown.serializer.serialize(editor.state.doc));

    // Create the file and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}