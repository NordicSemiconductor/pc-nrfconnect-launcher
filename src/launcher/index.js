/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import * as AppsActions from './actions/appsActions';
import * as AutoUpdateActions from './actions/autoUpdateActions';
import * as UsageDataActions from './actions/usageDataActions';
import RootContainer from './containers/RootContainer';
import rootReducer from './reducers';
import registerIpcHandler from './util/registerIpcHandler';

import '../../resources/css/launcher.scss';

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

registerIpcHandler(store.dispatch);

const rootElement = React.createElement(RootContainer, { store });

render(rootElement, document.getElementById('webapp'), async () => {
    await store.dispatch(UsageDataActions.checkUsageDataSetting());
    store.dispatch(await AppsActions.setAppManagementFilter());
    await store.dispatch(AppsActions.loadLocalApps());
    await store.dispatch(AppsActions.loadDownloadableApps());
    store.dispatch(await AppsActions.setAppManagementShow());
    store.dispatch(await AppsActions.setAppManagementSource());
    await store.dispatch(AutoUpdateActions.downloadLatestAppInfoAtStartup());
    await store.dispatch(AutoUpdateActions.checkForCoreUpdatesAtStartup);
    UsageDataActions.sendEnvInfo();
});
