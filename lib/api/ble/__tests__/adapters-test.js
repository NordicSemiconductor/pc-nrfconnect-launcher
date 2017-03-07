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

/* eslint-disable import/first */

jest.mock('pc-ble-driver-js', () => ({
    api: { AdapterFactory: {} },
}));
jest.mock('../../probe', () => ({}));

import bleDriver from 'pc-ble-driver-js';
import probe from '../../probe';
import { getAdapter, openAdapter, enableBLE, getAdapterOptions } from '../adapters';

describe('getAdapter', () => {
    it('should throw error if AdapterFactory returns error', () => {
        bleDriver.api.AdapterFactory.getInstance = () => ({
            getAdapters: callback => {
                callback(new Error('Foo'));
            },
        });
        return getAdapter('').catch(error => {
            expect(error.message).toEqual('Unable to get adapters: Foo');
        });
    });

    it('should return null if no adapters exist', () => {
        bleDriver.api.AdapterFactory.getInstance = () => ({
            getAdapters: callback => {
                callback(null, {});
            },
        });
        return getAdapter('').then(adapter => {
            expect(adapter).toEqual(null);
        });
    });

    it('should return null if no adapters exist with the given serial number', () => {
        bleDriver.api.AdapterFactory.getInstance = () => ({
            getAdapters: callback => {
                callback(null, {
                    1336: {},
                });
            },
        });
        return getAdapter('1337').then(adapter => {
            expect(adapter).toEqual(null);
        });
    });

    it('should return adapter if adapter exists with the given serial number', () => {
        const fooAdapter = { id: '1337' };
        bleDriver.api.AdapterFactory.getInstance = () => ({
            getAdapters: callback => {
                callback(null, {
                    1337: fooAdapter,
                });
            },
        });
        return getAdapter('1337').then(adapter => {
            expect(adapter).toEqual(fooAdapter);
        });
    });

    it('should return adapter if adapter exists with zero-prefixed serial number', () => {
        const fooAdapter = { id: '1337' };
        bleDriver.api.AdapterFactory.getInstance = () => ({
            getAdapters: callback => {
                callback(null, {
                    '0001337': fooAdapter,
                });
            },
        });
        return getAdapter('1337').then(adapter => {
            expect(adapter).toEqual(fooAdapter);
        });
    });
});

describe('openAdapter', () => {
    it('should throw error if adapter returns error', () => {
        const adapter = {
            open: (options, callback) => {
                callback(new Error('Foo'));
            },
        };
        return openAdapter(adapter, {}).catch(error => {
            expect(error.message).toEqual('Unable to open adapter: Foo');
        });
    });

    it('should resolve with adapter if open was successful', () => {
        const adapter = {
            open: (options, callback) => {
                callback();
            },
        };
        return openAdapter(adapter, {}).then(finalAdapter => {
            expect(finalAdapter).toBe(adapter);
        });
    });
});

describe('enableBLE', () => {
    it('should throw error if adapter returns error', () => {
        const adapter = {
            enableBLE: (options, callback) => {
                callback(new Error('Foo'));
            },
        };
        return enableBLE(adapter).catch(error => {
            expect(error.message).toEqual('Unable to enable BLE: Foo');
        });
    });

    it('should resolve with adapter if enable BLE was successful', () => {
        const adapter = {
            enableBLE: (options, callback) => {
                callback();
            },
        };
        return enableBLE(adapter).then(finalAdapter => {
            expect(finalAdapter).toBe(adapter);
        });
    });
});

describe('getAdapterOptions', () => {
    it('should throw error if baud rate is not supplied, and not able to find default baud rate', () => {
        probe.getBaudRate = () => Promise.reject(new Error('Foo'));
        return getAdapterOptions('').catch(error => {
            expect(error.message).toEqual('Foo');
        });
    });

    it('should use default baud rate if baud rate is not supplied', () => {
        probe.getBaudRate = () => Promise.resolve(1337);
        return getAdapterOptions('').then(options => {
            expect(options.baudRate).toEqual(1337);
        });
    });

    it('should use supplied baud rate instead of default baud rate', () => {
        return getAdapterOptions('', { baudRate: 1337 }).then(options => {
            expect(options.baudRate).toEqual(1337);
        });
    });

    it('should append options from default options if some options are not provided', () => {
        const options = {
            parity: 'none',
            flowControl: 'none',
            logLevel: 'debug',
            baudRate: 1337,
        };
        return getAdapterOptions('', options).then(resultOptions => {
            expect(resultOptions).toEqual({
                parity: 'none',
                flowControl: 'none',
                eventInterval: 10,
                logLevel: 'debug',
                enableBLE: false,
                baudRate: 1337,
            });
        });
    });

    it('should override default options with supplied options if provided', () => {
        const options = {
            parity: 'foo',
            flowControl: 'bar',
            baudRate: 1337,
        };
        return getAdapterOptions('', options).then(resultOptions => {
            expect(resultOptions).toEqual({
                parity: 'foo',
                flowControl: 'bar',
                eventInterval: 10,
                logLevel: 'debug',
                enableBLE: false,
                baudRate: 1337,
            });
        });
    });
});
