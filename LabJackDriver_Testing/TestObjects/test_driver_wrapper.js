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
var argumentsList = [];
var reportEnd = function(callback) {
	callback(null,expectedResult);
}


//******************************************************************************
//*********************		Basic Device Functions	****************************
//******************************************************************************
var LJM_Open = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_Open");
		argumentsList.push(arguments);
		return expectedResult;
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		lastFunctionCall.push("LJM_OpenAsync");
		argumentsList.push(arguments);
		handle = 1;
		reportEnd(callback);
	});

var LJM_OpenS = createCallableObject(
	function(deviceType, connectionType, identifier, handle) {
		lastFunctionCall.push("LJM_OpenS");
		argumentsList.push(arguments);
		return expectedResult;
	},
	function(deviceType, connectionType, identifier, handle, callback) {
		lastFunctionCall.push("LJM_OpenSAsync");
		argumentsList.push(arguments);
		handle = 1;
		reportEnd(callback);
	});

var LJM_Close = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_Close");
		argumentsList.push(arguments);
		return expectedResult;
	},
	function(handle,callback) {
		lastFunctionCall.push("LJM_CloseAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});

var LJM_GetHandleInfo = createCallableObject(
	function(handle,devT, conT, sN, ipAddr, port, maxB) {
		lastFunctionCall.push("LJM_GetHandleInfo");
		argumentsList.push(arguments);
		devT.writeInt32LE(driver_const.LJM_DT_T7,0);
		conT.writeInt32LE(driver_const.LJM_CT_USB,0);
		sN.writeInt32LE(12345678,0);
		ipAddr.writeInt32LE(0x01020304,0);
		port.writeInt32LE(2468,0);
		maxB.writeInt32LE(69,0);
		return expectedResult;
	},
	function(handle,devT, conT, sN,ipAddr, port, maxB, callback) {
		lastFunctionCall.push("LJM_GetHandleInfoAsync");
		argumentsList.push(arguments);
		devT.writeInt32LE(driver_const.LJM_DT_T7,0);
		conT.writeInt32LE(driver_const.LJM_CT_USB,0);
		sN.writeInt32LE(12345678,0);
		ipAddr.writeInt32LE(0x01020304,0);
		port.writeInt32LE(2468,0);
		maxB.writeInt32LE(69,0);
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
		lastFunctionCall.push("LJM_ReadRaw");
		argumentsList.push(arguments);
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
		return expectedResult;
	},
	function(handle, data, length, callback) {
		lastFunctionCall.push("LJM_ReadRawAsync");
		argumentsList.push(arguments);
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
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadAddress = createCallableObject(
	function(handle, address, addrType, resultPtr) {
		lastFunctionCall.push("LJM_eReadAddress");
		argumentsList.push(arguments);
		resultPtr.writeDoubleLE(expectedResultArg,0);
		return expectedResult;;
	},
	function(handle, address, addrType, resultPtr, callback) {
		lastFunctionCall.push("LJM_eReadAddressAsync");
		argumentsList.push(arguments);
		resultPtr.writeDoubleLE(expectedResultArg,0);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadName = createCallableObject(
	function(handle, address, resultPtr) {
		lastFunctionCall.push("LJM_eReadName");
		argumentsList.push(arguments);
		resultPtr.writeDoubleLE(expectedResultArg,0);
		return expectedResult;
	},
	function(handle, address, resultPtr, callback) {
		lastFunctionCall.push("LJM_eReadNameAsync");
		argumentsList.push(arguments);
		resultPtr.writeDoubleLE(expectedResultArg,0);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eReadAddressString = createCallableObject(
	function(handle, address, strBuffer) {
		lastFunctionCall.push("LJM_eReadAddressString");
		argumentsList.push(arguments);
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		return expectedResult;
	},
	function(handle, address, strBuffer, callback) {
		lastFunctionCall.push("LJM_eReadAddressStringAsync");
		argumentsList.push(arguments);
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
		argumentsList.push(arguments);
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		return expectedResult;
	},
	function(handle, address, strBuffer, callback) {
		lastFunctionCall.push("LJM_eReadNameStringAsync");
		argumentsList.push(arguments);
		strBuffer.write("TEST");
		strBuffer.writeUInt8(0,4);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eReadAddresses = createCallableObject(
	function(handle, length, addresses, types, results, errors) {
		lastFunctionCall.push("LJM_eReadAddresses");
		argumentsList.push(arguments);
		var numReads = addresses.length;
		if(addresses.length != types.length) {
			console.log('ERROR!!!', numReads, types.length);
		}
		for(var i = 0; i < length; i++) {
			results.writeDoubleLE(expectedResultArg[i],i*8);
		}
		return expectedResult;
	},
	function(handle, length, addresses, types, results, errors, callback) {
		lastFunctionCall.push("LJM_eReadAddressesAsync");
		argumentsList.push(arguments);
		var numReads = addresses.length;
		if(addresses.length != types.length) {
			console.log('ERROR!!!', numReads, types.length);
		}
		for(var i = 0; i < length; i++) {
			results.writeDoubleLE(expectedResultArg[i],i*8);
		}
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eReadNames = createCallableObject(
	function(handle, length, addresses, results, errors) {
		lastFunctionCall.push("LJM_eReadNames");
		argumentsList.push(arguments);
		var numReads = addresses.length;
		if(addresses.length != results.length) {
			console.log('ERROR!!!', numReads, results.length);
		}
		for(var i = 0; i < length; i++) {
			results.writeDoubleLE(expectedResultArg[i],i*8);
		}
		return expectedResult;
	},
	function(handle, length, addresses, results, errors, callback) {
		lastFunctionCall.push("LJM_eReadNamesAsync");
		argumentsList.push(arguments);
		var numReads = addresses.length;
		if(addresses.length != results.length) {
			console.log('ERROR!!!', numReads, results.length);
		}
		for(var i = 0; i < length; i++) {
			results.writeDoubleLE(expectedResultArg[i],i*8);
		}
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
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_WriteRawAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteAddress = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LWriteAddress");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LWriteAddressAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteName = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteName");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNameAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteAddressString = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteAddressString");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteAddressStringAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Single operation functionality: 
 */
var LJM_eWriteNameString = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteNameString");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNameStringAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eWriteAddresses = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteAddresses");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteAddressesAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eWriteNames = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eWriteNames");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eWriteNamesAsync");
		argumentsList.push(arguments);
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
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eAddressesAsync");
		argumentsList.push(arguments);
		reportEnd(callback);
	});
/**
 * Test-Function for Synchronous and Async Multiple-Operation functionality: 
 */
var LJM_eNames = createCallableObject(
	function(handle) {
		lastFunctionCall.push("LJM_eNames");
		argumentsList.push(arguments);
	},
	function(handle, callback) {
		lastFunctionCall.push("LJM_eNamesAsync");
		argumentsList.push(arguments);
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
exports.clearArgumentsList = function(val) {
	argumentsList = [];
}
exports.getArgumentsList = function(val) {
	return argumentsList;
}