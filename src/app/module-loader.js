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

hostedModules['serialport'] = require('serialport');
hostedModules['electron'] = require('electron');
hostedModules['@electron/remote'] = require('@electron/remote');
hostedModules[
    '@nordicsemiconductor/nrf-device-lib-js'
] = require('@nordicsemiconductor/nrf-device-lib-js');
