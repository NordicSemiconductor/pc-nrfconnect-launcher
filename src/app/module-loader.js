/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import Module from 'module';
import path from 'path';

const electronRemote = require('@electron/remote');

const hostedModules = {
    '@electron/remote': electronRemote,
};

const launcherPaths = window.module.paths;

const originalLoad = Module._load;
Module._load = function load(modulePath) {
    if (hostedModules[modulePath]) {
        return hostedModules[modulePath];
    }

    if (lazy[modulePath]) {
        const moduleToLoad = lazy[modulePath]();
        // eslint-disable-next-line prefer-rest-params
        const args = [...arguments];
        args[0] = moduleToLoad;
        args[1].paths.splice(0, 0, ...launcherPaths);
        hostedModules[modulePath] = originalLoad(...args);
        return hostedModules[modulePath];
    }

    return originalLoad(...arguments); // eslint-disable-line prefer-rest-params
};

const lazy = {
    electron: () => 'electron',
    serialport: () => 'serialport',
    react: () => requireFromResources('react.js'),
    'object-assign': () => 'object-assign',
    scheduler: () => requireFromResources('scheduler.js'),
    'redux-devtools-extension': () => 'redux-devtools-extension',
    'redux-thunk': () => 'redux-thunk',
    'react-dom': () => requireFromResources('react-dom.js'),
    'react-dom/client': () => requireFromResources('react-dom-client.js'),
    'react-redux': () => 'react-redux',
    'prop-types/checkPropTypes': () =>
        requireFromResources('check-prop-types.js'),
    'scheduler/tracing': () => requireFromResources('scheduler-tracing.js'),
};

function requireFromResources(file) {
    if (file === 'react.js') {
        console.warn(
            'This version of nRF Connect for Desktop still provides React 16 to this app. But the next version of nRF Connect for Desktop will stop that and either provide React 18 or none at all. Update your app for that!'
        );
    }

    return path.join(
        electronRemote.app.getAppPath(),
        'resources',
        'react',
        file
    );
}
