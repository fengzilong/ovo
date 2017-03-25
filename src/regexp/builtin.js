// https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
const ncname = '[a-zA-Z_][\\w\\-\\.]*';

export default {
	TAG_NAME: `(?:${ ncname }\\:)?${ ncname }`,
	IDENT: `[\\$_a-zA-Z][\\$_0-9a-zA-Z]*`,
	BEGIN: `{`,
	END: `}`,
};
