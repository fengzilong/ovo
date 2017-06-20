import Lexer from './lexer';
import ParserError from '../shared/error/ParserError';
import getCodeFrame from '../shared/getCodeFrame';

export default class ExpressionParser {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.options = options;
	}

	peek() {
		return this.lexer.peek();
	}

	next() {
		console.log( this.peek().type, this.peek().frame );
		return this.lexer.next();
	}

	skip( types ) {
		while ( ~types.indexOf( this.peek().type ) ) {
			this.next();
		}
	}

	// quick match, if matched, return
	accept( type ) {
		const token = this.peek();
		if ( token.type === type ) {
			return this.next();
		}
	}

	// enhanced `this.next()`, with error reporting
	expect( type ) {
		const token = this.peek();
		if ( token.type === type ) {
			return this.next();
		}

		const codeframe = getCodeFrame( this.source, token.pos );
		console.log( codeframe );

		this.error( `Expect ${ type }, but got ${ token.type }` );
	}

	error( message ) {
		throw new ParserError( message );
	}

	parse() {
		this.lexer = new Lexer( this.source, this.options );

		return this.statement();
	}

	statement() {
		return this.expression();
	}

	expression() {
		return this.additive();
	}

	primary() {
		const token = this.peek();

		switch( token.type ) {
			case '{':
				return this.object();
			case '[':
				return this.array();
			case '(':
				return this.paren();
			case 'string':
				this.next();
				return {
					get: token.value
				};
			case 'number':
				this.next();
				return {
					get: token.value
				};
			case 'ident':
				this.next();
				return {
					get: token.value
				};
			default:
				return { get: '' };
		}
	}

	// | (0)
	filter() {
		// const token = (
		//
		// );
		//
		// let tmp;
		// while ( tmp = this.accept( '|' ) ) {
		// 	const token = this.expect( 'ident' );
		// 	const filtername = token.value;
		// 	if ( this.peek().type === ':' ) {
		// 		this.accept( ':' );
		// 		this.arguments( '|' );
		// 	}
		// }
	}

	arguments( boundary = ')' ) {
		const args = [];
		while ( this.peek().type !== boundary ) {
			this.skip( [ ',' ] );
			const tmp = this.ternary();
			args.push( tmp.get );
		}
	}

	// !~+- (16)
	unary() {
		const operator = (
			this.accept( '!' ) ||
			this.accept( '~' ) ||
			this.accept( '+' ) ||
			this.accept( '-' )
		);

		let main;
		const next = this.peek();
		if (
			next.type === '!' ||
			next.type === '~' ||
			next.type === '+' ||
			next.type === '-'
		) {
			main = this.unary();
		} else {
			main = this.member();
		}

		return {
			get: '(' + ( operator ? operator.value : '' ) + main.get + ')',
		};
	}

	// = += -= *= /= %=     ... (3)
	assignment() {
		this.accept( '=' )
	}

	// A ? B : C (4)
	conditional() {

	}

	// + - (13)
	// unary + unary
	// unary - unary
	additive() {
		const left = this.multiplicative();

		const operator = (
			this.accept( '+' ) ||
			this.accept( '-' )
		);

		if ( operator ) {
			const right = this.additive();
			return {
				get: left.get + operator.value + right.get
			};
		}

		return left;
	}

	// * / % (14)
	// unary
	// unary * unary
	// unary / unary
	// unary % unary
	multiplicative() {
		const left = this.unary();
		const operator = (
			this.accept( '*' ) ||
			this.accept( '/' ) ||
			this.accept( '%' )
		);

		if ( operator ) {
			return {
				get: left.get + operator.value + this.unary().get
			};
		}

		return left;
	}

	// < > <= >= in instanceof == === !== != (11,10)
	comparison() {

	}

	// && (6)
	logicalAnd() {

	}

	// || (5)
	logicalOr() {

	}

	// ( expression ) (20)
	paren() {
		this.expect( '(' );
		const v = this.expression();
		this.expect( ')' );

		v.get = '(' + v.get + ')';
		return v;
	}

	object() {
		this.expect( '{' );
		const code = [ '{' ];

		let token;
		while (
			token = (
				this.accept( 'string' ) ||
				this.accept( 'number' ) ||
				this.accept( 'ident' )
			)
		) {
			this.expect( ':' );
			const expr = this.expression();
			this.accept( ',' );

			code.push( JSON.stringify( token.value ) + ':' + expr.get + ',' );

			token = this.peek();
			if (
				!(
					token.type === 'string' &&
					token.type === 'number' &&
					token.type === 'ident'
				)
			) {
				break;
			}
		}

		this.expect( '}' );
		code.push( '}' );

		return {
			get: code.join( '' ),
		};
	}

	array() {

	}

	// a.b
	// a[ expression ]
	// a()
	// (19)

	member( {
		code = ''
	} = {} ) {
		const primary = this.primary();
		const token = (
			this.accept( '.' ) ||
			this.accept( '[' ) ||
			this.accept( '(' )
		);

		if ( !token ) {
			return primary ? primary : { get: '' };
		}

		switch ( token.type ) {
			case '.':
				const ident = this.accept( 'ident' );
				if ( ident ) {
					const next = this.peek();

					if (
						next.type === '.' ||
						next.type === '[' ||
						next.type === '('
					) {
						return this.member( {
							code: code + primary.get + '.' + ident.value
						} );
					} else {
						return {
							get: code + primary.get + '.' + ident.value,
						};
					}
				} else {
					this.error( 'expect ident in member' );
				}
			case '[':
				const key = (
					this.accept( 'string' ) ||
					this.accept( 'number' )
				);

				const end = this.accept( ']' );

				if ( key && end ) {
					const next = this.peek();

					if (
						next.type === '.' ||
						next.type === '[' ||
						next.type === '('
					) {
						return this.member( {
							get: code + '[' + JSON.stringify( key.value ) + ']',
						} );
					} else {
						return {
							get: code + '[' + JSON.stringify( key.value ) + ']',
						};
					}
				} else {
					this.error( 'error' );
				}
			case '(':

				break;
			default:
				return {
					get: code
				};
		}
	}
}
