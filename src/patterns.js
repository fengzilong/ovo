import compile from './regexp/compile';

export default {
	TAG_OPEN: compile( /^<({{TAG_NAME}})\s*/ ),
	TAG_CLOSE: compile( /^<\/({{TAG_NAME}})>/ ),
	'>': /^>/,
	ATTRIBUTE: /^([-:0-9a-z\(\)\[\]]+)(=(['"])*([^\3]*?)\3)?\s*/,
	TEXT: /^[^\x00]/,
	SPACE: /^[\r\n\t ]+/,
};
