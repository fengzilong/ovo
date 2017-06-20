import compile from '../shared/compile';

const _ = compile( {
	IDENT: `[\\$_a-zA-Z][\\$_0-9a-zA-Z]*`,
} );

export default {
	IDENT: _(/^({{IDENT}})/),
	STRING: /^(['"])([^\1]*?)\1/,
	NUMBER: /^((?:\d*\.\d+|\d+)(?:e\d+)?)/,
	SYMBOL: /^([=!]?==|\|\||&&|[~<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,])/,
	WHITESPACE: /^\s+/,
	UNKNOWN: /^[^\x00]/,
};
