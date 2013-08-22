/**
 * This file contains the test-driver object for performing unit tests.
 *
 * @author Chris Johnson (chrisjohn404)
 *
 * Module Dependencies:
 * json_constants_parser, should be located relatively 
 * 		"./LabJackDriver/json_constants_parser"
 */

var ljmJsonManager = require('../../LabJackDriver/json_constants_parser');

var fakeDriverB
{
	this.open = function(deviceType, connectionType, identifier)
	{
		this.async = function(deviceType, connectionType, identifier, callback)
		{
			console.log("Async-Open Function Called");
		}
		console.log
	}
};
function createCallableObject (defaultFunction, asyncFunction) {
    var retFunction = function () {
        defaultFunction();
    };
    retFunction.async = asyncFunction;
    return retFunction;
}
var lastFunctionCall = [];

var expectedResult = 0;
var reportEnd = function(callback) {
	callback(null,expectedResult);
}

var LJM_Open = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_Open");
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		handle = 1;
		lastFunctionCall.push("LJM_OpenAsync");
		reportEnd(callback);
	});

var LJM_OpenS = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_OpenS");
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		lastFunctionCall.push("LJM_OpenSAsync");
		handle = 1;
		reportEnd(callback);
	});
var LJM_Close = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_Close");
	},
	function(handle,callback) {
		lastFunctionCall.push("LJM_CloseAsync");
		reportEnd(callback);
	}
	);

var fakeDriver = {
	// 'LJM_ListAll': LJM_ListAll,
	// 'LJM_ListAllS': LJM_ListAllS,
	'LJM_Open': LJM_Open,
	'LJM_OpenS': LJM_OpenS,
	// 'LJM_GetHandleInfo': LJM_GetHandleInfo,
	// 'LJM_ResetConnection': LJM_ResetConnection,
	'LJM_Close': LJM_Close,
	// 'LJM_CloseAll': LJM_CloseAll,
	// 'LJM_WriteRaw': LJM_WriteRaw,
	// 'LJM_ReadRaw': LJM_ReadRaw,
	// 'LJM_eWriteAddress': LJM_eWriteAddress,
	// 'LJM_eReadAddress': LJM_eReadAddress,
	// 'LJM_eWriteName': LJM_eWriteName,
	// 'LJM_eReadName': LJM_eReadName,
	// 'LJM_eReadAddresses': LJM_eReadAddresses,
	// 'LJM_eReadNames': LJM_eReadNames,
	// 'LJM_eWriteAddresses': LJM_eWriteAddresses,
	// 'LJM_eWriteNames': LJM_eWriteNames,
	// 'LJM_eAddresses': LJM_eAddresses,
	// 'LJM_eNames': LJM_eNames,
	// 'LJM_eReadNameString': LJM_eReadNameString,
	// 'LJM_eReadAddressString': LJM_eReadAddressString,
	// 'LJM_eWriteNameString': LJM_eWriteNameString,
	// 'LJM_eWriteAddressString': LJM_eWriteAddressString,
};

exports.getDriver = function()
{
	return fakeDriver;
}
exports.getConstants = function()
{
	return ljmJsonManager.getConstants();
}
exports.getLastFunctionCall = function() {
	return lastFunctionCall;
}
exports.clearLastFunctionCall = function() {
	lastFunctionCall = [];
}
exports.setExpectedResult = function(val) {
	expectedResult = val;
}
