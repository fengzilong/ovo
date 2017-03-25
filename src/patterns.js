import compile from './regexp/compile';

/* eslint-disable */
export default {
	// TAG
	TAG_OPEN: compile( /^<({{TAG_NAME}})\s*/ ),
	ATTRIBUTE: /^([-@:\.0-9a-z\(\)\[\]]+)(=(['"])*([^\3]*?)\3)?\s*/,
	TAG_END: /^(\/?)>/,
	TAG_CLOSE: compile( /^<\/({{TAG_NAME}})>/ ),
	TAG_COMMENT: /^<\!--([^\x00]*?)--\>/,

	// Mustache
	MUSTACHE_OPEN: compile( /^{{BEGIN}}#({{IDENT}})\s*/ ),
	MUSTACHE_END: compile( /^{{END}}/ ),
	MUSTACHE_CLOSE: compile( /^{{BEGIN}}\/{{IDENT}}{{END}}/ ),
	MUSTACHE_EXPRESSION_OPEN: compile( /^{{BEGIN}}/ ),
	MUSTACHE_EXPRESSION_IDENT: compile( /^({{IDENT}})/ ),
	MUSTACHE_EXPRESSION_NUMBER: /^((?:\d*\.\d+|\d+)(?:e\d+)?)/,
	MUSTACHE_EXPRESSION_STRING: /^(['"])([^\1]*?)\1/,
	MUSTACHE_EXPRESSION_SYMBOL: /^([=!]?==|[-=><+*\/%\!]?\=|\|\||&&|[<\>\[\]\(\)\-\|\+\*\/%?:\.!,])/,
	MUSTACHE_EXPRESSION_BRACE_OPEN: /^([{])/,
	MUSTACHE_EXPRESSION_BRACE_END: /^([}])/,

	// Others
	TEXT: /^[^\x00]/,
	SPACE: /^\s+/,
	EOS: /^$/,
};
/* eslint-enable */
