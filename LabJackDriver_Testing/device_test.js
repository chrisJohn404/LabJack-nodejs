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
var fakeDriver = require('./TestObjects/test_driver_wrapper');

var driver_wrapper = rewire('../LabJackDriver/driver_wrapper');

var deviceManager = rewire('../LabJackDriver/device');
deviceManager.__set__('driverLib',fakeDriver);

var driver_const = require('../LabJackDriver/driver_const');


module.exports = {
	setUp: function(callback) {
		//this.mockDevice = new MockDevice();
		callback();
	},
	tearDown: function (callback) {
        // clean up
        fakeDriver.clearLastFunctionCall();
        fakeDriver.setExpectedResult(0);
        callback();
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
	 * @return {[type]}
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
					test.done();
				},
				function(res) {
					console.log("CloseSuccess, ERROR!! NOT SUPPOSED TO HAPPEN");
				});
		},
		function(res) {
			console.log("OpenSuccess, ERROR!!!!!!! NOT SUPPOSED TO HAPPEN");
		});
	}
};



