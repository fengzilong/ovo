import builtin from './builtin';

export default function ( regexp = new RegExp(), map = {} ) {
	map = Object.assign( {}, builtin, map );
	const regStr = regexp.source.replace(
		/{{([_-\w]+)}}/g,
		function ( all, key ) {
			return map[ key ];
		}
	);

	return new RegExp( regStr, regexp.flags );
}
