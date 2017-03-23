import compile from './regexp/compile';

export default {
	TAG_OPEN: compile( /^<({{TAG_NAME}})\s*/ ),
	ATTRIBUTE: /^([-@:\.0-9a-z\(\)\[\]]+)(=(['"])*([^\3]*?)\3)?\s*/,
	TAG_OPEN_END: /^\/?>/,
	TAG_CLOSE: compile( /^<\/({{TAG_NAME}})>/ ),
	TAG_COMMENT: /^<\!--([^\x00]*?)--\>/,
	TEXT: /^[^\x00]/,
	SPACE: /^[\r\n\t ]+/,
};
