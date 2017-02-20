import adapters from './adapters';

let currentAdapter;

function getCurrentAdapter() {
    return currentAdapter;
}

function setCurrentAdapter(adapter) {
    currentAdapter = adapter;
}

function openAdapterInstance(adapter, customOptions) {
    const serialNumber = adapter.state.serialNumber;
    return adapters.getAdapterOptions(serialNumber, customOptions)
        .then(options => adapters.openAdapter(adapter, options)
            .then(() => {
                if (!options.enableBLE) {
                    // The enableBLE operation that is part of the openAdapter call in
                    // pc-ble-driver-js is unstable. For now, call enableBLE separately.
                    // This ought to be fixed in pc-ble-driver(-js) long-term.
                    return adapters.enableBLE(adapter);
                }
                return adapter;
            }));
}

function openAdapter(serialNumber, options) {
    return adapters.getAdapter(serialNumber)
        .then(adapter => {
            if (!adapter) {
                throw new Error(`Could not find adapter with serial number '${serialNumber}'`);
            }
            return openAdapterInstance(adapter, options);
        })
        .then(adapter => setCurrentAdapter(adapter));
}

export default {
    openAdapter,
    getCurrentAdapter,
};
