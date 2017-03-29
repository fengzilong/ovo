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

	// 预测
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

	// distribute, which means from statement to `leaf`
	statement() {
		const type = this.peek().type;

		/* eslint-disable */
		switch ( type ) {
			case 'text':
				return this.text();
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

	text() {
		const token = this.next();
		console.log( token.value );
		return {
			type: 'text',
			value: token.value,
		};
	}

	tag() {
		const token = this.next();
		console.log( `tag`, token.value.name );
	}

	// {#directive expr}{/directive}, such as if, list
	directive() {
		const token = this.accept( 'mustacheOpen' );
		switch( token.value ) {
			case 'if':
				return this.if();
			case 'list':
				return this.list();
			default:
				this.error( 'Unexpect' );
		}
	}
	[ 'if' ]() {
		const consequent = [];
		const alternate = [];

		// match following expression
		const expression = this.expression();
		// expect a mustacheEnd
		this.accept( 'mustacheEnd' );
		// find corresponding `{#else` and `{#elseif`
		while ( this.peek().type !== 'mustacheClose' ) {
			const token = this.next();
			if ( token.type === 'mustacheOpen' ) {
				switch( token.value ) {
					case 'elseif':

						break;
					case 'else':

						break;
					default:
						
						break;
				}
			}
		}
	}
	list() {

	}
	expression() {

	}

	interpolation() {
		console.log( `interpolation` );
	}
}
