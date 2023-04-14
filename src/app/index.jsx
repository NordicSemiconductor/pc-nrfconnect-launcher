/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';
import './module-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { dialog } from '@electron/remote';
import nodeWatch from 'node-watch';

import initApp from './initApp';

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');

const render = App => {
    ReactDOM.render(<App />, document.getElementById('webapp'));
};

const mountApp = () => {
    try {
        const app = initApp(appPath);
        render(app);
    } catch (error) {
        showLoadingError(error);
    }
};

const showLoadingError = error => {
    console.error(error);
    dialog.showMessageBox({
        type: 'error',
        message: error.message,
    });
};

mountApp();

if (process.env.NODE_ENV === 'development') {
    nodeWatch(`${appPath}/dist/bundle.js`, evt => {
        console.log('Hot reloading app due to bundle.js changes', evt);
        mountApp();
    });

    nodeWatch(`${appPath}/dist/bundle.css`, () => {
        console.log('Hot reloading app due to bundle.css changes');
        const cssNode = [...document.head.children].find(node =>
            node.href?.includes('bundle.css')
        );
        if (cssNode) {
            cssNode.href = `bundle.css?${Date.now()}`;
        }
    });
}
