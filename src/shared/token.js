export default function Token( type, value ) {
	this.type = type;
	if ( value ) {
		this.value = value;
	}
}
