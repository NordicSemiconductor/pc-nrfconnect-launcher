/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import initialiseLauncherState from './features/initialisation/initialiseLauncherState';
import Root from './Root';
import store from './store';
import registerIpcHandler from './util/registerIpcHandler';

import '../../resources/css/launcher.scss';

const { dispatch } = store;
registerIpcHandler(dispatch);

const rootElement = (
    <Provider store={store}>
        <Root />
    </Provider>
);

render(rootElement, document.getElementById('webapp'), () => {
    dispatch(initialiseLauncherState());
});
