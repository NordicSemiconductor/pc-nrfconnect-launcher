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
