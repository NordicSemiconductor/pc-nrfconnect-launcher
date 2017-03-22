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

import { DebugProbe } from 'pc-nrfjprog-js';
import os from 'os';

const ERROR_MESSAGE = {
    CouldNotLoadDLL: 'Could not load nrfjprog DLL, firmware detection and ' +
        'programming will not be available',
    CouldNotConnectToDevice: 'Could not connect to debug probe, firmware ' +
        'detection and programming will not be available',
    WrongMagicNumber: 'Could not connect to debug probe, firmware detection ' +
        'and programming will not be available',
};

function getBaudRateFromVersionInfo(versionInfo) {
    if (!versionInfo || !versionInfo.baudRate) {
        return os.type() === 'Darwin' ? 115200 : 1000000;
    }
    return versionInfo.baudRate;
}

function parseSerialNumber(serialNumber) {
    const parsedSerial = parseInt(serialNumber, 10);
    if (!parsedSerial) {
        throw new Error(`Invalid serial number: ${serialNumber}`);
    }
    return parsedSerial;
}

function getVersionInfo(serialNumber) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();
        probe.getVersion(parseSerialNumber(serialNumber), (err, versionInfo) => {
            if (err) {
                const errorMessage = ERROR_MESSAGE[err.errcode];
                reject(new Error(errorMessage || `Unknown error when getting version info: ${err.message}`));
            } else {
                resolve(versionInfo);
            }
        });
    });
}

function getBaudRate(serialNumber) {
    return getVersionInfo(serialNumber)
        .then(versionInfo => getBaudRateFromVersionInfo(versionInfo));
}

/**
 * Program the given serial number using the provided firmware options. The options
 * parameter is an object with the following properties:
 * - 0: {string} firmware hex file path or hex content (if filecontent=true) for nrf51.
 * - 1: {string} firmware hex file path or hex content (if filecontent=true) for nrf52.
 * - filecontent: {boolean} true if 0 and/or 1 are hex strings, false if file paths.
 *
 * @param {string|int} serialNumber the serial number to use
 * @param {Object} options firmware options as described above
 * @returns {Promise} promise that resolves with empty value if successful.
 */
function program(serialNumber, options) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();
        probe.program(parseSerialNumber(serialNumber), options, err => {
            if (err) {
                reject(new Error(`Unable to program. Error: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Read 'length' bytes from the provided address, using the given serial number.
 *
 * @param {string|int} serialNumber the serial number to use.
 * @param {int} address the address to read from.
 * @param {int} length the number of bytes to read.
 * @returns {Promise} promise that resolves with an integer array if successful.
 */
function readAddress(serialNumber, address, length) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();
        probe.readAddress(parseSerialNumber(serialNumber), address, length, (err, data) => {
            if (err) {
                reject(new Error(`Unable to read address. Error: ${err.message}`));
            } else {
                resolve(data);
            }
        });
    });
}

export default {
    getVersionInfo,
    getBaudRate,
    program,
    readAddress,
};
