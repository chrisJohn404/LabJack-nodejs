/**
 * This file contains unit tests for testing functions in the 
 * LabJackDriver/device.js file.  Using "rewire" it replaces the 
 * driver_wrapper.js library with a virtual device for testing purposes.
 *
 * @author Chris Johnson (chrisjohn404)
 *
 * Module Dependencies:
 * rewire, can be installed using "npm install rewire"
 * device, should be located relatively "../labJackDriver/device.js"
 * test_driver_wrapper, should be located relatively 
 * 		"./TestObjects/test_driver_wrapper"
 */

var rewire = require('rewire');
var q = require('q');
var fakeDriver = require('./TestObjects/test_driver_wrapper');

var driver_wrapper = rewire('../LabJackDriver/driver_wrapper');

var deviceManager = rewire('../LabJackDriver/device');
deviceManager.__set__('driverLib',fakeDriver);

var driver_const = require('../LabJackDriver/driver_const');

var asyncRun = require('./UtilityCode/asyncUtility');
var syncRun = require('./UtilityCode/syncUtility');

var dev;
var autoOpen = false;
var autoClose = false;

var testVal = 69;

module.exports = {
	setUp: function(callback) {
		//this.mockDevice = new MockDevice();
		if(autoOpen) {
			dev = new deviceManager.labjack();
			dev.open(function(res) {
				console.log("Err-Setup/Teardown!!!");
			},
			function(res) {
				fakeDriver.clearLastFunctionCall();
				callback();
			});
		}
		else {
			callback();
		}
	},
	tearDown: function (callback) {
        // clean up
        if(autoClose) {
        	dev.close(function(res) {
        		console.log("Err-Setup/Teardown!!!");
        	},
        	function(res) {
        		fakeDriver.clearLastFunctionCall();
        		fakeDriver.setExpectedResult(0);
        		fakeDriver.clearArgumentsList();
        		asyncRun.clearResults();
        		syncRun.clearResults();
        		callback();
        	});
        }
        else {
        	fakeDriver.clearLastFunctionCall();
        	fakeDriver.clearArgumentsList();
        	fakeDriver.setExpectedResult(0);
        	callback();
        }
    },

	/**
	 * Tests the standard LJM open call.
	 * 		1. The LJM function "Open" should be called.
	 * 		2. A handle acquired.
	 * 		3. The device information saved.
	 * 		4. Function should succede at opening a device.
	 * 		5. Close a Device
	 * 
	 * @param  {[type]} test
	 * @return {[type]}
	 */
	testOpen: function(test) {
		var device = new deviceManager.labjack();
		device.open(
			driver_const.LJM_DT_ANY,
			driver_const.LJM_CT_ANY,
			"LJM_idANY",
		function(res) {
			console.log("Opening Error");
		},
		function(res) {
			//get the handle & make sure it isn't zero
			test.notStrictEqual(device.handle, null);
			test.notEqual(device.handle, 0);

			//Make sure that LJM_OpenSAsync was called
			test.equal(fakeDriver.getLastFunctionCall().length,1);
			test.equal(fakeDriver.getLastFunctionCall()[0],"LJM_OpenAsync");

			//Make sure that dtAny, ctAny, and idAny were used as variables
			test.equal(device.deviceType,driver_const.LJM_DT_ANY);
			test.equal(device.connectionType,driver_const.LJM_CT_ANY);
			test.equal(device.identifier,"LJM_idANY");
			
			//Close the Device
			device.close(
				function(res) {
					console.log("Closing Error");
				},
				function(res) {
					test.strictEqual(device.handle, null);
					test.strictEqual(device.deviceType,null);
					test.strictEqual(device.connectionType,null);
					test.strictEqual(device.identifier,null);
					test.equal(
						fakeDriver.getLastFunctionCall()[1],
						"LJM_CloseAsync"
					);
					test.done();
				});
		});
	},

	/**
	 * Tests the string-open feature of the device class. 
	 * 		1. The LJM function "OpenS" should be called.
	 * 		2. A handle acquired.
	 * 		3. The device information saved.
	 * 		4. Function should succede at opening a device.
	 * 
	 * @param  {[type]} test
	 * @return {[type]}
	 */
	testOpenS: function(test) {
		var device = new deviceManager.labjack();
		device.open("LJM_dtT7","LJM_ctUSB","LJM_idANY",
		function(res) {
			console.log("Opening Error");
		},
		function(res) {
			//get the handle & make sure it isn't zero
			test.notStrictEqual(device.handle, null);
			test.notEqual(device.handle, 0);

			//Make sure that LJM_OpenSAsync was called
			test.equal(fakeDriver.getLastFunctionCall().length,1);
			test.equal(fakeDriver.getLastFunctionCall()[0],"LJM_OpenSAsync");

			//Make sure that dtAny, ctAny, and idAny were used as variables
			test.equal(device.deviceType,"LJM_dtT7");
			test.equal(device.connectionType,"LJM_ctUSB");
			test.equal(device.identifier,"LJM_idANY");
			
			//Close the Device
			device.close(
				function(res) {
					console.log("Closing Error");
				},
				function(res) {
					test.strictEqual(device.handle, null);
					test.strictEqual(device.deviceType,null);
					test.strictEqual(device.connectionType,null);
					test.strictEqual(device.identifier,null);
					test.equal(
						fakeDriver.getLastFunctionCall()[1],
						"LJM_CloseAsync"
						);
					test.done();
				});
		});
	},
	/**
	 * Tests the open feature when no information is passed to the driver. A
	 * device should be opened using the Open LJM function with commands: 
	 * 		1. DeviceType any 
	 * 		2. ConnectionTypeπ any 
	 * 		3. Identifier any
	 * @param  {[type]} test
	 * @return {[type]}
	 */
	testOpenEmpty: function(test) {
		var device = new deviceManager.labjack();
		device.open(
		function(res) {
			console.log("Opening Error");
		},
		function(res) {
			//get the handle & make sure it isn't zero
			test.notStrictEqual(device.handle, null);
			test.notEqual(device.handle, 0);

			//Make sure that LJM_OpenSAsync was called
			test.equal(fakeDriver.getLastFunctionCall().length,1);
			test.equal(fakeDriver.getLastFunctionCall()[0],"LJM_OpenSAsync");

			//Make sure that dtAny, ctAny, and idAny were used as variables
			test.equal(device.deviceType,"LJM_dtANY");
			test.equal(device.connectionType,"LJM_ctANY");
			test.equal(device.identifier,"LJM_idANY");
			
			//Close the Device
			device.close(
				function(res) {
					console.log("Closing Error");
				},
				function(res) {
					test.strictEqual(device.handle, null);
					test.strictEqual(device.deviceType,null);
					test.strictEqual(device.connectionType,null);
					test.strictEqual(device.identifier,null);
					test.equal(
						fakeDriver.getLastFunctionCall()[1],
						"LJM_CloseAsync"
					);
					test.done();
				});
		});
	},
	/**
	 * Tests the error-reporting features of the open command in Async-mode.  
	 * 		1. An error should be reported via the onError function.
	 * 		2. No device information should be saved.
	 * 		3. There should be no device handle saved.
	 * 
	 * @param  {[type]} test
	 */
	testOpenNoDeviceFail: function(test) {
		//Force the open call to fail w/ error code 1
		var erCode = 1;
		fakeDriver.setExpectedResult(erCode);

		var device = new deviceManager.labjack();
		device.open("LJM_dtANY","LJM_ctANY","LJM_idANY",
		function(res) {
			test.equal(res,erCode);
			test.strictEqual(device.handle, null);
			test.strictEqual(device.deviceType,null);
			test.strictEqual(device.connectionType,null);
			test.strictEqual(device.identifier,null);
			//Try closing a device even though one has never been opened
			device.close(
				function(res) {
					test.equal(res,"Device Never Opened");
					autoOpen = true; //Request that the test enviro. auto-open
					test.done();
				},
				function(res) {
					console.log("CloseSuccess, ERROR!! NOT SUPPOSED TO HAPPEN");
				});
		},
		function(res) {
			console.log("OpenSuccess, ERROR!!!!!!! NOT SUPPOSED TO HAPPEN");
		});
	},

	/**
	 * Tests the getHandleInfo function
	 * @param  {[type]} test
	 */
	testGetHandleInfo: function(test) {
		autoClose = true;//Request that the test enviro. auto-close

		dev.getHandleInfo(function(res) {
			console.log('ErrGetHandleInfo');
		},
		function(res) {
			//Test the return values
			test.equal(res.deviceType,driver_const.LJM_DT_T7);
			test.equal(res.connectionType,driver_const.LJM_CT_USB);
			test.equal(res.serialNumber,12345678);
			test.equal(res.ipAddress,"1.2.3.4");
			test.equal(res.port,2468);
			test.equal(res.maxBytesPerMB,testVal);
			test.equal(fakeDriver.getLastFunctionCall()[0],"LJM_GetHandleInfoAsync");
			test.done();
		});
	},

	/**
	 * This test tests the LJM_eReadRaw asynchronous function call of LJM.
	 * @param  {[type]} test The test object.
	 */
	testReadRaw: function(test) {
		var data=[0,0,0,0,0,0,0,0,0,0];

		var testBuf = new Buffer(data.length);
		testBuf.fill(testVal);//Fill buffer with success data
		dev.readRaw(data,function(res) {
			//Error
			console.log("!!!!ReadRaw ERROR!!!!")
		},
		function(res) {
			//Success
			var i;
			for(i = 0; i < res.length; i++) {
				test.equal(testBuf.readUInt8(i),res.readUInt8(i));
			}
			test.equal(fakeDriver.getLastFunctionCall()[0],"LJM_ReadRawAsync");
			test.done();
		});
	},

	/**
	 * This test tests the LJM_eReadName, LJM_eReadAddress, LJM_eReadNameString,
	 * and LJM_eReadAddressString asynchronous function calls of LJM.
	 * @param  {[type]} test The test object.
	 */
	testRead: function(test) {
		fakeDriver.setResultArg(testVal);
		asyncRun.config(dev,null);
		syncRun.config(dev,null);
		var testList = [
		'read(0)',
		'read("AIN0")',
		'read(60500)',
		'read("DEVICE_NAME_DEFAULT")'
		];
		var expectedFunctionList = [ 
			'LJM_eReadAddress',
			'LJM_eReadName',
			'LJM_eReadAddressString',
			'LJM_eReadNameString',
			'LJM_eReadAddressAsync',
			'LJM_eReadNameAsync',
			'LJM_eReadAddressStringAsync',
			'LJM_eReadNameStringAsync' 
		];
		var expectedResultList = [
			testVal,
			testVal,
			"TEST",
			"TEST",
			testVal,
			testVal,
			"TEST",
			"TEST",
		];
		syncRun.run(testList);
		asyncRun.run(testList,
			function(res) {
				//Error, should never be called.... isn't ever used... woops....
			}, function(res) {
				//Success				
				var funcs = fakeDriver.getLastFunctionCall();
				var results = asyncRun.getResults();
				var args = fakeDriver.getArgumentsList();
				//console.log(args)
				var i;
				for(i = 0; i < testList.length; i++) {
					test.equal(funcs[i], expectedFunctionList[i]);
					test.equal(results[i], expectedResultList[i]);
				}
				//Test to make sure the address-to-type conversion worked (sync)
				test.equal(args[1][2],driver_const.LJM_FLOAT32);

				//Test to make sure the address-to-type conversion worked(async)
				test.equal(args[5][2],driver_const.LJM_FLOAT32);

				test.done();
			});		
	},

	/**
	 * This test tests the LJM_eReadNames, and LJM_eReadAddresses asynchronous 
	 * function calls of LJM.
	 * @param  {[type]} test The test object.
	 */
	testReadMany: function(test) {
		var resArray = [testVal,testVal+1];
		fakeDriver.setResultArg(resArray);
		asyncRun.config(dev,null);
		var testList = [
			'readMany([0,2])',
			'readMany(["AIN0","AIN1"])',
		];
		var expectedFunctionList = [ 
			'LJM_eReadAddressesAsync',
			'LJM_eReadNamesAsync',
		];
		var expectedResultList = [
			resArray,
			resArray,
		];
		asyncRun.run(testList,
			function(res) {
				//Error
			}, function(res) {
				//Success
				var funcs = fakeDriver.getLastFunctionCall();
				var results = asyncRun.getResults();
				var argList = fakeDriver.getArgumentsList();
				var i,j;
				for(i = 0; i < testList.length; i++) {
					for(j = 0; j < resArray.length; j++) {
						test.equal(funcs[i][j], expectedFunctionList[i][j]);
						test.equal(results[i][j], expectedResultList[i][j]);
					}
					if(expectedFunctionList[i] == 'LJM_eReadAddressesAsync') {
						test.equal(argList[i+1][1], resArray.length);
						test.equal(argList[i+1][2].length, resArray.length*4);
						test.equal(argList[i+1][3].length, resArray.length*4);
						test.equal(argList[i+1][4].length, resArray.length*8);
						test.equal(argList[i+1][5].length, 4);
					}
					else if (expectedFunctionList[i] == 'LJM_eReadNamesAsync'){
						test.equal(argList[i+1][1], resArray.length);
						//test.equal(argList[i+1][2].length, resArray.length*4); Address
						test.equal(argList[i+1][3].length, resArray.length*8);
						test.equal(argList[i+1][4].length, 4);
					}
				}
				test.done();
			});	
	},

	/**
	 * This test tests the LJM_eWriteRaw asynchronous function call of LJM.
	 * @param  {[type]} test The test object.
	 */
	testWriteRaw: function(test) {
		test.done();
	},

	/**
	 * This test tests the LJM_eWriteName, LJM_eWriteAddress, 
	 * LJM_eWriteNameString, and LJM_eWriteAddressString asynchronous function 
	 * calls of LJM.
	 * @param  {[type]} test The test object.
	 */
	testWrite: function(test) {
		test.done();
	},

	/**
	 * This test tests the LJM_eWriteNames, and LJM_eWriteAddresses asynchronous
	 * function calls of LJM.
	 * @param  {[type]} test The test object.
	 */
	testWriteMany: function(test) {
		test.done();
	},

	/**
	 * This test tests the LJM_eAddresses, and LJM_eNames asynchronous function 
	 * calls of LJM.
	 * @param  {[type]} test [description]
	 */
	testRWMany: function(test) {
		test.done();
	},

	/**
	 * This test tests the  asynchronous function call of LJM.
	 * @param  {[type]} test The test object.
	 */
	testResetConnection: function(test) {
		test.done();
	}
};




