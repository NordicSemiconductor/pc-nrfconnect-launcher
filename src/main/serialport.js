/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const SerialPort = require('serialport');

/**
 * Try to open and close the given serial port to see if it is available. This
 * is needed to identify if a SEGGER J-Link device is in a bad state. If
 * pc-nrfjprog-js tries to interact with a device in bad state, it will hang
 * indefinitely.
 *
 * @param {object} device Device object, ref. nrf-device-lister.
 * @param {object} options Serialport options.
 * @returns {Promise} Promise that resolves if available, and rejects if not.
 */
const verifySerialPortAvailable = (device, options) => {
    if (!device.serialport) {
        return Promise.reject(
            new Error(
                'No serial port available for device with ' +
                    `serial number ${device.serialNumber}`
            )
        );
    }
    return new Promise((resolve, reject) => {
        if (!device.serialport?.comName) return reject();
        const serialPort = new SerialPort(device.serialport?.comName, options);
        serialPort.open(openErr => {
            if (openErr) {
                reject(openErr);
            } else {
                serialPort.close(closeErr => {
                    if (closeErr) {
                        reject(closeErr);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

module.exports = {
    verifySerialPortAvailable,
};
