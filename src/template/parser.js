import Lexer from './lexer';

export default class Parser {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.lexer = new Lexer( source, options );
		this.root = [];
	}

	peek() {
		return this.lexer.peek();
	}

	next() {
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

	accept( type ) {
		if ( this.peek().type === type ) {
			return this.next();
		}
	}

	error() {

	}

	parse() {
		const root = this.root;

		while ( this.peek().type !== 'eos' ) {
			this.skipWhitespace();
			if ( this.peek().type === 'eos' ) {
				break;
			}

			// gather statements
			const statement = this.statement();
			root.push( statement );
		}
	}

	// distribute
	statement() {
		const type = this.peek().type;

		this.next();

		/* eslint-disable */
		switch ( type ) {
			case 'tagOpen':
				return this.tag();
			case 'mustacheOpen':
				return this.directive();
			case 'interpolationOpen':
				return this.interpolation();
			default:
				return this.error( `Unexpect token ${ type }` );
		}
		/* eslint-enable */
	}

	tag() {
		console.log( `tag` );
	}

	directive() {
		console.log( `directive` );
	}

	interpolation() {
		console.log( `interpolation` );
	}
}
