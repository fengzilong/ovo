export default map => ( regexp = new RegExp() ) => {
	map = Object.assign( {}, map );
	const regStr = regexp.source.replace(
		/{{([_-\w]+)}}/g,
		function ( all, key ) {
			return map[ key ];
		}
	);

	return new RegExp( regStr, regexp.flags );
};
