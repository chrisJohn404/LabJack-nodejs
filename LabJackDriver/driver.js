


var driver_const = require('./driver_const');
var ref = require('ref');//http://tootallnate.github.io/ref/#types-double
var util = require('util');//
var driverLib = require('./driver_wrapper');
var ffi = require('ffi');//

// For problems encountered while in driver DLL
function DriverOperationError(code)
{
	this.code = code;
};

// For problem with using this layer
function DriverInterfaceError(description)
{
	this.description = description;
};

/**
 * Constructor to initialize the ljmDriver object
 * @return {[type]} [description]
 */
exports.ljmDriver = function()
{
	this.ljm = driverLib.getDriver();
	this.constants = driverLib.getConstants();

	/**
	 * Helper function for the listAll and listAllSync functions to build
	 * the proper return array. 
	 * @param  {number} numFound Appropriate Information from LJM call.
	 * @param  {Buffer} aDevT    Appropriate Information from LJM call.
	 * @param  {Buffer} aConT    Appropriate Information from LJM call.
	 * @param  {Buffer} aSN      Appropriate Information from LJM call.
	 * @param  {Buffer} aIP      Appropriate Information from LJM call.
	 * @return {Dict-Array}          Array to be returned to caller.
	 */
	this.buildListAllArray = function(numFound, aDevT, aConT, aSN, aIP) {
		var deviceInfoArray = new Array();
		var offset = 0;
		for(var i = 0; i < numFound.deref(); i++) {
			var ipStr = "";
			ipStr += aIP.readUInt8(offset+3).toString();
			ipStr += ".";
			ipStr += aIP.readUInt8(offset+2).toString();
			ipStr += ".";
			ipStr += aIP.readUInt8(offset+1).toString();
			ipStr += ".";
			ipStr += aIP.readUInt8(offset).toString();

			//Build Dict-array							
			deviceInfoArray.push(
				{
					deviceType:aDevT.readInt32LE(offset),
					connectionType:aConT.readInt32LE(offset),
					serialNumber:aSN.readInt32LE(offset),
					ipAddress:ipStr
				}
			);
			offset +=4;
		}
		
		return deviceInfoArray;
	}

	/**
	 * Function calls either the LJM_ListALL or LJM_ListAllS functions 
	 * asynchronously.
	 * 
	 * @param  {number/string} deviceType     deviceType constant
	 * @param  {number/string} connectionType connectionType constant
	 * @param  {function} onError        called on error
	 * @param  {function} onSuccess      called on success
	 */
	this.listAll = function(deviceType, connectionType, onError, onSuccess) {
		var errorResult;
		var devT;
		var conT;

		var numFound =  new ref.alloc('int',1);
		var aDeviceTypes = new Buffer(4*128);
		aDeviceTypes.fill(0);
		var aConnectionTypes = new Buffer(4*128);
		aConnectionTypes.fill(0);
		var aSerialNumbers = new Buffer(4*128);
		aSerialNumbers.fill(0);
		var aIPAddresses = new Buffer(4*128);
		aIPAddresses.fill(0);

		//Figure out if we need to augment the input variables
		if(arguments.length < 4) {
			//Do something smart
			devT = "LJM_dtANY";			//
			conT = "LJM_ctANY";			//
			onError = arguments[0];		//Re-define onError as first argument
			onSuccess = arguments[1];	//Re-define onSuccess as second argument
		} else {
			devT = deviceType;
			conT = connectionType;
		}

		var self = this;
		if ((typeof(devT) == "string") && (typeof(conT) == "string")) {
			errorResult = this.ljm.LJM_ListAllS.async(
				devT, 
				conT, 
				numFound, 
				aDeviceTypes, 
				aConnectionTypes, 
				aSerialNumbers, 
				aIPAddresses, 
				function (err, res) {
					if (err) throw err;
					if (res == 0) {						
						var devArray = self.buildListAllArray(
							numFound,
							aDeviceTypes,
							aConnectionTypes,
							aSerialNumbers,
							aIPAddresses
							);
						onSuccess(devArray);
					} else {
						onError(res);
					}
				}
			);
			return 0;
		} else if ((typeof(devT)=="number")&&(typeof(conT)=="number")) {
			errorResult = this.ljm.LJM_ListAll.async(
				devT, 
				conT, 
				numFound, 
				aDeviceTypes, 
				aConnectionTypes, 
				aSerialNumbers, 
				aIPAddresses, 
				function (err, res){
					if(err) throw err;
					if(res == 0)
					{
						var devArray = self.buildListAllArray(
							numFound,
							aDeviceTypes,
							aConnectionTypes,
							aSerialNumbers,
							aIPAddresses
							);
						onSuccess(devArray);
					}
					else
					{
						onError(res);
					}
				}
			);
			return 0;
		} else {
			onError("Weird-Error, listAll");
		}
	}

	/**
	 * Function calls either the LJM_ListALL or LJM_ListAllS functions 
	 * synchronously.
	 * 
	 * @param  {number/string} deviceType     deviceType constant.
	 * @param  {number/string} connectionType connectionType constant.
	 * @return {Dict-array}                Dict-Array of devices found.
	 * @throws {DriverInterfaceError} If There is a problem in this layer.
	 * @throws {DriverOperationError} If A problem occurs when calling the LJM 
	 *         driver.
	 */
	this.listAllSync = function(deviceType, connectionType) {
		var errorResult;
		var devT;
		var conT;

		var numFound =  new ref.alloc('int',1);
		var aDeviceTypes = new Buffer(4*128);
		aDeviceTypes.fill(0);
		var aConnectionTypes = new Buffer(4*128);
		aConnectionTypes.fill(0);
		var aSerialNumbers = new Buffer(4*128);
		aSerialNumbers.fill(0);
		var aIPAddresses = new Buffer(4*128);
		aIPAddresses.fill(0);

		//Figure out if we need to augment the input variables
		if(arguments.length < 2) {
			//Do something smart
			devT = "LJM_dtANY";			//
			conT = "LJM_ctANY";			//
		} else {
			devT = deviceType;
			conT = connectionType;
		}

		if ((typeof(devT) == "string") && (typeof(conT) == "string")) {
			errorResult = this.ljm.LJM_ListAllS(
				devT, 
				conT, 
				numFound, 
				aDeviceTypes, 
				aConnectionTypes, 
				aSerialNumbers, 
				aIPAddresses
			);
		} else if ((typeof(devT)=="number")&&(typeof(conT)=="number")) {
			errorResult = this.ljm.LJM_ListAll(
				devT, 
				conT, 
				numFound, 
				aDeviceTypes, 
				aConnectionTypes, 
				aSerialNumbers, 
				aIPAddresses
			);
		} else {
			throw new DriverInterfaceError("Weird-Error, listAll");
			return "Weird-Error, listAll";
		}
		if (errorResult == 0) {
			var devArray = this.buildListAllArray(
				numFound,
				aDeviceTypes,
				aConnectionTypes,
				aSerialNumbers,
				aIPAddresses
			);
			return devArray;
		} else {
			throw new DriverOperationError(errorResult);
			return errorResult;
		}

	}

	/**
	 * Converts an error number to a string asynchronously.
	 * @param  {number} errNum    number to be converted to a string.
	 * @param  {function} onError   function called on error.
	 * @param  {function} onSuccess function called on success.
	 */
	this.errToStr = function(errNum, onError, onSuccess) {
		var errorResult=0;
		var strRes = new Buffer(50);
		strRes.fill(0);
		errorResult = this.ljm.LJM_ErrorToString.async(
			errNum, 
			strRes, 
			function (err, res){
				if (err) throw err;
				if (res == 0) {
					//console.log('strRes: ',ref.readCString(strRes,0));
					onSuccess('Num: '+errNum+', '+ref.readCString(strRes,0));
				} else {
					//console.log('BAD!',ref.readCString(strRes,0));
					onError('Num: '+errNum+', '+ref.readCString(strRes,0));
				}
			}
		);
		return 0;
	}

	/**
	 * Converts an error number to a string synchronously.
	 * @param  {number} errNum    number to be converted to a string.
	 */
	this.errToStrSync = function(errNum) {
		var errorResult=0;

		var strRes = new Buffer(50);
		strRes.fill(0);

		errorResult = this.ljm.LJM_ErrorToString(errNum, strRes);
		if (errorResult != 0) {
			return 'Num: '+errNum+', '+ref.readCString(strRes,0);
		} else {
			return 'Num: '+errNum+', '+ref.readCString(strRes,0);
		}
	}
	
	/**
	 * Calls the LJM_LoadConstants function asynchronously.
	 * @param  {function} onError   Function called on error.
	 * @param  {function} onSuccess Function called on success.
	 */
	this.loadConstants = function(onError, onSuccess) {
		var errorResult;
		errorResult = this.ljm.LJM_LoadConstants.async(
			function (err, res){
				if (err) throw err;
				if (res == 0) {
					onSuccess();
				} else {
					onError(res);
				}
			}
		);
		return 0;
	}

	/**
	 * Calls the LJM_LoadConstants function synchronously.
	 */
	this.loadConstantsSync = function() {
		var errorResult;
		errorResult = this.ljm.LJM_LoadConstants();
		if (errorResult != 0) {
			return errorResult;
		} else {
			return 0;
		}
	}

	/**
	 * Calls the LJM_CloseAll function asynchronously.
	 * @param  {function} onError   Function called on error
	 * @param  {function} onSuccess Function called on success
	 */
	this.closeAll = function(onError, onSuccess) {
		var errorResult;
		errorResult = this.ljm.LJM_CloseAll.async(
			function (err, res){
				if (err) throw err;
				if (res == 0) {
					onSuccess();
				} else {
					onError(res);
				}
			}
		);
		return 0;
	}

	/**
	 * Calls the LJM_CloseAll function synchronously.
	 */
	this.closeAllSync = function() {
		var errorResult;
		errorResult = this.ljm.LJM_CloseAll();
		if (errorResult != 0) {
			return errorResult;
		} else {
			return 0;
		}

	}

	/**
	 * Calls the LJM_ReadLIbraryConfigS function asynchronously.
	 * @param  {string} parameter LJM driver constant to read.
	 * @param  {function} onError   Function called on error.
	 * @param  {function} onSuccess Function called on success.
	 */
	this.readLibrary = function(parameter, onError, onSuccess) {
		if(typeof(parameter) == 'string') {
			var errorResult;
			var returnVar = new ref.alloc('double',1);

			errorResult = this.ljm.LJM_ReadLibraryConfigS.async(
				parameter, 
				returnVar, 
				function (err, res){
					if (err) throw err;
					if (res == 0) {
						onSuccess(returnVar.deref())
					} else {
						onError(res);
					}
				}
			);
			return 0;
		} else {
			onError('Invalid Input Parameter Type');
		}
	}
	
	/**
	 * Calls the LJM_ReadLIbraryConfigS function synchronously.
	 * @param  {string} parameter LJM driver constant to read.
	 * @return {number}           Value to be returned.
	 */
	this.readLibrarySync = function(parameter) {
		if(typeof(parameter) == 'string') {
			var errorResult;
			var returnVar = new ref.alloc('double',1);

			errorResult = this.ljm.LJM_ReadLibraryConfigS(
				parameter, 
				returnVar
			);
			if(errorResult != 0)
			{
				return errorResult
			}
			return returnVar.deref();
		} else {
			throw DriverInterfaceError('Invalid Input Parameter Type');
			return 'Invalid Input Parameter Type';
		}
	}
	this.readLibraryS = function (parameter, onError, onSuccess) {
		throw 'NOT IMPLEMENTED';
	}
	this.readLibrarySSync = function (parameter) {
		throw 'NOT IMPLEMENTED';
	}

	/**
	 * Calls the LJM_WriteLibraryConfigS function asynchronously.
	 * 
	 * @param  {number/string} parameter The constant to be read.
	 * @param  {number} value     The value to write.
	 * @param  {function} onError   Function called on error.
	 * @param  {function} onSuccess Function called on success.
	 */
	this.writeLibrary = function (parameter, value, onError, onSuccess) {
		var errorResult;
		if ((typeof(parameter) == 'string')&&(typeof(value)=='number')) {
			errorResult = this.ljm.LJM_WriteLibraryConfigS(
				parameter, 
				value, 
				function (err, res) {
					if (err) throw err;
					if (res == 0) {
						onSuccess();
					} else {
						onError(res);
					}
				}
			);
			return 0;
		} else if((typeof(parameter) == 'string')&&(typeof(value)=='string')) {
			errorResult = this.ljm.LJM_WriteLibraryConfigStringS(
				parameter, 
				value, 
				function (err, res) {
					if (err) throw err;
					if (res == 0) {
						onSuccess();
					} else {
						onError(res);
					}
				}
			);
			return 0;
		} else {
			onError('Invalid Input Parameter Types');
		}
	}

	/**
	 * Calls the LJM_WriteLibraryConfigS function synchronously.
	 * 
	 * @param  {number/string} parameter The constant to be read.
	 * @param  {number} value     The value to write.
	 */
	this.writeLibrarySync = function (parameter, value) {
		var errorResult;
		if ((typeof(parameter)=='string')&&(typeof(value)=='number')) {
			errorResult = this.ljm.LJM_WriteLibraryConfigS(
				parameter, 
				value
			);
		} else if ((typeof(parameter)=='string')&&(typeof(value)=='string')) {
			errorResult = this.ljm.LJM_WriteLibraryConfigStringS(
				parameter, 
				value
			);
		} else {
			throw DriverInterfaceError('Invalid Input Parameter Types');
			return 'Invalid Input Parameter Types';
		}
		//Check for an error from driver & throw error
		if(errorResult != 0)
		{
			throw new DriverOperationError(errorResult);
			return errorResult;
		}
		else 
		{
			return 0;
		}
	}

	/**
	 * Calls the LJM_Log function asynchronously.
	 * @param  {number} level     The log level to report the string at.
	 * @param  {string} str       The string to be written to the log file.
	 * @param  {function} onError   Function called on error.
	 * @param  {function} onSuccess Function called on success.
	 */
	this.logS = function(level, str, onError, onSuccess) {
		if((typeof(level)!= 'number')||(typeof(str)!='string'))
		{
			onError('wrong types');
			return 0;
		}
		var errorResult;
		var strW = new Buffer(50);
		strW.fill(0);
		if(str.length < 50)
		{
			ref.writeCString(str);
		}
		else
		{
			onError('string to long');
			return 0;
		}
		errorResult = this.ljm.LJM_Log.async(
			level, 
			number,
			function (err, res) {
				if (err) throw err;
				if (res == 0) {
					onSuccess();
				} else {
					onError(res);
				}
			}
		);
		return 0;
	}

	/**
	 * Calls the LJM_Log function synchronously.
	 * @param  {number} level     The log level to report the string at.
	 * @param  {string} str       The string to be written to the log file.
	 */
	this.logSSync = function(level, str) {
		if((typeof(level)!= 'number')||(typeof(str)!='string'))
		{
			throw new DriverInterfaceError('wrong types');
			return 'wrong types';
		}
		var errorResult;
		var strW = new Buffer(50);
		strW.fill(0);
		if(str.length < 50)
		{
			ref.writeCString(str);
		}
		else
		{
			throw new DriverInterfaceError('string to long');
			return 'string to long';
		}

		errorResult = this.ljm.LJM_Log(level, number);
		if(errorResult != 0)
		{
			return errorResult;
		}
		return 0;
	}

	/**
	 * Asynchronously calls the LJM_ResetLog function.
	 * @param  {function} onError   Function called on error.
	 * @param  {function} onSuccess Function called on success.
	 */
	this.resetLog = function(onError, onSuccess) {
		var errorResult;
		errorResult = this.ljm.LJM_ResetLog.async(
			function (err, res) {
				if (err) throw err;
				if (res == 0) {
					onSuccess();
				} else {
					onError(res);
				}
			}
		);
		return 0;
	}

	/**
	 * Synchronously calls the LJM_ResetLog function.
	 */
	this.resetLogSync = function() {
		var errorResult;
		errorResult = this.ljm.LJM_ResetLog();
		if(errorResult != 0)
		{
			return errorResult;
		}
		return 0;
	}

	//Read the Driver Version number
	this.installedDriverVersion = this.readLibrarySync('LJM_LIBRARY_VERSION');
	if(this.installedDriverVersion!= driver_const.LJM_JS_VERSION)
	{
		console.log('The Supported Version for this driver is: '+driver_const.LJM_JS_VERSION+', you are using: ', this.installedDriverVersion);
	}
	//Enable Logging
	//this.driver.LJM_WriteLibraryConfigS('LJM_LOG_MODE',2);
	//this.driver.LJM_WriteLibraryConfigS('LJM_LOG_LEVEL',2);
	//this.driver.LJM_Log(2,"LabJack-Device Enabled");
}