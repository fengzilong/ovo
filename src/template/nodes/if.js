export default function IfStatement ( { test, consequent, alternate } ) {
	return {
		type: 'if',
		test,
		consequent,
		alternate,
	};
}
