import State from './state';
import Token from './token';
import patterns from './patterns';
import LexerError from './error/lexer';

export default class Lexer {
	constructor( source = '', options = {} ) {
		this.source = source;
		this.tail = source;
		this.options = options;
		this.stash = [];
		this.pos = 0;
		this.marker = {
			brace: 0,
		};
		this.state = new State();
	}
	next() {
		const token = this.stashed() || this.advance();
		return token;
	}
	advance() {
		const startPos = this.pos;
		const token = (
			this.eos() ||
			this.space() ||
			this.tagOpen() ||
			this.tagEnd() ||
			this.tagClose() ||
			this.attribute() ||
			this.mustacheOpen() ||
			this.mustacheClose() ||
			this.interpolationOpen() ||
			// expression should be replaced after `enter state mustacheOpen`
			this.expression() ||
			this.comment() ||
			this.text()
		);
		const endPos = this.pos;

		token.pos = startPos;
		token.frame = this.source.slice( startPos, endPos );

		return token;
	}
	skip( len ) {
		const chunk = len[ 0 ];
		len = chunk ? chunk.length : len;
		this.tail = this.tail.substr( len );
		this.pos = this.pos + len;
	}
	stashed() {
		return this.stash.shift();
	}
	match( type ) {
		if ( !patterns[ type ] ) {
			return;
		}
		return patterns[ type ].exec( this.tail );
	}
	peek() {
		return this.lookahead( 1 );
	}
	lookahead( n ) {
		let fetch = n - this.stash.length;
		while ( fetch-- > 0 ) {
			this.stash.push( this.advance() );
		}
		return this.stash[ --n ];
	}
	error( ...args ) {
		console.log( ...args );
		throw new LexerError( 'LexerError' );
	}
	comment() {
		const captures = this.match( 'TAG_COMMENT' );
		if ( captures ) {
			this.skip( captures );
			const content = captures[ 1 ];
			return new Token( 'comment', {
				content: content,
			} );
		}
	}
	tagOpen() {
		const captures = this.match( 'TAG_OPEN' );
		if ( captures ) {
			this.skip( captures );
			const tagname = captures[ 1 ];
			this.state.enter( 'tagOpen' );
			return new Token( 'tagOpen', {
				name: tagname,
			} );
		}
	}
	attribute() {
		if ( !this.state.is( 'tagOpen' ) ) {
			return;
		}

		const captures = this.match( 'ATTRIBUTE' );

		if ( captures ) {
			this.skip( captures );
			const name = captures[ 1 ];
			const value = captures[ 4 ];
			return new Token( 'attribute', { name, value } );
		}
	}
	tagEnd() {
		const captures = this.match( 'TAG_END' );
		if ( captures ) {
			this.skip( captures );
			this.state.leave( 'tagOpen' );
			const isSelfClose = !!captures[ 1 ];
			return new Token( 'tagEnd', {
				isSelfClose,
			} );
		}
	}
	tagClose() {
		const captures = this.match( 'TAG_CLOSE' );
		if ( captures ) {
			this.skip( captures );
			const tagname = captures[ 1 ];
			return new Token( 'tagClose', {
				name: tagname,
			} );
		}
	}

	// mustache
	mustacheOpen() {
		const captures = this.match( 'MUSTACHE_OPEN' );
		if ( captures ) {
			const name = captures[ 1 ];
			this.skip( captures );
			this.state.enter( 'mustacheOpen' );
			return new Token( 'mustacheOpen', name );
		}
	}
	mustacheEnd() {
		if ( !this.state.is( 'mustacheOpen' ) ) {
			return;
		}

		const captures = this.match( 'MUSTACHE_END' );
		if ( captures ) {
			this.skip( captures );
			this.state.leave( 'mustacheOpen' );
			// reset marker
			const marker = this.marker;
			for ( const i in marker ) {
				marker[ i ] = 0;
			}
			return new Token( 'mustacheEnd' );
		}
	}
	mustacheClose() {
		const captures = this.match( 'MUSTACHE_CLOSE' );
		if ( captures ) {
			const name = captures[ 1 ];
			this.skip( captures );
			return new Token( 'mustacheClose', name );
		}
	}

	// interpolation
	interpolationOpen() {
		// skip when staying in tagOpen and mustacheOpen state
		if ( this.state.is( 'tagOpen' ) || this.state.is( 'mustacheOpen' ) ) {
			return;
		}

		const captures = this.match( 'MUSTACHE_EXPRESSION_OPEN' );
		if ( captures ) {
			this.skip( captures );
			this.state.enter( 'mustacheOpen' );
			return new Token( 'interpolationOpen' );
		}
	}

	expression() {
		if ( !this.state.is( 'mustacheOpen' ) ) {
			return;
		}

		return (
			this.ident() ||
			this.number() ||
			this.string() ||
			this.symbol() ||
			this.brace()
		);
	}
	ident() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_IDENT' );
		if ( captures ) {
			this.skip( captures );
			const ident = captures[ 1 ];
			return new Token( 'ident', ident );
		}
	}
	number() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_NUMBER' );
		if ( captures ) {
			this.skip( captures );
			const number = captures[ 1 ];
			return new Token( 'number', parseFloat( number ) );
		}
	}
	string() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_STRING' );
		if ( captures ) {
			this.skip( captures );
			const string = captures[ 2 ] || '';
			return new Token( 'string', string );
		}
	}
	symbol() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_SYMBOL' );
		if ( captures ) {
			this.skip( captures );
			const symbol = captures[ 1 ];
			return new Token( 'symbol', symbol );
		}
	}
	// { | }
	brace() {
		return (
			this.braceOpen() ||
			this.braceEnd()
		);
	}
	braceOpen() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_BRACE_OPEN' );
		if ( captures ) {
			this.skip( captures );
			const symbol = captures[ 1 ];
			this.marker.brace++;
			return new Token( 'symbol', symbol );
		}
	}
	braceEnd() {
		const captures = this.match( 'MUSTACHE_EXPRESSION_BRACE_END' );
		if ( captures ) {
			const symbol = captures[ 1 ];
			this.marker.brace--;

			if ( this.marker.brace >= 0 ) {
				this.skip( captures );
				return new Token( 'symbol', symbol );
			} else {
				// try to match mustacheEnd
				const token = this.mustacheEnd();
				if ( token && token.type === 'mustacheEnd' ) {
					return token;
				} else {
					this.error( 'Unexpected }' )
				}
			}
		}
	}

	text() {
		const captures = this.match( 'TEXT' );
		if ( captures ) {
			if ( this.state.is( 'tagOpen' ) || this.state.is( 'expressionOpen' ) ) {
				return this.error( 'text appears in unexpected state' );
			}

			this.skip( captures );
			const text = captures[ 0 ];
			return new Token( 'text', text );
		}
	}
	space() {
		const captures = this.match( 'SPACE' );
		if ( captures ) {
			this.skip( captures );
			return new Token( 'space' );
		}
	}
	eos() {
		if ( this.tail.length > 0 ) {
			return;
		}

		return new Token( 'eos' );
	}
}