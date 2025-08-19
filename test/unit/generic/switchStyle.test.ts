import switchRailStyle from '../../../src/components/generic/switch/switchStyle';
import { describe, it, expect } from 'vitest';

describe('GIVEN switchRailStyle', () => {
    describe('WHEN checked and focused', () => {
        it('THEN returns correct style', () => {
            const style = switchRailStyle({ checked: true, focused: true });
            expect(style.background).toBe('var(--main-detail-color)');
            expect(style.boxShadow).toBe('0 0 0 2px var(--main-detail-color-transparent)');
        });
    });

    describe('WHEN checked and not focused', () => {
        it('THEN returns correct style', () => {
            const style = switchRailStyle({ checked: true, focused: false });
            expect(style.background).toBe('var(--main-detail-color)');
            expect(style.boxShadow).toBeUndefined();
        });
    });

    describe('WHEN not checked and focused', () => {
        it('THEN returns correct style', () => {
            const style = switchRailStyle({ checked: false, focused: true });
            expect(style.background).toBe('');
            expect(style.boxShadow).toBe('0 0 0 2px var(--main-detail-color-transparent)');
        });
    });

    describe('WHEN not checked and not focused', () => {
        it('THEN returns correct style', () => {
            const style = switchRailStyle({ checked: false, focused: false });
            expect(style.background).toBe('');
            expect(style.boxShadow).toBeUndefined();
        });
    });
});
