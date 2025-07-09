import {escapeAttribute} from './utils';

describe('escapeAttribute', () => {
    it('should escape double quotes', () => {
        expect(escapeAttribute('"hello"')).toBe('&quot;hello&quot;');
    });

    it('should escape single quotes', () => {
        expect(escapeAttribute("'hello'")).toBe('&apos;hello&apos;');
    });

    it('should escape ampersand', () => {
        expect(escapeAttribute('a&b')).toBe('a&amp;b');
    });

    it('should escape less-than and greater-than', () => {
        expect(escapeAttribute('<script>')).toBe('&lt;script&gt;');
    });

    it('should handle mixed dangerous characters', () => {
        expect(escapeAttribute('"\'&<>')).toBe('&quot;&apos;&amp;&lt;&gt;');
    });

    it('should not escape safe characters', () => {
        expect(escapeAttribute('abc123')).toBe('abc123');
        expect(escapeAttribute('привет')).toBe('привет');
        expect(escapeAttribute('😊')).toBe('😊');
    });

    it('should handle empty string', () => {
        expect(escapeAttribute('')).toBe('');
    });

    it('should handle already escaped entities', () => {
        expect(escapeAttribute('&quot;')).toBe('&amp;quot;');
        expect(escapeAttribute('&amp;')).toBe('&amp;amp;');
    });
});