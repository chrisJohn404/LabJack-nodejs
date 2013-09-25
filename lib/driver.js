/**
 * Wrapper around LabJack LJM driver.
 *
 * @author Chris Johnson (chrisjohn404, LabJack Corp.)
**/

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
 * Constructor for an object acting as LJM driver wrapper.
 */
exports.ljmDriver = function()
{
	this.ljm = driverLib.getDriver();
	this.constants = driverLib.getConstants();

	/**
	 * Dereferences buffers and zips arrays in building listAll return values.
	 *
	 * Helper function for the listAll and listAllSync functions to zip arrays
	 * and dereference native interface buffers containing information about the
	 * devices that are available for opening.
	 *
	 * @param {number} numFound 
	 * @param {Buffer} aDevT Buffer containing a collection of device types as
	 *		provided by LJM.
	 * @param {Buffer} aConT Buffer containing information about how each device
	 *		
	 * @param {Buffer} aSN      Appropriate Information from LJM call.
	 * @param {Buffer} aIP      Appropriate Information from LJM call.
	 * @return {array} Array of objects, each with information about an
	 *		available device.
	 */
	this.buildListAllArray = function(numFound, aDevT, aConT, aSN, aIP) {
		var deviceInfoArray = new Array();
		var offset = 0;
		var numDevices = numFound.deref();
		for(var i = 0; i < numDevices; i++) {
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
	 * Retrieves a list of all LabJack devices avaialable for opening.
	 *
	 * Function calls either the LJM_ListALL or LJM_ListAllS functions 
	 * asynchronously.
	 * 
	 * @param {string} deviceType String describing what type of device to
	 *		open. Examples include 'LJM_dtT7'. May also be an integer constant
	 *		corresponding to the device type.
	 * @param {string} connectionType connectionType String describing what
	 *		type of connection to open. Examples include 'LJM_ctUSB' and
	 *		'LJM_ctANY'. May also be an integer constant corresponding to the
	 *		appropriate connection medium to use.
	 * @param {function} onError Function to call if an error is encoutnered
	 *		while enumerating available devices. Must take a single parameter
	 *		(either an integer or string) describing the error encountered.
	 * @param {function} onSuccess Function to call with the resulting
	 *		enumeration. Should take a single argument: the listing of
	 8		avilable devices as an array of object.
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
					if(res == 0) {
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
		} else {
			onError("Weird-Error, listAll");
		}
	}

	/**
	 * Synchronous version of listAll.
	 * 
	 * @param {string} deviceType String describing what type of device to
	 *		open. Examples include 'LJM_dtT7'. May also be an integer constant
	 *		corresponding to the device type.
	 * @param {string} connectionType connectionType String describing what
	 *		type of connection to open. Examples include 'LJM_ctUSB' and
	 *		'LJM_ctANY'. May also be an integer constant corresponding to the
	 *		appropriate connection medium to use.
	 * @return {array} the listing of avilable devices as an array of object.
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
	**/
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
	 * @param {number} errNum Error number to be converted to a string.
	 * @param {function} onError Function to call if an error is encountered
	 *		while converting the provided error number to a string description.
	 * @param {function} onSuccess Function to call with the string description
	 *		of the error number passed. Should take a single argument: the
	 *		resulting string description.
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
	 * Synchrnonous version of errToStr.
	 * @param {number} errNum Error number to be converted to a string.
	 * @return {string} The string error description corresponding to the
	 *		provided error numebr.
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
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
	 * Loads driver constants into memory.
	 *
	 * @param {function} onError Function to call if an error is encoutnered in
	 *		loading driver constants. Should take a single arugment: an integer
	 *		or string description of the error encoutnered.
	 * @param {function} onSuccess Function to call after constants have been
	 *		loaded. Should take no arguments.
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
	 *
	 * @throws {DriverOperationError} Error thrown if the driver could not load
	 *		constants, likely because of file system issues.
	 */
	this.loadConstantsSync = function() {
		var errorResult;
		errorResult = this.ljm.LJM_LoadConstants();
		if (errorResult != 0) {
			throw new DriverOperationError(errorResult);
		} else {
			return 0;
		}
	}

	/**
	 * Close all open LabJack devices.
	 *
	 * @param {function} onError Function to call if an error is encountered
	 *		while closing devices. Should take a single arugment: a description
	 *		of the error encountered as a string description or integer error
	 *		number.
	 * @param {function} onSuccess Function to call after all devices have
	 *		been closed. Should take no arguments.
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
	 * Synchronous version of closeAll.
	 *
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
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
	 * Read an operational configuration setting for LJM.
	 *
	 * @param {string} parameter The name of the configuration setting to reads.
	 * @param {function} onError Function to call if an error is encountered
	 * 		while reading this configuration setting. This function should
	 *		take a single argument: a string error description or number
	 *		error code.
	 * @param {function} onSuccess Function to call after the configuration
	 *		setting has been applied. Should take a single argument: the value
	 *		of the configuration setting as read from LJM.
	 */
	this.readLibrary = function(parameter, onError, onSuccess) {
		if (typeof(parameter) == 'string') {
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
	 * Synchronous version of readLibrary.
	 *
	 * @param  {string} parameter The name of the configuration setting to read.
	 * @return {number} The value of the provided configuration setting.
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
	 */
	this.readLibrarySync = function(parameter) {
		if(typeof(parameter) == 'string') {
			var errorResult;
			var returnVar = new ref.alloc('double',1);

			errorResult = this.ljm.LJM_ReadLibraryConfigS(
				parameter, 
				returnVar
			);
			if (errorResult != 0) {
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
		if (errorResult != 0) {
			throw new DriverOperationError(errorResult);
			return errorResult;
		} else {
			return 0;
		}
	}

	/**
	 * Log an event through LJM's internal logging system.
	 *
	 * @param {number} level The severity of the event to report. Should
	 *		correspond to a driver severity level constant.
	 * @param {string} str Description of the event.
	 * @param {function} onError Function to call if the log could not be
	 *		updated successfully. Should take a single argument: either a string
	 *		description of the error or number of the error code.
	 * @param {function} onSuccess Function to call after the event has been
	 *		logged successfully.
	 */
	this.logS = function(level, str, onError, onSuccess) {
		if ((typeof(level)!= 'number')||(typeof(str)!='string')) {
			onError('wrong types');
			return 0;
		}
		var errorResult;
		var strW = new Buffer(50);
		strW.fill(0);
		if(str.length < 50) {
			ref.writeCString(str);
		} else {
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
	 * Synchronous version of logS.
	 *
	 * @param {number} level The severity of the event to report. Should
	 *		correspond to a driver severity level constant.
	 * @param {string} str Description of the event.
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
	**/
	this.logSSync = function(level, str) {
		if ((typeof(level)!= 'number')||(typeof(str)!='string')) {
			throw new DriverInterfaceError('wrong types');
			return 'wrong types';
		}
		var errorResult;
		var strW = new Buffer(50);
		strW.fill(0);
		if (str.length < 50) {
			ref.writeCString(str);
		} else {
			throw new DriverInterfaceError('string to long');
		}

		errorResult = this.ljm.LJM_Log(level, number);
		if (errorResult != 0) {
			throw new DriverOperationError(errorResult);
		}
	}

	/**
	 * Reset LJM's internall logging system.
	 *
	 * @param {function} onError Function to call if the log could not be
	 *		updated successfully. Should take a single argument: either a string
	 *		description of the error or number of the error code.
	 * @param {function} onSuccess Function called on success. Should not take
	 *		any arguments.
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
	}

	/**
	 * Synchronously calls resetLog.
	 *
	 * @throws {DriverInterfaceError} Thrown if an exception is encountered in
	 *		the Node.js wrapper around the driver.
	 * @throws {DriverOperationError} Thrown if an exception is encountered in
	 *		the LJM driver itself.
	 */
	this.resetLogSync = function() {
		var errorResult;
		errorResult = this.ljm.LJM_ResetLog();
		if (errorResult != 0) {
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