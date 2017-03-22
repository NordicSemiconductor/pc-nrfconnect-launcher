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

import path from 'path';
import probe from '../probe';
import { getAppDir } from '../../util/apps';

function getPathRelativeToApp(firmwarePath) {
    if (firmwarePath) {
        return path.join(getAppDir(), firmwarePath);
    }
    return null;
}

/**
 * Programs the given serial number by using the hex files provided in options.
 * The devkit family of the given serial number is automatically detected. Hex
 * file for at least one family has to be provided in options.
 *
 * Available options:
 * - {string} nrf51: Path to firmware hex file for nRF51.
 * - {string} nrf52: Path to firmware hex file for nRF52.
 * - {boolean} isRelativeToApp: Whether or not paths are relative to the
 *             app directory. Default: true.
 *
 * @param {string} serialNumber The serial number that should be programmed.
 * @param {Object} options Options for programming.
 * @returns {Promise} Promise that resolves if ok, rejects if error.
 */
function programWithHexFile(serialNumber, options) {
    let nrf51Path = options.nrf51;
    let nrf52Path = options.nrf52;
    if (options.isRelativeToApp !== false) {
        nrf51Path = getPathRelativeToApp(options.nrf51);
        nrf52Path = getPathRelativeToApp(options.nrf52);
    }
    return probe.program(serialNumber, {
        0: nrf51Path || '',
        1: nrf52Path || '',
        filecontent: false,
    });
}

/**
 * Programs the given serial number by using hex strings provided in options.
 * The devkit family of the given serial number is automatically detected. Hex
 * content for at least one family has to be provided in options.
 *
 * Available options:
 * - {string} nrf51: Firmware hex content for nRF51.
 * - {string} nrf52: Firmware hex content for nRF52.
 *
 * @param {string} serialNumber The serial number that should be programmed.
 * @param {Object} options Options for programming.
 * @returns {Promise} Promise that resolves if ok, rejects if error.
 */
function programWithHexString(serialNumber, options) {
    return probe.program(serialNumber, {
        0: options.nrf51 || '',
        1: options.nrf52 || '',
        filecontent: true,
    });
}

export default {
    programWithHexFile,
    programWithHexString,
    getVersionInfo: probe.getVersionInfo,
    readAddress: probe.readAddress,
};
