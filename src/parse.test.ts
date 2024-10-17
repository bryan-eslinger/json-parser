import parse from './parse';

describe('parse', () => {
    it('top-level string', () => {
        expect(parse(['"foobar"'])).toEqual('foobar');
    });

    describe('top-level boolean', () => {
        it('TRUE', () => {
            expect(parse(['true'])).toBe(true);
        });

        it('FALSE', () => {
            expect(parse(['false'])).toBe(false);
        })
    });

    it('top-level number', () => {
        expect(parse(['42'])).toEqual(42);
    });

    it('top-level null', () => {
        expect(parse([])).toBeNull();
    });

    describe('top-level array', () => {
        it('returns a javascript array', () => {
            expect(parse(['[', '"of"', ',', '"values"', ',', '420', ']'])).toEqual(['of', 'values', 420]);
        });

        it('handles nested arrays', () => {
            expect(parse(['[', '[', '"of"', ',', '"values"', ']', ',', '420', ']'])).toEqual([['of', 'values'], 420]);
        })
    });

    it('handles a realistic json object', () => {
        const tokens = [
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
        ];

        expect(parse(tokens)).toEqual({
            string: 'string value',
            number: 42,
            boolean: true,
            object: {
                key: 'value',
                nested: {
                    object: 'value'
                }
            },
            array: ['of', 'values', 420],
            null: null
        })
    });

    describe('invalid json', () => {
        it('throws ParseError on invalid character', () => {
            expect(() => parse(['.'])).toThrow('Invalid token: .');
        });

        it('throws ParseError when object is missing comma', () => {
            expect(() => parse(['{', '"foo"', ':', '"bar"', '"baz"', ':', '"qux"', '}'])).toThrow('Unexpected token: "baz", expecting ,');
        });

        it('throws ParseError when object is missing colon', () => {
            expect(() => parse(['{', '"foo"', '"bar"', ',', '"baz"', ':', '"qux"', '}'])).toThrow('Unexpected token: "bar", expecting :');
        });

        it('throws ParseError when object has invalid key', () => {
            expect(() => parse(['{', 'true', '"bar"', ',', '"baz"', ':', '"qux"', '}'])).toThrow('Unexpected token: true, expecting string value');
        });

        xit('throws ParseError when object is unclosed', () => {
            expect(() => parse(['{', 'true', '"bar"', ',', '"baz"', ':', '"qux"'])).toThrow('Unclosed array: expected } but got eof');
        });

        it('throws ParseError when array is missing comma', () => {
            expect(() => parse(['[', '"foo"', ',', '"bar"', '"baz"', ']'])).toThrow('Unexpected token: "baz", expecting ,');
        });

        xit ('throws ParseError when array is unclosed', () => {
            expect(() => parse(['[', '"foo"', ',', '"bar"', ',', '"baz"'])).toThrow('Unclosed array: expected ] but got eof');
        });
    });
});
