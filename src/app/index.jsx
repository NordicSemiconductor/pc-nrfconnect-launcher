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

import initApp from './initApp';

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');

const render = App => {
    ReactDOM.render(<App />, document.getElementById('webapp'));
};

const showLoadingError = error => {
    console.error(error);
    dialog.showMessageBox({
        type: 'error',
        message: error.message,
    });
};

initApp(appPath).then(render).catch(showLoadingError);
