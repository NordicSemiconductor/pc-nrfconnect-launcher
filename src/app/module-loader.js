/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import Module from 'module';
import { join } from 'path';

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

/* eslint-disable dot-notation */
// Disable dot-notation in this file, to keep the syntax below more consistent
hostedModules['serialport'] = require('serialport');

hostedModules['electron'] = require('electron');
hostedModules['@electron/remote'] = require('@electron/remote');
hostedModules[
    '@nordicsemiconductor/nrf-device-lib-js'
] = require('@nordicsemiconductor/nrf-device-lib-js');

hostedModules['prop-types/checkPropTypes'] = requireFromResources('check-prop-types.js')
hostedModules['react'] = requireFromResources('react.js');
hostedModules['scheduler'] = requireFromResources('scheduler.js');
hostedModules['scheduler/tracing'] = requireFromResources(
    'scheduler-tracing.js'
);
hostedModules['redux-devtools-extension'] = require('redux-devtools-extension');
hostedModules['redux-thunk'] = require('redux-thunk');
hostedModules['react-dom'] = requireFromResources('react-dom.js');
hostedModules['react-dom/client'] = requireFromResources('react-dom-client.js');
// hostedModules['react-redux'] = require('react-redux');

function requireFromResources(file) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(join(
        hostedModules['@electron/remote'].app.getAppPath(),
        'resources',
        'react',
        file
    ));
}
