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
import JlinkFacade from './jlinkFacade';
import portPath from '../../portPath';

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
