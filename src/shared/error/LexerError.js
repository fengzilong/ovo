export default class LexerError extends Error {
	constructor( message ) {
		this.name = 'LexerError';
		this.message = message;
	}
}
