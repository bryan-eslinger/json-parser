import { Token } from '.';
import { BRACKET_CLOSE, BRACKET_OPEN, COLON, COMMA, CURLY_CLOSE, CURLY_OPEN, FALSE, NULL, QUOTE, TRUE } from './tokens';

// TODO can this be represented better?
type JsonObject = Record<string, JsonNode>;
type JsonNode = object | null | string | boolean | number;
type Json = JsonNode | JsonNode[];

class ParseError extends Error {};

function parsePrimitive(tokens: Token[]): [JsonNode, Token[]] {
    let json = null;
    const token = tokens[0];

    switch(token) {
        case TRUE:
            json = true;
            break;
        case FALSE:
            json = false;
            break;
        case NULL:
            json = null;
            break;
        default:
            if (token.startsWith(QUOTE)) {
                json = token.slice(1, token.length - 1);
                break;
            }

            const tryNumber = parseFloat(token);
            if (!Number.isNaN(tryNumber)) {
                json = tryNumber;
                break;
            }

            throw new ParseError(`Invalid token: ${token}`);
    }

    return [json, tokens.slice(1)];
}

function parseArray(tokens: Token[]): [JsonNode[], Token[]] {
    const jsonArray: JsonNode[] = [];
    let remainingTokens = tokens.slice(1);

    while (remainingTokens.length) {
        const [json, unparsedTokens] = _parse(remainingTokens);
        jsonArray.push(json);

        const token = unparsedTokens[0];

        if (token === BRACKET_CLOSE) {
            return [jsonArray, unparsedTokens.slice(1)];
        } else if (token !== COMMA) {
            throw new ParseError(`Unexpected token: ${token}, expecting ${COMMA}`);
        } else {
            remainingTokens = unparsedTokens.slice(1);
        }
    }

    throw new ParseError(`Unclosed array: expected ${BRACKET_CLOSE} but got eof`);
}

function parseObject(tokens: Token[]): [JsonNode, Token[]] {
    const jsonObject: JsonObject = {};
    let remainingTokens = tokens.slice(1);
    
    while (remainingTokens.length) {
        const [key, unparsedTokensAfterKey] = _parse(remainingTokens);
        if (typeof key !== 'string') {
            throw new ParseError(`Unexpected token: ${key}, expecting string value`);
        }

        let token = unparsedTokensAfterKey[0];
        if (token !== COLON) {
            throw new ParseError(`Unexpected token: ${token}, expecting ${COLON}`);
        }

        const [value, unparsedTokensAfterValue] = _parse(unparsedTokensAfterKey.slice(1));
        jsonObject[key] = value;

        token = unparsedTokensAfterValue[0];
        if (token === CURLY_CLOSE) {
            return [jsonObject, unparsedTokensAfterValue.slice(1)];
        } else if (token !== COMMA) {
            throw new ParseError(`Unexpected token: ${token}, expecting ${COMMA}`);
        } else {
            remainingTokens = unparsedTokensAfterValue.slice(1);
        }
    }

    throw new ParseError(`Unclosed object, expected ${CURLY_CLOSE} but got eof`);
}

function _parse(tokens: Token[]): [Json, Token[]] {
    switch(tokens[0]) {
        case BRACKET_OPEN:
            return parseArray(tokens);
        case CURLY_OPEN:
            return parseObject(tokens);
        case undefined:
            return [null, []];
        default:
            return parsePrimitive(tokens);
    }
}

export default function parse(tokens: Token[]): Json {
    return _parse(tokens)[0];
}
