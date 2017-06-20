import State from '../shared/state';
import Token from '../shared/token';
import LexerError from '../shared/error/LexerError';
import getCodeFrame from '../shared/getCodeFrame';
import patterns from './patterns';

export default class ExpressionLexer {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.tail = source;
		this.options = options || {};
		this.stash = [];
		this.pos = 0;
		this.state = new State();
		this.state.enter( 'data' );
	}

	stashed() {
		return this.stash.shift();
	}

	lookahead( n ) {
		let fetch = n - this.stash.length;
		while ( fetch-- > 0 ) {
			this.stash.push( this.advance() );
		}
		return this.stash[ --n ];
	}

	peek() {
		return this.lookahead( 1 );
	}

	next() {
		return this.stashed() || this.advance();
	}

	match( type ) {
		if ( !patterns[ type ] ) {
			return;
		}
		return patterns[ type ].exec( this.tail );
	}

	skip( len ) {
		const chunk = len[ 0 ];
		len = chunk ? chunk.length : len;
		this.tail = this.tail.substr( len );
		this.pos = this.pos + len;
	}

	error( ...args ) {
		const codeframe = getCodeFrame( this.source, this.pos );
		console.log( ...args );
		console.log( codeframe );
		throw new LexerError( {
			codeframe,
		} );
	}

	advance() {
		const startPos = this.pos;

		const token =
			this.eos() ||
			this.whitespace() ||
			this.string() ||
			this.ident() ||
			this.number() ||
			this.symbol() ||
			this.unknown()
			;

		const endPos = this.pos;

		token.pos = startPos;
		token.frame = this.source.slice( startPos, endPos );

		// ignore whitespace
		if ( token.type === 'whitespace' ) {
			return this.advance();
		}

		return token;
	}

	eos() {
		if ( this.tail.length > 0 ) {
			return;
		}

		return new Token( 'eos' );
	}

	whitespace() {
		const captures = this.match( 'WHITESPACE' );
		if ( captures ) {
			this.skip( captures );
			const whitespace = captures[ 0 ];
			return new Token( 'whitespace', whitespace );
		}
	}

	ident() {
		const captures = this.match( 'IDENT' );
		if ( captures ) {
			this.skip( captures );
			const ident = captures[ 0 ];
			return new Token( 'ident', ident );
		}
	}

	string() {
		const captures = this.match( 'STRING' );
		if ( captures ) {
			this.skip( captures );
			const str = captures[ 2 ];
			return new Token( 'string', str );
		}
	}

	number() {
		const captures = this.match( 'NUMBER' );
		if ( captures ) {
			this.skip( captures );
			const num = captures[ 0 ];
			return new Token( 'number', num );
		}
	}

	symbol() {
		const captures = this.match( 'SYMBOL' );
		if ( captures ) {
			this.skip( captures );
			const symbol = captures[ 1 ];
			return new Token( symbol, symbol );
		}
	}

	unknown() {
		const captures = this.match( 'UNKNOWN' );
		if ( captures ) {
			this.skip( captures );
			const content = captures[ 0 ];
			return new Token( 'unknown', content );
		}
	}
}
