import Lexer from './lexer';

export default class ExpressionParser {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.options = options;
	}

	peek() {
		return this.lexer.peek();
	}

	next() {
		console.log( this.lexer.peek().type, this.lexer.peek().frame );
		return this.lexer.next();
	}

	skip( types ) {
		while ( ~types.indexOf( this.peek().type ) ) {
			this.next();
		}
	}

	skipWhitespace() {
		this.skip( [ 'whitespace' ] );
	}

	parse() {
		this.lexer = new Lexer( this.source, this.options );

		const root = [];

		while( this.peek().type !== 'eos' ) {
			this.skipWhitespace();

			if ( this.peek().type === 'eos' ) {
				break;
			}

			const statement = this.statement();

			if ( statement ) {
				root.push( statement );
			}
		}

		return root;
	}

	statement() {
		const token = this.peek();

		switch ( token.type ) {
			case 'whitespace':
				break;
			case '':
				return;
			default:
		}
	}
}
