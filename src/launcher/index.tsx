/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { Provider } from 'react-redux';
import { render, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import initialiseLauncher from './features/initialisation/initialiseLauncher';
import Root from './Root';
import store from './store';
import registerIpcHandler from './util/registerIpcHandler';

import '../../resources/css/launcher.scss';

telemetry.enableTelemetry();
const { dispatch } = store;
registerIpcHandler(dispatch);

render(
    <Provider store={store}>
        <Root />
    </Provider>
);

dispatch(initialiseLauncher());
