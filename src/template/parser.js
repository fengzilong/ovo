import Lexer from './lexer';
import nodes from './nodes';
import ParserError from '../shared/error/ParserError';

export default class Parser {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.options = options;
	}

	peek() {
		return this.lexer.peek();
	}

	next() {
		console.log( this.lexer.peek() );
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

	// simple assert, if matched, return
	accept( type ) {
		const token = this.peek();
		if ( token.type === type ) {
			return this.next();
		}
	}

	// enhanced `this.next()`, with assert
	expect( type ) {
		const token = this.accept( type );

		if ( token ) {
			return token;
		}

		this.error( `Expect ${ type }, but got ${ token.type }` );
	}

	error( message ) {
		console.log( message );
		throw new ParserError( message );
	}

	parse() {
		// setup lexer
		this.lexer = new Lexer( this.source, this.options );

		// generate program node as ast root
		const program = nodes.Program( {
			body: this.statements(),
		} );

		return program;
	}

	// multiple statements, like `text + tag + text`, we should gather them as an array
	// use eos and tagClose as boundary, when we encounter extra tagClose token, it should be a endpoint for parent invoking
	statements() {
		const root = [];
		while ( this.peek().type !== 'tagClose' && this.peek().type !== 'eos' ) {
			this.skipWhitespace();

			if ( this.peek().type === 'tagClose' || this.peek().type === 'eos' ) {
				break;
			}

			// gather statements
			const statement = this.statement();
			root.push( statement );
		}
		return root;
	}

	// distribute, which means from statement to `leaf`
	statement() {
		const type = this.peek().type;

		/* eslint-disable */
		switch ( type ) {
			case 'whitespace':
			case 'text':
				return this.text();
			case 'tagOpen':
				return this.tag();
			case 'mustacheOpen':
				return this.directive();
			case 'interpolationOpen':
				return this.interpolation();
			default:
				return this.error( `Unexpected token ${ type }` );
		}
		/* eslint-enable */
	}

	text() {
		return nodes.Text( this.next().value );
	}

	tag() {
		const node = nodes.Tag( {
			name: this.next().value.name
		} );

		while ( this.peek().type !== 'tagEnd' && this.peek().type !== 'eos' ) {
			const token = this.accept( 'attribute' );
			node.attributes[ token.value.name ] = token.value.value;
		}

		this.accept( 'tagEnd' );
		node.children = this.statements();
		const closeToken = this.accept( 'tagClose' );

		if ( closeToken.value.name !== node.name ) {
			this.error( `Unmatched close tag for ${ node.name }` );
		}

		return node;
	}

	// {#directive expr}{/directive}, such as if, list
	directive() {
		const token = this.accept( 'mustacheOpen' );
		switch( token.value ) {
			case 'if':
				return this.if();
			case 'each':
				return this.each();
			default:
				this.error( `Unexpected directive ${ token.value }` );
		}
	}
	[ 'if' ]() {
		const node = nodes.If( {
			test: this.expression(), // match expression as `test`
			consequent: null, // set it later
			alternate: null, // set it later
		} );

		// for BlockStatement
		const {
			receive,
			changeReceiver
		} = ( function () {
			let receiver;

			function receive( statement ) {
				receiver.body.push( statement );
			}

			function changeReceiver( newReceiver ) {
				receiver = newReceiver;
			}

			return { receive, changeReceiver };
		} )();

		// obviously consequent will be default receiver at first, until we meet `else`
		changeReceiver( node.consequent = nodes.Block() );

		// expect a mustacheEnd
		this.accept( 'mustacheEnd' );

		// find corresponding `{#else` and `{#elseif`
		while ( this.peek().type !== 'mustacheClose' && this.peek().type !== 'eos' ) {
			// don't accept any token here, do it later
			const token = this.peek();

			if ( token.type === 'mustacheOpen' ) {
				switch( token.value ) {
					case 'elseif':
						// continue reading `IfStatement` into alternate
						this.next();
						node.alternate = this.if();
						break;
					case 'else':
						// now receiver is changed to alternate
						this.next();
						this.accept( 'mustacheEnd' );
						changeReceiver( node.alternate = nodes.Block() );
						break;
					default:
						receive( this.statement() );
						break;
				}
			} else {
				receive( this.statement() );
			}
		}

		const mustacheCloseToken = this.accept( 'mustacheClose' );

		// maybe {/each}? it's not what we want
		if ( mustacheCloseToken.value !== 'if' ) {
			this.error( 'Expect corresponding {/if} for {#if}' );
		}

		return node;
	}
	each() {

	}
	expression() {
		const tokens = [];
		let token;

		while (
			token = (
				this.accept( 'ident' ) ||
				this.accept( 'string' ) ||
				this.accept( 'number' ) ||
				this.accept( 'symbol' )
			)
		) {
			tokens.push( token );
		}

		return nodes.Expression( {
			value: 'expression'
		} );
	}

	interpolation() {
		this.accept( 'interpolationOpen' );

		const node = this.expression();

		this.accept( 'mustacheEnd' );

		return node;

	}
}
