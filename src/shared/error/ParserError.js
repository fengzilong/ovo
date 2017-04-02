export default class ParserError extends Error {
	constructor( message ) {
		this.name = 'ParserError';
		this.message = message;
		Error.captureStackTrace( this, ParserError );
	}
}
