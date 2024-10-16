import type { Token } from '.';
import {
    BRACKET_CLOSE,
    BRACKET_OPEN,
    COLON,
    COMMA,
    CURLY_CLOSE,
    CURLY_OPEN,
    FALSE,
    NULL,
    QUOTE,
    TRUE,
} from './tokens';

export class TokenizeError extends Error {};

export default function tokenize(jsonStr: string): Token[] {
    const tokens: Token[] = [];
    let curr = 0;
    while (curr < jsonStr.length) {
        switch(jsonStr[curr]) {
            case BRACKET_OPEN:
            case BRACKET_CLOSE:
            case COLON:
            case COMMA:
            case CURLY_CLOSE:
            case CURLY_OPEN:
                tokens.push(jsonStr[curr]);
                curr++;
                break;
            case QUOTE:
                let str = QUOTE;
                curr++;
                while (!!jsonStr[curr] && jsonStr[curr] !== QUOTE) {
                    str += jsonStr[curr];
                    curr++
                }

                if (curr >= jsonStr.length) {
                    throw new TokenizeError('Unexpected end');
                }

                str += QUOTE;
                tokens.push(str);
                curr++;
                break;
            default:
                if (/\d/.test(jsonStr[curr])) {
                    let token = jsonStr[curr];
                    curr++;
                    while(/\d/.test(jsonStr[curr])) {
                        token += jsonStr[curr];
                        curr++;
                    }
                    tokens.push(token);
                } else if (/[a-z]/.test(jsonStr[curr])) {
                    let token = jsonStr[curr];
                    curr++;
                    while(curr < jsonStr.length && /\w/.test(jsonStr[curr])) {
                        token += jsonStr[curr];
                        curr++;
                    }
        
                    switch(token) {
                        case FALSE:
                        case NULL:
                        case TRUE:
                            tokens.push(token);
                            break;
                        default:
                            throw new TokenizeError(`Unexpected token: ${token}`);
                    }
                } else if (/\s/.test(jsonStr[curr])) {
                    curr++;
                } else {
                    throw new TokenizeError(`Unexpected token: ${jsonStr[curr]}`);
                }
        }
    }
    return tokens;
}
