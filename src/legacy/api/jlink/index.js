/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import SerialPort from 'serialport';

import portPath from '../../portPath';
import JlinkFacade from './jlinkFacade';

const SEGGER_VENDOR_ID = '1366';

/**
 * For the given list of ports, find the SEGGER devices only and return
 * their COM names.
 *
 * @param {Array<Object>} ports Serial port objects to get COM names for.
 * @returns {Array<string>} COM names for the SEGGER devices.
 */
function getSeggerComNames(ports) {
    return ports
        .filter(port => port.vendorId === SEGGER_VENDOR_ID)
        .map(port => port.path);
}

function getPortsWithSerialNumberOnWindows(ports, onWarning) {
    return new Promise((resolve, reject) => {
        const decoratedPorts = ports.slice();
        const seggerComNames = getSeggerComNames(ports);
        const facade = new JlinkFacade();
        facade.on('warn', onWarning);
        facade
            .getSerialNumberMap(seggerComNames)
            .then(map => {
                map.forEach((serialNumber, comName) => {
                    const port = decoratedPorts.find(
                        p => portPath(p) === comName
                    );
                    port.serialNumber = serialNumber;
                });
                resolve(decoratedPorts);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Decorate the given serial port objects with `serialNumber` in cases where the
 * serialport library does not provide this for us. This is needed on Windows,
 * where we need to query the registry to find the serial number.
 *
 * The registry lookup routine will produce a warning message if it is not
 * able to identify the serial number for one or more ports. In that case, the
 * optional `onWarning` function will be invoked with the warning message.
 *
 * @param {Array<Object>} ports Serial port objects from the serialport library.
 * @param {function(string)} [onWarning] Function that is invoked in case of warning.
 * @returns {Promise} Promise that resolves with decorated serial port objects.
 */
export function decorateWithSerialNumber(ports, onWarning = () => {}) {
    if (process.platform === 'win32') {
        return getPortsWithSerialNumberOnWindows(ports, onWarning);
    }
    return Promise.resolve(ports);
}

/**
 * Try to open and close the given serial port to see if it is available. This
 * is needed to identify if a SEGGER J-Link device is in a bad state.
 *
 * @param {string} path The system path of the serial port you want to check.
 * @returns {Promise} Promise that resolves if available, and rejects if not.
 */
export function isPortAvailable(path) {
    return new Promise((resolve, reject) => {
        const serialPort = new SerialPort(path, { autoOpen: false });
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
}
