import parse from './parse';
import tokenize from './tokenize';

// TODO correct token type
export type Token = string;

export default function(jsonStr: string) {
    return parse(tokenize(jsonStr));
}
