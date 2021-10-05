/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'core-js/es7';
import 'regenerator-runtime/runtime';
import './module-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import legacyRenderer from '../legacy/legacyRenderer';
import initApp from './initApp';

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');

const removeLoaderElement = () => {
    const loader = document.getElementById('app-loader');
    const webapp = document.getElementById('webapp');
    if (loader) {
        webapp.classList.add('loaded');
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 500);
    }
};

const isLegacy = app => typeof app === 'object';

const renderer = (App, container, onLoaded) => {
    // The next line is only needed as long as we still need to support legacy apps.
    // Later, when we want to drop support for legacy apps, change "legacy.css" in
    // app.html to "shared.css" and remove the next line
    const stylesheet = document.getElementById('stylesheet');
    stylesheet.href = '';
    const interval = setInterval(() => {
        if (stylesheet.sheet && stylesheet.sheet.cssRules.length > 0) {
            clearInterval(interval);
            onLoaded();
        }
    }, 1);
    stylesheet.href = '../dist/shared.css';

    ReactDOM.render(<App />, container);
};

const render = app => {
    const doRender = isLegacy(app) ? legacyRenderer : renderer;

    doRender(app, document.getElementById('webapp'), removeLoaderElement);
};

const showLoadingError = error => {
    console.error(error);
    remote.dialog.showMessageBox({
        type: 'error',
        message: error.message,
    });
};

initApp(appPath).then(render).catch(showLoadingError);
