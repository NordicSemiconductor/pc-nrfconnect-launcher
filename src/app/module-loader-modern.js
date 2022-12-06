/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle,dot-notation */
import Module from 'module';

const hostedModules = {};

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

hostedModules['serialport'] = SerialPort;
hostedModules['electron'] = require('electron');
hostedModules['@electron/remote'] = require('@electron/remote');
hostedModules[
    '@nordicsemiconductor/nrf-device-lib-js'
] = require('@nordicsemiconductor/nrf-device-lib-js');
