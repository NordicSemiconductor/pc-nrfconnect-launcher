/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import Module from 'module';

const hostedModules = {};

/*
 * The loaded app may import react and react-redux. We must make sure that the
 * app uses the same instances of react and react-redux as we have in core.
 * Cannot have multiple copies of these loaded at the same time.
 */
const originalLoad = Module._load;
Module._load = function load(modulePath) {
    if (hostedModules[modulePath]) {
        return hostedModules[modulePath];
    }

    return originalLoad.apply(this, arguments); // eslint-disable-line prefer-rest-params
};

const SerialPort = require('serialport');

let hasShownDeprecatedPropertyWarning = false;
const mayShowWarningAboutDeprecatedProperty = () => {
    if (!hasShownDeprecatedPropertyWarning) {
        console.warn(
            'Using the property "comName" has been deprecated. You should now use "path". The property will be removed in the next major release.'
        );
    }
    hasShownDeprecatedPropertyWarning = true;
};
const ducktapeComName = port => ({
    ...port,
    get comName() {
        mayShowWarningAboutDeprecatedProperty();
        return port.path;
    },
});

const originalSerialPortList = SerialPort.list;
SerialPort.list = () =>
    originalSerialPortList().then(ports => ports.map(ducktapeComName));

/* eslint-disable dot-notation */
// Disable dot-notation in this file, to keep the syntax below more consistent
hostedModules['serialport'] = SerialPort;

hostedModules['electron'] = require('electron');
hostedModules['@electron/remote'] = require('@electron/remote');
hostedModules[
    '@nordicsemiconductor/nrf-device-lib-js'
] = require('@nordicsemiconductor/nrf-device-lib-js');
hostedModules['pc-nrfconnect-shared'] = require('pc-nrfconnect-shared');
hostedModules['react-dom'] = require('react-dom');
hostedModules['react-redux'] = require('react-redux');
hostedModules['react'] = require('react');
hostedModules['redux-devtools-extension'] = require('redux-devtools-extension');
hostedModules['redux-thunk'] = require('redux-thunk');

const bleDriverJs = require('pc-ble-driver-js');

const bleDriver = bleDriverJs.api ? bleDriverJs.api : bleDriverJs;
hostedModules['pc-ble-driver-js'] = bleDriver;
