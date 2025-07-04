import HtmlConverter from '../../../src/services/domain/HtmlConverter';

describe('HtmlConverter', () => {
    it('should generate valid HTML with title and content', () => {
        const html = HtmlConverter.convertToHtml('<p>Hello</p>', 'My Note');
        expect(html).toContain('<title>My Note</title>');
        expect(html).toContain('<header class="note-name">My Note</header>');
        expect(html).toContain('<p>Hello</p>');
        expect(html).toContain('<!DOCTYPE html>');
    });

    it('should include styles if provided', () => {
        const styles = 'body { color: red; }';
        const html = HtmlConverter.convertToHtml('<p>Styled</p>', 'Styled Note', styles);
        expect(html).toContain('<style>');
        expect(html).toContain(styles);
    });

    it('should not include styles if not provided', () => {
        const html = HtmlConverter.convertToHtml('<p>No Style</p>', 'No Style Note');
        // Should still have a <style> tag, but empty
        expect(html).toContain('<style>');
        // Should not contain any CSS
        expect(html).toContain('<style></style>');
    });
});
