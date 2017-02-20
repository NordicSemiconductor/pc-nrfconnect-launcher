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
