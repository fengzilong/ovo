// https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
const ncname = '[a-zA-Z_][\\w\\-\\.]*';
export const TAG_NAME = `(?:${ ncname }\\:)?${ ncname }`;
