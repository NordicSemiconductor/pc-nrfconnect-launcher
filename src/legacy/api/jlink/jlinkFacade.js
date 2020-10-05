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

import EventEmitter from 'events';
import nrfjprogjs from 'pc-nrfjprog-js';
import registry from '../registry';

/**
 * Combines Windows registry lookup and connected serial numbers from nrfjprog
 * to uniquely identify serial numbers for SEGGER J-Link devices.
 *
 * On Windows, there are no APIs that give us the COM name <-> serial number
 * relation. We have to do a registry lookup to find J-Link IDs for COM names.
 * Unfortunately, the registry may contain multiple serial numbers for the same
 * COM name. This is because COM names may be reused over the course of time,
 * and then the registry will contain old numbers in addition to the current
 * serial number.
 *
 * When we are not able to identify the serial number only from the registry
 * alone, we filter out the serial numbers that are not in the list of connected
 * serial numbers from nrfjprog. Only doing the nrfjprog lookup if required,
 * in order to make it as fast as possible.
 */
export default class JlinkFacade extends EventEmitter {
    constructor() {
        super();

        // These may be monkey patched by unit tests.
        this.registry = registry;
        this.nrfjprogjs = nrfjprogjs;
    }

    emitWarning(message) {
        /**
         * Fired when not able to uniquely identify a serial number in registry.
         *
         * @event JlinkFacade#warn
         * @type {string}
         */
        this.emit('warn', message);
    }

    /**
     * Get a Map containing COM port name as key and serial number as value. The serial
     * numbers are retrieved from the Windows registry. Using nrfjprogjs if the
     * serial number cannot be uniquely identified from registry.
     *
     * @param {string[]} comNames The com port names to look up serial numbers for.
     * @fires JlinkFacade#warn
     * @returns {Promise} Promise that resolves with a Map instance.
     */
    getSerialNumberMap(comNames) {
        const promises = comNames.map(
            comName =>
                new Promise(resolve => {
                    this.registry
                        .findJlinkIds(comName)
                        .then(serialNumbers =>
                            resolve({ comName, serialNumbers })
                        )
                        .catch(error => {
                            // Catching and emitting here, as we don't want one bad device
                            // to block all other lookups.
                            this.emitWarning(
                                `Unable to read serial number for ${comName} ` +
                                    `from registry: ${error.message}`
                            );
                            resolve();
                        });
                })
        );
        return Promise.all(promises)
            .then(results => results.filter(result => !!result))
            .then(results => {
                const hasMultipleSnrs = results.some(
                    result => result.serialNumbers.length > 1
                );
                if (hasMultipleSnrs) {
                    return this.getConnectedSerialNumbers().then(
                        connectedSnrs => this.createMap(results, connectedSnrs)
                    );
                }
                return this.createMap(results);
            });
    }

    /**
     * Get an array of all serial numbers that are currently connected.
     *
     * @returns {Promise} Promise that resolves with an array of serial numbers (integers).
     */
    getConnectedSerialNumbers() {
        return new Promise((resolve, reject) => {
            this.nrfjprogjs.getSerialNumbers((error, serialNumbers) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(serialNumbers);
                }
            });
        });
    }

    /**
     * Create a Map instance from the results array. If multiple serial numbers exist for
     * one COM name, and connectedSerialNumbers are given, then referring to the list
     * of connected serial numbers to find which one to use.
     *
     * @param {Array<Object>} results Array of objects, with each object having a
     *     comName (string) and serialNumbers (string[]) property.
     * @param {number[]} [connectedSerialNumbers] Serial numbers that are connected.
     * @returns {Map<string,string>} Map with COM name as key and serial number as value.
     */
    createMap(results, connectedSerialNumbers) {
        const map = new Map();
        results.forEach(result => {
            const { comName, serialNumbers } = result;
            if (serialNumbers.length === 1) {
                map.set(comName, serialNumbers[0]);
            } else if (serialNumbers.length > 1 && connectedSerialNumbers) {
                const serialNumber = serialNumbers.find(
                    snr =>
                        connectedSerialNumbers.indexOf(parseInt(snr, 10)) !== -1
                );
                if (serialNumber) {
                    this.emitWarning(
                        `Found serial numbers ${serialNumbers.join(', ')} ` +
                            `for ${comName} in registry. ${serialNumber} is connected, so ` +
                            'using that.'
                    );
                    map.set(comName, serialNumber);
                } else {
                    this.emitWarning(
                        `Found serial numbers ${serialNumbers.join(', ')} ` +
                            `for ${comName} in registry, but none of these are connected. ` +
                            'Unable to identify serial number.'
                    );
                }
            } else {
                this.emitWarning(
                    `Could not find serial number for ${comName} in registry.`
                );
            }
        });
        return map;
    }
}
