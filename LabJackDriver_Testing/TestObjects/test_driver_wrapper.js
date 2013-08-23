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
var driver_const = require('../../LabJackDriver/driver_const');

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
    var retFunction = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        return defaultFunction(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
    };
    retFunction.async = asyncFunction;
    return retFunction;
}
var lastFunctionCall = [];
var expectedResult = 0;
var expectedResultArg = null;
var reportEnd = function(callback) {
	callback(null,expectedResult);
}

//******************************************************************************
//*********************		Basic Device Functions	****************************
//******************************************************************************
var LJM_Open = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_Open");
		return expectedResult;
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		handle = 1;
		lastFunctionCall.push("LJM_OpenAsync");
		reportEnd(callback);
	});

var LJM_OpenS = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_OpenS");
		return expectedResult;
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		lastFunctionCall.push("LJM_OpenSAsync");
		handle = 1;
		reportEnd(callback);
	});

var LJM_Close = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_Close");
		return expectedResult;
	},
	function(handle,callback) {
		lastFunctionCall.push("LJM_CloseAsync");
		reportEnd(callback);
	});

var LJM_GetHandleInfo = createCallableObject(
	function(handle,devT, conT, sN, ipAddr, port, maxB) {
		devT.writeInt32LE(driver_const.LJM_DT_T7,0);
		conT.writeInt32LE(driver_const.LJM_CT_USB,0);
		sN.writeInt32LE(12345678,0);
		ipAddr.writeInt32LE(0x01020304,0);
		port.writeInt32LE(2468,0);
		maxB.writeInt32LE(69,0);
		lastFunctionCall.push("LJM_GetHandleInfo");
		return expectedResult;
	},
	function(handle,devT, conT, sN,ipAddr, port, maxB, callback) {
		devT.writeInt32LE(driver_const.LJM_DT_T7,0);
		conT.writeInt32LE(driver_const.LJM_CT_USB,0);
		sN.writeInt32LE(12345678,0);
		ipAddr.writeInt32LE(0x01020304,0);
		port.writeInt32LE(2468,0);
		maxB.writeInt32LE(69,0);
		lastFunctionCall.push("LJM_GetHandleInfoAsync");
		reportEnd(callback);
	});
//******************************************************************************
//*********************		Read Functions	************************************
//******************************************************************************

/**
 * Test-Function for Synchronous and Async Raw functionality: 
 */
var LJM_ReadRaw = createCallableObject(
	function(handle, data, length) {
		var i;
		var retN;
		if(data.length == length) {
			retN = 69;
		}
		else {
			retN = 0;
		}
		for(i = 0; i < data.length; i++) {
			data.writeUInt8(retN,i);
		}
		lastFunctionCall.push("LJM_ReadRaw");
		return expectedResult;
	},
	function(handle, data, length, callback) {
		var i;
		var retN;
		if(data.length == length) {
			retN = 69;
		}
		else {
			retN = 0;
		}
		for(i = 0; i < data.length; i++) {
			data.writeUInt8(retN,i);
		}
		lastFunctionCall.push("LJM_ReadRawAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadAddress = createCallableObject(
	function(handle, address, addrType, resultPtr) {
		lastFunctionCall.push("LJM_eReadAddress");
		resultPtr.writeDoubleLE(expectedResultArg,0);
		return expectedResult;;
	},
	function(handle, address, addrType, resultPtr, callback) {
		lastFunctionCall.push("LJM_eReadAddressAsync");
		resultPtr.writeDoubleLE(expectedResultArg,0);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadName = createCallableObject(
	function(handle, address, resultPtr) {
		lastFunctionCall.push("LJM_eReadName");
		resultPtr.writeDoubleLE(expectedResultArg,0);
		return expectedResult;
	},
	function(handle, address, resultPtr, callback) {
		lastFunctionCall.push("LJM_eReadNameAsync");
		resultPtr.writeDoubleLE(expectedResultArg,0);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadAddressString = createCallableObject(
	function(handle, address, strBuffer) {
		lastFunctionCall.push("LJM_eReadAddressString");
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		return expectedResult;
	},
	function(handle, address, strBuffer, callback) {
		lastFunctionCall.push("LJM_eReadAddressStringAsync");
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadNameString = createCallableObject(
	function(handle, address, strBuffer) {
		lastFunctionCall.push("LJM_eReadNameString");
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		return expectedResult;
	},
	function(handle, address, strBuffer, callback) {
		lastFunctionCall.push("LJM_eReadNameStringAsync");
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eReadAddresses = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eReadAddresses");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eReadAddressesAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eReadNames = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eReadNames");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eReadNamesAsync");
		reportEnd(callback);
	});

//******************************************************************************
//*********************		Write Functions	************************************
//******************************************************************************

/**
 * Test-Function for Synchronous and Async Raw functionality: 
 */
var LJM_WriteRaw = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_WriteRaw");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_WriteRawAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteAddress = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LWriteAddress");
	},
	function(handle, callback) {
		lastFunctionCall.push("LWriteAddressAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteName = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteName");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNameAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteAddressString = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteAddressString");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteAddressStringAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteNameString = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteNameString");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNameStringAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eWriteAddresses = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteAddresses");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteAddressesAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eWriteNames = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteNames");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNamesAsync");
		reportEnd(callback);
	});

//******************************************************************************
//*********************		Advanced I/O Functions	****************************
//******************************************************************************
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eAddresses = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eAddresses");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eAddressesAsync");
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eNames = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eNames");
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eNamesAsync");
		reportEnd(callback);
	});

//******************************************************************************
//*********************		Driver Dict-Object	********************************
//******************************************************************************
var fakeDriver = {
	// 'LJM_ListAll': LJM_ListAll,
	// 'LJM_ListAllS': LJM_ListAllS,
	'LJM_Open': LJM_Open,
	'LJM_OpenS': LJM_OpenS,
	'LJM_GetHandleInfo': LJM_GetHandleInfo,
	// 'LJM_ResetConnection': LJM_ResetConnection,
	'LJM_Close': LJM_Close,
	// 'LJM_CloseAll': LJM_CloseAll,
	'LJM_WriteRaw': LJM_WriteRaw,
	'LJM_ReadRaw': LJM_ReadRaw,
	'LJM_eWriteAddress': LJM_eWriteAddress,
	'LJM_eReadAddress': LJM_eReadAddress,
	'LJM_eWriteName': LJM_eWriteName,
	'LJM_eReadName': LJM_eReadName,
	'LJM_eReadAddresses': LJM_eReadAddresses,
	'LJM_eReadNames': LJM_eReadNames,
	'LJM_eWriteAddresses': LJM_eWriteAddresses,
	'LJM_eWriteNames': LJM_eWriteNames,
	'LJM_eAddresses': LJM_eAddresses,
	'LJM_eNames': LJM_eNames,
	'LJM_eReadNameString': LJM_eReadNameString,
	'LJM_eReadAddressString': LJM_eReadAddressString,
	'LJM_eWriteNameString': LJM_eWriteNameString,
	'LJM_eWriteAddressString': LJM_eWriteAddressString,
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
exports.setResultArg = function(val) {
	expectedResultArg = val;
}

