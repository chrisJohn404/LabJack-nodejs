/**
 * The purpose of parsing and re-indexing the LJM json file is to increase the 
 * speed at which address information can be found.  This file provides access 
 * to dictionarys that have re-indexed the constants file by address (number) 
 * and name (string).
 *
 * @author Chris Johnson (ChrisJohn404)
 *
 * Module Dependencies:
 * fs to load the json file.
 * os to figure out where the json file lives on the currently running computer
 */

var fs = require('fs');				//Load File System module
var os = require('os');				//Load OS module

var utilities = require('./utils');	//Load module for sscanf
var driver_const = require('./driver_const');

//Important constants:
// console.log(os.hostname());
// console.log(os.type());
// console.log(os.platform());
// console.log(os.arch());
// console.log(os.release());
var LJM_JSON_FILE_LOCATION = '/usr/local/share/LabJack/LJM/ljm_constants.json';
var PRIV_LJM_CONS_LOCATION = './LabJackDriver/private_ljm_constants.json';
var PARSE_BETA_REGISTERS = true;

var typeSizes = {
	UINT64: 8,
	INT32: 4,
	STRING: 50,
	UINT16: 2,
	BYTE: 1,
	UINT32: 4,
	FLOAT32: 4
}

/**
 * Error-reporting mechanism.
 * @param {string/number} description error-description
 */
function JSONParsingError(description) {
	this.description = description;
};
function parseRegisterNameString(name)
{
	//var pString = constants.registers[i].name;
	var pString = name;
	var nameString;
	var index = pString.indexOf('#');
	var result = new Array();
	//var result = utilities.sscanf(pString,'AIN#(%d:%d)');
	if(index != -1)
	{
		nameString = pString.slice(0,index);
		pString = pString.slice(index);
		result = utilities.sscanf(pString,'#(%d:%d)%s');
		if(result[2] == null)
		{
			result[2]='';
		}
		
	}
	else
	{
		result[0] = 0;
		result[1] = 0;
		nameString = name;
		result[2] = '';
	}

	return {startNum: result[0], endNum: result[1], name: nameString, nameEnd: result[2]};
}

function getTypeSize(typeName)
{
	var size = typeSizes[typeName];
	if(size === undefined)
		throw "Unknown type"; // TODO: Need better error
	return size;
}

function getTypeSizeInRegisters(typeName)
{
	return getTypeSize(typeName) / 2;
}
//Function that re-indexes the .json File Constants by their register
function reindexConstantsByRegister(constants)
{
	var regInfo;
	var typeSize;
	var regEntry;
	var numValues;
	var retDict;
	var regNum;

	retDict = {};
	retDictName = {};

	for(var i in constants.registers)
	{
		//Get the Entry
		regEntry = constants.registers[i];

		//Create a regInfo object containing the start and end values
		regInfo = parseRegisterNameString(regEntry.name);

		//Get the size
		typeSize = getTypeSizeInRegisters(regEntry.type);

		//Determine how many values to add
		//numValues = (regInfo.endNum - regInfo.startNum)/2+1;
		numValues = regInfo.endNum+1;

		//The starting register number
		regNum=regEntry.address;
		for(var j=0; j<numValues; j++)
		{
			retDict[regNum] = regEntry;
			regNum += typeSize;
			//retDictName[.push({
			//				key: regEntry.name,
			//				value: regEntry
			//			});]
			if(numValues > 1)
			{
				retDictName[regInfo.name+j.toString()+regInfo.nameEnd] = regEntry;
			}
			else
			{
				retDictName[regInfo.name+regInfo.nameEnd] = regEntry;
			}
			//if(numValues>1)
			//{
			//	console.log(regInfo.name+j.toString()+regInfo.nameEnd);
			//}
		}
	}
	//Add Extra Special Registers that don't live in the json file
	retDict[driver_const.T7_MA_EXF_KEY] = {
		address:driver_const.T7_MA_EXF_KEY,
		name:"T7_MA_EXF_KEY",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDict[driver_const.T7_MA_EXF_WRITE] = {
		address:driver_const.T7_MA_EXF_WRITE,
		name:"T7_MA_EXF_WRITE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDict[driver_const.T7_MA_EXF_pWRITE] = {
		address:driver_const.T7_MA_EXF_pWRITE,
		name:"T7_MA_EXF_pWRITE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDict[driver_const.T7_MA_EXF_READ] = {
		address:driver_const.T7_MA_EXF_READ,
		name:"T7_MA_EXF_READ",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDict[driver_const.T7_MA_EXF_pREAD] = {
		address:driver_const.T7_MA_EXF_pREAD,
		name:"T7_MA_EXF_pREAD",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDict[driver_const.T7_MA_EXF_ERASE] = {
		address:driver_const.T7_MA_EXF_ERASE,
		name:"T7_MA_EXF_ERASE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_KEY"] = {
		address:driver_const.T7_MA_EXF_KEY,
		name:"T7_MA_EXF_KEY",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_WRITE"] = {
		address:driver_const.T7_MA_EXF_WRITE,
		name:"T7_MA_EXF_WRITE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_pWRITE"] = {
		address:driver_const.T7_MA_EXF_pWRITE,
		name:"T7_MA_EXF_pWRITE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_READ"] = {
		address:driver_const.T7_MA_EXF_READ,
		name:"T7_MA_EXF_READ",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_pREAD"] = {
		address:driver_const.T7_MA_EXF_pREAD,
		name:"T7_MA_EXF_pREAD",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	retDictName["T7_MA_EXF_ERASE"] = {
		address:driver_const.T7_MA_EXF_ERASE,
		name:"T7_MA_EXF_ERASE",
		type:"UINT32",
		devices:["T7"],
		readwrite:"RW"
	};
	return [retDict, retDictName];
}
/**
 * Object that parses the json file's & saves the two re-indexed dictionarys.
 * @param  {string} LJMJSONFileLocation location of 'ljm_constants.json'
 * @param  {string} privLocation        location of 'private_ljm_constants.json'
 * @throws {JSONParsingError} If [this condition is met]
 */
var parseConstants = function(LJMJSONFileLocation, privLocation) {
	//Load files into memory:
	var jsonFileString = fs.readFileSync(LJMJSONFileLocation, 'utf8');
	var privjsonFIleStr = fs.readFileSync(privLocation, 'utf8');

	var constantsData = JSON.parse(jsonFileString);
	var privConstantsData = JSON.parse(privjsonFIleStr);
	
	var indexedConstants = reindexConstantsByRegister(constantsData);
	this.constantsByRegister = indexedConstants[0];
	this.constantsByName = indexedConstants[1];

	//console.log("JSON-CONSTANTS-PARSER");
	this.getInfo = function(address) {
		var info;
		return info;
	}
	this.search = function(address) {
		return address;
	}
	this.getAddressInfo = function(address, direction)
	{
		var regEntry;
		//Get the Dictionary Entry
		if(typeof(address)=="number")
		{
			regEntry = this.constantsByRegister[address];
		}
		else if(typeof(address)=="string")
		{
			regEntry = this.constantsByName[address];
			//console.log(this.constantsByName);
		}
		//Create a deviceType Variable to save the deviceType number into
		var validity;
		try {
			var readWrite = regEntry.readwrite;
		}
		catch (e)
		{
			return {type: -1, directionValid: 0, typeString: "NA"};
		}

		if(regEntry.type == 'UINT16')
		{
			deviceType = 0;
		}
		else if(regEntry.type == 'UINT32')
		{
			deviceType = 1;
		}
		else if(regEntry.type == 'INT32')
		{
			deviceType = 2;
		}
		else if(regEntry.type == 'FLOAT32')
		{
			deviceType = 3;
		}
		else if(regEntry.type == 'STRING')
		{
			deviceType = 98;
		}
		
		if(regEntry.readwrite.indexOf(direction) != -1)
		{
			validity = 1;
		}
		else
		{
			validity = 0;
		}
		
		return {type: deviceType, directionValid: validity, typeString: regEntry.type};
	}
}

constants = new parseConstants(LJM_JSON_FILE_LOCATION, PRIV_LJM_CONS_LOCATION);
/**
 * Makes the constants object available to other files
 * @return {constants-object} link to the constants object
 */
exports.getConstants = function() {
	return constants;
}