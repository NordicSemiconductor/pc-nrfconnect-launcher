/* Copyright (c) 2010 - 2017, Nordic Semiconductor ASA
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

import { api as bleApi } from 'pc-ble-driver-js';
import probe from '../probe';

const DEFAULT_ADAPTER_OPTIONS = {
    parity: 'none',
    flowControl: 'none',
    eventInterval: 10,
    logLevel: 'debug',
    enableBLE: false,
};

function getAdapters() {
    return new Promise((resolve, reject) => {
        const adapterFactory = bleApi.AdapterFactory.getInstance();
        adapterFactory.getAdapters((err, adapters) => {
            if (err) {
                reject(new Error(`Unable to get adapters: ${err.message}`));
            } else {
                resolve(adapters);
            }
        });
    });
}

function getAdapterWithSerialNumber(adapters, serialNumber) {
    const adapterSerial = Object.keys(adapters).find(serial => {
        const trimmedSerial = serial.replace(/\b0+/g, '');
        return trimmedSerial === serialNumber;
    });
    if (adapterSerial) {
        return adapters[adapterSerial];
    }
    return null;
}

function getAdapter(serialNumber) {
    return getAdapters()
        .then(adapters => getAdapterWithSerialNumber(adapters, serialNumber));
}

function openAdapter(adapter, options) {
    return new Promise((resolve, reject) => {
        adapter.open(options, err => {
            if (err) {
                reject(new Error(`Unable to open adapter: ${err.message}`));
            } else {
                resolve(adapter);
            }
        });
    });
}

function enableBLE(adapter, options) {
    return new Promise((resolve, reject) => {
        adapter.enableBLE(options, err => {
            if (err) {
                reject(new Error(`Unable to enable BLE: ${err.message}`));
            } else {
                resolve(adapter);
            }
        });
    });
}

function getAdapterOptions(serialNumber, options) {
    const result = Object.assign({}, DEFAULT_ADAPTER_OPTIONS, options);
    if (!result.baudRate) {
        return probe.getBaudRate(serialNumber)
            .then(baudRate => ({
                ...result,
                baudRate,
            }));
    }
    return Promise.resolve(result);
}

export default {
    getAdapter,
    openAdapter,
    enableBLE,
    getAdapterOptions,
};
