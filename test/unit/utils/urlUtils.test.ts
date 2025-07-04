import { isAllowedUri } from '../../../src/utils/urlUtils';

describe('isAllowedUri', () => {
    it('should return true for http URLs', () => {
        expect(isAllowedUri('http://example.com')).toBe(true);
    });
    it('should return true for https URLs', () => {
        expect(isAllowedUri('https://example.com')).toBe(true);
    });
    it('should return true for mailto URLs', () => {
        expect(isAllowedUri('mailto:user@example.com')).toBe(true);
    });
    it('should return false for random strings', () => {
        expect(isAllowedUri('not a url')).toBe(false);
    });
});
