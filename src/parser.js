import Lexer from './lexer';

export default class Parser {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.lexer = new Lexer( source, options );
	}
	peek() {
		return this.lexer.peek();
	}
	next() {
		return this.lexer.next();
	}
	parse() {
		const tokens = [];

		while( this.peek().type !== 'eos' ) {
			const token = this.next();
			tokens.push( token );
		}

		this.tokens = tokens;
	}
	program() {

	}
}
