var functionLocation = {
	'open': 'device',
	'readRaw': 'device',
	'read': 'device',
	'readMany': 'device',
	'writeRaw': 'device',
	'write': 'device',
	'writeMany': 'device',
	'getHandleInfo': 'device',
	'close': 'device',
	'rwMany': 'device',
	'listAll': 'driver',
	'errToStr': 'driver',
};
exports.getList = function() {
	return functionLocation
}
exports.search = function(arg) {
	console.log(arg);
	return functionLocation[arg];
}