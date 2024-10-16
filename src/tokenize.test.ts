import tokenize, { TokenizeError } from './tokenize';

describe('tokenize', () => {
    it('handles an empty string', () => {
        expect(tokenize('')).toEqual([]);
    });

    it('treats quoted strings as a single token', () => {
        expect(tokenize('"this is not a string"')).toEqual(
            ['"this is not a string"']
        );
    });

    it('treats a number as a single token', () => {
        expect(tokenize('42')).toEqual(['42']);
    });

    it('treats null as a single token', () => {
        expect(tokenize('null')).toEqual(['null']);
    });

    it('skips whitespace', () => {
        expect(tokenize(' ')).toEqual([]);
        expect(tokenize('\n')).toEqual([]);
        expect(tokenize('\t')).toEqual([]);
    });

    describe('boolean values', () => {
        it('treats true as a single token', () => {
            expect(tokenize('true')).toEqual(['true']);
        });

        it('treats false as a single token', () => {
            expect(tokenize('false')).toEqual(['false']);
        });
    });

    it('handles arrays', () => {
        expect(tokenize('[1, "string", true]')).toEqual(
            ['[', '1', ',', '"string"', ',', 'true', ']']
        );
    });

    it('handles objects', () => {
        expect(tokenize('{"foo": "bar", "baz": "qux"}')).toEqual(
            ['{', '"foo"', ':', '"bar"', ',', '"baz"', ':', '"qux"', '}']
        );
    });

    it('handles nested objects', () => {
        expect(tokenize('{"foo": { "bar": "baz"}}')).toEqual(
            ['{', '"foo"', ':', '{', '"bar"', ':', '"baz"', '}', '}']
        );
    });

    it('handles a realistic json string', () => {
        const jsonStr = `{
            "string": "string value",
            "number": 42,
            "boolean": true,
            "object": {
                "key": "value",
                "nested": {
                    "object": "value"
                }
            },
            "array": ["of", "values", 420],
            "null": null
        }`

        expect(tokenize(jsonStr)).toEqual([
            '{',
            '"string"',
            ':',
            '"string value"',
            ',',
            '"number"',
            ':',
            '42',
            ',',
            '"boolean"',
            ':',
            'true',
            ',',
            '"object"',
            ':',
            '{',
            '"key"',
            ':',
            '"value"',
            ',',
            '"nested"',
            ':',
            '{',
            '"object"',
            ':',
            '"value"',
            '}',
            '}',
            ',',
            '"array"',
            ':',
            '[',
            '"of"',
            ',',
            '"values"',
            ',',
            '420',
            ']',
            ',',
            '"null"',
            ':',
            'null',
            '}'
        ])
    });

    describe('invalid jsonStrs', () => {
        it('throws TokenizeError on unclosed string', () => {
            expect(() => tokenize('"invalidString')).toThrow('Unexpected end');
        });

        it('throws TokenizeError on invalid token', () => {
            expect(() => tokenize('&')).toThrow('Unexpected token: &');
            expect(() => tokenize('foobar')).toThrow('Unexpected token: foobar');
        });
    })
});
