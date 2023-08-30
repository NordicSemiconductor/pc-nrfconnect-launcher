/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import Module from 'module';
import { join } from 'path';
const electronRemote = require('@electron/remote');

const hostedModules = {
    '@electron/remote': electronRemote,
    '@nordicsemiconductor/nrf-device-lib-js':  require('@nordicsemiconductor/nrf-device-lib-js'),
};

const originalLoad = Module._load;
Module._load = function load(modulePath) {
    if (hostedModules[modulePath]) {
        return hostedModules[modulePath];
    }

    if (lazy[modulePath]) {
        const moduleToLoad = lazy[modulePath]();
        const args = [...arguments];
        args[0] = moduleToLoad;
        hostedModules[modulePath] = originalLoad(...args);
        return hostedModules[modulePath];
    }

    return originalLoad(...arguments); // eslint-disable-line prefer-rest-params
};

const lazy = {
    'electron': () => 'electron',
    'serialport': () => 'serialport',
    'react': () => requireFromResources('react.js'),
    'object-assign': () => 'object-assign',
    'scheduler': () => requireFromResources('scheduler.js'),
    'redux-devtools-extension': () => 'redux-devtools-extension',
    'redux-thunk': () => 'redux-thunk',
    'react-dom': () => requireFromResources('react-dom.js'),
    'react-dom/client': () => requireFromResources('react-dom-client.js'),
    'react-redux': () => 'react-redux',
    '@nordicsemiconductor/nrf-device-lib-js':  () => '@nordicsemiconductor/nrf-device-lib-js',
    'prop-types/checkPropTypes': () =>  requireFromResources(
        'check-prop-types.js'
    ),
    'scheduler/tracing': () => requireFromResources(
        'scheduler-tracing.js'
    )
}

function requireFromResources(file) {
    if (file === 'react.js') {
        console.warn(
            'This version of nRF Connect for Desktop still provides React 16 to this app. But the next version of nRF Connect for Desktop will stop that and either provide React 18 or none at all. Update your app for that!'
        );
    }

    return join(
        electronRemote.app.getAppPath(),
        'resources',
        'react',
        file
    );
}
