/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import SerialPort from 'serialport';
import libusb from 'usb';
import { isPortAvailable, decorateWithSerialNumber } from '../../../api/jlink';
import { logger } from '../../../api/logging';

export const DEVICES_LOAD = 'DEVICES_LOAD';
export const DEVICES_LOAD_SUCCESS = 'DEVICES_LOAD_SUCCESS';
export const DEVICES_LOAD_ERROR = 'DEVICES_LOAD_ERROR';
export const DEVICE_SELECTOR_TOGGLE_EXPANDED = 'DEVICE_SELECTOR_TOGGLE_EXPANDED';
export const DEVICE_SELECTED = 'DEVICE_SELECTED';
export const DEVICE_DESELECTED = 'DEVICE_DESELECTED';

function loadDevicesAction() {
    return {
        type: DEVICES_LOAD,
    };
}

function loadDevicesSuccessAction(usbDevices, serialPorts) {
    return {
        type: DEVICES_LOAD_SUCCESS,
        usbDevices,
        serialPorts,
    };
}

function loadDevicesErrorAction(message) {
    return {
        type: DEVICES_LOAD_ERROR,
        message,
    };
}

function selectorToggleExpandedAction() {
    return {
        type: DEVICE_SELECTOR_TOGGLE_EXPANDED,
    };
}

function deviceSelectedAction(device) {
    return {
        type: DEVICE_SELECTED,
        device,
    };
}

/**
 * Get an array of available serial ports. Refer to the serialport library
 * to see which properties are included on the serial port objects.
 *
 * @returns {Promise} Promise that resolves with an array of serial ports.
 */
function getSerialPorts() {
    return new Promise((resolve, reject) => {
        SerialPort.list((listPortsError, ports) => {
            if (listPortsError) {
                reject(listPortsError);
            } else {
                decorateWithSerialNumber(ports)
                    .then(finalPorts => resolve(finalPorts))
                    .catch(decorateError => reject(decorateError));
            }
        });
    });
}

/**
 * Perform a control transfer to get a string descriptor from the given
 * usb device. Basically a promisification of `getStringDescriptor` from
 * the node-usb library.
 *
 * @param {Object} usbDevice The usb device to get the descriptor for.
 * @param {number} descriptorIndex The index to get.
 * @returns {Promise} Promise that resolves with string descriptor.
 */
function getUsbDeviceStringDescriptor(usbDevice, descriptorIndex) {
    return new Promise((resolve, reject) => {
        usbDevice.getStringDescriptor(descriptorIndex, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Perform control transfers to get multiple string descriptors from the
 * given usb device. Reading the descriptors in sequence, as parallelizing
 * this will produce random libusb errors.
 *
 * @param {Object} usbDevice The usb device to get the descriptors for.
 * @param {Array<number>} descriptorIndexes The indexes to get.
 * @returns {Promise} Promise that resolves with array of string descriptors.
 */
function getUsbDeviceStringDescriptors(usbDevice, descriptorIndexes) {
    return descriptorIndexes.reduce((prev, index) => (
        prev.then(descriptorValues => (
            getUsbDeviceStringDescriptor(usbDevice, index)
                .then(descriptorValue => [...descriptorValues, descriptorValue])
        ))
    ), Promise.resolve([]));
}

/**
 * Get information about the given usb device. Opens the device, and
 * reads string descriptors to get extra information.
 *
 * Object shape:
 * {
 *   busNumber: <number>,
 *   deviceAddress: <number>,
 *   productId: <number>,
 *   vendorId: <number>,
 *   serialNumber: <string> (optional),
 *   manufacturer: <string> (optional),
 *   product: <string> (optional),
 * }
 *
 * @param {Object} usbDevice The usb device to get information for.
 * @returns {Promise} Promise that resolves with usb device info object.
 */
function getUsbDeviceInfo(usbDevice) {
    return new Promise(resolve => {
        const deviceInfo = {
            busNumber: usbDevice.busNumber,
            deviceAddress: usbDevice.deviceAddress,
            vendorId: usbDevice.deviceDescriptor.idVendor,
            productId: usbDevice.deviceDescriptor.idProduct,
        };
        try {
            usbDevice.open();
            getUsbDeviceStringDescriptors(usbDevice, [
                usbDevice.deviceDescriptor.iSerialNumber,
                usbDevice.deviceDescriptor.iManufacturer,
                usbDevice.deviceDescriptor.iProduct,
            ]).then(descriptorValues => {
                usbDevice.close();
                deviceInfo.serialNumber = descriptorValues[0];
                deviceInfo.manufacturer = descriptorValues[1];
                deviceInfo.product = descriptorValues[2];
                resolve(deviceInfo);
            }).catch(error => {
                logger.debug('Error while reading from libusb busNumber ' +
                    `${usbDevice.busNumber}, deviceAddress ${usbDevice.deviceAddress}: ` +
                    `${error.message}`);
                resolve(deviceInfo);
            });
        } catch (error) {
            // This will happen quite frequently, because the current
            // user will most likely not have permission to open many of
            // the connected usb devices.
            resolve(deviceInfo);
        }
    });
}

/**
 * Get an array of available usb device info objects. See
 * `getUsbDeviceInfo` for the list of properties that the objects
 * may have.
 *
 * @returns {Promise} Promise that resolves with usb device info objects.
 */
function getUsbDevices() {
    return new Promise((resolve, reject) => {
        try {
            const usbDevices = libusb.getDeviceList();
            const promises = usbDevices.map(usbDevice => getUsbDeviceInfo(usbDevice));
            resolve(Promise.all(promises));
        } catch (error) {
            reject(new Error(`Unable to get USB devices: ${error.message}`));
        }
    });
}

/**
 * Load devices and dispatch 'DEVICES_LOAD_SUCCESS' when devices
 * have been loaded, or 'DEVICES_LOAD_ERROR' if the loading failed.
 *
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function loadDevices() {
    return dispatch => {
        dispatch(loadDevicesAction());
        Promise.all([
            getUsbDevices(),
            getSerialPorts(),
        ]).then(([usbDevices, serialPorts]) => {
            dispatch(loadDevicesSuccessAction(usbDevices, serialPorts));
        })
        .catch(error => (
            dispatch(loadDevicesErrorAction(`Unable to load devices: ${error.message}`))
        ));
    };
}

/**
 * Toggle the expanded state of the device selector. If the selector
 * is transitioning into expanded state, then the list of available
 * devices are queried in order to populate the device list.
 *
 * @returns {function(*, *)} Function that can be passed to redux dispatch.
 */
export function toggleSelectorExpanded() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.core.device.isSelectorExpanded) {
            dispatch(loadDevices());
        }
        dispatch(selectorToggleExpandedAction());
    };
}

/**
 * Select the given device by dispatching 'DEVICE_SELECTED'.
 *
 * If the selected device is a serial port, then we verify that the device
 * can be opened before dispatching 'DEVICE_SELECTED'. This is to work around
 * an issue with SEGGER J-Link devices, which will hang if we attempt to
 * connect to them when the device is not available.
 *
 * @param {Object} device The selected device.
 * @param {boolean} verifySerialPortAvailable If true, and the device has a
 *      comName, then try to open/close the serial port before dispatching
 *      'DEVICE_SELECTED'.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function selectDevice(device, verifySerialPortAvailable = true) {
    return dispatch => {
        if (verifySerialPortAvailable && device.comName) {
            isPortAvailable(device.comName)
                .then(() => dispatch(deviceSelectedAction(device)))
                .catch(error => {
                    logger.error('Unable to open the port. Please power cycle the device ' +
                        'and try again.');
                    logger.debug(error.message);
                });
        } else {
            dispatch(deviceSelectedAction(device));
        }
    };
}

/**
 * Deselect the currently selected device.
 *
 * @returns {{type: string}} Action object that can be passed to redux dispatch.
 */
export function deselectDevice() {
    return {
        type: DEVICE_DESELECTED,
    };
}
