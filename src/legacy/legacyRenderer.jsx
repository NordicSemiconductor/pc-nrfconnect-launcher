/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { render } from 'react-dom';

import { showMaybeLegacyAppDialog } from './app/actions/legacyAppDialogActions';
import RootContainer from './app/containers/RootContainer';
import rootReducer from './app/reducers';
import { invokeAppFn, setApp } from './decoration';
import configureStore from './store/configureStore';

export default (app, container, onLoaded) => {
    setApp(app);

    const store = configureStore(rootReducer, app);
    invokeAppFn('onInit', store.dispatch, store.getState);
    render(<RootContainer store={store} />, container, () => {
        onLoaded();
        store.dispatch(showMaybeLegacyAppDialog());
        invokeAppFn('onReady', store.dispatch, store.getState);
    });
};
